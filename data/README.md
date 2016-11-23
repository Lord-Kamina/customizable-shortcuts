# Keybinder

*Keybinder has been updated!*

This Firefox add-on allows the user to customize various shortcuts, as well as completely disable the ones he doesn't like.
It is based (and a large part of the code) was originally written by Tim Taubert for the "Customizable Shortcuts" add-on that can be found here: https://addons.mozilla.org/en-US/firefox/addon/customizable-shortcuts/
After much work and, at one point trying to contribute to the original project but being unable to reconcile all the changes I made with the original author, I decided to release my own branch of the extension.

This extension supports localization, if you are fluent in a language other than English or Spanish, you can help at <https://www.babelzilla.org/index.php?option=com_wts&Itemid=88&type=lang&extension=5755>,
No coding knowledge required.

## Current Version
    - Version: 2.0.0
    - Date: 2016-11-23
    - Official Releases @ AMO: <https://addons.mozilla.org/en-US/firefox/addon/keybinder>
    - Support site: <https://github.com/Lord-Kamina/keybinder>

## Known Issues
+ Certain commands can only be disabled, not remapped (So far: "Hide Firefox" and "Hide Others" in macOS)

## TO DO
+ Port the bug-78414 workaround to MutationObserver.
+ Add missing strings to existing localizations.
+ Various Localizations

# Release Notes

[[toc]]

## [2.0.0] - 2016-11-23

