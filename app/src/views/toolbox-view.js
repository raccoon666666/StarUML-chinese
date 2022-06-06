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
const fs = require('fs')
const path = require('path')
const keycode = require('keycode')
const Resizer = require('../utils/resizer')
const ViewUtils = require('../utils/view-utils')
const {SelectHandler, CreateHandler} = require('../ui/diagram-editor')
const {EventEmitter} = require('events')
const _ = require('lodash')

var SELECTOR_ID = 'toolbox-select'

/**
 * Toolbox View
 */
class ToolboxView extends EventEmitter {

  constructor () {
    super()
    this.$toolbox = null
    this.$toolboxPanelBar = null
    this.$buttons = null
    this.$selectButton = null

    /**
     * Groups
     * @member {Object<string, {id: string, title: string}>}
     */
    this.groups = {}

    /**
     * Items
     * @member {Object<string, {id: string, groupId: string, title: string}>}
     */
    this.items = {}

    /**
     * @private
     * @member {Map<string, string>}
     */
    this.idByhtmlId = {}

    /**
     * Active Item
     * @member {string}
     */
    this.activeItem = null

    /**
     * Active Item Locked
     * @member {boolean}
     */
    this.activeItemLocked = false

    /**
     * Map for Handlers
     * @private
     * @type {Object.<string,Handlers.Handler>}
     */
    this.handlers = {}

    /**
     * Panel Bar
     * @private
     * @type {kendo.ui.PanelBar}
     */
    this.panelBar = null

    /**
     * A reference to Repository
     * @private
     */
    this.repository = null

    /**
     * A refernce to DiagramManager
     * @private
     */
    this.diagramManager = null

    /**
     * A reference to CommandManager
     * @private
     */
    this.commandManager = null

    /**
     * A reference to QuickeditManager
     * @private
     */
    this.quickeditManager = null
  }

  /**
   * Add a toolbox template
   * @private
   */
  add (template) {
    template.forEach(group => {
      let diagramTypes = group['diagram-types'] ? group['diagram-types'].map(dt => { return type[dt] }) : null
      let autoExpands = group['auto-expands'] ? group['auto-expands'].map(dt => { return type[dt] }) : []
      this.addGroup(group.id, group.label, diagramTypes, autoExpands)
      group.items.forEach(item => {
        this.addItem(item.id, group.id, item.label, item.icon, item.rubberband, item.command, item['command-arg'])
      })
    })
  }

  /**
   * Add a group.
   * @private
   *
   * @param {string} groupId
   * @param {string} title
   * @param {!Array.<Core.Diagram>} diagramTypes
   *      This group only available for these diagram types.
   *      If empty array is passed, then this group will be available for any diagrams
   * @param {Array.<Core.Diagram>} autoExpands
   *      This group will be automatically expands when one of these diagram types is activated
   */
  addGroup (groupId, title, diagramTypes, autoExpands) {
    let group = {
      id: groupId,
      htmlId: this.htmlGroupId(groupId),
      title: title,
      diagramTypes: diagramTypes,
      autoExpands: autoExpands
    }
    this.groups[groupId] = group
    var html = "<li id='{{htmlId}}'>{{title}}<ul></li>"
    $('#ui-toolbox').append(Mustache.render(html, group))
  }

