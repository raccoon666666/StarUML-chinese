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
  const nodes = app.quickedits.getBothNodes(view, type.FCFlowView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'FCProcess',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'FCFlow',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
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
  const nodes = app.quickedits.getBothNodes(view, type.FCFlowView, function (e) {
    return (e.head === view)
  })
  const options1 = Object.assign({
    id: 'FCProcess',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'FCFlow',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an outgoing decision
 */
function handleAddOutgoingDecision (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.FCFlowView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'FCDecision',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'FCFlow',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an incoming decision
 */
function handleAddIncomingDecision (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.FCFlowView, function (e) {
    return (e.head === view)
  })
  const options1 = Object.assign({
    id: 'FCDecision',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'FCFlow',
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
  let selected = app.selections.getSelected()
  let isNone = !selected
  let isProject = selected instanceof type.Project
  let isExtensibleModel = selected instanceof type.ExtensibleModel

  var visibleStates = {
    'flowchart.diagram': (isNone || isProject || isExtensibleModel)
  }
  app.menu.updateStates(visibleStates, null, null)
}

app.commands.register('fc:add-outgoing-process', handleAddOutgoingProcess)
app.commands.register('fc:add-incoming-process', handleAddIncomingProcess)
app.commands.register('fc:add-outgoing-decision', handleAddOutgoingDecision)
app.commands.register('fc:add-incoming-decision', handleAddIncomingDecision)

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
