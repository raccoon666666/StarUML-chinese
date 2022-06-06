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

const {ipcRenderer} = require('electron')
const menuHelpers = require('./menu-helpers')

/**
 * Menu Manager
 */
class MenuManager {

  constructor () {
    /**
     * A template for Menu (See Electron's menu template format)
     * @private
     * @member {Array<Object>}
     */
    this.template = []
  }

  /**
   * Add a menu template
   * @private
   * @param {Array<Object>} template
   */
  add (template) {
    template.forEach(item => {
      menuHelpers.merge(this.template, item)
    })
  }

  /**
   * Clear menu template
   * @private
   */
  clear () {
    this.template = []
  }

  /**
   * Setup main menu.
   * @private
   */
  setup () {
    let keymap = global.app.keymaps.getKeymap()
    let keystrokesByCommand = {}
    for (let item in keymap) {
      keystrokesByCommand[keymap[item]] = item
    }
    ipcRenderer.send('setup-application-menu', this.template, keystrokesByCommand)
  }

  /**
   * Update states of menu items including main menu and context menus.
   *
   * @param {Object<string, boolean>} visibleStates
   * @param {Object<string, boolean>} enabledStates
   * @param {Object<string, boolean>} checkedStates
   *
   * @example
   * // Hide `About StarUML` menu item
   * var visibleStates = {
   *   'app.about': false // id of the menu item
   * }
   * app.menu.updateStates(visibleStates, null, null)
   */
  updateStates (visibleStates, enabledStates, checkedStates) {
    ipcRenderer.send('update-menu-states', visibleStates, enabledStates, checkedStates)
  }

}

module.exports = MenuManager
