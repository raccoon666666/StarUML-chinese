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

const _ = require('lodash')
const fs = require('fs-extra')
const path = require('path')
const filenamify = require('filenamify')
const ejs = require('ejs')
const {ipcRenderer, clipboard, nativeImage, shell} = require('electron')

const {Element, EdgeView} = require('../core/core')
const AboutDialog = require('../dialogs/about-dialog')
const PreferenceDialog = require('../dialogs/preference-dialog')
const EnterLicenseDialog = require('../dialogs/enter-license-dialog')
const PrintDialog = require('../dialogs/print-dialog')
const Strings = require('../strings')
const CheckUpdatesDialog = require('../dialogs/check-updates-dialog')

const DiagramExport = require('./diagram-export')

const Constants = {
  APP_EXT: '.mdj',
  FRAG_EXT: '.mfj'
}

/** Unique token used to indicate user-driven cancellation of Save As (as opposed to file IO error) */
const USER_CANCELED = { userCanceled: true }

const MODEL_FILE_FILTERS = [
  {name: 'Models', extensions: ['mdj']},
  {name: 'All Files', extensions: ['*']}
]

const FRAGMENT_FILE_FILTERS = [
  {name: 'Model Fragments', extensions: ['mfj']},
  {name: 'All Files', extensions: ['*']}
]

const PNG_FILE_FILTERS = [{name: 'PNG', extensions: ['png']}]
const JPEG_FILE_FILTERS = [{name: 'JPEG', extensions: ['jpg']}]
const SVG_FILE_FILTERS = [{name: 'SVG', extensions: ['svg']}]
const PDF_FILE_FILTERS = [{name: 'PDF', extensions: ['pdf']}]

function showFileError (err) {
  app.dialogs.showErrorDialog('File System Error (Error=' + err + ')')
}

/*
 * Application Command Handlers
 */

function handleLog (...args) {
  console.log(...args)
}

function handleMainLog (...args) {
  ipcRenderer.send('console-log', ...args)
}

function beforeQuit () {
  app.diagrams.saveWorkingDiagrams()
}

function handleQuit () {
  beforeQuit()
  ipcRenderer.send('quit')
}

function handleReload () {
  ipcRenderer.send('relaunch')
  handleQuit()
}

/*
 * File Command Handlers
 */

/**
 * @private
 * New Project (from Template)
 * @param {?string} template - Fullpath for a template to be loaded.
 *      If not provided `<APP_BASE>/templates/Default.mdj` will be loaded.
 * @return {type.Project} The created project
 */
function doFileNew (template) {
  if (!template) {
    template = path.join(app.getAppPath(), '/resources/templates/', app.config.defaultTemplate)
  }
  localStorage.removeItem('__working_filename')
  return app.project.loadAsTemplate(template)
}

/**
 * @private
 * Handler for File New
 * @param {string} template
 * @return {type.Project} the created project
 */
function handleNew (template) {
  if (app.repository.isModified()) {
    const result = app.dialogs.showSaveConfirmDialog(app.project.getFilename())
    switch (result) {
    case 'dontsave':
      return doFileNew(template)
    case 'save':
      handleSave()
      return doFileNew(template)
    case 'cancel':
      return false
    }
  } else {
    return doFileNew(template)
  }
}

/**
 * @private
 * Handler for File Save
 * @param {string} fullPath
 * @param {boolean} saveAs
 * @return {type.Project} the saved project
 */
function handleSave (fullPath, saveAs) {
  try {
    // Set focus to body in order to apply changes of documentation editor
    $('#diagram-canvas').focus()
    if (fullPath) {
      return app.project.save(fullPath)
    } else {
      if (app.project.getFilename() && !saveAs) {
        return app.project.save(app.project.getFilename())
      } else {
        var selectedPath = app.dialogs.showSaveDialog('Save Project As', 'Untitled' + Constants.APP_EXT, MODEL_FILE_FILTERS)
        if (selectedPath) {
          if (!path.extname(selectedPath)) {
            selectedPath = selectedPath + Constants.APP_EXT
          }
          return app.project.save(selectedPath)
        }
        return null
      }
    }
  } catch (err) {
    showFileError(err)
  }
}

/**
 * @private
 * File Open
 * @param {string} fullPath
 * @return {type.Project} The loaded project
 */
function doFileOpen (fullPath) {
  try {
    if (app.repository.isModified()) {
      const result = app.dialogs.showSaveConfirmDialog(app.project.getFilename())
      switch (result) {
      case 'dontsave':
        return app.project.load(fullPath)
      case 'save':
        handleSave()
        return app.project.load(fullPath)
      case 'cancel':
        return false
      }
    }
    return app.project.load(fullPath)
  } catch (err) {
    console.log(err)
    app.dialogs.showErrorDialog(`Failed to open ${fullPath}`)
  }
}

/**
 * @private
 * Handler for File Open
 * param {string} fullPath
 * @return {type.Project} The loaded project
 */
function handleOpen (fullPath) {
  if (fullPath) {
    if (app.repository.isModified() || app.project.getFilename()) {
      ipcRenderer.send('command', 'application:open', fullPath)
    } else {
      return doFileOpen(fullPath)
    }
  } else {
    const files = app.dialogs.showOpenDialog(Strings.SELECT_MODEL_FILE, null, MODEL_FILE_FILTERS)
    if (files && files.length > 0) {
      if (app.repository.isModified() || app.project.getFilename()) {
        ipcRenderer.send('command', 'application:open', files[0])
      } else {
        return doFileOpen(files[0])
      }
    }
  }
  return null
}

