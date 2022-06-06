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

function _modelFn (parent, field, options) {
  return app.factory.defaultModelFn(parent, field, options)
}

function _viewOnlyFn (parent, diagram, options) {
  return app.factory.defaultViewOnlyFn(parent, diagram, options)
}

function _edgeViewOnlyFn (parent, diagram, options) {
  return app.factory.defaultEdgeViewOnlyFn(parent, diagram, options)
}

function _modelAndViewFn (parent, diagram, options) {
  return app.factory.defaultModelAndViewFn(parent, diagram, options)
}

// Common Elements
app.factory.registerModelFn('Tag', _modelFn)

// Annotations
app.factory.registerModelAndViewFn('Text', _viewOnlyFn, { viewType: 'UMLTextView' })
app.factory.registerModelAndViewFn('TextBox', _viewOnlyFn, { viewType: 'UMLTextBoxView' })
app.factory.registerModelAndViewFn('FreeLine', _edgeViewOnlyFn, { viewType: 'FreelineEdgeView' })
app.factory.registerModelAndViewFn('Note', _viewOnlyFn, { viewType: 'UMLNoteView' })
app.factory.registerModelAndViewFn('NoteLink', _edgeViewOnlyFn, { viewType: 'UMLNoteLinkView' })
app.factory.registerModelAndViewFn('Hyperlink', _modelAndViewFn)
app.factory.registerModelAndViewFn('Rect', _viewOnlyFn, { viewType: 'RectangleView' })
app.factory.registerModelAndViewFn('RoundRect', _viewOnlyFn, { viewType: 'RoundRectView' })
app.factory.registerModelAndViewFn('Ellipse', _viewOnlyFn, { viewType: 'EllipseView' })
app.factory.registerModelAndViewFn('Image', _viewOnlyFn, { viewType: 'ImageView' })
