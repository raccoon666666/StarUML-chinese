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
  Point,
  Rect,
  Coord,
  Canvas,
  View,
  NodeView,
  LabelView
} = app.type

const CONSTRAINT_PARAMETER_MINWIDTH = 14
const CONSTRAINT_PARAMETER_MINHEIGHT = 14

/**************************************************************************
 *                                                                        *
 *                                BACKBONE                                *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLElementMixin
 * @mixin
 */
var SysMLElementMixin = {
  /**
   * Get class name for display
   * @memberof SysMLElementMixin
   * @return {string}
   */
  getDisplayClassName: function () {
    var name = this.getClassName()
    return name.substring(5, name.length)
  }
}

/**************************************************************************
 *                                                                        *
 *                                DIAGRAMS                                *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLDiagram
 */
class SysMLDiagram extends type.Diagram {
  constructor () {
    super()

    // mixin SysMLElementMixin
    _.extend(SysMLDiagram.prototype, SysMLElementMixin)
  }
}

/**
 * SysMLRequirementDiagram
 */
class SysMLRequirementDiagram extends SysMLDiagram {
  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLAssociation) ||
      (model instanceof type.SysMLRequirement) ||
      (model instanceof type.SysMLTrace)
  }
}

/**
 * SysMLBlockDefinitionDiagram
 */
class SysMLBlockDefinitionDiagram extends SysMLDiagram {
  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLAssociation) ||
      (model instanceof type.SysMLRequirement) ||
      (model instanceof type.SysMLTrace) ||
      (model instanceof type.SysMLPort)
  }
}

/**
 * SysMLInternalBlockDiagram
 */
class SysMLInternalBlockDiagram extends SysMLDiagram {
  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.SysMLProperty) ||
      (model instanceof type.SysMLPort) ||
      (model instanceof type.SysMLBlock)
  }
}

/**
 * SysMLParametricDiagram
 */
class SysMLParametricDiagram extends SysMLInternalBlockDiagram {}

/**************************************************************************
 *                                                                        *
 *                            GENERAL ELEMENTS                            *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLStakeholder
 */
class SysMLStakeholder extends type.UMLClassifier {
  constructor () {
    super()

    /** @member {string} */
    this.concern = ''

    // mixin SysMLElementMixin
    _.extend(SysMLStakeholder.prototype, SysMLElementMixin)
  }

  getNodeIcon () {
    return 'staruml-icon icon-UMLClass'
  }

  getPropertyValues () {
    const values = {}
    if (this.concern) values.concern = `"${this.concern}"`
    return values
  }
}

/**
 * SysMLView
 */
class SysMLView extends type.UMLClass {
  constructor () {
    super()
    // mixin SysMLElementMixin
    _.extend(SysMLView.prototype, SysMLElementMixin)
  }

  getNodeIcon () {
    return 'staruml-icon icon-UMLClass'
  }

  /**
   * Get conforms
   * @return {Array.<SysMLViewpoint>}
   */
  getConforms () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.SysMLConform) && (r.source === self)
    })
    return _.map(rels, function (g) { return g.target })
  }

  getPropertyValues () {
    const values = {}
    // if (this.concern) values.concern = `"${this.concern}"`
    const conforms = this.getConforms()
    if (conforms.length > 0) {
      values['/viewpoint'] = conforms.map(e => e.name).join(', ')
      const stakeholders = [...new Set(conforms.map(c => c.stakeholders).flat())]
      values['/stakeholder'] = stakeholders.map(e => e.name).join(', ')
    }
    return values
  }
}

/**
 * SysMLViewpoint
 */
class SysMLViewpoint extends type.UMLClass {
  constructor () {
    super()

    /** @member {Array<Stakeholder>} */
    this.stakeholders = []

    /** @member {string} */
    this.purpose = ''

    /** @member {string} */
    this.language = ''

    /** @member {string} */
    this.presentation = ''

    // mixin SysMLElementMixin
    _.extend(SysMLViewpoint.prototype, SysMLElementMixin)
  }

  getNodeIcon () {
    return 'staruml-icon icon-UMLClass'
  }

  getPropertyValues () {
    const values = {}
    if (this.stakeholders.length > 0) {
      const names = this.stakeholders.map(e => e.name)
      const concerns = this.stakeholders.map(e => e.concern).filter(c => c.length > 0).map(c => `"${c}"`)
      values['/stakeholder'] = names.join(', ')
      values['/concern'] = concerns.join(', ')
    }
    if (this.purpose) values.purpose = `"${this.purpose}"`
    if (this.language) values.language = `"${this.language}"`
    if (this.presentation) values.presentation = `"${this.presentation}"`
    return values
  }
}

/**
 * SysMLConform
 */
class SysMLConform extends type.UMLGeneralization {
  getNodeIcon () {
    return 'staruml-icon icon-UMLGeneralization'
  }

  getStereotypeString () {
    return super.getStereotypeString() || '«conform»'
  }

  getNodeText () {
    return '«conform» ' + super.getNodeText()
  }
}

/**
 * SysMLExpose
 */
class SysMLExpose extends type.UMLDependency {
  getNodeIcon () {
    return 'staruml-icon icon-UMLDependency'
  }

  getStereotypeString () {
    return super.getStereotypeString() || '«expose»'
  }

  getNodeText () {
    return '«expose» ' + super.getNodeText()
  }
}

/**************************************************************************
 *                                                                        *
 *                              REQUIREMENTS                              *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLAbstractRequirement
 */
class SysMLAbstractRequirement extends type.UMLClass {
  constructor () {
    super()

    /** @member {string} */
    this.id = ''

    /** @member {string} */
    this.text = ''

    // mixin SysMLElementMixin
    _.extend(SysMLAbstractRequirement.prototype, SysMLElementMixin)
  }
}

/**
 * SysMLRequirement
 */
class SysMLRequirement extends SysMLAbstractRequirement {
  getPropertyValues () {
    const values = {}
    if (this.id) values.id = `"${this.id}"`
    if (this.text) values.text = `"${this.text}"`
    return values
  }
}

