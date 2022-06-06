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

const _ = require('lodash')
const fs = require('fs')
const Mustache = require('mustache')
const path = require('path')
const {ipcRenderer} = require('electron')
const keycode = require('keycode')
const {GraphicUtils} = require('../core/graphics')
const Strings = require('../strings')

/**
 * Dialog HTML Templates
 * @private
 */
const dialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/dialog-template.html'), 'utf8')
const inputDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/input-dialog.html'), 'utf8')
const textDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/text-dialog.html'), 'utf8')
const selectRadioDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/select-radio-dialog.html'), 'utf8')
const selectDropdownDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/select-dropdown-dialog.html'), 'utf8')
const colorDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/color-dialog.html'), 'utf8')
const fontDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/font-dialog.html'), 'utf8')

const DIALOG_BTN_OK = 'ok'
const DIALOG_BTN_CANCEL = 'cancel'
const DIALOG_BTN_SAVE = 'save'
const DIALOG_BTN_DONTSAVE = 'dontsave'
const DIALOG_CANCELED = '_canceled'

const DEFAULT_FILE_FILTERS = [
  { name: 'All Files', extensions: ['*'] }
]

/**
 * @private
 * Dismises a modal dialog
 * @param {$.Element} $dlg
 * @param {string} buttonId
 */
function _dismissDialog ($dlg, buttonId) {
  $dlg.data('buttonId', buttonId)
  $dlg.data('kendoWindow').close()
}

/**
 * @private
 * If autoDismiss is true, then dismisses the dialog. Otherwise just raises an event that the
 * given button was clicked.
 * @param {$.Element} $dlg The dialog element to be dismissed.
 * @param {string} buttonId The ID of the button that was clicked.
 * @param {boolean} autoDismiss Whether to autodismiss the dialog on a button click.
 */
function _processButton ($dlg, buttonId, autoDismiss) {
  if (autoDismiss) {
    _dismissDialog($dlg, buttonId)
  } else {
    $dlg.triggerHandler('buttonClick', buttonId)
  }
}

/**
 * @private
 * Handles the use of Tab so that it stays inside the Dialog
 * @param {$.Event} event
 * @param {$.Element} $dlg
 */
function _handleTab (event, $dlg) {
  var $inputs = $(':input:enabled, a', $dlg).filter(':visible')

  if ($(event.target).closest($dlg).length) {
    // If it's the first or last tabbable element, focus the last/first element
    if ((!event.shiftKey && event.target === $inputs[$inputs.length - 1]) ||
    (event.shiftKey && event.target === $inputs[0])) {
      $inputs.filter(event.shiftKey ? ':last' : ':first').focus()
      event.preventDefault()

      // If there is no element to focus, don't let it focus outside of the dialog
    } else if (!$inputs.length) {
      event.preventDefault()
    }

    // If the focus left the dialog, focus the first element in the dialog
  } else {
    $inputs.first().focus()
    event.preventDefault()
  }
}

/**
 * @private
 * Returns true if the modal dialog has a button with the given ID
 * @param {$.Element} $dlg
 * @param {string} buttonId
 * @return {boolean}
 */
function _hasButton ($dlg, buttonId) {
  return ($dlg.find("[data-button-id='" + buttonId + "']").length > 0)
}

/**
 * @private
 * Handles the keyDown event for the dialogs
 * @param {$.Event} e
 * @param {boolean} autoDismiss
 * @return {boolean}
 */
