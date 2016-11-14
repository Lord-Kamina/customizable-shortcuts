/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Cc, Ci } = require("chrome");

let windowMediator = exports.windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

let prompterService = exports.prompterService = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);

let keys = exports.keys = Ci.nsIDOMKeyEvent;

var _ = require("sdk/l10n").get;

let unusableKeys = exports.unusableKeys = [
"tabGroups-key-tabView",
"tabGroups-key-nextGroup",
"tabGroups-key-previousGroup",
"key_hideThisAppCmdMac",
"key_hideOtherAppsCmdMac",


];

let GROUPS = exports.GROUPS = {
		"Application": ["key_quitApplication", "key_openHelpMac", "key_openHelp", "key_preferencesCmdMac", "key_hideThisAppCmdMac", "key_hideOtherAppsCmdMac"],
        "Navigation": ["goBackKb", "goBackKb2", "goForwardKb", "goForwardKb2", "goHome", "openFileKb", "key_reload", "key_reload2", "key_forceReload", /*"Ctrl+F5", Ctrl+Shift+R,*/ "key_stop", "key_stop_mac", "focusURLBar", "focusURLBar2"],

        "CurrentPage": [ /*"End", "F6", "Shift+F6",*/ "goHome", "key_viewInfo", "key_viewSource", "printKb", "key_savePage", "key_fullZoomEnlarge", "key_fullZoomReduce", "key_fullZoomReset", "key_fullScreen", "key_fullScreen_old", "key_minimizeWindow", "key_toggleMute","key_switchTextDirection"],

        "Editing": ["key_copy", "key_cut", "key_delete", "key_paste", "key_redo", "key_selectAll", "key_undo"],

        "Search": ["key_find", "key_findAgain", "key_findPrevious", "key_search", "key_search2", "key_findSelection"],

        "WindowsTabs": ["key_close", "key_closeWindow", "key_closeOther", "key_newNavigatorTab", "key_newNavigator", "key_undoCloseTab", "key_undoCloseWindow", "key_selectTab1", "key_selectTab2", "key_selectTab3", "key_selectTab4", "key_selectTab5", "key_selectTab6", "key_selectTab7", "key_selectTab8", "key_selectLastTab", "key_tabview", "key_nextTabGroup", "key_previousTabGroup", "key_prevTab", "key_nextTab","key_showAllTabs"],

        "BookmarksHistory": ["addBookmarkAsKb", "viewBookmarksSidebarKb", "viewBookmarksSidebarWinKb", "manBookmarkKb", "bookmarkAllTabsKb", "key_gotoHistory", "showAllHistoryKb"],

        "Tools": ["key_openDownloads", "key_openAddons", "key_privatebrowsing", "key_sanitize", "key_sanitize_mac"],
        
        "DeveloperTools": ["key_browserConsole",
    "key_webconsole", "key_errorConsole", "key_jsdebugger", "key_inspector",
    "key_styleeditor", "key_jsprofiler", "key_devToolbar", "key_responsiveUI",
    "key_scratchpad", "key_webide","key_devToolboxMenuItem","key_devToolboxMenuItemF12","key_browserToolbox","key_performance","key_netmonitor"],
    	"CustomXUL": []
       };
       
let LABELS = exports.LABELS = {
        "focusURLBar": _("focusURLBar_label"),
        "focusURLBar2": _("focusURLBar2_label"),
        "key_search": _("key_search_label"),
        "key_search2": _("key_search2_label"),
        "key_stop": _("key_stop_label"),
        "key_stop_mac": _("key_stop_mac_label"),
        "key_reload": _("key_reload_label"),
        "key_reload2": _("key_reload2_label"),
        "key_forceReload": _("key_forceReload_label"),
        "key_forceReload2": _("key_forceReload2_label"),
        "goHome": _("goHome_label"),
        "goBackKb": _("goBackKb_label"),
        "goBackKb2": _("goBackKb2_label"),
        "goForwardKb": _("goForwardKb_label"),
        "goForwardKb2": _("goForwardKb2_label"),
        "key_close": _("key_close_label"),
        "key_undoCloseTab": _("key_undoCloseTab_label"),
        "key_undoCloseWindow": _("key_undoCloseWindow_label"),
        "key_toggleAddonBar": _("key_toggleAddonBar_label"),
        "key_findPrevious": _("key_findPrevious_label"),
        "key_selectLastTab": _("key_selectLastTab_label"),
        "key_closeOther": _("key_closeOther_label"),
        "key_prevTab": _("key_prevTab_label"),
        "key_nextTab": _("key_nextTab_label"),
        "key_selectTab1": _("key_selectTab1_label"),
        "key_selectTab2": _("key_selectTab2_label"),
        "key_selectTab3": _("key_selectTab3_label"),
        "key_selectTab4": _("key_selectTab4_label"),
        "key_selectTab5": _("key_selectTab5_label"),
        "key_selectTab6": _("key_selectTab6_label"),
        "key_selectTab7": _("key_selectTab7_label"),
        "key_selectTab8": _("key_selectTab8_label"),
        "key_tabview": _("key_tabview_label"),
        "key_nextTabGroup": _("key_nextTabGroup_label"),
        "key_previousTabGroup": _("key_previousTabGroup_label"),
        "key_toggleMute": _("key_toggleMute_label"),
        "key_sanitize_mac": _("key_sanitize_mac_label"),
        "key_devToolboxMenuItemF12": _("key_devToolboxMenuItemF12_label"),
        "key_devToolboxMenuItem": _("key_devToolboxMenuItem_label"),
        "key_fullScreen_old": _("key_fullScreen_old_label"),
        "key_minimizeWindow": _("key_minimizeWindow_label"),
		"key_switchTextDirection": _("key_switchTextDirection_label"),
		"key_toggleMute": _("key_toggleMute_label"),
		"key_findSelection": _("key_findSelection_label"),		
		"key_webide": _("key_webide_label"),
		"focusChatBar": _("focusChatBar_label"),
        "key_firebug_toggleBreakOn": _("key_firebug_toggleBreakOn_label"),
        "key_firebug_detachFirebug": _("key_firebug_detachFirebug_label"),
        "key_firebug_closeFirebug": _("key_firebug_closeFirebug_label"),
        "key_firebug_focusCommandLine": _("key_firebug_focusCommandLine_label"),
        "key_firebug_toggleInspecting": _("key_firebug_toggleInspecting_label"),
        "key_foxyproxyquickadd": _("key_foxyproxyquickadd_label"),
        "key_changeproxy": _("key_changeproxy_label"),
        "secureLoginShortcut": _("secureLoginShortcut_label")
    };