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
  Font,
  EdgeView,
  EdgeParasiticView,
  UMLAttribute,
  UMLBehavioralFeature,
  UMLParameter,
  UMLModelElement,
  UMLPseudostate,
  UMLCombinedFragment,
  UMLMessage,
  UMLEvent,
  UMLAction,
  UMLGeneralNodeView
} = app.type

const _ = require('lodash')
const Reader = require('./reader')
const objectReaders = require('./reader').objectReaders
const enumerations = require('./reader').enumerations
const postprocessors = require('./reader').postprocessors
const readAttr = require('./reader').readAttr
const readEnum = require('./reader').readEnum
const readRef = require('./reader').readRef
const readObj = require('./reader').readObj
const readObjArray = require('./reader').readObjArray
const readRefArray = require('./reader').readRefArray
const readColor = require('./reader').readColor

function addTo (obj, json, field, elem) {
  var guid = obj.getAttribute('guid')
  if (json[field] && elem) {
    elem._parent = { '$ref': guid }
    json[field].push(elem)
  }
}

function appendTo (obj, json, field, elements) {
  var guid = obj.getAttribute('guid')
  if (json[field] && elements.length > 0) {
    for (var i = 0, len = elements.length; i < len; i++) {
      var elem = elements[i]
      elem._parent = { '$ref': guid }
      json[field].push(elem)
    }
  }
}

function addSubView (obj, childName, json, field, defaultValue) {
  var guid = obj.getAttribute('guid')
  var subView = readObj(obj, childName)
  if (!subView && defaultValue) {
    subView = defaultValue
  }
  if (json['subViews'] && subView && subView._id) {
    json[field] = { '$ref': subView._id }
    subView._parent = { '$ref': guid }
    json['subViews'].push(subView)
  }
  return subView
}

function addTag (obj, json, name, value) {
  if (typeof value !== 'undefined' && value !== null) {
    var guid = obj.getAttribute('guid')
    var tag = {
      _id: app.repository.generateGuid(),
      _type: 'Tag',
      _parent: { '$ref': guid },
      name: name,
      value: value
    }
    json['tags'].push(tag)
    return tag
  }
}

function getDiagram (elem) {
  if (elem && elem._type) {
    if (app.metamodels.isKindOf(elem._type, 'Diagram')) {
      return elem
    } else if (elem._parent && elem._parent['$ref']) {
      return getDiagram(Reader.get(elem._parent['$ref']))
    }
  }
  return null
}

function newLabelView () {
  return {
    _id: app.repository.generateGuid(),
    _type: 'LabelView'
  }
}

function newEdgeLabelView () {
  return {
    _id: app.repository.generateGuid(),
    _type: 'EdgeLabelView',
    parentStyle: true
  }
}

/**************************************************************************
*                                                                        *
*                               CORE ELEMENTS                            *
*                                                                        *
**************************************************************************/

objectReaders['Element'] = function (obj) {
  var json = { tags: [], ownedElements: [] }
  addTag(obj, json, '_tag', readAttr(obj, 'Tag'))
  return json
}

objectReaders['Model'] = function (obj) {
  // var guid = obj.getAttribute('guid')
  var json = objectReaders['Element'](obj)
  json['name'] = readAttr(obj, 'Name', '')
  json['documentation'] = readAttr(obj, 'Documentation', '')
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'OwnedDiagrams'))
  var attachments = readAttr(obj, 'Attachments', '')
  if (attachments.length > 0) {
    addTag(obj, json, 'attachments', attachments)
  }
  return json
}

objectReaders['View'] = function (obj) {
  var json = objectReaders['Element'](obj)
  json['lineColor'] = readColor(obj, 'LineColor', '#000000')
  json['fillColor'] = readColor(obj, 'FillColor', '#FFFFFF')
  json['fontColor'] = readColor(obj, 'FontColor', '#000000')
  var fontFace = readAttr(obj, 'FontFace', 'Arial')
  var fontSize = readAttr(obj, 'FontSize', 8)
  fontSize = Math.round(fontSize / 0.75)
  var fontStyle = readAttr(obj, 'FontStyle', 0)
  var bold = ((fontStyle & 1) !== 0)
  var italic = ((fontStyle & 2) !== 0)
  // var underline = ((fontStyle & 4) !== 0)
  fontStyle = Font.FS_NORMAL
  if (bold & !italic) { fontStyle = Font.FS_BOLD }
  if (!bold & italic) { fontStyle = Font.FS_ITALIC }
  if (bold & italic) { fontStyle = Font.FS_BOLD_ITALIC }
  json['font'] = fontFace + ';' + fontSize + ';' + fontStyle
  json['visible'] = readAttr(obj, 'Visible', true)
  json['model'] = readRef(obj, 'Model')
  json['subViews'] = [] // SubViews
  json['containedViews'] = readObjArray(obj, 'ContainedViews')
  json['containerView'] = readRef(obj, 'ContainerView')
  return json
}

objectReaders['Diagram'] = function (obj) {
  var json = objectReaders['Model'](obj)
  json['defaultDiagram'] = readAttr(obj, 'DefaultDiagram', false)
  var diagramView = readObj(obj, 'DiagramView')
  json['ownedViews'] = []
  if (diagramView && diagramView.ownedViews) {
    for (var i = 0, len = diagramView.ownedViews.length; i < len; i++) {
      var view = diagramView.ownedViews[i]
      addTo(obj, json, 'ownedViews', view)
    }
  }
  return json
}

objectReaders['DiagramView'] = function (obj) {
  var json = objectReaders['View'](obj)
  json['ownedViews'] = readObjArray(obj, 'OwnedViews')
  return json
}

objectReaders['ExtensibleModel'] = function (obj) {
  var json = objectReaders['Model'](obj)
  json['stereotype'] = readAttr(obj, 'StereotypeName')
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'Constraints'))
  var taggedValues = readObjArray(obj, 'TaggedValues')
  for (var i = 0, len = taggedValues.length; i < len; i++) {
    var tag = taggedValues[i]
    var name = tag.profileName + '.' + tag.tagDefinitionSetName + '.' + tag.name
    addTag(obj, json, name, tag.dataValue)
  }
  return json
}

objectReaders['Constraint'] = function (obj) {
  var json = objectReaders['Element'](obj)
  json['name'] = readAttr(obj, 'Name', '')
  json['specification'] = readAttr(obj, 'Body', '')
  json._type = 'UMLConstraint'
  return json
}

objectReaders['TaggedValue'] = function (obj) {
  var json = objectReaders['Element'](obj)
  json['profileName'] = readAttr(obj, 'ProfileName', '')
  json['tagDefinitionSetName'] = readAttr(obj, 'TagDefinitionSetName', '')
  json['name'] = readAttr(obj, 'Name', '')
  json['dataValue'] = readAttr(obj, 'DataValue', '')
  return json
}

/**************************************************************************
*                                                                        *
*                                 VIEW CORE                              *
*                                                                        *
**************************************************************************/

enumerations['LineStyleKind'] = {
  'lsRectilinear': EdgeView.LS_RECTILINEAR,
  'lsOblique': EdgeView.LS_OBLIQUE
}

enumerations['EdgePositionKind'] = {
  'epHead': EdgeParasiticView.EP_HEAD,
  'epMiddle': EdgeParasiticView.EP_MIDDLE,
  'epTail': EdgeParasiticView.EP_TAIL
}

// PSizableMode = (szNone, szHorz, szVert, szRatio, szFree);
// PMovableMode = (mmNone, mmHorz, mmVert, mmFree);
// PHorzAlignmentKind = (haLeft, haCenter, haRight);
// PVertAlignmentKind = (vaTop, vaMiddle, vaBottom);
// PLineMode = (lmSolid, lmDot);
// PEdgeEndStyle = (esFlat, esStickArrow, esSolidArrow, esTriangle, esFilledTriangle,
//   esDiamond, esFilledDiamond, esArrowDiamond, esArrowFilledDiamond);
//   PDirectionKind = (dkHorizontal, dkVertical);

objectReaders['NodeView'] = function (obj) {
  var json = objectReaders['View'](obj)
  json['left'] = readAttr(obj, 'Left', 0)
  json['top'] = readAttr(obj, 'Top', 0)
  json['width'] = readAttr(obj, 'Width', 0)
  json['height'] = readAttr(obj, 'Height', 0)
  json['autoResize'] = readAttr(obj, 'AutoResize', false)
  return json
}

objectReaders['EdgeView'] = function (obj) {
  var json = objectReaders['View'](obj)
  json['head'] = readRef(obj, 'Head', null)
  json['tail'] = readRef(obj, 'Tail', null)
  json['lineStyle'] = readEnum(obj, 'LineStyle', EdgeView.LS_OBLIQUE)
  json['points'] = readAttr(obj, 'Points', '')
  return json
}

objectReaders['LabelView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  json['text'] = readAttr(obj, 'Text', '')
  return json
}

objectReaders['ParasiticView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  json['alpha'] = readAttr(obj, 'Alpha', 0)
  json['distance'] = readAttr(obj, 'Distance', 0)
  return json
}

objectReaders['NodeParasiticView'] = function (obj) {
  var json = objectReaders['ParasiticView'](obj)
  json['hostNode'] = readRef(obj, 'HostNode')
  return json
}

