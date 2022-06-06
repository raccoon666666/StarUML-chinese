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

/* global app, type */
const fs = require('fs')
const Mustache = require('mustache')
const path = require('path')
const Strings = require('../strings')

const dialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/tag-value-editor-dialog.html'), 'utf8')

/**
 * Tag Value Editor Dialog
 */
class TagValueEditorDialog {
  adaptToKind (kind) {
    this.$tagItemString.hide()
    this.$tagItemBoolean.hide()
    this.$tagItemNumber.hide()
    this.$tagItemReference.hide()
    switch (kind) {
    case 'string':
      this.$tagItemString.show()
      break
    case 'boolean':
      this.$tagItemBoolean.show()
      break
    case 'number':
      this.$tagItemNumber.show()
      break
    case 'reference':
      this.$tagItemReference.show()
      break
    default:
      this.$tagItemString.show()
    }
  }

  setValue (tag) {
    switch (tag.kind) {
    case 'string':
      this.$tagValueString.val(tag.value)
      break
    case 'boolean':
      this.$tagValueBoolean.val(tag.checked ? 'true' : 'false')
      break
    case 'number':
      this.$tagValueNumber.val(parseInt(tag.number))
      break
    case 'reference':
      if (tag.reference instanceof type.Model) {
        this.$tagValueReferenceIcon.html(`<span class='k-sprite ${tag.reference.getNodeIcon()}'></span>`)
        this.$tagValueReferenceName.html(`${tag.reference.name}`)
      } else {
        this.$tagValueReferenceIcon.html('')
        this.$tagValueReferenceName.html('')
      }
      break
    default:
    }
  }

  /**
   * Show Tag Value Editor Dialog.
   *
   * @param {Core.Tag} tag A tag element
   * @param {UMLAttribute} attr A corresponding Attribute of Stereotype
   * @return {Dialog}
   */
  showDialog (tag, attr) {
    var context = { Strings: Strings }
    var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context), true, ($dlg) => {
      $dlg.data('returnValue', this.result)
    })
    var $dlg = dialog.getElement()

    this.result = {
      name: '',
      kind: 'string',
      value: '',
      reference: null,
      checked: false,
      number: 0,
      hidden: false
    }
    this.$tagName = $dlg.find('.tag-name > input')
    this.$tagKind = $dlg.find('.tag-kind > select')
    this.$tagItemString = $dlg.find('.tag-value-string')
    this.$tagItemBoolean = $dlg.find('.tag-value-boolean')
    this.$tagItemNumber = $dlg.find('.tag-value-number')
    this.$tagItemReference = $dlg.find('.tag-value-reference')
    this.$tagValueString = $dlg.find('.tag-value-string > textarea')
    this.$tagValueBoolean = $dlg.find('.tag-value-boolean select')
    this.$tagValueNumber = $dlg.find('.tag-value-number > input')
    this.$tagValueReferenceIcon = $dlg.find('.tag-value-reference .icon')
    this.$tagValueReferenceName = $dlg.find('.tag-value-reference .name')
    this.$tagValueReferenceButton = $dlg.find('.tag-value-reference .icon-button')
    this.$tagHidden = $dlg.find('.tag-hidden-property input')

    this.$tagName.change(() => {
      this.result.name = this.$tagName.val()
    })
    this.$tagKind.change(() => {
      const kind = this.$tagKind.val()
      this.result.kind = kind
      this.adaptToKind(kind)
    })
    this.$tagValueString.change(() => {
      this.result.value = this.$tagValueString.val()
    })
    this.$tagValueBoolean.change(() => {
      this.result.checked = this.$tagValueBoolean.val() === 'true'
    })
    this.$tagValueNumber.change(() => {
      this.result.number = this.$tagValueNumber.val()
    })
    this.$tagValueReferenceButton.click(() => {
      app.elementPickerDialog.showDialog('Select Element', tag ? tag.reference : null, type.Model)
        .then(({buttonId, returnValue}) => {
          if (buttonId === 'ok') {
            this.result.reference = returnValue
            this.setValue(this.result)
          }
        })
    })
    this.$tagHidden.change(() => {
      this.result.hidden = this.$tagHidden.is(':checked')
    })

    if (attr) {
      this.$tagName.prop('disabled', true)
    }
    if (tag) {
      Object.assign(this.result, tag)
      this.$tagName.val(tag.name)
      this.$tagKind.val(tag.kind)
      this.adaptToKind(tag.kind)
      this.setValue(tag)
      this.$tagHidden.attr('checked', tag.hidden)
    } else if (attr) {
      this.result.name = attr.name
      this.result.kind = 'string' // default
      if (attr.type instanceof type.Model) {
        this.result.kind = 'reference'
      } else if (typeof attr.type === 'string') {
        const t = attr.type.toLowerCase()
        if (t === 'number' || t === 'integer') {
          this.result.kind = 'number'
        } else if (t === 'boolean') {
          this.result.kind = 'boolean'
        }
      }
      this.$tagName.val(this.result.name)
      this.$tagKind.val(this.result.kind)
      this.adaptToKind(this.result.kind)
    } else {
      this.$tagName.val('')
      this.$tagKind.val('string')
      this.adaptToKind('string')
    }

    return dialog
  }
}

module.exports = TagValueEditorDialog
