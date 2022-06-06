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

const {
  Canvas,
  GridFactor,
  ZoomFactor
} = app.type

const PREFERENCE_KEY = 'view.minimap.visibility'
const MINIMAP_WIDTH = 120
const MINIMAP_HEIGHT = 90

var $minimap = $("<canvas id='minimap'></canvas>")
var $button = $("<a id='toolbar-minimap' href='#' title='右下小窗'></a>")
var $diagramArea
var currentDiagram
var currentScale
var canvasElement
var canvas

/**
 * Show Minimap
 */
function show () {
  $minimap.show()
  $button.addClass('selected')
  updateMenus()
  app.preferences.set(PREFERENCE_KEY, true)
  if (currentDiagram) {
    paintDiagram(currentDiagram)
  }
}

/**
 * Hide Minimap
 */
function hide () {
  $minimap.hide()
  $button.removeClass('selected')
  updateMenus()
  app.preferences.set(PREFERENCE_KEY, false)
}

/**
 * Check Minimap's visible
 */
function isVisible () {
  return $minimap.is(':visible')
}

/**
 * Toggle Minimap
 */
function toggle () {
  if (isVisible()) {
    hide()
  } else {
    show()
  }
}

/**
 * Clear Minimap
 */
function clear () {
  canvas.context.clearRect(0, 0, canvasElement.width, canvasElement.height)
}

/**
 * Draw Viewport
 */
function drawViewport (scale) {
  var zoom = app.diagrams.getZoomLevel()
  // var x = Math.floor(($diagramArea.scrollLeft() * scale) / zoom) + 0.5
  // var y = Math.floor(($diagramArea.scrollTop() * scale) / zoom) + 0.5
  var origin = app.diagrams.getEditor().getOrigin()
  var x = Math.floor((-origin.x * scale)) + 0.5
  var y = Math.floor((-origin.y * scale)) + 0.5
  var w = Math.floor(($diagramArea.width() * scale) / zoom)
  var h = Math.floor(($diagramArea.height() * scale) / zoom)
  if (w >= MINIMAP_WIDTH) { w = MINIMAP_WIDTH - 1 }
  if (h >= MINIMAP_HEIGHT) { h = MINIMAP_HEIGHT - 1 }
  canvas.context.save()
  canvas.context.beginPath()
  canvas.context.scale(canvas.ratio, canvas.ratio)
  canvas.context.strokeStyle = '#4f99ff'
  canvas.context.rect(x, y, w, h)
  canvas.context.stroke()
  canvas.context.restore()
}

/**
 * Paint diagram on Minimap
 */
function paintDiagram (diagram) {
  if (isVisible()) {
    var area = diagram.getBoundingBox()
    var vx = $diagramArea.scrollLeft() + $diagramArea.width() // viewport right
    var vy = $diagramArea.scrollTop() + $diagramArea.height() // viewport bottom
    var right = Math.max(area.x2, vx)
    var bottom = Math.max(area.y2, vy)
    var xr = MINIMAP_WIDTH / right
    var yr = MINIMAP_HEIGHT / bottom
    var scale = Math.min(xr, yr)
    currentScale = scale
    canvas.zoomFactor.numer = currentScale
    clear()
    diagram.drawDiagram(canvas, false)
    drawViewport(currentScale)
  }
}

function scrollTo (minimapX, minimapY, animation) {
  var x = Math.floor(minimapX / currentScale)
  var y = Math.floor(minimapY / currentScale)
  app.diagrams.scrollTo(x, y, animation)
}

function updateMenus () {
  let checkStates = {
    'view.minimap': isVisible()
  }
  app.menu.updateStates(null, null, checkStates)
}

function init () {
  // Minimap
  $('#diagram-area-wrapper').append($minimap)
  let minimapDragging = false
  $minimap.mousedown(function (event) {
    minimapDragging = true
    scrollTo(event.offsetX, event.offsetY, false)
  })
  $minimap.mousemove(function (event) {
    event.stopPropagation()
    if (minimapDragging) {
      scrollTo(event.offsetX, event.offsetY, false)
    }
  })
  $minimap.mouseup(function (event) {
    minimapDragging = false
    scrollTo(event.offsetX, event.offsetY)
  })
  $('body').mouseup(function (event) {
    minimapDragging = false
  })

  // Toolbar Button
  $('#toolbar .buttons').append($button)
  $button.click(function () {
    app.commands.execute('minimap:toggle')
  })

  // Minimap Canvas
  canvasElement = document.getElementById('minimap')
  canvasElement.width = MINIMAP_WIDTH
  canvasElement.height = MINIMAP_HEIGHT
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

  // Handle events for DiagramManager
  app.diagrams.on('repaint', function (editor) {
    try {
      currentDiagram = editor.diagram
      paintDiagram(currentDiagram)
    } catch (err) {
      console.error(err)
    }
  })

  app.diagrams.on('currentDiagramChanged', function (diagram, editor) {
    try {
      if (diagram) {
        currentDiagram = diagram
        paintDiagram(currentDiagram)
      } else {
        currentDiagram = null
        clear()
      }
    } catch (err) {
      console.error(err)
    }
  })

  app.diagrams.getEditor().on('scroll', () => {
    if (currentDiagram) {
      paintDiagram(currentDiagram)
    }
  })

  app.diagrams.getEditor().on('zoom', () => {
    if (currentDiagram) {
      paintDiagram(currentDiagram)
    }
  })

  $diagramArea = $('#diagram-area')

  // Register Commands
  app.commands.register('minimap:toggle', toggle, 'Toggle Minimap View')

  // Load Preference
  var visible = app.preferences.get(PREFERENCE_KEY)
  if (visible === true || visible === null) {
    show()
  } else {
    hide()
  }
}

exports.init = init
