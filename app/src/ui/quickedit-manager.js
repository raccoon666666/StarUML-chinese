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
const keycode = require('keycode')
const {Point, Rect, GridFactor, Coord} = require('../core/graphics')
const {EventEmitter} = require('events')

var TEMPLATE_BEGIN = "<div id='quick-edit' class='quick-edit modal instance' style='left: {{left}}px; top: {{top}}px; width: {{width}}px;'>"
var TEMPLATE_END = "<button id='quick-edit-outfocus' style='width: 0; height: 0; opacity: 0'></button></div>"

var TEMPLATE_EDIT =
    "<input type='text' id='quick-edit-{{htmlId}}' class='quick-edit-input quick-edit-hint' style='width: {{width}}px; height: {{height}}px; font-family: {{fontFamily}}; font-size: {{fontSize}}px' value='{{text}}' title='{{hint}}'>"

var TEMPLATE_TEXTAREA =
    "<textarea id='quick-edit-{{htmlId}}' class='quick-edit-textarea quick-edit-hint' style='width: {{width}}px; height: {{height}}px; font-family: {{fontFamily}}; font-size: {{fontSize}}px' title='{{hint}}'>{{text}}</textarea>"

var TEMPLATE_DROPDOWN = `
<button id='quick-edit-{{htmlId}}' title='{{hint}}' class='k-button icon-button small quick-edit-hint' style='position: absolute; top: 0px; left: {{left}}px'><span class='k-sprite'></span></button>
<div style='position: absolute; margin: 0; left: {{left}}px; top: 25px; z-index: 1'>
<ul id='quick-edit-{{htmlId}}-dropdown' class='k-context-menu quick-edit-dropdown' style='width: {{dropdown-width}}px'>
{{#items}}
<li data-data='{{value}}'><span class='k-sprite staruml-icon {{icon}}'></span>{{text}}</li>
{{/items}}
</ul>
</div>`

var TEMPLATE_BUTTON =
    "<button id='quick-edit-{{htmlId}}' class='k-button icon-button small quick-edit-hint' style='position: absolute; top: {{top}}px; left: {{left}}px' title='{{fullHint}}'><span class='k-sprite staruml-icon {{icon}}'></span></button>"

var TEMPLATE_COMBO =
    `<div id='quick-edit-{{htmlId}}-container' class='quick-edit-hint quick-edit-combo' style='position: absolute; left: {{left}}px; top: 0px' title='{{hint}}'>
<label id='quick-edit-{{htmlId}}' class='widget k-combo small' style='width: {{width}}px'>
<input type='text' value='{{text}}'>
<select>
{{#items}}
<option value='{{value}}'>{{text}}</option>
{{/items}}
</select>
</label>
</div>`

const INPUT_WIDTH = 60
const TEXTAREA_WIDTH = 60
const DROPDOWN_WIDTH = 25
const BUTTON_WIDTH = 25
const BUTTON_HEIGHT = 25
const COMBO_WIDTH = 60

/**
 * QuickEdit Manager
 * @private
 */
class QuickeditManager extends EventEmitter {

  constructor () {
    super()

    /**
     * Component definitions
     * @private
     * @type{Map<string,Object>}
     */
    this.components = {}

    /**
     * Quickedit definitions
     * @type {Array<Object>}
     */
    this.quickedits = []

    /**
     * Active Quickedit
     * @type {Object}
     */
    this.activeQuickedit = null

    /**
     * Keymap
     */
    this.keymap = {}

    /**
     * KeydownHook
     */
    this.keydownHook = null

    this.tooltip = null

    this._preventClose = false

    /** A reference to an instance of DiagramManager */
    this.diagramManager = null

    /** A reference to an instance of Engine */
    this.engine = null

    /** A reference to an instance of KeymapManager */
    this.keymapManager = null

    /** A reference to an instance of CommandManager */
    this.commandManager = null
  }

