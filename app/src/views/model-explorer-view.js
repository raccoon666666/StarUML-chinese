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

const fs = require('fs')
const path = require('path')
const ViewUtils = require('../utils/view-utils')
const {EventEmitter} = require('events')
const _ = require('lodash')

// Sort type constants
const SORT_BY_ADDED = 'added'
const SORT_BY_NAME = 'name'

/**
 * ModelExplorer View
 * @private
 */
class ModelExplorerView extends EventEmitter {

  constructor () {
    super()

    /**
     * JQuery for Explorer Pane
     * @private
     * @type {JQuery}
     */
    this.$viewContent = null

    /**
     * JQuery for Tree
     * @private
     * @type {JQuery}
     */
    this.$tree = null

    /**
     * KendoTreeView object
     * @private
     * @type {kendo.ui.TreeView}
     */
    this._tree = null

    /**
     * DataSource for TreeView
     * @private
     * @type {kendo.data.HierarchicalDataSource}
     */
    this._dataSource = null

    /**
     * Temporal variable for storing mouse position when draging.
     * @private
     * @type {{x:number, y:number}}
     */
    this._dragPosition = {x: 0, y: 0}

    /**
     * Sort type
     * @private
     */
    this._sortBy = null

    /**
     * Show stereotype
     * @private
     */
    this._showStereotype = true

    /**
     * A reference to Repository
     * @private
     */
    this.repository = null

    /**
     * A reference to PreferenceManager
     * @private
     */
    this.preferenceManager = null

    /**
     * A reference to DiagramManager
     * @private
     */
    this.diagramManager = null
  }

  /**
   * Setup Tree
   * @private
   */
  _setupTree () {
    let self = this

    // Setup Custom DataSource for TreeView
    this._dataSource = new kendo.data.HierarchicalDataSource({
      transport: {
        read: (options) => {
          var id = options.data._id
          var elem
          if (id) {
            elem = this.repository.get(id)
            var children = this._sort(this._getChildren(elem))
            var nodes = []
            _.each(children, child => {
              var node = this._makeNode(child)
              nodes.push(node)
            })
            options.success(nodes)
          } else {
            elem = app.project.getProject()
            if (elem) {
              var node = this._makeNode(elem)
              options.success([node])
            } else {
              options.success([])
            }
          }
        },
        create: (options) => {
        },
        destroy: (options) => {
        }
      },
      schema: {
        model: {
          id: '_id',
          hasChildren: 'hasChildren'
        }
      }
    })

    // Setup TreeView
    this.$tree.kendoTreeView({
      loadOnDemand: true,
      animation: false,
      dataSource: this._dataSource,
      dataSpriteCssClassField: 'sprite',
      dataTextField: 'text',
      dragAndDrop: true,
      select: function (e) {
        self.$tree.focus()
        var item = this.dataItem(e.node)
        var elem = self.repository.get(item._id)
        console.log(elem)
        self.emit('selected', elem)
      },
      drag: function (e) {
        self._dragPosition.x = e.pageX
        self._dragPosition.y = e.pageY
        var sourceItem, targetItem, dragEvent
        if (e.dropTarget.id && e.dropTarget.id === 'diagram-canvas') {
          // When dragging to Diagram Area
          sourceItem = this.dataItem(e.sourceNode)
          var source = self.repository.get(sourceItem._id)
          if (self.diagramManager.getEditor()) {
            var diagram = self.diagramManager.getEditor().diagram
            if (diagram) {
              dragEvent = {
                source: source,
                diagram: diagram,
                accept: false
              }
              self.emit('dragOverDiagram', dragEvent)
              if (dragEvent.accept === false) {
                e.setStatusClass('k-denied')
              } else {
                e.setStatusClass('k-add')
                e.preventDefault()
              }
            }
          }
        } else {
          // When dragging inside ModelExplorer
          if (e.statusClass !== 'add') {
            e.setStatusClass('k-denied')
          }
          sourceItem = this.dataItem(e.sourceNode)
          targetItem = this.dataItem(e.dropTarget)
          if (sourceItem && targetItem && sourceItem._id && targetItem._id) {
            dragEvent = {
              source: self.repository.get(sourceItem._id),
              target: self.repository.get(targetItem._id),
              accept: false
            }
            if (dragEvent.source !== dragEvent.target) {
              self.emit('dragOver', dragEvent)
            }
            if (dragEvent.accept === false) {
              e.setStatusClass('k-denied')
            }
          }
        }
      },
      drop: function (e) {
        var sourceItem, targetItem, dropEvent
        if (e.dropTarget.id && e.dropTarget.id === 'diagram-canvas') {
          // When drop on Diagram Area
          sourceItem = this.dataItem(e.sourceNode)
          var source = self.repository.get(sourceItem._id)
          if (self.diagramManager.getEditor()) {
            var diagram = self.diagramManager.getEditor().diagram
            if (diagram) {
              dropEvent = {
                source: source,
                diagram: diagram,
                x: self._dragPosition.x,
                y: self._dragPosition.y
              }
              if (e.valid) {
                self.emit('dropOnDiagram', dropEvent)
              }
            }
            e.setValid(false)
          }
        } else {
          // When drop on ModelExplorer
          sourceItem = this.dataItem(e.sourceNode)
          targetItem = this.dataItem(e.destinationNode)
          if (sourceItem && targetItem && sourceItem._id && targetItem._id) {
            dropEvent = {
              source: self.repository.get(sourceItem._id),
              target: self.repository.get(targetItem._id)
            }
            if (e.valid) {
              if (e.dropPosition === 'over') {
                self.emit('drop', dropEvent)
              }
            }
          }
          e.setValid(false)
        }
      }
    })
    this._tree = this.$tree.data('kendoTreeView')

    // Setup Double Clicked event.
    this.$tree.dblclick(function (e) {
      var node = self._tree.select()
      var item = self._tree.dataItem(node)
      if (item && item._id) {
        var elem = self.repository.get(item._id)
        self.emit('doubleClicked', elem)
        e.stopImmediatePropagation()
      }
    })

    // Support Right-click Selection
    this.$tree.on('mousedown', '.k-item', function (e) {
      if (e.which === 3) { // Right-click
        e.stopImmediatePropagation()
        self._tree.select(this)
        var item = self._tree.dataItem(this)
        var elem = self.repository.get(item._id)
        self.emit('selected', elem)
      }
    })
  }