/**
 * @private
 * Handler for Import Fragment
 * param {string} fullPath
 * @return {type.Element} The imported element
 */
function handleImportFragment (fullPath) {
  if (fullPath) {
    return app.project.importFromFile(app.project.getProject(), fullPath)
  } else {
    const selectedPath = app.dialogs.showOpenDialog(Strings.SELECT_MODEL_FRAGMENT_FILE, null, FRAGMENT_FILE_FILTERS)
    if (selectedPath && selectedPath.length > 0) {
      return app.project.importFromFile(app.project.getProject(), selectedPath[0])
    }
    return null
  }
}

/**
 * @private
 * Asynchronous file export
 * @param {Element} elem
 * @param {string} filename
 * @return {Promise}
 */
function doFileExportAsync (elem, filename) {
  return new Promise((resolve, reject) => {
    try {
      const result = app.project.exportToFile(elem, filename)
      resolve(result)
    } catch (err) {
      showFileError(err)
      console.error(err)
      reject(err)
    }
  })
}

/**
 * @private
 * Handler for Export Fragment
 * param {Element} element
 * param {string} fullPath
 * @return {Promise}
 */
function handleExportFragment (element, fullPath) {
  if (element) {
    if (fullPath) {
      return doFileExportAsync(element, fullPath)
    } else {
      let filename = app.dialogs.showSaveDialog(Strings.EXPORT_MODEL_FRAGMENT, 'Fragment' + Constants.FRAG_EXT, FRAGMENT_FILE_FILTERS)
      if (filename) {
        if (!path.extname(filename)) {
          filename = filename + Constants.FRAG_EXT
        }
        return doFileExportAsync(element, filename)
      } else {
        return Promise.reject(USER_CANCELED)
      }
    }
  } else {
    if (fullPath) {
      app.elementPickerDialog.showDialog(Strings.SELECT_ELEMENT_TO_EXPORT, null, null)
        .then(({buttonId, returnValue}) => {
          if (buttonId === 'ok' && returnValue !== null) {
            return doFileExportAsync(returnValue, fullPath)
          } else {
            return Promise.reject(USER_CANCELED)
          }
        })
    } else {
      app.elementPickerDialog.showDialog(Strings.SELECT_ELEMENT_TO_EXPORT, null, null)
        .then(({buttonId, returnValue}) => {
          if (buttonId === 'ok' && returnValue !== null) {
            let filename = app.dialogs.showSaveDialog(Strings.EXPORT_MODEL_FRAGMENT, 'Fragment' + Constants.FRAG_EXT, FRAGMENT_FILE_FILTERS)
            if (filename) {
              if (!path.extname(filename)) {
                filename = filename + Constants.FRAG_EXT
              }
              return doFileExportAsync(returnValue, filename)
            } else {
              return Promise.reject(USER_CANCELED)
            }
          } else {
            return Promise.reject(USER_CANCELED)
          }
        })
    }
  }
}

/**
 * @private
 * Handler for File Close
 * @return {boolean}
 */
function handleClose () {
  ipcRenderer.send('close-window')
}

/**
 * @private
 * Handler for Preference
 */
function handlePreferences (preferenceId) {
  PreferenceDialog.showDialog(preferenceId)
}

/**
 * @private
 */
function handleExportDiagramToPNG (diagram, fullPath) {
  diagram = diagram || app.diagrams.getCurrentDiagram()
  if (diagram) {
    try {
      if (fullPath) {
        DiagramExport.exportToPNG(diagram, fullPath)
      } else {
        var initialFilePath = filenamify(diagram.name.length > 0 ? diagram.name : 'diagram')
        let filename = app.dialogs.showSaveDialog('Export Diagram as PNG', initialFilePath + '.png', PNG_FILE_FILTERS)
        if (filename) {
          DiagramExport.exportToPNG(diagram, filename)
        }
      }
    } catch (err) {
      console.error('Error while exporting diagram to PNG', err)
    }
  } else {
    app.dialogs.showAlertDialog('No diagram to export.')
  }
}

/**
 * @private
 */
function handleExportDiagramToJPEG (diagram, fullPath) {
  diagram = diagram || app.diagrams.getCurrentDiagram()
  if (diagram) {
    try {
      if (fullPath) {
        DiagramExport.exportToJPEG(diagram, fullPath)
      } else {
        var initialFilePath = filenamify(diagram.name.length > 0 ? diagram.name : 'diagram')
        let filename = app.dialogs.showSaveDialog('Export Diagram as JPEG', initialFilePath + '.jpg', JPEG_FILE_FILTERS)
        if (filename) {
          DiagramExport.exportToJPEG(diagram, filename)
        }
      }
    } catch (err) {
      console.error('Error while exporting diagram to JPEG', err)
    }
  } else {
    app.dialogs.showAlertDialog('No diagram to export.')
  }
}

/**
 * @private
 */
function handleExportDiagramToSVG (diagram, fullPath) {
  diagram = diagram || app.diagrams.getCurrentDiagram()
  if (diagram) {
    try {
      if (fullPath) {
        DiagramExport.exportToSVG(diagram, fullPath)
      } else {
        var initialFilePath = filenamify(diagram.name.length > 0 ? diagram.name : 'diagram')
        let filename = app.dialogs.showSaveDialog('Export Diagram as SVG', initialFilePath + '.svg', SVG_FILE_FILTERS)
        if (filename) {
          DiagramExport.exportToSVG(diagram, filename)
        }
      }
    } catch (err) {
      console.error('Error while exporting diagram to SVG', err)
    }
  } else {
    app.dialogs.showAlertDialog('No diagram to export.')
  }
}