objectReaders['EdgeParasiticView'] = function (obj) {
  var json = objectReaders['ParasiticView'](obj)
  json['hostEdge'] = readRef(obj, 'HostEdge')
  json['edgePosition'] = readEnum(obj, 'EdgePosition', EdgeParasiticView.EP_MIDDLE)
  return json
}

objectReaders['NodeNodeView'] = function (obj) {
  var json = objectReaders['NodeParasiticView'](obj)
  return json
}

objectReaders['NodeLabelView'] = function (obj) {
  var json = objectReaders['NodeParasiticView'](obj)
  return json
}

objectReaders['EdgeNodeView'] = function (obj) {
  var json = objectReaders['EdgeParasiticView'](obj)
  return json
}

objectReaders['EdgeLabelView'] = function (obj) {
  var json = objectReaders['EdgeParasiticView'](obj)
  return json
}

/**************************************************************************
*                                                                        *
*                        UML::FOUNDATION::DATA_TYPE                      *
*                                                                        *
**************************************************************************/

enumerations['UMLAggregationKind'] = {
  'akNone': UMLAttribute.AK_NONE,
  'akAggregate': UMLAttribute.AK_SHARED,
  'akComposite': UMLAttribute.AK_COMPOSITE
}

enumerations['UMLCallConcurrencyKind'] = {
  'cckSequential': UMLBehavioralFeature.CCK_SEQUENTIAL,
  'cckGuarded': UMLBehavioralFeature.CCK_GUARDED,
  'cckConcurrent': UMLBehavioralFeature.CCK_CONCURRENT
}

enumerations['UMLChangeableKind'] = {
  'ckChangeable': 0,
  'ckFrozen': 1,
  'ckAddOnly': 2
}

enumerations['UMLOrderingKind'] = {
  'okUnordered': 0,
  'okOrdered': 1
}

enumerations['UMLParameterDirectionKind'] = {
  'pdkIn': UMLParameter.DK_IN,
  'pdkInout': UMLParameter.DK_INOUT,
  'pdkOut': UMLParameter.DK_OUT,
  'pdkReturn': UMLParameter.DK_RETURN
}

enumerations['UMLScopeKind'] = {
  'skInstance': 0,
  'skClassifier': 1
}

enumerations['UMLVisibilityKind'] = {
  'vkPublic': UMLModelElement.VK_PUBLIC,
  'vkProtected': UMLModelElement.VK_PROTECTED,
  'vkPrivate': UMLModelElement.VK_PRIVATE,
  'vkPackage': UMLModelElement.VK_PACKAGE
}

enumerations['UMLPseudostateKind'] = {
  'pkChoice': UMLPseudostate.PSK_CHOICE,
  'pkDeepHistory': UMLPseudostate.PSK_DEEPHISTORY,
  'pkSynchronization': 0, // PSK_FORK or PSK_JOIN
  'pkInitial': UMLPseudostate.PSK_INITIAL,
  'pkJunction': UMLPseudostate.PSK_JUNCTION,
  'pkShallowHistory': UMLPseudostate.PSK_SHALLOWHISTORY,
  'pkDecision': 1  // ?
  // '?': UMLPseudostate.PSK_ENTRYPOINT
  // '?': UMLPseudostate.PSK_EXITPOINT
  // '?': UMLPseudostate.PSK_TERMINATE
}

enumerations['UMLInteractionOperatorKind'] = {
  'iokSeq': UMLCombinedFragment.IOK_SEQ,
  'iokAlt': UMLCombinedFragment.IOK_ALT,
  'iokOpt': UMLCombinedFragment.IOK_OPT,
  'iokBreak': UMLCombinedFragment.IOK_SEQ, // temporal
  'iokPar': UMLCombinedFragment.IOK_PAR,
  'iokStrict': UMLCombinedFragment.IOK_,
  'iokLoop': UMLCombinedFragment.IOK_LOOP,
  'iokRegion': UMLCombinedFragment.IOK_SEQ, // temporal
  'iokNeg': UMLCombinedFragment.IOK_NEG,
  'iokAssert': UMLCombinedFragment.IOK_ASSERT,
  'iokIgnore': UMLCombinedFragment.IOK_IGNORE,
  'iokConsider': UMLCombinedFragment.IOK_CONSIDER
  // '?': UMLCombinedFragment.IOK_CRITICAL
  // '?': UMLCombinedFragment.IOK_STRICT
}

enumerations['UMLMessageSignatureKind'] = {
  'mskNone': 0,
  'mskTypeOnly': 1,
  'mskNameOnly': 2,
  'mskNameAndType': 3
}

/**************************************************************************
*                                                                        *
*                          UML::FOUNDATION::CORE                         *
*                                                                        *
**************************************************************************/

objectReaders['UMLElement'] = function (obj) {
  var json = objectReaders['ExtensibleModel'](obj)
  return json
}

objectReaders['UMLModelElement'] = function (obj) {
  var json = objectReaders['UMLElement'](obj)
  json['visibility'] = readEnum(obj, 'Visibility', UMLModelElement.VK_PUBLIC)
  json['isSpecification'] = readAttr(obj, 'IsSpecification', false)
  json['_parent'] = readRef(obj, 'Namespace')
  json['templateParameters'] = readObjArray(obj, 'TemplateParameters')
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'Behaviors'))
  return json
}

objectReaders['UMLTemplateParameter'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['parameterType'] = readAttr(obj, 'ParameterType', '')
  json['DefaultValue'] = readAttr(obj, 'DefaultValue', '')
  return json
}

objectReaders['UMLFeature'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['isStatic'] = (readEnum(obj, 'OwnerScope') === 1)
  return json
}

objectReaders['UMLStructuralFeature'] = function (obj) {
  var json = objectReaders['UMLFeature'](obj)
  json['multiplicity'] = readAttr(obj, 'Multiplicity', '')
  json['isReadOnly'] = (readEnum(obj, 'Changeability') === 1)
  // no field corresponding to TargetScope
  json['isOrdered'] = (readEnum(obj, 'Ordering') === 1)
  var _typeExpression = readAttr(obj, 'TypeExpression', '')
  var _type = readRef(obj, 'Type_', null)
  if (_type && _type.$ref) {
    json['type'] = _type
  } else {
    json['type'] = _typeExpression
  }
  return json
}

objectReaders['UMLAttribute'] = function (obj) {
  var json = objectReaders['UMLStructuralFeature'](obj)
  json['defaultValue'] = readAttr(obj, 'InitialValue', '')
  return json
}

objectReaders['UMLParameter'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['defaultValue'] = readAttr(obj, 'DefaultValue', '')
  json['direction'] = readEnum(obj, 'DirectionKind', UMLParameter.DK_IN)
  var _typeExpression = readAttr(obj, 'TypeExpression', '')
  var _type = readRef(obj, 'Type_', null)
  if (_type && _type.$ref) {
    json['type'] = _type
  } else {
    json['type'] = _typeExpression
  }
  return json
}

objectReaders['UMLBehavioralFeature'] = function (obj) {
  var json = objectReaders['UMLFeature'](obj)
  json['isQuery'] = readAttr(obj, 'IsQuery', false)
  json['raisedExceptions'] = readRefArray(obj, 'RaisedSignals')
  return json
}

objectReaders['UMLOperation'] = function (obj) {
  var json = objectReaders['UMLBehavioralFeature'](obj)
  json['parameters'] = readObjArray(obj, 'Parameters')
  json['concurrency'] = readEnum(obj, 'Concurrency', UMLBehavioralFeature.CCK_SEQUENTIAL)
  // no field corresponding to IsRoot
  json['isLeaf'] = readAttr(obj, 'IsLeaf', false)
  json['isAbstract'] = readAttr(obj, 'IsAbstract', false)
  json['specification'] = readAttr(obj, 'Specification', '')
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'OwnedCollaborations'))
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'OwnedCollaborationInstanceSets'))
  return json
}

objectReaders['UMLGeneralizableElement'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['isRoot'] = readAttr(obj, 'IsRoot', false)
  json['isLeaf'] = readAttr(obj, 'IsLeaf', false)
  json['isAbstract'] = readAttr(obj, 'IsAbstract', false)
  return json
}

objectReaders['UMLNamespace'] = function (obj) {
  var json = objectReaders['UMLGeneralizableElement'](obj)
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'OwnedElements'))
  return json
}

objectReaders['UMLClassifier'] = function (obj) {
  var json = objectReaders['UMLNamespace'](obj)
  json['attributes'] = []
  json['operations'] = []
  appendTo(obj, json, 'attributes', readObjArray(obj, 'Attributes'))
  appendTo(obj, json, 'operations', readObjArray(obj, 'Operations'))
  appendTo(obj, json, 'attributes', readObjArray(obj, 'OwnedPorts'))
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'OwnedCollaborations'))
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'OwnedCollaborationInstanceSets'))
  return json
}

// Classifiers ------------------------------------------------------------

objectReaders['UMLClass'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  json['isActive'] = readAttr(obj, 'IsActive', false)
  return json
}

objectReaders['UMLInterface'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  return json
}

