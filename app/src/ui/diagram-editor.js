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

const {EventEmitter} = require('events')
const _ = require('lodash')
const configUtils = require('../utils/config-utils')

const {
  Point,
  Rect,
  Color,
  ZoomFactor,
  GridFactor,
  Points,
  Coord,
  Canvas,
  GraphicUtils
} = require('../core/graphics')

const {
  NodeView,
  EdgeView,
  ParasiticView,
  NodeParasiticView,
  EdgeParasiticView
} = require('../core/core')

const configJson = configUtils.getConfigJson()
const MAX_DIAGRAM_CANVAS_WIDTH = typeof configJson.diagramCanvasWidth === 'number' ? configJson.diagramCanvasWidth : 4000
const MAX_DIAGRAM_CANVAS_HEIGHT = typeof configJson.diagramCanvasHeight === 'number' ? configJson.diagramCanvasHeight : 3000

// Reduce max-size of canvas (to avoid crashes in Windows)
var ratio = window.devicePixelRatio || 1
var DEFAULT_CANVAS_WIDTH = Math.floor(MAX_DIAGRAM_CANVAS_WIDTH * (1 / ratio))
var DEFAULT_CANVAS_HEIGHT = Math.floor(MAX_DIAGRAM_CANVAS_HEIGHT * (1 / ratio))

/* Cursor Constants */
const CURSOR_DEFAULT = 'default'
// const CURSOR_CROSSHAIR = 'crosshair'
// const CURSOR_TEXT = 'text'
// const CURSOR_WAIT = 'wait'
// const CURSOR_SW_RESIZE = 'sw-resize'
// const CURSOR_SE_RESIZE = 'se-resize'
// const CURSOR_NW_RESIZE = 'nw-resize'
// const CURSOR_NE_RESIZE = 'ne-resize'
// const CURSOR_N_RESIZE = 'n-resize'
// const CURSOR_S_RESIZE = 's-resize'
// const CURSOR_W_RESIZE = 'w-resize'
// const CURSOR_E_RESIZE = 'e-resize'
const CURSOR_NESW_RESIZE = 'nesw-resize'
const CURSOR_NWSE_RESIZE = 'nwse-resize'
const CURSOR_NS_RESIZE = 'ns-resize'
const CURSOR_EW_RESIZE = 'ew-resize'
const CURSOR_HAND = 'pointer'
const CURSOR_MOVE = 'move'

/* Mouse Button Constants */
const MOUSE_BUTTON1 = 0
// const MOUSE_BUTTON2 = 1
const MOUSE_BUTTON3 = 2

/**
 * MouseEvent
 * @private
 */
class MouseEvent {

  constructor (x, y, button, count, shiftDown, altDown, ctrlDown) {
    this.x = x
    this.y = y
    this.button = button
    this.count = count
    this.shiftDown = shiftDown
    this.altDown = altDown
    this.ctrlDown = ctrlDown
    this.leftButtonDown = false
  }
}

/**
 * Handler
 * @private
 */
class Handler {

  constructor () {
    this.handlerName = null
    this.containerView = null
  }

  /**
   * mouseDown
   * @abstract
   * @param {Editor} editor
   * @param {Canvas} canvas
   * @param {Event} e
   */
  mouseDown (editor, canvas, e) {}

  /**
   * mouseUp
   * @abstract
   * @param {Editor} editor
   * @param {Canvas} canvas
   * @param {Event} e
   */
  mouseUp (editor, canvas, e) {}

  /**
   * mouseUp
   * @abstract
   * @param {Editor} editor
   * @param {Canvas} canvas
   * @param {Event} e
   */
  mouseMove (editor, canvas, e) {}
}

/**
 * ManipulatorBinder
 * @private
 */
class ManipulatorBinder {

  constructor (selectHandler) {
    this.nodeManipulator = new NodeManipulator()
    this.edgeManipulator = new EdgeManipulator()
    this.parasiticManipulator = new ParasiticManipulator()
  }

  /**
   * bind
   */
  bind (view) {
    if (view instanceof ParasiticView) {
      return this.parasiticManipulator
    } else if (view instanceof NodeView) {
      return this.nodeManipulator
    } else if (view instanceof EdgeView) {
      return this.edgeManipulator
    }
    return null
  }

}

/**
 * ManipulatableNotifier
 * @private
 */
class ManipulatableNotifier {

