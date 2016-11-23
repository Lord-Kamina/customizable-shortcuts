/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const { Windows } = require("./util/windows");
const { windowMediator } = require("./util/functions");
const system = require("sdk/system");
const extensionPrefs = require("sdk/simple-prefs");
const self = require("sdk/self");

if (37 < system.version) {
	let domainUrlPattern = extensionPrefs.prefs['domainUrlPattern'];
	console.log("Firefox 38 or newer detected, checking URL Patterns");
	console.log("URL Patterns: "+domainUrlPattern);
	if ("[\\\u0022*\\\u0022]" == domainUrlPattern) { 
		console.warn("URL Patterns stored in old(cfx) format; correcting.");
		let domainUrlPattern = "[\"*\"]"
		console.log("URL Patterns (Corrected): "+domainUrlPattern);
		extensionPrefs.prefs['domainUrlPattern'] = domainUrlPattern;
	}
}

let { storage } = require("sdk/simple-storage");
if (1 < storage.overlays.length) {
	console.log("Detected shortcuts stored in the old format; correcting.");
	extensionPrefs.prefs['keybinderOverlays'] = JSON.stringify(storage);
	storage.overlays = [];
}
storage = "";

if ("upgrade" == self.loadReason) {
	var md = require('markdown-it/dist/markdown-it.js')({
  		html: false,
  		linkify: true,
  		typographer: true,
  		xhtmlOut:     true
  	});
	md.use(require("markdown-it-table-of-contents"));
	md.use(require("markdown-it-anchor"));
	var changelog_html = md.render(self.data.load("README.md"));
	var releaseNotes = Windows.getMostRecentWindow().openDialog("chrome://keybinder/content/releasenotes.xul","Changelog","centerscreen,titlebar=yes,dialog=yes,scrollbars,modal=no,chrome=yes",changelog_html);
}

require("./patch/bug-78414");

exports.main = function(options, callbacks) {
    Windows.addEventListener("keydown", Windows.handleKeyPress);

};

exports.onUnload = function(reason) {
Windows.enableKeys();
    if (windowMediator.getMostRecentWindow("Keybinder:URLPatterns")) { windowMediator.getMostRecentWindow("Keybinder:URLPatterns").window.close(); }
    if (windowMediator.getMostRecentWindow("Keybinder:config")) { windowMediator.getMostRecentWindow("Keybinder:config").window.close(); }
    if (windowMediator.getMostRecentWindow("Keybinder:CustomXUL")) { windowMediator.getMostRecentWindow("Keybinder:CustomXUL").window.close(); }
    Windows.removeEventListener("keypress", Windows.handleKeyPress);
};
