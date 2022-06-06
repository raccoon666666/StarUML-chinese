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

/* eslint-disable yoda, no-extra-parens, no-unused-vars */

/*
 * NOTE:
 * Requires graphlib and dagre as global variables, which are used only in Diagram.layout().
 * If not exists, Diagram.layout() will not work with no errors.
 */

/*
 * Core classes is defined in this module. We don't recommend to instantiate
 *   instance of classes defined in this module in your extension.
 *
 * (This module is not well documented)
 */

const _ = require('lodash')
const dagre = require('dagre')
const {
  GraphicUtils,
  Point,
  Rect,
  Color,
  Font,
  GridFactor,
  Points,
  Canvas,
  Coord
} = require('./graphics')

// Constants for Layout
const LAYOUT_MARGIN_LEFT = 20
const LAYOUT_MARGIN_TOP = 20
const NODE_SEPARATION = 30
const EDGE_SEPARATION = 30
const RANK_SEPARATION = 30

// EdgeView Constants
const SELF_EDGE_HORIZ_INTERVAL = 30
const SELF_EDGE_VERTI_INTERVAL = 20

/**
 * IdGenerator
 * @private
 * @constructor
 */
class IdGenerator {
  constructor () {
    this.tableStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    this.table = this.tableStr.split('')
  }

  setBaseHex (val) {
    this.baseHex = val
  }

  atob (base64) {
    if (/(=[^=]+|={3,})$/.test(base64)) throw new Error('String contains an invalid character')
    base64 = base64.replace(/=/g, '')
    var n = base64.length & 3
    if (n === 1) throw new Error('String contains an invalid character')
    for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
      var a = this.tableStr.indexOf(base64[j++] || 'A')
      var b = this.tableStr.indexOf(base64[j++] || 'A')
      var c = this.tableStr.indexOf(base64[j++] || 'A')
      var d = this.tableStr.indexOf(base64[j++] || 'A')
      if ((a | b | c | d) < 0) throw new Error('String contains an invalid character')
      bin[bin.length] = ((a << 2) | (b >> 4)) & 255
      bin[bin.length] = ((b << 4) | (c >> 2)) & 255
      bin[bin.length] = ((c << 6) | d) & 255
    }
    return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4)
  }

  btoa (bin) {
    for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
      var a = bin.charCodeAt(j++)
      var b = bin.charCodeAt(j++)
      var c = bin.charCodeAt(j++)
      if ((a | b | c) > 255) throw new Error('String contains an invalid character')
      base64[base64.length] = this.table[a >> 2] + this.table[((a << 4) & 63) | (b >> 4)] +
        (isNaN(b) ? '=' : this.table[((b << 2) & 63) | (c >> 6)]) +
        (isNaN(b + c) ? '=' : this.table[c & 63])
    }
    return base64.join('')
  }

  toHex (digit, num) {
    var fill, hex, r
    hex = num.toString(16)
    if (hex.length < digit) {
      r = digit - hex.length
      fill = new Array(r + 1).join('0')
      hex = fill + hex
    }
    return hex
  }

  hexToBase64 (str) {
    return this.btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, '').replace(/([\da-fA-F]{2}) ?/g, '0x$1 ').replace(/ +$/, '').split(' ')))
  }

  generate () {
    var base64, counter, counterHex, hex, random, randomHex, timestamp, timestampHex
    timestamp = (new Date()).getTime()
    counter = IdGenerator.counter
    IdGenerator.counter++
    if (IdGenerator.counter > 65535) {
      IdGenerator.counter = 0
    }
    random = Math.floor(Math.random() * 65536)
    timestampHex = this.toHex(16, timestamp)
    counterHex = this.toHex(4, counter)
    randomHex = this.toHex(4, random)
    hex = this.baseHex + timestampHex + counterHex + randomHex
    base64 = this.hexToBase64(hex)
    return base64
  }
}

/**
 * @private
 * A global instance of IdGenerator
 */
IdGenerator.globalIdGenerator = null

/**
 * @private
 * A counter for random generation
 */
IdGenerator.counter = Math.floor(Math.random() * 65536)

/**
 * @private
 * Generate GUID
 */
IdGenerator.generateGuid = function () {
  if (IdGenerator.globalIdGenerator === null) {
    IdGenerator.globalIdGenerator = new IdGenerator('')
  }
  return IdGenerator.globalIdGenerator.generate()
}

/**
 * Element
 */
class Element {

  constructor () {
    /**
     * globaly unique identifier
     * @member {string}
     */
    this._id = IdGenerator.generateGuid()

    /**
     * reference to its parent
     * @member {object}
     */
    this._parent = null
  }

  /**
   * Return class name for display (e.g. "Class" rather than "UMLClass").
   * @return {string}
   */
  getDisplayClassName () {
    return this.getClassName()
  }

  /**
   * Return Class. (equivalent to `type[element.getClassName()])`
   *
   * @return {constructor}
   */
  getClass () {
    return global.type[this.constructor.name]
  }

  /**
   * Return Class name.
   *
   * @return {string}
   */
  getClassName () {
    return this.constructor.name
  }

  /**
   * Return Meta Class.
   *
   * @return {Object}
   */
  getMetaClass () {
    return global.meta[this.constructor.name]
  }

  /**
   * Return Meta Attributes.
   *
   * @return {Array.<{name:string, kind:string, type:string}>}
   */
  getMetaAttributes () {
    return app.metamodels.getMetaAttributes(this.getClassName())
  }

  /**
   * Return name of parent's field containing this object.
   *
   * @return {string} Field name (e.g. 'ownedElements')
   */
  getParentField () {
    if (this._parent) {
      for (var field in this._parent) {
        var value = this._parent[field]
        if (_.isArray(value)) {
          if (_.includes(value, this)) { return field }
        } else if (_.isObject(value)) {
          if (value === this) { return field }
        }
      }
      return null
    }
    return null
  }

  /**
   * Return CSS class name of icon for this object. (Shown in Explorer)
   *
   * @return {string} - iconClass명 (e.g. 'icon-UMLClass')
   */
  getNodeIcon () {
    return 'staruml-icon icon-' + this.getClassName()
  }

  /**
   * Return textual string for this object. (Shown in Explorer)
   * @param {object} options
   * @return {string} Text (e.g. '<<stereotype>>Class1')
   */
  getNodeText (options) {
    if (this.name && this.name.length > 0) {
      return this.name
    } else {
      return '(' + this.getDisplayClassName() + ')'
    }
  }

  /**
   * Return ordering priority number. (Lower value comes first in Explorer)
   *
   * @param {number} index
   * @return {Number}
   */
  getOrdering (index) {
    var base = 100000
    var ordering = 0
    var metaClass = this.getMetaClass()
    if (metaClass && metaClass.ordering) {
      ordering = metaClass.ordering * base
    }
    if (_.isNumber(index)) {
      ordering = ordering + index
    }
    return ordering
  }

  /**
   * Return all child nodes to be shown in Explorer.
   *
   * @param {boolean} sort
   * @return {Array.<Element>}
   */
  getChildNodes (sort) {
    var children = []
    var self = this

    function push (elem) {
      if (elem instanceof Model) {
        children.push(elem)
      }
    }

    _.forEach(this.getMetaAttributes(), attr => {
      switch (attr.kind) {
      case Element.AK_OBJ:
        if (self[attr.name]) {
          push(self[attr.name])
        }
        break
      case Element.AK_OBJS:
        var items = self[attr.name]
        if (items && items.length > 0) {
          _.forEach(items, item => {
            push(item)
          })
        }
        break
      }
    })

    if (sort) {
      children = _.sortBy(children, (child, idx) => {
        return child.getOrdering(idx)
      })
    }

    return children
  }

  /**
   * Return all children.
   *
   * @return {Array.<Element>}
   */
  getChildren () {
    var children = []
    var self = this
    _.forEach(this.getMetaAttributes(), attr => {
      switch (attr.kind) {
      case Element.AK_OBJ:
        if (self[attr.name]) {
          children.push(self[attr.name])
        }
        break
      case Element.AK_OBJS:
        var items = self[attr.name]
        if (items && items.length > 0) {
          _.forEach(items, item => {
            children.push(item)
          })
        }
        break
      }
    })
    return children
  }

  /**
   * Traverse all nodes in the tree structure. (Breadth-First Traversal)
   *
   * @param {function(elem:Element)} fun
   */
  traverse (fun) {
    fun(this)
    var attrs = this.getMetaAttributes()
    for (var i = 0, len = attrs.length; i < len; i++) {
      var attr = attrs[i]
      if (this[attr.name] !== null) {
        switch (attr.kind) {
        case Element.AK_OBJ:
          this[attr.name].traverse(fun)
          break
        case Element.AK_OBJS:
          for (var j = 0, len1 = this[attr.name].length; j < len1; j++) {
            var obj = this[attr.name][j]
            obj.traverse(fun)
          }
          break
        }
      }
    }
  }

  /**
   * Traverse all nodes in the tree structure. (Depth-First Traversal)
   *
   * @param {function(elem:Element)} fun
   */
  traverseDepthFirst (fun) {
    var attrs = this.getMetaAttributes()
    for (var i = 0, len = attrs.length; i < len; i++) {
      var attr = attrs[i]
      if (this[attr.name] !== null) {
        switch (attr.kind) {
        case Element.AK_OBJ:
          this[attr.name].traverseDepthFirst(fun)
          break
        case Element.AK_OBJS:
          for (var j = 0, len1 = this[attr.name].length; j < len1; j++) {
            var obj = this[attr.name][j]
            obj.traverseDepthFirst(fun)
          }
          break
        }
      }
    }
    fun(this)
  }

  /**
   * Traverse a specific field chains. (Breadth-First Traversal)
   *
   * @param {string} field Field name to traverse (e.g. 'ownedElements')
   * @param {function} fun
   */
  traverseField (field, fun) {
    fun(this)
    var ref = this[field]
    for (var i = 0, len = ref.length; i < len; i++) {
      var v = ref[i]
      v.traverseField(field, fun)
    }
  }

  /**
   * Traverse a specific field chains. (Depth-First Traversal)
   *
   * @param {string} field Field name to traverse (e.g. 'ownedElements')
   * @param {function} fun
   */
  traverseFieldDepthFirst (field, fun) {
    var ref = this[field]
    for (var i = 0, len = ref.length; i < len; i++) {
      var v = ref[i]
      v.traverseFieldDepthFirst(field, fun)
    }
    fun(this)
  }

  /**
   * Traverse up along with the `_parent` chain.
   * @param {function} fun
   */
  traverseUp (fun) {
    fun(this)
    if (this._parent) {
      this._parent.traverseUp(fun)
    }
  }

  /**
   * Read it's state data from Reader.
   * @private
   *
   * @param {Reader} reader
   */
  load (reader) {
    var attrs = this.getMetaAttributes()
    for (var i = 0, len = attrs.length; i < len; i++) {
      var attr = attrs[i]
      var val
      switch (attr.kind) {
      case Element.AK_PRIM:
        val = reader.read(attr.name)
        if (typeof val !== 'undefined') {
          this[attr.name] = val
        } else {
          if (typeof attr.default !== 'undefined' && attr.transient !== true) {
            this[attr.name] = attr.default
          }
        }
        break
      case Element.AK_ENUM:
        val = reader.read(attr.name)
        if (typeof val !== 'undefined') {
          this[attr.name] = val
        } else {
          if (typeof attr.default !== 'undefined' && attr.transient !== true) {
            this[attr.name] = attr.default
          }
        }
        break
      case Element.AK_REF:
        val = reader.readRef(attr.name)
        var prevRef = this[attr.name]
        if (typeof val !== 'undefined') {
          // Remove previous embedded reference
          if (prevRef && attr.embedded) {
            if (Array.isArray(this[attr.embedded])) {
              var embeddedArray = this[attr.embedded]
              if (embeddedArray.indexOf(prevRef) > -1) {
                embeddedArray.splice(embeddedArray.indexOf(prevRef), 1)
              }
            }
          }
          // Assign new reference
          this[attr.name] = val
        } else {
          // Register previous embedded reference
          if (prevRef && attr.embedded) {
            reader.idMap[prevRef._id] = prevRef
          }
        }
        break
      case Element.AK_REFS:
        val = reader.readRefArray(attr.name)
        if (typeof val !== 'undefined') {
          this[attr.name] = val
        }
        break
      case Element.AK_OBJ:
        val = reader.readObj(attr.name)
        if (typeof val !== 'undefined') {
          this[attr.name] = val
        }
        break
      case Element.AK_OBJS:
        val = reader.readObjArray(attr.name)
        if (!Array.isArray(this[attr.name])) {
          this[attr.name] = []
        }
        // Append loaded objects to the existing array
        if (Array.isArray(val)) {
          for (var j = 0; j < val.length; j++) {
            this[attr.name].push(val[j])
          }
        }
        break
      case Element.AK_VAR:
        val = reader.readVariant(attr.name)
        if (typeof val !== 'undefined') {
          this[attr.name] = val
        }
        break
      case Element.AK_CUSTOM:
        val = reader.readCustom(attr.type, attr.name)
        if (typeof val !== 'undefined') {
          this[attr.name] = val
        }
        break
      default:
        void 0
      }
    }
  }

