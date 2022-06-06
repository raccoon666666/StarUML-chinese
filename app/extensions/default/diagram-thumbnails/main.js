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

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const {
  Canvas,
  GridFactor,
  ZoomFactor
} = app.type

const template = fs.readFileSync(path.join(__dirname, 'diagram-thumbnails-panel.html'), 'utf8')
const itemTemplate = fs.readFileSync(path.join(__dirname, 'diagram-thumbnails-item.html'), 'utf8')

var diagramThumbnailsPanel
var listView
var $diagramThumbnailsPanel
var $listView
var $close
var $button = $("<a id='toolbar-diagram-thumbnails-view' href='#' title='缩略图'></a>")

const PREFERENCE_KEY = 'view.diagramThumbnails.visibility'

var THUMBNAIL_WIDTH = 120
var THUMBNAIL_HEIGHT = 80

/**
* DataSource for ListView
* @type {kendo.data.DataSource}
*/
var dataSource = new kendo.data.DataSource()

/**
* Clear all thumbnails
*/
function _clearThumbnails () {
  dataSource.data([])
}

/**
* Add a thumbnail of diagram
* @param {Diagram} diagram
*/
function _addThumbnail (diagram) {
  dataSource.add({
    id: diagram._id,
    icon: diagram.getNodeIcon(),
    name: diagram.name,
    fullName: diagram.name + (diagram._parent ? ' (from ' + diagram._parent.name + ')' : ''),
    type: diagram.getClassName()
  })
}

/**
* Paint thumbnail on canvas
*/
function _paintThumbnail (diagram) {
  var canvasElement, canvas

  canvasElement = document.getElementById('diagram-thumbnail-canvas-' + diagram._id)
  if (canvasElement) {
    canvasElement.width = THUMBNAIL_WIDTH
    canvasElement.height = THUMBNAIL_HEIGHT
    canvas = new Canvas()
    canvas.context = canvasElement.getContext('2d')
    canvas.gridFactor = new GridFactor(1.0, 1.0)
    canvas.zoomFactor = new ZoomFactor(1.0, 1.0)

    // Setup for High-DPI (Retina) Display
    if (window.devicePixelRatio) {
      var w = canvasElement.width
      var h = canvasElement.height
      canvas.ratio = window.devicePixelRatio
      canvasElement.width = w * canvas.ratio
      canvasElement.height = h * canvas.ratio
      canvasElement.style.width = w + 'px'
      canvasElement.style.height = h + 'px'
    }

    // Paint Diagram
    var area = diagram.getBoundingBox()
    var xr = THUMBNAIL_WIDTH / (area.x2 + 20)
    var yr = THUMBNAIL_HEIGHT / (area.y2 + 20)
    var scale = Math.min(xr, yr)
    canvas.zoomFactor.numer = scale
    canvas.context.clearRect(0, 0, canvasElement.width, canvasElement.height)
    diagram.drawDiagram(canvas, false)
  }
}

function _updateThumbnails () {
  try {
    _clearThumbnails()
    var diagrams = app.repository.findAll(function (e) {
      return (e instanceof type.Diagram)
    })
    diagrams.forEach(dgm => {
      _addThumbnail(dgm)
    })
    _.defer(function () {
      diagrams.forEach(dgm => {
        _paintThumbnail(dgm)

        // click event
        var nameElement = document.getElementById('diagram-thumbnail-name-' + dgm._id)
        if (nameElement) {
          $(nameElement).click(function () {
            app.modelExplorer.select(dgm, true)
            app.diagrams.setCurrentDiagram(dgm)
            app.diagrams.scrollTo(0, 0, true)
          })
        }
      })
    })
  } catch (err) {
    console.error(err)
  }
}

function _elementCreatedHandler (elems) {
  try {
    elems.forEach(elem => {
      elem.traverse(function (e) {
        if (e instanceof type.Diagram) {
          _updateThumbnails()
        }
      })
    })
  } catch (err) {
    console.error(err)
  }
}

function _elementUpdatedHandler (elems) {
  try {
    elems.forEach(elem => {
      if (elem instanceof type.Diagram) {
        var nameElement = document.getElementById('diagram-thumbnail-name-' + elem._id)
        if (nameElement) {
          $(nameElement).text(elem.name)
        }
      }
    })
  } catch (err) {
    console.error(err)
  }
}

function _setupEvents () {
  app.repository.on('created', _elementCreatedHandler)
  app.repository.on('deleted', _elementCreatedHandler)
  app.repository.on('updated', _elementUpdatedHandler)

  app.project.on('projectCreated', _updateThumbnails)
  app.project.on('projectLoaded', _updateThumbnails)
  app.project.on('projectClosed', _updateThumbnails)
  app.project.on('imported', _updateThumbnails)

  app.diagrams.on('repaint', (editor) => {
    try {
      if (diagramThumbnailsPanel.isVisible()) {
        _paintThumbnail(editor.diagram)
      }
    } catch (err) {
      console.error(err)
    }
  })
}

/**
* Show DiagramThumbnails Panel
*/
function show () {
  diagramThumbnailsPanel.show()
  $button.addClass('selected')
  updateMenus()
  app.preferences.set(PREFERENCE_KEY, true)
  _updateThumbnails()
}

/**
* Hide DiagramThumbnails Panel
*/
function hide () {
  diagramThumbnailsPanel.hide()
  $button.removeClass('selected')
  updateMenus()
  app.preferences.set(PREFERENCE_KEY, false)
}

/**
* Toggle DiagramThumbnails Panel
*/
function toggle () {
  if (diagramThumbnailsPanel.isVisible()) {
    hide()
  } else {
    show()
  }
}

function updateMenus () {
  let checkStates = {
    'view.diagram-thumbnails': diagramThumbnailsPanel.isVisible()
  }
  app.menu.updateStates(null, null, checkStates)
}

function _handleSelectDiagram () {
  if (listView.select().length > 0) {
    var data = dataSource.view()
    var item = data[listView.select().index()]
    var dgm = app.repository.get(item.id)
    if (dgm) {
      app.modelExplorer.select(dgm, true)
      app.diagrams.setCurrentDiagram(dgm)
      app.diagrams.scrollTo(0, 0, true)
    }
  }
}

/**
* Initialize Extension
*/
function init () {
  // Toolbar Button
  $('#toolbar .buttons').append($button)
  $button.click(function () {
    app.commands.execute('diagram-thumbnails:toggle')
  })

  // Setup Diagram Thumbnails Panel
  $diagramThumbnailsPanel = $(template)
  $close = $diagramThumbnailsPanel.find('.close')
  $close.click(function () {
    hide()
  })
  diagramThumbnailsPanel = app.panelManager.createBottomPanel('?', $diagramThumbnailsPanel, 29)

  // Setup Diagram Thumbnails List
  $listView = $diagramThumbnailsPanel.find('.listview')
  $listView.kendoListView({
    dataSource: dataSource,
    template: itemTemplate,
    selectable: true,
    change: function () {
      var data = dataSource.view()
      var item = data[this.select().index()]
      var dgm = app.repository.get(item.id)
      if (dgm) {
        app.selections.selectModel(dgm)
      }
    }
  })
  listView = $listView.data('kendoListView')
  $listView.dblclick(function (e) {
    _handleSelectDiagram()
  })

  // Register Commands
  app.commands.register('diagram-thumbnails:toggle', toggle, 'Toggle Diagram Thumbnails View')

  // Handle Events
  _setupEvents()

  // Load Preference
  var visible = app.preferences.get(PREFERENCE_KEY)
  if (visible === true) {
    show()
  } else {
    hide()
  }
}

exports.init = init
