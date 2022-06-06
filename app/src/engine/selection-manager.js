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
const {EventEmitter} = require('events')

/**
 * Selection Manager
 */
class SelectionManager extends EventEmitter {

  constructor () {
    super()
    this.setMaxListeners(100)

    /**
     * 선택된 모델 요소들
     * @private
     * @type {Array.<Model>}
     */
    this.selectedModels = []

    /**
     * 선택된 뷰 요소들
     * @private
     * @type {Array.<View>}
     */
    this.selectedViews = []
  }

  /**
   * 요소 선택 이벤트 발생
   * @private
   */
  triggerEvent () {
    /**
     * Triggered when selection is changed
     * @name selectionChanged
     * @kind event
     * @memberof SelectionManager
     * @property {Array<Model>} selectedModels An array of selected model elements
     * @property {Array<View>} selectedViews An array of selected view elements
     */
    this.emit('selectionChanged', this.selectedModels, this.selectedViews)
  }

  isChanged (models, views) {
    models = models || []
    views = views || []
    var i, len, m, v
    for (i = 0, len = models.length; i < len; i++) {
      m = models[i]
      if (!_.includes(this.selectedModels, m)) {
        return true
      }
    }
    for (i = 0, len = this.selectedModels.length; i < len; i++) {
      m = this.selectedModels[i]
      if (!_.includes(models, m)) {
        return true
      }
    }
    for (i = 0, len = views.length; i < len; i++) {
      v = views[i]
      if (!_.includes(this.selectedViews, v)) {
        return true
      }
    }
    for (i = 0, len = this.selectedViews.length; i < len; i++) {
      v = this.selectedViews[i]
      if (!_.includes(views, v)) {
        return true
      }
    }
    return false
  }

  /**
   * Return selected model elements.
   *
   * @return {Array.<Model>} Array of selected model elements.
   */
  getSelectedModels () {
    return this.selectedModels
  }

  /**
   * Return selected view elements.
   *
   * @return {Array.<View>} Array of selected view elements.
   */
  getSelectedViews () {
    return this.selectedViews
  }

  /**
   * Deselect all elements.
   */
  deselectAll () {
    if (this.isChanged([], [])) {
      this.selectedViews = []
      this.selectedModels = []
      this.triggerEvent()
    }
  }

  /**
   * Select elements (models and views)
   * @param {Array.<Model>} models Model elements to be selected.
   * @param {Array.<View>} views View elements to be selected.
   */
  select (models, views) {
    if (this.isChanged(models, views)) {
      this.selectedModels = models
      this.selectedViews = views
      if (!Array.isArray(this.selectedModels)) {
        this.selectedModels = []
      }
      if (!Array.isArray(this.selectedViews)) {
        this.selectedViews = []
      }
      this.triggerEvent()
    }
  }

  /**
   * Select a model element
   * @param {Model} model Model element to be selected.
   */
  selectModel (model) {
    if (this.isChanged([model], [])) {
      this.selectedModels = [model]
      this.triggerEvent()
    }
  }

  /**
   * Select view elements
   * @param {Array.<View>} views Array of view elements to be selected.
   */
  selectViews (views) {
    if ((views !== null) && views.length > 0) {
      var _tempModels = []
      for (var i = 0, len = views.length; i < len; i++) {
        var v = views[i]
        if (v.model !== null) {
          _tempModels.push(v.model)
        }
      }
      if (this.isChanged(views, _tempModels)) {
        this.selectedViews = views
        this.selectedModels = _tempModels
        this.triggerEvent()
      }
    } else {
      this.deselectAll()
    }
  }

  /**
   * Return the first selected model element.
   */
  getSelected () {
    return this.selectedModels[0]
  }
}

module.exports = SelectionManager
