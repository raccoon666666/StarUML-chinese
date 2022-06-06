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

function _getNodeViews () {
  return _.filter(
    app.selections.getSelectedViews(),
    function (v) {
      return (v instanceof type.NodeView) &&
      !(v instanceof type.EdgeParasiticView) &&
      !(v instanceof type.NodeParasiticView)
    }
  )
}

function handleSendToBack () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    const builder = app.repository.getOperationBuilder()
    builder.begin('send to back')
    var selectedViews = app.selections.getSelectedViews()
    for (var i = selectedViews.length - 1; i >= 0; i--) {
      var view = selectedViews[i]
      builder.fieldReorder(diagram, 'ownedViews', view, 0)
    }
    builder.end()
    app.repository.doOperation(builder.getOperation())
    app.diagrams.repaint()
  }
}

function handleBringToFront () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    const builder = app.repository.getOperationBuilder()
    builder.begin('bring to front')
    var lastPosition = diagram.ownedViews.length - 1
    var selectedViews = app.selections.getSelectedViews()
    for (var i = 0, len = selectedViews.length; i < len; i++) {
      var view = selectedViews[i]
      builder.fieldReorder(diagram, 'ownedViews', view, lastPosition)
    }
    builder.end()
    app.repository.doOperation(builder.getOperation())
    app.diagrams.repaint()
  }
}

function handleAlignLeft () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    var left = _.min(_.map(views, function (v) { return v.left }))
    const builder = app.repository.getOperationBuilder()
    builder.begin('align left')
    for (var i = 0, len = views.length; i < len; i++) {
      var view = views[i]
      builder.fieldAssign(view, 'left', left)
    }
    builder.end()
    app.repository.doOperation(builder.getOperation())
    app.diagrams.repaint()
  }
}

function handleAlignRight () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    var right = _.max(_.map(views, function (v) { return v.getRight() }))
    const builder = app.repository.getOperationBuilder()
    builder.begin('align right')
    for (var i = 0, len = views.length; i < len; i++) {
      var view = views[i]
      builder.fieldAssign(view, 'left', right - view.width + 1)
    }
    builder.end()
    app.repository.doOperation(builder.getOperation())
    app.diagrams.repaint()
  }
}

function handleAlignCenter () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    var left = _.min(_.map(views, function (v) { return v.left }))
    var right = _.max(_.map(views, function (v) { return v.getRight() }))
    var middle = Math.round((left + right) / 2)
    const builder = app.repository.getOperationBuilder()
    builder.begin('align middle')
    for (var i = 0, len = views.length; i < len; i++) {
      var view = views[i]
      builder.fieldAssign(view, 'left', middle - Math.round(view.width / 2))
    }
    builder.end()
    app.repository.doOperation(builder.getOperation())
    app.diagrams.repaint()
  }
}

function handleAlignTop () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    var top = _.min(_.map(views, function (v) { return v.top }))
    const builder = app.repository.getOperationBuilder()
    builder.begin('align top')
    for (var i = 0, len = views.length; i < len; i++) {
      var view = views[i]
      builder.fieldAssign(view, 'top', top)
    }
    builder.end()
    app.repository.doOperation(builder.getOperation())
    app.diagrams.repaint()
  }
}

function handleAlignBottom () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    var bottom = _.max(_.map(views, function (v) { return v.getBottom() }))
    const builder = app.repository.getOperationBuilder()
    builder.begin('align bottom')
    for (var i = 0, len = views.length; i < len; i++) {
      var view = views[i]
      builder.fieldAssign(view, 'top', bottom - view.height + 1)
    }
    builder.end()
    app.repository.doOperation(builder.getOperation())
    app.diagrams.repaint()
  }
}

function handleAlignMiddle () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    var top = _.min(_.map(views, function (v) { return v.top }))
    var bottom = _.max(_.map(views, function (v) { return v.getBottom() }))
    var center = Math.round((top + bottom) / 2)
    const builder = app.repository.getOperationBuilder()
    builder.begin('align bottom')
    for (var i = 0, len = views.length; i < len; i++) {
      var view = views[i]
      builder.fieldAssign(view, 'top', center - Math.round(view.height / 2))
    }
    builder.end()
    app.repository.doOperation(builder.getOperation())
    app.diagrams.repaint()
  }
}

