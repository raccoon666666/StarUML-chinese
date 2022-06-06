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

const URL = require('url')
const { BrowserWindow, dialog } = require('electron')
const { EventEmitter } = require('events')
const Touchbar = require('./touchbar')

/**
 * Window represent a browser window
 *
 * This module dispatches these event(s):
 *   - app-ready : triggered when the application is ready
 *
 * @param {Object} options {fileToOpen:string, template:string, devTools:boolean, ...}
 */
class Window extends EventEmitter {

  constructor (options) {
    super()

    options = options || {}
    let browserOptions = {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    }
    browserOptions.width = options.width || 1200
    browserOptions.height = options.height || 900

    if (options.hide === true) {
      browserOptions.width = 0
      browserOptions.height = 0
      browserOptions.show = false
    }

    if (process.platform === 'darwin') {
      browserOptions.titleBarStyle = 'hidden'
    }
    this.browserWindow = new BrowserWindow(browserOptions)

    this.url = URL.format({
      protocol: 'file',
      slashes: true,
      pathname: `${__dirname}/../static/index.html`,
      query: { initParams: JSON.stringify(options) }
    })
    this.browserWindow.loadURL(this.url)

    if (options.devTools) {
      this.browserWindow.webContents.openDevTools()
    }

    this.browserWindow.webContents.setZoomFactor(0.001) // To fix issue #108

    this.touchbar = new Touchbar(this)

    this.modified = false
    this.handleEvents()
  }

  /**
   * Check the window is focused or not
   *
   * @return {boolean}
   */
  isFocused () {
    return this.browserWindow.isFocused()
  }

  setModified (modified) {
    this.modified = modified
  }

  /**
   * Send a command to the window
   *
   * @param {string} command
   * @param {...} ...args
   */
  sendCommand (command, ...args) {
    this.browserWindow.webContents.send('command', command, ...args)
  }

  /**
   * Send a IPC message to the window
   *
   * @param {string} channel
   * @param {...} ...args
   */
  sendMessage (channel, ...args) {
    this.browserWindow.webContents.send(channel, ...args)
  }

  /**
   * Close the window
   */
  close () {
    this.browserWindow.close()
  }

  /**
   * Handle events
   */
  handleEvents () {
    this.browserWindow.on('focus', () => {
      this.browserWindow.webContents.send('focus')
    })

    this.browserWindow.on('close', (event) => {
      if (this.modified) {
        const result = dialog.showMessageBoxSync(
          this.browserWindow,
          {
            type: 'question',
            title: 'Save Changes',
            message: '你想保存吗?',
            buttons: [ '保存', "不保存", '取消' ]
          })
        switch (result) {
        case 0: // save
          this.sendCommand('project:save')
          event.preventDefault()
          break
        case 1: // don't save
          break
        default: // cancel
          event.preventDefault()
        }
      }
    })

    this.browserWindow.on('closed', () => {
      global.application.removeWindow(this)
    })

    this.browserWindow.once('window:app-ready', (init) => {
      this.emit('app-ready', init)
    })

    this.browserWindow.once('window:close', () => {
      this.close()
    })
  }

}

module.exports = Window
