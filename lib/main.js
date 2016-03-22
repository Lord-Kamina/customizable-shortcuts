/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const {Windows} = require("./util/windows");
const {Overlays} = require("./core/overlay");
const {Shortcut} = require("./core/shortcut");
const system = require("sdk/system");
const extensionPrefs = require("sdk/simple-prefs");


require("./patch/bug-78414");

function handleKeyPress(event) {
    let shortcut = Shortcut.fromEvent(event);
if (shortcut.key|| shortcut.keycode) {
    // check if this is a custom shortcut
    let overlay = Overlays.findByCustomShortcut(shortcut);

    if (overlay) { overlay.key.executeCommand(); }
    else { // check if this is a shortcut that is overriden by a custom one
    overlay = Overlays.findByOverriddenShortcut(shortcut);
    }
    if (overlay) {
        event.preventDefault();
        event.stopPropagation();
    }
    }
};

exports.main = function(options, callbacks) {
    Windows.addEventListener("keydown", handleKeyPress);
};

exports.onUnload = function(reason) {
    Windows.removeEventListener("keydown", handleKeyPress);
};