var _keydownHook = function (e, autoDismiss) {
  var $primaryBtn = this.find('.primary')
  var buttonId = null
  var which = String.fromCharCode(e.which)
  var $focusedElement = this.find('.dialog-button:focus, a:focus')

  // There might be a textfield in the dialog's UI; don't want to mistake normal typing for dialog dismissal
  var inTextArea = (e.target.tagName === 'TEXTAREA' || (e.target.tagName === 'INPUT' && e.target.className.indexOf('use-enter-key') > -1))
  var inTypingField = inTextArea || ($(e.target).filter(':text, :password').length > 0)

  if (e.which === keycode('tab')) {
    _handleTab(e, this)
  } else if (e.which === keycode('esc')) {
    buttonId = DIALOG_BTN_CANCEL
  } else if (e.which === keycode('return') && (!inTextArea || e.ctrlKey)) {
    // Enter key in single-line text input always dismisses; in text area, only Ctrl+Enter dismisses
    // Click primary
    $primaryBtn.click()
  } else if (e.which === keycode('space')) {
    // Space bar on focused button or link
    $focusedElement.click()
  } else {
    // CMD+D Don't Save
    if (e.metaKey && (which === 'D')) {
      if (_hasButton(this, DIALOG_BTN_DONTSAVE)) {
        buttonId = DIALOG_BTN_DONTSAVE
      }
      // FIXME (issue #418) CMD+. Cancel swallowed by native shell
    } else if (e.metaKey && (e.which === 190 /* period keycode */)) {
      buttonId = DIALOG_BTN_CANCEL
      // 'N' Don't Save
    } else if (which === 'N' && !inTypingField) {
      if (_hasButton(this, DIALOG_BTN_DONTSAVE)) {
        buttonId = DIALOG_BTN_DONTSAVE
      }
    }
  }

  if (buttonId) {
    _processButton(this, buttonId, autoDismiss)
  }

  // Stop any other global hooks from processing the event (but
  // allow it to continue bubbling if we haven't otherwise stopped it).
  return true
}

/**
 * @constructor
 * Dialog object
 * @param {$.Element} $dlg The dialog jQuery element
 * @param {Promise} promise A promise that will be resolved with the ID of the clicked button when the dialog
 *     is dismissed. Never rejected.
 */
function Dialog ($dlg, promise) {
  this._$dlg = $dlg
  this._promise = promise
}

/** @type {$.Element} The dialog jQuery element */
Dialog.prototype.getElement = function () {
  return this._$dlg
}

/** @type {Promise} The dialog promise */
Dialog.prototype.getPromise = function () {
  return this._promise
}

/**
 * Closes the dialog if is visible
 */
Dialog.prototype.close = function () {
  _dismissDialog(this._$dlg, DIALOG_BTN_CANCEL)
}

/**
 * Adds a 'then' callback to the dialog promise
 * @param {function(result: any)} callback
 */
Dialog.prototype.then = function (callback) {
  return this._promise.then(callback)
}

/**
 * DialogManager
 */
class DialogManager {

  /**
   * Show Modal Dialog using Template
   * @private
   * @param {string} template
   * @param {boolean} autoDismiss
   * @param {function($.Element)} beforeClosing
   * @return {Dialog}
   */
  showModalDialogUsingTemplate (template, autoDismiss, beforeClosing) {
    if (autoDismiss === undefined) {
      autoDismiss = true
    }
    var dialog, $dlg
    var promise = new Promise(function (resolve, reject) {
      $dlg = $(template)
      $dlg.addClass('instance')
      $(window.document.body).append($dlg)

      var keydownHook = function (e) {
        return _keydownHook.call($dlg, e, autoDismiss)
      }

      // Build kendo modal window
      $dlg.kendoWindow({
        title: $dlg.data('title'),
        modal: true,
        resizable: false,
        pinned: true,
        close: function () {
          // Call before closing
          if (beforeClosing) {
            beforeClosing($dlg)
          }

          // Set button Id
          var buttonId = $dlg.data('buttonId')
          if (!buttonId) {
            buttonId = DIALOG_BTN_CANCEL
          }

          // Dialog's return value
          var value = $dlg.data('returnValue')

          // Remove from DOM
          this.destroy()

          // Remove our global keydown handler.
          global.app.keymaps.removeGlobalKeydownHook(keydownHook)

          // Call promise
          _.defer(function () {
            resolve({
              buttonId: buttonId,
              returnValue: value
            })
          })
        }
      })

      // Open dialog at screen center
      dialog = $dlg.data('kendoWindow')
      dialog.center()

      // Click handler for buttons
      $dlg.one('click', '.dialog-button', function (e) {
        _processButton($dlg, $(this).data('button-id'), autoDismiss)
      })

      // Set focus to the default button
      var primaryBtn = $dlg.find('.primary')
      if (primaryBtn) {
        primaryBtn.focus()
      }

      // Push our global keydown handler onto the global stack of handlers.
      global.app.keymaps.addGlobalKeydownHook(keydownHook)
    })

    return (new Dialog($dlg, promise))
  }

