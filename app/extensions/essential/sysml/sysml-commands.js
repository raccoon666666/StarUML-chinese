const _ = require('lodash')

function handleToggleProperty (field) {
  var views = app.selections.getSelectedViews()
  var boolVal = type.Element.mergeProps(views, field)
  if (_.isBoolean(boolVal)) {
    app.engine.setElemsProperty(views, field, !boolVal)
  } else {
    app.engine.setElemsProperty(views, field, true)
  }
}

/**
 * @private
 * Create a sub-requirement
 */
function handleAddSubRequirement (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const nodes = app.quickedits.getTailNodes(view, type.UMLContainmentView)
  const options1 = Object.assign({
    id: 'SysMLRequirement',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLContainment',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a composited block
 */
function handleAddCompositedBlock (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLAssociationView, function (e) {
    return (e.tail === view && e.model.end1.aggregation === type.UMLAttribute.AK_COMPOSITE)
  })
  const options1 = Object.assign({
    id: 'SysMLBlock',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLAssociation',
    diagram: diagram,
    parent: nodeView.model,
    modelInitializer: function (model) {
      model.end1.aggregation = type.UMLAttribute.AK_COMPOSITE
    }
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a port
 */
function handleAddPort (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const _x = view.left + Math.round(Math.random() * view.width)
  const _y = view.top + Math.round(Math.random() * view.height)
  const options1 = {
    id: 'SysMLPort',
    diagram: diagram,
    parent: view.model,
    x1: _x,
    y1: _y,
    x2: _x,
    y2: _y,
    containerView: view
  }
  return app.factory.createModelAndView(options1)
}

/**
 * @private
 * Select a block (for part/port)
 */
function handleSelectBlock (options) {
  const view = options.view
  if (view.model instanceof type.SysMLProperty || view.model instanceof type.SysMLPort) {
    app.elementPickerDialog.showDialog('Select Block', view.model.type, type.SysMLBlock).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.engine.setProperty(view.model, 'type', returnValue)
      }
    })
  }
}

/**
 * @private
 * Create a block (for part/port)
 */
function handleCreateBlock (options) {
  const view = options.view
  if (view.model instanceof type.SysMLProperty || view.model instanceof type.SysMLPort) {
    const parent = view.model._parent
    if (parent) {
      app.dialogs.showInputDialog(
        'Enter name of Block to create'
      ).then(function ({buttonId, returnValue}) {
        if (buttonId === 'ok' && returnValue.length > 0) {
          const builder = app.repository.getOperationBuilder()
          builder.begin('assign new block')
          var model = new type.SysMLBlock()
          model._parent = parent
          model.name = returnValue
          builder.insert(model)
          builder.fieldInsert(parent, 'ownedElements', model)
          builder.fieldAssign(view.model, 'type', model)
          builder.end()
          var cmd = builder.getOperation()
          app.repository.doOperation(cmd)
        }
      })
    }
  }
}

/**
 * @private
 * Select a value type
 */
function handleSelectValueType (options) {
  const view = options.view
  if (view.model instanceof type.SysMLProperty || view.model instanceof type.SysMLPort) {
    app.elementPickerDialog.showDialog('Select ValueType', view.model.type, type.SysMLValueType).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.engine.setProperty(view.model, 'type', returnValue)
      }
    })
  }
}

/**
 * @private
 * Create a value type
 */
function handleCreateValueType (options) {
  const view = options.view
  if (view.model instanceof type.SysMLProperty || view.model instanceof type.SysMLPort) {
    const parent = view.model._parent
    if (parent) {
      app.dialogs.showInputDialog(
        'Enter name of ValueType to create'
      ).then(function ({buttonId, returnValue}) {
        if (buttonId === 'ok' && returnValue.length > 0) {
          const builder = app.repository.getOperationBuilder()
          builder.begin('assign new value type')
          var model = new type.SysMLValueType()
          model._parent = parent
          model.name = returnValue
          builder.insert(model)
          builder.fieldInsert(parent, 'ownedElements', model)
          builder.fieldAssign(view.model, 'type', model)
          builder.end()
          var cmd = builder.getOperation()
          app.repository.doOperation(cmd)
        }
      })
    }
  }
}