  /**
   * Add a quickedit template
   */
  add (template) {
    let components = template['components']
    components.forEach(comp => {
      if (comp.id) {
        this.components[comp.id] = comp
      } else {
        console.error("Each component in quickedits must have 'id' field.")
      }
    })
    let quickedits = template['quickedits']
    quickedits.forEach(qedit => {
      qedit.components.forEach(comp => {
        _.defaults(comp, this.components[comp.id])
      })
      this.quickedits.push(qedit)
    })
  }

  /**
   * Open a corresponding quickedit for the given view
   *
   * @param {View} view
   * @param {Number} x Double-clicked x position (optional)
   * @param {Number} y Double-clicked y position (optional)
   */
  open (view, x, y) {
    let editor = this.diagramManager.getEditor()
    let canvas = $('#' + editor.canvasId)
    let offset = canvas.offset()
    let position = new Point(offset.left, offset.top)
    let edgeViewEnd = null
    if (view instanceof type.EdgeView && view.model instanceof type.UndirectedRelationship) {
      edgeViewEnd = this.getEdgeViewEnd(view, x, y)
    }
    Coord.coordRevTransform(new Point(0, 0), editor.canvas.zoomFactor, GridFactor.NO_GRID, position)
    this.close()
    for (let i = 0; i < this.quickedits.length; i++) {
      let quickedit = this.quickedits[i]

      // Matching targets
      let targetMatched = false
      // Type and edge-end selector (e.g. 'UMLClassView', 'UMLAssociationView:end1')
      let selector = view.getClassName() + (edgeViewEnd ? ':' + edgeViewEnd : '')
      if (_.includes(quickedit.targets, selector)) {
        targetMatched = true
      }
      // Property selector (e.g. 'UMLAssociationView.headRoleNameLabel')
      if (view instanceof type.ParasiticView) {
        quickedit.targets.forEach(target => {
          if (target.indexOf('.') > -1) {
            let tokens = target.split('.')
            let type = tokens[0].trim()
            let property = tokens[1].trim()
            if (view._parent.getClassName() === type && view._parent[property] === view) {
              view = view._parent
              targetMatched = true
            }
          }
        })
      }

      // Checking target-diagrams
      // - if any of diagram type is not matched, targetMatched is false
      if (quickedit['target-diagrams']) {
        const diagramTypeNames = quickedit['target-diagrams']
        const diagram = view.getDiagram()
        diagramTypeNames.forEach(typeName => {
          if (!(diagram instanceof type[typeName])) {
            targetMatched = false
          }
        })
      }

      // Checking target-tests.
      // - These target-tests are evaluated only if target is matched
      // - If one of the tests are evaluated to false, then targetMatched is false
      if (quickedit['target-tests']) {
        const tests = quickedit['target-tests']
        for (let lexpr in tests) {
          const rexpr = tests[lexpr]
          const leval = _.get(view, lexpr)
          const reval = _.get(view, rexpr)
          if (leval !== reval) {
            targetMatched = false
          }
        }
      }

      if (targetMatched) {
        // Compute area of quickedit
        let area = new Rect(view.left, view.top, view.right, view.bottom)
        if (quickedit.area) {
          area.x1 = _.get(view, quickedit.area.x1) + (quickedit.area['x1-margin'] || 0)
          area.y1 = _.get(view, quickedit.area.y1) + (quickedit.area['y1-margin'] || 0)
          area.x2 = _.get(view, quickedit.area.x2) + (quickedit.area['x2-margin'] || 0)
          area.y2 = _.get(view, quickedit.area.y2) + (quickedit.area['y2-margin'] || 0)
        }
        area.add(position)

        // Popup quickedit
        this.activeQuickedit = quickedit
        this.render(editor, area, view, quickedit)

        // Set initial value
        quickedit.components.forEach(component => {
          const model = component['view-only'] ? view : view.model
          const value = _.get(model, component.property)
          this.setComponentValue(component, value)
        })

        // select text in input field
        $('#quick-edit > input[type=text]').select()
        // Disable Scrolling (scroll disabled in branch:canvas-max)
        // $('#diagram-area').css('overflow', 'hidden')
        // Trigger Event
        this._triggerOpenEvent(editor, view)
        break
      }
    }
  }

