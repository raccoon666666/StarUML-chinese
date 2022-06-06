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

const { Menu } = require('electron')
const menuHelpers = require('../ui/menu-helpers')

/**
 * Application Menu
 */
class ApplicationMenu {

  constructor () {
    /**
     * @type {Object}
     */
    this.template = null

    /**
     * @type {Menu}
     */
    this.menu = null

    /**
     * @type {Map<string, MenuItem>}
     */
    this.items = {}
  }

  /**
   * Setup application main menu.
   *
   * @param {Object} template
   * @param {Map<string, string>} keystrokesByCommand
   */
  setup (template, keystrokesByCommand) {
    const temp = menuHelpers.translateTemplate(template, keystrokesByCommand)
    this.menu = Menu.buildFromTemplate(temp)
    Menu.setApplicationMenu(this.menu)
    this.items = menuHelpers.flattenMenuItems(this.menu)
  }

  /**
   * Update states (visible, enabled, checked) of menu items specified by id.
   *
   * @param {Map<string, boolean>} visibleStates
   * @param {Map<string, boolean>} enabledStates
   * @param {Map<string, boolean>} checkedStates
   */
  updateStates (visibleStates, enabledStates, checkedStates) {
    menuHelpers.updateStates(this.items, visibleStates, enabledStates, checkedStates)
  }

}

module.exports = ApplicationMenu
