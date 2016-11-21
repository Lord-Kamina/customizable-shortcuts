/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const prefs = require("sdk/preferences/service");
const system = require("sdk/system");
var _ = require("sdk/l10n").get;

const modifierKeys = {
    16: "shift",
    17: "control",
    18: "alt",
    91: "meta",
    92: "meta",
    93: "meta",
    224: "meta",
    225: "altgr"
};

const modifierNames = {
    control: _("ctrlKey"),
    meta: function() { 
    	let tmpString = "";
    	switch (system.platform) {
    		case "darwin":
    			tmpString = _("cmdKey");
    		break;
    		case "winnt":
				tmpString = _("winKey");
    		break;
    		case "linux":
				tmpString = _("superKey");
    		break;
    	}
    	return tmpString;
    },
    shift: _("shiftKey"),
    alt: _("altKey"),
    altgr: _("altgrKey")
};

function getModifierState(event, modifier) {
// Pressing Alt/Option on OS X shouldn't yield true for AltGraph.
    if ("darwin" == system.platform && modifier == "AltGraph") {
      return false;
    }
	if (event.getModifierState(modifier)) {
		return true;
	}

// getModifierState() seems to always return false on Linux when only a single modifier key is pressed. Work around by checking the keyCode.
	if ("linux" == system.platform) {
		return (modifierKeys[event.keyCode] || "") == modifier.toLowerCase();
	}

	return false;
	}

function getAccelKeyName() {
    return modifierKeys[prefs.get("ui.key.accelKey")] || "control";
}

function isAccelKeyPressed(event) {
    let accelKeyName = getAccelKeyName().replace("control", "ctrl");
    return event[accelKeyName + "Key"];
}

let Modifiers = exports.Modifiers = function (data) {
    this.modifiers = data.modifiers;
}

Modifiers.prototype.toString = function() {
	    let keys = {};
    	this.modifiers.forEach(function(modifier) {
        	keys[modifier.toLowerCase()] = 1;
	    });

    	if (keys.accel) { keys[getAccelKeyName()] = 1; }

	    let names = [];
    	for (let name in modifierNames) {
        	if (keys[name]) {
				let tmpName = modifierNames[name];
        	if ("meta" == name) { tmpName = modifierNames.meta(); }
        	names.push(tmpName);
        	}
	    }

    	return names.join(" + ");
	};
	
Modifiers.fromEvent = function(event) {
    	let modifiers = []; 
    	if (getModifierState(event, "Shift")) { modifiers.push("shift"); }
    	if ("winnt" == system.platform) {
        		if ((getModifierState(event, "Control") && getModifierState(event,"Alt")) || (getModifierState(event,"AltGraph"))) { modifiers.push("altgr"); }
    	}
        else if ("linux" == system.platform) { 
			if (getModifierState(event, "AltGraph")) { modifiers.push("altgr"); }
		}
		if (-1 == modifiers.indexOf("altgr")) {
			if (getModifierState(event,"Control")) { modifiers.push("control"); }
			if (getModifierState(event, "Alt")) { modifiers.push("alt"); }
		}
		if (getModifierState(event, "Meta") || getModifierState(event, "OS")) {
		modifiers.push("meta");
		}
		
    	if (modifiers.length) {
    		return new Modifiers({modifiers: modifiers});
    	}
	}
	
Modifiers.isModifier = function(key) {
    return key in modifierKeys;
	}