objectReaders['UMLDataType'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  return json
}

objectReaders['UMLPrimitive'] = function (obj) {
  var json = objectReaders['UMLDataType'](obj)
  return json
}

objectReaders['UMLEnumeration'] = function (obj) {
  var json = objectReaders['UMLDataType'](obj)
  json['literals'] = readObjArray(obj, 'Literals')
  return json
}

objectReaders['UMLEnumerationLiteral'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  return json
}

objectReaders['UMLSignal'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  return json
}

objectReaders['UMLException'] = function (obj) {
  var json = objectReaders['UMLSignal'](obj)
  json._type = 'UMLSignal'
  json.stereotype = 'exception'
  return json
}

objectReaders['UMLArtifact'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  return json
}

objectReaders['UMLComponent'] = function (obj) {
  var guid = obj.getAttribute('guid')
  var json = objectReaders['UMLClassifier'](obj)
  var residents = readRefArray(obj, 'Residents') // to ComponentRealizations
  if (residents && residents.length > 0) {
    for (var i = 0, len = residents.length; i < len; i++) {
      var resident = residents[i]
      var componentRealization = {
        _id: app.repository.generateGuid(),
        _type: 'UMLComponentRealization',
        source: resident,
        target: { '$ref': guid }
      }
      addTo(obj, json, 'ownedElements', componentRealization)
    }
  }
  // var impls     = readRefArray(obj, 'Implementations') // ?
  return json
}

objectReaders['UMLNode'] = function (obj) {
  var guid = obj.getAttribute('guid')
  var json = objectReaders['UMLClassifier'](obj)
  var i, len
  var deployment
  // deployedComponents
  var deployedComponents = readRefArray(obj, 'DeployedComponents') // to Deployments
  if (deployedComponents && deployedComponents.length > 0) {
    for (i = 0, len = deployedComponents.length; i < len; i++) {
      var component = deployedComponents[i]
      deployment = {
        _id: app.repository.generateGuid(),
        _type: 'UMLDeployment',
        source: component,
        target: { '$ref': guid }
      }
      addTo(obj, json, 'ownedElements', deployment)
    }
  }
  // deployedArtifacts
  var deployedArtifacts = readRefArray(obj, 'DeployedArtifacts') // to Deployments
  if (deployedArtifacts && deployedArtifacts.length > 0) {
    for (i = 0, len = deployedArtifacts.length; i < len; i++) {
      var artifact = deployedArtifacts[i]
      deployment = {
        _id: app.repository.generateGuid(),
        _type: 'UMLDeployment',
        source: artifact,
        target: { '$ref': guid }
      }
      addTo(obj, json, 'ownedElements', deployment)
    }
  }

  return json
}

// Ports ------------------------------------------------------------------

objectReaders['UMLPort'] = function (obj) {
  var json = objectReaders['UMLStructuralFeature'](obj)
  json['isBehavior'] = readAttr(obj, 'IsBehavior', '')
  json['isService'] = readAttr(obj, 'IsService', '')
  return json
}

objectReaders['UMLConnectorEnd'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['multiplicity'] = readAttr(obj, 'Multiplicity', '')
  json['isOrdered'] = readAttr(obj, 'IsOrdered')
  json['isUnique'] = readAttr(obj, 'IsUnique')
  json['reference'] = readRef(obj, 'Role')
  return json
}

objectReaders['UMLConnector'] = function (obj) {
  var json = objectReaders['UMLFeature'](obj)
  var ends = readObjArray(obj, 'Ends')
  if (ends.length === 2) {
    json['end1'] = ends[0]
    json['end2'] = ends[1]
  }
  return json
}

// UML Relationships ------------------------------------------------------

objectReaders['UMLRelationship'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  return json
}

objectReaders['UMLGeneralization'] = function (obj) {
  var json = objectReaders['UMLRelationship'](obj)
  json['source'] = readRef(obj, 'Child')
  json['target'] = readRef(obj, 'Parent')
  json['discriminator'] = readAttr(obj, 'Discriminator', '')
  return json
}

objectReaders['UMLDependency'] = function (obj) {
  var json = objectReaders['UMLRelationship'](obj)
  json['source'] = readRef(obj, 'Client')
  json['target'] = readRef(obj, 'Supplier')
  json['mapping'] = readAttr(obj, 'Mapping', '')
  return json
}

objectReaders['UMLRealization'] = function (obj) {
  var json = objectReaders['UMLDependency'](obj)
  json._type = 'UMLInterfaceRealization'
  return json
}

objectReaders['UMLAssociationEnd'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  // json['_parent'] = readRef(obj, 'Association')
  json['navigable'] = readAttr(obj, 'IsNavigable', true) ? 'navigable' : 'unspecified'
  json['isOrdered'] = (readEnum(obj, 'Ordering') === 1)
  json['aggregation'] = readEnum(obj, 'Aggregation', UMLAttribute.AK_NONE)
  // no field correspond to TargetScope
  json['multiplicity'] = readAttr(obj, 'Multiplicity', '')
  json['isReadOnly'] = (readEnum(obj, 'Changeability') === 1)
  json['reference'] = readRef(obj, 'Participant')
  json['qualifiers'] = readObjArray(obj, 'Qualifiers')
  return json
}

objectReaders['UMLAssociation'] = function (obj) {
  var json = objectReaders['UMLRelationship'](obj)
  var connections = readObjArray(obj, 'Connections')
  if (connections.length === 2) {
    json['end1'] = connections[0]
    json['end2'] = connections[1]
  }
  return json
}

// UML Diagrams -----------------------------------------------------------

objectReaders['UMLDiagram'] = function (obj) {
  var json = objectReaders['Diagram'](obj)
  return json
}

objectReaders['UMLDiagramView'] = function (obj) {
  var json = objectReaders['DiagramView'](obj)
  return json
}

objectReaders['UMLClassDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  return json
}

objectReaders['UMLClassDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLUseCaseDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  return json
}

objectReaders['UMLUseCaseDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLComponentDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  return json
}

objectReaders['UMLComponentDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLDeploymentDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  return json
}

objectReaders['UMLDeploymentDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLCompositeStructureDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  return json
}

objectReaders['UMLCompositeStructureDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLSequenceDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  json['showSequenceNumber'] = readAttr(obj, 'ShowSequenceNumber', true)
  json['showSignature'] = (readEnum(obj, 'MessageSignature', 0) === 3)
  json['showActivation'] = readAttr(obj, 'ShowActivation', true)
  return json
}

objectReaders['UMLSequenceDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLSequenceRoleDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  json['showSequenceNumber'] = readAttr(obj, 'ShowSequenceNumber', true)
  json['showSignature'] = (readEnum(obj, 'MessageSignature', 0) === 3)
  json['showActivation'] = readAttr(obj, 'ShowActivation', true)
  json._type = 'UMLSequenceDiagram'
  return json
}

objectReaders['UMLSequenceRoleDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLCollaborationDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  json._type = 'UMLCommunicationDiagram'
  return json
}

objectReaders['UMLCollaborationDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLCollaborationRoleDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  json._type = 'UMLCommunicationDiagram'
  return json
}

objectReaders['UMLCollaborationRoleDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLStatechartDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  return json
}

objectReaders['UMLStatechartDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

objectReaders['UMLActivityDiagram'] = function (obj) {
  var json = objectReaders['UMLDiagram'](obj)
  return json
}

objectReaders['UMLActivityDiagramView'] = function (obj) {
  var json = objectReaders['UMLDiagramView'](obj)
  return json
}

/**************************************************************************
*                                                                        *
*                          UML : COMMON BEHAVIOR                         *
*                                                                        *
**************************************************************************/

// Actions ----------------------------------------------------------------

objectReaders['UMLAction'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['recurrence'] = readAttr(obj, 'Recurrence')
  json['target'] = readAttr(obj, 'Target')
  json['isAsynchronous'] = readAttr(obj, 'IsAsynchronous')
  json['script'] = readAttr(obj, 'Script')
  return json
}

objectReaders['UMLCreateAction'] = function (obj) {
  var json = objectReaders['UMLAction'](obj)
  json['instantiation'] = readRef(obj, 'Instantiation')
  return json
}

objectReaders['UMLCallAction'] = function (obj) {
  var json = objectReaders['UMLAction'](obj)
  json['operation'] = readRef(obj, 'Operation')
  return json
}

objectReaders['UMLReturnAction'] = function (obj) {
  var json = objectReaders['UMLAction'](obj)
  return json
}

objectReaders['UMLSendAction'] = function (obj) {
  var json = objectReaders['UMLAction'](obj)
  json['signal'] = readRef(obj, 'Signal')
  return json
}

objectReaders['UMLTerminalAction'] = function (obj) {
  var json = objectReaders['UMLAction'](obj)
  return json
}

objectReaders['UMLUninterpretedAction'] = function (obj) {
  var json = objectReaders['UMLAction'](obj)
  json._type = 'UMLOpaqueBehavior'
  return json
}

objectReaders['UMLDestroyAction'] = function (obj) {
  var json = objectReaders['UMLAction'](obj)
  return json
}

// Instances --------------------------------------------------------------

objectReaders['UMLAttributeLink'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['definingFeature'] = readRef(obj, 'Attribute')
  json['value'] = readAttr(obj, 'ValueExpression', '')
  json._type = 'UMLSlot'
  return json
}

objectReaders['UMLInstance'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['classifier'] = readRef(obj, 'Classifier')
  json['slots'] = readObjArray(obj, 'Slots')
  return json
}

objectReaders['UMLComponentInstance'] = function (obj) {
  var json = objectReaders['UMLInstance'](obj)
  return json
}

objectReaders['UMLNodeInstance'] = function (obj) {
  var json = objectReaders['UMLInstance'](obj)
  return json
}

/**************************************************************************
*                                                                        *
*                          UML : COLLABORATIONS                          *
*                                                                        *
**************************************************************************/

objectReaders['UMLCollaboration'] = function (obj) {
  var json = objectReaders['UMLNamespace'](obj)
  json['attributes'] = [] // to contains Roles (ClassifierRole)
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'Interactions'))
  return json
}