/**
 * @private
 * Export all diagram to PNGs in a folder
 * @param {string} basePath
 */
function handleExportDiagramAllToPNGs (basePath) {
  var diagrams = app.repository.getInstancesOf('Diagram')
  if (diagrams && diagrams.length > 0) {
    try {
      if (basePath) {
        DiagramExport.exportAll('png', diagrams, basePath)
      } else {
        const selectedPath = app.dialogs.showOpenDialog('Select a folder where all diagrams to be exported as PNGs', undefined, undefined, {properties: ['openDirectory', 'createDirectory']})
        if (selectedPath) {
          DiagramExport.exportAll('png', diagrams, selectedPath)
        }
      }
    } catch (err) {
      console.error('Error while exporting all diagrams to PNGs', err)
    }
  } else {
    app.dialogs.showAlertDialog('No diagram to export.')
  }
}

/**
 * @private
 * Export all diagram to JPEGs in a folder
 * @param {string} basePath
 */
function handleExportDiagramAllToJPEGs (basePath) {
  var diagrams = app.repository.getInstancesOf('Diagram')
  if (diagrams && diagrams.length > 0) {
    try {
      if (basePath) {
        DiagramExport.exportAll('jpg', diagrams, basePath)
      } else {
        const selectedPath = app.dialogs.showOpenDialog('Select a folder where all diagrams to be exported as JPEGs', undefined, undefined, {properties: ['openDirectory', 'createDirectory']})
        if (selectedPath) {
          DiagramExport.exportAll('jpg', diagrams, selectedPath)
        }
      }
    } catch (err) {
      console.error('Error while exporting all diagrams to JPEGs', err)
    }
  } else {
    app.dialogs.showAlertDialog('No diagram to export.')
  }
}

/**
 * @private
 * Export all diagram to SVGs in a folder
 * @param {string} basePath
 */
function handleExportDiagramAllToSVGs (basePath) {
  var diagrams = app.repository.getInstancesOf('Diagram')
  if (diagrams && diagrams.length > 0) {
    try {
      if (basePath) {
        DiagramExport.exportAll('svg', diagrams, basePath)
      } else {
        const selectedPath = app.dialogs.showOpenDialog('Select a folder where all diagrams to be exported as SVGs', undefined, undefined, {properties: ['openDirectory', 'createDirectory']})
        if (selectedPath) {
          DiagramExport.exportAll('svg', diagrams, selectedPath)
        }
      }
    } catch (err) {
      console.error('Error while exporting all diagrams to SVGs', err)
    }
  } else {
    app.dialogs.showAlertDialog('No diagram to export.')
  }
}

/**
 * @private
 * Handler for Print to PDF
 */
function handlePrintToPDF () {
  PrintDialog.showDialog().then(function ({buttonId, returnValue}) {
    const printOptions = returnValue
    if (buttonId === 'save') {
      var diagrams = []
      if (printOptions.range === 'current') {
        var current = app.diagrams.getCurrentDiagram()
        if (current) {
          diagrams.push(current)
        }
      } else {
        diagrams = app.repository.getInstancesOf('Diagram')
      }
      if (diagrams.length > 0) {
        var fn = filenamify(app.project.getProject().name)
        let filename = app.dialogs.showSaveDialog('Print to PDF', fn + '.pdf', PDF_FILE_FILTERS)
        if (filename) {
          if (!path.extname(filename)) {
            filename = filename + '.pdf'
          }
          try {
            DiagramExport.exportToPDF(diagrams, filename, printOptions)
          } catch (err) {
            app.dialogs.showErrorDialog('Failed to generate PDF. (Error=' + err + ')')
            console.error(err)
          }
        } else {
          return Promise.reject(USER_CANCELED)
        }
      } else {
        app.dialogs.showAlertDialog('No current diagram.')
      }
    }
  })
}

/*
 * Edit Command Handlers
 */

