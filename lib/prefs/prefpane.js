/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
var { Windows } = require("../util/windows");

const keys = require("../core/key");
const { Overlay, Overlays } = require("../core/overlay");
const { PreferenceTree } = require("../prefs/tree");
const utils = require("sdk/window/utils");
const events = require("sdk/system/events");
const { Cc,Ci } = require("chrome");
var _ = require("sdk/l10n").get;

const extensionPrefs = require("sdk/simple-prefs");
const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

function occurrences(string, subString, allowOverlapping) {
    /** Function count the occurrences of substring in a string;
     * @param {String} string   Required. The string;
     * @param {String} subString    Required. The string to search for;
     * @param {Boolean} allowOverlapping    Optional. Default: false;
     */
    string += "";
    subString += "";
    if (subString.length <= 0) return string.length + 1;

    var n = 0,
        pos = 0;
    var step = (allowOverlapping) ? (1) : (subString.length);

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            n++;
            pos += step;
        } else break;
    }
    return (n);
}

function ValidURL(str) {
    var strictPattern = new RegExp(/^((https?:\/\/(?!\*))|(\*\.))((([a-z\d]([a-z\d-]*[a-z\d])*|(\*))\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i); // Strict URL matching pattern.
    var commonError_1 = new RegExp(/(^https?:\/\/){0}(\d{1,3}\.){3}\d(\:\d{2,5})?/i); // Catch IP without protocol, will try prepending 'http://' before failing. 
    var commonError_2 = new RegExp(/^(https?:\/\/){0}([-a-z\d%_~+]{2,})\.([a-z-_]){2,}([0-9])*(\/|\:)?/i) // Catch domain.tld without protocol or wildcard; // will try prepending '*.' before failing.
    if ("" == str) {
        return false;
    }
    if (occurrences(str, '*') > 1) {
        return false;
    }
    if ('*' == str) {
        return str;
    } else if (!strictPattern.test(str)) {
        if (true == commonError_1.test(str)) {
            return String.concat("http://", str);
        } else if (true == commonError_2.test(str)) {
            return String.concat("*.", str);
        } else {
            return false;
        }
    } else {
        return str;
    }
}

function MenuItem(window, kind) {
	if (!utils.isBrowser(window)) { return } // Catch non-browser windows.
    this.window = window;
    if ("tabSwitching" == kind) {
		if (this.window.document.getElementById("prevTab-command")) { return; } // Prevent creating duplicate menu items.
        let parentmenu = this.window.document.getElementById("windowPopup");
        if (!parentmenu) { return; } // Only add the menu items if the Windows menu exists.
        let windowsep = this.window.document.getElementById("sep-window-list");
        this.separator = this._createElement("menuseparator");
        parentmenu.insertBefore(this.separator, windowsep);
        this.separator.setAttribute("id", "sep-switch-tabs");

        this.prevtab = this._createElement("menuitem");
        parentmenu.insertBefore(this.prevtab, this.separator.nextSibling);
        this.prevtab.setAttribute("id", "prevTab-command");
        this.prevtab.setAttribute("command", "Browser:PrevTab");
        this.prevtab.setAttribute("label", _("previousTab_label"));

        this.nexttab = this._createElement("menuitem");
        parentmenu.insertBefore(this.nexttab, this.prevtab.nextSibling);
        this.nexttab.setAttribute("id", "nextTab-command");
        this.nexttab.setAttribute("command", "Browser:NextTab");
        this.nexttab.setAttribute("label", _("nextTab_label"));
    } else {
        let self = this;
		if (this.window.document.getElementById("ttshortcutsMenuItem")) { return; } // Prevent creating duplicate menu items.
        this.element = this._createElement("menuitem");
        this.element.setAttribute("id", "ttshortcutsMenuItem");
        this.element.setAttribute("class", "menu-iconic");
        this.element.setAttribute("image", require("sdk/self").data.url("icon32.png"));
        this.element.setAttribute("label", _("MenuItem_label"));
        this.element.setAttribute("insertBefore", "sanitizeSeparator");
        this.element.setAttribute("oncommand", "if (!Cc[\"@mozilla.org/appshell/window-mediator;1\"]            .getService(Ci.nsIWindowMediator).getMostRecentWindow('Keybinder:config')) { window.openDialog('chrome://keybinder/content/ttShortcuts_preferences.xul','Keybinder','chrome,titlebar=yes,close=no,toolbar=no,centerscreen,dialog=yes') } else { Cc[\"@mozilla.org/appshell/window-mediator;1\"]            .getService(Ci.nsIWindowMediator).getMostRecentWindow('Keybinder:config').focus() }");
        let parentmenu = this.window.document.getElementById("menu_ToolsPopup");
        parentmenu.appendChild(this.element);
    }
}

MenuItem.prototype = {
    _built: false,

    _createStylesheet: function(href) {
        let doc = this.window.document;
        let style = doc.createProcessingInstruction("xml-stylesheet", 'href="' + href + '"');
        doc.insertBefore(style, doc.querySelector("window"));
    },

    _createElement: function(tag, parent) {
        let element = this.window.document.createElementNS(XUL_NS, tag);
        parent && parent.appendChild(element);
        return element;
    },

    _build: function() {
        return;
    },
};

function warnforConflicting() {
    let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].
    getService(Ci.nsIPromptService);
    prompts.alert(window, _("conflictWarning.title"), _("conflictWarning.text"));
}

let createNewMenuItem = exports.createNewMenuItem = function (window, kind) {
new MenuItem (window, kind);
}

events.on("toplevel-window-ready",function(event) {
	event.subject.setTimeout(function() {
		let id = event.subject.window.document.documentElement.getAttribute("id");
		if ("ttShortcutsPrefsDialog" == id) {
			preferenceDialogInit(event.subject.window);
		}
		else if ("urlPatternsDialog" == id) {
            window.validateUrls = function() {
                let tempArray = (window.document.getElementById("textbox").value).split('\n');
                let arraySize = tempArray.length;
                let i = 0;
                for (let l of tempArray) {
                    if (!ValidURL(l)) {
                        tempArray[i] = "";
                    } else {
                        tempArray[i] = ValidURL(l);
                    }
                    i++;
                }
                tempArray = tempArray.filter(function(i) {
                    return i != ""
                });
                extensionPrefs.prefs['domainUrlPattern'] = JSON.stringify(tempArray);
            }
		}
},7);
}, true);

extensionPrefs.on("UrlPatternsDialog", function() {
if (!Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow('Keybinder:URLPatterns')) {    Windows.getMostRecentWindow().openDialog('chrome://keybinder/content/urlpatterns.xul', 'UrlPatterns', 'chrome,titlebar=yes,close=no,toolbar=no,centerscreen,dialog=yes', (JSON.parse(extensionPrefs.prefs['domainUrlPattern'])).join("\n"));
    } else { Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow('Keybinder:URLPatterns').focus(); } 
});

extensionPrefs.on("ShortcutsDialog", function() {
if (!Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow('Keybinder:config')) {
Windows.getMostRecentWindow().openDialog('chrome://keybinder/content/ttShortcuts_preferences.xul','Keybinder','chrome,titlebar=yes,close=no,toolbar=no,centerscreen,dialog=yes') } else {
Cc["@mozilla.org/appshell/window-mediator;1"]            .getService(Ci.nsIWindowMediator).getMostRecentWindow('Keybinder:config').focus(); }
});

function preferenceDialogInit (window) {
let {TreeView} = require("../prefs/treeview");
    let self = this;
    this.window = window;
    this.filter = this.window.document.getElementById("ttCustomizableShortcuts_Filter");
    this.resetButton = this.window.document.getElementById("ttCustomizableShortcuts_Reset");
    this.editButton = this.window.document.getElementById("ttCustomizableShortcuts_Edit");
    this.disableButton = this.window.document.getElementById("ttCustomizableShortcuts_Disable");
    this.acceptButton = this.window.document.getElementById("ttCustomizableShortcuts_Accept");

    let tree = new PreferenceTree(this.window);
    this.treeElement = tree.toElement();
    this.window.setTimeout(function() { self.treeElement.view = new TreeView(), 0});
    
    this.acceptButton.addEventListener("command", function() {
        var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
        if ("undefined" != typeof(Overlays.overlays.conflicting)) {
            let checkForConflicting = Object.keys(Overlays.overlays.conflicting).length;
            if (checkForConflicting >= 1) warnforConflicting();
            else windowMediator.getMostRecentWindow("Keybinder:config").window.close();
        } else windowMediator.getMostRecentWindow("Keybinder:config").window.close();
    }, false);

    this.resetButton.addEventListener("command", function() {
        let row = self.treeElement.currentIndex;
        let column = self.treeElement.columns.getLastColumn();
        let id = self.treeElement.view.getCellValue(row, column);
        let key = keys.find(id);
        Overlays.removeByKey(key);
        self.resetButton.setAttribute("disabled", true);
        self.treeElement.treeBoxObject.invalidateRow(row);
    }, false);

    this.editButton.addEventListener("command", function() {
        let row = self.treeElement.currentIndex;
        let column = self.treeElement.columns.getLastColumn();
        self.treeElement.startEditing(row, column);
    }, false);

    this.disableButton.addEventListener("command", function() {
        let row = self.treeElement.currentIndex;
        let column = self.treeElement.columns.getLastColumn();
        let id = self.treeElement.view.getCellValue(row, column);
        let key = keys.find(id);
        if (!Overlays.findByDisabledKey(key)) {
            new Overlay({
                key: key,
                shortcut: {
                    disabled: true
                }
            });
            self.disableButton.label = _("disableButton_true");
            self.disableButton.acesskey = _("disableButton_true_key");
            self.treeElement.treeBoxObject.invalidateRow(row);
        } else {
            Overlays.removeByKey(key);
            self.disableButton.label = _("disableButton_false");
            self.disableButton.acesskey = _("disableButton_false_key");
		    self.treeElement.treeBoxObject.invalidateRow(row);
    }

    let isDisabled = ( !! Overlays.findByDisabledKey(key)).toString();
Windows.toggleKey(key, isDisabled);
}, false);

this.filter.addEventListener("command", function() {
    self.treeElement.view = new TreeView(self.filter.value);
}, false);
}