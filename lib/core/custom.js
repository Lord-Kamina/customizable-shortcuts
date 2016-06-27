/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { Windows } = require("../util/windows");
const { Overlays } = require("../core/overlay");

var _ = require("sdk/l10n").get;
const extensionPrefs = require("sdk/simple-prefs");

let allCustomKeys = exports.allCustomKeys = (function () {
	let cache;
	return function () {
		if (!cache) {
			cache = new Map();
			for (let key of JSON.parse(extensionPrefs.prefs['customXULKeys'])) {
		    	cache.set(key.key, new CustomXUL({key:key.key, label:key.label, command:key.command}))
			}
		}
	return cache;
	};
})();

let find = exports.find = function (key) {
	return allCustomKeys().get(key);
};

let filter = exports.filter = function (fun) {
	let filtered = new Map();
	for (let key of allCustomKeys().values()) {
		if (fun(key)) {
			filtered.set(key.id, key);
		}
	}
	return filtered;
}

let CustomXUL = exports.CustomXUL = function (data) {
	const { Windows } = require("../util/windows");
	this.key = data.key;
	this.label = data.label;
	this.command = data.command;
}

CustomXUL.prototype = {
	nsID: function () {
	return String.concat("Keybinder_", this.key);
	},

    getLabel: function () {
        return this.label;
    },

    getKey: function () {
        return this.key;
    },
    
    getCommand: function () {
        return this.command;
    }
};