  /**
   * Return JSON object for tree node for a given element.
   * @private
   * @param {Core.Element} elem
   * @return {{_id: string, text: string, sprite: string, hasChildren: boolean}}
   */
  _makeNode (elem) {
    var options = {
      showStereotype: this._showStereotype
    }
    return {
      _id: elem._id,
      text: elem.getNodeText(options),
      sprite: elem.getNodeIcon(elem),
      hasChildren: (elem.getChildNodes().length > 0),
      _name: elem.name,
      _namespace: elem._parent ? elem._parent.name || '' : ''
    }
  }

  /**
   * Return child elements.
   * @private
   * @param {Element} elem
   * @return {Array.<Element>}
   */
  _getChildren (elem) {
    return elem.getChildNodes()
  }

  /**
   * Sort elements.
   * @private
   * @param {Array.<Element>} elements
   * @return {Array.<Element>} - 정렬된 요소들의 배열
   */
  _sort (elements) {
    if (this._sortBy === SORT_BY_ADDED) {
      return _.sortBy(elements, function (child, idx) {
        return child.getOrdering(idx)
      })
    } else if (this._sortBy === SORT_BY_NAME) {
      var alphaSorted = _.sortBy(elements, function (child, idx) {
        return child.name
      })
      return _.sortBy(elements, function (child, idx) {
        return child.getOrdering(_.indexOf(alphaSorted, child))
      })
    } else {
      return elements
    }
  }

  /**
   * Get a tree node of an element.
   * @private
   * @param {Element} elem
   * @return {Object}
   */
  _getNode (elem) {
    var item = this._dataSource.get(elem._id)
    if (item && item.uid) {
      var node = this._tree.findByUid(item.uid)
      return node
    }
    return null
  }

