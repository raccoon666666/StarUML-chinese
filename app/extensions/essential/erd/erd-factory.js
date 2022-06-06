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

function entityLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.ERDEntity) && (options.headModel instanceof type.ERDEntity),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

// Create ER diagram function ..............................................

function diagramFn (parent, options) {
  var model, diagram
  parent = parent || app.project.getProject()
  if (parent instanceof type.ERDDataModel) {
    diagram = new type.ERDDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else {
    model = new type.ERDDataModel()
    model.name = Element.getNewName(parent.ownedElements, 'Data Model')
    model._parent = parent
    diagram = new type.ERDDiagram()
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

function _modelFn (parent, field, options) {
  return app.factory.defaultModelFn(parent, field, options)
}

function _modelAndViewFn (parent, diagram, options) {
  return app.factory.defaultModelAndViewFn(parent, diagram, options)
}

function _undirectedRelationshipFn (parent, diagram, options) {
  return app.factory.defaultUndirectedRelationshipFn(options.tailModel, diagram, options)
}

function _viewOnDiagramFn (model, diagram, options) {
  return app.factory.defaultViewOnDiagramFn(model, diagram, options)
}

// Create Diagram ..........................................................

app.factory.registerDiagramFn('ERDDiagram', diagramFn)

// Create Model ............................................................

app.factory.registerModelFn('ERDDataModel', _modelFn)
app.factory.registerModelFn('ERDEntity', _modelFn)
app.factory.registerModelFn('ERDColumn', _modelFn)

// Create Model And View ...................................................

app.factory.registerModelAndViewFn('ERDEntity', _modelAndViewFn)
app.factory.registerModelAndViewFn('ERDRelationship', _undirectedRelationshipFn, { precondition: entityLinkPrecondition })

// Create View .............................................................

app.factory.registerViewOfFn('ERDDiagram', _viewOnDiagramFn)
