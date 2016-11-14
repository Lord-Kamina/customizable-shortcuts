/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const keys = require("../core/key");
const CustomXUL = require("../core/custom");

const { Windows } = require("../util/windows");
const { Overlays } = require("../core/overlay");

var _ = require("sdk/l10n").get;
const extensionPrefs = require("sdk/simple-prefs");

let { GROUPS, LABELS } = require("../util/functions");

function findKeyLabel(key) {
	const { Windows } = require("../util/windows");
	let label = key.getLabel();
	
	if (label) {
		return label;
	}
    
    let id = key.id;
    if (id in LABELS) {
    return LABELS[id];
    }

        // try to find a menuitem
        let menuitem = Windows.querySelector(`menuitem[key="${id}"][label]`);
return menuitem ? menuitem.getAttribute("label") : id;
    }

let TreeView = exports.TreeView = function (term) {
	function filter(key) {
		return findKeyLabel(key).toLowerCase().includes(term.toLowerCase()) ||
		key.shortcut.toString().toLowerCase().includes(term.toLowerCase());
	}
	this._buildGroups(term ? keys.filter(filter) : keys.all());
	this._buildRows();
	};
	
TreeView.prototype = {
    _buildGroups: function(map) {
        this.groups = [];

        for (let [gname, gkeys] of keys.group(map, GROUPS, "Other")) {
           	let lname = String.concat(gname,"_group");
			let group = {type: "group", name: _(lname), parentIdx: -1, open: true, keys: gkeys};
            this.groups.push(group);
        }
    },

    _buildRows: function() {
        this.rows = [];

        for (let group of this.groups) {
            let parentIdx = this.rows.push(group) - 1;

            if (group.open) {
				for (let key of group.keys) {
                    this.rows.push({type: "key", key: key, parentIdx: parentIdx});
                }
            }
        }
    },

	get rowCount() { return this.rows.length },

    isContainer: function(idx) {
        return ("group" == this.rows[idx].type);
    },

    isEditable: function(idx, column) {
        return column.index && !this.isContainer(idx);
    },

    isContainerOpen: function(idx) {
        return this.rows[idx].open;
    },

    getLevel: function(idx) {
        return +!this.isContainer(idx);
    },

    getParentIndex: function(idx) {
        return this.rows[idx].parentIdx;
    },

    toggleOpenState: function(idx) {
        let row = this.rows[idx];

        let numRows = -row.keys.length;
        if (row.open = !row.open) { numRows *= -1; }

        this._buildRows();
        this.treebox.rowCountChanged(idx + 1, numRows);
        this.treebox.invalidateRow(idx);
    },

    hasNextSibling: function(idx, after) {
        let level = this.getLevel(idx);
        for (let t = after + 1; t < this.rowCount; t++) {
            let nextLevel = this.getLevel(t);
            if (nextLevel == level) { return true; }
            if (nextLevel < level) { return false; }
        }
    },

    getCellText: function(idx, column) {
        let row = this.rows[idx];
        if (this.isContainer(idx)) { return (column.index ? "" : row.name); }

        let key = row.key;
        if (!column.index) { return findKeyLabel(key); }

        let overlay = Overlays.findByKey(key);
        return (overlay ? overlay.shortcut : key.shortcut).toString();
    },

    getCellValue: function(idx, column) {
        if (!this.isContainer(idx)) { return this.rows[idx].key.toString(); }
    },

    getCellProperties: function(idx, column) {
        if (this.isContainer(idx)) { return; }

        if (!column.index) { return; }

        let props = [];
        let key = this.rows[idx].key;
        if (Overlays.findByKey(key)) {
            props.push("custom");
            let toStringCache = Overlays.findByKey(key).shortcut.toString();

            if (Overlays.findByConflictingShortcut(toStringCache)) {
                let groupColor = Overlays.getConflictingShortcutColor(toStringCache);
                props.push("maketext" + groupColor);
            }
        }
        if ((Overlays.findByCustomShortcut(key.shortcut)) && (!Overlays.findByOverriddenShortcut(key.shortcut)) && (!Overlays.findByDisabledKey(key))) // Display as overridden only if using default shortcut and not disabled.
        props.push("overridden");

        if (Overlays.findByDisabledKey(key)) { props.push("disabled"); }

        return props.join(" ");
    },

    setTree: function(treebox) {
        this.treebox = treebox;
    },

    isContainerEmpty: function() { return false },
    setCellText: function() { },
    isSeparator: function() { return false },
    isSorted: function() { return false },
    getImageSrc: function() {},
    getRowProperties: function() {},
    getColumnProperties: function() {}
};