  /**
   * Write it's state data to writer.
   * @private
   *
   * @param {Writer} writer
   */
  save (writer) {
    writer.write('_type', this.getClassName())
    var attrs = this.getMetaAttributes()
    for (var i = 0, len = attrs.length; i < len; i++) {
      var attr = attrs[i]
      if (typeof this[attr.name] !== 'undefined' && attr.transient !== true) {
        if (typeof attr.default === 'undefined' || attr.default !== this[attr.name]) {
          switch (attr.kind) {
          case Element.AK_PRIM:
            switch (attr.type) {
            case 'String':
              if (this[attr.name] !== '' && this[attr.name] !== null) {
                writer.write(attr.name, this[attr.name])
              }
              break
            case 'Integer':
            case 'Real':
              writer.write(attr.name, this[attr.name])
              break
            case 'Boolean':
              writer.write(attr.name, this[attr.name])
              break
            default:
              writer.write(attr.name, this[attr.name])
              break
            }
            break
          case Element.AK_ENUM:
            writer.write(attr.name, this[attr.name])
            break
          case Element.AK_REF:
            if (this[attr.name] !== null) {
              writer.writeRef(attr.name, this[attr.name])
            }
            break
          case Element.AK_REFS:
            if (_.isArray(this[attr.name]) && this[attr.name].length > 0) {
              writer.writeRefArray(attr.name, this[attr.name])
            }
            break
          case Element.AK_OBJ:
            if (this[attr.name] !== null) {
              writer.writeObj(attr.name, this[attr.name])
            }
            break
          case Element.AK_OBJS:
            if (_.isArray(this[attr.name]) && this[attr.name].length > 0) {
              writer.writeObjArray(attr.name, this[attr.name])
            }
            break
          case Element.AK_VAR:
            if (this[attr.name] !== null) {
              writer.writeVariant(attr.name, this[attr.name])
            }
            break
          case Element.AK_CUSTOM:
            if (this[attr.name] !== null) {
              writer.writeCustom(attr.name, this[attr.name])
            }
            break
          }
        }
      }
    }
  }

  /**
   * Store it's state data to memento
   * @private
   *
   * @param {object} memento
   */
  assignTo (memento) {
    var attrs = this.getMetaAttributes()
    for (var i = 0, len = attrs.length; i < len; i++) {
      var attr = attrs[i]
      if (this[attr.name] !== null) {
        switch (attr.kind) {
        case Element.AK_PRIM:
          memento[attr.name] = this[attr.name]
          break
        case Element.AK_ENUM:
          memento[attr.name] = this[attr.name]
          break
        case Element.AK_CUSTOM:
          memento[attr.name] = this[attr.name].__write()
          break
        }
      }
    }
  }

  /**
   * Load it's state data from memento
   * @private
   *
   * @param {object} memento
   */
  assignFrom (memento) {
    var attrs = this.getMetaAttributes()
    for (var i = 0, len = attrs.length; i < len; i++) {
      var attr = attrs[i]
      switch (attr.kind) {
      case Element.AK_PRIM:
        this[attr.name] = memento[attr.name]
        break
      case Element.AK_ENUM:
        this[attr.name] = memento[attr.name]
        break
      case Element.AK_CUSTOM:
        if (this[attr.name] !== null) {
          this[attr.name].__read(memento[attr.name])
        }
        break
      }
    }
  }

  /**
   * Return differences between it's state data and data stored in memento.
   * @private
   *
   * @param {object} memento
   * @return {Array.<{elem:Element, f:string, n:?, o:?}>} `{f: Field name, n: New value, o: Old value}`
   */
  diff (memento) {
    var diffs = []
    var attrs = this.getMetaAttributes()
    var newVal = null
    var oldVal = null
    for (var i = 0, len = attrs.length; i < len; i++) {
      var attr = attrs[i]
      if (this[attr.name] !== null) {
        switch (attr.kind) {
        case Element.AK_PRIM:
          newVal = this[attr.name]
          oldVal = memento[attr.name]
          if (newVal !== oldVal) {
            diffs.push({
              elem: this,
              f: attr.name,
              n: newVal,
              o: oldVal
            })
          }
          break
        case Element.AK_ENUM:
          newVal = this[attr.name]
          oldVal = memento[attr.name]
          if (newVal !== oldVal) {
            diffs.push({
              elem: this,
              f: attr.name,
              n: newVal,
              o: oldVal
            })
          }
          break
        case Element.AK_CUSTOM:
          newVal = this[attr.name].__write()
          oldVal = memento[attr.name]
          if (newVal !== oldVal) {
            diffs.push({
              elem: this,
              f: attr.name,
              n: newVal,
              o: oldVal
            })
          }
        }
      }
    }
    return diffs
  }

  /**
   * Find an element by name. Find through `ownedElements` chain, and then lookup through `_parent` chain.
   *
   * @param {string} name
   * @param {constructor} typeFilter
   * @param {Element} namespace Lookup only inside of namespace
   * @return {Element} Return the first matched element.
   */
  lookup (name, typeFilter, namespace) {
    var children = this.getChildren()
    for (var i = 0, len = children.length; i < len; i++) {
      var elem = children[i]
      if (typeFilter) {
        if ((elem instanceof typeFilter) && (elem.name === name)) {
          return elem
        }
      } else {
        if (elem.name === name) {
          return elem
        }
      }
    }
    if (this !== namespace && this._parent !== null) {
      return this._parent.lookup(name, typeFilter, namespace)
    }
    return null
  }

  /**
   * Find by name in child elements
   *
   * @param {string | Array.<string>} name
   * @return {Element}
   */
  findByName (name) {
    var children = this.getChildren()
    for (var i = 0, len = children.length; i < len; i++) {
      var elem = children[i]
      if (elem.name === name) {
        return elem
      }
    }
    return null
  }

  /**
   * Look down an element along parent-children chains.
   *
   * @param {Array.<string>} pathName
   * @return {Element}
   */
  lookdown (pathName) {
    if (_.isArray(pathName) && pathName.length > 0) {
      var elem = this.findByName(pathName[0])
      if (pathName.length === 1) {
        return elem
      } else if (elem) {
        return elem.lookdown(_.tail(pathName))
      }
    }
    return null
  }

  /**
   * Return true only if a given elem is one of the container.
   *
   * @param {Element} elem
   * @return {boolean}
   */
  isOneOfTheContainers (elem) {
    if ((this._parent === null) || (elem === this)) {
      return false
    } else if (elem === this._parent) {
      return true
    } else {
      return this._parent.isOneOfTheContainers(elem)
    }
  }