/**
 * SysMLTrace
 */
class SysMLTrace extends type.UMLAbstraction {
  getNodeIcon () {
    return 'staruml-icon icon-UMLDependency'
  }
}

/**
 * SysMLCopy
 */
class SysMLCopy extends SysMLTrace {
  getStereotypeString () {
    return super.getStereotypeString() || '«copy»'
  }
  getNodeText () {
    return '«copy» ' + super.getNodeText()
  }
}

/**
 * SysMLDeriveReqt
 */
class SysMLDeriveReqt extends SysMLTrace {
  getStereotypeString () {
    return super.getStereotypeString() || '«deriveReqt»'
  }
  getNodeText () {
    return '«deriveReqt» ' + super.getNodeText()
  }
}

/**
 * SysMLVerify
 */
class SysMLVerify extends SysMLTrace {
  getStereotypeString () {
    return super.getStereotypeString() || '«verify»'
  }
  getNodeText () {
    return '«verify» ' + super.getNodeText()
  }
}

/**
 * SysMLSatisfy
 */
class SysMLSatisfy extends SysMLTrace {
  getStereotypeString () {
    return super.getStereotypeString() || '«satisfy»'
  }
  getNodeText () {
    return '«satisfy» ' + super.getNodeText()
  }
}

/**
 * SysMLRefine
 */
class SysMLRefine extends type.UMLAbstraction {
  getNodeIcon () {
    return 'staruml-icon icon-UMLDependency'
  }
  getStereotypeString () {
    return super.getStereotypeString() || '«refine»'
  }
  getNodeText () {
    return '«refine» ' + super.getNodeText()
  }
}

/**************************************************************************
 *                                                                        *
 *                                 BLOCKS                                 *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLProperty
 */
class SysMLProperty extends type.UMLAttribute {
  constructor () {
    super()
    // mixin SysMLElementMixin
    _.extend(SysMLProperty.prototype, SysMLElementMixin)
  }
}

/**
 * SysMLFlowProperty
 */
class SysMLFlowProperty extends SysMLProperty {
  constructor () {
    super()

    /** @member {string} */
    this.direction = SysMLFlowProperty.FD_INOUT
  }

  getString (options) {
    return this.direction + ' ' + super.getString(options)
  }
}

/**
 * SysMLFlowDirectionKind: `in`
 * @const {string}
 */
SysMLFlowProperty.FD_IN = 'in'

/**
 * SysMLFlowDirectionKind: `out`
 * @const {string}
 */
SysMLFlowProperty.FD_OUT = 'out'

/**
 * SysMLFlowDirectionKind: `inout`
 * @const {string}
 */
SysMLFlowProperty.FD_INOUT = 'inout'

/**
 * SysMLBlock
 */
class SysMLBlock extends type.UMLClass {
  constructor () {
    super()

    /** @member {boolean} */
    this.isEncapsulated = false

    /** @member {Array.<SysMLProperty>} */
    this.constraints = []

    /** @member {Array.<SysMLProperty>} */
    this.parts = []

    /** @member {Array.<SysMLPort>} */
    this.ports = []

    /** @member {Array.<SysMLProperty>} */
    this.values = []

    /** @member {Array.<SysMLProperty>} */
    this.references = []

    /** @member {Array.<SysMLProperty>} */
    this.properties = []

    /** @member {Array.<SysMLFlowProperty>} */
    this.flowProperties = []

    // mixin SysMLElementMixin
    _.extend(SysMLBlock.prototype, SysMLElementMixin)
  }

  getStereotypeString () {
    return super.getStereotypeString() || '«block»'
  }

  getPropertyString () {
    var props = []
    if (this.isLeaf === true) { props.push('leaf') }
    if (this.isEncapsulated === true) { props.push('isEncapsulated') }
    props = _.union(props, this.getTagStringArray())
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }

  getFlowType () {
    let hasIn = false
    let hasOut = false
    this.flowProperties.forEach(fp => {
      if (fp.direction === SysMLFlowProperty.FD_IN) hasIn = true
      if (fp.direction === SysMLFlowProperty.FD_OUT) hasOut = true
      if (fp.direction === SysMLFlowProperty.FD_INOUT) {
        hasIn = true
        hasOut = true
      }
    })
    if (hasIn && hasOut) {
      return SysMLFlowProperty.FD_INOUT
    } else if (hasIn) {
      return SysMLFlowProperty.FD_IN
    } else if (hasOut) {
      return SysMLFlowProperty.FD_OUT
    } else {
      return null
    }
  }
}

/**
 * SysMLValueType
 */
class SysMLValueType extends type.UMLDataType {
  constructor () {
    super()

    /** @member {UMLInstance} */
    this.unit = null

    /** @member {UMLInstance} */
    this.quantityKind = null

    // mixin SysMLElementMixin
    _.extend(SysMLValueType.prototype, SysMLElementMixin)
  }

  getStereotypeString () {
    return super.getStereotypeString() || '«valueType»'
  }

  getPropertyValues () {
    const values = {}
    if (this.unit) values.unit = this.unit.name
    if (this.quantityKind) values.quantityKind = this.quantityKind.name
    return values
  }
}

/**
 * SysMLInterfaceBlock
 */
class SysMLInterfaceBlock extends SysMLBlock {
  getStereotypeString () {
    return '«interfaceBlock»'
  }
}

/**************************************************************************
 *                                                                        *
 *                                   PORT                                 *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLPort
 */
class SysMLPort extends type.UMLPort {
  constructor () {
    super()
    // mixin SysMLElementMixin
    _.extend(SysMLPort.prototype, SysMLElementMixin)
  }
}

/**
 * SysMLConnector
 */
class SysMLConnector extends type.UMLConnector {
  constructor () {
    super()
    // mixin SysMLElementMixin
    _.extend(SysMLConnector.prototype, SysMLElementMixin)
  }

