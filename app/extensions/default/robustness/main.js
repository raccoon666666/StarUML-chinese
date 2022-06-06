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

function _addClass (diagram, parent, name, stereotype, x1, y1, x2, y2) {
  var model = new type.UMLClass()
  model.name = type.Element.getNewName(parent.ownedElements, name)
  model.stereotype = stereotype
  var view = new type.UMLClassView()
  view.suppressAttributes = true
  view.suppressOperations = true
  view.stereotypeDisplay = type.UMLGeneralNodeView.SD_ICON
  view.initialize(null, x1, y1, x2, y2)
  app.engine.addModelAndView(diagram, model, view, parent, 'ownedElements')
}

function createElement (options) {
  try {
    var diagram = options.diagram
    var parent = diagram._parent
    var stereotype = null
    var buttonId
    switch (options.id) {
    case 'UMLBoundary':
      stereotype = app.repository.lookupAndFind(app.project.getProject(), 'boundary', type.UMLStereotype)
      if (stereotype) {
        _addClass(diagram, parent, 'Boundary', stereotype, options.x1, options.y1, options.x2, options.y2)
      } else {
        buttonId = app.dialogs.showConfirmDialog('Boundary requires UML Standard Profile. Do you want to apply?')
        if (buttonId === 'ok') {
          app.commands.execute('uml:apply-profile.uml-standard')
          stereotype = app.repository.lookupAndFind(app.project.getProject(), 'boundary', type.UMLStereotype)
          _addClass(diagram, parent, 'Boundary', stereotype, options.x1, options.y1, options.x2, options.y2)
        }
      }
      break
    case 'UMLEntity':
      stereotype = app.repository.lookupAndFind(app.project.getProject(), 'entity', type.UMLStereotype)
      if (stereotype) {
        _addClass(diagram, parent, 'Entity', stereotype, options.x1, options.y1, options.x2, options.y2)
      } else {
        buttonId = app.dialogs.showConfirmDialog('Entity requires UML Standard Profile. Do you want to apply?')
        if (buttonId === 'ok') {
          app.commands.execute('uml:apply-profile.uml-standard')
          stereotype = app.repository.lookupAndFind(app.project.getProject(), 'entity', type.UMLStereotype)
          _addClass(diagram, parent, 'Entity', stereotype, options.x1, options.y1, options.x2, options.y2)
        }
      }
      break
    case 'UMLControl':
      stereotype = app.repository.lookupAndFind(app.project.getProject(), 'control', type.UMLStereotype)
      if (stereotype) {
        _addClass(diagram, parent, 'Control', stereotype, options.x1, options.y1, options.x2, options.y2)
      } else {
        buttonId = app.dialogs.showConfirmDialog('Control requires UML Standard Profile. Do you want to apply?')
        if (buttonId === 'ok') {
          app.commands.execute('uml:apply-profile.uml-standard')
          stereotype = app.repository.lookupAndFind(app.project.getProject(), 'control', type.UMLStereotype)
          _addClass(diagram, parent, 'Control', stereotype, options.x1, options.y1, options.x2, options.y2)
        }
      }
      break
    }
  } catch (err) {
    if (_.isString(err)) {
      app.dialogs.showAlertDialog(err)
    } else {
      console.log(err.stack)
    }
  }
}

function init () {
  app.commands.register('robustness:create', createElement)
}

exports.init = init