  /**
   * Return true only if it can contain the kind of elements
   *
   * @param {string} kind
   * @return {Boolean}
   */
  canContainKind (kind) {
    var attrs = this.getMetaAttributes()
    for (var i = 0, len = attrs.length; i < len; i++) {
      var attr = attrs[i]
      if (attr.kind === Element.AK_OBJ || attr.kind === Element.AK_OBJS) {
        if (attr.type && global.meta[kind] && (app.metamodels.isKindOf(kind, attr.type))) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Return true only if it can contain a given element.
   *
   * @param {Element} elem
   * @return {Boolean}
   */
  canContain (elem) {
    if (elem !== null) {
      return this.canContainKind(elem.getClassName()) &&
      (elem !== this) &&
      (!this.isOneOfTheContainers(elem))
    } else {
      return false
    }
  }

  /**
   * Return true only if it could be copied.
   * @return {Boolean}
   */
  canCopy () {
    return true
  }

  /**
   * Return true only if it could be deleted alone.
   * @return {Boolean}
   */
  canDelete () {
    return true
  }

  /**
   * Return true only if it could be hidden without deletion.
   * @return {Boolean}
   */
  canHide () {
    return false
  }

  /**
   * Return true only if it can accomodate elements in clipboard
   *     based on a given kind and copyContext.
   *
   * @param {string} kind
   * @param {{field:string}} copyContext
   * @return {Boolean}
   */
  canPaste (kind, copyContext) {
    return this.canContainKind(kind) && this[copyContext.field]
  }
}

/**
 * Constant for Attribute Kind (`'prim'`)
 * @const {string}
 */
Element.AK_PRIM = 'prim'

/**
 * Constant for Attribute Kind (`'enum'`)
 * @const {string}
 */
Element.AK_ENUM = 'enum'

/**
 * Constant for Attribute Kind (`'ref'`)
 * @const {string}
 */
Element.AK_REF = 'ref'

/**
 * Constant for Attribute Kind (`'refs'`)
 * @const {string}
 */
Element.AK_REFS = 'refs'

/**
 * Constant for Attribute Kind (`'obj'`)
 * @const {string}
 */
Element.AK_OBJ = 'obj'

/**
 * Constant for Attribute Kind (`'objs'`)
 * @const {string}
 */
Element.AK_OBJS = 'objs'

/**
 * Constant for Attribute Kind (`'var'`)
 * @const {string}
 */
Element.AK_VAR = 'var'

/**
 * Constant for Attribute Kind (`'custom'`)
 * @const {string}
 */
Element.AK_CUSTOM = 'custom'

/**
 * Return a super type of a given type.
 *
 * @param {constructor} subType
 * @return {constructor} - superType of subType
 */
Element.getSuperType = function (subType) {
  if (subType) {
    return global.type[global.meta[subType.name].super]
  } else {
    return null
  }
}

/**
 * Return a generalized type of given elements.
 *
 * @param {Array.<Element>} elems
 * @return {constructor}
 */
Element.getCommonType = function (elems) {
  if (elems && elems.length > 0) {
    var commonType = elems[0].getClass()
    while (!_.every(elems, e => { return (e instanceof commonType) })) {
      commonType = Element.getSuperType(commonType)
    }
    return commonType
  } else {
    return null
  }
}

/**
 * @private
 * Find element by name in a given array.
 *
 * @param {Array.<Element>} array
 * @param {string} name
 * @return {Element}
 */
Element.findByName = function (array, name) {
  if (array && array.length > 0) {
    for (var i = 0, len = array.length; i < len; i++) {
      var elem = array[i]
      if (elem.name === name) {
        return elem
      }
    }
  }
  return null
}

/**
 * Find an available name in a given array. (e.g. Class1, Class2, ... )
 *
 * @param {Array.<Element>} array
 * @param {string} prefix Prefix for name
 * @return {string} Return a new name
 */
Element.getNewName = function (array, prefix) {
  var num = 0
  var name = null
  do {
    num++
    name = prefix + num
  } while (Element.findByName(array, name))
  return name
}

/**
 * Merge values of a particular property of an array of elements
 * If all values are same, then return the value. Otherwise, return null.
 * @param {Array<Element>} elems
 * @param {string} prop
 */
Element.mergeProps = function (elems, prop) {
  // Collect values only if elem has the prop.
  var values = []
  _.each(elems, function (e) {
    if (typeof e[prop] !== 'undefined') {
      values.push(e[prop])
    }
  })
  // if all values are same, then return that value, otherwise return null;
  if (values.length > 0) {
    var value = values[0]
    for (var i = 0, len = values.length; i < len; i++) {
      if (value !== values[i]) {
        return null
      }
    }
    return value
  } else {
    return null
  }
}

/**
 * Model
 */
class Model extends Element {

  constructor () {
    super()

    /** @member {string} */
    this.name = ''

    /** @member {Array.<Model>} */
    this.ownedElements = []
  }

  /**
  * Get a corresponding view type
  *
  * @return {constructor}
  */
  getViewType () {
    var typeName = app.metamodels.getViewTypeOf(this.getClassName())
    var ViewType = typeName ? type[typeName] : null
    return ViewType
  }

  /**
  * Get path to from a given base
  *
  * @param {Model} base
  * @return {Array.<string>}
  */
  getPath (base) {
    if (this === base) {
      return []
    } else if (!this._parent) {
      return [this]
    } else if (this._parent) {
      var result = this._parent.getPath(base)
      result.push(this)
      return result
    }
  }

  /**
  * Return full pathname
  *
  * @return {string}
  */
  getPathname () {
    var _name = this.name
    if (this._parent && this._parent._parent) {
      return this._parent.getPathname() + '::' + _name
    } else {
      return _name
    }
  }

  /**
  * Return true only if it can contain a given element.
  *
  * @override
  * @param {Element} elem
  * @return {Boolean}
  */
  canContain (elem) {
    if (elem !== null) {
      if (elem instanceof Diagram) {
        return this.canContainDiagram(elem)
      } else {
        return this.canContainKind(elem.getClassName()) &&
        (elem !== this) &&
        (!this.isOneOfTheContainers(elem))
      }
    } else {
      return false
    }
  }

  /**
  * Determines whether a given diagram type name can be contained or not.
  *
  * @param {string} kind
  * @return {Boolean}
  */
  canContainDiagramKind (kind) {
    return false
  }

  /**
  * Determines whether a given diagram can be contained or not.
  *
  * @param {Diagram} diagram
  * @return {Boolean}
  */
  canContainDiagram (diagram) {
    return this.canContainDiagramKind(diagram.getClassName())
  }

  /**
  * Determines whether this object can be relocated to a given element.
  *
  * @param {Model} model
  * @return {Boolean}
  */
  canRelocateTo (model) {
    return model.canContain(this)
  }
}

/**
 * Tag
 */
class Tag extends Model {

  constructor () {
    super()

    /** @member {TagKind} */
    this.kind = Tag.TK_STRING

    /** @member {*} */
    this.value = ''

    /** @member {Model} */
    this.reference = null

    /** @member {boolean} */
    this.checked = false

    /** @member {number} */
    this.number = 0

    /** @member {boolean} */
    this.hidden = false
  }

  toString (showHidden = false) {
    let s = null
    switch (this.kind) {
    case Tag.TK_STRING:
      s = this.name + '="' + this.value + '"'
      break
    case Tag.TK_REFERENCE:
      if (this.reference instanceof Model) {
        s = this.name + '=' + this.reference.name
      } else {
        s = this.name + '=null'
      }
      break
    case Tag.TK_BOOLEAN:
      s = this.name + '=' + this.checked
      break
    case Tag.TK_NUMBER:
      s = this.name + '=' + this.number
      break
    case 'hidden': // DEPRECATED
      this.kind = Tag.TK_STRING
      this.hidden = true
      s = this.name + '="' + this.value + '"'
      break
    }
    return showHidden ? s : (this.hidden ? null : s)
  }

  getValueString () {
    switch (this.kind) {
    case Tag.TK_STRING:
      return `"${this.value}"`
    case Tag.TK_REFERENCE:
      if (this.reference instanceof Model) {
        return `${this.reference.name}`
      } else {
        return `null`
      }
    case Tag.TK_BOOLEAN:
      return this.checked ? 'true' : 'false'
    case Tag.TK_NUMBER:
      return `${this.number}`
    case 'hidden': // DEPRECATED
      return `"${this.value}"`
    default:
      return null
    }
  }
}

/**
 * TagKind: String (`'string'`)
 * @const {string}
 */
Tag.TK_STRING = 'string'

/**
 * TagKind: Reference (`'reference'`)
 * @const {string}
 */
Tag.TK_REFERENCE = 'reference'

/**
 * TagKind: Boolean (`'boolean'`)
 * @const {string}
 */
Tag.TK_BOOLEAN = 'boolean'

/**
 * TagKind: Number (`'number'`)
 * @const {string}
 */
Tag.TK_NUMBER = 'number'

/**
 * Hyperlink
 */
class Hyperlink extends Model {

  constructor () {
    super()

    /** @member {Model} */
    this.reference = null

    /** @member {*} */
    this.url = ''
  }

  getNodeText (options) {
    if (this.reference instanceof type.Model) {
      return '(link to ' + this.reference.name + ')'
    } else if (this.url && this.url.length > 0) {
      return '(link to ' + this.url + ')'
    } else {
      return '(none)'
    }
  }
}

/**
* ExtensibleModel
*/
class ExtensibleModel extends Model {

  constructor () {
    super()

    /** @member {string} */
    this.documentation = ''

    /** @member {Array.<Tag>} */
    this.tags = []
  }

  /**
  * Return whether element has a specific tag
  *
  * @param {string} tagName
  * @return {Boolean}
  */
  hasTag (tagName) {
    for (var i = 0, len = this.tags.length; i < len; i++) {
      var tag = this.tags[i]
      if (tag.name === tagName) {
        return true
      }
    }
    return false
  }

  /**
  * Return a specific tag by name
  *
  * @param {string} tagName
  * @return {Tag|undefined}
  */
  getTag (tagName) {
    for (var i = 0, len = this.tags.length; i < len; i++) {
      var tag = this.tags[i]
      if (tag.name === tagName) {
        return tag
      }
    }
    return undefined
  }

  /**
  * Return value of a specific tag
  *
  * @param {string} tagName
  * @return {Boolean|undefined}
  */
  getTagValue (tagName) {
    for (var i = 0, len = this.tags.length; i < len; i++) {
      var tag = this.tags[i]
      if (tag.name === tagName) {
        return tag.value
      }
    }
    return undefined
  }
}

/**
* Relationship
*/
class Relationship extends ExtensibleModel {
}

/**
* DirectedRelationship
*/
class DirectedRelationship extends Relationship {

  constructor () {
    super()

    /** @member {Model} */
    this.target = null

    /** @member {Model} */
    this.source = null
  }

  getNodeText (options) {
    if (!this.source || !this.target) {
      console.error('source or target is not assigned')
      console.log(this)
      return '(?→?)'
    }
    var _text = '(' + this.source.name + '→' + this.target.name + ')'
    if (this.name && this.name.length > 0) {
      _text = this.name + ' ' + _text
    }
    return _text
  }
}

/**
* RelationshipEnd
*/
class RelationshipEnd extends ExtensibleModel {

  constructor () {
    super()

    /** @member {Model} */
    this.reference = null
  }

  canDelete () {
    return false
  }
}

/**
* UndirectedRelationship
*/
class UndirectedRelationship extends Relationship {

  constructor () {
    super()

    /** @member {RelationshipEnd} */
    this.end1 = null

    /** @member {RelationshipEnd} */
    this.end2 = null
  }

  getNodeText (options) {
    var _text = ''
    if (this.name && this.name.length > 0) {
      _text += this.name + ' '
    }
    _text += '(' + this.end1.reference.name + '—' + this.end2.reference.name + ')'
    return _text
  }
}

/**
 * View
 */
class View extends Element {

  constructor () {
    super()

    /** @member {Model} */
    this.model = null

    /** @member {Array.<View>} */
    this.subViews = []

    /** @member {View} */
    this.containerView = null

    /** @member {Array.<View>} */
    this.containedViews = []

    /** @member {boolean} */
    this.visible = true

    /** @member {boolean} */
    this.enabled = true

    /** @member {boolean} */
    this.selected = false

    /** @member {number} */
    this.selectable = View.SK_YES

    /** @member {string} */
    this.lineColor = app.preferences.get('view.lineColor', '#000000')

    /** @member {string} */
    this.fillColor = app.preferences.get('view.fillColor', '#ffffff')

    /** @member {string} */
    this.fontColor = app.preferences.get('view.fontColor', '#000000')

    /** @member {Font} */
    this.font = new Font(
      app.preferences.get('view.font', 'Arial'),
      app.preferences.get('view.fontSize', 13),
      Font.FS_NORMAL
    )

    /** @private @member {boolean} */
    this.parentStyle = false

    /** @member {boolean} */
    this.showShadow = app.preferences.get('view.showShadow', true)

    /** @private @member {boolean} */
    this.containerChangeable = false

    /** @private @member {boolean} */
    this.containerExtending = false

    /** @private @member {number} */
    this.zIndex = 0

    /** @private @member {number} */
    this.selectZIndex = 0
  }

  /**
   * Traverse all sub views recursively (Breadth-First Traversal)
   *
   * @param {function} fun
   */
  traverse (fun) {
    fun(this)
    var ref = this.subViews
    for (var i = 0, len = ref.length; i < len; i++) {
      var v = ref[i]
      v.traverse(fun)
    }
  }

  /**
   * Traverse all sub views recursively (Depth-First Traversal)
   *
   * @param {function} fun
   */
  traverseDepthFirst (fun) {
    var ref = this.subViews
    for (var i = 0, len = ref.length; i < len; i++) {
      var v = ref[i]
      v.traverseDepthFirst(fun)
    }
    fun(this)
  }

  find (predicate) {
    if (predicate(this)) {
      return this
    }
    var ref = this.subViews
    for (var i = 0, len = ref.length; i < len; i++) {
      var v = ref[i]
      var result = v.find(predicate)
      if (result) {
        return result
      }
    }
    return null
  }

  findDepthFirst (predicate) {
    var ref = this.subViews
    for (var i = 0, len = ref.length; i < len; i++) {
      var v = ref[i]
      var result = v.findDepthFirst(predicate)
      if (result) {
        return result
      }
    }
    if (predicate(this)) {
      return this
    }
    return null
  }

  /**
   * Assign styles to canvas.
   * @private
   *
   * @param {Canvas} canvas
   */
  assignStyleToCanvas (canvas) {
    canvas.color = this.lineColor
    canvas.fillColor = this.fillColor
    canvas.fontColor = this.fontColor
    canvas.font.face = this.font.face
    canvas.font.size = this.font.size
    canvas.font.style = this.font.style
  }

  /**
   * @private
   * ...
   */
  delimitContainingBoundary (canvas) {}

  /**
   * Initialize view object.
   * @private
   *
   * @abstract
   * @param {Canvas} canvas
   */
  initialize (canvas, x1, y1, x2, y2) {}

  /**
   * Move view object including all sub views by (dx, dy)
   * @private
   *
   * @param {Canvas} canvas
   * @param {number} dx
   * @param {number} dy
   */
  move (canvas, dx, dy) {
    this.moveObject(canvas, dx, dy)
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var v = this.subViews[i]
      v.move(canvas, dx, dy)
    }
  }

  /**
   * Move this view object by (dx, dy).
   * @private
   *
   * @param {Canvas} canvas
   * @param {number} dx
   * @param {number} dy
   */
  moveObject (canvas, dx, dy) {}

  /**
   * Setup view object (styles and attributes)
   * @private
   *
   * @param {Canvas} canvas
   */
  setup (canvas) {
    if (this.parentStyle === true && this._parent && this._parent.font) {
      this.lineColor = this._parent.lineColor
      this.fillColor = this._parent.fillColor
      this.fontColor = this._parent.fontColor
      this.font.face = this._parent.font.face
      this.font.size = this._parent.font.size
      this.font.style = this._parent.font.style
    }
    this.assignStyleToCanvas(canvas)
    // if (this._parent && this._parent.visible === false) {
    //   this.visible = false
    // }
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var v = this.subViews[i]
      v.setup(canvas)
    }
  }

  /**
   * Update view object from a corresponding model object.
   * @private
   *
   * @param {Canvas} canvas
   */
  update (canvas) {
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var v = this.subViews[i]
      v.update(canvas)
    }
  }

  /**
   * Compute it's size
   * @private
   *
   * @param {Canvas} canvas
   */
  size (canvas) {
    this.assignStyleToCanvas(canvas)
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var v = this.subViews[i]
      v.size(canvas)
    }
    this.sizeObject(canvas)
  }

  /**
   * Compute it's size
   * @private
   *
   * @param {Canvas} canvas
   */
  sizeObject (canvas) {}

  /**
   * Arrange this view object.
   * @private
   *
   * @param {Canvas} canvas
   */
  arrange (canvas) {
    this.assignStyleToCanvas(canvas)
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var v = this.subViews[i]
      v.arrange(canvas)
    }
    this.delimitContainingBoundary(canvas)
    this.arrangeObject(canvas)
  }

  /**
   * Arrange this view object.
   * @private
   *
   * @param {Canvas} canvas
   */
  arrangeObject (canvas) {}

  /**
   * Draw shadow.
   * @private
   *
   * @param {Canvas} canvas
   */
  drawShadow (canvas) {
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var v = this.subViews[i]
      if (v.visible) {
        v.drawShadow(canvas)
      }
    }
  }

  /**
   * Draw view object.
   * @private
   *
   * @param {Canvas} canvas
   */
  draw (canvas) {
    this.assignStyleToCanvas(canvas)
    this.drawObject(canvas)
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var v = this.subViews[i]
      if (v.visible) {
        v.draw(canvas)
      }
    }
  }

  /**
   * Draw view object.
   * @private
   *
   * @param {Canvas} canvas
   */
  drawObject (canvas) {}

  /**
   * Draw selection of this view object.
   * @private
   *
   * @abstract
   * @param {Canvas} canvas
   */
  drawSelection (canvas) {}

  /**
   * Return a sub view located at (x, y).
   * @private
   *
   * @param {Canvas} canvas
   * @param {number} x
   * @param {number} y
   */
  getViewAt (canvas, x, y) {
    for (var i = this.subViews.length - 1; i >= 0; i--) {
      var v = this.subViews[i]
      if (v.visible && (v.selectable !== View.SK_NO)) {
        var sub = v.getViewAt(canvas, x, y)
        if (sub !== null) {
          return sub
        }
      }
    }
    if (this.containsPoint(canvas, x, y) && (this.selectable === View.SK_YES)) {
      return this
    }
    return null
  }

  /**
   * Return a diagram containg this view object.
   *
   * @return {View}
   */
  getDiagram () {
    if (this._parent instanceof Diagram) {
      return this._parent
    } else if (this._parent !== null) {
      return this._parent.getDiagram()
    }
    return null
  }

  /**
   * Return a bounding box.
   * @private
   *
   * @param {Canvas} canvas
   * @return {Rect}
   */
  getBoundingBox (canvas) {
    return new Rect(-1, -1, 0, 0)
  }

  /**
   * Determines whether this view contains a point (x, y)
   * @private
   *
   * @param {Canvas} canvas
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  containsPoint (canvas, x, y) {
    var r = this.getBoundingBox(canvas)
    if (this.selected) {
      var zr = r
      var zp = new Point(x, y)
      Coord.coordTransform2(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, zr)
      zr.setRect(zr.x1 - GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, zr.y1 - GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, zr.x2 + GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, zr.y2 + GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE)
      Coord.coordTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, zp)
      return Coord.ptInRect(zp.x, zp.y, zr)
    }
    return Coord.ptInRect(x, y, r)
  }

  /**
   * Determines whether this view overlaps a given rect
   * @private
   *
   * @param {Canvas} canvas
   * @param {Rect} rect
   * @return {boolean}
   */
  overlapRect (canvas, rect) {
    var bound = this.getBoundingBox(canvas)
    if (this.selected) {
      bound.setRect(bound.x1 - 5, bound.y1 - 5, bound.x2 + 5, bound.y2 + 5)
    }
    return Coord.rectInRect(rect, bound)
  }

  /**
   * Add a sub view.
   * @private
   *
   * @param {View} view
   */
  addSubView (view) {
    this.subViews.push(view)
    view._parent = this
  }

  /**
   * Remove a sub view
   * @private
   *
   * @param {View} view
   */
  removeSubView (view) {
    if (this.subViews.indexOf(view) > -1) {
      this.subViews.splice(this.subViews.indexOf(view), 1)
    }
    view._parent = null
  }

  /**
   * Add a contained view.
   * @private
   *
   * @param {View} view
   */
  addContainedView (view) {
    this.containedViews.push(view)
    view.containerView = this
  }

  /**
   * Remove a contained view.
   * @private
   * @param {View} view
   */
  removeContainedView (view) {
    if (this.containedViews.indexOf(view) > -1) {
      this.containedViews.splice(this.containedViews.indexOf(view), 1)
    }
    view.containerView = null
  }

  /**
   * @private
   */
  isOneOfTheContainerViews (view) {
    if ((this.containerView === null) || (view === this)) {
      return false
    } else if (this.containerView === view) {
      return true
    } else {
      return this.containerView.isOneOfTheContainerViews(view)
    }
  }

  /**
   * @private
   */
  canContainViewKind (kind) {
    return false
  }

  /**
   * @private
   */
  canContainView (view) {
    return (view !== null) &&
    (view !== this) &&
    (!this.isOneOfTheContainerViews(view)) &&
    (this.canContainViewKind(view.getClassName()))
  }

  /**
   * @private
   */
  drawContainingBox (canvas) {
    var rect = this.getBoundingBox(canvas)
    GraphicUtils.drawRangeBox(canvas, rect.x1 + 1, rect.y1 + 1, rect.x2 - 1, rect.y2 - 1)
  }

  /**
   * @private
   */
  eraseContainingBox (canvas) {}
}