objectReaders['UMLInteraction'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['messages'] = readObjArray(obj, 'Messages')
  json['participants'] = []
  json['fragments'] = readObjArray(obj, 'Fragments')
  return json
}

objectReaders['UMLCollaborationInstanceSet'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['attributes'] = [] // to contains Roles (Object)
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'InteractionInstanceSets'))
  appendTo(obj, json, 'attributes', readObjArray(obj, 'ParticipatingInstances'))
  appendTo(obj, json, 'ownedElements', readObjArray(obj, 'ParticipatingLinks'))
  json._type = 'UMLCollaboration'
  return json
}

objectReaders['UMLInteractionInstanceSet'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['messages'] = readObjArray(obj, 'ParticipatingStimuli')
  json['participants'] = []
  json['fragments'] = readObjArray(obj, 'Fragments')
  json._type = 'UMLInteraction'
  return json
}

objectReaders['UMLClassifierRole'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  json['multiplicity'] = readAttr(obj, 'Multiplicity', '')
  json['type'] = readRef(obj, 'Base')
  json._type = 'UMLAttribute'
  return json
}

objectReaders['UMLObject'] = function (obj) {
  var json = objectReaders['UMLInstance'](obj)
  json['isMultiInstance'] = readAttr(obj, 'IsMultiInstance', false)
  return json
}

objectReaders['UMLMessage'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['arguments'] = readAttr(obj, 'Arguments', '')
  json['assignmentTarget'] = readAttr(obj, 'Return', '')
  json['source'] = readRef(obj, 'Sender')
  json['target'] = readRef(obj, 'Receiver')
  json['connector'] = readRef(obj, 'CommunicationConnection')
  addTag(obj, json, '_iteration', readAttr(obj, 'Iteration'))
  addTag(obj, json, '_branch', readAttr(obj, 'Branch'))
  var action = readObj(obj, 'Action')
  switch (action._type) {
  case 'UMLCreateAction':
    json['messageSort'] = UMLMessage.MS_CREATEMESSAGE
    json['signature'] = action.instantiation
    break
  case 'UMLCallAction':
    json['messageSort'] = UMLMessage.MS_SYNCHCALL
    if (action.isAsynchronous === true) {
      json['messageSort'] = UMLMessage.MS_ASYNCHCALL
    }
    json['signature'] = action.operation
    break
  case 'UMLReturnAction':
    json['messageSort'] = UMLMessage.MS_REPLY
    break
  case 'UMLSendAction':
    json['messageSort'] = UMLMessage.MS_ASYNCHSIGNAL
    json['signature'] = action.signal
    break
  case 'UMLTerminateAction':
    json['messageSort'] = UMLMessage.MS_SYNCHCALL
    if (action.isAsynchronous === true) {
      json['messageSort'] = UMLMessage.MS_ASYNCHCALL
    }
    break
  case 'UMLUninterpretedAction':
    json['messageSort'] = UMLMessage.MS_SYNCHCALL
    if (action.isAsynchronous === true) {
      json['messageSort'] = UMLMessage.MS_ASYNCHCALL
    }
    break
  case 'UMLDestroyAction':
    json['messageSort'] = UMLMessage.MS_DELETEMESSAGE
    break
  }
  return json
}

objectReaders['UMLStimulus'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['arguments'] = readAttr(obj, 'Arguments', '')
  json['assignmentTarget'] = readAttr(obj, 'Return', '')
  json['source'] = readRef(obj, 'Sender')
  json['target'] = readRef(obj, 'Receiver')
  json['connector'] = readRef(obj, 'CommunicationLink')
  addTag(obj, json, '_iteration', readAttr(obj, 'Iteration'))
  addTag(obj, json, '_branch', readAttr(obj, 'Branch'))
  var action = readObj(obj, 'Action')
  switch (action._type) {
  case 'UMLCreateAction':
    json['messageSort'] = UMLMessage.MS_CREATEMESSAGE
    json['signature'] = action.instantiation
    break
  case 'UMLCallAction':
    json['messageSort'] = UMLMessage.MS_SYNCHCALL
    if (action.isAsynchronous === true) {
      json['messageSort'] = UMLMessage.MS_ASYNCHCALL
    }
    json['signature'] = action.operation
    break
  case 'UMLReturnAction':
    json['messageSort'] = UMLMessage.MS_REPLY
    break
  case 'UMLSendAction':
    json['messageSort'] = UMLMessage.MS_ASYNCHSIGNAL
    json['signature'] = action.signal
    break
  case 'UMLTerminateAction':
    json['messageSort'] = UMLMessage.MS_SYNCHCALL
    if (action.isAsynchronous === true) {
      json['messageSort'] = UMLMessage.MS_ASYNCHCALL
    }
    break
  case 'UMLUninterpretedAction':
    json['messageSort'] = UMLMessage.MS_SYNCHCALL
    if (action.isAsynchronous === true) {
      json['messageSort'] = UMLMessage.MS_ASYNCHCALL
    }
    break
  case 'UMLDestroyAction':
    json['messageSort'] = UMLMessage.MS_DELETEMESSAGE
    break
  }
  json._type = 'UMLMessage'
  return json
}

objectReaders['UMLInteractionFragment'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  return json
}

objectReaders['UMLInteractionOperand'] = function (obj) {
  var json = objectReaders['UMLInteractionFragment'](obj)
  json['guard'] = readAttr(obj, 'Guard', '')
  return json
}

objectReaders['UMLCombinedFragment'] = function (obj) {
  var json = objectReaders['UMLInteractionFragment'](obj)
  json['interactionOperator'] = readEnum(obj, 'InteractionOperator', UMLCombinedFragment.IOK_SEQ)
  json['operands'] = readObjArray(obj, 'Operands')
  return json
}

objectReaders['UMLAssociationEndRole'] = function (obj) {
  var json = objectReaders['UMLAssociationEnd'](obj)
  json._type = 'UMLConnectorEnd'
  return json
}

objectReaders['UMLAssociationRole'] = function (obj) {
  var json = objectReaders['UMLAssociation'](obj)
  addTag(obj, json, '_multiplicity', readAttr(obj, 'Multiplicity'))
  json['type'] = readRef(obj, 'Base') // No way to link this property in StarUML 1 UI.
  json._type = 'UMLConnector'
  return json
}

objectReaders['UMLLinkEnd'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['instance'] = readRef(obj, 'Instance')
  _.extend(json, objectReaders['UMLConnectorEnd'](obj))
  return json
}

objectReaders['UMLLink'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  var ends = readObjArray(obj, 'Connections')
  if (ends.length === 2) {
    json['end1'] = ends[0]
    json['end2'] = ends[1]
  }
  _.extend(json, objectReaders['UMLConnector'](obj))
  json['association'] = readRef(obj, 'Association') // No way to link this property in StarUML 1 UI.
  return json
}

/**************************************************************************
*                                                                        *
*                             UML : USE CASES                            *
*                                                                        *
**************************************************************************/

objectReaders['UMLUseCase'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  json['extensionPoints'] = readObjArray(obj, 'ExtensionPoints')
  return json
}

objectReaders['UMLActor'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  return json
}

objectReaders['UMLExtensionPoint'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['location'] = readAttr(obj, 'Location', '')
  return json
}

objectReaders['UMLInclude'] = function (obj) {
  var json = objectReaders['UMLRelationship'](obj)
  json['source'] = readRef(obj, 'Base')
  json['target'] = readRef(obj, 'Addition')
  return json
}

objectReaders['UMLExtend'] = function (obj) {
  var json = objectReaders['UMLRelationship'](obj)
  json['source'] = readRef(obj, 'Base')
  json['target'] = readRef(obj, 'Extension')
  return json
}

/**************************************************************************
 *                                                                        *
 *                          UML : STATE MACHINES                          *
 *                                                                        *
 **************************************************************************/

objectReaders['UMLEvent'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  return json
}

objectReaders['UMLSignalEvent'] = function (obj) {
  var json = objectReaders['UMLEvent'](obj)
  json['kind'] = UMLEvent.EK_SIGNAL
  json['targetSignal'] = readRef(obj, 'Signal')
  json._type = 'UMLEvent'
  return json
}

