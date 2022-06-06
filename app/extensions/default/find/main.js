/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const Mustache = require('mustache')
const fs = require('fs')
const path = require('path')
const keycode = require('keycode')

const findDialogTemplate = fs.readFileSync(path.join(__dirname, 'find-dialog.html'), 'utf8')
const findResultPanelTemplate = fs.readFileSync(path.join(__dirname, 'find-result-panel.html'), 'utf8')

var $findResultPanel, $title, $close, $listView

var findResultPanel

/**
 * DataSource for ListView
 * @type {kendo.data.DataSource}
 */
var dataSource = new kendo.data.DataSource()

/**
 * Show Find Dialog
 * @return {$.Promise}
 */
function showFindDialog () {
  var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(findDialogTemplate), true, function ($dlg) {
    var val = {
      keyword: $dlg.find('.keyword').val(),
      caseSensitive: $dlg.find('.case-sensitive').is(':checked'),
      findInDocumentation: $dlg.find('.find-in-documentation').is(':checked')
    }
    $dlg.data('returnValue', val)
  })
  var $dlg = dialog.getElement()
  var $keyword = $dlg.find('.keyword')
  // Focus on keyword input
  $keyword.focus()

  // Keydown Event
  // TODO: This is temporal implementation.
  // Please refer to KeyBindingManager.js of Brackets' implementation
  $keyword.keydown(function (event) {
    switch (event.which) {
    case keycode('return'):
      $dlg.find('.primary').click()
      break
    }
  })
  return dialog
}

/**
 * Find elements
 * @param {string} keyword
 * @param {boolean} caseSensitive
 * @param {boolean} findInDocumentation
 */
function findElements (keyword, caseSensitive, findInDocumentation) {
  var elements = app.repository.findAll(function (elem) {
    if (keyword.trim() === '') {
      return false
    }
    if (elem instanceof type.Model) {
      var searchTarget = elem.name
      if (findInDocumentation && typeof elem.documentation === 'string') {
        searchTarget += '\n' + elem.documentation
      }
      if (!caseSensitive) {
        searchTarget = searchTarget.toLowerCase()
        keyword = keyword.toLowerCase()
      }
      if (searchTarget.indexOf(keyword) > -1) {
        return true
      }
    }
    return false
  })
  return elements
}

function clearItems () {
  dataSource.data([])
}

function addItem (element) {
  dataSource.add({
    elementId: element._id,
    elementIcon: element.getNodeIcon(),
    elementName: element.getPathname()
  })
}

function handleFind () {
  showFindDialog().then(({buttonId, returnValue}) => {
    var i, len
    if (buttonId === 'ok') {
      clearItems()
      var found = findElements(returnValue.keyword, returnValue.caseSensitive, returnValue.findInDocumentation)
      for (i = 0, len = found.length; i < len; i++) {
        addItem(found[i])
      }
      $title.html('Find Results "' + returnValue.keyword + '" — ' + found.length + ' elements.')
      findResultPanel.show()
    }
  })
}

function init () {
  // Setup Find Result Panel
  $findResultPanel = $(findResultPanelTemplate)
  $title = $findResultPanel.find('.title')
  $close = $findResultPanel.find('.close')
  $close.click(function () {
    findResultPanel.hide()
  })
  $listView = $findResultPanel.find('.listview')
  findResultPanel = app.panelManager.createBottomPanel('?', $findResultPanel, 29)
  $listView.kendoListView({
    dataSource: dataSource,
    template: "<div><span><span class='k-sprite #=elementIcon#'></span>#:elementName#</span></div>",
    selectable: true,
    change: function () {
      var data = dataSource.view()
      var item = data[this.select().index()]
      var element = app.repository.get(item.elementId)
      if (element) {
        app.modelExplorer.select(element, true)
      }
    }
  })
  // Register Commands
  app.commands.register('find:find', handleFind, 'Find')
}

exports.init = init
