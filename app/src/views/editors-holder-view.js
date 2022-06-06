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
const path = require('path')
const Resizer = require('../utils/resizer')
const ViewUtils = require('../utils/view-utils')

/**
 * EditorsHolder contains StyleEditorView, PropertyEditorView, and DocumentationEditorView
 */
class EditorsHolderView {

  constructor () {
    this.$editors = null
  }

  /**
   * Toggle EditorsHolder
   */
  toggle () {
    Resizer.toggle(this.$editors)
  }

  /**
   * Show EditorsHolder
   */
  show () {
    Resizer.show(this.$editors)
  }

  /**
   * Hide EditorsHolder
   */
  hide () {
    Resizer.hide(this.$editors)
  }

  /**
   * Return whether EditorsHolder is visible or not
   * @return {boolean}
   */
  isVisible () {
    return Resizer.isVisible(this.$editors)
  }

  /**
   * @private
   */
  addEditorView ($view) {
    var viewId = $view.data('id')
    var $suppress = $view.find('.suppress-button')
    var $body = $view.find('.editor-view-body')

    // Read EditorView's Preferences
    var elementPrefs = app.preferences.getViewState(viewId)
    if (!elementPrefs) {
      elementPrefs = { visible: true }
    }
    $body.toggle(elementPrefs.visible)
    $suppress.toggleClass('collapsed', !elementPrefs.visible)

    // Toggle Button
    $suppress.click(function () {
      $body.slideToggle(function () {
        var elementPrefs = {
          visible: $body.is(':visible')
        }
        app.preferences.setViewState(viewId, elementPrefs)
        $suppress.toggleClass('collapsed', !elementPrefs.visible)
      })
    })

    // Append to Editors-Holder
    $('#editors-holder').append($view)
  }

  /**
   * @private
   */
  updateMenu () {
    let checkedStates = {
      'view.editors': this.isVisible()
    }
    app.menu.updateStates(null, null, checkedStates)
  }

  /**
   * @private
   */
  htmlReady () {
    const viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/editors-holder.html'), 'utf8')
    var $view = $(viewTemplate)
    var $content = $view.find('.view-content')

    this.$editors = $('#editors')
    this.$editors.append($view)
    ViewUtils.addScrollerShadow($content.get(0), null, true)

    this.$editors.on('panelCollapsed', (evt, width) => {
      this.updateMenu()
    })

    this.$editors.on('panelExpanded', (evt, width) => {
      this.updateMenu()
    })

    // is collapsed before we add the event. Check here initially
    if (!this.$editors.is(':visible')) {
      this.$editors.trigger('panelCollapsed')
    }

    app.commands.register('view:editors', () => { this.toggle() })
  }

  /**
   * @private
   */
  appReady () {
    this.updateMenu()
  }
}

module.exports = EditorsHolderView