  /**
   * Append a tree node.
   * @private
   * @param {Core.Element} elem
   * @param {boolean} expandAllParents
   */
  add (elem, expandAllParents) {
    // Extend all parents
    if (elem && elem._parent) {
      if (expandAllParents) {
        this.expand(elem._parent, true)
      }
    }
    // If parent node is not loaded, the element is added when expanding it's parent.
    // Then, the node should not be added to avoid duplicated addition of the node.
    var node = this._getNode(elem)
    if (node === null) {
      if (elem._parent) {
        var parentNode = this._getNode(elem._parent)
        var children = this._getChildren(elem._parent)
        if (!_.includes(children, elem)) {
          children.push(elem)
        }
        // Find the position to be added
        var sorted = this._sort(children)
        var position = _.indexOf(sorted, elem)
        if ((position > -1) && (position < (sorted.length - 1))) {
          var after = sorted[position + 1]
          var afterNode = this._getNode(after)
          if (afterNode) {
            this._tree.insertBefore(this._makeNode(elem), afterNode)
          } else {
            this._tree.append(this._makeNode(elem), parentNode)
          }
        } else {
          this._tree.append(this._makeNode(elem), parentNode)
        }
      } else {
        // Add as a root element
        this._tree.append(this._makeNode(elem))
      }
    }
  }

  /**
   * Update tree node correspond to a given Element
   * @private
   * @param {Core.Element} elem
   */
  update (elem) {
    var node = this._getNode(elem)
    if (node) {
      var update = this._makeNode(elem)
      // update text
      this._tree.text(node, update.text)
      // update icon
      var iconNode = node.children().children('.k-in').children('.k-sprite')
      if (iconNode.length > 0 && !iconNode.hasClass(update.sprite)) {
        iconNode.attr('class', 'k-sprite ' + update.sprite)
      }
      // update position (sort)
      var item = this._tree.dataItem(node)
      if (this._sortBy === SORT_BY_NAME && item._name !== elem.name) {
        this.remove(elem)
        this.add(elem)
      }
    }
  }

  /**
   * Remove a tree node.
   * @private
   * @param {Core.Element} elem
   */
  remove (elem) {
    var node = this._getNode(elem)
    if (node) {
      this._tree.remove(node)
    }
  }

  /**
   * Rebuild all tree nodes.
   * @private
   */
  rebuild () {
    if (this._tree && this._tree.destroy) {
      this._tree.destroy()
    }
    if (this.$tree) {
      this.$tree.children().remove()
    }
    this._setupTree()
  }

  /**
   * Expand a tree node
   * @param {Model} elem
   * @param {boolean} expandAllParents If true, expands all parents
   */
  expand (elem, expandAllParents) {
    if (elem) {
      // Expand all parents
      if ((expandAllParents === true) && elem._parent && elem._parent._id) {
        this.expand(elem._parent, expandAllParents)
      }
      // Expand current node
      var node = this._getNode(elem)
      if (node) {
        this._tree.expand(node)
      }
    }
  }

  /**
   * Collapse a tree node
   * @param {Core.Model} elem
   */
  collapse (elem) {
    if (elem) {
      var node = this._getNode(elem)
      if (node) {
        this._tree.collapse(node)
      }
    }
  }

  /**
   * Select an element
   * @param {Core.Model} elem
   * @param {boolean} scrollTo
   */
  select (elem, scrollTo) {
    if (elem) {
      this.expand(elem._parent, true)
      var node = this._getNode(elem)
      if (node) {
        this._tree.select(node)
        // Scroll to node
        if (scrollTo === true) {
          this.$viewContent.animate({
            scrollTop: node.offset().top - this.$viewContent.offset().top + this.$viewContent.scrollTop()
          }, 500)
        }
        this.emit('selected', elem)
      }
    } else {
      this._tree.select($())
    }
  }

  /**
   * Deselect
   */
  deselect () {
    this._tree.select($())
  }

  /**
   * Return a selected element in treeview
   * @private
   */
  _getSelected () {
    var node = this._tree.select()
    var elem = null
    if (node.length > 0) {
      var item = this._tree.dataItem(node[0])
      elem = this.repository.get(item._id)
    }
    return elem
  }

  _updateSettingsMenu () {
    let checkedStates = {
      'explorer.sort-by-added': (this._sortBy === SORT_BY_ADDED),
      'explorer.sort-by-name': (this._sortBy === SORT_BY_NAME),
      'explorer.show-stereotype-text': this._showStereotype
    }
    app.menu.updateStates(null, null, checkedStates)
  }

