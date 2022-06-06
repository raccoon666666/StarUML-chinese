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

/* global C2S */

const fs = require('fs-extra')
const filenamify = require('filenamify')
const PDFDocument = require('pdfkit')
const {Point, ZoomFactor, Canvas} = require('../core/graphics')
const {PDFCanvas} = require('./pdf-graphics')
require('./canvas2svg')

const PDF_MARGIN = 30
const PDF_DEFAULT_ZOOM = 1 // Default Zoom Level

/**
 * @private
 * Get Base64-encoded image data of diagram
 * @param {Editor} editor
 * @param {string} type (e.g. 'image/png')
 * @return {string}
 */
function getImageData (diagram, type) {
  // Make a new canvas element for making image data
  var canvasElement = document.createElement('canvas')
  var canvas = new Canvas(canvasElement.getContext('2d'))
  var boundingBox = diagram.getBoundingBox(canvas)
  var rectExpand = 10

  // Initialize new canvas
  boundingBox.expand(rectExpand)
  canvas.origin = new Point(-boundingBox.x1, -boundingBox.y1)
  canvas.zoomFactor = new ZoomFactor(1, 1)
  canvasElement.width = boundingBox.getWidth() + 30
  canvasElement.height = boundingBox.getHeight() + 30

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

  // Draw white background only for JPEG
  if (type === 'image/jpeg') {
    canvas.context.fillStyle = '#ffffff'
    canvas.context.fillRect(0, 0, canvasElement.width, canvasElement.height)
  }

  // Draw watermark if apllication is not registered
  if (app.licenseManager.getStatus() !== true) {
    canvas.context.font = '24px Arial'
    canvas.context.fillStyle = '#eeeeee'
    for (var i = 0, wx = canvasElement.width; i < wx; i = i + 200) {
      for (var j = 0, wy = canvasElement.height; j < wy; j = j + 30) {
        canvas.context.fillText('UNREGISTERED', i, j)
      }
    }
  }

  // Draw diagram to the new canvas
  diagram.arrangeDiagram(canvas)
  diagram.drawDiagram(canvas)

  // Return the new canvas to base64-encoded data
  var data = canvasElement.toDataURL(type).replace(/^data:image\/(png|jpeg);base64,/, '')
  return data
}

/**
 * @private
 * Get SVG image data of editor.diagram
 * @param {Diagram} diagram
 * @return {string}
 */
function getSVGImageData (diagram) {
  // Make a new SVG canvas for making SVG image data
  var c2s = new C2S()
  var canvas = new Canvas(c2s)
  var boundingBox
  var rectExpand = 10

  // Initialize new SVG Canvas
  boundingBox = diagram.getBoundingBox(canvas)
  boundingBox.expand(rectExpand)
  canvas.origin = new Point(-boundingBox.x1, -boundingBox.y1)
  canvas.zoomFactor = new ZoomFactor(1, 1)
  c2s.setWidth(boundingBox.getWidth())
  c2s.setHeight(boundingBox.getHeight())

  // Draw watermark if apllication is not registered
  if (app.licenseManager.getStatus() !== true) {
    canvas.context.font = '24px Arial'
    canvas.context.fillStyle = '#eeeeee'
    for (var i = 0, wx = boundingBox.getWidth(); i < wx; i = i + 200) {
      for (var j = 0, wy = boundingBox.getHeight(); j < wy; j = j + 30) {
        canvas.context.fillText('UNREGISTERED', i, j)
      }
    }
  }

  // Draw diagram to the new SVG Canvas
  diagram.arrangeDiagram(canvas)
  diagram.drawDiagram(canvas)

  // Return the SVG data
  var data = c2s.getSerializedSvg(true)
  return data
}

/**
 * @private
 * Export Diagram as PNG
 *
 * @param {Diagram} diagram
 * @param {string} fullPath
 */
