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

/**
 * @param {string} direction - See Core.DIRECTION_TB, ...
 * @param {{node:number, edge:number, rank:number}} separations
 */
function _handleLayout (direction, separations) {
  if (app.diagrams.getCurrentDiagram()) {
    app.engine.layoutDiagram(app.diagrams.getEditor(), app.diagrams.getCurrentDiagram(), direction, separations)
    app.diagrams.repaint()
  }
}

function init () {
  // Register Commands
  app.commands.register('diagram-layout:auto', _handleLayout, 'Layout: Auto')
  app.commands.register('diagram-layout:top-bottom', _.partial(_handleLayout, type.Diagram.LD_TB), 'Layout: Top to Bottom')
  app.commands.register('diagram-layout:bottom-top', _.partial(_handleLayout, type.Diagram.LD_BT), 'Layout: Bottom to Top')
  app.commands.register('diagram-layout:left-right', _.partial(_handleLayout, type.Diagram.LD_LR), 'Layout: Left to Right')
  app.commands.register('diagram-layout:right-left', _.partial(_handleLayout, type.Diagram.LD_RL), 'Layout: Right to Left')
}

exports.init = init
