/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


let addonManager = Cu.import("resource://gre/modules/AddonManager.jsm").AddonManager;
if (45 > system.version) require("./patch/bug-645371");
else console.log("Firefox 45.0 or newer detected, excluding patch for bug-645371.")
let tabGroups = addonManager.getAddonByID("tabgroups@quicksaver", function(i) { if (true == i.isActive) { console.log("TabGroups extension is installed, calling bug-645371 code regardless of version."); require("./patch/bug-645371"); } });
require("./prefs/prefpane");
require("./patch/bug-78414");
const {Windows} = require("./util/windows");
const {Overlays} = require("./core/overlay");
const {Shortcut} = require("./core/shortcut");
const system = require("sdk/system");
const extensionPrefs = require("sdk/simple-prefs");


let onKeyDown = function(event) {
    let shortcut = Shortcut.fromEvent(event);
if (shortcut.key|| shortcut.keycode) {
    // check if this is a custom shortcut
    let overlay = Overlays.findByCustomShortcut(shortcut);

    if (overlay) { overlay.key.executeCommand(); }
    else { // check if this is a shortcut that is overriden by a custom one
    overlay = Overlays.findByOverriddenShortcut(shortcut);

    if (overlay) {
        event.preventDefault();
        event.stopPropagation();
    }
    }
};

exports.main = function(options, callbacks) {
    Windows.addEventListener("keydown", onKeyDown);
};

exports.onUnload = function(reason) {
    Windows.removeEventListener("keydown", onKeyDown);
};
