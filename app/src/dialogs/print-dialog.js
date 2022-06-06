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

const fs = require('fs')
const Mustache = require('mustache')
const path = require('path')
const Strings = require('../strings')
const PreferenceManager = app.preferences

var printDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/print-dialog.html'), 'utf8')

/**
 * Show Print Dialog
 * @private
 * @return {Dialog}
 */
function showDialog () {
  var context = {
    Strings: Strings
  }

  // Print Options (Default)
  var printOptions = PreferenceManager.get('print.options')
  if (!printOptions) {
    printOptions = {
      range: 'all',
      layout: 'landscape',
      size: 'A4',
      showName: true
    }
  }

  var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(printDialogTemplate, context), true, function ($dlg) {
    $dlg.data('returnValue', printOptions)
  })

  var $dlg = dialog.getElement()
  var $rangeRadio = $dlg.find("input[name='print-range']")
  var $layoutRadio = $dlg.find("input[name='page-layout']")
  var $sizeSelect = $dlg.find('select.page-size')
  var $showNameCheck = $dlg.find('input.show-diagram-name')

  // Set Default Values
  $rangeRadio.val([printOptions.range])
  $layoutRadio.val([printOptions.layout])
  $sizeSelect.val(printOptions.size)
  $showNameCheck.attr('checked', printOptions.showName)

  // On Changes
  $rangeRadio.change(function () {
    printOptions.range = this.value
    PreferenceManager.set('print.options', printOptions)
  })
  $layoutRadio.change(function () {
    printOptions.layout = this.value
    PreferenceManager.set('print.options', printOptions)
  })
  $sizeSelect.change(function () {
    printOptions.size = $sizeSelect.val()
    PreferenceManager.set('print.options', printOptions)
  })
  $showNameCheck.change(function () {
    printOptions.showName = $showNameCheck.is(':checked')
    PreferenceManager.set('print.options', printOptions)
  })

  return dialog
}

exports.showDialog = showDialog
