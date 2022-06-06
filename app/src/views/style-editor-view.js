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
const Mustache = require('mustache')
const path = require('path')
const {Element} = require('../core/core')
const {EventEmitter} = require('events')
const _ = require('lodash')

/**
 * StyleEditor View
 * @private
 */
class StyleEditorView extends EventEmitter {

  constructor () {
    super()

    this._views = null

    this.editorsHolder = null

    this.$view = null
    this.$fontFaceEdit = null
    this.$fontFaceSelect = null
    this.$fontSizeEdit = null
    this.$fontSizeSelect = null
    this.$fillColor = null
    this.$lineColor = null
    this.$fontColor = null
    this.$lineStyleRadio = null

    this.$lineModeWrapper = null
    this.$lineModeRadio = null
    this.$lineEndWrapper = null
    this.$tailEndStyleRadio = null
    this.$headEndStyleRadio = null

    this.$autoResizeButton = null
    this.$autoResizeCheckbox = null
    this.$showShadowButton = null
    this.$showShadowCheckbox = null
    this.$wordWrapButton = null
    this.$wordWrapCheckbox = null
    this.$stereotypeDisplaySelect = null

    this.$showVisibilityButton = null
    this.$showVisibilityCheckbox = null
    this.$showNamespaceButton = null
    this.$showNamespaceCheckbox = null
    this.$showPropertyButton = null
    this.$showPropertyCheckbox = null
    this.$showTypeButton = null
    this.$showTypeCheckbox = null

    this.$textAlignWrapper = null
    this.$textHorzAlignRadio = null
    this.$textVertAlignRadio = null

    this.$suppressAttributesButton = null
    this.$suppressAttributesCheckbox = null
    this.$suppressOperationsButton = null
    this.$suppressOperationsCheckbox = null
    this.$suppressReceptionsButton = null
    this.$suppressReceptionsCheckbox = null
    this.$suppressLiteralsButton = null
    this.$suppressLiteralsCheckbox = null
    this.$suppressColumnsButton = null
    this.$suppressColumnsCheckbox = null

    this.$sendToBackButton = null
    this.$bringToFrontButton = null
    this.$alignLeftButton = null
    this.$alignRightButton = null
    this.$alignCenterButton = null
    this.$alignTopButton = null
    this.$alignBottomButton = null
    this.$alignMiddleButton = null
    this.$spaceEqualHorz = null
    this.$spaceEqualVert = null
    this.$setWidthEqual = null
    this.$setSizeEqual = null
    this.$setHeightEqua = null
  }

