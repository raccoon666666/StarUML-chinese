/*
 * Copyright (c) 2013-2014 Minkyu Lee. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of Minkyu Lee. The intellectual and technical concepts
 * contained herein are proprietary to Minkyu Lee and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Minkyu Lee (niklaus.lee@gmail.com).
 *
 */

const keycode = require('keycode')

/**
 * Keymap Manager
 * @private
 */
class KeymapManager {

  constructor () {
    /**
     * A map key to command.
     * @private
     * @member {Object<string, string>}
     */
    this.keymap = {}

    /**
     * Stack of registered global keydown hooks.
     * @private
     * @member {Array<function(Event):boolean>}
     */
    this.globalKeydownHooks = []

    /**
     * A reference to an instance of CommandManager
     * @private
     * @member {CommandManager}
     */
    this.commandManager = null
  }

  /**
   * Add keymaps
   * @private
   */
  add (keys) {
    for (let key in keys) {
      let normalizedKey = this.normalizeKeyDescriptor(key)
      this.keymap[normalizedKey] = keys[key]
    }
  }

  /**
   * Get current keymap
   * @return {Object<string,string>}
   */
  getKeymap () {
    return this.keymap
  }

  addGlobalKeydownHook (hook) {
    this.globalKeydownHooks.push(hook)
  }

  removeGlobalKeydownHook (hook) {
    var index = this.globalKeydownHooks.indexOf(hook)
    if (index !== -1) {
      this.globalKeydownHooks.splice(index, 1)
    }
  }

  formatKeyDescriptor (descriptor) {
    var terms = descriptor.split('-')
    if (window.app.platform === 'darwin') {
      terms = terms.map(key => {
        switch (key) {
        case 'cmdctrl': return '\u2318' // Cmd > command symbol
        case 'ctrl': return '\u2303'    // Ctrl > control symbol
        case 'cmd': return '\u2318'     // Cmd > command symbol
        case 'shift': return '\u21E7'   // Shift > shift symbol
        case 'alt': return '\u2325'     // Alt > option symbol
        case 'space': return 'Space'    // Space
        case 'enter': return 'Enter'    // Enter
        case 'backspace': return '⌫'    // Backspace > backspace symbol
        case 'delete': return '⌫'       // Delete > backspace symbol (Backspace acts like delete in macOS)
        case 'up': return '↑'           // Up > up arrow
        case 'down': return '↓'         // Down >  down arrow
        case 'left': return '←'         // Left >  left arrow
        case 'right': return '→'        // Right >  right arrow
        default:
          if (key.length === 1) {
            return key.toUpperCase()
          } else {
            return key
          }
        }
      })
      return terms.join('')
    } else {
      terms = terms.map(key => {
        switch (key) {
        case 'cmdctrl': return 'Ctrl'        // Ctrl
        case 'ctrl': return 'Ctrl'           // Ctrl
        case 'shift': return 'Shift'         // Shift
        case 'alt': return 'Alt'             // Alt
        case 'space': return 'Space'         // Space
        case 'enter': return 'Enter'         // Enter
        case 'backspace': return 'Backspace' // Backspace
        case 'delete': return 'Delete'       // Delete
        case 'up': return '↑'                // Up > up arrow
        case 'down': return '↓'              // Down >  down arrow
        case 'left': return '←'         // Left >  left arrow
        case 'right': return '→'        // Right >  right arrow
        default:
          if (key.length === 1) {
            return key.toUpperCase()
          } else {
            return key
          }
        }
      })
      return terms.join('+')
    }
  }

  normalizeKeyDescriptor (descriptor) {
    let keyDescriptor = descriptor.toLowerCase().split('-')
    let hasCmd, hasCtrl, hasAlt, hasShift, key
    if (keyDescriptor.includes('cmdctrl')) {
      (process.platform === 'darwin') ? (hasCmd = true) : (hasCtrl = true)
      keyDescriptor.splice(keyDescriptor.indexOf('cmdctrl'), 1)
    }
    if (keyDescriptor.includes('cmd')) {
      hasCmd = true
      keyDescriptor.splice(keyDescriptor.indexOf('cmd'), 1)
    }
    if (keyDescriptor.includes('ctrl')) {
      hasCtrl = true
      keyDescriptor.splice(keyDescriptor.indexOf('ctrl'), 1)
    }
    if (keyDescriptor.includes('alt')) {
      hasAlt = true
      keyDescriptor.splice(keyDescriptor.indexOf('alt'), 1)
    }
    if (keyDescriptor.includes('shift')) {
      hasShift = true
      keyDescriptor.splice(keyDescriptor.indexOf('shift'), 1)
    }
    key = keyDescriptor[0]
    if (key === 'delete' && process.platform === 'darwin') {
      key = 'backspace'
    }
    return this.buildKeyDescriptor(hasCmd, hasCtrl, hasAlt, hasShift, key)
  }

