/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */



const { storage } = require("sdk/simple-storage");
const { Shortcut } = require("../core/shortcut");
const { ColorNames } = require("../prefs/colors");
const { serialize, unserialize } = require("../util/serialization");

let Overlay = exports.Overlay = function (data, options) {
    this.key = data.key;
    this.shortcut = data.shortcut;

    Overlays.removeByKey(this.key);

    if (!this.key.shortcut.equals(this.shortcut) && !(this.shortcut.disabled)) {
        let overlays = Overlays.overlays;
        overlays.keys[this.key.toString()] = this;
        overlays.custom[this.shortcut.toString()] = this;
        overlays.overridden[this.key.shortcut.toString()] = this;
    }

    if (this.shortcut.disabled) {
        Overlays.overlays.disabled[this.key.toString()] = this;
    }

    if (!options || !options.dontStore) {
        Overlays.store();
    }
};

Overlay.prototype.remove = function() {
    let overlays = Overlays.overlays;
    delete overlays.keys[this.key.toString()];
    delete overlays.disabled[this.key.toString()];
    delete overlays.custom[this.shortcut.toString()];
    delete overlays.overridden[this.key.shortcut.toString()];
    Overlays.store();
};

let Overlays = exports.Overlays = {
    _overlays: null,

    _load: function() {
        this._overlays = {
            keys: {},
            custom: {},
            overridden: {},
            conflicting: {},
            disabled: {}
        };
        (storage.overlays || []).forEach(unserialize);
        Overlays.getDuplicates();
        require("../util/windows").Windows.disableKeys();
        return this._overlays;
    },

    store: function() {
        storage.overlays = [];
        for (let key in this.overlays.keys) {
        storage.overlays.push(serialize(this.overlays.keys[key]));
        }
        for (let key in this.overlays.disabled) {
        storage.overlays.push(serialize(this.overlays.disabled[key]));
        }
    },

    get overlays() {
        return this._overlays || this._load();
    },

    findByKey: function(key) {
        let idx = key.toString();
        if (idx in this.overlays.keys) {
        	return this.overlays.keys[idx];
	    }
	    return null;
    },

    findByDisabledKey: function(key) {
        let idx = key.toString();
        if (idx in this.overlays.disabled) {
        	return this.overlays.disabled[idx];
        }
        return null;
    },
    
        findByDisabledShortcut: function(shortcut) {
        const keys = require("../core/key");
        let idx = shortcut.toString();
		function filter(key) {
			return key.shortcut.toString().toLowerCase() == idx.toLowerCase();
		}
        let cache = keys.filter(filter);
        let tempKey = cache.keys().next().value;
        if (tempKey) { return (this.findByDisabledKey(tempKey) || null); }
        return null;
    },

    findByCustomShortcut: function(shortcut) {
        let idx = shortcut.toString();
        if (idx in this.overlays.custom) {
        	return this.overlays.custom[idx];
		}
		return null;
    },

    findByOverriddenShortcut: function(shortcut) {
        let idx = shortcut.toString();
        if (idx in this.overlays.overridden) { 
        	return this.overlays.overridden[idx];
	    }
	    return null;
    },

    findByConflictingShortcut: function(shortcut) {
        let idx = shortcut.toString();
        if (idx in this.overlays.conflicting) { 
        	return this.overlays.conflicting[idx];
	    }
		return null;
    },

    getConflictingShortcutColor: function(shortcut) {
        let idx = shortcut.toString();
        let groupColor = this.overlays.conflicting[idx][this.overlays.conflicting[idx].length - 1].groupColor;
        if (typeof(groupColor) != "undefined") { return groupColor; }
    },

    removeByKey: function(key) {
        let overlay = (this.findByKey(key) || this.findByDisabledKey(key));
        if (overlay) { overlay.remove(); }
        this.getDuplicates();
    },
    getDuplicates: function() {
        if (!shortcutKeys) { var shortcutKeys = {}; }
        let overlays = Overlays.overlays;

        for (let iterate in overlays.keys) {
            let currKey = overlays.keys[iterate];

            if (currKey.hasOwnProperty("shortcut") && !(currKey.key.disable)) {
                let currShort = currKey.shortcut.toString();
                if (!shortcutKeys[currShort]) { shortcutKeys[currShort] = []; }

                shortcutKeys[currShort].push(iterate);
                var filteredShortcutKeys = {};

                for (let i in shortcutKeys) {
                    if (shortcutKeys[i].length > 1) {
                        filteredShortcutKeys[i] = shortcutKeys[i]; // Add Shortcut to final array only if multiple mappings found.
                    }
                }

            }

        }
        for (let i in filteredShortcutKeys) {
            if (!usedColors) { var usedColors = []; }
            if (typeof(overlays.conflicting[i]) != "undefined") {
                let prevColor = overlays.conflicting[i][overlays.conflicting[i].length - 1].groupColor;
                if (typeof(prevColor) != "undefined") { // If already assigned, use previous color to avoid confusion.
                    groupColor = overlays.conflicting[i][overlays.conflicting[i].length - 1].groupColor;
                    usedColors.push(groupColor);
                }
            } else {
                do {
                    var groupColor = ColorNames.getRandom(); // Get random color to identify conflicting shortcuts.
                    usedColors.push(groupColor);
                }
                while (groupColor in usedColors); // Make sure colors do not repeat between different groups of key mappings. 
            }
            filteredShortcutKeys[i].push({
                "groupColor": groupColor
            });
        }

        overlays.conflicting = filteredShortcutKeys;
    }
};
