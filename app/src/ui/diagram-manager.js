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

const keycode = require('keycode')
const {Point, Rect} = require('../core/graphics')
const {DiagramEditor} = require('./diagram-editor')
const {EventEmitter} = require('events')
const _ = require('lodash')
const { FreelineEdgeView } = require('../core/core')

/**
 * Diagram Manager manages working diagrams
 */
class DiagramManager extends EventEmitter {

  constructor () {
    super()

    /**
     * Working diagrams.
     *
     * @private
     * @type {Array.<Diagram>}
     */
    this._workingDiagrams = []

    /**
     * Diagram editor.
     *
     * @private
     * @type {Editor}
     */
    this.diagramEditor = null

    /**
     * Active handler
     *
     * @private
     * @type {Handler}
     */
    this.activeHandler = null

    this._doRepaint = true

    this.hiddenEditor = null

    this.$diagramArea = null
  }

  /**
   * Open diagram and add to working set
   *
   * @param {Diagram} diagram
   */
  openDiagram (diagram) {
    if (diagram) {
      this.diagramEditor.diagram = diagram
      if (!_.includes(this._workingDiagrams, diagram)) {
        this._workingDiagrams.push(diagram)
        /**
         * Triggered when an diagram is open (added to working diagrams)
         * @name workingDiagramAdd
         * @kind event
         * @memberof DiagramManager
         * @property {Diagram} diagram The diagram opened
         */
        this.emit('workingDiagramAdd', diagram)
        this._currentDiagramChangedEvent(this.diagramEditor.diagram)
      }
    }
  }

  /**
   * Update the diagram.
   *
   * @param {Diagram} diagram
   */
  updateDiagram (diagram) {
    if (diagram) {
      /**
       * Triggered when an working diagram is updated
       * @name workingDiagramUpdate
       * @kind event
       * @memberof DiagramManager
       * @property {Diagram} diagram The diagram updated
       */
      this.emit('workingDiagramUpdate', diagram)
    }
  }

  /**
   * Close the diagram.
   *
   * @param {Diagram} diagram
   */
  closeDiagram (diagram) {
    if (diagram) {
      var index = _.indexOf(this._workingDiagrams, diagram)
      if (index >= 0) {
        // Close the diagram
        if (this._workingDiagrams.indexOf(diagram) > -1) {
          this._workingDiagrams.splice(this._workingDiagrams.indexOf(diagram), 1)
        }
        /**
         * Triggered when an working diagram is closed
         * @name workingDiagramRemove
         * @kind event
         * @memberof DiagramManager
         * @property {Diagram} diagram The diagram closed
         */
        this.emit('workingDiagramRemove', diagram)

        // if current diagram is closing
        if (this.getCurrentDiagram() === diagram) {
          if (this._workingDiagrams.length === 0) {
            this.setCurrentDiagram(null)
          } else if (this._workingDiagrams[index]) {
            this.setCurrentDiagram(this._workingDiagrams[index])
          } else {
            this.setCurrentDiagram(this._workingDiagrams[0])
          }
        }
      }
    }
  }

  /**
   * Return all working diagrams.
   *
   * @return {Array.<Diagram>}
   */
  getWorkingDiagrams () {
    return this._workingDiagrams
  }

  /**
   * Save a list of working diagrams of current project.
   */
  saveWorkingDiagrams () {
    var fullPath = app.project.getFilename()
    if (fullPath) {
      const orderedId = app.workingDiagrams.getIds()
      this._workingDiagrams.sort((a, b) => {
        return orderedId.indexOf(a._id) - orderedId.indexOf(b._id)
      })
      var current = this.getCurrentDiagram() ? this.getCurrentDiagram()._id : null
      var ids = _.map(this._workingDiagrams, d => { return d._id })
      var key = '_workingDiagrams.' + fullPath
      var value = { current: current, workingSet: ids }
      app.preferences.set(key, value)
    }
  }

