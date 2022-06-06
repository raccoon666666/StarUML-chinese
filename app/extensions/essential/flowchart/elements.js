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
  Point,
  Rect,
  Canvas,
  Coord,
  EdgeView,
  EdgeParasiticView
} = app.type

const LEFT_PADDING = 10
const RIGHT_PADDING = 10
const TOP_PADDING = 10
const BOTTOM_PADDING = 10

const DECISION_MINWIDTH = 50
const DECISION_MINHEIGHT = 30
const MERGE_MINWIDTH = 30
const MERGE_MINHEIGHT = 25
const EXTRACT_MINWIDTH = 30
const EXTRACT_MINHEIGHT = 25

/**
* FCModelElement
*/
class FCModelElement extends type.ExtensibleModel {

  getDisplayClassName () {
    var name = this.getClassName()
    return name.substring(2, name.length)
  }

  /**
   * Get incoming flows
   *
   * @return {Array.<FCFlow>}
   */
  getIncomingFlows () {
    var self = this
    var flows = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.FCFlow) && (r.target === self)
    })
    return flows
  }

  /**
   * Get outgoing flows
   *
   * @return {Array.<FCFlow>}
   */
  getOutgoingFlows () {
    var self = this
    var flows = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.FCFlow) && (r.source === self)
    })
    return flows
  }

}

/**
* FCFlowchart
*/
class FCFlowchart extends FCModelElement {}

/**
* FCFlowchartDiagram
*/
class FCFlowchartDiagram extends type.Diagram {

  getDisplayClassName () {
    return 'FlowchartDiagram'
  }
}

/**
* FCProcess
*/
class FCProcess extends FCModelElement {}

/**
* FCTerminator
*/
class FCTerminator extends FCModelElement {}

/**
* FCDecision
*/
class FCDecision extends FCModelElement {}

/**
* FCDelay
*/
class FCDelay extends FCModelElement {}

/**
* FCPredefinedProcess
*/
class FCPredefinedProcess extends FCModelElement {}

/**
* FCAlternateProcess
*/
class FCAlternateProcess extends FCModelElement {}

/**
* FCData
*/
class FCData extends FCModelElement {}

/**
* FCDocument
*/
class FCDocument extends FCModelElement {}

/**
* FCMultiDocument
*/
class FCMultiDocument extends FCModelElement {}

/**
* FCPreparation
*/
class FCPreparation extends FCModelElement {}

/**
* FCDisplay
*/
class FCDisplay extends FCModelElement {}

/**
* FCManualInput
*/
class FCManualInput extends FCModelElement {}

/**
* FCManualOperation
*/
class FCManualOperation extends FCModelElement {}

/**
* FCCard
*/
class FCCard extends FCModelElement {}

/**
* FCPunchedTape
*/
class FCPunchedTape extends FCModelElement {}

/**
* FCConnector
*/
class FCConnector extends FCModelElement {}

/**
* FCOffPageConnector
*/
class FCOffPageConnector extends FCModelElement {}

/**
* FCOr
*/
class FCOr extends FCModelElement {}

/**
* FCSummingJunction
*/
class FCSummingJunction extends FCModelElement {}

/**
* FCCollate
*/
class FCCollate extends FCModelElement {}

/**
* FCSort
*/
class FCSort extends FCModelElement {}

/**
* FCMerge
*/
class FCMerge extends FCModelElement {}

/**
* FCExtract
*/
class FCExtract extends FCModelElement {}

/**
* FCStoredData
*/
class FCStoredData extends FCModelElement {}

/**
* FCDatabase
*/
class FCDatabase extends FCModelElement {}

/**
* FCDirectAccessStorage
*/
class FCDirectAccessStorage extends FCModelElement {}

/**
* FCInternalStorage
*/
class FCInternalStorage extends FCModelElement {}

/**
* FCFlow
*/
class FCFlow extends type.DirectedRelationship {}

/* -------------------------- View Elements ---------------------------- */

/**
* FCGeneralNodeView
*/
class FCGeneralNodeView extends type.NodeView {

  constructor () {
    super()

    /** @member {boolean} */
    this.wordWrap = true

    /** @member {LabelView} */
    this.nameLabel = new type.LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.name
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
    // this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING
  }

