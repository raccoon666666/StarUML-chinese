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

// Error Messages
var ERR_METATYPE_OBJECT = '"<%=name%>" should be an object'
var ERR_FIELD_TYPE = '"<%=metaType.name%>.<%=field%>" should be "<%=type%>" type'
var ERR_REQUIRE_FIELD = '"<%=metaType.name%>" requires field "<%=field%>"'
var ERR_METATYPE_KIND = '"<%=metaType.name%>.kind" should be "enum" or "class"'
var ERR_DUPLICATED_LITERAL = '"<%=metaType.name%>" has duplicated literal "<%=literal%>"'
var ERR_ENUM_HAS_LITERALS = '"<%=metaType.name%>" should have at least one or more literals'
var ERR_TYPE_NOT_FOUND = '"<%=type%>" is not found specified in "<%=metaType.name%>.<%=field%>"'
var ERR_UNNAMED_ATTRIBUTE = '"<%=metaType.name%>" has unnamed attribute'
var ERR_DUPLICATED_ATTRIBUTE = '"<%=metaType.name%>" has duplicated attribute "<%=attribute.name%>"'
var ERR_ATTRIBUTE_KIND = '"<%=metaType.name%>.<%=attribute.name%>.kind" should be "prim", "enum", "var", "ref", "refs", "obj", "objs", or "custom"'
var ERR_ATTRIBUTE_PRIM_TYPE = '"<%=metaType.name%>.<%=attribute.name%>.type" should be "Integer", "String", "Boolean", or "Real"'

/**
 * Metamodel Manager
 * @private
 */
class MetamodelManager {

  /**
   * @private
   * Assertion
   * @param {boolean} condition
   * @param {string} message
   */
  assert (condition, message, strings) {
    if (!condition) {
      var err = _.template(message)
      throw new Error('[MetaModelManager] ' + err(strings))
    }
  }

  /**
   * @private
   * Validate MetaType Definition
   * @param {Object} metaType
   */
  validateMetaType (name, metaType) {
    this.assert(_.isObject(metaType), ERR_METATYPE_OBJECT, { name: name })
    this.assert(metaType.name, ERR_REQUIRE_FIELD, { metaType: metaType, field: 'name' })
    this.assert(metaType.kind === 'enum' || metaType.kind === 'class', ERR_METATYPE_KIND, { metaType: metaType })

    // Enum MetaType
    if (metaType.kind === 'enum') {
      var lits = metaType.literals
      this.assert(Array.isArray(lits) && lits.length > 0, ERR_ENUM_HAS_LITERALS, { metaType: metaType })

      // Check duplicated literal
      _.each(lits, lit1 => {
        var len = _.filter(lits, lit2 => { return lit2 === lit1 }).length
        this.assert(len === 1, ERR_DUPLICATED_LITERAL, { metaType: metaType, literal: lit1 })
      })
    }

    // Class MetaType
    if (metaType.kind === 'class') {
      // Check .super
      if (metaType.super) {
        this.assert(metaType.super && global.meta[metaType.super], ERR_TYPE_NOT_FOUND, { metaType: metaType, type: metaType.super, field: 'super' })
      }

      // Check Attributes
      if (metaType.attributes) {
        this.assert(Array.isArray(metaType.attributes), ERR_FIELD_TYPE, { metaType: metaType, field: 'attributes', type: 'Array' })
        metaType.attributes.forEach(attribute => {
          // check 'name'
          this.assert(attribute.name, ERR_UNNAMED_ATTRIBUTE, { metaType: metaType })

          // Check 'kind'
          this.assert(_.includes(['prim', 'enum', 'var', 'ref', 'refs', 'obj', 'objs', 'custom'], attribute.kind), ERR_ATTRIBUTE_KIND, { metaType: metaType, attribute: attribute })

          // Check 'type'
          if (attribute.kind === 'prim') {
            this.assert(_.includes(['Integer', 'String', 'Boolean', 'Real', 'Image'], attribute.type), ERR_ATTRIBUTE_PRIM_TYPE, { metaType: metaType, attribute: attribute })
          } else if (attribute.kind !== 'custom') {
            this.assert(global.meta[attribute.type], ERR_TYPE_NOT_FOUND, { metaType: metaType, type: attribute.type, field: attribute.name + '.type' })
          }

          // Check duplicated attribute in all inherited attributes
          var len = _.filter(this.getMetaAttributes(metaType.name), attr => { return attr.name === attribute.name }).length
          this.assert(len === 1, ERR_DUPLICATED_ATTRIBUTE, { metaType: metaType, attribute: attribute })
        })
      }
    }
  }

  /**
   * Register Metamodel by Object
   * @param {Object} metamodel
   */
  register (metamodel) {
    var name, metaType

    // Registering MetaTypes to global.meta
    for (name in metamodel) {
      if (metamodel.hasOwnProperty(name)) {
        metaType = metamodel[name]
        metaType.name = name

        // Check duplicated MetaType
        if (global.meta[name]) {
          delete metamodel[name]
          console.error("[MetaModelManager] MetaType '" + name + "' is already exists.")
        } else {
          global.meta[name] = metaType
        }
      }
    }

    // Validate MetaTypes
    for (name in metamodel) {
      if (metamodel.hasOwnProperty(name)) {
        metaType = metamodel[name]
        try {
          this.validateMetaType(name, metaType)
        } catch (err) {
          console.error(err)
        }
      }
    }
  }

  /**
   * Return all meta-attributes
   * @param {string} typeName
   * @return {Array.<{name:string, kind:string, type:string}>}
   */
  getMetaAttributes (typeName) {
    var metaClass = global.meta[typeName]
    var attrs = []
    if (metaClass.super) {
      attrs = this.getMetaAttributes(metaClass.super)
    }
    if (metaClass.attributes) {
      var i, len, item
      for (i = 0, len = metaClass.attributes.length; i < len; i++) {
        item = metaClass.attributes[i]
        attrs.push(item)
      }
    }
    return attrs
  }

  /**
   * Type test: is-kind-of
   * @param {string} child
   * @param {string} parent
   * @return {boolean}
   */
  isKindOf (child, parent) {
    if (!global.meta[child]) {
      return false
    } else if (global.meta[child] === global.meta[parent]) {
      return true
    } else {
      return this.isKindOf(global.meta[child].super, parent)
    }
  }

  /**
   * Return a corresponding view type of a given model type.
   * @param {string} typeName
   * @return {string}
   */
  getViewTypeOf (typeName) {
    var metaClass = global.meta[typeName]
    if (metaClass) {
      return metaClass.view || null
    }
    return null
  }

  /**
   * Return all available view types of a diagram type.
   * @param {string} diagramTypeName
   * @return {Array.<string}>}
   */
  getAvailableViewTypes (diagramTypeName) {
    var metaClass = global.meta[diagramTypeName]
    var views = []
    if (metaClass.super) {
      views = this.getAvailableViewTypes(metaClass.super)
    }
    if (metaClass.views) {
      var i, len, item
      for (i = 0, len = metaClass.views.length; i < len; i++) {
        item = metaClass.views[i]
        views.push(item)
      }
    }
    return views
  }
}

module.exports = MetamodelManager
