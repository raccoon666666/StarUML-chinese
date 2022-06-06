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

const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const {ipcRenderer} = require('electron')

const validationResultPanelTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/validation-result-panel.html'), 'utf8')
const validationErrorItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/validation-error-item.html'), 'utf8')

var $validationResultPanel, $title, $close, $listView, $validationStatus

var validationResultPanel

/**
 * @private
 * DataSource for ListView
 * @type {kendo.data.DataSource}
 */
var dataSource = new kendo.data.DataSource()

function validate (filename) {
  if (app.preferences.get('validation.validateModel')) {
    ipcRenderer.send('validate', filename)
  }
}

function clearValidationErrors () {
  dataSource.data([])
}

function addValidationError (item) {
  var element = app.repository.get(item.id)
  if (element) {
    dataSource.add({
      id: item.id,
      ruleId: item.ruleId,
      message: item.message,
      icon: element.getNodeIcon(),
      name: element.name,
      type: element.getClassName()
    })
  }
}

function setValidationErrors (errors) {
  if (Array.isArray(errors) && errors.length > 0) {
    app.statusbar.setValidity(false)
    clearValidationErrors()
    _.each(errors, function (item) {
      addValidationError(item)
    })
    $title.html('Validation Results — ' + errors.length + ' errors.')
  } else {
    app.statusbar.setValidity(true)
    clearValidationErrors()
    $title.html('Validation Results — No errors.')
  }
}

// Setup Validation Result Panel
function htmlReady () {
  $validationResultPanel = $(validationResultPanelTemplate)
  $title = $validationResultPanel.find('.title')
  $close = $validationResultPanel.find('.close')
  $close.click(function () {
    validationResultPanel.hide()
  })
  $listView = $validationResultPanel.find('.listview')
  validationResultPanel = app.panelManager.createBottomPanel('?', $validationResultPanel, 29)
  $listView.kendoListView({
    dataSource: dataSource,
    template: validationErrorItemTemplate,
    selectable: true,
    change: function () {
      var data = dataSource.view()
      var item = data[this.select().index()]
      var element = app.repository.get(item.id)
      if (element) {
        app.modelExplorer.select(element, true)
      }
    }
  })

  // Validation in StatusBar
  $validationStatus = $('.statusbar .validation')
  $validationStatus.click(function () {
    if (validationResultPanel.isVisible()) {
      validationResultPanel.hide()
    } else {
      validationResultPanel.show()
    }
  })

  app.project.on('projectLoaded', (filename, project) => {
    try {
      if (filename) {
        validate(filename)
      }
    } catch (err) {
      console.error(err)
    }
  })

  app.project.on('projectSaved', (filename, project) => {
    try {
      if (filename) {
        validate(filename)
      }
    } catch (err) {
      console.error(err)
    }
  })

  app.project.on('projectClosed', () => {
    try {
      setValidationErrors()
    } catch (err) {
      console.error(err)
    }
  })

  ipcRenderer.on('validation-result', (event, errors) => {
    setValidationErrors(errors)
  })
}

exports.validate = validate
exports.htmlReady = htmlReady
