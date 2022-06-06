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
const Mustache = require('mustache')
const Strings = require('../strings')
const ViewUtils = require('../utils/view-utils')
const _ = require('lodash')

const dialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/element-picker-dialog.html'), 'utf8')

/**
 * Element Picker Dialog
 */
class ElementPickerDialog {

  constructor () {
    /**
     * DataSource for TreeView
     * @private
     * @type {kendo.data.HierarchicalDataSource}
     */
    this._dataSource = null

    /**
     * JQuery for Tree Wrapper
     * @private
     * @type {JQuery}
     */
    this.$treeWrapper = null

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
     * JQuery for Unspecified Checkbox
     * @private
     * @type {JQuery}
     */
    this.$unspecified = null

    /**
     * Selected element
     * @private
     * @type {Element}
     */
    this._selectedElement = null
  }

  /**
   * Setup TreeView
   * @private
   */
  _setupTree () {
    // DataSource for TreeView
    this._dataSource = new kendo.data.HierarchicalDataSource({
      transport: {
        read: (options) => {
          var nodes = []
          var id = options.data._id
          var elem = app.repository.get(id)
          if (elem) {
            var elems = this._sort(elem.getChildNodes())
            _.each(elems, elem => {
              var node = this._makeNode(elem)
              nodes.push(node)
            })
          } else {
            var node = this._makeNode(app.project.getProject())
            nodes.push(node)
          }
          options.success(nodes)
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
    var self = this
    this._tree = this.$tree.kendoTreeView({
      dataSource: this._dataSource,
      dataSpriteCssClassField: 'sprite',
      dataTextField: 'text',
      select: function (e) {
        var item = this.dataItem(e.node)
        var elem = app.repository.get(item._id)
        if (elem) {
          self._selectedElement = elem
          self.$unspecified.attr('checked', false)
        }
      }
    }).data('kendoTreeView')
  }

  /**
   * Return JSON object for tree node for a given element.
   * @private
   * @param {Core.Element} elem
   * @return {{_id: string, text: string, sprite: string, hasChildren: boolean}}
   */
  _makeNode (elem) {
    return {
      _id: elem._id,
      text: elem.getNodeText(),
      sprite: elem.getNodeIcon(elem),
      hasChildren: (elem.getChildNodes().length > 0),
      _name: elem.name,
      _namespace: elem._parent ? elem._parent.name || '' : ''
    }
  }

  /**
   * Sort elements.
   * @private
   * @param {Array.<Element>} elements
   * @return {Array.<Element>} - 정렬된 요소들의 배열
   */
  _sort (elements) {
    return _.sortBy(elements, (child, idx) => {
      return child.getOrdering(idx)
    })
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
   * Expand a tree node
   *
   * @param {Core.Model} elem Element to be expanded
   * @param {?boolean} expandAllParents Whether expand all parents or not
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
   * Select an element
   *
   * @param {Core.Model} elem Element to be selected
   * @param {?boolean} scrollTo Whether scroll to the element or not
   */
  select (elem, scrollTo) {
    if (elem) {
      this.expand(elem._parent, true)
      var node = this._getNode(elem)
      if (node) {
        this._tree.select(node)
        // Scroll to node
        if (scrollTo === true) {
          this.$treeWrapper.animate({
            scrollTop: node.offset().top - this.$treeWrapper.offset().top + this.$treeWrapper.scrollTop()
          }, 500)
        }
        $(exports).triggerHandler('selected', [elem])
      }
    } else {
      this._tree.select($())
    }
  }

  _setupQuickSearch ($dlg) {
    var self = this
    var searchDataSource = new kendo.data.DataSource({
      transport: {
        read: function (options) {
          if (options.data.filter && options.data.filter.filters.length > 0) {
            var keyword = options.data.filter.filters[0].value
            var results = app.repository.search(keyword)
            options.success(_.map(results, self._makeNode))
          } else {
            options.success([])
          }
        }
      },
      serverFiltering: true
    })

    $dlg.find('.quick-search').kendoAutoComplete({
      dataTextField: 'text',
      minLength: 1,
      filter: 'contains',
      select: function (e) {
        var item = this.dataItem(e.item.index())
        var elem = app.repository.get(item._id)
        if (elem) {
          self._selectedElement = elem
          self.$unspecified.attr('checked', false)
          self.select(elem, true)
        }
      },
      template: "<div style='white-space: nowrap'>" +
      "<span class='k-sprite #:data.sprite#'></span>" +
      "<span style='margin-left: 5px'>#:data.text#</span>" +
      "#if (data._namespace.length > 0) {# <span style='margin-left: 5px; font-size: 11px; color: rgb(139,139,139);'> — #:data._namespace#</span> #}#<div>",
      dataSource: searchDataSource
    })

    $dlg.find('.quick-search').focus()
  }

  /**
   * Show Element Picker Dialog
   *
   * @param {string} title Title of the dialog
   * @param {?Element} selected Initial selected element when the dialog is shown
   * @param {?constructor} type Type of selectable element
   * @return {Dialog}
   */
  showDialog (title, selected, type) {
    var context = {
      Strings: Strings,
      title: title
    }
    var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context), true, ($dlg) => {
      if (($dlg.data('buttonId') === 'ok') && (type !== null) && _.isObject(this._selectedElement) && !(this._selectedElement instanceof type)) {
        $dlg.data('buttonId', 'cancel')
        $dlg.data('returnValue', this._selectedElement)
        _.defer(() => {
          app.dialogs.showAlertDialog('Selected element (' + this._selectedElement.name + ') is not an instance of ' + type.name)
        })
      } else {
        $dlg.data('returnValue', this._selectedElement)
      }
    })

    var $dlg = dialog.getElement()
    this.$unspecified = $dlg.find('.unspecified')
    this.$treeWrapper = $dlg.find('.treeview-wrapper')
    this.$tree = $dlg.find('.treeview')

    var $wrapper = $dlg.find('.treeview-wrapper')
    ViewUtils.addScrollerShadow($wrapper, null, true)

    this._setupTree()

    // Expand the root node
    var item = this._dataSource.get(app.project.getProject()._id)
    var node = this._tree.findByUid(item.uid)
    this._tree.expand(node)

    // Setup Unspecified Checkbox
    this.$unspecified.change(() => {
      var checked = this.$unspecified.is(':checked')
      if (checked) {
        this._tree.select($()) // clear selection
        this._selectedElement = null
      }
    })

    // Initial selection
    if (selected) {
      this._selectedElement = selected
      this.select(this._selectedElement, true)
    } else {
      this._selectedElement = null
      this.$unspecified.attr('checked', true)
    }

    // Setup Quick Search Widget
    this._setupQuickSearch($dlg)

    return dialog
  }

}

module.exports = ElementPickerDialog
