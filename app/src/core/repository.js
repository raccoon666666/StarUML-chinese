/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const _ = require('lodash')
const {IdGenerator, Element, View, EdgeView, DirectedRelationship, RelationshipEnd, FreelineEdgeView} = require('./core')
const {EventEmitter} = require('events')

// Maximum size of undo/redo stack
const MAX_STACK_SIZE = 100

// Operator constants
const Operator = {
  INSERT: 'I',
  REMOVE: 'R',
  FIELD_ASSIGN: 'a',
  FIELD_INSERT: 'i',
  FIELD_REMOVE: 'r',
  FIELD_REORDER: 'o',
  FIELD_RELOCATE: 'l'
}

/**
 * Size-limited Stack
 * @private
 */
class Stack {

  constructor (maxSize) {
    this.maxSize = maxSize
    this.stack = []
  }

  /**
   * Clear stack.
   * @private
   */
  clear () {
    this.stack = []
  }

  /**
   * Push an item
   * @private
   * @param {*} item Item to be stacked.
   */
  push (item) {
    this.stack.push(item)
    if (this.stack.length > this.maxSize) {
      this.stack.splice(0, 1)
    }
  }

  /**
   * Pop an item from the top
   * @private
   * @return {*} Item on the top.
   */
  pop () {
    return this.stack.pop()
  }

  /**
   * Return size of stack
   * @private
   * @return {number} Size of stack.
   */
  size () {
    return this.stack.length
  }

}

/**
 * Reader Class
 * @private
 * @param {Object} data
 * @param {Object<string, constructor>} ctors
 */
class Reader {

  constructor (data, ctors) {
    if (!_.isObject(data)) {
      console.error("Reader constructor: 'data' parameter should be JSON object")
      return
    }
    this.data = data
    this.ctors = ctors
    this.current = this.data
    this.idMap = {}
  }

  /**
   * Read primitive type
   * @param {string} name
   * @return {number|string|boolean|null}
   */
  read (name) {
    if (!name) {
      console.error('Reader.read(): missing required parameters: name')
      return
    }

    var value = this.current[name]

    if (typeof value !== 'undefined') {
      // Check type of data to be read
      if (!_.isString(value) && !_.isNumber(value) && !_.isBoolean(value) && value !== null) {
        console.error('Reader.read(): type of data to be read should be one of number, string, boolean, or null.', name + ' = ', value)
        return
      }
      return this.current[name]
    }
    return undefined
  }

  /**
   * Read an Object
   * @param {string} name
   * @return {Element}
   */
  readObj (name) {
    if (!name) {
      console.error('Reader.readObj(): missing required parameters: name')
      return
    }

    var value = this.current[name]

    if (typeof value !== 'undefined') {
      // Check type of data to be read
      if (!_.isObject(value)) {
        console.error('Reader.readObj(): type of data to be read should be an Object.', name + ' = ', value)
        return
      }
      if (!value._type) {
        console.error("Reader.readObj(): '_type' field is not found to instantiate an Object.", name + ' = ', value)
        return
      }
      if (!_.isFunction(this.ctors[value._type])) {
        console.error('Reader.readObj(): type.' + value._type + ' is not registered.')
        return
      }

      var obj = new this.ctors[value._type]()
      var temp = this.current
      this.current = value
      obj.load(this)
      this.current = temp

      // Register to idMap
      this.idMap[obj._id] = obj

      return obj
    }
    return undefined
  }

  /**
  * Read an Array of Object
  * @param {string} name
  * @return {Array<Element>}
  */
  readObjArray (name) {
    if (!name) {
      console.error('Reader.readObjArray(): missing required parameters: name')
      return
    }

    var value = this.current[name]

    if (typeof value !== 'undefined') {
      // Check type of data to be read
      if (!_.isArray(value)) {
        console.error('Reader.readObjArray(): type of data to be read should be an array.', name + ' = ', value)
        return
      }

      var ref = value
      var i, len
      var array = []
      for (i = 0, len = ref.length; i < len; i++) {
        var o = ref[i]

        // Check type of an element of array
        if (!_.isObject(o)) {
          console.error('Reader.readObjArray(): one of array elements is not Object.', o)
          continue
        }
        if (!o._type) {
          console.error("Reader.readObjArray(): '_type' field is not found to instantiate an Object.", o)
          continue
        }
        if (!_.isFunction(this.ctors[o._type])) {
          console.error('Reader.readObjArray(): type.' + o._type + ' is not registered.')
          continue
        }

        var obj = new this.ctors[o._type]()
        var temp = this.current
        this.current = o
        obj.load(this)
        this.current = temp

        // Register to idMap
        this.idMap[obj._id] = obj
        array.push(obj)
      }
      return array
    }
    return undefined
  }

  /**
  * Read a reference to an Object. The returned {$ref} object should be resolved later.
  * @param {string} name
  * @return {{$ref:string}}
  */
  readRef (name) {
    if (!name) {
      console.error('Reader.readRef(): missing required parameters: name')
      return
    }

    var value = this.current[name]

    if (typeof value !== 'undefined') {
      // Check type of data to be read
      if (value && !_.isString(value.$ref)) {
        console.error("Reader.readRef(): data is not a reference ('$ref' not found).", name + ' = ', value)
        return
      }

      return value
    }
    return undefined
  }

  /**
  * Read an array of reference.
  * @param {string} name
  * @return {Array<{$ref:string}>}
  */
  readRefArray (name) {
    if (!name) {
      console.error('Reader.readRefArray(): missing required parameters: name')
      return
    }

    var value = this.current[name]

    if (typeof value !== 'undefined') {
      // Check type of data to be read
      if (!_.isArray(value)) {
        console.error('Reader.readRefArray(): type of data to be read should be an array.', name + ' = ', value)
        return
      }

      var array = []
      var i, len
      var ref = this.current[name]
      for (i = 0, len = ref.length; i < len; i++) {
        var _refObj = ref[i]

        // Check type of an element of array
        if (!_.isObject(_refObj)) {
          console.error('Reader.readRefArray(): one of array elements is not Object.', _refObj)
          return
        }
        if (!_.isString(_refObj.$ref)) {
          console.error("Reader.readRefArray(): data is not a reference ('$ref' not found).", _refObj)
          return
        }

        array.push(_refObj)
      }
      return array
    }
    return undefined
  }

  /**
  * Read Variant
  * @param {string} name
  * @return {{$ref:string}|null|number|boolean|string}
  */
  readVariant (name) {
    if (!name) {
      console.error('Reader.readVariant(): missing required parameters: name')
      return
    }

    var value = this.current[name]

    if (typeof value !== 'undefined') {
      // Check type of data to be read
      if (!_.isString(value) && !_.isNumber(value) && !_.isBoolean(value) && value !== null && !_.isString(value.$ref)) {
        console.error('Reader.readVariant(): type of data to be read should be one of number, string, boolean, null, or reference.', name + ' = ', value)
        return
      }

      return this.current[name]
    }
    return undefined
  }

  /**
  * Read a custom object
  * @param {string} typeName
  * @param {string} name
  * @return {{__read: function(Object)}}
  */
  readCustom (typeName, name) {
    if (!name) {
      console.error('Reader.readCustom(): missing required parameters: name')
      return
    }

    var value = this.current[name]

    if (typeof value !== 'undefined') {
      if (!_.isFunction(this.ctors[typeName])) {
        console.error('Reader.readCustom(): type.' + typeName + ' is not registered.')
        return
      }

      var custom = new this.ctors[typeName]()

      if (!_.isFunction(custom.__read)) {
        console.error('Reader.readCustom(): Object of type.' + typeName + " should have '__read' function.", custom)
        return
      }

      custom.__read(value)
      return custom
    }
    return undefined
  }

}