/**
 * Constant for Selectable Kind
 * @const {number}
 */
View.SK_NO = 0

/**
 * Constant for Selectable Kind
 * @const {number}
 */
View.SK_YES = 1

/**
 * Constant for Selectable Kind
 * @const {number}
 */
View.SK_PROPAGATE = 2

/**
 * NodeView
 */
class NodeView extends View {

  constructor () {
    super()

    /** @member {number} */
    this.left = 0

    /** @member {number} */
    this.top = 0

    /** @member {number} */
    this.width = 0

    /** @member {number} */
    this.height = 0

    /** @member {number} */
    this.minWidth = 0

    /** @member {number} */
    this.minHeight = 0

    /** @member {number} */
    this.sizable = NodeView.SZ_FREE

    /** @member {number} */
    this.movable = NodeView.MM_FREE

    /** @member {Boolean} */
    this.autoResize = false
  }

  getRight () {
    return this.left + this.width - 1
  }

  setRight (value) {
    this.width = value - this.left + 1
  }

  get right () {
    return this.getRight()
  }

  set right (value) {
    this.setRight(value)
  }

  getBottom () {
    return this.top + this.height - 1
  }

  setBottom (value) {
    this.height = value - this.top + 1
  }

  get bottom () {
    return this.getBottom()
  }

  set bottom (value) {
    this.getBottom(value)
  }

  getCenter () {
    return new Point((this.left + this.getRight()) / 2, (this.top + this.getBottom()) / 2)
  }

  moveObject (canvas, dx, dy) {
    this.left = this.left + dx
    this.top = this.top + dy
  }

  initialize (canvas, x1, y1, x2, y2) {
    var r = new Rect(x1, y1, x2, y2)
    Coord.normalizeRect(r)
    this.left = r.x1
    this.top = r.y1
    this.width = Math.max(this.minWidth, r.x2 - r.x1)
    this.height = Math.max(this.minHeight, r.y2 - r.y1)
  }

  sizeConstraints (canvas) {
    if (this.autoResize && this.minWidth > 0 && this.minHeight > 0) {
      this.width = this.minWidth
      this.height = this.minHeight
    }
    if (this.width < this.minWidth) {
      this.width = this.minWidth
    }
    if (this.height < this.minHeight) {
      this.height = this.minHeight
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
  }

  drawSelection (canvas) {
    if (this.sizable === NodeView.SZ_NONE) {
      GraphicUtils.drawSelection(canvas, this.left - 1, this.top - 1, this.getRight() + 1, this.getBottom() + 1)
    } else {
      var retouch = !(this.sizable === NodeView.SZ_FREE || this.sizable === NodeView.SZ_RATIO)
      var x1, x2, y1, y2
      x1 = this.left - 1
      y1 = this.top - 1
      x2 = this.getRight() + 1
      y2 = this.top - 1
      GraphicUtils.drawSelectionLine(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_SELECTIONLINE_WIDTH, GraphicUtils.NWSE_N, retouch)
      x1 = this.left - 1
      y1 = this.top - 1
      x2 = this.left - 1
      y2 = this.getBottom() + 1
      GraphicUtils.drawSelectionLine(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_SELECTIONLINE_WIDTH, GraphicUtils.NWSE_W, retouch)
      x1 = this.getRight() + 1
      y1 = this.top - 1
      x2 = this.getRight() + 1
      y2 = this.getBottom() + 1
      GraphicUtils.drawSelectionLine(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_SELECTIONLINE_WIDTH, GraphicUtils.NWSE_E, retouch)
      x1 = this.left - 1
      y1 = this.getBottom() + 1
      x2 = this.getRight() + 1
      y2 = this.getBottom() + 1
      GraphicUtils.drawSelectionLine(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_SELECTIONLINE_WIDTH, GraphicUtils.NWSE_S, retouch)

      x1 = this.left - 1
      y1 = this.top - 1
      x2 = this.getRight() + 1
      y2 = this.getBottom() + 1
      GraphicUtils.drawSelectionBox(canvas, x1, y1, x2, y2)

      if (this.sizable === NodeView.SZ_FREE || this.sizable === NodeView.SZ_RATIO) {
        GraphicUtils.drawHighlighter2(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, GraphicUtils.CT_LT, true, GraphicUtils.HIGHLIGHTER_COLOR)
        GraphicUtils.drawHighlighter2(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, GraphicUtils.CT_RT, true, GraphicUtils.HIGHLIGHTER_COLOR)
        GraphicUtils.drawHighlighter2(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, GraphicUtils.CT_LB, true, GraphicUtils.HIGHLIGHTER_COLOR)
        GraphicUtils.drawHighlighter2(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, GraphicUtils.CT_RB, true, GraphicUtils.HIGHLIGHTER_COLOR)
      }
      if (this.sizable === NodeView.SZ_FREE || this.sizable === NodeView.SZ_VERT) {
        GraphicUtils.drawHighlighter2(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, GraphicUtils.CT_MT, true, GraphicUtils.HIGHLIGHTER_COLOR)
        GraphicUtils.drawHighlighter2(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, GraphicUtils.CT_MB, true, GraphicUtils.HIGHLIGHTER_COLOR)
      }
      if (this.sizable === NodeView.SZ_FREE || this.sizable === NodeView.SZ_HORZ) {
        GraphicUtils.drawHighlighter2(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, GraphicUtils.CT_LM, true, GraphicUtils.HIGHLIGHTER_COLOR)
        GraphicUtils.drawHighlighter2(canvas, x1, y1, x2, y2, GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE, GraphicUtils.CT_RM, true, GraphicUtils.HIGHLIGHTER_COLOR)
      }
    }
  }

  getBoundingBox (canvas) {
    return new Rect(this.left, this.top, this.getRight(), this.getBottom())
  }
}

/**
 * Sizing Mode: None (0)
 * @const {number}
 */
NodeView.SZ_NONE = 0

/**
 * Sizing Mode: Horizontal (1)
 * @const {number}
 */
NodeView.SZ_HORZ = 1

/**
 * Sizing Mode: Vertical (2)
 * @const {number}
 */
NodeView.SZ_VERT = 2

/**
 * Sizing Mode: Ratio (3)
 * @const {number}
 */
NodeView.SZ_RATIO = 3

/**
 * Sizing Mode: Free (4)
 * @const {number}
 */
NodeView.SZ_FREE = 4

/**
 * Move Mode: None (0)
 * @const {number}
 */
NodeView.MM_NONE = 0

/**
 * Move Mode: Horizontal (1)
 * @const {number}
 */
NodeView.MM_HORZ = 1

/**
 * Move Mode: Vertical (2)
 * @const {number}
 */
NodeView.MM_VERT = 2

/**
 * Move Mode: Free (3)
 * @const {number}
 */
NodeView.MM_FREE = 3

/**
 * EdgeView
 */
class EdgeView extends View {

  constructor () {
    super()

    this.BACKGROUND_COLOR = Color.WHITE

    /** @member {View} */
    this.head = null

    /** @member {View} */
    this.tail = null

    /** @member {number} */
    this.lineStyle = app.preferences.get('view.lineStyle', EdgeView.LS_OBLIQUE)

    /** @member {Points} */
    this.points = new Points()

    this.lineMode = EdgeView.LM_SOLID
    this.headEndStyle = EdgeView.ES_FLAT
    this.tailEndStyle = EdgeView.ES_FLAT
  }

  reducePoints (canvas) {
    var b, i, j, _i, _results
    if (this.tail && !(this.tail instanceof EdgeView)) {
      b = this.tail.getBoundingBox(canvas)
      i = 1
      while (i < this.points.count() - 1) {
        if (Coord.ptInRect2(this.points.getPoint(i), b)) {
          for (j = _i = 1; 1 <= i ? _i <= i : _i >= i; j = 1 <= i ? ++_i : --_i) {
            this.points.remove(1)
          }
          i = 1
        } else {
          i++
        }
      }
    }
    if (this.head && !(this.head instanceof EdgeView)) {
      b = this.head.getBoundingBox(canvas)
      i = 1
      _results = []
      while (i < this.points.count() - 1) {
        if (Coord.ptInRect2(this.points.getPoint(i), b)) {
          _results.push((function () {
            var _j, _ref, _results1
            _results1 = []
            for (j = _j = 1, _ref = this.points.count() - i - 1; 1 <= _ref ? _j <= _ref : _j >= _ref; j = 1 <= _ref ? ++_j : --_j) {
              _results1.push(this.points.remove(i))
            }
            return _results1
          }).call(this))
        } else {
          _results.push(i++)
        }
      }
      return _results
    }
  }

  recalcOblique (canvas) {
    var hb, headPoints, i, tailPoints, tb
    this.reducePoints(canvas)
    if (this.tail && !(this.tail instanceof EdgeView)) {
      tb = this.tail.getBoundingBox(canvas)
    } else if (this.tail && this.tail instanceof EdgeView) {
      tailPoints = this.tail.points
      i = Math.floor((tailPoints.count() - 1) / 2)
      tb = new Rect(tailPoints.getPoint(i).x, tailPoints.getPoint(i).y, tailPoints.getPoint(i + 1).x, tailPoints.getPoint(i + 1).y)
    }
    if (tb) this.points.setPoint(0, Coord.getCenter(tb))
    if (this.head && !(this.head instanceof EdgeView)) {
      hb = this.head.getBoundingBox(canvas)
    } else if (this.head && this.head instanceof EdgeView) {
      headPoints = this.head.points
      i = Math.floor((headPoints.count() - 1) / 2)
      hb = new Rect(headPoints.getPoint(i).x, headPoints.getPoint(i).y, headPoints.getPoint(i + 1).x, headPoints.getPoint(i + 1).y)
    }
    if (tb) tb.expand(1)
    if (hb) hb.expand(1)
    if (hb) this.points.setPoint(this.points.count() - 1, Coord.getCenter(hb))
    if (this.tail && !(this.tail instanceof EdgeView)) {
      this.points.setPoint(0, Coord.junction(tb, this.points.getPoint(1)))
    }
    if (this.head && !(this.head instanceof EdgeView)) {
      this.points.setPoint(this.points.count() - 1, Coord.junction(hb, this.points.getPoint(this.points.count() - 2)))
    }
  }

