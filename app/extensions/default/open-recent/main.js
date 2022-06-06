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

const MAX_RECENT_FILES = 10

var recentFiles = []

function getMenuItem (filename, index) {
  return {
    id: 'file.open-recent.' + index,
    label: filename,
    command: 'project:open-recent',
    'command-arg': filename
  }
}

function handleProjectLoaded (filename, project) {
  if (filename) {
    if (!recentFiles.includes(filename)) {
      recentFiles.unshift(filename)
      var menuItem = getMenuItem(filename, recentFiles.length - 1)
      menuItem.position = 'before'
      menuItem['relative-id'] = 'file.open-recent.0'
      app.menu.add([ { id: 'file.open-recent', submenu: [ menuItem ] } ])
      app.menu.setup()
    } else {
      recentFiles.splice(recentFiles.indexOf(filename), 1)
      recentFiles.unshift(filename)
    }
    if (recentFiles.length > MAX_RECENT_FILES) {
      recentFiles.splice(MAX_RECENT_FILES, recentFiles.length - MAX_RECENT_FILES)
    }
    localStorage.setItem('recent-files', JSON.stringify(recentFiles))
  }
}

function handleOpenRecent (arg) {
  app.commands.execute('project:open', arg)
}

function init () {
  var recentFilesData = localStorage.getItem('recent-files')
  if (recentFilesData) {
    try {
      recentFiles = JSON.parse(recentFilesData)
      let submenu = []
      recentFiles.forEach((filename, index) => {
        var item = getMenuItem(filename, index)
        submenu.push(item)
      })
      app.menu.add([ { id: 'file.open-recent', submenu: submenu } ])
    } catch (err) {
      console.error('Failed to load a list of recently opened files - ' + err)
    }
  }
  app.commands.register('project:open-recent', handleOpenRecent)
  app.project.on('projectLoaded', handleProjectLoaded)
}

exports.init = init
