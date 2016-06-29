/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */



const keys = require("../core/key");
const CustomXUL = require("../core/custom");
const { customXULTreeView } = require("../prefs/treeview");
const { Overlay, Overlays } = require("../core/overlay");
const { Shortcut } = require("../core/shortcut");
var _ = require("sdk/l10n").get;
const { prompterService } = require("../util/functions");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let PreferenceTree = exports.PreferenceTree = function (window) {
    let self = this;

    this.window = window;
    this.window.addEventListener("keydown", function(e) { self._onKeyDown(e) }, true);   
    this.element = this.window.document.getElementById("ttCustomizableShortcuts_Tree");
    
    this.element.addEventListener("keypress", function(event) { self._onKeyPress(event) }, true);
    
    this.element.addEventListener("select", function(e) { self._onSelect(e) }, false);
    this.window.setTimeout(function () {
    	this.window.document.getElementById("ttCustomizableShortcuts_Tree").focus();
    	this.window.document.getElementById("ttCustomizableShortcuts_Tree").view.selection.select(1);
    },1);
}

PreferenceTree.prototype = {
    _createElement: function(tag, parent) {
        let element = this.window.document.createElementNS(XUL_NS, tag);
        parent && parent.appendChild(element);
        return element;
    },

    _onSelect: function(event) {
        let row = this.element.currentIndex;
        let column = this.element.columns.getLastColumn();
        let id = this.element.view.getCellValue(row, column);
        if (this.element.view.isContainer(row) == true) { // Catch Error Produced by selecting a row with no key.
            return;
        }
        let key = keys.find(id);
        this.window.document.getElementById("ttCustomizableShortcuts_Reset").setAttribute("disabled", !(Overlays.findByKey(key) || Overlays.findByDisabledKey(key)));
        this.window.document.getElementById("ttCustomizableShortcuts_Edit").setAttribute("disabled", false);
        this.window.document.getElementById("ttCustomizableShortcuts_Disable").setAttribute("disabled", false);
        let isDisabled = !! Overlays.findByDisabledKey(key);
        let buttonLabel = "disableButton_" + isDisabled;
        this.window.document.getElementById("ttCustomizableShortcuts_Disable").setAttribute("label", _(buttonLabel));
    },
	_onKeyPress: function(event) {
		if (this.element.editingColumn) { return; }
        if (("Enter" == event.key) || ("VK_ENTER" == event.keycode) || ("VK_RETURN" == event.keycode)) {
        event.preventDefault();
        event.stopPropagation();
        this.window.document.getElementById("ttCustomizableShortcuts_Edit").click();
        }
	},
	
    _onKeyDown: function(event) {
        if (!this.element.editingColumn) { return; }

        event.preventDefault();
        event.stopPropagation();

        let shortcut = Shortcut.fromEvent(event);
        this.element.inputField.value = shortcut.toString();
		if (("VK_ESCAPE" == shortcut.keycode) && ("Esc" == shortcut.toString())) {
            event.preventDefault();
            event.stopPropagation();
            this.element.stopEditing(true);
            this.element.focus();
            this._onSelect(event);
            return
		}
        if ("None" == shortcut.toString() || "+None" == shortcut.toString().substr(-5)) { // Prevent dysfunctional shortcuts with unrecognized and/or dead keys.
            event.preventDefault();
            event.stopPropagation();
            this.element.stopEditing(true);
            this.element.focus();
            this._onSelect(event);
            let row = this.element.currentIndex;
            let column = this.element.columns.getLastColumn();
            this.element.startEditing(row, column);
            return;
        }

        const {
            editingRow, editingColumn
        } = this.element;
        let id = this.element.view.getCellValue(editingRow, editingColumn);

        if (shortcut.isComplete()) {
            new Overlay({
                key: keys.find(id),
                shortcut: shortcut
            });
        this.element.stopEditing(true);
        this.element.focus(); //Restore focus so we can navigate the list with the keyboard arrows.
        this._onSelect(event);
            Overlays.getDuplicates();
            this.window.document.getElementById("ttCustomizableShortcuts_Reset").setAttribute("disabled", false);
        }
    },

    toElement: function() {
        return this.element;
    }
};

