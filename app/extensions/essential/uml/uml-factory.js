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
const Mustache = require('mustache')
const {Element, EdgeView} = app.type

const ERR_INVALID_PARENT = '{{.}} cannot be placed here.'
const ERR_INVALID_LINK = 'Invalid connection ({{.}})'

// Precondition functions .................................................

function modelElementLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLModelElement) && (options.headModel instanceof type.UMLModelElement),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function featureLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLFeature) && (options.headModel instanceof type.UMLFeature),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function classifierLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLClassifier) && (options.headModel instanceof type.UMLClassifier),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function roleBindingPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLCollaborationUse) && (options.headModel instanceof type.UMLAttribute),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function componentRealizationPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLClassifier) && (options.headModel instanceof type.UMLComponent),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function deploymentPrecondition (options) {
  app.factory.assert(
    ((options.tailModel instanceof type.UMLClassifier) && (options.headModel instanceof type.UMLNode)) ||
    ((options.tailModel instanceof type.UMLInstance) && (options.headModel instanceof type.UMLNodeInstance)),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function nodeLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLNode) && (options.headModel instanceof type.UMLNode),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function instanceLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLInstance) && (options.headModel instanceof type.UMLInstance),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function useCaseLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLUseCase) && (options.headModel instanceof type.UMLUseCase),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function interactionPrecondition (options) {
  app.factory.assert(
    options.parent instanceof type.UMLInteraction,
    Mustache.render(ERR_INVALID_PARENT, options.modelType)
  )
}

function activityPrecondition (options) {
  app.factory.assert(
    options.parent instanceof type.UMLActivity,
    Mustache.render(ERR_INVALID_PARENT, options.modelType)
  )
}

function pinPrecondition (options) {
  app.factory.assert(
    options.parent instanceof type.UMLAction,
    Mustache.render(ERR_INVALID_PARENT, options.modelType)
  )
}

function flowPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLPin || options.tailModel instanceof type.UMLActivityNode) &&
    (options.headModel instanceof type.UMLPin || options.headModel instanceof type.UMLActivityNode),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function actionLinkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLAction) &&
    (options.headModel instanceof type.UMLAction),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

function extensionPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.UMLStereotype) && (options.headModel instanceof type.UMLMetaClass),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

// Create diagram functions  ...............................................