  _setupStyleWidgets () {
    this.$fontFaceEdit = this.$view.find('.font-face input')
    this.$fontFaceSelect = this.$view.find('.font-face select')
    this.$fontSizeEdit = this.$view.find('.font-size input')
    this.$fontSizeSelect = this.$view.find('.font-size select')
    this.$fillColor = this.$view.find('.fill-color')
    this.$lineColor = this.$view.find('.line-color')
    this.$fontColor = this.$view.find('.font-color')
    this.$lineStyleRadio = $("input[name='line-style']", this.$view)

    this.$lineModeWrapper = $('.style-editor-line-mode', this.$view)
    this.$lineModeRadio = $("input[name='line-mode']", this.$view)
    this.$lineEndWrapper = $('.style-editor-line-end', this.$view)
    this.$tailEndStyleRadio = $("input[name='tail-end-style']", this.$view)
    this.$headEndStyleRadio = $("input[name='head-end-style']", this.$view)

    this.$autoResizeButton = $('label.auto-resize', this.$view)
    this.$autoResizeCheckbox = $('input.auto-resize', this.$view)
    this.$showShadowButton = $('label.show-shadow', this.$view)
    this.$showShadowCheckbox = $('input.show-shadow', this.$view)
    this.$wordWrapButton = $('label.word-wrap', this.$view)
    this.$wordWrapCheckbox = $('input.word-wrap', this.$view)
    this.$stereotypeDisplaySelect = this.$view.find('.stereotype-display select')

    this.$showVisibilityButton = $('label.show-visibility', this.$view)
    this.$showVisibilityCheckbox = $('input.show-visibility', this.$view)
    this.$showNamespaceButton = $('label.show-namespace', this.$view)
    this.$showNamespaceCheckbox = $('input.show-namespace', this.$view)
    this.$showPropertyButton = $('label.show-property', this.$view)
    this.$showPropertyCheckbox = $('input.show-property', this.$view)
    this.$showTypeButton = $('label.show-type', this.$view)
    this.$showTypeCheckbox = $('input.show-type', this.$view)

    this.$suppressAttributesButton = $('label.suppress-attributes', this.$view)
    this.$suppressAttributesCheckbox = $('input.suppress-attributes', this.$view)
    this.$suppressOperationsButton = $('label.suppress-operations', this.$view)
    this.$suppressOperationsCheckbox = $('input.suppress-operations', this.$view)
    this.$suppressReceptionsButton = $('label.suppress-receptions', this.$view)
    this.$suppressReceptionsCheckbox = $('input.suppress-receptions', this.$view)
    this.$suppressLiteralsButton = $('label.suppress-literals', this.$view)
    this.$suppressLiteralsCheckbox = $('input.suppress-literals', this.$view)
    this.$suppressColumnsButton = $('label.suppress-columns', this.$view)
    this.$suppressColumnsCheckbox = $('input.suppress-columns', this.$view)

    this.$textAlignWrapper = $('.style-editor-text-align', this.$view)
    this.$textHorzAlignRadio = $("input[name='horz-text-align']", this.$view)
    this.$textVertAlignRadio = $("input[name='vert-text-align']", this.$view)

    this.$sendToBackButton = $('.send-to-back', this.$view)
    this.$bringToFrontButton = $('.bring-to-front', this.$view)
    this.$alignLeftButton = $('.align-left', this.$view)
    this.$alignRightButton = $('.align-right', this.$view)
    this.$alignCenterButton = $('.align-center', this.$view)
    this.$alignTopButton = $('.align-top', this.$view)
    this.$alignBottomButton = $('.align-bottom', this.$view)
    this.$alignMiddleButton = $('.align-middle', this.$view)
    this.$spaceEqualHorz = $('.space-equal-horz', this.$view)
    this.$spaceEqualVert = $('.space-equal-vert', this.$view)
    this.$setWidthEqual = $('.set-width-equal', this.$view)
    this.$setHeightEqual = $('.set-height-equal', this.$view)
    this.$setSizeEqual = $('.set-size-equal', this.$view)

    let self = this

    // Font Face
    self.$fontFaceEdit.change(function () {
      self.emit('styleChanged', self._views, 'font.face', self.$fontFaceEdit.val())
    })

    // Font Face <select>
    self.$fontFaceSelect.change(function () {
      self.$fontFaceEdit.val(self.$fontFaceSelect.val())
      self.$fontFaceEdit.change()
    })

    // (for Windows) To prevent immediate collapse of dropdown in comboBox.
    self.$fontFaceSelect.click(function (e) {
      self.$fontFaceSelect.focus()
      e.stopPropagation()
      return false
    })

    // Font Size
    self.$fontSizeEdit.change(function () {
      if (!_.isNaN(parseInt(self.$fontSizeEdit.val()))) {
        self.emit('styleChanged', self._views, 'font.size', self.$fontSizeEdit.val())
      } else {
        // TODO: Show message? (Only number is allowed)
      }
    })

    // Font Size <select>
    self.$fontSizeSelect.change(function () {
      self.$fontSizeEdit.val(self.$fontSizeSelect.val())
      self.$fontSizeEdit.change()
    })
    // (for Windows) To prevent immediate collapse of dropdown in comboBox.
    self.$fontSizeSelect.click(function (e) {
      self.$fontSizeSelect.focus()
      e.stopPropagation()
      return false
    })

    // Fill Color
    self.$fillColor.click(function (e) {
      e.preventDefault()
      app.dialogs.showColorDialog(self.$fillColor.val())
        .then(function ({buttonId, returnValue}) {
          if (buttonId === 'ok') {
            self.$fillColor.val(returnValue)
            self.emit('styleChanged', self._views, 'fillColor', self.$fillColor.val())
          }
        })
    })

    // Line Color
    self.$lineColor.click(function (e) {
      e.preventDefault()
      app.dialogs.showColorDialog(self.$lineColor.val())
        .then(function ({buttonId, returnValue}) {
          if (buttonId === 'ok') {
            self.$lineColor.val(returnValue)
            self.emit('styleChanged', self._views, 'lineColor', self.$lineColor.val())
          }
        })
    })

    // Fill Color
    self.$fontColor.click(function (e) {
      e.preventDefault()
      app.dialogs.showColorDialog(self.$fontColor.val())
        .then(function ({buttonId, returnValue}) {
          if (buttonId === 'ok') {
            self.$fontColor.val(returnValue)
            self.emit('styleChanged', self._views, 'fontColor', self.$fontColor.val())
          }
        })
    })

    // Line Style
    self.$lineStyleRadio.change(function () {
      self.emit('styleChanged', self._views, 'lineStyle', parseInt(this.value))
    })

    // Line Mode
    self.$lineModeRadio.change(function () {
      self.emit('styleChanged', self._views, 'lineMode', parseInt(this.value))
    })

    // Tail End Style
    self.$tailEndStyleRadio.change(function () {
      self.emit('styleChanged', self._views, 'tailEndStyle', parseInt(this.value))
    })

    // Head End Style
    self.$headEndStyleRadio.change(function () {
      self.emit('styleChanged', self._views, 'headEndStyle', parseInt(this.value))
    })

    // Format
    self.$autoResizeButton.click(function () {
      self.$autoResizeCheckbox.prop('checked', !self.$autoResizeCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'autoResize', self.$autoResizeCheckbox.is(':checked'))
    })
    self.$showShadowButton.click(function () {
      self.$showShadowCheckbox.prop('checked', !self.$showShadowCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'showShadow', self.$showShadowCheckbox.is(':checked'))
    })
    self.$wordWrapButton.click(function () {
      self.$wordWrapCheckbox.prop('checked', !self.$wordWrapCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'wordWrap', self.$wordWrapCheckbox.is(':checked'))
    })
    self.$stereotypeDisplaySelect.change(function () {
      self.emit('styleChanged', self._views, 'stereotypeDisplay', self.$stereotypeDisplaySelect.val())
    })

    self.$showVisibilityButton.click(function () {
      self.$showVisibilityCheckbox.prop('checked', !self.$showVisibilityCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'showVisibility', self.$showVisibilityCheckbox.is(':checked'))
    })
    self.$showNamespaceButton.click(function () {
      self.$showNamespaceCheckbox.prop('checked', !self.$showNamespaceCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'showNamespace', self.$showNamespaceCheckbox.is(':checked'))
    })
    self.$showPropertyButton.click(function () {
      self.$showPropertyCheckbox.prop('checked', !self.$showPropertyCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'showProperty', self.$showPropertyCheckbox.is(':checked'))
    })
    self.$showTypeButton.click(function () {
      self.$showTypeCheckbox.prop('checked', !self.$showTypeCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'showType', self.$showTypeCheckbox.is(':checked'))
    })

    self.$suppressAttributesButton.click(function () {
      self.$suppressAttributesCheckbox.prop('checked', !self.$suppressAttributesCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'suppressAttributes', self.$suppressAttributesCheckbox.is(':checked'))
    })
    self.$suppressOperationsButton.click(function () {
      self.$suppressOperationsCheckbox.prop('checked', !self.$suppressOperationsCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'suppressOperations', self.$suppressOperationsCheckbox.is(':checked'))
    })
    self.$suppressReceptionsButton.click(function () {
      self.$suppressReceptionsCheckbox.prop('checked', !self.$suppressReceptionsCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'suppressReceptions', self.$suppressReceptionsCheckbox.is(':checked'))
    })
    self.$suppressLiteralsButton.click(function () {
      self.$suppressLiteralsCheckbox.prop('checked', !self.$suppressLiteralsCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'suppressLiterals', self.$suppressLiteralsCheckbox.is(':checked'))
    })
    self.$suppressColumnsButton.click(function () {
      self.$suppressColumnsCheckbox.prop('checked', !self.$suppressColumnsCheckbox.is(':checked'))
      self.emit('styleChanged', self._views, 'suppressColumns', self.$suppressColumnsCheckbox.is(':checked'))
    })

    // Text Alignment
    self.$textHorzAlignRadio.change(function () {
      self.emit('styleChanged', self._views, 'horzAlign', parseInt(this.value))
    })
    self.$textVertAlignRadio.change(function () {
      self.emit('styleChanged', self._views, 'vertAlign', parseInt(this.value))
    })

    // Alignment
    self.$sendToBackButton.click(function () {
      app.commands.execute('alignment:send-to-back')
    })
    self.$bringToFrontButton.click(function () {
      app.commands.execute('alignment:bring-to-front')
    })
    self.$alignLeftButton.click(function () {
      app.commands.execute('alignment:align-left')
    })
    self.$alignCenterButton.click(function () {
      app.commands.execute('alignment:align-center')
    })
    self.$alignRightButton.click(function () {
      app.commands.execute('alignment:align-right')
    })
    self.$alignTopButton.click(function () {
      app.commands.execute('alignment:align-top')
    })
    self.$alignMiddleButton.click(function () {
      app.commands.execute('alignment:align-middle')
    })
    self.$alignBottomButton.click(function () {
      app.commands.execute('alignment:align-bottom')
    })
    self.$spaceEqualHorz.click(function () {
      app.commands.execute('alignment:space-equally-horizontally')
    })
    self.$spaceEqualVert.click(function () {
      app.commands.execute('alignment:space-equally-vertically')
    })
    self.$setWidthEqual.click(function () {
      app.commands.execute('alignment:set-width-equally')
    })
    self.$setHeightEqual.click(function () {
      app.commands.execute('alignment:set-height-equally')
    })
    self.$setSizeEqual.click(function () {
      app.commands.execute('alignment:set-size-equally')
    })
  }