  mouseMove (editor, canvas, e) {
    if (editor.diagram.selectedViews.length !== 1) {
      editor.setCursor(CURSOR_DEFAULT)
      return
    }
    var z = new Point(e.x, e.y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    var v = editor.diagram.selectedViews[0]
    var p = new Point(e.x, e.y)

    if (v instanceof NodeView) {
      var zr = v.getBoundingBox(canvas)
      Coord.coordTransform2(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, zr)
      var mx = (zr.x1 + zr.x2) / 2
      var my = (zr.y1 + zr.y2) / 2
      var b = true
      var selectionType = GraphicUtils.CT_ELSE
      if ((v.sizable === NodeView.SZ_NONE) || (v.autoResize === true)) {
        selectionType = GraphicUtils.CT_ELSE
        b = false
      }
      if ((b === true) && ((v.sizable === NodeView.SZ_FREE) || (v.sizable === NodeView.SZ_RATIO))) {
        if (Coord.equalPt2(new Point(zr.x1 - GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, zr.y1 - GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE), p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
          selectionType = GraphicUtils.CT_LT
          b = false
        } else if (Coord.equalPt2(new Point(zr.x2 + GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, zr.y1 - GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE), p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
          selectionType = GraphicUtils.CT_RT
          b = false
        } else if (Coord.equalPt2(new Point(zr.x1 - GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, zr.y2 + GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE), p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
          selectionType = GraphicUtils.CT_LB
          b = false
        } else if (Coord.equalPt2(new Point(zr.x2 + GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, zr.y2 + GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE), p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
          selectionType = GraphicUtils.CT_RB
          b = false
        }
      }
      if ((b === true) && ((v.sizable === NodeView.SZ_FREE) || (v.sizable === NodeView.SZ_VERT))) {
        if (Coord.equalPt2(new Point(mx, zr.y1 - GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE), p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
          selectionType = GraphicUtils.CT_MT
          b = false
        } else if (Coord.equalPt2(new Point(mx, zr.y2 + GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE), p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
          selectionType = GraphicUtils.CT_MB
          b = false
        }
      }
      if ((b === true) && ((v.sizable === NodeView.SZ_FREE) || (v.sizable === NodeView.SZ_HORZ))) {
        if (Coord.equalPt2(new Point(zr.x1 - GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, my), p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
          selectionType = GraphicUtils.CT_LM
          b = false
        } else if (Coord.equalPt2(new Point(zr.x2 + GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, my), p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
          selectionType = GraphicUtils.CT_RM
          b = false
        }
      }
      if (b === true) {
        selectionType = GraphicUtils.CT_ELSE
      }
      switch (selectionType) {
      case GraphicUtils.CT_LT:
      case GraphicUtils.CT_RB:
        editor.setCursor(CURSOR_NWSE_RESIZE)
        break
      case GraphicUtils.CT_RT:
      case GraphicUtils.CT_LB:
        editor.setCursor(CURSOR_NESW_RESIZE)
        break
      case GraphicUtils.CT_MT:
      case GraphicUtils.CT_MB:
        editor.setCursor(CURSOR_NS_RESIZE)
        break
      case GraphicUtils.CT_LM:
      case GraphicUtils.CT_RM:
        editor.setCursor(CURSOR_EW_RESIZE)
        break
      case GraphicUtils.CT_AREA:
        editor.setCursor(CURSOR_MOVE)
        break
      case GraphicUtils.CT_ELSE:
        editor.setCursor(CURSOR_DEFAULT)
        break
      }
    } else if (v instanceof EdgeView) {
      var zp1 = v.points.getPoint(0).copy()
      var zp2 = v.points.getPoint(v.points.count() - 1).copy()
      Coord.coordTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, zp1)
      Coord.coordTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, zp2)
      var inHandle = false
      if (v.points.count() > 2) {
        for (let i = 0; i < v.points.count(); i++) {
          let hp = v.points.getPoint(i).copy()
          Coord.coordTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, hp)
          if (Coord.equalPt2(hp, p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
            inHandle = true
            break
          }
        }
      }
      if (Coord.equalPt2(zp1, p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
        editor.setCursor(CURSOR_HAND)
      } else if (Coord.equalPt2(zp2, p, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE)) {
        editor.setCursor(CURSOR_HAND)
      } else if (inHandle) {
        editor.setCursor(CURSOR_MOVE)
      } else {
        editor.setCursor(CURSOR_DEFAULT)
      }
    }
  }

}

/**
 * ContainmentHandlingProxy
 * @private
 */
class ContainmentHandlingProxy {

  constructor () {
    this.containerView = null
    this.activated = true
  }

  canBeContainedAt (view, targetView) {
    if ((view === null) || (targetView === null) || (view.model === null) || (targetView.model === null)) {
      return false
    }
    return targetView.canContainView(view) && targetView.model.canContain(view.model)
  }

  canBeContainedAt2 (viewSet, targetView) {
    for (var i = 0, len = viewSet.length; i < len; i++) {
      if (!this.canBeContainedAt(viewSet[i], targetView)) {
        return false
      }
    }
    return true
  }

  beginHandling (editor) {
    this.containerView = null
    this.activated = true
  }

  mouseMoveHandling (editor, canvas, view, targetView) {
    if ((!this.activated) || (view === null)) {
      return
    }
    if (this.containerView !== null) {
      editor.eraseContainingBox(this.containerView)
    }
    if (targetView === null) {
      this.containerView = null
    } else if (this.canBeContainedAt(view, targetView)) {
      this.containerView = targetView
    } else {
      this.containerView = view.containerView
    }
    if (this.containerView !== null) {
      editor.drawContainingBox(this.containerView)
    }
  }

  mouseMoveHandling2 (editor, canvas, viewSet, targetView) {
    if ((!this.activated) || (viewSet.length === 0)) {
      return
    }
    if (this.containerView !== null) {
      editor.eraseContainingBox(this.containerView)
    }
    if (this.targetView === null) {
      this.containerView = null
    } else if (this.canBeContainedAt2(viewSet, targetView)) {
      this.containerView = targetView
    } else {
      this.containerView = viewSet[0].containerView
    }
    if (this.containerView !== null) {
      editor.drawContainingBox(this.containerView)
    }
  }

  mouseUpHandling (editor, canvas) {
    if (!this.activated) {
      return
    }
    if (this.containerView !== null) {
      editor.eraseContainingBox(this.containerView)
    }
  }

  endHandling (editor) {
    this.activated = false
    this.containerView = null
  }

}

// SelectHandler Constants
const SM_NONE = 0
const SM_SELECT_AREA = 1
const SM_INDIVIDUAL = 2
const SM_ADDITIONAL = 3
const SM_GROUPING = 4

/**
 * SelectHandler
 * @private
 */
class SelectHandler extends Handler {

  constructor () {
    super()
    this.mode = SM_NONE
    this.f1 = new Point(0, 0)
    this.f2 = new Point(0, 0)
    this.g1 = new Point(0, 0)
    this.g2 = new Point(0, 0)
    this.manipulatorBinder = new ManipulatorBinder(this)
    this.manipulatableNotifier = new ManipulatableNotifier()
    this.manipulator = null
    this.dragged = false
    this.doubleClicked = false
    this.boundingBox = new Rect(0, 0, 0, 0)
    this.view = null
  }

  /**
   * hasTheSameContainerView
   */
  hasTheSameContainerView (viewSet) {
    if (viewSet.length > 1) {
      var c = viewSet[0].containerView
      for (var i = 1, len = viewSet.length; i < len; i++) {
        if (viewSet[i].containerView !== c) {
          return false
        }
      }
    }
    return true
  }

  /**
   * isPointInSelectionLine
   */
  isPointInSelectionLine (canvas, view, x, y) {
    if (view === null) {
      return false
    }
    if (!view.selected) {
      return false
    }
    var z = new Point(x, y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    if ((view instanceof NodeView) && (view.sizable !== NodeView.SZ_NONE)) {
      var zr = view.getBoundingBox(canvas)
      Coord.coordTransform2(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, zr)
      if ((!Coord.ptInRect(x, y, zr)) && view.containsPoint(canvas, z.x, z.y)) {
        return true
      }
    } else if (view instanceof EdgeView) {
      return view.containsPoint(canvas, z.x, z.y)
    }
    return false
  }

  /**
   * mouseDown
   *
   * (Notice) Choice of coordinates in PSelectHandler
   * -------------------------------------------------
   * 1. Seleting behavior
   *    - Zoom only applied coordinate
   *    - Use FX1, FY1, FX2, FY2 variable
   * 2. Moving behavior with multiple selected views
   *    - Zoom and grid applied coordinate
   *    - Use GX1, GY1, GX2, GY2 variable
   * 3. Manipulating bevaior with one selected view
   *    - Propagate coordinate to PManipulator as it is
   *    - Convert in PManipulator or it's subclasses
   *
   * @override
   */
  mouseDown (editor, canvas, e) {
    // ZoomFactor only applied coordinates.
    var x = e.x
    var y = e.y
    var z = new Point(x, y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    // ZoomFactor and GridFactor applied coordinates
    var b = new Point(x, y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, canvas.gridFactor, b)
    this.f1.setPoint2(z)
    this.f2.setPoint2(z)
    this.g1.setPoint2(b)
    this.g2.setPoint2(b)
    this.dragged = false
    this.doubleClicked = false
    if (editor.diagram.selectedViews.length === 1 && this.isPointInSelectionLine(canvas, editor.diagram.selectedViews[0], x, y)) {
      this.view = editor.diagram.selectedViews[0]
    } else {
      this.view = editor.diagram.getViewAt(canvas, z.x, z.y)
    }
    if (e.button === MOUSE_BUTTON1) {
      // Area selection mode
      if (this.view === null) {
        this.mode = SM_SELECT_AREA
        editor.drawRubberband(this.f1.x, this.f1.y, this.f2.x, this.f2.y)
        // Not Area selection mode
      } else {
        // View selection/deselection
        if (e.shiftDown) {
          // Shift + Mouse Left button down
          if (this.view.selected) {
            editor.deselectView(this.view)
          } else {
            editor.selectAdditionalView(this.view)
          }
        } else {
          // Only mouse left button down
          if (!this.view.selected) {
            editor.selectView(this.view)
          }
        }
        // Selected view(s) modifying mode
        if (editor.diagram.selectedViews.length > 0 && e.shiftDown) {
          this.mode = SM_ADDITIONAL
        } else if (editor.diagram.selectedViews.length === 1) {
          // One view selected
          this.mode = SM_INDIVIDUAL
          if (e.count === 2) {
            this.doubleClicked = true
          }
          this.manipulator = this.manipulatorBinder.bind(this.view)
          // propagate mouse down event to suitable manipulator
          if (this.manipulator !== null) {
            this.manipulator.mouseDown(editor, canvas, this.view, e)
          }
          // Intermin code (Refactoring needed)
          if (this.manipulator instanceof NodeManipulator) {
            if (this.view.containerChangeable && (this.manipulator.selectedPtType === GraphicUtils.CT_ELSE)) {
              editor.containmentHandlingProxy.beginHandling(editor)
            }
          }
        } else if (editor.diagram.selectedViews.length > 1) {
          this.mode = SM_GROUPING
          // Multiple views selected
          this.boundingBox = editor.diagram.getSelectedBoundingBox(canvas)
          var vs = []
          for (var i = 0, len = editor.diagram.selectedViews.length; i < len; i++) {
            vs.push(editor.diagram.selectedViews[i])
          }
          if (this.hasTheSameContainerView(vs)) {
            editor.containmentHandlingProxy.beginHandling(editor)
          }
        } else {
          // no selected view
          this.mode = SM_NONE
        }
      }
    } else if (e.button === MOUSE_BUTTON3) {
      if (this.view === null) {
        editor.diagram.deselectAll()
        editor.selectArea(this.f1.x, this.f1.y, this.f2.x, this.f2.y)
      } else if (!this.view.selected) {
        editor.selectView(this.view)
      }
      this.mode = SM_NONE
    }
    if (this.containerView !== null) { this.containerView = null }
  }

  /**
   * @override
   */
  mouseMove (editor, canvas, e) {
    var b, dx, dy, x, y, z, v
    // if not mouse left button downed then exit

    if (e.leftButtonDown !== true) {
      this.manipulatableNotifier.mouseMove(editor, canvas, e)
      return
    }

    // ZoomFactor only applied coordinates
    x = e.x
    y = e.y
    z = new Point(x, y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    // ZoomFactor and GridFactor applied coordinates
    b = new Point(x, y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, canvas.gridFactor, b)

    // Area selected mode
    if (this.mode === SM_SELECT_AREA) {
      // Erase exist bounding box
      editor.eraseRubberband(this.f1.x, this.f1.y, this.f2.x, this.f2.y)
      this.f2.setPoint2(z)
      // Correct selection area not to stray from canvas
      if (this.f2.x < 0) {
        this.f2.x = 0.0
      }
      if (this.f2.x > editor.diagramWidth) {
        this.f2.x = editor.diagramWidth
      }
      if (this.f2.y < 0) {
        this.f2.y = 0.0
      }
      if (this.f2.y > editor.diagramHeight) {
        this.f2.x = editor.diagramHeight
      }
      // Draw new bounding box
      editor.drawRubberband(this.f1.x, this.f1.y, this.f2.x, this.f2.y)
    } else {
      // Multiple views selected mode
      if (this.mode === SM_GROUPING) {
        // View at (z.x, z.y) should be included to make backup for rubberbands
        // Rubberband를 그리기 전에 Backup이 결정되므로, 반드시 manipulator.moveMove가 호출되기 전에
        // Backup View들이 결정되어야만 한다.
        v = editor.diagram.getViewAt(canvas, z.x, z.y)
        if (v !== null) {
          editor.addBackupView(v)
        }

        dx = b.x - this.g2.x
        dy = b.y - this.g2.y
        this.g2.setPoint2(b)
        if (this.dragged) {
          // Erase existing bounding box
          editor.eraseRubberband(this.boundingBox.x1, this.boundingBox.y1, this.boundingBox.x2, this.boundingBox.y2)
        } else {
          // at starting of drag
          this.dragged = true
        }
        // Move bounding box and draw it
        this.boundingBox.x1 = this.boundingBox.x1 + dx
        this.boundingBox.y1 = this.boundingBox.y1 + dy
        this.boundingBox.x2 = this.boundingBox.x2 + dx
        this.boundingBox.y2 = this.boundingBox.y2 + dy

        // Correct bounding box not to stray from canvas
        if (this.boundingBox.x1 < 0) {
          this.g2.x = b.x - this.boundingBox.x1
          this.boundingBox.x2 = this.boundingBox.x2 - this.boundingBox.x1
          this.boundingBox.x1 = 0
        }
        if (this.boundingBox.x2 > editor.diagramWidth) {
          this.g2.x = this.b.x - (this.boundingBox.x2 - editor.diagramWidth)
          this.boundingBox.x1 = editor.diagramWidth - (this.boundingBox.x2 - this.boundingBox.x1)
          this.boundingBox.x2 = editor.diagramWidth
        }
        if (this.boundingBox.y1 < 0) {
          this.g2.y = b.y - this.boundingBox.y1
          this.boundingBox.y2 = this.boundingBox.y2 - this.boundingBox.y1
          this.boundingBox.y1 = 0
        }
        if (this.boundingBox.y2 > editor.diagramHeight) {
          this.g2.y = b.y - (this.boundingBox.y2 - editor.diagramHeight)
          this.boundingBox.y1 = editor.diagramHeight - (this.boundingBox.y2 - this.boundingBox.y1)
          this.boundingBox.y2 = editor.diagramHeight
        }
        editor.drawRubberband(this.boundingBox.x1, this.boundingBox.y1, this.boundingBox.x2, this.boundingBox.y2)

        // Test containment relation (Refactoring needed)
        var vs = []
        for (var i = 0, len = editor.diagram.selectedViews.length; i < len; i++) {
          vs.push(editor.diagram.selectedViews[i])
        }
        editor.containmentHandlingProxy.mouseMoveHandling2(editor, canvas, vs, v)

        // Single view selected mode
      } else if (this.mode === SM_INDIVIDUAL) {
        // View at (z.x, z.y) should be included to make backup for rubberbands
        // Rubberband를 그리기 전에 Backup이 결정되므로, 반드시 manipulator.moveMove가 호출되기 전에
        // Backup View들이 결정되어야만 한다.
        v = editor.diagram.getViewAt(canvas, z.x, z.y)
        if (v !== null) {
          editor.addBackupView(v)
        }

        // propagate mouse move event to suitable manipulator
        // [Notice] Each manipulator must translate coordinates.
        if (this.manipulator !== null) {
          this.manipulator.mouseMove(editor, canvas, this.view, e)
        }

        // Test containment relation (Refactoring needed)
        if (this.manipulator instanceof NodeManipulator) {
          if (this.view.containerChangeable && (this.manipulator.selectedPtType === GraphicUtils.CT_ELSE) && ((this.manipulator.f1.x !== this.manipulator.f2.x) || (this.manipulator.f1.y !== this.manipulator.f2.y))) {
            editor.containmentHandlingProxy.mouseMoveHandling(editor, canvas, this.view, v)
          }
        }
      }
    }
  }

  /**
   * @override
   */
  mouseUp (editor, canvas, e) {
    var z = new Point(e.x, e.y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    // Area selected mode
    if (this.mode === SM_SELECT_AREA) {
      // Erase existing bounding box
      editor.eraseRubberband(this.f1.x, this.f1.y, this.f2.x, this.f2.y)
      Coord.normalizeRect2(this.f1, this.f2)
      if (!e.shiftDown) { editor.diagram.deselectAll() }
      editor.selectArea(this.f1.x, this.f1.y, this.f2.x, this.f2.y)
      // Multiple views selected mode
    } else if (this.mode === SM_GROUPING) {
      if (this.dragged) {
        // Erase existing bounding box
        editor.eraseRubberband(this.boundingBox.x1, this.boundingBox.y1, this.boundingBox.x2, this.boundingBox.y2)
      } else if (!e.shiftDown) {
        editor.selectView(this.view)
      }
      editor.containmentHandlingProxy.mouseUpHandling(editor, canvas)
      // Selected views moved
      if (this.g2.x !== this.g1.x || this.g2.y !== this.g1.y) {
        if (editor.containmentHandlingProxy.activated && editor.diagram.selectedViews[0].containerView !== editor.containmentHandlingProxy.containerView) {
          editor.changeSelectedViewsContainer(this.g2.x - this.g1.x, this.g2.y - this.g1.y, editor.containmentHandlingProxy.containerView)
        } else {
          editor.moveSelectedViews(this.g2.x - this.g1.x, this.g2.y - this.g1.y)
        }
      }
      editor.containmentHandlingProxy.endHandling(editor)
      // Single view selected mode
    } else if (this.mode === SM_INDIVIDUAL) {
      // Test containment relation (Refactoring needed)
      if (this.manipulator instanceof NodeManipulator) {
        if (this.manipulator.selectedPtType === GraphicUtils.CT_ELSE) {
          editor.containmentHandlingProxy.mouseUpHandling(editor, canvas)
        }
      }

      // Propagate mouse up event to suitable manipulator
      if (this.manipulator !== null) {
        this.manipulator.mouseUp(editor, canvas, this.view, e)
      }
      if (editor.containmentHandlingProxy.activated) {
        editor.containmentHandlingProxy.endHandling(editor)
      }
      if (this.doubleClicked) {
        // CAUTION! This event is not occurred. double click event is triggered by canvas.
        editor.viewDoubleClicked(this.view, z.x, z.y)
      }
      this.doubleClicked = false
    }
    editor.clearBackupViews()
    this.mode = SM_NONE
  }

}

/**
 * CreateHandler
 * @private
 */
class CreateHandler extends Handler {

  constructor (id, skeletonKind, callback) {
    super()
    this.id = id
    this.skeletonKind = skeletonKind
    this.callback = callback
    this.leftPressed = false
    this.f1 = new Point(0, 0)
    this.f2 = new Point(0, 0)
  }

  /**
   * @override
   */
  mouseDown (editor, canvas, e) {
    if (e.button === MOUSE_BUTTON1) {
      this.leftPressed = true
      var b = new Point(e.x, e.y)
      Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, canvas.gridFactor, b)
      this.f1.setPoint2(b)
      this.f2.setPoint2(b)
      editor.drawRubberband(this.f1.x, this.f1.y, this.f2.x, this.f2.y, this.skeletonKind, true)
    }
  }

  /**
   * @override
   */
  mouseMove (editor, canvas, e) {
    var z = new Point(e.x, e.y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    var b = new Point(e.x, e.y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, canvas.gridFactor, b)
    if (this.leftPressed) {
      editor.eraseRubberband(this.f1.x, this.f1.y, this.f2.x, this.f2.y, this.skeletonKind, true)
      switch (this.skeletonKind) {
      case 'rect':
        this.f2.setPoint2(b)
        break
      case 'line':
        this.f2.setPoint2(z)
        break
      case 'point':
        this.f2.setPoint2(z)
      }
      if (this.f2.x < 0) {
        this.f2.x = 0
      }
      if (this.f2.x > editor.diagramWidth) {
        this.f2.x = editor.diagramWidth
      }
      if (this.f2.y < 0) {
        this.f2.y = 0
      }
      if (this.f2.y > editor.diagramHeight) {
        this.f2.y = editor.diagramHeight
      }
      editor.drawRubberband(this.f1.x, this.f1.y, this.f2.x, this.f2.y, this.skeletonKind, true)
    }
  }

  /**
   * @override
   */
  mouseUp (editor, canvas, e) {
    if (e.button === MOUSE_BUTTON1) {
      this.leftPressed = false
      editor.eraseRubberband(this.f1.x, this.f1.y, this.f2.x, this.f2.y, this.skeletonKind, true)
      if (this.callback !== null) {
        this.callback(this.id, editor, this.f1.x, this.f1.y, this.f2.x, this.f2.y)
      }
    }
  }

}

/**
 * Manipulator
 * @private
 */
class Manipulator {

  constructor () {
    this.dragged = false
    this.f1 = null
    this.f2 = null
  }

  /** @abstract */
  beginManipulate (editor, canvas, view, x, y) {}

  /** @abstract */
  drawSkeleton (editor, canvas) {}

  /** @abstract */
  eraseSkeleton (editor, canvas) {}

  /** @abstract */
  moveSkeleton (editor, canvas, view, delta) {}

  /** @abstract */
  endManipulate (editor, canvas, view, dx, dy) {}

  mouseDown (editor, canvas, view, e) {
    var x, y, z
    x = e.x
    y = e.y
    this.beginManipulate(editor, canvas, view, x, y)
    this.dragged = false
    z = new Point(x, y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    this.f1 = z.copy()
    this.f2 = z.copy()
  }

  mouseUp (editor, canvas, view, e) {
    if (this.dragged) {
      this.eraseSkeleton(editor, canvas)
    }
    this.endManipulate(editor, canvas, view, this.f2.x - this.f1.x, this.f2.y - this.f1.y)
  }

  mouseMove (editor, canvas, view, e) {
    var delta, z
    z = new Point(e.x, e.y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    delta = new Point(z.x - this.f2.x, z.y - this.f2.y)
    if (this.dragged) {
      this.eraseSkeleton(editor, canvas)
    } else {
      if ((delta.x !== 0) || (delta.y !== 0)) {
        this.dragged = true
      }
    }
    this.moveSkeleton(editor, canvas, view, delta)
    this.f2.x = this.f2.x + delta.x
    this.f2.y = this.f2.y + delta.y
    if (this.dragged) {
      this.drawSkeleton(editor, canvas)
    }
  }

}

/**
 * NodeManipulator
 * @private
 */
class NodeManipulator extends Manipulator {

  constructor () {
    super()
    this.minX = 0
    this.minY = 0
    this.movable = NodeView.MM_FREE
    this.sizable = NodeView.SZ_FREE
    this.left = 0
    this.top = 0
    this.right = 0
    this.bottom = 0
    this.minRect = null
    this.originRect = null
    this.ratio = 0
    this.selectedPtType = 0
  }

  gridFitX (canvas, x) {
    return x - (x % canvas.gridFactor.width)
  }

  gridFitY (canvas, y) {
    return y - (y % canvas.gridFactor.height)
  }

  resizeSkeletonLeft (canvas, delta) {
    var _ref
    if ((this.left + delta.x) >= this.minRect.x1) {
      delta.x = this.minRect.x1 - this.left
      this.left = this.minRect.x1
    } else if ((this.originRect.x1 <= (_ref = this.left + delta.x) && _ref <= (this.gridFitX(canvas, this.originRect.x1) + canvas.gridFactor.width))) {
      delta.x = this.originRect.x1 - this.left
      this.left = this.originRect.x1
    } else {
      delta.x = delta.x - ((this.left + delta.x) - this.gridFitX(canvas, this.left + delta.x))
      this.left = this.gridFitX(canvas, this.left + delta.x)
    }
  }

  resizeSkeletonRight (canvas, delta) {
    var _ref
    if ((this.right + delta.x) <= this.minRect.x2 || this.gridFitX(canvas, this.right + delta.x) <= this.minRect.x2) {
      delta.x = this.minRect.x2 - this.right
      this.right = this.minRect.x2
    } else if ((this.originRect.x2 <= (_ref = this.right + delta.x) && _ref <= (this.gridFitX(canvas, this.originRect.x2) + canvas.gridFactor.width))) {
      delta.x = this.originRect.x2 - this.right
      this.right = this.originRect.x2
    } else {
      delta.x = delta.x - ((this.right + delta.x) - this.gridFitX(canvas, this.right + delta.x))
      this.right = this.gridFitX(canvas, this.right + delta.x)
    }
  }

  resizeSkeletonTop (canvas, delta) {
    var _ref
    if ((this.top + delta.y) >= this.minRect.y1) {
      delta.y = this.minRect.y1 - this.top
      this.top = this.minRect.y1
    } else if ((this.originRect.y1 <= (_ref = this.top + delta.y) && _ref <= this.gridFitY(canvas, this.originRect.y1) + canvas.gridFactor.height)) {
      delta.y = this.originRect.y1 - this.top
      this.top = this.originRect.y1
    } else {
      delta.y = delta.y - ((this.top + delta.y) - this.gridFitY(canvas, this.top + delta.y))
      this.top = this.gridFitY(canvas, this.top + delta.y)
    }
  }

  resizeSkeletonBottom (canvas, delta) {
    var _ref
    if ((this.bottom + delta.y) <= this.minRect.y1 || this.gridFitY(canvas, this.bottom + delta.y) <= this.minRect.y2) {
      delta.y = this.minRect.y2 - this.bottom
      this.bottom = this.minRect.y2
    } else if ((this.originRect.y2 <= (_ref = this.bottom + delta.y) && _ref <= this.gridFitY(canvas, this.originRect.y2) + canvas.gridFactor.height)) {
      delta.y = this.originRect.y2 - this.bottom
      this.bottom = this.originRect.y2
    } else {
      delta.y = delta.y - ((this.bottom + delta.y) - this.gridFitY(canvas, this.bottom + delta.y))
      this.bottom = this.gridFitY(canvas, this.bottom + delta.y)
    }
  }

  moveSkeletonHorz (canvas, delta) {
    var _ref
    if ((this.originRect.x1 <= (_ref = this.left + delta.x) && _ref <= this.gridFitX(canvas, this.originRect.x1) + canvas.gridFactor.width)) {
      delta.x = this.originRect.x1 - this.left
      this.left = this.originRect.x1
      this.right = this.originRect.x2
    } else {
      delta.x = delta.x - ((this.left + delta.x) - this.gridFitX(canvas, this.left + delta.x))
      this.left = this.gridFitX(canvas, this.left + delta.x)
      this.right = this.left + (this.originRect.x2 - this.originRect.x1)
    }
  }

  moveSkeletonVert (canvas, delta) {
    var _ref
    if ((this.originRect.y1 <= (_ref = this.top + delta.y) && _ref <= this.gridFitY(canvas, this.originRect.y1) + canvas.gridFactor.height)) {
      delta.y = this.originRect.y1 - this.top
      this.top = this.originRect.y1
      this.bottom = this.originRect.y2
    } else {
      delta.y = delta.y - ((this.top + delta.y) - this.gridFitY(canvas, this.top + delta.y))
      this.top = this.gridFitY(canvas, this.top + delta.y)
      this.bottom = this.top + (this.originRect.y2 - this.originRect.y1)
    }
  }

  restrictNode (rect) {
    if (this.selectedPtType === GraphicUtils.CT_ELSE) {
      if (this.left < rect.x1) {
        this.right = this.right + rect.x1 - this.left
        this.left = rect.x1
      } else if (this.right > rect.x2) {
        this.left = this.left + rect.x2 - this.right
        this.right = rect.x2
      }
      if (this.top < rect.y1) {
        this.bottom = this.bottom + rect.y1 - this.top
        this.top = rect.y1
      } else if (this.bottom > rect.y2) {
        this.top = this.top + rect.y2 - this.bottom
        this.bottom = rect.y2
      }
    } else {
      if (this.left < rect.x1) {
        this.left = rect.x1
      }
      if (this.right > rect.x2) {
        this.right = rect.x2
      }
      if (this.top < rect.y1) {
        this.top = rect.y1
      }
      if (this.bottom > rect.y2) {
        this.bottom = rect.y2
      }
    }
  }

  getPermittedRegion (editor, canvas, view) {
    return new Rect(0, 0, editor.diagramWidth, editor.diagramHeight)
  };

  beginManipulate (editor, canvas, view, x, y) {
    var HHS, /* SW, */ middleX, middleY, p, r, z, zr
    this.minX = view.minWidth
    this.minY = view.minHeight
    if (view.autoResize) {
      this.sizable = NodeView.SZ_NONE
    } else {
      this.sizable = view.sizable
    }
    this.movable = view.movable

    // ZoomFactor only applied coordinates.
    z = new Point(x, y)
    Coord.coordTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)

    r = view.getBoundingBox(canvas)
    this.originRect = r.copy()
    this.left = r.x1
    this.top = r.y1
    this.right = r.x2
    this.bottom = r.y2

    if (this.sizable === NodeView.SZ_RATIO) {
      this.ratio = (r.x2 - r.x1) / (r.y2 - r.y1)
    }

    p = new Point(x, y)
    zr = r.copy()
    Coord.coordTransform2(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, zr)
    middleX = (zr.x1 + zr.x2) / 2
    middleY = (zr.y1 + zr.y2) / 2

    this.selectedPtType = GraphicUtils.CT_ELSE
    /*
    SW = GraphicUtils.DEFAULT_SELECTIONLINE_WIDTH
    if (this.movable !== NodeView.MM_NONE && Coord.ptInRect2(p, new Rect(zr.x1 - SW, zr.y1 - SW, zr.x2 + SW, zr.y2 + SW))) {
        this.selectedPtType = GraphicUtils.CT_AREA
    }
    */
    HHS = GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE
    switch (this.sizable) {
    case NodeView.SZ_NONE:
      this.selectedPtType = GraphicUtils.CT_ELSE
      break
    case NodeView.SZ_FREE:
    case NodeView.SZ_RATIO:
      if (Coord.equalPt2(new Point(zr.x1 - HHS, zr.y1 - HHS), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_LT
      } else if (Coord.equalPt2(new Point(zr.x2 + HHS, zr.y1 - HHS), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_RT
      } else if (Coord.equalPt2(new Point(zr.x1 - HHS, zr.y2 + HHS), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_LB
      } else if (Coord.equalPt2(new Point(zr.x2 + HHS, zr.y2 + HHS), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_RB
      } else if (Coord.equalPt2(new Point(zr.x1 - HHS, middleY), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_LM
      } else if (Coord.equalPt2(new Point(zr.x2 + HHS, middleY), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_RM
      } else if (Coord.equalPt2(new Point(middleX, zr.y1 - HHS), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_MT
      } else if (Coord.equalPt2(new Point(middleX, zr.y2 + HHS), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_MB
      }
      break
    case NodeView.SZ_HORZ:
      if (Coord.equalPt2(new Point(zr.x1 - HHS, middleY), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_LM
      } else if (Coord.equalPt2(new Point(zr.x2 + HHS, middleY), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_RM
      }
      break
    case NodeView.SZ_VERT:
      if (Coord.equalPt2(new Point(middleX, zr.y1 - HHS), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_MT
      } else if (Coord.equalPt2(new Point(middleX, zr.y2 + HHS), p, HHS)) {
        this.selectedPtType = GraphicUtils.CT_MB
      }
    }
    switch (this.selectedPtType) {
    case GraphicUtils.CT_AREA:
      break
    case GraphicUtils.CT_LT:
    case GraphicUtils.CT_MT:
    case GraphicUtils.CT_LM:
      this.minRect = new Rect(this.right - this.minX + 1, this.bottom - this.minY + 1, this.right, this.bottom)
      break
    case GraphicUtils.CT_RB:
    case GraphicUtils.CT_MB:
    case GraphicUtils.CT_RM:
      this.minRect = new Rect(this.left, this.top, this.left + this.minX - 1, this.top + this.minY - 1)
      break
    case GraphicUtils.CT_RT:
      this.minRect = new Rect(this.left, this.bottom - this.minY + 1, this.left + this.minX - 1, this.bottom)
      break
    case GraphicUtils.CT_LB:
      this.minRect = new Rect(this.right - this.minX + 1, this.top, this.right, this.top + this.minY - 1)
    }
    switch (this.selectedPtType) {
    case GraphicUtils.CT_LT:
    case GraphicUtils.CT_RB:
      editor.setCursor(CURSOR_NWSE_RESIZE)
      break
    case GraphicUtils.CT_RT:
    case GraphicUtils.CT_LB:
      editor.setCursor(CURSOR_NESW_RESIZE)
      break
    case GraphicUtils.CT_MT:
    case GraphicUtils.CT_MB:
      editor.setCursor(CURSOR_NS_RESIZE)
      break
    case GraphicUtils.CT_LM:
    case GraphicUtils.CT_RM:
      editor.setCursor(CURSOR_EW_RESIZE)
      break
    case GraphicUtils.CT_AREA:
      editor.setCursor(CURSOR_MOVE)
      break
    case GraphicUtils.CT_ELSE:
      editor.setCursor(CURSOR_DEFAULT)
      break
    }
  }

  drawSkeleton (editor, canvas) {
    if (this.movable !== NodeView.MM_NONE || this.sizable !== NodeView.SZ_NONE) {
      return editor.drawRubberband(this.left, this.top, this.right, this.bottom)
    }
  }

  eraseSkeleton (editor, canvas) {
    if (this.movable !== NodeView.MM_NONE || this.sizable !== NodeView.SZ_NONE) {
      return editor.eraseRubberband(this.left, this.top, this.right, this.bottom)
    }
  }

  moveSkeleton (editor, canvas, view, delta) {
    var horzSizable, vertSizable, _ref, _ref1
    horzSizable = (_ref = this.sizable) === NodeView.SZ_HORZ || _ref === NodeView.SZ_RATIO || _ref === NodeView.SZ_FREE
    vertSizable = (_ref1 = this.sizable) === NodeView.SZ_VERT || _ref1 === NodeView.SZ_RATIO || _ref1 === NodeView.SZ_FREE
    switch (this.selectedPtType) {
    case GraphicUtils.CT_LT:
      if (horzSizable) {
        this.resizeSkeletonLeft(canvas, delta)
      }
      if (vertSizable) {
        this.resizeSkeletonTop(canvas, delta)
      }
      break
    case GraphicUtils.CT_RT:
      if (horzSizable) {
        this.resizeSkeletonRight(canvas, delta)
      }
      if (vertSizable) {
        this.resizeSkeletonTop(canvas, delta)
      }
      break
    case GraphicUtils.CT_LB:
      if (horzSizable) {
        this.resizeSkeletonLeft(canvas, delta)
      }
      if (vertSizable) {
        this.resizeSkeletonBottom(canvas, delta)
      }
      break
    case GraphicUtils.CT_RB:
      if (horzSizable) {
        this.resizeSkeletonRight(canvas, delta)
      }
      if (vertSizable) {
        this.resizeSkeletonBottom(canvas, delta)
      }
      break
    case GraphicUtils.CT_LM:
      if (horzSizable) {
        this.resizeSkeletonLeft(canvas, delta)
      }
      break
    case GraphicUtils.CT_RM:
      if (horzSizable) {
        this.resizeSkeletonRight(canvas, delta)
      }
      break
    case GraphicUtils.CT_MT:
      if (vertSizable) {
        this.resizeSkeletonTop(canvas, delta)
      }
      break
    case GraphicUtils.CT_MB:
      if (vertSizable) {
        this.resizeSkeletonBottom(canvas, delta)
      }
      break
    case GraphicUtils.CT_AREA:
    case GraphicUtils.CT_ELSE:
      switch (this.movable) {
      case NodeView.MM_HORZ:
        this.moveSkeletonHorz(canvas, delta)
        break
      case NodeView.MM_VERT:
        this.moveSkeletonVert(canvas, delta)
        break
      case NodeView.MM_FREE:
        this.moveSkeletonHorz(canvas, delta)
        this.moveSkeletonVert(canvas, delta)
      }
    }
    return this.restrictNode(this.getPermittedRegion(editor, canvas, view))
  }

  endManipulate (editor, canvas, view, dx, dy) {
    if (this.movable !== NodeView.MM_NONE || this.sizable !== NodeView.SZ_NONE) {
      this.restrictNode(this.getPermittedRegion(editor, canvas, view))
      if (this.selectedPtType === GraphicUtils.CT_ELSE || this.selectedPtType === GraphicUtils.CT_AREA) {
        var r = view.getBoundingBox(canvas)
        dx = this.left - r.x1
        dy = this.top - r.y1
        var c = editor.containmentHandlingProxy.containerView
        if (view.containerChangeable && view.containerView !== c) {
          switch (this.movable) {
          case NodeView.MM_HORZ:
            if (dx !== 0) {
              editor.changeViewContainer(view, dx, 0, c)
            }
            break
          case NodeView.MM_VERT:
            if (dy !== 0) {
              editor.changeViewContainer(view, 0, dy, c)
            }
            break
          case NodeView.MM_FREE:
            if (dx !== 0 || dy !== 0) {
              editor.changeViewContainer(view, dx, dy, c)
            }
          }
        } else {
          switch (this.movable) {
          case NodeView.MM_HORZ:
            if (dx !== 0) {
              editor.moveView(view, dx, 0, c)
            }
            break
          case NodeView.MM_VERT:
            if (dy !== 0) {
              editor.moveView(view, 0, dy, c)
            }
            break
          case NodeView.MM_FREE:
            if (dx !== 0 || dy !== 0) {
              editor.moveView(view, dx, dy, c)
            }
          }
        }
      } else {
        editor.resizeNode(view, this.left, this.top, this.right, this.bottom)
      }
    }
    editor.setCursor(CURSOR_DEFAULT)
  }

}

// EdgeManipulator Constants
const SL_TAIL = 0
const SL_HEAD = 1
const SL_LINE = 2

/**
 * EdgeManipulator
 * @private
 */
class EdgeManipulator extends Manipulator {

  constructor () {
    super()
    this.points = new Points()
    this.originPoints = new Points()
    this.style = 0
    this.selectedIndex = 0
    this.edgeSelectLocation = 0
  }

  /**
   * @override
   */
  beginManipulate (editor, canvas, view, x, y) {
    var l, z
    z = new Point(x, y)
    Coord.coordRevTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, z)
    l = view
    this.points.assign(l.points)
    this.style = l.lineStyle
    if (this.style === EdgeView.LS_RECTILINEAR || this.style === EdgeView.LS_ROUNDRECT) {
      this.selectedIndex = l.selectedPoint(canvas, z)
      if (this.selectedIndex === 0) {
        this.edgeSelectLocation = SL_TAIL
      } else if (this.selectedIndex === (this.points.count() - 1)) {
        this.edgeSelectLocation = SL_HEAD
      } else {
        this.edgeSelectLocation = SL_LINE
        if (this.selectedIndex === -1) {
          this.selectedIndex = l.containedIndex(canvas, z)
        }
      }
    } else if (this.style === EdgeView.LS_DIRECT) {
      this.selectedIndex = l.selectedPoint(canvas, z)
      if (this.selectedIndex === 0) {
        this.edgeSelectLocation = SL_TAIL
      } else if (this.selectedIndex === (this.points.count() - 1)) {
        this.edgeSelectLocation = SL_HEAD
      } else {
        this.edgeSelectLocation = SL_LINE
      }
      if (this.edgeSelectLocation === SL_LINE) {
        editor.setCursor(CURSOR_DEFAULT)
      } else {
        editor.setCursor(CURSOR_HAND)
      }
    } else {
      this.selectedIndex = l.selectedPoint(canvas, z)
      if (l.tail && this.selectedIndex !== 0) {
        this.points.setPoint(0, Coord.getCenter(l.tail.getBoundingBox(canvas)))
      }
      if (l.head && this.selectedIndex !== (this.points.count() - 1)) {
        this.points.setPoint(this.points.count() - 1, Coord.getCenter(l.head.getBoundingBox(canvas)))
      }
      if (this.selectedIndex === -1) {
        this.selectedIndex = l.containedIndex(canvas, z)
        this.selectedIndex++
        this.points.insert(this.selectedIndex, z)
      }
      if (this.selectedIndex === 0) {
        this.edgeSelectLocation = SL_TAIL
      } else if (this.selectedIndex === (this.points.count() - 1)) {
        this.edgeSelectLocation = SL_HEAD
      } else {
        this.edgeSelectLocation = SL_LINE
      }
      if (this.edgeSelectLocation === SL_LINE) {
        editor.setCursor(CURSOR_DEFAULT)
      } else {
        editor.setCursor(CURSOR_HAND)
      }
    }
    this.originPoints.assign(this.points)
  }

  /**
   * @override
   */
  endManipulate (editor, canvas, view, dx, dy) {
    if ((dx !== 0) || (dy !== 0)) {
      if (this.style === EdgeView.LS_RECTILINEAR || this.style === EdgeView.LS_ROUNDRECT) {
        this.points.reduceOrthoLine()
      } else {
        this.points.reduceLine()
      }
      if (this.edgeSelectLocation === SL_LINE) {
        editor.modifyEdge(view, this.points)
      } else {
        // edgeSelectLocation == SL_HEAD or SL_TAIL
        var v = null
        if (this.selectedIndex < this.points.count()) {
          v = editor.diagram.getViewAt(canvas, this.points.getPoint(this.selectedIndex).x, this.points.getPoint(this.selectedIndex).y, true)
        }
        if (view instanceof type.FreelineEdgeView) {
          v = null
        }
        var oldPart = null
        if (this.edgeSelectLocation === SL_TAIL) {
          oldPart = view.tail
        } else { // SL_HEAD
          oldPart = view.head
        }
        if (v !== null) {
          if (v === oldPart) {
            editor.modifyEdge(view, this.points)
          } else {
            editor.reconnectEdge(view, this.points, v, this.edgeSelectLocation === SL_TAIL)
          }
        } else {
          editor.modifyEdge(view, this.points)
        }
      }
    }
    return editor.setCursor(CURSOR_DEFAULT)
  }

  /**
   * Fit x coordinate to grid
   * @param {Canvas} canvas
   * @param {number} y
   */
  gridFitX (canvas, x) {
    return x - (x % canvas.gridFactor.width)
  }

  /**
   * Fit y coordinate to grid
   * @param {Canvas} canvas
   * @param {number} y
   */
  gridFitY (canvas, y) {
    return y - (y % canvas.gridFactor.height)
  }

  /**
   * Put point bounds on canvas
   * @param {Editor} editor
   * @param {Point} p
   */
  putPointBoundsOnCanvas (editor, p) {
    if (p.x < 0) {
      p.x = 0
    } else if (p.x > editor.diagramWidth) {
      p.x = editor.diagramWidth
    }
    if (p.y < 0) {
      p.y = 0
    } else if (p.y > editor.diagramHeight) {
      p.y = editor.diagramHeight
    }
  }

  /**
   * @param {Editor} editor
   * @param {Canvas} canvas
   * @param {View} view
   * @param {number} delta
   * @override
   */
  moveSkeleton (editor, canvas, view, delta) {
    var op, op1, op2, p, p1, p2, /* _ref, _ref1, */ _ref2, _ref3, _ref4, _ref5
    if (this.style === EdgeView.LS_RECTILINEAR || this.style === EdgeView.LS_ROUNDRECT) {
      // Get points at end of the selected line
      p1 = this.points.getPoint(this.selectedIndex).copy()
      if (this.edgeSelectLocation === SL_HEAD) {
        p2 = this.points.getPoint(this.selectedIndex - 1).copy()
      } else {
        p2 = this.points.getPoint(this.selectedIndex + 1).copy()
      }
      op1 = this.originPoints.getPoint(this.selectedIndex).copy()
      if (this.edgeSelectLocation === SL_HEAD) {
        op2 = this.originPoints.getPoint(this.selectedIndex - 1).copy()
      } else {
        op2 = this.originPoints.getPoint(this.selectedIndex + 1).copy()
      }

      // if move front-end or rear-end point
      if (this.edgeSelectLocation === SL_TAIL || this.edgeSelectLocation === SL_HEAD) {
        if ((p1.x + delta.x >= op1.x) && (p1.x + delta.x <= this.gridFitX(canvas, op1.x) + canvas.gridFactor.width)) {
          delta.x = op1.x - p1.x
          p1.x = op1.x
        } else {
          delta.x = delta.x - ((p1.x + delta.x) - this.gridFitX(canvas, p1.x + delta.x))
          p1.x = this.gridFitX(canvas, p1.x + delta.x)
        }
        if ((p1.y + delta.y >= op1.y) && (p1.y + delta.y <= this.gridFitY(canvas, op1.y) + canvas.gridFactor.height)) {
          delta.y = op1.y - p1.y
          p1.y = op1.y
        } else {
          delta.y = delta.y - ((p1.y + delta.y) - this.gridFitY(canvas, p1.y + delta.y))
          p1.y = this.gridFitY(canvas, p1.y + delta.y)
        }
        if (op1.x === op2.x) {
          p2.x = p1.x
        }
        if (op1.y === op2.y) {
          p2.y = p1.y
        }

        // if move line
      } else {
        // if vertical line selected, move skeleton
        if (p1.x === p2.x) {
          if ((op1.x <= (_ref2 = p1.x + delta.x) && _ref2 <= this.gridFitX(canvas, op1.x) + canvas.gridFactor.width)) {
            delta.x = op1.x - p1.x
            p1.x = op1.x
          } else {
            delta.x = delta.x - ((p1.x + delta.x) - this.gridFitX(canvas, p1.x + delta.x))
            p1.x = this.gridFitX(canvas, p1.x + delta.x)
          }
          p2.x = p1.x

          // if horizontal line selected, move skeleton
        } else if (p1.y === p2.y) {
          if ((op1.y <= (_ref3 = p1.y + delta.y) && _ref3 <= this.gridFitY(canvas, op1.y) + canvas.gridFactor.height)) {
            delta.y = op1.y - p1.y
            p1.y = op1.y
          } else {
            delta.y = delta.y - ((p1.y + delta.y) - this.gridFitY(canvas, p1.y + delta.y))
            p1.y = this.gridFitY(canvas, p1.y + delta.y)
          }
          p2.y = p1.y
        }
      }

      if ((this.edgeSelectLocation === SL_LINE && this.selectedIndex === 0) || (this.edgeSelectLocation === SL_HEAD && this.points.count() === 2)) {
        this.points.insert(0, this.points.getPoint(0).copy())
        this.originPoints.insert(0, this.points.getPoint(0).copy())
        this.selectedIndex++
      } else if ((this.edgeSelectLocation === SL_LINE && this.selectedIndex === (this.points.count() - 2)) || (this.edgeSelectLocation === SL_TAIL && this.points.count() === 2)) {
        this.points.insert(this.selectedIndex + 1, this.points.getPoint(this.selectedIndex + 1).copy())
        this.originPoints.insert(this.selectedIndex + 1, this.points.getPoint(this.selectedIndex + 1).copy())
      }

      // Modify points not to stray from Canvas
      this.putPointBoundsOnCanvas(editor, p1)
      this.putPointBoundsOnCanvas(editor, p2)

      // Re-assign selected points to modified.
      this.points.getPoint(this.selectedIndex).setPoint2(p1)
      if (this.edgeSelectLocation === SL_HEAD) {
        this.points.getPoint(this.selectedIndex - 1).setPoint2(p2)
      } else {
        this.points.getPoint(this.selectedIndex + 1).setPoint2(p2)
      }
    } else { // LS_OBLIQUE
      // Get selected point
      if (this.selectedIndex > -1) {
        p = this.points.getPoint(this.selectedIndex).copy()
        op = this.originPoints.getPoint(this.selectedIndex).copy()

        // Move skeleton
        if ((op.x <= (_ref4 = p.x + delta.x) && _ref4 <= this.gridFitX(canvas, op.x) + canvas.gridFactor.width)) {
          delta.x = op.x - p.x
          p.x = op.x
        } else {
          delta.x = delta.x - ((p.x + delta.x) - this.gridFitX(canvas, p.x + delta.x))
          p.x = this.gridFitX(canvas, p.x + delta.x)
        }
        if ((op.y <= (_ref5 = p.y + delta.y) && _ref5 <= this.gridFitY(canvas, op.y) + canvas.gridFactor.height)) {
          delta.y = op.y - p.y
          p.y = op.y
        } else {
          delta.y = delta.y - ((p.y + delta.y) - this.gridFitY(canvas, p.y + delta.y))
          p.y = this.gridFitY(canvas, p.y + delta.y)
        }

        // Modify point not to stray from Canvas
        this.putPointBoundsOnCanvas(editor, p)

        // Re-assign selected point to modified.
        this.points.setPoint(this.selectedIndex, p)
      }
    }
  }

  /**
   * @override
   */
  drawSkeleton (editor, canvas) {
    return editor.drawRubberlines(this.points)
  }

  /**
   * @override
   */
  eraseSkeleton (editor, canvas) {
    return editor.eraseRubberlines(this.points)
  }
}

/**
 * ParasiticManipulator
 * @private
 */
class ParasiticManipulator extends NodeManipulator {

  /**
   * @override
   */
  endManipulate (editor, canvas, view, dx, dy) {
    var edge, midPointIndex, node, p1, p2
    if (dx === 0 && dy === 0) {
      return
    }
    if (this.selectedPtType === GraphicUtils.CT_ELSE) {
      if (view instanceof NodeParasiticView) {
        node = view.hostNode
        if (node === null) {
          node = view._parent
        }
        p1 = new Point(Math.floor((node.left + node.getRight()) / 2), Math.floor((node.top + node.getBottom()) / 2))
        p2 = p1.copy()
      } else if (view instanceof EdgeParasiticView) {
        edge = view.hostEdge
        if (edge === null) {
          edge = view._parent
        }
        switch (view.edgePosition) {
        case EdgeParasiticView.EP_HEAD:
          p1 = edge.points.getPoint(edge.points.count() - 1).copy()
          p2 = edge.points.getPoint(edge.points.count() - 2).copy()
          break
        case EdgeParasiticView.EP_TAIL:
          p1 = edge.points.getPoint(0).copy()
          p2 = edge.points.getPoint(1).copy()
          break
        case EdgeParasiticView.EP_MIDDLE:
          midPointIndex = Math.floor(edge.points.count() / 2)
          if ((edge.points.count() % 2) === 0) {
            midPointIndex--
          }
          p1 = edge.points.getPoint(midPointIndex).copy()
          p2 = edge.points.getPoint(midPointIndex + 1).copy()
          if ((edge.points.count() % 2) === 0) {
            p1.x = Math.floor((p1.x + p2.x) / 2)
            p1.y = Math.floor((p1.y + p2.y) / 2)
          }
        }
      }
      let pr = new Rect(p1.x, p1.y, p2.x, p2.y)
      let pp = new Point(Math.floor((this.left + this.right) / 2), Math.floor((this.top + this.bottom) / 2))
      let ad = Coord.getPolar(pr, pp)
      if (editor !== null) {
        editor.moveParasiticView(view, ad.alpha, ad.distance)
      }
    } else {
      NodeManipulator.prototype.endManipulate.call(this, editor, canvas, view, dx, dy)
    }
  }

}

/**
 * Diagram Editor
 * @private
 *
 * This class dispatches theses events:
 *     - selectionChanged:      (views)
 *     - mouseDown:
 *     - viewDoubleClicked:     (view, x, y)
 *     - viewMoved:             (views, dx, dy)
 *     - parasiticViewMoved:    (view, alpha, distance)
 *     - containerViewChanged:  (views, dx, dy, containerView)
 *     - nodeResized:           (node, left, top, right, bottom)
 *     - edgeModified:          (edge, points)
 *     - edgeReconnected:       (edge, points, newParticipant, isTailSide)
 *     - scroll                 (dx, dy)
 */
class DiagramEditor extends EventEmitter {

  constructor (config) {
    super()
    var self = this
    this.config = config
    this.canvasId = config.canvasId
    this.canvasElement = document.getElementById(this.canvasId)
    this.canvas = new Canvas()
    this.canvas.context = this.canvasElement.getContext('2d')
    this.canvas.gridFactor = new GridFactor(8.0, 8.0)
    this.canvas.zoomFactor = new ZoomFactor(1.0, 1.0)
    // this.canvasElement.width = DEFAULT_CANVAS_WIDTH
    // this.canvasElement.height = DEFAULT_CANVAS_HEIGHT
    this.gridSize = 8
    this.showGrid = true
    this.__snapToGrid = true
    this.backgroundColor = Color.WHITE
    this.containmentHandlingProxy = new ContainmentHandlingProxy()
    this.diagram = null
    this.backupViews = []
    this.fitSize()

    // To check mouse left button down in mouse move event.
    this.leftButtonDown = false
    this.downX = 0
    this.downY = 0

    this.canvasElement.onmousedown = (e) => {
      if (e.button === 0) self.leftButtonDown = true
      var p = DiagramEditor.getMousePos(self.canvasElement, e)
      var evt = new MouseEvent(p.x, p.y, e.button, 1, e.shiftKey, e.altKey, e.ctrlKey)
      if (e.metaKey || e.ctrlKey) { // viewpoint move
        if (self.leftButtonDown) {
          self.setCursor(CURSOR_MOVE)
          self.downX = e.offsetX
          self.downY = e.offsetY
        }
      } else if (self.activeHandler) {
        self.activeHandler.mouseDown(self, self.canvas, evt)
      }
    }
    this.canvasElement.onmouseup = (e) => {
      if (e.button === 0) self.leftButtonDown = false
      var p = DiagramEditor.getMousePos(self.canvasElement, e)
      var evt = new MouseEvent(p.x, p.y, e.button, 1, e.shiftKey, e.altKey, e.ctrlKey)
      if (e.metaKey || e.ctrlKey) { // viewpoint move
        self.setCursor(CURSOR_DEFAULT)
        self.downX = 0
        self.downY = 0
      } else if (self.activeHandler) {
        self.activeHandler.mouseUp(self, self.canvas, evt)
      }
      self.mouseDown(evt)
    }
    this.canvasElement.onmousemove = (e) => {
      var p = DiagramEditor.getMousePos(self.canvasElement, e)
      var evt = new MouseEvent(p.x, p.y, e.button, 1, e.shiftKey, e.altKey, e.ctrlKey)
      evt.leftButtonDown = self.leftButtonDown
      if (e.metaKey || e.ctrlKey) { // viewpoint move
        if (self.leftButtonDown) {
          let dx = (e.offsetX - self.downX) / self.getZoomScale()
          let dy = (e.offsetY - self.downY) / self.getZoomScale()
          self.moveOrigin(dx, dy)
          self.downX = e.offsetX
          self.downY = e.offsetY
        }
      } else if (self.activeHandler) {
        self.activeHandler.mouseMove(self, self.canvas, evt)
      }
    }
    this.canvasElement.ondblclick = (e) => {
      var p = DiagramEditor.getMousePos(self.canvasElement, e)
      Coord.coordRevTransform(self.canvas.origin, self.canvas.zoomFactor, GridFactor.NO_GRID, p)
      if (self.diagram) {
        var view = self.diagram.getViewAt(self.canvas, p.x, p.y)
        if (view) {
          self.viewDoubleClicked(view, p.x, p.y)
        }
      }
    }
    this.canvasElement.onwheel = (e) => {
      const dx = -e.deltaX
      const dy = -e.deltaY
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (dy < 0) {
          this.setZoomScale(this.canvas.zoomFactor.getScale() - 0.1)
        } else if (dy > 0) {
          this.setZoomScale(this.canvas.zoomFactor.getScale() + 0.1)
        }
      } else {
        this.moveOrigin(dx, dy)
      }
    }
    $(window).resize(() => {
      this.fitSize()
    })
  }

  get snapToGrid () {
    return this.__snapToGrid
  }

  set snapToGrid (value) {
    this.__snapToGrid = value
    if (this.__snapToGrid) {
      this.setGridFactor(this.gridSize, this.gridSize)
    } else {
      this.setGridFactor(1, 1)
    }
  }

  setGridFactor (w, h) {
    this.canvas.gridFactor.width = w
    this.canvas.gridFactor.height = h
  }

  fitSize () {
    const $area = $('#diagram-area')
    const w = $area.width()
    const h = $area.height()
    this.canvasElement.width = w
    this.canvasElement.height = h
    // Setup for High-DPI (Retina) Display
    if (window.devicePixelRatio) {
      this.canvas.ratio = window.devicePixelRatio
      this.canvasElement.width = Math.floor(w * this.canvas.ratio)
      this.canvasElement.height = Math.floor(h * this.canvas.ratio)
      this.canvasElement.style.width = w + 'px'
      this.canvasElement.style.height = h + 'px'
    }
    this.repaint()
  }

  getOrigin () {
    return this.canvas.origin
  }

  setOrigin (x, y) {
    if (x > 0) x = 0
    if (y > 0) y = 0
    this.canvas.origin.setPoint(x, y)
    if (this.diagram) {
      this.diagram._originX = this.canvas.origin.x
      this.diagram._originY = this.canvas.origin.y
    }
    this.repaint()
    this.emit('scroll', x, y)
  }

  moveOrigin (dx, dy) {
    this.setOrigin(this.canvas.origin.x + dx, this.canvas.origin.y + dy)
  }

  setZoomScale (scale) {
    if (scale < 0.1) { scale = 0.1 }
    if (scale > 3) { scale = 3 }
    this.canvas.zoomFactor.setScale(scale)
    this.repaint()
    this.emit('zoom', this.canvas.zoomFactor.getScale())
  }

  getZoomScale () {
    return this.canvas.zoomFactor.getScale()
  }

  static getMousePos (ce, e) {
    var cr = ce.getBoundingClientRect()
    var p = new Point(e.clientX - cr.left, e.clientY - cr.top)
    return p
  }

  setEnabled (enabled) {
    this.canvasElement.style.display = (enabled ? '' : 'none')
  }

  getEnabled () {
    return (this.canvasElement.style.display !== 'none')
  }

  /**
   * 현재 편집중인 다이어그램 리턴
   *
   * @return {Diagram}
   */
  getDiagram () {
    return this.diagram
  }

  /**
   * 다이어그램 편집 영역의 너비를 설정
   *
   * @param {number} width
   */
  setDiagramWidth (width) {
    this.canvasElement.width = width
  }

  /**
   * 다이어그램 편집 영역의 너비를 리턴
   *
   * @return {number}
   */
  getDiagramWidth () {
    return this.canvasElement.width
  }

  /**
   * 다이어그램 편집 영역의 높이를 설정
   *
   * @param {number} height
   */
  setDiagramHeight (height) {
    this.canvasElement.height = height
  }

  /**
   * 다이어그램 편집 영역의 높이를 리턴
   *
   * @return {number}
   */
  getDiagramHeight () {
    return this.canvasElement.height
  }

  /**
   * 줌 팩터를 리턴
   *
   * @return {ZoomFactor}
   */
  getZoomFactor () {
    return this.canvas.zoomFactor
  }

  /**
   * 그리드 팩터를 리턴
   *
   * @return {GridFactor}
   */
  getGridFactor () {
    return this.canvas.gridFactor
  }

  clearBackupViews () {
    this.backupViews = []
  }

  addBackupView (view) {
    if (!_.includes(this.backupViews, view)) {
      this.backupViews.push(view)
    }
  }

  drawBackground (g) {
    g.fillStyle = app.preferences.get('diagramEditor.backgroundColor')
    g.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height)
    if (this.showGrid) {
      // var w = this.canvas.gridFactor.width * 2 * this.canvas.ratio
      // var h = this.canvas.gridFactor.height * 2 * this.canvas.ratio
      var w = this.gridSize * 2 * this.canvas.ratio
      var h = this.gridSize * 2 * this.canvas.ratio
      var wc = Math.floor(this.getDiagramWidth() / w)
      var hc = Math.floor(this.getDiagramHeight() / h)
      var i
      g.strokeStyle = '#f0f0f0'
      g.beginPath()
      for (i = 0; i < wc; i++) {
        g.moveTo(i * w + 0.5, 0)
        g.lineTo(i * w + 0.5, this.canvasElement.height)
      }
      for (i = 0; i < hc; i++) {
        g.moveTo(0, i * h + 0.5)
        g.lineTo(this.canvasElement.width, i * h + 0.5)
      }
      g.stroke()
    }
  }

  drawRubberband (x1, y1, x2, y2, kind, showEnds) {
    if (kind === null) {
      kind = 'rect'
    }
    if (showEnds === null) {
      showEnds = false
    }
    var rect = new Rect(x1, y1, x2, y2)
    Coord.normalizeRect(rect)

    // Backup area should include backup views.
    for (var i = 0, len = this.backupViews.length; i < len; i++) {
      var v = this.backupViews[i]
      var vr = v.getBoundingBox()
      Coord.normalizeRect(vr)
      rect.union(vr)
    }

    rect.expand(20)
    Coord.coordTransform2(this.canvas.origin, this.canvas.zoomFactor, GridFactor.NO_GRID, rect)

    // for Retina
    rect.x1 = rect.x1 * this.canvas.ratio
    rect.y1 = rect.y1 * this.canvas.ratio
    rect.x2 = rect.x2 * this.canvas.ratio
    rect.y2 = rect.y2 * this.canvas.ratio

    GraphicUtils.drawRange(this.canvas, x1, y1, x2, y2, kind, showEnds)
  }

  eraseRubberband (x1, y1, x2, y2, kind, showEnds) {
    if (kind === null) {
      kind = 'rect'
    }
    if (showEnds === null) {
      showEnds = false
    }
    this.repaint()
  }

  drawContainingBox (view) {
    view.drawContainingBox(this.canvas)
  }

  eraseContainingBox (view) {
    view.eraseContainingBox(this.canvas)
  }

  drawRubberlines (points) {
    var rect = points.getBoundingRect()
    Coord.normalizeRect(rect)
    rect.expand(20)
    Coord.coordTransform2(this.canvas.origin, this.canvas.zoomFactor, GridFactor.NO_GRID, rect)

    // for Retina
    rect.x1 = rect.x1 * this.canvas.ratio
    rect.y1 = rect.y1 * this.canvas.ratio
    rect.x2 = rect.x2 * this.canvas.ratio
    rect.y2 = rect.y2 * this.canvas.ratio

    GraphicUtils.drawDottedLine(this.canvas, points)
  }

  eraseRubberlines (points) {
    this.repaint()
  }

  browseDiagram (diagram) {
    this.diagram = diagram
    this.repaint()
  }

  repaint () {
    if (this.diagram) {
      this.drawBackground(this.canvas.context)
      this.diagram.drawDiagram(this.canvas)
    }
  }

  /**
   *
   * @param {string} cursor
   */
  setCursor (cursor) {
    this.canvasElement.style.cursor = cursor
  }

  selectView (view) {
    if (this.diagram) {
      this.diagram.deselectAll()
      this.diagram.selectView(view)
      this.repaint()
      this.emit('selectionChanged', this.diagram.selectedViews)
    }
  };

  deselectView (view) {
    if (this.diagram) {
      this.diagram.deselectView(view)
      this.repaint()
      this.emit('selectionChanged', this.diagram.selectedViews)
    }
  }

  selectAdditionalView (view) {
    if (this.diagram) {
      this.diagram.selectView(view)
      this.repaint()
      this.emit('selectionChanged', this.diagram.selectedViews)
    }
  }

  selectArea (x1, y1, x2, y2) {
    if (this.diagram) {
      this.diagram.selectArea(this.canvas, x1, y1, x2, y2)
      this.repaint()
      this.emit('selectionChanged', this.diagram.selectedViews)
    }
  }

  selectAll () {
    if (this.diagram) {
      this.diagram.selectAll()
      this.repaint()
      this.emit('selectionChanged', this.diagram.selectedViews)
    }
  }

  deselectAll () {
    if (this.diagram) {
      this.diagram.deselectAll()
      this.repaint()
    }
  }

  /**
   * @param {Point} point (x, y) of screen.
   * @return {Point} - point on the canvas
   */
  convertPosition (point) {
    var $canvas = $('#' + this.canvasId)
    var offset = $canvas.offset()
    var p = new Point(point.x - offset.left, point.y - offset.top)
    Coord.coordRevTransform(this.canvas.origin, this.canvas.zoomFactor, GridFactor.NO_GRID, p)
    return p
  }

  mouseDown (event) {
    this.emit('mouseDown', event)
  }

  viewDoubleClicked (view, x, y) {
    this.emit('viewDoubleClicked', view, x, y)
  }

  moveView (view, dx, dy) {
    this.emit('viewMoved', [view], dx, dy)
  }

  moveSelectedViews (dx, dy) {
    this.emit('viewMoved', this.diagram.selectedViews, dx, dy)
  }

  moveParasiticView (view, alpha, distance) {
    this.emit('parasiticViewMoved', view, alpha, distance)
  }

  changeViewContainer (view, dx, dy, containerView) {
    this.emit('containerViewChanged', [view], dx, dy, containerView)
  }

  changeSelectedViewsContainer (dx, dy, containerView) {
    this.emit('containerViewChanged', this.diagram.selectedViews, dx, dy, containerView)
  }

  resizeNode (node, left, top, right, bottom) {
    this.emit('nodeResized', node, left, top, right, bottom)
  }

  modifyEdge (edge, points) {
    this.emit('edgeModified', edge, points)
  }

  reconnectEdge (edge, points, newParticipant, isTailSide) {
    this.emit('edgeReconnected', edge, points, newParticipant, isTailSide)
  }

}

// Define Public API
exports.Handler = Handler
exports.ManipulatorBinder = ManipulatorBinder
exports.ManipulatableNotifier = ManipulatableNotifier
exports.ContainmentHandlingProxy = ContainmentHandlingProxy
exports.SelectHandler = SelectHandler
exports.CreateHandler = CreateHandler
exports.Manipulator = Manipulator
exports.NodeManipulator = NodeManipulator
exports.EdgeManipulator = EdgeManipulator
exports.ParasiticManipulator = ParasiticManipulator
exports.DiagramEditor = DiagramEditor