let customXULTreeView = exports.customXULTreeView = function (term, find = false, tree = null, filtered = false, newXul = false) {

	function findNewRow(row) {
		return row.key == this;
	}

	function filter(key) {
		return key.getKey().toLowerCase().includes(term.toLowerCase()) || key.getLabel().toLowerCase().includes(term.toLowerCase()) || 
		key.getCommand().toLowerCase().includes(term.toLowerCase())
	}
	
	if (!find) { this._buildRows(term ? CustomXUL.filter(filter) : CustomXUL.allCustomKeys()); }
	
	else {
	this._buildRows(!!filtered ? CustomXUL.filter(filter) : CustomXUL.allCustomKeys());
	let toSelect = this.rows.find(findNewRow,term);
	toSelect = this.rows.indexOf(toSelect);
	Windows.getMostRecentWindow().setTimeout(function () { 
	tree.view.selection.adjustSelection((toSelect -1),1);
	tree.view.selection.select(toSelect);
	if (!!newXul) { tree.startEditing(tree.view.selection.currentIndex,tree.columns.getNamedColumn("KeybinderCustomXUL_NameCol")); }
	},0);
	}
};
	
customXULTreeView.prototype = {
    _buildRows: function(map) {
        this.rows = []; 
		let sortedKeys = new Map([...map.entries()].sort((a,b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0));
	    for (let [mapKey, mapValue] of sortedKeys.entries()) {
	    this.rows.push({type:"customXULKey", key:mapValue.key, label:mapValue.label, command:mapValue.command});
	    }
    },

	get rowCount() { return this.rows.length },

    isContainer: function(idx) {
        return ("group" == this.rows[idx].type);
    },
    
    performActionOnRow: function(action, idx) {
    if ("select" == action) { this.treebox.view.selection.select(idx) }
    },
    

    isEditable: function(idx, column) {
        return column.index && !this.isContainer(idx);
    },
    
    isSelectable: function(idx, column) {
        return column.index && !this.isContainer(idx);
    },

    isContainerOpen: function(idx) {
        return this.rows[idx].open;
    },

    getLevel: function(idx) {
        return +!this.isContainer(idx);
    },

    getParentIndex: function(idx) {
        return this.rows[idx].parentIdx;
    },

    toggleOpenState: function(idx) {
		let row = this.rows[idx];

		let numRows = -row.keys.length;
		if (row.open = !row.open) { numRows *= -1; }

		this._buildRows();
		this.treebox.rowCountChanged(idx + 1, numRows);
		this.treebox.invalidateRow(idx);
    },

    hasNextSibling: function(idx, after) {},

    getCellText: function(idx, column) {
        let row = this.rows[idx];
        if (!row.key || !CustomXUL.find(row.key)) { return }
		if ("KeybinderCustomXUL_NameCol" == column.id) { return CustomXUL.allCustomKeys().get(row.key).key }
		if ("KeybinderCustomXUL_LabelCol" == column.id) { return CustomXUL.allCustomKeys().get(row.key).label }
		if ("KeybinderCustomXUL_ActionCol" == column.id) { return CustomXUL.allCustomKeys().get(row.key).command }
    },

    getCellValue: function(idx, column) {
        if (!this.isContainer(idx)) { return this.rows[idx].key.toString(); }
    },

    getCellProperties: function(idx, column) {},

    setTree: function(treebox) {
        this.treebox = treebox;
    },

    isContainerEmpty: function() { return false },
    setCellText: function() { },
    isSeparator: function() { return false },
    isSorted: function() { return false },
    getImageSrc: function() {},
    getRowProperties: function() {},
    getColumnProperties: function() {}
};
