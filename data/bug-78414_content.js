/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var clickListeners = {};
var timesCrawled = 0;
var pluginCrawlLimit = self.options.pluginCrawlLimit;

var checkAgain = function () {
	if (timesCrawled <= pluginCrawlLimit) {
		timesCrawled++;
		self.port.emit("noEmbeds", { "ID": workerID, "checkAgain": true } ); // Fail me ONE more time...
	}
	else {
		self.port.emit("noEmbeds", { "ID": workerID, "checkAgain": false } );
	}
}

function checkPlugins (workerID) {
    var cssSelectors = self.options.cssSelectors;
    var stealFocusDelay = self.options.stealFocusDelay;
    var shiftAllowFocus = self.options.shiftAllowFocus;
    var embeds = (document.querySelectorAll(cssSelectors) || []);

    for (let i = 0; i < (embeds.length || 0); i++) {

        var listener = function(evt) {
                if ((true != shiftAllowFocus || true != evt.shiftKey) && (1 == evt.which)) {
                    window.setTimeout(function() {
                    	window.alert('THE EVENT IS WORKING');
                        evt.target.blur()
                    }, stealFocusDelay)
                }
            } // 		Capture only left-clicks, and check whether we want to ignore shift+click.
            if (!embeds[i].hasAttribute('KeybinderListenerAdded')) {
            embeds[i].addEventListener('click', listener);
            embeds[i].setAttribute('KeybinderListenerAdded',true);
            }
            else { console.log(embeds[i].getAttribute("id")+" already has a listener, skipping!"); }
        clickListeners[embeds[i].id] = listener; // Store a reference to the new listener for eventual removal.
    } 
    if (embeds.length < 1) {
        let body = document.getElementsByTagName("BODY")[0];
		if (!(body.hasAttribute("KeybinderListenerAdded"))) {
		body.addEventListener("DOMNodeInserted", checkAgain);
    	body.setAttribute("KeybinderListenerAdded",true);
    	}
	}
}

self.port.on("findPlugins", function findPlugins(workerInfo) {// Look for objects to modify.
workerID = workerInfo["ID"].toString();
checkPlugins(workerID);
});

self.port.on("removeDOMListener", function removeDOMListener() {
    let body = document.getElementsByTagName("BODY")[0];
	body.removeEventListener("DOMNodeInserted", checkAgain);
    body.removeAttribute("KeybinderListenerAdded");
    self.port.emit("disposeOfMinion", { "workerID": workerID }); // Useless worker will need to be... "handled."
});

self.port.on("removeMods", function removeMods(workerID) {
    for (let i of Object.keys(clickListeners)) {
        document.getElementById(i).removeEventListener('click', clickListeners[i]);
        document.getElementById(i).removeAttribute('KeybinderListenerAdded');
    }
		self.port.emit("noEmbeds", { "ID": workerID, "checkAgain": false } );
});