  /**
   * Add an item to a group.
   * @private
   *
   * @param {string} id
   * @param {string} groupId
   * @param {string} title
   * @param {string} iconClass
   * @param {string} rubberband "line" | "rect" | "point"
   */
  addItem (id, groupId, title, iconClass, rubberband, command, commandArg) {
    let item = {
      id: id,
      htmlId: this.htmlItemId(id),
      groupId: groupId,
      title: title,
      iconClass: iconClass,
      rubberband: rubberband,
      command: command,
      commandArg: commandArg
    }
    this.items[id] = item
    this.idByhtmlId[item.htmlId] = id
    var html = "<li id='{{htmlId}}'><span class='k-sprite staruml-icon {{iconClass}}'></span><span>{{title}}</span></li>"
    $('#' + this.htmlGroupId(groupId) + ' > ul').append(Mustache.render(html, item))
    if (!this.handlers[id]) {
      this.handlers[id] = new CreateHandler(id, rubberband, (id, editor, x1, y1, x2, y2) => {
        var diagram = editor.diagram
        var tailView = diagram.getViewAt(editor.canvas, x1, y1, true)
        var headView = diagram.getViewAt(editor.canvas, x2, y2, true)
        var options = {
          id: item.id,
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          editor: editor,
          diagram: diagram,
          parent: diagram._parent,
          tailView: tailView,
          headView: headView,
          tailModel: tailView ? tailView.model : null,
          headModel: headView ? headView.model : null
        }
        Object.assign(options, item.commandArg)
        let command = item.command || 'factory:create-model-and-view'
        try {
          let view = this.commandManager.execute(command, options)
          // Open QuickEdit for the created view.
          if (view instanceof type.View) {
            view = this.repository.get(view._id)
            if (view instanceof type.NodeView) {
              _.defer(() => {
                this.quickeditManager.open(view, view.left, view.top)
              })
            } else if (view instanceof type.EdgeView) {
              _.defer(() => {
                this.quickeditManager.open(view, Math.round((x1 + x2) / 2), Math.round((y1 + y2) / 2))
              })
            }
          }
        } catch (err) {
          if (_.isString(err)) {
            app.toast.error(err)
            // console.error(err)
          } else {
            console.error(err.stack)
          }
        }

        // Go back to selector after element creation.
        if (!this.activeItemLocked) {
          this.selectItem()
        }
      })
    }
  }

