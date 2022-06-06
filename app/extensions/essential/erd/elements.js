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
const {
  Color,
  Font,
  Canvas,
  View,
  NodeView,
  EdgeView,
  EdgeParasiticView
} = app.type

/**
 * ERDElement
 */
class ERDElement extends type.ExtensibleModel {

  getDisplayClassName () {
    var name = this.getClassName()
    return name.substring(3, name.length)
  }
}

/**
 * ERDDataModel
 */
class ERDDataModel extends ERDElement {}

/**
 * ERDDiagram
 */
class ERDDiagram extends type.Diagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
    (model instanceof type.Diagram) ||
    (model instanceof type.ERDEntity) ||
    (model instanceof type.ERDColumn) ||
    (model instanceof type.ERDRelationship)
  }
}

/**
 * ERDColumn
 */
class ERDColumn extends ERDElement {

  constructor () {
    super()

    /** @member {string} */
    this.type = ''

    /** @member {string} */
    this.length = ''

    /** @member {boolean} */
    this.primaryKey = false

    /** @member {boolean} */
    this.foreignKey = false

    /** @member {ERDColumn} */
    this.referenceTo = null

    /** @member {boolean} */
    this.nullable = false

    /** @member {boolean} */
    this.unique = false
  }

  getKeyString () {
    var _key = this.primaryKey ? 'PK' : ''
    if (this.foreignKey) {
      _key += (_key.length > 0) ? ',FK' : 'FK'
    }
    if (!this.primaryKey && this.nullable) {
      _key += (_key.length > 0) ? ',N' : 'N'
    }
    if (!this.primaryKey && this.unique) {
      _key += (_key.length > 0) ? ',U' : 'U'
    }
    return _key
  }

  getNameString () {
    return this.name
  }

  getTypeString () {
    var _type = ''
    if (this.type && this.type.length > 0) {
      _type += this.type
    }
    if (this.length || (_.isString(this.length) && this.length.length > 0)) {
      _type += '(' + this.length + ')'
    }
    return _type
  }

  getString () {
    return this.getKeyString() + ' ' + this.name + ': ' + this.type
  }

  get textualNotation () {
    var str = this.name
    if (this.type && this.type.length > 0) {
      str = str + ': ' + this.type
      if (this.length) {
        str = str + '(' + this.length + ')'
      }
    }
    return str
  }
}

/**
 * ERDEntity
 */
class ERDEntity extends ERDElement {

  constructor () {
    super()

    /** @member {Array.<ERDColumn>} */
    this.columns = []
  }

  /**
   * Get all relationships
   * @return {Array.<ERDRelationship>}
   */
  getRelationships () {
    var rels = app.repository.getRelationshipsOf(this, function (r) { return (r instanceof type.ERDRelationship) })
    return rels
  }

  /**
   * Get all relationship ends linked to this element
   * @param {boolean} opposite Returns whether opposite (opposite-side) relationship ends or not.
   * @return {Array.<ERDRelationshipEnd>}
   */
  getRelationshipEnds (opposite) {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) { return (r instanceof type.ERDRelationship) })
    var ends = _.map(rels, function (r) {
      if (opposite === true) {
        return (r.end1.reference === self ? r.end2 : r.end1)
      } else {
        return (r.end1.reference === self ? r.end1 : r.end2)
      }
    })
    return ends
  }
}

/**
 * ERDRelationshipEnd
 */
class ERDRelationshipEnd extends type.RelationshipEnd {

  constructor () {
    super()

    /** @member {string} */
    this.cardinality = '1'
  }
}

/**
 * ERDRelationship
 */
class ERDRelationship extends type.UndirectedRelationship {

  constructor () {
    super()

    /** @member {boolean} */
    this.identifying = true

    /** @member {ERDRelationshipEnd} */
    this.end1 = new ERDRelationshipEnd()
    this.end1._parent = this

    /** @member {ERDRelationshipEnd} */
    this.end2 = new ERDRelationshipEnd()
    this.end2._parent = this
  }
}

