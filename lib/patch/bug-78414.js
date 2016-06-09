/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const extensionPrefs = require("sdk/simple-prefs");
const self = require("sdk/self");
const pageMod = require("sdk/page-mod");
var pageModObject = {};
var placeholder = "*.this-is-a-ridiculous-string-shouldnevermatchanything.com";
const uuid = require("sdk/util/uuid");
const { Windows } = require("../util/windows");

pageWorkers = {};
if ('undefined' == typeof(changedFocusDelay)) {
    var changedFocusDelay = false;
}
if ('undefined' == typeof(changedUrlPattern)) {
    var changedUrlPattern = false;
}

function checkUrlPattern() {
    return JSON.parse(extensionPrefs.prefs['domainUrlPattern']);
}

function togglePageMod() {
    if ('undefined' == typeof(pageModCalledOnce)) pageModCalledOnce = true;

    if (true == extensionPrefs.prefs['overridePluginFocus']) {
        pageModObject = pageMod.PageMod({
            include: checkUrlPattern(),
            attachTo: ['top', 'frame', 'existing'],
            contentScriptFile: self.data.url("bug-78414_content.js"),
            contentScriptWhen: "end",

            onAttach: function(worker) {
                let workerID = uuid.uuid();
                pageWorkers[workerID] = worker;
                console.warn("[ADDON SCRIPT] We Just generated a workerID UUID: "+workerID);
                worker.port.emit("findPlugins", { "ID" : workerID.toString() });
                
                worker.port.on("noEmbeds", function(payload) {
                    if ( !! payload['number']) {
                    console.warn("[ADDON SCRIPT] payload number exists?");
                        let workerID = payload.number;
                    } else {
                    	console.warn("[ADDON SCRIPT] Payload is: "+JSON.stringify(payload,null,2));
                        let workerID = payload['ID'];
                        console.warn("[ADDON SCRIPT] payload's workerID IS: "+workerID);
                    }
                    if (payload['checkAgain'] == true) {
						console.warn("[ADDON SCRIPT] Haven't yet reached the max number of tries, go again!");
	                   	worker.port.emit("findPlugins", { "ID" : workerID.toString() });
                    }
                    else {
                    	console.warn("[ADDON SCRIPT] And this time, we shouldn't keep looking...");
                    	worker.port.emit("removeDOMListener", { "ID" : workerID.toString() });
                    }
                });
                
                worker.port.on("disposeOfMinion", function(payload) {
						worker.destroy(workerID)
                });
                
                worker.on('detach', function(worker) {
                    delete pageWorkers[worker.number]; // Kill useless workers.
                    // that sounded unnecessarily evil, didn't it?
                    if (0 == Object.keys(pageWorkers).length) {
                        if (false == extensionPrefs.prefs['overridePluginFocus']) {
                            Windows.getMostRecentWindow().setTimeout(destroyPageMod, 0);
                        } // If turned off, and all workers already gone, destroy.
                    }
                });
            },
            contentScriptOptions: {
                "cssSelectors": extensionPrefs.prefs['pluginCssSelectors'],
                "shiftAllowFocus": extensionPrefs.prefs['shiftAllowFocus'],
                "stealFocusDelay": extensionPrefs.prefs['stealFocusDelay'],
                "pluginCrawlLimit": extensionPrefs.prefs['pluginCrawlLimit']
            }
        });

        extensionPrefs.on('domainUrlPattern', function() {
            changedUrlPattern = true;
            extensionPrefs.prefs['overridePluginFocus'] = false
        });
        extensionPrefs.on('pluginCrawlLimit', function() {
            pageModObject.contentScriptOptions['pluginCrawlLimit'] = extensionPrefs.prefs['pluginCrawlLimit']
        });
        extensionPrefs.on('pluginCssSelectors', function() {
            pageModObject.contentScriptOptions['cssSelectors'] = extensionPrefs.prefs['pluginCssSelectors']
        });
        extensionPrefs.on("stealFocusDelay", function() {
            changedFocusDelay = true;
            extensionPrefs.prefs['overridePluginFocus'] = false
        });
    }
    else if (false == extensionPrefs.prefs['overridePluginFocus']) {
        extensionPrefs.removeListener('domainUrlPattern', function() {
            changedUrlPattern = true;
            extensionPrefs.prefs['overridePluginFocus'] = false
        });
        extensionPrefs.removeListener('pluginCrawlLimit', function() {
            pageModObject.contentScriptOptions['pluginCrawlLimit'] = extensionPrefs.prefs['pluginCrawlLimit']
        });
        extensionPrefs.removeListener('pluginCssSelectors', function() {
            pageModObject.contentScriptOptions['cssSelectors'] = extensionPrefs.prefs['pluginCssSelectors']
        });
        extensionPrefs.removeListener("stealFocusDelay", function() {
            changedFocusDelay = true;
            extensionPrefs.prefs['overridePluginFocus'] = false
        });

        for (let worker of Object.keys(pageWorkers)) {
            pageWorkers[worker].port.emit("removeMods", pageWorkers[worker]);
        }
        if (0 == Object.keys(pageWorkers).length) {
           if (false == extensionPrefs.prefs['overridePluginFocus']) {
              Windows.getMostRecentWindow().setTimeout(destroyPageMod, 0);
           } // If turned off, and all workers already gone, destroy.
       }
    }
}

function destroyPageMod() {
    if ('undefined' != typeof(pageModObject)) {
	if ('undefined' != typeof(pageModObject.destroy)) { pageModObject.destroy() }
    }
    if (true == changedFocusDelay) {
        Windows.getMostRecentWindow().setTimeout(function() {
            changedFocusDelay = false;
            extensionPrefs.prefs['overridePluginFocus'] = true
        }, 0)
    }
    if (true == changedUrlPattern) {
        Windows.getMostRecentWindow().setTimeout(function() {
            changedUrlPattern = false;
            extensionPrefs.prefs['overridePluginFocus'] = true
        }, 0)
    }
}

extensionPrefs.on("overridePluginFocus", function() {
    togglePageMod()
});

if (("undefined" == typeof(pageModCalledOnce)) || (!pageModCalledOnce)) {
    togglePageMod();
}
