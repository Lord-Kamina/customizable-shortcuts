/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const { Windows } = require("./util/windows");


const system = require("sdk/system");
const extensionPrefs = require("sdk/simple-prefs");

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

require("./patch/bug-78414");

exports.main = function(options, callbacks) {
    Windows.addEventListener("keydown", Windows.handleKeyPress);
};

exports.onUnload = function(reason) {
    Windows.removeEventListener("keydown", Windows.handleKeyPress);
};
