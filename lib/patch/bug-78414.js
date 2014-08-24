/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var extensionPrefs = require("sdk/simple-prefs");
var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var pageModObject = {};
var placeholder = "*.this-shouldnevermatchanything.com";
var uuid = require("sdk/util/uuid");
let {Windows} = require("../util/windows");
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
                worker.port.emit("findPlugins", workerID);
                worker.port.on("noEmbeds", function(payload) {
                    if ( !! payload['number']) {
                        let workerID = payload.number;
                    } else {
                        let workerID = payload;
                    }
                    worker.destroy(workerID.number)
                });

                worker.port.on("removedListener", function(payload) {
                    let id = payload.id;
                    let listener = payload.listener;
                });
                worker.on('detach', function(worker) {
                    delete pageWorkers[workerID.number]; // Kill useless workers.
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
                "stealFocusDelay": extensionPrefs.prefs['stealFocusDelay']
            }
        });

        extensionPrefs.on('domainUrlPattern', function() {
            changedUrlPattern = true;
            extensionPrefs.prefs['overridePluginFocus'] = false
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
        pageModObject.destroy()
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
