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

// Precondition functions .................................................

function modelElementLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLModelElement) && (options.headModel instanceof type.UMLModelElement),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function blockPropertyPrecondition (options) {
  app.factory.assert(
    options.parent instanceof type.SysMLBlock,
    Mustache.render(`{{.}} should be placed in a Block`, options.modelType)
  )
}

// Create diagram function ..............................................

function _addFrame (diagram) {
  var frame = new type.UMLFrameView()
  diagram.ownedViews.push(frame)
  frame._parent = diagram
  frame.model = diagram
  frame.initialize(null, 8, 8, 700, 600)
}

function diagramFn (parent, options) {
  var DiagramType = type[options.diagramType]
  var model, diagram
  parent = parent || app.project.getProject()
  if (parent instanceof type.Project) {
    model = new type.UMLModel()
    model.name = Element.getNewName(parent.ownedElements, 'Model')
    model._parent = parent
    diagram = new DiagramType()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
    model.ownedElements.push(diagram)
    diagram._parent = model
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', model)
  } else {
    diagram = new DiagramType()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
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

/*
function _undirectedRelationshipFn (parent, diagram, options) {
  return app.factory.defaultUndirectedRelationshipFn(options.tailModel, diagram, options)
}
*/

function _directedRelationshipFn (parent, diagram, options) {
  return app.factory.defaultDirectedRelationshipFn(options.tailModel, diagram, options)
}

/*
function _viewOnDiagramFn (model, diagram, options) {
  return app.factory.defaultViewOnDiagramFn(model, diagram, options)
}
*/

function portFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    parent instanceof type.SysMLBlock || parent instanceof type.SysMLProperty ||
    (parent instanceof type.SysMLInternalBlockDiagram && parent._parent instanceof type.SysMLBlock),
    Mustache.render('Port should be placed in a block or a part')
  )
  if (parent instanceof type.SysMLProperty) {
    app.factory.assert(
      parent.type instanceof type.UMLClassifier,
      'Port should be placed in a typed part'
    )
    parent = parent.type
  }
  if (parent instanceof type.SysMLInternalBlockDiagram && parent._parent instanceof type.SysMLBlock) {
    parent = parent._parent
  }
  // Create Port
  model = new type.SysMLPort()
  model.name = Element.getNewName(parent.ports, 'Port')
  model._parent = parent
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  const builder = app.repository.getOperationBuilder()
  builder.begin('Create Port')
  builder.insert(model)
  builder.fieldInsert(parent, 'ports', model)
  // Create PartView
  view = new type.SysMLPortView()
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  view.model = model
  view._parent = diagram
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  if (options.containerView) {
    view.containerView = options.containerView
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  if (options.containerView) {
    builder.fieldInsert(options.containerView, 'containedViews', view)
  }
  // Apply operation
  builder.end()
  var op = builder.getOperation()
  app.repository.doOperation(op)
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function connectorFn (parent, diagram, options) {
  app.factory.assert(
    (options.tailModel instanceof type.SysMLProperty || options.tailModel instanceof type.SysMLPort) &&
    (options.tailModel instanceof type.SysMLProperty || options.tailModel instanceof type.SysMLPort),
    'Connector should connect between Parts or Ports'
  )
  return app.factory.defaultUndirectedRelationshipFn(parent, diagram, options)
}

function parameterFn (parent, diagram, options) {
  app.factory.assert(
    parent instanceof type.SysMLProperty ||
    (parent instanceof type.SysMLInternalBlockDiagram && parent._parent instanceof type.SysMLBlock) ||
    (parent instanceof type.SysMLParametricDiagram && parent._parent instanceof type.SysMLBlock),
    Mustache.render('Constraint Parameter should be placed in a block or a part')
  )
  if (parent instanceof type.SysMLProperty) {
    app.factory.assert(
      parent.type instanceof type.SysMLConstraintBlock,
      'Constraint Parameter should be placed in a ConstraintProperty (typed with ConstraintBlock)'
    )
    parent = parent.type
  }
  if ((parent instanceof type.SysMLInternalBlockDiagram && parent._parent instanceof type.SysMLBlock) ||
      (parent instanceof type.SysMLParametricDiagram && parent._parent instanceof type.SysMLBlock)) {
    parent = parent._parent
  }
  return app.factory.defaultModelAndViewFn(parent, diagram, Object.assign(options, {
    precondition: blockPropertyPrecondition,
    modelType: 'SysMLProperty',
    field: 'parameters',
    'generate-name': 'Parameter',
    'model-init': { aggregation: type.UMLAttribute.AK_COMPOSITE },
    viewType: 'SysMLConstraintParameterView'
  }))
}

// Create view of diagrams .................................................

const viewForGeneralDiagramFn = app.factory.viewOfFn.UMLClassDiagram

function viewForBlockDefinitionDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor
  var containerView = options.containerView || null
  // Port
  if (model instanceof type.SysMLPort) {
    if (containerView instanceof type.SysMLBlockView && containerView.model === model._parent) {
      return app.factory.createViewAndRelationships(editor, x, y, model, containerView)
    } else {
      app.dialogs.showAlertDialog("Port should be dropped on it's parent Block")
    }
  } else {
    return viewForGeneralDiagramFn(model, diagram, options)
  }
}

function viewForInternalBlockDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor
  var containerView = options.containerView || null
  var view
  var parent = diagram._parent
  if (model instanceof type.SysMLProperty) {
    if (model._parent === parent) {
      if (parent.constraints && parent.constraints.includes(model)) {
        return app.factory.createViewAndRelationships(editor, x, y, model, containerView, type.SysMLConstraintPropertyView)
      } else {
        return app.factory.createViewAndRelationships(editor, x, y, model, containerView)
      }
    } else if (model._parent instanceof type.SysMLConstraintBlock && model._parent.parameters && model._parent.parameters.includes(model)) {
      if (containerView instanceof type.SysMLConstraintPropertyView && containerView.model.type === model._parent) {
        return app.factory.createViewAndRelationships(editor, x, y, model, containerView, type.SysMLConstraintParameterView)
      } else {
        app.dialogs.showAlertDialog("Constraint Parameter should be dropped on a it's parent Constraint Parameter")
      }
    } else {
      app.dialogs.showAlertDialog('Only part in the block context can be dropped')
    }
  } else if (model instanceof type.SysMLPort) {
    if (containerView instanceof type.SysMLPartView && containerView.model.type === model._parent) {
      return app.factory.createViewAndRelationships(editor, x, y, model, containerView)
    } else if (containerView instanceof type.UMLFrameView) {
      return app.factory.createViewAndRelationships(editor, x, y, model, containerView)
    } else {
      app.dialogs.showAlertDialog("Port should be dropped on a part whose type is the port's parent Block")
    }
  } else if (model instanceof type.SysMLBlock) {
    // Create Part (Property)
    var block = parent
    var part = new type.SysMLProperty()
    part.name = Element.getNewName(block.parts, 'Part')
    part.type = model
    part.aggregation = type.UMLAttribute.AK_COMPOSITE
    part._parent = block
    // Create Part View
    view = new type.SysMLPartView()
    view._parent = diagram
    view.model = part
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(part)
    builder.fieldInsert(block, 'parts', part)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else {
    return viewForGeneralDiagramFn(model, diagram, options)
  }
}

// Create Diagram ..........................................................

app.factory.registerDiagramFn('SysMLRequirementDiagram', diagramFn)
app.factory.registerDiagramFn('SysMLBlockDefinitionDiagram', diagramFn)
app.factory.registerDiagramFn('SysMLInternalBlockDiagram', diagramFn)
app.factory.registerDiagramFn('SysMLParametricDiagram', diagramFn)

// Create Model ............................................................

app.factory.registerModelFn('SysMLRequirement', _modelFn)
app.factory.registerModelFn('SysMLBlock', _modelFn)
app.factory.registerModelFn('SysMLValueType', _modelFn)
app.factory.registerModelFn('SysMLInterfaceBlock', _modelFn)
app.factory.registerModelFn('SysMLConstraintBlock', _modelFn)
app.factory.registerModelFn('SysMLProperty', _modelFn)
app.factory.registerModelFn('SysMLOperation', _modelFn)
app.factory.registerModelFn('SysMLFlowProperty', _modelFn)
app.factory.registerModelFn('SysMLPort', _modelFn)
app.factory.registerModelFn('SysMLItemFlow', _modelFn)

// Create Model And View ...................................................

app.factory.registerModelAndViewFn('SysMLStakeholder', _modelAndViewFn)
app.factory.registerModelAndViewFn('SysMLView', _modelAndViewFn)
app.factory.registerModelAndViewFn('SysMLViewpoint', _modelAndViewFn)
app.factory.registerModelAndViewFn('SysMLConform', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })
app.factory.registerModelAndViewFn('SysMLExpose', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })
app.factory.registerModelAndViewFn('SysMLRequirement', _modelAndViewFn)
app.factory.registerModelAndViewFn('SysMLCopy', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })
app.factory.registerModelAndViewFn('SysMLDeriveReqt', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })
app.factory.registerModelAndViewFn('SysMLVerify', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })
app.factory.registerModelAndViewFn('SysMLSatisfy', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })
app.factory.registerModelAndViewFn('SysMLRefine', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })
app.factory.registerModelAndViewFn('SysMLBlock', _modelAndViewFn)
app.factory.registerModelAndViewFn('SysMLValueType', _modelAndViewFn)
app.factory.registerModelAndViewFn('SysMLInterfaceBlock', _modelAndViewFn)
app.factory.registerModelAndViewFn('SysMLConstraintBlock', _modelAndViewFn)
app.factory.registerModelAndViewFn('SysMLPart', _modelAndViewFn, {
  precondition: blockPropertyPrecondition,
  modelType: 'SysMLProperty',
  field: 'parts',
  'generate-name': 'Part',
  'model-init': { aggregation: type.UMLAttribute.AK_COMPOSITE },
  viewType: 'SysMLPartView'
})
app.factory.registerModelAndViewFn('SysMLReference', _modelAndViewFn, {
  precondition: blockPropertyPrecondition,
  modelType: 'SysMLProperty',
  field: 'references',
  'generate-name': 'Reference',
  viewType: 'SysMLPartView'
})
app.factory.registerModelAndViewFn('SysMLValue', _modelAndViewFn, {
  precondition: blockPropertyPrecondition,
  modelType: 'SysMLProperty',
  field: 'values',
  'generate-name': 'Value',
  'model-init': { aggregation: type.UMLAttribute.AK_COMPOSITE },
  viewType: 'SysMLPartView'
})
app.factory.registerModelAndViewFn('SysMLPort', portFn)
app.factory.registerModelAndViewFn('SysMLConnector', connectorFn)
app.factory.registerModelAndViewFn('SysMLConstraintProperty', _modelAndViewFn, {
  precondition: blockPropertyPrecondition,
  modelType: 'SysMLProperty',
  field: 'constraints',
  'generate-name': 'Constraint',
  'model-init': { aggregation: type.UMLAttribute.AK_COMPOSITE },
  viewType: 'SysMLConstraintPropertyView'
})
app.factory.registerModelAndViewFn('SysMLConstraintParameter', parameterFn)

// Create View .............................................................

app.factory.registerViewOfFn('SysMLRequirementDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('SysMLBlockDefinitionDiagram', viewForBlockDefinitionDiagramFn)
app.factory.registerViewOfFn('SysMLInternalBlockDiagram', viewForInternalBlockDiagramFn)
app.factory.registerViewOfFn('SysMLParametricDiagram', viewForInternalBlockDiagramFn)