function inEditMode () {
  return (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA')
}

function handleUndo () {
  if (inEditMode()) {
    ipcRenderer.send('web-contents:undo')
  } else {
    app.repository.undo()
  }
}

function handleRedo () {
  if (inEditMode()) {
    ipcRenderer.send('web-contents:redo')
  } else {
    app.repository.redo()
  }
}

function handleCut () {
  if (inEditMode()) {
    ipcRenderer.send('web-contents:cut')
  } else {
    var models = app.selections.getSelectedModels()
    var views = app.selections.getSelectedViews()
    // Cut Model
    if (models.length === 1 && views.length === 0 && models[0].canCopy()) {
      app.clipboard.setModel(models[0])
      handleDeleteFromModel()
    }
    // Cut Views
    var diagram = app.diagrams.getEditor().diagram
    if (views.length > 0 && diagram && diagram.canCopyViews() && diagram.canDeleteViews()) {
      app.clipboard.setViews(views)
      handleDelete()
    }
  }
}

function handleCopy () {
  if (inEditMode()) {
    ipcRenderer.send('web-contents:copy')
  } else {
    var models = app.selections.getSelectedModels()
    var views = app.selections.getSelectedViews()
    // Copy Model
    if (models.length === 1 && views.length === 0 && models[0].canCopy()) {
      app.clipboard.setModel(models[0])
    }
    // Copy Views: remove views where canCopy() === false
    if (views.length > 0) {
      var diagram = app.diagrams.getEditor().diagram
      for (var i = views.length - 1; i >= 0; i--) {
        if (!views[i].canCopy()) {
          diagram.deselectView(views[i])
        }
      }
      views = diagram.selectedViews
      if (views.length > 0 && diagram && diagram.canCopyViews()) {
        app.clipboard.setViews(views)
      } else {
        if (diagram instanceof type.UMLSequenceDiagram || diagram instanceof type.UMLCommunicationDiagram) {
          app.dialogs.showInfoDialog("Copying view elements in Sequence or Communication Diagram is not supported.\n To copy the entire Sequence or Communication Diagram, copy 'Interaction' or 'Collaboration (or Classifier)' containing the Diagram in Explorer.")
        } else {
          app.dialogs.showInfoDialog('No views to copy or some fo selected views cannot be copied.')
        }
      }
    }
  }
}

function handleCopyDiagramAsImage () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    diagram.deselectAll()
    try {
      var data
      if (process.platform === 'darwin') {
        data = DiagramExport.getImageData(diagram, 'image/png')
      } else {
        data = DiagramExport.getImageData(diagram, 'image/jpeg')
      }
      var buffer = Buffer.from(data, 'base64')
      var rect = diagram.getBoundingBox()
      var image = nativeImage.createFromBuffer(buffer, { width: rect.getWidth(), height: rect.getHeight() })
      clipboard.writeImage(image)
    } catch (err) {
      console.log(err)
    }
  }
}

function handlePaste () {
  if (inEditMode()) {
    ipcRenderer.send('web-contents:paste')
  } else {
    // Paste Model
    if (app.clipboard.hasModel()) {
      let parent = app.selections.getSelected()
      let context = app.clipboard.getCopyContext()
      if (parent && parent.canPaste(app.clipboard.getElementType(), context)) {
        let model = app.clipboard.getModel()
        app.engine.addModel(parent, context.field, model)
      }
    // Paste Views
    } else if (app.clipboard.hasViews()) {
      let views = app.clipboard.getViews()
      let diagram = app.diagrams.getEditor().diagram
      let context = app.clipboard.getCopyContext()
      // Check view's models are exists
      let modelExists = true
      context.refs.forEach(ref => {
        if (!app.repository.get(ref)) {
          modelExists = false
        }
      })
      if (views.length > 0 && diagram && modelExists) {
        // Views in clipboard can be pasted in diagram
        if (diagram.canPasteViews(views)) {
          // Deselect all views.
          app.diagrams.deselectAll()

          // Compute bounding box of views
          var boundingBox = views[0].getBoundingBox()
          var i, len
          for (i = 0, len = views.length; i < len; i++) {
            boundingBox.union(views[i].getBoundingBox())
          }

          // Compute dx, dy to place pasted views on the center of screen
          var areaCenter = app.diagrams.getDiagramArea().getCenter()
          var boundCenter = boundingBox.getCenter()
          var dx = Math.round(areaCenter.x - boundCenter.x)
          var dy = Math.round(areaCenter.y - boundCenter.y)

          // Move views to be paste as (dx, dy).
          for (i = 0, len = views.length; i < len; i++) {
            views[i].move(app.diagrams.getEditor().canvas, dx, dy)
          }

          app.engine.addViews(diagram, views)
          // Select the pasted views.
          var newViews = []
          for (i = 0, len = views.length; i < len; i++) {
            var v = app.repository.get(views[i]._id)
            diagram.selectView(v)
            newViews.push(v)
          }
          app.selections.selectViews(newViews)
        } else {
          app.dialogs.showInfoDialog('Views in clipboard cannot be pasted in this diagram.')
        }
      }
    }
  }
}

/**
 * @private
 * Try to delete views only.
 * 1. If views can be deleted, delete them
 * 2. Otherwise hide them if can be hidden.
 * 3. If views can neither be deleted nor hidden, ask to delete from models
 */
function handleDelete () {
  var diagram = app.diagrams.getEditor().diagram
  if (diagram && diagram.canDeleteViews()) {
    let views = app.selections.getSelectedViews()
    app.engine.deleteElements([], views)
    app.selections.deselectAll()
  } else if (diagram && diagram.canHideViews()) {
    let views = app.selections.getSelectedViews()
    app.engine.setElemsProperty(views, 'visible', false)
    app.selections.deselectAll()
  } else {
    // Try to delete views only for the elements recommended to be deleted with models (e.g. Lifelines)
    app.dialogs.showModalDialog(
      '',
      'Delete Views Only',
      'Do you want to delete views only?',
      [
        { id: 'delete-views-only', text: 'Delete Views Only', className: 'left' },
        { id: 'delete-from-model', text: 'Delete from Model', className: 'primary' },
        { id: 'cancel', text: Strings.CANCEL }
      ]
    ).then(function ({buttonId}) {
      switch (buttonId) {
      case 'delete-from-model':
        var _models = app.selections.getSelectedModels()
        if (_models.every(m => m.canDelete())) {
          app.commands.execute('edit:delete-from-model')
        }
        break
      case 'delete-views-only':
        var _views = app.selections.getSelectedViews()
        app.engine.deleteElements([], _views)
        app.selections.deselectAll()
        break
      }
    })
  }
}

