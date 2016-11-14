/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */



const { keys } = require("../util/functions");
const {Modifiers} = require("../core/modifiers");
var _ = require("sdk/l10n").get;

let Shortcut = exports.Shortcut = function (data) {
    this.key = data.key;
    this.keycode = data.keycode;
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
    if (this._toStringCache) return this._toStringCache;

    let parts = [];

    if (this.modifiers) { parts.push(this.modifiers.toString() + " + "); }

// console.warn("Shortcut.toString()... first, let's dump: "+JSON.stringify(this,null,2));
// console.warn("Shortcut.toString()... now, let's break down: this.key: ("+this.key+"), this.keycode: ("+this.keycode+"), this.code: ("+this.code+"), this.charCode: ("+this.charCode+"), this.key String representation: ("+(this.key ? String.fromCodePoint(this.key) : null)+")");

    if (this.key) {
        parts.push(String.fromCodePoint(this.key));
    }

    if (this.keycode) {
        let keyName = this.keycode.replace(/^VK_/, "");
        keyName = keyName[0] + keyName.substr(1).toLowerCase();
        keyName = keyName.replace(/_[a-z]/i, str => str[1].toUpperCase());
        if (1 == keyName.length) var l10n_keyName = keyName;
        else var l10n_keyName = _(keyName + "_Key");
        l10n_keyName = l10n_keyName.replace(/(^F\d{1,3})_Key/, "$1");
        parts.push(l10n_keyName);
    }

    return this._toStringCache = parts.join("");
}

Shortcut.prototype.isComplete = function() {
    return !!((this.key  && this.modifiers) || this.keycode);
}

Shortcut.fromEvent = function(event) {
    let data = {
        modifiers: Modifiers.fromEvent(event)
    };

//         console.warn("Shortcut.fromEvent()... keycode: "+event.keyCode+", key: "+event.key+", code: "+event.code+", charcode: "+event.charCode+", which: "+event.which);
    if (event.key && "Dead" != event.key && 1 == event.key.length)  {
    	if (event.key.toUpperCase() != String.fromCharCode(event.charCode).toUpperCase() && event.charCode)
    	{ 
//     		console.warn("Shortcut.fromEvent()... WARNING: Event.key doesn't match event charcode...");
    	if (0 == event.charCode) { 
//     	console.warn("But we'll ignore it because the charCode is 0.");
    	data.key = (event.key.toUpperCase()).codePointAt(0);
    	}
    	}
    	else { data.key = (String.fromCodePoint(event.charCode).toUpperCase()).codePointAt(0); }
    }
    else {

    for (let name in keys) {
        let key = keys[name];
        if (!Modifiers.isModifier(key) && event.keyCode == key) {
            data.keycode = name.replace(/^DOM_/, "");
            break;
        }
    }
    }
var shortcut = new Shortcut(data);
    return shortcut;
}
