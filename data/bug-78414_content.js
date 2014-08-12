/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var clickListeners = {};

self.port.on("findPlugins", function(workerID) { // Look for objects to modify.
    var cssSelectors = self.options.cssSelectors;
    var stealFocusDelay = self.options.stealFocusDelay;
    var shiftAllowFocus = self.options.shiftAllowFocus;
    var embeds = (document.querySelectorAll(cssSelectors) || []);

    for (let i = 0; i < (embeds.length || 0); i++) {

        var listener = function(evt) {
                if ((true != shiftAllowFocus || true != evt.shiftKey) && (1 == evt.which)) {
                    window.setTimeout(function() {
                        evt.target.blur()
                    }, stealFocusDelay)
                }
            } // 		Capture only left-clicks, and check whether we want to ignore shift+click.
            embeds[i].addEventListener('click', listener);
        clickListeners[embeds[i].id] = listener; // Store a reference to the new listener for eventual removal.
    }
    if (embeds.length < 1) {
        self.port.emit("noEmbeds", workerID); // Being useless, report back for "handling."
    }

});

self.port.on("removeMods", function removeMods(workerID) {
    for (let i of Object.keys(clickListeners)) {
        document.getElementById(i).removeEventListener('click', clickListeners[i]);
    }
    self.port.emit("noEmbeds", workerID); // Commit Seppuku.
});