  _setFontFace (face) {
    if (face) {
      this.$fontFaceEdit.val(face)
      this.$fontFaceSelect.val(face)
    } else {
      this.$fontFaceEdit.prop('placeholder', '—')
      this.$fontFaceEdit.val('')
      this.$fontFaceSelect.val(null)
    }
  }

  _setFontSize (size) {
    if (_.isNumber(size)) {
      this.$fontSizeEdit.val(size)
      this.$fontSizeSelect.val(size)
    } else {
      this.$fontSizeEdit.prop('placeholder', '—')
      this.$fontSizeEdit.val('')
      this.$fontSizeSelect.val(null)
    }
  }

  _setFillColor (color) {
    if (color) {
      this.$fillColor.val(color)
    } else {
      this.$fillColor.val('')
    }
  }

  _setLineColor (color) {
    if (color) {
      this.$lineColor.val(color)
    } else {
      this.$lineColor.val('')
    }
  }

  _setFontColor (color) {
    if (color) {
      this.$fontColor.val(color)
    } else {
      this.$fontColor.val('')
    }
  }

  _setLineStyle (lineStyle) {
    if (_.isNumber(lineStyle)) {
      this.$lineStyleRadio.val([lineStyle])
    } else {
      this.$lineStyleRadio.attr('checked', false)
    }
  }

