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
const {EventEmitter} = require('events')

/**
 * PreferenceManager only works in browser (it uses global localStorage object).
 */
class PreferenceManager extends EventEmitter {

  constructor () {
    super()

    /**
     * Preference Schema Map
     * @private
     * @type {Object.<string,{name:string, schema:Object}>}
     */
    this.schemaMap = {}

    /**
     * Preference Item Map
     * @private
     * @type {Object.<string,Object>}
     */
    this.itemMap = {}
  }

  getSchema (id) {
    return this.schemaMap[id].schema
  }

  getSchemaName (id) {
    return this.schemaMap[id].name
  }

  getSchemaIds () {
    return _.keys(this.schemaMap)
  }

  getItem (key) {
    return this.itemMap[key]
  }

  /**
   * Validate preference schema
   * @private
   * @param {Object} schema
   * @return {boolean}
   */
  validate (schema) {
    var key, item
    for (key in schema) {
      if (schema.hasOwnProperty(key)) {
        item = schema[key]
        if (!item.text) {
          console.error("[PreferenceManager] missing required field: 'text' of '" + key + "'")
        }
        if (!item.type) {
          console.error("[PreferenceManager] missing required field: 'type' of '" + key + "'")
        }
        if (item.type !== 'section' && typeof item['default'] === 'undefined') {
          console.error("[PreferenceManager] missing required field: 'default' of '" + key + "'")
        }
        if (item.type === 'combo' || item.type === 'dropdown') {
          if (item.options && item.options.length > 0) {
            var i, len
            for (i = 0, len = item.options.length; i < len; i++) {
              if (typeof item.options[i].value === 'undefined') {
                console.error("[PreferenceManager] missing required field of option item: 'value' of '" + key + "'")
              }
              if (typeof item.options[i].text === 'undefined') {
                console.error("[PreferenceManager] missing required field of option item: 'text' of '" + key + "'")
              }
            }
          } else {
            console.error("[PreferenceManager] missing required field or no items: 'options' of '" + key + "'")
          }
        }
      }
    }
    return true
  }

  /**
   * Register preference definition
   * @private
   * @param {Object} prefs
   */
  register (preferenceDef) {
    let {id, name, schema} = preferenceDef
    if (!id || !name || !schema) {
      console.error("register(): missing required fields: 'id', 'name', or 'schema'")
      return
    }

    if (this.validate(schema)) {
      this.schemaMap[id] = preferenceDef

      // Build Preference Item Map
      _.each(schema, (item, key) => {
        if (item) {
          this.itemMap[key] = item
        }
      })
    }
  }

  /**
   * Return value of key
   *
   * @param {string} key
   * @param {Object} defaultValue
   * @return {Object}
   */
  get (key, defaultValue) {
    defaultValue = typeof defaultValue === 'undefined' ? null : defaultValue
    if (typeof localStorage !== 'undefined') {
      var _value = localStorage.getItem(key)
      var value = null
      if (_value) {
        try {
          value = JSON.parse(_value)
        } catch (e) {
          console.error('[PreferenceManager] Failed to read preference value of key: ' + key)
        }
      } else {
        // if not stored in localStorage, return default value from schema
        if (this.itemMap[key] && typeof this.itemMap[key]['default'] !== 'undefined') {
          value = this.itemMap[key]['default']
        } else {
          value = defaultValue
        }
      }
      return value
    } else {
      return defaultValue
    }
  }

  /**
   * Change value of key
   * @param {string} key
   * @param {Object} value
   */
  set (key, value) {
    if (localStorage) {
      var _value
      try {
        _value = JSON.stringify(value)
        localStorage.setItem(key, _value)
        this.emit('change', key, value)
      } catch (e) {
        console.error('[PreferenceManager] Failed to write preference value of key: ' + key)
      }
    }
  }

  /**
   * Convenience function that gets a view state
   * @private
   * @param {string} id preference to get
   * @param {?Object} context Optional additional information about the request
   */
  getViewState (id, context) {
    var state = this.get('_viewState.' + id)
    if (!state) {
      state = {}
    }
    return state
  }

  /**
   * Convenience function that sets a view state and then saves the file
   * @private
   * @param {string} id preference to set
   * @param {*} value new value for the preference
   * @param {?Object} context Optional additional information about the request
   * @param {boolean=} doNotSave If it is undefined or false, then save the
   *      view state immediately.
   */
  setViewState (id, value, context, doNotSave) {
    this.set('_viewState.' + id, value)
  }

}

module.exports = PreferenceManager