/**
 * Writer Class for storing Elements into JSON data.
 * @private
 */
class Writer {

  constructor () {
    /**
    * @type {Object<string, ?>} - 현재 저장중인 데이터
    */
    this.current = {}
  }

  /**
  * Write primitive value
  *
  * @param {string} name
  * @param {string|number|boolean|null} value
  */
  write (name, value) {
    if (!name) {
      console.error('Writer.write(): missing required parameters: name')
      return
    }
    if (!_.isString(value) && !_.isNumber(value) && !_.isBoolean(value) && value !== null) {
      console.error("Writer.write(): type of 'value' parameter should be one of string, number or boolean.", name + ' = ', value)
      return
    }
    this.current[name] = value
  }

  /**
  * Write an Object
  *
  * @param {string} name
  * @param {Element} value
  */
  writeObj (name, value) {
    if (!name) {
      console.error('Writer.writeObj(): missing required parameters: name')
      return
    }
    if (value && value instanceof type.Element) {
      var temp = this.current
      this.current[name] = {}
      this.current = this.current[name]
      value.save(this)
      this.current = temp
    } else {
      this.current[name] = null
    }
  }

  /**
  * Write an Array of Objects
  *
  * @param {string} name
  * @param {Array<Element>} value
  */
  writeObjArray (name, value) {
    if (!name) {
      console.error('Writer.writeObjArray(): missing required parameters: name')
      return
    }
    if (!_.isArray(value)) {
      console.error("Writer.writeObjArray(): type of 'value' parameter should be an array.", name + ' = ', value)
      return
    }
    var temp = this.current
    this.current[name] = []
    var i, len
    var array = this.current[name]
    for (i = 0, len = value.length; i < len; i++) {
      var o = value[i]
      if (o instanceof type.Element) {
        this.current = {}
        o.save(this)
        array.push(this.current)
      } else {
        console.error("Writer.writeObjArray(): one of 'value' array is not instanceof Element.", o)
        return
      }
    }
    this.current = temp
  }

  /**
  * Write a Reference
  *
  * @param {string} name
  * @param {Element} value
  */
  writeRef (name, value) {
    if (!name) {
      console.error('Writer.writeRef(): missing required parameters: name')
      return
    }
    if (value) {
      if (value instanceof type.Element) {
        this.current[name] = { $ref: value._id }
      } else {
        console.error("Writer.writeRef(): 'value' parameter is not instanceof Element.", name + ' = ', value)
        return
      }
    } else {
      this.current[name] = null
    }
  }

  /**
  * Write an Array of Reference
  *
  * @param {string} name
  * @param {Array<Element>} value
  */
  writeRefArray (name, value) {
    if (!name) {
      console.error('Writer.writeRefArray(): missing required parameters: name')
      return
    }
    if (!_.isArray(value)) {
      console.error("Writer.writeRefArray(): type of 'value' parameter should be an array.", name + ' = ', value)
      return
    }
    var temp = this.current
    this.current[name] = []
    var i, len
    var array = this.current[name]
    for (i = 0, len = value.length; i < len; i++) {
      var o = value[i]
      if (o instanceof type.Element) {
        var ref = { $ref: o._id }
        array.push(ref)
      } else {
        console.error("Writer.writeRefArray(): one of 'value' array is not instanceof Element.", o)
        return
      }
    }
    this.current = temp
  }

  /**
  * Write a Variant (Primitive or Reference)
  *
  * @param {string} name
  * @param {number|string|boolean|Element} value
  */
  writeVariant (name, value) {
    if (!name) {
      console.error('Writer.writeVariant(): missing required parameters: name')
      return
    }
    if (value === null) {
      this.current[name] = null
    } else if (value instanceof type.Element) {
      this.current[name] = { $ref: value._id }
    } else if (_.isString(value) || _.isNumber(value) || _.isBoolean(value)) {
      this.current[name] = value
    } else {
      console.error('Writer.writeVariant(): invalid type of parameter: value.', name + ' = ', value)
    }
  }

  /**
  * Write a Custom Object (Custom Object have it's own method to store itself)
  *
  * @param {string} name
  * @param {{__write: function()}} value
  */
  writeCustom (name, value) {
    if (!name) {
      console.error('Writer.writeCustom(): missing required parameters: name')
      return
    }
    if (value) {
      if (_.isFunction(value.__write)) {
        this.current[name] = value.__write()
      } else {
        console.error("Writer.writeCustom(): the 'value' parameter should have '__write' function", name + ' = ', value)
        return
      }
    } else {
      console.error('Writer.writeCustom(): missing required parameters: value')
      return
    }
  }

}

/**
 * OperationBuilder is used to build an operation
 */
class OperationBuilder extends EventEmitter {

  constructor () {
    super()

    /**
     * Currently building operation
     *
     * @private
     * @type {Object}
     */
    this._currentOperation = null

    /**
     * Keep an array of array field of a particular element.
     *
     * @private
     * @type {Object<string,Array>}
     */
    this._currentArray = {}
  }

  /**
   * Return timestamp
   */
  getTimestamp () {
    return (new Date()).getTime()
  }

  /**
   * Make and return a base operation object.
   *
   * @private
   * @param {string} name Operation name
   * @return {Object} Base operation object
   */
  _getBase (name) {
    return {
      id: IdGenerator.generateGuid(),
      time: this.getTimestamp(),
      name: name,
      bypass: false,
      ops: []
    }
  }

  /**
   * Return a copied array of array field of a particular element.
   * It could be changed by `fieldInsert`, `fieldRemove`.
   * The reason why using this is index value maybe incorrect when performing `fieldInsert` multiple times.
   *
   * @private
   * @param {Element} elem An element
   * @param {string} field Array field name
   * @return {number}
   */
  _getArray (elem, field) {
    var f = elem._id + '.' + field
    if (!this._currentArray[f]) {
      this._currentArray[f] = _.clone(elem[field])
    }
    return this._currentArray[f]
  }

  /**
   * Begin to make an operation.
   *
   * @param {string} opName Operation name
   */
  begin (name, bypass) {
    this._currentOperation = this._getBase(name)
    if (bypass === true) {
      this._currentOperation.bypass = true
    }
  }

  /**
   * Finish to make an operation.
   */
  end () {
    this._currentArray = {}
    return null
  }

  /**
   * Discard currently making operation.
   */
  discard () {
    this._currentOperation = null
    this._currentArray = {}
  }

  /**
   * Return currently made operation.
   *
   * @return {Object}
   */
  getOperation () {
    return this._currentOperation
  }

  /**
   * Insert an element.
   *
   * @param {Element} elem
   */
  insert (elem) {
    try {
      this.emit('insert', elem)
    } catch (err) {
      console.error(err)
    }
    var writer = new Writer()
    elem.save(writer)
    this._currentOperation.ops.push({op: Operator.INSERT, arg: writer.current})
  }

  /**
   * Remove an element.
   *
   * @param {Element} elem
   */
  remove (elem) {
    try {
      this.emit('remove', elem)
    } catch (err) {
      console.error(err)
    }
    var writer = new Writer()
    elem.save(writer)
    this._currentOperation.ops.push({op: Operator.REMOVE, arg: writer.current})
  }

