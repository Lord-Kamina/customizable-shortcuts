/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const sdkWindows = require("sdk/windows").browserWindows;
const { viewFor } = require("sdk/view/core");
const prefpane = require("../prefs/prefpane");
const utils = require("sdk/window/utils");
const keys =  require("../core/key"); 
const system = require("sdk/system");
const { Overlays } = require("../core/overlay");
const { Shortcut } = require("../core/shortcut");
const CustomXUL = require("../core/custom");
if (45 > system.version) { var bug645371 = require("../patch/bug-645371"); }
else console.log("Firefox 45.0 or newer detected, excluding patch for bug-645371.")
var bug406199 = require("../patch/bug-406199");
const extensionPrefs = require("sdk/simple-prefs");

var { PrefsTarget } = require("sdk/preferences/event-target");
var target = PrefsTarget({ branchName: "browser.ctrlTab" });

	target.on(".previews", function() {

		console.log("browser.ctrlTab.previews has been turned "+ (!!target.prefs[".previews"] ?  "on, we'll turn off our tab-switching feature in response.":"off, we'll turn on our tab-switching feature in response."));
		
		Windows.addEventListener(null,null,true);


	});

let Windows = exports.Windows = {

	implementCustomXUL: function () {
	    for (let window of utils.windows(null, {includePrivate:true})) {
	    	window = viewFor(window);
	    	if (utils.isBrowser(window)) {
	    		let customXulKeyset = window.document.querySelector("keyset[id='KeybinderCustomXUL']");
		    	while ((customXulKeyset || {}).lastChild) {
					customXulKeyset.removeChild(customXulKeyset.lastChild);
	    		}
	    	}
	    }
	    
		if (true == extensionPrefs.prefs["allowCustomXULKeys"]) {
		    for (let window of utils.windows(null, {includePrivate:true})) {
		    	window = viewFor(window);
		    	if (utils.isBrowser(window)) {

					if ("undefined" != typeof(customXulKeyset)) { let newKeyset = customXulKeyset }
					else { 
						let newKeyset = Windows.createXulElement("keyset",
						{"id":"KeybinderCustomXUL"},
						window.document.getElementsByTagName("window")[0],
						window
						);
					}
					for (let [mapKey, mapValue] of CustomXUL.allCustomKeys().entries()) {
		    			let newKeyset = window.document.querySelector("keyset[id='KeybinderCustomXUL']");
						let currentKey = Windows.createXulElement("key",
						{
							"id": mapValue.nsID(),
							"label":mapValue.getLabel(),
							"command":mapValue.getCommand(),
							"key":"",
							"modifiers":""
						},
						newKeyset,
						window);
					}
					
					let newKeyset = window.document.querySelector("keyset[id='KeybinderCustomXUL']");
					
				}
			}
		}
		extensionPrefs.prefs["keysMapDirty"] = true;
	},

	handleKeyPress: function (event) {

    	let shortcut = Shortcut.fromEvent(event);
		if (shortcut.isComplete()) { // check if this is a custom shortcut
		    let overlay = Overlays.findByCustomShortcut(shortcut);
		    if (overlay) {
		    	overlay.key.executeCommand();
		    	event.preventDefault();
    	    	event.stopPropagation();
    	    	}
		    else { // check if this is either an overridden or disabled shortcut.
// 		    	console.warn("Let's test for an overridden shortcut?")
		    	overlay = Overlays.findByOverriddenShortcut(shortcut) || Overlays.findByDisabledShortcut(shortcut);
    		    if (overlay) { // This shortcut has been disabled, so let's intercept it.
	        		event.preventDefault();
    	    		event.stopPropagation();
    			}	
    		}
    	}
	},
    addEventListener: function(type, callback, justRefreshTabSwitching = false) {
        for (let window of utils.windows(null, {includePrivate:true})) {
        if ("undefined" != typeof(bug645371)) { bug645371.applyPatch(utils.getToplevelWindow(window)); }
        if ("undefined" != typeof(bug406199)) { bug406199.applyPatch(utils.getToplevelWindow(window),!!(require('sdk/preferences/service').get("browser.ctrlTab.previews"))); }
                if ("main-window" == window.document.documentElement.getAttribute("id")) {
				prefpane.createNewMenuItem(window);	
        }
        if (false == justRefreshTabSwitching) { window.addEventListener(type, callback, false); } // Don't add listeners if we're just toggling tab-switching.
    }
    },

    removeEventListener: function(type, callback) {
        for (let window of utils.windows(null, {includePrivate:true})) {
        window.removeEventListener(type, callback, false);
        
        	for (let i of ["sep-switch-tabs","ttshortcutsMenuItem","prevTab-command","nextTab-command"]) {
				let node = window.document.getElementById(i);
				if (node) {
			  		node.parentNode.removeChild(node);
				}
			}    
        }       
     },

    toggleKey: function(key, state) {
        let id = "#" + key;
        for (let window of utils.windows(null, {includePrivate:true})) {
            if (utils.isBrowser(window)) {
                let keyToToggle = window.document.documentElement.querySelector(id);
                keyToToggle.setAttribute("disabled", state);
            }
        }
    },

    disableKeys: function() {
        let disabledOverlay = Object.keys(Overlays.overlays.disabled);
        if (disabledOverlay.length > 0) {
            let disabledSelector = "#" + disabledOverlay.join(", #");

            for (let window of utils.windows(null, {includePrivate:true})) {
                if (utils.isBrowser(window)) {
                    let disabledKeys = window.document.documentElement.querySelectorAll(disabledSelector);

                    for (let dkey = 0; dkey < disabledKeys.length; dkey++) {
                        disabledKeys[dkey].setAttribute("disabled", "true");
                    }
                }
            }
        }
    },
    
    enableKeys: function() {
        let disabledOverlay = Object.keys(Overlays.overlays.disabled);
        if (disabledOverlay.length > 0) {
            let disabledSelector = "#" + disabledOverlay.join(", #");

            for (let window of utils.windows(null, {includePrivate:true})) {
                if (utils.isBrowser(window)) {
                    let disabledKeys = window.document.documentElement.querySelectorAll(disabledSelector);

                    for (let dkey = 0; dkey < disabledKeys.length; dkey++) {
                        disabledKeys[dkey].setAttribute("disabled", "false");
                    }
                }
            }
        }
    },

    getMostRecentWindow: function() {
		return utils.getMostRecentBrowserWindow();
    },
    getElementById: function(id) {
        return Windows.getMostRecentWindow().document.getElementById(id);
    },

    querySelector: function(sel) {
        return Windows.getMostRecentWindow().document.querySelector(sel);
    },

    querySelectorAll: function(sel) {
        return Windows.getMostRecentWindow().document.querySelectorAll(sel);
    },

    createEvent: function(type) {
        return Windows.getMostRecentWindow().document.createEvent(type);
    },

    createXulElement: function(tagName, attrs, parent, window = null) {
        let element = (window || Windows.getMostRecentWindow()).document.createElementNS(XUL_NS, tagName);

        if (attrs) {
            for (let name in attrs)
            element.setAttribute(name, attrs[name]);
        }

        if (parent) { parent.appendChild(element); }

        return element;
    }   
};

sdkWindows.on("open",function (window) {
	window = viewFor(window);
	if (utils.isBrowser(window)) {
		Windows.implementCustomXUL();
		window.setTimeout(function () { 	
			Windows.addEventListener("keydown", Windows.handleKeyPress, false)
			Overlays._overlays && Windows.disableKeys();
		}
        ,8);
    }
});

sdkWindows.on("close",function (window) {
	window = viewFor(window);
	if (utils.isBrowser(window)) {
		window.removeEventListener("keydown", Windows.handleKeyPress, false);
    }
});