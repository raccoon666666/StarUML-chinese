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

/* global app */

require('./uml-factory')
require('./uml-commands')

// --- QuickEdit Actions ---

function setupDiagramManager () {
  // 다이어그램 영역에서 Views들을 이동하면 containerView를 변경할 때.
  app.diagrams.on('containerViewChanged', (views, dx, dy, containerView) => {
    try {
      var diagram = app.diagrams.getEditor().diagram
      var containerModel = null
      if (containerView) {
        containerModel = containerView.model
      } else {
        if (diagram instanceof type.UMLStatechartDiagram) {
          containerModel = diagram._parent.regions[0]
        } else {
          containerModel = diagram._parent
        }
      }
      app.engine.moveViewsChangingContainer(app.diagrams.getEditor(), views, dx, dy, containerView, containerModel)
    } catch (err) {
      console.error(err)
    }
  })
  app.diagrams.on('workingDiagramRemove', (diagram) => {
  })
  app.diagrams.on('edgeReconnected', (edge, points, newParticipant, isTailSide) => {
    try {
      if (edge.canConnectTo(newParticipant, isTailSide)) {
        if (edge instanceof type.UMLSeqMessageView && newParticipant instanceof type.UMLSeqLifelineView) {
          app.engine.reconnectEdge(app.diagrams.getEditor(), edge, points, newParticipant.linePart, newParticipant.linePart.model, isTailSide)
        } else if (edge instanceof type.UMLConnectorView && edge._parent instanceof type.UMLCommunicationDiagram) {
          // Change message's source and target should be changed when connector is reconnected to another lifeline
          app.engine.reconnectEdge(app.diagrams.getEditor(), edge, points, newParticipant, newParticipant.model.represent, isTailSide)
          var dgm = edge._parent
          dgm.ownedViews.forEach(v => {
            if (v instanceof type.UMLCommMessageView && v.hostEdge === edge) {
              if (isTailSide) {
                if (edge.head.model === v.model.source) {
                  app.engine.setProperty(v.model, 'target', edge.tail.model)
                } else if (edge.head.model === v.model.target) {
                  app.engine.setProperty(v.model, 'source', edge.tail.model)
                }
              } else {
                if (edge.tail.model === v.model.source) {
                  app.engine.setProperty(v.model, 'target', edge.head.model)
                } else if (edge.tail.model === v.model.target) {
                  app.engine.setProperty(v.model, 'source', edge.head.model)
                }
              }
            }
          })
        } else {
          app.engine.reconnectEdge(app.diagrams.getEditor(), edge, points, newParticipant, newParticipant.model, isTailSide)
        }
      } else {
        if (edge.model && newParticipant.model) {
          app.toast.error(edge.model.getDisplayClassName() + ' cannot be connected to ' + newParticipant.model.getDisplayClassName())
        } else {
          app.toast.error('Invalid Connection')
        }
      }
    } catch (err) {
      console.error(err)
    }
  })
  app.diagrams.on('viewDoubleClicked', (view, x, y) => {
    if (view instanceof type.UMLInteractionInlineView) {
      if (view.model.target instanceof type.UMLDiagram) {
        app.diagrams.setCurrentDiagram(view.model.target)
        app.modelExplorer.select(view.model.target, true)
      }
    } else if (view instanceof type.UMLInteractionUseView) {
      if (view.model instanceof type.UMLAction) {
        app.modelExplorer.select(view.model.target.refersTo, true)
      } else if (view.model instanceof type.UMLInteractionUse) {
        app.modelExplorer.select(view.model.refersTo, true)
      }
    }
  })
}

function _toSingleLine (text) {
  return text.trim().split('\n').join('')
}

function loadStereotypeIcons () {
  var css = []
  var stereotypes = app.repository.findAll(function (e) {
    return (e instanceof type.UMLStereotype && e.icon && e.icon.smallIcon && e.icon.smallIcon.trim().length > 0)
  })
  stereotypes.forEach(function (elem) {
    if (elem.icon.smallIcon.indexOf("'") < 0) {
      css.push('.' + elem.getIconClass() + " { background-image: url('data:image/svg+xml," + _toSingleLine(elem.icon.smallIcon) + "') !important; background-repeat: no-repeat; background-position: 0px 0px; width: 16px; height: 16px; background-clip: content-box; }")
    } else {
      console.error("Stereotype's smallIcon should not have `'` (single quote) character.")
    }
  })
  $('#uml-stereotype-small-icons').remove()
  if (css.length > 0) {
    return $("<style id='uml-stereotype-small-icons'>").text(css.join('\n')).appendTo('head')[0]
  }
}

function setupProjectManager () {
  app.project.on('projectLoaded', (filename, project) => {
    try {
      loadStereotypeIcons()
    } catch (err) {
      console.error(err)
    }
  })

  app.project.on('imported', (filename, elem) => {
    try {
      loadStereotypeIcons()
    } catch (err) {
      console.error(err)
    }
  })
}

function init () {
  setupDiagramManager()
  setupProjectManager()
}

exports.init = init