  render (editor, rect, view, quickedit) {
    Coord.coordTransform2(editor.canvas.origin, editor.canvas.zoomFactor, GridFactor.NO_GRID, rect)
    // Insert html tags
    let html = Mustache.render(TEMPLATE_BEGIN, {left: rect.x1, top: rect.y1, width: rect.getWidth()})
    let leftx = -2
    let rightx = rect.getWidth() + 3
    let leftSectionX = [leftx, leftx, leftx, leftx, leftx]
    let rightSectionX = [rightx, rightx, rightx, rightx, rightx]
    quickedit.components.forEach(component => {
      component.visible = true
      if (component.visibility) {
        component.visible = _.get(view, component.visibility)
      }
      if (component.visible) {
        let row = (component.row || 1) - 1
        switch (component.section) {
        case 'main':
          component.left = rect.x1
          component.top = rect.y1
          component.width = rect.getWidth()
          component.height = rect.getHeight()
          break
        case 'left':
          component.left = leftSectionX[row] - this.getComponentWidth(component)
          component.top = BUTTON_HEIGHT * row
          component.width = this.getComponentWidth(component)
          component.height = this.getComponentHeight(component)
          leftSectionX[row] = component.left
          break
        case 'right':
          component.left = rightSectionX[row]
          component.top = BUTTON_HEIGHT * row
          component.width = this.getComponentWidth(component)
          component.height = this.getComponentHeight(component)
          rightSectionX[row] = component.left + component.width
          break
        }
        if (component.section) {
          html += this.renderComponent(editor, view, component)
        }
      }
    })
    html += TEMPLATE_END
    $('body').append(html)

    // Bind events
    quickedit.components.forEach(component => {
      this.buildComponent(quickedit, component, view)
      this.bindKey(component, view)
    })

    // Keydown hook
    this.keydownHook = (e) => {
      // default key actions
      switch (e.which) {
      case keycode('return'):
        if (e.shiftKey) {
          // If shift key pressed, do not close.
        } else {
          this.close(true)
        }
        break
      case keycode('esc'):
        this.close()
        break
      case keycode('backspace'):
        e.stopPropagation()
        break
      case keycode('delete'):
        e.stopPropagation()
        break
      case keycode('up'):
      case keycode('down'):
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          e.stopPropagation()
        }
        break
      default:
        // event.stopPropagation();
        break
      }
      let key = this.keymapManager.translateKeyboardEvent(e)
      if (this.keymap[key]) {
        this.keymap[key]()
        return true
      }
    }
    this.keymapManager.addGlobalKeydownHook(this.keydownHook)
  }

  renderComponent (editor, view, component) {
    component.htmlId = this.htmlId(component.id)
    switch (component.type) {
    case 'input':
      component.width = component.width - 9 // padding
      component.height = Math.round(component.height + 6)
      component.fontFamily = view.font.face
      component.fontSize = Coord.valueTransform(editor.canvas.zoomFactor, view.font.size)
      return Mustache.render(TEMPLATE_EDIT, component)
    case 'textarea':
      component.width = component.width - 9 // padding
      component.fontFamily = view.font.face
      component.fontSize = Coord.valueTransform(editor.canvas.zoomFactor, view.font.size)
      return Mustache.render(TEMPLATE_TEXTAREA, component)
    case 'dropdown':
      return Mustache.render(TEMPLATE_DROPDOWN, component)
    case 'button':
      if (component.key) {
        component.fullHint = component.hint + ' (' + this.keymapManager.formatKeyDescriptor(component.key) + ')'
      } else {
        component.fullHint = component.hint
      }
      return Mustache.render(TEMPLATE_BUTTON, component)
    case 'combo':
      return Mustache.render(TEMPLATE_COMBO, component)
    }
  }

  buildComponent (quickedit, component, view) {
    let self = this
    let $input, $textarea, $button, $dropdown, $edit, $select

    switch (component.type) {
    case 'input':
      $input = $('#quick-edit-' + component.htmlId)
      $input.change(function () {
        if (component.command) {
          let newValue = $(this).val()
          let options = {
            value: newValue,
            result: true
          }
          self.executeCommand(component, view, options)
          // Handle feedback result
          if (!options.result) {
            self._preventClose = true
            _.defer(function () {
              $('#quick-edit').effect('shake', { distance: 10 }, function () {
                // when shake animation completed.
                self._preventClose = false
                $input.select()
              })
            })
          } else {
            $input.data('oldValue', newValue)
          }
        }
      })
      $input.focus(function () {
        $input.select()
        self._hideDropdowns(null)
      })
      $input.focus()
      break
    case 'textarea':
      $textarea = $('#quick-edit-' + component.htmlId)
      $textarea.change(function () {
        const options = {
          value: $(this).val()
        }
        self.executeCommand(component, view, options)
      })
      $textarea.focus(function () {
        $textarea.select()
        self._hideDropdowns(null)
      })
      $textarea.focus()
      break
    case 'dropdown':
      $button = $('#quick-edit-' + component.htmlId)
      $dropdown = $('#quick-edit-' + component.htmlId + '-dropdown')
      $dropdown.kendoMenu({
        orientation: 'vertical',
        select: function (e) {
          let value = e.item.dataset.data
          if (value === 'true') { value = true }
          if (value === 'false') { value = false }
          self.setComponentValue(component, value)
          $button.removeClass('k-state-selected')
          $dropdown.hide()
          self.executeCommand(component, view, { value: value })
        }
      })
      $dropdown.hide()
      $button.click(function () {
        self._hideDropdowns(component.htmlId)
        $button.toggleClass('k-state-selected')
        $dropdown.toggle($button.hasClass('k-state-selected'))
      })
      break
    case 'button':
      $button = $('#quick-edit-' + component.htmlId)
      $button.click(function () {
        self._hideDropdowns(null)
        self.executeCommand(component, view)
      })
      break
    case 'combo':
      $edit = $('#quick-edit-' + component.htmlId + ' > input')
      $select = $('#quick-edit-' + component.htmlId + ' > select')

      $edit.change(function () {
        self._triggerChangeEvent(quickedit.id, component.id, view, $edit.val())
        self.executeCommand(component, view, { value: $edit.val() })
      })

      $select.val($edit.val())
      $select.change(function () {
        $edit.val($select.val())
        $edit.change()
      })
      // (for Windows) To prevent immediate collapse of dropdown in comboBox.
      $select.click(function (e) {
        $select.focus()
        e.stopPropagation()
        return false
      })

      $('#quick-edit-' + component.htmlId + '-container input').focus(function () {
        self._hideDropdowns(null)
      })
      break
    }
  }

  bindKey (component, view) {
    if (component.key) {
      let normalizedKey = this.keymapManager.normalizeKeyDescriptor(component.key)
      this.keymap[normalizedKey] = () => {
        this.executeCommand(component, view)
      }
    }
  }

  executeCommand (component, view, options) {
    try {
      if (component.command) {
        let _options = options || {}
        Object.assign(_options, {
          view: view,
          model: component['view-only'] ? view : view.model,
          property: component.property
        })
        if (component['command-arg']) {
          Object.assign(_options, component['command-arg'])
        }
        this.commandManager.execute(component.command, _options)
      }
    } catch (err) {
      if (_.isString(err)) {
        app.toast.error(err)
      } else {
        console.error(err.stack)
      }
    }
  }

  getComponentWidth (component) {
    switch (component.type) {
    case 'input':
      return INPUT_WIDTH
    case 'textarea':
      return TEXTAREA_WIDTH
    case 'dropdown':
      return component.width || DROPDOWN_WIDTH
    case 'button':
      return BUTTON_WIDTH
    case 'combo':
      return component.width || COMBO_WIDTH
    }
    return 0
  }

  getComponentHeight (item) {
    let h = 0
    switch (item.type) {
    case 'button':
      h = BUTTON_HEIGHT
      break
    }
    return h
  }

  /**
   * Get the clicked end of EdgeView
   * @param {EdgeView} edgeView
   * @param {number} x
   * @param {number} y
   * @return {string} - 'end1' | 'end2' | null
   */
  getEdgeViewEnd (edgeView, x, y) {
    let count = edgeView.points.count()
    let firstPt = edgeView.points.points[0]
    let lastPt = edgeView.points.points[count - 1]
    let midPtIdx = (count > 2) ? _.floor(count / 2) : 0
    let midPt = new Point()
    midPt.x = _.floor((edgeView.points.points[midPtIdx].x + edgeView.points.points[midPtIdx + 1].x) / 2)
    midPt.y = _.floor((edgeView.points.points[midPtIdx].y + edgeView.points.points[midPtIdx + 1].y) / 2)
    var L1 = _.floor(Math.sqrt(Math.pow(firstPt.x - x, 2) + Math.pow(firstPt.y - y, 2)))
    var L2 = _.floor(Math.sqrt(Math.pow(lastPt.x - x, 2) + Math.pow(lastPt.y - y, 2)))
    var L3 = _.floor(Math.sqrt(Math.pow(midPt.x - x, 2) + Math.pow(midPt.y - y, 2)))
    var minValue = Math.min(Math.min(L1, L2), L3)
    if (minValue === L3) {
      return null
    } else {
      if (minValue === L1) {
        return 'end1'
      } else if (minValue === L2) {
        return 'end2'
      }
    }
  }

  setComponentValue (component, value) {
    switch (component.type) {
    case 'input':
      var $input = $('#quick-edit-' + component.htmlId)
      $input.val(value)
      break
    case 'textarea':
      $('#quick-edit-' + component.htmlId).val(value)
      break
    case 'dropdown':
      component.items.forEach(option => {
        if (option.value === value) {
          $('#quick-edit-' + component.htmlId).empty()
          $('#quick-edit-' + component.htmlId).append("<span class='k-sprite staruml-icon " + option.icon + "'></span>")
        }
      })
      break
    case 'combo':
      let $edit = $('#quick-edit-' + component.htmlId + ' > input')
      let $select = $('#quick-edit-' + component.htmlId + ' > select')
      $edit.val(value)
      $select.val(value)
      break
    }
  }

  /**
   * Close QuickEdit
   * @param {boolean} applyChanges
   */
  close (applyChanges) {
    // Apply Changes before Closing
    if (applyChanges === true) {
      // To trigger change events of input and textarea elements,
      // Focus on a zero-sized button element.
      $('#quick-edit-outfocus').focus()
    }
    // Prevent Closing
    if (this._preventClose) {
      return
    }
    // Hide Tooltips
    if (this.tooltip) {
      this.tooltip.hide()
    }
    // Remove QuickEdit
    var $quickEdit = $('#quick-edit')
    if ($quickEdit.length > 0) {
      $('#quick-edit').remove()
      this._triggerCloseEvent()
    }
    // Enable Scrolling (scroll disabled in branch:canvas-max)
    // $('#diagram-area').css('overflow', 'scroll')
    // Set Focus to Diagram Area (to allow Enter key to popup QuickEdit)
    $('#diagram-canvas').focus()
    setTimeout(() => {
      this.diagramManager.repaint()
    }, 1)
    // Remove keydownHook
    this.keymapManager.removeGlobalKeydownHook(this.keydownHook)
  }

  /**
   * Change Event
   * @event
   * @property {string} id QuickEdit Id.
   * @property {string} itemId Item Id.
   * @property {View} view View
   * @property {*} value Value
   */
  _triggerChangeEvent (id, itemId, view, value, feedback) {
    this.diagramManager.suspendRepaint()
    // this.emit('change', id, itemId, view, value, feedback)
    this.diagramManager.resumeRepaint()
  }

  /**
   * Click Event
   * @event
   * @property {string} id QuickEdit Id.
   * @property {string} itemId Item Id.
   * @property {View} view View
   * @property {*} value Value
   */
  _triggerClickEvent (id, itemId, view) {
    this.diagramManager.suspendRepaint()
    this.emit('click', id, itemId, view)
    this.diagramManager.resumeRepaint()
  }

  /**
   * Keydown Event
   * @event
   * @property {string} id QuickEdit Id.
   * @property {string} itemId Item Id.
   * @property {View} view View
   * @property {JQuery.Event} event
   */
  _triggerKeydownEvent (id, itemId, view, event) {
    this.emit('keydown', id, itemId, view, event)
  }

  /**
   * Open Event
   * @event
   * @property {Editor} editor Diagram Editor
   * @property {View} view View
   * @property {number} x
   * @property {number} y
   */
  _triggerOpenEvent (editor, view) {
    this.emit('open', editor, view)
  }

  /**
   * Close Event
   * @event
   */
  _triggerCloseEvent () {
    this.emit('close')
  }

  htmlId (id) {
    return id.replace(/[./*<>:\\"'|?]/g, '-')
  }

  /**
   * Hide Dropdowns
   * @private
   * @param {string} exceptId Exception Dropdown Id
   */
  _hideDropdowns (exceptId) {
    _.forEach(this.activeQuickedit.components, item => {
      if ((item.type === 'dropdown') && (item.id !== exceptId)) {
        $('#quick-edit-' + item.htmlId).removeClass('k-state-selected')
        $('#quick-edit-' + item.htmlId + '-dropdown').hide()
      }
    })
  }

  openUpInQuickEdit (compartmentItemView) {
    var idx = _.indexOf(compartmentItemView._parent.subViews, compartmentItemView)
    if (idx > 0) {
      var target = compartmentItemView._parent.subViews[idx - 1]
      _.defer(() => {
        open(this.diagramManager.getEditor(), target, target.left, target.top)
      })
    }
  }

  openDownInQuickEdit (compartmentItemView) {
    var idx = _.indexOf(compartmentItemView._parent.subViews, compartmentItemView)
    if (idx < (compartmentItemView._parent.subViews.length - 1)) {
      var target = compartmentItemView._parent.subViews[idx + 1]
      _.defer(() => {
        open(this.diagramManager.getEditor(), target, target.left, target.top)
      })
    }
  }

  moveUpInQuickEdit (parentModel, field, compartmentItemView) {
    this.engine.moveUp(parentModel, field, compartmentItemView.model)
    close()
    _.defer(() => {
      _.each(compartmentItemView._parent.subViews, (subView) => {
        if (subView.model._id === compartmentItemView.model._id) {
          open(this.diagramManager.getEditor(), subView, subView.left, subView.top)
        }
      })
    })
  }

  moveDownInQuickEdit (parentModel, field, compartmentItemView) {
    this.engine.moveDown(parentModel, field, compartmentItemView.model)
    close()
    _.defer(() => {
      _.each(compartmentItemView._parent.subViews, (subView) => {
        if (subView.model._id === compartmentItemView.model._id) {
          open(this.diagramManager.getEditor(), subView, subView.left, subView.top)
        }
      })
    })
  }

  getHeadNodes (view, edgeType) {
    const edges = _.filter(app.repository.getEdgeViewsOf(view), e => {
      return (e instanceof edgeType && e.tail === view)
    })
    const nodes = _.map(edges, e => { return e.head })
    return nodes
  }

  getTailNodes (view, edgeType) {
    const edges = _.filter(app.repository.getEdgeViewsOf(view), e => {
      return (e instanceof edgeType && e.head === view)
    })
    const nodes = _.map(edges, e => { return e.tail })
    return nodes
  }

  getBothNodes (view, edgeType, predicate) {
    const edges = _.filter(app.repository.getEdgeViewsOf(view), e => {
      return (e instanceof edgeType && (predicate ? predicate(e) : true))
    })
    const nodes = _.map(edges, e => {
      if (e.head === view) {
        return e.tail
      } else {
        return e.head
      }
    })
    return nodes
  }

  setInside (rect) {
    if (rect.x1 < 0) { rect.x1 = 0 }
    if (rect.x2 < 0) { rect.x2 = 0 }
    if (rect.y1 < 0) { rect.y1 = 0 }
    if (rect.y2 < 0) { rect.y2 = 0 }
  }

  getEdgeViewOption (fromView, toView) {
    return {
      tailView: fromView,
      headView: toView,
      tailModel: fromView.model || null,
      headModel: toView.model || null
    }
  }

  /**
   * Get a new position at the top of a given area. The new position should
   * be placed at the right most of given already existing nodes.
   *
   * @param {Rect} area
   * @param {Array<Node>} existingNodes
   * @param {number} margin
   */
  getTopPosition (area, existingNodes, margin) {
    margin = margin || 100
    let rect = {
      x1: area.x1,
      y1: area.y1 - margin,
      x2: area.x1,
      y2: area.y1 - margin
    }
    if (existingNodes.length > 0) {
      let rightMost = _.maxBy(existingNodes, e => { return e.getRight() })
      if (Coord.rectInRect(rightMost.getBoundingBox(), this.diagramManager.getDiagramArea())) {
        rect = {
          x1: rightMost.getRight() + 10,
          y1: rightMost.top,
          x2: rightMost.getRight() + 20,
          y2: rightMost.top + 10
        }
      }
    }
    this.setInside(rect)
    return rect
  }

  /**
   * Get a new position at the bottom of a given area. The new position should
   * be placed at the right most of given already existing nodes.
   *
   * @param {Rect} area
   * @param {Array<Node>} existingNodes
   * @param {number} margin
   */
  getBottomPosition (area, existingNodes, margin) {
    margin = margin || 70
    let rect = {
      x1: area.x1,
      y1: area.y2 + margin,
      x2: area.x1,
      y2: area.y2 + margin
    }
    if (existingNodes.length > 0) {
      let rightMost = _.maxBy(existingNodes, e => { return e.getRight() })
      if (Coord.rectInRect(rightMost.getBoundingBox(), this.diagramManager.getDiagramArea())) {
        rect = {
          x1: rightMost.getRight() + 10,
          y1: rightMost.top,
          x2: rightMost.getRight() + 20,
          y2: rightMost.top + 10
        }
      }
    }
    this.setInside(rect)
    return rect
  }

  /**
   * Get a new position at the left of a given area. The new position should
   * be placed at the bottom most of given already existing nodes.
   *
   * @param {Rect} area
   * @param {Array<Node>} existingNodes
   * @param {number} margin
   */
  getLeftPosition (area, existingNodes, margin) {
    margin = margin || 100
    let rect = {
      x1: area.x1 - margin,
      y1: area.y1,
      x2: area.x1 - margin,
      y2: area.y1
    }
    if (existingNodes.length > 0) {
      let bottomMost = _.maxBy(existingNodes, e => { return e.getBottom() })
      if (Coord.rectInRect(bottomMost.getBoundingBox(), this.diagramManager.getDiagramArea())) {
        rect = {
          x1: bottomMost.left,
          y1: bottomMost.getBottom() + 10,
          x2: bottomMost.getRight(),
          y2: bottomMost.getBottom() + 20
        }
      }
    }
    this.setInside(rect)
    return rect
  }

  /**
   * Get a new position at the right of a given area. The new position should
   * be placed at the bottom most of given already existing nodes.
   *
   * @param {Rect} area
   * @param {Array<Node>} existingNodes
   * @param {number} margin
   */
  getRightPosition (area, existingNodes, margin) {
    margin = margin || 70
    let rect = {
      x1: area.x2 + margin,
      y1: area.y1,
      x2: area.x2 + margin,
      y2: area.y1
    }
    if (existingNodes.length > 0) {
      let bottomMost = _.maxBy(existingNodes, e => { return e.bottom })
      if (Coord.rectInRect(bottomMost.getBoundingBox(), this.diagramManager.getDiagramArea())) {
        rect = {
          x1: bottomMost.left,
          y1: bottomMost.getBottom() + 10,
          x2: bottomMost.getRight(),
          y2: bottomMost.getBottom() + 20
        }
      }
    }
    this.setInside(rect)
    return rect
  }

  /**
   * register QuickEdit
   * @param {Object} data
   */
  register (data) {
    // this.quickEditList.push(data)
  }

}

module.exports = QuickeditManager