  drawObject (canvas) {
    super.drawObject(canvas)
  }

  canDelete () {
    return false
  }
}

/**
* FCGeneralEdgeView
*/
class FCGeneralEdgeView extends type.EdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_SOLID_ARROW
    this.lineMode = EdgeView.LM_SOLID

    /** @member {EdgeLabelView} */
    this.nameLabel = new type.EdgeLabelView()
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
    return (view.model instanceof FCModelElement)
  }

  canDelete () {
    return false
  }
}

/**
* FCProcessView
*/
class FCProcessView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.process.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    super.drawObject(canvas)
  }
}

/**
* FCTerminatorView
*/
class FCTerminatorView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.terminator.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  drawObject (canvas) {
    var round = Math.min(this.height, this.width) / 2
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), round)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), round)
    super.drawObject(canvas)
  }
}

/**
* FDecisionView
*/
class FCDecisionView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.decision.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.nameLabel.minWidth * 2, DECISION_MINWIDTH)
    this.minHeight = Math.max(this.nameLabel.minHeight * 2, DECISION_MINHEIGHT)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + (this.width / 4)
    this.nameLabel.top = this.top + (this.height / 4)
    this.nameLabel.width = (this.width / 2)
    this.nameLabel.height = (this.height / 2)
  }

  drawObject (canvas) {
    var x = (this.left + this.getRight()) / 2
    var y = (this.top + this.getBottom()) / 2
    canvas.fillPolygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)])
    canvas.polygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)])
    super.drawObject(canvas)
  }
}

/**
* FCDelayView
*/
class FCDelayView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.delay.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.width = (this.width * 0.75)
  }

  drawObject (canvas) {
    var r = this.height / 2
    canvas.fillRect(this.left, this.top, this.getRight() - r, this.getBottom())
    canvas.fillArc(this.getRight() - r, this.top + r, r, -(Math.PI / 2), Math.PI / 2)
    canvas.line(this.left, this.top, this.left, this.getBottom())
    canvas.line(this.left, this.top, this.getRight() - r, this.top)
    canvas.line(this.left, this.top + this.height, this.getRight() - r, this.top + this.height)
    canvas.arc(this.getRight() - r, this.top + r, r, -(Math.PI / 2), Math.PI / 2)
    super.drawObject(canvas)
  }
}

/**
* FCPredefinedProcessView
*/
class FCPredefinedProcessView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.predefined-process.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + LEFT_PADDING + 5
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - 5
  }

  drawObject (canvas) {
    var gap = 5
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.line(this.left + gap, this.top, this.left + gap, this.getBottom())
    canvas.line(this.getRight() - gap, this.top, this.getRight() - gap, this.getBottom())
    super.drawObject(canvas)
  }
}

/**
* FCAlternateProcessView
*/
class FCAlternateProcessView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.alternate-process.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  drawObject (canvas) {
    var round = 10
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), round)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), round)
    super.drawObject(canvas)
  }
}

/**
* FCDataView
*/
class FCDataView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.data.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.width / 6)
    this.nameLabel.left = this.left + LEFT_PADDING + g
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var g = Math.floor(this.width / 6)
    var pts = [
      new Point(r.x1 + g, r.y1),
      new Point(r.x2, r.y1),
      new Point(r.x2 - g, r.y2),
      new Point(r.x1, r.y2),
      new Point(r.x1 + g, r.y1)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCDocumentView
*/
class FCDocumentView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.document.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var h = Math.floor(this.height / 6)
    this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - h
  }

  drawDocument (canvas, rect) {
    var h = Math.floor(rect.getHeight() / 6)
    var g = Math.floor(rect.getWidth() / 3)
    canvas.fillPath([['M', rect.x1, rect.y1],
    ['L', rect.x2, rect.y1],
    ['L', rect.x2, rect.y2],
    ['C', rect.x2 - g, rect.y2 - (h * 2), rect.x1 + g, rect.y2 + (h * 1.5), rect.x1, rect.y2 - h],
    ['L', rect.x1, rect.y1],
    ['Z']], true)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    this.drawDocument(canvas, r)
    super.drawObject(canvas)
  }
}

