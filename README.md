# Customizable Shortcuts

This Firefox add-on allows the user to customize various shortcuts, as well as completely disable the ones he doesn't like.
It is based (and a large part of the code) was originally written by Tim Taubert for the "Customizable Shortcuts" add-on that can be found here: https://addons.mozilla.org/en-US/firefox/addon/customizable-shortcuts/
After much work, at one point trying to contribute to the original project and not being able to reconcile all the changes I made, to release my own branch of the extension.

- Version: 1.1
- Date: 2014-07-29
- Official site: <https://github.com/ttaubert/customizable-shortcuts>

## Changes
#### Version 1.1


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

## License

Customizable Shortcuts is licensed under the terms of MPL 2.0
