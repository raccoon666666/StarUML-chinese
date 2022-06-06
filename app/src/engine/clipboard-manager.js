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
const {clipboard} = require('electron')
const {IdGenerator, Element} = require('../core/core')
const {Reader, Writer} = require('../core/repository')

// Clipboard Data Kinds
const DK_MODEL = 'model'
const DK_VIEWS = 'views'

/**
 * Clipboard Manager
 * @private
 */
class ClipboardManager {

  constructor () {
    /**
     * Clipboard Data
     * @private
     */
    this.clipboardData = {
      kind: null,   // data kind
      type: null,   // type of element in clipboard
      data: null,   // data
      context: null // parent info of the copied element(s)
    }

    /**
     * A reference to repository
     * @private
     */
    this.repository = null
  }

  /**
   * Replace all ids of elem and it's descendants
   *
   * @private
   */
  _replaceIds (idMap, elem) {
    elem.traverse((e) => {
      var oldId = e._id
      var newId = IdGenerator.generateGuid()
      idMap[oldId] = newId
      e._id = newId
    })
  }

  /**
   * Resolve all refernces of elem
   *
   * @private
   */
  _resolveRefs (idMap, elem) {
    for (var name in elem) {
      var val = elem[name]
      if (val && val.$ref) {
        if (_.has(idMap, val.$ref)) {
          elem[name] = idMap[val.$ref]
        } else {
          elem[name] = this.repository.get(val.$ref)
        }
      }
    }
  }

  /**
   * Write clipboard to system clipboard
   * @private
   */
  writeToClipboard () {
    const json = JSON.stringify(this.clipboardData)
    clipboard.writeText(json)
  }

  /**
   * Read from system clipboard
   * @private
   */
  readFromClipboard () {
    const json = clipboard.readText()
    try {
      this.clipboardData = JSON.parse(json)
    } catch (err) {
      this.clipboardData = null
    }
  }

  /**
   * Set (Copy) Model to Clipboard
   *
   * Copy Context
   * - id : parent's id
   * - type : parent's type
   * - field : parent's array or reference field containing the copied model
   *
   * @param {Model} model
   */
  setModel (model) {
    var writer = new Writer()
    model.save(writer)
    // Set Clipboard Data
    this.clipboardData = {
      kind: DK_MODEL,
      type: model.getClassName(),
      data: writer.current
    }
    // Set Copy Context
    if (model._parent) {
      this.clipboardData.context = {
        id: model._parent._id,
        type: model._parent.getClassName(),
        field: model.getParentField()
      }
    }
    this.writeToClipboard()
  }

  /**
   * Set views to clipboard
   *
   * @param {Array<View>} views
   */
  setViews (views) {
    var writer = new Writer()
    writer.writeObjArray('data', views)
    // Set clipboard data
    this.clipboardData = {
      kind: DK_VIEWS,
      type: null,
      data: writer.current.data
    }
    // Collect all outer refs (refs to elements not in clipboard)
    let allIds = []
    let outerRefs = []
    views.forEach(v => {
      if (!allIds.includes(v._parent._id)) {
        allIds.push(v._parent._id)
      }
      v.traverse(e => {
        if (!allIds.includes(e._id)) {
          allIds.push(e._id)
        }
      })
    })
    views.forEach(v => {
      v.traverse(e => {
        for (let key in e) {
          let val = e[key]
          if (val instanceof Element && val._id) {
            if (!allIds.includes(val._id)) {
              if (!outerRefs.includes(val._id)) {
                outerRefs.push(val._id)
                console.log(val)
              }
            }
          }
        }
      })
    })
    // Set copy context
    if ((views.length > 0) && (views[0].getDiagram())) {
      var diagram = views[0].getDiagram()
      this.clipboardData.context = {
        id: diagram._id,
        type: diagram.getClassName(),
        refs: outerRefs // references to elements not in clipboard
      }
    }
    this.writeToClipboard()
  }

  /**
   * Get Model from Clipboard
   * (All elements are cloned from Clipboard)
   *
   * @return {Model}
   */
  getModel () {
    this.readFromClipboard()
    if (this.clipboardData !== null && this.clipboardData.kind === DK_MODEL && this.clipboardData.data) {
      var reader = new Reader(this.clipboardData, global.type)
      var model = reader.readObj('data')
      // resolve all references
      for (var id in reader.idMap) {
        var obj = reader.idMap[id]
        this._resolveRefs(reader.idMap, obj)
      }
      // replace all ids
      var replaceMap = {}
      this._replaceIds(replaceMap, model)
      return model
    }
    return null
  }

  /**
   * Get Views from Clipboard
   *
   * @return {Array<View>}
   */
  getViews () {
    this.readFromClipboard()
    if (this.clipboardData !== null && this.clipboardData.kind === DK_VIEWS && this.clipboardData.data) {
      var reader = new Reader(this.clipboardData, global.type)
      var views = reader.readObjArray('data')
      // resolve all references
      for (var id in reader.idMap) {
        var obj = reader.idMap[id]
        this._resolveRefs(reader.idMap, obj)
      }
      // replace all ids
      var replaceMap = {}
      for (var i = 0; i < views.length; i++) {
        this._replaceIds(replaceMap, views[i])
      }
      return views
    }
    return null
  }

  /**
   * Whether clipboard has model data or not
   * @return {boolean}
   */
  hasModel () {
    this.readFromClipboard()
    if (this.clipboardData) {
      return this.clipboardData.kind === DK_MODEL
    }
  }

  /**
   * Whether clipboard has views data or not
   * @return {boolean}
   */
  hasViews () {
    this.readFromClipboard()
    if (this.clipboardData) {
      return this.clipboardData.kind === DK_VIEWS
    }
  }

  /**
   * Get Type of Element in Clipboard
   *
   * @return {string}
   */
  getElementType () {
    this.readFromClipboard()
    if (this.clipboardData) {
      return this.clipboardData.type
    }
  }

  /**
   * Get Copy Context in Clipboard
   * @private
   * @return {Object}
   */
  getCopyContext () {
    this.readFromClipboard()
    if (this.clipboardData) {
      return this.clipboardData.context
    }
  }

}

module.exports = ClipboardManager