  recalcRectilinear (canvas) {
    var bb, bh, bt, h, hps, i, p, tps, w
    if (this.head && this.tail && this.head === this.tail) {
      if (this.points.count() <= 3) {
        this.points.clear()
        bb = this.head.getBoundingBox(canvas)
        w = bb.x2 - bb.x1
        h = bb.y2 - bb.y1
        this.points.add(Coord.getCenter(bb))
        this.points.add(new Point(this.points.getPoint(0).x, Math.floor(this.points.getPoint(0).y - (h / 2) - SELF_EDGE_VERTI_INTERVAL)))
        this.points.add(new Point(Math.floor(this.points.getPoint(0).x + (w / 2) + SELF_EDGE_HORIZ_INTERVAL), Math.floor(this.points.getPoint(0).y - (h / 2) - SELF_EDGE_VERTI_INTERVAL)))
        this.points.add(new Point(Math.floor(this.points.getPoint(0).x + (w / 2) + SELF_EDGE_HORIZ_INTERVAL), this.points.getPoint(0).y))
        this.points.add(Coord.getCenter(bb))
      }
    }
    if (this.tail && !(this.tail instanceof EdgeView)) {
      bt = this.tail.getBoundingBox(canvas)
    } else if (this.tail && this.tail instanceof EdgeView) {
      tps = this.tail.points
      i = Math.floor((tps.count() - 1) / 2)
      bt = new Rect(tps.getPoint(i).x, tps.getPoint(i).y, tps.getPoint(i + 1).x, tps.getPoint(i + 1).y)
      bt.setRect3(Coord.getCenter(bt), Coord.getCenter(bt))
    }
    if (this.head && !(this.head instanceof EdgeView)) {
      bh = this.head.getBoundingBox(canvas)
    } else if (this.head && this.head instanceof EdgeView) {
      hps = this.head.points
      i = Math.floor((hps.count() - 1) / 2)
      bh = new Rect(hps.getPoint(i).x, hps.getPoint(i).y, hps.getPoint(i + 1).x, hps.getPoint(i + 1).y)
      bh.setRect3(Coord.getCenter(bh), Coord.getCenter(bh))
      bt.expand(1)
      bh.expand(1)
    }

    // Add new point, if have not enough points.
    if (bt && bh && this.points.count() === 2) {
      p = Coord.orthoJunction(bt, this.points.getPoint(1))
      if ((p.x === -100) && (p.y === -100)) {
        this.points.insert(0, Coord.orthoJunction(bt, this.points.getPoint(0)))
      } else {
        this.points.setPoint(0, p)
      }
      p = Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 2))
      if ((p.x === -100) && (p.y === -100)) {
        this.points.add(Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 1)))
      } else {
        this.points.setPoint(this.points.count() - 1, p)
      }
    }

    // Replace 0-indexed point with junction point to TailView
    if (bt) {
      p = Coord.orthoJunction(bt, this.points.getPoint(1))
      if ((p.x === -100) && (p.y === -100)) {
        if (this.points.getPoint(1).y === this.points.getPoint(2).y) {
          this.points.setPoint(1, new Point(Coord.getCenter(bt).x, this.points.getPoint(1).y))
        } else {
          this.points.setPoint(1, new Point(this.points.getPoint(1).x, Coord.getCenter(bt).y))
        }
      }
      this.points.setPoint(0, Coord.orthoJunction(bt, this.points.getPoint(1)))
    }

    // Replace highest-indexed point with junction point to HeadView
    if (bh) {
      p = Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 2))
      if ((p.x === -100) && (p.y === -100)) {
        if (this.points.getPoint(this.points.count() - 2).y === this.points.getPoint(this.points.count() - 3).y) {
          this.points.setPoint(this.points.count() - 2, new Point(Coord.getCenter(bh).x, this.points.getPoint(this.points.count() - 2).y))
        } else {
          this.points.setPoint(this.points.count() - 2, new Point(this.points.getPoint(this.points.count() - 2).x, Coord.getCenter(bh).y))
        }
      }
      this.points.setPoint(this.points.count() - 1, Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 2)))
    }

    // Must be removed, and calculate this in another module (Handlers)
    // FitToGrid(GraphicClasses.GridFactor(5, 5))
    this.points.reduceOrthoLine()
    this.reducePoints(canvas)

    if (bt) {
      p = this.points.getPoint(0).copy()
      this.points.setPoint(0, Coord.orthoJunction(bt, this.points.getPoint(1)))
      if ((this.points.getPoint(0).x === -100) || (this.points.getPoint(0).y === -100)) {
        this.points.setPoint(0, p)
      }
    }

    if (bh) {
      p = this.points.getPoint(this.points.count() - 1).copy()
      this.points.setPoint(this.points.count() - 1, Coord.orthoJunction(bh, this.points.getPoint(this.points.count() - 2)))
      if ((this.points.getPoint(this.points.count() - 1).x === -100) || (this.points.getPoint(this.points.count() - 1).y === -100)) {
        this.points.setPoint(this.points.count() - 1, p)
      }
    }
  }

  recalcDirect (canvas) {
    var hb, headPoints, i, tailPoints, tb
    this.reducePoints(canvas)
    if (this.tail && !(this.tail instanceof EdgeView)) {
      tb = this.tail.getBoundingBox(canvas)
    } else if (this.tail && this.tail instanceof EdgeView) {
      tailPoints = this.tail.points
      i = Math.floor((tailPoints.count() - 1) / 2)
      tb = new Rect(tailPoints.getPoint(i).x, tailPoints.getPoint(i).y, tailPoints.getPoint(i + 1).x, tailPoints.getPoint(i + 1).y)
    }
    this.points.setPoint(0, Coord.getCenter(tb))
    if (this.head && !(this.head instanceof EdgeView)) {
      hb = this.head.getBoundingBox(canvas)
    } else if (this.head && this.head instanceof EdgeView) {
      headPoints = this.head.points
      i = Math.floor((headPoints.count() - 1) / 2)
      hb = new Rect(headPoints.getPoint(i).x, headPoints.getPoint(i).y, headPoints.getPoint(i + 1).x, headPoints.getPoint(i + 1).y)
    }
    tb.expand(1)
    hb.expand(1)
    this.points.setPoint(this.points.count() - 1, Coord.getCenter(hb))
    if (this.tail && !(this.tail instanceof EdgeView)) {
      this.points.setPoint(0, Coord.orthoJunction(tb, this.points.getPoint(1)))
    }
    if (this.head && !(this.head instanceof EdgeView)) {
      this.points.setPoint(this.points.count() - 1, Coord.orthoJunction(hb, this.points.getPoint(this.points.count() - 2)))
    }
  }

  drawLineEnd (canvas, edgeEndStyle, isHead) {
    if (edgeEndStyle !== EdgeView.ES_FLAT) {
      var rt = new Rect(0, 0, 0, 0)
      if (isHead) {
        rt.setRect(this.points.getPoint(this.points.count() - 1).x, this.points.getPoint(this.points.count() - 1).y, this.points.getPoint(this.points.count() - 2).x, this.points.getPoint(this.points.count() - 2).y)
      } else {
        rt.setRect(this.points.getPoint(0).x, this.points.getPoint(0).y, this.points.getPoint(1).x, this.points.getPoint(1).y)
      }
      var a = rt.y2 - rt.y1
      var b = rt.x2 - rt.x1
      var th = Math.atan(a / b)
      if ((a < 0 && b < 0) || (a > 0 && b < 0) || (a === 0 && b < 0)) {
        th = th + Math.PI
      }
      var th1 = th - Math.PI / 8
      var th2 = th + Math.PI / 8
      var th3 = th - Math.PI / 2
      var th4 = th + Math.PI / 2
      var th5 = th - Math.PI / 2
      var th6 = th + Math.PI / 2
      var th7 = th - Math.PI / 4
      var th8 = th + Math.PI / 4
      var th9 = th - Math.PI * 0.75
      var th10 = th + Math.PI * 0.75
      var c1 = 11.0
      var c2 = c1 * 2.0
      var c3 = 7
      var c4 = 5

      // ES_DOT_* end style need some padding for dot notation
      var dotsz = 3
      var dotpt = new Point((dotsz * Math.cos(th)) + rt.x1, (dotsz * Math.sin(th)) + rt.y1)
      if (edgeEndStyle === EdgeView.ES_DOT ||
        edgeEndStyle === EdgeView.ES_DOT_STICK_ARROW ||
        edgeEndStyle === EdgeView.ES_DOT_DIAMOND ||
        edgeEndStyle === EdgeView.ES_DOT_FILLED_DIAMOND ||
        edgeEndStyle === EdgeView.ES_DOT_ARROW_DIAMOND ||
        edgeEndStyle === EdgeView.ES_DOT_ARROW_FILLED_DIAMOND ||
        edgeEndStyle === EdgeView.ES_DOT_CROSS) {
        const pad = dotsz * 2
        const padx = pad * Math.cos(th)
        const pady = pad * Math.sin(th)
        rt.x1 += padx
        rt.y1 += pady
      }

      var p0 = new Point(rt.x1, rt.y1)
      var p1 = new Point((c1 * Math.cos(th1)) + rt.x1, (c1 * Math.sin(th1)) + rt.y1)
      var p2 = new Point((c1 * Math.cos(th2)) + rt.x1, (c1 * Math.sin(th2)) + rt.y1)
      var p3 = new Point((c2 * Math.cos(th)) + rt.x1, (c2 * Math.sin(th)) + rt.y1)
      var p4 = new Point((c2 * Math.cos(th1)) + rt.x1, (c2 * Math.sin(th1)) + rt.y1)
      var p5 = new Point((c2 * Math.cos(th2)) + rt.x1, (c2 * Math.sin(th2)) + rt.y1)
      var p6 = new Point((c1 * Math.cos(th1)) + p3.x, (c1 * Math.sin(th1)) + p3.y)
      var p7 = new Point((c1 * Math.cos(th2)) + p3.x, (c1 * Math.sin(th2)) + p3.y)
      var p8 = new Point((c3 * Math.cos(th)) + rt.x1, (c3 * Math.sin(th)) + rt.y1)
      var p9 = new Point((c3 * Math.cos(th3)) + p8.x, (c3 * Math.sin(th3)) + p8.y)
      var p10 = new Point((c3 * Math.cos(th4)) + p8.x, (c3 * Math.sin(th4)) + p8.y)
      var p11 = new Point(((c3 * 2) * Math.cos(th)) + rt.x1, ((c3 * 2) * Math.sin(th)) + rt.y1)
      var p12 = new Point(c3 * Math.cos(th5) + p0.x, c3 * Math.sin(th5) + p0.y)
      var p13 = new Point(c3 * Math.cos(th6) + p0.x, c3 * Math.sin(th6) + p0.y)
      var p14 = new Point((c3 * Math.cos(th3)) + p11.x, (c3 * Math.sin(th3)) + p11.y)
      var p15 = new Point((c3 * Math.cos(th4)) + p11.x, (c3 * Math.sin(th4)) + p11.y)
      var p16 = new Point((c4 * Math.cos(th7)) + p8.x, (c4 * Math.sin(th7)) + p8.y)
      var p17 = new Point((c4 * Math.cos(th8)) + p8.x, (c4 * Math.sin(th8)) + p8.y)
      var p18 = new Point((c4 * Math.cos(th9)) + p8.x, (c4 * Math.sin(th9)) + p8.y)
      var p19 = new Point((c4 * Math.cos(th10)) + p8.x, (c4 * Math.sin(th10)) + p8.y)

      canvas.color = this.lineColor
      canvas.fillColor = Color.WHITE
      switch (edgeEndStyle) {
      case EdgeView.ES_STICK_ARROW:
      case EdgeView.ES_DOT_STICK_ARROW:
        canvas.polyline([p1, p0, p2])
        break
      case EdgeView.ES_SOLID_ARROW:
        canvas.fillColor = this.lineColor
        canvas.fillPolygon([p1, p0, p2])
        canvas.polygon([p1, p0, p2])
        break
      case EdgeView.ES_TRIANGLE:
        canvas.fillPolygon([p4, p0, p5])
        canvas.polygon([p4, p0, p5])
        break
      case EdgeView.ES_FILLED_TRIANGLE:
        canvas.fillColor = this.lineColor
        canvas.fillPolygon([p4, p0, p5])
        break
      case EdgeView.ES_DIAMOND:
      case EdgeView.ES_DOT_DIAMOND:
        canvas.fillPolygon([p1, p0, p2, p3])
        canvas.polygon([p1, p0, p2, p3])
        break
      case EdgeView.ES_FILLED_DIAMOND:
      case EdgeView.ES_DOT_FILLED_DIAMOND:
        canvas.fillColor = this.lineColor
        canvas.fillPolygon([p1, p0, p2, p3])
        canvas.polygon([p1, p0, p2, p3])
        break
      case EdgeView.ES_ARROW_DIAMOND:
      case EdgeView.ES_DOT_ARROW_DIAMOND:
        canvas.fillPolygon([p1, p0, p2, p3])
        canvas.polygon([p1, p0, p2, p3])
        canvas.polyline([p6, p3, p7])
        break
      case EdgeView.ES_ARROW_FILLED_DIAMOND:
      case EdgeView.ES_DOT_ARROW_FILLED_DIAMOND:
        canvas.fillColor = this.lineColor
        canvas.fillPolygon([p1, p0, p2, p3])
        canvas.polygon([p1, p0, p2, p3])
        canvas.polyline([p6, p3, p7])
        break
      case EdgeView.ES_PLUS:
        canvas.line(p9.x, p9.y, p10.x, p10.y)
        break
      case EdgeView.ES_CIRCLE:
        canvas.fillEllipse(p8.x - c3, p8.y - c3, p8.x + c3, p8.y + c3)
        canvas.ellipse(p8.x - c3, p8.y - c3, p8.x + c3, p8.y + c3)
        break
      case EdgeView.ES_CIRCLE_PLUS:
        canvas.fillEllipse(p8.x - c3, p8.y - c3, p8.x + c3, p8.y + c3)
        canvas.ellipse(p8.x - c3, p8.y - c3, p8.x + c3, p8.y + c3)
        canvas.line(p11.x, p11.y, p0.x, p0.y)
        canvas.line(p9.x, p9.y, p10.x, p10.y)
        break
      case EdgeView.ES_CROWFOOT_ONE:
        canvas.line(p9.x, p9.y, p10.x, p10.y)
        canvas.line(p14.x, p14.y, p15.x, p15.y)
        break
      case EdgeView.ES_CROWFOOT_MANY:
        canvas.line(p11.x, p11.y, p12.x, p12.y)
        canvas.line(p11.x, p11.y, p13.x, p13.y)
        canvas.line(p14.x, p14.y, p15.x, p15.y)
        break
      case EdgeView.ES_CROWFOOT_ZERO_ONE:
        canvas.fillEllipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3)
        canvas.ellipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3)
        canvas.line(p9.x, p9.y, p10.x, p10.y)
        break
      case EdgeView.ES_CROWFOOT_ZERO_MANY:
        canvas.line(p11.x, p11.y, p12.x, p12.y)
        canvas.line(p11.x, p11.y, p13.x, p13.y)
        canvas.fillEllipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3)
        canvas.ellipse(p3.x - c3, p3.y - c3, p3.x + c3, p3.y + c3)
        break
      case EdgeView.ES_CROSS:
      case EdgeView.ES_DOT_CROSS:
        canvas.line(p19.x, p19.y, p16.x, p16.y)
        canvas.line(p17.x, p17.y, p18.x, p18.y)
        break
      }

      // draw dot for ES_DOT_* end style
      if (edgeEndStyle === EdgeView.ES_DOT ||
          edgeEndStyle === EdgeView.ES_DOT_STICK_ARROW ||
          edgeEndStyle === EdgeView.ES_DOT_DIAMOND ||
          edgeEndStyle === EdgeView.ES_DOT_FILLED_DIAMOND ||
          edgeEndStyle === EdgeView.ES_DOT_ARROW_DIAMOND ||
          edgeEndStyle === EdgeView.ES_DOT_ARROW_FILLED_DIAMOND ||
          edgeEndStyle === EdgeView.ES_DOT_CROSS) {
        canvas.fillColor = this.lineColor
        canvas.fillEllipse(dotpt.x - dotsz, dotpt.y - dotsz, dotpt.x + dotsz, dotpt.y + dotsz)
      }
    }
  }

  initialize (canvas, x1, y1, x2, y2) {
    this.points.clear()
    this.points.add(Coord.junction(this.tail.getBoundingBox(canvas), Coord.getCenter(this.head.getBoundingBox(canvas))))
    this.points.add(Coord.junction(this.head.getBoundingBox(canvas), Coord.getCenter(this.tail.getBoundingBox(canvas))))
    if (this.lineStyle === EdgeView.LS_RECTILINEAR || this.lineStyle === EdgeView.LS_ROUNDRECT) {
      this.points.convObliqueToRectilinear()
    }
  }

  moveObject (canvas, dx, dy) {
    var ref = this.points.points
    for (var i = 0, len = ref.length; i < len; i++) {
      var p = ref[i]
      p.setPoint(p.x + dx, p.y + dy)
    }
  }

  recalcPoints (canvas) {
    switch (this.lineStyle) {
    case EdgeView.LS_RECTILINEAR:
      if (!this.points.isRectilinear()) {
        this.points.convObliqueToRectilinear()
      }
      this.recalcRectilinear(canvas)
      break
    case EdgeView.LS_OBLIQUE:
      this.recalcOblique(canvas)
      break
    case EdgeView.LS_ROUNDRECT:
      if (!this.points.isRectilinear()) {
        this.points.convObliqueToRectilinear()
      }
      this.recalcRectilinear(canvas)
      break
    case EdgeView.LS_CURVE:
      this.recalcOblique(canvas)
      break
    case EdgeView.LS_DIRECT:
      this.recalcDirect(canvas)
      break
    default:
      if (!this.points.isRectilinear()) {
        this.points.convObliqueToRectilinear()
      }
      this.recalcRectilinear(canvas)
    }
    this.points.quantize()
  }

  arrangeObject (canvas) {
    if (this.head && this.tail && this.head === this.tail) {
      this.lineStyle = EdgeView.LS_RECTILINEAR
    }
    this.recalcPoints(canvas)
  }

  drawObject (canvas) {
    this.assignStyleToCanvas(canvas)
    canvas.fillColor = this.BACKGROUND_COLOR
    var pattern = null
    switch (this.lineMode) {
    case EdgeView.LM_SOLID:
      pattern = null
      break
    case EdgeView.LM_DOT:
      pattern = [3]
      break
    case EdgeView.LM_DASH:
      pattern = [6, 4]
      break
    }
    switch (this.lineStyle) {
    case EdgeView.LS_RECTILINEAR:
      canvas.polyline(this.points.points, pattern)
      break
    case EdgeView.LS_OBLIQUE:
      canvas.polyline(this.points.points, pattern)
      break
    case EdgeView.LS_ROUNDRECT:
      canvas.roundRectLine(this.points.points, pattern)
      break
    case EdgeView.LS_CURVE:
      canvas.curveLine(this.points.points, pattern)
      break
    default:
      canvas.polyline(this.points.points, pattern)
    }
    this.drawLineEnd(canvas, this.headEndStyle, true)
    this.drawLineEnd(canvas, this.tailEndStyle, false)
  }

  drawSelection (canvas) {
    GraphicUtils.drawDottedLine(canvas, this.points)
    for (var i = 0, len = this.points.points.length; i < len; i++) {
      var p = this.points.points[i]
      GraphicUtils.drawHighlighter(canvas, p.x, p.y, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, true, GraphicUtils.HIGHLIGHTER_COLOR)
    }
  }

  getBoundingBox (canvas) {
    var r = this.points.getBoundingRect()
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var sv = this.subViews[i]
      if (sv.visible) {
        r.setRect2(Coord.unionRect(r, sv.getBoundingBox(canvas)))
      }
    }
    return r
  }

  containsPoint (canvas, x, y) {
    return this.containedIndex(canvas, new Point(x, y)) > -1
  }

  disToPoint (p1, p2) {
    return Math.sqrt(((p1.x - p2.x) * (p1.x - p2.x)) + ((p1.y - p2.y) * (p1.y - p2.y)))
  }

  disToOrthoLine (lh, lt, p) {
    var l1, l2
    l1 = new Point(0, 0)
    l2 = new Point(0, 0)
    if (lh.y === lt.y) {
      if (lh.x > lt.x) {
        l1.setPoint(lt.x, lt.y)
        l2.setPoint(lh.x, lh.y)
      } else {
        l1.setPoint(lh.x, lh.y)
        l2.setPoint(lt.x, lt.y)
      }
      if (p.x > l2.x) {
        return this.disToPoint(p, l2)
      } else if (p.x < l1.x) {
        return this.disToPoint(p, l1)
      } else {
        return Math.abs(p.y - l1.y)
      }
    } else {
      if (lh.y > lt.y) {
        l1.setPoint(lt.x, lt.y)
        l2.setPoint(lh.x, lh.y)
      } else {
        l1.setPoint(lh.x, lh.y)
        l2.setPoint(lt.x, lt.y)
      }
      if (p.y > l2.y) {
        return this.disToPoint(p, l2)
      } else if (p.y < l1.y) {
        return this.disToPoint(p, l1)
      } else {
        return Math.abs(p.x - l1.x)
      }
    }
  }

  containedIndex (canvas, p) {
    var RECOG_MIN_DIS, d, i, minDis, minDisIndex, ph, pt, result, _i, _j, _ref, _ref1
    result = -1
    pt = new Point(0, 0)
    ph = new Point(0, 0)
    if (this.lineStyle === EdgeView.LS_RECTILINEAR || this.lineStyle === EdgeView.LS_ROUNDRECT) {
      RECOG_MIN_DIS = 5
      minDis = RECOG_MIN_DIS
      minDisIndex = -1
      for (i = _i = 0, _ref = this.points.count() - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        pt.setPoint2(this.points.getPoint(i))
        ph.setPoint2(this.points.getPoint(i + 1))
        d = this.disToOrthoLine(ph, pt, p)
        if (d <= minDis) {
          minDis = d
          minDisIndex = i
        }
      }
      result = minDisIndex
    } else {
      result = -1
      for (i = _j = 0, _ref1 = this.points.count() - 2; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        pt.setPoint2(this.points.getPoint(i))
        ph.setPoint2(this.points.getPoint(i + 1))
        if (Coord.ptInLine(new Rect(pt.x, pt.y, ph.x, ph.y), p)) {
          result = i
        }
      }
    }
    return result
  }

  selectedPoint (canvas, p) {
    var result = -1
    for (var i = 0, len = this.points.points.length; i < len; i++) {
      var pt = this.points.points[i]
      if (Coord.equalPt(pt, p)) {
        result = i
      }
    }
    return result
  }

  /**
   * Return true only if this edge can be connected the view
   * @private
   *
   * @param {View} view
   * @param {boolean} isTail Try to connect to tail-side or not
   * @return {boolean}
   */
  canConnectTo (view, isTail) {
    return true
  }
}