function handleDeleteFromModel () {
  var models = _.clone(app.selections.getSelectedModels())
  _.each(app.selections.getSelectedViews(), function (view) {
    if (view.model && !_.includes(models, view.model)) {
      models.push(view.model)
    }
  })
  if (models.length > 0) {
    _.each(models, function (e) {
      if (e instanceof type.Diagram) {
        app.diagrams.closeDiagram(e)
      }
    })
    app.engine.deleteElements(models, [])
    app.selections.deselectAll()
  }
}

function handleMoveUp () {
  var elem = app.selections.getSelected()
  if (elem) {
    app.engine.moveUp(elem._parent, elem.getParentField(), elem)
  }
}

function handleMoveDown () {
  var elem = app.selections.getSelected()
  if (elem) {
    app.engine.moveDown(elem._parent, elem.getParentField(), elem)
  }
}

function handleSelectAll () {
  // Select text in focused <input>, <textarea> when press Ctrl+A.
  var $focused = $('input:focus, textarea:focus')
  if ($focused.length > 0) {
    $focused.select()
    // Otherwise, select views in diagram.
  } else {
    app.diagrams.selectAll()
  }
}

function handleSelectInExplorer () {
  var models = app.selections.getSelectedModels()
  if (models.length > 0) {
    app.modelExplorer.select(models[0], true)
  }
}

function handleSelectInDiagram () {
  var models = app.selections.getSelectedModels()
  if (models.length > 0) {
    var views = _.reject(app.repository.getViewsOf(models[0]), function (v) {
      return !(v._parent instanceof type.Diagram)
    })
    if (views.length === 1) {
      app.diagrams.selectInDiagram(views[0])
    } else if (views.length > 1) {
      var diagrams = []
      var diagramMap = {}
      _.each(views, function (v) {
        var d = v.getDiagram()
        diagrams.push(d)
        diagramMap[d._id] = v
      })
      app.elementListPickerDialog.showDialog('Select Diagram to show', diagrams)
        .then(function ({buttonId, returnValue}) {
          if (buttonId === 'ok') {
            if (returnValue) {
              var selectedDiagram = diagramMap[returnValue._id]
              app.diagrams.selectInDiagram(selectedDiagram)
            }
          }
        })
    } else {
      app.toast.info('No diagrams to show')
    }
  }
}

/*
* Format Command Handlers
*/

function handleFont () {
  var views = app.selections.getSelectedViews()
  var fonts = _.map(views, function (view) { return view.font })
  var font = {
    face: Element.mergeProps(fonts, 'face'),
    size: Element.mergeProps(fonts, 'size'),
    color: Element.mergeProps(views, 'fontColor')
  }
  app.dialogs.showFontDialog(font).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      if (returnValue.size && !_.isNumber(returnValue.size)) {
        returnValue.size = parseInt(returnValue.size)
      }
      app.engine.setFont(app.diagrams.getEditor(), views, returnValue.face, returnValue.size, returnValue.color)
    }
  })
}

function handleFillColor (newColor) {
  var views = app.selections.getSelectedViews()
  var color = Element.mergeProps(views, 'fillColor')
  if (newColor) {
    app.engine.setFillColor(app.diagrams.getEditor(), views, newColor)
  } else {
    app.dialogs.showColorDialog(color).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.engine.setFillColor(app.diagrams.getEditor(), views, returnValue)
      }
    })
  }
}

function handleLineColor () {
  var views = app.selections.getSelectedViews()
  var color = Element.mergeProps(views, 'lineColor')
  app.dialogs.showColorDialog(color).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      app.engine.setLineColor(app.diagrams.getEditor(), views, returnValue)
    }
  })
}

function handleLineStyleRectilinear () {
  var views = app.selections.getSelectedViews()
  app.engine.setElemsProperty(views, 'lineStyle', EdgeView.LS_RECTILINEAR)
}

function handleLineStyleOblique () {
  var views = app.selections.getSelectedViews()
  app.engine.setElemsProperty(views, 'lineStyle', EdgeView.LS_OBLIQUE)
}

function handleLineStyleRoundRect () {
  var views = app.selections.getSelectedViews()
  app.engine.setElemsProperty(views, 'lineStyle', EdgeView.LS_ROUNDRECT)
}

function handleLineStyleCurve () {
  var views = app.selections.getSelectedViews()
  app.engine.setElemsProperty(views, 'lineStyle', EdgeView.LS_CURVE)
}

function handleAutoResize () {
  var views = app.selections.getSelectedViews()
  var autoResize = Element.mergeProps(views, 'autoResize')
  app.engine.setElemsProperty(views, 'autoResize', !autoResize)
}

function handleShowShadow () {
  var views = app.selections.getSelectedViews()
  var showShadow = Element.mergeProps(views, 'showShadow')
  app.engine.setElemsProperty(views, 'showShadow', !showShadow)
}

/*
* View Command Handlers
*/

function handleCommandPalette () {
  app.commandPalette.showModal()
}

function handleQuickFind () {
  app.quickFind.showModal()
}

function handleCloseDiagram () {
  app.diagrams.closeDiagram(app.diagrams.getCurrentDiagram())
}

function handleCloseOtherDiagrams () {
  app.diagrams.closeOthers()
}

function handleCloseAllDiagrams () {
  app.diagrams.closeAll()
}

function handleNextDiagram () {
  app.diagrams.nextDiagram()
}