/**
* FCMultiDocumentView
*/
class FCMultiDocumentView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.multidocument.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = 5
    var h = Math.floor(this.height / 6)
    this.nameLabel.top = this.top + TOP_PADDING + (g * 2)
    this.nameLabel.left = this.left + LEFT_PADDING + (g * 2)
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2)
    this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - h - (g * 2)
  }

  drawObject (canvas) {
    var g = 5
    var r1 = new Rect(this.left, this.top, this.getRight() - (g * 2), this.getBottom() - (g * 2))
    var r2 = new Rect(this.left + g, this.top + g, this.getRight() - g, this.getBottom() - g)
    var r3 = new Rect(this.left + (g * 2), this.top + (g * 2), this.getRight(), this.getBottom())
    FCDocumentView.prototype.drawDocument(canvas, r1)
    FCDocumentView.prototype.drawDocument(canvas, r2)
    FCDocumentView.prototype.drawDocument(canvas, r3)
    super.drawObject(canvas)
  }
}

/**
* FCPreparationView
*/
class FCPreparationView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.preparation.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.width / 6)
    this.nameLabel.left = this.left + LEFT_PADDING + g
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var m = (r.y1 + r.y2) / 2
    var g = Math.floor(this.width / 6)
    var pts = [
      new Point(r.x1, m),
      new Point(r.x1 + g, r.y1),
      new Point(r.x2 - g, r.y1),
      new Point(r.x2, m),
      new Point(r.x2 - g, r.y2),
      new Point(r.x1 + g, r.y2),
      new Point(r.x1, m)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCDisplayView
*/
class FCDisplayView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.display.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.width / 6)
    this.nameLabel.left = this.left + LEFT_PADDING + g
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var m = (r.y1 + r.y2) / 2
    var g = Math.floor(this.width / 6)
    canvas.fillPath([['M', r.x1, m],
    ['L', r.x1 + g, r.y1],
    ['L', r.x2 - g, r.y1],
    ['Q', r.x2, r.y1, r.x2, m],
    ['Q', r.x2, r.y2, r.x2 - g, r.y2],
    ['L', r.x1 + g, r.y2],
    ['L', r.x1, m],
    ['Z']], true)
    super.drawObject(canvas)
  }
}

/**
* FCManualInputView
*/
class FCManualInputView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.manual-input.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.height / 6)
    this.nameLabel.top = this.top + TOP_PADDING + g
    this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - g
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var g = Math.floor(this.height / 6)
    var pts = [
      new Point(r.x1, r.y1 + g),
      new Point(r.x2, r.y1),
      new Point(r.x2, r.y2),
      new Point(r.x1, r.y2),
      new Point(r.x1, r.y1 + g)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCManualOperationView
*/
class FCManualOperationView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.manual-operation.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.width / 6)
    this.nameLabel.left = this.left + LEFT_PADDING + g
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var g = Math.floor(this.width / 6)
    var pts = [
      new Point(r.x1, r.y1),
      new Point(r.x2, r.y1),
      new Point(r.x2 - g, r.y2),
      new Point(r.x1 + g, r.y2),
      new Point(r.x1, r.y1)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCCardView
*/
class FCCardView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.card.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var g = Math.floor(this.width / 8)
    var pts = [
      new Point(r.x1 + g, r.y1),
      new Point(r.x2, r.y1),
      new Point(r.x2, r.y2),
      new Point(r.x1, r.y2),
      new Point(r.x1, r.y1 + g),
      new Point(r.x1 + g, r.y1)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCPunchedTapeView
*/
class FCPunchedTapeView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.punched-tape.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.height / 6)
    this.nameLabel.top = this.top + TOP_PADDING + g
    this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - (g * 2)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var h = Math.floor(r.getHeight() / 6)
    var g = Math.floor(r.getWidth() / 3)
    canvas.fillPath([['M', r.x1, r.y1],
    ['C', r.x1 + g, r.y1 + (h * 2), r.x2 - g, r.y1 - (h * 1.5), r.x2, r.y1 + h],
    ['L', r.x2, r.y2],
    ['C', r.x2 - g, r.y2 - (h * 2), r.x1 + g, r.y2 + (h * 1.5), r.x1, r.y2 - h],
    ['L', r.x1, r.y1],
    ['Z']], true)
    super.drawObject(canvas)
  }
}

