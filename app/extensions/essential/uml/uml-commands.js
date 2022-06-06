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
const {
  Element,
  UMLParameter,
  UMLAttribute,
  UMLMessage,
  UMLTransition,
  UMLPseudostate,
  UMLGeneralNodeView
} = global.type

const grammarName = fs.readFileSync(path.join(__dirname, '/grammars/uml-name.pegjs'), 'utf8')
const grammarAttribute = fs.readFileSync(path.join(__dirname, '/grammars/uml-attribute.pegjs'), 'utf8')
const grammarOperation = fs.readFileSync(path.join(__dirname, '/grammars/uml-operation.pegjs'), 'utf8')
const grammarTemplateParameter = fs.readFileSync(path.join(__dirname, '/grammars/uml-templateparameter.pegjs'), 'utf8')
const grammarLifeline = fs.readFileSync(path.join(__dirname, '/grammars/uml-lifeline.pegjs'), 'utf8')
const grammarObject = fs.readFileSync(path.join(__dirname, '/grammars/uml-object.pegjs'), 'utf8')
const grammarSlot = fs.readFileSync(path.join(__dirname, '/grammars/uml-slot.pegjs'), 'utf8')
const grammarMessage = fs.readFileSync(path.join(__dirname, '/grammars/uml-message.pegjs'), 'utf8')
const grammarTransition = fs.readFileSync(path.join(__dirname, '/grammars/uml-transition.pegjs'), 'utf8')

/**
 * @private
 * New from template
 * @param {string} filename
 */
function handleNewFromTemplate (filename, basePath) {
  const fullPath = path.join(basePath || __dirname, filename)
  ipcRenderer.send('command', 'application:new-from-template', fullPath)
}

/**
 * @private
 * @param {string} fullPath - Fullpath for profile to be loaded.
 */
function handleApplyProfile (fullPath, profileName) {
  if (profileName) {
    const prj = app.project.getProject()
    if (prj && prj.ownedElements.find(e => e.name === profileName) instanceof type.UMLProfile) {
      app.toast.info(`${profileName} already exists`)
      return false
    }
  }
  return app.project.importFromFile(app.project.getProject(), fullPath)
}

/**
 * @private
 * Apply UML standard profile
 */
function handleApplyUMLStandardProfile () {
  const fullPath = path.join(__dirname, 'profiles/UMLStandardProfile.mfj')
  if (handleApplyProfile(fullPath, 'UMLStandardProfile')) {
    app.toast.info('UMLStandardProfile is successfully applied. Look at under Project.')
  }
}

function handleEntryActivity () {
  app.dialogs.showSelectRadioDialog(
    'Select one to create as an entry Activity',
    [
      { text: 'OpaqueBehavior', value: 'UMLOpaqueBehavior', checked: true },
      { text: 'Activity', value: 'UMLActivity' },
      { text: 'StateMachine', value: 'UMLStateMachine' },
      { text: 'Interaction', value: 'UMLInteraction' }
    ]
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      app.factory.createModel({id: returnValue, parent: app.selections.getSelected(), field: 'entryActivities'})
    }
  })
}

function handleDoActivity () {
  app.dialogs.showSelectRadioDialog(
    'Select one to create as an do Activity',
    [
      { text: 'OpaqueBehavior', value: 'UMLOpaqueBehavior', checked: true },
      { text: 'Activity', value: 'UMLActivity' },
      { text: 'StateMachine', value: 'UMLStateMachine' },
      { text: 'Interaction', value: 'UMLInteraction' }
    ]
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      app.factory.createModel({id: returnValue, parent: app.selections.getSelected(), field: 'doActivities'})
    }
  })
}

function handleExitActivity () {
  app.dialogs.showSelectRadioDialog(
    'Select one to create as an exit Activity',
    [
      { text: 'OpaqueBehavior', value: 'UMLOpaqueBehavior', checked: true },
      { text: 'Activity', value: 'UMLActivity' },
      { text: 'StateMachine', value: 'UMLStateMachine' },
      { text: 'Interaction', value: 'UMLInteraction' }
    ]
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      app.factory.createModel({id: returnValue, parent: app.selections.getSelected(), field: 'exitActivities'})
    }
  })
}

function handleEffect () {
  app.dialogs.showSelectRadioDialog(
    'Select one to create as an effect Behavior',
    [
      { text: 'OpaqueBehavior', value: 'UMLOpaqueBehavior', checked: true },
      { text: 'Activity', value: 'UMLActivity' },
      { text: 'StateMachine', value: 'UMLStateMachine' },
      { text: 'Interaction', value: 'UMLInteraction' }
    ]
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      app.factory.createModel({id: returnValue, parent: app.selections.getSelected(), field: 'effects'})
    }
  })
}

function handleConstraint () {
  var parent = app.selections.getSelected()
  if (parent instanceof type.UMLOperation) {
    app.dialogs.showSelectRadioDialog(
      'Select kind of Constraint of Operation',
      [
        { text: 'Typical Constraint', value: 'ownedElements', checked: true },
        { text: 'Precondition', value: 'preconditions' },
        { text: 'BodyCondition', value: 'bodyConditions' },
        { text: 'Postcondition', value: 'postconditions' }
      ]
    ).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.factory.createModel({id: 'UMLConstraint', parent: parent, field: returnValue})
      }
    })
  } else if (parent instanceof type.UMLBehavior) {
    app.dialogs.showSelectRadioDialog(
      'Select kind of Constraint of Behavior',
      [
        { text: 'Typical Constraint', value: 'ownedElements', checked: true },
        { text: 'Precondition', value: 'preconditions' },
        { text: 'Postcondition', value: 'postconditions' }
      ]
    ).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.factory.createModel({id: 'UMLConstraint', parent: parent, field: returnValue})
      }
    })
  } else if (parent instanceof type.UMLAction) {
    app.dialogs.showSelectRadioDialog(
      'Select kind of Constraint of Action',
      [
        { text: 'Typical Constraint', value: 'ownedElements', checked: true },
        { text: 'LocalPrecondition', value: 'localPreconditions' },
        { text: 'LocalPostcondition', value: 'localPostconditions' }
      ]
    ).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.factory.createModel({id: 'UMLConstraint', parent: parent, field: returnValue})
      }
    })
  } else {
    app.factory.createModel({id: 'UMLConstraint', parent: parent, field: 'ownedElements'})
  }
}

function handleFrame (options) {
  options = options || {}
  options.id = 'UMLFrame'
  options.diagram = options.diagram || app.diagrams.getCurrentDiagram()
  options.parent = options.diagram._parent
  app.elementPickerDialog.showDialog('Select an element to be represented as Frame', null, type.Model).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      options.viewInitializer = function (v) {
        v.model = returnValue
      }
      app.factory.createModelAndView(options)
    }
  })
}