objectReaders['UMLCallEvent'] = function (obj) {
  var json = objectReaders['UMLEvent'](obj)
  json['kind'] = UMLEvent.EK_CALL
  json['targetOperation'] = readRef(obj, 'Operation')
  json._type = 'UMLEvent'
  return json
}

objectReaders['UMLTimeEvent'] = function (obj) {
  var json = objectReaders['UMLEvent'](obj)
  json['kind'] = UMLEvent.EK_TIME
  json['expression'] = readAttr(obj, 'When', '')
  json._type = 'UMLEvent'
  return json
}

objectReaders['UMLChangeEvent'] = function (obj) {
  var json = objectReaders['UMLEvent'](obj)
  json['kind'] = UMLEvent.EK_CHANGE
  json['expression'] = readAttr(obj, 'ChangeExpression', '')
  json._type = 'UMLEvent'
  return json
}

objectReaders['UMLStateMachine'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['regions'] = []
  json['__top'] = readObj(obj, 'Top')
  json['__transitions'] = readObjArray(obj, 'Transitions')
  return json
}

objectReaders['UMLStateVertex'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['regions'] = []
  return json
}

objectReaders['UMLPseudostate'] = function (obj) {
  var json = objectReaders['UMLStateVertex'](obj)
  json['kind'] = readEnum(obj, 'PseudostateKind', UMLPseudostate.PSK_INITIAL)
  return json
}

objectReaders['UMLSyncState'] = function (obj) {
  var json = objectReaders['UMLStateVertex'](obj)
  // Bound
  return json
}

objectReaders['UMLStubState'] = function (obj) {
  var json = objectReaders['UMLStateVertex'](obj)
  // ReferenceState
  return json
}

objectReaders['UMLState'] = function (obj) {
  var json = objectReaders['UMLStateVertex'](obj)
  // EntryAction
  // ExitAction
  // DoActivity
  json['entryActivities'] = readObjArray(obj, 'EntryActions')
  json['doActivities'] = readObjArray(obj, 'DoActivities')
  json['exitActivities'] = readObjArray(obj, 'ExitActions')
  // InternalTransition
  return json
}

objectReaders['UMLCompositeState'] = function (obj) {
  var json = objectReaders['UMLState'](obj)
  json['__subvertices'] = readObjArray(obj, 'Subvertices')
  addTag(obj, json, '_isConcurrent', readAttr(obj, 'IsConcurrent'))
  json._type = 'UMLState'
  return json
}

objectReaders['UMLSubmachineState'] = function (obj) {
  var json = objectReaders['UMLCompositeState'](obj)
  json['submachine'] = readRef(obj, 'Submachine')
  json._type = 'UMLState'
  return json
}

objectReaders['UMLSimpleState'] = function (obj) {
  var json = objectReaders['UMLState'](obj)
  return json
}

objectReaders['UMLFinalState'] = function (obj) {
  var json = objectReaders['UMLState'](obj)
  return json
}

objectReaders['UMLFlowFinalState'] = function (obj) {
  var json = objectReaders['UMLFinalState'](obj)
  json['kind'] = UMLPseudostate.PSK_TERMINATE
  json._type = 'UMLPseudostate'
  return json
}

objectReaders['UMLTransition'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json['source'] = readRef(obj, 'Source')
  json['target'] = readRef(obj, 'Target')
  json['guard'] = readAttr(obj, 'GuardCondition', '')
  json['effects'] = readObjArray(obj, 'Effects')
  json['triggers'] = readObjArray(obj, 'Triggers')
  return json
}

/**************************************************************************
*                                                                        *
*                          UML : ACTIVITY GRAPH                          *
*                                                                        *
**************************************************************************/

objectReaders['UMLActivityGraph'] = function (obj) {
  var json = objectReaders['UMLStateMachine'](obj)
  json['nodes'] = []
  json['edges'] = []
  json['groups'] = readObjArray(obj, 'Partitions')
  json._type = 'UMLActivity'
  return json
}

objectReaders['UMLPartition'] = function (obj) {
  var json = objectReaders['UMLModelElement'](obj)
  json._type = 'UMLActivityPartition'
  return json
}

objectReaders['UMLActionState'] = function (obj) {
  var json = objectReaders['UMLSimpleState'](obj)
  addTag(obj, json, '_isDynamic', readAttr(obj, 'IsDynamic'))
  addTag(obj, json, '_dynamicArguments', readAttr(obj, 'DynamicArguments'))
  addTag(obj, json, '_dynamicMultiplicity', readAttr(obj, 'DynamicMultiplicity'))
  json._type = 'UMLAction'
  return json
}

objectReaders['UMLSubactivityState'] = function (obj) {
  var json = objectReaders['UMLSubmachineState'](obj)
  json['subactivity'] = readRef(obj, 'Submachine')
  addTag(obj, json, '_isDynamic', readAttr(obj, 'IsDynamic'))
  addTag(obj, json, '_dynamicArguments', readAttr(obj, 'DynamicArguments'))
  addTag(obj, json, '_dynamicMultiplicity', readAttr(obj, 'DynamicMultiplicity'))
  json._type = 'UMLAction'
  return json
}

objectReaders['UMLObjectFlowState'] = function (obj) {
  var json = objectReaders['UMLSimpleState'](obj)
  json['type'] = readRef(obj, 'Type_')
  addTag(obj, json, '_isSynch', readAttr(obj, 'IsSynch'))
  json._type = 'UMLObjectNode'
  return json
}

objectReaders['UMLSignalSendState'] = function (obj) {
  var json = objectReaders['UMLActionState'](obj)
  json['kind'] = UMLAction.ACK_SENDSIGNAL
  json._type = 'UMLAction'
  return json
}

objectReaders['UMLSignalAcceptState'] = function (obj) {
  var json = objectReaders['UMLActionState'](obj)
  json['kind'] = UMLAction.ACK_ACCEPTSIGNAL
  json._type = 'UMLAction'
  return json
}

/**************************************************************************
*                                                                        *
*                          UML : MODEL_MANAGEMENT                        *
*                                                                        *
**************************************************************************/

objectReaders['UMLPackage'] = function (obj) {
  var json = objectReaders['UMLClassifier'](obj)
  return json
}

objectReaders['UMLProject'] = function (obj) {
  var json = objectReaders['UMLPackage'](obj)
  json['name'] = readAttr(obj, 'Title', '')
  json['author'] = readAttr(obj, 'Author', '')
  json['company'] = readAttr(obj, 'Company', '')
  json['copyright'] = readAttr(obj, 'Copyright', '')
  json._type = 'Project'
  return json
}

objectReaders['UMLModel'] = function (obj) {
  var json = objectReaders['UMLPackage'](obj)
  return json
}

objectReaders['UMLSubsystem'] = function (obj) {
  var json = objectReaders['UMLPackage'](obj)
  json['isIndirectlyInstantiated'] = readAttr(obj, 'IsInstantiable', true)
  return json
}

/**************************************************************************
*                                                                        *
*                                 UML VIEWS                              *
*                                                                        *
**************************************************************************/

enumerations['UMLStereotypeDisplayKind'] = {
  'sdkLabel': UMLGeneralNodeView.SD_LABEL,
  'sdkIcon': UMLGeneralNodeView.SD_ICON,
  'sdkNone': UMLGeneralNodeView.SD_NONE,
  'sdkDecoration': UMLGeneralNodeView.SD_DECORATION
}

// General Views ----------------------------------------------------------

objectReaders['UMLNameCompartmentView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  addSubView(obj, 'StereotypeLabel', json, 'stereotypeLabel')
  addSubView(obj, 'NameLabel', json, 'nameLabel')
  addSubView(obj, 'NamespaceLabel', json, 'namespaceLabel', newLabelView())
  addSubView(obj, 'PropertyLabel', json, 'propertyLabel', newLabelView())
  // WordWrap
  return json
}

objectReaders['UMLListCompartmentView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  // Header?
  return json
}

objectReaders['UMLGeneralNodeView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  json['stereotypeDisplay'] = readEnum(obj, 'StereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
  json['showNamespace'] = readAttr(obj, 'ShowParentName', false)
  json['showProperty'] = readAttr(obj, 'ShowProperty', false)
  addSubView(obj, 'NameCompartment', json, 'nameCompartment')
  return json
}

objectReaders['UMLGeneralEdgeView'] = function (obj) {
  var json = objectReaders['EdgeView'](obj)
  json['showProperty'] = readAttr(obj, 'ShowProperty', false)
  addSubView(obj, 'StereotypeLabel', json, 'stereotypeLabel', newEdgeLabelView())
  addSubView(obj, 'NameLabel', json, 'nameLabel', newEdgeLabelView())
  addSubView(obj, 'PropertyLabel', json, 'propertyLabel', newEdgeLabelView())
  return json
}

objectReaders['UMLAttributeCompartmentView'] = function (obj) {
  var json = objectReaders['UMLListCompartmentView'](obj)
  return json
}

objectReaders['UMLOperationCompartmentView'] = function (obj) {
  var json = objectReaders['UMLListCompartmentView'](obj)
  return json
}

objectReaders['UMLEnumerationLiteralCompartmentView'] = function (obj) {
  var json = objectReaders['UMLListCompartmentView'](obj)
  return json
}

