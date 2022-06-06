/*
* Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
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

/**
 * @private
 * Resizer is a Module utility to inject resizing capabilities to any element
 * inside Brackets.
 *
 * On initialization, Resizer discovers all nodes tagged as "vert-resizable"
 * and "horz-resizable" to add the resizer handler. Additionally, "top-resizer",
 * "bottom-resizer", "left-resizer" and "right-resizer" classes control the
 * position of the resizer on the element.
 *
 * An element can be made resizable at any time using the `makeResizable()` API.
 * Panel sizes are saved via preferences and restored when the DOM node becomes resizable
 * again in a subsequent launch.
 *
 * The resizable elements trigger a panelResizeStart, panelResizeUpdate and panelResizeEnd
 * event that can be used to create performance optimizations (such as hiding/showing elements
 * while resizing), custom layout logic, etc. See makeResizable() for details on the events.
 *
 * A resizable element can be collapsed/expanded using the `show`, `hide` and `toggle` APIs or
 * via user action. This triggers panelCollapsed/panelExpanded events - see makeResizable().
 */

var DIRECTION_VERTICAL = 'vert'
var DIRECTION_HORIZONTAL = 'horz'

var POSITION_TOP = 'top'
var POSITION_BOTTOM = 'bottom'
var POSITION_LEFT = 'left'
var POSITION_RIGHT = 'right'

// Minimum size (height or width) for autodiscovered resizable panels
var DEFAULT_MIN_SIZE = 100

var isResizing = false

/**
 * @private
 * Shows a resizable element.
 * @param {DOMNode} element Html element to show if possible
 */
function show (element) {
  var showFunc = $(element).data('show')
  if (showFunc) {
    showFunc.apply(element)
  }
}

/**
 * @private
 * Hides a resizable element.
 * @param {DOMNode} element Html element to hide if possible
 */
function hide (element) {
  var hideFunc = $(element).data('hide')
  if (hideFunc) {
    hideFunc.apply(element)
  }
}

/**
 * @private
 * Changes the visibility state of a resizable element. The toggle
 * functionality is added when an element is made resizable.
 * @param {DOMNode} element Html element to toggle
 */
function toggle (element) {
  if ($(element).is(':visible')) {
    hide(element)
  } else {
    show(element)
  }
}

/**
 * @private
 * Returns the visibility state of a resizable element.
 * @param {DOMNode} element Html element to toggle
 * @return {boolean} true if element is visible, false if it is not visible
 */
function isVisible (element) {
  return $(element).is(':visible')
}

/**
 * @private
 * Adds resizing capabilities to a given html element.
 *
 * Resizing can be configured in two directions:
 *  - Vertical ("vert"): Resizes the height of the element
 *  - Horizontal ("horz"): Resizes the width of the element
 *
 * Resizer handlers can be positioned on the element at:
 *  - Top ("top") or bottom ("bottom") for vertical resizing
 *  - Left ("left") or right ("right") for horizontal resizing
 *
 * A resizable element triggers the following events while resizing:
 *  - panelResizeStart: When the resize starts. Passed the new size.
 *  - panelResizeUpdate: When the resize gets updated. Passed the new size.
 *  - panelResizeEnd: When the resize ends. Passed the final size.
 *  - panelCollapsed: When the panel gets collapsed (or hidden). Passed the last size
 *      before collapse. May occur without any resize events.
 *  - panelExpanded: When the panel gets expanded (or shown). Passed the initial size.
 *      May occur without any resize events.
 *
 * @param {!DOMNode} element DOM element which should be made resizable.
 * @param {!string} direction Direction of the resize action: one of the DIRECTION_* constants.
 * @param {!string} position Which side of the element can be dragged: one of the POSITION_* constants
 *                          (TOP/BOTTOM for vertical resizing or LEFT/RIGHT for horizontal).
 * @param {?number} minSize Minimum size (width or height) of the element's outer dimensions, including
 *                          border & padding. Defaults to DEFAULT_MIN_SIZE.
 * @param {?boolean} collapsible Indicates the panel is collapsible on double click on the
 *                          resizer. Defaults to false.
 * @param {?string} forceSize CSS selector indicating element whose 'left,right,top,bottom' should be locked to
 *                          the resizable element's size (useful for siblings laid out to the right of
 *                          the element). Must lie in element's parent's subtree.
 * @param {?boolean} createdByPanelManager For internal use only
 */
