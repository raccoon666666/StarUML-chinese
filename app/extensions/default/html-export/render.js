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

const fs = require('fs-extra')
const _ = require('lodash')
const ejs = require('ejs')

/**
* Render a template file with options and save to an output file
*
* @param{string} templatePath Path for a template file
* @param{string} outputPath Path for an output file. You can use ejs expression (e.g. `out/<% element.name %>.java`)
* @param{Object} data Data object to be rendered
*/
function render (templatePath, outputPath, data) {
  var template = fs.readFileSync(templatePath, 'utf8')
  var rendered = ''
  var renderedOutput = ''
  var options = {
    filename: templatePath // to avoid "include" error
  }
  Object.assign(data, {
    _: _,
    root: app.project.getProject()
  })
  rendered = ejs.render(template, data, options)
  renderedOutput = ejs.render(outputPath, data, options)
  fs.ensureFileSync(renderedOutput)
  fs.writeFileSync(renderedOutput, rendered)
}

/**
 * Render a template file with a set of elements and save to multple output files at once
 *
 * @param{string} templatePath Path for a template file
 * @param{string} outputPath Path for output file(s). You can use ejs expression (e.g. `out/<% element.name %>.java`)
 * @param{Array.<Element> | string} elements Array of elements or selector expression to be rendered
 * @param{Object} options Options used for ejs rendering
 * @param{function(err, file, elem)} fn Function to be called for each element is rendered
 */
function renderBulk (templatePath, outputPath, elements, data, fn) {
  var template = fs.readFileSync(templatePath, 'utf8')
  var rendered = ''
  var renderedOutput = ''
  var options = {
    filename: templatePath // to avoid "include" error
  }
  elements = elements || []
  // if elements parameter is selector expression, retrieve them from Repository.
  if (_.isString(elements)) {
    elements = app.repository.select(elements) || []
  }
  Object.assign(data, {
    _: _,
    root: app.project.getProject()
  })
  for (var i = 0, len = elements.length; i < len; i++) {
    try {
      data.element = elements[i]
      rendered = ejs.render(template, data, options)
      renderedOutput = ejs.render(outputPath, data, options)
      fs.ensureFileSync(renderedOutput)
      fs.writeFileSync(renderedOutput, rendered)
      if (_.isFunction(fn)) {
        fn(null, renderedOutput, options.element)
      }
    } catch (err) {
      if (_.isFunction(fn)) {
        fn(err)
      }
    }
  }
}

// Default EJS Filter functions
exports.render = render
exports.renderBulk = renderBulk
