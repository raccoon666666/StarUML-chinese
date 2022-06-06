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

const WORKING_DIAGRAM_MIN_HEIGHT = 40

/**
 * @private
 * SidebarView
 *
 * This contains ToolboxView and WorkingDiagramView
 */
class SidebarView extends EventEmitter {

  constructor () {
    super()
    this.$sidebar = null
    this.$workingDiagrams = null
    this.$toolbox = null
  }

  /**
     * Toggle SidebarView
     */
  toggle () {
    Resizer.toggle(this.$sidebar)
  }

  /**
     * Show SidebarView
     */
  show () {
    Resizer.show(this.$sidebar)
  }

  /**
     * Hide SidebarView
     */
  hide () {
    Resizer.hide(this.$sidebar)
  }

  /**
   * Return whether SidebarView is visible or not
   *
   * @return {booean}
   */
  isVisible () {
    return Resizer.isVisible(this.$sidebar)
  }

  resized () {
    this.emit('resize')
  }

  _limitToolboxHeight () {
    if ((this.$sidebar.height() - WORKING_DIAGRAM_MIN_HEIGHT) < this.$toolbox.height()) {
      this.$toolbox.height(this.$sidebar.height() - WORKING_DIAGRAM_MIN_HEIGHT)
      this.$workingDiagrams.find('.view-content').triggerHandler('scroll')
      this.$toolbox.find('.view-content').triggerHandler('scroll')
    }
  }

  updateMenu () {
    let checkedStates = {
      'view.sidebar': this.isVisible()
    }
    app.menu.updateStates(null, null, checkedStates)
  }

  htmlReady () {
    this.$sidebar = $('#sidebar')
    this.$workingDiagrams = $('#working-diagrams')
    this.$toolbox = $('#toolbox')

    let self = this

    // Sidebar Resizing
    self.$sidebar.on('panelResizeStart', function (evt, width) {
      self.$sidebar.find('.scroller-shadow').css('display', 'none')
    })

    self.$sidebar.on('panelResizeUpdate', function (evt, width) {
    })

    self.$sidebar.on('panelResizeEnd', function (evt, width) {
      self.$sidebar.find('.scroller-shadow').css('display', 'block')
      self.$workingDiagrams.find('.view-content').triggerHandler('scroll')
      self.$toolbox.find('.view-content').triggerHandler('scroll')
      self.resized()
    })

    self.$sidebar.on('panelCollapsed', function (evt, width) {
      self.updateMenu()
      self.resized()
    })

    self.$sidebar.on('panelExpanded', function (evt, width) {
      self.$sidebar.find('.scroller-shadow').css('display', 'block')
      self.$workingDiagrams.find('.view-content').triggerHandler('scroll')
      self.$toolbox.find('.view-content').triggerHandler('scroll')
      self.updateMenu()
      self.resized()
    })

    // is collapsed before we add the event. Check here initially
    if (!self.$sidebar.is(':visible')) {
      self.$sidebar.trigger('panelCollapsed')
    }

    // Toolbox Resizing

    self.$toolbox.on('panelResizeStart', function (evt, height) {
      self.$toolbox.find('.scroller-shadow').css('display', 'none')
    })

    self.$toolbox.on('panelResizeUpdate', function (evt, height) {
      self._limitToolboxHeight()
    })

    self.$toolbox.on('panelResizeEnd', function (evt, height) {
      self.$toolbox.find('.scroller-shadow').css('display', 'block')
      self.$workingDiagrams.find('.view-content').triggerHandler('scroll')
      self.$toolbox.find('.view-content').triggerHandler('scroll')
    })

    self.$toolbox.on('panelCollapsed', function (evt, height) {
    })

    self.$toolbox.on('panelExpanded', function (evt, height) {
      self.$toolbox.find('.scroller-shadow').css('display', 'block')
      self.$workingDiagrams.find('.view-content').triggerHandler('scroll')
      self.$toolbox.find('.view-content').triggerHandler('scroll')
    })

    // Window Resizing
    $(window).resize(function () {
      self.$workingDiagrams.find('.view-content').triggerHandler('scroll')
      self.$toolbox.find('.view-content').triggerHandler('scroll')
      if (self.$sidebar.height() > WORKING_DIAGRAM_MIN_HEIGHT) {
        self._limitToolboxHeight()
      }
    })

    app.commands.register('view:sidebar', () => { self.toggle() }, 'Toggle Sidebar')
  }

  appReady () {
    this.updateMenu()
  }

}

module.exports = SidebarView