function structuralDiagramFn (parent, options) {
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
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', model)
  } else {
    diagram = new DiagramType()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
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

function profileDiagramFn (parent, options) {
  var profile, diagram
  if (parent instanceof type.UMLProfile) {
    diagram = new type.UMLProfileDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'ProfileDiagram')
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else {
    profile = new type.UMLProfile()
    profile.name = Element.getNewName(parent.ownedElements, 'Profile')
    profile._parent = parent
    diagram = new type.UMLProfileDiagram()
    diagram.name = Element.getNewName(profile.ownedElements, 'ProfileDiagram')
    profile.ownedElements.push(diagram)
    diagram._parent = profile
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', profile)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function compositeStructureDiagramFn (parent, options) {
  var collaboration, diagram
  if (parent instanceof type.UMLClassifier) {
    diagram = new type.UMLCompositeStructureDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'CompositeStructureDiagram')
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else {
    collaboration = new type.UMLCollaboration()
    collaboration.name = Element.getNewName(parent.collaborations, 'Collaboration')
    collaboration._parent = parent
    diagram = new type.UMLCompositeStructureDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'Composite Structures')
    collaboration.ownedElements.push(diagram)
    diagram._parent = collaboration
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', collaboration)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function _addFrame (diagram) {
  var frame = new type.UMLFrameView()
  diagram.ownedViews.push(frame)
  frame._parent = diagram
  frame.model = diagram
  frame.initialize(null, 8, 8, 700, 600)
}

function sequenceDiagramFn (parent, options) {
  var collaboration, interaction, diagram
  if (parent instanceof type.UMLInteraction) {
    diagram = new type.UMLSequenceDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'SequenceDiagram')
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else if (parent instanceof type.UMLClassifier) {
    interaction = new type.UMLInteraction()
    interaction.name = Element.getNewName(parent.ownedElements, 'Interaction')
    diagram = new type.UMLSequenceDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'SequenceDiagram')
    interaction.ownedElements.push(diagram)
    diagram._parent = interaction
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', interaction)
  } else {
    collaboration = new type.UMLCollaboration()
    collaboration.name = Element.getNewName(parent.ownedElements, 'Collaboration')
    collaboration._parent = parent
    interaction = new type.UMLInteraction()
    interaction.name = Element.getNewName(collaboration.ownedElements, 'Interaction')
    collaboration.ownedElements.push(interaction)
    interaction._parent = collaboration
    diagram = new type.UMLSequenceDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'SequenceDiagram')
    interaction.ownedElements.push(diagram)
    diagram._parent = interaction
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', collaboration)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function communicationDiagramFn (parent, options) {
  var collaboration, interaction, diagram
  if (parent instanceof type.UMLInteraction) {
    diagram = new type.UMLCommunicationDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'CommunicationDiagram')
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else if (parent instanceof type.UMLCollaboration) {
    interaction = new type.UMLInteraction()
    interaction.name = Element.getNewName(parent.ownedElements, 'Interaction')
    diagram = new type.UMLCommunicationDiagram()
    diagram.name = Element.getNewName(interaction.ownedElements, 'CommunicationDiagram')
    interaction.ownedElements.push(diagram)
    diagram._parent = interaction
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', interaction)
  } else {
    collaboration = new type.UMLCollaboration()
    collaboration.name = Element.getNewName(parent.ownedElements, 'Collaboration')
    collaboration._parent = parent
    interaction = new type.UMLInteraction()
    interaction.name = Element.getNewName(collaboration.ownedElements, 'Interaction')
    collaboration.ownedElements.push(interaction)
    interaction._parent = collaboration
    diagram = new type.UMLCommunicationDiagram()
    diagram.name = Element.getNewName(interaction.ownedElements, 'CommunicationDiagram')
    interaction.ownedElements.push(diagram)
    diagram._parent = interaction
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', collaboration)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function _addTimingFrame (diagram) {
  var frame = new type.UMLTimingFrameView()
  diagram.ownedViews.push(frame)
  frame._parent = diagram
  frame.model = diagram
  frame.initialize(null, 5, 5, 700, 600)
}

function timingDiagramFn (parent, options) {
  var collaboration, interaction, diagram
  if (parent instanceof type.UMLInteraction) {
    diagram = new type.UMLTimingDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'TimingDiagram')
    _addTimingFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else if (parent instanceof type.UMLCollaboration) {
    interaction = new type.UMLInteraction()
    interaction.name = Element.getNewName(parent.ownedElements, 'Interaction')
    diagram = new type.UMLTimingDiagram()
    diagram.name = Element.getNewName(interaction.ownedElements, 'TimingDiagram')
    interaction.ownedElements.push(diagram)
    diagram._parent = interaction
    _addTimingFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', interaction)
  } else {
    collaboration = new type.UMLCollaboration()
    collaboration.name = Element.getNewName(parent.ownedElements, 'Collaboration')
    collaboration._parent = parent
    interaction = new type.UMLInteraction()
    interaction.name = Element.getNewName(collaboration.ownedElements, 'Interaction')
    collaboration.ownedElements.push(interaction)
    interaction._parent = collaboration
    diagram = new type.UMLTimingDiagram()
    diagram.name = Element.getNewName(interaction.ownedElements, 'TimingDiagram')
    interaction.ownedElements.push(diagram)
    diagram._parent = interaction
    _addTimingFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', collaboration)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function interactionOverviewDiagramFn (parent, options) {
  var collaboration, interaction, activity, diagram
  if (parent instanceof type.UMLActivity) {
    diagram = new type.UMLInteractionOverviewDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'InteractionOverviewDiagram')
    _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else if (parent instanceof type.UMLInteraction) {
    activity = new type.UMLActivity()
    activity.name = Element.getNewName(parent.ownedElements, 'Activity')
    activity._parent = parent
    diagram = new type.UMLInteractionOverviewDiagram()
    diagram.name = Element.getNewName(activity.ownedElements, 'InteractionOverviewDiagram')
    diagram._parent = activity
    _addFrame(diagram)
    activity.ownedElements.push(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', activity)
  } else if (parent instanceof type.UMLClassifier) {
    interaction = new type.UMLInteraction()
    interaction.name = Element.getNewName(parent.ownedElements, 'Interaction')
    interaction._parent = parent
    activity = new type.UMLActivity()
    activity.name = Element.getNewName(interaction.ownedElements, 'Activity')
    activity._parent = interaction
    interaction.ownedElements.push(activity)
    diagram = new type.UMLInteractionOverviewDiagram()
    diagram.name = Element.getNewName(activity.ownedElements, 'InteractionOverviewDiagram')
    diagram._parent = activity
    _addFrame(diagram)
    activity.ownedElements.push(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', interaction)
  } else {
    collaboration = new type.UMLCollaboration()
    collaboration.name = Element.getNewName(parent.ownedElements, 'Collaboration')
    collaboration._parent = parent
    interaction = new type.UMLInteraction()
    interaction.name = Element.getNewName(collaboration.ownedElements, 'Interaction')
    interaction._parent = collaboration
    collaboration.ownedElements.push(interaction)
    activity = new type.UMLActivity()
    activity.name = Element.getNewName(interaction.ownedElements, 'Activity')
    activity._parent = interaction
    interaction.ownedElements.push(activity)
    diagram = new type.UMLInteractionOverviewDiagram()
    diagram.name = Element.getNewName(activity.ownedElements, 'InteractionOverviewDiagram')
    diagram._parent = activity
    _addFrame(diagram)
    activity.ownedElements.push(diagram)
    // _addFrame(diagram)
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', collaboration)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function statechartDiagramFn (parent, options) {
  var stateMachine, region, diagram
  if (parent instanceof type.UMLStateMachine) {
    diagram = new type.UMLStatechartDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'StatechartDiagram')
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else {
    // StateMachine
    stateMachine = new type.UMLStateMachine()
    stateMachine.name = Element.getNewName(parent.ownedElements, 'StateMachine')
    stateMachine._parent = parent
    region = new type.UMLRegion()
    stateMachine.regions.push(region)
    region._parent = stateMachine
    // Diagram
    diagram = new type.UMLStatechartDiagram()
    diagram.name = Element.getNewName(stateMachine.ownedElements, 'StatechartDiagram')
    stateMachine.ownedElements.push(diagram)
    diagram._parent = stateMachine
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', stateMachine)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function activityDiagramFn (parent, options) {
  var activity, diagram
  if (parent instanceof type.UMLActivity) {
    diagram = new type.UMLActivityDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, 'ActivityDiagram')
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else {
    activity = new type.UMLActivity()
    activity.name = Element.getNewName(parent.stateMachines, 'Activity')
    activity._parent = parent
    diagram = new type.UMLActivityDiagram()
    diagram.name = Element.getNewName(activity.ownedElements, 'ActivityDiagram')
    activity.ownedElements.push(diagram)
    diagram._parent = activity
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', activity)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

// Create model functions ..................................................

function stateMachineFn (parent, field, options) {
  var model, region
  app.factory.assert(
    parent instanceof type.Model,
    Mustache.render(ERR_INVALID_PARENT, 'StateMachine')
  )
  model = new type.UMLStateMachine()
  model.name = Element.getNewName(parent.ownedElements, 'StateMachine')
  model._parent = parent
  region = new type.UMLRegion()
  model.regions.push(region)
  region._parent = model
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  app.engine.addModel(parent, field, model)
  if (model) {
    model = app.repository.get(model._id)
  }
  options.factory.triggerElementCreated(model, null)
  return model
}

// Create model and view functions .........................................

function associationClassFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    ((options.tailModel instanceof type.UMLClass) && (options.headModel instanceof type.UMLAssociation)) ||
    ((options.headModel instanceof type.UMLClass) && (options.tailModel instanceof type.UMLAssociation)) ||
    ((options.tailModel instanceof type.UMLClassifier) && (options.headModel instanceof type.UMLClassifier)),
    Mustache.render(ERR_INVALID_LINK, 'AssociationClass')
  )
  if ((options.tailModel instanceof type.UMLClassifier) && (options.headModel instanceof type.UMLClassifier)) {
    // 두 개의 Classifier를 연결한 경우 : Class, Association, AssociationClassLink를 생성.
    // create models (Class, Association, AssociationClassLink)
    model = new type.UMLClass()
    model.name = Element.getNewName(parent.ownedElements, 'AssociationClass')
    model._parent = parent
    var association = new type.UMLAssociation()
    association.end1.reference = options.tailModel
    association.end2.reference = options.headModel
    model.ownedElements.push(association)
    association._parent = model
    var associationClassLink = new type.UMLAssociationClassLink()
    associationClassLink.classSide = model
    associationClassLink.associationSide = association
    model.ownedElements.push(associationClassLink)
    associationClassLink._parent = model
    if (options.modelInitializer) {
      options.modelInitializer(associationClassLink)
    }
    // create views (ClassView, AssociationView, AssociationClassLinkView)
    var midX = (options.x1 + options.x2) / 2
    var midY = (options.y1 + options.y2) / 2
    var CLASS_DISTANCE = 30
    var classView = new type.UMLClassView()
    classView.model = model
    classView._parent = diagram
    classView.initialize(null, midX, midY + CLASS_DISTANCE, midX, midY + CLASS_DISTANCE)
    var associationView = new type.UMLAssociationView()
    associationView.model = association
    associationView.tail = options.tailView
    associationView.head = options.headView
    associationView.initialize(null, options.x1, options.y1, options.x2, options.y2)
    associationView._parent = diagram
    var associationClassLinkView = new type.UMLAssociationClassLinkView()
    associationClassLinkView.model = associationClassLink
    associationClassLinkView.tail = classView
    associationClassLinkView.head = associationView
    associationClassLinkView.initialize(null, midX, midY, midX + CLASS_DISTANCE, midY + CLASS_DISTANCE)
    associationClassLinkView._parent = diagram
    if (options.viewInitializer) {
      options.viewInitializer(associationClassLinkView)
    }
    // make command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(model)
    builder.fieldInsert(parent, 'ownedElements', model)
    builder.insert(classView)
    builder.insert(associationView)
    builder.insert(associationClassLinkView)
    builder.fieldInsert(diagram, 'ownedViews', classView)
    builder.fieldInsert(diagram, 'ownedViews', associationView)
    builder.fieldInsert(diagram, 'ownedViews', associationClassLinkView)
    builder.end()
    app.repository.doOperation(builder.getOperation())
  } else {
    model = new type.UMLAssociationClassLink()
    view = new type.UMLAssociationClassLinkView()
    view.lineStyle = EdgeView.LS_OBLIQUE
    if ((options.tailModel instanceof type.UMLClass) && (options.headModel instanceof type.UMLAssociation)) {
      // Class에서 Association로 연결한 경우 : AssociationClassLink를 생성.
      model.classSide = options.tailModel
      model.associationSide = options.headModel
      view.tail = options.tailView
      view.head = options.headView
    } else if ((options.headModel instanceof type.UMLClass) && (options.tailModel instanceof type.UMLAssociation)) {
      // Association에서 Class로 연결한 경우 : AssociationClassLink를 생성.
      model.classSide = options.headModel
      model.associationSide = options.tailModel
      view.tail = options.headView
      view.head = options.tailView
    }
    view.initialize(null, options.x1, options.y1, options.x2, options.y2)
    app.engine.addModelAndView(diagram, model, view, model.classSide, 'ownedElements')
  }
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function interfaceRealizationFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    ((options.tailModel instanceof type.UMLClassifier) && (options.headModel instanceof type.UMLInterface)) ||
    ((options.tailModel instanceof type.UMLPort) && (options.headModel instanceof type.UMLInterface)),
    Mustache.render(ERR_INVALID_LINK, 'Interface Realization')
  )
  if (options.tailModel instanceof type.UMLPort) {
    app.factory.assert(options.tailModel.type instanceof type.UMLClassifier, 'Port should have type to create Interface Realization')
    if (options.tailModel.type instanceof type.UMLClassifier) {
      var rs = app.repository.getRelationshipsOf(options.tailModel.type, function (r) {
        return (r instanceof type.UMLInterfaceRealization &&
          r.source === options.tailModel.type &&
          r.target === options.headModel)
      })
      options.tailModel = options.tailModel.type
      // there already interface realization is.
      if (rs.length > 0) {
        view = new type.UMLInterfaceRealizationView()
        view.tail = options.tailView
        view.head = options.headView
        view.model = rs[0]
        view.initialize(null, options.x1, options.y1, options.x2, options.y2)
        app.engine.addViews(diagram, [view])
      }
    }
  }
  model = new type.UMLInterfaceRealization()
  model.source = options.tailModel
  model.target = options.headModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLInterfaceRealizationView()
  view.tail = options.tailView
  view.head = options.headView
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, options.tailModel, 'ownedElements')
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function containmentFn (parent, diagram, options) {
  var view
  app.factory.assert(
    (options.tailModel instanceof type.UMLModelElement) &&
    (options.headModel instanceof type.UMLModelElement) &&
    (!options.headModel.isOneOfTheContainers(options.tailModel)),
    Mustache.render(ERR_INVALID_LINK, 'Containment')
  )
  if (!_.includes(options.headModel.ownedElements, options.tailModel)) {
    app.engine.relocate(options.tailModel, options.headModel, 'ownedElements')
  }
  view = new type.UMLContainmentView()
  view.tail = options.tailView
  view.head = options.headView
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addViews(diagram, [view])
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(null, view)
  return view
}

function linkObjectFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    ((options.tailModel instanceof type.UMLObject) && (options.headModel instanceof type.UMLLink)) ||
    ((options.headModel instanceof type.UMLObject) && (options.tailModel instanceof type.UMLLink)) ||
    ((options.tailModel instanceof type.UMLInstance) && (options.headModel instanceof type.UMLInstance)),
    Mustache.render(ERR_INVALID_LINK, 'LinkObject')
  )
  if ((options.tailModel instanceof type.UMLInstance) && (options.headModel instanceof type.UMLInstance)) {
    // 두 개의 Instance를 연결한 경우 : Object, Link, LinkObjectLink를 생성.
    // create models (Object, Link, LinkObjectLink)
    model = new type.UMLObject()
    model.name = Element.getNewName(parent.ownedElements, 'LinkObject')
    model._parent = parent
    var link = new type.UMLLink()
    link.end1.reference = options.tailModel
    link.end2.reference = options.headModel
    model.ownedElements.push(link)
    link._parent = model
    var linkObjectLink = new type.UMLLinkObjectLink()
    linkObjectLink.objectSide = model
    linkObjectLink.linkSide = link
    model.ownedElements.push(linkObjectLink)
    linkObjectLink._parent = model
    if (options.modelInitializer) {
      options.modelInitializer(linkObjectLink)
    }
    // create views (ObjectView, LinkView, LinkObjectLinkView)
    var midX = (options.x1 + options.x2) / 2
    var midY = (options.y1 + options.y2) / 2
    var CLASS_DISTANCE = 30
    var objectView = new type.UMLObjectView()
    objectView.model = model
    objectView._parent = diagram
    objectView.initialize(null, midX, midY + CLASS_DISTANCE, midX, midY + CLASS_DISTANCE)
    var linkView = new type.UMLLinkView()
    linkView.model = link
    linkView.tail = options.tailView
    linkView.head = options.headView
    linkView.initialize(null, options.x1, options.y1, options.x2, options.y2)
    linkView._parent = diagram
    var linkObjectLinkView = new type.UMLLinkObjectLinkView()
    linkObjectLinkView.model = linkObjectLink
    linkObjectLinkView.tail = objectView
    linkObjectLinkView.head = linkView
    linkObjectLinkView.initialize(null, midX, midY, midX + CLASS_DISTANCE, midY + CLASS_DISTANCE)
    linkObjectLinkView._parent = diagram
    if (options.viewInitializer) {
      options.viewInitializer(linkObjectLinkView)
    }
    // make command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(model)
    builder.fieldInsert(parent, 'ownedElements', model)
    builder.insert(objectView)
    builder.insert(linkView)
    builder.insert(linkObjectLinkView)
    builder.fieldInsert(diagram, 'ownedViews', objectView)
    builder.fieldInsert(diagram, 'ownedViews', linkView)
    builder.fieldInsert(diagram, 'ownedViews', linkObjectLinkView)
    builder.end()
    app.repository.doOperation(builder.getOperation())
  } else {
    model = new type.UMLLinkObjectLink()
    view = new type.UMLLinkObjectLinkView()
    view.lineStyle = EdgeView.LS_OBLIQUE
    if ((options.tailModel instanceof type.UMLObject) && (options.headModel instanceof type.UMLLink)) {
      // Object에서 Link로 연결한 경우 : LinkObjectLink를 생성.
      model.objectSide = options.tailModel
      model.linkSide = options.headModel
      view.tail = options.tailView
      view.head = options.headView
    } else if ((options.headModel instanceof type.UMLObject) && (options.tailModel instanceof type.UMLLink)) {
      // Link에서 Object로 연결한 경우 : LinkObjectLink를 생성.
      model.objectSide = options.headModel
      model.linkSide = options.tailModel
      view.tail = options.headView
      view.head = options.tailView
    }
    view.initialize(null, options.x1, options.y1, options.x2, options.y2)
    app.engine.addModelAndView(diagram, model, view, model.objectSide, 'ownedElements')
  }
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function partFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    parent instanceof type.UMLClassifier || parent instanceof type.UMLAttribute,
    Mustache.render(ERR_INVALID_PARENT, 'UMLAttribute')
  )
  if (parent instanceof type.UMLAttribute) {
    app.factory.assert(
      parent.type instanceof type.UMLClassifier,
      'Type should be assigned to have internal Parts'
    )
    parent = parent.type
  }
  // Create Part (Attribute)
  model = new type.UMLAttribute()
  model.name = Element.getNewName(parent.attributes, 'Part')
  model.aggregation = type.UMLAttribute.AK_COMPOSITE
  model._parent = parent
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  const builder = app.repository.getOperationBuilder()
  builder.begin('Create Part')
  builder.insert(model)
  builder.fieldInsert(parent, 'attributes', model)
  // Create PartView
  view = new type.UMLPartView()
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

function portFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    parent instanceof type.UMLClassifier || parent instanceof type.UMLAttribute,
    Mustache.render(ERR_INVALID_PARENT, 'UMLPort')
  )
  if (parent instanceof type.UMLAttribute) {
    app.factory.assert(
      parent.type instanceof type.UMLClassifier,
      'Type should be assigned to have Ports'
    )
    parent = parent.type
  }
  // Create Port
  model = new type.UMLPort()
  model.name = Element.getNewName(parent.attributes, 'Port')
  model._parent = parent
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  const builder = app.repository.getOperationBuilder()
  builder.begin('Create Port')
  builder.insert(model)
  builder.fieldInsert(parent, 'attributes', model)
  // Create PartView
  view = new type.UMLPortView()
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

function lifelineFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    (parent instanceof type.UMLInteraction) && (parent._parent instanceof type.UMLClassifier),
    Mustache.render(ERR_INVALID_PARENT, 'UMLLifeline')
  )
  // Create Role (Attribute)
  var classifier = parent._parent
  var role = new type.UMLAttribute()
  role.name = Element.getNewName(classifier.attributes, 'Role')
  role._parent = classifier
  // Create Lifeline
  model = new type.UMLLifeline()
  model.name = Element.getNewName(parent.participants, 'Lifeline')
  model.represent = role
  model._parent = parent
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  // Create LifelineView
  if (diagram instanceof type.UMLSequenceDiagram) {
    view = new type.UMLSeqLifelineView()
    if (Math.abs(options.y2 - options.y1) < 200) {
      options.y2 = options.y1 + 200
    }
  } else if (diagram instanceof type.UMLCommunicationDiagram) {
    view = new type.UMLCommLifelineView()
    if (Math.abs(options.x2 - options.x1) < 100) {
      options.x2 = options.x1 + 100
    }
    if (Math.abs(options.y2 - options.y1) < 30) {
      options.y2 = options.y1 + 30
    }
  } else if (diagram instanceof type.UMLTimingDiagram) {
    app.factory.assert(options.tailView instanceof type.UMLTimingFrameView, 'UMLLifeline should be placed inside a frame in Timing Diagram')
    view = new type.UMLTimingLifelineView()
    if (Math.abs(options.x2 - options.x1) < 200) {
      options.x2 = options.x1 + 200
    }
    if (options.tailView instanceof type.UMLTimingFrameView) {
      view.containerView = options.tailView
    }
  }
  view._parent = diagram
  view.model = model
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  // Make Command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  builder.insert(role)
  builder.fieldInsert(classifier, 'attributes', role)
  builder.insert(model)
  builder.fieldInsert(parent, 'participants', model)
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  if (diagram instanceof type.UMLTimingDiagram && options.tailView instanceof type.UMLTimingFrameView) {
    builder.fieldInsert(options.tailView, 'containedViews', view)
  }
  builder.end()
  app.repository.doOperation(builder.getOperation())
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function messageFn (parent, diagram, options) {
  var model, view, connector, connectorView
  console.log(options)
  options.connector = options.connector || null
  if (diagram instanceof type.UMLSequenceDiagram) {
    // if linked to UMLSeqLifelineView
    if (options.tailView instanceof type.UMLSeqLifelineView) {
      options.tailView = options.tailView.linePart
    }
    if (options.headView instanceof type.UMLSeqLifelineView) {
      options.headView = options.headView.linePart
    }
    // If linked to UMLActivationView.
    if (options.tailView instanceof type.UMLActivationView) {
      options.tailModel = options.tailView._parent.head.model
      options.tailView = options.tailView._parent.head
    }
    if (options.headView instanceof type.UMLActivationView) {
      options.headModel = options.headView._parent.head.model
      options.headView = options.headView._parent.head
    }
    app.factory.assert(
      (options.tailView instanceof type.UMLLinePartView || options.tailView instanceof type.UMLMessageEndpointView) &&
      (options.headView instanceof type.UMLLinePartView || options.headView instanceof type.UMLMessageEndpointView),
      Mustache.render(ERR_INVALID_LINK, 'UMLMessage')
    )
    model = new type.UMLMessage()
    model.name = Element.getNewName(parent.messages, 'Message')
    model.connector = options.connector
    model.source = options.tailModel
    model.target = options.headModel
    app.factory.assignInitObject(model, options['model-init'])
    if (options.modelInitializer) {
      options.modelInitializer(model)
    }
    view = new type.UMLSeqMessageView()
    view.tail = options.tailView
    view.head = options.headView
    app.factory.assignInitObject(view, options['view-init'])
    view.initialize(null, options.x1, options.y1, options.x2, options.y2)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    app.engine.addModelAndView(diagram, model, view, parent, 'messages')
  } else if (diagram instanceof type.UMLCommunicationDiagram) {
    // Connect between two UMLCommLifelineViews
    if (options.tailView instanceof type.UMLCommLifelineView && options.headView instanceof type.UMLCommLifelineView) {
      options.direction = options.direction || 'forward'
      connector = new type.UMLConnector()
      connector._parent = options.tailModel.represent
      connector.end1.reference = options.tailModel.represent
      connector.end2.reference = options.headModel.represent
      connectorView = new type.UMLConnectorView()
      connectorView.tail = options.tailView
      connectorView.head = options.headView
      connectorView.model = connector
      connectorView._parent = diagram
      connectorView.initialize(null, options.x1, options.y1, options.x2, options.y2)
      // Make Command
      const builder = app.repository.getOperationBuilder()
      builder.begin('add element')
      // add connector
      builder.insert(connector)
      builder.fieldInsert(options.tailModel.represent, 'ownedElements', connector)
      builder.insert(connectorView)
      builder.fieldInsert(diagram, 'ownedViews', connectorView)
      // add message
      model = new type.UMLMessage()
      model.name = Element.getNewName(parent.messages, 'Message')
      model._parent = parent
      model.connector = connector
      if (options.direction === 'forward') {
        model.source = options.tailModel
        model.target = options.headModel
      } else { // reverse
        model.source = options.headModel
        model.target = options.tailModel
      }
      if (options.modelInitializer) {
        options.modelInitializer(model)
      }
      view = new type.UMLCommMessageView()
      view.hostEdge = connectorView
      view.model = model
      view._parent = diagram
      view.initialize(null, connectorView.points.points[0].x, connectorView.points.points[0].y, connectorView.points.points[0].x, connectorView.points.points[0].y)
      if (options.viewInitializer) {
        options.viewInitializer(view)
      }
      builder.insert(model)
      builder.fieldInsert(parent, 'messages', model)
      builder.insert(view)
      builder.fieldInsert(diagram, 'ownedViews', view)
      builder.end()
      app.repository.doOperation(builder.getOperation())
    } else { // Click on UMLConnectorView
      options.direction = options.direction || 'forward'
      app.factory.assert(
        (options.headView instanceof type.UMLConnectorView),
        Mustache.render(ERR_INVALID_LINK, 'Message')
      )
      model = new type.UMLMessage()
      model.name = Element.getNewName(parent.messages, 'Message')
      model.connector = options.headModel || options.connector
      if (options.direction === 'forward') {
        model.source = options.headView.tail.model
        model.target = options.headView.head.model
      } else { // reverse
        model.source = options.headView.head.model
        model.target = options.headView.tail.model
      }
      if (options.modelInitializer) {
        options.modelInitializer(model)
      }
      view = new type.UMLCommMessageView()
      view.hostEdge = options.headView
      view.initialize(null, options.x2, options.y2, options.x2, options.y2)
      if (options.viewInitializer) {
        options.viewInitializer(view)
      }
      app.engine.addModelAndView(diagram, model, view, parent, 'messages')
    }
  } else if (diagram instanceof type.UMLTimingDiagram) {
    app.factory.assert(
      (options.tailView instanceof type.UMLTimeSegmentView && options.headView instanceof type.UMLTimeSegmentView),
      'Message should connect two time segments'
    )
    model = new type.UMLMessage()
    model.name = Element.getNewName(parent.messages, 'Message')
    model.connector = options.connector
    model.source = options.tailModel.covered
    model.target = options.headModel.covered
    app.factory.assignInitObject(model, options['model-init'])
    if (options.modelInitializer) {
      options.modelInitializer(model)
    }
    view = new type.UMLTimingMessageView()
    view.tail = options.tailView
    view.head = options.headView
    app.factory.assignInitObject(view, options['view-init'])
    view.initialize(null, options.x1, options.y1, options.x2, options.y2)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    app.engine.addModelAndView(diagram, model, view, parent, 'messages')
  }
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function foundMessageFn (parent, diagram, options) {
  var model, view, endpoint, endpointView
  // if linked to UMLSeqLifelineView
  if (options.headView instanceof type.UMLSeqLifelineView) {
    options.headView = options.headView.linePart
  }
  // If linked to UMLActivationView.
  if (options.headView instanceof type.UMLActivationView) {
    options.headModel = options.headView._parent.head.model
    options.headView = options.headView._parent.head
  }
  app.factory.assert(
    parent instanceof type.UMLInteraction,
    Mustache.render(ERR_INVALID_PARENT, options.modelType)
  )
  app.factory.assert(
    (options.headView instanceof type.UMLLinePartView),
    Mustache.render(ERR_INVALID_LINK, 'UMLFoundMessage')
  )
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // endpoint
  endpoint = new type.UMLEndpoint()
  endpoint.name = Element.getNewName(parent.participants, endpoint.getDisplayClassName())
  endpoint._parent = parent
  builder.insert(endpoint)
  builder.fieldInsert(parent, 'participants', endpoint)
  endpointView = new type.UMLEndpointView()
  endpointView.initialize(null, options.x1, options.y1, options.x1, options.y1)
  endpointView.model = endpoint
  endpointView._parent = diagram
  builder.insert(endpointView)
  builder.fieldInsert(diagram, 'ownedViews', endpointView)
  // message
  model = new type.UMLMessage()
  model._parent = parent
  model.name = Element.getNewName(parent.messages, 'Message')
  model.source = endpoint
  model.target = options.headModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent, 'messages', model)
  view = new type.UMLSeqMessageView()
  view.model = model
  view._parent = diagram
  view.tail = endpointView
  view.head = options.headView
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  builder.end()
  app.repository.doOperation(builder.getOperation())
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function lostMessageFn (parent, diagram, options) {
  var model, view, endpoint, endpointView
  // if linked to UMLSeqLifelineView
  if (options.tailView instanceof type.UMLSeqLifelineView) {
    options.tailView = options.tailView.linePart
  }
  // If linked to UMLActivationView.
  if (options.tailView instanceof type.UMLActivationView) {
    options.tailModel = options.tailView._parent.head.model
    options.tailView = options.tailView._parent.head
  }
  app.factory.assert(
    parent instanceof type.UMLInteraction,
    Mustache.render(ERR_INVALID_PARENT, options.modelType)
  )
  app.factory.assert(
    (options.tailView instanceof type.UMLLinePartView),
    Mustache.render(ERR_INVALID_LINK, 'UMLFoundMessage')
  )
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // endpoint
  endpoint = new type.UMLEndpoint()
  endpoint.name = Element.getNewName(parent.participants, endpoint.getDisplayClassName())
  endpoint._parent = parent
  builder.insert(endpoint)
  builder.fieldInsert(parent, 'participants', endpoint)
  endpointView = new type.UMLEndpointView()
  endpointView.initialize(null, options.x2, options.y2, options.x2, options.y2)
  endpointView.model = endpoint
  endpointView._parent = diagram
  builder.insert(endpointView)
  builder.fieldInsert(diagram, 'ownedViews', endpointView)
  // message
  model = new type.UMLMessage()
  model._parent = parent
  model.name = Element.getNewName(parent.messages, 'Message')
  model.source = options.tailModel
  model.target = endpoint
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent, 'messages', model)
  view = new type.UMLSeqMessageView()
  view.model = model
  view._parent = diagram
  view.tail = options.tailView
  view.head = endpointView
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  builder.end()
  app.repository.doOperation(builder.getOperation())
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function stateInvariantFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    options.headModel instanceof type.UMLLifeline,
    Mustache.render(ERR_INVALID_PARENT, 'State Invariant')
  )
  // make command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // model
  model = new type.UMLStateInvariant()
  model.name = Element.getNewName(parent.fragments, 'StateInvariant')
  model.covered = options.headModel
  model._parent = parent
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent, 'fragments', model)
  // view
  if (diagram instanceof type.UMLTimingDiagram) {
    view = new type.UMLTimeSegmentView()
    console.log(options)
    var vv = diagram.getBottomViewAt(options.editor.canvas, options.x1, options.x2)
    console.log(vv)
  } else {
    view = new type.UMLStateInvariantView()
    view.initialize(null, options.x2, options.y2, options.x2, options.y2)
  }
  view.model = model
  view._parent = options.headView
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(options.headView, 'subViews', view)
  builder.end()
  var cmd = builder.getOperation()
  app.repository.doOperation(cmd)
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function timingStateFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    options.tailView instanceof type.UMLTimingLifelineView || options.tailView instanceof type.UMLTimingStateView,
    'State/Condition should be placed inside a Lifeline'
  )
  if (options.tailView instanceof type.UMLTimingStateView) {
    const v = options.tailView
    options.tailView = v.containerView
    options.tailModel = v.containerView.model
  }
  // make command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // model
  model = new type.UMLConstraint()
  model.name = Element.getNewName(options.tailModel.ownedElements, 'State-Condition')
  model._parent = options.tailModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(options.tailModel, 'ownedElements', model)
  // view
  view = new type.UMLTimingStateView()
  view.initialize(null, options.x2, options.y2, options.x2, options.y2)
  view.model = model
  view._parent = diagram
  view.containerView = options.tailView
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  builder.fieldInsert(options.tailView, 'containedViews', view)
  builder.end()
  var cmd = builder.getOperation()
  app.repository.doOperation(cmd)
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function timeSegmentFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    options.tailView instanceof type.UMLTimingStateView,
    'Time Segment should be placed inside on a State/Condition'
  )
  // make command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // model
  model = new type.UMLStateInvariant()
  model.name = Element.getNewName(parent.fragments, 'Time Segment')
  model.covered = options.tailModel._parent
  model.invariant = options.tailModel
  model._parent = parent
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent, 'fragments', model)
  // view
  view = new type.UMLTimeSegmentView()
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  view.model = model
  view._parent = diagram
  view.width = Math.max(view.width, options.editor.canvas.gridFactor.width * 3) // min width when created
  view.containerView = options.tailView
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  builder.fieldInsert(options.tailView, 'containedViews', view)
  builder.end()
  var cmd = builder.getOperation()
  app.repository.doOperation(cmd)
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function timeTickFn (parent, diagram, options) {
  app.factory.assert(
    options.tailView instanceof type.UMLTimingFrameView,
    'Time Tick should be placed on a Frame'
  )
  // make command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  var view = new type.UMLTimeTickView()
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  view._parent = diagram
  view.width = Math.max(view.width, options.editor.canvas.gridFactor.width * 3) - 1 // min width when created
  view.containerView = options.tailView
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  builder.fieldInsert(options.tailView, 'containedViews', view)
  builder.end()
  var cmd = builder.getOperation()
  app.repository.doOperation(cmd)
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(null, view)
  return view
}