  /**
   * @private
   */
  htmlGroupId (id) {
    return 'toolbox-group-' + id.replace(/[./*<>:\\"'|?]/g, '-')
  }

  /**
   * @private
   */
  htmlItemId (id) {
    return 'toolbox-item-' + id.replace(/[./*<>:\\"'|?]/g, '-')
  }

  /**
   * Activate a given item
   * @private
   * @param {string} itemId
   */
  setActiveItem (itemId) {
    if (itemId === SELECTOR_ID) {
      let currentActiveItem = this.items[this.activeItem]
      if (currentActiveItem) {
        $('#' + currentActiveItem.htmlId + ' > span').removeClass('k-state-selected k-state-focused') // deselect
      }
      this.$selectButton.addClass('k-state-selected')
    } else {
      this.$selectButton.removeClass('k-state-selected')
    }
    this.setActiveItemLock(false)
    this.activeItem = itemId
    let handler = this.handlers[itemId]
    this.diagramManager.setActiveHandler(handler)
    this.emit('activeHandlerChanged', handler)
  }

  /**
   * Lock the active item
   * @param {boolean} locked
   */
  setActiveItemLock (locked) {
    this.activeItemLocked = locked
    if (this.activeItemLocked) {
      let currentActiveItem = this.items[this.activeItem]
      $('#' + currentActiveItem.htmlId + ' > span').append("<span class='k-sprite staruml-icon icon-tool-lock toolbox-lock' style='float: none; margin-left: 2px; margin-bottom: 7px;'></span>")
    } else {
      $('.toolbox-lock').remove()
    }
  }

  /**
   * Show groups only available for a given diagram.
   * @private
   * @param {Diagram} diagram
   */
  setDiagram (diagram) {
    if (diagram) {
      this.$toolboxPanelBar.show()
      this.$buttons.show()
      for (let groupId in this.groups) {
        // Set visibility of groups
        let group = this.groups[groupId]
        var visible = false
        if (Array.isArray(group.diagramTypes)) {
          group.diagramTypes.forEach(dt => {
            if (diagram instanceof dt) { visible = true }
          })
        } else {
          visible = true
        }
        $('#' + group.htmlId).toggle(visible)

        // Expand auto-expandable groups
        if (Array.isArray(group.autoExpands)) {
          group.autoExpands.forEach(dt => {
            if (diagram instanceof dt) {
              this.expandGroup(group.id)
            }
          })
        }
      }
    } else {
      this.$toolboxPanelBar.hide()
      this.$buttons.hide()
    }
  }

  /**
   * Select an item.
   * @param {string} itemId
   */
  selectItem (itemId) {
    if (itemId && (itemId !== SELECTOR_ID)) {
      // this.setActiveItem(itemId)
      let item = this.items[itemId]
      this.panelBar.select('#' + item.htmlId)
    } else {
      this.setActiveItem(SELECTOR_ID)
      this.setActiveItemLock(false)
    }
  }

  /**
   * Expand a group.
   * @param {string} groupId
   */
  expandGroup (groupId) {
    let group = this.groups[groupId]
    if (group) {
      this.panelBar.expand($('#ui-toolbox #' + group.htmlId))
    }
  }

  /**
   * Collapse a group.
   * @param {string} groupId
   */
  collapseGroup (groupId) {
    let group = this.groups[groupId]
    if (group) {
      this.panelBar.collapse($('#ui-toolbox #' + group.htmlId))
    }
  }

  /**
   * Get a handler.
   * @private
   * @param {string} id
   * @return {Handler}
   */
  getHandler (id) {
    return this.handlers[id]
  }

  /**
   * Toggle ToolboxView
   */
  toggle () {
    Resizer.toggle(this.$toolbox)
  }

  /**
   * Show ToolboxView
   */
  show () {
    Resizer.show(this.$toolbox)
  }

  /**
   * Hide ToolboxView
   */
  hide () {
    Resizer.hide(this.$toolbox)
  }

  /**
   * Return whether ToolboxView is visible or not
   * @return {boolean}
   */
  isVisible () {
    return Resizer.isVisible(this.$toolbox)
  }

  /**
   * @private
   */
  updateMenu () {
    let checkedStates = {
      'view.toolbox': this.isVisible()
    }
    app.menu.updateStates(null, null, checkedStates)
  }

  /**
   * Initialize when html-ready
   * @private
   */
  htmlReady () {
    const viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/toolbox-view.html'), 'utf8')
    var $view = $(viewTemplate)
    var $content = $view.find('.view-content')

    this.$toolbox = $('#toolbox')
    this.$toolboxPanelBar = $view.find('#ui-toolbox')
    this.$buttons = $view.find('.buttons')
    this.$toolbox.append($view)
    ViewUtils.addScrollerShadow($content.get(0), null, true)

    this.$selectButton = $('.select-button', $view)
    this.$selectButton.click(() => {
      this.setActiveItem(SELECTOR_ID)
    })

    this.$toolbox.on('panelCollapsed', (evt, width) => {
      this.updateMenu()
    })

    this.$toolbox.on('panelExpanded', (evt, width) => {
      this.updateMenu()
    })

    // is collapsed before we add the event. Check here initially
    if (!this.$toolbox.is(':visible')) {
      this.$toolbox.trigger('panelCollapsed')
    }

    app.commands.register('view:toolbox', () => { this.toggle() }, 'Toggle Toolbox')
  }

  /**
   * Initialize when app-ready
   * @private
   */
  appReady () {
    // Configure Handlers
    this.handlers[SELECTOR_ID] = new SelectHandler()

    // Setup PanelBar
    $('#ui-toolbox').kendoPanelBar({
      expandMode: 'multiple',
      activate: (e) => {
        this.selectItem()
      },
      select: (e) => {
        let id = this.idByhtmlId[e.item.id]
        if (id === this.activeItem) {
          if (this.activeItemLocked === true) {
            this.setActiveItemLock(false)
            this.setActiveItem(SELECTOR_ID)
          } else {
            this.setActiveItemLock(true)
          }
        } else if (this.handlers[id]) {
          // Handler에 등록된 e.item.id 가 존재하는 경우에만 동작.
          // Group을 Collapse될 때, 그 내부에 ActiveItem이 존재하면 e.item.id 는 Group의 id가 됨.
          this.setActiveItemLock(false)
          this.setActiveItem(id)
        } else {
          // 적합한 Handler가 없는 경우에는 SELECTOR가 선택됨.
          this.setActiveItemLock(false)
          this.setActiveItem(SELECTOR_ID)
        }
      }
    })
    this.panelBar = $('#ui-toolbox').data('kendoPanelBar')

    // Process Key Events (ESC == Go to Selection Mode)
    $('body').keydown(event => {
      switch (event.which) {
      case keycode('esc'):
        this.setActiveItem(SELECTOR_ID)
        break
      }
    })

    this.updateMenu()
  }
}

module.exports = ToolboxView