  /**
   * Return item flows
   */
  getItemFlows (direction) {
    if (direction === 'end1') {
      return this.ownedElements.filter(e => (e instanceof type.SysMLItemFlow && e.target === this.end1.reference.type))
    } else if (direction === 'end2') {
      return this.ownedElements.filter(e => (e instanceof type.SysMLItemFlow && e.target === this.end2.reference.type))
    } else {
      return this.ownedElements.filter(e => e instanceof type.SysMLItemFlow)
    }
  }
}

/**
 * SysMLItemFlow
 */
class SysMLItemFlow extends type.UMLInformationFlow {
  constructor () {
    super()

    /** @member {SysMLProperty} */
    this.itemProperty = null

    // mixin SysMLElementMixin
    _.extend(SysMLItemFlow.prototype, SysMLElementMixin)
  }
}

/**************************************************************************
 *                                                                        *
 *                            CONSTRAINT BLOCK                            *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLConstraintBlock
 */
class SysMLConstraintBlock extends SysMLBlock {
  constructor () {
    super()

    /** @member {Array.<SysMLProperty>} */
    this.parameters = []
  }

  getStereotypeString () {
    return '«constraint»'
  }
}

/**************************************************************************
 *                                                                        *
 *                               COMMON VIEWS                             *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLPropertyValueCompartmentItemView
 */
class SysMLPropertyValueCompartmentItemView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT

    /** @member {String} */
    this.property = null

    /** @member {String} */
    this.value = null
  }

  update (canvas) {
    var options = {
      showVisibility: true,
      stereotypeDisplay: type.UMLGeneralNodeView.SD_LABEL,
      showProperty: true,
      showType: true
    }
    if (this._parent && this._parent._parent) {
      options.showVisibility = this._parent._parent.showVisibility
      options.stereotypeDisplay = this._parent._parent.stereotypeDisplay
      options.showProperty = this._parent._parent.showProperty
      options.showType = this._parent._parent.showType
    }
    if (this.model) {
      this.text = `${this.property} = ${this.value || '<none>'}`
    }
    super.update(canvas)
  }

  size (canvas) {
    super.size(canvas)
    this.height = this.minHeight
  }

  canHide () {
    return true
  }
}

 /**
  * SysMLPropertyValueCompartmentView
  */
class SysMLPropertyValueCompartmentView extends type.UMLListCompartmentView {
  constructor () {
    super()
    this._label = null
  }

  getCompartmentName () {
    return this._label
  }

  update (canvas) {
    let props = this.model.getPropertyValues()
    if (props) {
      var tempViews = this.subViews
      this.subViews = []
      for (let prop in props) {
        var propView = _.find(tempViews, function (v) { return v.property === prop })
        if (!propView) {
          propView = new SysMLPropertyValueCompartmentItemView()
          propView.model = this.model
          propView._parent = this
          propView.property = prop
          propView.value = props[prop]
          // propView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
          app.repository.bypassInsert(this, 'subViews', propView)
        } else {
          propView.property = prop
          propView.value = props[prop]
          this.addSubView(propView)
        }
        propView.setup(canvas)
      }
    }
    super.update(canvas)
  }
}

/**
 * SysMLClassifierView
 */
class SysMLClassifierView extends type.UMLClassifierView {
  constructor () {
    super()
    this.containerChangeable = false

    /** @member {boolean} */
    this.suppressPropertyValues = false

    /** @member {SysMLPropertyValueCompartmentView} */
    this.propertyValueCompartment = new SysMLPropertyValueCompartmentView()
    this.propertyValueCompartment.selectable = View.SK_PROPAGATE
    this.propertyValueCompartment.parentStyle = true
    this.addSubView(this.propertyValueCompartment)

    this.suppressAttributes = true
    this.suppressOperations = true
    this.suppressReceptions = true
  }

  getAllCompartments () {
    return [
      this.nameCompartment,
      this.attributeCompartment,
      this.operationCompartment,
      this.receptionCompartment,
      this.propertyValueCompartment
    ]
  }

  update (canvas) {
    // fieldCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.propertyValueCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.propertyValueCompartment, 'model', this.model)
    }
    this.propertyValueCompartment.visible = !this.suppressPropertyValues
    super.update(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.propertyValueCompartment.visible) {
      canvas.line(
        this.propertyValueCompartment.left,
        this.propertyValueCompartment.top,
        this.propertyValueCompartment.getRight(),
        this.propertyValueCompartment.top)
    }
  }
}

/**************************************************************************
 *                                                                        *
 *                              GENERAL VIEWS                             *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLStakeholderView
 */
class SysMLStakeholderView extends SysMLClassifierView {
  getStereotypeLabelText () {
    return super.getStereotypeLabelText() || '«stakeholder»'
  }
}

/**
 * SysMLViewView
 */
class SysMLViewView extends SysMLClassifierView {
  getStereotypeLabelText () {
    return super.getStereotypeLabelText() || '«view»'
  }
}

/**
 * SysMLViewpointView
 */
class SysMLViewpointView extends SysMLClassifierView {
  getStereotypeLabelText () {
    return super.getStereotypeLabelText() || '«viewpoint»'
  }
}

/**
 * SysMLConformView
 */
class SysMLConformView extends type.UMLGeneralizationView {
  update (canvas) {
    super.update(canvas)
    this.stereotypeLabel.visible = true
    this.stereotypeLabel.text = this.model.getStereotypeString()
  }
}

/**
 * SysMLExposeView
 */
class SysMLExposeView extends type.UMLDependencyView {
  update (canvas) {
    super.update(canvas)
    this.stereotypeLabel.visible = true
    this.stereotypeLabel.text = this.model.getStereotypeString()
  }
}

/**************************************************************************
 *                                                                        *
 *                        REQUIREMENT DIAGRAM VIEWS                       *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLRequirementView
 */
class SysMLRequirementView extends SysMLClassifierView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('sysml.requirement.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getStereotypeLabelText () {
    return super.getStereotypeLabelText() || '«requirement»'
  }
}

/**
 * SysMLAbstractionView
 */
class SysMLAbstractionView extends type.UMLDependencyView {
  update (canvas) {
    super.update(canvas)
    this.stereotypeLabel.visible = true
    this.stereotypeLabel.text = this.model.getStereotypeString()
  }
}

