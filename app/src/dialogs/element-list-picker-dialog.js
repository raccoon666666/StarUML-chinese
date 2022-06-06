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
const Mustache = require('mustache')
const ViewUtils = require('../utils/view-utils')
const Strings = require('../strings')

const dialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/element-list-picker-dialog.html'), 'utf8')

/**
 * Element List Picker Dialog
 */
class ElementListPickerDialog {

  constructor () {
    /**
     * DataSource for ListView
     * @private
     * @type {kendo.data.DataSource}
     */
    this.dataSource = new kendo.data.DataSource()

    this.selectedElement = null
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

  updateDataSource (elems) {
    this.dataSource.data([])
    for (var i = 0, len = elems.length; i < len; i++) {
      var item = elems[i]
      this.dataSource.add(this._toDataItem(item))
    }
  }

  /**
   * Show Element List Picker Dialog.
   *
   * @param {string} title
   * @param {Array.<Core.Model>} elems
   * @return {Dialog}
   */
  showDialog (title, elems) {
    var context = {
      Strings: Strings,
      title: title
    }
    var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context), true, ($dlg) => {
      $dlg.data('returnValue', this.selectedElement)
    })

    var $dlg = dialog.getElement()
    var $listview = $dlg.find('.listview')
    var $unspecified = $dlg.find('.unspecified')

    var $wrapper = $dlg.find('.listview-wrapper')
    ViewUtils.addScrollerShadow($wrapper, null, true)

    // Setup ListView
    var self = this
    this.selectedElement = null
    this.updateDataSource(elems)
    $listview.kendoListView({
      dataSource: this.dataSource,
      template: "<div style='padding: 0.2em;'><span class='k-sprite #=icon#' style='margin-right: 3px'></span>#:text# (#=path#)</div>",
      selectable: true,
      change: function (e) {
        var selected = this.select()
        if (selected && selected.length > 0) {
          var dataItem = self.dataSource.getByUid(selected[0].dataset.uid)
          self.selectedElement = app.repository.get(dataItem.id)
          $unspecified.attr('checked', false)
        }
      }
    })
    var listview = $listview.data('kendoListView')

    // Setup Unspecified
    $unspecified.attr('checked', true)
    $unspecified.change(() => {
      var checked = $unspecified.is(':checked')
      if (checked) {
        listview.select($()) // clear selection
        this.selectedElement = null
      }
    })

    return dialog
  }

}

module.exports = ElementListPickerDialog