objectReaders['UMLTemplateParameterCompartmentView'] = function (obj) {
  var json = objectReaders['UMLListCompartmentView'](obj)
  return json
}

objectReaders['UMLQualifierCompartmentView'] = function (obj) {
  var json = objectReaders['UMLListCompartmentView'](obj)
  return json
}

objectReaders['UMLClassifierView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  json['showOperationSignature'] = readAttr(obj, 'ShowOperationSignature', true)
  // readAttr(obj, 'ShowCompartmentStereotype', true)
  json['showVisibility'] = readAttr(obj, 'ShowCompartmentVisibility', true)

  var attributeCompartment = addSubView(obj, 'AttributeCompartment', json, 'attributeCompartment', {
    _id: app.repository.generateGuid(),
    _type: 'UMLAttributeCompartmentView',
    parentStyle: true,
    visible: false
  })

  var operationCompartment = addSubView(obj, 'OperationCompartment', json, 'operationCompartment', {
    _id: app.repository.generateGuid(),
    _type: 'UMLOperationCompartmentView',
    parentStyle: true,
    visible: false
  })

  addSubView(obj, 'TemplateParameterCompartment', json, 'templateParameterCompartment', {
    _id: app.repository.generateGuid(),
    _type: 'UMLTemplateParameterCompartmentView',
    parentStyle: true
  })

  json['suppressAttributes'] = !attributeCompartment.visible
  json['suppressOperations'] = !operationCompartment.visible
  return json
}

// Class Diagram ----------------------------------------------------------

objectReaders['UMLPackageView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  return json
}

objectReaders['UMLSubsystemView'] = function (obj) {
  var json = objectReaders['UMLPackageView'](obj)
  return json
}

objectReaders['UMLModelView'] = function (obj) {
  var json = objectReaders['UMLPackageView'](obj)
  return json
}

objectReaders['UMLClassView'] = function (obj) {
  var json = objectReaders['UMLClassifierView'](obj)
  return json
}

objectReaders['UMLInterfaceView'] = function (obj) {
  var json = objectReaders['UMLClassifierView'](obj)
  return json
}

objectReaders['UMLEnumerationView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  json['showOperationSignature'] = readAttr(obj, 'ShowOperationSignature')
  // readAttr(obj, 'ShowCompartmentStereotype')
  json['showVisibility'] = readAttr(obj, 'ShowCompartmentVisibility')

  addSubView(obj, 'TemplateParameterCompartment', json, 'templateParameterCompartment', {
    _id: app.repository.generateGuid(),
    _type: 'UMLTemplateParameterCompartmentView',
    parentStyle: true
  })

  addSubView(obj, 'AttributeCompartment', json, 'attributeCompartment', {
    _id: app.repository.generateGuid(),
    _type: 'UMLAttributeCompartmentView',
    parentStyle: true
  })

  var lc = addSubView(obj, 'EnumerationLiteralCompartment', json, 'enumerationLiteralCompartment')
  var oc = addSubView(obj, 'OperationCompartment', json, 'operationCompartment')

  json['suppressLiterals'] = !lc.visible
  json['suppressOperations'] = !oc.visible
  return json
}

objectReaders['UMLSignalView'] = function (obj) {
  var json = objectReaders['UMLClassifierView'](obj)
  return json
}

objectReaders['UMLExceptionView'] = function (obj) {
  var json = objectReaders['UMLSignalView'](obj)
  json._type = 'UMLSignalView'
  return json
}

objectReaders['UMLGeneralizationView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  return json
}

objectReaders['UMLRealizationView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  json._type = 'UMLInterfaceRealizationView'
  return json
}

objectReaders['UMLDependencyView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  return json
}

objectReaders['UMLAssociationView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  // readAttr(obj, 'ShowCompartmentStereotype', true)
  json['showVisibility'] = readAttr(obj, 'ShowCompartmentVisibility', true)
  addSubView(obj, 'HeadRoleNameLabel', json, 'headRoleNameLabel')
  addSubView(obj, 'TailRoleNameLabel', json, 'tailRoleNameLabel')
  addSubView(obj, 'HeadMultiplicityLabel', json, 'headMultiplicityLabel')
  addSubView(obj, 'TailMultiplicityLabel', json, 'tailMultiplicityLabel')
  addSubView(obj, 'HeadPropertyLabel', json, 'headPropertyLabel')
  addSubView(obj, 'TailPropertyLabel', json, 'tailPropertyLabel')
  addSubView(obj, 'HeadQualifierCompartment', json, 'headQualifiersCompartment')
  addSubView(obj, 'TailQualifierCompartment', json, 'tailQualifiersCompartment')
  return json
}

// Composite Structure Diagram --------------------------------------------

objectReaders['UMLPortView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  json['showProperty'] = readAttr(obj, 'ShowProperty', false)
  addSubView(obj, 'StereotypeLabel', json, 'stereotypeLabel')
  addSubView(obj, 'NameLabel', json, 'nameLabel')
  addSubView(obj, 'PropertyLabel', json, 'propertyLabel')
  return json
}

objectReaders['UMLPartView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  return json
}

objectReaders['UMLConnectorView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  addSubView(obj, 'HeadRoleNameLabel', json, 'headRoleNameLabel')
  addSubView(obj, 'TailRoleNameLabel', json, 'tailRoleNameLabel')
  addSubView(obj, 'HeadMultiplicityLabel', json, 'headMultiplicityLabel')
  addSubView(obj, 'TailMultiplicityLabel', json, 'tailMultiplicityLabel')
  return json
}

// Component and Deployment Diagram ---------------------------------------

objectReaders['UMLCustomComponentView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  return json
}

objectReaders['UMLComponentView'] = function (obj) {
  var json = objectReaders['UMLCustomComponentView'](obj)
  _.extend(json, objectReaders['UMLClassifierView'](obj))
  return json
}

objectReaders['UMLComponentInstanceView'] = function (obj) {
  var json = objectReaders['UMLCustomComponentView'](obj)
  return json
}

objectReaders['UMLCustomNodeView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  return json
}

objectReaders['UMLNodeView'] = function (obj) {
  var json = objectReaders['UMLCustomNodeView'](obj)
  _.extend(json, objectReaders['UMLClassifierView'](obj))
  return json
}

objectReaders['UMLNodeInstanceView'] = function (obj) {
  var json = objectReaders['UMLCustomNodeView'](obj)
  return json
}

objectReaders['UMLArtifactView'] = function (obj) {
  var json = objectReaders['UMLClassifierView'](obj)
  return json
}

// Use Case Diagram -------------------------------------------------------

objectReaders['UMLActorView'] = function (obj) {
  var json = objectReaders['UMLClassifierView'](obj)
  return json
}

objectReaders['UMLExtensionPointCompartmentView'] = function (obj) {
  var json = objectReaders['UMLListCompartmentView'](obj)
  return json
}

objectReaders['UMLUseCaseView'] = function (obj) {
  var json = objectReaders['UMLClassifierView'](obj)
  addSubView(obj, 'ExtensionPointCompartment', json, 'extensionPointCompartment', {
    _id: app.repository.generateGuid(),
    _type: 'UMLExtensionPointCompartmentView',
    parentStyle: true
  })
  return json
}

objectReaders['UMLIncludeView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  return json
}

objectReaders['UMLExtendView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  return json
}

objectReaders['UMLExtendView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  return json
}

objectReaders['UMLSystemBoundaryView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  json._type = 'RectangleView'
  return json
}

// Sequence Diagram -------------------------------------------------------

objectReaders['UMLLifeLineView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  json._type = 'UMLLinePartView'
  return json
}

objectReaders['UMLCustomSeqObjectView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  addSubView(obj, 'LifeLine', json, 'linePart')
  return json
}

objectReaders['UMLSeqObjectView'] = function (obj) {
  var json = objectReaders['UMLCustomSeqObjectView'](obj)
  json._type = 'UMLSeqLifelineView'
  return json
}

objectReaders['UMLSeqClassifierRoleView'] = function (obj) {
  var json = objectReaders['UMLCustomSeqObjectView'](obj)
  json._type = 'UMLSeqLifelineView'
  return json
}

objectReaders['UMLActivationView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  return json
}

objectReaders['UMLCustomSeqMessageView'] = function (obj) {
  var json = objectReaders['EdgeView'](obj)
  json['showProperty'] = readAttr(obj, 'ShowProperty', false)
  addSubView(obj, 'StereotypeLabel', json, 'stereotypeLabel', newEdgeLabelView())
  addSubView(obj, 'NameLabel', json, 'nameLabel', newEdgeLabelView())
  addSubView(obj, 'PropertyLabel', json, 'propertyLabel', newEdgeLabelView())
  addSubView(obj, 'Activation', json, 'activation')
  return json
}

objectReaders['UMLSeqMessageView'] = function (obj) {
  var json = objectReaders['UMLCustomSeqMessageView'](obj)
  return json
}

objectReaders['UMLSeqStimulusView'] = function (obj) {
  var json = objectReaders['UMLCustomSeqMessageView'](obj)
  json._type = 'UMLSeqMessageView'
  return json
}