function handleSpaceEquallyHorz () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _.sortBy(_getNodeViews(), function (v) { return v.left })
    var left = _.min(_.map(views, function (v) { return v.left }))
    var right = _.max(_.map(views, function (v) { return v.getRight() }))
    var w = _.reduce(_.map(views, function (v) { return v.width }), function (a, b) { return a + b })
    if ((right - left) > w) {
      var x = Math.round(left)
      var interval = ((right - left) - w) / (views.length - 1)
      const builder = app.repository.getOperationBuilder()
      builder.begin('space equally, horizontally')
      for (var i = 0, len = views.length; i < len; i++) {
        var view = views[i]
        builder.fieldAssign(view, 'left', x)
        x = Math.round(x + view.width + interval)
      }
      builder.end()
      app.repository.doOperation(builder.getOperation())
      app.diagrams.repaint()
    }
  }
}

function handleSpaceEquallyVert () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _.sortBy(_getNodeViews(), function (v) { return v.top })
    var top = _.min(_.map(views, function (v) { return v.top }))
    var bottom = _.max(_.map(views, function (v) { return v.getBottom() }))
    var h = _.reduce(_.map(views, function (v) { return v.height }), function (a, b) { return a + b })
    if ((bottom - top) > h) {
      var y = Math.round(top)
      var interval = ((bottom - top) - h) / (views.length - 1)
      const builder = app.repository.getOperationBuilder()
      builder.begin('space equally, vertically')
      for (var i = 0, len = views.length; i < len; i++) {
        var view = views[i]
        builder.fieldAssign(view, 'top', y)
        y = Math.round(y + view.height + interval)
      }
      builder.end()
      app.repository.doOperation(builder.getOperation())
      app.diagrams.repaint()
    }
  }
}

function handleSetWidthEqually () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    if (views.length > 0) {
      var maxWidth = _.max(_.map(views, function (v) { return v.width }))
      const builder = app.repository.getOperationBuilder()
      builder.begin('set width equally')
      for (var i = 0, len = views.length; i < len; i++) {
        var view = views[i]
        builder.fieldAssign(view, 'width', maxWidth)
      }
      builder.end()
      app.repository.doOperation(builder.getOperation())
      app.diagrams.repaint()
    }
  }
}

function handleSetHeightEqually () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    if (views.length > 0) {
      var maxHeight = _.max(_.map(views, function (v) { return v.height }))
      const builder = app.repository.getOperationBuilder()
      builder.begin('set height equally')
      for (var i = 0, len = views.length; i < len; i++) {
        var view = views[i]
        builder.fieldAssign(view, 'height', maxHeight)
      }
      builder.end()
      app.repository.doOperation(builder.getOperation())
      app.diagrams.repaint()
    }
  }
}

function handleSetSizeEqually () {
  var diagram = app.diagrams.getCurrentDiagram()
  if (diagram) {
    var views = _getNodeViews()
    if (views.length > 0) {
      var maxWidth = _.max(_.map(views, function (v) { return v.width }))
      var maxHeight = _.max(_.map(views, function (v) { return v.height }))
      const builder = app.repository.getOperationBuilder()
      builder.begin('set size equally')
      for (var i = 0, len = views.length; i < len; i++) {
        var view = views[i]
        builder.fieldAssign(view, 'width', maxWidth)
        builder.fieldAssign(view, 'height', maxHeight)
      }
      builder.end()
      app.repository.doOperation(builder.getOperation())
      app.diagrams.repaint()
    }
  }
}

function updateMenus () {
  let views = app.selections.getSelectedViews()
  let enabledStates = {
    'format.alignment': (views.length > 0)
  }
  app.menu.updateStates(null, enabledStates, null)
}

// Register Commands
app.commands.register('alignment:send-to-back', handleSendToBack, 'Alignment: Send To Back')
app.commands.register('alignment:bring-to-front', handleBringToFront, 'Alignment: Bring To Front')
app.commands.register('alignment:align-left', handleAlignLeft, 'Alignment: Align Left')
app.commands.register('alignment:align-right', handleAlignRight, 'Alignment: Align Right')
app.commands.register('alignment:align-center', handleAlignCenter, 'Alignment: Align Center')
app.commands.register('alignment:align-top', handleAlignTop, 'Alignment: Align Top')
app.commands.register('alignment:align-bottom', handleAlignBottom, 'Alignment: Align Bottom')
app.commands.register('alignment:align-middle', handleAlignMiddle, 'Alignment: Align Middle')
app.commands.register('alignment:space-equally-horizontally', handleSpaceEquallyHorz, 'Alignment: Space Equally Horizontally')
app.commands.register('alignment:space-equally-vertically', handleSpaceEquallyVert, 'Alignment: Space Equally Vertically')
app.commands.register('alignment:set-width-equally', handleSetWidthEqually, 'Alignment: Set Width Equally')
app.commands.register('alignment:set-height-equally', handleSetHeightEqually, 'Alignment: Set Height Equally')
app.commands.register('alignment:set-size-equally', handleSetSizeEqually, 'Alignment: Set Size Equally')

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