function handlePreviousDiagram () {
  app.diagrams.previousDiagram()
}

function handleZoomIn () {
  app.diagrams.setZoomLevel(app.diagrams.getZoomLevel() + 0.1)
}

function handleZoomOut () {
  app.diagrams.setZoomLevel(app.diagrams.getZoomLevel() - 0.1)
}

function handleActualSize () {
  app.diagrams.setZoomLevel(1)
}

function handleFitToWindow () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var size = app.diagrams.getViewportSize()
    var box = diagram.getBoundingBox()
    var hr = size.x / box.x2
    var wr = size.y / box.y2
    var zoom = Math.min(hr, wr)
    if (zoom > 1) { zoom = 1 }
    app.diagrams.setZoomLevel(zoom)
    app.diagrams.scrollTo(0, 0, true)
    app.statusbar.setZoomLevel(app.diagrams.getZoomLevel())
  }
}

function handleShowGrid () {
  app.diagrams.toggleGrid()
  app.menu.updateStates(null, null, {'view.show-grid': app.diagrams.isGridVisible()})
}

function handleSnapToGrid () {
  app.diagrams.toggleSnapToGrid()
  app.menu.updateStates(null, null, {'view.snap-to-grid': app.diagrams.getSnapToGrid()})
}

function handleRename () {
  let dgm = app.diagrams.getCurrentDiagram()
  app.dialogs.showInputDialog('Enter diagram name', dgm.name)
    .then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.engine.setProperty(dgm, 'name', returnValue)
      }
    })
}

/*
 * Model Command Handlers
 */

function handleTagEditor () {
  const elem = app.selections.getSelected()
  if (elem) {
    app.tagEditorDialog.showDialog(elem)
  }
}

/*
 * Tools Command Handlers
 */

function handleExtensionManager () {
  app.extensionManagerDialog.showDialog()
}

/*
 * Help Command Handlers
 */

function handleAbout () {
  AboutDialog.showDialog()
}

function handleCheckForUpdates () {
  if (app.updateManager.state === 'no-update') {
    ipcRenderer.send('command', 'application:check-for-updates')
  }
  CheckUpdatesDialog.showDialog()
}

function handleEnterLicenseKey () {
  if (app.licenseManager.getStatus() === true) {
    app.dialogs.showInfoDialog('You already have a valid license.')
  } else {
    EnterLicenseDialog.showDialog()
  }
}

function handleDeleteLicenseKey () {
  if (app.licenseManager.getStatus() === true) {
    var buttonId = app.dialogs.showConfirmDialog('Do you want to delete current license key?')
    if (buttonId === 'ok') {
      var path = app.licenseManager.findLicense()
      fs.unlinkSync(path)
      app.licenseManager.checkLicenseValidity()
    }
    app.dialogs
  } else {
    app.dialogs.showInfoDialog('You don\'t have a valid license to delete.')
    var path2 = app.licenseManager.findLicense()
    if (path2) {
      fs.unlinkSync(path2)
    }
  }
}

function handleDocumentation () {
  shell.openExternal(app.config.documentation_url)
}

function handleForum () {
  shell.openExternal(app.config.forum_url)
}

function handleReleaseNotes () {
  shell.openExternal(app.config.release_notes_url)
}

function handleRequestFeature () {
  shell.openExternal(app.config.feature_request_url)
}

/*
 * CLI Command Handlers
 */

function handleCLIEjs (template, select, output) {
  try {
    const elements = app.repository.select(select)
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const data = {
        app: app,
        element: element,
        filenamify: filenamify
      }
      const templateString = fs.readFileSync(template, 'utf8')
      const rendered = ejs.render(templateString, data, {async: false})
      if (output) {
        const outputRendered = ejs.render(output, data, {async: false})
        fs.ensureFileSync(outputRendered)
        fs.writeFileSync(outputRendered, rendered, {encoding: 'utf-8'})
        ipcRenderer.send('console-log', `[StarUML] ${outputRendered}`)
      } else {
        ipcRenderer.send('console-log', rendered)
      }
    }
    ipcRenderer.send('console-log', `[StarUML] Total ${elements.length} files were generated`)
  } catch (err) {
    ipcRenderer.send('console-log', `[Error] ${err.toString()}`)
  }
  setTimeout(() => {
    ipcRenderer.send('quit')
  }, 500)
}

function handleCLIImage (format, selector, output) {
  try {
    let diagrams = app.repository.select(selector)
    if (diagrams.length > 0) {
      diagrams = diagrams.filter(e => e instanceof type.Diagram)
    }
    for (let i = 0; i < diagrams.length; i++) {
      const diagram = diagrams[i]
      const data = {
        app: app,
        element: diagram,
        filenamify: filenamify
      }
      let filePath = filenamify(diagram.name + '.' + format)
      if (output) {
        filePath = ejs.render(output, data, {async: false})
        fs.ensureFileSync(filePath)
      }
      switch (format) {
      case 'png':
        DiagramExport.exportToPNG(diagram, filePath)
        break
      case 'jpeg':
        DiagramExport.exportToJPEG(diagram, filePath)
        break
      case 'svg':
        DiagramExport.exportToSVG(diagram, filePath)
        break
      }
      ipcRenderer.send('console-log', `[StarUML] ${filePath}`)
    }
    ipcRenderer.send('console-log', `[StarUML] Total ${diagrams.length} diagrams were exported`)
  } catch (err) {
    ipcRenderer.send('console-log', `[Error] ${err.toString()}`)
  }
  setTimeout(() => {
    ipcRenderer.send('quit')
  }, 500)
}