  /**
   * Restore a list of working diagrams and current diagram of current project.
   */
  restoreWorkingDiagrams () {
    var fullPath = app.project.getFilename()
    if (fullPath) {
      var key = '_workingDiagrams.' + fullPath
      var value = app.preferences.get(key)
      if (value) {
        if (value.workingSet) {
          for (var i = 0, len = value.workingSet.length; i < len; i++) {
            var diagram = app.repository.get(value.workingSet[i])
            if (diagram) {
              this.openDiagram(diagram)
            }
          }
        }
        if (value.current) {
          var current = app.repository.get(value.current)
          if (current) {
            this.setCurrentDiagram(current)
          }
        }
      }
    }
  }

  /**
   * Close all diagrams except active diagram.
   */
  closeOthers () {
    var active = this.getCurrentDiagram()
    if (active) {
      this.closeAll()
      this.setCurrentDiagram(active)
    }
  }

  /**
   * Close all diagrams
   */
  closeAll () {
    this._workingDiagrams = []
    this.emit('workingDiagramsClear')
    this.setCurrentDiagram(null)
  }

  restoreDiagramOrigin (diagram) {
    // restore the remembered diagram's origin
    if (typeof diagram._originX === 'number' && typeof diagram._originY === 'number') {
      app.diagrams.getEditor().setOrigin(diagram._originX, diagram._originY)
    } else {
      app.diagrams.getEditor().setOrigin(0, 0)
    }
  }

  /**
   * Set current diagram.
   *
   * @param {Diagram} diagram
   * @param {boolean} skipEvent
   */
  setCurrentDiagram (diagram, skipEvent) {
    if (diagram) {
      this.diagramEditor.diagram = diagram
      this.diagramEditor.setEnabled(true)
      if (!_.includes(this._workingDiagrams, diagram)) {
        this.openDiagram(diagram)
      }
      this.restoreDiagramOrigin(diagram)
      this.__fixDiagramProblem(diagram)
      this.repaint()
      if (!skipEvent) {
        this._currentDiagramChangedEvent(this.diagramEditor.diagram)
      }
    } else {
      this.diagramEditor.diagram = null
      this.diagramEditor.setEnabled(false)
      this._currentDiagramChangedEvent(this.diagramEditor.diagram)
    }
  }

  /**
   * Return current diagram
   *
   * @return {Diagram}
   */
  getCurrentDiagram () {
    if (this.diagramEditor && this.diagramEditor.diagram) {
      return this.diagramEditor.diagram
    }
    return null
  }

  /**
   * Set next diagram as current diagram
   */
  nextDiagram () {
    var index = _.indexOf(this._workingDiagrams, this.getCurrentDiagram())
    if (index >= 0 && index < this._workingDiagrams.length - 1) {
      this.setCurrentDiagram(this._workingDiagrams[index + 1])
    } else if (index > 0 && index === this._workingDiagrams.length - 1) {
      this.setCurrentDiagram(this._workingDiagrams[0])
    }
  }

  /**
   * Set previous diagram as current diagram
   */
  previousDiagram () {
    var index = _.indexOf(this._workingDiagrams, this.getCurrentDiagram())
    if (index > 0 && index < this._workingDiagrams.length) {
      this.setCurrentDiagram(this._workingDiagrams[index - 1])
    } else if (index === 0 && this._workingDiagrams.length > 0) {
      this.setCurrentDiagram(this._workingDiagrams[this._workingDiagrams.length - 1])
    }
  }

  /**
   * Set an active handler.
   * @private
   * @param {Handler} handler
   */
  setActiveHandler (handler) {
    this.activeHandler = handler
    this.diagramEditor.activeHandler = this.activeHandler
  }

  /**
   * Return diagram editor.
   * @private
   * @return {Editor}
   */
  getEditor () {
    return this.diagramEditor
  }

  /**
   * Return Hidden Editor which is not shown
   * @private
   */
  getHiddenEditor () {
    return this.hiddenEditor
  }

