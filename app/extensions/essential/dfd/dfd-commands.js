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

/**
 * @private
 * Add an outgoing process
 */
function handleAddOutgoingProcess (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.DFDDataFlowView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'DFDProcess',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'DFDDataFlow',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an outgoing datastore
 */
function handleAddOutgoingDataStore (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.DFDDataFlowView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'DFDDataStore',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'DFDDataFlow',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an incoming external entity
 */
function handleAddIncomingExternalEntity (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.DFDDataFlowView, function (e) {
    return (e.head === view)
  })
  const options1 = Object.assign({
    id: 'DFDExternalEntity',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'DFDDataFlow',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an incoming process
 */
function handleAddIncomingProcess (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.DFDDataFlowView, function (e) {
    return (e.head === view)
  })
  const options1 = Object.assign({
    id: 'DFDProcess',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'DFDDataFlow',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Update menu states
 */
function updateMenus () {
  var selected = app.selections.getSelected()
  var isNone = (!selected)
  var isProject = selected instanceof type.Project
  var isPackage = selected instanceof type.UMLPackage || selected instanceof type.UMLSubsystem
  var isDFDElement = selected instanceof type.DFDElement

  let visibleStates = {
    'dfd.diagram': (isNone || isProject || isPackage || isDFDElement),
    'dfd.data-flow-model': (isProject || isPackage),
    'dfd.external-entity': isDFDElement,
    'dfd.process': isDFDElement,
    'dfd.data-store': isDFDElement
  }
  app.menu.updateStates(visibleStates, null, null)
}

app.commands.register('dfd:add-outgoing-process', handleAddOutgoingProcess)
app.commands.register('dfd:add-outgoing-datastore', handleAddOutgoingDataStore)
app.commands.register('dfd:add-incoming-external-entity', handleAddIncomingExternalEntity)
app.commands.register('dfd:add-incoming-process', handleAddIncomingProcess)

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
