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

// TODO: 키보드 처리 (ESC = Cancel, Enter = OK)
// TODO: getChildren, getText, getIcon, getNode는 ModelExplorer와 중복 코드임. (중복제거요망)

const _ = require('lodash')
const fs = require('fs')
const Mustache = require('mustache')
const path = require('path')
const PreferenceManager = app.preferences
const Strings = require('../strings')

const dialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog.html'), 'utf8')
const sectionTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog-section.html'), 'utf8')
const restoreTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog-restore.html'), 'utf8')
const stringItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog-item-string.html'), 'utf8')
const comboItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog-item-combo.html'), 'utf8')
const checkItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog-item-check.html'), 'utf8')
const colorItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog-item-color.html'), 'utf8')
const numberItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog-item-number.html'), 'utf8')
const dropdownItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/preference-dialog-item-dropdown.html'), 'utf8')

var $itemGrid = null

function renderSection (item) {
  $itemGrid.append(Mustache.render(sectionTemplate, item))
}

function renderStringItem (item) {
  var $item = $(Mustache.render(stringItemTemplate, item))
  var $edit = $item.find('input')

  $itemGrid.append($item)

  $edit.change(function () {
    PreferenceManager.set(item.key, $edit.val())
  })
}

function renderCheckItem (item) {
  var $item = $(Mustache.render(checkItemTemplate, item))
  var $check = $item.find('input')

  $itemGrid.append($item)

  $check.change(function () {
    PreferenceManager.set(item.key, $check.is(':checked'))
  })
}

function renderNumberItem (item) {
  if (!item.width) {
    item.width = '4em'
  }

  var $item = $(Mustache.render(numberItemTemplate, item))
  var $edit = $item.find('input')

  $itemGrid.append($item)

  $edit.change(function () {
    var val = parseInt($edit.val())
    if (_.isNumber(val)) {
      PreferenceManager.set(item.key, val)
    }
  })
}

function renderComboItem (item) {
  item.width = (_.max(_.map(item.options, function (x) { return x.text.length })) + 2.5) + 'em'

  var $item = $(Mustache.render(comboItemTemplate, item))
  var $edit = $item.find('.k-combo > input')
  var $select = $item.find('.k-combo > select')

  $itemGrid.append($item)

  $edit.change(function () {
    var val = $edit.val()
    if (_.isString(val) && _.isNumber(item.default)) {
      val = parseInt(val)
    }
    PreferenceManager.set(item.key, val)
  })

  $select.val(item.value)
  $select.change(function () {
    $edit.val($select.val())
    $edit.change()
  })
  // (for Windows) To prevent immediate collapse of dropdown in comboBox.
  $select.click(function (e) {
    $select.focus()
    e.stopPropagation()
    return false
  })
}

function renderDropdownItem (item) {
  var $item = $(Mustache.render(dropdownItemTemplate, item))
  var $dropdown = $item.find('select')

  $itemGrid.append($item)

  $dropdown.val(item.value)
  $dropdown.change(function () {
    var val = $dropdown.val()
    if (item.default && _.isNumber(item.default)) {
      val = parseInt($dropdown.val())
    }
    PreferenceManager.set(item.key, val)
  })
}

function renderColorItem (item) {
  var $item = $(Mustache.render(colorItemTemplate, item))
  var $color = $item.find("input[type='color']")

  $itemGrid.append($item)

  $color.kendoColorPicker({
    change: function (e) {
      PreferenceManager.set(item.key, e.value)
    }
  })
  var colorPicker = $color.data('kendoColorPicker')
  colorPicker.value(item.value)

  if (item['default-button']) {
    var $defaultButton = $item.find('button.default-button')
    $defaultButton.click(function () {
      colorPicker.value(null)
      PreferenceManager.set(item.key, null)
    })
  }
}

function renderFontItem (item) {
  item.options = Object.keys(app.fontManager.fonts).sort().map(f => ({ text: f, value: f }))
  renderComboItem(item)
}

function renderRestoreDefaultSettings (schemaId) {
  var $item = $(Mustache.render(restoreTemplate, {}))
  var $button = $item.find('button')

  $itemGrid.append($item)

  $button.click(function () {
    var schema = PreferenceManager.getSchema(schemaId)
    var key, item
    for (key in schema) {
      if (schema.hasOwnProperty(key)) {
        item = schema[key]
        if (typeof item.default !== 'undefined') {
          PreferenceManager.set(key, item.default)
        }
      }
    }
    _.defer(function () {
      renderSchema(schemaId, schema)
    })
  })
}

/**
 * @private
 * Render Preference Schema
 */
function renderSchema (id, schema) {
  $itemGrid.empty()

  var key, item
  for (key in schema) {
    if (schema.hasOwnProperty(key)) {
      item = schema[key]
      item.key = key
      item.value = PreferenceManager.get(key)

      switch (item.type) {
      case 'section':
        renderSection(item)
        break
      case 'string':
        renderStringItem(item)
        break
      case 'check':
        renderCheckItem(item)
        break
      case 'number':
        renderNumberItem(item)
        break
      case 'combo':
        renderComboItem(item)
        break
      case 'dropdown':
        renderDropdownItem(item)
        break
      case 'color':
        renderColorItem(item)
        break
      case 'font':
        renderFontItem(item)
        break
      }
    }
  }

  renderRestoreDefaultSettings(id)
}

/**
 * Show Preference Dialog
 * @private
 * @param {string} preferenceId
 * @return {Dialog}
 */
function showDialog (preferenceId) {
  var context = {
    Strings: Strings
  }
  var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context), true, function ($dlg) {})
  var $dlg = dialog.getElement()
  var $schemaList = $dlg.find('.schema-section .listview')

  // Item Container
  $itemGrid = $dlg.find('.item-section .grid')

  // Preference Schema ListView
  var _data = []
  _.forEach(PreferenceManager.getSchemaIds(), function (id) {
    _data.push({
      id: id,
      text: PreferenceManager.getSchemaName(id)
    })
  })

  var dataSource = new kendo.data.DataSource({ data: _data })
  $schemaList.kendoListView({
    dataSource: dataSource,
    selectable: true,
    template: '<div>#:text#</div>',
    change: function () {
      var data = dataSource.view()
      var item = data[this.select().index()]
      var schema = PreferenceManager.getSchema(item.id)
      renderSchema(item.id, schema)
    }
  })
  var schemaListView = $schemaList.data('kendoListView')

  schemaListView.select(schemaListView.element.children().first())

  // Show Specific Preference for a given preferenceId
  if (preferenceId) {
    var i, len
    var data = dataSource.view()
    for (i = 0, len = data.length; i < len; i++) {
      if (data[i].id === preferenceId) {
        schemaListView.select(schemaListView.element.children()[i])
        break
      }
    }
  }

  return dialog
}

// Public API
exports.showDialog = showDialog