  /**
   * Assign value to field.
   *
   * @param {Element} elem
   * @param {string} field
   * @param {any} val
   */
  fieldAssign (elem, field, val) {
    try {
      this.emit('fieldAssign', elem, field, val)
    } catch (err) {
      console.error(err)
    }
    var isCustomField = (elem[field] && elem[field].__read)
    var oldVal
    if (isCustomField) {
      oldVal = elem[field].__write()
    } else {
      oldVal = elem[field]
    }
    this._currentOperation.ops.push({
      op: Operator.FIELD_ASSIGN,
      arg: {
        _id: elem._id,
        f: field,
        n: val,
        o: oldVal
      }
    })
  }

  /**
   * Insert an element to array field.
   *
   * @param {Element} elem
   * @param {string} field
   * @param {any} val
   */
  fieldInsert (elem, field, val) {
    try {
      this.emit('fieldInsert', elem, field, val)
    } catch (err) {
      console.error(err)
    }
    var array = this._getArray(elem, field)
    array.push(val)
    this._currentOperation.ops.push({
      op: Operator.FIELD_INSERT,
      arg: {
        _id: elem._id,
        f: field,
        e: val._id,
        i: array.indexOf(val)
      }
    })
  }

  /**
   * Insert a value to array field at a specific position (index).
   *
   * @param {Element} elem
   * @param {string} field
   * @param {any} val
   * @param {number} pos
   */
  fieldInsertAt (elem, field, val, pos) {
    try {
      this.emit('fieldInsertAt', elem, field, val, pos)
    } catch (err) {
      console.error(err)
    }
    this._currentOperation.ops.push({
      op: Operator.FIELD_INSERT,
      arg: {
        _id: elem._id,
        f: field,
        e: val._id,
        i: pos
      }
    })
  }

  /**
   * Remove a value from array field.
   *
   * @param {Element} elem
   * @param {string} field
   * @param {any} val
   */
  fieldRemove (elem, field, val) {
    try {
      this.emit('fieldRemove', elem, field, val)
    } catch (err) {
      console.error(err)
    }
    var array = this._getArray(elem, field)
    this._currentOperation.ops.push({
      op: Operator.FIELD_REMOVE,
      arg: {
        _id: elem._id,
        f: field,
        e: val._id,
        i: array.indexOf(val)
      }
    })
    if (array.indexOf(val) > -1) {
      array.splice(array.indexOf(val), 1)
    }
  }

  /**
   * Remove a value from array field at a specific position.
   *
   * @param {Element} elem
   * @param {string} field
   * @param {any} value
   * @param {number} pos
   */
  fieldRemoveAt (elem, field, val, pos) {
    try {
      this.emit('fieldRemoveAt', elem, field, val, pos)
    } catch (err) {
      console.error(err)
    }
    this._currentOperation.ops.push({
      op: Operator.FIELD_REMOVE,
      arg: {
        _id: elem._id,
        f: field,
        e: val._id,
        i: pos
      }
    })
  }

  /**
   * Change order of a value in array field.
   *
   * @param {Element} elem
   * @param {string} field
   * @param {any} val
   * @param {number} pos Position to be placed
   */
  fieldReorder (elem, field, val, pos) {
    try {
      this.emit('fieldReorder', elem, field, val, pos)
    } catch (err) {
      console.error(err)
    }
    this._currentOperation.ops.push({
      op: Operator.FIELD_REORDER,
      arg: {
        _id: elem._id,
        f: field,
        e: val._id,
        i: pos
      }
    })
  }

  /**
   * Relocate an element to another parent.
   *
   * @param {Element} elem Element to be relocated
   * @param {string} field Field name of parent
   * @param {number} oldParent Current parent
   * @param {number} newParent New parent to be located in
   */
  fieldRelocate (elem, field, oldParent, newParent) {
    try {
      this.emit('fieldRelocate', elem, field, oldParent, newParent)
    } catch (err) {
      console.error(err)
    }
    this._currentOperation.ops.push({
      op: Operator.FIELD_RELOCATE,
      arg: {
        _id: elem._id,
        f: field,
        op: oldParent._id,
        np: newParent._id
      }
    })
  }
}

/**
 * Repository maintains a set of elements.
 *
 * Reponsibilities:
 * - Applies operations. (Undo/Redo)
 * - Query for retrieve elements.
 */
class Repository extends EventEmitter {

  constructor () {
    super()
    /**
    * Map for id to Element.
    * @private
    * @type {Object<string,Element>}
    */
    this._idMap = {}

    /**
    * Inverted index for referencing: {id, {id, refCount}}.
    * @private
    * @type {Object<string,Object<string,number>>}
    */
    this._refMap = {}

    /**
    * Indicate model is modified or not.
    * @private
    * @type {boolean}
    */
    this._modified = false

    /**
    * Undo stack.
    * @private
    * @type {Stack}
    */
    this._undoStack = new Stack(MAX_STACK_SIZE)

    /**
    * Redo stack.
    * @private
    * @type {Stack}
    */
    this._redoStack = new Stack(MAX_STACK_SIZE)

    /**
     * An instance of OperationBuilder
     * @private
     */
    this.operationBuilder = new OperationBuilder()
  }

  /**
  * Add a reference to the inverted index. (increase refCount by one)
  *
  * @private
  * @param {Element} refer Referencing element.
  * @param {Element} refee Referenced element.
  */
  _addRef (refer, refee) {
    var item = this._refMap[refee._id]
    if (!item) {
      item = {}
      this._refMap[refee._id] = item
    }
    var count = item[refer._id]
    if (count) {
      item[refer._id] = count + 1
    } else {
      item[refer._id] = 1
    }
  }

  /**
  * Remove a reference from the inverted index. (Decrease refCount by one. Remove the entry if refCount reached zero)
  *
  * @private
  * @param {Element} refer Referencing element.
  * @param {Element} refee Referenced element.
  */
  _removeRef (refer, refee) {
    var item = this._refMap[refee._id]
    if (item) {
      var count = item[refer._id]
      if (count && (count > 0)) {
        item[refer._id] = count - 1
      } else {
        item[refer._id] = 0
      }
      if (item[refer._id] === 0) {
        delete item[refer._id]
      }
    }
  }

  /**
  * 요소의 모든 참조 필드들을 레퍼런스 인덱스에 추가
  *
  * @private
  * @param {Element} elem
  */
  _addRefsOf (elem) {
    elem.getMetaAttributes().forEach(attr => {
      var i
      switch (attr.kind) {
      case Element.AK_OBJ:
      case Element.AK_REF:
        var ref = elem[attr.name]
        if (ref && this._idMap[ref._id]) {
          this._addRef(elem, ref)
        }
        break
      case Element.AK_OBJS:
      case Element.AK_REFS:
        var refs = elem[attr.name]
        if (refs && refs.length > 0) {
          for (i = 0; i < refs.length; i++) {
            if (refs[i] && refs[i]._id && this._idMap[refs[i]._id]) {
              this._addRef(elem, refs[i])
            }
          }
        }
        break
      }
    })
  }

  /**
  * 요소의 모든 참조 필드들을 레퍼런스 인덱스에서 제거 (요소가 제거될 것이므로 본 요소가 가지는 모든 참조는 제거됨)
  *
  * @private
  * @param {Element} elem
  */
  _removeRefsOf (elem) {
    elem.getMetaAttributes().forEach(attr => {
      var i
      switch (attr.kind) {
      case Element.AK_OBJ:
      case Element.AK_REF:
        var ref = elem[attr.name]
        if (ref && this._idMap[ref._id]) {
          this._removeRef(elem, ref)
        }
        break
      case Element.AK_OBJS:
      case Element.AK_REFS:
        var refs = elem[attr.name]
        if (refs && refs.length > 0) {
          for (i = 0; i < refs.length; i++) {
            if (refs[i]._id && this._idMap[refs[i]._id]) {
              this._removeRef(elem, refs[i])
            }
          }
        }
        break
      }
    })
    // 인덱스에서 항목을 제거.
    delete this._refMap[elem._id]
  }

