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
const ViewUtils = require('../utils/view-utils')
const Strings = require('../strings')
const _ = require('lodash')

const dialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/element-list-editor-dialog.html'), 'utf8')

/**
 * Element List Editor Dialog
 */
class ElementListEditorDialog {

  constructor () {
    /**
     * DataSource for ListView
     * @private
     * @type {kendo.data.DataSource}
     */
    this.dataSource = new kendo.data.DataSource()
  }

  /**
   * Convert Core.Model to DataSource Item
   * @private
   * @type {kendo.data.DataSource}
   */
  _toDataItem (elem) {
    return {
      id: elem._id,
      icon: elem.getNodeIcon(),
      text: elem.getNodeText(),
      path: elem.getPathname()
    }
  }

  updateDataSource (elem, field) {
    if (_.isArray(elem[field])) {
      this.dataSource.data([])
      var ref = elem[field]
      for (var i = 0, len = ref.length; i < len; i++) {
        var item = ref[i]
        this.dataSource.add(this._toDataItem(item))
      }
    }
  }

  /**
   * Show Element List Editor Dialog.
   *
   * @param {Core.Model} elem
   * @param {string} field Array field name to be listed
   * @return {Dialog}
   */
  showDialog (elem, field) {
    var context = {
      Strings: Strings,
      name: elem.name + '.' + field
    }
    var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context), true, function ($dlg) {})
    var $dlg = dialog.getElement()
    var $listview = $dlg.find('.listview')
    var $addElement = $dlg.find('.add-element')
    var $deleteElement = $dlg.find('.delete-element')
    var $moveUp = $dlg.find('.move-up')
    var $moveDown = $dlg.find('.move-down')

    var $wrapper = $dlg.find('.listview-wrapper')
    ViewUtils.addScrollerShadow($wrapper, null, true)

    // Setup ListView
    this.updateDataSource(elem, field)
    $listview.kendoListView({
      dataSource: this.dataSource,
      template: "<div style='padding: 0.2em;' data-id='#=id#'><span class='k-sprite #=icon#'></span>#:text# (#=path#)</div>",
      selectable: true
    })
    var listview = $listview.data('kendoListView')
    this.listview = listview

    // Add Button
    $addElement.click(() => {
      app.elementPickerDialog.showDialog('Select Element to Add', null, null)
        .then(({buttonId, returnValue}) => {
          if (buttonId === 'ok' && returnValue !== null) {
            app.engine.addItem(elem, field, returnValue)
            this.dataSource.add(this._toDataItem(returnValue))
          }
        })
    })

    // Delete Button
    $deleteElement.click(() => {
      var selected = listview.select()
      if (selected && selected.length > 0) {
        var dataItem = this.dataSource.getByUid(selected[0].dataset.uid)
        var item = app.repository.get(dataItem.id)
        if (item) {
          app.engine.removeItem(elem, field, item)
          this.dataSource.remove(dataItem)
        }
      }
    })

    // Move Up Button
    $moveUp.click(() => {
      var selected = listview.select()
      if (selected && selected.length > 0) {
        var dataItem = this.dataSource.getByUid(selected[0].dataset.uid)
        var item = app.repository.get(dataItem.id)
        if (item) {
          app.engine.moveUp(elem, field, item)
          this.dataSource.remove(dataItem)
          this.dataSource.insert(_.indexOf(elem[field], item), dataItem)
          listview.select(listview.element.find('[data-id="' + item._id + '"]'))
        }
      }
    })

    // Move Down Button
    $moveDown.click(() => {
      var selected = listview.select()
      if (selected && selected.length > 0) {
        var dataItem = this.dataSource.getByUid(selected[0].dataset.uid)
        var item = app.repository.get(dataItem.id)
        if (item) {
          app.engine.moveDown(elem, field, item)
          this.dataSource.remove(dataItem)
          this.dataSource.insert(_.indexOf(elem[field], item), dataItem)
          listview.select(listview.element.find('[data-id="' + item._id + '"]'))
        }
      }
    })

    return dialog
  }

}

module.exports = ElementListEditorDialog