  _setLineMode (lineMode) {
    if (_.isNumber(lineMode)) {
      this.$lineModeRadio.val([lineMode])
    } else {
      this.$lineModeRadio.attr('checked', false)
    }
  }

  _setTailEndStyle (tailEndStyle) {
    if (_.isNumber(tailEndStyle)) {
      this.$tailEndStyleRadio.val([tailEndStyle])
    } else {
      this.$tailEndStyleRadio.attr('checked', false)
    }
  }

  _setHeadEndStyle (headEndStyle) {
    if (_.isNumber(headEndStyle)) {
      this.$headEndStyleRadio.val([headEndStyle])
    } else {
      this.$headEndStyleRadio.attr('checked', false)
    }
  }

  _setStereotypeDisplay (value) {
    if (value) {
      this.$stereotypeDisplaySelect.val(value)
    } else {
      this.$stereotypeDisplaySelect.val(null)
    }
  }

  _setCheckbox ($widget, value) {
    if (_.isBoolean(value)) {
      $widget.prop('checked', value)
    } else {
      $widget.prop('checked', false)
    }
  }

  _setTextHorzAlign (horzAlign) {
    if (_.isNumber(horzAlign)) {
      this.$textHorzAlignRadio.val([horzAlign])
    } else {
      this.$textHorzAlignRadio.attr('checked', false)
    }
  }

  _setTextVertAlign (vertAlign) {
    if (_.isNumber(vertAlign)) {
      this.$textVertAlignRadio.val([vertAlign])
    } else {
      this.$textVertAlignRadio.attr('checked', false)
    }
  }