function handleCLIHtml (output) {
  try {
    fs.ensureDirSync(output)
    app.commands.execute('html-export:export', output)
    ipcRenderer.send('console-log', `[StarUML] HTML docs were exported on ${output}/html-docs`)
  } catch (err) {
    ipcRenderer.send('console-log', `[Error] ${err.toString()}`)
  }
  setTimeout(() => {
    ipcRenderer.send('quit')
  }, 500)
}

function handleCLIPdf (selector, output, options) {
  try {
    let diagrams = app.repository.select(selector)
    if (diagrams.length > 0) {
      diagrams = diagrams.filter(e => e instanceof type.Diagram)
    }
    fs.ensureFileSync(output)
    DiagramExport.exportToPDF(diagrams, output, options)
    ipcRenderer.send('console-log', `[StarUML] PDF document was exported as ${output}`)
  } catch (err) {
    ipcRenderer.send('console-log', `[Error] ${err.toString()}`)
  }
  setTimeout(() => {
    ipcRenderer.send('quit')
  }, 500)
}

function handleCLIExec (cmd, args) {
  try {
    if (!cmd) {
      ipcRenderer.send('console-log', `[StarUML] No command specified`)
    } else if (!app.commands.commands[cmd]) {
      ipcRenderer.send('console-log', `[StarUML] Command not found: ${cmd}`)
    } else {
      app.commands.execute(cmd, args)
    }
  } catch (err) {
    ipcRenderer.send('console-log', `[Error] ${err.toString()}`)
  }
  setTimeout(() => {
    ipcRenderer.send('quit')
  }, 500)
}

/*
 * Internal Command Handlers
 */

function updateMenus () {
  let models = app.selections.getSelectedModels()
  let views = app.selections.getSelectedViews()

  let enabledStates = {
    'edit.delete-from-model': (models.length > 0 && models[0].canDelete()),
    'format.font': (views.length > 0),
    'format.fill-color': (views.length > 0),
    'format.line-color': (views.length > 0),
    'format.linestyle.rectilinear': (views.length > 0),
    'format.linestyle.oblique': (views.length > 0),
    'format.linestyle.roundrect': (views.length > 0),
    'format.linestyle.curve': (views.length > 0),
    'format.auto-resize': (views.length > 0),
    'format.show-shadow': (views.length > 0)
  }

  let lineStyle = Element.mergeProps(views, 'lineStyle')
  let checkedStates = {
    'format.linestyle.rectilinear': (lineStyle === EdgeView.LS_RECTILINEAR),
    'format.linestyle.oblique': (lineStyle === EdgeView.LS_OBLIQUE),
    'format.linestyle.roundrect': (lineStyle === EdgeView.LS_ROUNDRECT),
    'format.linestyle.curve': (lineStyle === EdgeView.LS_CURVE),
    'format.auto-resize': Element.mergeProps(views, 'autoResize'),
    'format.show-shadow': Element.mergeProps(views, 'showShadow'),
    'view.show-grid': app.preferences.get('diagramEditor.showGrid'),
    'view.snap-to-grid': app.preferences.get('diagramEditor.snapToGrid')
  }

  app.menu.updateStates(null, enabledStates, checkedStates)
}

/*
* Factory Commands
*/

function handleCreateDiagram (options) {
  options = options || {}
  options.parent = options.parent || app.selections.getSelected() || app.project.getProject()
  return app.factory.createDiagram(options)
}

function handleCreateModel (options) {
  options = options || {}
  options.parent = options.parent || app.selections.getSelected()
  return app.factory.createModel(options)
}

function handleCreateModelAndView (options) {
  options = options || {}
  options.diagram = options.diagram || app.diagrams.getCurrentDiagram()
  options.parent = options.diagram._parent
  return app.factory.createModelAndView(options)
}

/**
 * @private
 * Set property command
 * @param {Object} options
 */
function handleSetProperty (options) {
  if (options['set-model']) {
    options.model = _.get(options.model, options['set-model'])
  }
  app.engine.setProperty(options.model, options.property, options.value)
}

// Register Commands

// Application
app.commands.register('application:preferences', handlePreferences, 'Preferences...')
app.commands.register('application:log', handleLog)
app.commands.register('application:main-log', handleMainLog)
app.commands.register('application:quit', handleQuit, 'Quit')
app.commands.register('application:reload', handleReload)

// File
app.commands.register('project:new', handleNew, 'File: New')
app.commands.register('project:open', handleOpen, 'File: Open...')
app.commands.register('project:save', handleSave, 'File: Save')
app.commands.register('project:save-as', _.partial(handleSave, undefined, true), 'File: Save As...')
app.commands.register('project:import-fragment', handleImportFragment, 'File: Import Fragment...')
app.commands.register('project:export-fragment', handleExportFragment, 'File: Export Fragment...')
app.commands.register('project:export-diagram-to-png', handleExportDiagramToPNG, 'File: Export Diagram to PNG...')
app.commands.register('project:export-diagram-to-jpeg', handleExportDiagramToJPEG, 'File: Export Diagram to JPEG...')
app.commands.register('project:export-diagram-to-svg', handleExportDiagramToSVG, 'File: Export Diagram to SVG...')
app.commands.register('project:export-diagram-all-to-pngs', handleExportDiagramAllToPNGs, 'File: Export All Diagrams to PNGs...')
app.commands.register('project:export-diagram-all-to-jpegs', handleExportDiagramAllToJPEGs, 'File: Export All Diagrams to JPEGs...')
app.commands.register('project:export-diagram-all-to-svgs', handleExportDiagramAllToSVGs, 'File: Export All Diagrams to SVGs...')
app.commands.register('project:print-to-pdf', handlePrintToPDF, 'File: Print to PDF...')
app.commands.register('project:close', handleClose, 'File: Close')

