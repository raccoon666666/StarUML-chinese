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

const {Menu} = require('electron')
const menuHelpers = require('../ui/menu-helpers')

/**
 * Conext Menu
 */
class ContextMenu {

  constructor () {
    /**
     * A map selector to a JSON template (See Electron's menu template format)
     * @type {Map<string, Object>}
     */
    this.templatesBySelector = {}

    /**
     * A map selector to a Menu object
     * @type {Map<string, Menu>}
     */
    this.menusBySelector = {}

    /**
     * A map selector to a flatten array of MenuItems.
     * @type {Map<string, Array<MenuItem>}
     */
    this.itemsBySelector = {}
  }

  /**
   * Setup context menus
   *
   * @param {Map<string, Object>} templatesBySelector
   * @param {Map<string, string} keystrokesByCommand
   */
  setup (templatesBySelector, keystrokesByCommand) {
    for (let selector in templatesBySelector) {
      let template = templatesBySelector[selector]
      this.templatesBySelector[selector] = menuHelpers.translateTemplate(template, keystrokesByCommand)
      this.menusBySelector[selector] = Menu.buildFromTemplate(this.templatesBySelector[selector])
      this.itemsBySelector[selector] = menuHelpers.flattenMenuItems(this.menusBySelector[selector])
    }
  }

  /**
   * Popup a context menu specified by selector
   *
   * @param {string} selector
   */
  popup (selector) {
    let menu = this.menusBySelector[selector]
    if (menu) {
      menu.popup()
    }
  }

  /**
   * Update states of menu items specified by command
   *
   * @param {Map<{string, boolean}>} visibleStates
   * @param {Map<{string, boolean}>} enabledStates
   * @param {Map<{string, boolean}>} checkedStates
   */
  updateStates (visibleStates, enabledStates, checkedStates) {
    for (let selector in this.itemsBySelector) {
      let items = this.itemsBySelector[selector]
      menuHelpers.updateStates(items, visibleStates, enabledStates, checkedStates)
    }
  }

}

module.exports = ContextMenu