/**************************************************************************
*                                                                        *
*                              VIEW ELEMENTS                             *
*                                                                        *
**************************************************************************/

const SHADOW_OFFSET = 7
const SHADOW_ALPHA = 0.2
const SHADOW_COLOR = Color.LIGHT_GRAY

const COMPARTMENT_ITEM_INTERVAL = 2
const COMPARTMENT_LEFT_PADDING = 5
const COMPARTMENT_RIGHT_PADDING = 5
const COMPARTMENT_TOP_PADDING = 5
const COMPARTMENT_BOTTOM_PADDING = 5

/**
* ERDColumnView
*/
class ERDColumnView extends type.LabelView {

  constructor () {
    super()
    this.horizontalAlignment = Canvas.AL_LEFT
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true

    this._nameOffset = 0
    this._typeOffset = 0
    this._width = 0
  }

  update (canvas) {
    super.update(canvas)
  }

  size (canvas) {
    super.size(canvas)
    this.minWidth = this._width
    this.height = this.minHeight
  }

  draw (canvas) {
    this.assignStyleToCanvas(canvas)
    if (this.model) {
      canvas.textOut(this.left, this.top, this.model.getKeyString())
      canvas.textOut(this.left + this._nameOffset + COMPARTMENT_LEFT_PADDING, this.top, this.model.getNameString())
      canvas.textOut(this.left + this._typeOffset + COMPARTMENT_LEFT_PADDING, this.top, this.model.getTypeString())
    }
    super.draw(canvas)
  }

  canHide () {
    return true
  }
}

/**
* ERDColumnCompartmentView
*/
class ERDColumnCompartmentView extends type.NodeView {

  constructor () {
    super()
    this.selectable = View.SK_PROPAGATE
    this.parentStyle = true

    this._nameOffset = 0
    this._typeOffset = 0
  }

  update (canvas) {
    if (this.model.columns) {
      var i, len
      var tempViews = this.subViews
      this.subViews = []
      for (i = 0, len = this.model.columns.length; i < len; i++) {
        var column = this.model.columns[i]
        var columnView = _.find(tempViews, function (v) { return v.model === column })
        if (!columnView) {
          columnView = new ERDColumnView()
          columnView.model = column
          columnView._parent = this
          // Insert columnView to subViews by bypass command.
          app.repository.bypassInsert(this, 'subViews', columnView)
        } else {
          this.addSubView(columnView)
        }
        columnView.setup(canvas)
      }
    }
    super.update(canvas)
  }

  size (canvas) {
    var i, len, item
    var _keyWidth = 0
    var _nameWidth = 0
    var _typeWidth = 0

    // Compute min-width of key, name, and type column
    var _key, _name, _type
    for (i = 0, len = this.subViews.length; i < len; i++) {
      item = this.subViews[i]
      if (item.visible && item.model) {
        _key = canvas.textExtent(item.model.getKeyString()).x
        _name = canvas.textExtent(item.model.getNameString()).x
        _type = canvas.textExtent(item.model.getTypeString()).x
        _keyWidth = Math.max(_keyWidth, _key)
        _nameWidth = Math.max(_nameWidth, _name)
        _typeWidth = Math.max(_typeWidth, _type)
      }
    }
    this._nameOffset = _keyWidth + COMPARTMENT_RIGHT_PADDING
    this._typeOffset = this._nameOffset + COMPARTMENT_LEFT_PADDING + _nameWidth + COMPARTMENT_RIGHT_PADDING

    // Compute size
    var w = 0
    var h = 0
    for (i = 0, len = this.subViews.length; i < len; i++) {
      item = this.subViews[i]
      item._nameOffset = this._nameOffset
      item._typeOffset = this._typeOffset
      item._width = this._typeOffset + COMPARTMENT_LEFT_PADDING + _typeWidth
      if (item.parentStyle) {
        item.font.size = item._parent.font.size
      }
      item.size(canvas)
      if (item.visible) {
        if (w < item.minWidth) {
          w = item.minWidth
        }
        if (i > 0) {
          h += COMPARTMENT_ITEM_INTERVAL
        }
        h += item.minHeight
      }
    }
    this.minWidth = w + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING
    this.minHeight = h + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING
    this.sizeConstraints()
  }

