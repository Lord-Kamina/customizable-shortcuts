/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */



const { keys, domKeys } = require("../util/functions");
const {Modifiers} = require("../core/modifiers");
var _ = require("sdk/l10n").get;

let Shortcut = exports.Shortcut = function (data) {
    this.key = data.key;
    this.keycode = data.keycode;
    this.code = data.code;
    this.modifiers = data.modifiers;
    this.disabled = data.disabled;
}

Shortcut.prototype.equals = function(obj) {
    if (obj instanceof Shortcut) {
        return obj.toString() == this.toString();
    }

    return false;
}

Shortcut.prototype.toString = function() {
    if (this._toStringCache) { return this._toStringCache; }
// 	console.warn("Shortcut.toString()... this.code is: "+this.code+", this.keycode: "+this.keycode);
    let parts = [];

    if (this.modifiers) { parts.push(this.modifiers.toString() + " + "); }

    if (this.keycode) {
    	if (!domKeys.virtual_keys[this.keycode].key) {
    	let keyName = domKeys.keycodes[domKeys.virtual_keys[this.keycode].keyCode].replace(/^VK_/, "");
    	keyName = keyName[0] + keyName.substr(1).toLowerCase();
        keyName = keyName.replace(/_[a-z]/i, str => str[1].toUpperCase());
        var l10n_keyName = _(keyName + "_Key");
        l10n_keyName = l10n_keyName.replace(/(^F\d{1,3})_Key/, "$1");
        }
    	parts.push(domKeys.virtual_keys[this.keycode].key ? domKeys.virtual_keys[this.keycode].key : l10n_keyName);
    	}
	else {
	
	let l10n_keyName = _(this.code + "_Key");
	parts.push(l10n_keyName)
	
	}
    // if (1 < this.keycode.length) {
//         let keyName = this.keycode.replace(/^VK_/, "");
//         keyName = keyName[0] + keyName.substr(1).toLowerCase();
//         keyName = keyName.replace(/_[a-z]/i, str => str[1].toUpperCase());
//         if (1 == keyName.length) var l10n_keyName = keyName;
//         else var l10n_keyName = _(keyName + "_Key");
//         l10n_keyName = l10n_keyName.replace(/(^F\d{1,3})_Key/, "$1");
//         parts.push(l10n_keyName);
//     }

    return this._toStringCache = parts.join("");
}

Shortcut.prototype.isComplete = function() {
	if (this.keycode) {
		let tempKeyCode = domKeys.virtual_keys[this.keycode].keyCode;
		if (48 <= tempKeyCode && tempKeyCode <= 90) {
// 			this.modifiers && console.warn("Modifiers? "+JSON.stringify(this.modifiers.modifiers,null,2));
			if (this.modifiers) {
			
			if (1 == this.modifiers.modifiers.length && this.modifiers.modifiers[0] == "shift") {
// 			console.warn("Sorry. Just shift is not enough when typing a letter.");
			return false;
			}
			return !!(this.modifiers);
			}
			
			}
		else {
			return true;
		}
	}
	else { return !!(this.code); }
}

Shortcut.fromEvent = function(event) {
    let data = {
    modifiers: Modifiers.fromEvent(event)
    };
    
//     console.warn("Shortcut.fromEvent()... keyCode: "+event.keyCode+", key: "+event.key+", code: "+event.code+", which: "+event.which);
    
    if (event.keyCode == 0) { tmpKey = event.code; }
    else { tmpKey = event.keyCode }
    
	if (/^[0-9]+$/.test(tmpKey)) {
// 		console.warn("Shortcut.fromEvent()... tmpKey's value is: "+tmpKey+", and I think that's a number...");
		if (!Modifiers.isModifier(tmpKey)) { data.keycode = domKeys.keycodes[tmpKey]; }
		}
    else { data.code = tmpKey; }
	var shortcut = new Shortcut(data);
// 	console.warn("Is this a complete Shortcut?: "+shortcut.isComplete());
// 	console.warn("Shortcut.fromEvent()... let's dump our shortcut: "+JSON.stringify(shortcut,null,2));
// 	console.warn("Shortcut.fromEvent().toString(): "+shortcut.toString());
    return shortcut;	
}
