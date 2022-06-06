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

/* global CodeMirror, markdown */

const fs = require('fs')
const path = require('path')

require('./markdown.min')

var markdownPanelTemplate = fs.readFileSync(path.join(__dirname, 'markdown-panel.html'), 'utf8')
var markdownPanel
var markdownEditor
var $markdownPanel
var $markdownEditor
var $markdownPreview
var $close
var $markdownModeRadio
var $toolbar
var $content
var $button = $("<a id='toolbar-markdown' href='#' title='Markdown'></a>")

const PREFERENCE_KEY = 'view.markdown.visibility'

/**
* Current Element
*/
var _currentElement = null

function updateMenus () {
  let checkStates = {
    'view.markdown-doc': markdownPanel.isVisible()
  }
  app.menu.updateStates(null, null, checkStates)
}

/**
* Show Relationships Panel
*/
function show () {
  markdownPanel.show()
  markdownEditor.refresh()
  $button.addClass('selected')
  updateMenus()
  app.preferences.set(PREFERENCE_KEY, true)
  $markdownPanel.trigger('panelResizeUpdate')
}

/**
* Hide Relationships Panel
*/
function hide () {
  markdownPanel.hide()
  $button.removeClass('selected')
  updateMenus()
  app.preferences.set(PREFERENCE_KEY, false)
}

/**
* Toggle Relationships Panel
*/
function toggle () {
  if (markdownPanel.isVisible()) {
    hide()
  } else {
    show()
  }
}

function setMode (mode) {
  if (mode === 'edit') {
    $markdownEditor.show()
    $markdownPreview.hide()
  } else if (mode === 'preview') {
    $markdownEditor.hide()
    $markdownPreview.show()
  }
}

function renderPreview () {
  if (_currentElement && _currentElement.documentation) {
    $markdownPreview.html("<div style='margin: 10px'>" + markdown.toHTML(_currentElement.documentation) + '</div>')
  } else {
    $markdownPreview.html('')
  }
}

function setElement (elem) {
  if (elem instanceof type.ExtensibleModel) {
    _currentElement = elem
    markdownEditor.setValue(_currentElement.documentation)
    markdownEditor.setOption('readOnly', false)
    markdownEditor.refresh()
    renderPreview()
  } else {
    _currentElement = null
    markdownEditor.setValue('')
    markdownEditor.setOption('readOnly', true)
    markdownEditor.refresh()
    renderPreview()
  }
}

function setDocumentation () {
  try {
    if (_currentElement && typeof _currentElement.documentation !== 'undefined') {
      var doc = markdownEditor.getValue()
      app.engine.setProperty(_currentElement, 'documentation', doc)
      renderPreview()
    }
  } catch (err) {
    console.error(err)
  }
}

/**
* Initialize Extension
*/
function init () {
  // Toolbar Button
  $('#toolbar .buttons').append($button)
  $button.click(function () {
    app.commands.execute('markdown-doc:toggle')
  })

  // Setup markdownPanel
  $markdownPanel = $(markdownPanelTemplate)
  $close = $markdownPanel.find('.close')
  $close.click(function () {
    hide()
  })
  $markdownModeRadio = $("input[name='markdown-mode']", $markdownPanel)
  $markdownModeRadio.change(function () {
    setMode(this.value)
  })

  $toolbar = $markdownPanel.find('.toolbar')
  $content = $markdownPanel.find('.panel-content')
  markdownPanel = app.panelManager.createBottomPanel('?', $markdownPanel, 29)
  $markdownPanel.on('panelCollapsed panelExpanded panelResizeUpdate', function () {
    $content.height($markdownPanel.height() - $toolbar.outerHeight())
    markdownEditor.setSize('100%', $content.height())
  })

  // Setup CodeMirror
  markdownEditor = CodeMirror.fromTextArea(document.getElementById('markdown-editor'), {
    lineNumbers: false,
    styleActiveLine: true,
    matchBrackets: true,
    theme: 'monokai',
    mode: 'markdown'
  })
  markdownEditor.on('blur', function (instance) {
    setDocumentation()
  })
  $markdownEditor = $(markdownEditor.getWrapperElement())
  $markdownPreview = $markdownPanel.find('.markdown-preview')
  $markdownPanel.trigger('panelResizeUpdate')

  // Register Commands
  app.commands.register('markdown-doc:toggle', toggle, 'Toggle Markdown Documentation View')

  // Handler for selectionChanged event
  app.selections.on('selectionChanged', function (models, views) {
    setElement(models.length > 0 ? models[0] : null)
  })

  // Handlers for element updated event
  app.repository.on('updated', function (elems) {
    if (elems.length === 1 && elems[0] === _currentElement) {
      setElement(elems[0])
    }
  })

  // Load Preference
  var visible = app.preferences.get(PREFERENCE_KEY)
  if (visible === true) {
    show()
  } else {
    hide()
  }

  // Start edit mode
  setMode('edit')

  // To fit the codemirror size to the panel
  app.on('app-ready', () => {
    setTimeout(() => {
      $markdownPanel.trigger('panelResizeUpdate')
    }, 100)
  })
}

exports.init = init