  arrange (canvas) {
    var i, len, item
    var _keyWidth = 0
    var _nameWidth = 0
    var _typeWidth = 0

    // Compute min-width of key, name, and type column
    var _key, _name, _type
    for (i = 0, len = this.subViews.length; i < len; i++) {
      item = this.subViews[i]
      if (item.visible && item.model) {
        _key = canvas.textExtent(item.model.getKeyString()).x
        _name = canvas.textExtent(item.model.getNameString()).x
        _type = canvas.textExtent(item.model.getTypeString()).x
        _keyWidth = Math.max(_keyWidth, _key)
        _nameWidth = Math.max(_nameWidth, _name)
        _typeWidth = Math.max(_typeWidth, _type)
      }
    }

    var h = COMPARTMENT_TOP_PADDING
    for (i = 0, len = this.subViews.length; i < len; i++) {
      item = this.subViews[i]
      if (item.visible) {
        if (i > 0) { h += COMPARTMENT_ITEM_INTERVAL }
        item.left = this.left + COMPARTMENT_LEFT_PADDING
        item.top = this.top + h
        item.width = this.width - COMPARTMENT_LEFT_PADDING - COMPARTMENT_RIGHT_PADDING
        h += item.height
      }
      item.arrange(canvas)
    }
    h += COMPARTMENT_BOTTOM_PADDING
    this.height = h
    this.sizeConstraints()
  }
}

/**
* ERDEntityView
*/
class ERDEntityView extends type.NodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('erd.entity.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')

    /** @member {boolean} */
    this.suppressColumns = false

    /** @member {LabelView} */
    this.nameLabel = new type.LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)

    /** @member {ERDColumnCompartmentView} */
    this.columnCompartment = new ERDColumnCompartmentView()
    this.columnCompartment.parentStyle = true
    this.addSubView(this.columnCompartment)
  }

  update (canvas) {
    // Assign this.model to columnCompartment.model by bypass command.
    if (this.columnCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.columnCompartment, 'model', this.model)
    }
    if (this.model) {
      this.nameLabel.text = this.model.name
      this.nameLabel.font.style = Font.FS_BOLD
    }
    this.columnCompartment.visible = !this.suppressColumns
    super.update(canvas)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    var _h = 0
    var _w = 0
    _h += COMPARTMENT_TOP_PADDING + this.nameLabel.minHeight + COMPARTMENT_BOTTOM_PADDING
    _w = this.nameLabel.minWidth + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING
    if (this.columnCompartment.visible) {
      _h += this.columnCompartment.minHeight
      _w = Math.max(_w, this.columnCompartment.minWidth)
    }
    this.minHeight = _h
    this.minWidth = _w
  }

  arrangeObject (canvas) {
    var _y = this.top + COMPARTMENT_TOP_PADDING
    this.nameLabel.top = _y
    this.nameLabel.left = this.left
    this.nameLabel.width = this.width
    this.nameLabel.height = this.nameLabel.minHeight
    _y += this.nameLabel.height + COMPARTMENT_BOTTOM_PADDING
    this.columnCompartment.top = _y
    this.columnCompartment.left = this.left
    this.columnCompartment.width = this.width
    super.arrangeObject(canvas)
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    canvas.fillRect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET
    )
    canvas.restoreState()
  }

  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    if (this.columnCompartment.visible && this.columnCompartment.subViews.length > 0) {
      canvas.line(this.left, this.columnCompartment.top, this.getRight(), this.columnCompartment.top)
      var _x1 = this.left + COMPARTMENT_LEFT_PADDING + this.columnCompartment._nameOffset
      var _x2 = this.left + COMPARTMENT_LEFT_PADDING + this.columnCompartment._typeOffset
      canvas.line(_x1, this.columnCompartment.top, _x1, this.getBottom())
      canvas.line(_x2, this.columnCompartment.top, _x2, this.getBottom())
    }
    super.drawObject(canvas)
  }
}