  /**
   * Select all view elements.
   */
  selectAll () {
    this.diagramEditor.selectAll()
  }

  /**
   * Deselect all.
   */
  deselectAll () {
    this.diagramEditor.deselectAll()
  }

  /**
   * Select view in diagram. Open diagram if diagram is not opened and then scroll to the view.
   *
   * @param {View} view
   */
  selectInDiagram (view) {
    var dgm = view.getDiagram()
    this.setCurrentDiagram(dgm)
    var center = view.getBoundingBox().getCenter()
    this.scrollTo(center.x, center.y)
    this.diagramEditor.deselectAll()
    this.diagramEditor.selectView(view)
    this.repaint()
  }

  needRepaint (changedElements) {
    var repaintRequired = false
    if (this.diagramEditor.diagram) {
      if (Array.isArray(changedElements) && changedElements.length > 0) {
        this.diagramEditor.diagram.traverse(v => {
          if (_.includes(changedElements, v)) {
            repaintRequired = true
          } else if (v instanceof type.View && _.includes(changedElements, v.model)) {
            repaintRequired = true
          }
        })
      }
    }
    return repaintRequired
  }

  suspendRepaint () {
    this._doRepaint = false
  }

  resumeRepaint () {
    this._doRepaint = true
    this.repaint()
  }

  /**
   * Repaint.
   */
  repaint () {
    if (this.diagramEditor.diagram && this._doRepaint) {
      this.diagramEditor.repaint()
      /**
       * Triggered when current diagram has repainted
       * @name repaint
       * @kind event
       * @memberof DiagramManager
       */
      this.emit('repaint', this.diagramEditor)
    }
  }

  /**
   * Set zoom level
   *
   * @param {number} value Zoom level between 0 and 1.
   */
  setZoomLevel (value) {
    this.diagramEditor.setZoomScale(value)
  }

  /**
   * Return zoom level
   *
   * @return {number} Zoom level between 0 and 1.
   */
  getZoomLevel () {
    return this.diagramEditor.getZoomScale()
  }

  /**
   * Toggle grid
   */
  toggleGrid () {
    if (this.diagramEditor.showGrid) {
      this.hideGrid()
    } else {
      this.showGrid()
    }
  }

  /**
   * Show grid
   */
  showGrid () {
    this.diagramEditor.showGrid = true
    app.preferences.set('diagramEditor.showGrid', this.isGridVisible())
    this.repaint()
  }

  /**
   * Hide grid
   */
  hideGrid () {
    this.diagramEditor.showGrid = false
    app.preferences.set('diagramEditor.showGrid', this.isGridVisible())
    this.repaint()
  }

  /**
   * Return whether grid is visible.
   *
   * @return {boolean}
   */
  isGridVisible () {
    return this.diagramEditor.showGrid
  }

  toggleSnapToGrid () {
    if (this.diagramEditor.snapToGrid) {
      this.setSnapToGrid(false)
    } else {
      this.setSnapToGrid(true)
    }
  }

  setSnapToGrid (allow = true) {
    this.diagramEditor.snapToGrid = allow
    app.preferences.set('diagramEditor.snapToGrid', allow)
    this.repaint()
  }

  getSnapToGrid () {
    return this.diagramEditor.snapToGrid
  }

  /**
   * Return view size.
   *
   * @param {Point} x is width, y is height.
   */
  getViewportSize () {
    return new Point(this.$diagramArea.width(), this.$diagramArea.height())
  }

  /**
   * Scroll diagram area to the given position
   *
   * @param {number} x
   * @param {number} y
   * @param {boolean} animation
   */
  scrollTo (x, y, animation) {
    // TODO: animation not supported yet
    let sz = this.getViewportSize()
    var _x = Math.max(0, Math.floor(x - ((sz.x / 2) / this.getZoomLevel())))
    var _y = Math.max(0, Math.floor(y - ((sz.y / 2) / this.getZoomLevel())))
    this.diagramEditor.setOrigin(-_x, -_y)
  }

