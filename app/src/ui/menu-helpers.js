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

/**
 * @private
 * Concat menu items in consideration with 'position' and 'relative-id'
 * @param {Object} template
 * @param {Array<Object>} submenu
 * @param {Array<Object>} submenuToAdd
 */
function concat (template, submenu, submenuToAdd) {
  submenuToAdd.forEach(sub => {
    let relativeItem = null
    if (sub.position) {
      switch (sub.position) {
      case 'first':
        submenu.unshift(sub)
        break
      case 'last':
        submenu.push(sub)
        break
      case 'before':
        relativeItem = findById(template, sub['relative-id'])
        if (relativeItem) {
          let array = relativeItem.__parent
          let index = array.indexOf(relativeItem)
          array.splice(index, 0, sub)
        }
        break
      case 'after':
        relativeItem = findById(template, sub['relative-id'])
        if (relativeItem) {
          let array = relativeItem.__parent
          let index = array.indexOf(relativeItem)
          array.splice(index + 1, 0, sub)
        }
        break
      default:
        submenu.push(sub)
        break
      }
    } else {
      submenu.push(sub)
    }
  })
}

/**
 * @private
 * @param {Array} template
 * @param {object} item
 */
function merge (template, item) {
  if (item.id) {
    let matched = findById(template, item.id)
    if (matched) {
      if (item.submenu && Array.isArray(item.submenu)) {
        if (!Array.isArray(matched.submenu)) {
          matched.submenu = []
        }
        concat(template, matched.submenu, item.submenu)
      }
    } else {
      concat(template, template, [item])
    }
  } else {
    template.push(item)
  }
}

/**
 * Find a template item by a given id
 * @private
 * @param {Array} template
 * @param {string} id
 * @return {Object} menu item
 */
function findById (template, id) {
  for (let i in template) {
    let item = template[i]
    if (item.id === id) {
      // Returned item need to have a reference to parent Array (.__parent).
      // This is required to handle `position` and `relative-id`
      item.__parent = template
      return item
    } else if (Array.isArray(item.submenu)) {
      let result = findById(item.submenu, id)
      if (result) {
        return result
      }
    }
  }
  return null
}

/**
 * Translate templates to Electron's menu template format
 * @private
 */
function translateTemplate (template, keystrokesByCommand) {
  for (let i in template) {
    let item = template[i]
    if (item.command) {
      item.accelerator = acceleratorForCommand(item.command, keystrokesByCommand)
    }
    item.click = function () {
      global.application.sendCommand(item.command, item['command-arg'] || undefined)
    }
    if (item.submenu) {
      this.translateTemplate(item.submenu, keystrokesByCommand)
    }
  }
  return template
}

/**
 * @private
 */
function acceleratorForCommand (command, keystrokesByCommand) {
  const keystroke = keystrokesByCommand[command]
  if (keystroke) {
    let modifiers = keystroke.split(/-(?=.)/)
    let key = modifiers.pop().toUpperCase()
      .replace('+', 'Plus')
      .replace('MINUS', '-')
    modifiers = modifiers.map((modifier) => {
      if (process.platform === 'darwin') {
        return modifier.replace(/cmdctrl/ig, 'Cmd')
          .replace(/shift/ig, 'Shift')
          .replace(/cmd/ig, 'Cmd')
          .replace(/ctrl/ig, 'Ctrl')
          .replace(/alt/ig, 'Alt')
      } else {
        return modifier.replace(/cmdctrl/ig, 'Ctrl')
          .replace(/shift/ig, 'Shift')
          .replace(/ctrl/ig, 'Ctrl')
          .replace(/alt/ig, 'Alt')
      }
    })
    let keys = modifiers.concat([key])
    return keys.join('+')
  }
  return null
}

/**
 * @private
 * @param {Menu} menu
 */
function flattenMenuItems (menu) {
  let flattenItems = {}
  menu.items.forEach(item => {
    if (item.id) {
      flattenItems[item.id] = item
      if (item.submenu) {
        Object.assign(flattenItems, flattenMenuItems(item.submenu))
      }
    }
  })
  return flattenItems
}

/**
 * @private
 * @param {Map<string, MenuItem>} itemsById
 * @param {Map<string, boolean>} visibleStates
 * @param {Map<string, boolean>} enabledStates
 * @param {Map<string, boolean>} checkedStates
 */
function updateStates (itemsById, visibleStates, enabledStates, checkedStates) {
  if (visibleStates) {
    for (let command in visibleStates) {
      let item = itemsById[command]
      if (item) {
        item.visible = visibleStates[command]
      }
    }
  }
  if (enabledStates) {
    for (let command in enabledStates) {
      let item = itemsById[command]
      if (item) {
        item.enabled = enabledStates[command]
      }
    }
  }
  if (checkedStates) {
    for (let id in checkedStates) {
      let item = itemsById[id]
      if (item) {
        item.checked = checkedStates[id]
      }
    }
  }
}

exports.merge = merge
exports.findById = findById
exports.translateTemplate = translateTemplate
exports.acceleratorForCommand = acceleratorForCommand
exports.flattenMenuItems = flattenMenuItems
exports.updateStates = updateStates