function combinedFragmentFn (parent, diagram, options) {
  var model, view, operand
  app.factory.assert(
    (parent instanceof type.UMLInteraction),
    Mustache.render(ERR_INVALID_PARENT, 'CombinedFragment')
  )
  model = new type.UMLCombinedFragment()
  model.name = Element.getNewName(parent.fragments, 'CombinedFragment')
  operand = new type.UMLInteractionOperand()
  operand.name = Element.getNewName(model.operands, 'Operand')
  model.operands.push(operand)
  operand._parent = model
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLCombinedFragmentView()
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, parent, 'fragments')
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function timeConstraintFn (parent, diagram, options) {
  var model, view, link
  app.factory.assert(
    options.tailView instanceof type.UMLSeqMessageView ||
    options.tailView instanceof type.UMLTimingMessageView ||
    options.tailView instanceof type.UMLTimeSegmentView,
    'Time Constraint should be attached to Messages or Time Segments'
  )
  // make command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // model
  model = new type.UMLTimeConstraint()
  model.name = Element.getNewName(options.tailModel.ownedElements, 'Time Constraint')
  model._parent = options.tailModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(options.tailModel, 'ownedElements', model)
  // view
  view = new type.UMLTimeConstraintView()
  view.initialize(null, options.x1, options.y1 + 20, options.x2, options.y2 + 20)
  view.model = model
  view._parent = diagram
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  link = new type.UMLTimeConstraintLinkView()
  link.tail = options.tailView
  link.head = view
  link.model = model
  link._parent = diagram
  link.initialize(options.editor.canvas)
  builder.insert(view)
  builder.insert(link)
  builder.fieldInsert(diagram, 'ownedViews', view)
  builder.fieldInsert(diagram, 'ownedViews', link)
  builder.end()
  var cmd = builder.getOperation()
  app.repository.doOperation(cmd)
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function durationConstraintFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    options.parent instanceof type.UMLInteraction,
    Mustache.render(ERR_INVALID_PARENT, options.modelType)
  )
  let frame = null
  if (diagram instanceof type.UMLTimingDiagram) {
    var bv = diagram.getBottomViewAt(options.editor.canvas, options.x2, options.y2)
    if (bv instanceof type.UMLTimingFrameView) {
      frame = bv
    }
  }
  // make command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // model
  model = new type.UMLDurationConstraint()
  model.name = Element.getNewName(parent.fragments, 'Duration Constraint')
  model._parent = parent
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent, 'ownedElements', model)
  // view
  view = new type.UMLDurationConstraintView()
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  view.model = model
  view._parent = diagram
  view.width = Math.max(view.width, options.editor.canvas.gridFactor.width * 3) // min width when created
  if (frame) view.containerView = frame
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  if (frame) builder.fieldInsert(frame, 'containedViews', view)
  builder.end()
  var cmd = builder.getOperation()
  app.repository.doOperation(cmd)
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function interactionUseInOverviewFn (parent, diagram, options) {
  var interactionOwner, interaction, interactionUse, model, view
  app.factory.assert(
    diagram instanceof type.UMLInteractionOverviewDiagram,
    'InteractionUse should be placed in Interaction Overview Diagram'
  )
  // make command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // model
  interactionOwner = parent._parent._parent
  interaction = new type.UMLInteraction()
  interaction.name = Element.getNewName(interactionOwner.ownedElements, 'Interaction')
  interaction._parent = interactionOwner
  builder.insert(interaction)
  builder.fieldInsert(interactionOwner, 'ownedElements', interaction)
  interactionUse = new type.UMLInteractionUse()
  interactionUse.name = Element.getNewName(interaction.fragments, 'InteractionUse')
  interactionUse.refersTo = interaction
  interactionUse._parent = parent._parent
  builder.insert(interactionUse)
  builder.fieldInsert(parent._parent, 'fragments', interactionUse)
  model = new type.UMLAction()
  model.name = Element.getNewName(parent.nodes, 'Action')
  model._parent = parent // activity graph
  model.kind = type.UMLAction.ACK_CALLBEHAVIOR
  model.target = interactionUse
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent, 'nodes', model)
  // view
  view = new type.UMLInteractionUseView()
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  view.model = model
  view._parent = diagram
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  builder.end()
  var cmd = builder.getOperation()
  app.repository.doOperation(cmd)
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function interactionInOverviewFn (parent, diagram, options) {
  var interactionOwner, interaction, dgm, model, view
  app.factory.assert(
    diagram instanceof type.UMLInteractionOverviewDiagram,
    'Interaction (inline) should be placed in Interaction Overview Diagram'
  )
  // make command
  const builder = app.repository.getOperationBuilder()
  builder.begin('add element')
  // model
  interactionOwner = parent._parent._parent
  interaction = new type.UMLInteraction()
  interaction.name = Element.getNewName(interactionOwner.ownedElements, 'Interaction')
  interaction._parent = interactionOwner
  dgm = new type.UMLSequenceDiagram()
  dgm.name = Element.getNewName(interaction.ownedElements, 'SequenceDiagram')
  dgm._parent = interaction
  interaction.ownedElements.push(dgm)
  builder.insert(interaction)
  builder.fieldInsert(interactionOwner, 'ownedElements', interaction)
  model = new type.UMLAction()
  model.name = Element.getNewName(parent.fragments, 'Actions')
  model._parent = parent // activity graph
  model.kind = type.UMLAction.ACK_CALLBEHAVIOR
  model.target = dgm
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent, 'nodes', model)
  // view
  view = new type.UMLInteractionInlineView()
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  view.model = model
  view._parent = diagram
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)
  builder.end()
  var cmd = builder.getOperation()
  app.repository.doOperation(cmd)
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
  var model, view
  if (diagram instanceof type.UMLCommunicationDiagram) {
    app.factory.assert(
      parent._parent instanceof type.UMLCollaboration,
      Mustache.render(ERR_INVALID_PARENT, 'Connector')
    )
    app.factory.assert(
      (options.tailModel instanceof type.UMLLifeline) && (options.headModel instanceof type.UMLLifeline),
      Mustache.render(ERR_INVALID_LINK, 'Connector')
    )
    app.factory.assert(
      (options.tailModel.represent instanceof type.UMLFeature) && (options.headModel.represent instanceof type.UMLFeature),
      Mustache.render(ERR_INVALID_LINK, 'Connector')
    )
    model = new type.UMLConnector()
    model.end1.reference = options.tailModel.represent
    model.end2.reference = options.headModel.represent
    if (options.modelInitializer) {
      options.modelInitializer(model)
    }
    view = new type.UMLConnectorView()
    view.tail = options.tailView
    view.head = options.headView
    view.initialize(null, options.x1, options.y1, options.x2, options.y2)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    app.engine.addModelAndView(diagram, model, view, options.tailModel.represent, 'ownedElements')
    if (model) {
      model = app.repository.get(model._id)
    }
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(model, view)
    return view
  } else {
    options.precondition = featureLinkPrecondition
    return app.factory.defaultUndirectedRelationshipFn(parent, diagram, options)
  }
}