  /**
   * Get postion of the scroll bar
   *
   * @return {Point}
   */
  getScrollPosition () {
    return new Point(this.$diagramArea.scrollLeft(), this.$diagramArea.scrollTop())
  }

  /**
   * Return left, top, right, bottom of diagram area with zoom level
   *
   * @return {Rect}
   */
  getDiagramArea () {
    let zoom = this.getZoomLevel()
    let scroll = this.getScrollPosition()
    let size = this.getViewportSize()
    let x = Math.round(scroll.x / zoom)
    let y = Math.round(scroll.y / zoom)
    let w = Math.round(size.x / zoom)
    let h = Math.round(size.y / zoom)
    return new Rect(x, y, x + w, y + h)
  }

  // 기존의 잘못된 다이어그램을 수정하기 위한 코드임.
  __fixDiagramProblem (diagram) {
    if (diagram) {
      // 1) Communication Diagram에서 hostEdge가 null인 UMLCommMessageView를 모두 지움.
      if (diagram instanceof type.UMLCommunicationDiagram) {
        _.each(diagram.ownedViews, v => {
          if (v instanceof type.UMLCommMessageView && v.hostEdge === null) {
            diagram.removeOwnedView(v)
          }
        })
      }

      _.each(diagram.ownedViews, v => {
        // 1) model이 없는 UMLGeneralNodeView, UMLGeneralEdgeView를 모두 삭제.
        if (!v.model && v instanceof type.UMLGeneralNodeView) {
          diagram.removeOwnedView(v)
        }
        if (!v.model && v instanceof type.UMLGeneralEdgeView) {
          diagram.removeOwnedView(v)
        }

        // 2) _parent가 없는 View들 모두 삭제
        if (!v._parent) {
          diagram.removeOwnedView(v)
        }

        // 3) head or tail이 없는 EdgeView는 삭제
        if (v instanceof type.EdgeView) {
          if ((!v.head || !v.tail) && !(v instanceof FreelineEdgeView)) {
            diagram.removeOwnedView(v)
          }
        }

        // 4) end1.reference or end2.reference가 없는 UndirectedRelationship을 모두 삭제.
        if (v.model instanceof type.UndirectedRelationship) {
          if (!v.model.end1.reference || !v.model.end2.reference) {
            var pf1 = v.model.getParentField()
            if (v.model._parent && pf1) {
              var owner1 = v.model._parent[pf1]
              if (owner1.indexOf(v.model) > -1) {
                owner1.splice(owner1.indexOf(v.model), 1)
              }
            }
            diagram.removeOwnedView(v)
          }
        }

        // 5) source or target이 없는 DirectedRelationship을 모두 삭제.
        if (v.model instanceof type.DirectedRelationship) {
          if (!v.model.source || !v.model.target) {
            var pf2 = v.model.getParentField()
            if (v.model._parent && pf2) {
              var owner2 = v.model._parent[pf2]
              if (owner2.indexOf(v.model) > -1) {
                owner2.splice(owner2.indexOf(v.model), 1)
              }
            }
            diagram.removeOwnedView(v)
          }
        }

        // 5) nameLabel, stereotypeLabel, propertyLabel, RoleNameLabel, MultiplicityLabel, PropertyLabel, QualifiersCompartment
        if (v.nameLabel && !app.repository.get(v.nameLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.stereotypeLabel && !app.repository.get(v.stereotypeLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.propertyLabel && !app.repository.get(v.propertyLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.tailRoleNameLabel && !app.repository.get(v.tailRoleNameLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.tailPropertyLabel && !app.repository.get(v.tailPropertyLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.tailMultiplicityLabel && !app.repository.get(v.tailMultiplicityLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.tailQualifiersCompartment && !app.repository.get(v.tailQualifiersCompartment._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.headRoleNameLabel && !app.repository.get(v.headRoleNameLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.headPropertyLabel && !app.repository.get(v.headPropertyLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.headMultiplicityLabel && !app.repository.get(v.headMultiplicityLabel._id)) {
          diagram.removeOwnedView(v)
        }
        if (v.headQualifiersCompartment && !app.repository.get(v.headQualifiersCompartment._id)) {
          diagram.removeOwnedView(v)
        }
      })
    }
  }

  /**
   * Setup UI.
   *
   * @private
   */
  _setupUI () {
    // 다이어그램 편집기 설정하기.
    this.diagramEditor = new DiagramEditor({ canvasId: 'diagram-canvas' })
    this.hiddenEditor = new DiagramEditor({ canvasId: 'hidden-canvas' })
    this.$diagramArea = $('#diagram-area')

    this.diagramEditor.on('mouseDown', (mouseEvent) => {
      this.emit('mouseDown', mouseEvent)
    })
    this.diagramEditor.on('selectionChanged', (views) => {
      $('#diagram-canvas').focus()
      this._triggerSelectionChangedEvent(views)
    })
    this.diagramEditor.on('viewDoubleClicked', (view, x, y) => {
      this._triggerDoubleClickedEvent(view, x, y)
    })
    this.diagramEditor.on('viewMoved', (views, dx, dy) => {
      this._triggerViewMovedEvent(views, dx, dy)
    })
    this.diagramEditor.on('parasiticViewMoved', (view, alpha, distance) => {
      this.emit('parasiticViewMoved', view, alpha, distance)
    })
    this.diagramEditor.on('containerViewChanged', (views, dx, dy, containerView) => {
      this.emit('containerViewChanged', views, dx, dy, containerView)
    })
    this.diagramEditor.on('nodeResized', (node, left, top, right, bottom) => {
      this.emit('nodeResized', node, left, top, right, bottom)
    })
    this.diagramEditor.on('edgeModified', (edge, points) => {
      this.emit('edgeModified', edge, points)
    })
    this.diagramEditor.on('edgeReconnected', (edge, points, newParticipant, isTailSide) => {
      this.emit('edgeReconnected', edge, points, newParticipant, isTailSide)
    })
    this.diagramEditor.on('zoom', (scale) => {
      this.emit('zoom', scale)
    })
  }

  _setupKeyBindings () {
    $('#diagram-canvas').keydown(e => {
      var dx, dy
      switch (e.which) {
      case keycode('backspace'):
      case keycode('delete'):
        app.commands.execute('edit:delete')
        break
      case keycode('+'):
        if (e.ctrlKey || e.metaKey) {
        }
        break
      case keycode('-'):
        if (e.ctrlKey || e.metaKey) {
        }
        break
      case keycode('return'):
        if (this.diagramEditor && this.diagramEditor.diagram && this.diagramEditor.diagram.selectedViews.length > 0) {
          var v = this.diagramEditor.diagram.selectedViews[0]
          if (v instanceof type.NodeView) {
            this._triggerDoubleClickedEvent(v, v.left, v.top)
          } else if (v instanceof type.EdgeView) {
            this._triggerDoubleClickedEvent(v)
          }
        }
        break
      case keycode('tab'):
        if (this.diagramEditor && this.diagramEditor.diagram) {
          var idx = _.indexOf(this.diagramEditor.diagram.ownedViews, this.diagramEditor.diagram.selectedViews[0])
          if (idx > -1 && idx < this.diagramEditor.diagram.ownedViews.length - 1) {
            this.diagramEditor.diagram.selectedViews = [this.diagramEditor.diagram.ownedViews[idx + 1]]
            this._triggerSelectionChangedEvent([this.diagramEditor.diagram.ownedViews[idx + 1]])
            this.repaint()
          } else {
            this.diagramEditor.diagram.selectedViews = [this.diagramEditor.diagram.ownedViews[0]]
            this._triggerSelectionChangedEvent([this.diagramEditor.diagram.ownedViews[0]])
            this.repaint()
          }
        }
        e.preventDefault()
        break
      case keycode('up'):
        if (e.ctrlKey || e.metaKey) {
          if (this.diagramEditor && this.diagramEditor.diagram && this.diagramEditor.diagram.selectedViews.length > 0) {
            dy = this.diagramEditor.canvas.gridFactor.height
            this._triggerViewMovedEvent(this.diagramEditor.diagram.selectedViews, 0, e.altKey ? -1 : -dy)
            e.preventDefault()
          }
        }
        break
      case keycode('down'):
        if (e.ctrlKey || e.metaKey) {
          if (this.diagramEditor && this.diagramEditor.diagram && this.diagramEditor.diagram.selectedViews.length > 0) {
            dy = this.diagramEditor.canvas.gridFactor.height
            this._triggerViewMovedEvent(this.diagramEditor.diagram.selectedViews, 0, e.altKey ? 1 : dy)
            e.preventDefault()
          }
        }
        break
      case keycode('left'):
        if (e.ctrlKey || e.metaKey) {
          if (this.diagramEditor && this.diagramEditor.diagram && this.diagramEditor.diagram.selectedViews.length > 0) {
            dx = this.diagramEditor.canvas.gridFactor.width
            this._triggerViewMovedEvent(this.diagramEditor.diagram.selectedViews, e.altKey ? -1 : -dx, 0)
            e.preventDefault()
          }
        }
        break
      case keycode('right'):
        if (e.ctrlKey || e.metaKey) {
          if (this.diagramEditor && this.diagramEditor.diagram && this.diagramEditor.diagram.selectedViews.length > 0) {
            dx = this.diagramEditor.canvas.gridFactor.width
            this._triggerViewMovedEvent(this.diagramEditor.diagram.selectedViews, e.altKey ? 1 : dx, 0)
            e.preventDefault()
          }
        }
        break
      }
    })
  }

  _setupPreferences () {
    app.preferences.on('change', (key, value) => {
      try {
        if (key === 'diagramEditor.showGrid') {
          this.diagramEditor.showGrid = value
          // TODO app.commands.get(Commands.VIEW_SHOW_GRID).setChecked(isGridVisible());
          this.repaint()
        }
        if (key === 'diagramEditor.gridSize') {
          this.diagramEditor.gridSize = value
          this.diagramEditor.setGridFactor(value, value)
          this.repaint()
        }
      } catch (err) {
        console.error(err)
      }
    })

    // read showGird
    this.diagramEditor.showGrid = app.preferences.get('diagramEditor.showGrid')
    // TODO app.commands.get(Commands.VIEW_SHOW_GRID).setChecked(isGridVisible());

    // read gridSize
    var gridSize = app.preferences.get('diagramEditor.gridSize')
    this.diagramEditor.gridSize = gridSize
    this.diagramEditor.setGridFactor(gridSize, gridSize)

    // read snapToGrid
    this.diagramEditor.snapToGrid = app.preferences.get('diagramEditor.snapToGrid')
  }

  /**
   * @name currentDiagramChanged
   * @kind event
   * @memberof DiagramManager
   * @property {Diagram} diagram
   */
  _currentDiagramChangedEvent (diagram) {
    this.emit('currentDiagramChanged', diagram, this.diagramEditor)
  }

  _triggerSelectionChangedEvent (views) {
    this.emit('selectionChanged', views)
  }

  _triggerDoubleClickedEvent (view, x, y) {
    this.emit('viewDoubleClicked', view, x, y)
  }

  _triggerViewMovedEvent (views, dx, dy) {
    this.emit('viewMoved', views, dx, dy)
  }

  htmlReady () {
    this._setupUI()
    this._setupKeyBindings()
    this.setCurrentDiagram(null)
  }

  appReady () {
    this._setupPreferences()
  }

}

module.exports = DiagramManager
