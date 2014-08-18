/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */



let {Windows} = require("../util/windows.js");
var mainCommandSet = Windows.getElementById("mainCommandSet");
var mainKeyset = Windows.getElementById("mainKeyset");
var _ = require("sdk/l10n").get;

if (!Windows.getElementById("Browser:NextTab")) var cmd1 = Windows.createXulElement("command", { // <command id="Browser:NextTab" oncommand="gBrowser.tabContainer.advanceSelectedTab(1, true);"/>
    "id": "Browser:NextTab",
    "oncommand": "gBrowser.tabContainer.advanceSelectedTab(1, true);"
}, mainCommandSet);

if (!Windows.getElementById("Browser:PrevTab")) var cmd2 = Windows.createXulElement("command", { // <command id="Browser:PrevTab" oncommand="gBrowser.tabContainer.advanceSelectedTab(-1, true);"/>
    "id": "Browser:PrevTab",
    "oncommand": "gBrowser.tabContainer.advanceSelectedTab(-1, true);"
}, mainCommandSet);

if (!Windows.getElementById("Browser:CloseOtherTabs")) var cmd3 = Windows.createXulElement("command", { // <command id="Browser:CloseOtherTabs" oncommand="gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);"/>
    "id": "Browser:CloseOtherTabs",
    "oncommand": "gBrowser.removeAllTabsBut(gBrowser.mCurrentTab);"
}, mainCommandSet);

if (!Windows.getElementById("key_nextTab")) var key1 = Windows.createXulElement("key", { // <key id="key_nextTab" keycode="VK_TAB" command="Browser:NextTab" modifiers="accel"/>
    "id": "key_nextTab",
    "keycode": "VK_TAB",
    "command": "Browser:NextTab",
    "modifiers": "control"
}, mainKeyset);

if (!Windows.getElementById("key_prevTab")) var key2 = Windows.createXulElement("key", { // <key id="key_prevTab" keycode="VK_TAB" command="Browser:PrevTab" modifiers="accel,shift"/>
    "id": "key_prevTab",
    "keycode": "VK_TAB",
    "command": "Browser:PrevTab",
    "modifiers": "control,shift"
}, mainKeyset);

if (!Windows.getElementById("key_closeOther")) var key3 = Windows.createXulElement("key", { // <key id="key_closeOther" key="W" command="Browser:CloseOtherTabs" modifiers="control,alt"/>
    "id": "key_closeOther",
    "key": _("closeCmd_key"),
    "command": "Browser:CloseOtherTabs",
    "modifiers": "control,alt"
}, mainKeyset);
