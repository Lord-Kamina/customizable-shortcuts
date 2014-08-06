/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */



const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const WINDOW_TYPE = "navigator:browser";

let winUtils = require("sdk/deprecated/window-utils");
let windowIterator = winUtils.windowIterator;
let listeners = [];
let Overlays = require("core/overlay.js").Overlays;

new winUtils.WindowTracker({
    onTrack: function(window) {
        if (WINDOW_TYPE == window.document.documentElement.getAttribute("windowtype")) {

            listeners.forEach(function(listener) {
                window.addEventListener(listener.type, listener.callback, false);
            });
            Overlays._overlays && Windows.disableKeys();
        }
    },

    onUntrack: function(window) {
        if (WINDOW_TYPE == window.document.documentElement.getAttribute("windowtype")) {
            listeners.forEach(function(listener) {
                window.removeEventListener(listener.type, listener.callback, false);
            });
        }
    }
});


let Windows = {
    addEventListener: function(type, callback) {
        for (let window in windowIterator())
        window.addEventListener(type, callback, false);

        listeners.push({
            type: type,
            callback: callback
        });
    },

    removeEventListener: function(type, callback) {
        for (let window in windowIterator())
        window.removeEventListener(type, callback, false);

        listeners = listeners.filter(function(listener) {
            return !(type == listener.type && callback == listener.callback);
        });
    },

    toggleKey: function(key, state) {
        let id = "#" + key;
        for (let window in windowIterator()) {
            if (WINDOW_TYPE == window.document.documentElement.getAttribute("windowtype")) {
                let keyToToggle = window.document.documentElement.querySelector(id);
                keyToToggle.setAttribute("disabled", state);
                console.warn("DEBUG: State of key " + key + "'s disabled attribute has been set to " + keyToToggle.getAttribute("disabled"));
            }
        }
    },

    disableKeys: function() {
        let disabledOverlay = Object.keys(Overlays.overlays.disabled);

        if (disabledOverlay.length > 0) {
            let disabledSelector = "#" + disabledOverlay.join(", #");

            for (let window in windowIterator()) {
                if (WINDOW_TYPE == window.document.documentElement.getAttribute("windowtype")) {
                    let disabledKeys = window.document.documentElement.querySelectorAll(disabledSelector);

                    for (let dkey = 0; dkey < disabledKeys.length; dkey++) {
                        disabledKeys[dkey].setAttribute("disabled", "true");
                        console.warn("DEBUG: State of key " + disabledKeys[dkey].id + "'s disabled attribute has been set to " + disabledKeys[dkey].getAttribute("disabled"));

                    }
                }
            }
        }
    },

    getMostRecentWindow: function() {
        return winUtils.activeBrowserWindow;
    },
    getElementById: function(id) {
        return this.getMostRecentWindow().document.getElementById(id);
    },

    querySelector: function(sel) {
        return this.getMostRecentWindow().document.querySelector(sel);
    },

    querySelectorAll: function(sel) {
        return this.getMostRecentWindow().document.querySelectorAll(sel);
    },

    createEvent: function(type) {
        return this.getMostRecentWindow().document.createEvent(type);
    },

    createXulElement: function(tagName, attrs, parent) {
        let element = this.getMostRecentWindow().document.createElementNS(XUL_NS, tagName);

        if (attrs) {
            for (let name in attrs)
            element.setAttribute(name, attrs[name]);
        }

        if (parent) parent.appendChild(element);

        return element;
    }
};

exports.Windows = Windows;
