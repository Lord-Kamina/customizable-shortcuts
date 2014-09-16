/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const {Cc, Ci} = require("chrome");

let {Windows} = require("./util/windows");
let {Overlays} = require("./core/overlay");
let {Shortcut} = require("./core/shortcut");
let {Prefs} = require("sdk/preferences/service");

require("./prefs/prefpane");
require("./patch/bug-645371");
require("./patch/bug-78414");

if (require("./util/os").checkOSID() == "Darwin") // Add "Next/Previous Tab" to the Keyset. We'll be adding the menu items along with the one for our extension.
require("./patch/bug-406199");

let onKeyDown = function(event) {
    let shortcut = Shortcut.fromEvent(event);
if (shortcut.key|| shortcut.keycode) {
    // check if this is a custom shortcut
    let overlay = Overlays.findByCustomShortcut(shortcut);

    if (overlay) overlay.key.executeCommand();
    else // check if this is a shortcut that is overriden by a custom one
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
