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

const {shell} = require('electron')
const fs = require('fs')
const path = require('path')
const Mustache = require('mustache')
const Strings = require('../strings')

const aboutDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/about-dialog.html'), 'utf8')

/**
 * Show About Dialog
 * @private
 * @return {Dialog}
 */
function showDialog () {
  var context = {
    Strings: Strings,
    metadata: global.app.metadata
  }
  var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(aboutDialogTemplate, context))
  var $dlg = dialog.getElement()
  var $licenseToLabel = $dlg.find('.licensed-to')
  var $license = $dlg.find('.license')
  var $licenseType = $dlg.find('.licenseType')
  var $quantity = $dlg.find('.quantity')
  var $thirdparty = $dlg.find('.thirdparty')

  $thirdparty.click(function () {
    shell.openExternal(app.config.thirdparty_licenses_url)
  })

  // set license info
  if (app.licenseManager.getStatus() === true) {
    if (app.config.setappBuild) {
      $licenseToLabel.hide()
    }
    var info = app.licenseManager.getLicenseInfo()
    var licenseTypeName = 'Unknown'
    switch (info.licenseType) {
    case 'PS':
      licenseTypeName = 'Personal'
      break
    case 'CO':
      licenseTypeName = 'Commercial'
      break
    case 'ED':
      licenseTypeName = 'Educational'
      break
    case 'CR':
      licenseTypeName = 'Classroom'
      break
    case 'SITE':
      licenseTypeName = 'Site'
      break
    case 'CAMPUS':
      licenseTypeName = 'Campus'
      break
    }
    $license.html(info.name)
    $licenseType.html(licenseTypeName + ' License')
    if (info.licenseType === 'SITE' || info.licenseType === 'CAMPUS') {
      $quantity.html('Unlimited Users')
    } else {
      $quantity.html(info.quantity + ' User(s)')
    }
  } else {
    $license.html('UNREGISTERED')
  }
  return dialog
}

exports.showDialog = showDialog
