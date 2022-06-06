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

// const _ = require('lodash')
// const Mustache = require('mustache')
// const keycode = require('keycode')
// const {Point, Rect, GridFactor, Coord} = require('../core/graphics')
const fs = require('fs')
const path = require('path')
const {EventEmitter} = require('events')

/**
 * Quick Find
 * @private
 */
class QuickFind extends EventEmitter {
  constructor () {
    super()

    this.$view = null
    this.autoComplete = null

    /** A reference to an instance of KeymapManager */
    this.keymapManager = null

    /** A reference to an instance of CommandManager */
    this.commandManager = null
  }

  /**
   * Find elements (models, views, diagrams)
   * @param {string} match
   * @return {Array<{id:string, name:string, handler:Function}>}
   */
  findElements (match) {
    var elems = []
    var results = app.repository.search(match)
    if (results.length > 100) {
      results = results.slice(0, 99)
    }
    results.forEach(elem => {
      const options = {
        showStereotype: false
      }
      let item = {
        _id: elem._id,
        text: elem.getNodeText(options),
        sprite: elem.getNodeIcon(elem),
        _namespace: elem._parent ? elem._parent.getNodeText(options) || '' : '',
        _diagram: ''
      }
      elems.push(item)
      const views = app.repository.getViewsOf(elem)
      if (views.length > 0) {
        views.forEach(view => {
          if (view._parent instanceof type.Diagram) {
            elems.push({
              _id: view._id,
              text: view.model.getNodeText(options),
              sprite: view.model.getNodeIcon(view.model),
              _namespace: '',
              _diagram: view._parent ? view._parent.name || '' : '',
              _diagramSprite: view._parent.getNodeIcon(view._parent)
            })
          }
        })
      }
    })
    return elems
  }

  setupInput () {
    var self = this
    var searchDataSource = new kendo.data.DataSource({
      transport: {
        read: function (options) {
          if (options.data.filter && options.data.filter.filters.length > 0) {
            var keyword = options.data.filter.filters[0].value
            var elems = self.findElements(keyword)
            options.success(elems)
          } else {
            options.success(self.findElements())
          }
        }
      },
      serverFiltering: true
    })

    this.autoComplete = $('#quick-find-input').kendoAutoComplete({
      dataTextField: 'text',
      minLength: 1,
      placeholder: 'Find models, views and diagrams...',
      filter: 'contains',
      select: function (e) {
        var item = this.dataItem(e.item.index())
        self.close()
        setTimeout(() => {
          let elem = app.repository.get(item._id)
          if (elem instanceof type.Model) {
            app.modelExplorer.select(elem, true)
            if (elem instanceof type.Diagram) {
              app.diagrams.setCurrentDiagram(elem)
            }
          } else if (elem instanceof type.View) {
            app.modelExplorer.select(elem.model, true)
            app.diagrams.selectInDiagram(elem)
          }
        }, 10)
      },
      template: `<div style='white-space: nowrap'>
        <span class='k-sprite #:data.sprite#'></span>
        <span style='margin-left: 5px'>#:data.text#</span>
        #if (data._namespace.length > 0) {#
          <span style='margin-left: 5px; font-size: 11px; color: rgb(139,139,139);'> — 
          #:data._namespace#
          </span> 
        #}#
        #if (data._diagram.length > 0) {#
          <span>
            <span style='margin-left: 5px; margin-right: 5px; color: rgb(139,139,139);'> — </span>
            <span class='k-sprite #:data._diagramSprite#'></span>
            <span style='margin-left: 5px'>#:data._diagram#</span>
          </span>  
        #}#
      <div>
      `,
      dataSource: searchDataSource
    }).data('kendoAutoComplete')

    var $input = $('#quick-find-input')
    $input.focusout(() => {
      this.close()
    })
    $input.keydown((e) => {
      if (e.keyCode === 27) { // ESC
        this.close()
      }
    })
  }

  showModal () {
    this.$view.css('display', 'flex')
    this.autoComplete.focus()
  }

  close () {
    var $input = $('#quick-find-input')
    $input.val('')
    this.$view.hide()
  }

  htmlReady () {
    const viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/quick-find.html'), 'utf8')
    this.$view = $(viewTemplate)
    $('.main-view').append(this.$view)
    this.setupInput()
  }
}

module.exports = QuickFind