/**
 * @private
 * Add an item flow
 */
function handleCreateItemFlow (options) {
  const t1 = options.model.end1.reference.type
  const t2 = options.model.end2.reference.type
  app.factory.assert(
    t1 instanceof type.UMLClassifier && t2 instanceof type.UMLClassifier,
    'Connected Parts (or Ports) should be typed'
  )
  app.dialogs.showSelectRadioDialog(
    'Select direction of ItemFlow',
    [
      { text: `From ${t2.name} To ${t1.name}`, value: 'end1' },
      { text: `From ${t1.name} To ${t2.name}`, value: 'end2' }
    ]
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      if (returnValue === 'end1') {
        app.factory.createModel({
          id: 'SysMLItemFlow',
          parent: options.model,
          modelInitializer: (model) => {
            model.source = t2
            model.target = t1
            model.realizingConnectors.push(options.model)
          }
        })
      } else if (returnValue === 'end2') {
        app.factory.createModel({
          id: 'SysMLItemFlow',
          parent: options.model,
          modelInitializer: (model) => {
            model.source = t1
            model.target = t2
            model.realizingConnectors.push(options.model)
          }
        })
      }
    }
  })
}

/**
 * @private
 * Select a constraint block (for constraint property)
 */
function handleSelectConstraintBlock (options) {
  const view = options.view
  if (view.model instanceof type.SysMLProperty) {
    app.elementPickerDialog.showDialog('Select ConstraintBlock', view.model.type, type.SysMLConstraintBlock).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.engine.setProperty(view.model, 'type', returnValue)
      }
    })
  }
}

/**
 * @private
 * Create a constraint block (for constraint property)
 */
function handleCreateConstraintBlock (options) {
  const view = options.view
  if (view.model instanceof type.SysMLProperty) {
    const parent = view.model._parent._parent
    if (parent) {
      app.dialogs.showInputDialog(
        'Enter name of a ConstraintBlock to create'
      ).then(function ({buttonId, returnValue}) {
        if (buttonId === 'ok' && returnValue.length > 0) {
          const builder = app.repository.getOperationBuilder()
          builder.begin('assign new block')
          var model = new type.SysMLConstraintBlock()
          model._parent = parent
          model.name = returnValue
          builder.insert(model)
          builder.fieldInsert(parent, 'ownedElements', model)
          builder.fieldAssign(view.model, 'type', model)
          builder.end()
          var cmd = builder.getOperation()
          app.repository.doOperation(cmd)
        }
      })
    }
  }
}

/**
 * @private
 * Add a constraint parameter
 */
function handleAddConstraintParameter (options) {
  const view = options.view
  console.log(options)
  const diagram = app.diagrams.getCurrentDiagram()
  const _x = view.left + Math.round(Math.random() * view.width)
  const _y = view.top + Math.round(Math.random() * view.height)
  const options1 = {
    id: 'SysMLConstraintParameter',
    diagram: diagram,
    parent: view.model,
    x1: _x,
    y1: _y,
    x2: _x,
    y2: _y,
    containerView: view
  }
  return app.factory.createModelAndView(options1)
}

/**
 * @private
 * Update the states of menus
 */
