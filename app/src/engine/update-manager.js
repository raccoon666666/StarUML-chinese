/*
 * Copyright (c) 2013-2018 MKLab Co., Ltd. All rights reserved.
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

const {EventEmitter} = require('events')
const {ipcRenderer} = require('electron')
const _ = require('lodash')
const ExtensionManager = require('../extensibility/extension-manager')

/**
 * @private
 * Update Manager
 */
class UpdateManager extends EventEmitter {

  constructor () {
    super()
    this.state = 'no-update'
    this.updateInfo = null
    this.progress = null
    this.handleMessages()
  }

  handleMessages () {
    ipcRenderer.on('autoUpdater:update-available', (event, info) => {
      this.state = 'available'
      this.updateInfo = info
      this.emit('update-available', info)
    })
    ipcRenderer.on('autoUpdater:update-not-available', (event, info) => {
      this.state = 'no-update'
      this.updateInfo = info
      this.emit('update-not-available', info)
    })
    ipcRenderer.on('autoUpdater:download-progress', (event, progress) => {
      this.state = 'downloading'
      this.progress = progress
      this.emit('download-progress', progress)
    })
    ipcRenderer.on('autoUpdater:update-downloaded', (event, info) => {
      this.state = 'ready'
      this.updateInfo = info
      this.emit('update-downloaded', info)
    })
    ipcRenderer.on('autoUpdater:error', (event, err) => {
      this.emit('update-error', err)
    })
  }

  /**
   * Check extensions updates
   */
  checkExtensionUpdates () {
    ExtensionManager.downloadRegistry().done(function () {
      var updateAvailable = false
      _.each(ExtensionManager.extensions, ext => {
        if (ext.installInfo && ext.installInfo.updateAvailable) {
          updateAvailable = true
        }
      })
      if (updateAvailable) {
        $('#toolbar-extension-manager').addClass('selected')
      } else {
        $('#toolbar-extension-manager').removeClass('selected')
      }
    })
  }

}

module.exports = UpdateManager