/**
* FCConnectorView
*/
class FCConnectorView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.connector.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(30, this.nameLabel.minWidth)
    this.minHeight = Math.max(30, this.nameLabel.minHeight)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + (this.width / 4)
    this.nameLabel.top = this.top + (this.height / 4)
    this.nameLabel.width = (this.width / 2)
    this.nameLabel.height = (this.height / 2)
  }

  drawObject (canvas) {
    canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
    canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
    super.drawObject(canvas)
  }
}

/**
* FCOffPageConnectorView
*/
class FCOffPageConnectorView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.off-page-connector.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.height / 4)
    this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - g
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var g = Math.floor(this.height / 4)
    var pts = [
      new Point(r.x1, r.y1),
      new Point(r.x2, r.y1),
      new Point(r.x2, r.y2 - g),
      new Point((r.x1 + r.x2) / 2, r.y2),
      new Point(r.x1, r.y2 - g),
      new Point(r.x1, r.y1)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCOrView
*/
class FCOrView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.or.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.nameLabel.visible = false
    this.minWidth = 30
    this.minHeight = 30
    if (this.height !== this.width) {
      this.width = Math.min(this.width, this.height)
      this.height = Math.min(this.width, this.height)
    }
  }

  drawObject (canvas) {
    canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
    canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
    var p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
    // var d = Math.round(Math.sqrt(2) * this.width / 4)
    canvas.line(p.x, this.top, p.x, this.getBottom())
    canvas.line(this.left, p.y, this.getRight(), p.y)
    super.drawObject(canvas)
  }
}

/**
* FCSummingJunctionView
*/
class FCSummingJunctionView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.summing-junction.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.nameLabel.visible = false
    this.minWidth = 30
    this.minHeight = 30
    if (this.height !== this.width) {
      this.width = Math.min(this.width, this.height)
      this.height = Math.min(this.width, this.height)
    }
  }

  drawObject (canvas) {
    canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
    canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
    var p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
    var d = Math.round(Math.sqrt(2) * this.width / 4)
    canvas.line(p.x - d, p.y - d, p.x + d, p.y + d)
    canvas.line(p.x + d, p.y - d, p.x - d, p.y + d)
    super.drawObject(canvas)
  }
}

/**
* FCCollateView
*/
class FCCollateView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.collate.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.nameLabel.visible = false
    this.minWidth = 30
    this.minHeight = 30
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var pts = [
      new Point(r.x1, r.y1),
      new Point(r.x2, r.y1),
      new Point(r.x1, r.y2),
      new Point(r.x2, r.y2),
      new Point(r.x1, r.y1)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCSortView
*/
class FCSortView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.sort.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.nameLabel.visible = false
    this.minWidth = 30
    this.minHeight = 30
  }

  drawObject (canvas) {
    var xm = (this.left + this.getRight()) / 2
    var ym = (this.top + this.getBottom()) / 2
    var pts = [
      new Point(this.left, ym),
      new Point(xm, this.top),
      new Point(this.getRight(), ym),
      new Point(xm, this.getBottom()),
      new Point(this.left, ym)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    canvas.line(this.left, ym, this.getRight(), ym)
    super.drawObject(canvas)
  }
}

/**
* FCMergeView
*/
class FCMergeView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.merge.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.nameLabel.minWidth * 2, MERGE_MINWIDTH)
    this.minHeight = Math.max(this.nameLabel.minHeight * 2, MERGE_MINHEIGHT)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + (this.width / 4)
    this.nameLabel.top = this.top + TOP_PADDING
    this.nameLabel.width = (this.width / 2)
    this.nameLabel.height = (this.height / 2)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var pts = [
      new Point(r.x1, r.y1),
      new Point(r.x2, r.y1),
      new Point((r.x1 + r.x2) / 2, r.y2),
      new Point(r.x1, r.y1)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCExtractView
*/
class FCExtractView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.extract.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.nameLabel.minWidth * 2, EXTRACT_MINWIDTH)
    this.minHeight = Math.max(this.nameLabel.minHeight * 2, EXTRACT_MINHEIGHT)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + (this.width / 4)
    this.nameLabel.top = this.top + (this.height / 2) - BOTTOM_PADDING
    this.nameLabel.width = (this.width / 2)
    this.nameLabel.height = (this.height / 2)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var pts = [
      new Point((r.x1 + r.x2) / 2, r.y1),
      new Point(r.x2, r.y2),
      new Point(r.x1, r.y2),
      new Point((r.x1 + r.x2) / 2, r.y1)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    super.drawObject(canvas)
  }
}