  /**
  * Operation 수행하기.
  *
  * @private
  * @param {Operation} operation
  */
  _applyOperation (operation) {
    var i, j, len, op, id, name, elem, obj, reader, val
    var createdElems = []
    var deletedElems = []
    var updatedElems = []
    // 1) 요소들의 생성 및 인덱스 등록
    for (i = 0, len = operation.ops.length; i < len; i++) {
      op = operation.ops[i]
      switch (op.op) {
      case Operator.INSERT:
        reader = new Reader({ data: op.arg }, global.type)
        elem = reader.readObj('data')
        op._elem = elem
        op._idMap = reader.idMap
        // 인덱스에 등록하기
        for (id in reader.idMap) {
          if (reader.idMap.hasOwnProperty(id)) {
            obj = reader.idMap[id]
            this._idMap[obj._id] = obj
          }
        }
        break
      case Operator.REMOVE:
        reader = new Reader({ data: op.arg }, global.type)
        elem = reader.readObj('data')
        op._elem = elem
        op._idMap = reader.idMap
        // 레퍼런스 인덱스에서 제거하기
        for (id in op._idMap) {
          if (op._idMap.hasOwnProperty(id)) {
            if (!_.isUndefined(this._idMap[id])) {
              this._removeRefsOf(this._idMap[id])
            }
          }
        }
        break
      }
    }
    // 2) 요소들의 필드값 적용
    for (i = 0, len = operation.ops.length; i < len; i++) {
      op = operation.ops[i]
      switch (op.op) {
      case Operator.INSERT:
        elem = op._elem
        // 레퍼런스 값들을 복원하기.
        for (id in op._idMap) {
          if (op._idMap.hasOwnProperty(id)) {
            obj = op._idMap[id]
            for (name in obj) {
              if (obj.hasOwnProperty(name)) {
                val = obj[name]
                // if val is a reference
                if (val && val.$ref) {
                  obj[name] = this._idMap[val.$ref]
                  // if val is an array reference
                } else if (_.isArray(val)) {
                  for (j = 0; j < val.length; j++) {
                    if (val[j] && val[j].$ref) {
                      val[j] = this._idMap[val[j].$ref]
                    }
                  }
                }
              }
            }
            // obj의 참조들을 레퍼런스 인덱스에 추가하기
            this._addRefsOf(obj)
          }
        }
        createdElems.push(elem)
        break
      case Operator.REMOVE:
        elem = op._elem
        // 인덱스에서 제거하기
        for (id in op._idMap) {
          if (op._idMap.hasOwnProperty(id)) {
            delete this._idMap[id]
            delete this._refMap[id]
          }
        }
        deletedElems.push(elem)
        break
      case Operator.FIELD_ASSIGN:
        elem = this._idMap[op.arg._id]
        if (elem[op.arg.f] && elem[op.arg.f].__read) {
          elem[op.arg.f].__read(op.arg.n)
        } else {
          if (op.arg.n && op.arg.n._id) {
            elem[op.arg.f] = this._idMap[op.arg.n._id]
          } else {
            elem[op.arg.f] = op.arg.n
          }
          // oldVal를 레퍼런스 인덱스에서 제거
          if (op.arg.o && op.arg.o._id) {
            this._removeRef(elem, op.arg.o)
          }
          // newVal를 레퍼런스 인덱스에 추가
          if (op.arg.n && op.arg.n._id) {
            this._addRef(elem, op.arg.n)
          }
        }
        updatedElems.push(elem)
        break
      case Operator.FIELD_INSERT:
        elem = this._idMap[op.arg._id]
        val = this._idMap[op.arg.e]
        if (elem && val) {
          elem[op.arg.f].splice(op.arg.i, 0, val)
          // val을 레퍼런스 인덱스에 추가
          if (val._id) {
            this._addRef(elem, val)
          }
        }
        updatedElems.push(elem)
        break
      case Operator.FIELD_REMOVE:
        elem = this._idMap[op.arg._id]
        val = this._idMap[op.arg.e]
        if (elem && val) {
          // 레퍼런스 인덱스에서 제거
          if (val._id) {
            this._removeRef(elem, val)
          }
          if (elem[op.arg.f].indexOf(val) > -1) {
            elem[op.arg.f].splice(elem[op.arg.f].indexOf(val), 1)
          }
        }
        updatedElems.push(elem)
        break
      case Operator.FIELD_REORDER:
        elem = this._idMap[op.arg._id]
        val = this._idMap[op.arg.e]
        // Store old index of val in the array field of element.
        op.arg.oi = _.indexOf(elem[op.arg.f], val)
        if (elem && val) {
          if (elem[op.arg.f].indexOf(val) > -1) {
            elem[op.arg.f].splice(elem[op.arg.f].indexOf(val), 1)
          }
          elem[op.arg.f].splice(op.arg.i, 0, val)
        }
        // updatedElems.push(elem);
        try {
          /**
           * Triggered when order of an element is changed
           * @name reordered
           * @kind event
           * @memberof Repository
           * @property {Element} elem The reordered element
           */
          this.emit('reordered', val)
        } catch (err) {
          console.error(err)
        }
        break
      case Operator.FIELD_RELOCATE:
        elem = this._idMap[op.arg._id]
        var oldParent = this._idMap[op.arg.op]
        var newParent = this._idMap[op.arg.np]
        if (elem && oldParent && newParent) {
          if (oldParent[op.arg.f].indexOf(elem) > -1) {
            oldParent[op.arg.f].splice(oldParent[op.arg.f].indexOf(elem), 1)
          }
          newParent[op.arg.f].push(elem)
          elem._parent = newParent
          this._removeRef(oldParent, elem)
          this._addRef(newParent, elem)
        }
        try {
          /**
           * Triggered when an element is relocated to another parent element
           * @name relocated
           * @kind event
           * @memberof Repository
           * @property {Element} elem The relocated element
           * @property {Element} field The field name of the parent
           * @property {Element} oldParent Old parent
           * @property {Element} newParent New parent
           */
          this.emit('relocated', elem, op.arg.f, oldParent, newParent)
        } catch (err) {
          console.error(err)
        }
        break
      }
    }
    // Bypass Operation가 아니면 이벤트를 발생한다.
    if (operation.bypass !== true) {
      if (createdElems.length > 0) {
        try {
          /**
           * Triggered after elements were created
           * @name created
           * @kind event
           * @memberof Repository
           * @property {Array<Element>} createdElements An array of created elements
           */
          this.emit('created', createdElems)
        } catch (err) {
          console.error(err)
        }
      }
      if (deletedElems.length > 0) {
        try {
          /**
           * Triggered after elements were deleted
           * @name deleted
           * @kind event
           * @memberof Repository
           * @property {Array<Element>} deletedElems An array of deleted elements
           */
          this.emit('deleted', deletedElems)
        } catch (err) {
          console.error(err)
        }
      }
      if (updatedElems.length > 0) {
        try {
          /**
           * Triggered after elements were updated
           * @name updated
           * @kind event
           * @memberof Repository
           * @property {Array<Element>} updatedElems An array of updated elements
           */
          this.emit('updated', updatedElems)
        } catch (err) {
          console.error(err)
        }
      }
      this.setModified(true)
    }
  }