/**
 * SysMLTraceView
 */
class SysMLTraceView extends SysMLAbstractionView {}

/**
 * SysMLCopyView
 */
class SysMLCopyView extends SysMLTraceView {}

/**
 * SysMLDeriveReqtView
 */
class SysMLDeriveReqtView extends SysMLTraceView {}

/**
 * SysMLVerifyView
 */
class SysMLVerifyView extends SysMLTraceView {}

/**
 * SysMLSatisfyView
 */
class SysMLSatisfyView extends SysMLTraceView {}

/**
 * SysMLRefineView
 */
class SysMLRefineView extends SysMLAbstractionView {}

/**************************************************************************
 *                                                                        *
 *                     BLOCK DEFINITION DIAGRAM VIEWS                     *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLConstraintCompartmentItemView
 */
class SysMLConstraintCompartmentItemView extends type.UMLAttributeView {}

/**
 * SysMLConstraintCompartmentView
 */
class SysMLConstraintCompartmentView extends type.UMLListCompartmentView {
  getCompartmentName () {
    return 'constraints'
  }

  getItems () {
    return this.model.constraints
  }

  createItem () {
    return new SysMLConstraintCompartmentItemView()
  }
}

/**
 * SysMLPartCompartmentItemView
 */
class SysMLPartCompartmentItemView extends type.UMLAttributeView {}

/**
 * SysMLPartCompartmentView
 */
class SysMLPartCompartmentView extends type.UMLListCompartmentView {
  getCompartmentName () {
    return 'parts'
  }

  getItems () {
    return this.model.parts
  }

  createItem () {
    return new SysMLPartCompartmentItemView()
  }
}

/**
 * SysMLPortCompartmentItemView
 */
class SysMLPortCompartmentItemView extends type.UMLAttributeView {}

/**
 * SysMLPortCompartmentView
 */
class SysMLPortCompartmentView extends type.UMLListCompartmentView {
  getCompartmentName () {
    return 'ports'
  }

  getItems () {
    return this.model.ports
  }

  createItem () {
    return new SysMLPortCompartmentItemView()
  }
}

/**
 * SysMLReferenceCompartmentItemView
 */
class SysMLReferenceCompartmentItemView extends type.UMLAttributeView {}

/**
 * SysMLReferenceCompartmentView
 */
class SysMLReferenceCompartmentView extends type.UMLListCompartmentView {
  getCompartmentName () {
    return 'references'
  }

  getItems () {
    return this.model.references
  }

  createItem () {
    return new SysMLReferenceCompartmentItemView()
  }
}

/**
 * SysMLValueCompartmentItemView
 */
class SysMLValueCompartmentItemView extends type.UMLAttributeView {}

/**
 * SysMLValueCompartmentView
 */
class SysMLValueCompartmentView extends type.UMLListCompartmentView {
  getCompartmentName () {
    return 'values'
  }

  getItems () {
    return this.model.values
  }

  createItem () {
    return new SysMLValueCompartmentItemView()
  }
}

/**
 * SysMLPropertyCompartmentItemView
 */
class SysMLPropertyCompartmentItemView extends type.UMLAttributeView {}

/**
 * SysMLPropertyCompartmentView
 */
class SysMLPropertyCompartmentView extends type.UMLListCompartmentView {
  getCompartmentName () {
    return 'properties'
  }

  getItems () {
    return this.model.properties
  }

  createItem () {
    return new SysMLPropertyCompartmentItemView()
  }
}

/**
 * SysMLFlowPropertyCompartmentItemView
 */
class SysMLFlowPropertyCompartmentItemView extends type.UMLAttributeView {}

/**
 * SysMLFlowPropertyCompartmentView
 */
class SysMLFlowPropertyCompartmentView extends type.UMLListCompartmentView {
  getCompartmentName () {
    return 'flow properties'
  }

  getItems () {
    return this.model.flowProperties
  }

  createItem () {
    return new SysMLFlowPropertyCompartmentItemView()
  }
}

/**
 * SysMLBlockView
 */
class SysMLBlockView extends type.UMLClassifierView {