+ ### Added
  + At the request of many, added an optional (and experimental) feature to create custom XUL keys, which can then be assigned to shortcuts in the usual way. As of now, I have limited these custom keys to commands already defined in the Firefox commandset (i.e., no custom javascript).
  + Implemented a multi-pass mode that makes the "Steal focus" feature more robust, specifically, it can now be configured to scan a site more than once, allowing it to deal with sites that use scripting to create embeds after page-loading has completed (Reported by Randy\_Sinn on http://www.pooq.co.kr)
  + Initial German Localization (by undef-labs, needs some updating).	

+ ### Changed
  + Besides the Tools menu and the extensions preferences, the mappings dialog can now also be accessed via a toolbar button.
  + Add "Quit" and "Preferences" shortcuts when not defined normally.
  + Moved several previously uncategorized shortcuts into their proper groups. Removed duplicate shortcuts in more than one group.
  + Completely re-factored the way keypresses are parsed, in order to make handling more robust. Now using KeyboardEvent.keyCode and KeyboardEvent.code when the former is unavailable, thus bringing back support for dead keys, among other things.
  + Shortcut mappings will now be stored alongside the rest of preferences. The extension will detect previously added shortcuts and convert them automatically when updating.
  
+ ### Fixed
  + Implemented proper sizes for all icons.
  + Fixed bug caused by obsolete keycode VK\_ENTER.	
  + Made the release notes into a more workable format.
  + Windows.getMostRecentWindow() sometimes returned an incorrect window, which caused odd-behavior in some commands like selecting a specific tab; to fix this we now use the low-level API. (Original bug reported by Rami El Khatib)
  + Fixed sorting in the main shortcut dialog.
  + Fixed disabling and remapping of shortcuts defined only by menu items.
  + Fixed bug with disabling keys: All keys should now be re-enabled when the extension unloads.
  + Loads of smaller bug-fixes.

## [1.3.0] - 2016-04-11
+ ### Changed
  + Changed the way AltGraph is handled: In Linux, it's a distinct modifier. In Windows it's Control+Alt.
  + Finally removed dependence on the deprecated window-utils API.

+ ### Fixed
  + Fixed a bug caused by modifying and using shortcuts defined only by a menuitem (Copy, Cut, Paste, etc.), these now work correctly.
	
## [1.2.60] - 2016-03-28
+ ### Added
  + URL Patterns dialog now closable (without saving) by pushing Escape or Ctrl(Cmd on Mac)+W
  + URL Pattern dialog will now close and save changes by pressing Ctrl(Cmd on Mac)+Enter.
  + e10s support. The extension now officially supports multi-process firefox.

+ ### Changed
  + Textbox on URL Patterns dialog now selected by default.

+ ### Fixed
  + Changed problematic "exports" syntax.
  + Small cleanups and removed some deprecated function calls.
  + Fixed Application Icon.
  + Fixed regression that caused an error on Windows.

## [1.2.41] - 2016-03-24
+ ### Fixed
  + Get rid of deprecated expression closures.
  + Some refactoring and simplification of the code that manages listeners and opening new windows to fix the script becoming stumped if Firefox was left open but without any windows.
	
## [1.2.3] - 2016-03-23
+ ### Fixed
  + Squash a bug that would cause the extension to throw if a new window was opened while the shortcuts configuration window was also open.

## [1.2.2] - 2016-03-22

+ ### Changed
  + Consolidated locales in a single folder for compatibility with BabelZilla.

## [1.2.1] - 2016-03-21

*This version implements several bug-fixes as well as some changes and additions and several of the updates Tim Taubert had made to his add-on between the time I branched my fork and when he decided to discontinue it.*

+ ### Added
  + Added some new key labels and modified groupings somewhat.
  + Added accesskeys to the buttons in the main configure dialog, to improve user experience and keyboard-friendliness.
  + The dialog now supports several keyboard shortcuts for various tasks:
	  + Activate the filter by pressing Ctrl(Cmd on Mac)+F
	  + Clear the filter by pressing Escape
	  + Edit a shortcut by selecting it with the mouse or arrow keys and pressing Enter.
	  + Cancel editing a shortcut by pressing Escape
	  + Close the dialog by pressing Escape or Ctrl(Cmd on Mac)+W

+ ### Changed
  + The main dialog is now accessible (in addition to the usual place) from the extension preferences interface.
  + Added some new key labels and modified groupings somewhat.
  + More robust handling of modifiers, support for OS and AltGr modifiers.
  + Give platform-appropriate name to the "Meta" key.
  + When editing a shortcut, Keybinder will now automatically update it once it detects it's a valid shortcut.
  + Due to incompatibility in handling and storing shortcut definitions with Quicksaver's extension, Keybinder will now completely ignore Tab Groups on Firefox 45+.
		
+ ### Fixed
  + Fixed incorrect JSON parsing of URL Patterns preference that was causing Keybinder to throw.
  + Fixed a check in the pageMod code to prevent an occasional error.
  + Several issues with incorrect modifiers being read on some platforms.
	
## [1.1.2] - 2016-03-09
+ ### Fixed
  + Fixed an incorrect path in overlay.js that was causing an error.
  + Fixed compatibility with Firefox 45: If version is 45 or higher, the extension excludes the code targeting Tab Groups, UNLESS the TabGroups extension is also installed.

## [1.1.1] - 2014-09-16
+ ### Changed
  + Due to the way onKeyDown works, the extension will ignore dead keys and some international characters that ended up being represented as "null" and preventing the extension from working properly.
	
+ ### Fixed
  + Fixed bug when opening the shortcut dialog when already open; now, it focuses the window instead of trying to recreate it.
  + Same thing for URL patterns in the extension manager.
  + Clean-up script wasn't getting rid of menu items.
  + Prevent the extension from adding redundant menu items.

## [1.1] - 2014-08-19
+ ### Changed
  + Renamed Extension and changed icon.
  + As per the original add-on, changed to MPL 2.0.
  + Added sanity checks and a more robust interface for adding URLS to be scanned for plugins.
  + All changes to settings should now be applied immediately to open pages, as soon as they are made.
	
+ ### Fixed
  + Improved the flexibility and robustness of the content-scripts
  + Improved the code and handling of workers.
  + Make sure they actually get removed once they're not being used anymore.

## [1.0] - 2014-01-20
+ ### Added
  + Detects, color codes and warns conflicting shortcuts.
  + Added supports for a few of the shortcuts with no ID.
  + Added Private-Browsing support (although, to make sure we don't write to disk during Private Browsing, the Tools menu will only display the addon on non-Private windows)
  + Added work-around for bug 78414.
  + Added work-around for bug 406199.

+ ### Changed
  + Moved Key Mappings to its own dialog, under Tools Menus.
  + The extension should now be localizable.

+ ### Fixed
  + Fixed the configuration dialog search.
  + Prevent the extension from mapping unknown non-US keys to shortcuts (tildes, accents, etc.)
  + Several other minor changes and fixed from the original extension.