/**
* FCStoredDataView
*/
class FCStoredDataView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.stored-data.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.width / 8)
    this.nameLabel.left = this.left + LEFT_PADDING + g
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 2)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var w = r.getWidth()
    var h = r.getHeight()
    var ym = (r.y1 + r.y2) / 2
    var g = Math.floor(w / 8)
    var kappa = 0.5522848
    var ox = g * kappa // control point offset horizontal
    var oy = (h / 2) * kappa // control point offset vertical
    canvas.fillPath([['M', r.x2, r.y1],
    ['C', r.x2 - ox, r.y1, r.x2 - g, ym - oy, r.x2 - g, ym],
    ['C', r.x2 - g, ym + oy, r.x2 - ox, r.y2, r.x2, r.y2],
    ['L', r.x1 + g, r.y2],
    ['C', r.x1 + g - ox, r.y2, r.x1, ym + oy, r.x1, ym],
    ['C', r.x1, ym - oy, r.x1 + g - ox, r.y1, r.x1 + g, r.y1],
    ['L', r.x2, r.y1],
    ['Z']], true)
    super.drawObject(canvas)
  }
}

/**
* FCDatabaseView
*/
class FCDatabaseView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.database.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.height / 8)
    this.nameLabel.top = this.top + TOP_PADDING + (g * 2)
    this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - (g * 3)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var w = r.getWidth()
    var h = r.getHeight()
    var xm = (r.x1 + r.x2) / 2
    var g = Math.floor(h / 8)
    var kappa = 0.5522848
    var ox = (w / 2) * kappa // control point offset horizontal
    var oy = g * kappa       // control point offset vertical
    canvas.fillPath([['M', r.x1, r.y1 + g],
    ['C', r.x1, r.y1 + g - oy, xm - ox, r.y1, xm, r.y1],
    ['C', xm + ox, r.y1, r.x2, r.y1 + g - oy, r.x2, r.y1 + g],
    ['L', r.x2, r.y2 - g],
    ['C', r.x2, r.y2 - g + oy, xm + ox, r.y2, xm, r.y2],
    ['C', xm - ox, r.y2, r.x1, r.y2 - g + oy, r.x1, r.y2 - g],
    ['L', r.x1, r.y1 + g],
    ['Z']], true)
    canvas.path([['M', r.x1, r.y1 + g],
    ['C', r.x1, r.y1 + g + oy, xm - ox, r.y1 + (g * 2), xm, r.y1 + (g * 2)],
    ['C', xm + ox, r.y1 + (g * 2), r.x2, r.y1 + g + oy, r.x2, r.y1 + g]])
    super.drawObject(canvas)
  }
}

/**
* FCDirectAccessStorageView
*/
class FCDirectAccessStorageView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.direct-access-storage.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = Math.floor(this.width / 8)
    this.nameLabel.left = this.left + LEFT_PADDING + g
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - (g * 3)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var w = r.getWidth()
    var h = r.getHeight()
    var ym = (r.y1 + r.y2) / 2
    var g = Math.floor(w / 8)
    var kappa = 0.5522848
    var ox = g * kappa       // control point offset horizontal
    var oy = (h / 2) * kappa // control point offset vertical
    canvas.fillPath([['M', r.x2 - g, r.y1],
    ['C', r.x2 - g + ox, r.y1, r.x2, ym - oy, r.x2, ym],
    ['C', r.x2, ym + oy, r.x2 - g + ox, r.y2, r.x2 - g, r.y2],
    ['L', r.x1 + g, r.y2],
    ['C', r.x1 + g - ox, r.y2, r.x1, ym + oy, r.x1, ym],
    ['C', r.x1, ym - oy, r.x1 + g - ox, r.y1, r.x1 + g, r.y1],
    ['L', r.x2 - g, r.y1],
    ['Z']], true)
    canvas.path([['M', r.x2 - g, r.y1],
    ['C', r.x2 - g - ox, r.y1, r.x2 - (g * 2), ym - oy, r.x2 - (g * 2), ym],
    ['C', r.x2 - (g * 2), ym + oy, r.x2 - g - ox, r.y2, r.x2 - g, r.y2]])
    super.drawObject(canvas)
  }
}

