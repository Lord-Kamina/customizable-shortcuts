/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */



let {Windows} = require("util/windows.js");
let {Shortcut} = require("core/shortcut.js");
let {Modifiers} = require("core/modifiers.js");

function Key(data) {
    let {Windows} = require("util/windows.js");
    let element = Windows.getElementById(data.id);
    this.id = data.id;
    this.element = element;

    this.key = element.getAttribute("key").toUpperCase().charCodeAt(0);
    this.keycode = element.getAttribute("keycode");
    if (element.hasAttribute("modifiers")) this.modifiers = new Modifiers({
        modifiers: element.getAttribute("modifiers").split(/[,\s]/)
    });

    this.shortcut = new Shortcut({
        key: this.key,
        keycode: this.keycode,
        modifiers: this.modifiers
    });
}

Key.prototype = {
    executeCommand: function Key_executeCommand() {
        if (this.element.hasAttribute("command")) {
            let {                Windows
            } = require("util/windows.js");
            let command = this.element.getAttribute("command");
            command = Windows.getElementById(command);
            command && command.doCommand();
            return;
        }

        if (this.element.hasAttribute("oncommand")) {
            let sourceEvent = Windows.createEvent("Events");
            sourceEvent.initEvent("command", false, false);
            let event = Windows.createEvent("XULCommandEvents");
            event.initCommandEvent("command", true, false, null, null, false, false, false, false, sourceEvent);
            this.element.dispatchEvent(event);
        }
    },

    getLabel: function Key_getLabel() {
        return this.element.getAttribute("label");
    },

    toString: function Key_toString() {
        return this.id;
    }
};

let Keys = {
    _keys: null,

    _loadKeys: function() {
        let {Windows} = require("util/windows.js");
        this._keys = {};
        let children = Windows.querySelectorAll("key");

        for (let c = 0; c < children.length; c++) {
            let key = children[c];
            var element = key;
            if (key.getAttribute("command") == "Browser:Reload" && !key.getAttribute("id")) key.setAttribute("id", "key_reload2"); // Fix Reload Key without an ID.
            if (key.getAttribute("command") == "Browser:ReloadSkipCache" && !key.getAttribute("id")) key.setAttribute("id", "key_forceReload"); // Fix ReloadSkipCache Key without an ID.
            if (key.hasAttribute("id")) {
                let id = key.getAttribute("id");
                this._keys[id] = new Key({
                    id: id
                });

            }
            //       else {  // The other ID-less keys are basically just redundant. Leaving this debug bit in case somebody wants to use them, though.
            //       const {Cc,Ci} = require("chrome");
            //         var XMLSerializer = Cc["@mozilla.org/xmlextras/xmlserializer;1"].
            //         	       createInstance(Ci.nsIDOMSerializer); 
            // 		let noidElement = key;
            // 		console.info("DEBUG:		Found key without ID: "+XMLSerializer.serializeToString(noidElement));
            // 
            //       
            //       }
        }
        return this._keys;
    },

    get keys() {
        return this._keys || this._loadKeys();
    }

};

exports.Key = Key;
exports.Keys = Keys;
