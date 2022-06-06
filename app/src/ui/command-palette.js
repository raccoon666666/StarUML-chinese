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

// const _ = require('lodash')
// const Mustache = require('mustache')
// const keycode = require('keycode')
// const {Point, Rect, GridFactor, Coord} = require('../core/graphics')
const fs = require('fs')
const path = require('path')
const {EventEmitter} = require('events')

/**
 * Command Palette
 * @private
 */
class CommandPalette extends EventEmitter {
  constructor () {
    super()

    this.$view = null
    this.autoComplete = null

    /** A reference to an instance of KeymapManager */
    this.keymapManager = null

    /** A reference to an instance of CommandManager */
    this.commandManager = null
  }

  /**
   * Get all registered commands
   * @param {string} match
   * @return {Array<{id:string, name:string, handler:Function}>}
   */
  getCommands (match) {
    var cmds = []
    var ids = Object.keys(this.commandManager.commands)
    ids.forEach(id => {
      var cmd = null
      if (this.commandManager.commandNames[id]) {
        const name = this.commandManager.commandNames[id]
        if (match) {
          const lc = match.toLowerCase()
          if (id.toLowerCase().indexOf(lc) > -1 || name.toLowerCase().indexOf(lc) > -1) {
            cmd = {
              id: id,
              name: this.commandManager.commandNames[id],
              handler: this.commandManager.commands[id],
              key: ''
            }
          }
        } else {
          cmd = {
            id: id,
            name: name,
            handler: this.commandManager.commands[id],
            key: ''
          }
        }
      }
      if (cmd) {
        for (var key in this.keymapManager.keymap) {
          if (this.keymapManager.keymap[key] === cmd.id) {
            cmd.key = this.keymapManager.formatKeyDescriptor(key)
          }
        }
        cmds.push(cmd)
      }
    })
    return cmds
  }

  setupInput () {
    var self = this
    var searchDataSource = new kendo.data.DataSource({
      transport: {
        read: function (options) {
          if (options.data.filter && options.data.filter.filters.length > 0) {
            var keyword = options.data.filter.filters[0].value
            var cmds = self.getCommands(keyword)
            options.success(cmds)
          } else {
            options.success(self.getCommands())
          }
        }
      },
      serverFiltering: true
    })

    this.autoComplete = $('#command-palette-input').kendoAutoComplete({
      dataTextField: 'text',
      minLength: 1,
      placeholder: 'Search commands...',
      filter: 'contains',
      select: function (e) {
        var item = this.dataItem(e.item.index())
        self.close()
        setTimeout(() => {
          app.commands.execute(item.id)
        }, 200)
      },
      template: "<div class='command-palette-item'><div>#:data.name#</div><div>#:data.key#</div></div>",
      dataSource: searchDataSource
    }).data('kendoAutoComplete')

    var $input = $('#command-palette-input')
    $input.focusout(() => {
      this.close()
    })
    $input.keydown((e) => {
      if (e.keyCode === 27) { // ESC
        this.close()
      }
    })
  }

  showModal () {
    this.$view.css('display', 'flex')
    this.autoComplete.focus()
  }

  close () {
    var $input = $('#command-palette-input')
    $input.val('')
    this.$view.hide()
  }

  htmlReady () {
    const viewTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/command-palette.html'), 'utf8')
    this.$view = $(viewTemplate)
    $('.main-view').append(this.$view)
    this.setupInput()
  }
}

module.exports = CommandPalette