// Edit
app.commands.register('edit:undo', handleUndo, 'Edit: Undo')
app.commands.register('edit:redo', handleRedo, 'Edit: Redo')
app.commands.register('edit:cut', handleCut, 'Edit: Cut')
app.commands.register('edit:copy', handleCopy, 'Edit: Copy')
app.commands.register('edit:copy-diagram-as-image', handleCopyDiagramAsImage, 'Edit: Copy Diagram As Image')
app.commands.register('edit:paste', handlePaste, 'Edit: Paste')
app.commands.register('edit:delete', handleDelete, 'Edit: Delete')
app.commands.register('edit:delete-from-model', handleDeleteFromModel, 'Edit: Delete from Model')
app.commands.register('edit:move-up', handleMoveUp, 'Edit: Move Up')
app.commands.register('edit:move-down', handleMoveDown, 'Edit: Move Down')
app.commands.register('edit:select-all', handleSelectAll, 'Edit: Select All')
app.commands.register('edit:select-in-explorer', handleSelectInExplorer, 'Edit: Select In Model Explorer')
app.commands.register('edit:select-in-diagram', handleSelectInDiagram, 'Edit: Select In Diagram')

// Format
app.commands.register('format:font', handleFont, 'Format: Font...')
app.commands.register('format:fill-color', handleFillColor, 'Format: Fill Color...')
app.commands.register('format:line-color', handleLineColor, 'Format: Line Color...')
app.commands.register('format:linestyle-rectilinear', handleLineStyleRectilinear, 'Format: Line Style to Rectilinear')
app.commands.register('format:linestyle-oblique', handleLineStyleOblique, 'Format: Line Style to Oblique')
app.commands.register('format:linestyle-roundrect', handleLineStyleRoundRect, 'Format: Line Style to Rounded Rectilinear')
app.commands.register('format:linestyle-curve', handleLineStyleCurve, 'Format: Line Style to Curve')
app.commands.register('format:auto-resize', handleAutoResize, 'Format: Auto Resize')
app.commands.register('format:show-shadow', handleShowShadow, 'Format: Show Shadow')

// Tools
app.commands.register('tools:extension-manager', handleExtensionManager, 'Extension Manager...')

// View
app.commands.register('view:quick-find', handleQuickFind)
app.commands.register('view:command-palette', handleCommandPalette)
app.commands.register('view:close-diagram', handleCloseDiagram, 'View: Close Diagram')
app.commands.register('view:close-other-diagrams', handleCloseOtherDiagrams, 'View: Close Other Diagrams')
app.commands.register('view:close-all-diagrams', handleCloseAllDiagrams, 'View: Close All Diagrams')
app.commands.register('view:next-diagram', handleNextDiagram, 'View: Next Diagram')
app.commands.register('view:previous-diagram', handlePreviousDiagram, 'View: Previous Diagram')
app.commands.register('view:zoom-in', handleZoomIn, 'View: Zoom In')
app.commands.register('view:zoom-out', handleZoomOut, 'View: Zoom Out')
app.commands.register('view:actual-size', handleActualSize, 'View: Actual Size')
app.commands.register('view:fit-to-window', handleFitToWindow, 'View: Fit to Window')
app.commands.register('view:show-grid', handleShowGrid, 'View: Show Grid')
app.commands.register('view:snap-to-grid', handleSnapToGrid, 'View: Snap to Grid')
app.commands.register('view:rename-diagram', handleRename, 'View: Rename Diagram')

// Model
app.commands.register('model:tag-editor', handleTagEditor, 'Model: Tag Editor...')

// Help
app.commands.register('help:about', handleAbout, 'Help: About')
app.commands.register('help:check-for-updates', handleCheckForUpdates, 'Help: Check For Updates')
app.commands.register('help:enter-license-key', handleEnterLicenseKey, 'Help: Enter License Key...')
app.commands.register('help:delete-license-key', handleDeleteLicenseKey, 'Help: Delete License Key')
app.commands.register('help:documentation', handleDocumentation, 'Help: Documentation')
app.commands.register('help:forum', handleForum, 'Help: Forum')
app.commands.register('help:release-notes', handleReleaseNotes, 'Help: Release Notes')
app.commands.register('help:request-feature', handleRequestFeature, 'Help: Feature Request')

// CLI

app.commands.register('cli:ejs', handleCLIEjs)
app.commands.register('cli:image', handleCLIImage)
app.commands.register('cli:html', handleCLIHtml)
app.commands.register('cli:pdf', handleCLIPdf)
app.commands.register('cli:exec', handleCLIExec)

// Register Internal Commands

app.commands.register('factory:create-diagram', handleCreateDiagram)
app.commands.register('factory:create-model', handleCreateModel)
app.commands.register('factory:create-model-and-view', handleCreateModelAndView)
// app.commands.register('factory:create-view', handleCreateView)

app.commands.register('engine:set-property', handleSetProperty)

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
