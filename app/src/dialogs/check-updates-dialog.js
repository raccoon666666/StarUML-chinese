/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const fs = require('fs')
const {ipcRenderer} = require('electron')
const Mustache = require('mustache')
const path = require('path')
const Strings = require('../strings')

const updateDialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/check-updates-dialog.html'), 'utf8')

function setUpdateAvailableIcon (show) {
  $('#toolbar-updates-available').remove()
  if (show) {
    var $button = $("<a id='toolbar-updates-available' href='#' title='可以更新'></a>")
    $('#toolbar .buttons').append($button)
    $button.click(() => {
      showDialog()
    })
  }
}

/**
 * @private
 * Show Update Dialog
 * @return {Dialog}
 */
function showDialog () {
  var date = new Date(app.updateManager.updateInfo)
  var data = {
    readyToInstall: false,
    date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
    Strings: Strings,
    info: app.updateManager.updateInfo
  }
  var $dlg
  var $restartAndInstall

  const stateChange = (info) => {
    var $mainMessage = $dlg.find('.main-message')
    var $subMessage = $dlg.find('.sub-message')
    var date = new Date()
    if (info) {
      date = new Date(info.releaseDate)
    }
    data.date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    switch (app.updateManager.state) {
    case 'no-update':
      $mainMessage.text('Already up to date.')
      $subMessage.text('')
      $restartAndInstall.hide()
      break
    case 'available':
      $mainMessage.text('New release ' + data.info.version + ' (' + data.date + ') is available.')
      $subMessage.text('')
      $restartAndInstall.hide()
      break
    case 'downloading':
      $mainMessage.text('New release ' + data.info.version + ' (' + data.date + ') is available.')
      $subMessage.text('Downloading...')
      $restartAndInstall.hide()
      break
    case 'ready':
      data.readyToInstall = true
      $mainMessage.text('New release ' + data.info.version + ' (' + data.date + ') is available.')
      $subMessage.text('Download complete. Now ready to install.')
      $restartAndInstall.show()
      break
    }
  }

  const progressChange = (progress) => {
    var $subMessage = $dlg.find('.sub-message')
    $subMessage.text('Downloading... (' + Math.floor(progress.percent) + '%)')
  }

  const updateError = () => {
    var $subMessage = $dlg.find('.sub-message')
    $subMessage.text('Error during update.')
  }

  var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(updateDialogTemplate, data), true, function ($dlg) {
    app.updateManager.removeListener('update-available', stateChange)
    app.updateManager.removeListener('update-not-available', stateChange)
    app.updateManager.removeListener('update-downloaded', stateChange)
    app.updateManager.removeListener('update-error', updateError)
    app.updateManager.removeListener('download-progress', progressChange)
  })
  $dlg = dialog.getElement()
  $restartAndInstall = $dlg.find('.install-and-restart')
  $restartAndInstall.click(() => {
    localStorage.removeItem('__backup_filename')
    ipcRenderer.send('command', 'application:install-and-restart')
  })
  stateChange(app.updateManager.updateInfo)
  app.updateManager.on('update-available', (info) => {
    stateChange(info)
  })
  app.updateManager.on('update-not-available', (info) => {
    stateChange(info)
  })

  app.updateManager.on('update-downloaded', stateChange)
  app.updateManager.on('update-error', updateError)
  app.updateManager.on('download-progress', progressChange)
  return dialog
}

exports.setUpdateAvailableIcon = setUpdateAvailableIcon
exports.showDialog = showDialog