objectReaders['UMLCustomFrameView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  addSubView(obj, 'NameLabel', json, 'nameLabel')
  addSubView(obj, 'FrameTypeLabel', json, 'frameTypeLabel')
  return json
}

objectReaders['UMLCombinedFragmentView'] = function (obj) {
  // var guid = obj.getAttribute('guid')
  var json = objectReaders['UMLCustomFrameView'](obj)
  var operandCompartment = {
    _id: app.repository.generateGuid(),
    _type: 'UMLInteractionOperandCompartmentView'
  }
  _.extend(operandCompartment, objectReaders['NodeView'](obj))
  json['operandCompartment'] = { '$ref': operandCompartment._id }
  addTo(obj, json, 'subViews', operandCompartment)
  return json
}
// Don't need to load UMLInteractionOperandView
// because it will be created automatically in UMLInteractionOperandCompartmentView

// Collaboration Diagram --------------------------------------------------

objectReaders['UMLCustomColObjectView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  return json
}

objectReaders['UMLSlotCompartmentView'] = function (obj) {
  var json = objectReaders['UMLListCompartmentView'](obj)
  return json
}

objectReaders['UMLColObjectView'] = function (obj) {
  var json = objectReaders['UMLCustomColObjectView'](obj)
  addSubView(obj, 'SlotCompartment', json, 'slotCompartment')
  return json
}

objectReaders['UMLColClassifierRoleView'] = function (obj) {
  var json = objectReaders['UMLCustomColObjectView'](obj)
  json._type = 'UMLCommLifelineView'
  return json
}

objectReaders['UMLAssociationRoleView'] = function (obj) {
  var json = objectReaders['UMLAssociationView'](obj)
  json._type = 'UMLConnectorView'
  return json
}

objectReaders['UMLLinkView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  addSubView(obj, 'HeadEndLabel', json, 'headRoleNameLabel')
  addSubView(obj, 'TailEndLabel', json, 'tailRoleNameLabel')
  return json
}

objectReaders['UMLCustomColMessageView'] = function (obj) {
  var json = objectReaders['EdgeNodeView'](obj)
  json['showProperty'] = readAttr(obj, 'ShowProperty', false)
  addSubView(obj, 'StereotypeLabel', json, 'stereotypeLabel')
  addSubView(obj, 'NameLabel', json, 'nameLabel')
  addSubView(obj, 'PropertyLabel', json, 'propertyLabel')
  return json
}

objectReaders['UMLColMessageView'] = function (obj) {
  var json = objectReaders['UMLCustomColMessageView'](obj)
  json._type = 'UMLCommMessageView'
  return json
}

objectReaders['UMLColStimulusView'] = function (obj) {
  var json = objectReaders['UMLCustomColMessageView'](obj)
  json._type = 'UMLCommMessageView'
  return json
}

// Statechart Diagram -----------------------------------------------------

objectReaders['UMLInternalTransitionCompartmentView'] = function (obj) {
  var json = objectReaders['UMLListCompartmentView'](obj)
  json._type = 'UMLInternalActivityCompartmentView'
  return json
}

objectReaders['UMLCustomStateView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  addSubView(obj, 'InternalTransitionCompartment', json, 'internalActivityCompartment', {
    _id: app.repository.generateGuid(),
    _type: 'UMLInternalActivityCompartmentView'
  })
  addSubView(obj, 'DecompositionCompartment', json, 'decompositionCompartment', {
    _id: app.repository.generateGuid(),
    _type: 'UMLDecompositionCompartmentView',
    subViews: []
  })
  return json
}

objectReaders['UMLStateView'] = function (obj) {
  var json = objectReaders['UMLCustomStateView'](obj)
  return json
}

objectReaders['UMLSubmachineStateView'] = function (obj) {
  var json = objectReaders['UMLCustomStateView'](obj)
  json._type = 'UMLStateView'
  return json
}

objectReaders['UMLPseudostateView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  // for default labels for UMLFloatingNodeView
  addSubView(obj, 'StereotypeLabel', json, 'stereotypeLabel', { _id: app.repository.generateGuid(), _type: 'NodeLabelView' })
  addSubView(obj, 'NameLabel', json, 'nameLabel', { _id: app.repository.generateGuid(), _type: 'NodeLabelView' })
  addSubView(obj, 'PropertyLabel', json, 'propertyLabel', { _id: app.repository.generateGuid(), _type: 'NodeLabelView' })
  return json
}

objectReaders['UMLFinalStateView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  return json
}

objectReaders['UMLFlowFinalStateView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  _.extend(json, objectReaders['UMLPseudostateView'](obj))
  json._type = 'UMLPseudostateView'
  return json
}

objectReaders['UMLTransitionView'] = function (obj) {
  var json = objectReaders['UMLGeneralEdgeView'](obj)
  return json
}

// Activity Diagram -------------------------------------------------------

enumerations['UMLSwimlaneDirectionKind'] = {
  'slkVertical': 0,
  'slkHorizontal': 1
}

objectReaders['UMLActionStateView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  json._type = 'UMLActionView'
  return json
}

objectReaders['UMLSubactivityStateView'] = function (obj) {
  var json = objectReaders['UMLActionStateView'](obj)
  json._type = 'UMLActionView'
  return json
}

objectReaders['UMLObjectFlowStateView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  json._type = 'UMLObjectNodeView'
  return json
}

objectReaders['UMLSignalAcceptStateView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  json._type = 'UMLActionView'
  return json
}

objectReaders['UMLSignalSendStateView'] = function (obj) {
  var json = objectReaders['UMLGeneralNodeView'](obj)
  json._type = 'UMLActionView'
  return json
}

objectReaders['UMLSwimlaneView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  addSubView(obj, 'NameLabel', json, 'nameLabel')
  json['isVertical'] = (readEnum(obj, 'Direction') !== 1)
  return json
}

// Auxiliary Views --------------------------------------------------------

objectReaders['UMLCustomTextView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  json['text'] = readAttr(obj, 'Text', '')
  return json
}

objectReaders['UMLTextView'] = function (obj) {
  var json = objectReaders['UMLCustomTextView'](obj)
  return json
}

objectReaders['UMLNoteView'] = function (obj) {
  var json = objectReaders['UMLCustomTextView'](obj)
  return json
}

objectReaders['UMLNoteLinkView'] = function (obj) {
  var json = objectReaders['EdgeView'](obj)
  return json
}

objectReaders['ShapeView'] = function (obj) {
  var json = objectReaders['NodeView'](obj)
  return json
}

objectReaders['RectangleView'] = function (obj) {
  var json = objectReaders['ShapeView'](obj)
  return json
}

objectReaders['RoundRectView'] = function (obj) {
  var json = objectReaders['ShapeView'](obj)
  return json
}

objectReaders['EllipseView'] = function (obj) {
  var json = objectReaders['ShapeView'](obj)
  return json
}

/**************************************************************************
*                                                                        *
*                             POST-PROCESSORS                            *
*                                                                        *
**************************************************************************/

// process containedViews
postprocessors.push(function (elem) {
  if (_.isArray(elem.containedViews) && elem.containedViews.length > 0) {
    var diagram = getDiagram(elem)
    for (var i = 0, len = elem.containedViews.length; i < len; i++) {
      var view = elem.containedViews[i]
      view._parent = { '$ref': diagram._id }
      diagram.ownedViews.push(view)
      elem.containedViews[i] = { '$ref': view._id }
    }
  }
})

// process ComponentRealization
postprocessors.push(function (elem) {
  if (elem._type === 'UMLInterfaceRealization') {
    // var source = Reader.get(elem.source.$ref)
    var target = Reader.get(elem.target.$ref)
    if (app.metamodels.isKindOf(target._type, 'UMLComponent')) {
      elem._type = 'UMLComponentRealization'
    }
  }
})

// process ComponentRealizationView
postprocessors.push(function (elem) {
  if (elem._type === 'UMLInterfaceRealizationView') {
    var model = Reader.get(elem.model.$ref)
    if (model._type === 'UMLComponentRealization') {
      elem._type = 'UMLComponentRealizationView'
    }
  }
})

// process Object participating in Collaboration (converted from CollaborationInstanceSet)
// (convert to Attribute of Collaboration)
postprocessors.push(function (elem) {
  if (elem._type === 'UMLObject') {
    var owner = Reader.get(elem._parent.$ref)
    if (owner._type === 'UMLCollaboration') {
      elem['type'] = elem['classifier']
      if (elem['isMultiInstance']) {
        elem['multiplicity'] = '0..*'
      }
      elem._type = 'UMLAttribute'
    }
  }
})

// process Link participating in Collaboration (converted from CollaborationInstanceSet)
// (convert to Connector of Collaboration)
postprocessors.push(function (elem) {
  if (elem._type === 'UMLLink') {
    var owner = Reader.get(elem._parent.$ref)
    if (owner._type === 'UMLCollaboration') {
      elem._type = 'UMLConnector'
      if (elem.end1) {
        elem.end1._type = 'UMLConnectorEnd'
        elem.end1.reference = elem.end1.instance
      }
      if (elem.end2) {
        elem.end2._type = 'UMLConnectorEnd'
        elem.end2.reference = elem.end2.instance
      }
    }
  }
})

