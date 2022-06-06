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
const path = require('path')
const { EventEmitter } = require('events')
const Window = require('./window')
const ApplicationMenu = require('./application-menu')
const ContextMenu = require('./context-menu')
const electron = require('electron')
const app = electron.app
const autoUpdater = require('electron-updater').autoUpdater
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
const MetadataManager = require('./metadata-manager')
const ExtensionLoader = require('../extensibility/extension-loader')
const packageJSON = require('../../package.json')

/**
 * Application
 */
class Application extends EventEmitter {

  constructor () {
    super()

    /**
     * @member {boolean}
     */
    this.cliMode = false

    /**
     * @member {Array<Window>}
     */
    this.windows = []

    /**
     * @member {ApplicationMenu}
     */
    this.applicationMenu = new ApplicationMenu()

    /**
     * @member {ContextMenu}
     */
    this.contextMenu = new ContextMenu()

    /**
     * @member {MetadataManager}
     */
    this.metadata = new MetadataManager()
    global.app = this.metadata
    // load default elements
    require('../core/graphics')
    require('../core/core')
    // load default metamodel
    const metamodel = require('../../resources/default/metamodel.json')
    this.metadata.metamodels.register(metamodel)
    // load default rules
    require('../../resources/default/rules')

    /**
     * @member {Object}
     * .state = 'no-update' | 'available' | 'ready'
     */
    this.autoUpdateInfo = {
      state: 'no-update',
      showDialog: false,
      release: null
    }

    this.loadExtensions()
    this.handleCommands()
    this.handleMessages()
    this.handleEvents()
  }

  /**
   * Add a window
   *
   * @param {Window} window
   */
  addWindow (window) {
    this.windows.push(window)
  }

  /**
   * Remove a window
   *
   * @param {Window} window
   */
  removeWindow (window) {
    if (this.windows.indexOf(window) > -1) {
      this.windows.splice(this.windows.indexOf(window), 1)
    }
    // FIXME: This is a temporal solution for #218
    if (this.windows.length === 0) {
      this.applicationMenu.updateStates({}, {
        'debug.show-devtools': false,
        'debug.reload': false
      }, {})
    }
  }

  /**
   * Open a window
   *
   * options = {fileToOpen: string, template: string, devTools: boolean, ...}
   *
   * @param {Object} options
   * @return {Window}
   */
  openWindow (options) {
    options = options || {}
    let window = new Window(options)
    this.addWindow(window)
    return window
  }

  /**
   * Return a focused window
   *
   * @return {Window}
   */
  focusedWindow () {
    return _.find(this.windows, (win) => { return win.isFocused() })
  }

  /**
   * Get a window by browserWindow
   * @param {BrowserWindow} browserWindow
   * @return {Window}
   */
  getWindow (browserWindow) {
    return _.find(this.windows, (win) => { return win.browserWindow === browserWindow })
  }

  /**
   * Send a command to the focused window only if not handled by handleCommands().
   *
   * @param {string} command
   */
  sendCommand (command, ...args) {
    if (!this.emit(command, ...args)) {
      const focusedWindow = this.focusedWindow()
      if (focusedWindow) {
        focusedWindow.sendCommand(command, ...args)
      } else { // no open window
        // FIXME: This is a temporal solution for #218
        if (command === 'project:open-recent') {
          this.openWindow({fileToOpen: args[0]})
        } else if (command === 'uml:new-from-template') {
          const fullPath = path.join(electron.app.getAppPath(), 'extensions/essential/uml', args[0])
          this.openWindow({fileToOpen: fullPath})
        } else if (command === 'erd:new-from-template') {
          const fullPath = path.join(electron.app.getAppPath(), 'extensions/essential/erd', args[0])
          this.openWindow({fileToOpen: fullPath})
        }
      }
    }
  }

  /**
   * Send a command to all windows only if not handled by handleCommands().
   *
   * @param {string} command
   */
  sendCommandToAll (command, ...args) {
    if (!this.emit(command, ...args)) {
      this.windows.forEach(win => {
        win.sendCommand(command, ...args)
      })
    }
  }

  /**
   * Send a IPC message to all windows.
   *
   * @param {string} channel
   */
  sendMessageToAll (channel, ...args) {
    this.windows.forEach(win => {
      win.sendMessage(channel, ...args)
    })
  }

  /**
   * Load extensions
   */
  loadExtensions () {
    const extensionLoader = new ExtensionLoader()
    const paths = ['essential', 'default', 'dev', extensionLoader.getUserExtensionPath()]
    const features = ['metamodel', 'elements', 'rules']
    extensionLoader.init(paths, features)
  }