  /**
   * Show typical modal dialog
   * @private
   *
   * @param {string} dlgClass
   * @param {string} title
   * @param {string} message
   * @param {Array.<{id:string, text:string, className:string}>} buttons
   * @param {boolean} autoDismiss
   * @return {Dialog}
   */
  showModalDialog (dlgClass, title, message, buttons, autoDismiss) {
    var templateVars = {
      dlgClass: dlgClass,
      title: title || false,
      message: message || '',
      buttons: buttons || [{ id: DIALOG_BTN_OK, text: Strings.OK, className: 'primary' }],
      hasButtons: true
    }
    if (templateVars.buttons.length === 0) {
      templateVars.hasButtons = false
    }
    var template = Mustache.render(dialogTemplate, templateVars)
    return this.showModalDialogUsingTemplate(template, autoDismiss)
  }

  /**
   * Immediately closes any dialog instances with the given class. The dialog callback for each instance will
   * be called with the special buttonId DIALOG_CANCELED (note: callback is run asynchronously).
   * @private
   * @param {string} dlgClass The class name identifier for the dialog.
   * @param {string=} buttonId The button id to use when closing the dialog. Defaults to DIALOG_CANCELED
   */
  cancelModalDialogIfOpen (dlgClass, buttonId) {
    $('.' + dlgClass + '.instance').each(function () {
      if ($(this).is(':visible')) {   // Bootstrap breaks if try to hide dialog that's already hidden
        _dismissDialog($(this), buttonId || DIALOG_CANCELED)
      }
    })
  }

  /**
   * Show Input Dialog
   *
   * @param {string} message
   * @param {string} initialValue
   * @return {Dialog}
   */
  showInputDialog (message, initialValue) {
    var context = {
      Strings: Strings,
      message: message
    }
    var dialog = this.showModalDialogUsingTemplate(Mustache.render(inputDialogTemplate, context), true, function ($dlg) {
      var val = $dlg.find('.input-box').val()
      $dlg.data('returnValue', val)
    })
    var $dlg = dialog.getElement()
    var $input = $dlg.find('.input-box')

    // Set initial value
    if (initialValue) {
      $input.val(initialValue)
      $input.select()
    }

    // Focus on input
    $input.focus()

    // Keydown Event
    $input.keydown(function (event) {
      switch (event.which) {
      case keycode('return'):
        $dlg.find('.primary').click()
        break
      }
    })

    return dialog
  }

  /**
   * Show Text Dialog (Multiline Text)
   * @param {string} message
   * @param {string} text initial text
   * @return {Dialog}
   */
  showTextDialog (message, text) {
    var context = {
      Strings: Strings,
      message: message,
      text: text
    }
    var dialog = this.showModalDialogUsingTemplate(Mustache.render(textDialogTemplate, context), true, function ($dlg) {
      var val = $dlg.find('.text-box').val()
      $dlg.data('returnValue', val)
    })
    return dialog
  }

  /**
   * Show Select Dialog (Radio-type)
   *
   * @param {string} message
   * @param {Array.<{text:string, value:string}>} items
   * @return {Dialog}
   */
  showSelectRadioDialog (message, options) {
    var context = {
      Strings: Strings,
      message: message,
      options: options
    }
    var dialog = this.showModalDialogUsingTemplate(Mustache.render(selectRadioDialogTemplate, context), true, function ($dlg) {
      var val = $('input[name=select-option]:checked', $dlg).val()
      $dlg.data('returnValue', val)
    })
    return dialog
  }

  /**
   * Show Select Dialog (Dropdown-type)
   *
   * @param {string} message
   * @param {Array.<{text:string, value:string}>} items
   * @return {Dialog}
   */
  showSelectDropdownDialog (message, options) {
    var context = {
      Strings: Strings,
      message: message,
      options: options
    }
    var dialog = this.showModalDialogUsingTemplate(Mustache.render(selectDropdownDialogTemplate, context), true, function ($dlg) {
      var $dropdown = $dlg.data('dropdown')
      $dlg.data('returnValue', $dropdown.val())
    })
    // Setup Dropdown Widget
    var $dlg = dialog.getElement()
    var $dropdown = $dlg.find('.select-options')
    $dlg.data('dropdown', $dropdown)
    return dialog
  }

