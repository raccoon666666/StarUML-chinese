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
const Reader = require('./reader')
require('./uml-readers')

const STARUMLV1_FILE_FILTERS = [
  {name: 'UML model (StarUML V1)', extensions: ['uml']},
  {name: 'All Files', extensions: ['*']}
]

function loadFile (filename) {
  // var dialog = app.dialogs.showSimpleDialog('Loading "' + filename + '"')
  // TODO: Need to show "loading..." message and close the message after the loading
  try {
    var data = fs.readFileSync(filename, 'utf8')
    // Parse XML
    var parser = new DOMParser()
    var xmlDom = parser.parseFromString(data, 'text/xml')

    // Transform XML to JSON
    Reader.clear()
    var bodyDom = xmlDom.getElementsByTagName('BODY')[0]
    if (!bodyDom) bodyDom = xmlDom.getElementsByTagName('XPD:BODY')[0]
    var project = Reader.readObj(bodyDom, 'DocumentElement')
    project._parent = null

    // Post Processing
    Reader.postprocess()

    // Load Project
    app.project.loadFromJson(project)
    app.modelExplorer.expand(app.project.getProject())

    // Load UMLStandard Profile
    var profiles = _.map(xmlDom.getElementsByTagName('PROFILE'), p => { return p.childNodes[0].nodeValue })
    if (profiles.includes('UMLStandard')) {
      // Apply UMLStandard Profile
      var profileFile = app.getAppPath() + '/resources/profiles/UMLStandardProfile.mfj'
      app.project.importFromFile(app.project.getProject(), profileFile)
      // Reconnect stereotypes to UMLStandard's stereotypes
      var id
      var _idMap = Reader.getIdMap()
      for (id in _idMap) {
        if (_idMap.hasOwnProperty(id)) {
          var elem = app.repository.get(id)
          if (elem && _.isString(elem.stereotype) && elem.stereotype.length > 0) {
            var matched = app.repository.lookupAndFind(app.project.getProject(), elem.stereotype, type.UMLStereotype)
            if (matched) {
              app.repository.bypassFieldAssign(elem, 'stereotype', matched)
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Error] Failed to load the file: ' + filename + ' - ' + err)
  }
}

function _handleImport (fullPath) {
  if (fullPath) {
    loadFile(fullPath)
  } else {
    var files = app.dialogs.showOpenDialog('Select a StarUML 1 file (.uml)', null, STARUMLV1_FILE_FILTERS)
    if (files && files.length > 0) {
      loadFile(files[0])
    }
  }
}

function init () {
  // Register Commands
  app.commands.register('staruml-v1:import', _handleImport, 'Import StarUML V1 File...')
}

exports.init = init
