/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */
	var clickListeners = {};

self.port.on("findPlugins", function(workerID) { // Look for objects to modify.
    var cssSelectors = self.options.cssSelectors;
    var embeds = (document.querySelectorAll(cssSelectors) || []);
    // embeds && console.warn("DEBUG:	queryselectorall: "+embeds.length);
    for (let i = 0; i < (embeds.length || 0); i++) {
        console.warn("DEBUG:	Embed: " + embeds[i]);
        if (embeds[i].hasAttribute("onClick")) { // If we've already got an onClick, make sure to save it in case the user wants to disable this feature.
            // console.warn("DEBUG:	Item already has onClick property, copying it for reference later.");
            embeds[i].setAttribute("onClickOriginal", embeds[i].getAttribute("onClick"));
        }
        embeds[i].setAttribute("onClick", "this.blur()");

    }
    if (embeds.length < 1) {

        // console.warn ("DEBUG:	Worker ID: "+workerID.number+" found no objects to work on; reporting to addon.");
        self.port.emit("noEmbeds", workerID);


    }

});

self.port.on("removeMods", function removeMods() {
    var cssSelectors = self.options.cssSelectors;
    var embeds = (document.querySelectorAll(cssSelectors) || []);
    embeds && console.warn("DEBUG:	queryselectorall: " + embeds.length);

    for (let i = 0; i < (embeds.length || 0); i++) {

        // console.warn("DEBUG:	Removing mod from Embed: "+embeds[i]);
        embeds[i].removeAttribute("onClick");
        if (embeds[i].hasAttribute("onClickOriginal")) {
            // console.warn("DEBUG:	Item had a previous onClick function, restoring it.");
            embeds[i].setAttribute("onClick", embeds[i].getAttribute("onClickOriginal")); // Restore original function, if available.
            embeds[i].removeAttribute("onClickOriginal");
        }
        // self.port.emit("revertedChanges",[ embeds[i].tagName, embeds[i].id, document.URL ])
    }

});