/**
* FCInternalStorageView
*/
class FCInternalStorageView extends FCGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('flowchart.internal-storage.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var g = 10
    this.nameLabel.left = this.left + LEFT_PADDING + g
    this.nameLabel.top = this.top + TOP_PADDING + g
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING - g
    this.nameLabel.height = this.height - TOP_PADDING - BOTTOM_PADDING - g
  }

  drawObject (canvas) {
    var gap = 10
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.line(this.left + gap, this.top, this.left + gap, this.getBottom())
    canvas.line(this.left, this.top + gap, this.getRight(), this.top + gap)
    super.drawObject(canvas)
  }
}

/**
* FCFlowView
*/
class FCFlowView extends FCGeneralEdgeView {

  constructor () {
    super()
    this.lineStyle = app.preferences.get('flowchart.flow.lineStyle', EdgeView.LS_ROUNDRECT) || app.preferences.get('view.lineStyle', EdgeView.LS_OBLIQUE)
  }
}

/* ************************** Type definitions ***************************/

type.FCModelElement = FCModelElement
type.FCFlowchart = FCFlowchart
type.FCFlowchartDiagram = FCFlowchartDiagram
type.FCProcess = FCProcess
type.FCTerminator = FCTerminator
type.FCDecision = FCDecision
type.FCDelay = FCDelay
type.FCPredefinedProcess = FCPredefinedProcess
type.FCAlternateProcess = FCAlternateProcess
type.FCData = FCData
type.FCDocument = FCDocument
type.FCMultiDocument = FCMultiDocument
type.FCPreparation = FCPreparation
type.FCDisplay = FCDisplay
type.FCManualInput = FCManualInput
type.FCManualOperation = FCManualOperation
type.FCCard = FCCard
type.FCPunchedTape = FCPunchedTape
type.FCConnector = FCConnector
type.FCOffPageConnector = FCOffPageConnector
type.FCOr = FCOr
type.FCSummingJunction = FCSummingJunction
type.FCCollate = FCCollate
type.FCSort = FCSort
type.FCMerge = FCMerge
type.FCExtract = FCExtract
type.FCStoredData = FCStoredData
type.FCDatabase = FCDatabase
type.FCDirectAccessStorage = FCDirectAccessStorage
type.FCInternalStorage = FCInternalStorage
type.FCFlow = FCFlow

type.FCGeneralNodeView = FCGeneralNodeView
type.FCGeneralEdgeView = FCGeneralEdgeView
type.FCProcessView = FCProcessView
type.FCTerminatorView = FCTerminatorView
type.FCDecisionView = FCDecisionView
type.FCDelayView = FCDelayView
type.FCPredefinedProcessView = FCPredefinedProcessView
type.FCAlternateProcessView = FCAlternateProcessView
type.FCDataView = FCDataView
type.FCDocumentView = FCDocumentView
type.FCMultiDocumentView = FCMultiDocumentView
type.FCPreparationView = FCPreparationView
type.FCDisplayView = FCDisplayView
type.FCManualInputView = FCManualInputView
type.FCManualOperationView = FCManualOperationView
type.FCCardView = FCCardView
type.FCPunchedTapeView = FCPunchedTapeView
type.FCConnectorView = FCConnectorView
type.FCOffPageConnectorView = FCOffPageConnectorView
type.FCOrView = FCOrView
type.FCSummingJunctionView = FCSummingJunctionView
type.FCCollateView = FCCollateView
type.FCSortView = FCSortView
type.FCMergeView = FCMergeView
type.FCExtractView = FCExtractView
type.FCStoredDataView = FCStoredDataView
type.FCDatabaseView = FCDatabaseView
type.FCDirectAccessStorageView = FCDirectAccessStorageView
type.FCInternalStorageView = FCInternalStorageView
type.FCFlowView = FCFlowView
