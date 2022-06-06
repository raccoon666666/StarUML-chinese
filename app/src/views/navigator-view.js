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

const {EventEmitter} = require('events')
const Resizer = require('../utils/resizer')

const EXPLORER_MIN_HEIGHT = 40

/**
 * @private
 * Navigator View
 *
 * This contains ModelExplorerView and EditorViews
 */
class NavigatorView extends EventEmitter {

  constructor () {
    super()
    this.$navigator = null
    this.$modelExplorer = null
    this.$editors = null
  }

  /**
   * Toggle NavigatorView
   */
  toggle () {
    Resizer.toggle(this.$navigator)
  }

  /**
   * Show NavigatorView
   */
  show () {
    Resizer.show(this.$navigator)
  }

  /**
   * Hide NavigatorView
   */
  hide () {
    Resizer.hide(this.$navigator)
  }

  /**
   * Return whether NavigatorView is visible or not
   *
   * @return {booean}
   */
  isVisible () {
    return Resizer.isVisible(this.$navigator)
  }

  _limitEditorsHeight () {
    if ((this.$navigator.height() - EXPLORER_MIN_HEIGHT) < this.$editors.height()) {
      this.$editors.height(this.$navigator.height() - EXPLORER_MIN_HEIGHT)
      this.$modelExplorer.find('.view-content').triggerHandler('scroll')
      this.$editors.find('.view-content').triggerHandler('scroll')
    }
  }

  updateMenu () {
    let checkedStates = {
      'view.navigator': this.isVisible()
    }
    app.menu.updateStates(null, null, checkedStates)
  }

  resized () {
    this.emit('resize')
  }

  htmlReady () {
    this.$navigator = $('#navigator')
    this.$modelExplorer = $('#model-explorer')
    this.$editors = $('#editors')

    let self = this

    // Navigator Resizing
    self.$navigator.on('panelResizeStart', function (evt, width) {
      self.$navigator.find('.scroller-shadow').css('display', 'none')
    })

    self.$navigator.on('panelResizeUpdate', function (evt, width) {
      self._limitEditorsHeight()
    })

    self.$navigator.on('panelResizeEnd', function (evt, width) {
      self.$navigator.find('.scroller-shadow').css('display', 'block')
      self.$modelExplorer.find('.view-content').triggerHandler('scroll')
      self.$editors.find('.view-content').triggerHandler('scroll')
      self.resized()
    })

    self.$navigator.on('panelCollapsed', (evt, width) => {
      self.updateMenu()
      self.resized()
    })

    self.$navigator.on('panelExpanded', (evt, width) => {
      self.$navigator.find('.scroller-shadow').css('display', 'block')
      self.$modelExplorer.find('.view-content').triggerHandler('scroll')
      self.$editors.find('.view-content').triggerHandler('scroll')
      self.updateMenu()
      self.resized()
    })

    // is collapsed before we add the event. Check here initially
    if (!self.$navigator.is(':visible')) {
      self.$navigator.trigger('panelCollapsed')
    }

    // Toolbox Resizing

    self.$editors.on('panelResizeStart', function (evt, width) {
      self.$editors.find('.scroller-shadow').css('display', 'none')
    })

    self.$editors.on('panelResizeUpdate', function (evt, width) {
    })

    self.$editors.on('panelResizeEnd', function (evt, width) {
      self.$editors.find('.scroller-shadow').css('display', 'block')
      self.$modelExplorer.find('.view-content').triggerHandler('scroll')
      self.$editors.find('.view-content').triggerHandler('scroll')
    })

    self.$editors.on('panelCollapsed', function (evt, width) {
    })

    self.$editors.on('panelExpanded', function (evt, width) {
      self.$editors.find('.scroller-shadow').css('display', 'block')
      self.$modelExplorer.find('.view-content').triggerHandler('scroll')
      self.$editors.find('.view-content').triggerHandler('scroll')
    })

    // Window Resizing

    $(window).resize(function () {
      self.$modelExplorer.find('.view-content').triggerHandler('scroll')
      self.$editors.find('.view-content').triggerHandler('scroll')
      if (self.$navigator.height() > EXPLORER_MIN_HEIGHT) {
        self._limitEditorsHeight()
      }
    })

    app.commands.register('view:navigator', () => { self.toggle() }, 'Toggle Navigator')
  }

  appReady () {
    this.updateMenu()
  }
}

module.exports = NavigatorView
