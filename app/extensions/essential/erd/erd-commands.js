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
const fs = require('fs')
const path = require('path')
const peg = require('pegjs')
const {ipcRenderer} = require('electron')
const {Element} = global.type

const grammarColumn = fs.readFileSync(path.join(__dirname, '/grammars/erd-column.pegjs'), 'utf8')

/**
 * @private
 * New from template
 * @param {string} filename
 */
function handleNewFromTemplate (filename) {
  const fullPath = path.join(__dirname, filename)
  ipcRenderer.send('command', 'application:new-from-template', fullPath)
}

/**
 * @private
 * Set a column expression
 */
function handleSetColumnExpression (options) {
  try {
    const parser = peg.generate(grammarColumn)
    const ast = parser.parse(options.value)
    const elem = options.model
    var fields = {}
    // name
    if (ast.name) {
      fields.name = ast.name.trim()
    }
    // type
    if (ast.type) {
      if (ast.type.name) {
        fields.type = ast.type.name.trim()
      } else {
        fields.type = ''
      }
      if (ast.type.size) {
        fields.length = ast.type.size
      } else {
        fields.length = 0
      }
    } else {
      fields.type = ''
      fields.length = 0
    }
    app.engine.setProperties(elem, fields)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Add a one-to-one relationship
 */
function handleAddOneToOne (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.ERDRelationshipView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'ERDEntity',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'ERDRelationship',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a one-to-many relationship
 */
function handleAddOneToMany (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.ERDRelationshipView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'ERDEntity',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'ERDRelationship',
    diagram: diagram,
    parent: nodeView.model,
    modelInitializer: function (elem) {
      elem.end2.cardinality = '0..*'
    }
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a many-to-many relationship
 */
function handleAddManyToMany (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.ERDRelationshipView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'ERDEntity',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'ERDRelationship',
    diagram: diagram,
    parent: nodeView.model,
    modelInitializer: function (elem) {
      elem.end1.cardinality = '0..*'
      elem.end2.cardinality = '0..*'
    }
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

function handleToggleProperty (field) {
  var views = app.selections.getSelectedViews()
  var boolVal = Element.mergeProps(views, field)
  if (_.isBoolean(boolVal)) {
    app.engine.setElemsProperty(views, field, !boolVal)
  } else {
    app.engine.setElemsProperty(views, field, true)
  }
}

function updateMenus () {
  var views = app.selections.getSelectedViews()
  var selected = app.selections.getSelected()
  var isNone = (!selected)
  var isProject = selected instanceof type.Project
  var isPackage = selected instanceof type.UMLPackage || selected instanceof type.UMLSubsystem
  var isDataModel = selected instanceof type.ERDDataModel
  var isEntity = selected instanceof type.ERDEntity

  let visibleStates = {
    'erd.diagram': (isNone || isProject || isPackage || isDataModel),
    'erd.model': (isProject || isPackage),
    'erd.entity': isDataModel,
    'erd.column': isEntity
  }
  let enabledStates = {
    'erd.suppress-columns': (views.length > 0)
  }
  let checkedStates = {
    'erd.suppress-columns': (Element.mergeProps(views, 'suppressColumns'))
  }

  app.menu.updateStates(visibleStates, enabledStates, checkedStates)
}

app.commands.register('erd:new-from-template', handleNewFromTemplate)
app.commands.register('erd:set-column-expression', handleSetColumnExpression)
app.commands.register('erd:add-one-to-one', handleAddOneToOne)
app.commands.register('erd:add-one-to-many', handleAddOneToMany)
app.commands.register('erd:add-many-to-many', handleAddManyToMany)
app.commands.register('erd:suppress-columns', _.partial(handleToggleProperty, 'suppressColumns'), 'ERD: Suppress Columns')

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