function stateFn (parent, diagram, options) {
  var model, view, region
  options.regionCount = options.regionCount || 0
  options.submachine = options.submachine || null
  app.factory.assert(
    parent instanceof type.UMLStateMachine,
    Mustache.render(ERR_INVALID_PARENT, 'State')
  )
  model = new type.UMLState()
  model.name = Element.getNewName(parent.regions[0].vertices, 'State')
  model.submachine = options.submachine
  for (var i = 0; i < options.regionCount; i++) {
    region = new type.UMLRegion()
    region._parent = model
    model.regions.push(region)
  }
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLStateView()
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, parent.regions[0], 'vertices')
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function submachineStateFn (parent, diagram, options) {
  var model, view
  var stateMachine = null
  var region = null
  app.factory.assert(
    parent instanceof type.UMLStateMachine,
    Mustache.render(ERR_INVALID_PARENT, 'State')
  )
  // Create a StateMachine
  stateMachine = new type.UMLStateMachine()
  stateMachine.name = Element.getNewName(parent._parent.ownedElements, stateMachine.getDisplayClassName())
  stateMachine._parent = parent._parent
  region = new type.UMLRegion()
  stateMachine.regions.push(region)
  region._parent = stateMachine
  const builder = app.repository.getOperationBuilder()
  builder.begin('Create SubmachineState')
  builder.insert(stateMachine)
  builder.fieldInsert(parent._parent, 'ownedElements', stateMachine)

  // Create model element
  model = new type.UMLState()
  model.name = Element.getNewName(parent.regions[0].vertices, model.getDisplayClassName())
  model.submachine = stateMachine
  model._parent = parent.regions[0]
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent.regions[0], 'vertices', model)

  // Create view element
  view = new type.UMLStateView()
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

  // Trigger event
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view || model
}

