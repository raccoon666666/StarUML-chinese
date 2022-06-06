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

const {
  Color,
  Canvas,
  ExtensibleModel,
  DirectedRelationship,
  Diagram,
  NodeView,
  LabelView,
  EdgeView,
  EdgeLabelView,
  EdgeParasiticView
} = app.type

/**
 * DFDElement
 */
class DFDElement extends ExtensibleModel {

  constructor () {
    super()

    /** @member {string} */
    this.id = ''
  }

  getDisplayClassName () {
    var name = this.getClassName()
    return name.substring(3, name.length)
  }

  getNodeText (options) {
    var str = this.name
    if (this.id && this.id.length > 0) {
      str = '(' + this.id + ') ' + str
    }
    return str
  }

  /**
   * Get incoming data flows
   *
   * @return {Array.<DFDDataFlow>}
   */
  getIncomingFlows () {
    var self = this
    var flows = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.DFDDataFlow) && (r.target === self)
    })
    return flows
  }

  /**
   * Get outgoing data flows
   *
   * @return {Array.<DFDDataFlow>}
   */
  getOutgoingFlows () {
    var self = this
    var flows = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.DFDDataFlow) && (r.source === self)
    })
    return flows
  }

}

/**
 * DFDDataFlowModel
 */
class DFDDataFlowModel extends DFDElement {}

/**
 * DFDExternalEntity
 */
class DFDExternalEntity extends DFDElement {}

/**
 * DFDProcess
 */
class DFDProcess extends DFDElement {}

/**
 * DFDDataStore
 */
class DFDDataStore extends DFDElement {}

/**
 * DFDDataFlow
 */
class DFDDataFlow extends DirectedRelationship {}

/**
 * DFDDiagram
 */
class DFDDiagram extends Diagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
    (model instanceof type.Diagram) ||
    (model instanceof type.DFDExternalEntity) ||
    (model instanceof type.DFDProcess) ||
    (model instanceof type.DFDDataStore) ||
    (model instanceof type.DFDDataFlow)
  }
}

/* -------------------------- View Elements ---------------------------- */

const SHADOW_OFFSET = 7
const SHADOW_ALPHA = 0.2
const SHADOW_COLOR = Color.LIGHT_GRAY

const LEFT_PADDING = 10
const RIGHT_PADDING = 10
const TOP_PADDING = 10
const BOTTOM_PADDING = 10

const COMPARTMENT_LEFT_PADDING = 5
const COMPARTMENT_RIGHT_PADDING = 5
const COMPARTMENT_TOP_PADDING = 5
const COMPARTMENT_BOTTOM_PADDING = 5

/**
 * DFDGeneralNodeView
 */
class DFDGeneralNodeView extends NodeView {

  constructor () {
    super()

    /** @member {boolean} */
    this.wordWrap = true

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)

    /** @member {LabelView} */
    this.idLabel = new LabelView()
    this.idLabel.horizontalAlignment = Canvas.AL_CENTER
    this.idLabel.parentStyle = true
    this.idLabel.wordWrap = false
    this.addSubView(this.idLabel)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.name
      this.idLabel.text = this.model.id
    }
    this.nameLabel.wordWrap = this.wordWrap
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING
    this.minHeight = this.nameLabel.minHeight + TOP_PADDING + BOTTOM_PADDING
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + LEFT_PADDING
    this.nameLabel.top = this.top + TOP_PADDING
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING
    this.nameLabel.height = this.nameLabel.minHeight
  }

  drawObject (canvas) {
    super.drawObject(canvas)
  }

  canDelete () {
    return false
  }
}

/**
 * DFDExternalEntityView
 */
class DFDExternalEntityView extends DFDGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('dfd.external-entity.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.nameLabel.minWidth, this.idLabel.minWidth) + LEFT_PADDING + RIGHT_PADDING
    const idHeight = this.idLabel.text.length > 0 ? this.idLabel.minHeight : 0
    this.minHeight = TOP_PADDING + idHeight + this.nameLabel.minHeight + BOTTOM_PADDING
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.idLabel.left = this.left + LEFT_PADDING
    this.idLabel.top = this.top + COMPARTMENT_TOP_PADDING
    this.idLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING
    this.idLabel.height = this.idLabel.minHeight
    const idHeight = this.idLabel.text.length > 0 ? this.idLabel.minHeight : 0
    this.nameLabel.left = this.left + LEFT_PADDING
    this.nameLabel.top = this.top + TOP_PADDING + idHeight
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING
    this.nameLabel.height = this.nameLabel.minHeight
  }

  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    super.drawObject(canvas)
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
}

/**
 * DFDProcessView
 */
