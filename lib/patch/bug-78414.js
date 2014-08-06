/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tabs = require("sdk/tabs");
var extensionPrefs = require("sdk/simple-prefs");
var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var uuid = require("sdk/util/uuid");

pageWorkers = {};

var pageModObject = pageMod.PageMod({
    include: /.*swa.*/,
    contentScriptFile: self.data.url("bug-78414_content.js"),
    contentScriptWhen: "end",
    attachTo: ["existing", "top", "frame"],

    onAttach: function(worker) {
        let workerID = uuid.uuid();
        pageWorkers[workerID] = worker;

        worker.port.emit("findPlugins", workerID);
        worker.port.on("noEmbeds", function(workerID) {
            delete pageWorkers[workerID.number]; // Kill useless workers.
            // that sounded unnecessarily evil, didn't it?
        });
    },
    contentScriptOptions: {
        "cssSelectors": extensionPrefs.prefs['pluginCssSelectors'],
    }
});

function checkUrlPattern() {
    return extensionPrefs.prefs['domainUrlPattern'];
}

function togglePageMod() {
    var pageModCalledOnce = true;
    if (true == extensionPrefs.prefs['overridePluginFocus']) {
        extensionPrefs.on('domainUrlPattern', function() {
            pageModObject.include['0'] = checkUrlPattern()
        });
        extensionPrefs.on('pluginCssSelectors', function() {
            pageModObject.contentScriptOptions['cssSelectors'] = extensionPrefs.prefs['pluginCssSelectors']
        });
        pageModObject.include['0'] = checkUrlPattern();
    } else {
        pageModObject.include['0'] = /.*swa.*/;
        for (let worker of Object.keys(pageWorkers)) {
            pageWorkers[worker].port.emit("removeMods");
        }

        extensionPrefs.removeListener('domainUrlPattern', function() {
            pageModObject.include['0'] = checkUrlPattern()
        });
        extensionPrefs.removeListener('pluginCssSelectors', function() {
            pageModObject.contentScriptOptions['cssSelectors'] = extensionPrefs.prefs['pluginCssSelectors']
        });
    }

}

extensionPrefs.on("overridePluginFocus", togglePageMod);

if (("undefined" == typeof(pageModCalledOnce)) || (!pageModCalledOnce)) {
    togglePageMod();
}