  constructor () {
    super()

    /** @member {boolean} */
    this.suppressConstraints = app.preferences.get('sysml.block.suppressConstraints', true)

    /** @member {boolean} */
    this.suppressParts = app.preferences.get('sysml.block.suppressParts', true)

    /** @member {boolean} */
    this.suppressPorts = app.preferences.get('sysml.block.suppressPorts', true)

    /** @member {boolean} */
    this.suppressReferences = app.preferences.get('sysml.block.suppressReferences', true)

    /** @member {boolean} */
    this.suppressValues = app.preferences.get('sysml.block.suppressValues', true)

    /** @member {boolean} */
    this.suppressProperties = true

    /** @member {boolean} */
    this.suppressFlowProperties = app.preferences.get('sysml.block.suppressFlowProperties', true)

    /** @member {SysMLConstraintCompartmentView} */
    this.constraintCompartment = new SysMLConstraintCompartmentView()
    this.constraintCompartment.parentStyle = true
    this.constraintCompartment._showCompartmentName = true
    this.addSubView(this.constraintCompartment)

    /** @member {SysMLPartCompartmentView} */
    this.partCompartment = new SysMLPartCompartmentView()
    this.partCompartment.parentStyle = true
    this.partCompartment._showCompartmentName = true
    this.addSubView(this.partCompartment)

    /** @member {SysMLPortCompartmentView} */
    this.portCompartment = new SysMLPortCompartmentView()
    this.portCompartment.parentStyle = true
    this.portCompartment._showCompartmentName = true
    this.addSubView(this.portCompartment)

    /** @member {SysMLReferenceCompartmentView} */
    this.referenceCompartment = new SysMLReferenceCompartmentView()
    this.referenceCompartment.parentStyle = true
    this.referenceCompartment._showCompartmentName = true
    this.addSubView(this.referenceCompartment)

    /** @member {SysMLValueCompartmentView} */
    this.valueCompartment = new SysMLValueCompartmentView()
    this.valueCompartment.parentStyle = true
    this.valueCompartment._showCompartmentName = true
    this.addSubView(this.valueCompartment)

    /** @member {SysMLPropertyCompartmentView} */
    this.propertyCompartment = new SysMLPropertyCompartmentView()
    this.propertyCompartment.parentStyle = true
    this.propertyCompartment._showCompartmentName = true
    this.addSubView(this.propertyCompartment)

    /** @member {SysMLFlowPropertyCompartmentView} */
    this.flowPropertyCompartment = new SysMLFlowPropertyCompartmentView()
    this.flowPropertyCompartment.parentStyle = true
    this.flowPropertyCompartment._showCompartmentName = true
    this.addSubView(this.flowPropertyCompartment)

    this.stereotypeDisplay = type.UMLGeneralNodeView.SD_LABEL
    this.suppressOperations = true
    this.fillColor = app.preferences.get('sysml.block.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getAllCompartments () {
    return [
      this.nameCompartment,
      this.constraintCompartment,
      this.partCompartment,
      this.portCompartment,
      this.referenceCompartment,
      this.valueCompartment,
      this.propertyCompartment,
      this.flowPropertyCompartment,
      this.operationCompartment,
      this.receptionCompartment
    ]
  }

  getStereotypeLabelText () {
    return '«block»'
  }

  update (canvas) {
    // constraintCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.constraintCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.constraintCompartment, 'model', this.model)
    }
    // partCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.partCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.partCompartment, 'model', this.model)
    }
    // portCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.portCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.portCompartment, 'model', this.model)
    }
    // referenceCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.referenceCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.referenceCompartment, 'model', this.model)
    }
    // valueCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.valueCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.valueCompartment, 'model', this.model)
    }
    // propertyCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.propertyCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.propertyCompartment, 'model', this.model)
    }
    // flowPropertyCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.flowPropertyCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.flowPropertyCompartment, 'model', this.model)
    }

    this.constraintCompartment.visible = !this.suppressConstraints
    this.partCompartment.visible = !this.suppressParts
    this.portCompartment.visible = !this.suppressPorts
    this.referenceCompartment.visible = !this.suppressReferences
    this.valueCompartment.visible = !this.suppressValues
    this.propertyCompartment.visible = !this.suppressProperties
    this.flowPropertyCompartment.visible = !this.suppressFlowProperties

    this.constraintCompartment._showCompartmentName = true
    this.partCompartment._showCompartmentName = true
    this.portCompartment._showCompartmentName = true
    this.referenceCompartment._showCompartmentName = true
    this.valueCompartment._showCompartmentName = true
    this.propertyCompartment._showCompartmentName = true
    this.flowPropertyCompartment._showCompartmentName = true

    this.operationCompartment._showCompartmentName = true
    this.receptionCompartment._showCompartmentName = true

    super.update(canvas)

    this.attributeCompartment.visible = false
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.constraintCompartment.visible) {
      canvas.line(
        this.constraintCompartment.left,
        this.constraintCompartment.top,
        this.constraintCompartment.getRight(),
        this.constraintCompartment.top)
    }
    if (this.partCompartment.visible) {
      canvas.line(
        this.partCompartment.left,
        this.partCompartment.top,
        this.partCompartment.getRight(),
        this.partCompartment.top)
    }
    if (this.portCompartment.visible) {
      canvas.line(
        this.portCompartment.left,
        this.portCompartment.top,
        this.portCompartment.getRight(),
        this.portCompartment.top)
    }
    if (this.referenceCompartment.visible) {
      canvas.line(
        this.referenceCompartment.left,
        this.referenceCompartment.top,
        this.referenceCompartment.getRight(),
        this.referenceCompartment.top)
    }
    if (this.valueCompartment.visible) {
      canvas.line(
        this.valueCompartment.left,
        this.valueCompartment.top,
        this.valueCompartment.getRight(),
        this.valueCompartment.top)
    }
    if (this.propertyCompartment.visible) {
      canvas.line(
        this.propertyCompartment.left,
        this.propertyCompartment.top,
        this.propertyCompartment.getRight(),
        this.propertyCompartment.top)
    }
    if (this.flowPropertyCompartment.visible) {
      canvas.line(
        this.flowPropertyCompartment.left,
        this.flowPropertyCompartment.top,
        this.flowPropertyCompartment.getRight(),
        this.flowPropertyCompartment.top)
    }
  }
}

/**
 * SysMLValueTypeView
 */
class SysMLValueTypeView extends SysMLClassifierView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('sysml.value-type.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getStereotypeLabelText () {
    return '«valueType»'
  }
}

/**
 * SysMLInterfaceBlockView
 */
class SysMLInterfaceBlockView extends SysMLBlockView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('sysml.interface-block.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getStereotypeLabelText () {
    return '«interfaceBlock»'
  }
}

/**
 * SysMLParameterCompartmentItemView
 */
class SysMLParameterCompartmentItemView extends type.UMLAttributeView {}

/**
 * SysMLParameterCompartmentView
 */
class SysMLParameterCompartmentView extends type.UMLListCompartmentView {
  getCompartmentName () {
    return 'parameters'
  }

  getItems () {
    return this.model.parameters
  }

  createItem () {
    return new SysMLParameterCompartmentItemView()
  }
}

/**
 * SysMLConstraintBlockView
 */
class SysMLConstraintBlockView extends type.UMLClassifierView {