  /**
  * Revert an operation
  *
  * @private
  * @param {Operation} operation
  */
  _revertOperation (operation) {
    var i, j, id, name, op, obj, elem, reader, val
    var createdElems = []
    var deletedElems = []
    var updatedElems = []
    // 1) 요소들의 복구 및 인덱스 등록
    for (i = operation.ops.length - 1; i >= 0; i--) {
      op = operation.ops[i]
      switch (op.op) {
      case Operator.INSERT:
        reader = new Reader({ data: op.arg }, global.type)
        elem = reader.readObj('data')
        op._elem = elem
        op._idMap = reader.idMap
        // 레퍼런스 인덱스에서 제거하기
        for (id in op._idMap) {
          if (op._idMap.hasOwnProperty(id)) {
            this._removeRefsOf(this._idMap[id])
          }
        }
        break
      case Operator.REMOVE:
        reader = new Reader({ data: op.arg }, global.type)
        elem = reader.readObj('data')
        op._elem = elem
        op._idMap = reader.idMap
        // 인덱스에 등록하기
        for (id in reader.idMap) {
          if (reader.idMap.hasOwnProperty(id)) {
            obj = reader.idMap[id]
            this._idMap[obj._id] = obj
          }
        }
        break
      }
    }
    // 2) 요소들의 필드값 복구
    for (i = operation.ops.length - 1; i >= 0; i--) {
      op = operation.ops[i]
      switch (op.op) {
      case Operator.INSERT:
        elem = op._elem
        // 인덱스에서 제거하기
        for (id in op._idMap) {
          if (op._idMap.hasOwnProperty(id)) {
            delete this._idMap[id]
            delete this._refMap[id]
          }
        }
        deletedElems.push(elem)
        break
      case Operator.REMOVE:
        elem = op._elem
        // 레퍼런스 값들을 복원하기.
        for (id in op._idMap) {
          if (op._idMap.hasOwnProperty(id)) {
            obj = op._idMap[id]
            for (name in obj) {
              if (obj.hasOwnProperty(name)) {
                val = obj[name]
                // if val is a reference
                if (val && val.$ref) {
                  obj[name] = this._idMap[val.$ref]
                  // if val is an array reference
                } else if (_.isArray(val)) {
                  for (j = 0; j < val.length; j++) {
                    if (val[j] && val[j].$ref) {
                      val[j] = this._idMap[val[j].$ref]
                    }
                  }
                }
              }
            }
            // obj의 참조들을 레퍼런스 인덱스에 추가하기
            this._addRefsOf(obj)
          }
        }
        createdElems.push(elem)
        break
      case Operator.FIELD_ASSIGN:
        elem = this._idMap[op.arg._id]
        if (elem[op.arg.f] && elem[op.arg.f].__read) {
          elem[op.arg.f].__read(op.arg.o)
        } else {
          if (op.arg.o && op.arg.o._id) {
            elem[op.arg.f] = this._idMap[op.arg.o._id]
          } else {
            elem[op.arg.f] = op.arg.o
          }
          // oldVal를 레퍼런스 인덱스에 추가
          if (op.arg.o && op.arg.o._id) {
            this._addRef(elem, op.arg.o)
          }
          // newVal를 레퍼런스 인덱스에서 제거
          if (op.arg.n && op.arg.n._id) {
            this._removeRef(elem, op.arg.n)
          }
        }
        updatedElems.push(elem)
        break
      case Operator.FIELD_INSERT:
        elem = this._idMap[op.arg._id]
        val = this._idMap[op.arg.e]
        if (elem && val) {
          if (elem[op.arg.f].indexOf(val) > -1) {
            elem[op.arg.f].splice(elem[op.arg.f].indexOf(val), 1)
          }
          // val 레퍼런스 인덱스에서 제거
          if (val._id) {
            this._removeRef(elem, val)
          }
        }
        updatedElems.push(elem)
        break
      case Operator.FIELD_REMOVE:
        elem = this._idMap[op.arg._id]
        val = this._idMap[op.arg.e]
        if (elem && val) {
          elem[op.arg.f].splice(op.arg.i, 0, val)
          // val을 레퍼런스 인덱스에 추가
          if (val._id) {
            this._addRef(elem, val)
          }
        }
        updatedElems.push(elem)
        break
      case Operator.FIELD_REORDER:
        elem = this._idMap[op.arg._id]
        val = this._idMap[op.arg.e]
        if (elem && val) {
          if (elem[op.arg.f].indexOf(val) > -1) {
            elem[op.arg.f].splice(elem[op.arg.f].indexOf(val), 1)
          }
          elem[op.arg.f].splice(op.arg.oi, 0, val)
        }
        // updatedElems.push(elem);
        try {
          this.emit('reordered', elem)
        } catch (err) {
          console.error(err)
        }
        break
      case Operator.FIELD_RELOCATE:
        elem = this._idMap[op.arg._id]
        var oldParent = this._idMap[op.arg.op]
        var newParent = this._idMap[op.arg.np]
        if (elem && oldParent && newParent) {
          if (newParent[op.arg.f].indexOf(elem) > -1) {
            newParent[op.arg.f].splice(newParent[op.arg.f].indexOf(elem), 1)
          }
          oldParent[op.arg.f].push(elem)
          elem._parent = oldParent
          this._removeRef(newParent, elem)
          this._addRef(oldParent, elem)
        }
        try {
          this.emit('relocated', elem, op.arg.f, newParent, oldParent)
        } catch (err) {
          console.error(err)
        }
        break
      }
    }
    if (createdElems.length > 0) {
      try {
        this.emit('created', createdElems)
      } catch (err) {
        console.error(err)
      }
    }
    if (deletedElems.length > 0) {
      try {
        this.emit('deleted', deletedElems)
      } catch (err) {
        console.error(err)
      }
    }
    if (updatedElems.length > 0) {
      try {
        this.emit('updated', updatedElems)
      } catch (err) {
        console.error(err)
      }
    }
    this.setModified(true)
  }

  /**
  * Encode a given element to JSON data.
  * @private
  * @param {Element} elem Element to be encoded
  * @return {string} JSON-encoded data.
  */
  writeObject (elem) {
    var writer = new Writer()
    elem.save(writer)
    var data = JSON.stringify(writer.current, null, '\t')
    return data
  }

