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
const {EventEmitter} = require('events')

/**
 * StatusBar
 * @private
 */
class StatusbarView extends EventEmitter {

  constructor () {
    super()
    this.$statusbar = null

    this.$mainView = null

    this.$view = null

    this.$selectedElement = null

    this.$zoom = null

    this.$validatio = null

    this.preferenceManager = null
  }

  /**
   * Zoom의 비율을 나타내기
   *
   * @private
   * @param {number} value
   */
  setZoomLevel (value) {
    if (value) {
      this.$zoom.html(Math.round(value * 100) + '%')
    } else {
      this.$zoom.html('100%')
    }
  }

  /**
   * Set Validity
   *
   * @private
   * @param {boolean} value
   */
  setValidity (value) {
    if (value) {
      this.$validation.addClass('icon-tool-validation-ok')
      this.$validation.removeClass('icon-tool-validation-error')
    } else {
      this.$validation.addClass('icon-tool-validation-error')
      this.$validation.removeClass('icon-tool-validation-ok')
    }
  }

  /**
   * 선택된 요소의 정보를 나타내기
   *
   * @private
   * @param {Core.Model} elem
   */
  setElement (elem) {
    let self = this

    function _addItem (_elem) {
      if (_elem) {
        var text
        if (_elem === elem) {
          text = "<span class='element'>" +
          "<span class='k-sprite " + _elem.getNodeIcon() + "'></span>" +
          "<span class='active-element-name'>" + _elem.name + '</span>' +
          "<span class='active-element-class'> [" + _elem.getClassName() + ']</span>' +
          '</span>'
        } else {
          if (_elem instanceof type.Project) {
            text = "<span class='element'>" +
            "<span class='k-sprite " + _elem.getNodeIcon() + "'></span>" +
            '</span>'
          } else {
            text = "<span class='element'>" +
            "<span class='k-sprite " + _elem.getNodeIcon() + "'></span>" +
            '<span>' + _elem.name + '</span>' +
            '</span>'
          }
        }
        self.$selectedElement.prepend(text)
        if (_elem._parent) {
          _addItem(_elem._parent)
        }
      }
    }

    if (elem) {
      // var text = "<span class='k-sprite " + elem.getNodeIcon() + "'></span> [" + elem.getClassName() + "] " + elem.getPathname();
      // $selectedElement.html(text);
      this.$selectedElement.children().remove()
      _addItem(elem)
    } else {
      this.$selectedElement.html('&nbsp;')
    }
  }

  /**
   * Toggle StatusBar
   */
  toggle () {
    if (this.isVisible()) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * Show StatusBar
   */
  show () {
    var elementPrefs = {
      size: this.$statusbar.outerHeight(),
      visible: true
    }
    this.$statusbar.show()
    this.$mainView.css('bottom', elementPrefs.size)
    this.$statusbar.trigger('panelExpanded', [elementPrefs.size])
    this.preferenceManager.setViewState('statusbar', elementPrefs)
    this.updateMenu()
    this.emit('resize')
  }

  /**
   * Hide StatusBar
   */
  hide () {
    var elementPrefs = {
      size: this.$statusbar.outerHeight(),
      visible: false
    }
    this.$statusbar.hide()
    this.$mainView.css('bottom', 0)
    this.$statusbar.trigger('panelCollapsed', [0])
    this.preferenceManager.setViewState('statusbar', elementPrefs)
    this.updateMenu()
    this.emit('resize')
  }

  /**
   * Return whether StatusBar is visible or not
   *
   * @return {booean}
   */
  isVisible () {
    return this.$statusbar.is(':visible')
  }

  updateMenu () {
    let checkedStates = {
      'view.statusbar': this.isVisible()
    }
    app.menu.updateStates(null, null, checkedStates)
  }

  htmlReady () {
    this.$statusbar = $('#statusbar')
    this.$mainView = $('.main-view')

    const template = fs.readFileSync(path.join(__dirname, '../static/html-contents/statusbar.html'), 'utf8')
    this.$view = $(template)
    this.$selectedElement = this.$view.find('.selected-element')
    this.$zoom = this.$view.find('.zoom')
    this.$validation = this.$view.find('.validation-icon')

    this.$statusbar.append(this.$view)

    if (!this.$statusbar.is(':visible')) {
      this.hide()
    }

    var elementPrefs = this.preferenceManager.getViewState('statusbar')
    if (elementPrefs.visible === false) {
      this.hide()
    } else {
      this.show()
    }

    app.commands.register('view:statusbar', () => { this.toggle() }, 'Toggle Statusbar')
  }

  appReady () {
    this.updateMenu()
  }
}

module.exports = StatusbarView