function pseudostateFn (parent, diagram, options) {
  var model, view
  options.pseudostateKind = options.pseudostateKind || type.UMLPseudostate.PSK_INITIAL
  app.factory.assert(
    parent instanceof type.UMLStateMachine,
    Mustache.render(ERR_INVALID_PARENT, 'Pseudostate')
  )
  model = new type.UMLPseudostate()
  model.kind = options.pseudostateKind
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLPseudostateView()
  view.initialize(null, options.x2, options.y2, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, parent.regions[0], 'vertices')
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function finalStateFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    parent instanceof type.UMLStateMachine,
    Mustache.render(ERR_INVALID_PARENT, 'FinalState')
  )
  model = new type.UMLFinalState()
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLFinalStateView()
  view.initialize(null, options.x2, options.y2, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, parent.regions[0], 'vertices')
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function connectionPointReferenceFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    parent instanceof type.UMLState,
    Mustache.render(ERR_INVALID_PARENT, 'ConnectionPointReference')
  )
  model = new type.UMLConnectionPointReference()
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLConnectionPointReferenceView()
  view.initialize(null, options.x2, options.y2, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, parent, 'connections', options.containerView)
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function transitionFn (parent, diagram, options) {
  var model, view
  app.factory.assert(
    (options.tailModel instanceof type.UMLVertex) && (options.headModel instanceof type.UMLVertex),
    Mustache.render(ERR_INVALID_LINK, 'Transition')
  )
  model = new type.UMLTransition()
  model.source = options.tailModel
  model.target = options.headModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLTransitionView()
  view.tail = options.tailView
  view.head = options.headView
  view.initialize(null, options.x1, options.y1, options.x1, options.y1)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, parent.regions[0], 'transitions')
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function controlFlowFn (parent, diagram, options) {
  var model, view
  options.parent = parent
  options.diagram = diagram
  flowPrecondition(options)
  model = new type.UMLControlFlow()
  model.source = options.tailModel
  model.target = options.headModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLControlFlowView()
  view.tail = options.tailView
  view.head = options.headView
  view.initialize(null, options.x1, options.y1, options.x1, options.y1)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, parent, 'edges')
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

function objectFlowFn (parent, diagram, options) {
  var model, pin1, pin2, view, pinView1, pinView2
  options.parent = parent
  options.diagram = diagram
  flowPrecondition(options)

  // Create model element
  model = new type.UMLObjectFlow()
  model._parent = parent
  model.source = options.tailModel
  model.target = options.headModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  const builder = app.repository.getOperationBuilder()
  builder.begin('Create ' + model.getDisplayClassName())
  builder.insert(model)
  builder.fieldInsert(parent, 'edges', model)

  // Create view element
  view = new type.UMLObjectFlowView()
  view.model = model
  view._parent = diagram
  view.tail = options.tailView
  view.head = options.headView
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)

  // Create Input/OutputPins when connect between two Actions
  if (options.tailModel instanceof type.UMLAction && options.headModel instanceof type.UMLAction) {
    // OutputPin
    pin1 = new type.UMLOutputPin()
    pin1._parent = options.tailModel
    builder.insert(pin1)
    builder.fieldInsert(options.tailModel, 'outputs', pin1)
    builder.fieldAssign(model, 'source', pin1)
    pinView1 = new type.UMLOutputPinView()
    pinView1.model = pin1
    pinView1._parent = diagram
    pinView1.containerView = options.tailView
    pinView1.initialize(null, options.x1, options.y1, options.x1, options.y1)
    builder.insert(pinView1)
    builder.fieldInsert(diagram, 'ownedViews', pinView1)
    builder.fieldInsert(options.tailView, 'containedViews', pinView1)
    builder.fieldAssign(view, 'tail', pinView1)
    // InputPin
    pin2 = new type.UMLInputPin()
    pin2._parent = options.headModel
    builder.insert(pin2)
    builder.fieldInsert(options.headModel, 'inputs', pin2)
    builder.fieldAssign(model, 'target', pin2)
    pinView2 = new type.UMLInputPinView()
    pinView2.model = pin2
    pinView2._parent = diagram
    pinView2.containerView = options.headView
    pinView2.initialize(null, options.x2, options.y2, options.x2, options.y2)
    builder.insert(pinView2)
    builder.fieldInsert(diagram, 'ownedViews', pinView2)
    builder.fieldInsert(options.headView, 'containedViews', pinView2)
    builder.fieldAssign(view, 'head', pinView2)
  }

  // Apply operation
  builder.end()
  var op = builder.getOperation()
  app.repository.doOperation(op)

  // Trigger event
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view || model
}

function exceptionHandlerFn (parent, diagram, options) {
  var model, view, pin, pinView
  options.parent = parent
  options.diagram = diagram
  actionLinkPrecondition(options)

  // Create InputPin for exceptionInput
  const builder = app.repository.getOperationBuilder()
  builder.begin('Create ExceptionHandler')
  pin = new type.UMLInputPin()
  pin._parent = options.headModel
  builder.insert(pin)
  builder.fieldInsert(options.headModel, 'inputs', pin)
  pinView = new type.UMLInputPinView()
  pinView.model = pin
  pinView._parent = diagram
  pinView.containerView = options.headView
  pinView.initialize(null, options.x2, options.y2, options.x2, options.y2)
  builder.insert(pinView)
  builder.fieldInsert(diagram, 'ownedViews', pinView)
  builder.fieldInsert(options.headView, 'containedViews', pinView)

  // Create model element
  model = new type.UMLExceptionHandler()
  model._parent = parent
  model.source = options.tailModel
  model.target = pin
  model.handlerBody = options.headModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  builder.insert(model)
  builder.fieldInsert(parent, 'edges', model)

  // Create view element
  view = new type.UMLExceptionHandlerView()
  view.model = model
  view._parent = diagram
  view.tail = options.tailView
  view.head = pinView
  view.initialize(null, options.x1, options.y1, options.x2, options.y2)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  builder.insert(view)
  builder.fieldInsert(diagram, 'ownedViews', view)

  // Apply operation
  builder.end()
  var op = builder.getOperation()
  app.repository.doOperation(op)

  // Trigger event
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view || model
}

function activityInterruptFn (parent, diagram, options) {
  var model, view
  options.parent = parent
  options.diagram = diagram
  flowPrecondition(options)
  model = new type.UMLActivityInterrupt()
  model.source = options.tailModel
  model.target = options.headModel
  if (options.modelInitializer) {
    options.modelInitializer(model)
  }
  view = new type.UMLActivityInterruptView()
  view.tail = options.tailView
  view.head = options.headView
  view.initialize(null, options.x1, options.y1, options.x1, options.y1)
  if (options.viewInitializer) {
    options.viewInitializer(view)
  }
  app.engine.addModelAndView(diagram, model, view, parent, 'edges')
  if (model) {
    model = app.repository.get(model._id)
  }
  if (view) {
    view = app.repository.get(view._id)
  }
  options.factory.triggerElementCreated(model, view)
  return view
}

// Create view of functions ................................................

function viewForGeneralDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor
  var containerView = options.containerView || null

  // Port
  if (model instanceof type.UMLPort) {
    if ((containerView instanceof type.UMLClassifierView || containerView instanceof type.UMLSubsystemView) &&
      containerView.model === model._parent) {
      return app.factory.createViewAndRelationships(editor, x, y, model, containerView)
    } else {
      app.dialogs.showAlertDialog("Port should be dropped on it's parent Classifier")
    }

  // Part
  } else if (model instanceof type.UMLAttribute) {
    if (containerView instanceof type.UMLClassifierView && containerView.model === model._parent) {
      return app.factory.createViewAndRelationships(editor, x, y, model, containerView)
    } else {
      app.dialogs.showAlertDialog("Part (Attribute) should be dropped on it's parent Classifier")
    }

  // Connector
  } else if (model instanceof type.UMLConnector) {
    var connectorView = diagram.getViewOf(model)
    var port1View = diagram.getViewOf(model.end1.reference, type.UMLPortView) || diagram.getViewOf(model.end1.reference, type.UMLPartView)
    var port2View = diagram.getViewOf(model.end2.reference, type.UMLPortView) || diagram.getViewOf(model.end2.reference, type.UMLPartView)
    if (connectorView) {
      editor.selectView(connectorView)
      editor.selectAdditionalView(port1View)
      editor.selectAdditionalView(port2View)
      app.dialogs.showAlertDialog('Connector View is already existed in this Diagram.')
    } else {
      if (!port2View) {
        var port2ContainerView = diagram.getViewOf(model.end2.reference._parent)
        if (!port2ContainerView) {
          app.factory.createViewAndRelationships(editor, x, y, model.end2.reference._parent)
          port2ContainerView = diagram.getViewOf(model.end2.reference._parent)
        }
        app.factory.createViewAndRelationships(editor, x, y, model.end2.reference, port2ContainerView)
      }
      if (!port1View) {
        var port1ContainerView = diagram.getViewOf(model.end1.reference._parent)
        if (!port1ContainerView) {
          app.factory.createViewAndRelationships(editor, x, y + 100, model.end1.reference._parent)
          port1ContainerView = diagram.getViewOf(model.end1.reference._parent)
        }
        app.factory.createViewAndRelationships(editor, x, y + 100, model.end1.reference, port1ContainerView)
      }
      if (port1View && port2View) {
        connectorView = new type.UMLConnectorView()
        connectorView.model = model
        connectorView.tail = port1View
        connectorView.head = port2View
        connectorView.initialize(null, connectorView.tail.left, connectorView.tail.top, connectorView.head.left, connectorView.head.top)
        if (options.viewInitializer) {
          options.viewInitializer(connectorView)
        }
        app.engine.addViews(diagram, [connectorView])
        if (connectorView) {
          connectorView = app.repository.get(connectorView._id)
        }
        options.factory.triggerElementCreated(null, connectorView)
        editor.selectView(connectorView)
      }
      return connectorView
    }

  // AssociationClass
  } else if (model instanceof type.UMLClass) {
    var assoClassLink = null
    _.each(model.ownedElements, function (e) {
      if (e instanceof type.UMLAssociationClassLink) {
        assoClassLink = e
      }
    })
    if (assoClassLink && assoClassLink.classSide === model) {
      var linkView = diagram.getViewOf(assoClassLink)
      var classView = diagram.getViewOf(model)
      var assoView = diagram.getViewOf(assoClassLink.associationSide)
      if (linkView) {
        editor.selectView(linkView)
        editor.selectView(classView)
        editor.selectView(assoView)
        app.dialogs.showAlertDialog('AssociationClass View is already existed in this Diagram.')
      } else {
        if (!classView) {
          app.factory.createViewAndRelationships(editor, x, y, model)
          classView = diagram.getViewOf(model)
        }
        if (assoView) {
          linkView = new type.UMLAssociationClassLinkView()
          linkView.model = assoClassLink
          linkView.tail = classView
          linkView.head = assoView
          linkView.initialize(null, linkView.tail.left, linkView.tail.top, linkView.head.left, linkView.head.top)
          if (options.viewInitializer) {
            options.viewInitializer(linkView)
          }
          app.engine.addViews(diagram, [linkView])
          if (linkView) {
            linkView = app.repository.get(linkView._id)
          }
          options.factory.triggerElementCreated(null, linkView)
          editor.selectView(linkView)
        }
        return linkView
      }
    } else {
      return app.factory.createViewAndRelationships(editor, x, y, model)
    }

  // Directed Relationships
  } else if (model instanceof type.DirectedRelationship) {
    var directedView = diagram.getViewOf(model)
    var sourceView = diagram.getViewOf(model.source)
    var targetView = diagram.getViewOf(model.target)
    if (directedView) {
      editor.selectView(directedView)
      editor.selectAdditionalView(sourceView)
      editor.selectAdditionalView(targetView)
      app.dialogs.showAlertDialog('Relationship View is already existed in this Diagram.')
    } else {
      if (!targetView) {
        app.factory.createViewAndRelationships(editor, x, y, model.target)
      }
      if (!sourceView) {
        app.factory.createViewAndRelationships(editor, x, y + 100, model.source)
      }
      if (targetView && sourceView) {
        let typeName = app.metamodels.getViewTypeOf(model.getClassName())
        var DirectedViewType = typeName ? type[typeName] : null
        if (DirectedViewType) {
          directedView = new DirectedViewType()
          directedView.model = model
          directedView.tail = sourceView
          directedView.head = targetView
          directedView.initialize(null, directedView.tail.left, directedView.tail.top, directedView.head.left, directedView.head.top)
          if (options.viewInitializer) {
            options.viewInitializer(directedView)
          }
          app.engine.addViews(diagram, [directedView])
          if (directedView) {
            directedView = app.repository.get(directedView._id)
          }
          options.factory.triggerElementCreated(null, directedView)
          editor.selectView(directedView)
        }
      }
      return directedView
    }

  // Undirected Relationships
  } else if (model instanceof type.UndirectedRelationship) {
    var undirectedView = diagram.getViewOf(model)
    var end1View = diagram.getViewOf(model.end1.reference)
    var end2View = diagram.getViewOf(model.end2.reference)
    if (undirectedView) {
      editor.selectView(undirectedView)
      editor.selectAdditionalView(end1View)
      editor.selectAdditionalView(end2View)
      app.dialogs.showAlertDialog('Relationship View is already existed in this Diagram.')
    } else {
      if (!end2View) {
        app.factory.createViewAndRelationships(editor, x, y, model.end2.reference)
      }
      if (!end1View) {
        app.factory.createViewAndRelationships(editor, x, y + 100, model.end1.reference)
      }
      if (end1View && end2View) {
        let typeName = app.metamodels.getViewTypeOf(model.getClassName())
        var UndirectedViewType = typeName ? type[typeName] : null
        if (UndirectedViewType) {
          undirectedView = new UndirectedViewType()
          undirectedView.model = model
          undirectedView.tail = end1View
          undirectedView.head = end2View
          undirectedView.initialize(null, undirectedView.tail.left, undirectedView.tail.top, undirectedView.head.left, undirectedView.head.top)
          if (options.viewInitializer) {
            options.viewInitializer(undirectedView)
          }
          app.engine.addViews(diagram, [undirectedView])
          if (undirectedView) {
            undirectedView = app.repository.get(undirectedView._id)
          }
          editor.selectView(undirectedView)
        }
      }
      return undirectedView
    }
  } else if (model instanceof type.Diagram) {
    return app.factory.defaultViewOnDiagramFn(model, diagram, options)
  } else {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  }
}

function viewForSequenceDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor
  var view
  var parent = diagram._parent
  var lifeline

  if (model instanceof type.UMLClassifier) {
    // Create Role (Attribute)
    var classifier = parent._parent
    var role = new type.UMLAttribute()
    role.name = Element.getNewName(classifier.attributes, 'Role')
    role.type = model
    role._parent = classifier
    // Create Lifeline
    lifeline = new type.UMLLifeline()
    lifeline.name = Element.getNewName(parent.participants, 'Lifeline')
    lifeline.represent = role
    lifeline._parent = parent
    // Create LifelineView
    view = new type.UMLSeqLifelineView()
    view._parent = diagram
    view.model = lifeline
    if ((model instanceof type.UMLActor) ||
    (model instanceof type.UMLUseCase) ||
    (model instanceof type.UMLInterface) ||
    (model instanceof type.UMLArtifact) ||
    (model instanceof type.UMLComponent) ||
    (model instanceof type.UMLNode) ||
    (model.stereotype && model.stereotype.icon)) {
      view.stereotypeDisplay = type.UMLGeneralNodeView.SD_ICON
    }
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(role)
    builder.fieldInsert(classifier, 'attributes', role)
    builder.insert(lifeline)
    builder.fieldInsert(parent, 'participants', lifeline)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLAttribute) {
    // Create Lifeline for an existing role
    lifeline = new type.UMLLifeline()
    lifeline.name = Element.getNewName(parent.participants, 'Lifeline')
    lifeline.represent = model
    lifeline._parent = parent
    // Create LifelineView
    view = new type.UMLSeqLifelineView()
    view._parent = diagram
    view.model = lifeline
    if ((model instanceof type.UMLActor) ||
    (model instanceof type.UMLUseCase) ||
    (model instanceof type.UMLInterface) ||
    (model instanceof type.UMLArtifact) ||
    (model instanceof type.UMLComponent) ||
    (model instanceof type.UMLNode) ||
    (model.stereotype && model.stereotype.icon)) {
      view.stereotypeDisplay = type.UMLGeneralNodeView.SD_ICON
    }
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(lifeline)
    builder.fieldInsert(parent, 'participants', lifeline)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLCombinedFragment) {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  } else if (model instanceof type.UMLInteraction) {
    options.x1 = x
    options.y1 = y
    options.x2 = x
    options.y2 = y
    options.modelInitializer = function (elem) {
      elem.refersTo = model
    }
    options.parent = parent
    options.id = 'UMLInteractionUse'
    return app.factory.createModelAndView(options)
  } else if (model instanceof type.UMLInteractionUse) {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  } else if (model instanceof type.UMLContinuation) {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  } else if (model instanceof type.UMLLifeline) {
    view = new type.UMLSeqLifelineView()
    view.model = model
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    app.engine.addViews(diagram, [view])
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLGate) {
    view = new type.UMLGateView()
    view.model = model
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    app.engine.addViews(diagram, [view])
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLEndpoint) {
    view = new type.UMLEndpointView()
    view.model = model
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    app.engine.addViews(diagram, [view])
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLStateInvariant) {
    var lifelineView = null
    _.each(diagram.ownedViews, function (v) {
      if (v instanceof type.UMLSeqLifelineView && v.model === model.covered) {
        lifelineView = v
      }
    })
    if (lifelineView) {
      view = new type.UMLStateInvariantView()
      view.initialize(null, x, y, x, y)
      view.model = model
      view._parent = lifelineView
      if (options.viewInitializer) {
        options.viewInitializer(view)
      }
      const builder = app.repository.getOperationBuilder()
      builder.begin('add element')
      builder.insert(view)
      builder.fieldInsert(lifelineView, 'subViews', view)
      builder.end()
      app.repository.doOperation(builder.getOperation())
      if (view) {
        view = app.repository.get(view._id)
      }
      options.factory.triggerElementCreated(null, view)
    }
    return view
  } else if (model instanceof type.UMLMessage) {
    var sourceView, targetView
    _.each(diagram.ownedViews, function (v) {
      if (v.model === model.source) {
        sourceView = v
      } else if (v.model === model.target) {
        targetView = v
      }
    })
    sourceView = sourceView instanceof type.UMLSeqLifelineView ? sourceView.linePart : sourceView
    targetView = targetView instanceof type.UMLSeqLifelineView ? targetView.linePart : targetView
    if (sourceView && targetView) {
      view = new type.UMLSeqMessageView()
      view.tail = sourceView
      view.head = targetView
      view.model = model
      view.initialize(null, sourceView.left, y, targetView.left, y)
      if (options.viewInitializer) {
        options.viewInitializer(view)
      }
      app.engine.addViews(diagram, [view])
      if (view) {
        view = app.repository.get(view._id)
      }
      options.factory.triggerElementCreated(null, view)
    }
    return view
  } else if (model instanceof type.Diagram) {
    return app.factory.defaultViewOnDiagramFn(model, diagram, options)
  } else {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  }
}

function viewForCommunicationDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor
  var view
  var parent = diagram._parent
  var lifeline

  if (model instanceof type.UMLClassifier) {
    // Create Role (Attribute)
    var classifier = parent._parent
    var role = new type.UMLAttribute()
    role.name = Element.getNewName(classifier.attributes, 'Role')
    role.type = model
    role._parent = classifier
    // Create Lifeline
    lifeline = new type.UMLLifeline()
    lifeline.name = Element.getNewName(parent.participants, 'Lifeline')
    lifeline.represent = role
    lifeline._parent = parent
    // Create LifelineView
    view = new type.UMLCommLifelineView()
    view._parent = diagram
    view.model = lifeline
    if ((model instanceof type.UMLActor) ||
    (model instanceof type.UMLUseCase) ||
    (model instanceof type.UMLInterface) ||
    (model instanceof type.UMLArtifact) ||
    (model instanceof type.UMLComponent) ||
    (model instanceof type.UMLNode) ||
    (model.stereotype && model.stereotype.icon)) {
      view.stereotypeDisplay = type.UMLGeneralNodeView.SD_ICON
    }
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(role)
    builder.fieldInsert(classifier, 'attributes', role)
    builder.insert(lifeline)
    builder.fieldInsert(parent, 'participants', lifeline)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLAttribute) {
    // Create Lifeline
    lifeline = new type.UMLLifeline()
    lifeline.name = Element.getNewName(parent.participants, 'Lifeline')
    lifeline.represent = model
    lifeline._parent = parent
    // Create LifelineView
    view = new type.UMLCommLifelineView()
    view._parent = diagram
    view.model = lifeline
    if ((model instanceof type.UMLActor) ||
    (model instanceof type.UMLUseCase) ||
    (model instanceof type.UMLInterface) ||
    (model instanceof type.UMLArtifact) ||
    (model instanceof type.UMLComponent) ||
    (model instanceof type.UMLNode) ||
    (model.stereotype && model.stereotype.icon)) {
      view.stereotypeDisplay = type.UMLGeneralNodeView.SD_ICON
    }
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(lifeline)
    builder.fieldInsert(parent, 'participants', lifeline)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLLifeline) {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  } else if (model instanceof type.UMLConnector) {
    var _ev1 = _.find(diagram.ownedViews, function (v) {
      return (v instanceof type.UMLCommLifelineView && v.model.represent === model.end1.reference)
    })
    var _ev2 = _.find(diagram.ownedViews, function (v) {
      return (v instanceof type.UMLCommLifelineView && v.model.represent === model.end2.reference)
    })
    if (_ev1 && _ev2) {
      view = new type.UMLConnectorView()
      view._parent = diagram
      view.model = model
      view.tail = _ev1
      view.head = _ev2
      view.initialize(null, _ev1.left, _ev1.top, _ev2.left, _ev2.top)
      if (options.viewInitializer) {
        options.viewInitializer(view)
      }
      app.engine.addViews(diagram, [view])
      if (view) {
        view = app.repository.get(view._id)
      }
      options.factory.triggerElementCreated(null, view)
    }
    return view
  } else if (model instanceof type.UMLMessage) {
    var connector
    var connectorView = null
    if (model.connector) {
      _.each(diagram.ownedViews, function (v) {
        if (v instanceof type.UMLConnectorView && v.model === model.connector) {
          connectorView = v
        }
      })
    } else {
      var _tailView = _.find(diagram.ownedViews, function (v) { return v.model === model.source })
      var _headView = _.find(diagram.ownedViews, function (v) { return v.model === model.target })
      if (_tailView && _headView) {
        connector = new type.UMLConnector()
        connector.end1.reference = _tailView.model
        connector.end2.reference = _headView.model
        connectorView = new type.UMLConnectorView()
        connectorView._parent = diagram
        connectorView.model = connector
        connectorView.tail = _tailView
        connectorView.head = _headView
        connectorView.initialize(null, _tailView.left, _tailView.top, _headView.left, _headView.top)
        app.engine.addModelAndView(diagram, connector, connectorView, _headView.model.represent, 'ownedElements')
        app.engine.setProperty(model, 'connector', connector)
      }
    }
    if (connectorView) {
      view = new type.UMLCommMessageView()
      view.model = model
      view.hostEdge = connectorView
      view.initialize(null, x, y, x, y)
      if (options.viewInitializer) {
        options.viewInitializer(view)
      }
      app.engine.addViews(diagram, [view])
      if (view) {
        view = app.repository.get(view._id)
      }
      options.factory.triggerElementCreated(null, view)
    }
    return view
  } else if (model instanceof type.Diagram) {
    return app.factory.defaultViewOnDiagramFn(model, diagram, options)
  } else {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  }
}

function viewForTimingDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor
  var view
  var parent = diagram._parent
  var lifeline

  // dragged elements should be placed inside timing frame
  var frameView = diagram.getBottomViewAt(editor.canvas, x, y)
  if (!(frameView instanceof type.UMLTimingFrameView)) {
    app.toast.error('Elements should be dropped on a Timing Frame')
    return
  }

  if (model instanceof type.UMLClassifier) {
    // Create Role (Attribute)
    var classifier = parent._parent
    var role = new type.UMLAttribute()
    role.name = Element.getNewName(classifier.attributes, 'Role')
    role.type = model
    role._parent = classifier
    // Create Lifeline
    lifeline = new type.UMLLifeline()
    lifeline.name = Element.getNewName(parent.participants, 'Lifeline')
    lifeline.represent = role
    lifeline._parent = parent
    // Create LifelineView
    view = new type.UMLTimingLifelineView()
    view._parent = diagram
    view.containerView = frameView
    view.model = lifeline
    if ((model instanceof type.UMLActor) ||
    (model instanceof type.UMLUseCase) ||
    (model instanceof type.UMLInterface) ||
    (model instanceof type.UMLArtifact) ||
    (model instanceof type.UMLComponent) ||
    (model instanceof type.UMLNode) ||
    (model.stereotype && model.stereotype.icon)) {
      view.stereotypeDisplay = type.UMLGeneralNodeView.SD_ICON
    }
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(role)
    builder.fieldInsert(classifier, 'attributes', role)
    builder.insert(lifeline)
    builder.fieldInsert(parent, 'participants', lifeline)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.fieldInsert(frameView, 'containedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLAttribute) {
    // Create Lifeline for an existing role
    lifeline = new type.UMLLifeline()
    lifeline.name = Element.getNewName(parent.participants, 'Lifeline')
    lifeline.represent = model
    lifeline._parent = parent
    // Create LifelineView
    view = new type.UMLTimingLifelineView()
    view._parent = diagram
    view.containerView = frameView
    view.model = lifeline
    if ((model instanceof type.UMLActor) ||
    (model instanceof type.UMLUseCase) ||
    (model instanceof type.UMLInterface) ||
    (model instanceof type.UMLArtifact) ||
    (model instanceof type.UMLComponent) ||
    (model instanceof type.UMLNode) ||
    (model.stereotype && model.stereotype.icon)) {
      view.stereotypeDisplay = type.UMLGeneralNodeView.SD_ICON
    }
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(lifeline)
    builder.fieldInsert(parent, 'participants', lifeline)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.fieldInsert(frameView, 'containedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLLifeline) {
    view = new type.UMLTimingLifelineView()
    view._parent = diagram
    view.containerView = frameView
    view.model = model
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.fieldInsert(frameView, 'containedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.Diagram) {
    return app.factory.defaultViewOnDiagramFn(model, diagram, options)
  } else {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  }
}

function viewForInteractionOverviewDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor
  var view
  var parent = diagram._parent
  var action
  if (model instanceof type.UMLInteractionUse || model instanceof type.UMLInteraction || model instanceof type.UMLSequenceDiagram) {
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    if (model instanceof type.UMLInteraction && parent._parent instanceof type.UMLInteraction) {
      let interactionUse = new type.UMLInteractionUse()
      interactionUse._parent = parent._parent
      interactionUse.refersTo = model
      builder.insert(interactionUse)
      builder.fieldInsert(parent._parent, 'fragments', interactionUse)
      model = interactionUse
    }
    // action
    action = new type.UMLAction()
    action.name = Element.getNewName(parent.nodes, 'Action')
    action._parent = parent // activity graph
    action.kind = type.UMLAction.ACK_CALLBEHAVIOR
    action.target = model
    if (options.modelInitializer) {
      options.modelInitializer(model)
    }
    // view
    if (model instanceof type.UMLSequenceDiagram) {
      view = new type.UMLInteractionInlineView()
    } else {
      view = new type.UMLInteractionUseView()
    }
    view.initialize(null, x, y, x, y)
    view.model = action
    view._parent = diagram
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    builder.insert(action)
    builder.fieldInsert(parent, 'nodes', action)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.UMLInteraction) {
    // action
    action = new type.UMLAction()
    action.name = Element.getNewName(parent.nodes, 'Action')
    action._parent = parent // activity graph
    action.kind = type.UMLAction.ACK_CALLBEHAVIOR
    action.target = model
    if (options.modelInitializer) {
      options.modelInitializer(model)
    }
    // view
    if (model instanceof type.UMLSequenceDiagram) {
      view = new type.UMLInteractionInlineView()
    } else {
      view = new type.UMLInteractionUseView()
    }
    view.initialize(null, x, y, x, y)
    view.model = action
    view._parent = diagram
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(action)
    builder.fieldInsert(parent, 'nodes', action)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.Diagram) {
    return app.factory.defaultViewOnDiagramFn(model, diagram, options)
  } else {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  }
}

function viewForStatechartDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor || null
  var containerView = options.containerView || null

  if (model instanceof type.UMLConnectionPointReference) {
    if (containerView instanceof type.UMLStateView && containerView.model === model._parent) {
      return app.factory.createViewAndRelationships(editor, x, y, model, containerView)
    } else {
      app.dialogs.showAlertDialog("ConnectionPointReference should be dropped on it's parent State")
    }
  } else if (model instanceof type.UMLStateMachine) {
    options.x1 = x
    options.y1 = y
    options.x2 = x
    options.y2 = y
    options.submachine = model
    return app.factory.createModelAndView('UMLState', diagram._parent, diagram, options)
  } else if (model instanceof type.Diagram) {
    return app.factory.defaultViewOnDiagramFn(model, diagram, options)
  } else {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  }
}