  _updateStyles (views) {
    if (views && views.length > 0) {
      this.$view.show()
      var fonts = _.map(views, v => { return v.font })
      var fontFace = Element.mergeProps(fonts, 'face')
      var fontSize = Element.mergeProps(fonts, 'size')
      var fillColor = Element.mergeProps(views, 'fillColor')
      var lineColor = Element.mergeProps(views, 'lineColor')
      var fontColor = Element.mergeProps(views, 'fontColor')
      var lineStyle = Element.mergeProps(views, 'lineStyle')
      var lineMode = Element.mergeProps(views, 'lineMode')
      var tailEndStyle = Element.mergeProps(views, 'tailEndStyle')
      var headEndStyle = Element.mergeProps(views, 'tailEndStyle')
      var autoResize = Element.mergeProps(views, 'autoResize')
      var showShadow = Element.mergeProps(views, 'showShadow')
      var wordWrap = Element.mergeProps(views, 'wordWrap')
      var stereotypeDisplay = Element.mergeProps(views, 'stereotypeDisplay')
      var showVisibility = Element.mergeProps(views, 'showVisibility')
      var showNamespace = Element.mergeProps(views, 'showNamespace')
      var showProperty = Element.mergeProps(views, 'showProperty')
      var showType = Element.mergeProps(views, 'showType')
      var suppressAttributes = Element.mergeProps(views, 'suppressAttributes')
      var suppressOperations = Element.mergeProps(views, 'suppressOperations')
      var suppressReceptions = Element.mergeProps(views, 'suppressReceptions')
      var suppressLiterals = Element.mergeProps(views, 'suppressLiterals')
      var suppressColumns = Element.mergeProps(views, 'suppressColumns')
      var textHorzAlign = Element.mergeProps(views, 'horzAlign')
      var textVertAlign = Element.mergeProps(views, 'vertAlign')

      this._setFontFace(fontFace)
      this._setFontSize(fontSize)
      this._setFillColor(fillColor)
      this._setLineColor(lineColor)
      this._setFontColor(fontColor)
      this._setLineStyle(lineStyle)
      this._setLineMode(lineMode)
      this._setTailEndStyle(tailEndStyle)
      this._setHeadEndStyle(headEndStyle)

      this._setCheckbox(this.$autoResizeCheckbox, autoResize)
      this._setCheckbox(this.$showShadowCheckbox, showShadow)
      this._setCheckbox(this.$wordWrapCheckbox, wordWrap)
      this._setStereotypeDisplay(stereotypeDisplay)

      this._setCheckbox(this.$showVisibilityCheckbox, showVisibility)
      this._setCheckbox(this.$showNamespaceCheckbox, showNamespace)
      this._setCheckbox(this.$showPropertyCheckbox, showProperty)
      this._setCheckbox(this.$showTypeCheckbox, showType)

      this._setCheckbox(this.$suppressAttributesCheckbox, suppressAttributes)
      this._setCheckbox(this.$suppressOperationsCheckbox, suppressOperations)
      this._setCheckbox(this.$suppressReceptionsCheckbox, suppressReceptions)
      this._setCheckbox(this.$suppressLiteralsCheckbox, suppressLiterals)
      this._setCheckbox(this.$suppressColumnsCheckbox, suppressColumns)

      this._setTextHorzAlign(textHorzAlign)
      this._setTextVertAlign(textVertAlign)

      if (views.every(v => v instanceof type.FreelineEdgeView)) {
        this.$lineModeWrapper.show()
        this.$lineEndWrapper.show()
      } else {
        this.$lineModeWrapper.hide()
        this.$lineEndWrapper.hide()
      }
      if (views.every(v => v instanceof type.UMLCustomTextView)) {
        this.$textAlignWrapper.show()
      } else {
        this.$textAlignWrapper.hide()
      }
    } else {
      this.$view.hide()
    }
  }

  /**
   * Show styles of a given a list of views
   * @private
   * @param {Array.<View>} views
   */
  show (views) {
    this._views = views
    this._updateStyles(views)
  }

  htmlReady () {
    var strings = {
      defaultFonts: Object.keys(app.fontManager.fonts).sort().map(f => ({ text: f, value: f }))
    }
    const viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/style-editor-view.html'), 'utf8')
    this.$view = $(Mustache.render(viewTemplate, strings))
    this._setupStyleWidgets()
    this.editorsHolder.addEditorView(this.$view)
  }

  appReady () {
    // Add font list to StyleEditor after loading all fonts
    var $fontSelect = this.$view.find('label.font-face > select')
    var defaultFonts = Object.keys(app.fontManager.fonts).sort().map(f => ({ text: f, value: f }))
    _.each(defaultFonts, font => {
      var s = "<option value='{{value}}'>{{text}}</option>"
      $fontSelect.append(Mustache.render(s, font))
    })
    this.show(null)
  }

}

module.exports = StyleEditorView
