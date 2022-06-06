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
const ViewUtils = require('../utils/view-utils')
const Strings = require('../strings')

const dialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/tag-editor-dialog.html'), 'utf8')

const itemTemplate = `
<div style='padding: 0.2em;' class='tag-item'>
  <div style='display:flex;justify-content:space-between'>
    <div>
      <span class='k-sprite #=icon#'></span>
      <span style='#if (!tagId) {# opacity:0.5 #}#'>#:text#</span>
      <span style='opacity:0.5;margin-left:0.25em'>#:stereotype#</span>
    </div>
    <div>
      #if (valueIcon) {#<span class='k-sprite #=valueIcon#'></span>#}#
      <span class='tag-kind-#:kind#'>#:value#</span>
    </div>
  </div>
</div>
`

/**
 * Tag Editor Dialog
 */
class TagEditorDialog {

  constructor () {
    /**
     * DataSource for ListView
     * @private
     * @type {kendo.data.DataSource}
     */
    this.dataSource = new kendo.data.DataSource()
  }

  getValidFields (tag) {
    switch (tag.kind) {
    case 'boolean':
      return {
        name: tag.name,
        kind: tag.kind,
        checked: tag.checked,
        hidden: tag.hidden
      }
    case 'number':
      return {
        name: tag.name,
        kind: tag.kind,
        number: tag.number,
        hidden: tag.hidden
      }
    case 'reference':
      return {
        name: tag.name,
        kind: tag.kind,
        reference: tag.reference,
        hidden: tag.hidden
      }
    default: // string, others
      return {
        name: tag.name,
        kind: tag.kind,
        value: tag.value,
        hidden: tag.hidden
      }
    }
  }

  toDataItem (tag, attr) {
    return {
      id: tag ? tag._id : attr._id,
      tagId: tag ? tag._id : null,
      attrId: attr ? attr._id : null,
      icon: tag ? tag.getNodeIcon() : '',
      text: tag ? tag.name : attr.name,
      stereotype: attr ? `«${attr._parent.name}»` : '',
      kind: tag ? tag.kind : 'string',
      value: tag ? tag.getValueString() : '',
      valueIcon: (tag && tag.reference && tag.kind === 'reference') ? tag.reference.getNodeIcon() : ''
    }
  }

  updateDataItem (dataItem, values) {
    if (values.name) dataItem.set('text', values.name)
    dataItem.set('kind', values.kind)
    dataItem.set('value', values.value)
    if (values.tagId) dataItem.set('tagId', values.tagId)
    if (values.icon) dataItem.set('icon', values.icon)
    dataItem.set('valueIcon', (values.reference && values.kind === 'reference') ? values.reference.getNodeIcon() : null)
  }

  updateDataSource (elem) {
    this.dataSource.data([])
    let attrs = []
    if (elem.stereotype instanceof type.UMLStereotype) {
      attrs = elem.stereotype.attributes.concat(elem.stereotype.getInheritedAttributes())
      attrs = attrs.sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
    }
    const tags = elem.tags.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
    attrs.forEach(attr => {
      const tag = tags.find(t => t.name === attr.name)
      if (tag) {
        tag.__attribute = attr
      }
      this.dataSource.add(this.toDataItem(tag, attr))
    })
    const unboundTags = tags.filter(t => !t.__attribute)
    unboundTags.forEach(tag => {
      this.dataSource.add(this.toDataItem(tag, null))
    })
  }

  /**
   * Show Tag Editor Dialog.
   *
   * @param {Core.Model} elem An element
   * @return {Dialog}
   */
  showDialog (elem) {
    var context = { Strings: Strings, name: elem.name }
    var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context), true, function ($dlg) {})
    var $dlg = dialog.getElement()
    var $listview = $dlg.find('.listview')
    var $addElement = $dlg.find('.add-element')
    var $deleteElement = $dlg.find('.delete-element')
    var $editElement = $dlg.find('.edit-element')

    var $wrapper = $dlg.find('.listview-wrapper')
    ViewUtils.addScrollerShadow($wrapper, null, true)

    // Setup ListView
    this.updateDataSource(elem)
    $listview.kendoListView({
      dataSource: this.dataSource,
      template: itemTemplate,
      selectable: true
    })
    $listview.on('dblclick', '.tag-item', function () {
      $editElement.click()
    })
    var listview = $listview.data('kendoListView')

    $addElement.click(() => {
      app.tagValueEditorDialog.showDialog(null, null)
        .then(({buttonId, returnValue}) => {
          if (buttonId === 'ok') {
            const fields = this.getValidFields(returnValue)
            const createdTag = app.factory.createModel({
              id: 'Tag',
              parent: elem,
              field: 'tags',
              modelInitializer: (m) => {
                Object.assign(m, fields)
              }
            })
            returnValue.value = createdTag.getValueString()
            returnValue.tagId = createdTag._id
            returnValue.icon = createdTag.getNodeIcon()
            const dataItem = this.toDataItem(createdTag, null)
            this.dataSource.add(dataItem)
          }
        })
    })

    $deleteElement.click(() => {
      var selected = listview.select()
      if (selected && selected.length > 0) {
        const dataItem = this.dataSource.getByUid(selected[0].dataset.uid)
        const tag = dataItem.tagId ? app.repository.get(dataItem.tagId) : null
        const attr = dataItem.attrId ? app.repository.get(dataItem.attrId) : null
        if (tag) {
          const buttonId = app.dialogs.showConfirmDialog(`Delete this tag?`)
          if (buttonId === 'ok') {
            app.engine.deleteElements([tag], [])
            if (attr) {
              dataItem.set('id', attr._id)
              dataItem.set('tagId', null)
              dataItem.set('icon', '')
              dataItem.set('value', '')
              dataItem.set('valueIcon', '')
            } else {
              this.dataSource.remove(dataItem)
            }
          }
        }
      }
    })

    $editElement.click(() => {
      var selected = listview.select()
      if (selected && selected.length > 0) {
        const dataItem = this.dataSource.getByUid(selected[0].dataset.uid)
        const tag = dataItem.tagId ? app.repository.get(dataItem.tagId) : null
        const attr = dataItem.attrId ? app.repository.get(dataItem.attrId) : null
        app.tagValueEditorDialog.showDialog(tag, attr)
          .then(({buttonId, returnValue}) => {
            if (buttonId === 'ok') {
              const fields = this.getValidFields(returnValue)
              if (tag) {
                app.engine.setProperties(tag, fields)
                returnValue.value = tag.getValueString()
                this.updateDataItem(dataItem, returnValue)
              } else {
                const createdTag = app.factory.createModel({
                  id: 'Tag',
                  parent: elem,
                  field: 'tags',
                  modelInitializer: (m) => {
                    Object.assign(m, fields)
                  }
                })
                returnValue.value = createdTag.getValueString()
                returnValue.tagId = createdTag._id
                returnValue.icon = createdTag.getNodeIcon()
                this.updateDataItem(dataItem, returnValue)
              }
            }
          })
      }
    })

    return dialog
  }
}

module.exports = TagEditorDialog
