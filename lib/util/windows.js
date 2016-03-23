/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {Cc, Ci} = require("chrome");
const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const winUtils = require("sdk/deprecated/window-utils");
const utils = require("sdk/window/utils");
const windowIterator = winUtils.windowIterator;
const keys =  require("../core/key"); 
const system = require("sdk/system");
const {Overlays} = require("../core/overlay");
const {Shortcut} = require("../core/shortcut");
if (45 > system.version) { var bug645371 = require("../patch/bug-645371"); }
else console.log("Firefox 45.0 or newer detected, excluding patch for bug-645371.")
var bug406199 = require("../patch/bug-406199");

let Windows = {
handleKeyPress: function (event) {
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
},
    addEventListener: function(type, callback) {
    const prefpane = require("../prefs/prefpane");
        for (let window of utils.windows(null, {includePrivate:true})) {
        if ("undefined" != typeof(bug645371)) { bug645371.applyPatch(utils.getToplevelWindow(window)); }
        if ("undefined" != typeof(bug406199)) { bug406199.applyPatch(utils.getToplevelWindow(window)); }
                if ("main-window" == window.document.documentElement.getAttribute("id")) {
            if (!require("sdk/private-browsing").isPrivate(utils.getToplevelWindow(window))) {// Do not allow access to preferences in Private Windows.          
				prefpane.createNewMenuItem(window);	
        	}
        }
        window.addEventListener(type, callback, false);

        listeners.push({
            type: type,
            callback: callback
        });
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

        listeners = listeners.filter(function(listener) {
            return !(type == listener.type && callback == listener.callback);
        });       
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

    getMostRecentWindow: function() {
        return winUtils.activeBrowserWindow;
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

    createXulElement: function(tagName, attrs, parent) {
        let element = Windows.getMostRecentWindow().document.createElementNS(XUL_NS, tagName);

        if (attrs) {
            for (let name in attrs)
            element.setAttribute(name, attrs[name]);
        }

        if (parent) parent.appendChild(element);

        return element;
    }   
};

new winUtils.WindowTracker({
    onTrack: function(window) {
        if (utils.isBrowser(window)) {
            Windows.addEventListener("keydown", Windows.handleKeyPress, false);
            Overlays._overlays && Windows.disableKeys();
        }
    },

    onUntrack: function(window) {
        if (utils.isBrowser(window)) {
                Windows.removeEventListener("keydown", Windows.handleKeyPress, false);
        }
    }
});

exports.Windows = Windows;
