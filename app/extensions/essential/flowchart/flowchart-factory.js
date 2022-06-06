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

const Mustache = require('mustache')
const {Element} = app.type
const ERR_INVALID_LINK = 'Invalid connection ({{.}})'

// Preconditions ...........................................................

function flowPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.FCModelElement) && (options.headModel instanceof type.FCModelElement),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

// Create flowchart diagram function ..............................................

function diagramFn (parent, options) {
  var model, diagram
  parent = parent || app.project.getProject()
  if (parent instanceof type.FCFlowchart) {
    diagram = new type.FCFlowchartDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else {
    model = new type.FCFlowchart()
    model.name = Element.getNewName(parent.ownedElements, 'Flowchart')
    model._parent = parent
    diagram = new type.FCFlowchartDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
    model.ownedElements.push(diagram)
    diagram._parent = model
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', model)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function _modelAndViewFn (parent, diagram, options) {
  return app.factory.defaultModelAndViewFn(parent, diagram, options)
}

function _directedRelationshipFn (parent, diagram, options) {
  return app.factory.defaultDirectedRelationshipFn(options.tailModel, diagram, options)
}

// Create Diagram ..........................................................

app.factory.registerDiagramFn('FCFlowchartDiagram', diagramFn)

// Create Model And View ...................................................

app.factory.registerModelAndViewFn('FCFlow', _directedRelationshipFn, { precondition: flowPrecondition })
app.factory.registerModelAndViewFn('FCProcess', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCTerminator', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCDecision', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCDelay', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCPredefinedProcess', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCAlternateProcess', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCData', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCDocument', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCMultiDocument', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCPreparation', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCDisplay', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCManualInput', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCManualOperation', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCCard', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCPunchedTape', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCConnector', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCOffPageConnector', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCOr', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCSummingJunction', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCCollate', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCSort', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCMerge', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCExtract', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCStoredData', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCDatabase', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCDirectAccessStorage', _modelAndViewFn)
app.factory.registerModelAndViewFn('FCInternalStorage', _modelAndViewFn)