  constructor () {
    super()

    /** @member {boolean} */
    this.suppressConstraints = app.preferences.get('sysml.block.suppressConstraints', true)

    /** @member {boolean} */
    this.suppressProperties = true

    /** @member {SysMLConstraintCompartmentView} */
    this.constraintCompartment = new SysMLConstraintCompartmentView()
    this.constraintCompartment.parentStyle = true
    this.constraintCompartment._showCompartmentName = true
    this.addSubView(this.constraintCompartment)

    /** @member {SysMLParameterCompartmentView} */
    this.parameterCompartment = new SysMLParameterCompartmentView()
    this.parameterCompartment.parentStyle = true
    this.parameterCompartment._showCompartmentName = true
    this.addSubView(this.parameterCompartment)

    this.stereotypeDisplay = type.UMLGeneralNodeView.SD_LABEL
    this.suppressOperations = true
    this.fillColor = app.preferences.get('sysml.constraint-block.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getAllCompartments () {
    return [
      this.nameCompartment,
      this.constraintCompartment,
      this.parameterCompartment
    ]
  }

  getStereotypeLabelText () {
    return '«constraint»'
  }

  update (canvas) {
    // constraintCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.constraintCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.constraintCompartment, 'model', this.model)
    }
    // parameterCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.parameterCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.parameterCompartment, 'model', this.model)
    }
    this.constraintCompartment.visible = !this.suppressConstraints
    this.parameterCompartment.visible = !this.suppressProperties
    this.constraintCompartment._showCompartmentName = true
    this.parameterCompartment._showCompartmentName = true
    super.update(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.constraintCompartment.visible) {
      canvas.line(
        this.constraintCompartment.left,
        this.constraintCompartment.top,
        this.constraintCompartment.getRight(),
        this.constraintCompartment.top)
    }
    if (this.parameterCompartment.visible) {
      canvas.line(
        this.parameterCompartment.left,
        this.parameterCompartment.top,
        this.parameterCompartment.getRight(),
        this.parameterCompartment.top)
    }
  }
}

/**************************************************************************
 *                                                                        *
 *                      INTERNAL BLOCK DIAGRAM VIEWS                      *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLPartView
 */
class SysMLPartView extends type.UMLPartView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('sysml.part.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  sizeAsCanonicalForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = sz.x + 20
    this.minHeight = sz.y + 20
  }

  arrangeAsCanonicalForm (canvas) {
    this.mainRect.setRect(this.left + 10, this.top + 10, this.getRight() - 10, this.getBottom() - 10)
    this.arrangeAllCompartments(this.mainRect, canvas)
  }
}

/**
 * SysMLPortView
 */
class SysMLPortView extends type.UMLPortView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('sysml.port.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getPosition (canvas) {
    var r = this.containerView.getBoundingBox(canvas)
    var c = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
    var p = this._junction2(r, c)
    if (Math.abs(p.x - this.containerView.left) < 2) return 'left'
    if (Math.abs(p.x - this.containerView.right) < 2) return 'right'
    if (Math.abs(p.y - this.containerView.top) < 2) return 'top'
    if (Math.abs(p.y - this.containerView.bottom) < 2) return 'bottom'
    return 'else'
  }

  drawArrow (canvas, direction, headOnly = false) {
    var MARGIN = 2
    var rect = this.getBoundingBox(canvas)
    var c = Coord.getCenter(rect)
    var t = new Point(c.x, rect.y1 + MARGIN)
    var b = new Point(c.x, rect.y2 - MARGIN)
    var l = new Point(rect.x1 + MARGIN, c.y)
    var r = new Point(rect.x2 - MARGIN, c.y)
    switch (direction) {
    case 'up':
      if (!headOnly) canvas.line(b.x, b.y, t.x, t.y)
      canvas.line(t.x, t.y, t.x - 3, t.y + 3)
      canvas.line(t.x, t.y, t.x + 3, t.y + 3)
      break
    case 'down':
      if (!headOnly) canvas.line(b.x, b.y, t.x, t.y)
      canvas.line(b.x, b.y, b.x - 3, b.y - 3)
      canvas.line(b.x, b.y, b.x + 3, b.y - 3)
      break
    case 'left':
      if (!headOnly) canvas.line(l.x, l.y, r.x, r.y)
      canvas.line(l.x, l.y, l.x + 3, l.y - 3)
      canvas.line(l.x, l.y, l.x + 3, l.y + 3)
      break
    case 'right':
      if (!headOnly) canvas.line(l.x, l.y, r.x, r.y)
      canvas.line(r.x, r.y, r.x - 3, r.y - 3)
      canvas.line(r.x, r.y, r.x - 3, r.y + 3)
      break
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    const pos = this.getPosition(canvas)
    if (this.model.type instanceof SysMLBlock) {
      const flow = this.model.type.getFlowType()
      if (flow) {
        switch (flow) {
        case SysMLFlowProperty.FD_IN:
          switch (pos) {
          case 'left':
            this.drawArrow(canvas, 'right')
            break
          case 'right':
            this.drawArrow(canvas, 'left')
            break
          case 'top':
            this.drawArrow(canvas, 'down')
            break
          case 'bottom':
            this.drawArrow(canvas, 'up')
            break
          }
          break
        case SysMLFlowProperty.FD_OUT:
          switch (pos) {
          case 'left':
            this.drawArrow(canvas, 'left')
            break
          case 'right':
            this.drawArrow(canvas, 'right')
            break
          case 'top':
            this.drawArrow(canvas, 'up')
            break
          case 'bottom':
            this.drawArrow(canvas, 'down')
            break
          }
          break
        case SysMLFlowProperty.FD_INOUT:
          switch (pos) {
          case 'left':
            this.drawArrow(canvas, 'left')
            this.drawArrow(canvas, 'right', true)
            break
          case 'right':
            this.drawArrow(canvas, 'right')
            this.drawArrow(canvas, 'left', true)
            break
          case 'top':
            this.drawArrow(canvas, 'up')
            this.drawArrow(canvas, 'down', true)
            break
          case 'bottom':
            this.drawArrow(canvas, 'down')
            this.drawArrow(canvas, 'up', true)
            break
          }
          break
        }
      }
    }
  }
}

/**
 * SysMLConnectorView
 */
class SysMLConnectorView extends type.UMLConnectorView {
  constructor () {
    super()

    /** @member {EdgeLabelView} */
    this.itemFlowToHeadLabel = new type.EdgeLabelView()
    this.itemFlowToHeadLabel.hostEdge = this
    this.itemFlowToHeadLabel.edgePosition = type.EdgeParasiticView.EP_MIDDLE
    this.itemFlowToHeadLabel.distance = 15
    this.itemFlowToHeadLabel.alpha = Math.PI / 2
    this.addSubView(this.itemFlowToHeadLabel)

    /** @member {EdgeLabelView} */
    this.itemFlowToTailLabel = new type.EdgeLabelView()
    this.itemFlowToTailLabel.hostEdge = this
    this.itemFlowToTailLabel.edgePosition = type.EdgeParasiticView.EP_MIDDLE
    this.itemFlowToTailLabel.distance = 15
    this.itemFlowToTailLabel.alpha = -(Math.PI / 2)
    this.addSubView(this.itemFlowToTailLabel)
  }