function makeResizable (element, direction, position, minSize, collapsible, forceSize, createdByPanelManager) {
  var $resizer = $('<div class="' + direction + '-resizer"></div>')
  var $element = $(element)
  var $parent = $element.parent()
  var $resizableElement = $($element.find('.resizable-content:first')[0])
  var $body = $(window.document.body)
  var elementID = $element.attr('id')
  var elementPrefs = app.preferences.getViewState(elementID) || {}
  var animationRequest = null
  var directionProperty = direction === DIRECTION_HORIZONTAL ? 'clientX' : 'clientY'
  var directionIncrement = (position === POSITION_TOP || position === POSITION_LEFT) ? 1 : -1
  var elementSizeFunction = direction === DIRECTION_HORIZONTAL ? $element.width : $element.height
  var resizerCSSPosition = direction === DIRECTION_HORIZONTAL ? 'left' : 'top'
  var contentSizeFunction = direction === DIRECTION_HORIZONTAL ? $resizableElement.width : $resizableElement.height

  if (minSize === undefined) {
    minSize = DEFAULT_MIN_SIZE
  }

  collapsible = collapsible || false

  // For left-resizer
  if (position === POSITION_LEFT) {
    resizerCSSPosition = 'right'
  }

  $element.prepend($resizer)

  // Important so min/max sizes behave predictably
  $element.css('box-sizing', 'border-box')

  // Detect legacy cases where panels in the editor area are created without using PanelManager APIs
  if ($parent[0] && $parent.is('.content') && !createdByPanelManager) {
    console.warn('Deprecated: resizable panels should be created via PanelManager.createBottomPanel(). Using Resizer directly will stop working in the future. \nElement:', element)
    $(exports).triggerHandler('deprecatedPanelAdded', [$element])
  }

  function adjustSibling (size) {
    if (forceSize !== undefined) {
      var forceCSS = 'left' // default
      switch (position) {
      case POSITION_LEFT:
        forceCSS = 'right'
        break
      case POSITION_RIGHT:
        forceCSS = 'left'
        break
      case POSITION_TOP:
        forceCSS = 'bottom'
        break
      case POSITION_BOTTOM:
        forceCSS = 'top'
        break
      }
      $(forceSize, $parent).css(forceCSS, size)
    }
  }

  function resizeElement (elementSize, contentSize) {
    elementSizeFunction.apply($element, [elementSize])

    if ($resizableElement.length) {
      contentSizeFunction.apply($resizableElement, [contentSize])
    }
  }

  $element.data('show', function () {
    var elementOffset = $element.offset()
    var elementSize = elementSizeFunction.apply($element) || elementPrefs.size
    var contentSize = contentSizeFunction.apply($resizableElement) || elementPrefs.contentSize
    // var resizerSize = elementSizeFunction.apply($resizer)

    // Resize the element before showing it again. If the panel was collapsed by dragging
    // the resizer, the size of the element should be 0, so we restore size in preferences
    resizeElement(elementSize, contentSize)

    $element.show()
    elementPrefs.visible = true

    if (collapsible) {
      $element.prepend($resizer)

      if (position === POSITION_TOP) {
        $resizer.css(resizerCSSPosition, '')
      } else if (position === POSITION_LEFT) {
        $resizer.css(resizerCSSPosition, elementSize)
      } else if (position === POSITION_RIGHT) {
        $resizer.css(resizerCSSPosition, elementOffset[resizerCSSPosition] + elementSize)
      }
    }

    adjustSibling(elementSize)

    $element.trigger('panelExpanded', [elementSize])
    app.preferences.setViewState(elementID, elementPrefs, null, isResizing)
  })

  $element.data('hide', function () {
    var elementOffset = $element.offset()
    var elementSize = elementSizeFunction.apply($element)
    var resizerSize = elementSizeFunction.apply($resizer)

    $element.hide()
    elementPrefs.visible = false
    if (collapsible) {
      $resizer.insertBefore($element)
      if (position === POSITION_RIGHT || position === POSITION_LEFT) {
        $resizer.css(resizerCSSPosition, 0)
      } else if (position === POSITION_TOP) {
        $resizer.css(resizerCSSPosition, elementOffset[resizerCSSPosition] + elementSize - resizerSize)
      }
    }

    adjustSibling(0)

    $element.trigger('panelCollapsed', [elementSize])
    app.preferences.setViewState(elementID, elementPrefs, null, isResizing)
  })

  // If the resizer is positioned right or bottom of the panel, we need to listen to
  // reposition it if the element size changes externally
  function repositionResizer (elementSize) {
    var resizerPosition = elementSize || 1
    if (position === POSITION_RIGHT || position === POSITION_LEFT || position === POSITION_BOTTOM) {
      $resizer.css(resizerCSSPosition, resizerPosition)
    }
  }

  $resizer.on('mousedown', function (e) {
    var $resizeShield = $("<div class='resizing-container " + direction + "-resizing' />")
    var startPosition = e[directionProperty]
    var startSize = $element.is(':visible') ? elementSizeFunction.apply($element) : 0
    var newSize = startSize
    var previousSize = startSize
    var baseSize = 0
    var resizeStarted = false

    isResizing = true
    $body.append($resizeShield)

    if ($resizableElement.length) {
      $element.children().not('.horz-resizer, .vert-resizer, .resizable-content').each(function (index, child) {
        if (direction === DIRECTION_HORIZONTAL) {
          baseSize += $(child).outerWidth()
        } else {
          baseSize += $(child).outerHeight()
        }
      })
    }

    function doRedraw () {
      // only run this if the mouse is down so we don't constantly loop even
      // after we're done resizing.
      if (!isResizing) {
        return
      }

      // Check for real size changes to avoid unnecessary resizing and events
      if (newSize !== previousSize) {
        previousSize = newSize

        if ($element.is(':visible')) {
          if (newSize < 10) {
            toggle($element)
            elementSizeFunction.apply($element, [0])
          } else {
            // Trigger resizeStarted just before the first successful resize update
            if (!resizeStarted) {
              resizeStarted = true
              $element.trigger('panelResizeStart', newSize)
            }

            // Resize the main element to the new size. If there is a content element,
            // its size is the new size minus the size of the non-resizable elements
            resizeElement(newSize, (newSize - baseSize))
            adjustSibling(newSize)

            $element.trigger('panelResizeUpdate', [newSize])
          }
        } else if (newSize > 10) {
          elementSizeFunction.apply($element, [newSize])
          toggle($element)

          // Trigger resizeStarted after expanding the element if it was previously collapsed
          if (!resizeStarted) {
            resizeStarted = true
            $element.trigger('panelResizeStart', newSize)
          }
        }
      }

      animationRequest = window.requestAnimationFrame(doRedraw)
    }

    function onMouseMove (e) {
      // calculate newSize adding to startSize the difference
      // between starting and current position, capped at minSize
      newSize = Math.max(startSize + directionIncrement * (startPosition - e[directionProperty]), minSize)

      // respect max size if one provided (e.g. by PanelManager)
      var maxSize = $element.data('maxsize')
      if (maxSize !== undefined) {
        newSize = Math.min(newSize, maxSize)
      }

      // don't let larger than parent size
      var parentSize = elementSizeFunction.apply($element.parent())
      if (parentSize) {
        newSize = Math.min(newSize, parentSize)
      }

      e.preventDefault()

      if (animationRequest === null) {
        animationRequest = window.requestAnimationFrame(doRedraw)
      }
    }

    $(window.document).on('mousemove', onMouseMove)

    // If the element is marked as collapsible, check for double click
    // to toggle the element visibility
    if (collapsible) {
      $resizeShield.on('mousedown', function (e) {
        $(window.document).off('mousemove', onMouseMove)
        $resizeShield.off('mousedown')
        $resizeShield.remove()
        animationRequest = null
        toggle($element)
      })
    }

    function endResize (e) {
      if (isResizing) {
        var elementSize = elementSizeFunction.apply($element)
        if ($element.is(':visible')) {
          elementPrefs.size = elementSize
          if ($resizableElement.length) {
            elementPrefs.contentSize = contentSizeFunction.apply($resizableElement)
          }
          app.preferences.setViewState(elementID, elementPrefs)
          repositionResizer(elementSize)
        }

        isResizing = false

        if (resizeStarted) {
          $element.trigger('panelResizeEnd', [elementSize])
        }

        // We wait 300ms to remove the resizer container to capture a mousedown
        // on the container that would account for double click
        // NOTE: DISABLED DOUBLE CLICK (SET TIMEOUT TO ZERO) TOGGLING TO FIX ISSUE #255
        window.setTimeout(function () {
          $(window.document).off('mousemove', onMouseMove)
          $resizeShield.off('mousedown')
          $resizeShield.remove()
          animationRequest = null
        }, 0)
      }
    }

    $(window.document).one('mouseup', endResize)

    e.preventDefault()
  })

  // Panel preferences initialization
  if (elementPrefs) {
    if (elementPrefs.size !== undefined) {
      elementSizeFunction.apply($element, [elementPrefs.size])
    }

    if (elementPrefs.contentSize !== undefined) {
      contentSizeFunction.apply($resizableElement, [elementPrefs.contentSize])
    }

    if (elementPrefs.visible !== undefined && !elementPrefs.visible) {
      hide($element)
    } else {
      adjustSibling(elementSizeFunction.apply($element))
      repositionResizer(elementSizeFunction.apply($element))
    }
  }
}