/**
* ERDRelationshipView
*/
class ERDRelationshipView extends type.EdgeView {

  constructor () {
    super()
    this.lineStyle = app.preferences.get('erd.relationship.lineStyle', EdgeView.LS_ROUNDRECT) || app.preferences.get('view.lineStyle', EdgeView.LS_OBLIQUE)

    this.headEndStyle = EdgeView.ES_CROWFOOT_ONE
    this.tailEndStyle = EdgeView.ES_CROWFOOT_ONE

    /** @member {EdgeLabelView} */
    this.nameLabel = new type.EdgeLabelView()
    this.nameLabel.hostEdge = this
    this.nameLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.nameLabel.distance = 15
    this.nameLabel.alpha = Math.PI / 2
    this.addSubView(this.nameLabel)

    /** @member {EdgeLabelView} */
    this.tailNameLabel = new type.EdgeLabelView()
    this.tailNameLabel.hostEdge = this
    this.tailNameLabel.edgePosition = EdgeParasiticView.EP_TAIL
    this.tailNameLabel.alpha = Math.PI / 6
    this.tailNameLabel.distance = 30
    this.addSubView(this.tailNameLabel)

    /** @member {EdgeLabelView} */
    this.headNameLabel = new type.EdgeLabelView()
    this.headNameLabel.hostEdge = this
    this.headNameLabel.edgePosition = EdgeParasiticView.EP_HEAD
    this.headNameLabel.alpha = -Math.PI / 6
    this.headNameLabel.distance = 30
    this.addSubView(this.headNameLabel)
  }

  update (canvas) {
    if (this.model) {
      this.nameLabel.visible = (this.model.name.length > 0)
      this.nameLabel.text = this.model.name
      if (this.model.end1) {
        this.tailNameLabel.text = this.model.end1.name
        switch (this.model.end1.cardinality) {
        case '0..1':
          this.tailEndStyle = EdgeView.ES_CROWFOOT_ZERO_ONE
          break
        case '1':
          this.tailEndStyle = EdgeView.ES_CROWFOOT_ONE
          break
        case '0..*':
          this.tailEndStyle = EdgeView.ES_CROWFOOT_ZERO_MANY
          break
        case '1..*':
          this.tailEndStyle = EdgeView.ES_CROWFOOT_MANY
          break
        default:
          this.tailEndStyle = EdgeView.ES_CROWFOOT_ONE
        }
      }
      if (this.model.end2) {
        this.headNameLabel.text = this.model.end2.name
        switch (this.model.end2.cardinality) {
        case '0..1':
          this.headEndStyle = EdgeView.ES_CROWFOOT_ZERO_ONE
          break
        case '1':
          this.headEndStyle = EdgeView.ES_CROWFOOT_ONE
          break
        case '0..*':
          this.headEndStyle = EdgeView.ES_CROWFOOT_ZERO_MANY
          break
        case '1..*':
          this.headEndStyle = EdgeView.ES_CROWFOOT_MANY
          break
        default:
          this.headEndStyle = EdgeView.ES_CROWFOOT_ONE
        }
      }
      if (this.model.identifying) {
        this.lineMode = EdgeView.LM_SOLID
      } else {
        this.lineMode = EdgeView.LM_DOT
      }
    }
    super.update(canvas)
  }
}

/* ************************** Type definitions ***************************/

type.ERDElement = ERDElement
type.ERDDataModel = ERDDataModel
type.ERDDiagram = ERDDiagram
type.ERDColumn = ERDColumn
type.ERDEntity = ERDEntity
type.ERDRelationshipEnd = ERDRelationshipEnd
type.ERDRelationship = ERDRelationship

type.ERDColumnView = ERDColumnView
type.ERDColumnCompartmentView = ERDColumnCompartmentView
type.ERDEntityView = ERDEntityView
type.ERDRelationshipView = ERDRelationshipView