  /**
  * Read object from JSON data
  * @private
  * @param {string|Object} data - Object or JSON-string
  * @param {?boolean} replaceIds
  * @return {Element}
  */
  readObject (data, replaceIds) {
    var element = null
    var id, name, obj, val, _replaceIdMap

    var _replaceRef = (item) => {
      var newId = _replaceIdMap[item.$ref]
      if (newId) {
        item.$ref = newId
      }
    }

    var _resolveRef = (item) => {
      return this._idMap[item.$ref]
    }

    if (data) {
      if (_.isString(data)) {
        data = JSON.parse(data)
      }
      var reader = new Reader({data: data}, global.type)
      element = reader.readObj('data')

      // Replace all ids
      if (replaceIds) {
        // Map.<oldId, newId>
        _replaceIdMap = {}

        // Assign new ids
        for (id in reader.idMap) {
          if (reader.idMap.hasOwnProperty(id)) {
            var newId = IdGenerator.generateGuid()
            obj = reader.idMap[id]
            _replaceIdMap[obj._id] = newId
            delete reader.idMap[obj._id]
            obj._id = newId
            reader.idMap[newId] = obj
          }
        }

        // Fix all refs to refer to new ids
        for (id in reader.idMap) {
          if (reader.idMap.hasOwnProperty(id)) {
            obj = reader.idMap[id]
            for (name in obj) {
              if (obj.hasOwnProperty(name)) {
                val = obj[name]
                // when val is reference
                if (val && val.$ref) {
                  _replaceRef(val)
                  // when val is non-empty array of reference
                } else if (_.isArray(val) && val.length > 0 && val[0].$ref) {
                  _.each(val, _replaceRef)
                }
              }
            }
          }
        }
      }

      // Resolve all references
      _.extend(this._idMap, reader.idMap)
      for (id in reader.idMap) {
        if (reader.idMap.hasOwnProperty(id)) {
          obj = this._idMap[id]
          for (name in obj) {
            if (obj.hasOwnProperty(name)) {
              val = obj[name]
              // when val is reference
              if (val && val.$ref) {
                obj[name] = this._idMap[val.$ref]
                // when val is non-empty array of reference
              } else if (_.isArray(val) && val.length > 0 && val[0].$ref) {
                var resolvedRefs = _.map(val, _resolveRef)
                obj[name] = resolvedRefs
              }
            }
          }
          this._addRefsOf(obj)
        }
      }

      // Fix problems in the file
      // TODO: Remove this enough time after
      for (id in reader.idMap) {
        if (reader.idMap.hasOwnProperty(id)) {
          obj = this._idMap[id]

          // Fix _parent of Image owned by Stereotype
          if (obj instanceof type.UMLStereotype && obj.icon instanceof type.UMLImage) {
            obj.icon._parent = obj
          }

          // Fix: remove disconnected UndirectedRelationships
          if (obj instanceof type.UndirectedRelationship) {
            if (!(obj.end1 instanceof type.RelationshipEnd &&
              obj.end1.reference instanceof type.Model &&
              obj.end2 instanceof type.RelationshipEnd &&
              obj.end2.reference instanceof type.Model)) {
              if (obj._parent && obj.getParentField()) {
                var arr1 = obj._parent[obj.getParentField()]
                if (arr1.indexOf(obj) > -1) {
                  arr1.splice(arr1.indexOf(obj), 1)
                }
                obj._parent = null
                obj.end1.reference = null
                obj.end2.reference = null
                delete reader.idMap[obj._id]
              }
            }
          }

          // Fix: remove disconnected DirectedRelationships
          if (obj instanceof type.DirectedRelationship) {
            if (!(obj.source instanceof type.Model &&
              obj.target instanceof type.Model)) {
              if (obj._parent && obj.getParentField()) {
                var arr2 = obj._parent[obj.getParentField()]
                if (arr2.indexOf(obj) > -1) {
                  arr2.splice(arr2.indexOf(obj), 1)
                }
                obj._parent = null
                obj.source = null
                obj.target = null
                delete reader.idMap[obj._id]
              }
            }
          }

          // Fix: Clear too large distance values
          if (obj instanceof type.ParasiticView) {
            if (obj.distance > 5000) {
              obj.distance = 10
            }
          }

          // Fix: Change UMLRelationshipEnd.navigable type from boolean to number
          // if (obj instanceof type.UMLRela)
          if (obj instanceof type.UMLRelationshipEnd) {
            if (typeof obj.navigable === 'undefined') { // means default value
              obj.navigable = 'navigable'
            } else if (typeof obj.navigable === 'boolean') {
              obj.navigable = obj.navigable ? 'navigable' : 'unspecified'
            }
          }

          // Fix: problems in diagram
          if (obj instanceof type.Diagram) {
            var diagram = obj

            // 1) Communication Diagram에서 hostEdge가 null인 UMLCommMessageView를 모두 지움.
            if (diagram instanceof type.UMLCommunicationDiagram) {
              _.each(diagram.ownedViews, function (v) {
                if (v instanceof type.UMLCommMessageView && v.hostEdge === null) {
                  diagram.removeOwnedView(v)
                  delete reader.idMap[v._id]
                }
              })
            }

            for (var vi = 0, vlen = diagram.ownedViews.length; vi < vlen; vi++) {
              var v = diagram.ownedViews[vi]

              if (!v) { continue }

              // 1) model이 없는 UMLGeneralNodeView, UMLGeneralEdgeView를 모두 삭제.
              if (!v.model && v instanceof type.UMLGeneralNodeView) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (!v.model && v instanceof type.UMLGeneralEdgeView) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }

              // 2) _parent가 없는 View들 모두 삭제
              if (!v._parent) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }

              // 3) head or tail이 없는 EdgeView는 삭제
              if (v instanceof type.EdgeView) {
                if ((!v.head || !v.tail) && !(v instanceof FreelineEdgeView)) {
                  diagram.removeOwnedView(v)
                  delete reader.idMap[v._id]
                }
              }

              // 4) end1.reference or end2.reference가 없는 UndirectedRelationship을 모두 삭제.
              if (v.model instanceof type.UndirectedRelationship) {
                if (!v.model.end1.reference || !v.model.end2.reference) {
                  var pf1 = v.model.getParentField()
                  if (v.model._parent && pf1) {
                    var owner1 = v.model._parent[pf1]
                    if (owner1.indexOf(v.model) > -1) {
                      owner1.splice(owner1.indexOf(v.model), 1)
                    }
                  }
                  diagram.removeOwnedView(v)
                  delete reader.idMap[v._id]
                }
              }

              // 5) source or target이 없는 DirectedRelationship을 모두 삭제.
              if (v.model instanceof type.DirectedRelationship) {
                if (!v.model.source || !v.model.target) {
                  var pf2 = v.model.getParentField()
                  if (v.model._parent && pf2) {
                    var owner2 = v.model._parent[pf2]
                    if (owner2.indexOf(v.model) > -1) {
                      owner2.splice(owner2.indexOf(v.model), 1)
                    }
                  }
                  diagram.removeOwnedView(v)
                  delete reader.idMap[v._id]
                }
              }

              // 5) nameLabel, stereotypeLabel, propertyLabel, RoleNameLabel, MultiplicityLabel, PropertyLabel, QualifiersCompartment
              if (v.nameLabel && !reader.idMap[v.nameLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.stereotypeLabel && !reader.idMap[v.stereotypeLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.propertyLabel && !reader.idMap[v.propertyLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.tailRoleNameLabel && !reader.idMap[v.tailRoleNameLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.tailPropertyLabel && !reader.idMap[v.tailPropertyLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.tailMultiplicityLabel && !reader.idMap[v.tailMultiplicityLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.tailQualifiersCompartment && !reader.idMap[v.tailQualifiersCompartment._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.headRoleNameLabel && !reader.idMap[v.headRoleNameLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.headPropertyLabel && !reader.idMap[v.headPropertyLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.headMultiplicityLabel && !reader.idMap[v.headMultiplicityLabel._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
              if (v.headQualifiersCompartment && !reader.idMap[v.headQualifiersCompartment._id]) {
                diagram.removeOwnedView(v)
                delete reader.idMap[v._id]
              }
            }
          }
        }
      }
    }
    return element
  }

  /**
   * Extract changed elements from a given Operation
   * @private
   * @param {Operation} operation
   * @return {Array<Element>}
   */
  extractChanged (operation) {
    var i, len, op, elem
    var changed = []
    if (operation.ops.length > 0) {
      for (i = 0, len = operation.ops.length; i < len; i++) {
        op = operation.ops[i]
        if (op._elem && op._elem._id) {
          elem = this.get(op._elem._id)
          if (elem && !_.includes(changed, elem)) {
            changed.push(elem)
          }
        }
        if (op.arg && op.arg._id) {
          elem = this.get(op.arg._id)
          if (elem && !_.includes(changed, elem)) {
            changed.push(elem)
          }
        }
      }
    }
    return changed
  }

  /**
   * Generate and return a GUID
   * @private
   * @return {string} Generated GUID
   */
  generateGuid () {
    return IdGenerator.generateGuid()
  }

  /**
  * Do an Operation
  * If operation.bypass == true, the operation will not be pushed to UndoStack.
  * @param {Object} operation
  */
  doOperation (operation) {
    if (operation.ops.length > 0) {
      try {
        /**
         * Triggered before an operation is executed
         * @name beforeExecuteOperation
         * @kind event
         * @memberof Repository
         * @property {Object} operation Operation to be executed
         */
        this.emit('beforeExecuteOperation', operation)
        this._applyOperation(operation)
        if (operation.bypass !== true) {
          this._undoStack.push(operation)
          this._redoStack.clear()
          /**
           * Triggered after an operation is executed
           * @name operationExecuted
           * @kind event
           * @memberof Repository
           * @property {Object} operation Operation has executed
           */
          this.emit('operationExecuted', operation)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  /**
  * Undo
  */
  undo () {
    if (this._undoStack.size() > 0) {
      try {
        var operation = this._undoStack.pop()
        /**
         * Triggered before undo an operation
         * @name beforeUndo
         * @kind event
         * @memberof Repository
         * @property {Object} operation Operation to be unexecuted
         */
        this.emit('beforeUndo', operation)
        this._revertOperation(operation)
        this._redoStack.push(operation)
        /**
         * Triggered after undo an operation
         * @name undo
         * @kind event
         * @memberof Repository
         * @property {Object} operation Operation has unexecuted
         */
        this.emit('undo', operation)
        this.emit('operationExecuted', operation)
      } catch (err) {
        console.error(err)
      }
    }
  }

  /**
  * Redo
  */
  redo () {
    if (this._redoStack.size() > 0) {
      try {
        var operation = this._redoStack.pop()
        /**
         * Triggered before redo an operation
         * @name beforeRedo
         * @kind event
         * @memberof Repository
         * @property {Object} operation Operation to be reexecuted
         */
        this.emit('beforeRedo', operation)
        this._applyOperation(operation)
        this._undoStack.push(operation)
        /**
         * Triggered after redo an operation
         * @name redo
         * @kind event
         * @memberof Repository
         * @property {Object} operation Operation has reexecuted
         */
        this.emit('redo', operation)
        this.emit('operationExecuted', operation)
      } catch (err) {
        console.error(err)
      }
    }
  }

  /**
   * Clear all maps and stacks
   */
  clear () {
    this._idMap = {}
    this._refMap = {}
    this._undoStack.clear()
    this._redoStack.clear()
    this.setModified(false)
  }

  /**
   * Return whether project is modified or not.
   * @return {boolean}
   */
  isModified () {
    return this._modified
  }

  /**
   * Set model as modified. (A event will be triggered if modified state is changed.)
   * @private
   * @param {boolean} modified
   */
  setModified (modified) {
    this._modified = modified
    if (this._modified) {
      try {
        this.emit('modified')
      } catch (err) {
        console.error(err)
      }
    }
  }

  /**
  * Return true if the given parameter is an element in this Repository.
  * @param {Element} elem
  * @return {boolean}
  */
  isElement (elem) {
    return (elem && elem._id && this.get(elem._id))
  }

  /**
   * Return an array of elements selected by selector expression.
   * This is a quite heavy operation, so you need to concern about performance.
   * ```
   * Selector expression
   *     - Children selector
   *       ex) Package1:: -- all children of Package1
   *
   *     - Type selector: "@<type>"
   *       ex) Package1::@UMLClass
   *
   *     - Field selector: ".<field>"
   *       ex) Class1.attributes, Package1.owendElements
   *
   *     - Value selector: "[field=value]"
   *       ex) Class1.operations[isAbstract=false]
   *
   *     - Name selector: "<name>" (equivalent to "[name=<name>]")
   *       ex) Class1, Class1::Attribute1
   *
   * Selector examples:
   *     @UMLClass
   *     Package1::Class1.attributes[type=String]
   *     Package1::Model1::@UMLInterface.operations[isAbstract=false]
   * ```
   * @param {string} selector
   * @return {Array<Element>}
   */
  select (selector) {
    selector = selector || ''

    // Parse selector into an array of terms
    var interm = selector
    .replace(/::/g, '\n::\n')
    .replace(/@/g, '\n@')
    .replace(/\./g, '\n.')
    .replace(/\[/g, '\n[')

    var i, len
    var sliced = interm.split('\n')
    var terms = []

    for (i = 0, len = sliced.length; i < len; i++) {
      var item = sliced[i].trim()
      var arg
      // children selector
      if (item === '::') {
        terms.push({ op: '::' })
        // type selector
      } else if (item.charAt(0) === '@') {
        arg = item.substring(1, item.length).trim()
        if (arg.length === 0) {
          throw new Error("[Selector] Type selector requires type name after '@'")
        }
        terms.push({ op: '@', type: arg })
        // field selector
      } else if (item.charAt(0) === '.') {
        arg = item.substring(1, item.length).trim()
        if (arg.length === 0) {
          throw new Error("[Selector] Field selector requires field name after '.'")
        }
        terms.push({ op: '.', field: arg })
        // value selector
      } else if (item.charAt(0) === '[') {
        arg = item.substring(1, item.length - 1)
        var fv = arg.split('=')
        var f = fv[0] || ''
        var v = fv[1] || ''
        if (!(item.charAt(item.length - 1) === ']' && fv.length === 2 && f.trim().length > 0 && v.trim().length > 0)) {
          throw new Error("[Selector] Value selector should be format of '[field=value]'")
        }
        terms.push({ op: '[]', field: f.trim(), value: v.trim() })
        // name selector
      } else if (item.length > 0) {
        terms.push({ op: 'name', name: item })
      }
    }

    // Process terms sequentially
    var current = _.values(this._idMap)
    var term, elems
    for (i = 0, len = terms.length; i < len; i++) {
      term = terms[i]
      elems = []
      switch (term.op) {
      case '::':
        current.forEach(e => {
          elems = _.union(elems, e.getChildren())
        })
        current = elems
        break
      case '@':
        current.forEach(e => {
          if (type[term.type] && e instanceof type[term.type]) {
            elems.push(e)
          }
        })
        current = elems
        break
      case '.':
        current.forEach(e => {
          if (typeof e[term.field] !== 'undefined') {
            var val = e[term.field]
            if (this.isElement(val)) {
              elems.push(val)
            }
            if (Array.isArray(val)) {
              val.forEach(function (e2) {
                if (this.isElement(e2)) {
                  elems.push(e2)
                }
              })
            }
          }
        })
        current = elems
        break
      case '[]':
        current.forEach(e => {
          if (typeof e[term.field] !== 'undefined') {
            var val = e[term.field]
            if (term.value === val) {
              elems.push(e)
            }
          }
        })
        current = elems
        break
      case 'name':
        current.forEach(e => {
          if (e.name === term.name) {
            elems.push(e)
          }
        })
        current = elems
        break
      }
    }

    return current
  }

  /**
  * Return element by id.
  * @param {string} id Identifier of element.
  * @return {Element} Element of id.
  */
  get (id) {
    return this._idMap[id]
  }

  /**
  * Return instances of a specified type name(s).
  * @param {string|Array<string>} _typeName Type name(s) of instances to be returned.
  * @return {Array<Element>} instances of the type name(s).
  */
  getInstancesOf (_typeName) {
    var _instances = []
    var _typeNames = []

    if (_.isArray(_typeName)) {
      _typeNames = _typeName
    } else if (_.isString(_typeName)) {
      _typeNames.push(_typeName)
    }

    _.each(this._idMap, (elem) => {
      var i, len
      var _typeTest = false

      for (i = 0, len = _typeNames.length; i < len; i++) {
        if (elem instanceof global.type[_typeNames[i]]) {
          _typeTest = true
          break
        }
      }

      if (_typeTest) {
        _instances.push(elem)
      }
    })

    return _instances
  }

  /**
  * Find the first matched element satisfying the predicate.
  * @param {function(Element):boolean} predicate A function to filter elements.
  * @return {Element} A matched element.
  */
  find (predicate) {
    var key, elem
    for (key in this._idMap) {
      if (this._idMap.hasOwnProperty(key)) {
        elem = this._idMap[key]
        if (predicate(elem)) {
          return elem
        }
      }
    }
    return null
  }

  /**
  * Find all elements satisfying the predicate.
  * @param {function(Element):boolean} predicate A function to filter elements.
  * @return {Array<Element>} All matched elements.
  */
  findAll (predicate) {
    var key, elem
    var result = []
    for (key in this._idMap) {
      if (this._idMap.hasOwnProperty(key)) {
        elem = this._idMap[key]
        if (predicate(elem)) {
          result.push(elem)
        }
      }
    }
    return result
  }

  /**
   * Search elements by keyword and type
   * @param {string} keyword
   * @param {constructor} typeFilter
   * @return {Array<Element>} elements
   */
  search (keyword, typeFilter) {
    keyword = keyword.toLowerCase()
    typeFilter = typeFilter || type.Element
    var results = this.findAll(elem => {
      var name = elem.name ? elem.name.toLowerCase() : ''
      return (name.indexOf(keyword) > -1 && elem instanceof typeFilter)
    })
    return results
  }

  /**
   * Lookup an element and then find. (See `Element.prototype.lookup` and `find`).
   * @param {!Element} namespace Element to start to lookup.
   * @param {string} name Name of element to find
   * @param {constructor} typeFilter Type filter. (e.g. `type.UMLClass`)
   * @return {Element} A matched element.
   */
  lookupAndFind (namespace, name, typeFilter) {
    var ref = namespace.lookup(name, typeFilter)
    if (ref === null) {
      ref = this.find(elem => {
        return ((elem instanceof typeFilter) && (elem.name === name))
      })
    }
    return ref
  }

  /**
   * Return all elements referencing to the given element.
   * @param {Element} elem Element. (model element, view element, or diagram)
   * @param {?function(Element):boolean} iterator if given, returns instances only satisfying iterator function.
   * @return {Array<Element>} Elements referencing to.
   */
  getRefsTo (elem, iterator) {
    var id, ref, obj
    var list = []
    if (elem) {
      obj = this._refMap[elem._id]
      if (obj) {
        for (id in obj) {
          if (obj.hasOwnProperty(id)) {
            ref = this._idMap[id]
            if (iterator) {
              if (iterator(ref)) { list.push(ref) }
            } else {
              list.push(ref)
            }
          }
        }
      }
    }
    return list
  }

  /**
   * Return all instances of Relationship connected to the given model element.
   * @param {Model} model Model element.
   * @param {?function(Element):boolean} iterator if given, returns instances only satisfying iterator function.
   * @return {Array<Model>} Instances of Relationship.
   */
  getRelationshipsOf (model, iterator) {
    var i, len, ref
    var refs = this.getRefsTo(model)
    var results = []

    function _add (rel) {
      if (!_.includes(results, rel)) {
        results.push(rel)
      }
    }

    for (i = 0, len = refs.length; i < len; i++) {
      ref = refs[i]

      // for DirectedRelationship
      if ((ref instanceof DirectedRelationship) && (ref.source === model || ref.target === model)) {
        if (iterator) {
          if (iterator(ref)) {
            _add(ref)
          }
        } else {
          _add(ref)
        }
      }

      // for UndirectedRelationship
      if ((ref instanceof RelationshipEnd) && (ref.reference === model)) {
        if (iterator) {
          if (iterator(ref._parent)) {
            _add(ref._parent)
          }
        } else {
          _add(ref._parent)
        }
      }
    }
    return results
  }

  /**
   * Return all views associated with the given model.
   * @param {Model} model Model element.
   * @return {Array<View>} View elements associated with.
   */
  getViewsOf (model) {
    return this.getRefsTo(model, (ref) => {
      return (ref instanceof View) && (ref.model === model)
    })
  }

  /**
   * Return all instances of EdgeView linked to the given view.
   * @private
   * @param {View} view View element. Typically an instance of NodeView.
   * @return {Array<EdgeView>} Instances of EdgeView linked to.
   */
  getEdgeViewsOf (view) {
    return this.getRefsTo(view, (ref) => {
      return (ref instanceof EdgeView) &&
      (ref.head === view || ref.tail === view)
    })
  }

  /**
  * Return all connected node views of a given view on the both sides
  * @private
  * @param {View} view
  * @param {class} edgeType
  * @param {function} predicate
  * @return {Array<NodeView>} All nodes views connected on.
  */
  getConnectedNodeViews (view, edgeType, predicate) {
    var edges = _.filter(this.getEdgeViewsOf(view), function (e) {
      return (e instanceof edgeType && (predicate ? predicate(e) : true))
    })
    var nodes = _.map(edges, e => {
      if (e.head === view) {
        return e.tail
      } else {
        return e.head
      }
    })
    return nodes
  }

  /**
  * Return all connected node views of a given view on the head-side
  * @private
  * @param {View} view
  * @param {class} edgeType
  * @return {Array<NodeView>} All nodes views connected on head-side.
  */
  getConnectedHeadNodeViews (view, edgeType) {
    var edges = _.filter(this.getEdgeViewsOf(view), e => {
      return (e instanceof edgeType && e.tail === view)
    })
    var nodes = _.map(edges, function (e) { return e.head })
    return nodes
  }

  /**
  * Return all connected node views of a given view on the tail-side
  * @private
  * @param {View} view
  * @param {class} edgeType
  * @return {Array<NodeView>} All nodes views connected on tail-side.
  */
  getConnectedTailNodeViews (view, edgeType) {
    var edges = _.filter(this.getEdgeViewsOf(view), function (e) {
      return (e instanceof edgeType && e.head === view)
    })
    var nodes = _.map(edges, function (e) { return e.tail })
    return nodes
  }

  /**
   * Return idMap
   * @private
   * @return {Map<string, Object>}
   */
  getIdMap () {
    return this._idMap
  }

  /**
   * Return the instance of OperationBuilder
   * @return {OperationBuilder}
   */
  getOperationBuilder () {
    return this.operationBuilder
  }

  /**
   * Insert an element to an array field. This will not insert an Operation into UndoStack (bypass = true). Use it carefully.
   * @private
   * @param {Element} parent Field owner.
   * @param {string} field Field name.
   * @param {Element} elem An element to be inserted.
   */
  bypassInsert (parent, field, elem) {
    this.operationBuilder.begin('bypassInsert', true)
    this.operationBuilder.insert(elem)
    this.operationBuilder.fieldInsert(parent, field, elem)
    this.operationBuilder.end()
    this.doOperation(this.operationBuilder.getOperation())
  }

  /**
   * Assign a value to a field. This will not insert an Operation into UndoStack (bypass = true). Use it carefully.
   * @private
   * @param {Element} elem Field owner.
   * @param {string} field Field name.
   * @param {Element} val Value to be assigned to.
   */
  bypassFieldAssign (elem, field, val) {
    this.operationBuilder.begin('bypassFieldAssign', true)
    this.operationBuilder.fieldAssign(elem, field, val)
    this.operationBuilder.end()
    this.doOperation(this.operationBuilder.getOperation(), true)
  }

}

exports.Reader = Reader
exports.Writer = Writer
exports.Repository = Repository