function updateMenus () {
  let views = app.selections.getSelectedViews()
  let selected = app.selections.getSelected()
  let isNone = !selected
  let isProject = selected instanceof type.Project
  let isPackage = selected instanceof type.UMLPackage || selected instanceof type.UMLSubsystem
  let isClassifier = selected instanceof type.UMLClassifier
  let isBlock = selected instanceof type.SysMLBlock
  let isConstraintBlock = selected instanceof type.SysMLConstraintBlock
  let visibleStates = {
    'uml.attribute': isClassifier && !isBlock,
    'uml.port': isClassifier && !isBlock,
    'uml.class': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.interface': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.signal': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.datatype': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.primitive-type': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.enumeration': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.artifact': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.component': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.node': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.usecase': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.actor': (isProject || isPackage || isClassifier) && !isBlock,
    'uml.information-item': (isProject || isPackage || isClassifier) && !isBlock,

    'sysml.requirement-diagram': (isNone || isProject || isPackage),
    'sysml.block-definition-diagram': (isNone || isProject || isPackage),
    'sysml.internal-block-diagram': isBlock,
    'sysml.parametric-diagram': isConstraintBlock,
    'sysml.requirement': (isProject || isPackage || isClassifier),
    'sysml.block': (isProject || isPackage || isClassifier),
    'sysml.value-type': (isProject || isPackage || isClassifier),
    'sysml.interface-block': (isProject || isPackage || isClassifier),
    'sysml.constraint-block': (isProject || isPackage || isClassifier),
    'sysml.port': isBlock,
    'sysml.constraint': isBlock,
    'sysml.part': isBlock,
    'sysml.reference': isBlock,
    'sysml.value': isBlock,
    'sysml.property': isBlock,
    'sysml.flow-property': isBlock,
    'sysml.parameter': isConstraintBlock
  }
  let checkedStates = {
    'format.suppress-property-values': (type.Element.mergeProps(views, 'suppressPropertyValues')),
    'format.suppress-constraints': (type.Element.mergeProps(views, 'suppressConstraints')),
    'format.suppress-parts': (type.Element.mergeProps(views, 'suppressParts')),
    'format.suppress-ports': (type.Element.mergeProps(views, 'suppressPorts')),
    'format.suppress-references': (type.Element.mergeProps(views, 'suppressReferences')),
    'format.suppress-values': (type.Element.mergeProps(views, 'suppressValues')),
    'format.suppress-properties': (type.Element.mergeProps(views, 'suppressProperties')),
    'format.suppress-flow-properties': (type.Element.mergeProps(views, 'suppressFlowProperties'))
  }
  app.menu.updateStates(visibleStates, null, checkedStates)
}

// For QuickEdits
app.commands.register('sysml:add-sub-requirement', handleAddSubRequirement)
app.commands.register('sysml:add-composited-block', handleAddCompositedBlock)
app.commands.register('sysml:add-port', handleAddPort)
app.commands.register('sysml:select-block', handleSelectBlock)
app.commands.register('sysml:create-block', handleCreateBlock)
app.commands.register('sysml:select-value-type', handleSelectValueType)
app.commands.register('sysml:create-value-type', handleCreateValueType)
app.commands.register('sysml:create-item-flow', handleCreateItemFlow)
app.commands.register('sysml:select-constraint-block', handleSelectConstraintBlock)
app.commands.register('sysml:create-constraint-block', handleCreateConstraintBlock)
app.commands.register('sysml:add-constraint-parameter', handleAddConstraintParameter)

// Format
app.commands.register('format:suppress-property-values', _.partial(handleToggleProperty, 'suppressPropertyValues'), 'SysML: Suppress Property Values')
app.commands.register('format:suppress-constraints', _.partial(handleToggleProperty, 'suppressConstraints'), 'SysML: Suppress Constraints')
app.commands.register('format:suppress-parts', _.partial(handleToggleProperty, 'suppressParts'), 'SysML: Suppress Parts')
app.commands.register('format:suppress-ports', _.partial(handleToggleProperty, 'suppressPorts'), 'SysML: Suppress Ports')
app.commands.register('format:suppress-references', _.partial(handleToggleProperty, 'suppressReferences'), 'SysML: Suppress References')
app.commands.register('format:suppress-values', _.partial(handleToggleProperty, 'suppressValues'), 'SysML: Suppress Values')
app.commands.register('format:suppress-properties', _.partial(handleToggleProperty, 'suppressProperties'), 'SysML: Suppress Properties')
app.commands.register('format:suppress-flow-properties', _.partial(handleToggleProperty, 'suppressFlowProperties'), 'SysML: Suppress Flow Properties')

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
