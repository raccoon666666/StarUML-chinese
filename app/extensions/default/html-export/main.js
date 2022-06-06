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
const fsj = require('fs-jetpack')
const crypto = require('crypto')
const path = require('path')
const escapeHtml = require('escape-html')
const markdown_ = require('markdown').markdown
const render = require('./render')

const DOC_FOLDER = '/html-docs'

function generateFilename (text) {
  var fn = crypto.createHash('md5').update(text).digest('hex')
  return fn
}

var filters = {
  toFilename: function (elem) {
    return generateFilename(elem._id)
  },
  toUrl: function (elem) {
    var fn = generateFilename(elem._id)
    return fn + '.html'
  },
  toText: function (elem) {
    return elem.getNodeText()
  },
  toName: function (elem) {
    if (elem.name.trim().length === 0) {
      return '(unnamed)'
    }
    return elem.name
  },
  toIcon: function (elem) {
    return elem.getNodeIcon()
  },
  toDiagram: function (elem) {
    var fn = generateFilename(elem._id)
    return '../diagrams/' + fn + '.svg'
  },
  toType: function (obj) {
    if (typeof obj === 'undefined' || obj === null || (typeof obj === 'string' && obj.trim().length === 0)) {
      return "<span class='label label-info'>none</span>"
    } else if (obj instanceof type.Model) {
      return "<a href='" + filters.toUrl(obj) + "'>" +
      "<span class='node-icon " + filters.toIcon(obj) + "'></span>" +
      escapeHtml(obj.name) +
      '</a>'
    }
    return escapeHtml(obj)
  },
  toValue: function (obj) {
    if (typeof obj === 'undefined') {
      return "<span class='label label-info'>void</span>"
    } else if (obj === null) {
      return "<span class='label label-info'>null</span>"
    } else if (typeof obj === 'boolean') {
      return "<span class='label label-info'>" + obj + '</span>'
    } else if (typeof obj === 'number') {
      return "<span class='label label-info'>" + obj + '</span>'
    } else if (typeof obj === 'string') {
      return escapeHtml(obj)
    } else if (obj instanceof type.UMLStereotype) {
      return "<a href='" + filters.toUrl(obj) + "'>" +
      "<span class='node-icon " + filters.toIcon(obj) + "'></span>" +
      '«' + escapeHtml(filters.toText(obj)) + '»' +
      '</a>'
    } else if (obj instanceof type.Model) {
      return "<a href='" + filters.toUrl(obj) + "'>" +
      "<span class='node-icon " + filters.toIcon(obj) + "'></span>" +
      escapeHtml(filters.toText(obj)) +
      '</a>'
    }
    return escapeHtml(obj)
  },
  // Convert text to possible filename in Windows.
  filename: function (text) {
    return generateFilename(text)
  },
  // Render markdown syntax
  markdown: function (text) {
    return markdown_.toHTML(text)
  }
}

var copyFileOutsideOfElectronAsar = function (sourceInAsarArchive, destOutsideAsarArchive) {
  if (fs.existsSync(sourceInAsarArchive)) {
    // file will be copied
    if (fs.statSync(sourceInAsarArchive).isFile()) {
      fsj.file(destOutsideAsarArchive, {mode: 0o777, content: fs.readFileSync(sourceInAsarArchive)})
    } else if (fs.statSync(sourceInAsarArchive).isDirectory()) {
      // dir is browsed
      fs.readdirSync(sourceInAsarArchive).forEach(function (fileOrFolderName) {
        copyFileOutsideOfElectronAsar(sourceInAsarArchive + '/' + fileOrFolderName, destOutsideAsarArchive + '/' + fileOrFolderName)
      })
    }
  }
}

/**
 * Export to HTML
 * @param{string} targetDir Path where generated HTML files to be located
 * @param{boolean} exportDiagram Indicate whether generate diagram images or not
 */
function exportToHTML (targetDir, exportDiagram) {
  fs.ensureDirSync(targetDir)
  fs.ensureDirSync(targetDir + '/contents')
  fs.ensureDirSync(targetDir + '/diagrams')
  copyFileOutsideOfElectronAsar(path.join(__dirname, '/resources/html/assets'), path.join(targetDir + '/assets'))
  try {
    // Generate html documents
    var data = {
      element: app.project.getProject()
    }
    Object.assign(data, filters)
    render.render(path.join(__dirname, '/resources/html/templates/index.ejs'), path.join(targetDir, '/index.html'), data)
    render.render(path.join(__dirname, '/resources/html/templates/navigation.ejs'), path.join(targetDir + '/contents/navigation.html'), data)
    render.render(path.join(__dirname, '/resources/html/templates/diagrams.ejs'), path.join(targetDir + '/contents/diagrams.html'), data)
    render.render(path.join(__dirname, '/resources/html/templates/element_index.ejs'), path.join(targetDir + '/contents/element_index.html'), data)
    render.renderBulk(path.join(__dirname, '/resources/html/templates/content.ejs'), path.join(targetDir + '/contents/<%= toFilename(element) %>.html'), '@Model', data, function (err, file, elem) {
      if (err) {
        console.error(err)
      }
    })
    // Export diagram images
    if (exportDiagram) {
      var diagrams = app.repository.getInstancesOf('Diagram')
      diagrams.forEach(diagram => {
        var fn = path.join(targetDir, '/diagrams/', filters.toFilename(diagram) + '.svg')
        app.commands.execute('project:export-diagram-to-svg', diagram, fn)
      })
    }
  } catch (err) {
    app.dialogs.showErrorDialog('Failed to export HTML docs. (Error=' + err + ')')
    console.error(err)
  }
}

function handleExportHTML (path) {
  // If path is not assigned, popup Open Dialog to select a folder
  if (!path) {
    var files = app.dialogs.showOpenDialog('Select a folder where HTML docs to be exported', null, null, { properties: [ 'openDirectory' ] })
    if (files && files.length > 0) {
      exportToHTML(files[0] + DOC_FOLDER, true)
    }
  } else {
    exportToHTML(path, true)
  }
}

// Register Commands
app.commands.register('html-export:export', handleExportHTML, 'Export to HTML...')