let customXULTree = exports.customXULTree = function (window) {
    
    function _selectNewRow (row = 0) {
    
    this.element.view.selection.select(row);
    
    }
    
    let self = this;
	
    this.window = window;
    this.element = this.window.document.getElementById("KeybinderCustomXUL_Tree");
	this.element.addEventListener("keypress", function(event) { self._onKeyPress(event) }, true);
    this.element.inputField.addEventListener("keydown", function(event) { self._onKeyDown(event, this.editingColumn) }, true);
    this.element.inputField.addEventListener("paste", function(event) { self._onPaste(event) }, true);
    this.element.addEventListener("change", function(event, target) { self._onChange(event, this.editingColumn) }, true);
    this.element.addEventListener("select", function(event) { self._onSelect(event) }, false);
    this.window.setTimeout(function () {
    	this.window.document.getElementById("KeybinderCustomXUL_Tree").view.selection.select(0)
		this.window.document.getElementById("KeybinderCustomXUL_Tree").focus();
    },1);
}

customXULTree.prototype = {
    _createElement: function(tag, parent) {
        let element = this.window.document.createElementNS(XUL_NS, tag);
        parent && parent.appendChild(element);
        return element;
    },

    _onSelect: function(event) {
    	if (this.element.currentIndex < 0) { this.element.view.selection.select(0) }
        let row = this.element.view.selection.currentIndex;
        let key = this.element.view.getCellValue(row, this.element.columns.getNamedColumn("KeybinderCustomXUL_NameCol"));
        if ((this.element.view.isContainer(row) == true) || (!key)) { // Catch Error Produced by selecting a row with no key.
            return;
        }
        let item = CustomXUL.find(key);
        if (item) {
        this.window.document.getElementById("KeybinderCustomXUL_Edit").setAttribute("disabled", false);
        this.window.document.getElementById("KeybinderCustomXUL_Delete").setAttribute("disabled", false);
        }
        this.window.document.getElementById("KeybinderCustomXUL_Add").setAttribute("disabled", false);
    },
    
	_validate: function(c, type, field = false) {
		if (!!field) {
			switch (type) {
				case "key":
					return (/^[a-zA-Z0-9-_]+$/).test(c);
				break;
				case "label":
					return (/^[^*{}()\[\]\\\/\"\'\`\´^#]+$/).test(c);
				break;
				case "command":
					return (/^[a-zA-Z0-9-_:]+$/).test(c);
				break;
				default:
					return false;
			}
		}
		else {
			if (c.length > 1) { return true }
			switch (type) {
				case "key":
					return (/^[a-zA-Z0-9-_]$/).test(c);
				break;
				case "label":
					return (/^[^*{}()\[\]\\\/\"\'\`\´^#]$/).test(c);
				break;
				case "command":
					return (/^[a-zA-Z0-9-_:]$/).test(c);
				break;
				default:
					return false;
			}
		}
	},
	
    _onKeyPress: function(event) {
    if (this.element.editingColumn) { return }
    console.warn("onKeyDown() DEBUG: No column is being edited...");
    if (("Enter" == event.key) || ("VK_ENTER" == event.keycode) || ("VK_RETURN" == event.keycode)) {
	    event.preventDefault();
		event.stopPropagation();
	    this.window.document.getElementById("KeybinderCustomXUL_Edit").click();
	}
	else if (("Delete" == event.key) || ("VK_DELETE" == event.keycode)) {
	    event.preventDefault();
		event.stopPropagation();
		this.window.document.getElementById("KeybinderCustomXUL_Delete").click();
	}
    },
	
    _onKeyDown: function(event) {
    	if (this.element.editingColumn) {
			switch (this.element.editingColumn.id) {
    	 
    	 		case "KeybinderCustomXUL_NameCol":
    	 			if (true != this._validate(event.key,"key",false)) { event.preventDefault(); event.stopPropagation(); return; }
    	 		break;
    	 	
    	 		case "KeybinderCustomXUL_LabelCol":	
    	 			if (true != this._validate(event.key,"label",false)) { event.preventDefault(); event.stopPropagation(); return; }
    	 		break;
    	 	
    	 		case "KeybinderCustomXUL_ActionCol":
	    	 		if (true != this._validate(event.key,"command",false)) { event.preventDefault(); event.stopPropagation(); return; }
    		 	break;
    	 	
    		 	default:
    	 			return;
    		}
    	}
        if (("Enter" == event.key) || ("VK_ENTER" == event.keycode) || ("VK_RETURN" == event.keycode)) {            
			event.preventDefault();
        	event.stopPropagation();
			if (this.element.editingColumn) {
				let row = this.element.editingRow;
				let column = this.element.editingColumn;
				let id = column.id;
            
				let rowKey = this.element.view.getCellValue(row,this.element.columns.getNamedColumn("KeybinderCustomXUL_NameCol"));
			
				let mapItem = CustomXUL.allCustomKeys().get(rowKey);
			
				let mapItemKey = mapItem.key;
				let mapItemLabel = mapItem.label;
				let mapItemCommand = mapItem.command;
			
				switch (this.element.editingColumn.id) {
    	 
    		 		case "KeybinderCustomXUL_NameCol":
    		 			let filter = this.window.document.getElementById("KeybinderCustomXUL_Filter");
    	 				mapItemKey = this.element.inputField.value;
    	 				if (CustomXUL.find(mapItemKey)) {
						    if (mapItemKey != rowKey) {
					    		prompterService.alert(this.window, _("conflictWarning.title"), _("customXulConflict.text")); // Break in case name entered already exists, but only display a warning if it would have resulted in a duplicate.
							    this.element.startEditing(row,column);
							    return
						    }
					break;
    	 			}
    	 				CustomXUL.allCustomKeys().delete(rowKey);
	    	 			CustomXUL.allCustomKeys().set(mapItemKey, new CustomXUL.CustomXUL({key:mapItemKey, label:mapItemLabel, command:mapItemCommand}));
    	 			
    		 			if (!!filter.value) { 
    			 			filter.value = mapItemKey;
    	 					this.element.view = new customXULTreeView(mapItemKey,true,this.element,true); // Let's make sure to avoid possible errors if rows were filtered.
    	 				}
    	 				else { this.element.view = new customXULTreeView(mapItemKey,true,this.element,false) }
    	 			break;
    	 	
    	 			case "KeybinderCustomXUL_LabelCol":	
    	 				mapItemLabel = this.element.inputField.value;
    	 				CustomXUL.allCustomKeys().set(rowKey, new CustomXUL.CustomXUL({key:mapItemKey, label:mapItemLabel, command:mapItemCommand}));
    	 			break;
    	 	
    	 			case "KeybinderCustomXUL_ActionCol":
    	 				mapItemCommand = this.element.inputField.value;
    	 				CustomXUL.allCustomKeys().set(rowKey, new CustomXUL.CustomXUL({key:mapItemKey, label:mapItemLabel, command:mapItemCommand}));
	    		 	break;
    	 	
    			 	default:
    		 			return;
    			}	
    			
            	this.element.stopEditing(true);
            	
				this.window.setTimeout(function (tree) { tree.startEditing(tree.currentIndex,column.getNext()) },0, this.element);
 				if (!this.element.editingColumn) {
 					this.element.focus(); //Restore focus so we can navigate the list with the keyboard arrows.
 		        	this._onSelect(event);
 		    	}
			}
        }
        else if (("VK_ESCAPE" == event.keycode) || ("Escape" == event.key)) {
            event.stopPropagation();
        	event.preventDefault();
        	this._onBlur(event,this.element.editingColumn,this.element.inputField,true);
		}
    },
    _onPaste: function (event) {
    			let data = event.clipboardData;
    			let asText = data.getData("text");
    			
		switch (this.element.editingColumn.id) {
    	 
    		case "KeybinderCustomXUL_NameCol":
    	 		if (true != this._validate(asText,"key",true)) { event.preventDefault(); event.stopPropagation(); return; }
    	 	break;
    	 		
    	 	case "KeybinderCustomXUL_LabelCol":	
    	 		if (true != this._validate(asText,"label",true)) { event.preventDefault(); event.stopPropagation(); return; }
    	 	break;
    	 	
   	 		case "KeybinderCustomXUL_ActionCol":
    	 		if (true != this._validate(asText,"command",true)) { event.preventDefault(); event.stopPropagation(); return; }
   		 	break;
    	 	
   		 	default:
   	 			return;
   		}
    
    },
    _onBlur: function (event, target, inputField = this.element.inputField, pressedEsc) {
        let field = inputField;
			switch (target.id) {
    	 
    	 		case "KeybinderCustomXUL_NameCol":
    	 			if (true != this._validate(field.value,"key",true)) { event.preventDefault(); event.stopPropagation(); return; }
    	 		break;
    	 	
    	 		case "KeybinderCustomXUL_LabelCol":	
    	 			if (true != this._validate(field.value,"label",true)) { event.preventDefault(); event.stopPropagation(); return; }
    	 		break;
    	 	
    	 		case "KeybinderCustomXUL_ActionCol":
	    	 		if (true != this._validate(field.value,"command",true)) { event.preventDefault(); event.stopPropagation(); return; }
    		 	break;
    	 	
    		 	default:
    	 			return;
    		}
	
	if (!!pressedEsc) { 
    	this.element.stopEditing(false);
        this.element.focus();
        this._onSelect(event);
        return
    	}
    },
    
    _onChange: function (event, target) {
    	if (!target) { return }
    	let field = this.element.inputField;
		switch (target.id) {
    	 
    	 	case "KeybinderCustomXUL_NameCol":
    	 		if (true != this._validate(field.value,"key",true)) { event.preventDefault(); event.stopPropagation(); return; }
    	 	break;
    	 	
    	 	case "KeybinderCustomXUL_LabelCol":	
    	 		if (true != this._validate(field.value,"label",true)) { event.preventDefault(); event.stopPropagation(); return; }
    	 	break;
    	 	
    	 	case "KeybinderCustomXUL_ActionCol":
	    	 	if (true != this._validate(field.value,"command",true)) { event.preventDefault(); event.stopPropagation(); return; }
    		 break;
    	 	
    		 default:
    	 		return;
    	}    	
    	let row = this.element.currentIndex;
            
		let rowKey = this.element.view.getCellValue(row,this.element.columns.getNamedColumn("KeybinderCustomXUL_NameCol"));
			
		let mapItem = CustomXUL.allCustomKeys().get(rowKey);
			
		let mapItemKey = mapItem.key;
		let mapItemLabel = mapItem.label;
		let mapItemCommand = mapItem.command;
			
		switch (target.id) {
    	 
    		case "KeybinderCustomXUL_NameCol":
    			let filter = this.window.document.getElementById("KeybinderCustomXUL_Filter");
    	 		mapItemKey = this.element.inputField.value;
    	 		if (CustomXUL.find(mapItemKey)) {
					if (mapItemKey != rowKey) {
						prompterService.alert(this.window, _("conflictWarning.title"), _("customXulConflict.text")); // Break in case name entered already exists, but only display a warning if it would have resulted in a duplicate.
						this.element.startEditing(row,column);
						return
					}
					break;
    	 		}
    	 		CustomXUL.allCustomKeys().delete(rowKey);
	    	 	CustomXUL.allCustomKeys().set(mapItemKey, new CustomXUL.CustomXUL({key:mapItemKey, label:mapItemLabel, command:mapItemCommand}));
    	 			
    		 	if (!!filter.value) { 
    			 	filter.value = mapItemKey;
    	 			this.element.view = new customXULTreeView(mapItemKey,true,this.element,true); // Let's make sure to avoid possible errors if rows were filtered.
    	 		}
    	 		else { this.element.view = new customXULTreeView(mapItemKey,true,this.element,false) }
    	 	break;
    	 	
    	 	case "KeybinderCustomXUL_LabelCol":	
    	 		mapItemLabel = this.element.inputField.value;
    	 		CustomXUL.allCustomKeys().set(rowKey, new CustomXUL.CustomXUL({key:mapItemKey, label:mapItemLabel, command:mapItemCommand}));
    	 	break;
    	 	
    	 	case "KeybinderCustomXUL_ActionCol":
    	 		mapItemCommand = this.element.inputField.value;
    	 		CustomXUL.allCustomKeys().set(rowKey, new CustomXUL.CustomXUL({key:mapItemKey, label:mapItemLabel, command:mapItemCommand}));
    		 break;
    	 	
    		 default:
    	 		return;
    		}
 		if (!this.element.editingColumn) {
 			this.element.focus(); //Restore focus so we can navigate the list with the keyboard arrows.
			this._onSelect(event);
		}
    },

    toElement: function() {
        return this.element;
    }
};