function exportToPNG (diagram, fullPath) {
  diagram.deselectAll()
  var data = getImageData(diagram, 'image/png')
  var buffer = Buffer.from(data, 'base64')
  fs.writeFileSync(fullPath, buffer)
}

/**
 * @private
 * Export Diagram as JPEG
 *
 * @param {Diagram} diagram
 * @param {string} fullPath
 */
function exportToJPEG (diagram, fullPath) {
  diagram.deselectAll()
  var data = getImageData(diagram, 'image/jpeg')
  var buffer = Buffer.from(data, 'base64')
  fs.writeFileSync(fullPath, buffer)
}

/**
 * @private
 * Export Diagram as SVG
 *
 * @param {Diagram} diagram
 * @param {string} fullPath
 */
function exportToSVG (diagram, fullPath) {
  diagram.deselectAll()
  var data = getSVGImageData(diagram)
  fs.writeFileSync(fullPath, data, 'utf8')
}

/**
 * @private
 * Export a list of diagrams
 *
 * @param {string} format One of `png`, `jpg`, `svg`.
 * @param {Array<Diagram>} diagrams
 * @param {string} basePath
 */
function exportAll (format, diagrams, basePath) {
  if (diagrams && diagrams.length > 0) {
    const path = basePath + '/' + format
    fs.ensureDirSync(path)
    diagrams.forEach((diagram, idx) => {
      var fn = path + '/' + filenamify(diagram.getPathname()) + '_' + idx + '.' + format
      switch (format) {
      case 'png':
        return exportToPNG(diagram, fn)
      case 'jpg':
        return exportToJPEG(diagram, fn)
      case 'svg':
        return exportToSVG(diagram, fn)
      }
    })
  }
}

/**
 * @private
 * Export diagrams to a PDF file
 * @param{Array<Diagram>} diagrams
 * @param{string} fullPath
 * @param{Object} options
 */
function exportToPDF (diagrams, fullPath, options) {
  var doc = new PDFDocument(options)
  for (var name in app.fontManager.files) {
    const path = app.fontManager.files[name]
    doc.registerFont(name, path)
  }
  doc.pipe(fs.createWriteStream(fullPath))
  var i, len
  for (i = 0, len = diagrams.length; i < len; i++) {
    var canvas = new PDFCanvas(doc)
    if (i > 0) {
      doc.addPage(options)
    }
    var diagram = diagrams[i]
    var box = diagram.getBoundingBox(canvas)
    var w = doc.page.width - PDF_MARGIN * 2
    var h = doc.page.height - PDF_MARGIN * 2
    var zoom = Math.min(w / box.x2, h / box.y2)
    canvas.baseOrigin.x = PDF_MARGIN
    canvas.baseOrigin.y = PDF_MARGIN
    canvas.baseScale = Math.min(zoom, PDF_DEFAULT_ZOOM)

    // Draw watermark if application is not registered
    if (app.licenseManager.getStatus() !== true) {
      canvas.context.font('Helvetica')
      canvas.context.fontSize(8)
      canvas.context.fillColor('#eeeeee')
      for (var ii = 0, wx = doc.page.width; ii < wx; ii = ii + 70) {
        for (var jj = 0, wy = doc.page.height; jj < wy; jj = jj + 10) {
          canvas.context.text('UNREGISTERED', ii, jj, { lineBreak: false })
        }
      }
    }

    diagram.arrangeDiagram(canvas)
    diagram.drawDiagram(canvas, false)

    if (options.showName) {
      doc.fontSize(10)
      doc.font('Helvetica')
      canvas.textOut(0, -10, diagram.getPathname())
    }
  }
  doc.end()
}

exports.getImageData = getImageData
exports.getSVGImageData = getSVGImageData
exports.exportToPNG = exportToPNG
exports.exportToJPEG = exportToJPEG
exports.exportToSVG = exportToSVG
exports.exportAll = exportAll
exports.exportToPDF = exportToPDF
