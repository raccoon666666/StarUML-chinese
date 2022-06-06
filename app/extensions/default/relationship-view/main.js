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

const fs = require('fs')
const path = require('path')

var relationshipPanelTemplate = fs.readFileSync(path.join(__dirname, 'relationship-panel.html'), 'utf8')
var relationshipItemTemplate = fs.readFileSync(path.join(__dirname, 'relationship-item.html'), 'utf8')
var relationshipPanel
var listView
var $relationshipPanel
var $listView
var $close
var $button = $("<a id='toolbar-relationship-view' href='#' title='关系图'></a>")

const PREFERENCE_KEY = 'view.relationships.visibility'

/**
* DataSource for ListView
* @type {kendo.data.DataSource}
*/
var dataSource = new kendo.data.DataSource()

/**
* Clear All Relationship Items
*/
function clearRelationshipItems () {
  dataSource.data([])
}

/**
* Add a Relationship Item
* @param {Relationship} rel
* @param {Model} elem
* @param {string} role
*/
function addRelationshipItem (rel, elem, role) {
  dataSource.add({
    id: elem._id,
    role: (role ? role + ':' : ''),
    relId: rel._id,
    relName: rel.name,
    relIcon: rel.getNodeIcon(),
    relType: rel.getClassName(),
    icon: elem.getNodeIcon(),
    name: elem.name,
    type: elem.getClassName()
  })
}

function updateMenus () {
  let checkStates = {
    'view.relationship-view': relationshipPanel.isVisible()
  }
  app.menu.updateStates(null, null, checkStates)
}

/**
* Show Relationships Panel
*/
function show () {
  relationshipPanel.show()
  $button.addClass('selected')
  updateMenus()
  app.preferences.set(PREFERENCE_KEY, true)
}

/**
* Hide Relationships Panel
*/
function hide () {
  relationshipPanel.hide()
  $button.removeClass('selected')
  updateMenus()
  app.preferences.set(PREFERENCE_KEY, false)
}

/**
* Toggle Relationships Panel
*/
function toggle () {
  if (relationshipPanel.isVisible()) {
    hide()
  } else {
    show()
  }
}

function _handleSelectRelatedElement () {
  if (listView.select().length > 0) {
    var data = dataSource.view()
    var item = data[listView.select().index()]
    var element = app.repository.get(item.id)
    if (element) {
      app.modelExplorer.select(element, true)
    }
  }
}

function _handleSelectRelationship () {
  if (listView.select().length > 0) {
    var data = dataSource.view()
    var item = data[listView.select().index()]
    var element = app.repository.get(item.relId)
    if (element) {
      app.modelExplorer.select(element, true)
    }
  }
}

/**
* Initialize Extension
*/
function init () {
  // Toolbar Button
  $('#toolbar .buttons').append($button)
  $button.click(function () {
    app.commands.execute('relationship-view:toggle')
  })

  // Setup RelationshipPanel
  $relationshipPanel = $(relationshipPanelTemplate)
  $close = $relationshipPanel.find('.close')
  $close.click(function () {
    hide()
  })
  relationshipPanel = app.panelManager.createBottomPanel('?', $relationshipPanel, 29)

  // Setup Relationship List
  $listView = $relationshipPanel.find('.listview')
  $listView.kendoListView({
    dataSource: dataSource,
    template: relationshipItemTemplate,
    selectable: true
  })
  listView = $listView.data('kendoListView')
  $listView.dblclick(function (e) {
    _handleSelectRelationship()
  })

  // Handler for selectionChanged event
  app.selections.on('selectionChanged', function (models, views) {
    try {
      clearRelationshipItems()
      if (models.length === 1) {
        var m = models[0]
        var rels = app.repository.getRelationshipsOf(m)
        for (var i = 0, len = rels.length; i < len; i++) {
          var rel = rels[i]
          var otherSide
          var role
          if (rel instanceof type.DirectedRelationship) {
            if (rel.source === m) {
              otherSide = rel.target
              role = '(target)'
            } else {
              otherSide = rel.source
              role = '(source)'
            }
          } else if (rel instanceof type.UndirectedRelationship) {
            if (rel.end1.reference === m) {
              otherSide = rel.end2.reference
              role = rel.end2.name
            } else {
              otherSide = rel.end1.reference
              role = rel.end1.name
            }
          }
          if (rel && otherSide) {
            addRelationshipItem(rel, otherSide, role)
          }
        }
      }
    } catch (err) {
      console.error(err)
    }
  })

  // Load Preference
  var visible = app.preferences.get(PREFERENCE_KEY)
  if (visible === true) {
    show()
  } else {
    hide()
  }

  app.commands.register('relationship-view:toggle', toggle, 'Toggle Relationships View')
  app.commands.register('relationship-view:select-related-element', _handleSelectRelatedElement)
  app.commands.register('relationship-view:select-relationship', _handleSelectRelationship)
}

exports.init = init