// Scan DOM for horz-resizable and vert-resizable classes and make them resizable
function htmlReady () {
  var minSize = DEFAULT_MIN_SIZE

  $('.vert-resizable').each(function (index, element) {
    if ($(element).data().minsize !== undefined) {
      minSize = $(element).data().minsize
    }

    if ($(element).hasClass('top-resizer')) {
      makeResizable(element, DIRECTION_VERTICAL, POSITION_TOP, minSize, $(element).hasClass('collapsible'), $(element).data().forcesize)
    }

    if ($(element).hasClass('bottom-resizer')) {
      makeResizable(element, DIRECTION_VERTICAL, POSITION_BOTTOM, minSize, $(element).hasClass('collapsible'), $(element).data().forcesize)
    }
  })

  $('.horz-resizable').each(function (index, element) {
    if ($(element).data().minsize !== undefined) {
      minSize = $(element).data().minsize
    }

    if ($(element).hasClass('left-resizer')) {
      makeResizable(element, DIRECTION_HORIZONTAL, POSITION_LEFT, minSize, $(element).hasClass('collapsible'), $(element).data().forcesize)
    }

    if ($(element).hasClass('right-resizer')) {
      makeResizable(element, DIRECTION_HORIZONTAL, POSITION_RIGHT, minSize, $(element).hasClass('collapsible'), $(element).data().forcesize)
    }
  })
}

exports.makeResizable = makeResizable
exports.toggle = toggle
exports.show = show
exports.hide = hide
exports.isVisible = isVisible
exports.htmlReady = htmlReady

// Resizer Constants
exports.DIRECTION_VERTICAL = DIRECTION_VERTICAL
exports.DIRECTION_HORIZONTAL = DIRECTION_HORIZONTAL
exports.POSITION_TOP = POSITION_TOP
exports.POSITION_RIGHT = POSITION_RIGHT
