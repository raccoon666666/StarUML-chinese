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
 * Add a tag
 */
function handleAddTag (options) {
  const parent = app.selections.getSelected()
  app.factory.createModel({id: 'Tag', parent: parent, field: 'tags'})
}

/**
 * @private
 * Update menu states
 */
function updateMenus () {
  let selected = app.selections.getSelected()
  let isExtensibleModel = selected instanceof type.ExtensibleModel
  let visibleStates = {
    'common.tag': isExtensibleModel
  }
  app.menu.updateStates(visibleStates, null, null)
}

app.commands.register('common:tag', handleAddTag, 'Add Tag')

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