  update (canvas) {
    if (this.model) {
      const itemFlowsToHead = this.model.getItemFlows('end2')
      if (itemFlowsToHead.length > 0) {
        this.itemFlowToHeadLabel.visible = true
        const headLabels = []
        itemFlowsToHead.forEach(i => {
          var text = null
          if (i.itemProperty) {
            text = i.itemProperty.textualNotation
          } else {
            text = i.getConveyedString()
          }
          if (text) headLabels.push(text)
        })
        if (headLabels.length > 0) {
          this.itemFlowToHeadLabel.text = headLabels.join(', ')
        }
      } else {
        this.itemFlowToHeadLabel.visible = false
      }
      const itemFlowsToTail = this.model.getItemFlows('end1')
      if (itemFlowsToTail.length > 0) {
        this.itemFlowToTailLabel.visible = true
        const tailLabels = []
        itemFlowsToTail.forEach(i => {
          var text = null
          if (i.itemProperty) {
            text = i.itemProperty.textualNotation
          } else {
            text = i.getConveyedString()
          }
          if (text) tailLabels.push(text)
        })
        if (tailLabels.length > 0) {
          this.itemFlowToTailLabel.text = tailLabels.join(', ')
        }
      } else {
        this.itemFlowToTailLabel.visible = false
      }

      // itemFlowToHeadLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.itemFlowToHeadLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.itemFlowToHeadLabel, 'model', this.model)
      }
      // itemFlowToTailLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.itemFlowToTailLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.itemFlowToTailLabel, 'model', this.model)
      }
    }
    super.update(canvas)
  }

  drawFlow (canvas, ptc, pt1, pt2, toHead) {
    var rt = new Rect(0, 0, 0, 0)
    if (toHead) {
      rt.setRect(ptc.x, ptc.y, pt1.x, pt1.y)
    } else {
      rt.setRect(ptc.x, ptc.y, pt2.x, pt2.y)
    }
    var a = rt.y2 - rt.y1
    var b = rt.x2 - rt.x1
    var c1 = 11.0
    var th = Math.atan(a / b)
    if ((a < 0 && b < 0) || (a > 0 && b < 0) || (a === 0 && b < 0)) {
      th = th + Math.PI
    }
    var th1 = th - Math.PI / 8
    var th2 = th + Math.PI / 8
    var p0 = new Point(rt.x1, rt.y1)
    var p1 = new Point((c1 * Math.cos(th1)) + rt.x1, (c1 * Math.sin(th1)) + rt.y1)
    var p2 = new Point((c1 * Math.cos(th2)) + rt.x1, (c1 * Math.sin(th2)) + rt.y1)
    canvas.fillColor = this.lineColor
    canvas.fillPolygon([p1, p0, p2])
    canvas.polygon([p1, p0, p2])
  }

  /**
   * Get a closest line segment from a point
   */
  getClosestSegment (p) {
    var idx = 0
    var pt = Coord.projectPointOnLine(p, this.points.points[idx], this.points.points[idx + 1])
    var dist = Coord.distance(p, pt)
    if (this.points.count() > 2) {
      for (let i = 1; i < this.points.count() - 1; i++) {
        const pp = Coord.projectPointOnLine(p, this.points.points[i], this.points.points[i + 1])
        const d = Coord.distance(p, pp)
        if (d < dist) {
          idx = i
          pt = pp
          dist = d
        }
      }
    }
    return {idx, pt, dist}
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillColor = this.lineColor
    if (this.itemFlowToHeadLabel.visible) {
      const cp = this.itemFlowToHeadLabel.getCenter()
      const seg = this.getClosestSegment(cp)
      this.drawFlow(canvas, seg.pt, this.points.points[seg.idx], this.points.points[seg.idx + 1], true)
    }
    if (this.itemFlowToTailLabel.visible) {
      const cp = this.itemFlowToTailLabel.getCenter()
      const seg = this.getClosestSegment(cp)
      this.drawFlow(canvas, seg.pt, this.points.points[seg.idx], this.points.points[seg.idx + 1], false)
    }
  }
}

/**************************************************************************
 *                                                                        *
 *                        PARAMETRIC DIAGRAM VIEWS                        *
 *                                                                        *
 **************************************************************************/

/**
 * SysMLConstraintPropertyView
 */
class SysMLConstraintPropertyView extends type.UMLPartView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('sysml.constraint-property.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  drawObject (canvas) {
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), 8)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), 8)
  }

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'SysMLConstraintParameterView')
  }

  sizeAsCanonicalForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = sz.x + 20
    this.minHeight = sz.y + 20
  }

  arrangeAsCanonicalForm (canvas) {
    this.mainRect.setRect(this.left + 10, this.top + 10, this.getRight() - 10, this.getBottom() - 10)
    this.arrangeAllCompartments(this.mainRect, canvas)
  }
}

/**
 * SysMLConstraintParameterView
 */
