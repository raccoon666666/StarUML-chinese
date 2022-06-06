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
 * DocumentationEditor View
 * @private
 */
class DocumentationEditorView extends EventEmitter {

  constructor () {
    super()

    this.$view = null

    this._element = null

    this.editorsHolder = null
  }

  /**
   * Show documentation of a given element
   * @private
   *
   * @param {Model} elem
   */
  show (elem) {
    if (elem instanceof type.ExtensibleModel) {
      this.$view.show()
      this._element = elem
      $('#documentation').val(this._element.documentation)
    } else {
      this.$view.hide()
      this._element = null
    }
  }

  htmlReady () {
    let self = this
    const viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/documentation-editor-view.html'), 'utf8')
    this.$view = $(viewTemplate)
    var $documentation = this.$view.find('#documentation')
    $documentation.change(function () {
      self.emit('documentationChanged', self._element, $documentation.val())
    })
    this.editorsHolder.addEditorView(this.$view)
  }

}

module.exports = DocumentationEditorView