function viewForActivityDiagramFn (model, diagram, options) {
  options.editor = options.editor || app.diagrams.getEditor()
  var x = options.x || 0
  var y = options.y || 0
  var editor = options.editor
  var containerView = options.containerView || null

  // InputPin/OutputPin
  if (model instanceof type.UMLInputPin || model instanceof type.UMLOutputPin) {
    if (containerView instanceof type.UMLActionView && containerView.model === model._parent) {
      return app.factory.createViewAndRelationships(editor, x, y, model, containerView)
    } else {
      app.dialogs.showAlertDialog("Pin should be dropped on it's parent Action")
    }
  } else if (model instanceof type.UMLActivity) {
    // Create Action
    var parent = diagram._parent
    var action = new type.UMLAction()
    action.name = ''
    action.subactivity = model
    action._parent = model
    // Create ActionView
    var view = new type.UMLActionView()
    view._parent = diagram
    view.model = action
    view.initialize(null, x, y, x, y)
    if (options.viewInitializer) {
      options.viewInitializer(view)
    }
    // Make Command
    const builder = app.repository.getOperationBuilder()
    builder.begin('add element')
    builder.insert(action)
    builder.fieldInsert(parent, 'nodes', action)
    builder.insert(view)
    builder.fieldInsert(diagram, 'ownedViews', view)
    builder.end()
    app.repository.doOperation(builder.getOperation())
    if (view) {
      view = app.repository.get(view._id)
    }
    options.factory.triggerElementCreated(null, view)
    return view
  } else if (model instanceof type.Diagram) {
    return app.factory.defaultViewOnDiagramFn(model, diagram, options)
  } else {
    return app.factory.createViewAndRelationships(editor, x, y, model)
  }
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

function _directedRelationshipFn (parent, diagram, options) {
  return app.factory.defaultDirectedRelationshipFn(options.tailModel, diagram, options)
}

function _viewOnlyFn (parent, diagram, options) {
  return app.factory.defaultViewOnlyFn(parent, diagram, options)
}

// ========================================================================
// Create Diagram
// ========================================================================

app.factory.registerDiagramFn('UMLClassDiagram', structuralDiagramFn)
app.factory.registerDiagramFn('UMLCompositeStructureDiagram', compositeStructureDiagramFn)
app.factory.registerDiagramFn('UMLPackageDiagram', structuralDiagramFn)
app.factory.registerDiagramFn('UMLObjectDiagram', structuralDiagramFn)
app.factory.registerDiagramFn('UMLComponentDiagram', structuralDiagramFn)
app.factory.registerDiagramFn('UMLDeploymentDiagram', structuralDiagramFn)
app.factory.registerDiagramFn('UMLProfileDiagram', profileDiagramFn)
app.factory.registerDiagramFn('UMLUseCaseDiagram', structuralDiagramFn)
app.factory.registerDiagramFn('UMLSequenceDiagram', sequenceDiagramFn)
app.factory.registerDiagramFn('UMLCommunicationDiagram', communicationDiagramFn)
app.factory.registerDiagramFn('UMLTimingDiagram', timingDiagramFn)
app.factory.registerDiagramFn('UMLInteractionOverviewDiagram', interactionOverviewDiagramFn)
app.factory.registerDiagramFn('UMLInformationFlowDiagram', structuralDiagramFn)
app.factory.registerDiagramFn('UMLStatechartDiagram', statechartDiagramFn)
app.factory.registerDiagramFn('UMLActivityDiagram', activityDiagramFn)

// ========================================================================
// Create Model
// ========================================================================

// Packages
app.factory.registerModelFn('UMLModel', _modelFn)
app.factory.registerModelFn('UMLPackage', _modelFn)
app.factory.registerModelFn('UMLSubsystem', _modelFn)
app.factory.registerModelFn('UMLProfile', _modelFn)
// Classifiers
app.factory.registerModelFn('UMLClass', _modelFn)
app.factory.registerModelFn('UMLInterface', _modelFn)
app.factory.registerModelFn('UMLSignal', _modelFn)
app.factory.registerModelFn('UMLDataType', _modelFn)
app.factory.registerModelFn('UMLPrimitiveType', _modelFn)
app.factory.registerModelFn('UMLEnumeration', _modelFn)
app.factory.registerModelFn('UMLArtifact', _modelFn)
app.factory.registerModelFn('UMLComponent', _modelFn)
app.factory.registerModelFn('UMLNode', _modelFn)
app.factory.registerModelFn('UMLUseCase', _modelFn)
app.factory.registerModelFn('UMLActor', _modelFn)
app.factory.registerModelFn('UMLStereotype', _modelFn)
app.factory.registerModelFn('UMLInformationItem', _modelFn)
// Instances
app.factory.registerModelFn('UMLObject', _modelFn)
app.factory.registerModelFn('UMLArtifactInstance', _modelFn)
app.factory.registerModelFn('UMLComponentInstance', _modelFn)
app.factory.registerModelFn('UMLNodeInstance', _modelFn)
// Behaviors
app.factory.registerModelFn('UMLCollaboration', _modelFn)
app.factory.registerModelFn('UMLInteraction', _modelFn)
app.factory.registerModelFn('UMLStateMachine', stateMachineFn)
app.factory.registerModelFn('UMLActivity', _modelFn)
app.factory.registerModelFn('UMLOpaqueBehavior', _modelFn)
app.factory.registerModelFn('UMLInteractionOperand', _modelFn)
// Features
app.factory.registerModelFn('UMLTemplateParameter', _modelFn)
app.factory.registerModelFn('UMLTemplateParameterSubstitution', _modelFn)
app.factory.registerModelFn('UMLParameter', _modelFn)
app.factory.registerModelFn('UMLEnumerationLiteral', _modelFn)
app.factory.registerModelFn('UMLAttribute', _modelFn)
app.factory.registerModelFn('UMLPort', _modelFn)
app.factory.registerModelFn('UMLOperation', _modelFn)
app.factory.registerModelFn('UMLReception', _modelFn)
app.factory.registerModelFn('UMLExtensionPoint', _modelFn)
app.factory.registerModelFn('UMLSlot', _modelFn)
// States
app.factory.registerModelFn('UMLState', _modelFn)
app.factory.registerModelFn('UMLRegion', _modelFn)
// Actions
app.factory.registerModelFn('UMLAction', _modelFn)
app.factory.registerModelFn('UMLEvent', _modelFn)
// Common
app.factory.registerModelFn('UMLConstraint', _modelFn)

// ========================================================================
// Create Model And View
// ========================================================================

// Classes
app.factory.registerModelAndViewFn('UMLClass', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLInterface', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLSignal', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLDataType', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLPrimitiveType', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLEnumeration', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLAssociation', _undirectedRelationshipFn, { precondition: classifierLinkPrecondition })
app.factory.registerModelAndViewFn('UMLAssociationClass', associationClassFn)
app.factory.registerModelAndViewFn('UMLNaryAssociationNode', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLDependency', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })
app.factory.registerModelAndViewFn('UMLGeneralization', _directedRelationshipFn, { precondition: classifierLinkPrecondition })
app.factory.registerModelAndViewFn('UMLInterfaceRealization', interfaceRealizationFn)
app.factory.registerModelAndViewFn('UMLTemplateBinding', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })

// Packages
app.factory.registerModelAndViewFn('UMLModel', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLPackage', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLSubsystem', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLContainment', containmentFn)

// Composite Structures
app.factory.registerModelAndViewFn('UMLPort', portFn)
app.factory.registerModelAndViewFn('UMLPart', partFn)
app.factory.registerModelAndViewFn('UMLCollaboration', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLCollaborationUse', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLConnector', connectorFn)
app.factory.registerModelAndViewFn('UMLRoleBinding', _directedRelationshipFn, { precondition: roleBindingPrecondition })
app.factory.registerModelAndViewFn('UMLRealization', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })

// Components
app.factory.registerModelAndViewFn('UMLArtifact', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLComponent', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLComponentRealization', _directedRelationshipFn, { precondition: componentRealizationPrecondition })

// Deployments
app.factory.registerModelAndViewFn('UMLNode', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLDeployment', _directedRelationshipFn, { precondition: deploymentPrecondition })
app.factory.registerModelAndViewFn('UMLCommunicationPath', _undirectedRelationshipFn, { precondition: nodeLinkPrecondition })

// Instances
app.factory.registerModelAndViewFn('UMLObject', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLArtifactInstance', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLComponentInstance', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLNodeInstance', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLLink', _undirectedRelationshipFn, { precondition: instanceLinkPrecondition })
app.factory.registerModelAndViewFn('UMLLinkObject', linkObjectFn)

// Use Cases
app.factory.registerModelAndViewFn('UMLUseCaseSubject', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLUseCase', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLActor', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLInclude', _directedRelationshipFn, { precondition: useCaseLinkPrecondition })
app.factory.registerModelAndViewFn('UMLExtend', _directedRelationshipFn, { precondition: useCaseLinkPrecondition })

// Interactions
app.factory.registerModelAndViewFn('UMLLifeline', lifelineFn)
app.factory.registerModelAndViewFn('UMLEndpoint', _modelAndViewFn, { precondition: interactionPrecondition, field: 'participants' })
app.factory.registerModelAndViewFn('UMLGate', _modelAndViewFn, { precondition: interactionPrecondition, field: 'participants' })
app.factory.registerModelAndViewFn('UMLMessage', messageFn)
app.factory.registerModelAndViewFn('UMLFoundMessage', foundMessageFn)
app.factory.registerModelAndViewFn('UMLLostMessage', lostMessageFn)
app.factory.registerModelAndViewFn('UMLStateInvariant', stateInvariantFn)
app.factory.registerModelAndViewFn('UMLTimingState', timingStateFn)
app.factory.registerModelAndViewFn('UMLTimeSegment', timeSegmentFn)
app.factory.registerModelAndViewFn('UMLTimeTick', timeTickFn)
app.factory.registerModelAndViewFn('UMLContinuation', _modelAndViewFn, { precondition: interactionPrecondition, field: 'fragments' })
app.factory.registerModelAndViewFn('UMLCombinedFragment', combinedFragmentFn)
app.factory.registerModelAndViewFn('UMLInteractionUse', _modelAndViewFn, { precondition: interactionPrecondition, field: 'fragments' })
app.factory.registerModelAndViewFn('UMLTimeConstraint', timeConstraintFn)
app.factory.registerModelAndViewFn('UMLDurationConstraint', durationConstraintFn)
app.factory.registerModelAndViewFn('UMLInteractionUseInOverview', interactionUseInOverviewFn)
app.factory.registerModelAndViewFn('UMLInteractionInOverview', interactionInOverviewFn)
app.factory.registerModelAndViewFn('UMLFrame', _viewOnlyFn, { viewType: 'UMLFrameView' })

// State Machines
app.factory.registerModelAndViewFn('UMLState', stateFn)
app.factory.registerModelAndViewFn('UMLSubmachineState', submachineStateFn)
app.factory.registerModelAndViewFn('UMLPseudostate', pseudostateFn)
app.factory.registerModelAndViewFn('UMLFinalState', finalStateFn)
app.factory.registerModelAndViewFn('UMLConnectionPointReference', connectionPointReferenceFn)
app.factory.registerModelAndViewFn('UMLTransition', transitionFn)

// Activities
app.factory.registerModelAndViewFn('UMLAction', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLObjectNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLCentralBufferNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLDataStoreNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLInitialNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLActivityFinalNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLFlowFinalNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLForkNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLJoinNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLMergeNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLDecisionNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLInputPin', _modelAndViewFn, { precondition: pinPrecondition, field: 'inputs' })
app.factory.registerModelAndViewFn('UMLOutputPin', _modelAndViewFn, { precondition: pinPrecondition, field: 'outputs' })
app.factory.registerModelAndViewFn('UMLActivityPartition', _modelAndViewFn, { precondition: activityPrecondition, field: 'groups' })
app.factory.registerModelAndViewFn('UMLInterruptibleActivityRegion', _modelAndViewFn, { precondition: activityPrecondition, field: 'groups' })
app.factory.registerModelAndViewFn('UMLStructuredActivityNode', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLExpansionRegion', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes' })
app.factory.registerModelAndViewFn('UMLInputExpansionNode', _modelAndViewFn, { modelType: 'UMLExpansionNode', viewType: 'UMLExpansionNodeView', precondition: pinPrecondition, field: 'inputs', modelInitializer: function (m) { m.name = '' } })
app.factory.registerModelAndViewFn('UMLOutputExpansionNode', _modelAndViewFn, { modelType: 'UMLExpansionNode', viewType: 'UMLExpansionNodeView', precondition: pinPrecondition, field: 'outputs', modelInitializer: function (m) { m.name = '' } })
app.factory.registerModelAndViewFn('UMLControlFlow', controlFlowFn)
app.factory.registerModelAndViewFn('UMLObjectFlow', objectFlowFn)
app.factory.registerModelAndViewFn('UMLExceptionHandler', exceptionHandlerFn)
app.factory.registerModelAndViewFn('UMLActivityInterrupt', activityInterruptFn)
app.factory.registerModelAndViewFn('UMLActivityEdgeConnector', _modelAndViewFn, { precondition: activityPrecondition, field: 'nodes', modelInitializer: function (m) { m.name = 'A' } })

// Information Flows
app.factory.registerModelAndViewFn('UMLInformationItem', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLInformationFlow', _directedRelationshipFn, { precondition: modelElementLinkPrecondition })

// Profiles
app.factory.registerModelAndViewFn('UMLProfile', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLStereotype', _modelAndViewFn)
app.factory.registerModelAndViewFn('UMLMetaClass', _modelAndViewFn, { modelInitializer: function (m) { m.name = 'UMLClass' } })
app.factory.registerModelAndViewFn('UMLExtension', _directedRelationshipFn, { precondition: extensionPrecondition })

// ========================================================================
// Create View
// ========================================================================

app.factory.registerViewOfFn('UMLClassDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLCompositeStructureDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLPackageDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLObjectDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLComponentDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLDeploymentDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLProfileDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLUseCaseDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLSequenceDiagram', viewForSequenceDiagramFn)
app.factory.registerViewOfFn('UMLCommunicationDiagram', viewForCommunicationDiagramFn)
app.factory.registerViewOfFn('UMLTimingDiagram', viewForTimingDiagramFn)
app.factory.registerViewOfFn('UMLInteractionOverviewDiagram', viewForInteractionOverviewDiagramFn)
app.factory.registerViewOfFn('UMLInformationFlowDiagram', viewForGeneralDiagramFn)
app.factory.registerViewOfFn('UMLStatechartDiagram', viewForStatechartDiagramFn)
app.factory.registerViewOfFn('UMLActivityDiagram', viewForActivityDiagramFn)
