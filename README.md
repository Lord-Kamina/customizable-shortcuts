# Keybinder

This Firefox add-on allows the user to customize various shortcuts, as well as completely disable the ones he doesn't like.
It is based (and a large part of the code) was originally written by Tim Taubert for the "Customizable Shortcuts" add-on that can be found here: https://addons.mozilla.org/en-US/firefox/addon/customizable-shortcuts/
After much work and, at one point trying to contribute to the original project but being unable to reconcile all the changes I made with the original author, I decided to release my own branch of the extension.

- Version: 1.2.1
- Date: 2016-03-21
- Official site: <https://github.com/Lord-Kamina/keybinder>

## Changes
#### Version 1.2.1

This version implements several bug-fixes as well as some changes and additions and several of the updates Tim Taubert had made to his add-on between the time I branched my fork and when he decided to discontinue it.

* Bug fixes
	- Fixed incorrect JSON parsing of URL Patterns preference that was causing Keybinder to throw.
	- Fixed a check in the pageMod code to prevent an occasional error.
	- Several issues with incorrect modifiers being read on some platforms.
* Changes/Additions
	- The main dialog is now accessible (in addition to the usual place) from the extension preferences interface.
	- Added some new key labels and modified groupings somewhat.
	- More robust handling of modifiers, support for OS and AltGr modifiers.
	- Give platform-appropriate name to the "Meta" key.
	- Added accesskeys to the buttons in the main configure dialog, to improve user experience and keyboard-friendliness.
	- The dialog now supports several keyboard shortcuts for various tasks:
		- Activate the filter by pressing Ctrl(Cmd on Mac)+F
		- Clear the filter by pressing Escape
		- Edit a shortcut by selecting it with the mouse or arrow keys and pressing Enter.
		- Cancel editing a shortcut by pressing Escape
		- Close the dialog by pressing Escape or Ctrl(Cmd on Mac)+W
	- When editing a shortcut, Keybinder will now automatically update it once it detects it's a valid shortcut.
	- Due to incompatibility in handling and storing shortcut definitions with Quicksaver's extension, Keybinder will now completely ignore Tab Groups on Firefox 45+.

#### Version 1.1.2
* Bug fixes
	- Fixed an incorrect path in overlay.js that was causing an error.
	- Fixed compatibility with Firefox 45: If version is 45 or higher, the extension excludes the code targeting Tab Groups, UNLESS the TabGroups extension is also installed.

#### Version 1.1.1
* Multiple bug fixes
	- Fixed bug when opening the shortcut dialog when already open; now, it focuses the window instead of trying to recreate it.
	- Same thing for URL patterns in the extension manager.
	- Clean-up script wasn't getting rid of menu items, fixed that.
	- Prevent the extension from adding redundant menu items.
	- Fixed odd bug whereby pressing dead keys (and some punctuation) would prevent them from working.

#### Version 1.1
* Renamed Extension and changed icon.
* As per the original add-on, changed to MPL 2.0.
* Improved the flexibility and robustness of the content-scripts
	- Added sanity checks and a more robust interface for adding URLS to be scanned for plugins.
	- Improved the code and handling of workers.
	- Make sure they actually get removed once they're not being used anymore.
	- All changes to settings should now be applied immediately to open pages, as soon as they are made.

#### Version 1.0
* Moved config to it's own dialog, under Tools Menus.
* Detects, color codes and warns conflicting shortcuts.
* Added supports for a few of the shortcuts with no ID.
* Fixed the configuration dialog search.
* Prevent the extension from mapping unknown non-US keys to shortcuts (tildes, accents, etc.)
* Added Private-Browsing support (although, to make sure we don't write to disk during Private Browsing, the Tools menu will only display the addon on non-Private windows)
* Added work-around for bug 78414.
* Added work-around for bug 406199.
* The extension should now be localizable.
* Several other minor changes and fixed from the original extension.

# TO DO
* Find alternative to the deprecated "window-utils" API; so far a suitable replacement has not come forth.

## License

Keybinder is licensed under the terms of MPL 2.0
