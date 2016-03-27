/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

exports.applyPatch = function (window) {
  let { gBrowser, TabView, document } = window;

var _ = require("sdk/l10n").get;  
var mainCommandSet = document.getElementById("mainCommandSet");
var mainKeyset = document.getElementById("mainKeyset");

if (!document.getElementById("Browser:NextTab")) var cmd1 = createXulElement("command", { // <command id="Browser:NextTab" oncommand="gBrowser.tabContainer.advanceSelectedTab(1, true);"/>
    "id": "Browser:NextTab",
    "oncommand": "gBrowser.tabContainer.advanceSelectedTab(1, true);"
}, mainCommandSet);

if (!document.getElementById("Browser:PrevTab")) var cmd2 = createXulElement("command", { // <command id="Browser:PrevTab" oncommand="gBrowser.tabContainer.advanceSelectedTab(-1, true);"/>
    "id": "Browser:PrevTab",
    "oncommand": "gBrowser.tabContainer.advanceSelectedTab(-1, true);"
}, mainCommandSet);

if (!document.getElementById("Browser:CloseOtherTabs")) var cmd3 = createXulElement("command", { // <command id="Browser:CloseOtherTabs" oncommand="gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);"/>
    "id": "Browser:CloseOtherTabs",
    "oncommand": "gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);"
}, mainCommandSet);

if (!document.getElementById("key_nextTab")) var key1 = createXulElement("key", { // <key id="key_nextTab" keycode="VK_TAB" command="Browser:NextTab" modifiers="accel"/>
    "id": "key_nextTab",
    "keycode": "VK_TAB",
    "command": "Browser:NextTab",
    "modifiers": "control"
}, mainKeyset);

if (!document.getElementById("key_prevTab")) var key2 = createXulElement("key", { // <key id="key_prevTab" keycode="VK_TAB" command="Browser:PrevTab" modifiers="accel,shift"/>
    "id": "key_prevTab",
    "keycode": "VK_TAB",
    "command": "Browser:PrevTab",
    "modifiers": "control,shift"
}, mainKeyset);

if (!document.getElementById("key_closeOther")) var key3 = createXulElement("key", { // <key id="key_closeOther" key="W" command="Browser:CloseOtherTabs" modifiers="control,alt"/>
    "id": "key_closeOther",
    "key": _("closeCmd_key"),
    "command": "Browser:CloseOtherTabs",
    "modifiers": "control,alt"
}, mainKeyset);

  function createXulElement(tagName, attrs, parent) {
    let element = document.createElementNS(XUL_NS, tagName);

    if (attrs) {
      for (let name of Object.keys(attrs)) {
        element.setAttribute(name, attrs[name]);
      }
    }

    if (parent) {
      parent.appendChild(element);
    }

    return element;
  }
  require("../prefs/prefpane").createNewMenuItem(window, "tabSwitching"); // Add "Next/Previous Tab" items to the "Window" Menu.
};