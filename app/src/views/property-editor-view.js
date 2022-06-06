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
const {Element} = require('../core/core')
const {EventEmitter} = require('events')
const _ = require('lodash')
const {ipcRenderer} = require('electron')
const ImageUtils = require('../utils/image-utils')

const textItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-text.html'), 'utf8')
const multilineItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-multiline.html'), 'utf8')
const checkItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-check.html'), 'utf8')
const integerItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-integer.html'), 'utf8')
const imageItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-image.html'), 'utf8')
const enumItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-enum.html'), 'utf8')
const comboItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-combo.html'), 'utf8')
const refItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-ref.html'), 'utf8')
const reflistItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-reflist.html'), 'utf8')
const varItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-var.html'), 'utf8')
const separatorItemTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view-item-separator.html'), 'utf8')

/**
 * PropertyEditor View
 * @private
 */
class PropertyEditorView extends EventEmitter {

  constructor () {
    super()

    this.$view = null

    /**
     * JQuery Object for Property Grid
     * @private
     */
    this.$propertyGrid = null

    /**
     * Kendo Widgets must be destroyed before showing new properties
     * @private
     */
    this._destroyedBeforeShowing = []

    this.metamodelManager = null

    this.repository = null

    this.editorsHolder = null
  }

  _getStrings (prefix, name, elems, field) {
    var strings = {}
    var prefix_ = (prefix ? prefix.replace('.', '-') : '')
    strings.prefix = (prefix ? prefix_ + '.' : '')
    strings.name = name
    strings.val = Element.mergeProps(elems, field)
    return strings
  }

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

  _getMetaAttr (elem, field) {
    var attrs = elem.getMetaAttributes()
    var attr = _.find(attrs, e => {
      return (e.name === field)
    })
    return attr
  }

  /**
   * Define a text property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Element} elems
   * @param {string} field
   */
  defineTextProperty (prefix, name, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    var $item = $(Mustache.render(textItemTemplate, strings))
    var $edit = $item.find('input')

    this.$propertyGrid.append($item)

    if (strings.val !== null) {
      $edit.val(strings.val)
      $edit.prop('placeholder', '')
    } else {
      $edit.val('')
      $edit.prop('placeholder', '—')
    }

    let self = this
    $edit.change(function () {
      self.emit('propertyChanged', elems, field, $edit.val())
    })
  }

  /**
   * Define a multi-line property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Element} elems
   * @param {string} field
   */
  defineMultilineTextProperty (prefix, name, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    var $item = $(Mustache.render(multilineItemTemplate, strings))
    var $edit = $item.find('textarea')

    this.$propertyGrid.append($item)

    if (strings.val !== null) {
      $edit.val(strings.val)
      $edit.prop('placeholder', '')
    } else {
      $edit.val('')
      $edit.prop('placeholder', '—')
    }

    let self = this
    $edit.change(function () {
      self.emit('propertyChanged', elems, field, $edit.val())
    })
  }

  /**
   * Define a check property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Element} elems
   * @param {string} field
   */
  defineCheckProperty (prefix, name, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    var $item = $(Mustache.render(checkItemTemplate, strings))
    var $check = $item.find('input')

    this.$propertyGrid.append($item)

    if (strings.val !== null) {
      $check.attr('checked', strings.val)
    } else {
      $check.attr('checked', false)
    }

    let self = this
    $check.change(function () {
      self.emit('propertyChanged', elems, field, $check.is(':checked'))
    })
  }

  /**
   * Define an integer property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Array.<string>} items
   * @param {Element} elems
   * @param {string} field
   */
  defineIntegerProperty (prefix, name, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    var $item = $(Mustache.render(integerItemTemplate, strings))
    var $edit = $item.find('input')

    this.$propertyGrid.append($item)

    if (strings.val !== null) {
      $edit.val(strings.val)
      $edit.prop('placeholder', '')
    } else {
      $edit.val('')
      $edit.prop('placeholder', '—')
    }

    let self = this
    $edit.change(function () {
      var value = parseInt($edit.val())
      if (_.isNumber(value)) {
        self.emit('propertyChanged', elems, field, value)
      }
    })
  }

