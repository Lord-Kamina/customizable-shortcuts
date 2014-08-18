/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */



let {Keys} = require("../core/key.js");
let {Overlay, Overlays} = require("../core/overlay.js");
let {Shortcut} = require("../core/shortcut.js");
var _ = require("sdk/l10n").get;


const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let PreferenceTree = function(window) {

    let self = this;

    this.window = window;
    this.window.addEventListener("keypress", function(e) self._onKeyPress(e), true);
    this.window.addEventListener("keydown", function(e) self._onKeyDown(e), true);

    this.element = this.window.document.getElementById("ttCustomizableShortcuts_Tree");
    this.element.addEventListener("select", function(e) self._onSelect(e), false);
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
        let key = Keys.keys[id];
        this.window.document.getElementById("ttCustomizableShortcuts_Reset").setAttribute("disabled", !(Overlays.findByKey(key) || Overlays.findByDisabledKey(key)));
        this.window.document.getElementById("ttCustomizableShortcuts_Edit").setAttribute("disabled", false);
        this.window.document.getElementById("ttCustomizableShortcuts_Disable").setAttribute("disabled", false);
        let isDisabled = !! Overlays.findByDisabledKey(key);
        let buttonLabel = "disableButton_" + isDisabled;
        this.window.document.getElementById("ttCustomizableShortcuts_Disable").setAttribute("label", _(buttonLabel));
    },

    _onKeyPress: function(event) {
        if (!this.element.editingColumn) return;

        event.preventDefault();
        event.stopPropagation();

        this.element.stopEditing(true);
        this._onSelect(event);
    },

    _onKeyDown: function(event) {
        if (!this.element.editingColumn) return;

        event.preventDefault();
        event.stopPropagation();

        let shortcut = Shortcut.fromEvent(event);
        this.element.inputField.value = shortcut.toString();

        if ("None" == shortcut.toString() || "+None" == shortcut.toString().substr(-5)) { //Ignore unknown keys in non-US keyboards.
            event.preventDefault();
            event.stopPropagation();
            this.element.stopEditing(true);
            this._onSelect(event);
            let row = this.element.currentIndex;
            let column = this.element.columns.getLastColumn();
            this.element.startEditing(row, column);
            return;
        }

        let {
            editingRow, editingColumn
        } = this.element;
        let id = this.element.view.getCellValue(editingRow, editingColumn);

        if (shortcut.isComplete()) {
            new Overlay({
                key: Keys.keys[id],
                shortcut: shortcut
            });
            Overlays.getDuplicates();
            this.window.document.getElementById("ttCustomizableShortcuts_Reset").setAttribute("disabled", false);
        }
    },

    toElement: function() {
        return this.element;
    }
};

exports.PreferenceTree = PreferenceTree;