/**
 * Line Mode: Solid (0)
 * @const {number}
 */
EdgeView.LM_SOLID = 0

/**
 * Line Mode: Dot (1)
 * @const {number}
 */
EdgeView.LM_DOT = 1

/**
 * Line Mode: Dash (2)
 * @const {number}
 */
EdgeView.LM_DASH = 2

/**
 * Line Style: Rectilinear (0)
 * @const {number}
 */
EdgeView.LS_RECTILINEAR = 0

/**
 * Line Style: Oblique (1)
 * @const {number}
 */
EdgeView.LS_OBLIQUE = 1

/**
 * Line Style: RoundRect (2)
 * @const {number}
 */
EdgeView.LS_ROUNDRECT = 2

/**
 * Line Style: Curve (3)
 * @const {number}
 */
EdgeView.LS_CURVE = 3

/**
 * Line Style: Direct (4)
 * @const {number}
 */
EdgeView.LS_DIRECT = 4

/**
 * Line End Style: Flat (0)
 * @const {number}
 */
EdgeView.ES_FLAT = 0

/**
 * Line End Style: Stick Arrow (1)
 * @const {number}
 */
EdgeView.ES_STICK_ARROW = 1

/**
 * Line End Style: Solid Arrow (2)
 * @const {number}
 */
EdgeView.ES_SOLID_ARROW = 2

/**
 * Line End Style: Triangle (3)
 * @const {number}
 */
EdgeView.ES_TRIANGLE = 3

/**
 * Line End Style: Filled Triangle (4)
 * @const {number}
 */
EdgeView.ES_FILLED_TRIANGLE = 4

/**
 * Line End Style: Diamond (5)
 * @const {number}
 */
EdgeView.ES_DIAMOND = 5

/**
 * Line End Style: Filled Diamond (6)
 * @const {number}
 */
EdgeView.ES_FILLED_DIAMOND = 6

/**
 * Line End Style: Arrow Diamond (7)
 * @const {number}
 */
EdgeView.ES_ARROW_DIAMOND = 7

/**
 * Line End Style: Arrow Filled Diamond (8)
 * @const {number}
 */
EdgeView.ES_ARROW_FILLED_DIAMOND = 8

/**
 * Line End Style: Plus (9)
 * @const {number}
 */
EdgeView.ES_PLUS = 9

/**
 * Line End Style: Circle (10)
 * @const {number}
 */
EdgeView.ES_CIRCLE = 10

/**
 * Line End Style: Circle Plus (11)
 * @const {number}
 */
EdgeView.ES_CIRCLE_PLUS = 11

/**
 * Line End Style: Crow Foot One (12)
 * @const {number}
 */
EdgeView.ES_CROWFOOT_ONE = 12

/**
 * Line End Style: Crow Foot Many (13)
 * @const {number}
 */
EdgeView.ES_CROWFOOT_MANY = 13

/**
 * Line End Style: Crow Foot Zero-to-One (14)
 * @const {number}
 */
EdgeView.ES_CROWFOOT_ZERO_ONE = 14

/**
 * Line End Style: Crow Foot Zero-to-Many (15)
 * @const {number}
 */
EdgeView.ES_CROWFOOT_ZERO_MANY = 15

/**
 * Line End Style: Cross (X) (16)
 * @const {number}
 */