  /**
   * Define an image property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Array.<string>} items
   * @param {Element} elems
   * @param {string} field
   */
  defineImageProperty (prefix, name, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    var $item = $(Mustache.render(imageItemTemplate, strings))
    var $name = $item.find('.name')
    var $delete = $item.find('.image-delete')
    var $button = $item.find('.image-find')

    this.$propertyGrid.append($item)

    function _setImage (image) {
      if (image) {
        $name.html('(Image)')
        $delete.show()
      } else {
        $name.html('—')
        $delete.hide()
      }
    }

    _setImage(strings.val)

    let self = this
    $delete.click(function () {
      var buttonId = app.dialogs.showConfirmDialog('Do you want to delete this image?')
      if (buttonId === 'ok') {
        self.emit('propertyChanged', elems, field, null)
        elems.forEach(e => {
          delete e.__img
          delete e.__status
        })
        _setImage(null)
      }
    })
    $button.click(function () {
      const files = ipcRenderer.sendSync('show-open-dialog', {
        title: 'Select an image',
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
        ]
      })
      if (Array.isArray(files)) {
        const filePath = files[0]
        ImageUtils.imageToDataURL(filePath, (image) => {
          if (image.originalWidth > 500 || this.originalHeight > 500) {
            app.dialogs.showInfoDialog('Image is too large, so it will be resized smaller.')
          }
          let value = {
            width: image.width,
            height: image.height,
            data: image.data
          }
          self.emit('propertyChanged', elems, field, JSON.stringify(value))
          _setImage(value)
        })
      }
    })
  }

  /**
   * Define a enumeration property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {{literals: Array.<{string}>}} enumType
   * @param {Element} elems
   * @param {string} field
   */
  defineEnumProperty (prefix, name, enumType, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    strings.items = enumType.literals

    var $item = $(Mustache.render(enumItemTemplate, strings))
    var $select = $item.find('select')

    this.$propertyGrid.append($item)

    if (strings.val !== null) {
      $select.val(strings.val)
    } else {
      $select.val(null)
    }

    let self = this
    $select.change(function () {
      self.emit('propertyChanged', elems, field, $select.val())
    })
  }

  /**
   * Define a combo property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Array.<string>} options
   * @param {Element} elems
   * @param {string} field
   */
  defineComboProperty (prefix, name, options, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    strings.options = options

    var $item = $(Mustache.render(comboItemTemplate, strings))
    var $edit = $item.find('input')
    var $select = $item.find('select')

    this.$propertyGrid.append($item)

    if (strings.val !== null) {
      $edit.val(strings.val)
      $edit.prop('placeholder', '')
    } else {
      $edit.val('')
      $edit.prop('placeholder', '—')
    }

    let self = this
    $edit.change(function () {
      self.emit('propertyChanged', elems, field, $edit.val())
    })

    $select.val(strings.val)
    $select.change(function () {
      $edit.val($select.val())
      $edit.change()
    })
    // (for Windows) To prevent immediate collapse of dropdown in comboBox.
    $select.click(function (e) {
      $select.focus()
      e.stopPropagation()
      return false
    })
  }

  /**
   * Define a reference property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Element} elems
   * @param {string} field
   */
  defineRefProperty (prefix, name, elems, field, readOnly) {
    var strings = this._getStrings(prefix, name, elems, field)
    if (!(strings.val instanceof type.Model)) {
      strings.val = null
    }

    var $item = $(Mustache.render(refItemTemplate, strings))
    var $icon = $item.find('.icon')
    var $name = $item.find('.name')
    var $button = $item.find('button')

    this.$propertyGrid.append($item)

    function _setElement (elem) {
      if (elem instanceof type.Model) {
        $icon.show()
        $icon.removeClass()
        $icon.addClass('k-sprite ' + elem.getNodeIcon())
        $name.html(elem.name)
      } else {
        $icon.hide()
        $name.html('—')
      }
    }

    _setElement(strings.val)

    if (readOnly) {
      $button.hide()
    }

    var metaAttr = this._getMetaAttr(elems[0], field)
    var selectableType = null
    if (metaAttr) {
      selectableType = type[metaAttr.type]
    }

    let self = this
    $button.click(function () {
      var initialSelection = Element.mergeProps(elems, field)
      app.elementPickerDialog.showDialog('Select Element', initialSelection, selectableType).then(function ({buttonId, returnValue}) {
        if (buttonId === 'ok') {
          _setElement(returnValue)
          self.emit('propertyChanged', elems, field, returnValue)
        }
      })
    })
  }

  /**
   * Define a list property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Element} elems
   * @param {string} field
   */
  defineRefListProperty (prefix, name, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    if (elems.length === 1) {
      strings.elements = elems[0][field]
    }

    var $item = $(Mustache.render(reflistItemTemplate, strings))
    var $button = $item.find('button')

    this.$propertyGrid.append($item)

    $button.click(function () {
      app.elementListEditorDialog.showDialog(elems[0], field)
    })
  }

  /**
   * Define a variant type property
   *
   * @private
   * @param {string} prefix?
   * @param {string} name
   * @param {Element} elems
   * @param {string} field
   */
  defineVarProperty (prefix, name, attrType, elems, field) {
    var strings = this._getStrings(prefix, name, elems, field)
    if (strings.val instanceof type.Model) {
      strings.element = strings.val
      strings.val = strings.val.name
    }

    var $item = $(Mustache.render(varItemTemplate, strings))
    var $edit = $item.find('input')
    var $button = $item.find('button')

    this.$propertyGrid.append($item)

    var _autoCompleteSelected = null

    let self = this
    var autoComplete = $edit.kendoAutoComplete({
      dataTextField: 'text',
      minLength: 1,
      filter: 'contains',
      select: function (e) {
        var item = this.dataItem(e.item.index())
        var elem = self.repository.get(item._id)
        if (elem) {
          _autoCompleteSelected = elem
          self.emit('propertyChanged', elems, field, _autoCompleteSelected)
        }
      },
      change: function (e) {
        var value = this.value()
        if (!_autoCompleteSelected || _autoCompleteSelected.name !== value) {
          var ref = null
          var typeFilter = type[attrType]
          // Lookup element by name and type
          if (value && value.length > 0) {
            if (elems.length > 0 && elems[0]._parent !== null) {
              ref = self.repository.lookupAndFind(elems[0]._parent, value, typeFilter)
            }
          }
          self.emit('propertyChanged', elems, field, ref || value)
          _autoCompleteSelected = null
        }
      },
      template: "<div style='white-space: nowrap'>" +
      "<span class='k-sprite #:data.sprite#'></span>" +
      "<span style='margin-left: 5px'>#:data.text#</span>" +
      "#if (data._namespace.length > 0) {# <span style='margin-left: 5px; font-size: 11px; color: rgb(139,139,139);'> — #:data._namespace#</span> #}#<div>",
      dataSource: {
        transport: {
          read: function (options) {
            if (options.data.filter && options.data.filter.filters.length > 0) {
              var keyword = options.data.filter.filters[0].value
              var results = self.repository.search(keyword, type[attrType])
              options.success(_.map(results, item => { return self._makeNode(item) }))
            } else {
              options.success([])
            }
          }
        },
        serverFiltering: true
      }
    }).data('kendoAutoComplete')

    // autoComplete must be destroyed
    this._destroyedBeforeShowing.push(autoComplete)

    if (strings.val !== null) {
      $edit.val(strings.val)
      $edit.prop('placeholder', '')
    } else {
      $edit.val('')
      $edit.prop('placeholder', '—')
    }

    // Make a space to show icon on left side.
    if (strings.element) {
      var $autocomplete = $item.find('span.k-autocomplete')
      // $edit.css("padding-left", "1.8em");
      $autocomplete.css('padding-left', '1.8em')
      $autocomplete.css('background-color', $edit.css('background-color'))
    }

    /*
    $edit.change(function () {
      var val = $edit.val();
      var ref = null;
      var typeFilter = type[attrType];
      // Lookup element by name and type
      if (val && val.length > 0) {
        if (elems.length > 0 && elems[0]._parent !== null) {
          ref = Repository.lookupAndFind(elems[0]._parent, val, typeFilter);
        }
      }
      $(exports).triggerHandler('propertyChanged', [elems, field, (ref ? ref : val)]);
    });
    */

    $button.click(function () {
      var initialSelection = Element.mergeProps(elems, field)
      app.elementPickerDialog.showDialog('Select Element', initialSelection, type[attrType]).then(function ({buttonId, returnValue}) {
        if (buttonId === 'ok') {
          $edit.val((returnValue ? returnValue.name : ''))
          self.emit('propertyChanged', elems, field, returnValue)
        }
      })
    })
  }

  defineAttributes (prefix, elems, attrs) {
    _.forEach(attrs, attr => {
      if (attr.visible === true) {
        switch (attr.kind) {
        case Element.AK_PRIM:
          switch (attr.type) {
          case 'String':
            if (attr.options) {
              this.defineComboProperty(prefix, attr.name, attr.options, elems, attr.name)
            } else if (attr.multiline === true) {
              this.defineMultilineTextProperty(prefix, attr.name, elems, attr.name)
            } else {
              this.defineTextProperty(prefix, attr.name, elems, attr.name)
            }
            break
          case 'Boolean':
            this.defineCheckProperty(prefix, attr.name, elems, attr.name)
            break
          case 'Integer':
            this.defineIntegerProperty(prefix, attr.name, elems, attr.name)
            break
          case 'Image':
            this.defineImageProperty(prefix, attr.name, elems, attr.name)
            break
          }
          break
        case Element.AK_ENUM:
          this.defineEnumProperty(prefix, attr.name, meta[attr.type], elems, attr.name)
          break
        case Element.AK_REF:
          this.defineRefProperty(prefix, attr.name, elems, attr.name, attr.readOnly)
          break
        case Element.AK_REFS:
          this.defineRefListProperty(prefix, attr.name, elems, attr.name)
          break
        case Element.AK_VAR:
          this.defineVarProperty(prefix, attr.name, attr.type, elems, attr.name)
          break
        }
      }
    })
  }

  /**
   * Show properties of a given element.
   * @private
   *
   * @param {Element} elem
   */
  show (elems) {
    if (elems && elems.length > 0) {
      var i, len
      // Destroy previous kendo widgets (e.g. AutoComplete)
      if (this._destroyedBeforeShowing.length > 0) {
        for (i = 0, len = this._destroyedBeforeShowing.length; i < len; i++) {
          this._destroyedBeforeShowing[i].destroy()
        }
      }

      this.$view.show()
      this.$propertyGrid.empty()
      var commonType = Element.getCommonType(elems)
      var attrs = this.metamodelManager.getMetaAttributes(commonType.name)
      this.defineAttributes(null, elems, attrs)
      for (i = 0, len = attrs.length; i < len; i++) {
        var attr = attrs[i]
        if (attr.expand === true) {
          var name = attr.name
          var values = _.map(elems, function (e) { return e[name] })
          var commonType2 = Element.getCommonType(values)
          var attrs2 = this.metamodelManager.getMetaAttributes(commonType2.name)
          this.$propertyGrid.append(Mustache.render(separatorItemTemplate, { name: name, type: commonType2.name }))
          this.defineAttributes(name, values, attrs2)
        }
      }
    } else {
      this.$view.hide()
    }
  }

  htmlReady () {
    var viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/property-editor-view.html'), 'utf8')
    this.$view = $(viewTemplate)
    this.$propertyGrid = this.$view.find('.property-grid')
    this.editorsHolder.addEditorView(this.$view)
  }

}

module.exports = PropertyEditorView