  /**
   * Show Color Dialog
   *
   * @param {string} color initial color
   * @return {Dialog}
   */
  showColorDialog (color) {
    var context = { Strings: Strings }
    var dialog = this.showModalDialogUsingTemplate(Mustache.render(colorDialogTemplate, context), true, function ($dlg) {
      var colorPicker = $dlg.data('colorPicker')
      $dlg.data('returnValue', colorPicker.value())
    })
    var $dlg = dialog.getElement()
    var $picker = $dlg.find('.color-picker')
    var $palette = $dlg.find('.color-palette')
    var colorPicker
    // Setup Color Picker
    $picker.kendoFlatColorPicker()
    colorPicker = $picker.data('kendoFlatColorPicker')
    colorPicker.value(color)
    $dlg.data('colorPicker', colorPicker)
    // Setup Color Palette
    $palette.kendoColorPalette({
      columns: 16,
      tileSize: 8,
      palette: GraphicUtils.DEFAULT_COLOR_PALETTE,
      change: function (e) {
        colorPicker.value(e.value)
      }
    })
    return dialog
  }

  /**
   * Show Font Dialog
   *
   * @param {Graphics.Font} font Initial font
   * @return {Dialog}
   */
  showFontDialog (font) {
    var context = {
      Strings: Strings,
      faces: Object.keys(app.fontManager.fonts).sort().map(f => ({ text: f, value: f })),
      sizes: [ 8, 9, 10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 42 ]
    }

    var dialog = this.showModalDialogUsingTemplate(Mustache.render(fontDialogTemplate, context), true, function ($dlg) {
      var font = {
        face: $dlg.data('fontFace').val(),
        size: $dlg.data('fontSize').val(),
        color: $dlg.data('fontColor').value()
      }
      $dlg.data('returnValue', font)
    })

    var $dlg = dialog.getElement()
    var $fontFaceEdit = $dlg.find('.font-face > input')
    var $fontFaceSelect = $dlg.find('.font-face > select')
    var $fontSizeEdit = $dlg.find('.font-size > input')
    var $fontSizeSelect = $dlg.find('.font-size > select')
    var $fontColor = $dlg.find('.font-color')
    var $colorPalette = $dlg.find('.color-palette')
    var $fontPreview = $dlg.find('.font-preview')

    // Setup Font Face
    $fontFaceEdit.change(function () {
      $fontPreview.css('font-family', $fontFaceEdit.val())
    })
    $fontFaceSelect.change(function () {
      $fontFaceEdit.val($fontFaceSelect.val())
      $fontFaceEdit.change()
    })
    $dlg.data('fontFace', $fontFaceEdit)

    // Setup Font Size
    $fontSizeEdit.change(function () {
      if (_.isNumber(parseInt($fontSizeEdit.val()))) {
        $fontPreview.css('font-size', $fontSizeEdit.val() + 'px')
      }
    })
    $fontSizeSelect.change(function () {
      $fontSizeEdit.val($fontSizeSelect.val())
      $fontSizeEdit.change()
    })
    $dlg.data('fontSize', $fontSizeEdit)

    // Setup Font Color
    $fontColor.kendoColorPicker({
      change: function (e) {
        $fontPreview.css('color', e.value)
      }
    })
    $dlg.data('fontColor', $fontColor.data('kendoColorPicker'))

    // Setup Color Palette
    $colorPalette.kendoColorPalette({
      columns: 16,
      tileSize: 8,
      palette: GraphicUtils.DEFAULT_COLOR_PALETTE,
      change: function (e) {
        $fontColor.data('kendoColorPicker').value(e.value)
        $fontPreview.css('color', e.value)
      }
    })

    // Set initial font
    if (font.face !== null) {
      $fontFaceEdit.val(font.face)
      $fontFaceSelect.val(font.face)
    } else {
      $fontFaceEdit.prop('placeholder', '—')
      $fontFaceEdit.val('')
      $fontFaceSelect.val(null)
    }

    if (_.isNumber(font.size)) {
      $fontSizeEdit.val(font.size)
      $fontSizeSelect.val(font.size)
    } else {
      $fontSizeEdit.prop('placeholder', '—')
      $fontSizeEdit.val('')
      $fontSizeSelect.val(null)
    }

    if (font.color) {
      $fontColor.data('kendoColorPicker').value(font.color)
    }

    // Update Preview
    function updatePreview () {
      var face = $fontFaceEdit.val()
      var size = $fontSizeEdit.val()
      var color = $fontColor.data('kendoColorPicker').value()
      $fontPreview.css('font-family', face)
      $fontPreview.css('font-size', size + 'px')
      $fontPreview.css('color', color)
    }
    updatePreview()
    return dialog
  }

