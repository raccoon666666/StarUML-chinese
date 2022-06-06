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

/* eslint-disable no-unused-vars */

const fs = require('fs')
const Mustache = require('mustache')
const path = require('path')
const ViewUtils = require('../utils/view-utils')
const Sortable = require('sortablejs')

const itemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/working-diagrams-view-item.html'), 'utf8')

/**
 * WorkingDiagramsView
 * @private
 */
class WorkingDiagramsView {

  constructor () {
    /**
     * JQuery Object for ListView
     * @private
     * @type{JQuery}
     */
    this.$listview = null

    this.diagramManager = null
    this.repository = null
  }

  /**
   * Add Working Diagram
   * @private
   */
  addWorkingDiagram (diagram) {
    if (diagram) {
      let self = this
      var $item = $(Mustache.render(itemTemplate, diagram))
      $('.close-button', $item).click(function (e) {
        self.diagramManager.closeDiagram(diagram)
        e.stopPropagation()
      })
      $item.click(function () {
        self.diagramManager.setCurrentDiagram(diagram)
      })
      this.$listview.append($item)
    }
  }

  /**
   * Remove Working Diagram
   * @private
   */
  removeWorkingDiagram (diagram) {
    if (diagram) {
      var $item = $(".working-diagram[data-id='" + diagram._id + "']", this.$listview)
      $item.remove()
    }
  }

  /**
   * Update Working Diagram
   * @private
   */
  updateWorkingDiagram (diagram) {
    if (diagram) {
      var $item = $(".working-diagram[data-id='" + diagram._id + "']", this.$listview)
      var $name = $('.name', $item)
      var $namespace = $('.namespace', $item)
      $name.html(diagram.name)
      if (diagram._parent) {
        $namespace.html(diagram._parent.name)
      }
    }
  }

  /**
   * Clear all working diagrams
   * @private
   */
  clearWorkingDiagrams () {
    this.$listview.empty()
  }

  /**
   * Update Working Diagrams
   * @private
   */
  updateAllWorkingDiagrams (diagrams) {
    this.$listview.empty()
    for (var i = 0, len = diagrams.length; i < len; i++) {
      var item = diagrams[i]
      this.addWorkingDiagram(item)
    }
  }

  /**
   * Set Current Diagram
   * @private
   */
  setCurrentDiagram (diagram) {
    if (diagram) {
      $('.working-diagram', this.$listview).removeClass('selected')
      var $item = $(".working-diagram[data-id='" + diagram._id + "']", this.$listview)
      $item.addClass('selected')
    }
  }

  /**
   * @private
   * @returns {string[]}
   */
  getIds () {
    const ids = []
    const len = this.$listview.children().length
    for (let i = 0; i < len; i++) {
      ids.push($(this.$listview.children()[i]).data('id'))
    }
    return ids
  }

  /**
   * @private
   */
  htmlReady () {
    var $workingDiagrams = $('#working-diagrams')
    const viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/working-diagrams-view.html'), 'utf8')
    var $view = $(viewTemplate)
    var $content = $view.find('.view-content')
    $workingDiagrams.append($view)
    this.$listview = $workingDiagrams.find('.listview')

    ViewUtils.addScrollerShadow($content.get(0), null, true)

    this.diagramManager.on('workingDiagramsClear', () => {
      try {
        this.clearWorkingDiagrams()
      } catch (err) {
        console.error(err)
      }
    })

    this.diagramManager.on('workingDiagramAdd', (diagram) => {
      try {
        this.addWorkingDiagram(diagram)
      } catch (err) {
        console.error(err)
      }
    })

    this.diagramManager.on('workingDiagramRemove', (diagram) => {
      try {
        this.removeWorkingDiagram(diagram)
      } catch (err) {
        console.error(err)
      }
    })

    this.diagramManager.on('workingDiagramUpdate', (diagram) => {
      try {
        this.updateWorkingDiagram(diagram)
      } catch (err) {
        console.error(err)
      }
    })

    this.diagramManager.on('currentDiagramChanged', (diagram, editor) => {
      try {
        if (diagram) {
          this.setCurrentDiagram(diagram)
        }
      } catch (err) {
        console.error(err)
      }
    })

    this.repository.on('updated', (elems) => {
      if (Array.isArray(elems)) {
        const ids = this.getIds()
        elems.forEach(elem => {
          if (Array.isArray(elem.ownedElements)) {
            elem.ownedElements.forEach(owned => {
              if (ids.includes(owned._id)) {
                this.updateWorkingDiagram(owned)
              }
            })
          }
        })
      }
    })

    // Make listview sortable
    var sort = new Sortable(this.$listview.get(0))
  }
}

module.exports = WorkingDiagramsView