EdgeView.ES_CROSS = 16

/**
 * Line End Style: Dot (17)
 * @const {number}
 */
EdgeView.ES_DOT = 17

/**
 * Line End Style: Dot Stick Arrow (18)
 * @const {number}
 */
EdgeView.ES_DOT_STICK_ARROW = 18

/**
 * Line End Style: Dot Diamond (19)
 * @const {number}
 */
EdgeView.ES_DOT_DIAMOND = 19

/**
 * Line End Style: Dot Filled Diamond (20)
 * @const {number}
 */
EdgeView.ES_DOT_FILLED_DIAMOND = 20

/**
 * Line End Style: Dot Arrow Diamond (21)
 * @const {number}
 */
EdgeView.ES_DOT_ARROW_DIAMOND = 21

/**
 * Line End Style: Dot Arrow Filled Diamond (22)
 * @const {number}
 */
EdgeView.ES_DOT_ARROW_FILLED_DIAMOND = 22

/**
 * Line End Style: Dot Cross (23)
 * @const {number}
 */
EdgeView.ES_DOT_CROSS = 23

/**
 * FreelineEdgeView
 */
class FreelineEdgeView extends EdgeView {
  initialize (canvas, x1, y1, x2, y2) {
    this.points.clear()
    this.points.add(new Point(x1, y1))
    this.points.add(new Point(x2, y2))
    if (this.lineStyle === EdgeView.LS_RECTILINEAR || this.lineStyle === EdgeView.LS_ROUNDRECT) {
      this.points.convObliqueToRectilinear()
    }
    this.tail = null
    this.head = null
  }
}

/**
 * LabelView
 */
class LabelView extends NodeView {

  constructor () {
    super()

    this.parentStyle = true
    this.selectable = View.SK_NO

    /** @member {string} */
    this.underline = false

    /** @member {string} */
    this.text = ''

    /** @member {number} */
    this.horizontalAlignment = Canvas.AL_CENTER

    /** @member {number} */
    this.verticalAlignment = Canvas.AL_MIDDLE

    /** @member {number} */
    this.direction = LabelView.DK_HORZ

    /** @member {boolean} */
    this.wordWrap = false
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.assignStyleToCanvas(canvas)
    var size, minW, minH, w, h
    if (this.wordWrap && this.direction === LabelView.DK_HORZ) {
      size = canvas.textExtent(this.text, 1)
      minW = size.x
      minH = canvas.textExtent(this.text, this.width - 1).y
      size = canvas.textExtent(this.text, this.width - 1)
      w = size.x
      h = size.y
    } else {
      minW = canvas.textExtent(this.text).x
      minH = canvas.textExtent('^_').y
      w = minW
      h = minH
    }
    if (this.direction === LabelView.DK_HORZ) {
      this.minWidth = minW
      this.minHeight = minH
      this.height = h
    } else {
      this.minWidth = minH
      this.minHeight = minW
      this.width = w
    }
    this.sizeConstraints()
  }

  arrange (canvas) {
    super.arrange(canvas)
  }

  draw (canvas) {
    this.assignStyleToCanvas(canvas)
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    if (this.direction === LabelView.DK_HORZ) {
      canvas.textOut2(r, this.text, this.horizontalAlignment, this.verticalAlignment, false, this.wordWrap, this.underline)
    } else {
      canvas.textOut2(r, this.text, this.horizontalAlignment, this.verticalAlignment, true, this.wordWrap, this.underline)
    }
    super.draw(canvas)
  }

  /**
   * LabelView cannot be copied alone.
   * @private
   * @override
   * @return {Boolean}
   */
  canCopy () {
    return false
  }

  /**
   * LabelView cannot be deleted alone.
   * @private
   * @override
   * @return {Boolean}
   */
  canDelete () {
    return false
  }
}

/**
 * Direction Kind: Horizontal (0)
 * @const {number}
 */
LabelView.DK_HORZ = 0

/**
 * Direction Kind: Vertical (1)
 * @const {number}
 */
LabelView.DK_VERT = 1

/**
 * ParasiticView
 */
class ParasiticView extends NodeView {

  constructor () {
    super()

    /** @member {number} */
    this.alpha = 0

    /** @member {number} */
    this.distance = 0
  }

  /**
   * ParasiticView cannot be copied alone.
   * @private
   * @override
   * @return {Boolean}
   */
  canCopy () {
    return false
  }

  /**
   * ParasiticView cannot be deleted alone.
   * @private
   * @override
   * @return {Boolean}
   */
  canDelete () {
    return false
  }
}

/**
 * NodeParasiticView
 */
class NodeParasiticView extends ParasiticView {

  constructor () {
    super()

    /** @member {NodeView} */
    this.hostNode = null
  }

  arrange (canvas) {
    super.arrange(canvas)
    var node = null
    if (this.hostNode !== null) {
      node = this.hostNode
    } else if (this._parent instanceof NodeView) {
      node = this._parent
    } else {
      return
    }
    var p1 = new Point()
    p1.x = (node.left + node.getRight()) / 2
    p1.y = (node.top + node.getBottom()) / 2
    var p = Coord.getPointAwayLine(p1, p1, this.alpha, this.distance)
    this.left = p.x + p1.x - this.width / 2
    this.top = p.y + p1.y - this.height / 2
  }
}

/**
 * EdgeParasiticView
 */
class EdgeParasiticView extends ParasiticView {

  constructor () {
    super()

    /** @member {EdgeView} */
    this.hostEdge = null

    /** @member {number} */
    this.edgePosition = EdgeParasiticView.EP_HEAD
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    let edge, midPointIndex, p, p1, p2
    edge = null
    if (this.hostEdge !== null) {
      edge = this.hostEdge
    } else if (this._parent instanceof EdgeView) {
      edge = this._parent
    } else {
      return
    }
    switch (this.edgePosition) {
    case EdgeParasiticView.EP_HEAD:
      p1 = edge.points.getPoint(edge.points.count() - 1).copy()
      p2 = edge.points.getPoint(edge.points.count() - 2).copy()
      break
    case EdgeParasiticView.EP_TAIL:
      p1 = edge.points.getPoint(0).copy()
      p2 = edge.points.getPoint(1).copy()
      break
    case EdgeParasiticView.EP_MIDDLE:
      midPointIndex = Math.floor(edge.points.count() / 2)
      if ((edge.points.count() % 2) === 0) {
        midPointIndex--
      }
      p1 = edge.points.getPoint(midPointIndex).copy()
      p2 = edge.points.getPoint(midPointIndex + 1).copy()
      if ((edge.points.count() % 2) === 0) {
        p1.x = Math.floor((p1.x + p2.x) / 2)
        p1.y = Math.floor((p1.y + p2.y) / 2)
      }
    }
    p = Coord.getPointAwayLine(p1, p2, this.alpha, this.distance)
    this.left = p.x + p1.x - Math.floor(this.width / 2)
    this.top = p.y + p1.y - Math.floor(this.height / 2)
  }
}

/**
 * Edge Position: Head (0)
 * @const {number}
 */
EdgeParasiticView.EP_HEAD = 0

/**
 * Edge Position: Middle (1)
 * @const {number}
 */
EdgeParasiticView.EP_MIDDLE = 1

/**
 * Edge Position: Tail (2)
 * @const {number}
 */
EdgeParasiticView.EP_TAIL = 2

/**
 * NodeLabelView
 */
class NodeLabelView extends NodeParasiticView {

  constructor () {
    super()

    /** @member {string} */
    this.underline = false

    /** @member {boolean} */
    this.wordWrap = false

    this.enabled = true
    this.movable = NodeView.MM_FREE
    this.sizable = NodeView.SZ_HORZ
    this.text = ''
    this.horizontalAlignment = Canvas.AL_CENTER
    this.verticalAlignment = Canvas.AL_MIDDLE
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.assignStyleToCanvas(canvas)
    let size, minW, minH, w, h
    if (this.wordWrap) {
      size = canvas.textExtent(this.text, 1)
      minW = size.x
      minH = canvas.textExtent(this.text, this.width - 1).y
      size = canvas.textExtent(this.text, this.width - 1)
      w = size.x
      h = size.y
    } else {
      minW = canvas.textExtent(this.text).x
      minH = canvas.textExtent('^_').y
      w = minW
      h = minH
    }
    this.minWidth = minW
    this.minHeight = minH
    this.height = h
    this.sizeConstraints()
  }

  arrange (canvas) {
    super.arrange(canvas)
  }

  draw (canvas) {
    this.assignStyleToCanvas(canvas)
    let r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.textOut2(r, this.text, this.horizontalAlignment, this.verticalAlignment, false, this.wordWrap, this.underline)
  }
}

/**
* EdgeLabelView
*/
class EdgeLabelView extends EdgeParasiticView {

  constructor () {
    super()

    /** @member {string} */
    this.underline = false

    /** @member {boolean} */
    this.wordWrap = false

    this.enabled = true
    this.movable = NodeView.MM_FREE
    this.sizable = NodeView.SZ_HORZ
    this.text = ''
    this.horizontalAlignment = Canvas.AL_CENTER
    this.verticalAlignment = Canvas.AL_MIDDLE
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.assignStyleToCanvas(canvas)
    let size, minW, minH, w, h
    if (this.wordWrap) {
      size = canvas.textExtent(this.text, 1)
      minW = size.x
      minH = canvas.textExtent(this.text, this.width - 1).y
      size = canvas.textExtent(this.text, this.width - 1)
      w = size.x
      h = size.y
    } else {
      minW = canvas.textExtent(this.text).x
      minH = canvas.textExtent('^_').y
      w = minW
      h = minH
    }
    this.minWidth = minW
    this.minHeight = minH
    this.height = h
    this.sizeConstraints()
  }

  draw (canvas) {
    this.assignStyleToCanvas(canvas)
    let r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.textOut2(r, this.text, this.horizontalAlignment, this.verticalAlignment, false, this.wordWrap, this.underline)
    super.draw(canvas)
  }
}

/**
 * NodeNodeView
 */
class NodeNodeView extends NodeParasiticView {}

/**
 * EdgeNodeView
 */
class EdgeNodeView extends EdgeParasiticView {}

/**
 * Diagram
 */
class Diagram extends ExtensibleModel {

  constructor () {
    super()

    /** @member {boolean} */
    this.visible = true

    /** @member {boolean} */
    this.defaultDiagram = false

    /** @member {Array.<View>} */
    this.ownedViews = []

    /** @member {Array.<View>} */
    this.selectedViews = []
  }

  traverse (fun) {
    fun(this)
    for (var i = 0, len = this.ownedViews.length; i < len; i++) {
      var v = this.ownedViews[i]
      v.traverse(fun)
    }
  }

  traverseDepthFirst (fun) {
    for (var i = 0, len = this.ownedViews.length; i < len; i++) {
      var v = this.ownedViews[i]
      v.traverseDepthFirst(fun)
    }
    fun(this)
  }

  find (predicate) {
    if (predicate(this)) {
      return this
    }
    var ref = this.ownedViews
    for (var i = 0, len = ref.length; i < len; i++) {
      var v = ref[i]
      var result = v.find(predicate)
      if (result) {
        return result
      }
    }
    return null
  }

  findDepthFirst (predicate) {
    var ref = this.ownedViews
    for (var i = 0, len = ref.length; i < len; i++) {
      var v = ref[i]
      var result = v.findDepthFirst(predicate)
      if (result) {
        return result
      }
    }
    if (predicate(this)) {
      return this
    }
    return null
  }

  selectViewByRect (canvas, v, r) {
    // EdgeLabelView들은 영역에 의해 선택가능하다. (parentStyle = false 이기 때문에)
    // 하지만, LabelView, CompartmentView 들은 parentStyle = true이기 때문에 선택이 불가능하다.
    if (v.visible === true && v.enabled === true && v.parentStyle === false && (v.selectable === View.SK_YES)) {
      if (v.overlapRect(canvas, r)) {
        v.selected = true
        if (!_.includes(this.selectedViews, v)) {
          this.selectedViews.push(v)
        }
      }
    }
    for (var i = 0, len = v.subViews.length; i < len; i++) {
      var sub = v.subViews[i]
      this.selectViewByRect(canvas, sub, r)
    }
  }

  selectView (v) {
    if (v.visible && v.enabled && (v.selectable === View.SK_YES)) {
      v.selected = true
      if (!_.includes(this.selectedViews, v)) {
        this.selectedViews.push(v)
      }
    }
  }

  deselectView (v) {
    if (v.visible && v.enabled && (v.selectable === View.SK_YES)) {
      v.selected = false
      if (_.includes(this.selectedViews, v)) {
        this.selectedViews.splice(this.selectedViews.indexOf(v), 1)
      }
    }
  }

  arrangeDiagram (canvas) {
    var i, len
    // Sort views by zIndex
    var sortedViews = _.sortBy(this.ownedViews, function (v) { return v.zIndex })
    // Draw views
    for (i = 0, len = sortedViews.length; i < len; i++) {
      var view = sortedViews[i]
      try {
        view.setup(canvas)
        view.update(canvas)
        view.size(canvas)
        view.arrange(canvas)
      } catch (err) {
        console.log(view)
        console.error(err)
      }
    }
  }