// process Attribute
// when ClassifierRole converted to Attribute, but owned by Collaboration.ownedElements.
// so, need to change parent field to Collaboration.attributes from .ownedElements
postprocessors.push(function (elem) {
  if (elem._type === 'UMLAttribute') {
    var owner = Reader.get(elem._parent.$ref)
    if (_.isArray(owner.ownedElements) && _.isArray(owner.attributes) && _.includes(owner.ownedElements, elem)) {
      var index = owner.ownedElements.indexOf(elem)
      if (index > -1) {
        owner.ownedElements.splice(index, 1)
      }
      owner.attributes.push(elem)
    }
  }
})

// process UMLColObjectView
// when owned by CommunicationDiagram, convert to UMLCommLifelineView
// otherwise, conver to UMLObjectView
postprocessors.push(function (elem) {
  if (elem._type === 'UMLColObjectView') {
    var diagram = Reader.get(elem._parent.$ref)
    if (diagram._type === 'UMLCommunicationDiagram') {
      elem._type = 'UMLCommLifelineView'
    } else {
      elem._type = 'UMLObjectView'
    }
  }
})

// process SeqLifelineView, CommLifelineView
postprocessors.push(function (elem) {
  if (elem._type === 'UMLSeqLifelineView' || elem._type === 'UMLCommLifelineView') {
    var role = Reader.get(elem.model.$ref)
    var diagram = Reader.get(elem._parent.$ref)
    var interaction = Reader.get(diagram._parent.$ref)
    if (role && interaction._type === 'UMLInteraction') {
      var lifeline = {
        _id: app.repository.generateGuid(),
        _type: 'UMLLifeline',
        _parent: { '$ref': interaction._id },
        name: role.name,
        stereotype: role.stereotype,
        visibility: role.visibility,
        represent: { '$ref': role._id }
      }
      interaction.participants.push(lifeline)
      elem.model.$ref = lifeline._id
    }
  }
})

// process Message
// Change Message's .source and .target to Lifeline rather than Attribute
postprocessors.push(function (elem) {
  if (elem._type === 'UMLMessage') {
    var interaction = Reader.get(elem._parent.$ref)
    var source = Reader.get(elem.source.$ref)
    var target = Reader.get(elem.target.$ref)
    if (interaction._type === 'UMLInteraction' && source && target) {
      var sourceLifeline = null
      var targetLifeline = null
      for (var i = 0, len = interaction.participants.length; i < len; i++) {
        var p = interaction.participants[i]
        if (p.represent.$ref === source._id) {
          sourceLifeline = p
        }
        if (p.represent.$ref === target._id) {
          targetLifeline = p
        }
      }
      if (sourceLifeline && targetLifeline) {
        elem.source.$ref = sourceLifeline._id
        elem.target.$ref = targetLifeline._id
      }
    }
  }
})

// process StateMachine
postprocessors.push(function (elem) {
  if (elem._type === 'UMLStateMachine' && elem.__top) {
    var top = elem.__top
    var region = {
      _id: app.repository.generateGuid(),
      _parent: { '$ref': elem._id },
      _type: 'UMLRegion',
      vertices: top.__subvertices,
      transitions: elem.__transitions
    }
    var i, len
    for (i = 0, len = top.__subvertices.length; i < len; i++) {
      var vertex = top.__subvertices[i]
      vertex._parent = { '$ref': region._id }
    }
    for (i = 0, len = elem.__transitions.length; i < len; i++) {
      var transition = elem.__transitions[i]
      transition._parent = { '$ref': region._id }
    }
    delete top['__subvertices']
    delete elem['__transitions']
    elem.regions.push(region)
  }
})

// process CompositeState
postprocessors.push(function (elem) {
  if (elem._type === 'UMLState' && elem.__subvertices) {
    var region = {
      _id: app.repository.generateGuid(),
      _parent: { '$ref': elem._id },
      _type: 'UMLRegion',
      vertices: elem.__subvertices,
      containedViews: []
    }
    for (var i = 0, len = elem.__subvertices.length; i < len; i++) {
      var vertex = elem.__subvertices[i]
      vertex._parent = { '$ref': region._id }
    }
    delete elem['__subvertices']
    elem.regions.push(region)
  }
})

// process StateView's Containement Relation
// containerView should refer RegionView not StateView
postprocessors.push(function (elem) {
  if (elem._type === 'UMLStateView' && elem.containerView && elem.containerView.$ref) {
    var containerView = Reader.get(elem.containerView.$ref)
    var containerModel = Reader.get(containerView.model.$ref)
    if (containerView._type === 'UMLStateView') {
      containerView.containedViews = []
      var decomposition = null
      for (var i = 0, len = containerView.subViews.length; i < len; i++) {
        var sub = containerView.subViews[i]
        if (sub._type === 'UMLDecompositionCompartmentView') {
          decomposition = sub
        }
      }
      if (decomposition.subViews.length < 1) {
        decomposition.subViews.push({
          _id: app.repository.generateGuid(),
          _type: 'UMLRegionView',
          model: { '$ref': containerModel.regions[0]._id },
          containedViews: []
        })
      }
      decomposition.subViews[0].containedViews.push({ '$ref': elem._id })
      elem.containerView.$ref = decomposition.subViews[0]._id
    }
  }
})

// process Pseudostate
postprocessors.push(function (elem) {
  if (elem._type === 'UMLPseudostate' && elem.kind === 0) {
    var incoming = 0
    var outgoing = 0
    for (var key in Reader.getIdMap()) {
      var obj = Reader.get(key)
      if (obj._type === 'UMLTransition') {
        if (obj.source.$ref === elem._id) {
          outgoing++
        }
        if (obj.target.$ref === elem._id) {
          incoming++
        }
      }
    }
    if (incoming > outgoing) {
      elem.kind = UMLPseudostate.PSK_JOIN
    } else {
      elem.kind = UMLPseudostate.PSK_FORK
    }
  }
})

// process Activity (i.e. ActivityGraph)
// Note That __top and __transitions are already processed at prior post-processors
postprocessors.push(function (elem) {
  if (elem._type === 'UMLActivity') {
    var region = elem.__top.regions[0]
    var i, len
    for (i = 0, len = region.vertices.length; i < len; i++) {
      var vertex = region.vertices[i]
      vertex._parent = { '$ref': elem._id }
      elem.nodes.push(vertex)
    }
    for (i = 0, len = elem.__transitions.length; i < len; i++) {
      var edge = elem.__transitions[i]
      edge._parent = { '$ref': elem._id }
      edge._type = 'UMLControlFlow'
      elem.edges.push(edge)
    }
  }
})

// process Pseudostate in (ActivityDiagram)
postprocessors.push(function (elem) {
  if (elem._type === 'UMLActivity') {
    for (var i = 0, len = elem.nodes.length; i < len; i++) {
      var node = elem.nodes[i]
      if (node._type === 'UMLPseudostate') {
        switch (node.kind) {
        case UMLPseudostate.PSK_INITIAL:
          node._type = 'UMLInitialNode'
          break
        case UMLPseudostate.PSK_DEEPHISTORY:
          break
        case UMLPseudostate.PSK_SHALLOWHISTORY:
          break
        case UMLPseudostate.PSK_JOIN:
          node._type = 'UMLJoinNode'
          break
        case UMLPseudostate.PSK_FORK:
          node._type = 'UMLForkNode'
          break
        case UMLPseudostate.PSK_JUNCTION: break
        case UMLPseudostate.PSK_CHOICE: break
        case UMLPseudostate.PSK_ENTRYPOINT: break
        case UMLPseudostate.PSK_EXITPOINT: break
        case UMLPseudostate.PSK_TERMINATE:
          node._type = 'UMLFlowFinalNode'
          break
        case 1: // Decision
          node._type = 'UMLDecisionNode'
          break
        }
      } else if (node._type === 'UMLFinalState') {
        node._type = 'UMLActivityFinalNode'
      }
    }
  }
})

// process PseudostateView in (ActivityDiagram)
postprocessors.push(function (elem) {
  var diagram
  if (elem._type === 'UMLPseudostateView') {
    diagram = getDiagram(elem)
    if (diagram._type === 'UMLActivityDiagram') {
      var model = Reader.get(elem.model.$ref)
      if (app.metamodels.isKindOf(model._type, 'UMLControlNode')) {
        elem._type = 'UMLControlNodeView'
      }
    }
  }
  if (elem._type === 'UMLTransitionView') {
    diagram = getDiagram(elem)
    if (diagram._type === 'UMLActivityDiagram') {
      elem._type = 'UMLControlFlowView'
    }
  }
})

// process ControlFlow
// - convert to ObjectFlow when connected with ObjectNode
postprocessors.push(function (elem) {
  if (elem._type === 'UMLControlFlowView') {
    var model = Reader.get(elem.model.$ref)
    if (model && model.source && model.target) {
      var source = Reader.get(model.source.$ref)
      var target = Reader.get(model.target.$ref)
      if (app.metamodels.isKindOf(source._type, 'UMLObjectNode') || app.metamodels.isKindOf(target._type, 'UMLObjectNode')) {
        elem._type = 'UMLObjectFlowView'
        model._type = 'UMLObjectFlow'
      }
    }
  }
})