  /**
   * Sort elements by added
   * @private
   */
  _handleSortByAdded () {
    var elem = this._getSelected()
    this._sortBy = SORT_BY_ADDED
    this.preferenceManager.set('explorer.sortBy', this._sortBy)
    this._updateSettingsMenu()
    this.rebuild()
    if (elem) {
      this.select(elem, true)
    } else {
      this.expand(app.project.getProject())
    }
  }

  /**
   * Sort elements by name
   * @private
   */
  _handleSortByName () {
    var elem = this._getSelected()
    this._sortBy = SORT_BY_NAME
    this.preferenceManager.set('explorer.sortBy', this._sortBy)
    this._updateSettingsMenu()
    this.rebuild()
    if (elem) {
      this.select(elem, true)
    } else {
      this.expand(app.project.getProject())
    }
  }

  /**
   * Show/hide stereotype text
   * @private
   */
  _toggleStereotypeText () {
    var elem = this._getSelected()
    this._showStereotype = !this._showStereotype
    this.preferenceManager.set('explorer.showStereotype', this._showStereotype)
    this._updateSettingsMenu()
    this.rebuild()
    if (elem) {
      this.select(elem, true)
    } else {
      this.expand(app.project.getProject())
    }
  }

  /**
   * Setup Settings Menu
   * @private
   */
  _setupSettingsMenu () {
    // Register Commands
    app.commands.register('explorer:sort-by-added', () => { this._handleSortByAdded() }, 'Explorer: Sort By Added')
    app.commands.register('explorer:sort-by-name', () => { this._handleSortByName() }, 'Explorer: Sort By Name')
    app.commands.register('explorer:show-stereotype-text', () => { this._toggleStereotypeText() }, 'Explorer: Show Stereotype Text')

    var $settingsButton = $('#model-explorer-settings')
    $settingsButton.on('contextmenu', e => {
      e.preventDefault()
      e.stopImmediatePropagation()
    })
    $settingsButton.click(e => {
      e.preventDefault()
      app.contextMenu.popup('model-explorer-settings')
      return false
    })
  }

  _setupQuickSearch () {
    var self = this
    var searchDataSource = new kendo.data.DataSource({
      transport: {
        read: function (options) {
          if (options.data.filter && options.data.filter.filters.length > 0) {
            var keyword = options.data.filter.filters[0].value
            var results = self.repository.search(keyword)
            if (results.length > 100) {
              results = results.slice(0, 99)
            }
            options.success(_.map(results, item => { return self._makeNode(item) }))
          } else {
            options.success([])
          }
        }
      },
      serverFiltering: true
    })

    $('#model-explorer-quick-search').kendoAutoComplete({
      dataTextField: 'text',
      minLength: 1,
      filter: 'contains',
      select: function (e) {
        var item = this.dataItem(e.item.index())
        var elem = self.repository.get(item._id)
        if (elem) {
          self.select(elem, true)
        }
      },
      template: "<div style='white-space: nowrap'>" +
      "<span class='k-sprite #:data.sprite#'></span>" +
      "<span style='margin-left: 5px'>#:data.text#</span>" +
      "#if (data._namespace.length > 0) {# <span style='margin-left: 5px; font-size: 11px; color: rgb(139,139,139);'> — #:data._namespace#</span> #}#<div>",
      dataSource: searchDataSource
    })
  }

  htmlReady () {
    this._sortBy = this.preferenceManager.get('explorer.sortBy', SORT_BY_ADDED)
    this._showStereotype = this.preferenceManager.get('explorer.showStereotype', true)

    // Setup UI
    const viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/model-explorer-view.html'), 'utf8')
    var $view = $(viewTemplate)
    this.$viewContent = $view.find('.view-content')
    this.$tree = $view.find('.treeview')
    $('#model-explorer').append($view)
    ViewUtils.addScrollerShadow(this.$viewContent.get(0), null, true)

    // Rebuild TreeView
    this.rebuild()

    // Setup Settings
    this._setupSettingsMenu()

    this._setupQuickSearch()
  }

  appReady () {
    this._updateSettingsMenu()
  }

}

module.exports = ModelExplorerView