class DFDProcessView extends DFDGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('dfd.process.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.nameLabel.minWidth, this.idLabel.minWidth) + LEFT_PADDING + RIGHT_PADDING
    this.minHeight = COMPARTMENT_TOP_PADDING + this.idLabel.minHeight + COMPARTMENT_BOTTOM_PADDING + TOP_PADDING + this.nameLabel.minHeight + BOTTOM_PADDING
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.idLabel.left = this.left + LEFT_PADDING
    this.idLabel.top = this.top + COMPARTMENT_TOP_PADDING
    this.idLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING
    this.idLabel.height = this.idLabel.minHeight
    this.nameLabel.left = this.left + LEFT_PADDING
    this.nameLabel.top = this.idLabel.getBottom() + COMPARTMENT_BOTTOM_PADDING + TOP_PADDING
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING
    this.nameLabel.height = this.nameLabel.minHeight
  }

  drawObject (canvas) {
    const round = 10
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), round)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), round)
    const y = this.top + COMPARTMENT_TOP_PADDING + this.idLabel.height + COMPARTMENT_BOTTOM_PADDING
    canvas.line(this.left, y, this.getRight(), y)
    super.drawObject(canvas)
  }

  drawShadow (canvas) {
    const round = 10
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    canvas.fillRoundRect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      round
    )
    canvas.restoreState()
  }
}

/**
 * DFDDataStoreView
 */
class DFDDataStoreView extends DFDGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('dfd.datastore.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = COMPARTMENT_LEFT_PADDING + this.idLabel.minWidth + COMPARTMENT_RIGHT_PADDING + LEFT_PADDING + this.nameLabel.minWidth + RIGHT_PADDING
    this.minHeight = TOP_PADDING + this.nameLabel.minHeight + BOTTOM_PADDING
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.idLabel.left = this.left + COMPARTMENT_LEFT_PADDING
    this.idLabel.top = this.top + TOP_PADDING
    this.idLabel.width = this.idLabel.minWidth
    this.idLabel.height = this.idLabel.minHeight
    this.nameLabel.left = this.left + COMPARTMENT_LEFT_PADDING + this.idLabel.width + COMPARTMENT_RIGHT_PADDING + LEFT_PADDING
    this.nameLabel.top = this.top + TOP_PADDING
    this.nameLabel.width = this.width - (COMPARTMENT_LEFT_PADDING + this.idLabel.width + COMPARTMENT_RIGHT_PADDING + LEFT_PADDING + RIGHT_PADDING)
    this.nameLabel.height = this.nameLabel.minHeight
  }

  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.line(this.left, this.top, this.left, this.getBottom())
    canvas.line(this.left, this.top, this.getRight(), this.top)
    canvas.line(this.left, this.getBottom(), this.getRight(), this.getBottom())
    const x = this.left + COMPARTMENT_LEFT_PADDING + this.idLabel.width + COMPARTMENT_RIGHT_PADDING
    canvas.line(x, this.top, x, this.getBottom())
    super.drawObject(canvas)
  }

  drawShadow (canvas) {
    const round = 10
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    canvas.fillRect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      round
    )
    canvas.restoreState()
  }
}

/**
 * DFDGeneralEdgeView
 */
class DFDGeneralEdgeView extends EdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_SOLID_ARROW
    this.lineMode = EdgeView.LM_SOLID

    /** @member {EdgeLabelView} */
    this.nameLabel = new EdgeLabelView()
    this.nameLabel.hostEdge = this
    this.nameLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.nameLabel.distance = 15
    this.nameLabel.alpha = Math.PI / 2
    this.addSubView(this.nameLabel)
  }

  update (canvas) {
    if (this.model) {
      // nameLabel
      this.nameLabel.visible = (this.model.name.length > 0)
      if (this.model.name) {
        this.nameLabel.text = this.model.name
      }
      // Enforce nameLabel.mode refers to this.model by using Bypass Command.
      if (this.nameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameLabel, 'model', this.model)
      }
    }
    super.update(canvas)
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof DFDElement)
  }

  canDelete () {
    return false
  }
}

/**
 * DFDDataFlowView
 */
class DFDDataFlowView extends DFDGeneralEdgeView {

  constructor () {
    super()
    this.lineStyle = app.preferences.get('dfd.dataflow.lineStyle', EdgeView.LS_ROUNDRECT) || app.preferences.get('view.lineStyle', EdgeView.LS_OBLIQUE)
  }
}

/* ************************** Type definitions ***************************/

type.DFDElement = DFDElement
type.DFDDataFlowModel = DFDDataFlowModel
type.DFDExternalEntity = DFDExternalEntity
type.DFDProcess = DFDProcess
type.DFDDataStore = DFDDataStore
type.DFDDataFlow = DFDDataFlow
type.DFDDiagram = DFDDiagram
type.DFDGeneralNodeView = DFDGeneralNodeView
type.DFDExternalEntityView = DFDExternalEntityView
type.DFDProcessView = DFDProcessView
type.DFDDataStoreView = DFDDataStoreView
type.DFDGeneralEdgeView = DFDGeneralEdgeView
type.DFDDataFlowView = DFDDataFlowView