function handleStereotypeDisplay (value) {
  var views = app.selections.getSelectedViews()
  app.engine.setElemsProperty(views, 'stereotypeDisplay', value)
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

// =========================== QUICKEDIT COMMANDS ==============================

/**
 * @private
 * Assign a name expression
 * @param {Object} options
 */
function handleNameExpression (options) {
  try {
    const parser = peg.generate(grammarName)
    const ast = parser.parse(options.value)
    let fields = {}
    // set-model options
    if (options['set-model']) {
      options.model = _.get(options.model, options['set-model'])
    }
    // name
    if (ast.name) {
      fields.name = ast.name.trim()
    }
    // visibility
    if (ast.visibility) {
      fields.visibility = ast.visibility
    }
    // stereotype
    if (ast.stereotype && (ast.stereotype.length > 0)) {
      let match = app.repository.lookupAndFind(options.model, ast.stereotype, type.UMLStereotype)
      if (match) {
        fields.stereotype = match
      } else {
        fields.stereotype = ast.stereotype.trim()
      }
    } else {
      fields.stereotype = null
    }
    app.engine.setProperties(options.model, fields)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Assign an attribute expression
 * @param {Object} options
 */
function handleAttributeExpression (options) {
  try {
    let parser = peg.generate(grammarAttribute)
    let ast = parser.parse(options.value)
    let match
    let fields = {}
    // name
    if (ast.name) {
      fields.name = ast.name.trim()
    }
    // visibility
    if (ast.visibility) {
      fields.visibility = ast.visibility
    }
    // stereotype
    if (ast.stereotype && (ast.stereotype.length > 0)) {
      match = app.repository.lookupAndFind(options.model, ast.stereotype, type.UMLStereotype)
      if (match) {
        fields.stereotype = match
      } else {
        fields.stereotype = ast.stereotype.trim()
      }
    } else {
      fields.stereotype = null
    }
    // type
    if (ast.type && (ast.type.length > 0)) {
      match = app.repository.lookupAndFind(options.model, ast.type, type.UMLClassifier)
      if (match) {
        fields.type = match
      } else {
        fields.type = ast.type.trim()
      }
    } else {
      fields.type = null
    }
    // multiplicity
    if (ast.multiplicity && ast.multiplicity.length > 0) {
      fields.multiplicity = ast.multiplicity
    } else {
      fields.multiplicity = ''
    }
    // defaultValue
    if (ast.defaultValue) {
      fields.defaultValue = ast.defaultValue.trim()
    } else {
      fields.defaultValue = ''
    }
    app.engine.setProperties(options.model, fields)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Assign an operation expression
 * @param {Object} options
 */
function handleOperationExpression (options) {
  try {
    let parser = peg.generate(grammarOperation)
    let ast = parser.parse(options.value)
    let match
    const builder = app.repository.getOperationBuilder()
    builder.begin('change operation')
    // name
    if (ast.name) {
      builder.fieldAssign(options.model, 'name', ast.name.trim())
    }
    // visibility
    if (ast.visibility) {
      builder.fieldAssign(options.model, 'visibility', ast.visibility)
    }
    // stereotype
    if (ast.stereotype && (ast.stereotype.length > 0)) {
      match = app.repository.lookupAndFind(options.model, ast.stereotype, type.UMLStereotype)
      if (match) {
        builder.fieldAssign(options.model, 'stereotype', match)
      } else {
        builder.fieldAssign(options.model, 'stereotype', ast.stereotype.trim())
      }
    } else {
      builder.fieldAssign(options.model, 'stereotype', null)
    }
    // parameters (파라미터들이 변경되었을때)
    // 1) 기존의 파라미터들을 유지하고 name, type, direction 값들만 업데이트 한다.
    // 2) 기존의 파라미터의 수가 모자라면 새로 생성해서 추가한다.
    // 3) 기존의 파라미터의 수가 넘어가면 삭제한다.

    if (!ast.parameters) {
      console.log(ast)
      ast.parameters = []
    }
    if (ast.parameters) {
      let nonReturnParams = options.model.getNonReturnParameters()
      for (let i = 0; i < ast.parameters.length; i++) {
        let param = ast.parameters[i]
        if (nonReturnParams[i]) {
          // parameter name
          if (param.name) {
            builder.fieldAssign(nonReturnParams[i], 'name', param.name)
          }
          // parameter type
          if (param.type && (param.type.length > 0)) {
            match = app.repository.lookupAndFind(options.model, param.type, type.UMLClassifier)
            if (match) {
              builder.fieldAssign(nonReturnParams[i], 'type', match)
            } else {
              builder.fieldAssign(nonReturnParams[i], 'type', param.type.trim())
            }
          } else {
            builder.fieldAssign(nonReturnParams[i], 'type', null)
          }
          // direction
          if (param.direction) {
            builder.fieldAssign(nonReturnParams[i], 'direction', param.direction)
          } else {
            builder.fieldAssign(nonReturnParams[i], 'direction', UMLParameter.DK_IN)
          }
          // multiplicity
          if (param.multiplicity) {
            builder.fieldAssign(nonReturnParams[i], 'multiplicity', param.multiplicity)
          } else {
            builder.fieldAssign(nonReturnParams[i], 'multiplicity', '')
          }
          // defaultValue
          if (param.defaultValue) {
            builder.fieldAssign(nonReturnParams[i], 'defaultValue', param.defaultValue.trim())
          } else {
            builder.fieldAssign(nonReturnParams[i], 'defaultValue', '')
          }
        } else {
          let newParam = new type.UMLParameter()
          newParam._parent = options.model
          // new name
          newParam.name = param.name.trim()
          // new parameter type
          if (param.type && (param.type.length > 0)) {
            match = app.repository.lookupAndFind(options.model, param.type, type.UMLClassifier)
            if (match) {
              newParam.type = match
            } else {
              newParam.type = param.type.trim()
            }
          } else {
            newParam.type = null
          }
          // direction
          if (param.direction) {
            newParam.direction = param.direction
          } else {
            newParam.direction = UMLParameter.DK_IN
          }
          // multiplicity
          if (param.multiplicity) {
            newParam.multiplicity = param.multiplicity.trim()
          } else {
            newParam.multiplicity = ''
          }
          // defaultValue
          if (param.defaultValue) {
            newParam.defaultValue = param.defaultValue.trim()
          } else {
            newParam.defaultValue = ''
          }
          builder.insert(newParam)
          builder.fieldInsert(options.model, 'parameters', newParam)
        }
      }
      if (nonReturnParams.length > ast.parameters.length) {
        for (let j = ast.parameters.length; j < nonReturnParams.length; j++) {
          builder.fieldRemove(options.model, 'parameters', nonReturnParams[j])
          builder.remove(nonReturnParams[j])
        }
      }
    }
    // returnType
    let returnParam = options.model.getReturnParameter()
    if (returnParam) {
      if (ast.returnType) {
        if (ast.returnType.length > 0) {
          match = app.repository.lookupAndFind(options.model, ast.returnType, type.UMLClassifier)
          if (match) {
            builder.fieldAssign(returnParam, 'type', match)
          } else {
            builder.fieldAssign(returnParam, 'type', ast.returnType.trim())
          }
          if (ast.returnMultiplicity) {
            builder.fieldAssign(returnParam, 'multiplicity', ast.returnMultiplicity)
          } else {
            builder.fieldAssign(returnParam, 'multiplicity', '')
          }
        } else {
          builder.fieldAssign(returnParam, 'type', null)
        }
      } else {
        if (returnParam) {
          builder.fieldRemove(options.model, 'parameters', returnParam)
          builder.remove(returnParam)
        }
      }
    } else {
      if (ast.returnType) {
        returnParam = new type.UMLParameter()
        returnParam._parent = options.model
        returnParam.direction = UMLParameter.DK_RETURN
        if (ast.returnType.length > 0) {
          match = app.repository.lookupAndFind(options.model, ast.returnType, type.UMLClassifier)
          if (match) {
            returnParam.type = match
          } else {
            returnParam.type = ast.returnType.trim()
          }
          if (ast.returnMultiplicity) {
            returnParam.multiplicity = ast.returnMultiplicity.trim()
          } else {
            returnParam.multiplicity = ''
          }
        } else {
          returnParam.type = null
        }
        builder.insert(returnParam)
        builder.fieldInsert(options.model, 'parameters', returnParam)
      }
    }
    builder.end()
    let cmd = builder.getOperation()
    app.repository.doOperation(cmd)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Assign a template parameter expression
 * @param {Object} options
 */
function handleTemplateParameterExpression (options) {
  try {
    let parser = peg.generate(grammarTemplateParameter)
    let ast = parser.parse(options.value)
    let fields = {}
    // name
    if (ast.name) {
      fields.name = ast.name.trim()
    }
    // stereotype
    if (ast.stereotype && (ast.stereotype.length > 0)) {
      var match = app.repository.lookupAndFind(options.model, ast.stereotype, type.UMLStereotype)
      if (match) {
        fields.stereotype = match
      } else {
        fields.stereotype = ast.stereotype.trim()
      }
    } else {
      fields.stereotype = null
    }
    // parameterType
    if (ast.parameterType) {
      fields.parameterType = ast.parameterType.trim()
    } else {
      fields.parameterType = ''
    }
    // defaultValue
    if (ast.defaultValue) {
      fields.defaultValue = ast.defaultValue.trim()
    } else {
      fields.defaultValue = ''
    }
    app.engine.setProperties(options.model, fields)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Assign a constraint specification
 * @param {Object} options
 */
function handleConstraintSpecification (options) {
  try {
    app.engine.setProperties(options.model, { specification: options.value })
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Add note command
 *
 * @param {Object} options
 *     options.view {View} - A view element where a created note to be attached
 */
function handleAddNote (options) {
  // if (options.view instanceof type.UMLGeneralEdgeView)
  let view = options.view
  let diagram = app.diagrams.getEditor().diagram
  let parent = diagram._parent
  let nodes = app.repository.getConnectedNodeViews(view, type.UMLNoteLinkView)
  let area = (options.view instanceof type.UMLGeneralEdgeView) ? view.nameLabel.getBoundingBox() : view.getBoundingBox()
  let pos = app.quickedits.getRightPosition(area, nodes)
  let options1 = {
    x1: pos.x1,
    y1: pos.y1,
    x2: pos.x1 + 100,
    y2: pos.y1 + 50,
    id: 'Note',
    parent: parent,
    diagram: diagram
  }
  let nodeView = app.factory.createModelAndView(options1)
  let options2 = {
    id: 'NoteLink',
    parent: parent,
    diagram: diagram,
    tailView: view,
    headView: nodeView
  }
  if (options2.tailView instanceof type.EdgeLabelView || options2.tailView instanceof type.NodeLabelView) {
    options2.tailView = options2.tailView._parent
  }
  if (options2.headView instanceof type.EdgeLabelView || options2.headView instanceof type.NodeLabelView) {
    options2.headView = options2.headView._parent
  }
  app.factory.createModelAndView(options2)
}

function handleAddConstraint (options) {
  try {
    let diagram = app.diagrams.getEditor().diagram
    let nodes = app.repository.getConnectedNodeViews(options.view, type.UMLConstraintLinkView)
    let area = (options.view instanceof type.UMLGeneralEdgeView) ? options.view.nameLabel.getBoundingBox() : options.view.getBoundingBox()
    let pos = app.quickedits.getLeftPosition(area, nodes)
    const builder = app.repository.getOperationBuilder()
    const parent = options.model
    builder.begin('add constraint')
    var model = new type.UMLConstraint()
    model._parent = parent
    model.name = type.Element.getNewName(parent.ownedElements, 'Constraint')
    var view = new type.UMLConstraintView()
    view._parent = diagram
    view.model = model
    view.initialize(null, pos.x1, pos.y1, pos.x1 + 50, pos.y1 + 20)
    var link = new type.UMLConstraintLinkView()
    link.head = options.view
    link.tail = view
    link._parent = diagram
    link.initialize(null, link.tail.left, link.tail.top, link.head.left, link.head.top)
    builder.insert(model)
    builder.insert(view)
    builder.insert(link)
    builder.fieldInsert(parent, 'ownedElements', model)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.fieldInsert(diagram, 'ownedViews', link)
    builder.end()
    var cmd = builder.getOperation()
    app.repository.doOperation(cmd)
  } catch (err) {
    console.log(err)
    options.result = false
  }
}

/**
 * @private
 * A command to add compartment item
 *
 * @param {Object} options
 *     options.model {Model} - A model element
 *     options.view {View} - A view element
 *     options.parent-view
 */
function handleAddCompartmentItem (options) {
  options['parent-model'] = options['parent-model'] ? _.get(options, options['parent-model']) : options.model._parent
  options['parent-view'] = options['parent-view'] ? _.get(options, options['parent-view']) : options.view._parent
  // Show compartment if suppressed
  if (options['suppress-property']) {
    if (options['parent-view'][options['suppress-property']] === true) {
      app.engine.setProperty(options['parent-view'], options['suppress-property'], false)
    }
  }
  // Create compartment item
  let item = new type[options.type]()
  item.name = type.Element.getNewName(options['parent-model'][options.field], options['name-prefix'])
  if (options.initializer) {
    options.initializer(item)
  }
  if (options['model-init']) {
    Object.assign(item, options['model-init'])
  }
  app.engine.addModel(options['parent-model'], options.field, item)
  // Open quickedit for the created compartment item
  app.quickedits.close()
  _.defer(() => {
    _.each(options['parent-view'][options.compartment].subViews, (subView) => {
      if (subView.model._id === item._id) {
        app.quickedits.open(subView)
      }
    })
  })
}

function handleDeleteCompartmentItem (options) {
  let index = _.indexOf(options.view._parent.subViews, options.view)
  app.engine.deleteElements([options.view.model], [])
  app.quickedits.close()
  if (index >= options.view._parent.subViews.length) {
    index = options.view._parent.subViews.length - 1
  }
  let subView = options.view._parent.subViews[index]
  if (subView) {
    _.defer(() => { app.quickedits.open(subView) })
  }
}

function handleMoveUpCompartmentItem (options) {
  options['parent-model'] = options['parent-model'] ? _.get(options, options['parent-model']) : options.model._parent
  app.engine.moveUp(options['parent-model'], options.field, options.model)
  app.quickedits.close()
  _.defer(() => {
    _.each(options.view._parent.subViews, (subView) => {
      if (subView.model._id === options.view.model._id) {
        app.quickedits.open(subView)
      }
    })
  })
}

function handleMoveDownCompartmentItem (options) {
  options['parent-model'] = options['parent-model'] ? _.get(options, options['parent-model']) : options.model._parent
  app.engine.moveDown(options['parent-model'], options.field, options.model)
  app.quickedits.close()
  _.defer(() => {
    _.each(options.view._parent.subViews, (subView) => {
      if (subView.model._id === options.view.model._id) {
        app.quickedits.open(subView)
      }
    })
  })
}

function _getPrevVisible (subviews, startIdx) {
  var idx = startIdx
  while (subviews[idx] && subviews[idx].visible !== true && idx > -1) {
    idx--
  }
  if (idx > -1) {
    return idx
  }
  return -1
}

function _getNextVisible (subviews, startIdx) {
  var idx = startIdx
  while (subviews[idx] && subviews[idx].visible !== true && idx < subviews.length) {
    idx++
  }
  if (idx < subviews.length) {
    return idx
  }
  return -1
}

function handleOpenUpCompartmentItem (options) {
  let compartmentItem = options.view
  // if quickedit is not on a compartment item (e.g. ClassView), then set compartment item to nameLabel
  if (!(options.view._parent instanceof type.UMLCompartmentView) && options.view.nameCompartment) {
    compartmentItem = options.view.nameCompartment.nameLabel
  }
  let compartmentOwner = compartmentItem._parent._parent
  let compartments = compartmentOwner.getAllCompartments ? compartmentOwner.getAllCompartments() : [ compartmentItem._parent ]
  if (compartmentOwner.templateParameterCompartment) {
    compartments.unshift(compartmentOwner.templateParameterCompartment)
  }
  let currentCompartment = compartmentItem._parent
  let compartmentIdx = compartments.indexOf(currentCompartment)
  if (!currentCompartment.subViews) return
  let idx = currentCompartment.subViews.indexOf(compartmentItem)
  let prevIdx = _getPrevVisible(currentCompartment.subViews, idx - 1)
  if (prevIdx < 0 || currentCompartment instanceof type.UMLNameCompartmentView) {
    // Go to previous compartment if it's first item or it's in name compartment
    if (compartmentIdx > 0) {
      let prevCompartment = null
      for (let i = compartmentIdx - 1; i >= 0; i--) {
        if (compartments[i].visible === true) {
          prevCompartment = compartments[i]
          break
        }
      }
      if (prevCompartment) {
        let targetIdx = _getPrevVisible(prevCompartment.subViews, prevCompartment.subViews.length - 1)
        let target = prevCompartment.subViews[targetIdx]
        if (prevCompartment instanceof type.UMLNameCompartmentView) {
          target = prevCompartment._parent
        }
        if (target) {
          _.defer(() => { app.quickedits.open(target) })
        }
      }
    }
  } else {
    let prevIdx = _getPrevVisible(currentCompartment.subViews, idx - 1)
    if (prevIdx > -1) {
      let target = currentCompartment.subViews[prevIdx]
      if (target) {
        _.defer(() => { app.quickedits.open(target) })
      }
    }
  }
}

/**
 * @private
 */
function handleOpenDownCompartmentItem (options) {
  let compartmentItem = options.view
  // if quickedit is not on a compartment item (e.g. ClassView), then set compartment item to nameLabel
  if (!(options.view._parent instanceof type.UMLCompartmentView) && options.view.nameCompartment) {
    compartmentItem = options.view.nameCompartment.nameLabel
  }
  let compartmentOwner = compartmentItem._parent._parent
  let compartments = compartmentOwner.getAllCompartments ? compartmentOwner.getAllCompartments() : [ compartmentItem._parent ]
  if (compartmentOwner.templateParameterCompartment) {
    compartments.unshift(compartmentOwner.templateParameterCompartment)
  }
  let currentCompartment = compartmentItem._parent
  let compartmentIdx = compartments.indexOf(currentCompartment)
  if (!currentCompartment.subViews) return
  let idx = currentCompartment.subViews.indexOf(compartmentItem)
  let nextIdx = _getNextVisible(currentCompartment.subViews, idx + 1)
  if (nextIdx < 0 || currentCompartment instanceof type.UMLNameCompartmentView) {
    // Go to next compartment if it's last item or it's in name compartment
    if (compartmentIdx < compartments.length - 1) {
      let nextCompartment = null
      for (let i = compartmentIdx + 1; i < compartments.length; i++) {
        if (compartments[i].visible === true) {
          nextCompartment = compartments[i]
          break
        }
      }
      if (nextCompartment) {
        let targetIdx = _getNextVisible(nextCompartment.subViews, 0)
        let target = nextCompartment.subViews[targetIdx]
        if (nextCompartment instanceof type.UMLNameCompartmentView) {
          target = nextCompartment._parent
        }
        if (target) {
          _.defer(() => { app.quickedits.open(target) })
        }
      }
    }
  } else {
    let nextIdx = _getNextVisible(currentCompartment.subViews, idx + 1)
    if (nextIdx < currentCompartment.subViews.length) {
      let target = currentCompartment.subViews[nextIdx]
      if (target) {
        _.defer(() => { app.quickedits.open(target) })
      }
    }
  }
}

/**
 * @private
 * Add a template parameter substitution
 */
function handleAddTemplateParameterSubstitution (options) {
  const view = options.view
  const options1 = {
    id: 'UMLTemplateParameterSubstitution',
    parent: view.model,
    field: 'parameterSubstitutions'
  }
  return app.factory.createModel(options1)
}

/**
 * @private
 * Add a sub-class
 */
function handleAddSubClass (options) {
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(options.view, type.UMLGeneralizationView)
  const options1 = Object.assign({
    id: 'UMLClass',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(options.view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLGeneralization',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, options.view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a super-class
 */
function handleAddSuperClass (options) {
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(options.view, type.UMLGeneralizationView)
  const options1 = Object.assign({
    id: 'UMLClass',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(options.view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLGeneralization',
    diagram: diagram,
    parent: options.view.model
  }, app.quickedits.getEdgeViewOption(options.view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a sub-interface
 */
function handleAddSubInterface (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLGeneralizationView)
  const options1 = Object.assign({
    id: 'UMLInterface',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLGeneralization',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a super-interface
 */
function handleAddSuperInterface (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLGeneralizationView)
  const options1 = Object.assign({
    id: 'UMLInterface',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLGeneralization',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a realizing class
 */
function handleAddRealizingClass (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLInterfaceRealizationView)
  const options1 = Object.assign({
    id: 'UMLClass',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLInterfaceRealization',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a provided interface
 */
function handleAddProvidedInterface (options) {
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  let view = options.view
  if (view instanceof type.NodeLabelView) {
    view = view._parent
  }
  const nodes = app.quickedits.getHeadNodes(view, type.UMLInterfaceRealizationView)
  let options1 = app.quickedits.getTopPosition(view.getBoundingBox(), nodes)
  if (view.containerView) {
    if (view.getRight() > view.containerView.getRight()) {
      options1 = app.quickedits.getRightPosition(view.getBoundingBox(), nodes)
    } else if (view.left < view.containerView.left) {
      options1 = app.quickedits.getLeftPosition(view.getBoundingBox(), nodes)
    } else if (view.getBottom() > view.containerView.getBottom()) {
      options1 = app.quickedits.getBottomPosition(view.getBoundingBox(), nodes)
    }
  }
  options1 = Object.assign({
    id: 'UMLInterface',
    diagram: diagram,
    parent: diagramOwner
  }, options1)
  const nodeView = app.factory.createModelAndView(options1)
  if ((view.model instanceof type.UMLPort) && !(view.model.type instanceof type.UMLClassifier)) {
    var _portType = app.factory.createModel({
      id: 'UMLClass',
      parent: view.containerView.model._parent,
      field: 'ownedElements',
      modelInitializer: function (e) {
        e.name = view.model.name + 'Type'
      }
    })
    app.engine.setProperty(view.model, 'type', _portType)
  }
  const options2 = Object.assign({
    id: 'UMLInterfaceRealization',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a required interface
 */
function handleAddRequiredInterface (options) {
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  let view = options.view
  if (view instanceof type.NodeLabelView) {
    view = view._parent
  }
  const nodes = app.quickedits.getHeadNodes(view, type.UMLDependencyView)
  let options1 = app.quickedits.getTopPosition(view.getBoundingBox(), nodes)
  if (view.containerView) {
    if (view.getRight() > view.containerView.getRight()) {
      options1 = app.quickedits.getRightPosition(view.getBoundingBox(), nodes)
    } else if (view.left < view.containerView.left) {
      options1 = app.quickedits.getLeftPosition(view.getBoundingBox(), nodes)
    } else if (view.getBottom() > view.containerView.getBottom()) {
      options1 = app.quickedits.getBottomPosition(view.getBoundingBox(), nodes)
    }
  }
  options1 = Object.assign({
    id: 'UMLInterface',
    diagram: diagram,
    parent: diagramOwner
  }, options1)
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLDependency',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an associated class
 */
function handleAddAssociatedClass (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLAssociationView, function (e) {
    return (e.tail === view && e.model.end1.aggregation === UMLAttribute.AK_NONE)
  })
  const options1 = Object.assign({
    id: 'UMLClass',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLAssociation',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an aggregated class
 */
function handleAddAggregatedClass (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLAssociationView, function (e) {
    return (e.tail === view && e.model.end1.aggregation === UMLAttribute.AK_SHARED)
  })
  const options1 = Object.assign({
    id: 'UMLClass',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLAssociation',
    diagram: diagram,
    parent: nodeView.model,
    modelInitializer: function (model) {
      model.end1.aggregation = UMLAttribute.AK_SHARED
    }
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a composited class
 */
function handleAddCompositedClass (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLAssociationView, function (e) {
    return (e.tail === view && e.model.end1.aggregation === UMLAttribute.AK_COMPOSITE)
  })
  const options1 = Object.assign({
    id: 'UMLClass',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLAssociation',
    diagram: diagram,
    parent: nodeView.model,
    modelInitializer: function (model) {
      model.end1.aggregation = UMLAttribute.AK_COMPOSITE
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
    id: 'UMLPort',
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
 * Add a part
 */
function handleAddPart (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const nodes = _.filter(view.containedViews, function (e) { return (e instanceof type.UMLPartView) })
  const options1 = {
    id: 'UMLPart',
    diagram: diagram,
    parent: view.model,
    x1: view.left + 10,
    y1: view.top + 30,
    x2: view.left + 10,
    y2: view.top + 30,
    containerView: view
  }
  if (nodes.length > 0) {
    var _rightMost = _.max(nodes, function (e) { return e.getRight() })
    options1.x1 = _rightMost.getRight() + 10
    options1.y1 = _rightMost.top
    options1.x2 = _rightMost.getRight() + 10
    options1.y2 = _rightMost.top
  }
  return app.factory.createModelAndView(options1)
}

/**
 * @private
 * Select an operation
 */
function handleSelectOwnerAttribute (options) {
  if (options['set-model']) {
    options.model = _.get(options.model, options['set-model'])
  }
  const oppositeEnd = options.model.getOppositeEnd()
  var attrs = oppositeEnd.reference.attributes
  app.elementListPickerDialog.showDialog(
    'Select Owner Attribute',
    attrs
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      app.engine.setProperty(options.model, 'ownerAttribute', returnValue)
    }
  })
}

/**
 * @private
 * Select a signal (for Reception and Message)
 */
function handleSelectSignal (options) {
  const view = options.view
  app.elementPickerDialog.showDialog('Select Signal', view.model.signature, type.UMLSignal).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      if (view.model instanceof type.UMLReception) {
        app.engine.setProperty(view.model, 'signal', returnValue)
      } else if (view.model instanceof type.UMLMessage) {
        app.engine.setProperty(view.model, 'signature', returnValue)
      }
    }
  })
}

/**
 * @private
 * Add a sub-package
 */
function handleAddSubPackage (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const nodes = app.quickedits.getTailNodes(view, type.UMLContainmentView)
  const options1 = Object.assign({
    id: 'UMLPackage',
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
 * Add a dependant package
 */
function handleAddDependantPackage (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLDependencyView)
  const options1 = Object.assign({
    id: 'UMLPackage',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLDependency',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a depending package
 */
function handleAddDependingPackage (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLDependencyView)
  const options1 = Object.assign({
    id: 'UMLPackage',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLDependency',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Select a type (for part/port)
 */
function handleSelectType (options) {
  const view = options.view
  if (view.model instanceof type.UMLAttribute) {
    app.elementPickerDialog.showDialog('Select Type', view.model.type, type.UMLClassifier).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.engine.setProperty(view.model, 'type', returnValue)
      }
    })
  }
}

/**
 * @private
 * Create a type (for part/port)
 */
function handleCreateType (options) {
  const view = options.view
  if (view.model instanceof type.UMLAttribute) {
    const parent = view.model._parent
    if (parent) {
      app.dialogs.showInputDialog(
        'Enter a type name to create'
      ).then(function ({buttonId, returnValue}) {
        if (buttonId === 'ok' && returnValue.length > 0) {
          const builder = app.repository.getOperationBuilder()
          builder.begin('assign new class')
          var model = new type.UMLClass()
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
 * Add a connected part
 */
function handleAddConnectedPart (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const nodes = app.quickedits.getBothNodes(view, type.UMLConnectorView)
  let options1
  if (view.getRight() > view.containerView.getRight()) {
    options1 = app.quickedits.getLeftPosition(view.getBoundingBox(), nodes)
  } else if (view.left < view.containerView.left) {
    options1 = app.quickedits.getRightPosition(view.getBoundingBox(), nodes)
  } else if (view.getBottom() > view.containerView.getBottom()) {
    options1 = app.quickedits.getTopPosition(view.getBoundingBox(), nodes)
  } else {
    options1 = app.quickedits.getBottomPosition(view.getBoundingBox(), nodes)
  }
  options1 = Object.assign({
    id: 'UMLPart',
    diagram: diagram,
    parent: view.model._parent,
    containerView: view.containerView
  }, options1)
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLConnector',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a linked object
 */
function handleAddLinkedObject (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLLinkView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'UMLObject',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLLink',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Set note's text
 */
function handleSetNoteText (options) {
  const view = options.view
  console.log(options)
  app.engine.setProperty(view, 'text', options.value)
}

/**
 * @private
 * Set object expression
 */
function handleSetObjectExpression (options) {
  try {
    const parser = peg.generate(grammarObject)
    const ast = parser.parse(options.value)
    const elem = options.model
    var match
    var fields = {}
    // name
    if (ast.name) {
      fields.name = ast.name.trim()
    } else {
      fields.name = ''
    }
    // visibility
    if (ast.visibility) {
      fields.visibility = ast.visibility
    }
    // stereotype
    if (ast.stereotype && (ast.stereotype.length > 0)) {
      match = app.repository.lookupAndFind(elem, ast.stereotype, type.UMLStereotype)
      if (match) {
        fields.stereotype = match
      } else {
        fields.stereotype = ast.stereotype.trim()
      }
    } else {
      fields.stereotype = null
    }
    // type
    if (ast.type && (ast.type.length > 0)) {
      match = app.repository.lookupAndFind(elem, ast.type, type.UMLClassifier)
      if (match) {
        fields.classifier = match
      } else {
        fields.classifier = ast.type.trim()
      }
    } else {
      fields.classifier = null
    }
    app.engine.setProperties(elem, fields)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Set slot expression
 */
function handleSetSlotExpression (options) {
  try {
    const parser = peg.generate(grammarSlot)
    const ast = parser.parse(options.value)
    const elem = options.model
    var match
    var fields = {}
    // name
    if (ast.name) {
      fields.name = ast.name.trim()
    }
    // visibility
    if (ast.visibility) {
      fields.visibility = ast.visibility
    }
    // stereotype
    if (ast.stereotype && (ast.stereotype.length > 0)) {
      match = app.repository.lookupAndFind(elem, ast.stereotype, type.UMLStereotype)
      if (match) {
        fields.stereotype = match
      } else {
        fields.stereotype = ast.stereotype.trim()
      }
    } else {
      fields.stereotype = null
    }
    // type
    if (ast.type && (ast.type.length > 0)) {
      match = app.repository.lookupAndFind(elem, ast.type, type.UMLClassifier)
      if (match) {
        fields.type = match
      } else {
        fields.type = ast.type.trim()
      }
    } else {
      fields.type = null
    }
    // value
    if (ast.value) {
      fields.value = ast.value.trim()
    } else {
      fields.value = ''
    }
    app.engine.setProperties(elem, fields)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Add a communicating node
 */
function handleAddCommunicatingNode (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLCommunicationPathView)
  const options1 = Object.assign({
    id: 'UMLNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLCommunicationPath',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a deployed artifact
 */
function handleAddDeployedArtifact (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLDeploymentView)
  const options1 = Object.assign({
    id: 'UMLArtifact',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLDeployment',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a deployed component
 */
function handleAddDeployedComponent (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLDeploymentView)
  const options1 = Object.assign({
    id: 'UMLComponent',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLDeployment',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an associated actor
 */
function handleAddAssociatedActor (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLAssociationView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'UMLActor',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getLeftPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLAssociation',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an included use case
 */
function handleAddIncludedUseCase (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLIncludeView)
  const options1 = Object.assign({
    id: 'UMLUseCase',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLInclude',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an extended use case
 */
function handleAddExtendedUseCase (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLExtendView)
  const options1 = Object.assign({
    id: 'UMLUseCase',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLExtend',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a sub-actor
 */
function handleAddSubActor (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLGeneralizationView)
  const options1 = Object.assign({
    id: 'UMLActor',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLGeneralization',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a super-actor
 */
function handleAddSuperActor (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLGeneralizationView)
  const options1 = Object.assign({
    id: 'UMLActor',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLGeneralization',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an associated use case
 */
function handleAddAssociatedUseCase (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLAssociationView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'UMLUseCase',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLAssociation',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Set lifeline expression
 */
function handleSetLifelineExpression (options) {
  try {
    const parser = peg.generate(grammarLifeline)
    const ast = parser.parse(options.value)
    const builder = app.repository.getOperationBuilder()
    const elem = options.model
    let match
    let fields = {}
    // name
    if (ast.name) {
      fields.name = ast.name.trim()
    }
    // visibility
    if (ast.visibility) {
      fields.visibility = ast.visibility
    }
    // stereotype
    if (ast.stereotype && (ast.stereotype.length > 0)) {
      match = app.repository.lookupAndFind(elem, ast.stereotype, type.UMLStereotype)
      if (match) {
        fields.stereotype = match
      } else {
        fields.stereotype = ast.stereotype.trim()
      }
    } else {
      fields.stereotype = null
    }
    // selector
    if (ast.selector) {
      fields.selector = ast.selector.trim()
    } else {
      fields.selector = ''
    }
    builder.begin('set lifeline expression')
    for (var key in fields) {
      builder.fieldAssign(elem, key, fields[key])
    }
    // type
    if (elem.represent) {
      if (ast.type && (ast.type.length > 0)) {
        match = app.repository.lookupAndFind(elem, ast.type, type.UMLClassifier)
        if (match) {
          builder.fieldAssign(elem.represent, 'type', match)
        } else {
          builder.fieldAssign(elem.represent, 'type', ast.type.trim())
        }
      } else {
        builder.fieldAssign(elem.represent, 'type', null)
      }
    }
    builder.end()
    var cmd = builder.getOperation()
    app.repository.doOperation(cmd)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Select a type (for lifeline)
 */
function handleSelectTypeForLifeline (options) {
  const view = options.view
  if (view.model.represent instanceof type.UMLAttribute) {
    app.elementPickerDialog.showDialog('Select Type', view.model.represent.type, type.UMLClassifier).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.engine.setProperty(view.model.represent, 'type', returnValue)
      }
    })
  } else {
    app.dialogs.showAlertDialog("Lifeline should represent a role. (connect 'represent' field to an Attribute of the container Collaboration)")
  }
}

/**
 * @private
 * Create a type (for lifeline)
 */
function handleCreateTypeForLifeline (options) {
  const view = options.view
  if (view.model.represent instanceof type.UMLAttribute) {
    const parent = view.model.represent._parent._parent
    if (parent) {
      app.dialogs.showInputDialog(
        'Enter a type name to create'
      ).then(function ({buttonId, returnValue}) {
        if (buttonId === 'ok' && returnValue.length > 0) {
          const builder = app.repository.getOperationBuilder()
          builder.begin('assign new class')
          var model = new type.UMLClass()
          model._parent = parent
          model.name = returnValue
          builder.insert(model)
          builder.fieldInsert(parent, 'ownedElements', model)
          builder.fieldAssign(view.model.represent, 'type', model)
          builder.end()
          var cmd = builder.getOperation()
          app.repository.doOperation(cmd)
        }
      })
    }
  } else {
    app.dialogs.showAlertDialog("Lifeline should represent a role. (connect 'represent' field to an Attribute of the container Collaboration)")
  }
}

function newSeqLifelinePosition (diagram) {
  var lifelines = _.filter(diagram.ownedViews, function (e) { return (e instanceof type.UMLSeqLifelineView) })
  var rightMost = _.max(lifelines, function (e) { return e.getRight() })
  var options = {
    x1: rightMost.getRight() + 20,
    y1: rightMost.top,
    x2: rightMost.getRight() + 20,
    y2: rightMost.top
  }
  return options
}

function newSeqMessagePosition (fromLifeline, toLifeline, diagram, interval) {
  interval = interval || 35
  var options2 = {
    x1: fromLifeline.left,
    x2: toLifeline.left,
    y1: (fromLifeline instanceof type.UMLSeqLifelineView ? fromLifeline.linePart.top + 20 : fromLifeline.top),
    y2: (fromLifeline instanceof type.UMLSeqLifelineView ? fromLifeline.linePart.top + 20 : fromLifeline.top),
    tailView: fromLifeline,
    headView: toLifeline,
    tailModel: fromLifeline.model || null,
    headModel: toLifeline.model || null
  }
  var messages = _.filter(diagram.ownedViews, function (e) {
    return (e instanceof type.UMLSeqMessageView)
  })
  if (messages.length > 0) {
    var bottomMost = _.max(messages, function (e) { return e.points.points[0].y })
    options2.y1 = bottomMost.points.points[0].y + interval
    options2.y2 = bottomMost.points.points[0].y + interval
  }
  return options2
}

/**
 * @private
 * Add a message with lifeline
 */
function handleAddMessageLifeline (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options1 = Object.assign({
    id: 'UMLLifeline',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqLifelinePosition(diagram))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(view, nodeView, diagram))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a create message with lifeline
 */
function handleAddCreateMessageLifeline (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options1 = Object.assign({
    id: 'UMLLifeline',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqLifelinePosition(diagram))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner,
    modelInitializer: function (model) {
      model.messageSort = UMLMessage.MS_CREATEMESSAGE
    }
  }, newSeqMessagePosition(view, nodeView, diagram, 45))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a self message
 */
function handleAddSelfMessage (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options2 = Object.assign({
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(view, view, diagram))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a found message
 */
function handleAddFoundMessage (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options1 = Object.assign({
    id: 'UMLEndpoint',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(view, view, diagram))
  options1.x1 = view.left - 70
  options1.x2 = view.left - 70
  app.quickedits.setInside(options1)
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(nodeView, view, diagram))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a lost message
 */
function handleAddLostMessage (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options1 = Object.assign({
    id: 'UMLEndpoint',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(view, view, diagram))
  options1.x1 = view.getRight() + 70
  options1.x2 = view.getRight() + 70
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(view, nodeView, diagram))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a message from gate
 */
function handleAddMessageFromGate (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options1 = Object.assign({
    id: 'UMLGate',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(view, view, diagram))
  options1.x1 = view.left - 70
  options1.x2 = view.left - 70
  app.quickedits.setInside(options1)
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(nodeView, view, diagram))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a message to gate
 */
function handleAddMessageToGate (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options1 = Object.assign({
    id: 'UMLGate',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(view, view, diagram))
  options1.x1 = view.getRight() + 70
  options1.x2 = view.getRight() + 70
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner
  }, newSeqMessagePosition(view, nodeView, diagram))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Set a message expression
 */
function handleSetMessageExpression (options) {
  try {
    const parser = peg.generate(grammarMessage)
    const ast = parser.parse(options.value)
    const elem = options.model
    var fields = {}
    // name
    if (ast.name) {
      fields.name = ast.name.trim()
    }
    // stereotype
    if (ast.stereotype && (ast.stereotype.length > 0)) {
      var match = app.repository.lookupAndFind(elem, ast.stereotype, type.UMLStereotype)
      if (match) {
        fields.stereotype = match
      } else {
        fields.stereotype = ast.stereotype.trim()
      }
    } else {
      fields.stereotype = null
    }
    // assignmentTarget
    if (ast.assignmentTarget) {
      fields.assignmentTarget = ast.assignmentTarget.trim()
    } else {
      fields.assignmentTarget = ''
    }
    // arguments
    if (ast.arguments) {
      fields.arguments = ast.arguments.trim()
    } else {
      fields.arguments = ''
    }
    app.engine.setProperties(elem, fields)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Select an operation
 */
function handleSelectOperation (options) {
  const view = options.view
  if ((view.model.target.represent instanceof type.UMLAttribute) && (view.model.target.represent.type instanceof type.UMLClassifier)) {
    var ops = _.union(view.model.target.represent.type.getInheritedOperations(true), view.model.target.represent.type.operations)
    app.elementListPickerDialog.showDialog(
      'Select Operation',
      ops
    ).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        app.engine.setProperty(view.model, 'signature', returnValue)
      }
    })
  } else {
    app.dialogs.showAlertDialog('Lifeline should have a type.')
  }
}

/**
 * @private
 * Create an operation
 */
function handleCreateOperation (options) {
  const view = options.view
  if ((view.model.target.represent instanceof type.UMLAttribute) && (view.model.target.represent.type instanceof type.UMLClassifier)) {
    const parent = view.model.target.represent.type // Type of target Lifeline
    app.dialogs.showInputDialog(
      'Enter an operation name to create'
    ).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok' && returnValue.length > 0) {
        const builder = app.repository.getOperationBuilder()
        builder.begin('assign new operation')
        var model = new type.UMLOperation()
        model._parent = parent
        model.name = returnValue
        builder.insert(model)
        builder.fieldInsert(parent, 'operations', model)
        builder.fieldAssign(view.model, 'signature', model)
        builder.end()
        var cmd = builder.getOperation()
        app.repository.doOperation(cmd)
      }
    })
  } else {
    app.dialogs.showAlertDialog('Lifeline should have a type.')
  }
}

/**
 * @private
 * Create a signal
 */
function handleCreateSignal (options) {
  const view = options.view
  const parent = view.model._parent._parent._parent // owner of Collaboration
  if (parent) {
    app.dialogs.showInputDialog(
      'Enter a signal name to create'
    ).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok' && returnValue.length > 0) {
        const builder = app.repository.getOperationBuilder()
        builder.begin('assign new signal')
        var model = new type.UMLSignal()
        model._parent = parent
        model.name = returnValue
        builder.insert(model)
        builder.fieldInsert(parent, 'ownedElements', model)
        builder.fieldAssign(view.model, 'signature', model)
        builder.end()
        var cmd = builder.getOperation()
        app.repository.doOperation(cmd)
      }
    })
  }
}

/**
 * @private
 * Add a reply message
 */
function handleAddReplyMessage (options) {
  let view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  if (diagram instanceof type.UMLSequenceDiagram) {
    if (view instanceof type.EdgeLabelView) {
      view = view._parent
    }
    if (view.head instanceof type.UMLLinePartView && view.tail instanceof type.UMLLinePartView) {
      const options2 = {
        id: 'UMLMessage',
        diagram: diagram,
        parent: diagramOwner,
        x1: view.head.left,
        x2: view.tail.left,
        y1: view.points.points[0].y + 20,
        y2: view.points.points[0].y + 20,
        tailView: view.head,
        headView: view.tail,
        tailModel: view.head.model || null,
        headModel: view.tail.model || null,
        modelInitializer: function (model) {
          model.messageSort = UMLMessage.MS_REPLY
        }
      }
      return app.factory.createModelAndView(options2)
    }
  } else if (diagram instanceof type.UMLCommunicationDiagram) {
    if (view instanceof type.NodeLabelView) {
      view = view._parent
    }
    const options2 = {
      id: 'UMLMessage',
      diagram: diagram,
      parent: diagramOwner,
      x1: view.hostEdge.points.points[0].x,
      y1: view.hostEdge.points.points[0].y,
      x2: view.hostEdge.points.points[0].x,
      y2: view.hostEdge.points.points[0].y,
      direction: (view.model.source === view.hostEdge.tail.model ? 'reverse' : 'forward'),
      connector: view.hostEdge.model,
      headView: view.hostEdge,
      modelInitializer: function (model) {
        model.messageSort = UMLMessage.MS_REPLY
      }
    }
    return app.factory.createModelAndView(options2)
  }
}

/**
 * @private
 * Create State/Condition for Lifeline
 */
function handleCreateStateCondition (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const _x = Math.round(view.left + view.width / 2)
  const _y = Math.round(view.top + view.height / 2)
  const options1 = {
    id: 'UMLTimingState',
    diagram: diagram,
    parent: diagram._parent,
    headView: view,
    tailView: view,
    headModel: view.model,
    tailModel: view.model,
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
 * Create Time Segment
 */
function handleCreateTimeSegment (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const _x = Math.round(view.left + view.width / 2)
  const _y = Math.round(view.top + view.height / 2)
  const options1 = {
    id: 'UMLTimeSegment',
    diagram: diagram,
    editor: app.diagrams.getEditor(),
    parent: diagram._parent,
    headView: view,
    tailView: view,
    headModel: view.model,
    tailModel: view.model,
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
 * Add an operand
 */
function handleAddOperand (options) {
  const view = options.view
  const options1 = {
    id: 'UMLInteractionOperand',
    parent: view.model,
    field: 'operands'
  }
  return app.factory.createModel(options1)
}

/**
 * @private
 * Add a connected lifeline
 */
function handleAddConnectedLifeline (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLConnectorView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'UMLLifeline',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLConnector',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a self connector
 */
function handleAddSelfConnector (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options2 = Object.assign({
    id: 'UMLConnector',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a forward message
 */
function handleAddForwardMessage (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLConnectorView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'UMLLifeline',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLConnector',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  const edgeView = app.factory.createModelAndView(options2)
  const options3 = {
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner,
    x1: edgeView.points.points[0].x,
    y1: edgeView.points.points[0].y,
    x2: edgeView.points.points[0].x,
    y2: edgeView.points.points[0].y,
    direction: 'forward',
    connector: edgeView.model,
    headView: edgeView
  }
  return app.factory.createModelAndView(options3)
}

/**
 * @private
 * Add a reverse message
 */
function handleAddReverseMessage (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getBothNodes(view, type.UMLConnectorView, function (e) {
    return (e.tail === view)
  })
  const options1 = Object.assign({
    id: 'UMLLifeline',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLConnector',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  const edgeView = app.factory.createModelAndView(options2)
  const options3 = {
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner,
    x1: edgeView.points.points[0].x,
    y1: edgeView.points.points[0].y,
    x2: edgeView.points.points[0].x,
    y2: edgeView.points.points[0].y,
    direction: 'reverse',
    connector: edgeView.model,
    headView: edgeView
  }
  return app.factory.createModelAndView(options3)
}

/**
 * @private
 * Add a forward message in a communication diagram
 */
function handleAddForwardMessageComm (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options2 = {
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner,
    x1: view.points.points[0].x,
    y1: view.points.points[0].y,
    x2: view.points.points[0].x,
    y2: view.points.points[0].y,
    direction: 'forward',
    connector: view.model,
    headView: view
  }
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a reverse message in a communication diagram
 */
function handleAddReverseMessageComm (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const options2 = {
    id: 'UMLMessage',
    diagram: diagram,
    parent: diagramOwner,
    x1: view.points.points[0].x,
    y1: view.points.points[0].y,
    x2: view.points.points[0].x,
    y2: view.points.points[0].y,
    direction: 'reverse',
    connector: view.model,
    headView: view
  }
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a region
 */
function handleAddRegion (options) {
  const view = options.view
  const options1 = {
    id: 'UMLRegion',
    parent: view.model,
    field: 'regions'
  }
  app.factory.createModel(options1)
}

/**
 * @private
 * Add a connection point reference
 */
function handleAddConnectionPointReference (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const _x = view.left + Math.round(Math.random() * view.width)
  const _y = view.top + Math.round(Math.random() * view.height)
  const options1 = {
    id: 'UMLConnectionPointReference',
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
 * Add a entry activity
 */
function handleAddEntryActivity (options) {
  app.dialogs.showSelectRadioDialog(
    'Select one to create as an entry Activity',
    [
      { text: 'OpaqueBehavior', value: '1', checked: true },
      { text: 'Activity', value: '2' },
      { text: 'StateMachine', value: '3' },
      { text: 'Interaction', value: '4' }
    ]
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      const options1 = {
        'parent-model': 'model',
        field: 'entryActivities',
        'parent-view': 'view',
        compartment: 'internalActivityCompartment',
        'name-prefix': 'EntryActivity'
      }
      switch (returnValue) {
      case '1':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLOpaqueBehavior' }, options1, options))
      case '2':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLActivity' }, options1, options))
      case '3':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLStateMachine' }, options1, options))
      case '4':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLInteraction' }, options1, options))
      }
    }
  })
}

/**
 * @private
 * Add a do activity
 */
function handleAddDoActivity (options) {
  app.dialogs.showSelectRadioDialog(
    'Select one to create as a do Activity',
    [
      { text: 'OpaqueBehavior', value: '1', checked: true },
      { text: 'Activity', value: '2' },
      { text: 'StateMachine', value: '3' },
      { text: 'Interaction', value: '4' }
    ]
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      const options1 = {
        'parent-model': 'model',
        field: 'doActivities',
        'parent-view': 'view',
        compartment: 'internalActivityCompartment',
        'name-prefix': 'DoActivity'
      }
      switch (returnValue) {
      case '1':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLOpaqueBehavior' }, options1, options))
      case '2':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLActivity' }, options1, options))
      case '3':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLStateMachine' }, options1, options))
      case '4':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLInteraction' }, options1, options))
      }
    }
  })
}

/**
 * @private
 * Add an exit activity
 */
function handleAddExitActivity (options) {
  app.dialogs.showSelectRadioDialog(
    'Select one to create as an exit Activity',
    [
      { text: 'OpaqueBehavior', value: '1', checked: true },
      { text: 'Activity', value: '2' },
      { text: 'StateMachine', value: '3' },
      { text: 'Interaction', value: '4' }
    ]
  ).then(function ({buttonId, returnValue}) {
    if (buttonId === 'ok') {
      const options1 = {
        'parent-model': 'model',
        field: 'exitActivities',
        'parent-view': 'view',
        compartment: 'internalActivityCompartment',
        'name-prefix': 'ExitActivity'
      }
      switch (returnValue) {
      case '1':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLOpaqueBehavior' }, options1, options))
      case '2':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLActivity' }, options1, options))
      case '3':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLStateMachine' }, options1, options))
      case '4':
        return handleAddCompartmentItem(Object.assign({ type: 'UMLInteraction' }, options1, options))
      }
    }
  })
}

/**
 * @private
 * Add an internal transition
 */
function handleAddInternalTransition (options) {
  const view = options.view
  if (view.model.regions.length > 0) {
    const options1 = Object.assign({
      'type': 'UMLTransition',
      'parent-model': 'model.regions[0]',
      field: 'transitions',
      'parent-view': 'view',
      compartment: 'internalTransitionCompartment',
      'name-prefix': 'InternalTransition',
      initializer: function (m) {
        m.source = view.model
        m.target = view.model
        m.kind = UMLTransition.TK_INTERNAL
      }
    }, options)
    return handleAddCompartmentItem(options1)
  } else {
    app.toast.info('Simple State cannot have Internal Transitions.')
  }
}

/**

 * Add an outgoing transition
 */
function handleAddOutgoingTransition (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLTransitionView)
  const options1 = Object.assign({
    id: 'UMLState',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an incoming transition
 */
function handleAddIncomingTransition (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLTransitionView)
  const options1 = Object.assign({
    id: 'UMLState',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an initial state
 */
function handleAddInitialState (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLTransitionView)
  const options1 = Object.assign({
    id: 'UMLPseudostate',
    diagram: diagram,
    parent: diagramOwner,
    pseudostateKind: UMLPseudostate.PSK_INITIAL
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a final state
 */
function handleAddFinalState (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLTransitionView)
  const options1 = Object.assign({
    id: 'UMLFinalState',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a choice
 */
function handleAddChoice (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLTransitionView)
  let options1 = Object.assign({
    id: 'UMLPseudostate',
    diagram: diagram,
    parent: diagramOwner,
    pseudostateKind: UMLPseudostate.PSK_CHOICE
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes, 40))
  const nodeView = app.factory.createModelAndView(options1)
  let options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  app.factory.createModelAndView(options2)
  // left state
  options1 = {
    id: 'UMLState',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.left - 70,
    y1: nodeView.getBottom() + 50,
    x2: nodeView.left - 70,
    y2: nodeView.getBottom() + 50
  }
  const nodeView1 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, nodeView1))
  app.factory.createModelAndView(options2)
  // right state
  options1 = {
    id: 'UMLState',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.getRight() + 35,
    y1: nodeView.getBottom() + 50,
    x2: nodeView.getRight() + 35,
    y2: nodeView.getBottom() + 50
  }
  const nodeView2 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, nodeView2))
  app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a join
 */
function handleAddJoin (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLTransitionView)
  let options1 = Object.assign({
    id: 'UMLPseudostate',
    diagram: diagram,
    parent: diagramOwner,
    pseudostateKind: UMLPseudostate.PSK_JOIN
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes, 40))
  const nodeView = app.factory.createModelAndView(options1)
  let options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  app.factory.createModelAndView(options2)
  // left state
  options1 = {
    id: 'UMLState',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.left - 40,
    y1: nodeView.top - 80,
    x2: nodeView.left - 40,
    y2: nodeView.top - 80
  }
  app.quickedits.setInside(options1)
  const nodeView1 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView1, nodeView))
  app.factory.createModelAndView(options2)
  // right state
  options1 = {
    id: 'UMLState',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.getRight() + 50,
    y1: nodeView.top - 80,
    x2: nodeView.getRight() + 50,
    y2: nodeView.top - 80
  }
  app.quickedits.setInside(options1)
  const nodeView2 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView2, nodeView))
  app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a fork
 */
function handleAddFork (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLTransitionView)
  let options1 = Object.assign({
    id: 'UMLPseudostate',
    diagram: diagram,
    parent: diagramOwner,
    pseudostateKind: UMLPseudostate.PSK_FORK
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes, 40))
  const nodeView = app.factory.createModelAndView(options1)
  let options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  app.factory.createModelAndView(options2)
  // left state
  options1 = {
    id: 'UMLState',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.left - 40,
    y1: nodeView.getBottom() + 40,
    x2: nodeView.left - 40,
    y2: nodeView.getBottom() + 40
  }
  const nodeView1 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, nodeView1))
  app.factory.createModelAndView(options2)
  // right state
  options1 = {
    id: 'UMLState',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.getRight() + 50,
    y1: nodeView.getBottom() + 40,
    x2: nodeView.getRight() + 50,
    y2: nodeView.getBottom() + 40
  }
  const nodeView2 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLTransition',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, nodeView2))
  app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a trigger event
 */
function handleAddTrigger (options) {
  const view = options.view
  const options1 = {
    id: 'UMLEvent',
    parent: view.model,
    field: 'triggers'
  }
  app.factory.createModel(options1)
}

/**
 * @private
 * Add an effect behavior
 */
function handleAddEffect (options) {
  const view = options.view
  app.dialogs.showSelectRadioDialog(
    'Select one to create as an effect Behavior',
    [
      { text: 'OpaqueBehavior', value: 'UMLOpaqueBehavior', checked: true },
      { text: 'Activity', value: 'UMLActivity' },
      { text: 'StateMachine', value: 'UMLStateMachine' },
      { text: 'Interaction', value: 'UMLInteraction' }
    ]
  ).then(function ({buttonId, returnValue}) {
    // console.log(buttonId, returnValue)
    if (buttonId === 'ok') {
      const options1 = {
        id: returnValue,
        parent: view.model,
        field: 'effects'
      }
      app.factory.createModel(options1)
    }
  })
}

/**
 * @private
 * Set transition expression
 */
function handleSetTransitionExpression (options) {
  try {
    const parser = peg.generate(grammarTransition)
    const ast = parser.parse(options.value)
    const builder = app.repository.getOperationBuilder()
    const elem = options.model
    builder.begin('change transition')
    // triggers
    if (!ast.triggers) { ast.triggers = [] }
    for (var i = 0, len = ast.triggers.length; i < len; i++) {
      if (elem.triggers[i]) {
        builder.fieldAssign(elem.triggers[i], 'name', ast.triggers[i].trim())
      } else {
        var newTrigger = new type.UMLEvent()
        newTrigger._parent = elem
        newTrigger.name = ast.triggers[i].trim()
        builder.insert(newTrigger)
        builder.fieldInsert(elem, 'triggers', newTrigger)
      }
    }
    if (elem.triggers.length > ast.triggers.length) {
      for (var j = ast.triggers.length; j < elem.triggers.length; j++) {
        builder.fieldRemove(elem, 'triggers', elem.triggers[j])
        builder.remove(elem.triggers[j])
      }
    }
    // guard
    if (ast.guard) {
      builder.fieldAssign(elem, 'guard', ast.guard.trim())
    }
    // effect
    var effectCount = (ast.effect && ast.effect.length > 0 ? 1 : 0)
    if (effectCount > 0) {
      if (elem.effects.length > 0) {
        builder.fieldAssign(elem.effects[0], 'name', ast.effect.trim())
      } else {
        var newEffect = new type.UMLOpaqueBehavior()
        newEffect._parent = elem
        newEffect.name = ast.effect.trim()
        builder.insert(newEffect)
        builder.fieldInsert(elem, 'effects', newEffect)
      }
    }
    if (elem.effects.length > effectCount) {
      for (var k = effectCount; k < elem.effects.length; k++) {
        builder.fieldRemove(elem, 'effects', elem.effects[k])
        builder.remove(elem.effects[k])
      }
    }
    builder.end()
    var cmd = builder.getOperation()
    app.repository.doOperation(cmd)
  } catch (err) {
    options.result = false
  }
}

/**
 * @private
 * Add an input pin
 */
function handleAddInputPin (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const _x = view.left + Math.round(Math.random() * view.width)
  const _y = view.top + Math.round(Math.random() * view.height)
  const options1 = {
    id: 'UMLInputPin',
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
 * Add an output pin
 */
function handleAddOutputPin (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const _x = view.left + Math.round(Math.random() * view.width)
  const _y = view.top + Math.round(Math.random() * view.height)
  const options1 = {
    id: 'UMLOutputPin',
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
 * Add an outgoing control flow
 */
function handleAddOutgoingControlFlow (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  if (view.model instanceof type.UMLObjectNode && view.model.isControlType !== true) {
    app.engine.setProperty(view.model, 'isControlType', true)
  }
  const nodes = app.quickedits.getHeadNodes(view, type.UMLControlFlowView)
  const options1 = Object.assign({
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an incoming control flow
 */
function handleAddIncomingControlFlow (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  if (view.model instanceof type.UMLObjectNode && view.model.isControlType !== true) {
    app.engine.setProperty(view.model, 'isControlType', true)
  }
  const nodes = app.quickedits.getTailNodes(view, type.UMLControlFlowView)
  const options1 = Object.assign({
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an outgoing object flow
 */
function handleAddOutgoingObjectFlow (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLObjectFlowView)
  const options1 = Object.assign({
    id: 'UMLObjectNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLObjectFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an incoming object flow
 */
function handleAddIncomingObjectFlow (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLObjectFlowView)
  const options1 = Object.assign({
    id: 'UMLObjectNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLObjectFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a decision
 */
function handleAddDecision (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLControlFlowView)
  let options1 = Object.assign({
    id: 'UMLDecisionNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes, 40))
  const nodeView = app.factory.createModelAndView(options1)
  let options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  app.factory.createModelAndView(options2)
  // left action
  options1 = {
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.left - 60,
    y1: nodeView.getBottom() + 40,
    x2: nodeView.left - 60,
    y2: nodeView.getBottom() + 40
  }
  const nodeView1 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, nodeView1))
  app.factory.createModelAndView(options2)
  // right action
  options1 = {
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.getRight(),
    y1: nodeView.getBottom() + 40,
    x2: nodeView.getRight(),
    y2: nodeView.getBottom() + 40
  }
  const nodeView2 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, nodeView2))
  app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a merge
 */
function handleAddMerge (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLControlFlowView)
  let options1 = Object.assign({
    id: 'UMLMergeNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes, 40))
  const nodeView = app.factory.createModelAndView(options1)
  let options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  app.factory.createModelAndView(options2)
  // left state
  options1 = {
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.left - 60,
    y1: nodeView.top - 80,
    x2: nodeView.left - 60,
    y2: nodeView.top - 80
  }
  app.quickedits.setInside(options1)
  const nodeView1 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView1, nodeView))
  app.factory.createModelAndView(options2)
  // right state
  options1 = {
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.getRight(),
    y1: nodeView.top - 80,
    x2: nodeView.getRight(),
    y2: nodeView.top - 80
  }
  app.quickedits.setInside(options1)
  const nodeView2 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView2, nodeView))
  app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an activity join
 */
function handleAddActivityJoin (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLControlFlowView)
  let options1 = Object.assign({
    id: 'UMLJoinNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes, 40))
  const nodeView = app.factory.createModelAndView(options1)
  let options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  app.factory.createModelAndView(options2)
  // left state
  options1 = {
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.left - 50,
    y1: nodeView.top - 80,
    x2: nodeView.left - 50,
    y2: nodeView.top - 80
  }
  app.quickedits.setInside(options1)
  const nodeView1 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView1, nodeView))
  app.factory.createModelAndView(options2)
  // right state
  options1 = {
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.getRight(),
    y1: nodeView.top - 80,
    x2: nodeView.getRight(),
    y2: nodeView.top - 80
  }
  app.quickedits.setInside(options1)
  const nodeView2 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView2, nodeView))
  app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an activity fork
 */
function handleAddActivityFork (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLControlFlowView)
  let options1 = Object.assign({
    id: 'UMLForkNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes, 40))
  const nodeView = app.factory.createModelAndView(options1)
  let options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  app.factory.createModelAndView(options2)
  // left action
  options1 = {
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.left - 50,
    y1: nodeView.getBottom() + 40,
    x2: nodeView.left - 50,
    y2: nodeView.getBottom() + 40
  }
  const nodeView1 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, nodeView1))
  app.factory.createModelAndView(options2)
  // right action
  options1 = {
    id: 'UMLAction',
    diagram: diagram,
    parent: diagramOwner,
    x1: nodeView.getRight(),
    y1: nodeView.getBottom() + 40,
    x2: nodeView.getRight(),
    y2: nodeView.getBottom() + 40
  }
  const nodeView2 = app.factory.createModelAndView(options1)
  options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, nodeView2))
  app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add an initial node
 */
function handleAddInitialNode (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLControlFlowView)
  const options1 = Object.assign({
    id: 'UMLInitialNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a final node
 */
function handleAddFinalNode (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLControlFlowView)
  const options1 = Object.assign({
    id: 'UMLActivityFinalNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLControlFlow',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a stereotype
 */
function handleAddStereotype (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLExtensionView)
  const options1 = Object.assign({
    id: 'UMLStereotype',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view, nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLExtension',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a sub-stereotype
 */
function handleAddSubStereotype (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(view, type.UMLGeneralizationView)
  const options1 = Object.assign({
    id: 'UMLStereotype',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getBottomPosition(view, nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLGeneralization',
    diagram: diagram,
    parent: nodeView.model
  }, app.quickedits.getEdgeViewOption(nodeView, view))
  return app.factory.createModelAndView(options2)
}

/**
 * @private
 * Add a super-stereotype
 */
function handleAddSuperStereotype (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getHeadNodes(view, type.UMLGeneralizationView)
  const options1 = Object.assign({
    id: 'UMLStereotype',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getTopPosition(view, nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'UMLGeneralization',
    diagram: diagram,
    parent: view.model
  }, app.quickedits.getEdgeViewOption(view, nodeView))
  return app.factory.createModelAndView(options2)
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
  let isExtensibleModel = selected instanceof type.ExtensibleModel
  let isModelElement = selected instanceof type.UMLModelElement
  let isPackage = selected instanceof type.UMLPackage || selected instanceof type.UMLSubsystem
  let isProfile = selected instanceof type.UMLProfile
  let isClassifier = selected instanceof type.UMLClassifier
  let isEnumeration = selected instanceof type.UMLEnumeration
  let isUseCase = selected instanceof type.UMLUseCase
  let isOperation = selected instanceof type.UMLOperation
  let isInstance = selected instanceof type.UMLInstance
  let isInteraction = selected instanceof type.UMLInteraction
  let isStateMachine = selected instanceof type.UMLStateMachine
  let isCombinedFragment = selected instanceof type.UMLCombinedFragment
  let isRegion = selected instanceof type.UMLRegion
  let isState = selected instanceof type.UMLState
  let isTransition = selected instanceof type.UMLTransition
  let isActivity = selected instanceof type.UMLActivity
  let isAction = selected instanceof type.UMLAction
  let isTemplateBinding = selected instanceof type.UMLTemplateBinding

  function hasNoInteractionDiagram () {
    return !selected.ownedElements.some(e => e instanceof type.UMLSequenceDiagram) &&
      !selected.ownedElements.some(e => e instanceof type.UMLCommunicationDiagram) &&
      !selected.ownedElements.some(e => e instanceof type.UMLTimingDiagram) &&
      !selected.ownedElements.some(e => e instanceof type.UMLInteractionOverviewDiagram)
  }

  let visibleStates = {
    'uml.usecase-diagram': (isNone || isProject || isPackage),
    'uml.class-diagram': (isNone || isProject || isPackage),
    'uml.package-diagram': (isNone || isProject || isPackage),
    'uml.object-diagram': (isNone || isProject || isPackage),
    'uml.component-diagram': (isNone || isProject || isPackage),
    'uml.deployment-diagram': (isNone || isProject || isPackage),
    'uml.profile-diagram': (isNone || isProject || isPackage),
    'uml.composite-structure-diagram': (isNone || isProject || isPackage),
    'uml.sequence-diagram': (isNone || isProject || isPackage || isClassifier || isOperation || (isInteraction && hasNoInteractionDiagram())),
    'uml.communication-diagram': (isNone || isProject || isPackage || isClassifier || isOperation || (isInteraction && hasNoInteractionDiagram())),
    'uml.timing-diagram': (isNone || isProject || isPackage || isClassifier || isOperation || (isInteraction && hasNoInteractionDiagram())),
    'uml.interaction-overview-diagram': (isNone || isProject || isPackage || isClassifier || isOperation || (isInteraction && hasNoInteractionDiagram())),
    'uml.information-flow-diagram': (isNone || isProject || isPackage || isClassifier),
    'uml.statechart-diagram': (isNone || isProject || isPackage || isClassifier || isOperation || isStateMachine),
    'uml.activity-diagram': (isNone || isProject || isPackage || isClassifier || isOperation || isActivity),

    'uml.model': (isProject || isPackage),
    'uml.subsystem': (isProject || isPackage),
    'uml.package': (isProject || isPackage),
    'uml.profile': (isProject || isPackage),

    'uml.class': (isProject || isPackage || isClassifier),
    'uml.interface': (isProject || isPackage || isClassifier),
    'uml.signal': (isProject || isPackage || isClassifier),
    'uml.datatype': (isProject || isPackage || isClassifier),
    'uml.primitive-type': (isProject || isPackage || isClassifier),
    'uml.enumeration': (isProject || isPackage || isClassifier),
    'uml.artifact': (isProject || isPackage || isClassifier),
    'uml.component': (isProject || isPackage || isClassifier),
    'uml.node': (isProject || isPackage || isClassifier),
    'uml.usecase': (isProject || isPackage || isClassifier),
    'uml.actor': (isProject || isPackage || isClassifier),
    'uml.stereotype': (isProfile),
    'uml.information-item': (isProject || isPackage || isClassifier),

    'uml.collaboration': (isClassifier || isPackage),
    'uml.interaction': (isClassifier),
    'uml.state-machine': (isClassifier || isPackage),
    'uml.activity': (isClassifier || isPackage),
    'uml.opaque-behavior': (isClassifier),

    'uml.template-parameter': (isClassifier || isOperation),
    'uml.template-parameter-substitution': (isTemplateBinding),
    'uml.parameter': (isOperation),
    'uml.enumeration-literal': (isEnumeration),
    'uml.attribute': (isClassifier),
    'uml.port': (isClassifier),
    'uml.operation': (isClassifier),
    'uml.reception': (isClassifier),
    'uml.extension-point': (isUseCase),
    'uml.slot': (isInstance),
    'uml.interaction-operand': (isCombinedFragment),

    'uml.state': (isRegion),
    'uml.region': (isState),
    'uml.entry-activity': (isState),
    'uml.do-activity': (isState),
    'uml.exit-activity': (isState),
    'uml.trigger': (isAction || isTransition),
    'uml.effect': (isTransition),
    'uml.action': (isActivity),
    'uml.constraint': (isModelElement),
    'uml.tag': (isExtensibleModel)
  }

  let enabledStates = {
    'format.stereotype.none': (views.length > 0),
    'format.stereotype.label': (views.length > 0),
    'format.stereotype.decoration': (views.length > 0),
    'format.stereotype.decoration-label': (views.length > 0),
    'format.stereotype.icon': (views.length > 0),
    'format.stereotype.icon-label': (views.length > 0),
    'format.word-wrap': (views.length > 0),
    'format.show-visibility': (views.length > 0),
    'format.show-namespace': (views.length > 0),
    'format.show-property': (views.length > 0),
    'format.show-type': (views.length > 0),
    'format.show-multiplicity': (views.length > 0),
    'format.show-operation-signature': (views.length > 0),
    'format.suppress-attributes': (views.length > 0),
    'format.suppress-operations': (views.length > 0),
    'format.suppress-receptions': (views.length > 0),
    'format.suppress-literals': (views.length > 0)
  }

  let stereotypeDisplay = Element.mergeProps(views, 'stereotypeDisplay')
  let checkedStates = {
    'format.stereotype.none': (stereotypeDisplay === UMLGeneralNodeView.SD_NONE),
    'format.stereotype.label': (stereotypeDisplay === UMLGeneralNodeView.SD_LABEL),
    'format.stereotype.decoration': (stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION),
    'format.stereotype.decoration-label': (stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL),
    'format.stereotype.icon': (stereotypeDisplay === UMLGeneralNodeView.SD_ICON),
    'format.stereotype.icon-label': (stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL),
    'format.word-wrap': (Element.mergeProps(views, 'wordWrap')),
    'format.show-visibility': (Element.mergeProps(views, 'showVisibility')),
    'format.show-namespace': (Element.mergeProps(views, 'showNamespace')),
    'format.show-property': (Element.mergeProps(views, 'showProperty')),
    'format.show-type': (Element.mergeProps(views, 'showType')),
    'format.show-multiplicity': (Element.mergeProps(views, 'showMultiplicity')),
    'format.show-operation-signature': (Element.mergeProps(views, 'showOperationSignature')),
    'format.suppress-attributes': (Element.mergeProps(views, 'suppressAttributes')),
    'format.suppress-operations': (Element.mergeProps(views, 'suppressOperations')),
    'format.suppress-receptions': (Element.mergeProps(views, 'suppressReceptions')),
    'format.suppress-literals': (Element.mergeProps(views, 'suppressLiterals'))
  }

  app.menu.updateStates(visibleStates, enabledStates, checkedStates)
}

// Register Commands

app.commands.register('uml:new-from-template', handleNewFromTemplate)
// Model: Profiles
app.commands.register('uml:apply-profile', handleApplyProfile)
app.commands.register('uml:apply-profile.uml-standard', handleApplyUMLStandardProfile, 'UML: Apply UML Standard Profile')

// Special Create-Model Commands
app.commands.register('uml:create-model.entry-activity', handleEntryActivity)
app.commands.register('uml:create-model.do-activity', handleDoActivity)
app.commands.register('uml:create-model.exit-activity', handleExitActivity)
app.commands.register('uml:create-model.effect', handleEffect)
app.commands.register('uml:create-model.constraint', handleConstraint)
app.commands.register('uml:create-model-and-view.frame', handleFrame)

// For Quickedits
app.commands.register('uml:set-name-expression', handleNameExpression)
app.commands.register('uml:set-attribute-expression', handleAttributeExpression)
app.commands.register('uml:set-operation-expression', handleOperationExpression)
app.commands.register('uml:set-template-parameter-expression', handleTemplateParameterExpression)
app.commands.register('uml:set-constraint-specification', handleConstraintSpecification)
app.commands.register('uml:add-note', handleAddNote)
app.commands.register('uml:add-constraint', handleAddConstraint)
app.commands.register('uml:add-compartment-item', handleAddCompartmentItem)
app.commands.register('uml:delete-compartment-item', handleDeleteCompartmentItem)
app.commands.register('uml:move-up-compartment-item', handleMoveUpCompartmentItem)
app.commands.register('uml:move-down-compartment-item', handleMoveDownCompartmentItem)
app.commands.register('uml:open-up-compartment-item', handleOpenUpCompartmentItem)
app.commands.register('uml:open-down-compartment-item', handleOpenDownCompartmentItem)
app.commands.register('uml:add-template-parameter-substitution', handleAddTemplateParameterSubstitution)
app.commands.register('uml:add-subclass', handleAddSubClass)
app.commands.register('uml:add-superclass', handleAddSuperClass)
app.commands.register('uml:add-subinterface', handleAddSubInterface)
app.commands.register('uml:add-superinterface', handleAddSuperInterface)
app.commands.register('uml:add-realizing-class', handleAddRealizingClass)
app.commands.register('uml:add-provided-interface', handleAddProvidedInterface)
app.commands.register('uml:add-required-interface', handleAddRequiredInterface)
app.commands.register('uml:add-associated-class', handleAddAssociatedClass)
app.commands.register('uml:add-aggregated-class', handleAddAggregatedClass)
app.commands.register('uml:add-composited-class', handleAddCompositedClass)
app.commands.register('uml:add-port', handleAddPort)
app.commands.register('uml:add-part', handleAddPart)
app.commands.register('uml:select-owner-attribute', handleSelectOwnerAttribute)
app.commands.register('uml:select-signal', handleSelectSignal)
app.commands.register('uml:add-subpackage', handleAddSubPackage)
app.commands.register('uml:add-dependant-package', handleAddDependantPackage)
app.commands.register('uml:add-depending-package', handleAddDependingPackage)
app.commands.register('uml:select-type', handleSelectType)
app.commands.register('uml:create-type', handleCreateType)
app.commands.register('uml:add-connected-part', handleAddConnectedPart)
app.commands.register('uml:add-linked-object', handleAddLinkedObject)
app.commands.register('uml:set-note-text', handleSetNoteText)
app.commands.register('uml:set-object-expression', handleSetObjectExpression)
app.commands.register('uml:set-slot-expression', handleSetSlotExpression)
app.commands.register('uml:add-communicating-node', handleAddCommunicatingNode)
app.commands.register('uml:add-deployed-artifact', handleAddDeployedArtifact)
app.commands.register('uml:add-deployed-component', handleAddDeployedComponent)
app.commands.register('uml:add-associated-actor', handleAddAssociatedActor)
app.commands.register('uml:add-included-usecase', handleAddIncludedUseCase)
app.commands.register('uml:add-extended-usecase', handleAddExtendedUseCase)
app.commands.register('uml:add-subactor', handleAddSubActor)
app.commands.register('uml:add-superactor', handleAddSuperActor)
app.commands.register('uml:add-associated-usecase', handleAddAssociatedUseCase)
app.commands.register('uml:set-lifeline-expression', handleSetLifelineExpression)
app.commands.register('uml:select-type-for-lifeline', handleSelectTypeForLifeline)
app.commands.register('uml:create-type-for-lifeline', handleCreateTypeForLifeline)
app.commands.register('uml:add-message-lifeline', handleAddMessageLifeline)
app.commands.register('uml:add-create-message-lifeline', handleAddCreateMessageLifeline)
app.commands.register('uml:add-self-message', handleAddSelfMessage)
app.commands.register('uml:add-found-message', handleAddFoundMessage)
app.commands.register('uml:add-lost-message', handleAddLostMessage)
app.commands.register('uml:add-message-from-gate', handleAddMessageFromGate)
app.commands.register('uml:add-message-to-gate', handleAddMessageToGate)
app.commands.register('uml:set-message-expression', handleSetMessageExpression)
app.commands.register('uml:select-operation', handleSelectOperation)
app.commands.register('uml:create-operation', handleCreateOperation)
app.commands.register('uml:create-signal', handleCreateSignal)
app.commands.register('uml:add-reply-message', handleAddReplyMessage)
app.commands.register('uml:create-state-condition-for-lifeline', handleCreateStateCondition)
app.commands.register('uml:create-time-segment', handleCreateTimeSegment)
app.commands.register('uml:add-operand', handleAddOperand)
app.commands.register('uml:add-connected-lifeline', handleAddConnectedLifeline)
app.commands.register('uml:add-self-connector', handleAddSelfConnector)
app.commands.register('uml:add-forward-message', handleAddForwardMessage)
app.commands.register('uml:add-reverse-message', handleAddReverseMessage)
app.commands.register('uml:add-forward-message-comm', handleAddForwardMessageComm)
app.commands.register('uml:add-reverse-message-comm', handleAddReverseMessageComm)
app.commands.register('uml:add-region', handleAddRegion)
app.commands.register('uml:add-connection-point-reference', handleAddConnectionPointReference)
app.commands.register('uml:add-entry-activity', handleAddEntryActivity)
app.commands.register('uml:add-do-activity', handleAddDoActivity)
app.commands.register('uml:add-exit-activity', handleAddExitActivity)
app.commands.register('uml:add-internal-transition', handleAddInternalTransition)
app.commands.register('uml:add-outgoing-transition', handleAddOutgoingTransition)
app.commands.register('uml:add-incoming-transition', handleAddIncomingTransition)
app.commands.register('uml:add-initial-state', handleAddInitialState)
app.commands.register('uml:add-final-state', handleAddFinalState)
app.commands.register('uml:add-choice', handleAddChoice)
app.commands.register('uml:add-join', handleAddJoin)
app.commands.register('uml:add-fork', handleAddFork)
app.commands.register('uml:add-trigger', handleAddTrigger)
app.commands.register('uml:add-effect', handleAddEffect)
app.commands.register('uml:set-transition-expression', handleSetTransitionExpression)
app.commands.register('uml:add-input-pin', handleAddInputPin)
app.commands.register('uml:add-output-pin', handleAddOutputPin)
app.commands.register('uml:add-outgoing-control-flow', handleAddOutgoingControlFlow)
app.commands.register('uml:add-incoming-control-flow', handleAddIncomingControlFlow)
app.commands.register('uml:add-outgoing-object-flow', handleAddOutgoingObjectFlow)
app.commands.register('uml:add-incoming-object-flow', handleAddIncomingObjectFlow)
app.commands.register('uml:add-decision', handleAddDecision)
app.commands.register('uml:add-merge', handleAddMerge)
app.commands.register('uml:add-activity-join', handleAddActivityJoin)
app.commands.register('uml:add-activity-fork', handleAddActivityFork)
app.commands.register('uml:add-initial-node', handleAddInitialNode)
app.commands.register('uml:add-final-node', handleAddFinalNode)
app.commands.register('uml:add-stereotype', handleAddStereotype)
app.commands.register('uml:add-substereotype', handleAddSubStereotype)
app.commands.register('uml:add-superstereotype', handleAddSuperStereotype)

// Format
app.commands.register('format:stereotype', handleStereotypeDisplay)
app.commands.register('format:stereotype-none', _.partial(handleStereotypeDisplay, UMLGeneralNodeView.SD_NONE), 'UML: Stereotype Display > None')
app.commands.register('format:stereotype-label', _.partial(handleStereotypeDisplay, UMLGeneralNodeView.SD_LABEL), 'UML: Stereotype Display > Label')
app.commands.register('format:stereotype-decoration', _.partial(handleStereotypeDisplay, UMLGeneralNodeView.SD_DECORATION), 'UML: Stereotype Display > Decoration')
app.commands.register('format:stereotype-decoration-label', _.partial(handleStereotypeDisplay, UMLGeneralNodeView.SD_DECORATION_LABEL), 'UML: Stereotype Display > Decoration with Label')
app.commands.register('format:stereotype-icon', _.partial(handleStereotypeDisplay, UMLGeneralNodeView.SD_ICON), 'UML: Stereotype Display > Icon')
app.commands.register('format:stereotype-icon-label', _.partial(handleStereotypeDisplay, UMLGeneralNodeView.SD_ICON_LABEL), 'UML: Stereotype Display > Icon with Label')
app.commands.register('format:word-wrap', _.partial(handleToggleProperty, 'wordWrap'), 'Word Wrap')
app.commands.register('format:show-visibility', _.partial(handleToggleProperty, 'showVisibility'), 'UML: Show Visibility')
app.commands.register('format:show-namespace', _.partial(handleToggleProperty, 'showNamespace'), 'UML: Show Namespace')
app.commands.register('format:show-property', _.partial(handleToggleProperty, 'showProperty'), 'UML: Show Property')
app.commands.register('format:show-type', _.partial(handleToggleProperty, 'showType'), 'UML: Show Type')
app.commands.register('format:show-multiplicity', _.partial(handleToggleProperty, 'showMultiplicity'), 'UML: Show Multiplicity')
app.commands.register('format:show-operation-signature', _.partial(handleToggleProperty, 'showOperationSignature'), 'UML: Show Operation Signature')
app.commands.register('format:suppress-attributes', _.partial(handleToggleProperty, 'suppressAttributes'), 'UML: Suppress Attributes')
app.commands.register('format:suppress-operations', _.partial(handleToggleProperty, 'suppressOperations'), 'UML: Suppress Operations')
app.commands.register('format:suppress-receptions', _.partial(handleToggleProperty, 'suppressReceptions'), 'UML: Suppress Receptions')
app.commands.register('format:suppress-literals', _.partial(handleToggleProperty, 'suppressLiterals'), 'UML: Suppress Literals')

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