  /**
   * Draw Diagram
   * 1. setup all views (breadth-first)
   * 2. update all views (breadth-first)
   * 3. compute size of views (depth-first)
   * 4. arrange views (breadth-first)
   * 5. draw views (breadth-first)
   * @private
   * @param {Canvas} canvas
   * @param {?boolean} drawSelection
   */
  drawDiagram (canvas, drawSelection) {
    var i, len
    // Sort views by zIndex
    var sortedViews = _.sortBy(this.ownedViews, function (v) { return v.zIndex })
    // Draw views
    for (i = 0, len = sortedViews.length; i < len; i++) {
      var view = sortedViews[i]
      try {
        view.setup(canvas)
        view.update(canvas)
        view.size(canvas)
        view.arrange(canvas)
        if (view.showShadow) {
          view.drawShadow(canvas)
        }
        view.draw(canvas)
      } catch (err) {
        console.log(view)
        console.error(err)
      }
    }
    // Draw selection
    if (drawSelection !== false) {
      for (i = 0, len = this.selectedViews.length; i < len; i++) {
        var v = this.selectedViews[i]
        try {
          v.drawSelection(canvas)
        } catch (err) {
          console.error(err)
        }
      }
    }
  }

  addOwnedView (view) {
    this.ownedViews.push(view)
    view._parent = this
  }

  removeOwnedView (view) {
    if (this.ownedViews.indexOf(view) > -1) {
      this.ownedViews.splice(this.ownedViews.indexOf(view), 1)
    }
    view._parent = null
  }

  getOwnedViewById (id) {
    for (var i = 0, len = this.ownedViews.length; i < len; i++) {
      var v = this.ownedViews[i]
      if (id === v._id) {
        return v
      }
    }
    return null
  }

  /**
   * Find a view at specific position (x, y)
   * @private
   *
   * @param {Canvas} canvas
   * @param {number} x
   * @param {number} y
   * @param {boolean} shallow Find only in first level (don't find in subviews)
   * @param {?constructor} viewType
   * @return {View}
   */
  getViewAt (canvas, x, y, shallow, viewType) {
    // Sort views by zIndex
    var sortedViews = _.sortBy(this.ownedViews, function (v) { return v.selectZIndex })
    for (var i = sortedViews.length - 1; i >= 0; i--) {
      var v = sortedViews[i]
      if (shallow === true) {
        if (v.visible && (v.selectable === View.SK_YES) && v.containsPoint(canvas, x, y)) {
          if (viewType) {
            if (v instanceof viewType) {
              return v
            }
          } else {
            return v
          }
        }
      } else {
        if (v.visible && (v.selectable !== View.SK_NO)) {
          var view = v.getViewAt(canvas, x, y)
          if (view !== null) {
            return view
          }
        }
      }
    }
    if (this.containsPoint(canvas, x, y) && (this.selectable === View.SK_YES)) {
      return this
    }
    return null
  }

  /**
   * Find View at specific position (x, y) in depth-first manner
   * @private
   *
   * @param {Canvas} canvas
   * @param {number} x
   * @param {number} y
   * @return {View}
   */
  getBottomViewAt (canvas, x, y) {
    return this.findDepthFirst(function (v) {
      return (v instanceof View && v.visible && (v.selectable !== View.SK_NO) && v.containsPoint(canvas, x, y))
    })
  }

  /**
   * Get a view of a specific model
   *
   * @param {Model} model
   * @param {?constructor} viewType
   * @return {View}
   */
  getViewOf (model, viewType) {
    return this.find(function (v) {
      if (viewType) {
        return (v.model === model) && (v instanceof viewType)
      } else {
        return (v.model === model)
      }
    })
  }

  getSelectedBoundingBox (canvas) {
    var r = new Rect(10000, 10000, -10000, -10000)
    for (var i = 0, len = this.selectedViews.length; i < len; i++) {
      var v = this.selectedViews[i]
      r = Coord.unionRect(r, v.getBoundingBox(canvas))
    }
    return r
  }

  getBoundingBox (canvas) {
    if (this.ownedViews.length > 0) {
      var r = this.ownedViews[0].getBoundingBox(canvas)
      for (var i = 1, len = this.ownedViews.length; i < len; i++) {
        var v = this.ownedViews[i]
        r.union(v.getBoundingBox(canvas))
      }
      return r
    }
    return new Rect(0, 0, 0, 0)
  }

  containsPoint (canvas, x, y) {
    var r = this.getBoundingBox(canvas)
    return Coord.ptInRect(x, y, r)
  }

  selectArea (canvas, x1, y1, x2, y2) {
    var r = new Rect(x1, y1, x2, y2)
    Coord.normalizeRect(r)
    for (var i = 0, len = this.ownedViews.length; i < len; i++) {
      var v = this.ownedViews[i]
      if (v.visible && v.enabled && (v.selectable === View.SK_YES) && v.overlapRect(canvas, r)) {
        if (!_.includes(this.selectedViews, v)) {
          v.selected = true
          this.selectedViews.push(v)
        }
      }
      this.selectViewByRect(canvas, v, r)
    }
  }

  selectAll () {
    var self = this
    for (var i = 0, len = this.ownedViews.length; i < len; i++) {
      var v = this.ownedViews[i]
      this.selectView(v)
      v.traverse(function (sub) {
        if (sub.visible === true && sub.enabled === true && sub.parentStyle === false && sub.selectable === View.SK_YES) {
          self.selectView(sub)
        }
      })
    }
  }

  deselectAll () {
    for (var i = 0, len = this.selectedViews.length; i < len; i++) {
      var v = this.selectedViews[i]
      v.selected = false
    }
    this.selectedViews = []
  }

  canContainKind (kind) {
    return app.metamodels.isKindOf(kind, 'Tag')
  }

  canPaste (kind, copyContext) {
    return false
  }

  /**
   * Return true only if all selected views could be copied.
   * @private
   *
   * @return {Boolean}
   */
  canCopyViews () {
    for (var i = 0, len = this.selectedViews.length; i < len; i++) {
      if (!this.selectedViews[i].canCopy()) {
        return false
      }
    }
    return true
  }

  /**
   * Return true only if all selected views could be deleted.
   * @private
   *
   * @return {Boolean}
   */
  canDeleteViews () {
    for (var i = 0, len = this.selectedViews.length; i < len; i++) {
      if (!this.selectedViews[i].canDelete()) {
        return false
      }
    }
    return true
  }

  /**
   * Return true only if all selected views could be hidden.
   * @private
   *
   * @return {Boolean}
   */
  canHideViews () {
    for (var i = 0, len = this.selectedViews.length; i < len; i++) {
      if (!this.selectedViews[i].canHide()) {
        return false
      }
    }
    return true
  }

  /**
   * Determine whether views in clipboard can be pasted in this diagram.
   * @private
   *
   * @param {Array.<View>} views
   * @return {Boolean}
   */
  canPasteViews (views) {
    var viewTypes = app.metamodels.getAvailableViewTypes(this.getClassName())
    return _.every(views, v => {
      return _.some(viewTypes, vt => {
        return v instanceof type[vt]
      })
    })
  }

  /**
   * Determine whether to accept to create a view of a given model drag-and-dropped from Explorer.
   * @private
   *
   * @param {Model} model
   * @return {Boolean}
   */
  canAcceptModel (model) {
    return false
  }

  /**
   * Layout diagram automatically
   * @private
   *
   * @param {string} direction Rank direction. One of the value of `Diagram.LD_*`
   * @param {{node:number, edge:number, rank:number}} separations
   * @param {number} edgeLineStyle
   */
  layout (direction, separations, edgeLineStyle) {
    var i, len, v
    var g = new dagre.graphlib.Graph({ directed: true, multigraph: true, compound: true })

    // Make Graph
    for (i = 0, len = this.ownedViews.length; i < len; i++) {
      v = this.ownedViews[i]
      if (v instanceof global.type.NodeView) {
        g.setNode(v._id, { id: v._id, width: v.width, height: v.height })
      }
    }
    for (i = 0, len = this.ownedViews.length; i < len; i++) {
      v = this.ownedViews[i]
      if (v instanceof global.type.EdgeView && v.head instanceof type.NodeView && v.tail instanceof type.NodeView) {
        g.setEdge(v.head._id, v.tail._id, { id: v._id })
      }
    }

    // Layout Options
    var nodeSeparation = NODE_SEPARATION
    var edgeSeparation = EDGE_SEPARATION
    var rankSeparation = RANK_SEPARATION
    var rankDir = Diagram.LD_TB
    var lineStyle = EdgeView.LS_CURVE
    if (direction) {
      rankDir = direction
    }
    if (separations) {
      if (typeof separations.node !== undefined) { nodeSeparation = separations.node }
      if (typeof separations.edge !== undefined) { edgeSeparation = separations.edge }
      if (typeof separations.rank !== undefined) { rankSeparation = separations.rank }
    }
    if (_.isNumber(edgeLineStyle)) {
      lineStyle = edgeLineStyle
    }

    // Do Layout
    g.setGraph({
      nodesep: nodeSeparation,
      edgesep: edgeSeparation,
      ranksep: rankSeparation,
      rankdir: rankDir
    })
    dagre.layout(g)

    // Apply Layout Results
    g.nodes().forEach(v => {
      var node = g.node(v)
      var nodeView = this.getOwnedViewById(v)
      nodeView.left = node.x - (node.width / 2) + LAYOUT_MARGIN_LEFT
      nodeView.top = node.y - (node.height / 2) + LAYOUT_MARGIN_TOP
    })
    g.edges().forEach(e => {
      var edge = g.edge(e)
      var edgeView = this.getOwnedViewById(edge.id)
      var headView = this.getOwnedViewById(e.w)
      var tailView = this.getOwnedViewById(e.v)
      edgeView.lineStyle = lineStyle
      edgeView.points.clear()
      edgeView.points.add(tailView.getCenter())
      for (var j = edge.points.length - 1; j >= 0; j--) {
        var p = edge.points[j]
        edgeView.points.add(new Point(p.x + LAYOUT_MARGIN_LEFT, p.y + LAYOUT_MARGIN_TOP))
      }
    })
  }
}

/**
 * Diagram Layout Direction: Top to Bottom (`'TB'`)
 * @const {string}
 */
Diagram.LD_TB = 'TB'

/**
 * Diagram Layout Direction: Bottom to Top (`'BT'`)
 * @const {string}
 */
Diagram.LD_BT = 'BT'

/**
 * Diagram Layout Direction: Left to Right (`'LR'`)
 * @const {string}
 */
Diagram.LD_LR = 'LR'

/**
 * Diagram Layout Direction: Right to Left (`'RL'`)
 * @const {string}
 */
Diagram.LD_RL = 'RL'

/**
 * Project
 */
class Project extends ExtensibleModel {

  constructor () {
    super()
    this.name = 'Untitled'
    this.author = ''
    this.company = ''
    this.copyright = ''
    this.version = ''
  }

  canCopy () {
    return false
  }

  canDelete () {
    return false
  }
}

// Type definitions
global.type.IdGenerator = IdGenerator
global.type.Element = Element
global.type.Model = Model
global.type.Tag = Tag
global.type.Hyperlink = Hyperlink
global.type.ExtensibleModel = ExtensibleModel
global.type.Relationship = Relationship
global.type.DirectedRelationship = DirectedRelationship
global.type.RelationshipEnd = RelationshipEnd
global.type.UndirectedRelationship = UndirectedRelationship
global.type.View = View
global.type.NodeView = NodeView
global.type.EdgeView = EdgeView
global.type.FreelineEdgeView = FreelineEdgeView
global.type.LabelView = LabelView
global.type.ParasiticView = ParasiticView
global.type.NodeParasiticView = NodeParasiticView
global.type.EdgeParasiticView = EdgeParasiticView
global.type.NodeLabelView = NodeLabelView
global.type.EdgeLabelView = EdgeLabelView
global.type.NodeNodeView = NodeNodeView
global.type.EdgeNodeView = EdgeNodeView
global.type.Diagram = Diagram
global.type.Project = Project

// Public Classes
exports.IdGenerator = IdGenerator
exports.Element = Element
exports.Model = Model
exports.Tag = Tag
exports.Hyperlink = Hyperlink
exports.ExtensibleModel = ExtensibleModel
exports.Relationship = Relationship
exports.DirectedRelationship = DirectedRelationship
exports.RelationshipEnd = RelationshipEnd
exports.UndirectedRelationship = UndirectedRelationship
exports.View = View
exports.NodeView = NodeView
exports.EdgeView = EdgeView
exports.FreelineEdgeView = FreelineEdgeView
exports.LabelView = LabelView
exports.ParasiticView = ParasiticView
exports.NodeParasiticView = NodeParasiticView
exports.EdgeParasiticView = EdgeParasiticView
exports.NodeLabelView = NodeLabelView
exports.EdgeLabelView = EdgeLabelView
exports.NodeNodeView = NodeNodeView
exports.EdgeNodeView = EdgeNodeView
exports.Diagram = Diagram
exports.Project = Project
