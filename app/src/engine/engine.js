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

const Core = require('../core/core')
const _ = require('lodash')

/**
 * Engine has fundamental operations to manipulate model and view elements.
 */
class Engine {

  constructor () {
    /**
     * A reference to repository
     * @private
     */
    this.repository = null
  }

  /**
   * Add a model element
   *
   * @param {Model} parent
   * @param {string} field
   * @param {Model} model - model element to be added
   * @return {Model}
   */
  addModel (parent, field, model) {
    if (!parent || !field || !model) {
      console.error('Engine.addModel(): missing required parameters: parent, field, or model.')
      return null
    }
    if (!parent[field]) {
      console.error('Engine.addModel(): ' + field + ' is not defined in parent parameter.')
      return null
    }
    if (parent !== null) {
      let operationBuilder = this.repository.getOperationBuilder()
      operationBuilder.begin('add model')
      model._parent = parent
      operationBuilder.insert(model)
      operationBuilder.fieldInsert(parent, field, model)
      operationBuilder.end()
      var cmd = operationBuilder.getOperation()
      this.repository.doOperation(cmd)
    }
    if (model) {
      return this.repository.get(model._id)
    }
  }

  /**
   * Add view elements.
   *
   * @param {diagram} diagram Diagram where added views to be placed.
   * @param {Array.<Core.View>} views Views to be added.
   */
  addViews (diagram, views) {
    if (!diagram || !views) {
      console.error('Engine.addViews(): missing required parameters: diagram or views')
      return null
    }

    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('add views')
    for (var i = 0, len = views.length; i < len; i++) {
      var view = views[i]
      view._parent = diagram
      operationBuilder.insert(view)
      operationBuilder.fieldInsert(diagram, 'ownedViews', view)
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Add a model element and a view element.
   *
   * @param {Diagram} diagram Diagram where added views to be placed.
   * @param {Model} model Model element to be added.
   * @param {View} view View element to be added.
   * @param {Model} parent Parent element to contain the model element
   * @param {?string} parentField Array field name of the parent (default = 'ownedElements')
   * @param {?View} containerView Container view where the view element to be contained (optional)
   */
  addModelAndView (diagram, model, view, parent, parentField, containerView) {
    if (!diagram || !model || !view || !parent) {
      console.error('Engine.addModelAndView(): missing required parameters: diagram, model, view or parent')
      return null
    }

    var field = 'ownedElements'
    if (parentField) {
      field = parentField
    }

    if (!parent[field]) {
      console.error('Engine.addModelAndView(): ' + field + ' is not defined in parent parameter.')
      return null
    }

    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('add element')
    // model
    model._parent = parent
    operationBuilder.insert(model)
    operationBuilder.fieldInsert(parent, field, model)
    // view
    view.model = model
    view._parent = diagram
    if (containerView) {
      view.containerView = containerView
    }
    operationBuilder.insert(view)
    operationBuilder.fieldInsert(diagram, 'ownedViews', view)
    if (containerView) {
      operationBuilder.fieldInsert(containerView, 'containedViews', view)
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)

    if (view) {
      return this.repository.get(view._id)
    }
  }

  /**
   * Set value to a property of an element.
   *
   * @param {Element} elem
   * @param {string} field
   * @param {Object} value
   */
  setProperty (elem, field, value) {
    if (!elem || !field) {
      console.error('Engine.setProperty(): missing required parameters: elem or field')
      return null
    }

    if (typeof elem[field] === 'undefined') {
      console.error('Engine.setProperty(): ' + field + ' is not defined in elem parameter.')
      return null
    }

    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change property')
    operationBuilder.fieldAssign(elem, field, value)
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Set values to multiple properties of an elements.
   *
   * @param {Element} elem
   * @param {Object.<{string,?}>} fieldValueMap
   */
  setProperties (elem, fieldValueMap) {
    if (!elem || !fieldValueMap) {
      console.error('Engine.setProperties(): missing required parameters: elem or fieldValueMap')
      return null
    }
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change properties')
    var field, value
    for (field in fieldValueMap) {
      if (fieldValueMap.hasOwnProperty(field)) {
        value = fieldValueMap[field]
        operationBuilder.fieldAssign(elem, field, value)
      }
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Set value to a property of multiple elements
   *
   * @param {Array.<View>} views
   * @param {string} field
   * @param {Object} value
   */
  setElemsProperty (elems, field, value) {
    if (!elems || !field) {
      console.error('Engine.setElemsProperty(): missing required parameters: elems or field')
      return null
    }

    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change property')
    for (var i = 0, len = elems.length; i < len; i++) {
      var elem = elems[i]
      if (!_.isUndefined(elem[field])) {
        operationBuilder.fieldAssign(elem, field, value)
      }
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Determine a set of elements to be deleted.
   * @private
   * @param {Array.<Model>} models A set of model elements to be deleted.
   * @param {Array.<View>} views A set of view elements to be deleted.
   */
  _determineDeletingElements (models, views) {
    var changed = false

    // 1) exclude undeletable models
    _.each(models, m => {
      if (m instanceof Core.Project) {
        if (models.indexOf(m) > -1) {
          models.splice(models.indexOf(m), 1)
        }
      }
    })
    do {
      changed = false
      // 2) include models owned by
      _.each(models, m => {
        _.each(m.getChildren(), child => {
          if (!_.includes(models, child)) {
            models.push(child)
            changed = true
          }
        })
      })
      // 3) include relations of
      _.each(models, (m) => {
        _.each(this.repository.getRelationshipsOf(m), (rel) => {
          if (!_.includes(models, rel)) {
            models.push(rel)
            changed = true
          }
        })
      })
      // 4) include views of
      _.each(models, (m) => {
        _.each(this.repository.getViewsOf(m), (v) => {
          if (!_.includes(views, v)) {
            views.push(v)
            changed = true
          }
        })
      })
      // 5) include contained views of
      _.each(views, (v) => {
        _.each(v.containedViews, (cv) => {
          if (!_.includes(views, cv)) {
            views.push(cv)
            changed = true
          }
        })
      })
      // 6) include subviews of
      _.each(views, (v) => {
        _.each(v.subViews, (sub) => {
          if (!_.includes(views, sub)) {
            views.push(sub)
            changed = true
          }
        })
      })
      // 7) include edge views of
      _.each(views, (v) => {
        _.each(this.repository.getEdgeViewsOf(v), (edge) => {
          if (!_.includes(views, edge)) {
            views.push(edge)
            changed = true
          }
        })
      })
      // 8) include parasitic views of
      _.each(views, (v) => {
        var _parasiticViews = this.repository.getRefsTo(v, (_refTo) => {
          return ((_refTo instanceof type.NodeParasiticView) && (_refTo.hostNode === v)) ||
            ((_refTo instanceof type.EdgeParasiticView) && (_refTo.hostEdge === v))
        })
        _.each(_parasiticViews, (parasiticView) => {
          if (!_.includes(views, parasiticView)) {
            views.push(parasiticView)
            changed = true
          }
        })
      })
      // 9) customizable deleting models and views (plug-in dependent)
      //    e.g) _includeRelatedViewsOf(data);
      //    e.g.) _includeModelsThatShouldBeDeletedWithViews(data);
    } while (changed)
  }

  /**
   * Determine elements referencing to a particular set of elements.
   *
   * @private
   * @param {Array.<Element>} elems A set of elements
   * @return {Array.<Element>} Elements referencing to the set of elements
   */
  _determineOutsideElements (elems) {
    var outsides = []
    _.each(elems, (e) => {
      _.each(this.repository.getRefsTo(e), (ref) => {
        if (!_.includes(outsides, ref) && !_.includes(elems, ref)) {
          outsides.push(ref)
        }
      })
    })
    return outsides
  }

  /**
   * Delete elements.
   *
   * @param {Array.<Model>} models Model elements to be deleted.
   * @param {Array.<View>} views View elements to be deleted.
   */
  deleteElements (models, views) {
    if (!models || !views) {
      console.error('Engine.deleteElements(): missing required parameters: models or views')
      return null
    }

    var ms = _.clone(models)
    var vs = _.clone(views)

    // 1) determine deleting elements
    this._determineDeletingElements(ms, vs)

    // 2) determine outside elements (which referencing deleting elements)
    var all = _.union(ms, vs)
    var outsides = this._determineOutsideElements(all)

    // 3) make delete operation and execute
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('delete elements')

    // 3.1) - 외부로부터의 참조는 모두 제거하도록 한다.
    _.each(outsides, (elem) => {
      _.each(elem.getMetaAttributes(), attr => {
        switch (attr.kind) {
        case Core.Element.AK_OBJ:
        case Core.Element.AK_REF:
          var ref = elem[attr.name]
          if (ref && _.includes(all, ref)) {
            operationBuilder.fieldAssign(elem, attr.name, null)
          }
          break
        case Core.Element.AK_OBJS:
        case Core.Element.AK_REFS:
          var refs = elem[attr.name]
          if (refs && refs.length > 0) {
            for (var i = 0; i < refs.length; i++) {
              var ref2 = refs[i]
              if (ref2._id && _.includes(all, ref2)) {
                operationBuilder.fieldRemove(elem, attr.name, ref2)
              }
            }
          }
          break
        }
      })
    })

    // 3.2) - 중복 삭제 제거하기
    // OperationBuilder의 remove는 모든 하위 요소들의 삭제들도 함께 제거하기 때문에
    // 하위 요소들을 중복해서 삭제하지 않도록 하는것이 효율적이다.
    var subElements = []
    _.each(all, (e) => {
      var children = e.getChildren()
      _.each(children, (c) => {
        if (!_.includes(subElements, c)) {
          subElements.push(c)
        }
      })
    })
    for (let i = vs.length - 1; i >= 0; i--) {
      let v = vs[i]
      if (_.includes(subElements, v)) {
        if (vs.indexOf(v) > -1) {
          vs.splice(vs.indexOf(v), 1)
        }
      }
    }
    for (let i = ms.length - 1; i >= 0; i--) {
      let m = ms[i]
      if (_.includes(subElements, m)) {
        if (ms.indexOf(m) > -1) {
          ms.splice(ms.indexOf(m), 1)
        }
      }
    }

    // 3.3) - 뷰 요소들 삭제
    _.each(vs, v => {
      operationBuilder.remove(v)
    })

    // 3.4) - 모델 요소들 삭제
    _.each(ms, m => {
      operationBuilder.remove(m)
    })
    operationBuilder.end()
    this.repository.doOperation(operationBuilder.getOperation())
  }

  /**
   * Add an item to a particular array field of an element.
   *
   * @param {Element} elem
   * @param {string} field
   * @param {Element} val
   */
  addItem (elem, field, val) {
    if (!elem || !field) {
      console.error('Engine.addItem(): missing required parameters: elem or field')
      return null
    }

    if (_.isArray(elem[field])) {
      let operationBuilder = this.repository.getOperationBuilder()
      operationBuilder.begin('add item')
      operationBuilder.fieldInsert(elem, field, val)
      operationBuilder.end()
      var cmd = operationBuilder.getOperation()
      this.repository.doOperation(cmd)
    }
  }

  /**
   * Remove an item from a particular array field of an element.
   *
   * @param {Element} elem
   * @param {string} field
   * @param {Element} val
   */
  removeItem (elem, field, val) {
    if (!elem || !field) {
      console.error('Engine.removeItem(): missing required parameters: elem or field')
      return null
    }

    if (_.isArray(elem[field])) {
      let operationBuilder = this.repository.getOperationBuilder()
      operationBuilder.begin('remove item')
      operationBuilder.fieldRemove(elem, field, val)
      operationBuilder.end()
      var cmd = operationBuilder.getOperation()
      this.repository.doOperation(cmd)
    }
  }

  /**
   * Reorder an item of array field of an element to index - 1.
   *
   * @param {Element} parent
   * @param {string} field
   * @param {Element} elem
   */
  moveUp (parent, field, elem) {
    if (!parent || !field) {
      console.error('Engine.moveUp(): missing required parameters: parent or field')
      return null
    }

    // Find above index considering sort by type ordering.
    var array = parent[field]
    var sortedArray = _.sortBy(array, (child, idx) => {
      return child.getOrdering(idx)
    })
    var indexInSortedArray = _.indexOf(sortedArray, elem)
    var above
    var index = 0
    if (indexInSortedArray > 0) {
      above = sortedArray[indexInSortedArray - 1]
      index = _.indexOf(array, above)
    }

    // Make move up operation
    if (index >= 0) {
      let operationBuilder = this.repository.getOperationBuilder()
      operationBuilder.begin('move up')
      operationBuilder.fieldReorder(parent, field, elem, index)
      operationBuilder.end()
      var cmd = operationBuilder.getOperation()
      this.repository.doOperation(cmd)
    }
  }

  /**
   * Reorder an item of array field of an element to index + 1.
   *
   * @param {Element} parent
   * @param {string} field
   * @param {Element} elem
   */
  moveDown (parent, field, elem) {
    if (!parent || !field) {
      console.error('Engine.moveDown(): missing required parameters: parent or field')
      return null
    }

    // Find below index considering sort by type ordering.
    var array = parent[field]
    var sortedArray = _.sortBy(array, (child, idx) => {
      return child.getOrdering(idx)
    })
    var indexInSortedArray = _.indexOf(sortedArray, elem)
    var below
    var index = 0
    if (indexInSortedArray >= 0 && indexInSortedArray < sortedArray.length - 1) {
      below = sortedArray[indexInSortedArray + 1]
      index = _.indexOf(array, below)
    }

    // Make move down operation
    if (index < array.length) {
      let operationBuilder = this.repository.getOperationBuilder()
      operationBuilder.begin('move down')
      operationBuilder.fieldReorder(parent, field, elem, index)
      operationBuilder.end()
      var cmd = operationBuilder.getOperation()
      this.repository.doOperation(cmd)
    }
  }

  /**
   * Relocate an element to a new owner (parent).
   *
   * @param {Element} elem
   * @param {Element} newOwner
   * @param {string} field
   */
  relocate (elem, newOwner, field) {
    if (!elem || !newOwner || !field) {
      console.error('Engine.relocate(): missing required parameters: elem, newOwner or field')
      return null
    }

    var oldOwner = elem._parent
    if ((oldOwner !== newOwner) && oldOwner[field] && _.includes(oldOwner[field], elem) && newOwner[field]) {
      let operationBuilder = this.repository.getOperationBuilder()
      operationBuilder.begin('relocate')
      operationBuilder.fieldRelocate(elem, field, oldOwner, newOwner)
      var cmd = operationBuilder.getOperation()
      this.repository.doOperation(cmd)
    }
  }

  /**
   * Move views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {number} dx
   * @param {number} dy
   */
  moveViews (editor, views, dx, dy) {
    if (!editor || !views) {
      console.error('Engine.moveView(): missing required parameters: editor or views')
      return null
    }

    if (!_.isNumber(dx) || !_.isNumber(dy)) {
      console.error('Engine.moveView(): dx and dy should be number type')
      return null
    }

    // 1. 이동할 뷰들을 결정
    var moveViews = []
    var changed = false
    moveViews = _.concat(moveViews, views)
    // 1.1) ContainedViews 포함하기
    do {
      changed = false
      _.each(moveViews, v => {
        _.each(v.containedViews, v1 => {
          if (!_.includes(moveViews, v1)) {
            moveViews.push(v1)
            changed = true
          }
        })
        // subViews의 containedViews도 포함
        _.each(v.subViews, v2 => {
          _.each(v2.subViews, v3 => {
            if (!_.includes(moveViews, v3)) {
              moveViews.push(v3)
              changed = true
            }
          })
        })
      })
    } while (changed)
    // 1.2) Self-Linked EdgeViews들 포함하기
    editor.diagram.traverse(v => {
      if ((v instanceof Core.EdgeView) && _.includes(moveViews, v.head) && (v.head === v.tail) && !_.includes(moveViews, v)) {
        if (!_.includes(moveViews, v)) {
          moveViews.push(v)
        }
      }
    })
    // 1.3) Head 및 Tail 측이 모두 이동하는 경우, 해당 EdgeViews들 포함하기
    editor.diagram.traverse(v => {
      if ((v instanceof Core.EdgeView) && _.includes(moveViews, v.head) && _.includes(moveViews, v.tail) && !_.includes(moveViews, v)) {
        if (!_.includes(moveViews, v)) {
          moveViews.push(v)
        }
      }
    })
    // 2. 이동으로 인하여 변경될 수 있는 Views의 상태들 기억하기
    var changes = []
    changes = _.concat(changes, moveViews)
    editor.diagram.traverse(v => {
      // 이동하는 Views들을 연결하는 Edge 뷰들도 변경 대상에 포함. (노드가 이동하면 엣지의 points들이 변경되기 때문)
      if ((v instanceof Core.EdgeView) && (_.includes(changes, v.head) || _.includes(changes, v.tail))) {
        if (!_.includes(changes, v)) { changes.push(v) }
        for (let i = 0, len = v.subViews.length; i < len; i++) {
          let sub = v.subViews[i]
          if (!_.includes(changes, v)) { changes.push(sub) }
        }
      }
    })
    // ContainedViews가 이동하면 ContainerView의 크기가 변한다.
    for (let i = 0, len = moveViews.length; i < len; i++) {
      let v = moveViews[i]
      if ((!_.includes(changes, v.containerView)) && (v.containerView != null)) {
        changes.push(v.containerView)
      }
    }
    // 이동할 뷰들의 상태를 memento에 저장
    var mementoArray = []
    for (let i = 0, len = changes.length; i < len; i++) {
      let v = changes[i]
      let memento = {}
      v.assignTo(memento)
      mementoArray.push(memento)
    }
    // 3. 뷰들을 이동
    for (let i = 0, len = moveViews.length; i < len; i++) {
      let v = moveViews[i]
      v.move(editor.canvas, dx, dy)
    }
    // 모든 뷰들의 크기와 위치를 재계산함.
    editor.repaint()
    // 4. 이동하기전의 Views와 이동후의 Views의 diff를 수행하여 변경된 값들만 추출
    var diffs = []
    for (let i = 0, len = changes.length; i < len; i++) {
      let v = changes[i]
      let ds = v.diff(mementoArray[i])
      diffs = _.concat(diffs, ds)
    }
    // memento에 저장된 Views들의 상태를 복원
    for (let i = 0, len = changes.length; i < len; i++) {
      let v = changes[i]
      v.assignFrom(mementoArray[i])
    }
    // 5. diff의 결과를 바탕으로 operation를 구성하여 수행함.
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('move views')
    for (let i = 0, len = diffs.length; i < len; i++) {
      let d = diffs[i]
      operationBuilder.fieldAssign(d.elem, d.f, d.n)
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Move a parasitic view.
   *
   * @param {Editor} editor
   * @param {ParasiticView} view
   * @param {number} alpha
   * @param {number} distance
   */
  moveParasiticView (editor, view, alpha, distance) {
    if (!editor || !view) {
      console.error('Engine.moveParasiticView(): missing required parameters: editor or view')
      return null
    }

    if (!_.isNumber(alpha) || !_.isNumber(distance)) {
      console.error('Engine.moveParasiticView(): alpha and distance should be number type')
      return null
    }

    var memento = {}
    view.assignTo(memento)
    view.alpha = alpha
    view.distance = distance
    editor.repaint()
    var diffs = view.diff(memento)
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('move parasitic view')
    for (let i = 0, len = diffs.length; i < len; i++) {
      let d = diffs[i]
      operationBuilder.fieldAssign(d.elem, d.f, d.n)
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Resize a node view.
   *
   * @param {Editor} editor
   * @param {NodeView} node
   * @param {number} left
   * @param {number} top
   * @param {number} right
   * @param {number} bottom
   */
  resizeNode (editor, node, left, top, right, bottom) {
    if (!editor || !node) {
      console.error('Engine.resizeNode(): missing required parameters: editor or node')
      return null
    }

    if (!_.isNumber(left) || !_.isNumber(top) || !_.isNumber(right) || !_.isNumber(bottom)) {
      console.error('Engine.resizeNode(): left, top, right and bottom should be number type')
      return null
    }

    var changes, cmd, d, diffs, ds, i, memento, mementoArray, v, _i, _j, _k, _l, _len, _len1, _len2, _len3
    changes = [node]
    editor.diagram.traverse(v => {
      var sub, _i, _len, _ref, _results
      if ((v instanceof Core.EdgeView) && ((v.head === node) || (v.tail === node))) {
        changes.push(v)
        _ref = v.subViews
        _results = []
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sub = _ref[_i]
          _results.push(changes.push(sub))
        }
        return _results
      }
    })
    mementoArray = []
    for (_i = 0, _len = changes.length; _i < _len; _i++) {
      v = changes[_i]
      memento = {}
      v.assignTo(memento)
      mementoArray.push(memento)
    }
    node.left = left
    node.top = top
    node.setRight(right)
    node.setBottom(bottom)
    editor.repaint()
    diffs = []
    for (i = _j = 0, _len1 = changes.length; _j < _len1; i = ++_j) {
      v = changes[i]
      ds = v.diff(mementoArray[i])
      diffs = _.concat(diffs, ds)
    }
    for (i = _k = 0, _len2 = changes.length; _k < _len2; i = ++_k) {
      v = changes[i]
      v.assignFrom(mementoArray[i])
    }
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('resize node')
    for (_l = 0, _len3 = diffs.length; _l < _len3; _l++) {
      d = diffs[_l]
      operationBuilder.fieldAssign(d.elem, d.f, d.n)
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Modify points of an edge view.
   *
   * @param {Editor} editor
   * @param {EdgeView} edge
   * @param {Points} points
   */
  modifyEdge (editor, edge, points) {
    if (!editor || !edge || !points) {
      console.error('Engine.modifyEdge(): missing required parameters: editor, edge, or points')
      return null
    }

    var changes = [edge]
    for (let i = 0, len = edge.subViews.length; i < len; i++) {
      let sub = edge.subViews[i]
      changes.push(sub)
    }
    var mementoArray = []
    for (let j = 0, len = changes.length; j < len; j++) {
      let v = changes[j]
      let memento = {}
      v.assignTo(memento)
      mementoArray.push(memento)
    }
    edge.points.assign(points)
    editor.repaint()
    var diffs = []
    for (let i = 0, len = changes.length; i < len; i++) {
      let v = changes[i]
      let ds = v.diff(mementoArray[i])
      diffs = _.concat(diffs, ds)
    }
    for (let i = 0, len = changes.length; i < len; i++) {
      let v = changes[i]
      v.assignFrom(mementoArray[i])
    }
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('modify edge')
    for (let m = 0, len = diffs.length; m < len; m++) {
      let d = diffs[m]
      operationBuilder.fieldAssign(d.elem, d.f, d.n)
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Reconnect an end (head-side or tail-side) of edge view to new element.
   *
   * @param {Editor} editor
   * @param {EdgeView} edge
   * @param {Points} points
   * @param {NodeView} newParticipant
   * @param {boolean} isTailSide
   */
  reconnectEdge (editor, edge, points, newParticipant, newParticipantModel, isTailSide) {
    if (!editor || !edge || !points || !newParticipant) {
      console.error('Engine.reconnectEdge(): missing required parameters: editor, edge, points, or newParticipant')
      return null
    }

    var changes = [edge]
    for (let i = 0, len = edge.subViews.length; i < len; i++) {
      let sub = edge.subViews[i]
      changes.push(sub)
    }
    var mementoArray = []
    for (let j = 0, len1 = changes.length; j < len1; j++) {
      let v = changes[j]
      let memento = {}
      v.assignTo(memento)
      mementoArray.push(memento)
    }
    edge.points.assign(points)
    editor.repaint()
    var diffs = []
    for (let i = 0, len2 = changes.length; i < len2; i++) {
      let v = changes[i]
      let ds = v.diff(mementoArray[i])
      diffs = _.concat(diffs, ds)
    }
    for (let i = 0, len3 = changes.length; i < len3; i++) {
      let v = changes[i]
      v.assignFrom(mementoArray[i])
    }
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('reconnect edge')
    for (var m = 0, len4 = diffs.length; m < len4; m++) {
      var d = diffs[m]
      operationBuilder.fieldAssign(d.elem, d.f, d.n)
    }
    if (isTailSide === true) {
      operationBuilder.fieldAssign(edge, 'tail', newParticipant)
    } else {
      operationBuilder.fieldAssign(edge, 'head', newParticipant)
    }
    // reconnect model's field
    if (edge.model && newParticipantModel) {
      if (edge.model instanceof Core.DirectedRelationship) {
        if (isTailSide === true) {
          operationBuilder.fieldAssign(edge.model, 'source', newParticipantModel)
        } else {
          operationBuilder.fieldAssign(edge.model, 'target', newParticipantModel)
        }
      } else if (edge.model instanceof Core.UndirectedRelationship) {
        if (isTailSide === true) {
          operationBuilder.fieldAssign(edge.model.end1, 'reference', newParticipantModel)
        } else {
          operationBuilder.fieldAssign(edge.model.end2, 'reference', newParticipantModel)
        }
      }
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Move views by changing their container view.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {number} dx
   * @param {number} dy
   * @param {View} containerView
   */
  moveViewsChangingContainer (editor, views, dx, dy, containerView, containerModel) {
    if (!editor || !views) {
      console.error('Engine.moveViewsChangingContainer(): missing required parameters: editor, views')
      return null
    }

    if (!_.isNumber(dx) || !_.isNumber(dy)) {
      console.error('Engine.moveViewsChangingContainer(): dx and dy should be number type')
      return null
    }

    // 1. 이동할 뷰들을 결정
    var moveViews = []
    moveViews = _.concat(moveViews, views)
    // 1.1) ContainedViews 포함하기
    for (let i = 0, len = moveViews.length; i < len; i++) {
      let v = moveViews[i]
      v.traverseField('containedViews', function (view) {
        if (!_.includes(moveViews, view)) {
          moveViews.push(view)
        }
      })
      // subViews의 containedViews도 포함
      v.traverseField('subViews', function (v2) {
        v2.traverseField('containedViews', function (v3) {
          if (!_.includes(moveViews, v3)) {
            moveViews.push(v3)
          }
        })
      })
    }
    // 1.2) Self-Linked EdgeViews들 포함하기
    editor.diagram.traverse(function (v) {
      if ((v instanceof Core.EdgeView) && _.includes(moveViews, v.head) && (v.head === v.tail) && !_.includes(moveViews, v)) {
        if (!_.includes(moveViews, v)) {
          moveViews.push(v)
        }
      }
    })
    // 2. 이동으로 인하여 변경될 수 있는 Views의 상태들 기억하기
    var changes = []
    changes = _.concat(changes, moveViews)
    editor.diagram.traverse(function (v) {
      // 이동하는 Views들을 연결하는 Edge 뷰들도 변경 대상에 포함. (노드가 이동하면 엣지의 points들이 변경되기 때문)
      if ((v instanceof Core.EdgeView) && (_.includes(changes, v.head) || _.includes(changes, v.tail))) {
        if (!_.includes(changes, v)) { changes.push(v) }
        for (let i = 0, len = v.subViews.length; i < len; i++) {
          let sub = v.subViews[i]
          if (!_.includes(changes, v)) { changes.push(sub) }
        }
      }
    })
    // ContainedViews가 이동하면 ContainerView의 크기가 변한다.
    for (let i = 0, len = moveViews.length; i < len; i++) {
      let v = moveViews[i]
      if ((!_.includes(changes, v.containerView)) && (v.containerView != null)) {
        changes.push(v.containerView)
      }
    }
    // 이동할 뷰들의 상태를 memento에 저장
    var mementoArray = []
    for (let i = 0, len = changes.length; i < len; i++) {
      let v = changes[i]
      let memento = {}
      v.assignTo(memento)
      mementoArray.push(memento)
    }
    // 3. 뷰들을 이동
    for (let i = 0, len = moveViews.length; i < len; i++) {
      let v = moveViews[i]
      v.move(editor.canvas, dx, dy)
    }
    // 모든 뷰들의 크기와 위치를 재계산함.
    editor.repaint()
    // 4. 이동하기전의 Views와 이동후의 Views의 diff를 수행하여 변경된 값들만 추출
    var diffs = []
    for (let i = 0, len = changes.length; i < len; i++) {
      let v = changes[i]
      let ds = v.diff(mementoArray[i])
      diffs = _.concat(diffs, ds)
    }
    // memento에 저장된 Views들의 상태를 복원
    for (let i = 0, len = changes.length; i < len; i++) {
      let v = changes[i]
      v.assignFrom(mementoArray[i])
    }
    // 5. diff의 결과를 바탕으로 operation를 구성하여 수행함.
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('move views')
    for (let i = 0, len = diffs.length; i < len; i++) {
      let d = diffs[i]
      operationBuilder.fieldAssign(d.elem, d.f, d.n)
    }

    // 6. containerView, _parent를 변경
    for (let i = 0, len = views.length; i < len; i++) {
      let v = views[i]
      // v.containerView를 변경
      if (v.containerView !== null) {
        operationBuilder.fieldRemove(v.containerView, 'containedViews', v)
      }
      operationBuilder.fieldAssign(v, 'containerView', containerView)
      if (containerView !== null) {
        operationBuilder.fieldInsert(containerView, 'containedViews', v)
      }
      // v를 containerView보다 나중에 그려지도록 diagram의 가장 뒤로 index를 변경
      var newIdx = v.getDiagram().ownedViews.length - 1
      operationBuilder.fieldReorder(v.getDiagram(), 'ownedViews', v, newIdx)
      //  v.model에 대한 변경
      if (v.changeContainerViewOperation) {
        v.changeContainerViewOperation(v, containerView, operationBuilder)
      } else {
        // v.model을 containerModel로 relocate
        var m = v.model
        var field = m.getParentField()
        if (field) {
          operationBuilder.fieldRelocate(m, field, m._parent, containerModel)
        }
      }
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Change fill color of views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {string} color (color string in CSS style: e.g. "#ffffff")
   */
  setFillColor (editor, views, color) {
    if (!editor || !views || !color) {
      console.error('Engine.setFillColor(): missing required parameters: editor, views, or color')
      return null
    }

    var cmd, v, _i, _len
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change fill color')
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i]
      operationBuilder.fieldAssign(v, 'fillColor', color)
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Change line color of views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {string} color (color string in CSS style: e.g. "#ffffff")
   */
  setLineColor (editor, views, color) {
    if (!editor || !views || !color) {
      console.error('Engine.setLineColor(): missing required parameters: editor, views, or color')
      return null
    }

    var cmd, v, _i, _len
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change line color')
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i]
      operationBuilder.fieldAssign(v, 'lineColor', color)
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Change font of views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {string} face Font face (family)
   * @param {number} size Font size (in pixel)
   * @param {string} color Font color
   */
  setFont (editor, views, face, size, color) {
    if (!editor || !views || !face || !color) {
      console.error('Engine.setFont(): missing required parameters: editor, views, face, or color')
      return null
    }

    if (!_.isNumber(size)) {
      console.error('Engine.setFont(): size should be number type')
      return null
    }

    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change font')
    for (var i = 0, len = views.length; i < len; i++) {
      var v = views[i]
      if (face && size) {
        operationBuilder.fieldAssign(v, 'font', face + ';' + size + ';?')
      }
      if (color) {
        operationBuilder.fieldAssign(v, 'fontColor', color)
      }
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Change font color of views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {string} color Font color (color string in CSS style: e.g. "#ffffff")
   */
  setFontColor (editor, views, color) {
    if (!editor || !views || !color) {
      console.error('Engine.setFontColor(): missing required parameters: editor, views, or color')
      return null
    }

    var cmd, v, _i, _len
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change font color')
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i]
      operationBuilder.fieldAssign(v, 'fontColor', color)
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Change font face of views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {string} fontFace
   */
  setFontFace (editor, views, fontFace) {
    if (!editor || !views || !fontFace) {
      console.error('Engine.setFontFace(): missing required parameters: editor, views, or fontFace')
      return null
    }

    var cmd, v, _i, _len
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change font face')
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i]
      operationBuilder.fieldAssign(v, 'font', fontFace + ';?;?')
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Change font size of views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {number} fontSize
   */
  setFontSize (editor, views, fontSize) {
    if (!editor || !views) {
      console.error('Engine.setFontSize(): missing required parameters: editor, or views')
      return null
    }

    if (!_.isNumber(fontSize)) {
      console.error('Engine.setFontSize(): fontSize should be number type')
      return null
    }

    var cmd, v, _i, _len
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change font size')
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i]
      operationBuilder.fieldAssign(v, 'font', '?;' + fontSize + ';?')
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Change stereotypeDisplay of views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {string} stereotypeDisplay
   */
  setStereotypeDisplay (editor, views, stereotypeDisplay) {
    if (!editor || !views || !stereotypeDisplay) {
      console.error('Engine.setStereotypeDisplay(): missing required parameters: editor, views, or stereotypeDisplay')
      return null
    }

    var cmd, v, _i, _len
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change stereotype display')
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i]
      operationBuilder.fieldAssign(v, 'stereotypeDisplay', stereotypeDisplay)
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

  /**
   * Change lineStyle of edge views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {string} lineStyle
   */
  setLineStyle (editor, views, lineStyle) {
    if (!editor || !views) {
      console.error('Engine.setLineStyle(): missing required parameters: editor, or views')
      return null
    }

    var changes, cmd, d, diffs, ds, i, memento, mementoArray, sub, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref
    changes = []
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i]
      if (v instanceof Core.EdgeView) {
        changes.push(v)
        _ref = v.subViews
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          sub = _ref[_j]
          changes.push(sub)
        }
      }
    }
    mementoArray = []
    for (_k = 0, _len2 = changes.length; _k < _len2; _k++) {
      v = changes[_k]
      memento = {}
      v.assignTo(memento)
      mementoArray.push(memento)
    }
    for (_l = 0, _len3 = views.length; _l < _len3; _l++) {
      v = views[_l]
      if (v instanceof Core.EdgeView) {
        v.lineStyle = lineStyle
        v.arrange(editor.canvas)
      }
    }
    editor.repaint()
    diffs = []
    for (i = _m = 0, _len4 = changes.length; _m < _len4; i = ++_m) {
      v = changes[i]
      ds = v.diff(mementoArray[i])
      diffs = _.concat(diffs, ds)
    }
    for (i = _n = 0, _len5 = changes.length; _n < _len5; i = ++_n) {
      v = changes[i]
      v.assignFrom(mementoArray[i])
    }
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change line style')
    for (_o = 0, _len6 = diffs.length; _o < _len6; _o++) {
      d = diffs[_o]
      operationBuilder.fieldAssign(d.elem, d.f, d.n)
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Change autoResize of node views.
   *
   * @param {Editor} editor
   * @param {Array.<View>} views
   * @param {boolean} autoResize
   */
  setAutoResize (editor, views, autoResize) {
    if (!editor || !views) {
      console.error('Engine.setAutoResize(): missing required parameters: editor, or views')
      return null
    }

    var cmd, v, _i, _len
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('change auto resize')
    for (_i = 0, _len = views.length; _i < _len; _i++) {
      v = views[_i]
      operationBuilder.fieldAssign(v, 'autoResize', autoResize)
    }
    operationBuilder.end()
    cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  };

  /**
   * Layout diagram
   *
   * @param {Editor} editor
   * @param {Diagram} diagram
   * @param {string} direction
   * @param {{node:number, edge:number, rank:number}} separations
   * @param {number} edgeLineStyle
   */
  layoutDiagram (editor, diagram, direction, separations, edgeLineStyle) {
    if (!editor || !diagram) {
      console.error('Engine.layoutDiagram(): missing required parameters: editor, or diagram')
      return null
    }

    // store memento
    var mementoArray = []
    for (let i = 0, len = diagram.ownedViews.length; i < len; i++) {
      let v = diagram.ownedViews[i]
      let memento = {}
      v.assignTo(memento)
      mementoArray.push(memento)
    }
    diagram.layout(direction, separations, edgeLineStyle)
    editor.repaint()
    // compute diffs
    var diffs = []
    for (let i = 0, len = diagram.ownedViews.length; i < len; i++) {
      let v = diagram.ownedViews[i]
      let ds = v.diff(mementoArray[i])
      diffs = _.concat(diffs, ds)
      v.assignFrom(mementoArray[i])
    }
    // execute as a operation
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('layout diagram')
    for (let i = 0, len = diffs.length; i < len; i++) {
      let d = diffs[i]
      operationBuilder.fieldAssign(d.elem, d.f, d.n)
    }
    operationBuilder.end()
    var cmd = operationBuilder.getOperation()
    this.repository.doOperation(cmd)
  }

}

module.exports = Engine