  /**
   * Handle commands triggered by menu items
   */
  handleCommands () {
    // Handle commands at main process level
    this.on('application:quit', () => {
      global.app.quit()
    })
    this.on('application:new', () => {
      this.openWindow()
    })
    this.on('application:new-from-template', (arg) => {
      if (arg) {
        this.openWindow({template: arg})
      }
    })
    this.on('application:open', (arg) => {
      var options = {}
      options.fileToOpen = arg
      this.openWindow(options)
    })

    if (!packageJSON.config.setappBuild) {
      this.on('application:check-for-updates', (arg) => {
        //autoUpdater.checkForUpdatesAndNotify()
      })
      this.on('application:install-and-restart', (arg) => {
        //autoUpdater.quitAndInstall(false, true)
      })
    }
  }

  /**
   * Handle messages from renderer processes.
   */
  handleMessages () {
    ipcMain.on('setup-application-menu', (event, template, keystrokesByCommand) => {
      this.applicationMenu.setup(template, keystrokesByCommand)
    })

    ipcMain.on('setup-context-menu', (event, templatesBySelector, keystrokesByCommand) => {
      this.contextMenu.setup(templatesBySelector, keystrokesByCommand)
    })

    ipcMain.on('popup-context-menu', (event, selector) => {
      this.contextMenu.popup(selector)
    })

    ipcMain.on('update-menu-states', (event, visibleStates, enabledStates, checkedStates) => {
      this.applicationMenu.updateStates(visibleStates, enabledStates, checkedStates)
      this.contextMenu.updateStates(visibleStates, enabledStates, checkedStates)
    })

    if (!packageJSON.config.setappBuild) {
      ipcMain.on('check-update', (event) => {
        if (!global.application.cliMode) {
          autoUpdater.checkForUpdatesAndNotify()
        }
      })
    }

    ipcMain.on('validate', (event, filename) => {
      this.metadata.loadFromFile(filename)
      const errors = this.metadata.validate()
      event.sender.send('validation-result', errors)
    })

    ipcMain.on('command', (event, command, ...args) => {
      this.emit(command, ...args)
    })

    ipcMain.on('close-window', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      window.close()
    })

    ipcMain.on('modified-change', (event, modified) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) {
        const window = this.getWindow(win)
        window.setModified(modified)
      }
    })

    ipcMain.on('relaunch', (event) => {
      app.relaunch()
    })

    ipcMain.on('quit', (event) => {
      app.quit()
    })

    ipcMain.on('web-contents:undo', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win.webContents.undo()
    })

    ipcMain.on('web-contents:redo', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win.webContents.redo()
    })

    ipcMain.on('web-contents:cut', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win.webContents.cut()
    })

    ipcMain.on('web-contents:copy', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win.webContents.copy()
    })

    ipcMain.on('web-contents:paste', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win.webContents.paste()
    })

    ipcMain.on('web-contents:reload', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win.webContents.reload()
    })

    ipcMain.on('web-contents:open-dev-tools', (event, options) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win.webContents.openDevTools(options)
    })

    ipcMain.on('show-open-dialog', (event, options) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      event.returnValue = electron.dialog.showOpenDialogSync(win, options)
    })

    ipcMain.on('show-save-dialog', (event, options) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      event.returnValue = electron.dialog.showSaveDialogSync(win, options)
    })

    ipcMain.on('show-message-box', (event, options) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      event.returnValue = electron.dialog.showMessageBoxSync(win, options)
    })

    ipcMain.on('show-error-box', (event, title, content) => {
      event.returnValue = electron.dialog.showErrorBox(title, content)
    })

    ipcMain.on('get-app-path', (event) => {
      event.returnValue = app.getAppPath()
    })

    ipcMain.on('get-user-path', (event) => {
      event.returnValue = app.getPath('userData')
    })

    ipcMain.on('console-log', (event, ...args) => {
      console.log(...args)
    })

    // Propagated events triggered in a window process
    ipcMain.on('window-event-propagate', (event, eventName, ...args) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      window.emit(eventName, ...args)
    })

    ipcMain.on('update-touchbar', (event, states) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) {
        const window = this.getWindow(win)
        window.touchbar.updateStates(states)
      }
    })
  }

  handleEvents () {
    if (!packageJSON.config.setappBuild) {
      // Forward autoUpdate events to all app.updateManager(s) in renderer processes.
      autoUpdater.on('error', (err) => {
        this.sendMessageToAll('autoUpdater:error', err)
      })
      autoUpdater.on('update-available', (info) => {
        this.sendMessageToAll('autoUpdater:update-available', info)
      })
      autoUpdater.on('update-not-available', (info) => {
        this.sendMessageToAll('autoUpdater:update-not-available', info)
      })
      autoUpdater.on('download-progress', (info) => {
        this.sendMessageToAll('autoUpdater:download-progress', info)
      })
      autoUpdater.on('update-downloaded', (info) => {
        this.sendMessageToAll('autoUpdater:update-downloaded', info)
      })
    }
  }

}

module.exports = Application