  buildKeyDescriptor (hasCmd, hasCtrl, hasAlt, hasShift, key) {
    if (!key) {
      console.log('KeymapManager buildKeyDescriptor() - No key provided!')
      return ''
    }
    let keyDescriptor = []
    if (hasCmd) {
      keyDescriptor.push('cmd')
    }
    if (hasCtrl) {
      keyDescriptor.push('ctrl')
    }
    if (hasAlt) {
      keyDescriptor.push('alt')
    }
    if (hasShift) {
      keyDescriptor.push('shift')
    }
    keyDescriptor.push(key)
    return keyDescriptor.join('-')
  }

  _mapKeycodeToKey (_keycode, key) {
    // If _keycode represents one of the digit keys (0-9), then return the corresponding digit
    // by subtracting keycode('0') from _keycode. ie. [48-57] --> [0-9]
    if (_keycode >= keycode('0') && _keycode <= keycode('9')) {
      return String(_keycode - keycode('0'))
      // Do the same with the numpad numbers
      // by subtracting keycode('numpad 0') from _keycode. ie. [96-105] --> [0-9]
    } else if (_keycode >= keycode('numpad 0') && _keycode <= keycode('numpad 9')) {
      return String(_keycode - keycode('numpad 0'))
    }

    switch (_keycode) {
    case keycode(';'):
      return ';'
    case keycode('='):
      return '='
    case keycode(','):
      return ','
    case keycode('numpad -'):
    case keycode('-'):
      return '-'
    case keycode('numpad +'):
      return '+'
    case keycode('numpad .'):
    case 190: // period keycode
      return '.'
    case keycode('numpad /'):
    case keycode('/'):
      return '/'
    case keycode('``'):
      return '`'
    case keycode('['):
      return '['
    case keycode('\\'):
      return '\\'
    case keycode(']'):
      return ']'
    case keycode("''"):
      return "'"
    case keycode('up'):
      return 'up'
    case keycode('down'):
      return 'down'
    case keycode('left'):
      return 'left'
    case keycode('right'):
      return 'right'
    default:
      return key.toLowerCase()
    }
  }

  /**
   * Translate key event to normalized key descriptor
   * @private
   * @param {number} event A key event object
   * @return {string} A normalized key descriptor
   */
  translateKeyboardEvent (event) {
    let hasCmd = (event.metaKey)
    let hasCtrl = (event.ctrlKey)
    let hasAlt = (event.altKey)
    let hasShift = (event.shiftKey)
    let key = String.fromCharCode(event.keyCode)
    let ident = event.key
    if (ident) {
      if (ident.charAt(0) === 'U' && ident.charAt(1) === '+') {
        // This is a unicode code point like "U+002A", get the 002A and use that
        key = String.fromCharCode(parseInt(ident.substring(2), 16))
      } else {
        // This is some non-character key, just use the raw identifier
        key = ident
      }
    }
    // Translate some keys to their common names
    if (key === '\t') {
      key = 'tab'
    } else if (key === ' ') {
      key = 'space'
    } else {
      key = this._mapKeycodeToKey(event.keyCode, key)
    }
    return this.buildKeyDescriptor(hasCmd, hasCtrl, hasAlt, hasShift, key)
  }

  _inModalDialog () {
    return $('.modal.instance').length > 0
  }

  _inEditMode () {
    return (document.activeElement.nodeName === 'TEXTAREA' ||
            document.activeElement.nodeName === 'INPUT')
  }

  _isEditKey (event) {
    return ((event.ctrlKey && event.which === keycode('c')) ||
            (event.ctrlKey && event.which === keycode('x')) ||
            (event.ctrlKey && event.which === keycode('v')) ||
            (event.ctrlKey && event.which === keycode('z')) ||
            (event.ctrlKey && event.which === keycode('y')) ||
            (event.which === keycode('delete')) ||
            (event.which === keycode('backspace')))
  }

  /**
   * @private
   */
  _handleKey (key) {
    if (this.keymap[key]) {
      // The execute() function returns a promise because some commands are async.
      // Generally, commands decide whether they can run or not synchronously,
      // and reject immediately, so we can test for that synchronously.
      this.commandManager.execute(this.keymap[key])
      return true
      // return (promise.state() !== 'rejected')
    }
    return false
  }

  /**
   * @private
   */
  setup () {
    let self = this
    window.document.body.addEventListener(
      'keydown',
      (event) => {
        // Allow Ctrl+C/X/V/Z/Y and Delete for Input/TextArea or Modal Dialog
        if (self._inModalDialog() && self._isEditKey(event) || (self._inEditMode() && self._isEditKey(event))) {
          // Allow default browser's actions
        } else {
          let i
          let handled = false
          for (i = self.globalKeydownHooks.length - 1; i >= 0; i--) {
            if (self.globalKeydownHooks[i](event)) {
              handled = true
              break
            }
          }
          if (!handled && self._handleKey(self.translateKeyboardEvent(event))) {
            event.stopPropagation()
            event.preventDefault()
          }
        }
      },
      true
    )
  }
}

module.exports = KeymapManager
