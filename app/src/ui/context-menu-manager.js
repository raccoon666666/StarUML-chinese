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
 * Context Menu Manager
 */
class ContextMenuManager {

  constructor () {
    /**
     * @type {Object}
     * @private
     */
    this.templatesBySelector = {}

    /**
     * A reference to KeymapManager
     * @private
     */
    this.keymapManager = null
  }

  /**
   * Add context menus identified by CSS selector
   * @private
   * @param {Object<string,Object>} templatesBySelector
   */
  add (templatesBySelector) {
    for (let key in templatesBySelector) {
      let template = templatesBySelector[key]
      let selector = SELECTOR_ALIAS[key] || key
      let existingTemplate = this.templatesBySelector[selector]
      if (existingTemplate) {
        template.forEach(item => {
          menuHelpers.merge(existingTemplate, item)
        })
        this.templatesBySelector[selector] = existingTemplate
      } else {
        this.templatesBySelector[selector] = template
      }
    }
  }

  /**
   * Popup a particular context menu
   *
   * @param {string} selector
   */
  popup (selector) {
    ipcRenderer.send('popup-context-menu', selector)
  }

  /**
   * Setup context menus
   * @private
   */
  setup () {
    let keymap = this.keymapManager.getKeymap()
    let keystrokesByCommand = {}
    for (let item in keymap) {
      keystrokesByCommand[keymap[item]] = item
    }
    ipcRenderer.send('setup-context-menu', this.templatesBySelector, keystrokesByCommand)

    // register 'contextmenu' events for each context menus
    let self = this
    for (let selector in this.templatesBySelector) {
      $(selector).on('contextmenu', (event) => {
        self.popup(selector)
      })
    }
  }

}

const SELECTOR_ALIAS = {
  'diagram-canvas': '#diagram-canvas',
  'model-explorer': '#model-explorer-holder .treeview',
  'working-diagrams': '#working-diagrams ul.listview'
}

module.exports = ContextMenuManager