class SysMLConstraintParameterView extends type.UMLFloatingNodeView {
  constructor () {
    super()
    this.sizable = NodeView.SZ_NONE

    /** @member {boolean} */
    this.showVisibility = false

    /** @member {boolean} */
    this.showType = true

    /** @member {boolean} */
    this.showMultiplicity = true

    this.fillColor = app.preferences.get('sysml.constraint-parameter.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    super.update(canvas)
    var options = {
      showVisibility: this.showVisibility,
      showType: this.showType,
      showMultiplicity: this.showMultiplicity,
      showProperty: false
    }
    this.nameLabel.text = this.model.getString(options)
    this.nameLabel.underline = (this.model.isStatic === true)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = CONSTRAINT_PARAMETER_MINWIDTH
    this.minHeight = CONSTRAINT_PARAMETER_MINHEIGHT
  }

  arrange (canvas) {
    if (this.containerView) {
      var r = this.containerView.getBoundingBox(canvas)
      var box = new Rect(this.left, this.top, this.getRight(), this.getBottom())
      var c = Coord.getCenter(box)
      var td = Math.abs(r.y1 - c.y)
      var bd = Math.abs(r.y2 - c.y)
      var ld = Math.abs(r.x1 - c.x)
      var rd = Math.abs(r.x2 - c.x)
      if (td < bd && td < ld && td < rd) {
        this.top = r.y1
      } else if (bd < td && bd < ld && bd < rd) {
        this.top = r.y2 - CONSTRAINT_PARAMETER_MINHEIGHT + 1
      } else if (ld < td && ld < bd && ld < rd) {
        this.left = r.x1
      } else {
        this.left = r.x2 - CONSTRAINT_PARAMETER_MINWIDTH + 1
      }
      if (this.left < r.x1) this.left = r.x1
      if (this.right > r.x2) this.left = r.x2 - CONSTRAINT_PARAMETER_MINWIDTH + 1
      if (this.top < r.y1) this.top = r.y1
      if (this.bottom > r.y2) this.top = r.y2 - CONSTRAINT_PARAMETER_MINHEIGHT + 1
      this.width = this.minWidth
      this.height = this.minHeight
    }
    super.arrange(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
  }
}

/* ************************** Type definitions ****************************/

// Diagrams
type.SysMLDiagram = SysMLDiagram
type.SysMLRequirementDiagram = SysMLRequirementDiagram
type.SysMLBlockDefinitionDiagram = SysMLBlockDefinitionDiagram
type.SysMLInternalBlockDiagram = SysMLInternalBlockDiagram
type.SysMLParametricDiagram = SysMLParametricDiagram
// General
type.SysMLStakeholder = SysMLStakeholder
type.SysMLView = SysMLView
type.SysMLViewpoint = SysMLViewpoint
type.SysMLConform = SysMLConform
type.SysMLExpose = SysMLExpose
// Requirements
type.SysMLAbstractRequirement = SysMLAbstractRequirement
type.SysMLRequirement = SysMLRequirement
type.SysMLTrace = SysMLTrace
type.SysMLCopy = SysMLCopy
type.SysMLDeriveReqt = SysMLDeriveReqt
type.SysMLVerify = SysMLVerify
type.SysMLSatisfy = SysMLSatisfy
type.SysMLRefine = SysMLRefine
// Blocks
type.SysMLProperty = SysMLProperty
type.SysMLFlowProperty = SysMLFlowProperty
type.SysMLBlock = SysMLBlock
type.SysMLValueType = SysMLValueType
type.SysMLInterfaceBlock = SysMLInterfaceBlock
// Ports
type.SysMLPort = SysMLPort
type.SysMLConnector = SysMLConnector
type.SysMLItemFlow = SysMLItemFlow
// Constraint Block
type.SysMLConstraintBlock = SysMLConstraintBlock
// Common Views
type.SysMLPropertyValueCompartmentItemView = SysMLPropertyValueCompartmentItemView
type.SysMLPropertyValueCompartmentView = SysMLPropertyValueCompartmentView
type.SysMLClassifierView = SysMLClassifierView
// General Views
type.SysMLStakeholderView = SysMLStakeholderView
type.SysMLViewView = SysMLViewView
type.SysMLViewpointView = SysMLViewpointView
type.SysMLConformView = SysMLConformView
type.SysMLExposeView = SysMLExposeView
// Requirement Diagram Views
type.SysMLRequirementView = SysMLRequirementView
type.SysMLAbstractionView = SysMLAbstractionView
type.SysMLTraceView = SysMLTraceView
type.SysMLCopyView = SysMLCopyView
type.SysMLDeriveReqtView = SysMLDeriveReqtView
type.SysMLVerifyView = SysMLVerifyView
type.SysMLSatisfyView = SysMLSatisfyView
type.SysMLRefineView = SysMLRefineView
// Block Definition Diagram Views
type.SysMLConstraintCompartmentItemView = SysMLConstraintCompartmentItemView
type.SysMLConstraintCompartmentView = SysMLConstraintCompartmentView
type.SysMLPartCompartmentItemView = SysMLPartCompartmentItemView
type.SysMLPartCompartmentView = SysMLPartCompartmentView
type.SysMLPortCompartmentItemView = SysMLPortCompartmentItemView
type.SysMLPortCompartmentView = SysMLPortCompartmentView
type.SysMLReferenceCompartmentItemView = SysMLReferenceCompartmentItemView
type.SysMLReferenceCompartmentView = SysMLReferenceCompartmentView
type.SysMLValueCompartmentItemView = SysMLValueCompartmentItemView
type.SysMLValueCompartmentView = SysMLValueCompartmentView
type.SysMLPropertyCompartmentItemView = SysMLPropertyCompartmentItemView
type.SysMLPropertyCompartmentView = SysMLPropertyCompartmentView
type.SysMLFlowPropertyCompartmentItemView = SysMLFlowPropertyCompartmentItemView
type.SysMLFlowPropertyCompartmentView = SysMLFlowPropertyCompartmentView
type.SysMLBlockView = SysMLBlockView
type.SysMLValueTypeView = SysMLValueTypeView
type.SysMLInterfaceBlockView = SysMLInterfaceBlockView
type.SysMLParameterCompartmentItemView = SysMLParameterCompartmentItemView
type.SysMLParameterCompartmentView = SysMLParameterCompartmentView
type.SysMLConstraintBlockView = SysMLConstraintBlockView
// Internal Block Diagram Views
type.SysMLPartView = SysMLPartView
type.SysMLPortView = SysMLPortView
type.SysMLConnectorView = SysMLConnectorView
// Parametric Diagram Views
type.SysMLConstraintPropertyView = SysMLConstraintPropertyView
type.SysMLConstraintParameterView = SysMLConstraintParameterView