  /**
   * Show Simple Dialog. This is a synchronous system dialog.
   * @param {string} message
   * @return {string} button id
   */
  showSimpleDialog (message) {
    const result = ipcRenderer.sendSync('show-message-box', {
      type: 'none',
      message: message,
      buttons: [ Strings.OK ]
    })
    switch (result) {
    case 0:
      return DIALOG_BTN_OK
    default:
      return DIALOG_BTN_CANCEL
    }
  }

  /**
   * Show Confirm Dialog. This is a synchronous system dialog.
   *
   * @param {string} message
   * @return {string} button id
   */
  showConfirmDialog (message) {
    const result = ipcRenderer.sendSync('show-message-box', {
      type: 'question',
      title: 'Confirmation',
      message: message,
      buttons: [ Strings.OK, Strings.CANCEL ]
    })
    switch (result) {
    case 0:
      return DIALOG_BTN_OK
    default:
      return DIALOG_BTN_CANCEL
    }
  }

  /**
   * Show Alert Dialog. This is a synchronous system dialog.
   * @param {string} message
   * @return {string} button id
   */
  showAlertDialog (message) {
    const result = ipcRenderer.sendSync('show-message-box', {
      type: 'warning',
      title: 'Alert',
      message: message,
      buttons: [ Strings.OK ]
    })
    switch (result) {
    case 0:
      return DIALOG_BTN_OK
    default:
      return DIALOG_BTN_CANCEL
    }
  }

  /**
   * Show Information Dialog. This is a synchronous system dialog.
   * @param {string} message
   * @return {string} button id
   */
  showInfoDialog (message) {
    const result = ipcRenderer.sendSync('show-message-box', {
      type: 'info',
      title: 'Information',
      message: message,
      buttons: [ Strings.OK ]
    })
    switch (result) {
    case 0:
      return DIALOG_BTN_OK
    default:
      return DIALOG_BTN_CANCEL
    }
  }

  /**
   * Show Open Dialog. This is a synchronous system dialog.
   *
   * @param {string} title
   * @param {string} defaultPath
   * @param {Array<{name:string, extensions:string[]}>} filters
   * @param {Object} options
   * @return {Array<string>} filenames or null
   */
  showOpenDialog (title, defaultPath, filters = DEFAULT_FILE_FILTERS, options) {
    options = Object.assign({
      title: title,
      filters: filters
    }, options)
    if (defaultPath) {
      options.defaultPath = defaultPath
    }
    return ipcRenderer.sendSync('show-open-dialog', options)
  }

  /**
   * Show SaveDialog. This is a synchronous system dialog.
   *
   * @param {string} title
   * @param {string} defaultPath
   * @param {Array<{name:string, extensions:string[]}>} filters
   * @return {string} filename or null
   */
  showSaveDialog (title, defaultPath, filters = DEFAULT_FILE_FILTERS) {
    const options = {
      title: title,
      filters: filters
    }
    if (defaultPath) {
      options.defaultPath = defaultPath
    }
    return ipcRenderer.sendSync('show-save-dialog', options)
  }

  /**
   * Show Save Confirmation Dialog.  This is a synchronous system dialog.
   * @param {string} filename
   * @return {number} dialog modal result
   */
  showSaveConfirmDialog (filename) {
    const result = ipcRenderer.sendSync('show-message-box', {
      type: 'question',
      title: Strings.SAVE_CHANGES,
      message: '你想保存吗?',
      buttons: [ Strings.SAVE, Strings.DONTSAVE, Strings.CANCEL ]
    })
    switch (result) {
    case 0:
      return DIALOG_BTN_SAVE
    case 1:
      return DIALOG_BTN_DONTSAVE
    default:
      return DIALOG_BTN_CANCEL
    }
  }

  /**
   * Show Error Dialog.  This is a synchronous system dialog.
   * @param {string} message
   */
  showErrorDialog (message) {
    ipcRenderer.sendSync('show-error-box', message)
  }
}

module.exports = DialogManager
