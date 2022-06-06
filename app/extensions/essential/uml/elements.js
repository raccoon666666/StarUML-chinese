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

/* eslint-disable camelcase, no-eval */

const _ = require('lodash')
const {
  Point,
  Rect,
  Color,
  Coord,
  Font,
  Canvas,
  GraphicUtils,
  View,
  Diagram,
  NodeView,
  EdgeView,
  LabelView,
  NodeLabelView,
  EdgeLabelView,
  EdgeNodeView,
  EdgeParasiticView
} = app.type

/**************************************************************************
 *                                                                        *
 *                       CONSTANTS AND ENUMERATIONS                       *
 *                                                                        *
 *************************************************************************/

/**
 * View Constants
 * @private
 * @const {number}
 */
const SHADOW_OFFSET = 7
const SHADOW_ALPHA = 0.2
const SHADOW_COLOR = Color.LIGHT_GRAY

// When use a sequence of labels, leave space after LabelVie
const LABEL_INTERVAL = 3

const COMPARTMENT_ITEM_INTERVAL = 2
const COMPARTMENT_LEFT_PADDING = 5
const COMPARTMENT_RIGHT_PADDING = 5
const COMPARTMENT_TOP_PADDING = 5
const COMPARTMENT_BOTTOM_PADDING = 5

const DECORATION_ICON_WIDTH = 24
const DECORATION_ICON_HEIGHT = 24

const ICONICVIEW_ICONMINWIDTH = 24
const ICONICVIEW_ICONMINHEIGHT = 24

const TEMPLATEPARAMETERCOMPARTMENT_OVERLAP = 5
const TEMPLATEPARAMETERCOMPARTMENT_LEFT_MARGIN = 20
const TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY = 10

const CLASS_ACTIVE_VERTLINE_WIDTH = 3

const NARY_ASSO_NODE_MINWIDTH = 30
const NARY_ASSO_NODE_MINHEIGHT = 22

const PACKAGE_MINWIDTH = 50
const PACKAGE_MINHEIGHT = 40
const PACKAGE_TAB_HEIGHT = 15

const PORT_MINWIDTH = 14
const PORT_MINHEIGHT = 14

const ACTOR_ICON_MINHEIGHT = 55
const ACTOR_ICON_MINWIDTH = 26
const ACTOR_RATIO_PERCENT = (ACTOR_ICON_MINWIDTH / ACTOR_ICON_MINHEIGHT) * 100

const USECASE_MINWIDTH = 70
const USECASE_MINHEIGHT = 32
const USECASE_ICON_MINWIDTH = 70
const USECASE_ICON_MINHEIGHT = 32
const USECASE_RATIO_PERCENT = (USECASE_ICON_MINWIDTH / USECASE_ICON_MINHEIGHT) * 100

const ARTIFACT_ICON_MINWIDTH = 40
const ARTIFACT_ICON_MINHEIGHT = 50
const ARTIFACT_RATIO_PERCENT = (ARTIFACT_ICON_MINWIDTH / ARTIFACT_ICON_MINHEIGHT) * 100

const COMPONENT_MINWIDTH = 50
const COMPONENT_MINHEIGHT = 45
const COMPONENT_ICON_MINWIDTH = 50
const COMPONENT_ICON_MINHEIGHT = 45
const COMPONENT_RATIO_PERCENT = (COMPONENT_ICON_MINWIDTH / COMPONENT_ICON_MINHEIGHT) * 100
const COMPONENT_STATIC_MARGIN = 20
const COMPONENT_RECT_INDENT = 10

const NODE_MINWIDTH = 45
const NODE_MINHEIGHT = 45
const NODE_RATIO_PERCENT = (NODE_MINWIDTH / NODE_MINHEIGHT) * 100
const NODE_STATIC_MARGIN = 10

// State Machine
const STATE_MINWIDTH = 60
const STATE_MINHEIGHT = 40
const STATE_ROUND = 10

const REGION_MINWIDTH = 50
const REGION_MINHEIGHT = 50

const INITIALSTATE_MINWIDTHH = 20
const INITIALSTATE_MINHEIGHT = 20
const FINALSTATE_MINWIDTHH = 26
const FINALSTATE_MINHEIGHT = 26
const HISTORYSTATE_MINWIDTHH = 26
const HISTORYSTATE_MINHEIGHT = 26
const JOIN_MINLENGTH = 70
const JOIN_MINTHICK = 6
const FORK_MINLENGTH = 70
const FORK_MINTHICK = 6
const CHOICE_MINWIDTH = 23
const CHOICE_MINHEIGHT = 19
const JUNCTION_MINWIDTH = 15
const JUNCTION_MINHEIGHT = 15
const ENTRYPOINT_MINWIDTH = 15
const ENTRYPOINT_MINHEIGHT = 15
const EXITPOINT_MINWIDTH = 15
const EXITPOINT_MINHEIGHT = 15
const TERMINATE_MINWIDTH = 26
const TERMINATE_MINHEIGHT = 26

const CONNECTIONPOINT_MINWIDTH = 14
const CONNECTIONPOINT_MINHEIGHT = 14

// Activitie
const ACTION_MINWIDTH = 60
const ACTION_MINHEIGHT = 40
const ACTION_ROUND = 10

const PIN_MINWIDTH = 18
const PIN_MINHEIGHT = 18

const INITIALNODE_MINWIDTH = 20
const INITIALNODE_MINHEIGHT = 20
const ACTIVITYFINALNODE_MINWIDTH = 26
const ACTIVITYFINALNODE_MINHEIGHT = 26
const FLOWFINALNODE_MINWIDTH = 26
const FLOWFINALNODE_MINHEIGHT = 26
const FORKNODE_MINLENGTH = 70
const FORKNODE_MINTHICK = 6
const JOINNODE_MINLENGTH = 70
const JOINNODE_MINTHICK = 6
const MERGENODE_MINWIDTH = 23
const MERGENODE_MINHEIGHT = 19
const DECISIONNODE_MINWIDTH = 23
const DECISIONNODE_MINHEIGHT = 19
const ACTIVITYEDGECONNECTOR_MINWIDTH = 26
// const ACTIVITYEDGECONNECTOR_MINHEIGHT = 26

const SWIMLANE_VERT_MINWIDTH = 50
const SWIMLANE_VERT_MINHEIGHT = 300
const SWIMLANE_HORIZ_MINWIDTH = SWIMLANE_VERT_MINHEIGHT
const SWIMLANE_HORIZ_MINHEIGHT = SWIMLANE_VERT_MINWIDTH
const SWIMLANE_HEADER_TOP_MARGIN = 4
const SWIMLANE_HEADER_BOTTOM_MARGIN = 4
const SWIMLANE_HEADER_LEFT_MARGIN = 10
const SWIMLANE_HEADER_RIGHT_MARGIN = 10
const SWIMLANE_PEN_WIDTH = 2

// Interaction
const COLLABORATION_MINHEIGHT = USECASE_MINHEIGHT
const COLLABORATION_MINWIDTH = USECASE_MINWIDTH

const ACTIVATION_MINWIDTH = 14
const ACTIVATION_MINHEIGHT = 25
const LIFELINE_MINHEIGHT = 50
const LIFELINE_TOP_POSITION = 40
const SEQ_OBJECT_MINHEIGHT = 40
const SEQ_OBJECT_MINWIDTH = 30
const MULTI_INSTANCE_MARGIN = 5
const SELF_MESSAGE_WIDTH = 30
const SELF_MESSAGE_HEIGHT = 20

const DURATION_CONSTRAINT_MIN_WIDTH = 14
const DURATION_CONSTRAINT_MIN_HEIGHT = 16
const DURATION_CONSTRAINT_ARROW_SIZE = 4

const TIMING_STATE_MINHEIGHT = 25
const TIMING_LIFELINE_TOP_PADDING = 25
const TIMING_LIFELINE_BOTTOM_PADDING = 25
const TIME_SEGMENT_HEIGHT = TIMING_STATE_MINHEIGHT

const STATEINVARIANT_MINWIDTH = 50
const STATEINVARIANT_MINHEIGHT = 20

const CONTINUATION_MINWIDTH = 50
const CONTINUATION_MINHEIGHT = 20

const FRAME_MINWIDTH = 80
const FRAME_MINHEIGHT = 30
const FRAME_CONTENT_MINWIDTH = 10
const FRAME_CONTENT_MINHEIGHT = 30

const COMBINEDFRAGMENT_MINWIDTH = FRAME_MINWIDTH
const COMBINEDFRAGMENT_CONTENT_MINHEIGHT = FRAME_CONTENT_MINHEIGHT

const INTERACTIONOPERAND_MINWIDTH = COMBINEDFRAGMENT_MINWIDTH
const INTERACTIONOPERAND_MINHEIGHT = COMBINEDFRAGMENT_CONTENT_MINHEIGHT
const INTERACTIONOPERAND_GUARD_HORZ_MARGIN = 20
const INTERACTIONOPERAND_GUARD_VERT_MARGIN = 15

const HYPERLINK_MINWIDTH = 100
const HYPERLINK_MINHEIGHT = 20

const CUSTOM_TEXT_MINWIDTH = 10
const CUSTOM_TEXT_MINHEIGHT = 10

const NOTE_FOLDING_SIZE = 10

const MESSAGEENDPOINT_MINWIDTH = 15
const MESSAGEENDPOINT_MINHEIGHT = 15

function hasValue (value) {
  return (value && value.length > 0)
}

function getTheta (x1, y1, x2, y2) {
  var x = x1 - x2
  var y = y1 - y2
  var th = Math.atan(Math.abs(y) / (Math.abs(x) + 0.0000000001))
  if (x > 0) {
    if (y > 0) {
      th = Math.PI - th
    } else {
      th = th + Math.PI
    }
  } else if (y < 0) {
    th = 2 * Math.PI - th
  }
  return th
}

/**
 * Draw image
 * @private
 * @param {View} view
 * @param {Canvas} canvas
 * @param {Rect} rect
 * @param {type.UMLImage} image
 */
function drawStereotypeIcon (view, canvas, rect, image) {
  if (image) {
    if (image.content) {
      if (image.content.startsWith('!icon')) {
        canvas.drawIconScript(rect, image.content, view)
      } else {
        try {
          // eval(image.content)
          const fun = `
            "use strict";
            return (
              function(canvas,rect) {
                const global=undefined;
                const require=undefined;
                const window=undefined;
                const document=undefined;
                const app=undefined;
                ${image.content}
              }
            )
          `
          // eslint-disable-next-line no-new-func
          return Function(fun)()(canvas, rect)
        } catch (err) {
          console.log(err)
        }
      }
    } else if (image.image) {
      try {
        const img = JSON.parse(image.image)
        if (!image.__img) {
          image.__img = new Image()
          image.__state = 0
        }
        let r0 = rect.getHeight() / rect.getWidth()
        let r = img.height / img.width
        let w = rect.getWidth()
        let h = rect.getHeight()
        if (r0 < r) { // fit to height
          w = h / r
        } else { // fit to width
          h = w * r
        }
        let x = rect.x1 + Math.round((rect.getWidth() - w) / 2)
        let y = rect.y1 + Math.round((rect.getHeight() - h) / 2)
        if (image.__state === 2) { // loaded
          canvas.drawImage(image.__img, x, y, w, h)
        } else if (image.__state === 0) { // not loaded
          image.__state = 1 // loading
          image.__img.src = img.data
          image.__img.onload = () => {
            image.__state = 2 // loaded
            canvas.drawImage(image.__img, x, y, w, h)
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}

/**
 * Get name of variant
 * @param {string|Element} variant
 */
function getVarName (variant) {
  if (_.isString(variant) && variant.length > 0) {
    return variant
  } else if (variant && variant.name) {
    return variant.name
  }
  return null
}

/**************************************************************************
 *                                                                        *
 *                                 BACKBONE                               *
 *                                                                        *
 **************************************************************************/

/**
 * UMLElementMixin
 * @mixin
 */
var UMLElementMixin = {

  /**
   * Get class name for display
   * @memberof UMLElementMixin
   * @return {string}
   */
  getDisplayClassName: function () {
    var name = this.getClassName()
    return name.substring(3, name.length)
  },

  /**
   * Get visibility string
   * @memberof UMLElementMixin
   * @return {string}
   */
  getVisibilityString: function () {
    switch (this.visibility) {
    case UMLModelElement.VK_PUBLIC:
      return '+'
    case UMLModelElement.VK_PROTECTED:
      return '#'
    case UMLModelElement.VK_PRIVATE:
      return '-'
    case UMLModelElement.VK_PACKAGE:
      return '~'
    }
  },

  /**
   * Get string representation of this element
   * @memberof UMLElementMixin
   * @param {object} options
   * @return {string}
   */
  getString: function (options) {
    var _string = this.name
    if (options && options.showVisibility === true) {
      _string = this.getVisibilityString() + _string
    }
    return _string
  },

  /**
   * Get stereotype string
   * @memberof UMLElementMixin
   * @return {string}
   */
  getStereotypeString: function () {
    if (_.isString(this.stereotype) && (this.stereotype.length > 0)) {
      return '«' + this.stereotype + '»'
    } else if (this.stereotype instanceof type.Model) {
      return '«' + this.stereotype.name + '»'
    }
    return ''
  },

  /**
   * Get namespace string
   * @memberof UMLElementMixin
   * @return {string}
   */
  getNamespaceString: function () {
    if (this._parent) {
      return '(from ' + this._parent.name + ')'
    } else {
      return '(from Root)'
    }
  },

  /**
   * Return an array of tag strings
   * @memberof UMLElementMixin
   * @return {Array.<string>}
   */
  getTagStringArray: function () {
    var tagArray = []
    if (this.tags && this.tags.length > 0) {
      var i, len, tag
      for (i = 0, len = this.tags.length; i < len; i++) {
        tag = this.tags[i]
        const str = tag.toString()
        if (str) {
          tagArray.push(str)
        }
      }
    }
    return tagArray
  },

  /**
   * Return property string
   * @return {string}
   */
  getPropertyString: function () {
    var props = this.getTagStringArray()
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }
}

/**
 * UMLModelElement
 */
class UMLModelElement extends type.ExtensibleModel {

  constructor () {
    super()

    /** @member {UMLStereotype} */
    this.stereotype = null

    /**
     * Visiblity of the element. One of the values of `UMLModelElement.VK_*`
     * @member {string}
     */
    this.visibility = UMLModelElement.VK_PUBLIC

    /** @member {Array.<UMLTemplateParameter>} */
    this.templateParameters = []

    // mixin UMLElementMixin
    _.extend(UMLModelElement.prototype, UMLElementMixin)
  }

  getNodeText (options) {
    var text = ''
    options = options || {}
    // stereotype
    if (options.showStereotype !== false) {
      text += this.getStereotypeString()
    }
    // name and type
    if (this.name && this.name.length > 0) {
      text += this.name
    } else {
      text += '(' + this.getDisplayClassName() + ')'
    }
    return text
  }

  getNodeIcon () {
    if (this.stereotype && this.stereotype.icon && this.stereotype.icon.smallIcon && this.stereotype.icon.smallIcon.trim().length > 0) {
      return this.stereotype.getIconClass()
    }
    return type.ExtensibleModel.prototype.getNodeIcon.call(this)
  }

  /**
   * Get dependencies
   *
   * @return {Array.<Element>}
   */
  getDependencies () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLDependency) && (r.source === self)
    })
    return _.map(rels, function (g) { return g.target })
  }

  /**
   * Get dependants
   *
   * @return {Array.<Element>}
   */
  getDependants () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLDependency) && (r.target === self)
    })
    return _.map(rels, function (g) { return g.source })
  }

  /**
   * Get constraints of this element
   *
   * @return {Array.<UMLConstraint>}
   */
  getConstraints () {
    return _.filter(this.ownedElements, function (e) { return (e instanceof type.UMLConstraint) })
  }

  /**
   * Get textual notation
   */
  get textualNotation () {
    let str = this.name
    let stereotype = getVarName(this.stereotype)
    if (stereotype) {
      str = '<<' + stereotype + '>>' + str
    }
    return str
  }

  /**
   * Get a string representation
   * @param {object} options
   * @return {string}
   */
  getString (options) {
    return this.textualNotation
  }
}

/**
 * UMLVisibilityKind: `public`
 * @const {string}
 */
UMLModelElement.VK_PUBLIC = 'public'

/**
 * UMLVisibilityKind: `protected`
 * @const {string}
 */
UMLModelElement.VK_PROTECTED = 'protected'

/**
 * UMLVisibilityKind: `private`
 * @const {string}
 */
UMLModelElement.VK_PRIVATE = 'private'

/**
 * UMLVisibilityKind: `package`
 * @const {string}
 */
UMLModelElement.VK_PACKAGE = 'package'

/**
 * UMLFeature
 */
class UMLFeature extends UMLModelElement {

  constructor () {
    super()

    /** @member {boolean} */
    this.isStatic = false

    /** @member {boolean} */
    this.isLeaf = false

    /** @member {string} */
    this.featureDirection = UMLFeature.DK_PROVIDED
  }
}

/**
 * UMLFeatureDirectionKind: `provided`
 * @const {string}
 */
UMLFeature.FD_PROVIDED = 'provided'

/**
 * UMLFeatureDirectionKind: `required`
 * @const {string}
 */
UMLFeature.FD_REQUIRED = 'required'

/**
 * UMLFeatureDirectionKind: `providedRequired`
 * @const {string}
 */
UMLFeature.FD_PROVIDEDREQUIRED = 'providedRequired'

/**
 * UMLStructuralFeature
 */
class UMLStructuralFeature extends UMLFeature {

  constructor () {
    super()

    /** @member {any} */
    this.type = ''

    /** @member {string} */
    this.multiplicity = ''

    /** @member {boolean} */
    this.isReadOnly = false

    /** @member {boolean} */
    this.isOrdered = false

    /** @member {boolean} */
    this.isUnique = false

    /** @member {string} */
    this.defaultValue = ''
  }

  /**
   * Get type string
   *
   * @return {string}
   */
  getTypeString () {
    if (this.type) {
      if (_.isString(this.type) && (this.type.length > 0)) {
        return this.type
      } else if ((this.type !== null) && (this.type.name)) {
        return this.type.name
      }
    }
    return null
  }

  getPropertyString () {
    var props = []
    if (this.isReadOnly === true) { props.push('readOnly') }
    if (this.isOrdered === true) { props.push('ordered') }
    if (this.isUnique === true) { props.push('unique') }
    props = _.union(props, this.getTagStringArray())
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }

  getString (options) {
    var text = ''
    text += this.name
    if (options && options.showType) {
      text += (this.getTypeString() !== null ? ': ' + this.getTypeString() : '')
    }
    if (options && options.showMultiplicity) {
      text += (this.multiplicity.length > 0 ? '[' + this.multiplicity + ']' : '')
    }
    text += (this.defaultValue.length > 0 ? ' = ' + this.defaultValue : '')
    if (options && options.showProperty) {
      var prop = this.getPropertyString()
      text += (prop.length > 0 ? ' ' + prop : '')
    }
    return text
  }

}

/**
 * UMLParameter
 */
class UMLParameter extends UMLStructuralFeature {

  constructor () {
    super()

    /** @member {string} */
    this.direction = UMLParameter.DK_IN
  }

  /**
     * Get parameter direction string
     *
     * @return {string}
     */
  getDirectionString (options) {
    switch (this.direction) {
    case UMLParameter.DK_IN:
      return ''
    case UMLParameter.DK_INOUT:
      return 'inout '
    case UMLParameter.DK_OUT:
      return 'out '
    case UMLParameter.DK_RETURN:
      return ''
    }
  }

  getString (options) {
    var text = ''
    text += this.getDirectionString()
    text += this.name
    if (options && options.showType) {
      text += (this.getTypeString() !== null ? ': ' + this.getTypeString() : '')
    }
    if (options && options.showMultiplicity) {
      text += (this.multiplicity.length > 0 ? '[' + this.multiplicity + ']' : '')
    }
    text += (this.defaultValue.length > 0 ? ' = ' + this.defaultValue : '')
    return text
  }
}

/**
 * UMLDirectionKind: `in`
 * @const {string}
 */
UMLParameter.DK_IN = 'in'

/**
 * UMLDirectionKind: `inout`
 * @const {string}
 */
UMLParameter.DK_INOUT = 'inout'

/**
 * UMLDirectionKind: `out`
 * @const {string}
 */
UMLParameter.DK_OUT = 'out'

/**
 * UMLDirectionKind: `return`
 * @const {string}
 */
UMLParameter.DK_RETURN = 'return'

/**
 * UMLBehavioralFeature
 */
class UMLBehavioralFeature extends UMLFeature {

  constructor () {
    super()

    /** @member {Array.<UMLParameter>} */
    this.parameters = []

    /** @member {Array.<UMLSignal>} */
    this.raisedExceptions = []

    /** @member {string} */
    this.concurrency = UMLBehavioralFeature.CCK_SEQUENTIAL
  }

  /**
   * Get return parameter(s)
   *
   * @return {UMLParameter}
   */
  getReturnParameter () {
    var i, len
    for (i = 0, len = this.parameters.length; i < len; i++) {
      var param = this.parameters[i]
      if (param.direction === UMLParameter.DK_RETURN) {
        return param
      }
    }
    return null
  }

  /**
   * Get non-return parameters
   *
   * @return {Array.<UMLParameter>}
   */
  getNonReturnParameters () {
    var i, len
    var params = []
    for (i = 0, len = this.parameters.length; i < len; i++) {
      var param = this.parameters[i]
      if (param.direction !== UMLParameter.DK_RETURN) {
        params.push(param)
      }
    }
    return params
  }

  /**
   * Get parameters string
   *
   * @return {string}
   */
  getParametersString (options) {
    var i, len
    var terms = []
    var params = this.getNonReturnParameters()
    for (i = 0, len = params.length; i < len; i++) {
      var param = params[i]
      terms.push(param.getString(options))
    }
    return '(' + terms.join(', ') + ')'
  }

  /**
   * Get return parameter string
   *
   * @return {string}
   */
  getReturnString (options) {
    var returnParam = this.getReturnParameter()
    var text = ''
    if (returnParam) {
      if (options && options.showType) {
        text += returnParam.getTypeString()
      }
      if (options && options.showMultiplicity) {
        text += (returnParam.multiplicity.length > 0 ? '[' + returnParam.multiplicity + ']' : '')
      }
    }
    return text
  }

  getString (options) {
    var text = ''
    if (options && (options.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
      text += this.getStereotypeString()
    }
    if (options && options.showVisibility) {
      text += this.getVisibilityString()
    }
    text += this.name
    if (options && options.showOperationSignature) {
      text += this.getParametersString(options)
      text += (this.getReturnString(options).length > 0 ? ': ' + this.getReturnString(options) : '')
    } else {
      text += '()'
    }
    if (options && options.showProperty) {
      var prop = this.getPropertyString()
      text += (prop.length > 0 ? ' ' + prop : '')
    }
    return text
  }
}

/**
 * UMLCallConcurrencyKind: `sequential`
 * @const {string}
 */
UMLBehavioralFeature.CCK_SEQUENTIAL = 'sequential'

/**
 * UMLCallConcurrencyKind: `guarded`
 * @const {string}
 */
UMLBehavioralFeature.CCK_GUARDED = 'guarded'

/**
 * UMLCallConcurrencyKind: `concurrent`
 * @const {string}
 */
UMLBehavioralFeature.CCK_CONCURRENT = 'concurrent'

/**
 * UMLAttribute
 */
class UMLAttribute extends UMLStructuralFeature {

  constructor () {
    super()

    /** @member {string} */
    this.isDerived = false

    /** @member {string} */
    this.aggregation = UMLAttribute.AK_NONE

    /** @member {boolean} */
    this.isID = false
  }

  getPropertyString () {
    var props = []
    if (this.isID === true) { props.push('id') }
    if (this.isReadOnly === true) { props.push('readOnly') }
    if (this.isOrdered === true) { props.push('ordered') }
    if (this.isUnique === true) { props.push('unique') }
    props = _.union(props, this.getTagStringArray())
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }

  getString (options) {
    var text = ''
    if (options && (options.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
      text += this.getStereotypeString()
    }
    if (options && options.showVisibility) {
      text += this.getVisibilityString()
    }
    text += (this.isDerived === true ? '/' : '')
    text += this.name
    if (options && options.showType) {
      text += (this.getTypeString() !== null ? ': ' + this.getTypeString() : '')
    }
    if (options && options.showMultiplicity) {
      text += (this.multiplicity.length > 0 ? '[' + this.multiplicity + ']' : '')
    }
    text += (this.defaultValue.length > 0 ? ' = ' + this.defaultValue : '')
    if (options && options.showProperty) {
      var prop = this.getPropertyString()
      text += (prop.length > 0 ? ' ' + prop : '')
    }
    return text
  }

  get textualNotation () {
    let str = super.textualNotation
    let type = getVarName(this.type)
    if (type) {
      str = str + ': ' + type
    }
    if (this.multiplicity && this.multiplicity.length > 0) {
      str = str + '[' + this.multiplicity + ']'
    }
    if (this.defaultValue) {
      str = str + ' = ' + this.defaultValue
    }
    return str
  }
}

/**
 * UMLAggregationKind: `none`
 * @const {string}
 */
UMLAttribute.AK_NONE = 'none'

/**
 * UMLAggregationKind: `shared`
 * @const {string}
 */
UMLAttribute.AK_SHARED = 'shared'

/**
 * UMLAggregationKind: `composite`
 * @const {string}
 */
UMLAttribute.AK_COMPOSITE = 'composite'

/**
 * UMLOperation
 */
class UMLOperation extends UMLBehavioralFeature {

  constructor () {
    super()

    /** @member {boolean} */
    this.isQuery = false

    /** @member {boolean} */
    this.isAbstract = false

    /** @member {string} */
    this.specification = ''

    /** @member {Array.<UMLConstraint>} */
    this.preconditions = []

    /** @member {Array.<UMLConstraint>} */
    this.bodyConditions = []

    /** @member {Array.<UMLConstraint>} */
    this.postconditions = []
  }

  getPropertyString () {
    var props = []
    if (this.isQuery === true) { props.push('query') }
    var returnParam = this.getReturnParameter()
    if (returnParam) {
      if (returnParam.isOrdered === true) { props.push('ordered') }
      if (returnParam.isUnique === true) { props.push('unique') }
    }
    props = _.union(props, this.getTagStringArray())
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }

  get textualNotation () {
    let str = super.textualNotation
    let paramStr = []
    let params = this.getNonReturnParameters()
    if (params && params.length > 0) {
      _.each(params, param => {
        let s = param.name
        if (param.direction) { s = param.direction + ' ' + s }
        let paramType = getVarName(param.type)
        if (paramType) { s = s + ':' + paramType }
        if (param.multiplicity && param.multiplicity.length > 0) { s = s + '[' + param.multiplicity + ']' }
        if (param.defaultValue) { s = s + ' = ' + param.defaultValue }
        paramStr.push(s)
      })
    }
    str = str + '(' + paramStr.join(', ') + ')'
    let returnParam = this.getReturnParameter()
    if (returnParam) {
      let returnType = getVarName(returnParam.type)
      if (returnType) {
        str = str + ': ' + returnType
      }
      if (returnParam.multiplicity && returnParam.multiplicity.length > 0) {
        str = str + '[' + returnParam.multiplicity + ']'
      }
    }
    return str
  }
}

/**
 * UMLReception
 */
class UMLReception extends UMLBehavioralFeature {

  constructor () {
    super()

    /** @member {UMLSignal} */
    this.signal = null
  }

  getNodeText (options) {
    if (this.signal instanceof type.UMLSignal) {
      return '(«signal» ' + this.signal.name + ')'
    }
    return UMLModelElement.prototype.getNodeText.call(this)
  }

  getString (options) {
    if (this.signal instanceof UMLSignal) {
      var text = ''
      if (options && (options.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
        text += '«signal»'
      }
      if (options && options.showVisibility) {
        text += this.getVisibilityString()
      }
      text += this.signal.name
      if (options && options.showOperationSignature) {
        var i, len, attr, term, _type
        var terms = []
        for (i = 0, len = this.signal.attributes.length; i < len; i++) {
          attr = this.signal.attributes[i]
          term = attr.name
          if (options.showType) {
            _type = attr.getTypeString()
            if (_type) {
              term += ': ' + attr.getTypeString()
            }
          }
          terms.push(term)
        }
        text += '(' + terms.join(', ') + ')'
      } else {
        text += '()'
      }
      if (options && options.showProperty) {
        var prop = this.getPropertyString()
        text += (prop.length > 0 ? ' ' + prop : '')
      }
      return text
    } else {
      return UMLBehavioralFeature.prototype.getString.call(this, options)
    }
  }
}

/**
 * UMLClassifier
 */
class UMLClassifier extends UMLModelElement {

  constructor () {
    super()

    /** @member {Array.<UMLAttribute>} */
    this.attributes = []

    /** @member {Array.<UMLOperation>} */
    this.operations = []

    /** @member {Array.<UMLReception>} */
    this.receptions = []

    /** @member {Array.<UMLBehavior>} */
    this.behaviors = []

    /** @member {boolean} */
    this.isAbstract = false

    /** @member {boolean} */
    this.isFinalSpecialization = false

    /** @member {boolean} */
    this.isLeaf = false
  }

  getPropertyString () {
    var props = []
    if (this.isLeaf === true) { props.push('leaf') }
    props = _.union(props, this.getTagStringArray())
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }

  /**
   * Get general elements
   *
   * @param {boolean} includeInterfaces
   * @return {Array.<Element>}
   */
  getGeneralElements (includeInterfaces) {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return ((r instanceof type.UMLGeneralization) && (r.source === self)) ||
        (includeInterfaces && (r instanceof type.UMLInterfaceRealization) && (r.source === self))
    })
    return _.map(rels, function (g) { return g.target })
  }

  /**
   * Get special elements
   *
   * @param {boolean} includeInterfaces
   * @return {Array.<Element>}
   */
  getSpecialElements (includeInterfaces) {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return ((r instanceof type.UMLGeneralization) && (r.target === self)) ||
        (includeInterfaces && (r instanceof type.UMLInterfaceRealization) && (r.target === self))
    })
    return _.map(rels, function (g) { return g.source })
  }

  /**
   * Get ancestors
   *
   * @param {boolean} includeInterfaces
   * @return {Array.<Element>}
   */
  getAncestors (includeInterfaces) {
    var ancestors = this.getGeneralElements(includeInterfaces)
    var size = 0
    do {
      size = ancestors.length
      _.each(ancestors, function (e) {
        ancestors = _.union(ancestors, e.getGeneralElements(includeInterfaces))
      })
    } while (size < ancestors.length)
    return ancestors
  }

  /**
   * Get descendants
   *
   * @param {boolean} includeInterfaces
   * @return {Array.<Element>}
   */
  getDescendants (includeInterfaces) {
    var descendants = this.getSpecialElements(includeInterfaces)
    var size = 0
    do {
      size = descendants.length
      _.each(descendants, function (e) {
        descendants = _.union(descendants, e.getSpecialElements(includeInterfaces))
      })
    } while (size < descendants.length)
    return descendants
  }

  /**
   * Check a given element is a general element of this element
   *
   * @param {Element} elem
   * @param {boolean} includeInterfaces
   * @return {Array.<Element>}
   */
  isGeneralElement (elem, includeInterfaces) {
    return _.includes(this.getGeneralElements(includeInterfaces), elem)
  }

  /**
   * Check a given element is a special element of this element
   *
   * @param {Element} elem
   * @param {boolean} includeInterfaces
   * @return {Array.<Element>}
   */
  isSpecialElement (elem, includeInterfaces) {
    return _.includes(this.getSpecialElements(includeInterfaces), elem)
  }

  /**
   * Check a given element is an ancestor of this element
   *
   * @param {Element} elem
   * @param {boolean} includeInterfaces
   * @return {Array.<Element>}
   */
  isAncestor (elem, includeInterfaces) {
    return _.includes(this.getAncestors(includeInterfaces), elem)
  }

  /**
   * Check a given element is a descendant of this element
   *
   * @param {Element} elem
   * @param {boolean} includeInterfaces
   * @return {Array.<Element>}
   */
  isDescendant (elem, includeInterfaces) {
    return _.includes(this.getDescendants(includeInterfaces), elem)
  }

  /**
   * Get all inherited attributes
   *
   * @param {boolean} includeInterfaces
   * @return {Array.<UMLAttribute>}
   */
  getInheritedAttributes (includeInterfaces) {
    var ancestors = this.getAncestors(includeInterfaces)
    var inherited = []
    _.each(ancestors, function (e) {
      if (Array.isArray(e.attributes)) {
        Array.prototype.push.apply(inherited, e.attributes)
      }
    })
    return inherited
  }

  /**
   * Get all inherited operations
   *
   * @param {boolean} includeInterfaces
   * @return {Array.<UMLOperation>}
   */
  getInheritedOperations (includeInterfaces) {
    var ancestors = this.getAncestors(includeInterfaces)
    var interfaces = this.getInterfaces()
    var inherited = []
    _.each(ancestors, function (e) {
      if (Array.isArray(e.operations)) {
        Array.prototype.push.apply(inherited, e.operations)
      }
    })
    if (includeInterfaces) {
      _.each(interfaces, function (e) {
        if (Array.isArray(e.operations)) {
          Array.prototype.push.apply(inherited, e.getInheritedOperations(includeInterfaces))
          Array.prototype.push.apply(inherited, e.operations)
        }
      })
    }
    return inherited
  }

  /**
   * Get all interfaces of this element is realizing
   *
   * @return {Array.<UMLInterface>}
   */
  getInterfaces () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLInterfaceRealization) && (r.source === self)
    })
    return _.map(rels, function (g) { return g.target })
  }

  /**
   * Get all components of this element is realizing
   *
   * @return {Array.<UMLComponent>}
   */
  getComponents () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLComponentRealization) && (r.source === self)
    })
    return _.map(rels, function (g) { return g.target })
  }

  /**
   * Get all nodes where this element is deployed
   *
   * @return {Array.<Element>}
   */
  getDeploymentTargets () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLDeployment) && (r.source === self)
    })
    return _.map(rels, function (g) { return g.target })
  }

  /**
   * Get all association ends linked to this element
   *
   * @param {boolean} opposite Returns whether opposite-side association ends or not.
   * @return {Array.<UMLAssociationEnd>}
   */
  getAssociationEnds (opposite) {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) { return (r instanceof type.UMLAssociation) })
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
 * UMLTemplateParameter
 */
class UMLTemplateParameter extends UMLClassifier {

  constructor () {
    super()

    /** @member {string} */
    this.parameterType = ''

    /** @member {string} */
    this.defaultValue = ''
  }

  getString (options) {
    var text = ''
    text += this.getStereotypeString()
    text += this.name
    if (options && options.showType) {
      text += (getVarName(this.parameterType) !== null ? ': ' + getVarName(this.parameterType) : '')
    }
    text += (getVarName(this.defaultValue) !== null ? ' = ' + getVarName(this.defaultValue) : '')
    return text
  }

  get textualNotation () {
    let str = this.name
    if (this.parameterType) { str = str + ': ' + this.parameterType }
    if (this.defaultValue) { str = str + ' = ' + this.defaultValue }
    return str
  }
}

/**
 * UMLDirectedRelationship
 */
class UMLDirectedRelationship extends type.DirectedRelationship {

  constructor () {
    super()

    /** @member {UMLStereotype} */
    this.stereotype = null

    /** @member {string} */
    this.visibility = UMLModelElement.VK_PUBLIC
    // mixin UMLElementMixin
    _.extend(UMLDirectedRelationship.prototype, UMLElementMixin)
  }

  /**
   * Get textual notation
   */
  get textualNotation () {
    let str = this.name
    let stereotype = getVarName(this.stereotype)
    if (stereotype) {
      str = '<<' + stereotype + '>>' + str
    }
    return str
  }
}

/**
 * UMLRelationshipEnd
 */
class UMLRelationshipEnd extends type.RelationshipEnd {

  constructor () {
    super()

    /** @member {UMLStereotype} */
    this.stereotype = null

    /** @member {string} */
    this.visibility = UMLModelElement.VK_PUBLIC

    /** @member {string} */
    this.navigable = UMLRelationshipEnd.NK_UNSPECIFIED

    /** @member {string} */
    this.aggregation = UMLAttribute.AK_NONE

    /** @member {string} */
    this.multiplicity = ''

    /** @member {string} */
    this.defaultValue = ''

    /** @member {boolean} */
    this.isReadOnly = false

    /** @member {boolean} */
    this.isOrdered = false

    /** @member {boolean} */
    this.isUnique = false

    /** @member {boolean} */
    this.isDerived = false

    /** @member {boolean} */
    this.isID = false

    // mixin UMLElementMixin
    _.extend(UMLRelationshipEnd.prototype, UMLElementMixin)
  }

  getPropertyString () {
    var props = []
    if (this.isID === true) { props.push('id') }
    if (this.isReadOnly === true) { props.push('readOnly') }
    if (this.isOrdered === true) { props.push('ordered') }
    if (this.isUnique === true) { props.push('unique') }
    props = _.union(props, this.getTagStringArray())
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }

  /**
   * Get textual notation
   */
  get textualNotation () {
    let str = this.name
    let stereotype = getVarName(this.stereotype)
    if (stereotype) {
      str = '<<' + stereotype + '>>' + str
    }
    return str
  }
}

/**
 * UMLNavigableKind: `unspecified`
 * @const {string}
 */
UMLRelationshipEnd.NK_UNSPECIFIED = 'unspecified'

/**
 * UMLNavigableKind: `navigable`
 * @const {string}
 */
UMLRelationshipEnd.NK_NAVIGABLE = 'navigable'

/**
 * UMLNavigableKind: `notNavigable`
 * @const {string}
 */
UMLRelationshipEnd.NK_NOTNAVIGABLE = 'notNavigable'

/**
 * UMLUndirectedRelationship
 */
class UMLUndirectedRelationship extends type.UndirectedRelationship {

  constructor () {
    super()

    /** @member {UMLStereotype} */
    this.stereotype = null

    /** @member {string} */
    this.visibility = UMLModelElement.VK_PUBLIC

    // mixin UMLElementMixin
    _.extend(UMLUndirectedRelationship.prototype, UMLElementMixin)
  }

  getNodeText (options) {
    var text = ''
    options = options || {}
    // stereotype
    if (options.showStereotype !== false) {
      text += this.getStereotypeString()
    }
    // name and type
    if (this.name && this.name.length > 0) {
      text += this.name + ' '
    }
    // end1 and end2
    text += '(' + this.end1.reference.name + '—' + this.end2.reference.name + ')'
    return text.trim()
  }

  /**
   * Get textual notation
   */
  get textualNotation () {
    let str = this.name
    let stereotype = getVarName(this.stereotype)
    if (stereotype) {
      str = '<<' + stereotype + '>>' + str
    }
    return str
  }
}

/**************************************************************************
 *                                                                        *
 *                              CONSTRAINTS                               *
 *                                                                        *
 **************************************************************************/

/**
 * UMLConstraint
 */
class UMLConstraint extends UMLModelElement {

  constructor () {
    super()

    /** @member {string} */
    this.specification = ''

    /** @member {Array.<UMLModelElement>} */
    this.constrainedElements = []
  }

  getNodeText (options) {
    var text = ''
    options = options || {}
    // stereotype
    if (options.showStereotype !== false) {
      if (_.isString(this.stereotype) && (this.stereotype.length > 0)) {
        text += '«' + this.stereotype + '» '
      } else if (this.stereotype !== null) {
        text += '«' + this.stereotype.name + '» '
      }
    }
    // name and type
    if (this.name && this.name.length > 0) {
      text += this.name
    } else {
      text += '(' + this.getDisplayClassName() + ')'
    }
    // collection name
    var collection = this.getParentField()
    if (collection !== 'ownedElements') {
      text += ' <@' + collection + '>'
    }
    return text
  }
}

/**
 * UMLIntervalConstraint
 */
class UMLIntervalConstraint extends UMLConstraint {
  constructor () {
    super()

    /** @member {string} */
    this.min = ''

    /** @member {string} */
    this.max = ''
  }

  getNodeIcon () {
    return 'staruml-icon icon-UMLConstraint'
  }
}

/**
 * UMLTimeConstraint
 */
class UMLTimeConstraint extends UMLIntervalConstraint {}

/**
 * UMLDurationConstraint
 */
class UMLDurationConstraint extends UMLIntervalConstraint {}

/**************************************************************************
 *                                                                        *
 *                           COMMON BEHAVIORS                             *
 *                                                                        *
 **************************************************************************/

/**
 * UMLBehavior
 */
class UMLBehavior extends UMLModelElement {

  constructor () {
    super()

    /** @member {boolean} */
    this.isReentrant = true

    /** @member {string} */
    this.parameters = []

    /** @member {string} */
    this.preconditions = []

    /** @member {string} */
    this.postconditions = []
  }
}

/**
 * UMLOpaqueBehavior
 */
class UMLOpaqueBehavior extends UMLBehavior {}

/**
 * UMLEvent
 */
class UMLEvent extends UMLModelElement {

  constructor () {
    super()

    /** @member {string} */
    this.kind = UMLEvent.EK_ANYRECEIVE

    /** @member {string} */
    this.value = ''

    /** @member {string} */
    this.expression = ''

    /** @member {UMLOperation} */
    this.targetOperation = null

    /** @member {UMLSignal} */
    this.targetSignal = null
  }
}

/**
 * UMLEventKind: `signal`
 * @const {string}
 */
UMLEvent.EK_SIGNAL = 'signal'

/**
 * UMLEventKind: `call`
 * @const {string}
 */
UMLEvent.EK_CALL = 'call'

/**
 * UMLEventKind: `change`
 * @const {string}
 */
UMLEvent.EK_CHANGE = 'change'

/**
 * UMLEventKind: `time`
 * @const {string}
 */
UMLEvent.EK_TIME = 'time'

/**
 * UMLEventKind: `anyReceive`
 * @const {string}
 */
UMLEvent.EK_ANYRECEIVE = 'anyReceive'

/**************************************************************************
 *                                                                        *
 *                                  CLASSES                               *
 *                                                                        *
 **************************************************************************/

/**
 * UMLPackage
 */
class UMLPackage extends UMLModelElement {

  constructor () {
    super()

    /** @member {Array.<UMLModelElement>} */
    this.importedElements = []
  }

  canContainDiagramKind (kind) {
    return (kind === 'UMLClassDiagram') ||
      (kind === 'UMLPackageDiagram') ||
      (kind === 'UMLObjectDiagram') ||
      (kind === 'UMLCompositeStructureDiagram') ||
      (kind === 'UMLComponentDiagram') ||
      (kind === 'UMLDeploymentDiagram') ||
      (kind === 'UMLUseCaseDiagram')
  }

  canContainKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLClassifier') ||
      app.metamodels.isKindOf(kind, 'UMLPackage') ||
      app.metamodels.isKindOf(kind, 'UMLInstance') ||
      app.metamodels.isKindOf(kind, 'UMLStateMachine') ||
      app.metamodels.isKindOf(kind, 'UMLActivity') ||
      !app.metamodels.isKindOf(kind, 'UMLModelElement') // to include Flowchart, DFD, ERD
  }
}

/**
 * UMLModel
 */
class UMLModel extends UMLPackage {

  constructor () {
    super()

    /** @member {string} */
    this.viewpoint = ''
  }
}

/**
 * UMLClass
 */
class UMLClass extends UMLClassifier {

  constructor () {
    super()

    /** @member {boolean} */
    this.isActive = false
  }
}

/**
 * UMLInterface
 */
class UMLInterface extends UMLClassifier {

  /**
   * Get all implementing classifiers of this interfaces
   *
   * @return {Array.<UMLClassifier>}
   */
  getImplementingClassifiers () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLInterfaceRealization) && (r.target === self)
    })
    return _.map(rels, function (g) { return g.source })
  }
}

/**
 * UMLSignal
 */
class UMLSignal extends UMLClassifier {}

/**
 * UMLDataType
 */
class UMLDataType extends UMLClassifier {}

/**
 * UMLPrimitiveType
 */
class UMLPrimitiveType extends UMLDataType {}

/**
 * UMLEnumerationLiteral
 */
class UMLEnumerationLiteral extends UMLModelElement {

  getString (options) {
    var text = ''
    if (options && (options.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
      text += this.getStereotypeString()
    }
    text += this.name
    if (options && options.showProperty) {
      var prop = this.getPropertyString()
      text += (prop.length > 0 ? ' ' + prop : '')
    }
    return text
  }
}

/**
 * UMLEnumeration
 */
class UMLEnumeration extends UMLDataType {

  constructor () {
    super()

    /** @member {Array.<UMLEnumerationLiteral>} */
    this.literals = []
  }
}

/**
 * UMLDependency
 */
class UMLDependency extends UMLDirectedRelationship {

  constructor () {
    super()

    /** @member {string} */
    this.mapping = ''
  }
}

/**
 * UMLAbstraction
 */
class UMLAbstraction extends UMLDependency {}

/**
 * UMLRealization
 */
class UMLRealization extends UMLAbstraction {}

/**
 * UMLGeneralization
 */
class UMLGeneralization extends UMLDirectedRelationship {

  constructor () {
    super()

    /** @member {string} */
    this.discriminator = ''
  }
}

/**
 * UMLInterfaceRealization
 */
class UMLInterfaceRealization extends UMLRealization {}

/**
 * UMLComponentRealization
 */
class UMLComponentRealization extends UMLRealization {}

/**
 * UMLAssociationEnd
 */
class UMLAssociationEnd extends UMLRelationshipEnd {

  constructor () {
    super()

    /** @member {Array.<UMLAttribute>} */
    this.qualifiers = []

    /** @member {UMLAttribute} */
    this.ownerAttribute = null
  }

  getPropertyString () {
    var props = []
    if (this.isID === true) { props.push('id') }
    if (this.isReadOnly === true) { props.push('readOnly') }
    if (this.isOrdered === true) { props.push('ordered') }
    if (this.isUnique === true) { props.push('unique') }
    props = _.union(props, this.getTagStringArray())
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }

  getOppositeEnd () {
    if (this._parent) {
      return this._parent.end1 === this ? this._parent.end2 : this._parent.end1
    }
    return null
  }
}

/**
 * UMLAssociation
 */
class UMLAssociation extends UMLUndirectedRelationship {

  constructor () {
    super()

    /** @member {UMLAssociationEnd} */
    this.end1 = new UMLAssociationEnd()
    this.end1._parent = this

    /** @member {UMLAssociationEnd} */
    this.end2 = new UMLAssociationEnd()
    this.end2._parent = this

    /** @member {boolean} */
    this.isDerived = false
  }
}

/**
 * UMLAssociationClassLink
 */
class UMLAssociationClassLink extends UMLModelElement {

  constructor () {
    super()

    /** @member {UMLClass} */
    this.classSide = null

    /** @member {UMLAssociation} */
    this.associationSide = null
  }

  getNodeText () {
    return '(' + this.classSide.name + ')'
  }
}

/**
 * UMLNaryAssociationNode
 */
class UMLNaryAssociationNode extends UMLClassifier {
  getString (options) {
    var _string = this.name
    if (options && options.showVisibility) {
      _string = this.getVisibilityString() + _string
    }
    return _string
  }
}

/**
 * UMLTemplateBinding
 */
class UMLTemplateBinding extends UMLDirectedRelationship {

  constructor () {
    super()

    /** @member {Array.<UMLTemplateParameterSubstitution>} */
    this.parameterSubstitutions = []
  }

  getBindingInfo () {
    var params = []
    if (Array.isArray(this.parameterSubstitutions)) {
      this.parameterSubstitutions.forEach(subst => {
        var bind = subst.textualNotation
        if (bind) {
          params.push(bind)
        }
      })
    }
    var info = ''
    if (params.length > 0) {
      info = '<' + params.join(', ') + '>'
    }
    if (this.name) {
      info = this.name + ' ' + info
    }
    return info
  }
}

/**
 * UMLTemplateParameterSubstitution
 */
class UMLTemplateParameterSubstitution extends UMLModelElement {

  constructor () {
    super()

    /** @member {UMLTemplateParameter} */
    this.formal = null

    /** @member {string|UMLModelElement} */
    this.actual = ''
  }

  get textualNotation () {
    var text = ''
    if (this.formal && this.actual) {
      text = this.formal.name + ' -> ' + (_.isString(this.actual) ? this.actual : this.actual.name)
    }
    return text
  }

  getNodeText () {
    return this.textualNotation
  }
}

/**************************************************************************
 *                                                                        *
 *                               INSTANCES                                *
 *                                                                        *
 **************************************************************************/

/**
 * UMLSlot
 */
class UMLSlot extends UMLModelElement {

  constructor () {
    super()

    /** @member {UMLStructuralFeature} */
    this.definingFeature = null

    /** @member {string|UMLClassifier} */
    this.type = ''

    /** @member {string} */
    this.value = ''
  }

  /**
     * Get type string
     * @return {string}
     */
  getTypeString () {
    if (this.type) {
      if (_.isString(this.type) && (this.type.length > 0)) {
        return this.type
      } else if ((this.type !== null) && (this.type.name)) {
        return this.type.name
      }
    }
    return null
  }

  getString (options) {
    var text = ''
    if (options && (options.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
      text += this.getStereotypeString()
    }
    if (options && options.showVisibility) {
      text += this.getVisibilityString()
    }
    var hasFeature = (this.definingFeature instanceof type.UMLStructuralFeature)
    text += hasFeature ? this.definingFeature.name : this.name
    if (options && options.showType) {
      var _type = (hasFeature ? this.definingFeature.getTypeString() : this.getTypeString()) || ''
      text += (_type.length > 0 ? ': ' + _type : '')
      if (hasFeature) {
        text += (this.definingFeature.multiplicity.length > 0 ? '[' + this.definingFeature.multiplicity + ']' : '')
      }
    }
    text += (this.value.length > 0 ? ' = ' + this.value : '')
    if (options && options.showProperty) {
      var prop = (hasFeature ? this.definingFeature.getPropertyString() : this.getPropertyString())
      text += (prop.length > 0 ? ' ' + prop : '')
    }
    return text
  }

  get textualNotation () {
    var str = super.textualNotation
    var type = getVarName(this.type)
    if (type) {
      str = str + ': ' + type
    }
    if (this.value) {
      str = str + ' = ' + this.value
    }
    return str
  }
}

/**
 * UMLInstance
 */
class UMLInstance extends UMLModelElement {

  constructor () {
    super()

    /** @member {UMLClassifier} */
    this.classifier = null

    /** @member {Array.<UMLSlot>} */
    this.slots = []

    /** @member {string} */
    this.value = null
  }

  /**
     * Get type string
     *
     * @return {string}
     */
  getTypeString () {
    if (this.classifier && this.classifier.name) {
      return this.classifier.name
    } else if (_.isString(this.classifier) && (this.classifier.length > 0)) {
      return this.classifier
    }
    return null
  }

  getString (options) {
    var text = ''
    text += this.name
    if (options && options.showType) {
      text += (this.getTypeString() !== null ? ': ' + this.getTypeString() : '')
    }
    return text
  }

  get textualNotation () {
    var str = super.textualNotation
    var type = getVarName(this.classifier)
    if (type) {
      str = str + ': ' + type
    }
    return str
  }
}

/**
 * UMLObject
 */
class UMLObject extends UMLInstance {}

/**
 * UMLArtifactInstance
 */
class UMLArtifactInstance extends UMLInstance {}

/**
 * UMLComponentInstance
 */
class UMLComponentInstance extends UMLInstance {}

/**
 * UMLNodeInstance
 */
class UMLNodeInstance extends UMLInstance {}

/**
 * UMLLinkEnd
 */
class UMLLinkEnd extends UMLRelationshipEnd {

  getPropertyString () {
    var props = []
    if (this.isID === true) { props.push('id') }
    if (this.isReadOnly === true) { props.push('readOnly') }
    if (this.isOrdered === true) { props.push('ordered') }
    if (this.isUnique === true) { props.push('unique') }
    props = _.union(props, this.getTagStringArray())
    if (props.length > 0) {
      return '{' + props.join(', ') + '}'
    }
    return ''
  }
}

/**
 * UMLLink
 */
class UMLLink extends UMLUndirectedRelationship {

  constructor () {
    super()

    /** @member {UMLLinkEnd} */
    this.end1 = new UMLLinkEnd()
    this.end1._parent = this

    /** @member {UMLLinkEnd} */
    this.end2 = new UMLLinkEnd()
    this.end2._parent = this

    /** @member {UMLAssociation} */
    this.association = null
  }
}

/**
 * UMLLinkObjectLink
 */
class UMLLinkObjectLink extends UMLModelElement {

  constructor () {
    super()

    /** @member {UMLObject} */
    this.objectSide = null

    /** @member {UMLLink} */
    this.linkSide = null
  }

  getNodeText () {
    return '(' + this.objectSide.name + ')'
  }
}

/**************************************************************************
 *                                                                        *
 *                          COMPOSITE STRUCTURES                          *
 *                                                                        *
 **************************************************************************/

/**
 * UMLPort
 */
class UMLPort extends UMLAttribute {

  constructor () {
    super()

    /** @member {boolean} */
    this.isBehavior = false

    /** @member {boolean} */
    this.isService = false

    /** @member {boolean} */
    this.isConjugated = false
  }
}

/**
 * UMLConnectorEnd
 */
class UMLConnectorEnd extends UMLRelationshipEnd {}

/**
 * UMLConnector
 */
class UMLConnector extends UMLUndirectedRelationship {

  constructor () {
    super()

    /** @member {UMLConnectorEnd} */
    this.end1 = new UMLConnectorEnd()
    this.end1._parent = this

    /** @member {UMLConnectorEnd} */
    this.end2 = new UMLConnectorEnd()
    this.end2._parent = this

    /** @member {UMLAssociation} */
    this.type = null

    /** @member {UMLConnectorKind} */
    this.kind = UMLConnector.CK_ASSEMBLY
  }
}

/**
 * UMLConnectorKind: `assembly`
 * @const {string}
 */
UMLConnector.CK_ASSEMBLY = 'assembly'

/**
 * UMLConnectorKind: `delegation`
 * @const {string}
 */
UMLConnector.CK_DELEGATION = 'delegation'

/**
 * UMLCollaboration
 */
class UMLCollaboration extends UMLClassifier {}

/**
 * UMLCollaborationUse
 */
class UMLCollaborationUse extends UMLModelElement {

  constructor () {
    super()

    /** @member {UMLCollaboration} */
    this.type = null
  }
}

/**
 * UMLRoleBinding
 */
class UMLRoleBinding extends UMLDependency {

  constructor () {
    super()

    /** @member {string} */
    this.roleName = ''
  }
}

/**************************************************************************
 *                                                                        *
 *                               COMPONENTS                               *
 *                                                                        *
 **************************************************************************/

/**
 * UMLArtifact
 */
class UMLArtifact extends UMLClassifier {

  constructor () {
    super()

    /** @member {string} */
    this.fileName = ''
  }
}

/**
 * UMLComponent
 */
class UMLComponent extends UMLClassifier {

  constructor () {
    super()

    /** @member {boolean} */
    this.isIndirectlyInstantiated = true
  }

  /**
   * Get all classifier realizing this component
   *
   * @return {Array.<UMLClassifier>}
   */
  getRealizingClassifiers () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLComponentRealization) && (r.target === self)
    })
    return _.map(rels, function (g) { return g.source })
  }
}

/**
 * UMLSubsystem
 */
class UMLSubsystem extends UMLComponent {}

/**************************************************************************
 *                                                                        *
 *                                DEPLOYMENTS                             *
 *                                                                        *
 **************************************************************************/

/**
 * UMLNode
 */
class UMLNode extends UMLClassifier {

  /**
   * Get all element deployed in this node
   *
   * @return {Array.<Element>}
   */
  getDeployedElements () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLDeployment) && (r.target === self)
    })
    return _.map(rels, function (g) { return g.source })
  }
}

/**
 * UMLDeployment
 */
class UMLDeployment extends UMLDependency {}

/**
 * UMLCommunicationPath
 */
class UMLCommunicationPath extends UMLAssociation {}

/**************************************************************************
 *                                                                        *
 *                                USE CASES                               *
 *                                                                        *
 *************************************************************************/

/**
 * UMLExtensionPoint
 */
class UMLExtensionPoint extends UMLModelElement {

  constructor () {
    super()

    /** @member {string} */
    this.location = ''
  }

  getString (options) {
    var text = ''
    if (options && (options.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL || options.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
      text += this.getStereotypeString()
    }
    text += this.name
    text += (this.location ? ': ' + this.location : '')
    if (options && options.showProperty) {
      var prop = this.getPropertyString()
      text += (prop.length > 0 ? ' ' + prop : '')
    }
    return text
  }
}

/**
 * UMLUseCase
 */
class UMLUseCase extends UMLClassifier {

  constructor () {
    super()

    /** @member {Array.<UMLExtensionPoint>} */
    this.extensionPoints = []
  }

  /**
   * Get all actors associated with this use case
   *
   * @return {Array.<UMLActor>}
   */
  getActors () {
    var associated = _.map(this.getAssociationEnds(true), function (e) { return e.reference })
    return _.filter(associated, function (asso) { return (asso instanceof type.UMLActor) })
  };

  /**
   * Get use cases directly included in this use case
   *
   * @return {Array.<UMLUseCase>}
   */
  getIncludedUseCases () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLInclude) && (r.source === self)
    })
    return _.map(rels, function (g) { return g.target })
  }

  /**
   * Get use cases extending this use case
   *
   * @return {Array.<UMLUseCase>}
   */
  getExtendingUseCases () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLExtend) && (r.target === self)
    })
    return _.map(rels, function (g) { return g.source })
  }

  /**
   * Get all included use cases
   *
   * @return {Array.<UMLUseCase>}
   */
  getAllIncludedUseCases () {
    var includings = this.getIncludedUseCases()
    var size = 0
    do {
      size = includings.length
      _.each(includings, function (e) {
        includings = _.union(includings, e.getIncludedUseCases())
      })
    } while (size < includings.length)
    return includings
  }
}

/**
 * UMLActor
 */
class UMLActor extends UMLClassifier {

  /**
   * Get use cases associated with this actor
   *
   * @return {Array.<UMLUseCase>}
   */
  getUseCases () {
    var associated = _.map(this.getAssociationEnds(true), function (e) { return e.reference })
    return _.filter(associated, function (asso) { return (asso instanceof type.UMLUseCase) })
  }
}

/**
 * UMLInclude
 */
class UMLInclude extends UMLDirectedRelationship {}

/**
 * UMLExtend
 */
class UMLExtend extends UMLDirectedRelationship {

  constructor () {
    super()

    /** @member {string} */
    this.condition = ''

    /** @member {Array.<UMLExtensionPoint>} */
    this.extensionLocations = []
  }
}

/**
 * UMLUseCaseSubject
 */
class UMLUseCaseSubject extends UMLModelElement {

  constructor () {
    super()

    /** @member {UMLClassifier} */
    this.represent = null
  }
}

/**************************************************************************
 *                                                                        *
 *                             STATE MACHINES                             *
 *                                                                        *
 *************************************************************************/

/**
 * UMLStateMachine
 */
class UMLStateMachine extends UMLBehavior {

  constructor () {
    super()

    /** @member {Array.<UMLRegion>} */
    this.regions = []
  }
}

/**
 * UMLRegion
 */
class UMLRegion extends UMLModelElement {

  constructor () {
    super()

    /** @member {Array.<UMLVertex>} */
    this.vertices = []

    /** @member {Array.<UMLTransition>} */
    this.transitions = []
  }

  canContainKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLVertex')
  }
}

/**
 * UMLVertex
 */
class UMLVertex extends UMLModelElement {

  /**
   * Get incoming transitions
   *
   * @return {Array.<UMLTransition>}
   */
  getIncomingTransitions () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLTransition) && (r.target === self)
    })
    return rels
  }

  /**
   * Get outgoing transitions
   *
   * @return {Array.<UMLTransition>}
   */
  getOutgoingTransitions () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLTransition) && (r.source === self)
    })
    return rels
  }
}

/**
 * UMLPseudostate
 */
class UMLPseudostate extends UMLVertex {

  constructor () {
    super()

    /** @member {string} */
    this.kind = UMLPseudostate.PSK_INITIAL
  }

  getNodeIcon () {
    switch (this.kind) {
    case UMLPseudostate.PSK_INITIAL:
      return 'staruml-icon icon-UMLInitialState'
    case UMLPseudostate.PSK_DEEPHISTORY:
      return 'staruml-icon icon-UMLDeepHistory'
    case UMLPseudostate.PSK_SHALLOWHISTORY:
      return 'staruml-icon icon-UMLShallowHistory'
    case UMLPseudostate.PSK_JOIN:
      return 'staruml-icon icon-UMLJoin'
    case UMLPseudostate.PSK_FORK:
      return 'staruml-icon icon-UMLFork'
    case UMLPseudostate.PSK_JUNCTION:
      return 'staruml-icon icon-UMLJunction'
    case UMLPseudostate.PSK_CHOICE:
      return 'staruml-icon icon-UMLChoice'
    case UMLPseudostate.PSK_ENTRYPOINT:
      return 'staruml-icon icon-UMLEntryPoint'
    case UMLPseudostate.PSK_EXITPOINT:
      return 'staruml-icon icon-UMLExitPoint'
    case UMLPseudostate.PSK_TERMINATE:
      return 'staruml-icon icon-UMLTerminate'
    }
  }
}

/**
 * UMLPseudostateKind: `initial`
 * @const {string}
 */
UMLPseudostate.PSK_INITIAL = 'initial'

/**
 * UMLPseudostateKind: `deepHistory`
 * @const {string}
 */
UMLPseudostate.PSK_DEEPHISTORY = 'deepHistory'

/**
 * UMLPseudostateKind: `shallowHistory`
 * @const {string}
 */
UMLPseudostate.PSK_SHALLOWHISTORY = 'shallowHistory'

/**
 * UMLPseudostateKind: `join`
 * @const {string}
 */
UMLPseudostate.PSK_JOIN = 'join'

/**
 * UMLPseudostateKind: `fork`
 * @const {string}
 */
UMLPseudostate.PSK_FORK = 'fork'

/**
 * UMLPseudostateKind: `junction`
 * @const {string}
 */
UMLPseudostate.PSK_JUNCTION = 'junction'

/**
 * UMLPseudostateKind: `choice`
 * @const {string}
 */
UMLPseudostate.PSK_CHOICE = 'choice'

/**
 * UMLPseudostateKind: `entryPoint`
 * @const {string}
 */
UMLPseudostate.PSK_ENTRYPOINT = 'entryPoint'

/**
 * UMLPseudostateKind: `exitPoint`
 * @const {string}
 */
UMLPseudostate.PSK_EXITPOINT = 'exitPoint'

/**
 * UMLPseudostateKind: `terminate`
 * @const {string}
 */
UMLPseudostate.PSK_TERMINATE = 'terminate'

/**
 * UMLConnectionPointReference
 */
class UMLConnectionPointReference extends UMLVertex {

  constructor () {
    super()

    /** @member {UMLPseudostate} */
    this.entry = []

    /** @member {UMLPseudostate} */
    this.exit = []
  }
}

/**
 * UMLState
 */
class UMLState extends UMLVertex {

  constructor () {
    super()

    /** @member {Array.<UMLRegion>} */
    this.regions = []

    /** @member {Array.<UMLBehavior>} */
    this.entryActivities = []

    /** @member {Array.<UMLBehavior>} */
    this.doActivities = []

    /** @member {Array.<UMLBehavior>} */
    this.exitActivities = []

    /** @member {UMLStateMachine} */
    this.submachine = null

    /** @member {UMLConnectionPointReference} */
    this.connections = []
  }

  getInternalTransitions () {
    var self = this
    var internalTransitions = []
    _.each(this.regions, function (region) {
      _.each(region.transitions, function (t) {
        if (t.source === self && t.target === self && t.kind === UMLTransition.TK_INTERNAL) {
          internalTransitions.push(t)
        }
      })
    })
    return internalTransitions
  }
}

/**
 * UMLFinalState
 */
class UMLFinalState extends UMLState {}

/**
 * UMLTransition
 */
class UMLTransition extends UMLDirectedRelationship {

  constructor () {
    super()

    /** @member {string} */
    this.kind = UMLTransition.TK_EXTERNAL

    /** @member {string} */
    this.guard = ''

    /** @member {Array.<UMLEvent>} */
    this.triggers = []

    /** @member {Array.<UMLBehavior>} */
    this.effects = []
  }

  getString () {
    var i, len
    var text = ''
    // triggers
    if (this.triggers.length > 0) {
      var triggers = []
      for (i = 0, len = this.triggers.length; i < len; i++) {
        triggers.push(this.triggers[i].name)
      }
      text += triggers.join(', ')
    }
    // guard
    if (this.guard.length > 0) {
      text += ' [' + this.guard + ']'
    }
    // effects
    if (this.effects.length > 0) {
      var effects = []
      for (i = 0, len = this.effects.length; i < len; i++) {
        effects.push(this.effects[i].name)
      }
      text += ' / ' + effects.join(', ')
    }
    if (text.length > 0) {
      text = (this.name.length > 0 ? this.name + ' : ' + text : text)
    } else {
      text = this.name
    }
    return text
  }

  get textualNotation () {
    var str = ''
    var triggers = []
    _.each(this.triggers, (t) => {
      triggers.push(t.name)
    })
    str = str + triggers.join(', ')
    if (this.guard && this.guard.length > 0) {
      str = str + ' [' + this.guard + ']'
    }
    if (this.effects.length > 0) {
      str = str + ' / ' + this.effects[0].name
    }
    return str
  }
}

/**
 * UMLTransitionKind: `external`
 * @const {string}
 */
UMLTransition.TK_EXTERNAL = 'external'

/**
 * UMLTransitionKind: `internal`
 * @const {string}
 */
UMLTransition.TK_INTERNAL = 'internal'

/**
 * UMLTransitionKind: `local`
 * @const {string}
 */
UMLTransition.TK_LOCAL = 'local'

/**************************************************************************
 *                                                                        *
 *                                ACTIVITIES                              *
 *                                                                        *
 **************************************************************************/

/**
 * UMLActivity
 */
class UMLActivity extends UMLBehavior {

  constructor () {
    super()

    /** @member {boolean} */
    this.isReadOnly = false

    /** @member {boolean} */
    this.isSingleExecution = false

    /** @member {Array.<UMLActivityNode>} */
    this.nodes = []

    /** @member {Array.<UMLActivityEdge>} */
    this.edges = []

    /** @member {Array.<UMLActivityGroup>} */
    this.groups = []
  }
}

/**
 * UMLPin
 */
class UMLPin extends UMLStructuralFeature {}

/**
 * UMLInputPin
 */
class UMLInputPin extends UMLPin {}

/**
 * UMLOutputPin
 */
class UMLOutputPin extends UMLPin {}

/**
 * UMLExpansionNode
 */
class UMLExpansionNode extends UMLPin {}

/**
 * UMLActivityNode
 */
class UMLActivityNode extends UMLModelElement {

  /**
   * Get incoming edges
   *
   * @return {Array.<UMLActivityEdge>}
   */
  getIncomingEdges () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLActivityEdge) && (r.target === self)
    })
    return rels
  }

  /**
   * Get outgoing edges
   *
   * @return {Array.<UMLActivityEdge>}
   */
  getOutgoingEdges () {
    var self = this
    var rels = app.repository.getRelationshipsOf(self, function (r) {
      return (r instanceof type.UMLActivityEdge) && (r.source === self)
    })
    return rels
  }
}

/**
 * UMLAction
 */
class UMLAction extends UMLActivityNode {

  constructor () {
    super()

    /** @member {string} */
    this.kind = UMLAction.ACK_OPAQUE

    /** @member {Array.<UMLInputPin>} */
    this.inputs = []

    /** @member {Array.<UMLOutputPin>} */
    this.outputs = []

    /** @member {Array.<UMLEvent>} */
    this.triggers = []

    /** @member {UMLModelElement} */
    this.target = null

    /** @member {UMLActivity} */
    this.subactivity = null

    /** @member {boolean} */
    this.isLocallyReentrant = false

    /** @member {boolean} */
    this.isSynchronous = true

    /** @member {string} */
    this.language = ''

    /** @member {string} */
    this.body = ''

    /** @member {Array.<UMLConstraint>} */
    this.localPreconditions = []

    /** @member {Array.<UMLConstraint>} */
    this.localPostconditions = []
  }

  getNodeIcon () {
    switch (this.kind) {
    case UMLAction.ACK_OPAQUE:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_CREATE:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_DESTROY:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_READ:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_WRITE:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_INSERT:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_DELETE:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_STRUCTURED:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_SENDSIGNAL:
      return 'staruml-icon icon-UMLSendSignal'
    case UMLAction.ACK_ACCEPTSIGNAL:
      return 'staruml-icon icon-UMLAcceptSignal'
    case UMLAction.ACK_TRIGGEREVENT:
      return 'staruml-icon icon-UMLSendSignal'
    case UMLAction.ACK_ACCEPTEVENT:
      return 'staruml-icon icon-UMLAcceptSignal'
    case UMLAction.ACK_TIMEEVENT:
      return 'staruml-icon icon-UMLAcceptTimeEvent'
    case UMLAction.ACK_CALLBEHAVIOR:
      return 'staruml-icon icon-UMLAction'
    case UMLAction.ACK_CALLOPERATION:
      return 'staruml-icon icon-UMLAction'
    }
  }
}

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_OPAQUE = 'opaque'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_CREATE = 'create'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_DESTROY = 'destroy'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_READ = 'read'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_WRITE = 'write'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_INSERT = 'insert'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_DELETE = 'delete'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_SENDSIGNAL = 'sendSignal'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_ACCEPTSIGNAL = 'acceptSignal'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_TRIGGEREVENT = 'triggerEvent'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_ACCEPTEVENT = 'acceptEvent'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_STRUCTURED = 'structured'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_TIMEEVENT = 'timeEvent'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_CALLBEHAVIOR = 'callBehavior'

/**
 * UMLActionKind: ``
 * @const {string}
 */
UMLAction.ACK_CALLOPERATION = 'callOperation'

/**
 * UMLObjectNode
 */
class UMLObjectNode extends UMLActivityNode {

  constructor () {
    super()

    /** @member {UMLClassifier} */
    this.type = null

    /** @member {boolean} */
    this.isControlType = false

    /** @member {string} */
    this.ordering = UMLObjectNode.ONOK_FIFO

    /** @member {Array.<UMLState>} */
    this.inStates = []
  }

  getTypeString () {
    if (_.isString(this.type) && (this.type.length > 0)) {
      return this.type
    } else if ((this.type !== null) && (this.type.name)) {
      return this.type.name
    }
    return null
  }

  getString () {
    var text = ''
    text += this.name
    text += (this.getTypeString() !== null ? ': ' + this.getTypeString() : '')
    return text
  }
}

/**
 * UMLObjectNodeOrderingKind: `unordered`
 * @const {string}
 */
UMLObjectNode.ONOK_UNORDERED = 'unordered'

/**
 * UMLObjectNodeOrderingKind: `ordered`
 * @const {string}
 */
UMLObjectNode.ONOK_ORDERED = 'ordered'

/**
 * UMLObjectNodeOrderingKind: `LIFO`
 * @const {string}
 */
UMLObjectNode.ONOK_LIFO = 'LIFO'

/**
 * UMLObjectNodeOrderingKind: `FIFO`
 * @const {string}
 */
UMLObjectNode.ONOK_FIFO = 'FIFO'

/**
 * UMLCentralBufferNode
 */
class UMLCentralBufferNode extends UMLObjectNode {}

/**
 * UMLDataStoreNode
 */
class UMLDataStoreNode extends UMLCentralBufferNode {}

/**
 * UMLControlNode
 */
class UMLControlNode extends UMLActivityNode {}

/**
 * UMLInitialNode
 */
class UMLInitialNode extends UMLControlNode {}

/**
 * UMLFinalNode
 */
class UMLFinalNode extends UMLControlNode {}

/**
 * UMLActivityFinalNode
 */
class UMLActivityFinalNode extends UMLFinalNode {}

/**
 * UMLFlowFinalNode
 */
class UMLFlowFinalNode extends UMLFinalNode {}

/**
 * UMLForkNode
 */
class UMLForkNode extends UMLControlNode {}

/**
 * UMLJoinNode
 */
class UMLJoinNode extends UMLControlNode {}

/**
 * UMLMergeNode
 */
class UMLMergeNode extends UMLControlNode {}

/**
 * UMLDecisionNode
 */
class UMLDecisionNode extends UMLControlNode {}

/**
 * UMLActivityGroup
 */
class UMLActivityGroup extends UMLModelElement {

  constructor () {
    super()

    /** @member {Array.<UMLActivityNode>} */
    this.nodes = []

    /** @member {Array.<UMLActivityEdge>} */
    this.edges = []

    /** @member {Array.<UMLActivityGroup>} */
    this.subgroups = []
  }
}

/**
 * UMLActivityPartition
 */
class UMLActivityPartition extends UMLActivityGroup {

  getNodeIcon () {
    return 'staruml-icon icon-UMLSwimlaneVert'
  }

  canContainKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLActivityNode')
  }
}

/**
 * UMLInterruptibleActivityRegion
 */
class UMLInterruptibleActivityRegion extends UMLActivityGroup {

  canContainKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLActivityNode')
  }
}

/**
 * UMLStructuredActivityNode
 */
class UMLStructuredActivityNode extends UMLAction {

  constructor () {
    super()

    /** @member {boolean} */
    this.mustIsolate = false

    /** @member {Array.<UMLActivityNode>} */
    this.nodes = []

    /** @member {Array.<UMLActivityEdge>} */
    this.edges = []
  }

  getNodeIcon () {
    return 'staruml-icon icon-UMLStructuredActivityNode'
  }

  canContainKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLActivityNode')
  }
}

/**
 * UMLExpansionRegion
 */
class UMLExpansionRegion extends UMLStructuredActivityNode {

  constructor () {
    super()

    /** @member {UMLExpansionKind} */
    this.mode = UMLExpansionRegion.EK_ITERATIVE
  }

  getNodeIcon () {
    return 'staruml-icon icon-UMLExpansionRegion'
  }
}

/**
 * UMLExpansionKind: `parallel`
 * @const {string}
 */
UMLExpansionRegion.EK_PARALLEL = 'parallel'

/**
 * UMLExpansionKind: `iterative`
 * @const {string}
 */
UMLExpansionRegion.EK_ITERATIVE = 'iterative'

/**
 * UMLExpansionKind: `stream`
 * @const {string}
 */
UMLExpansionRegion.EK_STREAM = 'stream'

/**
 * UMLExceptionHandler
 */
class UMLExceptionHandler extends UMLDirectedRelationship {

  constructor () {
    super()

    /** @member {Array.<UMLClassifier>} */
    this.exceptionTypes = []

    /** @member {UMLActivityNode} */
    this.handlerBody = null
  }
}

/**
 * UMLActivityEdge
 */
class UMLActivityEdge extends UMLDirectedRelationship {

  constructor () {
    super()

    /** @member {string} */
    this.guard = ''

    /** @member {string} */
    this.weight = ''
  }

  getString () {
    var text = this.name
    // guard
    if (this.guard.length > 0) {
      text += ' [' + this.guard + ']'
    }
    // weight
    if (this.weight.length > 0) {
      text += ' {weight=' + this.weight + '}'
    }
    return text
  }
}

/**
 * UMLControlFlow
 */
class UMLControlFlow extends UMLActivityEdge {}

/**
 * UMLObjectFlow
 */
class UMLObjectFlow extends UMLActivityEdge {}

/**
 * UMLActivityInterrupt
 */
class UMLActivityInterrupt extends UMLActivityEdge {}

/**
 * UMLActivityEdgeConnector
 */
class UMLActivityEdgeConnector extends UMLActivityNode {}

/**************************************************************************
 *                                                                        *
 *                               INTERACTIONS                             *
 *                                                                        *
 **************************************************************************/

/**
 * UMLInteractionFragment
 */
class UMLInteractionFragment extends UMLBehavior {}

/**
 * UMLInteraction
 */
class UMLInteraction extends UMLInteractionFragment {

  constructor () {
    super()

    /** @member {UMLMessage} */
    this.messages = []

    /** @member {UMLMessageEndpoint} */
    this.participants = []

    /** @member {UMLInteractionFragment} */
    this.fragments = []
  }
}

/**
 * UMLStateInvariant
 */
class UMLStateInvariant extends UMLInteractionFragment {

  constructor () {
    super()

    /** @member {UMLLifeline} */
    this.covered = null

    /** @member {any} */
    this.invariant = ''
  }
}

/**
 * UMLContinuation
 */
class UMLContinuation extends UMLInteractionFragment {

  constructor () {
    super()

    /** @member {boolean} */
    this.setting = false
  }
}

/**
 * UMLInteractionOperand
 */
class UMLInteractionOperand extends UMLInteractionFragment {

  constructor () {
    super()

    /** @member {string} */
    this.guard = ''
  }
}

/**
 * UMLCombinedFragment
 */
class UMLCombinedFragment extends UMLInteractionFragment {

  constructor () {
    super()

    /** @member {string} */
    this.interactionOperator = UMLCombinedFragment.IOK_SEQ

    /** @member {UMLInteractionOperand} */
    this.operands = []
  }
}

/**
 * UMLInteractionOperatorKind: `alt`
 * @const {string}
 */
UMLCombinedFragment.IOK_ALT = 'alt'

/**
 * UMLInteractionOperatorKind: `opt`
 * @const {string}
 */
UMLCombinedFragment.IOK_OPT = 'opt'

/**
 * UMLInteractionOperatorKind: `par`
 * @const {string}
 */
UMLCombinedFragment.IOK_PAR = 'par'

/**
 * UMLInteractionOperatorKind: `loop`
 * @const {string}
 */
UMLCombinedFragment.IOK_LOOP = 'loop'

/**
 * UMLInteractionOperatorKind: `critical`
 * @const {string}
 */
UMLCombinedFragment.IOK_CRITICAL = 'critical'

/**
 * UMLInteractionOperatorKind: `neg`
 * @const {string}
 */
UMLCombinedFragment.IOK_NEG = 'neg'

/**
 * UMLInteractionOperatorKind: `assert`
 * @const {string}
 */
UMLCombinedFragment.IOK_ASSERT = 'assert'

/**
 * UMLInteractionOperatorKind: `strict`
 * @const {string}
 */
UMLCombinedFragment.IOK_STRICT = 'strict'

/**
 * UMLInteractionOperatorKind: `seq`
 * @const {string}
 */
UMLCombinedFragment.IOK_SEQ = 'seq'

/**
 * UMLInteractionOperatorKind: `ignore`
 * @const {string}
 */
UMLCombinedFragment.IOK_IGNORE = 'ignore'

/**
 * UMLInteractionOperatorKind: `consider`
 * @const {string}
 */
UMLCombinedFragment.IOK_CONSIDER = 'consider'

/**
 * UMLInteractionOperatorKind: `break`
 * @const {string}
 */
UMLCombinedFragment.IOK_BREAK = 'break'

/**
 * UMLInteractionUse
 */
class UMLInteractionUse extends UMLInteractionFragment {

  constructor () {
    super()

    /** @member {UMLInteraction} */
    this.refersTo = null

    /** @member {string} */
    this['arguments'] = ''

    /** @member {string} */
    this.returnValue = ''

    /** @member {UMLStructuralFeature} */
    this.returnValueRecipient = null
  }
}

/**
 * UMLMessageEndpoint
 */
class UMLMessageEndpoint extends UMLModelElement {}

/**
 * UMLLifeline
 */
class UMLLifeline extends UMLMessageEndpoint {

  constructor () {
    super()

    /** @member {string} */
    this.selector = ''

    /** @member {UMLStructuralFeature} */
    this.represent = null

    /** @member {boolean} */
    this.isMultiInstance = false
  }

  getTypeString () {
    if (this.represent) {
      if (_.isString(this.represent.type) && (this.represent.type.length > 0)) {
        return this.represent.type
      } else if ((this.represent.type !== null) && (this.represent.type.name)) {
        return this.represent.type.name
      }
    }
    return null
  }

  getString (options) {
    var text = ''
    text += this.name
    text += (this.selector.length > 0 ? '[' + this.selector + ']' : '')
    if (options && options.showType) {
      text += (this.getTypeString() !== null ? ': ' + this.getTypeString() : '')
    }
    return text
  }

  getNodeText (options) {
    var text = ''
    var typeStr = this.getTypeString()
    options = options || {}
    if (options.showStereotype !== false) {
      text += this.getStereotypeString()
    }
    text += this.name
    if (typeStr) {
      text += ': ' + typeStr
    }
    if (!text) {
      text = '(Lifeline)'
    }
    return text
  }

  get textualNotation () {
    var str = super.textualNotation
    if (this.selector.length > 0) {
      str += '[' + this.selector + ']'
    }
    if (this.represent) {
      var type = getVarName(this.represent.type)
      if (type) {
        str = str + ': ' + type
      }
    }
    return str
  }
}

/**
 * UMLGate
 */
class UMLGate extends UMLMessageEndpoint {}

/**
 * UMLEndpoint
 */
class UMLEndpoint extends UMLMessageEndpoint {}

/**
 * UMLMessage
 */
class UMLMessage extends UMLDirectedRelationship {

  constructor () {
    super()

    /** @member {string} */
    this.messageSort = UMLMessage.MS_SYNCHCALL

    /** @member {UMLOperation} */
    this.signature = null

    /** @member {UMLConnector} */
    this.connector = null

    /** @member {string} */
    this.sequenceNumber = ''

    /** @member {string} */
    this['arguments'] = ''

    /** @member {string} */
    this.assignmentTarget = ''

    /** @member {string} */
    this.guard = ''

    /** @member {string} */
    this.iteration = ''

    /** @member {boolean} */
    this.isConcurrentIteration = false
  }

  getString (options) {
    var s = ''
    // Sequence Number
    if (options && options.showSequenceNumber && this._parent && this._parent.messages) {
      if (options.sequenceNumbering === UMLSequenceDiagram.SN_AUTO) {
        s += _.indexOf(this._parent.messages, this) + 1
        s += ' '
      } else if (options.sequenceNumbering === UMLSequenceDiagram.SN_CUSTOM) {
        if (this.sequenceNumber) {
          s += this.sequenceNumber + ' '
        }
      }
    }
    // Guard
    if (this.guard.length > 0) {
      s += '[' + this.guard + '] '
    }
    // Iteration
    if (this.iteration.length > 0) {
      s += (this.isConcurrentIteration ? '*||[' : '*[') + this.iteration + '] '
    }
    if (s.length > 0) {
      s += ': '
    }
    // Assignament Target
    if (this.assignmentTarget.length > 0) {
      s += this.assignmentTarget + ' = '
    }
    // Message Signature Part
    if (this.signature instanceof type.UMLOperation) {
      s += this.signature.name
      if (options && options.showSignature) {
        if (this['arguments'].length > 0) {
          s += '(' + this['arguments'] + ')'
        } else {
          s += this.signature.getParametersString(options)
          var r = this.signature.getReturnString(options)
          if (options.showType && r.length > 0) {
            s += ':' + r
          }
        }
      } else {
        s += '()'
      }
    } else if (this.signature instanceof type.UMLSignal) {
      s += this.signature.getString()
      if (options && options.showSignature && this['arguments'].length > 0) {
        s += '(' + this['arguments'] + ')'
      }
    } else {
      s += this.name
      if (options && options.showSignature && this['arguments'].length > 0) {
        s += '(' + this['arguments'] + ')'
      }
    }
    return s
  }

  get textualNotation () {
    var str = ''
    // stereotype
    var stereotype = getVarName(this.stereotype)
    if (stereotype) {
      str += '<<' + stereotype + '>>'
    }
    // assignment target
    if (this.assignmentTarget.length > 0) {
      str += this.assignmentTarget + ' = '
    }
    // name
    str += this.name
    // arguments
    if (this.arguments.length > 0) {
      str += '(' + this.arguments + ')'
    }
    return str
  }
}

/**
 * UMLMessageSort: `synchCall`
 * @const {string}
 */
UMLMessage.MS_SYNCHCALL = 'synchCall'

/**
 * UMLMessageSort: `asynchCall`
 * @const {string}
 */
UMLMessage.MS_ASYNCHCALL = 'asynchCall'

/**
 * UMLMessageSort: `asynchSignal`
 * @const {string}
 */
UMLMessage.MS_ASYNCHSIGNAL = 'asynchSignal'

/**
 * UMLMessageSort: `createMessage`
 * @const {string}
 */
UMLMessage.MS_CREATEMESSAGE = 'createMessage'

/**
 * UMLMessageSort: `deleteMessage`
 * @const {string}
 */
UMLMessage.MS_DELETEMESSAGE = 'deleteMessage'

/**
 * UMLMessageSort: `reply`
 * @const {string}
 */
UMLMessage.MS_REPLY = 'reply'

/**************************************************************************
 *                                                                        *
 *                             INFORMATION FLOWS                          *
 *                                                                        *
 **************************************************************************/

/**
 * UMLInformationItem
 */
class UMLInformationItem extends UMLClassifier {
  constructor () {
    super()

    /** @member {Array<UMLClassifier>} */
    this.represented = []
  }
}

/**
 * UMLInformationFlow
 */
class UMLInformationFlow extends UMLDirectedRelationship {
  constructor () {
    super()

    /** @member {Array<UMLClassifier>} */
    this.conveyed = []

    /** @member {Array<UMLConnector>} */
    this.realizingConnectors = []

    /** @member {Array<UMLActivityEdge>} */
    this.realizingActivityEdges = []

    /** @member {Array<UMLMessage>} */
    this.realizingMessages = []
  }

  getConveyedString () {
    const names = this.conveyed.map(e => e.name)
    return names.join(', ')
  }
}

/**************************************************************************
 *                                                                        *
 *                                 PROFILES                               *
 *                                                                        *
 **************************************************************************/

/**
 * UMLProfile
 */
class UMLProfile extends UMLPackage {

  canContainDiagramKind (kind) {
    return (kind === 'UMLProfileDiagram')
  }
}

/**
 * UMLImage
 */
class UMLImage extends UMLModelElement {

  constructor () {
    super()

    /** @member {number} */
    this.width = 40

    /** @member {number} */
    this.height = 40

    /** @member {string} */
    this.data = null

    /** @member {string} */
    this.content = ''

    /** @member {string} */
    this.smallIcon = ''
  }
}

/**
 * UMLStereotype
 */
class UMLStereotype extends UMLClass {

  constructor () {
    super()

    /** @member {UMLImage} */
    this.icon = new UMLImage()
    this.icon._parent = this
  }

  getIconClass () {
    var name = this.getPathname().replace(/::/g, '-')
    return 'staruml-icon icon-' + name.replace(/[^a-zA-Z0-9_-]/g, '-')
  }
}

/**
 * UMLMetaClass
 */
class UMLMetaClass extends UMLModelElement {}

/**
 * UMLExtension
 */
class UMLExtension extends UMLDirectedRelationship {}

/* ========================= VIEWS ========================================== */

/**************************************************************************
 *                                                                        *
 *                               COMMON VIEWS                             *
 *                                                                        *
 *************************************************************************/

/**
 * UMLDiagram
 */
class UMLDiagram extends Diagram {

  constructor () {
    super()
    this.name = null
  }

  getDisplayClassName () {
    var name = this.getClassName()
    return name.substring(3, name.length)
  }
}

/**
 * UMLCompartmentView
 */
class UMLCompartmentView extends NodeView {

  constructor () {
    super()
    this.selectable = View.SK_PROPAGATE
    this.parentStyle = true

    /* temporal */
    this._leftPadding = COMPARTMENT_LEFT_PADDING
    this._rightPadding = COMPARTMENT_RIGHT_PADDING
    this._topPadding = COMPARTMENT_TOP_PADDING
    this._bottomPadding = COMPARTMENT_BOTTOM_PADDING
    this._itemInterval = COMPARTMENT_ITEM_INTERVAL
  }

  /**
   * size
   */
  size (canvas) {
    var i, len
    var w = 0
    var h = this._topPadding
    for (i = 0, len = this.subViews.length; i < len; i++) {
      var item = this.subViews[i]
      if (item.parentStyle) {
        item.font.size = item._parent.font.size
      }
      item.size(canvas)
      if (item.visible) {
        if (w < item.minWidth) {
          w = item.minWidth
        }
        if (i > 0) {
          h += this._itemInterval
        }
        h += item.minHeight
      }
    }
    this.minWidth = w + this._leftPadding + this._rightPadding
    this.minHeight = h + this._bottomPadding
    this.sizeConstraints()
  }

  /**
   * arrange
   */
  arrange (canvas) {
    var i, len
    var h = this._topPadding
    for (i = 0, len = this.subViews.length; i < len; i++) {
      var item = this.subViews[i]
      if (item.visible) {
        if (i > 0) { h += this._itemInterval }
        item.left = this.left + this._leftPadding
        item.top = this.top + h
        item.width = this.width - this._leftPadding - this._rightPadding
        h += item.height
      }
      item.arrange(canvas)
    }
    h += this._bottomPadding
    this.height = h
    this.sizeConstraints()
  }
}

/**
 * UMLNameCompartmentView
 */
class UMLNameCompartmentView extends UMLCompartmentView {

  constructor () {
    super()
    this.selectable = View.SK_NO

    /** @member {LabelView} */
    this.stereotypeLabel = new LabelView()
    this.stereotypeLabel.horizontalAlignment = Canvas.AL_CENTER
    this.stereotypeLabel.parentStyle = true
    this.addSubView(this.stereotypeLabel)

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)

    /** @member {LabelView} */
    this.namespaceLabel = new LabelView()
    this.namespaceLabel.horizontalAlignment = Canvas.AL_CENTER
    this.namespaceLabel.parentStyle = true
    this.addSubView(this.namespaceLabel)

    /** @member {LabelView} */
    this.propertyLabel = new LabelView()
    this.propertyLabel.horizontalAlignment = Canvas.AL_RIGHT
    this.propertyLabel.parentStyle = true
    this.addSubView(this.propertyLabel)

    /** @member {boolean} */
    this.wordWrap = false
  }

  update (canvas) {
    this.namespaceLabel.font.size = this.font.size * 0.9
    if (this.model) {
      if (this.model.isAbstract === true) {
        this.nameLabel.font.style = Font.FS_BOLD_ITALIC
      } else {
        this.nameLabel.font.style = Font.FS_BOLD
      }
      if (this.model instanceof type.UMLInstance) {
        this.nameLabel.underline = true
      }
      this.nameLabel.wordWrap = this.wordWrap
      this.propertyLabel.wordWrap = this.wordWrap
    }
    super.update(canvas)
  }

  size (canvas) {
    super.size(canvas)
    this.stereotypeLabel.height = this.stereotypeLabel.minHeight
    this.nameLabel.height = this.nameLabel.minHeight
    this.namespaceLabel.height = this.namespaceLabel.minHeight
    this.propertyLabel.height = this.propertyLabel.minHeight
    if (this._parent instanceof type.UMLGeneralNodeView && this._parent.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION) {
      this.minHeight = DECORATION_ICON_HEIGHT + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING
      this.sizeConstraints()
    }
  }
}

/**
 * @abstract
 * UMLListCompartmentView
 */
class UMLListCompartmentView extends UMLCompartmentView {
  constructor () {
    super()
    this._showCompartmentName = false
  }

  getCompartmentName () {
    return null
  }

  getItems () {
    return null
  }

  createItem () {
    return null // e.g.) return new UMLAttributeView()
  }

  update (canvas) {
    const items = this.getItems()
    if (items) {
      var i, len
      var tempViews = this.subViews
      this.subViews = []
      for (i = 0, len = items.length; i < len; i++) {
        var item = items[i]
        var itemView = _.find(tempViews, function (v) { return v.model === item })
        if (!itemView) {
          itemView = this.createItem()
          itemView.model = item
          itemView._parent = this
          // itemView가 Repository에 정상적으로 등록될 수 있도록 Bypass Command에 의해서 생성한다.
          app.repository.bypassInsert(this, 'subViews', itemView)
        } else {
          this.addSubView(itemView)
        }
        itemView.setup(canvas)
      }
    }
    super.update(canvas)
  }

  size (canvas) {
    super.size(canvas)
    if (this._showCompartmentName) {
      var tx = canvas.textExtent('|')
      this.minHeight += (this.getCompartmentName() ? (tx.y * 0.8) + COMPARTMENT_BOTTOM_PADDING : 0)
    }
    this.sizeConstraints()
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this._showCompartmentName) {
      var cn = this.getCompartmentName()
      var r = new Rect(this.left, this.top + COMPARTMENT_TOP_PADDING, this.right, this.top + COMPARTMENT_TOP_PADDING)
      canvas.font.size = canvas.font.size * 0.8
      canvas.font.style = Font.FS_ITALIC
      canvas.textOut2(r, cn, Canvas.AL_CENTER, Canvas.AL_TOP)
    }
  }

  arrange (canvas) {
    var i, len
    var h = this._topPadding
    if (this._showCompartmentName) {
      var tx = canvas.textExtent('|')
      h += (tx.y * 0.8) + COMPARTMENT_BOTTOM_PADDING
    }
    for (i = 0, len = this.subViews.length; i < len; i++) {
      var item = this.subViews[i]
      if (item.visible) {
        if (i > 0) { h += this._itemInterval }
        item.left = this.left + this._leftPadding
        item.top = this.top + h
        item.width = this.width - this._leftPadding - this._rightPadding
        h += item.height
      }
      item.arrange(canvas)
    }
    h += this._bottomPadding
    this.height = h
    this.sizeConstraints()
  }
}

/**
 * UMLAttributeView
 */
class UMLAttributeView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    var options = {
      showVisibility: true,
      stereotypeDisplay: UMLGeneralNodeView.SD_LABEL,
      showProperty: true,
      showType: true,
      showMultiplicity: true
    }
    if (this._parent && this._parent._parent) {
      options.showVisibility = this._parent._parent.showVisibility
      options.stereotypeDisplay = this._parent._parent.stereotypeDisplay
      options.showProperty = this._parent._parent.showProperty
      options.showType = this._parent._parent.showType
      options.showMultiplicity = this._parent._parent.showMultiplicity
    }
    if (this.model) {
      this.text = this.model.getString(options)
      this.underline = (this.model.isStatic === true)
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
 * UMLAttributeCompartmentView
 */
class UMLAttributeCompartmentView extends UMLListCompartmentView {
  getCompartmentName () {
    return 'attributes'
  }

  getItems () {
    return this.model.attributes
  }

  createItem () {
    return new UMLAttributeView()
  }
}

/**
 * UMLOperationView
 */
class UMLOperationView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    var options = {
      showVisibility: true,
      stereotypeDisplay: UMLGeneralNodeView.SD_LABEL,
      showProperty: true,
      showType: true,
      showMultiplicity: true,
      showOperationSignature: true
    }
    if (this._parent && (this._parent._parent instanceof type.UMLClassifierView)) {
      options.showVisibility = this._parent._parent.showVisibility
      options.stereotypeDisplay = this._parent._parent.stereotypeDisplay
      options.showProperty = this._parent._parent.showProperty
      options.showType = this._parent._parent.showType
      options.showMultiplicity = this._parent._parent.showMultiplicity
      options.showOperationSignature = this._parent._parent.showOperationSignature
    }
    if (this.model) {
      this.text = this.model.getString(options)
      this.underline = (this.model.isStatic === true)
      if (this.model.isAbstract) {
        this.font.style = Font.FS_ITALIC
      } else {
        this.font.style = Font.FS_NORMAL
      }
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
 * UMLOperationCompartmentView
 */
class UMLOperationCompartmentView extends UMLListCompartmentView {
  getCompartmentName () {
    return 'operations'
  }

  getItems () {
    return this.model.operations
  }

  createItem () {
    return new UMLOperationView()
  }
}

/**
 * UMLReceptionView
 */
class UMLReceptionView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    var options = {
      showVisibility: true,
      stereotypeDisplay: UMLGeneralNodeView.SD_LABEL,
      showProperty: true,
      showType: true,
      showOperationSignature: true
    }
    if (this._parent && (this._parent._parent instanceof type.UMLClassifierView)) {
      options.showVisibility = this._parent._parent.showVisibility
      options.stereotypeDisplay = this._parent._parent.stereotypeDisplay
      options.showProperty = this._parent._parent.showProperty
      options.showType = this._parent._parent.showType
      options.showOperationSignature = this._parent._parent.showOperationSignature
    }
    if (this.model) {
      this.text = this.model.getString(options)
      this.underline = (this.model.isStatic === true)
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
 * UMLReceptionCompartmentView
 */
class UMLReceptionCompartmentView extends UMLListCompartmentView {
  getCompartmentName () {
    return 'receptions'
  }

  getItems () {
    return this.model.receptions
  }

  createItem () {
    return new UMLReceptionView()
  }
}

/**
 * UMLTemplateParameterView
 */
class UMLTemplateParameterView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    var options = {
      showType: true
    }
    if (this._parent && (this._parent._parent instanceof type.UMLClassifierView)) {
      options.showType = this._parent._parent.showType
    }
    if (this.model) {
      this.text = this.model.getString(options)
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
 * UMLTemplateParameterCompartmentView
 */
class UMLTemplateParameterCompartmentView extends UMLListCompartmentView {
  getItems () {
    return this.model.templateParameters
  }

  createItem () {
    return new UMLTemplateParameterView()
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
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom(), [3])
  }
}

/**
 * UMLGeneralNodeView
 */
class UMLGeneralNodeView extends NodeView {

  constructor () {
    super()

    /** @member {string} */
    this.stereotypeDisplay = UMLGeneralNodeView.SD_LABEL

    /** @member {boolean} */
    this.showVisibility = true

    /** @member {boolean} */
    this.showNamespace = false

    /** @member {boolean} */
    this.showProperty = true

    /** @member {boolean} */
    this.showType = true

    /** @member {boolean} */
    this.wordWrap = false

    /** @member {UMLNameCompartmentView} */
    this.nameCompartment = new UMLNameCompartmentView()
    this.nameCompartment.parentStyle = true
    this.addSubView(this.nameCompartment)

    /* temporal */
    this.mainRect = new Rect(0, 0, 0, 0)
    this.iconRect = new Rect(0, 0, 0, 0)
    this.iconRatio = 100
  }

  hasStereotypeIcon () {
    return (this.model && this.model.stereotype && this.model.stereotype.icon && (this.model.stereotype.icon.content || this.model.stereotype.icon.image))
  }

  computeIconRect (rect, ratioPercent) {
    var rr = rect.getRatioPercent()
    var ir = ratioPercent
    var x = 0
    var y = 0
    var h = 0
    var w = 0
    if (rr >= ir) {
      h = rect.getHeight()
      w = h * ir / 100
      x = rect.x1 + (rect.x2 - rect.x1 - w) / 2
      y = rect.y1
    } else {
      w = rect.getWidth()
      h = w * 100 / ir
      y = rect.y1 + (rect.y2 - rect.y1 - h) / 2
      x = rect.x1
    }
    return new Rect(x, y, x + w, y + h)
  }

  drawIcon (canvas, rect) {
    if (this.hasStereotypeIcon()) {
      var ratioRect = this.computeIconRect(rect, (this.model.stereotype.icon.width / this.model.stereotype.icon.height) * 100)
      drawStereotypeIcon(this, canvas, ratioRect, this.model.stereotype.icon)
    } else {
      canvas.rect(rect.x1, rect.y1, rect.x2, rect.y2)
      canvas.line(rect.x1, rect.y1, rect.x2, rect.y2)
      canvas.line(rect.x2, rect.y1, rect.x1, rect.y2)
    }
  }

  drawDecorationIcon (canvas, rect) {
    this.drawIcon(canvas, rect)
  }

  getAllCompartments () {
    var i, len
    var comps = []
    for (i = 0, len = this.subViews.length; i < len; i++) {
      var v = this.subViews[i]
      if (v instanceof UMLCompartmentView) {
        comps.push(v)
      }
    }
    return comps
  }

  getSizeOfAllCompartments (canvas) {
    var comps = this.getAllCompartments()
    var i, len
    var w = 0
    var h = 0
    for (i = 0, len = comps.length; i < len; i++) {
      var comp = comps[i]
      comp.size(canvas)
      if (comp.visible) {
        if (w < comp.minWidth) {
          w = comp.minWidth
        }
        h += comp.minHeight
      }
    }
    return new Point(w, h)
  }

  arrangeAllCompartments (rect, canvas) {
    var comps = this.getAllCompartments()
    var i, len
    var _y = rect.y1
    for (i = 0, len = comps.length; i < len; i++) {
      var comp = comps[i]
      if (comp.visible) {
        comp.left = rect.x1
        comp.top = _y
        comp.width = (rect.x2 - rect.x1) + 1
        comp.height = comp.minHeight
        comp.arrange(canvas)
        _y += comp.height
      }
    }
  }

  delimitContainingBoundary (canvas) {
    var i, len
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    for (i = 0, len = this.containedViews.length; i < len; i++) {
      if (this.containedViews[i].containerExtending) {
        var vr = this.containedViews[i].getBoundingBox(canvas)
        vr = new Rect(vr.x1 - COMPARTMENT_LEFT_PADDING, vr.y1 - COMPARTMENT_TOP_PADDING,
                      vr.x2 + COMPARTMENT_RIGHT_PADDING, vr.y2 + COMPARTMENT_BOTTOM_PADDING)
        r = Coord.unionRect(r, vr)
      }
    }
    this.left = r.x1
    this.top = r.y1
    this.setRight(r.x2)
    this.setBottom(r.y2)
  }

  getStereotypeLabelText () {
    return this.model.getStereotypeString()
  }

  update (canvas) {
    if (this.model) {
      // nameCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.nameCompartment.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameCompartment, 'model', this.model)
      }
      this.nameCompartment.stereotypeLabel.text = this.getStereotypeLabelText()
      this.nameCompartment.nameLabel.text = this.model.name
      this.nameCompartment.namespaceLabel.text = this.model.getNamespaceString()
      this.nameCompartment.propertyLabel.text = this.model.getPropertyString()
      this.nameCompartment.namespaceLabel.visible = this.showNamespace
      this.nameCompartment.propertyLabel.visible = this.showProperty
      this.nameCompartment.wordWrap = this.wordWrap
      switch (this.stereotypeDisplay) {
      case UMLGeneralNodeView.SD_NONE:
        this.nameCompartment.stereotypeLabel.visible = false
        break
      case UMLGeneralNodeView.SD_LABEL:
        this.nameCompartment.stereotypeLabel.visible = (this.nameCompartment.stereotypeLabel.text.length > 0)
        break
      case UMLGeneralNodeView.SD_DECORATION:
        this.nameCompartment.stereotypeLabel.visible = false
        break
      case UMLGeneralNodeView.SD_DECORATION_LABEL:
        this.nameCompartment.stereotypeLabel.visible = true
        break
      case UMLGeneralNodeView.SD_ICON:
        this.nameCompartment.stereotypeLabel.visible = false
        break
      case UMLGeneralNodeView.SD_ICON_LABEL:
        this.nameCompartment.stereotypeLabel.visible = true
        break
      }
      if (this.nameCompartment.propertyLabel.text.length === 0) {
        this.nameCompartment.propertyLabel.visible = false
      }
    }
    super.update(canvas)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.sizeCommon(canvas)
    switch (this.stereotypeDisplay) {
    case UMLGeneralNodeView.SD_NONE:
      this.sizeAsCanonicalForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_LABEL:
      this.sizeAsCanonicalForm(canvas, true)
      break
    case UMLGeneralNodeView.SD_DECORATION:
      this.sizeAsDecorationForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_DECORATION_LABEL:
      this.sizeAsDecorationForm(canvas, true)
      break
    case UMLGeneralNodeView.SD_ICON:
      this.sizeAsIconicForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_ICON_LABEL:
      this.sizeAsIconicForm(canvas, true)
      break
    }
    this.delimitContainingBoundary(canvas)
  }

  sizeCommon (canvas) {
  }

  sizeAsCanonicalForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = sz.x
    this.minHeight = sz.y
  }

  sizeAsDecorationForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(this.nameCompartment.minWidth + DECORATION_ICON_WIDTH + COMPARTMENT_RIGHT_PADDING + COMPARTMENT_LEFT_PADDING, sz.x)
    this.minHeight = sz.y
  }

  sizeAsIconicForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    if (this.hasStereotypeIcon()) {
      this.minWidth = Math.max(sz.x, this.model.stereotype.icon.width)
      this.minHeight = this.model.stereotype.icon.height + sz.y
    } else {
      this.minWidth = Math.max(sz.x, ICONICVIEW_ICONMINWIDTH)
      this.minHeight = ICONICVIEW_ICONMINHEIGHT + sz.y
    }
  }

  arrangeObject (canvas) {
    this.arrangeCommon(canvas)
    switch (this.stereotypeDisplay) {
    case UMLGeneralNodeView.SD_NONE:
      this.arrangeAsCanonicalForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_LABEL:
      this.arrangeAsCanonicalForm(canvas, true)
      break
    case UMLGeneralNodeView.SD_DECORATION:
      this.arrangeAsDecorationForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_DECORATION_LABEL:
      this.arrangeAsDecorationForm(canvas, true)
      break
    case UMLGeneralNodeView.SD_ICON:
      this.arrangeAsIconicForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_ICON_LABEL:
      this.arrangeAsIconicForm(canvas, true)
      break
    }
    super.arrangeObject(canvas)
  }

  arrangeCommon (canvas) {
    this.mainRect.setRect(this.left, this.top, this.getRight(), this.getBottom())
  }

  arrangeAsCanonicalForm (canvas, showLabel) {
    this.arrangeAllCompartments(this.mainRect, canvas)
  }

  arrangeAsDecorationForm (canvas, showLabel) {
    this.arrangeAllCompartments(this.mainRect, canvas)
    this.nameCompartment.width = this.width - DECORATION_ICON_WIDTH - COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING
    this.nameCompartment.arrange(canvas)
  }

  arrangeAsIconicForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    var r = new Rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2 - sz.y)
    this.iconRect = this.computeIconRect(r, this.iconRatio)
    var r2 = new Rect(this.mainRect.x1, this.mainRect.y1 + this.iconRect.getHeight(), this.mainRect.x2, this.mainRect.y2)
    this.arrangeAllCompartments(r2, canvas)
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.lineColor = '#ffffff00'
    canvas.fillColor = SHADOW_COLOR
    this.drawShadowCommon(canvas)
    switch (this.stereotypeDisplay) {
    case UMLGeneralNodeView.SD_NONE:
      this.drawShadowAsCanonicalForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_LABEL:
      this.drawShadowAsCanonicalForm(canvas, true)
      break
    case UMLGeneralNodeView.SD_DECORATION:
      this.drawShadowAsDecorationForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_DECORATION_LABEL:
      this.drawShadowAsDecorationForm(canvas, true)
      break
    case UMLGeneralNodeView.SD_ICON:
      this.drawShadowAsIconicForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_ICON_LABEL:
      this.drawShadowAsIconicForm(canvas, true)
      break
    }
    canvas.restoreState()
    super.drawShadow(canvas)
  }

  drawShadowCommon (canvas) {}

  drawShadowAsCanonicalForm (canvas, showLabel) {
    canvas.fillRect(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET
    )
  }

  drawShadowAsDecorationForm (canvas, showLabel) {
    this.drawShadowAsCanonicalForm(canvas)
  }

  drawShadowAsIconicForm (canvas, showLabel) {
    /*
        canvas.fillRect(
            this.iconRect.x1 + SHADOW_OFFSET,
            this.iconRect.y1 + SHADOW_OFFSET,
            this.iconRect.x2 + SHADOW_OFFSET,
            this.iconRect.y2 + SHADOW_OFFSET
        )
        */
  }

  drawObject (canvas) {
    this.drawCommon(canvas)
    switch (this.stereotypeDisplay) {
    case UMLGeneralNodeView.SD_NONE:
      this.drawAsCanonicalForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_LABEL:
      this.drawAsCanonicalForm(canvas, true)
      break
    case UMLGeneralNodeView.SD_DECORATION:
      this.drawAsDecorationForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_DECORATION_LABEL:
      this.drawAsDecorationForm(canvas, true)
      break
    case UMLGeneralNodeView.SD_ICON:
      this.drawAsIconicForm(canvas, false)
      break
    case UMLGeneralNodeView.SD_ICON_LABEL:
      this.drawAsIconicForm(canvas, true)
      break
    }
    super.drawObject(canvas)
  }

  drawCommon (canvas) {
    if ((this.stereotypeDisplay !== UMLGeneralNodeView.SD_ICON) && (this.stereotypeDisplay !== UMLGeneralNodeView.SD_ICON_LABEL)) {
      canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
      canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
    }
  }

  drawAsCanonicalForm (canvas, showLabel) {}

  drawAsDecorationForm (canvas, showLabel) {
    var r = new Rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
    var icon_x = r.x2 - COMPARTMENT_RIGHT_PADDING - DECORATION_ICON_WIDTH
    var icon_y = r.y1 + COMPARTMENT_TOP_PADDING
    this.iconRect = this.computeIconRect(new Rect(icon_x, icon_y, icon_x + DECORATION_ICON_WIDTH, icon_y + DECORATION_ICON_HEIGHT), this.iconRatio)
    this.drawDecorationIcon(canvas, this.iconRect)
  }

  drawAsIconicForm (canvas, showLabel) {
    var _iconWidth = this.iconRect.getWidth()
    var _iconHeight = this.iconRect.getHeight()
    var _x = (this.left + this.getRight()) / 2
    this.drawIcon(canvas, new Rect(_x - (_iconWidth / 2), this.top, _x + (_iconWidth / 2), this.top + _iconHeight))
  }

}

/**
 * Stereotype Display: `none`
 * @const {string}
 */
UMLGeneralNodeView.SD_NONE = 'none'

/**
 * Stereotype Display: `label`
 * @const {string}
 */
UMLGeneralNodeView.SD_LABEL = 'label'

/**
 * Stereotype Display: `decoration`
 * @const {string}
 */
UMLGeneralNodeView.SD_DECORATION = 'decoration'

/**
 * Stereotype Display: `decoration-label`
 * @const {string}
 */
UMLGeneralNodeView.SD_DECORATION_LABEL = 'decoration-label'

/**
 * Stereotype Display: `icon`
 * @const {string}
 */
UMLGeneralNodeView.SD_ICON = 'icon'

/**
 * Stereotype Display: `icon-label`
 * @const {string}
 */
UMLGeneralNodeView.SD_ICON_LABEL = 'icon-label'

/**
 * UMLFloatingNodeView
 */
class UMLFloatingNodeView extends NodeView {

  constructor () {
    super()
    this.containerChangeable = false
    this.containerExtending = false

    /** @member {NodeLabelView} */
    this.nameLabel = new NodeLabelView()
    this.nameLabel.distance = 20
    this.nameLabel.alpha = 3 * Math.PI / 4
    this.addSubView(this.nameLabel)

    /** @member {NodeLabelView} */
    this.stereotypeLabel = new NodeLabelView()
    this.stereotypeLabel.distance = 35
    this.stereotypeLabel.alpha = 3 * Math.PI / 4
    this.addSubView(this.stereotypeLabel)

    /** @member {NodeLabelView} */
    this.propertyLabel = new NodeLabelView()
    this.propertyLabel.distance = 20
    this.propertyLabel.alpha = -3 * Math.PI / 4
    this.addSubView(this.propertyLabel)

    /** @member {boolean} */
    this.showProperty = true
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.name
      if (this.model.stereotype !== null) {
        this.stereotypeLabel.text = this.model.getStereotypeString()
      }
      // propertyLabel
      this.propertyLabel.text = this.model.getPropertyString()
      this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false)
      // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.nameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameLabel, 'model', this.model)
      }
      // stereotypeLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.stereotypeLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.stereotypeLabel, 'model', this.model)
      }
      // propertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.propertyLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.propertyLabel, 'model', this.model)
      }
    }
  }

  /**
   * Compute Junction Point
   *
   * @param {Rect} r
   * @param {Point} p
   * @return {Point}
   */
  _junction2 (r, p) {
    var c = new Point()
    c.x = (r.x1 + r.x2) / 2
    c.y = (r.y1 + r.y2) / 2
    if ((c.x === p.x) || (c.y === p.y)) {
      return Coord.orthoJunction(r, p)
    }
    var lean = (p.y - c.y) / (p.x - c.x)
    // contact points
    var cp = []
    cp[0] = new Point(r.x1, Math.round(lean * (r.x1 - c.x) + c.y)) // left
    cp[1] = new Point(r.x2, Math.round(lean * (r.x2 - c.x) + c.y)) // right
    cp[2] = new Point(Math.round((r.y1 - c.y) / lean + c.x), r.y1) // top
    cp[3] = new Point(Math.round((r.y2 - c.y) / lean + c.x), r.y2) // bottom

    var i
    if (Coord.ptInRect2(p, r)) {
      var idx = 0
      var md = Math.sqrt(((cp[0].x - p.x) * (cp[0].x - p.x)) + ((cp[0].y - p.y) * (cp[0].y - p.y)))
      for (i = 1; i <= 3; i++) {
        var d = Math.sqrt(((cp[i].x - p.x) * (cp[i].x - p.x)) + ((cp[i].y - p.y) * (cp[i].y - p.y)))
        if (d < md) {
          md = d
          idx = i
        }
      }
      return cp[idx]
    } else {
      var cpRect = new Rect(c.x, c.y, p.x, p.y)
      Coord.normalizeRect(cpRect)
      c.x = cpRect.x1
      c.y = cpRect.y1
      p.x = cpRect.x2
      p.y = cpRect.y2
      i = -1
      do {
        i++
      } while (!(((r.x1 <= cp[i].x) && (cp[i].x <= r.x2) &&
                  (r.y1 <= cp[i].y) && (cp[i].y <= r.y2) &&
                  (c.x <= cp[i].x) && (cp[i].x <= p.x) &&
                  (c.y <= cp[i].y) && (cp[i].y <= p.y)) || (i > 4)))
      if (i > 3) {
        return new Point((r.x1 + r.x2) / 2, (r.y1 + r.y2) / 2)
      } else {
        return cp[i]
      }
    }
  }

  arrange (canvas) {
    this.nameLabel.visible = (this.nameLabel.text.length > 0)
    this.stereotypeLabel.visible = (this.stereotypeLabel.text.length > 0)
    super.arrange(canvas)
  }
}

/**
 * UMLGeneralEdgeView
 */
class UMLGeneralEdgeView extends EdgeView {

  constructor () {
    super()

    /** @member {string} */
    this.stereotypeDisplay = UMLGeneralNodeView.SD_LABEL

    /** @member {boolean} */
    this.showVisibility = true

    /** @member {boolean} */
    this.showProperty = true

    /** @member {EdgeLabelView} */
    this.nameLabel = new EdgeLabelView()
    this.nameLabel.hostEdge = this
    this.nameLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.nameLabel.distance = 15
    this.nameLabel.alpha = Math.PI / 2
    this.addSubView(this.nameLabel)

    /** @member {EdgeLabelView} */
    this.stereotypeLabel = new EdgeLabelView()
    this.stereotypeLabel.hostEdge = this
    this.stereotypeLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.stereotypeLabel.distance = 30
    this.stereotypeLabel.alpha = Math.PI / 2
    this.addSubView(this.stereotypeLabel)

    /** @member {EdgeLabelView} */
    this.propertyLabel = new EdgeLabelView()
    this.propertyLabel.hostEdge = this
    this.propertyLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.propertyLabel.distance = 15
    this.propertyLabel.alpha = -Math.PI / 2
    this.addSubView(this.propertyLabel)
  }

  update (canvas) {
    if (this.model) {
      // nameLabel
      this.nameLabel.visible = (this.model.name.length > 0)
      if (this.model.name) {
        this.nameLabel.text = this.model.getString(this)
      }
      // stereotypeLabel
      this.stereotypeLabel.visible =
        this.model.stereotype && (this.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL ||
                                  this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL ||
                                  this.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)
      if (this.model.stereotype) {
        this.stereotypeLabel.text = this.model.getStereotypeString()
      }
      // propertyLabel
      this.propertyLabel.text = this.model.getPropertyString()
      this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false)
      // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.nameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameLabel, 'model', this.model)
      }
      // stereotypeLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.stereotypeLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.stereotypeLabel, 'model', this.model)
      }
      // propertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.propertyLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.propertyLabel, 'model', this.model)
      }
    }
    super.update(canvas)
  }
}

/**
 * UMLClassifierView
 */
class UMLClassifierView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = true

    /** @member {boolean} */
    this.suppressAttributes = false

    /** @member {boolean} */
    this.suppressOperations = false

    /** @member {boolean} */
    this.suppressReceptions = true

    /** @member {boolean} */
    this.showMultiplicity = true

    /** @member {boolean} */
    this.showOperationSignature = true

    /** @member {UMLAttributeCompartmentView} */
    this.attributeCompartment = new UMLAttributeCompartmentView()
    this.attributeCompartment.parentStyle = true
    this.addSubView(this.attributeCompartment)

    /** @member {UMLOperationCompartmentView} */
    this.operationCompartment = new UMLOperationCompartmentView()
    this.operationCompartment.parentStyle = true
    this.addSubView(this.operationCompartment)

    /** @member {UMLReceptionCompartmentView} */
    this.receptionCompartment = new UMLReceptionCompartmentView()
    this.receptionCompartment.parentStyle = true
    this.addSubView(this.receptionCompartment)

    /** @member {UMLTemplateParameterCompartmentView} */
    this.templateParameterCompartment = new UMLTemplateParameterCompartmentView()
    this.templateParameterCompartment.parentStyle = true
    this.addSubView(this.templateParameterCompartment)
  }

  getAllCompartments () {
    return [
      this.nameCompartment,
      this.attributeCompartment,
      this.operationCompartment,
      this.receptionCompartment
    ]
  }

  update (canvas) {
    // attributeCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.attributeCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.attributeCompartment, 'model', this.model)
    }
    // operationCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.operationCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.operationCompartment, 'model', this.model)
    }
    // receptionCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.receptionCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.receptionCompartment, 'model', this.model)
    }
    // templateParameterCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.templateParameterCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.templateParameterCompartment, 'model', this.model)
    }
    if (this.model) {
      if (this.model.templateParameters && this.model.templateParameters.length > 0) {
        this.templateParameterCompartment.visible = true
      } else {
        this.templateParameterCompartment.visible = false
      }
    }
    if ((this.stereotypeDisplay === UMLGeneralNodeView.SD_ICON) || (this.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
      this.templateParameterCompartment.visible = false
    }
    this.attributeCompartment.visible = !this.suppressAttributes
    this.operationCompartment.visible = !this.suppressOperations
    this.receptionCompartment.visible = !this.suppressReceptions
    super.update(canvas)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    if (this.templateParameterCompartment.visible) {
      this.templateParameterCompartment.size(canvas)
      this.templateParameterCompartment.width = this.templateParameterCompartment.minWidth
      this.templateParameterCompartment.height = this.templateParameterCompartment.minHeight
      this.minWidth = Math.max(this.minWidth, this.templateParameterCompartment.width) + TEMPLATEPARAMETERCOMPARTMENT_LEFT_MARGIN + TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY
      this.minHeight = this.minHeight + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP
    }
  }

  arrangeCommon (canvas) {
    super.arrangeCommon(canvas)
    if (this.templateParameterCompartment.visible) {
      this.templateParameterCompartment.left = this.getRight() - this.templateParameterCompartment.width
      this.templateParameterCompartment.top = this.top
      this.templateParameterCompartment.arrange(canvas)
      var x1 = this.left
      var y1 = this.top + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP
      var x2 = this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY
      var y2 = this.getBottom()
      this.mainRect.setRect(x1, y1, x2, y2)
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.attributeCompartment.visible) {
      canvas.line(
        this.attributeCompartment.left,
        this.attributeCompartment.top,
        this.attributeCompartment.getRight(),
        this.attributeCompartment.top)
    }
    if (this.operationCompartment.visible) {
      canvas.line(
        this.operationCompartment.left,
        this.operationCompartment.top,
        this.operationCompartment.getRight(),
        this.operationCompartment.top)
    }
    if (this.receptionCompartment.visible) {
      canvas.line(
        this.receptionCompartment.left,
        this.receptionCompartment.top,
        this.receptionCompartment.getRight(),
        this.receptionCompartment.top)
    }
  }
}

/**
 * UMLUndirectedRelationshipView
 */
class UMLUndirectedRelationshipView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_FLAT
    this.lineMode = EdgeView.LM_SOLID

    /** @member {boolean} */
    this.showMultiplicity = true

    /** @member {boolean} */
    this.showType = true

    /** @member {number} */
    this.showEndOrder = UMLUndirectedRelationshipView.EO_HIDE

    /** @member {EdgeLabelView} */
    this.tailRoleNameLabel = new EdgeLabelView()
    this.tailRoleNameLabel.hostEdge = this
    this.tailRoleNameLabel.edgePosition = EdgeParasiticView.EP_TAIL
    this.tailRoleNameLabel.alpha = Math.PI / 6
    this.tailRoleNameLabel.distance = 30
    this.addSubView(this.tailRoleNameLabel)

    /** @member {EdgeLabelView} */
    this.tailPropertyLabel = new EdgeLabelView()
    this.tailPropertyLabel.hostEdge = this
    this.tailPropertyLabel.edgePosition = EdgeParasiticView.EP_TAIL
    this.tailPropertyLabel.alpha = Math.PI / 4
    this.tailPropertyLabel.distance = 40
    this.addSubView(this.tailPropertyLabel)

    /** @member {EdgeLabelView} */
    this.tailMultiplicityLabel = new EdgeLabelView()
    this.tailMultiplicityLabel.hostEdge = this
    this.tailMultiplicityLabel.edgePosition = EdgeParasiticView.EP_TAIL
    this.tailMultiplicityLabel.alpha = -Math.PI / 6
    this.tailMultiplicityLabel.distance = 25
    this.addSubView(this.tailMultiplicityLabel)

    /** @member {EdgeLabelView} */
    this.headRoleNameLabel = new EdgeLabelView()
    this.headRoleNameLabel.hostEdge = this
    this.headRoleNameLabel.edgePosition = EdgeParasiticView.EP_HEAD
    this.headRoleNameLabel.alpha = -Math.PI / 6
    this.headRoleNameLabel.distance = 30
    this.addSubView(this.headRoleNameLabel)

    /** @member {EdgeLabelView} */
    this.headPropertyLabel = new EdgeLabelView()
    this.headPropertyLabel.hostEdge = this
    this.headPropertyLabel.edgePosition = EdgeParasiticView.EP_HEAD
    this.headPropertyLabel.alpha = -Math.PI / 4
    this.headPropertyLabel.distance = 40
    this.addSubView(this.headPropertyLabel)

    /** @member {EdgeLabelView} */
    this.headMultiplicityLabel = new EdgeLabelView()
    this.headMultiplicityLabel.hostEdge = this
    this.headMultiplicityLabel.edgePosition = EdgeParasiticView.EP_HEAD
    this.headMultiplicityLabel.alpha = Math.PI / 6
    this.headMultiplicityLabel.distance = 25
    this.addSubView(this.headMultiplicityLabel)
  }

  update (canvas) {
    if (this.model) {
      // Ends
      let end1 = this.model.end1
      let end1Owner = false
      let end2 = this.model.end2
      let end2Owner = false

      // Ownership Ends
      if (end1.ownerAttribute instanceof type.UMLAttribute) {
        end1 = end1.ownerAttribute
        end1Owner = true
      }
      if (end2.ownerAttribute instanceof type.UMLAttribute) {
        end2 = end2.ownerAttribute
        end2Owner = true
      }

      // temporal properties for quick edit component visibility
      this._tailEndSole = !end1Owner
      this._headEndSole = !end2Owner

      // RoleName Labels
      this.tailRoleNameLabel.visible = (end1.name.length > 0)
      if (end1.name) {
        this.tailRoleNameLabel.text = end1.getString({showVisibility: this.showVisibility})
      }
      this.headRoleNameLabel.visible = (end2.name.length > 0)
      if (end2.name) {
        this.headRoleNameLabel.text = end2.getString({showVisibility: this.showVisibility})
      }
      // isDerived
      if (end1.isDerived === true) {
        this.tailRoleNameLabel.text = '/ ' + this.tailRoleNameLabel.text
      }
      if (end2.isDerived === true) {
        this.headRoleNameLabel.text = '/ ' + this.headRoleNameLabel.text
      }

      // Property Labels
      this.tailPropertyLabel.text = end1.getPropertyString()
      this.headPropertyLabel.text = end2.getPropertyString()
      this.tailPropertyLabel.visible = (this.showProperty ? this.tailPropertyLabel.text.length > 0 : false)
      this.headPropertyLabel.visible = (this.showProperty ? this.headPropertyLabel.text.length > 0 : false)

      // Multiplicity Labels
      this.tailMultiplicityLabel.visible = (this.showMultiplicity && end1.multiplicity.length > 0)
      if (end1.multiplicity) {
        this.tailMultiplicityLabel.text = end1.multiplicity
      }
      this.headMultiplicityLabel.visible = (this.showMultiplicity && end2.multiplicity.length > 0)
      if (end2.multiplicity) {
        this.headMultiplicityLabel.text = end2.multiplicity
      }

      // Tail End Style (End1)
      switch (this.model.end1.navigable) {
      case UMLRelationshipEnd.NK_UNSPECIFIED:
        this.tailEndStyle = end1Owner ? EdgeView.ES_DOT : EdgeView.ES_FLAT
        switch (end1.aggregation) {
        case UMLAttribute.AK_SHARED:
          this.tailEndStyle = end1Owner ? EdgeView.ES_DOT_DIAMOND : EdgeView.ES_DIAMOND
          break
        case UMLAttribute.AK_COMPOSITE:
          this.tailEndStyle = end1Owner ? EdgeView.ES_DOT_FILLED_DIAMOND : EdgeView.ES_FILLED_DIAMOND
          break
        }
        break
      case UMLRelationshipEnd.NK_NAVIGABLE:
        this.tailEndStyle = end1Owner ? EdgeView.ES_DOT_STICK_ARROW : EdgeView.ES_STICK_ARROW
        switch (end1.aggregation) {
        case UMLAttribute.AK_SHARED:
          this.tailEndStyle = end1Owner ? EdgeView.ES_DOT_ARROW_DIAMOND : EdgeView.ES_ARROW_DIAMOND
          break
        case UMLAttribute.AK_COMPOSITE:
          this.tailEndStyle = end1Owner ? EdgeView.ES_DOT_ARROW_FILLED_DIAMOND : EdgeView.ES_ARROW_FILLED_DIAMOND
          break
        }
        break
      case UMLRelationshipEnd.NK_NOTNAVIGABLE:
        this.tailEndStyle = end1Owner ? EdgeView.ES_DOT_CROSS : EdgeView.ES_CROSS
        switch (end1.aggregation) {
        case UMLAttribute.AK_SHARED:
          this.tailEndStyle = end1Owner ? EdgeView.ES_DOT_DIAMOND : EdgeView.ES_DIAMOND
          break
        case UMLAttribute.AK_COMPOSITE:
          this.tailEndStyle = end1Owner ? EdgeView.ES_DOT_FILLED_DIAMOND : EdgeView.ES_FILLED_DIAMOND
          break
        }
        break
      }

      // Head End Style (End2)
      switch (this.model.end2.navigable) {
      case UMLRelationshipEnd.NK_UNSPECIFIED:
        this.headEndStyle = end2Owner ? EdgeView.ES_DOT : EdgeView.ES_FLAT
        switch (end2.aggregation) {
        case UMLAttribute.AK_SHARED:
          this.headEndStyle = end2Owner ? EdgeView.ES_DOT_DIAMOND : EdgeView.ES_DIAMOND
          break
        case UMLAttribute.AK_COMPOSITE:
          this.headEndStyle = end2Owner ? EdgeView.ES_DOT_FILLED_DIAMOND : EdgeView.ES_FILLED_DIAMOND
          break
        }
        break
      case UMLRelationshipEnd.NK_NAVIGABLE:
        this.headEndStyle = end2Owner ? EdgeView.ES_DOT_STICK_ARROW : EdgeView.ES_STICK_ARROW
        switch (end2.aggregation) {
        case UMLAttribute.AK_SHARED:
          this.headEndStyle = end2Owner ? EdgeView.ES_DOT_ARROW_DIAMOND : EdgeView.ES_ARROW_DIAMOND
          break
        case UMLAttribute.AK_COMPOSITE:
          this.headEndStyle = end2Owner ? EdgeView.ES_DOT_ARROW_FILLED_DIAMOND : EdgeView.ES_ARROW_FILLED_DIAMOND
          break
        }
        break
      case UMLRelationshipEnd.NK_NOTNAVIGABLE:
        this.headEndStyle = end2Owner ? EdgeView.ES_DOT_CROSS : EdgeView.ES_CROSS
        switch (end2.aggregation) {
        case UMLAttribute.AK_SHARED:
          this.headEndStyle = end2Owner ? EdgeView.ES_DOT_DIAMOND : EdgeView.ES_DIAMOND
          break
        case UMLAttribute.AK_COMPOSITE:
          this.headEndStyle = end2Owner ? EdgeView.ES_DOT_FILLED_DIAMOND : EdgeView.ES_FILLED_DIAMOND
          break
        }
        break
      }

      // tailRoleNameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.tailRoleNameLabel.model !== end1) {
        app.repository.bypassFieldAssign(this.tailRoleNameLabel, 'model', end1)
      }
      // tailPropertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.tailPropertyLabel.model !== end1) {
        app.repository.bypassFieldAssign(this.tailPropertyLabel, 'model', end1)
      }
      // tailMultiplicityLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.tailMultiplicityLabel.model !== end1) {
        app.repository.bypassFieldAssign(this.tailMultiplicityLabel, 'model', end1)
      }
      // headRoleNameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.headRoleNameLabel.model !== end1) {
        app.repository.bypassFieldAssign(this.headRoleNameLabel, 'model', end2)
      }
      // headPropertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.headPropertyLabel.model !== end1) {
        app.repository.bypassFieldAssign(this.headPropertyLabel, 'model', end2)
      }
      // headMultiplicityLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.headMultiplicityLabel.model !== end1) {
        app.repository.bypassFieldAssign(this.headMultiplicityLabel, 'model', end2)
      }
    }
    super.update(canvas)
  }

  drawEndOrder (canvas, onRight) {
    const x1 = this.nameLabel.left - 5
    const x2 = this.nameLabel.getRight() + 5
    const y = (this.nameLabel.top + this.nameLabel.getBottom()) / 2
    if (onRight) {
      canvas.fillPolygon([new Point(x2, y - 5), new Point(x2 + 10, y), new Point(x2, y + 5)])
    } else {
      canvas.fillPolygon([new Point(x1, y - 5), new Point(x1 - 10, y), new Point(x1, y + 5)])
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    const end1X = this.points.getPoint(0).x
    const end2X = this.points.getPoint(this.points.count() - 1).x
    canvas.fillColor = this.lineColor
    if (this.showEndOrder === UMLUndirectedRelationshipView.EO_FORWARD) {
      this.drawEndOrder(canvas, end1X < end2X)
    } else if (this.showEndOrder === UMLUndirectedRelationshipView.EO_BACKWARD) {
      this.drawEndOrder(canvas, end1X > end2X)
    }
  }
}

/**
 * ShowEndOrder: `hide`
 * @const {string}
 */
UMLUndirectedRelationshipView.EO_HIDE = 'hide'

/**
 * ShowEndOrder: `forward`
 * @const {string}
 */
UMLUndirectedRelationshipView.EO_FORWARD = 'forward'

/**
 * ShowEndOrder: `backward`
 * @const {string}
 */
UMLUndirectedRelationshipView.EO_BACKWARD = 'backward'

/**************************************************************************
 *                                                                        *
 *                            CLASS DIAGRAM VIEWS                         *
 *                                                                        *
 *************************************************************************/

/**
 * UMLClassDiagram
 */
class UMLClassDiagram extends UMLDiagram {
  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLInstance) ||
      (model instanceof type.UMLPort) ||
      (model instanceof type.UMLTemplateParameter) ||
      (model instanceof type.UMLAttribute) ||
      (model instanceof type.UMLOperation) ||
      (model instanceof type.UMLReception) ||
      (model instanceof type.UMLEnumerationLiteral) ||
      (model instanceof type.UMLSlot) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLInterfaceRealization) ||
      (model instanceof type.UMLComponentRealization) ||
      (model instanceof type.UMLAssociation) ||
      (model instanceof type.UMLLink) ||
      (model instanceof type.UMLConnector)
  }
}

/**
 * UMLClassView
 */
class UMLClassView extends UMLClassifierView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.class.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.class.stereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
    this.suppressAttributes = app.preferences.get('uml.class.suppressAttributes', false)
    this.suppressOperations = app.preferences.get('uml.class.suppressOperations', false)
  }

  drawCommon (canvas) {
    super.drawCommon(canvas)
    if (this.model && this.model.isActive) {
      canvas.line(this.mainRect.x1 + CLASS_ACTIVE_VERTLINE_WIDTH, this.mainRect.y1, this.mainRect.x1 + CLASS_ACTIVE_VERTLINE_WIDTH, this.mainRect.y2)
      canvas.line(this.mainRect.x2 - CLASS_ACTIVE_VERTLINE_WIDTH, this.mainRect.y1, this.mainRect.x2 - CLASS_ACTIVE_VERTLINE_WIDTH, this.mainRect.y2)
    }
  }
}

/**
 * UMLInterfaceView
 */
class UMLInterfaceView extends UMLClassifierView {

  constructor () {
    super()

    /** temporal */
    this.depViews = null
    this.relViews = null

    this.fillColor = app.preferences.get('uml.interface.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.interface.stereotypeDisplay', UMLGeneralNodeView.SD_ICON)
    this.suppressAttributes = app.preferences.get('uml.interface.suppressAttributes', true)
    this.suppressOperations = app.preferences.get('uml.interface.suppressOperations', true)
  }

  collectSupplierDependencyViews () {
    var views = []
    for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
      var v = this.getDiagram().ownedViews[i]
      if ((v instanceof UMLDependencyView) && (v.head === this)) {
        views.push(v)
      }
    }
    return views
  }

  collectSupplierRealizationViews () {
    var views = []
    for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
      var v = this.getDiagram().ownedViews[i]
      if ((v instanceof UMLInterfaceRealizationView) && (v.head === this)) {
        views.push(v)
      }
    }
    return views
  }

  getStereotypeLabelText () {
    return '«interface»'
  }

  update (canvas) {
    super.update(canvas)
  }

  arrangeCommon (canvas) {
    this.depViews = this.collectSupplierDependencyViews()
    this.relViews = this.collectSupplierRealizationViews()
    super.arrangeCommon(canvas)
  }

  drawShadowAsIconicForm (canvas) {
    if ((this.relViews.length > 0) || (this.depViews.length === 0)) {
      canvas.fillEllipse(
        this.iconRect.x1 + SHADOW_OFFSET,
        this.iconRect.y1 + SHADOW_OFFSET,
        this.iconRect.x2 + SHADOW_OFFSET,
        this.iconRect.y2 + SHADOW_OFFSET
      )
    }
  }

  drawIcon (canvas, rect) {
    if ((this.depViews.length > 0) && (this.relViews.length > 0)) {
      this.drawBallAndSocketNotation(canvas, rect, this.depViews)
    } else if (this.depViews.length > 0) {
      this.drawSocketNotation(canvas, rect, this.depViews)
    } else {
      this.drawBallNotation(canvas, rect)
    }
  }

  drawDecorationIcon (canvas, rect) {
    this.drawBallNotation(canvas, new Rect(rect.x1 + 3, rect.y1 + 3, rect.x2 - 3, rect.y2 - 3))
  }

  drawBallNotation (canvas, rect) {
    canvas.fillEllipse(rect.x1, rect.y1, rect.x2, rect.y2)
    canvas.ellipse(rect.x1, rect.y1, rect.x2, rect.y2)
  }

  drawSocketNotation (canvas, rect, supplierDependencyViews) {
    var i, len, v
    var c = Coord.getCenter(rect)
    for (i = 0, len = supplierDependencyViews.length; i < len; i++) {
      v = supplierDependencyViews[i]
      v.arrange(canvas)
      var b = Coord.junction(rect, v.points.getPoint(v.points.count() - 1))
      var theta = Coord.getAngle(c.x, c.y, b.x, b.y)
      var radius = Math.min(rect.getWidth() / 2, rect.getHeight() / 2)
      canvas.arc(c.x, c.y, radius, theta - Math.PI / 2, theta + Math.PI / 2, false)
    }
  }

  drawBallAndSocketNotation (canvas, rect, supplierDependencyViews) {
    this.drawSocketNotation(canvas, rect, supplierDependencyViews)
    var r = new Rect(rect.x1 + 3, rect.y1 + 3, rect.x2 - 3, rect.y2 - 3)
    this.drawBallNotation(canvas, r)
  }
}

/**
 * UMLSignalView
 */
class UMLSignalView extends UMLClassifierView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.signal.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getStereotypeLabelText () {
    return '«signal»'
  }
}

/**
 * UMLDataTypeView
 */
class UMLDataTypeView extends UMLClassifierView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.datatype.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.suppressAttributes = true
    this.suppressOperations = true
  }

  getStereotypeLabelText () {
    return '«dataType»'
  }
}

/**
 * UMLPrimitiveTypeView
 */
class UMLPrimitiveTypeView extends UMLClassifierView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.datatype.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.suppressAttributes = true
    this.suppressOperations = true
  }

  getStereotypeLabelText () {
    return '«primitiveType»'
  }
}

/**
 * UMLEnumerationLiteralView
 */
class UMLEnumerationLiteralView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    var options = {
      showVisibility: true,
      stereotypeDisplay: UMLGeneralNodeView.SD_LABEL,
      showProperty: true
    }
    if (this._parent && (this._parent._parent instanceof UMLClassifierView)) {
      options.showVisibility = this._parent._parent.showVisibility
      options.stereotypeDisplay = this._parent._parent.stereotypeDisplay
      options.showProperty = this._parent._parent.showProperty
    }
    if (this.model) {
      this.text = this.model.getString(options)
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
 * UMLEnumerationLiteralCompartmentView
 */
class UMLEnumerationLiteralCompartmentView extends UMLListCompartmentView {
  getItems () {
    return this.model.literals
  }

  createItem () {
    return new UMLEnumerationLiteralView()
  }
}

/**
 * UMLEnumerationView
 */
class UMLEnumerationView extends UMLClassifierView {

  constructor () {
    super()

    /** @member {boolean} */
    this.suppressLiterals = false

    /** @member {UMLEnumerationLiteralCompartmentView} */
    this.enumerationLiteralCompartment = new UMLEnumerationLiteralCompartmentView()
    this.enumerationLiteralCompartment.parentStyle = true
    this.addSubView(this.enumerationLiteralCompartment)

    this.fillColor = app.preferences.get('uml.enumeration.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.enumeration.stereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
    this.suppressAttributes = app.preferences.get('uml.enumeration.suppressAttributes', true)
    this.suppressOperations = app.preferences.get('uml.enumeration.suppressOperations', true)
    this.suppressLiterals = app.preferences.get('uml.enumeration.suppressLiterals', false)
  }

  getAllCompartments () {
    return [
      this.nameCompartment,
      this.enumerationLiteralCompartment,
      this.attributeCompartment,
      this.operationCompartment
    ]
  }

  getStereotypeLabelText () {
    return '«enumeration»'
  }

  update (canvas) {
    // enumerationLiteralCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.enumerationLiteralCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.enumerationLiteralCompartment, 'model', this.model)
    }
    this.enumerationLiteralCompartment.visible = !this.suppressLiterals
    super.update(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.enumerationLiteralCompartment.visible) {
      canvas.line(
        this.enumerationLiteralCompartment.left,
        this.enumerationLiteralCompartment.top,
        this.enumerationLiteralCompartment.getRight(),
        this.enumerationLiteralCompartment.top)
    }
  }
}

/**
 * UMLGeneralizationView
 */
class UMLGeneralizationView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_TRIANGLE
    this.lineMode = EdgeView.LM_SOLID
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLClassifier)
  }
}

/**
 * UMLDependencyView
 */
class UMLDependencyView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_DOT
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.lineMode = EdgeView.LM_DOT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    if (this.head instanceof UMLInterfaceView) {
      var v = this.head
      if ((v.stereotypeDisplay === UMLGeneralNodeView.SD_ICON) || (v.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
        this.lineMode = EdgeView.LM_SOLID
        this.headEndStyle = EdgeView.ES_FLAT
        var c = this.points.count()
        var p = Coord.junction(v.iconRect, this.points.getPoint(c - 1))
        this.points.setPoint(c - 1, p)
        if ((this.lineStyle === EdgeView.LS_RECTILINEAR || this.lineStyle === EdgeView.LS_ROUNDRECT) && (c >= 2)) {
          var p2 = this.points.getPoint(c - 2)
          if (Math.abs(p2.x - p.x) > Math.abs(p2.y - p.y)) {
            p2.y = p.y
          } else {
            p2.x = p.x
          }
          this.points.setPoint(c - 2, p2)
        }
      }
    }
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLModelElement)
  }
}

/**
 * UMLRealizationView
 */
class UMLRealizationView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_TRIANGLE
    this.lineMode = EdgeView.LM_DOT
  }
}

/**
 * UMLInterfaceRealizationView
 */
class UMLInterfaceRealizationView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_TRIANGLE
    this.lineMode = EdgeView.LM_DOT
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.lineMode = EdgeView.LM_DOT
    this.headEndStyle = EdgeView.ES_TRIANGLE
    if (this.head instanceof UMLInterfaceView) {
      var v = this.head
      if ((v.stereotypeDisplay === UMLGeneralNodeView.SD_ICON) || (v.stereotypeDisplay === UMLGeneralNodeView.SD_ICON_LABEL)) {
        this.lineMode = EdgeView.LM_SOLID
        this.headEndStyle = EdgeView.ES_FLAT
        var c = this.points.count()
        var p = Coord.junction(v.iconRect, this.points.getPoint(c - 1))
        this.points.setPoint(c - 1, p)
        if ((this.lineStyle === EdgeView.LS_RECTILINEAR || this.lineStyle === EdgeView.LS_ROUNDRECT) && (c >= 2)) {
          var p2 = this.points.getPoint(c - 2)
          if (Math.abs(p2.x - p.x) > Math.abs(p2.y - p.y)) {
            p2.y = p.y
          } else {
            p2.x = p.x
          }
          this.points.setPoint(c - 2, p2)
        }
      }
    }
  }

  canConnectTo (view, isTail) {
    return (isTail && view.model instanceof type.UMLClassifier) ||
      (!isTail && view.model instanceof type.UMLInterface)
  }
}

/**
 * UMLQualifierCompartmentView
 */
class UMLQualifierCompartmentView extends UMLListCompartmentView {
  getItems () {
    return this.model.qualifiers
  }

  createItem () {
    return new UMLAttributeView()
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
  }
}

/**
 * UMLAssociationView
 */
class UMLAssociationView extends UMLUndirectedRelationshipView {

  constructor () {
    super()

    /** @member {} */
    this.tailQualifiersCompartment = new UMLQualifierCompartmentView()
    this.addSubView(this.tailQualifiersCompartment)

    /** @member {} */
    this.headQualifiersCompartment = new UMLQualifierCompartmentView()
    this.addSubView(this.headQualifiersCompartment)
  }

  update (canvas) {
    if (this.model) {
      this.tailQualifiersCompartment.visible = this.model.end1.qualifiers.length > 0
      this.headQualifiersCompartment.visible = this.model.end2.qualifiers.length > 0
      // tailQualifiersCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.tailQualifiersCompartment.model !== this.model.end1) {
        app.repository.bypassFieldAssign(this.tailQualifiersCompartment, 'model', this.model.end1)
      }
      // headQualifiersCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.headQualifiersCompartment.model !== this.model.end2) {
        app.repository.bypassFieldAssign(this.headQualifiersCompartment, 'model', this.model.end2)
      }
    }
    super.update(canvas)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.tailQualifiersCompartment.sizeObject(canvas)
    this.headQualifiersCompartment.sizeObject(canvas)
  }

  arrangeQualifierCompartment (canvas, qv, isTail) {
    var nv, p1, pn
    if (isTail) {
      nv = this.tail
      p1 = this.points.getPoint(1)
    } else {
      nv = this.head
      p1 = this.points.getPoint(this.points.count() - 2)
    }
    if (qv.visible) {
      qv.width = qv.minWidth
      qv.height = qv.minHeight
      let bb = nv.getBoundingBox(canvas)
      pn = Coord.junction(bb, p1)
      var dx = Math.abs(p1.x - pn.x)
      var dy = Math.abs(p1.y - pn.y)
      if ((pn.x <= p1.x) && (dx >= dy)) {
        qv.left = nv.getRight()
        qv.top = pn.y - qv.height / 2
      } else if ((pn.y >= p1.y) && (dy > dx)) {
        qv.left = pn.x - qv.width / 2
        qv.top = nv.top - qv.height + 1
      } else if ((pn.x > p1.x) && (dx >= dy)) {
        qv.left = nv.left - qv.width + 1
        qv.top = pn.y - qv.height / 2
      } else if ((pn.y < p1.y) && (dy > dx)) {
        qv.left = pn.x - qv.width / 2
        qv.top = nv.getBottom()
      }
    }
  }

  arrange (canvas) {
    this.recalcPoints(canvas)
    this.arrangeQualifierCompartment(canvas, this.tailQualifiersCompartment, true)
    this.arrangeQualifierCompartment(canvas, this.headQualifiersCompartment, false)
    super.arrange(canvas)
    let t = null
    let h = null
    let isSelf = this.head === this.tail
    if (this.tailQualifiersCompartment.visible) {
      t = this.tail
      this.tail = this.tailQualifiersCompartment
    }
    if (this.headQualifiersCompartment.visible) {
      h = this.head
      this.head = this.headQualifiersCompartment
    }

    // To fix wrong junction to qualifers in self-association
    // Self-association is always from top to right
    // This code block is enough, so no need to same code for
    // all qualifierCompartment directions
    if (isSelf) {
      let p1, p2, qc
      if (this.tail === this.tailQualifiersCompartment) {
        p1 = this.points.getPoint(1)
        p2 = this.points.getPoint(2)
        qc = Coord.getCenter(this.tail.getBoundingBox(canvas))
        if (this.head.getRight() < qc.x) {
          p1.x = this.tail.getRight() + 20
          p2.x = this.tail.getRight() + 20
        }
      }
      if (this.head === this.headQualifiersCompartment) {
        p1 = this.points.getPoint(this.points.count() - 2)
        p2 = this.points.getPoint(this.points.count() - 3)
        qc = Coord.getCenter(this.head.getBoundingBox(canvas))
        if (this.tail.getRight() < qc.x) {
          p1.x = this.head.getRight() + 20
          p2.x = this.head.getRight() + 20
        }
      }
    }

    this.recalcPoints(canvas)
    if (this.tailQualifiersCompartment.visible) {
      this.tail = t
    }
    if (this.headQualifiersCompartment.visible) {
      this.head = h
    }
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLClassifier)
  }
}

/**
 * UMLAssociationClassLinkView
 */
class UMLAssociationClassLinkView extends EdgeView {

  constructor () {
    super()
    this.lineMode = EdgeView.LM_DOT
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLClass || view.model instanceof type.UMLAssociation)
  }
}

/**
 * UMLNaryAssociationNodeView
 */
class UMLNaryAssociationNodeView extends UMLFloatingNodeView {

  constructor () {
    super()

    /** @member {boolean} */
    this.showVisibility = false
  }

  update (canvas) {
    super.update(canvas)
    var options = {
      showVisibility: this.showVisibility,
      showProperty: false
    }
    this.nameLabel.text = this.model.getString(options)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = NARY_ASSO_NODE_MINWIDTH
    this.minHeight = NARY_ASSO_NODE_MINHEIGHT
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    var x = this.left + (this.width / 2)
    var y = this.top + (this.height / 2)
    canvas.fillPolygon([
      new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET),
      new Point(x + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
      new Point(this.getRight() + SHADOW_OFFSET, y + SHADOW_OFFSET),
      new Point(x + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
      new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET)])
    canvas.restoreState()
    super.drawShadow(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    let x = (this.left + this.getRight()) / 2
    let y = (this.top + this.getBottom()) / 2
    canvas.fillPolygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)])
    canvas.polygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)])
  }
}

/**
 * UMLTemplateBindingView
 */
class UMLTemplateBindingView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_TRIANGLE
    this.lineMode = EdgeView.LM_DOT
  }

  update (canvas) {
    super.update(canvas)
    this.stereotypeLabel.visible = true
    this.stereotypeLabel.text = '«bind»'
    var bindingInfo = this.model.getBindingInfo()
    if (bindingInfo) {
      this.nameLabel.visible = true
      this.nameLabel.text = bindingInfo
    }
  }
}

/**************************************************************************
 *                                                                        *
 *                        PACKAGE DIAGRAM VIEWS                           *
 *                                                                        *
 **************************************************************************/

/**
 * UMLPackageDiagram
 */
class UMLPackageDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLSubsystem) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLInstance) ||
      (model instanceof type.UMLDependency)
  }
}

/**
 * UMLPackageView
 */
class UMLPackageView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = true
    this.fillColor = app.preferences.get('uml.package.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLClassifierView') ||
      app.metamodels.isKindOf(kind, 'UMLPackageView') ||
      app.metamodels.isKindOf(kind, 'UMLObjectView') ||
      app.metamodels.isKindOf(kind, 'UMLArtifactInstanceView') ||
      app.metamodels.isKindOf(kind, 'UMLComponentInstanceView') ||
      app.metamodels.isKindOf(kind, 'UMLNodeInstanceView')
  }

  update (canvas) {
    super.update(canvas)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.minWidth, PACKAGE_MINWIDTH)
    this.minHeight = Math.max(PACKAGE_TAB_HEIGHT + this.minHeight, PACKAGE_MINHEIGHT)
  }

  arrangeCommon (canvas) {
    super.arrangeCommon(canvas)
    if ((this.stereotypeDisplay !== UMLGeneralNodeView.SD_ICON) && (this.stereotypeDisplay !== UMLGeneralNodeView.SD_ICON_LABEL)) {
      this.mainRect.setRect(this.left, this.top + PACKAGE_TAB_HEIGHT, this.getRight(), this.getBottom())
    }
  }

  drawShadowAsCanonicalForm (canvas, showLabel) {
    var tabRightX = this.left + (this.getRight() - this.left) * 2 / 5
    var tabBottomY = this.top + PACKAGE_TAB_HEIGHT
    canvas.fillRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, tabRightX + SHADOW_OFFSET, tabBottomY + SHADOW_OFFSET)
    canvas.fillRect(this.left + SHADOW_OFFSET, tabBottomY - 1 + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET)
  }

  drawAsCanonicalForm (canvas, showLabel) {
    var tabRightX = this.left + (this.getRight() - this.left) * 2 / 5
    var tabBottomY = this.top + PACKAGE_TAB_HEIGHT
    canvas.fillRect(this.left, this.top, tabRightX, tabBottomY)
    canvas.rect(this.left, this.top, tabRightX, tabBottomY)
    canvas.fillRect(this.left, tabBottomY - 1, this.getRight(), this.getBottom())
    canvas.rect(this.left, tabBottomY - 1, this.getRight(), this.getBottom())
    super.drawAsCanonicalForm(canvas, showLabel)
  }

  drawAsDecorationForm (canvas, showLabel) {
    this.drawAsCanonicalForm(canvas, showLabel)
    super.drawAsDecorationForm(canvas, showLabel)
  }
}

/**
 * UMLModelView
 */
class UMLModelView extends UMLPackageView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.model.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  drawAsCanonicalForm (canvas, showLabel) {
    super.drawAsCanonicalForm(canvas, showLabel)
    var tabRightX = this.left + (this.getRight() - this.left) * 2 / 5
    canvas.polyline([new Point(tabRightX - 9, this.top + 3), new Point(tabRightX - 15, this.top + 10), new Point(tabRightX - 3, this.top + 10), new Point(tabRightX - 9, this.top + 3)])
  }
}

/**
 * UMLSubsystemView
 */
class UMLSubsystemView extends UMLPackageView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.subsystem.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  drawAsCanonicalForm (canvas, showLabel) {
    super.drawAsCanonicalForm(canvas, showLabel)
    var tabRightX = this.left + (this.getRight() - this.left) * 2 / 5
    canvas.polyline([new Point(tabRightX - 8, this.top + 3), new Point(tabRightX - 8, this.top + 7)])
    canvas.polyline([new Point(tabRightX - 11, this.top + 11), new Point(tabRightX - 11, this.top + 7), new Point(tabRightX - 5, this.top + 7)])
    canvas.polyline([new Point(tabRightX - 5, this.top + 11), new Point(tabRightX - 5, this.top + 7), new Point(tabRightX - 11, this.top + 7)])
  }
}

/**
 * UMLContainmentView
 */
class UMLContainmentView extends EdgeView {

  constructor () {
    super()
    this.headEndStyle = EdgeView.ES_CIRCLE_PLUS
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLModelElement)
  }
}

/**************************************************************************
 *                                                                        *
 *                  COMPOSITE STRUCTURE DIAGRAM VIEWS                     *
 *                                                                        *
 **************************************************************************/

/**
 * UMLCompositeStructureDiagram
 */
class UMLCompositeStructureDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLPort) ||
      (model instanceof type.UMLTemplateParameter) ||
      (model instanceof type.UMLAttribute) ||
      (model instanceof type.UMLOperation) ||
      (model instanceof type.UMLReception) ||
      (model instanceof type.UMLEnumerationLiteral) ||
      (model instanceof type.UMLCollaborationUse) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLInterfaceRealization) ||
      (model instanceof type.UMLComponentRealization) ||
      (model instanceof type.UMLAssociation) ||
      (model instanceof type.UMLLink) ||
      (model instanceof type.UMLConnector)
  }
}

/**
 * UMLPortView
 */
class UMLPortView extends UMLFloatingNodeView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_NONE
    this.fillColor = app.preferences.get('uml.port.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')

    /** @member {boolean} */
    this.showVisibility = false

    /** @member {boolean} */
    this.showType = true

    /** @member {boolean} */
    this.showMultiplicity = true
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
    this.minWidth = PORT_MINWIDTH
    this.minHeight = PORT_MINHEIGHT
  }

  arrange (canvas) {
    if (this.containerView) {
      var r = this.containerView.getBoundingBox(canvas)
      var c = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
      var p = this._junction2(r, c)
      this.left = p.x - PORT_MINWIDTH / 2
      this.top = p.y - PORT_MINHEIGHT / 2
      this.setRight(p.x + PORT_MINWIDTH / 2)
      this.setBottom(p.y + PORT_MINHEIGHT / 2)
    }
    super.arrange(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
  }
}

/**
 * UMLPartView
 */
class UMLPartView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = false
    this.showVisibility = false

    /** @member {boolean} */
    this.showMultiplicity = true

    this.fillColor = app.preferences.get('uml.part.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    super.update(canvas)
    if (this.model && (this.model instanceof type.UMLAttribute)) {
      this.nameCompartment.nameLabel.text = this.model.getString(Object.assign({}, this, { stereotypeDisplay: false }))
      this.nameCompartment.nameLabel.underline = (this.model.isStatic === true)
    }
  }

  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    if (this.model.aggregation === type.UMLAttribute.AK_COMPOSITE) {
      canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    } else {
      canvas.rect(this.left, this.top, this.getRight(), this.getBottom(), [5])
    }
  }
}

/**
 * UMLConnectorView
 */
class UMLConnectorView extends UMLUndirectedRelationshipView {

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLModelElement)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      // nameLabel
      var text = ''
      if (this.model.name) {
        text += this.model.getString(this)
      }
      if (this.model.type && this.showType) {
        text += ': ' + this.model.type.name
      }
      this.nameLabel.text = text
      this.nameLabel.visible = (text.length > 0)
    }
  }
}

/**
 * UMLCollaborationView
 */
class UMLCollaborationView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.iconRatio = USECASE_RATIO_PERCENT

    /** @member {UMLTemplateParameterCompartmentView} */
    this.templateParameterCompartment = new UMLTemplateParameterCompartmentView()
    this.templateParameterCompartment.selectable = View.SK_PROPAGATE
    this.templateParameterCompartment.parentStyle = true
    this.addSubView(this.templateParameterCompartment)

    this.fillColor = app.preferences.get('uml.collaboration.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    // templateParameterCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.templateParameterCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.templateParameterCompartment, 'model', this.model)
    }
    if (this.model) {
      if (this.model.templateParameters && this.model.templateParameters.length > 0) {
        this.templateParameterCompartment.visible = true
      } else {
        this.templateParameterCompartment.visible = false
      }
    }
    super.update(canvas)
  }

  drawShadowAsCanonicalForm (canvas, showLabel) {
    canvas.fillEllipse(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET)
  }

  drawShadowAsDecorationForm (canvas) {
    canvas.fillRect(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET
    )
  }

  sizeObjectAsCanonicalForm (canvas) {
    super.sizeObjectAsCanonicalForm(canvas)
    // Calculating minimum size <= minimum Nampcompartment's circumscription size
    // rectangle's circumscription's height and width are Sqrt(2) times of rectangle's height and width
    var w = Math.max(_.floor(Math.sqrt(2) * this.nameCompartment.minWidth), COLLABORATION_MINWIDTH)
    var h = Math.max(_.floor(Math.sqrt(2) * this.nameCompartment.minHeight), COLLABORATION_MINHEIGHT)
    if (this.templateParameterCompartment.visible) {
      this.templateParameterCompartment.size(canvas)
      w = Math.max(w, this.templateParameterCompartment.minWidth)
      w = w + TEMPLATEPARAMETERCOMPARTMENT_LEFT_MARGIN + TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY
      h = h + this.templateParameterCompartment.minHeight - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP
    }
    this.minWidth = w
    this.minHeight = h
  }

  sizeAsIconicForm (canvas, showLabel) {
    if (this.hasStereotypeIcon()) {
      super.sizeAsIconicForm(canvas, showLabel)
    } else {
      var sz = this.getSizeOfAllCompartments(canvas)
      this.minWidth = Math.max(sz.x, USECASE_ICON_MINWIDTH)
      this.minHeight = USECASE_ICON_MINHEIGHT + sz.y
    }
  }

  arrangeObjectAsCanonicalForm (canvas) {
    super.arrangeObjectAsCanonicalForm(canvas)
    // Arranging view objects.
    if (this.templateParameterCompartment.visible) {
      this.templateParameterCompartment.left = this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY - this.templateParameterCompartment.minWidth
      this.templateParameterCompartment.top = this.top
      this.templateParameterCompartment.setRight(this.getRight())
      this.templateParameterCompartment.arrange(canvas)
      this.nameCompartment.left = this.left
      this.nameCompartment.top = ((this.getBottom() + this.top + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP) / 2) - (this.nameCompartment.height / 2)
      this.nameCompartment.setRight(this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY)
      this.nameCompartment.arrange(canvas)
      var x1 = this.left
      var y1 = this.top + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP
      var x2 = this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY
      var y2 = this.getBottom()
      this.mainRect.setRect(x1, y1, x2, y2)
    } else {
      this.nameCompartment.left = this.left
      this.nameCompartment.top = ((this.getBottom() + this.top) / 2) - (this.nameCompartment.height / 2)
      this.nameCompartment.setRight(this.getRight())
      this.nameCompartment.arrange(canvas)
    }
  }

  drawIcon (canvas, rect) {
    if (this.hasStereotypeIcon()) {
      var ratioRect = this.computeIconRect(rect, (this.model.stereotype.icon.width / this.model.stereotype.icon.height) * 100)
      drawStereotypeIcon(this, canvas, ratioRect, this.model.stereotype.icon)
    } else {
      var r = rect
      var x, y
      var w = r.x2 - r.x1
      var h = r.y2 - r.y1
      var rr = w * 100 / h
      var ir = USECASE_ICON_MINWIDTH * 100 / USECASE_ICON_MINHEIGHT
      if (rr >= ir) {
        h = (r.y2 - r.y1)
        w = h * ir / 100
        x = r.x1 + (r.x2 - r.x1 - w) / 2
        y = r.y1
      } else {
        w = (r.x2 - r.x1)
        h = w * 100 / ir
        y = r.y1 + (r.y2 - r.y1 - h) / 2
        x = r.x1
      }
      canvas.fillEllipse(x, y, x + w, y + h)
      canvas.ellipse(x, y, x + w, y + h, [5])
    }
  }

  drawCommon (canvas) {
    if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION || this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL) {
      canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
      canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
    }
  }

  drawAsCanonicalForm (canvas) {
    var r = new Rect()
    if (this.templateParameterCompartment.visible) {
      r.x1 = this.left
      r.y1 = this.top + this.templateParameterCompartment.height - TEMPLATEPARAMETERCOMPARTMENT_OVERLAP
      r.x2 = this.getRight() - TEMPLATEPARAMETERCOMPARTMENT_RIGHT_OCCUPY
      r.y2 = this.getBottom()
    } else {
      r.setRect(this.left, this.top, this.getRight(), this.getBottom())
    }
    canvas.fillEllipse(r.x1, r.y1, r.x2, r.y2)
    canvas.ellipse(r.x1, r.y1, r.x2, r.y2, [5])
  }
}

/**
 * UMLCollaborationUseView
 */
class UMLCollaborationUseView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.collaborationuse.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    super.update(canvas)
    if (this.model.type && this.model.type.name) {
      this.nameCompartment.nameLabel.text = this.model.name + ': ' + this.model.type.name
    }
  }

  drawShadowAsCanonicalForm (canvas) {
    canvas.fillEllipse(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    // Calculating minimum size <= minimum Nampcompartment's circumscription size
    // rectangle's circumscription's height and width are Sqrt(2) times of rectangle's height and width
    var w = Math.max(_.floor(Math.sqrt(2) * this.nameCompartment.minWidth), COLLABORATION_MINWIDTH)
    var h = Math.max(_.floor(Math.sqrt(2) * this.nameCompartment.minHeight), COLLABORATION_MINHEIGHT)
    this.minWidth = w
    this.minHeight = h
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameCompartment.left = this.left
    this.nameCompartment.top = ((this.getBottom() + this.top) / 2) - (this.nameCompartment.height / 2)
    this.nameCompartment.setRight(this.getRight())
    this.nameCompartment.arrange(canvas)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.fillEllipse(r.x1, r.y1, r.x2, r.y2)
    canvas.ellipse(r.x1, r.y1, r.x2, r.y2, [5])
  }
}

/**
 * UMLRoleBindingView
 */
class UMLRoleBindingView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_DOT

    /** @member {EdgeLabelView} */
    this.roleNameLabel = new EdgeLabelView()
    this.roleNameLabel.hostEdge = this
    this.roleNameLabel.edgePosition = EdgeParasiticView.EP_HEAD
    this.roleNameLabel.alpha = -Math.PI / 6
    this.roleNameLabel.distance = 30
    this.addSubView(this.roleNameLabel)
  }

  update (canvas) {
    if (this.model) {
      this.roleNameLabel.visible = (this.model.roleName && this.model.roleName.length > 0)
      if (this.model.roleName) {
        this.roleNameLabel.text = this.model.roleName
      }
      // roleNameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.roleNameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.roleNameLabel, 'model', this.model)
      }
    }
    super.update(canvas)
  }

  canConnectTo (view, isTail) {
    return (isTail && view.model instanceof type.UMLCollaborationUse) ||
      (!isTail && view.model instanceof type.UMLAttribute)
  }
}

/**************************************************************************
 *                                                                        *
 *                           OBJECT DIAGRAM VIEWS                         *
 *                                                                        *
 *************************************************************************/

/**
 * UMLObjectDiagram
 */
class UMLObjectDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLInstance) ||
      (model instanceof type.UMLSlot) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLLink)
  }
}

/**
 * UMLSlotView
 */
class UMLSlotView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    var options = {
      showVisibility: true,
      stereotypeDisplay: UMLGeneralNodeView.SD_LABEL,
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
      this.text = this.model.getString(options)
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
 * UMLSlotCompartmentView
 */
class UMLSlotCompartmentView extends UMLListCompartmentView {
  getItems () {
    return this.model.slots
  }

  createItem () {
    return new UMLSlotView()
  }
}

/**
 * UMLObjectView
 */
class UMLObjectView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = true

    /** @member {UMLSlotCompartmentView} */
    this.slotCompartment = new UMLSlotCompartmentView()
    this.slotCompartment.selectable = View.SK_PROPAGATE
    this.slotCompartment.parentStyle = true
    this.addSubView(this.slotCompartment)

    this.fillColor = app.preferences.get('uml.object.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    // slotCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.slotCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.slotCompartment, 'model', this.model)
    }
    super.update(canvas)
    if (this.model) {
      this.nameCompartment.nameLabel.text = this.model.getString(this)
      if (this.model.slots && this.model.slots.length > 0) {
        this.slotCompartment.visible = true
      } else {
        this.slotCompartment.visible = false
      }
      if (this.model.value !== null && this.model.value.length > 0) {
        this.nameCompartment.namespaceLabel.text = this.model.value
        this.nameCompartment.namespaceLabel.visible = true
      }
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    if (this.model.isMultiInstance) {
      canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN)
    }
    canvas.fillRect(r.x1, r.y1, r.x2, r.y2)
    canvas.rect(r.x1, r.y1, r.x2, r.y2)
    if (this.model.classifier && this.model.classifier.isActive) {
      canvas.line(this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.top, this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.getBottom())
      canvas.line(this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.top, this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.getBottom())
    }
    if (this.slotCompartment.visible) {
      canvas.line(
        this.slotCompartment.left,
        this.slotCompartment.top,
        this.slotCompartment.getRight(),
        this.slotCompartment.top)
    }
  }
}

/**
 * UMLLinkView
 */
class UMLLinkView extends UMLUndirectedRelationshipView {

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLInstance)
  }
}

/**
 * UMLLinkObjectLinkView
 */
class UMLLinkObjectLinkView extends EdgeView {

  constructor () {
    super()
    this.lineMode = EdgeView.LM_DOT
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLObject || view.model instanceof type.UMLLink)
  }
}

/**************************************************************************
 *                                                                        *
 *                         COMPONENT DIAGRAM VIEWS                        *
 *                                                                        *
 **************************************************************************/

/**
 * UMLComponentDiagram
 */
class UMLComponentDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLInstance) ||
      (model instanceof type.UMLPort) ||
      (model instanceof type.UMLTemplateParameter) ||
      (model instanceof type.UMLAttribute) ||
      (model instanceof type.UMLOperation) ||
      (model instanceof type.UMLReception) ||
      (model instanceof type.UMLEnumerationLiteral) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLInterfaceRealization) ||
      (model instanceof type.UMLComponentRealization) ||
      (model instanceof type.UMLAssociation) ||
      (model instanceof type.UMLLink) ||
      (model instanceof type.UMLConnector)
  }
}

/**
 * UMLArtifactViewMixin
 * @mixin
 */
var UMLArtifactViewMixin = {

  sizeAsIconicForm: function (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(sz.x, ARTIFACT_ICON_MINWIDTH)
    this.minHeight = ARTIFACT_ICON_MINHEIGHT + sz.y
  },

  drawShadowAsIconicForm: function (canvas) {
    var w = this.iconRect.x2 - this.iconRect.x1
    // var h = this.iconRect.y2 - this.iconRect.y1
    var x = this.iconRect.x2 - w * 30 / 100
    var y = this.iconRect.y1 + w * 30 / 100
    canvas.fillPolygon([
      new Point(this.iconRect.x1 + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
      new Point(x + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
      new Point(this.iconRect.x2 + SHADOW_OFFSET, y + SHADOW_OFFSET),
      new Point(this.iconRect.x2 + SHADOW_OFFSET, this.iconRect.y2 + SHADOW_OFFSET),
      new Point(this.iconRect.x1 + SHADOW_OFFSET, this.iconRect.y2 + SHADOW_OFFSET)])
  },

  drawIcon: function (canvas, rect) {
    var w = rect.x2 - rect.x1
    // var h = rect.y2 - rect.y1
    var x = rect.x2 - w * 30 / 100
    var y = rect.y1 + w * 30 / 100
    canvas.fillPolygon([new Point(rect.x1, rect.y1), new Point(x, rect.y1), new Point(rect.x2, y), new Point(rect.x2, rect.y2), new Point(rect.x1, rect.y2)])
    canvas.polygon([new Point(rect.x1, rect.y1), new Point(x, rect.y1), new Point(rect.x2, y), new Point(rect.x2, rect.y2), new Point(rect.x1, rect.y2)])
    canvas.polygon([new Point(x, rect.y1), new Point(x, y), new Point(rect.x2, y)])
  }
}

/**
 * UMLArtifactView
 */
class UMLArtifactView extends UMLClassifierView {

  constructor () {
    super()
    this.iconRatio = ARTIFACT_RATIO_PERCENT
    // mixin UMLArtifactViewMixin
    _.extend(UMLArtifactView.prototype, UMLArtifactViewMixin)

    this.fillColor = app.preferences.get('uml.artifact.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.artifact.stereotypeDisplay', UMLGeneralNodeView.SD_ICON)
    this.suppressAttributes = app.preferences.get('uml.artifact.suppressAttributes', true)
    this.suppressOperations = app.preferences.get('uml.artifact.suppressOperations', true)
  }

  getStereotypeLabelText () {
    return '«artifact»'
  }
}

/**
 * UMLArtifactInstanceView
 */
class UMLArtifactInstanceView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.iconRatio = ARTIFACT_RATIO_PERCENT
    this.containerChangeable = true
    // mixin UMLArtifactViewMixin
    _.extend(UMLArtifactInstanceView.prototype, UMLArtifactViewMixin)

    this.fillColor = app.preferences.get('uml.artifactinstance.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.artifact.stereotypeDisplay', UMLGeneralNodeView.SD_ICON)
  }

  getStereotypeLabelText () {
    return '«artifact»'
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameCompartment.nameLabel.text = this.model.getString(this)
    }
  }
}

/**
 * UMLComponentViewMixin
 * @mixin
 */
var UMLComponentViewMixin = {

  sizeAsCanonicalForm: function (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(sz.x + COMPONENT_STATIC_MARGIN, COMPONENT_MINWIDTH)
    this.minHeight = Math.max(sz.y, COMPONENT_MINHEIGHT)
  },

  sizeAsIconicForm: function (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(sz.x, COMPONENT_ICON_MINWIDTH)
    this.minHeight = COMPONENT_ICON_MINHEIGHT + sz.y
  },

  arrangeCommon: function (canvas) {
    UMLGeneralNodeView.prototype.arrangeCommon.call(this, canvas)
    if (this.stereotypeDisplay === UMLGeneralNodeView.SD_NONE || this.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL) {
      this.mainRect.setRect(this.left + COMPONENT_STATIC_MARGIN, this.top, this.getRight(), this.getBottom())
    }
  },

  drawShadowAsCanonicalForm: function (canvas) {
    canvas.fillRect(
      this.left + COMPONENT_RECT_INDENT + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET)
  },

  drawCommon: function (canvas) {
    if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION) {
      canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
      canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
    }
  },

  drawIcon: function (canvas, rect) {
    canvas.fillRect(rect.x1 + COMPONENT_RECT_INDENT, rect.y1, rect.x2, rect.y2)
    canvas.rect(rect.x1 + COMPONENT_RECT_INDENT, rect.y1, rect.x2, rect.y2)
    canvas.fillRect(rect.x1, rect.y1 + 6, rect.x1 + 20, rect.y1 + 16)
    canvas.rect(rect.x1, rect.y1 + 6, rect.x1 + 20, rect.y1 + 16)
    canvas.fillRect(rect.x1, rect.y1 + 23, rect.x1 + 20, rect.y1 + 33)
    canvas.rect(rect.x1, rect.y1 + 23, rect.x1 + 20, rect.y1 + 33)
  },

  drawDecorationIcon: function (canvas, rect) {
    canvas.fillRect(rect.x1 + 9, rect.y1 + 5, rect.x1 + 22, rect.y1 + 21)
    canvas.rect(rect.x1 + 9, rect.y1 + 5, rect.x1 + 22, rect.y1 + 21)
    canvas.fillRect(rect.x1 + 6, rect.y1 + 8, rect.x1 + 13, rect.y1 + 12)
    canvas.rect(rect.x1 + 6, rect.y1 + 8, rect.x1 + 13, rect.y1 + 12)
    canvas.fillRect(rect.x1 + 6, rect.y1 + 14, rect.x1 + 13, rect.y1 + 18)
    canvas.rect(rect.x1 + 6, rect.y1 + 14, rect.x1 + 13, rect.y1 + 18)
  },

  drawAsCanonicalForm: function (canvas, showLabel) {
    UMLGeneralNodeView.prototype.drawAsCanonicalForm.call(this, canvas, showLabel)
    canvas.fillRect(this.left + COMPONENT_RECT_INDENT, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left + COMPONENT_RECT_INDENT, this.top, this.getRight(), this.getBottom())
    canvas.fillRect(this.left, this.top + 7, this.left + 20, this.top + 17)
    canvas.rect(this.left, this.top + 7, this.left + 20, this.top + 17)
    canvas.fillRect(this.left, this.top + 27, this.left + 20, this.top + 37)
    canvas.rect(this.left, this.top + 27, this.left + 20, this.top + 37)
  },

  drawAsDecorationForm: function (canvas, showLabel) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    UMLGeneralNodeView.prototype.drawAsDecorationForm.call(this, canvas, showLabel)
  }
}

/**
 * UMLComponentView
 */
class UMLComponentView extends UMLClassifierView {

  constructor () {
    super()

    // mixin UMLComponentViewMixin
    _.extend(UMLComponentView.prototype, UMLComponentViewMixin)

    this.fillColor = app.preferences.get('uml.component.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.component.stereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
    this.suppressAttributes = app.preferences.get('uml.component.suppressAttributes', true)
    this.suppressOperations = app.preferences.get('uml.component.suppressOperations', true)
  }
}

/**
 * UMLComponentInstanceView
 * @extends UMLGeneralNodeView
 */
class UMLComponentInstanceView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = true
    // mixin UMLComponentViewMixin
    _.extend(UMLComponentInstanceView.prototype, UMLComponentViewMixin)

    this.fillColor = app.preferences.get('uml.componentinstance.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.component.stereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameCompartment.nameLabel.text = this.model.getString(this)
    }
  }
}

/**
 * UMLComponentRealizationView
 */
class UMLComponentRealizationView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_TRIANGLE
    this.lineMode = EdgeView.LM_DOT
  }

  canConnectTo (view, isTail) {
    return (isTail && view.model instanceof type.UMLClassifier) ||
      (!isTail && view.model instanceof type.UMLComponent)
  }
}

/**************************************************************************
 *                                                                        *
 *                        DEPLOYMENT DIAGRAM VIEWS                        *
 *                                                                        *
 **************************************************************************/

/**
 * UMLDeploymentDiagram
 */
class UMLDeploymentDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLInstance) ||
      (model instanceof type.UMLPort) ||
      (model instanceof type.UMLTemplateParameter) ||
      (model instanceof type.UMLAttribute) ||
      (model instanceof type.UMLOperation) ||
      (model instanceof type.UMLReception) ||
      (model instanceof type.UMLEnumerationLiteral) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLInterfaceRealization) ||
      (model instanceof type.UMLComponentRealization) ||
      (model instanceof type.UMLAssociation) ||
      (model instanceof type.UMLLink) ||
      (model instanceof type.UMLConnector)
  }
}

/**
 * UMLNodeViewMixin
 * @mixin
 */
var UMLNodeViewMixin = {

  sizeAsCanonicalForm: function (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(sz.x + NODE_STATIC_MARGIN, NODE_MINWIDTH)
    this.minHeight = Math.max(sz.y + NODE_STATIC_MARGIN, NODE_MINHEIGHT)
  },

  sizeAsIconicForm: function (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(sz.x, NODE_MINWIDTH)
    this.minHeight = NODE_MINHEIGHT + sz.y
  },

  arrangeCommon: function (canvas) {
    UMLGeneralNodeView.prototype.arrangeCommon.call(this, canvas)
    if (this.stereotypeDisplay === UMLGeneralNodeView.SD_NONE || this.stereotypeDisplay === UMLGeneralNodeView.SD_LABEL) {
      this.mainRect.setRect(this.left, this.top + NODE_STATIC_MARGIN, this.getRight() - NODE_STATIC_MARGIN, this.getBottom())
    }
  },

  drawShadowAsCanonicalForm: function (canvas) {
    var r = this.getRight() - 1
    var b = this.getBottom() - 1
    canvas.fillPolygon([
      new Point(this.left + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, b + SHADOW_OFFSET),
      new Point(this.left + SHADOW_OFFSET, b + SHADOW_OFFSET)])
    canvas.fillPolygon([
      new Point(this.left + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET),
      new Point(this.left + NODE_STATIC_MARGIN + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
      new Point(r + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET)])
    canvas.fillPolygon([
      new Point(r + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.top + NODE_STATIC_MARGIN + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, b + SHADOW_OFFSET),
      new Point(r + SHADOW_OFFSET, b - NODE_STATIC_MARGIN + SHADOW_OFFSET)])
  },

  drawShadowAsIconicForm: function (canvas) {
    var r = this.iconRect.x2 - 1
    var b = this.iconRect.y2 - 1
    canvas.fillPolygon([
      new Point(this.iconRect.x1 + SHADOW_OFFSET, this.iconRect.y1 + NODE_STATIC_MARGIN + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.iconRect.y1 + NODE_STATIC_MARGIN + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, b + SHADOW_OFFSET),
      new Point(this.iconRect.x1 + SHADOW_OFFSET, b + SHADOW_OFFSET)])
    canvas.fillPolygon([
      new Point(this.iconRect.x1 + SHADOW_OFFSET, this.iconRect.y1 + NODE_STATIC_MARGIN + SHADOW_OFFSET),
      new Point(this.iconRect.x1 + NODE_STATIC_MARGIN + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
      new Point(r + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.iconRect.y1 + NODE_STATIC_MARGIN + SHADOW_OFFSET)])
    canvas.fillPolygon([
      new Point(r + SHADOW_OFFSET, this.iconRect.y1 + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, this.iconRect.y1 + NODE_STATIC_MARGIN + SHADOW_OFFSET),
      new Point(r - NODE_STATIC_MARGIN + SHADOW_OFFSET, b + SHADOW_OFFSET),
      new Point(r + SHADOW_OFFSET, b - NODE_STATIC_MARGIN + SHADOW_OFFSET)])
  },

  drawCommon: function (canvas) {
    if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION) {
      canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
      canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
    }
  },

  drawIcon: function (canvas, rect) {
    var r = rect.x2 - 1
    var b = rect.y2 - 1
    canvas.fillPolygon([new Point(rect.x1, rect.y1 + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, rect.y1 + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, b), new Point(rect.x1, b)])
    canvas.fillPolygon([new Point(rect.x1, rect.y1 + NODE_STATIC_MARGIN), new Point(rect.x1 + NODE_STATIC_MARGIN, rect.y1), new Point(r, rect.y1), new Point(r - NODE_STATIC_MARGIN, rect.y1 + NODE_STATIC_MARGIN)])
    canvas.fillPolygon([new Point(r, rect.y1), new Point(r - NODE_STATIC_MARGIN, rect.y1 + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, b), new Point(r, b - NODE_STATIC_MARGIN)])
    canvas.polygon([new Point(rect.x1, rect.y1 + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, rect.y1 + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, b), new Point(rect.x1, b)])
    canvas.polygon([new Point(rect.x1, rect.y1 + NODE_STATIC_MARGIN), new Point(rect.x1 + NODE_STATIC_MARGIN, rect.y1), new Point(r, rect.y1), new Point(r - NODE_STATIC_MARGIN, rect.y1 + NODE_STATIC_MARGIN)])
    canvas.polygon([new Point(r, rect.y1), new Point(r - NODE_STATIC_MARGIN, rect.y1 + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, b), new Point(r, b - NODE_STATIC_MARGIN)])
  },

  drawDecorationIcon: function (canvas, rect) {
    canvas.rect(rect.x1 + 3, rect.y1 + 10, rect.x1 + 19, rect.y1 + 20)
    canvas.polygon([new Point(rect.x1 + 3, rect.y1 + 10), new Point(rect.x1 + 8, rect.y1 + 5), new Point(rect.x1 + 24, rect.y1 + 5), new Point(rect.x1 + 19, rect.y1 + 10)])
    canvas.polygon([new Point(rect.x1 + 19, rect.y1 + 10), new Point(rect.x1 + 24, rect.y1 + 5), new Point(rect.x1 + 24, rect.y1 + 15), new Point(rect.x1 + 19, rect.y1 + 20)])
  },

  drawAsCanonicalForm: function (canvas) {
    UMLGeneralNodeView.prototype.drawAsCanonicalForm.call(this, canvas)
    var r = this.getRight() - 1
    var b = this.getBottom() - 1
    canvas.fillPolygon([new Point(this.left, this.top + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, this.top + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, b), new Point(this.left, b)])
    canvas.fillPolygon([new Point(this.left, this.top + NODE_STATIC_MARGIN), new Point(this.left + NODE_STATIC_MARGIN, this.top), new Point(r, this.top), new Point(r - NODE_STATIC_MARGIN, this.top + NODE_STATIC_MARGIN)])
    canvas.fillPolygon([new Point(r, this.top), new Point(r - NODE_STATIC_MARGIN, this.top + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, b), new Point(r, b - NODE_STATIC_MARGIN)])
    canvas.polygon([new Point(this.left, this.top + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, this.top + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, b), new Point(this.left, b)])
    canvas.polygon([new Point(this.left, this.top + NODE_STATIC_MARGIN), new Point(this.left + NODE_STATIC_MARGIN, this.top), new Point(r, this.top), new Point(r - NODE_STATIC_MARGIN, this.top + NODE_STATIC_MARGIN)])
    canvas.polygon([new Point(r, this.top), new Point(r - NODE_STATIC_MARGIN, this.top + NODE_STATIC_MARGIN), new Point(r - NODE_STATIC_MARGIN, b), new Point(r, b - NODE_STATIC_MARGIN)])
  },

  drawAsDecorationForm: function (canvas, showLabel) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    UMLGeneralNodeView.prototype.drawAsDecorationForm.call(this, canvas, showLabel)
  }
}

/**
 * UMLNodeView
 */
class UMLNodeView extends UMLClassifierView {

  constructor () {
    super()

    this.iconRatio = NODE_RATIO_PERCENT
    // mixin UMLNodeViewMixin
    _.extend(UMLNodeView.prototype, UMLNodeViewMixin)

    this.fillColor = app.preferences.get('uml.node.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.node.stereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
    this.suppressAttributes = app.preferences.get('uml.node.suppressAttributes', true)
    this.suppressOperations = app.preferences.get('uml.node.suppressOperations', true)
  }
}

/**
 * UMLNodeInstanceView
 */
class UMLNodeInstanceView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.iconRatio = NODE_RATIO_PERCENT
    this.containerChangeable = true
    // mixin UMLNodeViewMixin
    _.extend(UMLNodeInstanceView.prototype, UMLNodeViewMixin)

    this.fillColor = app.preferences.get('uml.nodeinstance.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.node.stereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameCompartment.nameLabel.text = this.model.getString(this)
    }
  }
}

/**
 * UMLDeploymentView
 */
class UMLDeploymentView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_DOT
  }

  update (canvas) {
    super.update(canvas)
    this.stereotypeLabel.visible = true
    this.stereotypeLabel.text = '«deploy»'
  }

  canConnectTo (view, isTail) {
    return (isTail && view.model instanceof type.UMLClassifier) ||
      (!isTail && view.model instanceof type.UMLNode)
  }
}

/**
 * UMLCommunicationPathView
 */
class UMLCommunicationPathView extends UMLAssociationView {

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLNode)
  }
}

/**************************************************************************
 *                                                                        *
 *                         USE-CASE DIAGRAM VIEWS                         *
 *                                                                        *
 **************************************************************************/

/**
 * UMLUseCaseDiagram
 */
class UMLUseCaseDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLUseCaseSubject) ||
      (model instanceof type.UMLInstance) ||
      (model instanceof type.UMLExtensionPoint) ||
      (model instanceof type.UMLTemplateParameter) ||
      (model instanceof type.UMLAttribute) ||
      (model instanceof type.UMLOperation) ||
      (model instanceof type.UMLReception) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLInterfaceRealization) ||
      (model instanceof type.UMLComponentRealization) ||
      (model instanceof type.UMLAssociation) ||
      (model instanceof type.UMLLink) ||
      (model instanceof type.UMLConnector)
  }

  layout (direction, separations) {
    if (!direction) {
      direction = Diagram.LD_RL
    }
    super.layout(direction, separations)
  }
}

/**
 * UMLExtensionPointView
 */
class UMLExtensionPointView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    var options = {
      stereotypeDisplay: UMLGeneralNodeView.SD_LABEL,
      showProperty: true
    }
    if (this._parent && this._parent._parent) {
      options.stereotypeDisplay = this._parent._parent.stereotypeDisplay
      options.showProperty = this._parent._parent.showProperty
    }
    if (this.model) {
      this.text = this.model.getString(options)
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
 * UMLExtensionPointCompartmentView
 */
class UMLExtensionPointCompartmentView extends UMLListCompartmentView {
  getItems () {
    return this.model.extensionPoints
  }

  createItem () {
    return new UMLExtensionPointView()
  }
}

/**
 * UMLUseCaseView
 */
class UMLUseCaseView extends UMLClassifierView {

  constructor () {
    super()
    this.iconRatio = USECASE_RATIO_PERCENT

    /** @member {UMLExtensionPointCompartmentView} */
    this.extensionPointCompartment = new UMLExtensionPointCompartmentView()
    this.extensionPointCompartment.parentStyle = true
    this.addSubView(this.extensionPointCompartment)

    this.fillColor = app.preferences.get('uml.usecase.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.usecase.stereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
    this.suppressAttributes = app.preferences.get('uml.usecase.suppressAttributes', true)
    this.suppressOperations = app.preferences.get('uml.usecase.suppressOperations', true)
  }

  getAllCompartments () {
    return [
      this.nameCompartment,
      this.attributeCompartment,
      this.operationCompartment,
      this.extensionPointCompartment
    ]
  }

  update (canvas) {
    // extensionPointCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.extensionPointCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.extensionPointCompartment, 'model', this.model)
    }
    if (this.model) {
      if (this.model.extensionPoints && this.model.extensionPoints.length > 0) {
        this.extensionPointCompartment.visible = true
      } else {
        this.extensionPointCompartment.visible = false
      }
    }
    super.update(canvas)
  }

  sizeAsCanonicalForm (canvas, showLabel) {
    super.sizeAsCanonicalForm(canvas, showLabel)
    // Calculating minimum size <= minimum Namecompartment circumscription size
    // rectangle's circumscription ellipse height and width are rectangle's height and width * Sqrt(2)
    var w = Math.max(_.floor(Math.sqrt(2) * this.nameCompartment.minWidth), USECASE_ICON_MINWIDTH)
    if (this.attributeCompartment.visible) {
      w = Math.max(w, this.attributeCompartment.minWidth)
    }
    if (this.operationCompartment.visible) {
      w = Math.max(w, this.operationCompartment.minWidth)
    }
    if (this.extensionPointCompartment.visible) {
      w = Math.max(w, this.extensionPointCompartment.minWidth)
    }
    this.minWidth = w
    var h = Math.max(_.floor(Math.sqrt(2) * this.nameCompartment.minHeight), USECASE_ICON_MINHEIGHT)
    if (this.attributeCompartment.visible) {
      h = h + this.attributeCompartment.minHeight
    }
    if (this.operationCompartment.visible) {
      h = h + this.operationCompartment.minHeight
    }
    if (this.extensionPointCompartment.visible) {
      h = h + this.extensionPointCompartment.minHeight
    }
    this.minHeight = h
  }

  sizeAsIconicForm (canvas, showLabel) {
    if (this.hasStereotypeIcon()) {
      super.sizeAsIconicForm(canvas, showLabel)
    } else {
      var sz = this.getSizeOfAllCompartments(canvas)
      this.minWidth = Math.max(sz.x, USECASE_ICON_MINWIDTH)
      this.minHeight = USECASE_ICON_MINHEIGHT + sz.y
    }
  }

  arrangeAsCanonicalForm (canvas, showLabel) {
    super.arrangeAsCanonicalForm(canvas, showLabel)
    var y = this.getBottom()
    if (this.extensionPointCompartment.visible) {
      y = y - this.extensionPointCompartment.height
      this.extensionPointCompartment.left = this.left
      this.extensionPointCompartment.setRight(this.getRight())
      this.extensionPointCompartment.top = y
      this.extensionPointCompartment.arrange(canvas)
    }
    if (this.operationCompartment.visible) {
      y = y - this.operationCompartment.height
      this.operationCompartment.left = this.left
      this.operationCompartment.setRight(this.getRight())
      this.operationCompartment.top = y
      this.operationCompartment.arrange(canvas)
    }
    if (this.attributeCompartment.visible) {
      y = y - this.attributeCompartment.height
      this.attributeCompartment.left = this.left
      this.attributeCompartment.setRight(this.getRight())
      this.attributeCompartment.top = y
      this.attributeCompartment.arrange(canvas)
    }
    this.nameCompartment.width = _.floor(1 / Math.sqrt(2) * this.width)
    this.nameCompartment.left = this.left + (this.width - this.nameCompartment.width) / 2
    this.nameCompartment.top = ((y + this.top) / 2) - (this.nameCompartment.height / 2)
    this.nameCompartment.arrange(canvas)
  }

  drawShadowAsCanonicalForm (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var EXTENSIONPOINTS_MARGIN_TOP = 5
    if (this.extensionPointCompartment.visible) {
      r.y2 = r.y2 - this.extensionPointCompartment.height - EXTENSIONPOINTS_MARGIN_TOP
    }
    if (this.operationCompartment.visible) {
      r.y2 = r.y2 - this.operationCompartment.height
    }
    if (this.attributeCompartment.visible) {
      r.y2 = r.y2 - this.attributeCompartment.height
    }
    canvas.fillEllipse(
      r.x1 + SHADOW_OFFSET,
      r.y1 + SHADOW_OFFSET,
      r.x2 + SHADOW_OFFSET,
      r.y2 + SHADOW_OFFSET)
  }

  drawShadowAsDecorationForm (canvas) {
    canvas.fillRect(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET
    )
  }

  drawShadowAsIconicForm (canvas) {
    if (this.hasStereotypeIcon()) {
      super.drawShadowAsIconicForm(canvas)
    } else {
      canvas.fillEllipse(
        this.iconRect.x1 + SHADOW_OFFSET,
        this.iconRect.y1 + SHADOW_OFFSET,
        this.iconRect.x2 + SHADOW_OFFSET,
        this.iconRect.y2 + SHADOW_OFFSET
      )
    }
  }

  drawIcon (canvas, rect) {
    if (this.hasStereotypeIcon()) {
      var ratioRect = this.computeIconRect(rect, (this.model.stereotype.icon.width / this.model.stereotype.icon.height) * 100)
      drawStereotypeIcon(this, canvas, ratioRect, this.model.stereotype.icon)
    } else {
      var r = rect
      var x, y
      var w = r.x2 - r.x1
      var h = r.y2 - r.y1
      var rr = w * 100 / h
      var ir = USECASE_ICON_MINWIDTH * 100 / USECASE_ICON_MINHEIGHT
      if (rr >= ir) {
        h = (r.y2 - r.y1)
        w = h * ir / 100
        x = r.x1 + (r.x2 - r.x1 - w) / 2
        y = r.y1
      } else {
        w = (r.x2 - r.x1)
        h = w * 100 / ir
        y = r.y1 + (r.y2 - r.y1 - h) / 2
        x = r.x1
      }
      canvas.fillEllipse(x, y, x + w, y + h)
      canvas.ellipse(x, y, x + w, y + h)
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.extensionPointCompartment.visible) {
      canvas.line(
        this.extensionPointCompartment.left,
        this.extensionPointCompartment.top,
        this.extensionPointCompartment.getRight(),
        this.extensionPointCompartment.top)
    }
  }

  drawCommon (canvas) {
    if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION || this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL) {
      canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
      canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
    }
  }

  drawAsCanonicalForm (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    var EXTENSIONPOINTS_MARGIN_TOP = 5
    if (this.extensionPointCompartment.visible) {
      r.y2 = r.y2 - this.extensionPointCompartment.height - EXTENSIONPOINTS_MARGIN_TOP
    }
    if (this.operationCompartment.visible) {
      r.y2 = r.y2 - this.operationCompartment.height
    }
    if (this.attributeCompartment.visible) {
      r.y2 = r.y2 - this.attributeCompartment.height
    }
    canvas.fillEllipse(r.x1, r.y1, r.x2, r.y2)
    canvas.ellipse(r.x1, r.y1, r.x2, r.y2)
  }
}

/**
 * UMLActorView
 */
class UMLActorView extends UMLClassifierView {

  constructor () {
    super()
    this.iconRatio = ACTOR_RATIO_PERCENT

    this.fillColor = app.preferences.get('uml.actor.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.stereotypeDisplay = app.preferences.get('uml.actor.stereotypeDisplay', UMLGeneralNodeView.SD_LABEL)
    this.suppressAttributes = app.preferences.get('uml.actor.suppressAttributes', true)
    this.suppressOperations = app.preferences.get('uml.actor.suppressOperations', true)
  }

  sizeAsCanonicalForm (canvas, showLabel) {
    this.sizeAsIconicForm(canvas, showLabel)
  }

  sizeAsIconicForm (canvas, showLabel) {
    if (this.hasStereotypeIcon()) {
      super.sizeAsIconicForm(canvas, showLabel)
    } else {
      var sz = this.getSizeOfAllCompartments(canvas)
      this.minWidth = Math.max(sz.x, ACTOR_ICON_MINWIDTH)
      this.minHeight = ACTOR_ICON_MINHEIGHT + sz.y
    }
  }

  arrangeAsCanonicalForm (canvas, showLabel) {
    this.arrangeAsIconicForm(canvas, showLabel)
  }

  drawShadowAsCanonicalForm (canvas) {}

  drawShadowAsDecorationForm (canvas) {
    canvas.fillRect(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET
    )
  }

  drawShadowAsIconicForm (canvas) {}

  drawIcon (canvas, rect) {
    if (this.hasStereotypeIcon()) {
      var ratioRect = this.computeIconRect(rect, (this.model.stereotype.icon.width / this.model.stereotype.icon.height) * 100)
      drawStereotypeIcon(this, canvas, ratioRect, this.model.stereotype.icon)
    } else {
      var cx, h, w, xa, xh, ya, yh, yl
      w = rect.x2 - rect.x1
      h = rect.y2 - rect.y1
      xh = w * 16 / 100
      xa = w * 14 / 100
      yh = rect.y1 + h * 34 / 100
      ya = rect.y1 + h * 46 / 100
      yl = rect.y1 + h * 66 / 100
      cx = rect.x1 + w / 2
      canvas.fillEllipse(rect.x1 + xh, rect.y1 + 1, rect.x2 - xh, yh)
      canvas.ellipse(rect.x1 + xh, rect.y1 + 1, rect.x2 - xh, yh)
      canvas.polyline([new Point(cx, yh), new Point(cx, yl)])
      canvas.polyline([new Point(rect.x1 + xa, ya), new Point(rect.x2 - xa, ya)])
      canvas.polyline([new Point(cx, yl), new Point(rect.x1, rect.y2 - 1)])
      canvas.polyline([new Point(cx, yl), new Point(rect.x2, rect.y2 - 1)])
    }
  }

  drawCommon (canvas) {
    if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION || this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL) {
      canvas.fillRect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
      canvas.rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2)
    }
  }

  drawAsCanonicalForm (canvas) {
    this.drawAsIconicForm(canvas)
  }
}

/**
 * UMLIncludeView
 */
class UMLIncludeView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_DOT
  }

  update (canvas) {
    super.update(canvas)
    this.stereotypeLabel.visible = true
    this.stereotypeLabel.text = '«include»'
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLUseCase)
  }
}

/**
 * UMLExtendView
 */
class UMLExtendView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_DOT
  }

  update (canvas) {
    super.update(canvas)
    this.stereotypeLabel.visible = true
    this.stereotypeLabel.text = '«extend»'
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLUseCase)
  }
}

/**
 * UMLUseCaseSubjectView
 */
class UMLUseCaseSubjectView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.zIndex = -1
    this.selectZIndex = -1
  }

  update (canvas) {
    super.update(canvas)
    if (this.model.represent && this.model.represent.name) {
      this.nameCompartment.nameLabel.text = this.model.represent.name
    }
  }

  drawShadowAsCanonicalForm (canvas) {
    canvas.fillRect(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
  }

  drawObject (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.fillRect(r.x1, r.y1, r.x2, r.y2)
    canvas.rect(r.x1, r.y1, r.x2, r.y2)
  }
}

/**************************************************************************
 *                                                                        *
 *                        STATECHART DIAGRAM VIEWS                        *
 *                                                                        *
 **************************************************************************/

/**
 * UMLStatechartDiagram
 */
class UMLStatechartDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLState) ||
      (model instanceof type.UMLPseudostate) ||
      (model instanceof type.UMLConnectionPointReference) ||
      (model instanceof type.UMLStateMachine)
  }

  layout (direction, separations) {
    if (!direction) {
      direction = Diagram.LD_RL
    }
    super.layout(direction, separations)
  }
}

/**
 * UMLPseudostateView
 */
class UMLPseudostateView extends UMLFloatingNodeView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_FREE
    this.containerChangeable = true
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    switch (this.model.kind) {
    case UMLPseudostate.PSK_INITIAL:
      this.minWidth = INITIALSTATE_MINWIDTHH
      this.minHeight = INITIALSTATE_MINHEIGHT
      break
    case UMLPseudostate.PSK_DEEPHISTORY:
      this.minWidth = HISTORYSTATE_MINWIDTHH
      this.minHeight = HISTORYSTATE_MINHEIGHT
      break
    case UMLPseudostate.PSK_SHALLOWHISTORY:
      this.minWidth = HISTORYSTATE_MINWIDTHH
      this.minHeight = HISTORYSTATE_MINHEIGHT
      break
    case UMLPseudostate.PSK_JOIN:
      if (this.height > this.width) {
        // Vertical Synchronization
        this.minWidth = JOIN_MINTHICK
        this.minHeight = JOIN_MINLENGTH
        this.width = this.minWidth
      } else {
        // Horizontal Synchronization
        this.minWidth = JOIN_MINLENGTH
        this.minHeight = JOIN_MINTHICK
        this.height = this.minHeight
      }
      break
    case UMLPseudostate.PSK_FORK:
      if (this.height > this.width) {
        // Vertical Synchronization
        this.minWidth = FORK_MINTHICK
        this.minHeight = FORK_MINLENGTH
        this.width = this.minWidth
      } else {
        // Horizontal Synchronization
        this.minWidth = FORK_MINLENGTH
        this.minHeight = FORK_MINTHICK
        this.height = this.minHeight
      }
      break
    case UMLPseudostate.PSK_JUNCTION:
      this.minWidth = JUNCTION_MINWIDTH
      this.minHeight = JUNCTION_MINHEIGHT
      break
    case UMLPseudostate.PSK_CHOICE:
      this.minWidth = CHOICE_MINWIDTH
      this.minHeight = CHOICE_MINHEIGHT
      break
    case UMLPseudostate.PSK_ENTRYPOINT:
      this.minWidth = ENTRYPOINT_MINWIDTH
      this.minHeight = ENTRYPOINT_MINHEIGHT
      break
    case UMLPseudostate.PSK_EXITPOINT:
      this.minWidth = EXITPOINT_MINWIDTH
      this.minHeight = EXITPOINT_MINHEIGHT
      break
    case UMLPseudostate.PSK_TERMINATE:
      this.minWidth = TERMINATE_MINWIDTH
      this.minHeight = TERMINATE_MINHEIGHT
      break
    }
    this.sizeConstraints()
  }

  arrange (canvas) {
    super.arrange(canvas)
    this.stereotypeLabel.visible = false
    this.nameLabel.visible = false
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    switch (this.model.kind) {
    case UMLPseudostate.PSK_INITIAL:
    case UMLPseudostate.PSK_DEEPHISTORY:
    case UMLPseudostate.PSK_SHALLOWHISTORY:
    case UMLPseudostate.PSK_JUNCTION:
    case UMLPseudostate.PSK_ENTRYPOINT:
    case UMLPseudostate.PSK_EXITPOINT:
      canvas.fillEllipse(
        this.left + SHADOW_OFFSET,
        this.top + SHADOW_OFFSET,
        this.getRight() + SHADOW_OFFSET,
        this.getBottom() + SHADOW_OFFSET
      )
      break
    case UMLPseudostate.PSK_JOIN:
    case UMLPseudostate.PSK_FORK:
      canvas.fillRoundRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET, 3)
      break
    case UMLPseudostate.PSK_CHOICE:
      var x = this.left + (this.width / 2)
      var y = this.top + (this.height / 2)
      canvas.fillPolygon([
        new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET),
        new Point(x + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
        new Point(this.getRight() + SHADOW_OFFSET, y + SHADOW_OFFSET),
        new Point(x + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
        new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET)])
      break
    case UMLPseudostate.PSK_TERMINATE:
      // No shadow
      break
    }
    canvas.restoreState()
    super.drawShadow(canvas)
  }

  drawObject (canvas) {
    var x, y, sz, p, d
    switch (this.model.kind) {
    case UMLPseudostate.PSK_INITIAL:
      canvas.fillColor = this.lineColor
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      break
    case UMLPseudostate.PSK_DEEPHISTORY:
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
      sz = canvas.textExtent('H*')
      x = this.left + (this.width - sz.x) / 2
      y = this.top + (this.height - sz.y) / 2
      canvas.textOut(x, y, 'H*')
      break
    case UMLPseudostate.PSK_SHALLOWHISTORY:
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
      sz = canvas.textExtent('H')
      x = this.left + (this.width - sz.x) / 2
      y = this.top + (this.height - sz.y) / 2
      canvas.textOut(x, y, 'H')
      break
    case UMLPseudostate.PSK_JOIN:
      canvas.fillColor = this.lineColor
      if (Math.abs(this.getRight() - this.left) >= Math.abs(this.getBottom() - this.top)) {
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.top + JOIN_MINTHICK, 3)
      } else {
        canvas.fillRoundRect(this.left, this.top, this.left + JOIN_MINTHICK, this.getBottom(), 3)
      }
      break
    case UMLPseudostate.PSK_FORK:
      canvas.fillColor = this.lineColor
      if (Math.abs(this.getRight() - this.left) >= Math.abs(this.getBottom() - this.top)) {
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.top + FORK_MINTHICK, 3)
      } else {
        canvas.fillRoundRect(this.left, this.top, this.left + FORK_MINTHICK, this.getBottom(), 3)
      }
      break
    case UMLPseudostate.PSK_JUNCTION:
      canvas.fillColor = this.lineColor
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
      break
    case UMLPseudostate.PSK_CHOICE:
      x = (this.left + this.getRight()) / 2
      y = (this.top + this.getBottom()) / 2
      canvas.fillPolygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)])
      canvas.polygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)])
      break
    case UMLPseudostate.PSK_ENTRYPOINT:
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
      break
    case UMLPseudostate.PSK_EXITPOINT:
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
      p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
      d = Math.round(Math.sqrt(2) * this.width / 4)
      canvas.line(p.x - d, p.y - d, p.x + d, p.y + d)
      canvas.line(p.x + d, p.y - d, p.x - d, p.y + d)
      break
    case UMLPseudostate.PSK_TERMINATE:
      p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
      d = Math.round(Math.sqrt(2) * this.width / 4)
      canvas.line(p.x - d, p.y - d, p.x + d, p.y + d)
      canvas.line(p.x + d, p.y - d, p.x - d, p.y + d)
      break
    }
  }
}

/**
 * UMLFinalStateView
 */
class UMLFinalStateView extends NodeView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_FREE
    this.containerChangeable = true
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = FINALSTATE_MINWIDTHH
    this.minHeight = FINALSTATE_MINHEIGHT
    this.sizeConstraints()
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    canvas.fillEllipse(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET
    )
    canvas.restoreState()
    super.drawShadow(canvas)
  }

  drawObject (canvas) {
    canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
    canvas.fillColor = this.lineColor
    canvas.fillEllipse(this.left + 5, this.top + 5, this.getRight() - 5, this.getBottom() - 5)
  }
}

/**
 * UMLConnectionPointReferenceView
 */
class UMLConnectionPointReferenceView extends UMLFloatingNodeView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_NONE
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      var connectedPoints = []
      _.each(this.model.entry, function (point) {
        if (point.name && point.name.length > 0) {
          connectedPoints.push(point.name)
        }
      })
      _.each(this.model.exit, function (point) {
        if (point.name && point.name.length > 0) {
          connectedPoints.push(point.name)
        }
      })
      if (connectedPoints.length > 0) {
        this.nameLabel.text = connectedPoints.join(', ')
      }
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = CONNECTIONPOINT_MINWIDTH
    this.minHeight = CONNECTIONPOINT_MINHEIGHT
  }

  arrange (canvas) {
    if (this.containerView) {
      var r = this.containerView.getBoundingBox(canvas)
      var c = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
      var p = this._junction2(r, c)
      this.left = p.x - CONNECTIONPOINT_MINWIDTH / 2
      this.top = p.y - CONNECTIONPOINT_MINHEIGHT / 2
      this.setRight(p.x + CONNECTIONPOINT_MINWIDTH / 2)
      this.setBottom(p.y + CONNECTIONPOINT_MINHEIGHT / 2)
    }
    super.arrange(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.model.exit.length > 0) {
      // draw exitPoint
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
      var p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
      var d = Math.round(Math.sqrt(2) * this.width / 4)
      canvas.line(p.x - d, p.y - d, p.x + d, p.y + d)
      canvas.line(p.x + d, p.y - d, p.x - d, p.y + d)
    } else {
      // draw entryPoint
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
    }
  }
}

/**
 * UMLInternalActivityView
 */
class UMLInternalActivityView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    if (this._parent) {
      this.visible = this._parent.visible
    }
    if (this.model) {
      var text = ''
      if (_.includes(this.model._parent.entryActivities, this.model)) {
        text += 'entry/'
      } else if (_.includes(this.model._parent.doActivities, this.model)) {
        text += 'do/'
      } else if (_.includes(this.model._parent.exitActivities, this.model)) {
        text += 'exit/'
      }
      text += this.model.name
      this.text = text
    }
    super.update(canvas)
  }

  size (canvas) {
    super.size(canvas)
    this.height = this.minHeight
  }
}

/**
 * UMLInternalActivityCompartmentView
 */
class UMLInternalActivityCompartmentView extends UMLListCompartmentView {
  getItems () {
    return _.union(this.model.entryActivities, this.model.doActivities, this.model.exitActivities)
  }

  createItem () {
    return new UMLInternalActivityView()
  }
}

/**
 * UMLInternalTransitionView
 */
class UMLInternalTransitionView extends LabelView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_NONE
    this.parentStyle = true
    this.horizontalAlignment = Canvas.AL_LEFT
  }

  update (canvas) {
    super.update(canvas)
    if (this._parent) {
      this.visible = this._parent.visible
    }
    if (this.model) {
      this.text = this.model.getString()
    }
  }

  size (canvas) {
    super.size(canvas)
    this.height = this.minHeight
  }
}

/**
 * UMLInternalTransitionCompartmentView
 */
class UMLInternalTransitionCompartmentView extends UMLListCompartmentView {
  getItems () {
    return this.model.getInternalTransitions()
  }

  createItem () {
    return new UMLInternalTransitionView()
  }
}

/**
 * UMLRegionView
 */
class UMLRegionView extends NodeView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.movable = NodeView.MM_NONE
    this.sizable = NodeView.SZ_VERT
    this.parentStyle = true
  }

  _isTopRegionView () {
    var result = true
    if (this._parent !== null) {
      for (var i = 0, len = this._parent.subViews.length; i < len; i++) {
        var v = this._parent.subViews[i]
        if ((v instanceof UMLRegionView) && (v !== this)) {
          if (v.top < this.top) {
            result = false
            return result
          }
        }
      }
    }
    return result
  }

  update (canvas) {
    super.update(canvas)
    if (this._parent) {
      this.visible = this._parent.visible
    }
  }

  sizeObject (canvas) {
    this.minWidth = REGION_MINWIDTH
    this.minHeight = REGION_MINHEIGHT
    super.sizeObject(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (!this._isTopRegionView()) {
      canvas.line(this.left, this.top, this.getRight(), this.top, [10, 3])
    }
  }

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLStateView') ||
      app.metamodels.isKindOf(kind, 'UMLPseudostateView') ||
      app.metamodels.isKindOf(kind, 'UMLFinalStateView')
  }
}

/**
 * UMLDecompositionCompartmentView
 */
class UMLDecompositionCompartmentView extends UMLListCompartmentView {
  constructor () {
    super()
    this.minHeight = 15

    /* temporal */
    this._leftPadding = 0
    this._rightPadding = 0
    this._topPadding = 0
    this._bottomPadding = 0
    this._itemInterval = 0
  }

  getItems () {
    return this.model.regions
  }

  createItem () {
    return new UMLRegionView()
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    var h = 0
    for (var i = 0, len = this.subViews.length; i < len; i++) {
      var regionView = this.subViews[i]
      h += regionView.height
    }
    this.minHeight = h
  }
}

/**
 * UMLStateView
 */
class UMLStateView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = true

    /** @member {UMLInternalActivityCompartmentView} */
    this.internalActivityCompartment = new UMLInternalActivityCompartmentView()
    this.internalActivityCompartment.parentStyle = true
    this.addSubView(this.internalActivityCompartment)

    /** @member {UMLInternalTransitionCompartmentView} */
    this.internalTransitionCompartment = new UMLInternalTransitionCompartmentView()
    this.internalTransitionCompartment.parentStyle = true
    this.addSubView(this.internalTransitionCompartment)

    /** @member {UMLDecompositionCompartmentView} */
    this.decompositionCompartment = new UMLDecompositionCompartmentView()
    this.decompositionCompartment.parentStyle = true
    this.addSubView(this.decompositionCompartment)

    this.fillColor = app.preferences.get('uml.state.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getAllCompartments () {
    return [
      this.nameCompartment,
      this.internalActivityCompartment,
      this.internalTransitionCompartment,
      this.decompositionCompartment
    ]
  }

  update (canvas) {
    // internalActivityCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.internalActivityCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.internalActivityCompartment, 'model', this.model)
    }
    // internalTransitionCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.internalTransitionCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.internalTransitionCompartment, 'model', this.model)
    }
    // decompositionCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.decompositionCompartment.model !== this.model) {
      app.repository.bypassFieldAssign(this.decompositionCompartment, 'model', this.model)
    }
    super.update(canvas)
    if (this.model) {
      this.sizable = NodeView.SZ_FREE
      if (this.model.entryActivities.length + this.model.doActivities.length + this.model.exitActivities.length > 0) {
        this.internalActivityCompartment.visible = true
      } else {
        this.internalActivityCompartment.visible = false
      }
      if (this.model.getInternalTransitions().length > 0) {
        this.internalTransitionCompartment.visible = true
      } else {
        this.internalTransitionCompartment.visible = false
      }

      if (this.model.submachine !== null && this.showType) {
        this.nameCompartment.nameLabel.text = this.model.name + ': ' + this.model.submachine.name
      }
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(sz.x, STATE_MINWIDTH)
    if (this.model.submachine !== null) {
      this.minHeight = Math.max(sz.y + 16, STATE_MINHEIGHT)
    } else {
      this.minHeight = Math.max(sz.y, STATE_MINHEIGHT)
    }
    this.sizeConstraints()
  }

  drawShadowAsCanonicalForm (canvas, showLabel) {
    canvas.fillRoundRect(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET,
      STATE_ROUND
    )
  }

  drawShadowAsDecorationForm (canvas) {
    this.drawShadowAsCanonicalForm(canvas)
  }

  drawShadowAsIconicForm (canvas) {
    this.drawShadowAsCanonicalForm(canvas)
  }

  drawObject (canvas) {
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND)
    if (this.internalActivityCompartment.visible) {
      canvas.line(
        this.internalActivityCompartment.left,
        this.internalActivityCompartment.top,
        this.internalActivityCompartment.getRight(),
        this.internalActivityCompartment.top)
    }
    if (this.internalTransitionCompartment.visible) {
      canvas.line(
        this.internalTransitionCompartment.left,
        this.internalTransitionCompartment.top,
        this.internalTransitionCompartment.getRight(),
        this.internalTransitionCompartment.top)
    }
    if (this.decompositionCompartment.visible && this.decompositionCompartment.subViews.length > 0) {
      canvas.line(
        this.decompositionCompartment.left,
        this.decompositionCompartment.top,
        this.decompositionCompartment.getRight(),
        this.decompositionCompartment.top)
    }
    if (this.model.submachine !== null) {
      canvas.ellipse(this.getRight() - 26, this.getBottom() - 16, this.getRight() - 20, this.getBottom() - 10)
      canvas.line(this.getRight() - 20, this.getBottom() - 13, this.getRight() - 14, this.getBottom() - 13)
      canvas.ellipse(this.getRight() - 14, this.getBottom() - 16, this.getRight() - 8, this.getBottom() - 10)
    }
  }
}

/**
 * UMLTransitionView
 */
class UMLTransitionView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_SOLID
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.getString()
      this.nameLabel.visible = (this.nameLabel.text.length > 0)
    }
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLVertex)
  }
}

/**************************************************************************
 *                                                                        *
 *                         ACTIVITY DIAGRAM VIEWS                         *
 *                                                                        *
 **************************************************************************/

/**
 * UMLActivityDiagram
 */
class UMLActivityDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLActivity) ||
      (model instanceof type.UMLAction) ||
      (model instanceof type.UMLActivityNode) ||
      (model instanceof type.UMLActivityPartition) ||
      (model instanceof type.UMLPin)
  }

  layout (direction, separations) {
    if (!direction) {
      direction = Diagram.LD_BT
    }
    super.layout(direction, separations)
  }
}

/**
 * UMLPinView
 */
class UMLPinView extends UMLFloatingNodeView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_NONE
  }

  update (canvas) {
    super.update(canvas)
    var options = {
      showProperty: true,
      showType: true,
      showMultiplicity: true
    }
    if (this.model) {
      this.nameLabel.text = this.model.getString(options)
      this.nameLabel.underline = (this.model.isStatic === true)
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = PIN_MINWIDTH
    this.minHeight = PIN_MINHEIGHT
  }

  getPosition (canvas) {
    var RANGE = Math.round(PIN_MINWIDTH / 2)
    if (this.containerView) {
      var r = this.containerView.getBoundingBox(canvas)
      var b = this.getBoundingBox(canvas)
      if (r.y1 - RANGE <= b.y2 && b.y2 <= r.y1 + RANGE) {
        return 'top'
      } else if (r.y2 - RANGE <= b.y1 && b.y1 <= r.y2 + RANGE) {
        return 'bottom'
      } else if (r.x1 - RANGE <= b.x2 && b.x2 <= r.x1 + RANGE) {
        return 'left'
      } else if (r.x2 - RANGE <= b.x1 && b.x1 <= r.x2 + RANGE) {
        return 'right'
      }
    }
    return 'else' // default
  }

  drawArrow (canvas, direction) {
    var MARGIN = 2
    var rect = this.getBoundingBox(canvas)
    var c = Coord.getCenter(rect)
    var t = new Point(c.x, rect.y1 + MARGIN)
    var b = new Point(c.x, rect.y2 - MARGIN)
    var l = new Point(rect.x1 + MARGIN, c.y)
    var r = new Point(rect.x2 - MARGIN, c.y)
    switch (direction) {
    case 'up':
      canvas.line(b.x, b.y, t.x, t.y)
      canvas.line(t.x, t.y, t.x - 3, t.y + 3)
      canvas.line(t.x, t.y, t.x + 3, t.y + 3)
      break
    case 'down':
      canvas.line(b.x, b.y, t.x, t.y)
      canvas.line(b.x, b.y, b.x - 3, b.y - 3)
      canvas.line(b.x, b.y, b.x + 3, b.y - 3)
      break
    case 'left':
      canvas.line(l.x, l.y, r.x, r.y)
      canvas.line(l.x, l.y, l.x + 3, l.y - 3)
      canvas.line(l.x, l.y, l.x + 3, l.y + 3)
      break
    case 'right':
      canvas.line(l.x, l.y, r.x, r.y)
      canvas.line(r.x, r.y, r.x - 3, r.y - 3)
      canvas.line(r.x, r.y, r.x - 3, r.y + 3)
      break
    }
  }

  arrange (canvas) {
    if (this.containerView) {
      var r = this.containerView.getBoundingBox(canvas)
      var box = new Rect(this.left, this.top, this.getRight(), this.getBottom())
      var c = Coord.getCenter(box)
      var p = this._junction2(r, c)
      if (!Coord.ptInRect2(p, box)) {
        if (r.x1 < p.x) {
          this.left = p.x
        } else {
          this.left = p.x - PIN_MINWIDTH + 1
        }
        if (r.y1 < p.y) {
          this.top = p.y
        } else {
          this.top = p.y - PIN_MINHEIGHT + 1
        }
      }
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

/**
 * UMLInputPinView
 */
class UMLInputPinView extends UMLPinView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_NONE
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    switch (this.getPosition(canvas)) {
    case 'top':
      this.drawArrow(canvas, 'down')
      break
    case 'bottom':
      this.drawArrow(canvas, 'up')
      break
    case 'left':
      this.drawArrow(canvas, 'right')
      break
    case 'right':
      this.drawArrow(canvas, 'left')
      break
    }
  }
}

/**
 * UMLOutputPinView
 */
class UMLOutputPinView extends UMLPinView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_NONE
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    switch (this.getPosition(canvas)) {
    case 'top':
      this.drawArrow(canvas, 'up')
      break
    case 'bottom':
      this.drawArrow(canvas, 'down')
      break
    case 'left':
      this.drawArrow(canvas, 'left')
      break
    case 'right':
      this.drawArrow(canvas, 'right')
      break
    }
  }
}

/**
 * UMLExpansionNodeView
 */
class UMLExpansionNodeView extends UMLPinView {

  sizeObject (canvas) {
    super.sizeObject(canvas)
    switch (this.getPosition(canvas)) {
    case 'top':
    case 'bottom':
      this.minWidth = PIN_MINHEIGHT * 4
      this.minHeight = PIN_MINHEIGHT
      break
    case 'left':
    case 'right':
      this.minWidth = PIN_MINWIDTH
      this.minHeight = PIN_MINWIDTH * 4
      break
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    switch (this.getPosition(canvas)) {
    case 'top':
    case 'bottom':
      canvas.line(this.left + PIN_MINHEIGHT, this.top, this.left + PIN_MINHEIGHT, this.getBottom())
      canvas.line(this.left + PIN_MINHEIGHT * 2, this.top, this.left + PIN_MINHEIGHT * 2, this.getBottom())
      canvas.line(this.left + PIN_MINHEIGHT * 3, this.top, this.left + PIN_MINHEIGHT * 3, this.getBottom())
      break
    case 'left':
    case 'right':
      canvas.line(this.left, this.top + PIN_MINWIDTH, this.getRight(), this.top + PIN_MINWIDTH)
      canvas.line(this.left, this.top + PIN_MINWIDTH * 2, this.getRight(), this.top + PIN_MINWIDTH * 2)
      canvas.line(this.left, this.top + PIN_MINWIDTH * 3, this.getRight(), this.top + PIN_MINWIDTH * 3)
      break
    }
  }
}

/**
 * UMLActionView
 */
class UMLActionView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = true
    this.fillColor = app.preferences.get('uml.action.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      if (this.model.subactivity instanceof type.UMLActivity) {
        this.nameCompartment.nameLabel.text = this.model.name + ':' + this.model.subactivity.name
      } else if (this.model.kind === UMLAction.ACK_CALLOPERATION &&
          this.model.target instanceof UMLOperation &&
          this.model.name.trim().length === 0) {
        this.nameCompartment.nameLabel.text = this.model.target.name
      } else if (this.model.kind === UMLAction.ACK_CALLBEHAVIOR &&
          this.model.target instanceof UMLBehavior &&
          this.model.name.trim().length === 0) {
        this.nameCompartment.nameLabel.text = this.model.target.name
      }
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    var sz = this.getSizeOfAllCompartments(canvas)
    if (this.model.kind === UMLAction.ACK_TIMEEVENT) {
      this.minWidth = Math.max(sz.x, ICONICVIEW_ICONMINWIDTH)
      this.minHeight = ICONICVIEW_ICONMINHEIGHT + sz.y
    } else if (this.model.kind === UMLAction.ACK_CALLBEHAVIOR) {
      this.minWidth = Math.max(sz.x + 15, ACTION_MINWIDTH)
    } else {
      this.minWidth = Math.max(sz.x, ACTION_MINWIDTH)
      if (this.model.submachine !== null) {
        this.minHeight = Math.max(sz.y + 16, ACTION_MINHEIGHT)
      } else {
        this.minHeight = Math.max(sz.y, ACTION_MINHEIGHT)
      }
    }
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    if (this.model.kind === UMLAction.ACK_TIMEEVENT) {
      var sz = this.getSizeOfAllCompartments(canvas)
      var r = new Rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y2 - sz.y)
      this.iconRect = this.computeIconRect(r, this.iconRatio)
      var r2 = new Rect(this.mainRect.x1, this.mainRect.y1 + this.iconRect.getHeight(), this.mainRect.x2, this.mainRect.y2)
      this.arrangeAllCompartments(r2, canvas)
    }
  }

  arrangeCommon (canvas) {
    if (this.model.kind === UMLAction.ACK_CALLBEHAVIOR && this.model.target instanceof UMLActivity) {
      this.mainRect.setRect(this.left, this.top, this.getRight() - 15, this.getBottom())
    } else {
      this.mainRect.setRect(this.left, this.top, this.getRight(), this.getBottom())
    }
  }

  drawShadowAsCanonicalForm (canvas, showLabel) {
    var p
    switch (this.model.kind) {
    case UMLAction.ACK_OPAQUE:
    case UMLAction.ACK_CREATE:
    case UMLAction.ACK_DESTROY:
    case UMLAction.ACK_READ:
    case UMLAction.ACK_WRITE:
    case UMLAction.ACK_INSERT:
    case UMLAction.ACK_DELETE:
    case UMLAction.ACK_TRIGGEREVENT:
    case UMLAction.ACK_STRUCTURED:
    case UMLAction.ACK_CALLBEHAVIOR:
      canvas.fillRoundRect(
        this.mainRect.x1 + SHADOW_OFFSET,
        this.mainRect.y1 + SHADOW_OFFSET,
        this.getRight() + SHADOW_OFFSET,
        this.mainRect.y2 + SHADOW_OFFSET,
        STATE_ROUND
      )
      break
    case UMLAction.ACK_CALLOPERATION:
      canvas.fillRoundRect(
        this.mainRect.x1 + SHADOW_OFFSET,
        this.mainRect.y1 + SHADOW_OFFSET,
        this.mainRect.x2 + SHADOW_OFFSET,
        this.mainRect.y2 + SHADOW_OFFSET,
        STATE_ROUND
      )
      break
    case UMLAction.ACK_SENDSIGNAL:
      p = [
        new Point(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
        new Point(this.left + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
        new Point(this.getRight() - this.height / 4 + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
        new Point(this.getRight() + SHADOW_OFFSET, this.top + this.height / 2 + SHADOW_OFFSET),
        new Point(this.getRight() - this.height / 4 + SHADOW_OFFSET, this.top + SHADOW_OFFSET)
      ]
      canvas.fillPolygon(p)
      break
    case UMLAction.ACK_ACCEPTSIGNAL:
    case UMLAction.ACK_ACCEPTEVENT:
      p = [
        new Point(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
        new Point(this.getRight() + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
        new Point(this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
        new Point(this.left + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
        new Point(this.left + this.height / 4 + SHADOW_OFFSET, this.top + this.height / 2 + SHADOW_OFFSET)
      ]
      canvas.fillPolygon(p)
      break
    case UMLAction.ACK_TIMEEVENT:
      break
    }
  }

  drawShadowAsDecorationForm (canvas) {
    this.drawShadowAsCanonicalForm(canvas)
  }

  drawShadowAsIconicForm (canvas) {
    this.drawShadowAsCanonicalForm(canvas)
  }

  drawObject (canvas) {
    switch (this.model.kind) {
    case UMLAction.ACK_OPAQUE:
    case UMLAction.ACK_CREATE:
    case UMLAction.ACK_DESTROY:
    case UMLAction.ACK_READ:
    case UMLAction.ACK_WRITE:
    case UMLAction.ACK_INSERT:
    case UMLAction.ACK_DELETE:
    case UMLAction.ACK_TRIGGEREVENT:
    case UMLAction.ACK_STRUCTURED:
    case UMLAction.ACK_CALLOPERATION:
      canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND)
      canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND)
      if (this.model.subactivity !== null) {
        canvas.ellipse(this.getRight() - 26, this.getBottom() - 16, this.getRight() - 20, this.getBottom() - 10)
        canvas.line(this.getRight() - 20, this.getBottom() - 13, this.getRight() - 14, this.getBottom() - 13)
        canvas.ellipse(this.getRight() - 14, this.getBottom() - 16, this.getRight() - 8, this.getBottom() - 10)
      }
      break
    case UMLAction.ACK_CALLBEHAVIOR:
      canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND)
      canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND)
      if (this.model.target instanceof UMLActivity) {
        canvas.line(this.getRight() - 10, this.top + 5, this.getRight() - 10, this.top + 20)
        canvas.line(this.getRight() - 15, this.top + 13, this.getRight() - 5, this.top + 13)
        canvas.line(this.getRight() - 15, this.top + 13, this.getRight() - 15, this.top + 20)
        canvas.line(this.getRight() - 5, this.top + 13, this.getRight() - 5, this.top + 20)
      }
      break
    case UMLAction.ACK_SENDSIGNAL:
      var polygon = [
        new Point(this.left, this.top),
        new Point(this.left, this.getBottom()),
        new Point(this.getRight() - this.height / 4, this.getBottom()),
        new Point(this.getRight(), this.top + this.height / 2),
        new Point(this.getRight() - this.height / 4, this.top)
      ]
      canvas.fillPolygon(polygon)
      canvas.polygon(polygon)
      break
    case UMLAction.ACK_ACCEPTSIGNAL:
    case UMLAction.ACK_ACCEPTEVENT:
      var p = [
        new Point(this.left, this.top),
        new Point(this.getRight(), this.top),
        new Point(this.getRight(), this.getBottom()),
        new Point(this.left, this.getBottom()),
        new Point(this.left + this.height / 4, this.top + this.height / 2)
      ]
      canvas.fillPolygon(p)
      canvas.polygon(p)
      break
    case UMLAction.ACK_TIMEEVENT:
      var _iconWidth = this.iconRect.getWidth()
      var _iconHeight = this.iconRect.getHeight()
      var _x = (this.left + this.getRight()) / 2
      var _r = new Rect(_x - (_iconWidth / 2), this.top, _x + (_iconWidth / 2), this.top + _iconHeight)
      var p2 = [
        new Point(_r.x1, _r.y1),
        new Point(_r.x2, _r.y1),
        new Point(_r.x1, _r.y2),
        new Point(_r.x2, _r.y2),
        new Point(_r.x1, _r.y1)
      ]
      canvas.fillPolygon(p2)
      canvas.polygon(p2)
      break
    }
  }
}

/**
 * UMLObjectNodeView
 */
class UMLObjectNodeView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = true
    this.fillColor = app.preferences.get('uml.objectnode.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameCompartment.nameLabel.text = this.model.getString()
      if (this.model.inStates && this.model.inStates.length > 0) {
        this.nameCompartment.namespaceLabel.visible = true
        let stateNames = this.model.inStates.map(e => e.name)
        this.nameCompartment.namespaceLabel.text = `[${stateNames.join(', ')}]`
      }
    }
  }

  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    super.drawObject(canvas)
  }
}

/**
 * UMLCentralBufferNodeView
 */
class UMLCentralBufferNodeView extends UMLObjectNodeView {

  getStereotypeLabelText () {
    return '«centralBuffer»'
  }
}

/**
 * UMLDataStoreNodeView
 */
class UMLDataStoreNodeView extends UMLObjectNodeView {

  getStereotypeLabelText () {
    return '«datastore»'
  }
}

/**
 * UMLControlNodeView
 */
class UMLControlNodeView extends NodeView {

  constructor () {
    super()
    this.containerChangeable = true
    this.sizable = NodeView.SZ_FREE
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    if (this.model instanceof type.UMLInitialNode) {
      this.minWidth = INITIALNODE_MINWIDTH
      this.minHeight = INITIALNODE_MINHEIGHT
    } else if (this.model instanceof type.UMLActivityFinalNode) {
      this.minWidth = ACTIVITYFINALNODE_MINWIDTH
      this.minHeight = ACTIVITYFINALNODE_MINHEIGHT
    } else if (this.model instanceof type.UMLFlowFinalNode) {
      this.minWidth = FLOWFINALNODE_MINWIDTH
      this.minHeight = FLOWFINALNODE_MINHEIGHT
    } else if (this.model instanceof type.UMLForkNode) {
      if (this.height > this.width) {
        // Vertical Synchronization
        this.minWidth = FORKNODE_MINTHICK
        this.minHeight = FORKNODE_MINLENGTH
        this.width = this.minWidth
      } else {
        // Horizontal Synchronization
        this.minWidth = FORKNODE_MINLENGTH
        this.minHeight = FORKNODE_MINTHICK
        this.height = this.minHeight
      }
    } else if (this.model instanceof type.UMLJoinNode) {
      if (this.height > this.width) {
        // Vertical Synchronization
        this.minWidth = JOINNODE_MINTHICK
        this.minHeight = JOINNODE_MINLENGTH
        this.width = this.minWidth
      } else {
        // Horizontal Synchronization
        this.minWidth = JOINNODE_MINLENGTH
        this.minHeight = JOINNODE_MINTHICK
        this.height = this.minHeight
      }
    } else if (this.model instanceof type.UMLMergeNode) {
      this.minWidth = MERGENODE_MINWIDTH
      this.minHeight = MERGENODE_MINHEIGHT
    } else if (this.model instanceof type.UMLDecisionNode) {
      this.minWidth = DECISIONNODE_MINWIDTH
      this.minHeight = DECISIONNODE_MINHEIGHT
    }
    this.sizeConstraints()
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    if ((this.model instanceof type.UMLInitialNode) ||
        (this.model instanceof type.UMLActivityFinalNode) ||
        (this.model instanceof type.UMLFlowFinalNode)) {
      canvas.fillEllipse(
        this.left + SHADOW_OFFSET,
        this.top + SHADOW_OFFSET,
        this.getRight() + SHADOW_OFFSET,
        this.getBottom() + SHADOW_OFFSET
      )
    } else if ((this.model instanceof type.UMLForkNode) || (this.model instanceof type.UMLJoinNode)) {
      canvas.fillRoundRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET, 3)
    } else if ((this.model instanceof type.UMLMergeNode) || (this.model instanceof type.UMLDecisionNode)) {
      var x = this.left + (this.width / 2)
      var y = this.top + (this.height / 2)
      canvas.fillPolygon([
        new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET),
        new Point(x + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
        new Point(this.getRight() + SHADOW_OFFSET, y + SHADOW_OFFSET),
        new Point(x + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
        new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET)])
    }
    canvas.restoreState()
    super.drawShadow(canvas)
  }

  drawObject (canvas) {
    var x, y
    if (this.model instanceof type.UMLInitialNode) {
      canvas.fillColor = this.lineColor
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
    } else if (this.model instanceof type.UMLActivityFinalNode) {
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.fillColor = this.lineColor
      canvas.fillEllipse(this.left + 5, this.top + 5, this.getRight() - 5, this.getBottom() - 5)
    } else if (this.model instanceof type.UMLFlowFinalNode) {
      canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
      var p = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
      var d = Math.round(Math.sqrt(2) * this.width / 4)
      canvas.line(p.x - d, p.y - d, p.x + d, p.y + d)
      canvas.line(p.x + d, p.y - d, p.x - d, p.y + d)
    } else if (this.model instanceof type.UMLForkNode) {
      canvas.fillColor = this.lineColor
      if (Math.abs(this.getRight() - this.left) >= Math.abs(this.getBottom() - this.top)) {
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.top + FORKNODE_MINTHICK, 3)
      } else {
        canvas.fillRoundRect(this.left, this.top, this.left + FORKNODE_MINTHICK, this.getBottom(), 3)
      }
    } else if (this.model instanceof type.UMLJoinNode) {
      canvas.fillColor = this.lineColor
      if (Math.abs(this.getRight() - this.left) >= Math.abs(this.getBottom() - this.top)) {
        canvas.fillRoundRect(this.left, this.top, this.getRight(), this.top + JOINNODE_MINTHICK, 3)
      } else {
        canvas.fillRoundRect(this.left, this.top, this.left + JOINNODE_MINTHICK, this.getBottom(), 3)
      }
    } else if ((this.model instanceof type.UMLMergeNode) || (this.model instanceof type.UMLDecisionNode)) {
      x = (this.left + this.getRight()) / 2
      y = (this.top + this.getBottom()) / 2
      canvas.fillPolygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)])
      canvas.polygon([new Point(this.left, y), new Point(x, this.top), new Point(this.getRight(), y), new Point(x, this.getBottom()), new Point(this.left, y)])
    }
  }
}

/**
 * UMLControlFlowView
 */
class UMLControlFlowView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_SOLID
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.getString()
      this.nameLabel.visible = (this.nameLabel.text.length > 0)
    }
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLActivityNode)
  }
}

/**
 * UMLObjectFlowView
 */
class UMLObjectFlowView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_SOLID
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.getString()
      this.nameLabel.visible = (this.nameLabel.text.length > 0)
    }
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLActivityNode || view.model instanceof type.UMLPin)
  }
}

/**
 * UMLZigZagAdornmentView
 */
class UMLZigZagAdornmentView extends EdgeNodeView {

  constructor () {
    super()
    this.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_FREE
    this.alpha = Math.PI / 2
    this.distance = 20
  }

  update (canvas) {
    super.update(canvas)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.width = 25
    this.height = 20
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.line(this.left, this.top, this.getRight(), this.top)
    canvas.line(this.getRight(), this.top, this.left, this.getBottom() - 5)
    canvas.line(this.left, this.getBottom() - 5, this.getRight(), this.getBottom() - 5)
    canvas.line(this.getRight(), this.getBottom() - 5, this.getRight() - 5, this.getBottom())
    canvas.line(this.getRight(), this.getBottom() - 5, this.getRight() - 5, this.getBottom() - 10)
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }
}

/**
 * UMLExceptionHandlerView
 */
class UMLExceptionHandlerView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_SOLID

    /** @member {UMLZigZagAdornmentView} */
    this.adornment = new UMLZigZagAdornmentView()
    this.adornment.parentStyle = true
    this.addSubView(this.adornment)
  }

  update (canvas) {
    super.update(canvas)
    // adornment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.adornment.model !== this.model) {
      app.repository.bypassFieldAssign(this.adornment, 'model', this.model)
    }
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLActivityNode)
  }
}

/**
 * UMLActivityInterruptView
 */
class UMLActivityInterruptView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_SOLID

    /** @member {UMLZigZagAdornmentView} */
    this.adornment = new UMLZigZagAdornmentView()
    this.adornment.parentStyle = true
    this.addSubView(this.adornment)
  }

  update (canvas) {
    super.update(canvas)
    // adornment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.adornment.model !== this.model) {
      app.repository.bypassFieldAssign(this.adornment, 'model', this.model)
    }
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof type.UMLActivityNode)
  }
}

/**
 * UMLSwimlaneView
 */
class UMLSwimlaneView extends NodeView {

  constructor () {
    super()

    /** @member {Boolean} */
    this.isVertical = true

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.verticalAlignment = Canvas.AL_TOP
    this.nameLabel.selectable = View.SK_NO
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)
  }

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLActionView') ||
      app.metamodels.isKindOf(kind, 'UMLControlNodeView') ||
      app.metamodels.isKindOf(kind, 'UMLObjectNodeView') ||
      app.metamodels.isKindOf(kind, 'UMLFinalStateView')
  }

  update (canvas) {
    if (this.model) {
      this.nameLabel.text = this.model.name
      this.nameLabel.visible = (this.model.name.length > 0)
      if (this.isVertical) {
        this.nameLabel.direction = LabelView.DK_HORZ
      } else {
        this.nameLabel.direction = LabelView.DK_VERT
      }
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    var w, h
    if (this.isVertical) {
      w = this.nameLabel.minWidth + SWIMLANE_HEADER_LEFT_MARGIN + SWIMLANE_HEADER_RIGHT_MARGIN
      this.minWidth = Math.max(w, SWIMLANE_VERT_MINWIDTH)
      h = this.nameLabel.minHeight + SWIMLANE_HEADER_TOP_MARGIN + SWIMLANE_HEADER_BOTTOM_MARGIN
      this.minHeight = Math.max(h, SWIMLANE_VERT_MINHEIGHT)
    } else {
      w = this.nameLabel.minWidth + SWIMLANE_HEADER_TOP_MARGIN + SWIMLANE_HEADER_BOTTOM_MARGIN
      this.minWidth = Math.max(w, SWIMLANE_HORIZ_MINWIDTH)
      h = this.nameLabel.minHeight + SWIMLANE_HEADER_LEFT_MARGIN + SWIMLANE_HEADER_RIGHT_MARGIN
      this.minHeight = Math.max(h, SWIMLANE_HORIZ_MINHEIGHT)
    }
  }

  arrangeObject (canvas) {
    // not inherited (SwimlaneView must not be affected by 'AutoResize' attribute.
    if (this.isVertical) {
      this.nameLabel.direction = LabelView.DK_HORZ
      this.nameLabel.width = this.nameLabel.minWidth
      this.nameLabel.height = this.nameLabel.minHeight
      this.nameLabel.left = this.left
      this.nameLabel.setRight(this.getRight())
      this.nameLabel.top = this.top + SWIMLANE_HEADER_TOP_MARGIN
    } else {
      this.nameLabel.direction = LabelView.DK_VERT
      this.nameLabel.width = this.nameLabel.minWidth
      this.nameLabel.height = this.nameLabel.minHeight
      this.nameLabel.left = this.left + SWIMLANE_HEADER_TOP_MARGIN
      this.nameLabel.top = this.top
      this.nameLabel.setBottom(this.getBottom())
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.lineWidth = SWIMLANE_PEN_WIDTH
    if (this.isVertical) {
      var h = this.top + this.nameLabel.height + SWIMLANE_HEADER_TOP_MARGIN + SWIMLANE_HEADER_BOTTOM_MARGIN
      canvas.fillRect(this.left, this.top, this.getRight(), h)
      canvas.rect(this.left, this.top, this.getRight(), h)
      canvas.polyline([new Point(this.left, this.getBottom()), new Point(this.left, this.top), new Point(this.getRight(), this.top), new Point(this.getRight(), this.getBottom())])
    } else {
      var w = this.left + this.nameLabel.width + SWIMLANE_HEADER_TOP_MARGIN + SWIMLANE_HEADER_BOTTOM_MARGIN
      canvas.fillRect(this.left, this.top, w, this.getBottom())
      canvas.rect(this.left, this.top, w, this.getBottom())
      canvas.polyline([new Point(this.getRight(), this.top), new Point(this.left, this.top), new Point(this.left, this.getBottom()), new Point(this.getRight(), this.getBottom())])
    }
    canvas.lineWidth = 1
  }
}

/**
 * UMLInterruptibleActivityRegionView
 */
class UMLInterruptibleActivityRegionView extends NodeView {

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLActionView') ||
      app.metamodels.isKindOf(kind, 'UMLControlNodeView') ||
      app.metamodels.isKindOf(kind, 'UMLObjectNodeView') ||
      app.metamodels.isKindOf(kind, 'UMLFinalStateView')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = 30
    this.minHeight = 30
  }

  drawObject (canvas) {
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND, [3])
  }
}

/**
 * UMLActivityEdgeConnectorView
 */
class UMLActivityEdgeConnectorView extends NodeView {

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = ACTIVITYEDGECONNECTOR_MINWIDTH
    this.minHeight = ACTIVITYEDGECONNECTOR_MINWIDTH
  }

  drawObject (canvas) {
    canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
    canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
    var sz = canvas.textExtent(this.model.name)
    var x = this.left + (this.width - sz.x) / 2
    var y = this.top + (this.height - sz.y) / 2
    canvas.textOut(x, y, this.model.name)
  }
}

/**
 * UMLStructuredActivityNodeView
 */
class UMLStructuredActivityNodeView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.containerChangeable = true
    this.fillColor = app.preferences.get('uml.action.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getStereotypeLabelText () {
    return '«structured»'
  }

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLActionView') ||
      app.metamodels.isKindOf(kind, 'UMLControlNodeView') ||
      app.metamodels.isKindOf(kind, 'UMLObjectNodeView') ||
      app.metamodels.isKindOf(kind, 'UMLFinalStateView') ||
      app.metamodels.isKindOf(kind, 'UMLStructuredActivityNodeView')
  }

  update (canvas) {
    super.update(canvas)
    this.nameCompartment.stereotypeLabel.horizontalAlignment = Canvas.AL_LEFT
    if (this.model) {
      if (this.model.subactivity instanceof type.UMLActivity) {
        this.nameCompartment.nameLabel.text = this.model.name + ':' + this.model.subactivity.name
      }
    }
  }

  drawShadowAsCanonicalForm (canvas, showLabel) {
    canvas.fillRoundRect(
      this.mainRect.x1 + SHADOW_OFFSET,
      this.mainRect.y1 + SHADOW_OFFSET,
      this.mainRect.x2 + SHADOW_OFFSET,
      this.mainRect.y2 + SHADOW_OFFSET,
      STATE_ROUND
    )
  }

  drawShadowAsDecorationForm (canvas) {
    this.drawShadowAsCanonicalForm(canvas)
  }

  drawShadowAsIconicForm (canvas) {
    this.drawShadowAsCanonicalForm(canvas)
  }

  drawObject (canvas) {
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTION_ROUND, [3])
    if (this.model.subactivity !== null) {
      canvas.ellipse(this.getRight() - 26, this.getBottom() - 16, this.getRight() - 20, this.getBottom() - 10)
      canvas.line(this.getRight() - 20, this.getBottom() - 13, this.getRight() - 14, this.getBottom() - 13)
      canvas.ellipse(this.getRight() - 14, this.getBottom() - 16, this.getRight() - 8, this.getBottom() - 10)
    }
  }
}

/**
 * UMLExpansionRegionView
 */
class UMLExpansionRegionView extends UMLStructuredActivityNodeView {

  getStereotypeLabelText () {
    switch (this.model.mode) {
    case UMLExpansionRegion.EK_PARALLEL:
      return '«parallel»'
    case UMLExpansionRegion.EK_ITERATIVE:
      return '«iterative»'
    case UMLExpansionRegion.EK_STREAM:
      return '«stream»'
    }
    return this.model.getStereotypeString()
  }
}

/**************************************************************************
 *                                                                        *
 *                         SEQUENCE DIAGRAM VIEWS                         *
 *                                                                        *
 **************************************************************************/

/**
 * UMLSequenceDiagram
 */
class UMLSequenceDiagram extends UMLDiagram {

  constructor () {
    super()
    this.showSequenceNumber = true
    this.showSignature = true
    this.showActivation = true
    this.sequenceNumbering = UMLSequenceDiagram.SN_AUTO
  }

  canAcceptModel (model) {
    if (model instanceof type.Hyperlink || model instanceof type.Diagram) {
      return true
    } else if (model instanceof type.UMLMessageEndpoint ||
               model instanceof type.UMLCombinedFragment ||
               model instanceof type.UMLStateInvariant ||
               model instanceof type.UMLInteraction ||
               model instanceof type.UMLInteractionUse ||
               model instanceof type.UMLContinuation ||
               model instanceof type.UMLMessage) {
      return _.every(this.ownedViews, function (v) { return v.model !== model })
    } else if (model instanceof type.UMLAttribute) { // A role of collaboration
      return (model._parent === this._parent._parent)
    } else {
      return (model instanceof type.UMLConstraint) ||
        (model instanceof type.UMLClassifier)
    }
  }

  drawDiagram (canvas, drawSelection) {
    var i, len, view
    // Regulate sequence number of message views
    for (i = 0, len = this.ownedViews.length; i < len; i++) {
      view = this.ownedViews[i]
      if (view instanceof UMLSeqMessageView) {
        view.regulateSequenceNumber()
      }
    }
    super.drawDiagram(canvas, drawSelection)
  }

  layout (direction, separations) {
    // TODO: Layout for Sequence Diagram
  }
}

/**
 * UMLSequenceNumberingKind: `auto`
 * @const {string}
 */
UMLSequenceDiagram.SN_AUTO = 'auto'

/**
 * UMLSequenceNumberingKind: `custom`
 * @const {string}
 */
UMLSequenceDiagram.SN_CUSTOM = 'custom'

/**
 * UMLLinePartView (Line Part of LifelineView)
 */
class UMLLinePartView extends NodeView {

  constructor () {
    super()
    this.movable = NodeView.MM_NONE
    this.sizable = NodeView.SZ_VERT
    this.selectable = View.SK_NO
  }

  /**
     * @param {number} yPosition
     * @return {UMLActivationView}
     */
  getActivationAt (yPosition) {
    var frontMostActivation = null
    // find the most extruded Activation(FrontMostActivation)
    // regard Activation whose Top position is the lowest as the most extruded Activation
    for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
      if (this.getDiagram().ownedViews[i] instanceof UMLSeqMessageView) {
        var msg = this.getDiagram().ownedViews[i]
        if (msg.head === this) {
          if (msg.activation.visible && (msg.activation.top <= yPosition) && (msg.activation.getBottom() > yPosition)) {
            if (frontMostActivation !== null) {
              if (msg.activation.top > frontMostActivation.top) {
                frontMostActivation = msg.activation
              }
            } else {
              frontMostActivation = msg.activation
            }
          }
        }
      }
    }
    return frontMostActivation
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    // Auto-expanding Lifeline
    var bottomMost = 0
    for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
      if (this.getDiagram().ownedViews[i] instanceof UMLSeqMessageView) {
        var msg = this.getDiagram().ownedViews[i]
        if (msg.model && (msg.model.source === this.model || msg.model.target === this.model)) {
          var box = msg.getBoundingBox(canvas)
          if (bottomMost < box.y2) {
            bottomMost = box.y2
          }
        }
      }
    }
    this.minWidth = 1
    if (bottomMost > (this.minHeight + this.top)) {
      this.minHeight = (bottomMost - this.top) + 15
    } else {
      this.minHeight = LIFELINE_MINHEIGHT
    }
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.width = this.minWidth
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    var c = this.left + (this.width / 2)
    canvas.line(c, this.top, c, this.getBottom(), [3])
  }
}

/**
 * UMLSeqLifelineView
 */
class UMLSeqLifelineView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.movable = NodeView.MM_HORZ

    /** @member {UMLLinePartView} */
    this.linePart = new UMLLinePartView()
    this.addSubView(this.linePart)

    this.fillColor = app.preferences.get('uml.lifeline.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  drawIcon (canvas, rect) {
    if (this.model) {
      if (this.model.stereotype && this.model.stereotype.icon) {
        super.drawIcon(canvas, rect)
      } else if (this.model.represent && (this.model.represent.type instanceof type.Model)) {
        var iconRatioBackup = this.iconRatio
        if (this.model.represent.type instanceof type.UMLActor) {
          this.iconRatio = ACTOR_RATIO_PERCENT
          this.arrangeObject(canvas)
          if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION ||
            this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL) {
            this.iconRect = this.computeIconRect(this.iconRect, this.iconRatio)
          }
          UMLActorView.prototype.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLUseCase) {
          this.iconRatio = USECASE_RATIO_PERCENT
          this.arrangeObject(canvas)
          if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION ||
            this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL) {
            this.iconRect = this.computeIconRect(this.iconRect, this.iconRatio)
          }
          UMLUseCaseView.prototype.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLInterface) {
          this.iconRatio = 100
          this.arrangeObject(canvas)
          if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION ||
            this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL) {
            this.iconRect = this.computeIconRect(this.iconRect, this.iconRatio)
          }
          UMLInterfaceView.prototype.drawBallNotation.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLArtifact) {
          this.iconRatio = ARTIFACT_RATIO_PERCENT
          this.arrangeObject(canvas)
          if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION ||
            this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL) {
            this.iconRect = this.computeIconRect(this.iconRect, this.iconRatio)
          }
          UMLArtifactViewMixin.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLComponent) {
          this.iconRatio = COMPONENT_RATIO_PERCENT
          this.arrangeObject(canvas)
          switch (this.stereotypeDisplay) {
          case UMLGeneralNodeView.SD_DECORATION:
          case UMLGeneralNodeView.SD_DECORATION_LABEL:
            UMLComponentViewMixin.drawDecorationIcon.call(this, canvas, this.iconRect)
            break
          default:
            UMLComponentViewMixin.drawIcon.call(this, canvas, this.iconRect)
          }
        } else if (this.model.represent.type instanceof type.UMLNode) {
          this.iconRatio = NODE_RATIO_PERCENT
          this.arrangeObject(canvas)
          if (this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION ||
            this.stereotypeDisplay === UMLGeneralNodeView.SD_DECORATION_LABEL) {
            this.iconRect = this.computeIconRect(this.iconRect, this.iconRatio)
          }
          UMLNodeViewMixin.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type.stereotype && this.model.represent.type.stereotype.icon) {
          var _icon = this.model.represent.type.stereotype.icon
          var _rect = this.computeIconRect(rect, (_icon.width / _icon.height) * 100)
          drawStereotypeIcon(this, canvas, _rect, _icon)
        } else {
          super.drawIcon(canvas, rect)
        }
        this.iconRatio = iconRatioBackup
        this.arrangeObject(canvas)
      } else {
        super.drawIcon(canvas, rect)
      }
    }
  }

  update (canvas) {
    super.update(canvas)
    // linePart가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
    if (this.linePart.model !== this.model) {
      app.repository.bypassFieldAssign(this.linePart, 'model', this.model)
    }
    if (this.model) {
      this.nameCompartment.nameLabel.text = this.model.getString(this)
      this.nameCompartment.nameLabel.underline = false
    }
  }

  sizeAsCanonicalForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(SEQ_OBJECT_MINWIDTH, sz.x + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING)
    this.minHeight = Math.max(SEQ_OBJECT_MINHEIGHT, sz.y) + this.linePart.minHeight
  }

  sizeAsDecorationForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(SEQ_OBJECT_MINWIDTH, this.nameCompartment.minWidth + DECORATION_ICON_WIDTH + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING)
    this.minHeight = Math.max(SEQ_OBJECT_MINHEIGHT, sz.y) + this.linePart.minHeight
    this.sizeConstraints()
  }

  sizeAsIconicForm (canvas, showLabel) {
    var sz = this.getSizeOfAllCompartments(canvas)
    this.minWidth = Math.max(sz.x, ICONICVIEW_ICONMINWIDTH)
    this.minHeight = ICONICVIEW_ICONMINHEIGHT + sz.y + this.linePart.minHeight
  }

  arrangeCommon (canvas) {
    // If a create message is connected, Y position should be determined by the Message's Y position.
    var _createMessage = null
    for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
      var v = this.getDiagram().ownedViews[i]
      if (v instanceof UMLSeqMessageView &&
          v.model.messageSort === UMLMessage.MS_CREATEMESSAGE &&
          v.head === this.linePart) {
        _createMessage = v
        break
      }
    }
    if (_createMessage) {
      this.top = Math.round(_createMessage.points.getPoint(1).y - (SEQ_OBJECT_MINHEIGHT / 2))
    } else {
      this.top = LIFELINE_TOP_POSITION
    }
    this.mainRect.setRect(this.left, this.top, this.getRight(), this.getBottom())
  }

  arrangeAsCanonicalForm (canvas, showLabel) {
    // not inherited: must not be affected by 'AutoResize' attribute.
    super.arrangeAsCanonicalForm(canvas, showLabel)
    this.nameCompartment.height = SEQ_OBJECT_MINHEIGHT
    this.linePart.top = this.nameCompartment.getBottom() + 1
    this.linePart.left = Math.round(this.left + (this.width / 2))
    this.linePart.setBottom(this.getBottom())
  }

  arrangeAsDecorationForm (canvas, showLabel) {
    // not inherited: must not be affected by 'AutoResize' attribute.
    super.arrangeAsDecorationForm(canvas, showLabel)
    this.linePart.top = this.nameCompartment.getBottom() + 1
    this.linePart.left = Math.round(this.left + (this.width / 2))
    this.linePart.setBottom(this.getBottom())
  }

  arrangeAsIconicForm (canvas, showLabel) {
    // super.arrangeAsIconicForm(canvas)
    var r = new Rect(this.mainRect.x1, this.mainRect.y1, this.mainRect.x2, this.mainRect.y1 + SEQ_OBJECT_MINHEIGHT)
    this.iconRect = this.computeIconRect(r, this.iconRatio)
    var r2 = new Rect(this.mainRect.x1, this.mainRect.y1 + this.iconRect.getHeight(), this.mainRect.x2, this.mainRect.y2)
    this.arrangeAllCompartments(r2, canvas)
    this.linePart.top = this.nameCompartment.getBottom() + 1
    this.linePart.left = Math.round(this.left + (this.width / 2))
    this.linePart.setBottom(this.getBottom())
  }

  drawCommon (canvas) {
    // draw nothing
  }

  drawAsCanonicalForm (canvas, showLabel) {
    super.drawAsCanonicalForm(canvas)
    var r = new Rect(this.left, this.top, this.getRight(), this.nameCompartment.getBottom())
    if (this.model.isMultiInstance) {
      canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN)
    }
    canvas.fillRect(r.x1, r.y1, r.x2, r.y2)
    canvas.rect(r.x1, r.y1, r.x2, r.y2)
    if (this.model.represent && this.model.represent.type && this.model.represent.type.isActive === true) {
      canvas.line(this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.top, this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.getBottom())
      canvas.line(this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.top, this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.getBottom())
    }
  }

  drawAsDecorationForm (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.nameCompartment.getBottom())
    if (this.model.isMultiInstance) {
      canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN)
    }
    canvas.fillRect(r.x1, r.y1, r.x2, r.y2)
    canvas.rect(r.x1, r.y1, r.x2, r.y2)
    if (this.model.represent && this.model.represent.type && this.model.represent.type.isActive === true) {
      canvas.line(this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.top, this.left + CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.getBottom())
      canvas.line(this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.top, this.getRight() - CLASS_ACTIVE_VERTLINE_WIDTH, this.nameCompartment.getBottom())
    }
    super.drawAsDecorationForm(canvas)
  }

  drawAsIconicForm (canvas) {
    super.drawAsIconicForm(canvas)
  }

  drawShadowAsCanonicalForm (canvas) {
    canvas.fillRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.nameCompartment.getBottom() + SHADOW_OFFSET)
  }

  drawShadowAsDecorationForm (canvas) {
    canvas.fillRect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.nameCompartment.getBottom() + SHADOW_OFFSET)
  }

  drawShadowAsIconicForm (canvas) {
    /*
        canvas.fillRect(
            this.iconRect.x1 + SHADOW_OFFSET,
            this.iconRect.y1 + SHADOW_OFFSET,
            this.iconRect.x2 + SHADOW_OFFSET,
            this.iconRect.y2 + SHADOW_OFFSET
        )
        */
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**
 * UMLMessageEndpointView
 */
class UMLMessageEndpointView extends NodeView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_HORZ
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = MESSAGEENDPOINT_MINWIDTH
    this.minHeight = MESSAGEENDPOINT_MINHEIGHT
  }

  /**
     * Movable freely when nothing connected,
     * but movable horizontally only when a message is connected.
     */
  arrangeObject (canvas) {
    this.width = this.minWidth
    this.height = this.minHeight
    var edges = app.repository.getEdgeViewsOf(this)
    if (edges.length > 0) {
      this.movable = NodeView.MM_HORZ
    } else {
      this.movable = NodeView.MM_FREE
    }
    super.arrangeObject(canvas)
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**
 * UMLEndpointView
 */
class UMLEndpointView extends UMLMessageEndpointView {

  drawObject (canvas) {
    canvas.fillColor = this.lineColor
    canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
  }
}

/**
 * UMLGateView
 */
class UMLGateView extends UMLMessageEndpointView {

  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
  }
}

/**
 * UMLActivationView
 */
class UMLActivationView extends NodeView {

  constructor () {
    super()
    this.sizable = NodeView.SZ_VERT
    this.movable = NodeView.MM_NONE
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = ACTIVATION_MINWIDTH
    this.minHeight = ACTIVATION_MINHEIGHT
  }

  arrangeObject (canvas) {
    var messageView = this._parent
    var linePart = messageView.head
    var parentActivation = (linePart instanceof UMLLinePartView ? linePart.getActivationAt(this.top - 1) : null)

    this.top = messageView.points.getPoint(messageView.points.count() - 1).y
    this.width = ACTIVATION_MINWIDTH
    // Left position extrudes a little right than Parent Activation
    if (parentActivation !== null) {
      this.left = parentActivation.left + (ACTIVATION_MINWIDTH / 2)
    } else {
      this.left = linePart.left - (ACTIVATION_MINWIDTH / 2)
    }
    // if Activation is not shown
    if (!this.visible) {
      if (parentActivation !== null) {
        this.left = parentActivation.left
      } else {
        this.left = linePart.left
      }
      // if Activation is shown
    } else {
      // Height must wrap all Child Activations at least.
      //   - Child Activation satisfies below conditions
      //     (1) in all current LifeLine's In-coming Messages,
      //     (2) if its head side's y position is between Top and Bottom,
      //     (3) the message's Activation is really Child Activation.
      var minimumBottom = this.top + ACTIVATION_MINHEIGHT
      for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
        if (this.getDiagram().ownedViews[i] instanceof UMLSeqMessageView) {
          var msg = this.getDiagram().ownedViews[i]
          if ((msg.head === linePart) && (msg !== messageView)) {
            var y = msg.points.getPoint(msg.points.count() - 1).y
            if ((this.top <= y) && (this.getBottom() > y)) {
              if (msg.activation.visible && (msg.activation.getBottom() > minimumBottom)) {
                minimumBottom = msg.activation.getBottom()
              }
            }
          }
        }
      }
      if (this.getBottom() < minimumBottom + 3) {
        this.setBottom(minimumBottom + 3)
      }
    }
    super.arrangeObject(canvas)
  }

  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
  }

  /**
   * Cannot be copied to clipboard.
   */
  canCopy () {
    return false
  }

  /**
   * Cannnot be deleted view only.
   */
  canDelete () {
    return false
  }
}

/**
 * UMLSeqMessageView
 */
class UMLSeqMessageView extends EdgeView {

  constructor () {
    super()
    this.lineStyle = EdgeView.LS_RECTILINEAR
    this.zIndex = 1
    this.selectZIndex = 2

    /** @member {EdgeLabelView} */
    this.nameLabel = new EdgeLabelView()
    this.nameLabel.hostEdge = this
    this.nameLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.nameLabel.distance = 10
    this.nameLabel.alpha = Math.PI / 2
    this.addSubView(this.nameLabel)

    /** @member {EdgeLabelView} */
    this.stereotypeLabel = new EdgeLabelView()
    this.stereotypeLabel.hostEdge = this
    this.stereotypeLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.stereotypeLabel.distance = 25
    this.stereotypeLabel.alpha = Math.PI / 2
    this.addSubView(this.stereotypeLabel)

    /** @member {EdgeLabelView} */
    this.propertyLabel = new EdgeLabelView()
    this.propertyLabel.hostEdge = this
    this.propertyLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.propertyLabel.distance = 10
    this.propertyLabel.alpha = -Math.PI / 2
    this.addSubView(this.propertyLabel)

    /** @member {UMLActivationView} */
    this.activation = new UMLActivationView()
    this.addSubView(this.activation)

    /** @member {boolean} */
    this.showProperty = true

    /** @member {boolean} */
    this.showType = true
  }

  _fixPointCount (cnt, xpos, ypos) {
    if (this.points.count() !== cnt) {
      this.points.clear()
      for (var pi = 1; pi <= cnt; pi++) {
        this.points.add(new Point(xpos, ypos))
      }
    }
  }

  /**
   * @private
   */
  _getSequenceNumberByPos (xpos, ypos) {
    var seqNum = 0
    var views = this.getDiagram().ownedViews
    for (var i = 0, len = views.length; i < len; i++) {
      var v = views[i]
      if (v instanceof UMLSeqMessageView) {
        if (v.points.getPoint(0).y < ypos) {
          seqNum = seqNum + 1
        } else if (v.points.getPoint(0).y === ypos) {
          if (v.points.getPoint(0).x < xpos) {
            seqNum = seqNum + 1
          }
        }
      }
    }
    return seqNum
  }

  /**
   * @private
   */
  _indexOfMessageView (model) {
    var dgm = this.getDiagram()
    for (var i = 0, len = dgm.ownedViews.length; i < len; i++) {
      var v = dgm.ownedViews[i]
      if (v.model === model) {
        return i
      }
    }
    return -1
  }

  regulateSequenceNumber () {
    // var fromLine       = this.tail,
    //     fromActivation = fromLine.getActivationAt(this.points.getPoint(0).y),
    var dgm = this.getDiagram()
    var msg = this.model
    var interaction = this.model._parent
    var sn = _.indexOf(interaction.messages, msg)
    var sn2 = this._getSequenceNumberByPos(this.points.getPoint(0).x, this.points.getPoint(0).y)
    // determine sequence number
    if (sn !== sn2) {
      // change by ownedViews' index to correspond to SequenceNumber.
      var c = this._indexOfMessageView(interaction.messages[sn2])
      if (dgm.ownedViews.indexOf(this) > -1) {
        dgm.ownedViews.splice(dgm.ownedViews.indexOf(this), 1)
      }
      dgm.ownedViews.splice(c, 0, this)
      // move at interactions' index to correspond to SequenceNumber.
      if (interaction.messages.indexOf(msg) > -1) {
        interaction.messages.splice(interaction.messages.indexOf(msg), 1)
      }
      interaction.messages.splice(sn2, 0, msg)
    }
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      var options = {
        showSequenceNumber: this.getDiagram().showSequenceNumber,
        sequenceNumbering: this.getDiagram().sequenceNumbering,
        showSignature: this.getDiagram().showSignature,
        showActivation: this.getDiagram().showActivation,
        showType: this.showType
      }
      this.nameLabel.text = this.model.getString(options)
      this.nameLabel.visible = (this.nameLabel.text.length > 0)
      this.stereotypeLabel.visible = (this.stereotypeLabel.text.length > 0)
      this.activation.visible = (this.head instanceof UMLLinePartView &&
                                 options.showActivation &&
                                 ((this.model.messageSort === UMLMessage.MS_SYNCHCALL) ||
                                  (this.model.messageSort === UMLMessage.MS_ASYNCHCALL) ||
                                  (this.model.messageSort === UMLMessage.MS_DELETEMESSAGE)))
      // line style
      if ((this.model.messageSort === UMLMessage.MS_REPLY) || (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE)) {
        this.lineMode = EdgeView.LM_DOT
      } else {
        this.lineMode = EdgeView.LM_SOLID
      }
      // head end style
      if ((this.model.messageSort === UMLMessage.MS_ASYNCHCALL) ||
          (this.model.messageSort === UMLMessage.MS_ASYNCHSIGNAL) ||
          (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE) ||
          (this.model.messageSort === UMLMessage.MS_REPLY)) {
        this.headEndStyle = EdgeView.ES_STICK_ARROW
      } else {
        this.headEndStyle = EdgeView.ES_SOLID_ARROW
      }
      // stereotype
      if (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE) {
        this.stereotypeLabel.text = '«create»'
      } else if (this.model.messageSort === UMLMessage.MS_DELETEMESSAGE) {
        this.stereotypeLabel.text = '«destroy»'
      } else if (hasValue(this.model.stereotype)) {
        this.stereotypeLabel.text = this.model.getStereotypeString()
      } else {
        this.stereotypeLabel.text = ''
      }
      // propertyLabel
      this.propertyLabel.text = this.model.getPropertyString()
      this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false)
      // activation가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.activation.model !== this.model) {
        app.repository.bypassFieldAssign(this.activation, 'model', this.model)
      }
      // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.nameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameLabel, 'model', this.model)
      }
      // stereotypeLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.stereotypeLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.stereotypeLabel, 'model', this.model)
      }
      // propertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.propertyLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.propertyLabel, 'model', this.model)
      }
    }
  }

  arrange (canvas) {
    // arrange activation
    this.activation.arrangeObject(canvas)
    // if head or tail is MessageEndpointView
    if (this.head instanceof UMLMessageEndpointView) {
      this.head.top = this.points.getPoint(1).y - (this.head.height / 2)
    }
    if (this.tail instanceof UMLMessageEndpointView) {
      this.tail.top = this.points.getPoint(1).y - (this.tail.height / 2)
    }
    super.arrange(canvas)
    // if create message, head's X position should be the left or right of Lifeline.
    if (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE) {
      if (this.points.getPoint(1).x > this.points.getPoint(0).x) {
        if (this.head._parent instanceof UMLSeqLifelineView) {
          let lifeline = this.head._parent
          this.points.getPoint(1).x = lifeline.left
        }
      } else {
        if (this.head._parent instanceof UMLSeqLifelineView) {
          let lifeline = this.head._parent
          this.points.getPoint(1).x = lifeline.right
        }
      }
    }
  }

  arrangeObject (canvas) {
    // default variable values
    this.lineStyle = EdgeView.LS_RECTILINEAR
    super.arrangeObject(canvas)

    var fromLifeline = this.tail
    var fromActivation = (fromLifeline instanceof UMLLinePartView ? fromLifeline.getActivationAt(this.points.getPoint(0).y) : null)
    var toLifeline = this.head
    var toActivation = (toLifeline instanceof UMLLinePartView ? toLifeline.getActivationAt(this.points.getPoint(this.points.count() - 1).y) : null)

    // (1) in case of Self message
    if (this.head === this.tail) {
      this._fixPointCount(4, this.points.getPoint(0).x, this.points.getPoint(0).y)
      if ((fromActivation !== null) && fromActivation.visible) {
        this.points.setPoint(0, new Point(fromActivation.getRight(), this.points.getPoint(0).y))
      } else {
        this.points.setPoint(0, new Point(fromLifeline.getRight(), this.points.getPoint(0).y))
      }
      this.points.setPoint(1, new Point(this.points.getPoint(0).x + SELF_MESSAGE_WIDTH, this.points.getPoint(0).y))
      this.points.setPoint(2, new Point(this.points.getPoint(0).x + SELF_MESSAGE_WIDTH, this.points.getPoint(0).y + SELF_MESSAGE_HEIGHT))
      if ((toActivation !== null) && toActivation.visible) {
        this.points.setPoint(3, new Point(this.activation.getRight(), this.points.getPoint(0).y + SELF_MESSAGE_HEIGHT))
      } else {
        this.points.setPoint(3, new Point(this.tail.getRight(), this.points.getPoint(0).y + SELF_MESSAGE_HEIGHT))
      }
    // (2) in case of left-to-right directed message
    } else if (this.points.getPoint(1).x > this.points.getPoint(0).x) {
      this._fixPointCount(2, this.points.getPoint(0).x, this.points.getPoint(0).y)
      if ((fromActivation !== null) && fromActivation.visible) {
        this.points.setPoint(0, new Point(fromActivation.getRight(), this.points.getPoint(0).y))
      } else {
        this.points.setPoint(0, new Point(fromLifeline.getRight(), this.points.getPoint(0).y))
      }
      if ((toActivation !== null) && toActivation.visible) {
        this.points.setPoint(1, new Point(this.activation.left, this.points.getPoint(0).y))
      } else {
        this.points.setPoint(1, new Point(this.head.left, this.points.getPoint(0).y))
      }
    // (3) in case of right-to-left direced message
    } else {
      this._fixPointCount(2, this.points.getPoint(0).x, this.points.getPoint(0).y)
      if ((fromActivation !== null) && fromActivation.visible) {
        this.points.setPoint(0, new Point(fromActivation.left, this.points.getPoint(0).y))
      } else {
        this.points.setPoint(0, new Point(fromLifeline.left, this.points.getPoint(0).y))
      }
      if ((toActivation !== null) && toActivation.visible) {
        this.points.setPoint(1, new Point(this.activation.getRight(), this.points.getPoint(0).y))
      } else {
        this.points.setPoint(1, new Point(this.head.getRight(), this.points.getPoint(0).y))
      }
    }
    this.update()
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.model.messageSort === UMLMessage.MS_DELETEMESSAGE) {
      var lifeline = this.head
      var bottom = lifeline.getBottom()
      var center = (lifeline.left + lifeline.getRight()) / 2
      canvas.line(center - 10, bottom - 10, center + 10, bottom + 10)
      canvas.line(center + 10, bottom - 10, center - 10, bottom + 10)
    }
  }

  /**
   *
   */
  initialize (canvas, x1, y1, x2, y2) {
    this.lineStyle = EdgeView.LS_RECTILINEAR
    if (this.head !== this.tail) {
      this.points.clear()
      this.points.add(new Point(this.tail.getRight(), y1))
      this.points.add(new Point(this.head.left, y2))
    } else { // Self Message
      this.points.clear()
      this.points.add(new Point(x1, y1))
      this.points.add(new Point(x1, y1))
      this.points.add(new Point(x1, y1))
      this.points.add(new Point(x1, y1))
    }
  }

  /**
   * Cannot be copied to clipboard.
   */
  canCopy () {
    return false
  }

  /**
   * Cannnot be deleted view only.
   */
  canDelete () {
    return false
  }

  /**
   * Determine where it can be connected to
   */
  canConnectTo (view, isTail) {
    return (view.model && view.model instanceof type.UMLMessageEndpoint)
  }
}

/**
 * UMLStateInvariantView
 */
class UMLStateInvariantView extends NodeView {

  constructor () {
    super()
    this.movable = NodeView.MM_VERT
    this.zIndex = 1
    this.selectZIndex = 1

    /** @member {LabelView} */
    this.invariantLabel = new LabelView()
    this.invariantLabel.horizontalAlignment = Canvas.AL_CENTER
    this.invariantLabel.verticalAlignment = Canvas.AL_MIDDLE
    this.addSubView(this.invariantLabel)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      if (this.model.invariant instanceof UMLModelElement) {
        this.invariantLabel.text = this.model.invariant.name
      } else {
        this.invariantLabel.text = `{${this.model.invariant}}`
      }
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.invariantLabel.minWidth, STATEINVARIANT_MINWIDTH)
    this.minHeight = Math.max(this.invariantLabel.minHeight, STATEINVARIANT_MINHEIGHT)
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    if (this._parent instanceof UMLSeqLifelineView) {
      this.left = this._parent.linePart.left - (this.width / 2)
    }
    this.invariantLabel.top = this.top + (this.height - this.invariantLabel.height) / 2
    this.invariantLabel.left = this.left + (this.width - this.invariantLabel.width) / 2
  }

  drawObject (canvas) {
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND)
    super.drawObject(canvas)
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**
 * UMLContinuationView
 */
class UMLContinuationView extends NodeView {

  constructor () {
    super()
    this.zIndex = 1
    this.selectZIndex = 1

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.verticalAlignment = Canvas.AL_MIDDLE
    this.addSubView(this.nameLabel)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.name
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.nameLabel.minWidth, CONTINUATION_MINWIDTH)
    this.minHeight = Math.max(this.nameLabel.minHeight, CONTINUATION_MINHEIGHT)
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.top = this.top + (this.height - this.nameLabel.height) / 2
    this.nameLabel.left = this.left + (this.width - this.nameLabel.width) / 2
  }

  drawObject (canvas) {
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), STATE_ROUND)
    super.drawObject(canvas)
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**
 * UMLCustomFrameView
 */
class UMLCustomFrameView extends NodeView {

  constructor () {
    super()

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)

    /** @member {LabelView} */
    this.frameTypeLabel = new LabelView()
    this.frameTypeLabel.parentStyle = true
    this.addSubView(this.frameTypeLabel)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    var h = Math.max(this.frameTypeLabel.minHeight, this.nameLabel.minHeight) + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING
    this.minHeight = Math.max(h + FRAME_CONTENT_MINHEIGHT, FRAME_MINHEIGHT)
    var w = this.frameTypeLabel.minWidth + this.nameLabel.minWidth
    if (this.frameTypeLabel.visible && this.frameTypeLabel.visible) {
      w = w + LABEL_INTERVAL
    }
    w = w + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING + h / 2
    this.minWidth = Math.max(w + FRAME_CONTENT_MINWIDTH, FRAME_MINWIDTH)
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.frameTypeLabel.font.style = Font.FS_BOLD
    this.frameTypeLabel.left = this.left + COMPARTMENT_LEFT_PADDING
    this.frameTypeLabel.top = this.top + COMPARTMENT_TOP_PADDING
    this.frameTypeLabel.setRight(this.frameTypeLabel.left + this.frameTypeLabel.minWidth)
    if (this.frameTypeLabel.visible) {
      this.nameLabel.left = this.frameTypeLabel.getRight() + LABEL_INTERVAL * 2
    } else {
      this.nameLabel.left = this.left + COMPARTMENT_LEFT_PADDING
    }
    this.nameLabel.top = this.top + COMPARTMENT_TOP_PADDING
    this.nameLabel.setRight(this.nameLabel.left + this.nameLabel.minWidth)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    var y = Math.max(this.frameTypeLabel.getBottom(), this.nameLabel.getBottom()) + COMPARTMENT_BOTTOM_PADDING
    var h = y - this.top
    var x = this.nameLabel.getRight() + COMPARTMENT_RIGHT_PADDING + h / 2
    canvas.polyline([new Point(this.left, this.top), new Point(this.getRight(), this.top), new Point(this.getRight(), this.getBottom()), new Point(this.left, this.getBottom()), new Point(this.left, this.top)])
    canvas.fillPolygon([new Point(this.left, this.top), new Point(this.left, y), new Point(x - h / 2, y), new Point(x, this.top + h / 2), new Point(x, this.top), new Point(this.left, this.top)])
    canvas.polygon([new Point(this.left, this.top), new Point(this.left, y), new Point(x - h / 2, y), new Point(x, this.top + h / 2), new Point(x, this.top), new Point(this.left, this.top)])
  }
}

/**
 * UMLFrameView
 */
class UMLFrameView extends UMLCustomFrameView {

  constructor () {
    super()
    this.zIndex = -1
    this.selectZIndex = -1
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      // frame kind
      if (this.model instanceof type.UMLClass || this.model instanceof type.UMLClassDiagram) {
        this.frameTypeLabel.text = 'class'
      } else if (this.model instanceof type.UMLComponent || this.model instanceof type.UMLComponentDiagram) {
        this.frameTypeLabel.text = 'cmp'
      } else if (this.model instanceof type.UMLDeploymentDiagram) {
        this.frameTypeLabel.text = 'dep'
      } else if (this.model instanceof type.UMLInteraction || this.model instanceof type.UMLSequenceDiagram || this.model instanceof type.UMLCommunicationDiagram || this.model instanceof type.UMLTimingDiagram || this.model instanceof type.UMLInteractionOverviewDiagram) {
        this.frameTypeLabel.text = 'sd'
      } else if (this.model instanceof type.UMLStateMachine || this.model instanceof type.UMLStatechartDiagram) {
        this.frameTypeLabel.text = 'stm'
      } else if (this.model instanceof type.UMLActivity || this.model instanceof type.UMLActivityDiagram) {
        this.frameTypeLabel.text = 'act'
      } else if (this.model instanceof type.UMLUseCase || this.model instanceof type.UMLUseCaseDiagram) {
        this.frameTypeLabel.text = 'uc'
      } else if (this.model instanceof type.UMLPackage || this.model instanceof type.UMLPackageDiagram) {
        this.frameTypeLabel.text = 'pkg'
      } else if (this.model instanceof type.SysMLRequirementDiagram) {
        this.frameTypeLabel.text = 'req'
      } else if (this.model instanceof type.SysMLBlockDefinitionDiagram) {
        this.frameTypeLabel.text = 'bdd'
      } else if (this.model instanceof type.SysMLParametricDiagram) {
        this.frameTypeLabel.text = 'par'
      } else if (this.model instanceof type.SysMLInternalBlockDiagram) {
        this.frameTypeLabel.text = 'ibd'
      }
      // name
      if (this.model.name.length > 0) {
        this.nameLabel.text = this.model.name
      }
    }
  }
}

/**
 * UMLInteractionOperandView
 */
class UMLInteractionOperandView extends NodeView {

  constructor () {
    super()
    this.selectable = View.SK_YES
    this.movable = NodeView.MM_NONE
    this.sizable = NodeView.SZ_VERT
    this.parentStyle = true
    this.minHeight = 15
    this.height = 30

    /** @member {LabelView} */
    this.guardLabel = new LabelView()
    this.addSubView(this.guardLabel)
  }

  _isTopOperandView () {
    var result = true
    if (this._parent !== null) {
      for (var i = 0, len = this._parent.subViews.length; i < len; i++) {
        var v = this._parent.subViews[i]
        if ((v instanceof UMLInteractionOperandView) && (v !== this)) {
          if (v.top < this.top) {
            result = false
            return result
          }
        }
      }
    }
    return result
  }

  update (canvas) {
    super.update(canvas)
    if (this._parent) {
      this.visible = this._parent.visible
    }
    if (this.model) {
      if (hasValue(this.model.guard)) {
        this.guardLabel.text = '[' + this.model.guard + ']'
      } else {
        this.guardLabel.text = ''
      }
      this.guardLabel.visible = (this.guardLabel.text.length > 0)
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = Math.max(this.guardLabel.minWidth + INTERACTIONOPERAND_GUARD_HORZ_MARGIN * 2, INTERACTIONOPERAND_MINWIDTH)
    this.minHeight = Math.max(this.guardLabel.minHeight + INTERACTIONOPERAND_GUARD_VERT_MARGIN * 2, INTERACTIONOPERAND_MINHEIGHT)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.guardLabel.left = this.left + INTERACTIONOPERAND_GUARD_HORZ_MARGIN
    this.guardLabel.top = this.top + INTERACTIONOPERAND_GUARD_VERT_MARGIN
    this.guardLabel.width = this.guardLabel.minWidth
    this.guardLabel.height = this.guardLabel.minHeight
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (!this._isTopOperandView()) {
      canvas.line(this.left, this.top, this.getRight(), this.top, [10, 3])
    }
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**
 * UMLInteractionOperandCompartmentView
 */
class UMLInteractionOperandCompartmentView extends UMLListCompartmentView {
  constructor () {
    super()
    this.minHeight = 15

    /* temporal */
    this._leftPadding = 0
    this._rightPadding = 0
    this._topPadding = 0
    this._bottomPadding = 0
    this._itemInterval = 0
  }

  getItems () {
    return this.model.operands
  }

  createItem () {
    return new UMLInteractionOperandView()
  }
}

/**
 * UMLCombinedFragmentView
 */
class UMLCombinedFragmentView extends UMLCustomFrameView {

  constructor () {
    super()
    this.zIndex = 2
    this.selectZIndex = 0

    /** @member {UMLInteractionOperandCompartmentView} */
    this.operandCompartment = new UMLInteractionOperandCompartmentView()
    this.operandCompartment.parentStyle = true
    this.addSubView(this.operandCompartment)
  }

  _carryOnOperandViews () {
    if (this.subViews.length > 0) {
      var i, len
      var interOpViews = []
      for (i = 0, len = this.subViews.length; i < len; i++) {
        if (this.subViews[i] instanceof UMLInteractionOperandView) {
          interOpViews.push(this.subViews[i])
        }
      }
      if (interOpViews.length > 0) {
        _.sortBy(interOpViews, function (view) { return view.top })
        var firstIOV = interOpViews[0]
        firstIOV.top = Math.max(this.frameTypeLabel.getBottom(), this.nameLabel.getBottom()) + COMPARTMENT_BOTTOM_PADDING
        for (i = 1; i <= (interOpViews.length - 1); i++) {
          interOpViews[i].top = interOpViews[i - 1].getBottom()
        }
        var lastIOV = interOpViews[interOpViews.length - 1]
        lastIOV.setBottom(this.getBottom())
        this.minHeight = lastIOV.top + lastIOV.minHeight - this.top
      }
    }
  }

  update (canvas) {
    if (this.operandCompartment.model !== this.model) {
      // operandCompartment가 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      app.repository.bypassFieldAssign(this.operandCompartment, 'model', this.model)
    }
    if (this.model) {
      this.nameLabel.text = this.model.name
      this.frameTypeLabel.text = this.model.interactionOperator
      this.nameLabel.visible = (this.nameLabel.text.length > 0)
      this.frameTypeLabel.visible = (this.frameTypeLabel.text.length > 0)
      if (this.model.operands && this.model.operands.length > 0) {
        this.operandCompartment.visible = true
      } else {
        this.operandCompartment.visible = false
      }
    }
    super.update(canvas)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    if (this.operandCompartment.visible) {
      var h = Math.max(this.frameTypeLabel.height, this.nameLabel.height) + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING
      this.minHeight = h + this.operandCompartment.height
    }
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    if (this.operandCompartment.visible) {
      var h = Math.max(this.frameTypeLabel.height, this.nameLabel.height) + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING
      this.operandCompartment.left = this.left
      this.operandCompartment.top = this.top + h
      this.operandCompartment.width = this.width
      this.operandCompartment.height = this.height - h
      this.operandCompartment.arrange(canvas)
    }
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**
 * UMLInteractionUseView
 */
class UMLInteractionUseView extends NodeView {

  constructor () {
    super()
    this.zIndex = 1
    this.selectZIndex = 1

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)

    /** @member {LabelView} */
    this.frameTypeLabel = new LabelView()
    this.frameTypeLabel.parentStyle = true
    this.addSubView(this.frameTypeLabel)

    /** @member {boolean} */
    this.wordWrap = false
  }

  update (canvas) {
    super.update(canvas)
    this.frameTypeLabel.text = 'ref'
    this.nameLabel.wordWrap = this.wordWrap
    let model = this.model
    if (this.model instanceof UMLAction) model = this.model.target
    if (model) {
      var s = ''
      if (model.returnValueRecipient) {
        s += model.returnValueRecipient.name + ' = '
      }
      if (model.refersTo) {
        s += model.refersTo.name
      }
      if (model.arguments.length > 0) {
        s += '(' + model.arguments + ')'
      }
      if (model.returnValue.length > 0) {
        s += ': ' + model.returnValue
      }
      this.nameLabel.text = s
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    var h = Math.max(this.frameTypeLabel.minHeight, this.nameLabel.minHeight) + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING
    this.minHeight = Math.max(h, FRAME_MINHEIGHT)
    // var w = Math.max(this.frameTypeLabel.width, this.nameLabel.width)
    // w = w + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING
    this.minWidth = Math.max(this.frameTypeLabel.minWidth + COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING + this.frameTypeLabel.minHeight + this.nameLabel.minWidth, FRAME_MINWIDTH)
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.frameTypeLabel.font.style = Font.FS_BOLD
    this.frameTypeLabel.left = this.left + COMPARTMENT_LEFT_PADDING
    this.frameTypeLabel.top = this.top + COMPARTMENT_TOP_PADDING
    this.frameTypeLabel.setRight(this.frameTypeLabel.left + this.frameTypeLabel.minWidth)

    let h = this.frameTypeLabel.getBottom() + COMPARTMENT_BOTTOM_PADDING - this.top
    this.nameLabel.top = this.top + COMPARTMENT_TOP_PADDING
    this.nameLabel.left = this.frameTypeLabel.right + (h / 2) + (COMPARTMENT_LEFT_PADDING * 2)
    this.nameLabel.setRight(this.right - COMPARTMENT_RIGHT_PADDING)
    // this.nameLabel.top = this.top + (this.height - this.nameLabel.height) / 2
    // this.nameLabel.left = this.left + (this.width - this.nameLabel.width) / 2
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    var y = this.frameTypeLabel.getBottom() + COMPARTMENT_BOTTOM_PADDING
    var h = y - this.top
    var x = this.frameTypeLabel.getRight() + COMPARTMENT_RIGHT_PADDING + h / 2
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.polygon([new Point(this.left, this.top), new Point(this.left, y), new Point(x - h / 2, y), new Point(x, this.top + h / 2), new Point(x, this.top), new Point(this.left, this.top)])
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**
 * UMLTimeConstraintView
 */
class UMLTimeConstraintView extends LabelView {
  constructor () {
    super()
    this.parentStyle = true
    this.selectable = View.SK_YES
    this.sizable = NodeView.SZ_NONE
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.text = `{${this.model.min || 'min'}..${this.model.max || 'max'}}`
    }
  }
}

/**
 * UMLTimeConstraintLinkView
 */
class UMLTimeConstraintLinkView extends EdgeView {
  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_FLAT
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    if (this.tail instanceof UMLTimeSegmentView) {
      let tp = this.points.points[0]
      tp.y = Math.round(this.tail.top + (this.tail.height / 2))
    }
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }

  /** Determine where it can be connected to */
  canConnectTo (view, isTail) {
    return false
  }
}

/**
 * UMLDurationConstraintView
 */
class UMLDurationConstraintView extends NodeView {

  constructor () {
    super()
    this.containerChangeable = false
    this.containerExtending = false

    /** @member {NodeLabelView} */
    this.nameLabel = new NodeLabelView()
    this.nameLabel.distance = 20
    this.nameLabel.alpha = 3 * Math.PI / 4
    this.addSubView(this.nameLabel)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = `{${this.model.min || 'min'}..${this.model.max || 'max'}}`
      // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.nameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameLabel, 'model', this.model)
      }
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    if (this.getDiagram() instanceof UMLTimingDiagram) {
      this.minWidth = DURATION_CONSTRAINT_MIN_HEIGHT
      this.minHeight = DURATION_CONSTRAINT_MIN_WIDTH
    } else {
      this.minWidth = DURATION_CONSTRAINT_MIN_WIDTH
      this.minHeight = DURATION_CONSTRAINT_MIN_HEIGHT
    }
    super.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    if (this.getDiagram() instanceof UMLTimingDiagram) {
      this.sizable = NodeView.SZ_HORZ
      this.height = this.minHeight
    } else {
      this.sizable = NodeView.SZ_VERT
      this.width = this.minWidth
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.getDiagram() instanceof UMLTimingDiagram) {
      canvas.line(this.left, this.top, this.left, this.bottom)
      canvas.line(this.right, this.top, this.right, this.bottom)
      let c = this.top + Math.round(this.height / 2)
      canvas.line(this.left, c, this.right, c)
      canvas.line(this.left, c, this.left + DURATION_CONSTRAINT_ARROW_SIZE * 2, c - DURATION_CONSTRAINT_ARROW_SIZE)
      canvas.line(this.left, c, this.left + DURATION_CONSTRAINT_ARROW_SIZE * 2, c + DURATION_CONSTRAINT_ARROW_SIZE)
      canvas.line(this.right, c, this.right - DURATION_CONSTRAINT_ARROW_SIZE * 2, c - DURATION_CONSTRAINT_ARROW_SIZE)
      canvas.line(this.right, c, this.right - DURATION_CONSTRAINT_ARROW_SIZE * 2, c + DURATION_CONSTRAINT_ARROW_SIZE)
    } else {
      canvas.line(this.left, this.top, this.right, this.top)
      canvas.line(this.left, this.bottom, this.right, this.bottom)
      let c = this.left + Math.round(this.width / 2)
      canvas.line(c, this.top, c, this.bottom)
      canvas.line(c, this.top, c - DURATION_CONSTRAINT_ARROW_SIZE, this.top + DURATION_CONSTRAINT_ARROW_SIZE * 2)
      canvas.line(c, this.top, c + DURATION_CONSTRAINT_ARROW_SIZE, this.top + DURATION_CONSTRAINT_ARROW_SIZE * 2)
      canvas.line(c, this.bottom, c - DURATION_CONSTRAINT_ARROW_SIZE, this.bottom - DURATION_CONSTRAINT_ARROW_SIZE * 2)
      canvas.line(c, this.bottom, c + DURATION_CONSTRAINT_ARROW_SIZE, this.bottom - DURATION_CONSTRAINT_ARROW_SIZE * 2)
    }
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }
}

/**************************************************************************
 *                                                                        *
 *                       COMMUNICATION DIAGRAM VIEWS                      *
 *                                                                        *
 **************************************************************************/

/**
 * UMLCommunicationDiagram
 */
class UMLCommunicationDiagram extends UMLDiagram {

  constructor () {
    super()
    this.showSequenceNumber = true
    this.showSignature = true
    this.sequenceNumbering = UMLSequenceDiagram.SN_AUTO
  }

  canAcceptModel (model) {
    if (model instanceof type.Hyperlink || model instanceof type.Diagram) {
      return true
    } else if (model instanceof type.UMLLifeline) {
      return _.every(this.ownedViews, function (v) { return v.model !== model })
    } else if (model instanceof type.UMLMessage) {
      return _.some(this.ownedViews, function (v) { return v.model === model.source }) &&
        _.some(this.ownedViews, function (v) { return v.model === model.target }) &&
        _.every(this.ownedViews, function (v) { return v.model !== model })
    } else if (model instanceof type.UMLAttribute) { // A role of collaboration
      return (model._parent === this._parent._parent)
    } else if (model instanceof type.UMLConnector) {
      return _.every(this.ownedViews, function (v) { return v.model !== model })
    } else {
      return (model instanceof type.UMLConstraint) ||
        (model instanceof type.UMLClassifier)
    }
  }
}

/**
 * UMLCommLifelineView
 */
class UMLCommLifelineView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.lifeline.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameCompartment.nameLabel.text = this.model.getString(this)
      this.nameCompartment.nameLabel.underline = false
    }
  }

  drawIcon (canvas, rect) {
    if (this.model) {
      if (this.model.stereotype && this.model.stereotype.icon) {
        super.drawIcon(canvas, rect)
      } else if (this.model.represent && (this.model.represent.type instanceof type.Model)) {
        var iconRatioBackup = this.iconRatio
        if (this.model.represent.type instanceof type.UMLActor) {
          this.iconRatio = ACTOR_RATIO_PERCENT
          this.arrangeObject(canvas)
          UMLActorView.prototype.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLUseCase) {
          this.iconRatio = USECASE_RATIO_PERCENT
          this.arrangeObject(canvas)
          UMLUseCaseView.prototype.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLInterface) {
          this.iconRatio = 100
          this.arrangeObject(canvas)
          UMLInterfaceView.prototype.drawBallNotation.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLArtifact) {
          this.iconRatio = ARTIFACT_RATIO_PERCENT
          this.arrangeObject(canvas)
          UMLArtifactViewMixin.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLComponent) {
          this.iconRatio = COMPONENT_RATIO_PERCENT
          this.arrangeObject(canvas)
          UMLComponentViewMixin.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type instanceof type.UMLNode) {
          this.iconRatio = NODE_RATIO_PERCENT
          this.arrangeObject(canvas)
          UMLNodeViewMixin.drawIcon.call(this, canvas, this.iconRect)
        } else if (this.model.represent.type.stereotype && this.model.represent.type.stereotype.icon) {
          drawStereotypeIcon(this, canvas, rect, this.model.represent.type.stereotype.icon)
        } else {
          super.drawIcon(canvas, rect)
        }
        this.iconRatio = iconRatioBackup
        this.arrangeObject(canvas)
      } else {
        super.drawIcon(canvas, rect)
      }
    }
  }

  drawAsCanonicalForm (canvas, showLabel) {
    super.drawAsCanonicalForm(canvas)
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    if (this.model.isMultiInstance) {
      canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN)
    }
    canvas.fillRect(r.x1, r.y1, r.x2, r.y2)
    canvas.rect(r.x1, r.y1, r.x2, r.y2)
  }

  drawAsDecorationForm (canvas) {
    var r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
    if (this.model.isMultiInstance) {
      canvas.rect(r.x1 + MULTI_INSTANCE_MARGIN, r.y1 + MULTI_INSTANCE_MARGIN, r.x2 + MULTI_INSTANCE_MARGIN, r.y2 + MULTI_INSTANCE_MARGIN)
    }
    canvas.fillRect(r.x1, r.y1, r.x2, r.y2)
    canvas.rect(r.x1, r.y1, r.x2, r.y2)
    super.drawAsDecorationForm(canvas)
  }

  drawAsIconicForm (canvas) {
    super.drawAsIconicForm(canvas)
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**
 * UMLCommMessageView
 */
class UMLCommMessageView extends EdgeNodeView {

  constructor () {
    super()
    this.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.sizable = NodeView.SZ_NONE
    this.movable = NodeView.MM_FREE
    this.alpha = Math.PI / 2
    this.distance = 10

    this.headPoint = new Point()
    this.tailPoint = new Point()
    this.arrowPoint1 = new Point()
    this.arrowPoint2 = new Point()

    /** @member {NodeLabelView} */
    this.nameLabel = new NodeLabelView()
    this.nameLabel.distance = 10
    this.nameLabel.alpha = Math.PI / 2
    this.addSubView(this.nameLabel)

    /** @member {NodeLabelView} */
    this.stereotypeLabel = new NodeLabelView()
    this.stereotypeLabel.distance = 25
    this.stereotypeLabel.alpha = Math.PI / 2
    this.addSubView(this.stereotypeLabel)

    /** @member {NodeLabelView} */
    this.propertyLabel = new NodeLabelView()
    this.propertyLabel.distance = 10
    this.propertyLabel.alpha = Math.PI / 2
    this.addSubView(this.propertyLabel)

    /** @member {boolean} */
    this.showProperty = true

    /** @member {boolean} */
    this.showType = true
  }

  _calcPosition (canvas) {
    var midPointIndex = Math.floor(this.hostEdge.points.count() / 2)
    if (this.hostEdge.points.count() % 2 === 0) {
      midPointIndex--
    }

    var p1 = this.hostEdge.points.getPoint(midPointIndex)
    var p2 = this.hostEdge.points.getPoint(midPointIndex + 1)
    var tempP1 = p1.copy()
    var tempP2 = p2.copy()
    if ((this.hostEdge.points.count() % 2) === 0) {
      tempP1.x = Math.floor((tempP1.x + tempP2.x) / 2)
      tempP1.y = Math.floor((tempP1.y + tempP2.y) / 2)
    }

    // Calc Theta of Link
    var tempTh = getTheta(tempP1.x, tempP1.y, tempP2.x, tempP2.y)

    // Calc Head and Tail Points of Message
    var tempMiddleX = (tempP1.x + tempP2.x) / 2
    var tempMiddleY = (tempP1.y + tempP2.y) / 2
    var tempX = this.distance * Math.cos(tempTh + this.alpha)
    var tempY = this.distance * Math.sin(tempTh + this.alpha)

    tempMiddleX = tempMiddleX + tempX
    tempMiddleY = tempMiddleY - tempY

    tempX = 20 * Math.cos(tempTh)
    tempY = 20 * Math.sin(tempTh)

    tempMiddleX = this.left + Math.abs(tempX)
    tempMiddleY = this.top + Math.abs(tempY)

    var tempHPointX, tempHPointY, tempTPointX, tempTPointY

    if (this.model.source === this.hostEdge.tail.model) {
      // Forward Stimulus
      tempHPointX = tempMiddleX + tempX
      tempHPointY = tempMiddleY - tempY
      tempTPointX = tempMiddleX - tempX
      tempTPointY = tempMiddleY + tempY
    } else {
      // Reverse Stimulus
      tempTPointX = tempMiddleX + tempX
      tempTPointY = tempMiddleY - tempY
      tempHPointX = tempMiddleX - tempX
      tempHPointY = tempMiddleY + tempY
    }

    this.headPoint.x = Math.floor(tempHPointX)
    this.headPoint.y = Math.floor(tempHPointY)
    this.tailPoint.x = Math.floor(tempTPointX)
    this.tailPoint.y = Math.floor(tempTPointY)

    // Calc Arrow Points of Message
    var rt = new Rect(this.headPoint.x, this.headPoint.y, this.tailPoint.x, this.tailPoint.y)
    var a = rt.y2 - rt.y1
    var b = (rt.x2 - rt.x1 + 0.00001)
    var th = Math.atan(a / b)
    if (((a < 0) && (b < 0)) || ((a > 0) && (b < 0)) || ((a === 0) && (b < 0))) {
      th = th + Math.PI
    }
    var th1 = th - Math.PI / 8
    var th2 = th + Math.PI / 8
    this.arrowPoint1.x = Math.floor(12 * Math.cos(th1)) + rt.x1
    this.arrowPoint1.y = Math.floor(12 * Math.sin(th1)) + rt.y1
    this.arrowPoint2.x = Math.floor(12 * Math.cos(th2)) + rt.x1
    this.arrowPoint2.y = Math.floor(12 * Math.sin(th2)) + rt.y1

    // this.left = Math.min(this.headPoint.x, this.tailPoint.x)
    // this.top = Math.min(this.headPoint.y, this.tailPoint.y)
    // this.setRight(Math.max(this.headPoint.x, this.tailPoint.x))
    // this.setBottom(Math.max(this.headPoint.y, this.tailPoint.y))
    this.width = Math.max(this.headPoint.x, this.tailPoint.x) - Math.min(this.headPoint.x, this.tailPoint.x)
    this.height = Math.max(this.headPoint.y, this.tailPoint.y) - Math.min(this.headPoint.y, this.tailPoint.y)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      var options = {
        showSequenceNumber: this.getDiagram().showSequenceNumber,
        sequenceNumbering: this.getDiagram().sequenceNumbering,
        showSignature: this.getDiagram().showSignature,
        showType: this.showType
      }
      this.nameLabel.text = this.model.getString(options)
      // stereotype
      if (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE) {
        this.stereotypeLabel.text = '«create»'
      } else if (this.model.messageSort === UMLMessage.MS_DELETEMESSAGE) {
        this.stereotypeLabel.text = '«destroy»'
      } else if (hasValue(this.model.stereotype)) {
        this.stereotypeLabel.text = this.model.getStereotypeString()
      } else {
        this.stereotypeLabel.text = ''
      }
      // propertyLabel
      this.propertyLabel.text = this.model.getPropertyString()
      this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false)
      // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.nameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameLabel, 'model', this.model)
      }
      // stereotypeLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.stereotypeLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.stereotypeLabel, 'model', this.model)
      }
      // propertyLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.propertyLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.propertyLabel, 'model', this.model)
      }
    }
  }

  containsPoint (canvas, x, y) {
    var r = this.getBoundingBox(canvas)
    // Expand selectable area because it is difficult to select UMLCommMessageView when it is not diagonal.
    r.expand(10)
    return Coord.ptInRect(x, y, r)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var v = this.propertyLabel.visible
    this.nameLabel.visible = (this.nameLabel.text.length > 0)
    this.stereotypeLabel.visible = (this.stereotypeLabel.text.length > 0)
    this.propertyLabel.visible = (this.propertyLabel.text.length > 0)
    this._calcPosition(canvas)
    // this.width = Math.max(this.headPoint.x, this.tailPoint.x) - Math.min(this.headPoint.x, this.tailPoint.x)
    // this.height = Math.max(this.headPoint.y, this.tailPoint.y) - Math.min(this.headPoint.y, this.tailPoint.y)

    // Reassign distance of this.nameLabel, this.stereotypeLabel
    if (!v && this.propertyLabel.visible) {
      if (this.nameLabel.distance < 25) {
        if (this.stereotypeLabel.distance <= this.nameLabel.distance + 15) {
          this.stereotypeLabel.distance = this.stereotypeLabel.distance + 15
        }
        this.nameLabel.distance = this.nameLabel.distance + 15
      }
    }
    /*
    // Arrange this.nameLabel
    var p1 = this.tailPoint
    var p2 = this.headPoint
    var p = Coord.getPointAwayLine(p1, p2, this.nameLabel.alpha, this.nameLabel.distance)
    this.nameLabel.left = (p.x + p1.x) - (this.nameLabel.width / 2)
    this.nameLabel.top = (p.y + p1.y) - (this.nameLabel.height / 2)
    // Arrange this.stereotypeLabel
    p = Coord.getPointAwayLine(p1, p2, this.stereotypeLabel.alpha, this.stereotypeLabel.distance)
    this.stereotypeLabel.left = (p.x + p1.x) - (this.stereotypeLabel.width / 2)
    this.stereotypeLabel.top = (p.y + p1.y) - (this.stereotypeLabel.height / 2)
    // Arrange this.propertyLabel
    p = Coord.getPointAwayLine(p1, p2, this.propertyLabel.alpha, this.propertyLabel.distance)
    this.propertyLabel.left = (p.x + p1.x) - (this.propertyLabel.width / 2)
    this.propertyLabel.top = (p.y + p1.y) - (this.propertyLabel.height / 2)
    */
    // call Update here because Action's changed are not reflected
    this.update()
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    // message body
    if (this.model.messageSort === UMLMessage.MS_REPLY) {
      canvas.line(this.headPoint.x, this.headPoint.y, this.tailPoint.x, this.tailPoint.y, [3])
    } else {
      canvas.line(this.headPoint.x, this.headPoint.y, this.tailPoint.x, this.tailPoint.y)
    }
    // message head
    if ((this.model.messageSort === UMLMessage.MS_ASYNCHCALL) ||
        (this.model.messageSort === UMLMessage.MS_ASYNCHSIGNAL) ||
        (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE) ||
        (this.model.messageSort === UMLMessage.MS_REPLY)) {
      canvas.polyline([this.arrowPoint1, this.headPoint, this.arrowPoint2])
    } else {
      canvas.fillColor = this.lineColor
      canvas.fillPolygon([this.arrowPoint1, this.headPoint, this.arrowPoint2])
      canvas.fillColor = this.fillColor
    }
  }

  drawSelection (canvas) {
    GraphicUtils.drawHighlighter(canvas, this.tailPoint.x, this.tailPoint.y, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, true, GraphicUtils.HIGHLIGHTER_COLOR)
    GraphicUtils.drawHighlighter(canvas, this.headPoint.x, this.headPoint.y, GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE, true, GraphicUtils.HIGHLIGHTER_COLOR)
  }

  /**
     * Cannot be copied to clipboard.
     */
  canCopy () {
    return false
  }

  /**
     * Cannnot be deleted view only.
     */
  canDelete () {
    return false
  }
}

/**************************************************************************
 *                                                                        *
 *                           TIMING DIAGRAM VIEWS                         *
 *                                                                        *
 **************************************************************************/

/**
 * UMLTimingDiagram
 */
class UMLTimingDiagram extends UMLDiagram {
  canAcceptModel (model) {
    if (model instanceof type.Hyperlink || model instanceof type.Diagram) {
      return true
    } else if (model instanceof type.UMLLifeline) {
      return _.every(this.ownedViews, function (v) { return v.model !== model })
    } else if (model instanceof type.UMLAttribute) { // A role of collaboration
      return (model._parent === this._parent._parent)
    } else {
      return (model instanceof type.UMLClassifier)
    }
  }
}

/**
 * UMLTimingFrameView
 */
class UMLTimingFrameView extends UMLFrameView {
  constructor () {
    super()
    this._startX = 0
  }

  arrangeObject (canvas) {
    this._startX = 0
    this.containedViews.forEach(v => {
      if (v instanceof UMLTimingLifelineView) {
        v.containedViews.forEach(v2 => {
          if (v2 instanceof UMLTimingStateView) {
            v2.size(canvas)
            this._startX = Math.max(this._startX, v2.left + v2.nameLabel.minWidth + COMPARTMENT_RIGHT_PADDING)
          }
        })
      }
    })
    this._startX = Math.max(this.left, this._startX)
    super.arrangeObject(canvas)
    // arrange lifelines
    var vs = this.containedViews.filter(v => v instanceof UMLTimingLifelineView)
    vs.sort((a, b) => a.top - b.top)
    let y = this.frameTypeLabel.bottom + COMPARTMENT_BOTTOM_PADDING
    for (let i = 0; i < vs.length; i++) {
      let v = vs[i]
      v.top = y
      y += v.height
    }
    // arrange time ticks
    var ticks = this.containedViews.filter(v => v instanceof UMLTimeTickView)
    ticks.sort((a, b) => a.left - b.left)
    let tickX = this._startX
    let tickY = this.bottom - 5
    for (let i = 0; i < ticks.length; i++) {
      let v = ticks[i]
      v.left = tickX
      v.top = tickY
      tickX += v.width
    }
  }

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLTimingLifelineView')
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }
}

/**
 * UMLTimingStateView
 */
class UMLTimingStateView extends NodeView {
  constructor () {
    super()
    this.movable = NodeView.MM_VERT
    this.sizable = NodeView.SZ_NONE

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)
  }

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLTimeSegmentView')
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minHeight = Math.max(this.nameLabel.minHeight, TIMING_STATE_MINHEIGHT)
    this.sizeConstraints()
    this.nameLabel.height = this.height
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left
    this.nameLabel.top = this.top
    this.nameLabel.horizontalAlignment = Canvas.AL_RIGHT
    var vs = this.containedViews.slice()
    for (let i = 0; i < vs.length; i++) {
      let v = vs[i]
      v.top = Math.round(this.top + (this.height / 2)) - Math.floor(v.height / 2)
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
  }

  update (canvas) {
    super.update(canvas)
    this.nameLabel.text = this.model.name
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }
}

/**
 * UMLTimingLifelineView
 */
class UMLTimingLifelineView extends NodeView {
  constructor () {
    super()
    this.movable = NodeView.MM_VERT
    this._segments = []

    /** @member {boolean} */
    this.showType = true

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.verticalAlignment = Canvas.AL_TOP
    this.nameLabel.selectable = View.SK_NO
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.getString(this)
      this.nameLabel.font.style = Font.FS_BOLD
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    const nw = COMPARTMENT_TOP_PADDING + this.nameLabel.minWidth + COMPARTMENT_BOTTOM_PADDING
    const nh = COMPARTMENT_TOP_PADDING + this.nameLabel.minHeight + COMPARTMENT_BOTTOM_PADDING
    let sw = 0
    let sh = 0
    this.containedViews.forEach(v => {
      if (v instanceof UMLTimingStateView) {
        sh += v.minHeight
        sw = Math.max(sw, v.minWidth)
      }
    })
    this.minWidth = nw + sw
    this.minHeight = Math.max(nh, TIMING_LIFELINE_TOP_PADDING + sh + TIMING_LIFELINE_BOTTOM_PADDING)
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    var frame = this.containerView
    this.left = frame.left
    this.width = frame.width
    this.nameLabel.direction = LabelView.DK_VERT
    this.nameLabel.width = this.nameLabel.minWidth
    this.nameLabel.height = this.nameLabel.minHeight
    this.nameLabel.left = this.left + (COMPARTMENT_TOP_PADDING * 2)
    this.nameLabel.top = this.top
    this.nameLabel.setBottom(this.getBottom())
    // state/condtions
    var vs = this.containedViews.slice()
    vs.sort((a, b) => a.top - b.top)
    let y = this.top + TIMING_LIFELINE_TOP_PADDING
    for (let i = 0; i < vs.length; i++) {
      let v = vs[i]
      v.left = this.nameLabel.right + (COMPARTMENT_BOTTOM_PADDING * 2)
      v.top = y
      v.setRight(this.right)
      v.nameLabel.setRight(frame._startX - COMPARTMENT_RIGHT_PADDING)
      y += v.height
    }
    // time segments
    this._segments = []
    this.containedViews.forEach(s => s.containedViews.forEach(v => {
      if (v instanceof UMLTimeSegmentView) this._segments.push(v)
    }))
    this._segments.sort((a, b) => a.left - b.left)
    let x = frame._startX
    for (let i = 0; i < this._segments.length; i++) {
      let v = this._segments[i]
      v.left = x
      v._prev = (i === 0 ? null : this._segments[i - 1])
      x += v.width
    }
  }

  drawShadow (canvas) {}

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.line(this.left, this.bottom, this.right, this.bottom)
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }
}

/**
 * UMLTimeSegmentView
 */
class UMLTimeSegmentView extends NodeView {
  constructor () {
    super()
    this.movable = NodeView.MM_FREE
    this.sizable = NodeView.SZ_HORZ
    this.containerChangeable = true

    // Temporal reference to previous time segment
    this._prev = null
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minHeight = TIME_SEGMENT_HEIGHT
    this.minWidth = 8
    this.height = TIME_SEGMENT_HEIGHT
    this.sizeConstraints()
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    const m = Math.floor(TIME_SEGMENT_HEIGHT / 2)
    const c = this.top + m
    canvas.line(this.left, c, this.right + 1, c)
    if (this._prev) {
      canvas.line(this.left, c, this.left, this._prev.top + m)
    }
  }

  changeContainerViewOperation (view, containerView, operationBuilder) {
    operationBuilder.fieldAssign(view.model, 'invariant', containerView.model)
    if (containerView.containerView && view.containerView.containerView !== containerView.containerView) {
      operationBuilder.fieldAssign(view.model, 'covered', containerView.containerView.model)
    }
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }
}

/**
 * UMLTimeTickView
 */
class UMLTimeTickView extends NodeView {
  constructor () {
    super()
    this.movable = NodeView.MM_HORZ
    this.sizable = NodeView.SZ_HORZ

    /** @member {string} */
    this.text = ''
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minHeight = 9
    this.minWidth = 9
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    this.height = 11
    super.arrangeObject(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.line(this.left, this.top, this.left, this.bottom)
    var r = new Rect(this.left, this.bottom + 10, this.left, this.bottom + 10)
    canvas.textOut2(r, this.text, Canvas.AL_CENTER, Canvas.AL_TOP, false, false)
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }
}

/**
 * UMLTimingMessageView
 */
class UMLTimingMessageView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_SOLID_ARROW
  }

  arrangeObject (canvas) {
    // super.arrangeObject(canvas)
    this.lineStyle = EdgeView.LS_DIRECT
    let tp = this.points.points[0]
    let hp = this.points.points[1]
    tp.y = Math.round(this.tail.top + (this.tail.height / 2))
    hp.y = Math.round(this.head.top + (this.head.height / 2))
    // Magnetic to edges of time segment
    if (Math.abs(tp.x - this.tail.left) <= 10) tp.x = this.tail.left
    if (Math.abs(tp.x - this.tail.right) <= 10) tp.x = this.tail.right
    if (Math.abs(hp.x - this.head.left) <= 10) hp.x = this.head.left
    if (Math.abs(hp.x - this.head.right) <= 10) hp.x = this.head.right
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      var options = {
        showSequenceNumber: this.getDiagram().showSequenceNumber,
        sequenceNumbering: this.getDiagram().sequenceNumbering,
        showSignature: this.getDiagram().showSignature,
        showType: this.showType
      }
      this.nameLabel.text = this.model.getString(options)
      this.nameLabel.visible = (this.nameLabel.text.length > 0)
      this.stereotypeLabel.visible = (this.stereotypeLabel.text.length > 0)
      // line style
      if ((this.model.messageSort === UMLMessage.MS_REPLY) || (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE)) {
        this.lineMode = EdgeView.LM_DOT
      } else {
        this.lineMode = EdgeView.LM_SOLID
      }
      // head end style
      if ((this.model.messageSort === UMLMessage.MS_ASYNCHCALL) ||
          (this.model.messageSort === UMLMessage.MS_ASYNCHSIGNAL) ||
          (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE) ||
          (this.model.messageSort === UMLMessage.MS_REPLY)) {
        this.headEndStyle = EdgeView.ES_STICK_ARROW
      } else {
        this.headEndStyle = EdgeView.ES_SOLID_ARROW
      }
      // stereotype
      if (this.model.messageSort === UMLMessage.MS_CREATEMESSAGE) {
        this.stereotypeLabel.text = '«create»'
      } else if (this.model.messageSort === UMLMessage.MS_DELETEMESSAGE) {
        this.stereotypeLabel.text = '«destroy»'
      } else if (hasValue(this.model.stereotype)) {
        this.stereotypeLabel.text = this.model.getStereotypeString()
      } else {
        this.stereotypeLabel.text = ''
      }
      // propertyLabel
      this.propertyLabel.text = this.model.getPropertyString()
      this.propertyLabel.visible = (this.showProperty ? this.propertyLabel.text.length > 0 : false)
    }
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }

  /** Determine where it can be connected to */
  canConnectTo (view, isTail) {
    return (view instanceof type.UMLTimeSegmentView)
  }
}

/**************************************************************************
 *                                                                        *
 *                   INTERACTION OVERVIEW DIAGRAM VIEWS                   *
 *                                                                        *
 **************************************************************************/

/**
 * UMLInteractionOverviewDiagram
 */
class UMLInteractionOverviewDiagram extends UMLDiagram {
  canAcceptModel (model) {
    if (model instanceof type.Hyperlink || model instanceof type.Diagram) {
      return true
    } else {
      return (model instanceof type.UMLInteractionUse || model instanceof type.UMLInteraction)
    }
  }
}

/**
 * UMLInteractionInlineView
 */
class UMLInteractionInlineView extends UMLFrameView {
  update (canvas) {
    let model = this.model
    this.model = model instanceof UMLAction ? model.target : model
    super.update(canvas)
    this.model = model
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    let dgm = this.model.target
    if (dgm instanceof UMLSequenceDiagram) {
      let ox = canvas.origin.x
      let oy = canvas.origin.y
      let zn = canvas.zoomFactor.numer
      let zd = canvas.zoomFactor.denom
      let box = dgm.getBoundingBox()
      let rw = (this.width - 20) / box.getWidth()
      let rh = (this.height - 40) / box.getHeight()
      let r = Math.min(rw, rh, 1)
      // (px, py) is the position to draw diagram with reflect of zoom factor
      let px = ((ox + this.left + 10 - (box.x1 * r)) * zn) / zd
      let py = ((oy + this.top + 30 - (box.y1 * r)) * zn) / zd
      // (ratedX, rateY) is the position with reflect of diagram ratio (r)
      let ratedX = (px * zd) / (zn * r)
      let ratedY = (py * zd) / (zn * r)
      canvas.origin.x = ratedX
      canvas.origin.y = ratedY
      canvas.zoomFactor.numer = zn * r
      canvas.zoomFactor.denom = zd
      dgm.arrangeDiagram(canvas)
      dgm.drawDiagram(canvas, false)
      canvas.origin.x = ox
      canvas.origin.y = oy
      canvas.zoomFactor.numer = zn
      canvas.zoomFactor.denom = zd
    }
  }

  /** Cannot be copied to clipboard. */
  canCopy () {
    return false
  }

  /** Cannnot be deleted view only. */
  canDelete () {
    return false
  }
}

/**************************************************************************
 *                                                                        *
 *                     INFORMATION FLOW DIAGRAM VIEWS                     *
 *                                                                        *
 **************************************************************************/

/**
 * UMLInformationFlowDiagram
 */
class UMLInformationFlowDiagram extends UMLDiagram {
  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLPackage) ||
      (model instanceof type.UMLClassifier) ||
      (model instanceof type.UMLInstance) ||
      (model instanceof type.UMLPort) ||
      (model instanceof type.UMLTemplateParameter) ||
      (model instanceof type.UMLAttribute) ||
      (model instanceof type.UMLOperation) ||
      (model instanceof type.UMLReception) ||
      (model instanceof type.UMLEnumerationLiteral) ||
      (model instanceof type.UMLSlot) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLInterfaceRealization) ||
      (model instanceof type.UMLComponentRealization) ||
      (model instanceof type.UMLAssociation) ||
      (model instanceof type.UMLLink) ||
      (model instanceof type.UMLConnector) ||
      (model instanceof type.UMLInformationFlow)
  }
}

/**
 * UMLInformationItemView
 */
class UMLInformationItemView extends UMLClassifierView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.class.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getStereotypeLabelText () {
    return '«information»'
  }
}

/**
 * UMLInformationFlowView
 */
class UMLInformationFlowView extends UMLGeneralEdgeView {
  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_STICK_ARROW
    this.lineMode = EdgeView.LM_DOT
  }

  update (canvas) {
    super.update(canvas)
    if (this.model.conveyed && this.model.conveyed.length > 0) {
      this.nameLabel.text = this.model.getConveyedString()
      this.nameLabel.visible = true
    }
    this.stereotypeLabel.visible = true
    this.stereotypeLabel.text = '«flow»'
  }
}

/**************************************************************************
 *                                                                        *
 *                          PROFILE DIAGRAM VIEWS                         *
 *                                                                        *
 **************************************************************************/

/**
 * UMLProfileDiagram
 */
class UMLProfileDiagram extends UMLDiagram {

  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.UMLConstraint) ||
      (model instanceof type.UMLMetaClass) ||
      (model instanceof type.UMLStereotype) ||
      (model instanceof type.UMLEnumeration) ||
      (model instanceof type.UMLGeneralization) ||
      (model instanceof type.UMLDependency) ||
      (model instanceof type.UMLInterfaceRealization) ||
      (model instanceof type.UMLComponentRealization) ||
      (model instanceof type.UMLAssociation)
  }
}

/**
 * UMLProfileView
 */
class UMLProfileView extends UMLPackageView {

  getStereotypeLabelText () {
    return '«profile»'
  }
}

/**
 * UMLMetaClassView
 */
class UMLMetaClassView extends UMLGeneralNodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.metaclass.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getStereotypeLabelText () {
    return '«metaClass»'
  }
}

/**
 * UMLStereotypeView
 */
class UMLStereotypeView extends UMLClassView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.stereotype.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  getStereotypeLabelText () {
    return '«stereotype»'
  }
}

/**
 * UMLExtensionView
 */
class UMLExtensionView extends UMLGeneralEdgeView {

  constructor () {
    super()
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_SOLID_ARROW
    this.lineMode = EdgeView.LM_SOLID
  }

  canConnectTo (view, isTail) {
    return (isTail && view.model instanceof type.UMLStereotype) ||
      (!isTail && view.model instanceof type.UMLMetaClass)
  }
}

/**************************************************************************
 *                                                                        *
 *                            ANNOTATION VIEWS                            *
 *                                                                        *
 **************************************************************************/

/**
 * HyperlinkView
 */
class HyperlinkView extends NodeView {

  constructor () {
    super()

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)

    /** @member {LabelView} */
    this.typeLabel = new LabelView()
    this.typeLabel.parentStyle = true
    this.addSubView(this.typeLabel)
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    var h = this.typeLabel.minHeight + COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING
    this.minHeight = Math.max(h, HYPERLINK_MINHEIGHT)
    var w = this.typeLabel.width + this.nameLabel.width + (COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING) * 2
    this.minWidth = Math.max(w, HYPERLINK_MINWIDTH)
    this.sizeConstraints()
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.typeLabel.left = this.left + COMPARTMENT_LEFT_PADDING
    this.typeLabel.top = this.top + COMPARTMENT_TOP_PADDING
    this.typeLabel.setRight(this.typeLabel.left + this.typeLabel.minWidth)
    this.nameLabel.top = this.top + COMPARTMENT_TOP_PADDING
    this.nameLabel.left = this.typeLabel.getRight() + COMPARTMENT_RIGHT_PADDING + COMPARTMENT_LEFT_PADDING
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    var x = this.typeLabel.getRight() + COMPARTMENT_RIGHT_PADDING
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.line(x, this.top, x, this.getBottom())
  }

  update (canvas) {
    super.update(canvas)
    this.typeLabel.font.style = Font.FS_BOLD
    this.typeLabel.text = 'link'
    if (this.model && this.model.reference instanceof type.Model) {
      this.nameLabel.text = this.model.reference.name
    } else {
      this.nameLabel.text = this.model.url
    }
  }
}

/**
 * UMLCustomTextView
 */
class UMLCustomTextView extends NodeView {

  constructor () {
    super()

    /** @member {string} */
    this.text = ''

    /** @member {boolean} */
    this.wordWrap = true

    /** @member {number} */
    this.horzAlign = Canvas.AL_LEFT

    /** @member {number} */
    this.vertAlign = Canvas.AL_TOP

    /* transient */
    this._rightPadding = 0
  }

  sizeObject (canvas) {
    var marg, minW, minH, w, h
    var lines = null
    if (this.text && this.text.length > 0) {
      lines = this.text.split('\n')
    }
    w = 0
    h = 0
    if (lines !== null && lines.length > 0) {
      for (var i = 0, len = lines.length; i < len; i++) {
        if (this.wordWrap) {
          marg = COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING + this._rightPadding
          minW = canvas.textExtent(lines[i], 1).x
          minH = canvas.textExtent(lines[i], this.width - marg).y
          w = Math.max(w, minW)
          h = h + minH + 2
        } else {
          var sz = canvas.textExtent(lines[i])
          w = Math.max(w, sz.x)
          h = h + canvas.textExtent('^_').y + 2
        }
      }
    }
    w += COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING + this._rightPadding
    h += COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING
    this.minWidth = Math.max(CUSTOM_TEXT_MINWIDTH, w)
    this.minHeight = Math.max(CUSTOM_TEXT_MINHEIGHT, h)
    super.sizeObject(canvas)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.text && this.text.length > 0) {
      var lines = this.text.split('\n')
      var x1 = this.left + COMPARTMENT_LEFT_PADDING
      var x2 = this.getRight() - COMPARTMENT_RIGHT_PADDING
      // var _h = canvas.textExtent('^_').y * lines.length
      var _h = this.minHeight - COMPARTMENT_TOP_PADDING - COMPARTMENT_BOTTOM_PADDING
      var y = 0
      switch (this.vertAlign) {
      case Canvas.AL_TOP:
        y = this.top + COMPARTMENT_TOP_PADDING
        break
      case Canvas.AL_MIDDLE:
        y = this.top + Math.round((this.height - _h) / 2)
        break
      case Canvas.AL_BOTTOM:
        y = this.getBottom() - COMPARTMENT_BOTTOM_PADDING - _h
        break
      }
      for (var i = 0, len = lines.length; i < len; i++) {
        var sz = canvas.textExtent(lines[i], this.width - 1)
        var r = new Rect(x1, y, x2, y + sz.y + 2)
        canvas.textOut2(r, lines[i], this.horzAlign, Canvas.AL_TOP, false, this.wordWrap)
        y = y + sz.y + 2
      }
    }
  }
}

/**
 * UMLTextView
 */
class UMLTextView extends UMLCustomTextView {}

/**
 * UMLTextBoxView
 */
class UMLTextBoxView extends UMLCustomTextView {
  drawObject (canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    super.drawObject(canvas)
  }
}

/**
 * UMLCustomNoteView
 */
class UMLCustomNoteView extends UMLCustomTextView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('uml.note.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this._rightPadding = NOTE_FOLDING_SIZE
  }

  drawObject (canvas) {
    var r = this.getRight() - 1
    var b = this.getBottom() - 1
    var pts = [
      new Point(this.left, this.top),
      new Point(r - NOTE_FOLDING_SIZE, this.top),
      new Point(r, this.top + NOTE_FOLDING_SIZE),
      new Point(r, b),
      new Point(this.left, b),
      new Point(this.left, this.top)
    ]
    canvas.fillPolygon(pts)
    canvas.polygon(pts)
    canvas.polygon([
      new Point(r - NOTE_FOLDING_SIZE, this.top),
      new Point(r - NOTE_FOLDING_SIZE, this.top + NOTE_FOLDING_SIZE),
      new Point(r, this.top + NOTE_FOLDING_SIZE)
    ])
    super.drawObject(canvas)
  }
}

/**
 * UMLNoteView
 */
class UMLNoteView extends UMLCustomNoteView {}

/**
 * UMLConstraintView
 */
class UMLConstraintView extends UMLCustomNoteView {

  update (canvas) {
    if (typeof this.model.specification === 'string') {
      this.text = '{' + this.model.specification + '}'
      var parentField = this.model.getParentField()
      switch (parentField) {
      case 'preconditions':
        this.text = '«precondition»\n' + this.text
        break
      case 'postconditions':
        this.text = '«postcondition»\n' + this.text
        break
      case 'bodyConditions':
        this.text = '«bodyCondition»\n' + this.text
        break
      case 'localPreconditions':
        this.text = '«localPrecondition»\n' + this.text
        break
      case 'localPostconditions':
        this.text = '«localPostcondition»\n' + this.text
        break
      }
      if (this.model.stereotype) {
        this.text = this.model.getStereotypeString() + '\n' + this.text
      }
    }
  }
}

/**
 * UMLNoteLinkView
 */
class UMLNoteLinkView extends EdgeView {

  constructor () {
    super()
    this.lineMode = EdgeView.LM_DOT
  }
}

/**
 * UMLConstraintLinkView
 */
class UMLConstraintLinkView extends EdgeView {

  constructor () {
    super()
    this.lineMode = EdgeView.LM_DOT
  }
}

/**
 * ShapeView
 */
class ShapeView extends NodeView {}

/**
 * RectangleView
 */
class RectangleView extends ShapeView {
  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
  }
}

/**
 * RoundRectView
 */
class RoundRectView extends ShapeView {
  drawObject (canvas) {
    super.drawObject(canvas)
    var r = Math.max(this.width, this.height)
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), r / 6)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), r / 6)
  }
}

/**
 * EllipseView
 */
class EllipseView extends ShapeView {
  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
    canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
  }
}

/**
 * ImageView
 */
class ImageView extends NodeView {
  constructor () {
    super()
    this.__img = new Image()
    this.__state = 0 // 0 = not loaded, 1 = loading, 2 = loaded
    this.imageWidth = 0
    this.imageHeight = 0
    this.imageData = ''
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.__state === 2) { // loaded
      canvas.drawImage(this.__img, this.left, this.top, this.width, this.height)
    } else if (this.__state === 0) {
      this.__state = 1
      this.__img.src = this.imageData
      this.__img.onload = () => {
        this.__state = 2
        canvas.drawImage(this.__img, this.left, this.top, this.width, this.height)
      }
    }
    if (this.imageData.length === 0) {
      canvas.line(this.left, this.top, this.getRight(), this.getBottom())
      canvas.line(this.getRight(), this.top, this.left, this.getBottom())
      canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    }
  }
}

/* ************************** Type definitions ***************************/

// Backbone
type.UMLModelElement = UMLModelElement
type.UMLFeature = UMLFeature
type.UMLStructuralFeature = UMLStructuralFeature
type.UMLParameter = UMLParameter
type.UMLBehavioralFeature = UMLBehavioralFeature
type.UMLAttribute = UMLAttribute
type.UMLOperation = UMLOperation
type.UMLReception = UMLReception
type.UMLClassifier = UMLClassifier
type.UMLTemplateParameter = UMLTemplateParameter
type.UMLDirectedRelationship = UMLDirectedRelationship
type.UMLRelationshipEnd = UMLRelationshipEnd
type.UMLUndirectedRelationship = UMLUndirectedRelationship
// Constraints
type.UMLConstraint = UMLConstraint
type.UMLIntervalConstraint = UMLIntervalConstraint
type.UMLTimeConstraint = UMLTimeConstraint
type.UMLDurationConstraint = UMLDurationConstraint
// Common Behaviors
type.UMLBehavior = UMLBehavior
type.UMLOpaqueBehavior = UMLOpaqueBehavior
type.UMLEvent = UMLEvent
// Classes
type.UMLPackage = UMLPackage
type.UMLModel = UMLModel
type.UMLClass = UMLClass
type.UMLInterface = UMLInterface
type.UMLSignal = UMLSignal
type.UMLDataType = UMLDataType
type.UMLPrimitiveType = UMLPrimitiveType
type.UMLEnumerationLiteral = UMLEnumerationLiteral
type.UMLEnumeration = UMLEnumeration
type.UMLDependency = UMLDependency
type.UMLAbstraction = UMLAbstraction
type.UMLRealization = UMLRealization
type.UMLGeneralization = UMLGeneralization
type.UMLInterfaceRealization = UMLInterfaceRealization
type.UMLAssociationEnd = UMLAssociationEnd
type.UMLAssociation = UMLAssociation
type.UMLAssociationClassLink = UMLAssociationClassLink
type.UMLNaryAssociationNode = UMLNaryAssociationNode
type.UMLTemplateBinding = UMLTemplateBinding
type.UMLTemplateParameterSubstitution = UMLTemplateParameterSubstitution
// Instances
type.UMLSlot = UMLSlot
type.UMLInstance = UMLInstance
type.UMLObject = UMLObject
type.UMLArtifactInstance = UMLArtifactInstance
type.UMLComponentInstance = UMLComponentInstance
type.UMLNodeInstance = UMLNodeInstance
type.UMLLinkEnd = UMLLinkEnd
type.UMLLink = UMLLink
type.UMLLinkObjectLink = UMLLinkObjectLink
// Composite Structures
type.UMLPort = UMLPort
type.UMLConnectorEnd = UMLConnectorEnd
type.UMLConnector = UMLConnector
type.UMLCollaboration = UMLCollaboration
type.UMLCollaborationUse = UMLCollaborationUse
type.UMLRoleBinding = UMLRoleBinding
// Components
type.UMLArtifact = UMLArtifact
type.UMLComponent = UMLComponent
type.UMLSubsystem = UMLSubsystem
type.UMLComponentRealization = UMLComponentRealization
// Deployments
type.UMLNode = UMLNode
type.UMLDeployment = UMLDeployment
type.UMLCommunicationPath = UMLCommunicationPath
// Use Cases
type.UMLExtensionPoint = UMLExtensionPoint
type.UMLUseCase = UMLUseCase
type.UMLActor = UMLActor
type.UMLInclude = UMLInclude
type.UMLExtend = UMLExtend
type.UMLUseCaseSubject = UMLUseCaseSubject
// State Machines
type.UMLStateMachine = UMLStateMachine
type.UMLRegion = UMLRegion
type.UMLVertex = UMLVertex
type.UMLConnectionPointReference = UMLConnectionPointReference
type.UMLPseudostate = UMLPseudostate
type.UMLState = UMLState
type.UMLFinalState = UMLFinalState
type.UMLTransition = UMLTransition
// Activity Graphs
type.UMLActivity = UMLActivity
type.UMLPin = UMLPin
type.UMLInputPin = UMLInputPin
type.UMLOutputPin = UMLOutputPin
type.UMLExpansionNode = UMLExpansionNode
type.UMLActivityNode = UMLActivityNode
type.UMLAction = UMLAction
type.UMLObjectNode = UMLObjectNode
type.UMLCentralBufferNode = UMLCentralBufferNode
type.UMLDataStoreNode = UMLDataStoreNode
type.UMLControlNode = UMLControlNode
type.UMLInitialNode = UMLInitialNode
type.UMLFinalNode = UMLFinalNode
type.UMLActivityFinalNode = UMLActivityFinalNode
type.UMLFlowFinalNode = UMLFlowFinalNode
type.UMLForkNode = UMLForkNode
type.UMLJoinNode = UMLJoinNode
type.UMLMergeNode = UMLMergeNode
type.UMLDecisionNode = UMLDecisionNode
type.UMLActivityGroup = UMLActivityGroup
type.UMLActivityPartition = UMLActivityPartition
type.UMLInterruptibleActivityRegion = UMLInterruptibleActivityRegion
type.UMLStructuredActivityNode = UMLStructuredActivityNode
type.UMLExpansionRegion = UMLExpansionRegion
type.UMLExceptionHandler = UMLExceptionHandler
type.UMLActivityEdge = UMLActivityEdge
type.UMLControlFlow = UMLControlFlow
type.UMLObjectFlow = UMLObjectFlow
type.UMLActivityInterrupt = UMLActivityInterrupt
type.UMLActivityEdgeConnector = UMLActivityEdgeConnector
// Interactions
type.UMLInteractionFragment = UMLInteractionFragment
type.UMLInteraction = UMLInteraction
type.UMLStateInvariant = UMLStateInvariant
type.UMLContinuation = UMLContinuation
type.UMLInteractionOperand = UMLInteractionOperand
type.UMLCombinedFragment = UMLCombinedFragment
type.UMLInteractionUse = UMLInteractionUse
type.UMLMessageEndpoint = UMLMessageEndpoint
type.UMLLifeline = UMLLifeline
type.UMLGate = UMLGate
type.UMLEndpoint = UMLEndpoint
type.UMLMessage = UMLMessage
// Information Flows
type.UMLInformationItem = UMLInformationItem
type.UMLInformationFlow = UMLInformationFlow
// Profiles
type.UMLProfile = UMLProfile
type.UMLImage = UMLImage
type.UMLStereotype = UMLStereotype
type.UMLMetaClass = UMLMetaClass
type.UMLExtension = UMLExtension

// Common Views
type.UMLDiagram = UMLDiagram
type.UMLCompartmentView = UMLCompartmentView
type.UMLNameCompartmentView = UMLNameCompartmentView
type.UMLListCompartmentView = UMLListCompartmentView
type.UMLAttributeView = UMLAttributeView
type.UMLAttributeCompartmentView = UMLAttributeCompartmentView
type.UMLOperationView = UMLOperationView
type.UMLOperationCompartmentView = UMLOperationCompartmentView
type.UMLReceptionView = UMLReceptionView
type.UMLReceptionCompartmentView = UMLReceptionCompartmentView
type.UMLTemplateParameterView = UMLTemplateParameterView
type.UMLTemplateParameterCompartmentView = UMLTemplateParameterCompartmentView
type.UMLGeneralNodeView = UMLGeneralNodeView
type.UMLFloatingNodeView = UMLFloatingNodeView
type.UMLGeneralEdgeView = UMLGeneralEdgeView
type.UMLClassifierView = UMLClassifierView
type.UMLUndirectedRelationshipView = UMLUndirectedRelationshipView
// Class Diagram Views
type.UMLClassDiagram = UMLClassDiagram
type.UMLClassView = UMLClassView
type.UMLInterfaceView = UMLInterfaceView
type.UMLSignalView = UMLSignalView
type.UMLDataTypeView = UMLDataTypeView
type.UMLPrimitiveTypeView = UMLPrimitiveTypeView
type.UMLEnumerationLiteralView = UMLEnumerationLiteralView
type.UMLEnumerationLiteralCompartmentView = UMLEnumerationLiteralCompartmentView
type.UMLEnumerationView = UMLEnumerationView
type.UMLGeneralizationView = UMLGeneralizationView
type.UMLDependencyView = UMLDependencyView
type.UMLRealizationView = UMLRealizationView
type.UMLInterfaceRealizationView = UMLInterfaceRealizationView
type.UMLQualifierCompartmentView = UMLQualifierCompartmentView
type.UMLAssociationView = UMLAssociationView
type.UMLAssociationClassLinkView = UMLAssociationClassLinkView
type.UMLNaryAssociationNodeView = UMLNaryAssociationNodeView
type.UMLTemplateBindingView = UMLTemplateBindingView
// Package Diagram Views
type.UMLPackageDiagram = UMLPackageDiagram
type.UMLPackageView = UMLPackageView
type.UMLModelView = UMLModelView
type.UMLSubsystemView = UMLSubsystemView
type.UMLContainmentView = UMLContainmentView
// Composite Structure Diagram Views
type.UMLCompositeStructureDiagram = UMLCompositeStructureDiagram
type.UMLPortView = UMLPortView
type.UMLPartView = UMLPartView
type.UMLConnectorView = UMLConnectorView
type.UMLCollaborationView = UMLCollaborationView
type.UMLCollaborationUseView = UMLCollaborationUseView
type.UMLRoleBindingView = UMLRoleBindingView
// Object Diagram Views
type.UMLObjectDiagram = UMLObjectDiagram
type.UMLSlotView = UMLSlotView
type.UMLSlotCompartmentView = UMLSlotCompartmentView
type.UMLObjectView = UMLObjectView
type.UMLLinkView = UMLLinkView
type.UMLLinkObjectLinkView = UMLLinkObjectLinkView
// Component Diagram Views
type.UMLComponentDiagram = UMLComponentDiagram
type.UMLArtifactView = UMLArtifactView
type.UMLArtifactInstanceView = UMLArtifactInstanceView
type.UMLComponentView = UMLComponentView
type.UMLComponentInstanceView = UMLComponentInstanceView
type.UMLComponentRealizationView = UMLComponentRealizationView
// Deployment Diagram Views
type.UMLDeploymentDiagram = UMLDeploymentDiagram
type.UMLNodeView = UMLNodeView
type.UMLNodeInstanceView = UMLNodeInstanceView
type.UMLDeploymentView = UMLDeploymentView
type.UMLCommunicationPathView = UMLCommunicationPathView
// Use Case Diagram Views
type.UMLUseCaseDiagram = UMLUseCaseDiagram
type.UMLExtensionPointView = UMLExtensionPointView
type.UMLExtensionPointCompartmentView = UMLExtensionPointCompartmentView
type.UMLUseCaseView = UMLUseCaseView
type.UMLActorView = UMLActorView
type.UMLIncludeView = UMLIncludeView
type.UMLExtendView = UMLExtendView
type.UMLUseCaseSubjectView = UMLUseCaseSubjectView
// Statechart Diagram Views
type.UMLStatechartDiagram = UMLStatechartDiagram
type.UMLPseudostateView = UMLPseudostateView
type.UMLFinalStateView = UMLFinalStateView
type.UMLConnectionPointReferenceView = UMLConnectionPointReferenceView
type.UMLInternalActivityView = UMLInternalActivityView
type.UMLInternalActivityCompartmentView = UMLInternalActivityCompartmentView
type.UMLInternalTransitionView = UMLInternalTransitionView
type.UMLInternalTransitionCompartmentView = UMLInternalTransitionCompartmentView
type.UMLRegionView = UMLRegionView
type.UMLDecompositionCompartmentView = UMLDecompositionCompartmentView
type.UMLStateView = UMLStateView
type.UMLTransitionView = UMLTransitionView
// Activity Diagram Views
type.UMLActivityDiagram = UMLActivityDiagram
type.UMLPinView = UMLPinView
type.UMLInputPinView = UMLInputPinView
type.UMLOutputPinView = UMLOutputPinView
type.UMLExpansionNodeView = UMLExpansionNodeView
type.UMLActionView = UMLActionView
type.UMLObjectNodeView = UMLObjectNodeView
type.UMLCentralBufferNodeView = UMLCentralBufferNodeView
type.UMLDataStoreNodeView = UMLDataStoreNodeView
type.UMLControlNodeView = UMLControlNodeView
type.UMLControlFlowView = UMLControlFlowView
type.UMLObjectFlowView = UMLObjectFlowView
type.UMLZigZagAdornmentView = UMLZigZagAdornmentView
type.UMLExceptionHandlerView = UMLExceptionHandlerView
type.UMLActivityInterruptView = UMLActivityInterruptView
type.UMLSwimlaneView = UMLSwimlaneView
type.UMLInterruptibleActivityRegionView = UMLInterruptibleActivityRegionView
type.UMLActivityEdgeConnectorView = UMLActivityEdgeConnectorView
type.UMLStructuredActivityNodeView = UMLStructuredActivityNodeView
type.UMLExpansionRegionView = UMLExpansionRegionView
// Sequence Diagram Views
type.UMLSequenceDiagram = UMLSequenceDiagram
type.UMLLinePartView = UMLLinePartView
type.UMLSeqLifelineView = UMLSeqLifelineView
type.UMLMessageEndpointView = UMLMessageEndpointView
type.UMLEndpointView = UMLEndpointView
type.UMLGateView = UMLGateView
type.UMLActivationView = UMLActivationView
type.UMLSeqMessageView = UMLSeqMessageView
type.UMLStateInvariantView = UMLStateInvariantView
type.UMLContinuationView = UMLContinuationView
type.UMLCustomFrameView = UMLCustomFrameView
type.UMLFrameView = UMLFrameView
type.UMLInteractionOperandView = UMLInteractionOperandView
type.UMLInteractionOperandCompartmentView = UMLInteractionOperandCompartmentView
type.UMLCombinedFragmentView = UMLCombinedFragmentView
type.UMLInteractionUseView = UMLInteractionUseView
type.UMLTimeConstraintView = UMLTimeConstraintView
type.UMLTimeConstraintLinkView = UMLTimeConstraintLinkView
type.UMLDurationConstraintView = UMLDurationConstraintView
// Communication Diagram Views
type.UMLCommunicationDiagram = UMLCommunicationDiagram
type.UMLCommLifelineView = UMLCommLifelineView
type.UMLCommMessageView = UMLCommMessageView
// Timing Diagram Views
type.UMLTimingDiagram = UMLTimingDiagram
type.UMLTimingFrameView = UMLTimingFrameView
type.UMLTimingStateView = UMLTimingStateView
type.UMLTimingLifelineView = UMLTimingLifelineView
type.UMLTimeSegmentView = UMLTimeSegmentView
type.UMLTimeTickView = UMLTimeTickView
type.UMLTimingMessageView = UMLTimingMessageView
// Interaction Overview Diagram
type.UMLInteractionOverviewDiagram = UMLInteractionOverviewDiagram
type.UMLInteractionInlineView = UMLInteractionInlineView
// Information Flow Diagram
type.UMLInformationFlowDiagram = UMLInformationFlowDiagram
type.UMLInformationItemView = UMLInformationItemView
type.UMLInformationFlowView = UMLInformationFlowView
// Profile Diagram Views
type.UMLProfileDiagram = UMLProfileDiagram
type.UMLProfileView = UMLProfileView
type.UMLMetaClassView = UMLMetaClassView
type.UMLStereotypeView = UMLStereotypeView
type.UMLExtensionView = UMLExtensionView
// Annotation Views
type.HyperlinkView = HyperlinkView
type.UMLCustomTextView = UMLCustomTextView
type.UMLTextView = UMLTextView
type.UMLTextBoxView = UMLTextBoxView
type.UMLCustomNoteView = UMLCustomNoteView
type.UMLNoteView = UMLNoteView
type.UMLConstraintView = UMLConstraintView
type.UMLNoteLinkView = UMLNoteLinkView
type.UMLConstraintLinkView = UMLConstraintLinkView
type.ShapeView = ShapeView
type.RectangleView = RectangleView
type.RoundRectView = RoundRectView
type.EllipseView = EllipseView
type.ImageView = ImageView
