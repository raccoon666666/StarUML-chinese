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

const fs = require('fs')
const Mustache = require('mustache')
const path = require('path')
const Strings = require('../strings')
const Package = require('../extensibility/package')
const StringUtils = require('../utils/string-utils')
const InstallExtensionDialog = require('./install-extension-dialog')
const Async = require('../utils/async')
const ExtensionManager = require('../extensibility/extension-manager')
const ExtensionManagerView = require('../extensibility/extension-manager-view').ExtensionManagerView
const ExtensionManagerViewModel = require('../extensibility/extension-manager-view-model')

const dialogTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/extension-manager-dialog.html'), 'utf8')

var _activeTabIndex

/**
 * @private
 * Triggers changes requested by the dialog UI.
 */
function _performChanges () {
  // If an extension was removed or updated, prompt the user to quit Brackets.
  var hasRemovedExtensions = ExtensionManager.hasExtensionsToRemove()
  var hasUpdatedExtensions = ExtensionManager.hasExtensionsToUpdate()
  if (!hasRemovedExtensions && !hasUpdatedExtensions) {
    return
  }

  var buttonLabel = Strings.CHANGE_AND_RELOAD
  if (hasRemovedExtensions && !hasUpdatedExtensions) {
    buttonLabel = Strings.REMOVE_AND_RELOAD
  } else if (hasUpdatedExtensions && !hasRemovedExtensions) {
    buttonLabel = Strings.UPDATE_AND_RELOAD
  }

  var dlg = app.dialogs.showModalDialog(
    'change-marked-extensions',
    Strings.CHANGE_AND_RELOAD_TITLE,
    Strings.CHANGE_AND_RELOAD_MESSAGE,
    [
      {
        className: '',
        id: 'cancel',
        text: Strings.CANCEL
      },
      {
        className: 'primary',
        id: 'ok',
        text: buttonLabel
      }
    ],
    false
  )
  var $dlg = dlg.getElement()

  $dlg.one('buttonClick', function (e, buttonId) {
    if (buttonId === 'ok') {
      // Disable the dialog buttons so the user can't dismiss it,
      // and show a message indicating that we're doing the updates,
      // in case it takes a long time.
      $dlg.find('.dialog-button').prop('disabled', true)
      $dlg.find('.close').hide()
      $dlg.find('.dialog-message')
      .text(Strings.PROCESSING_EXTENSIONS)
      .append("<span class='spinner spin'/>")

      ExtensionManager.removeMarkedExtensions()
      .done(function () {
        ExtensionManager.updateExtensions()
        .done(function () {
          dlg.close()
          app.commands.execute('application:reload')
        })
        .fail(function (errorArray) {
          dlg.close()

          // This error case should be very uncommon.
          // Just let the user know that we couldn't update
          // this extension and log the errors to the console.
          var ids = []
          errorArray.forEach(function (errorObj) {
            ids.push(errorObj.item)
            if (errorObj.error && errorObj.error.forEach) {
              console.error('Errors for ', errorObj.item)
              errorObj.error.forEach(function (error) {
                console.error(Package.formatError(error))
              })
            }
          })
          app.dialogs.showErrorDialog(
            StringUtils.format(Strings.EXTENSION_MANAGER_UPDATE_ERROR, ids.join(', '))
          ).done(function () {
            // We still have to reload even if some of the removals failed.
            app.commands.execute('application:reload')
          })
        })
      })
      .fail(function (errorArray) {
        dlg.close()
        ExtensionManager.cleanupUpdates()

        var ids = []
        errorArray.forEach(function (errorObj) {
          ids.push(errorObj.item)
        })

        app.dialogs.showErrorDialog(
          StringUtils.format(Strings.EXTENSION_MANAGER_REMOVE_ERROR, ids.join(', '))
        ).done(function () {
          // We still have to reload even if some of the removals failed.
          app.commands.execute('application:reload')
        })
      })
    } else {
      dlg.close()
      ExtensionManager.cleanupUpdates()
      ExtensionManager.unmarkAllForRemoval()
    }
  })
}

/**
 * @private
 * Show a dialog that allows the user to browse and manage extensions.
 */
function showDialog () {
  var models = []
  var views = []
  var context = { Strings: Strings, showRegistry: !!app.config.extension_registry }

  // Load registry only if the registry URL exists
  if (context.showRegistry) {
    models.push(new ExtensionManagerViewModel.RegistryViewModel())
  }
  models.push(new ExtensionManagerViewModel.InstalledViewModel())

  // Open the Dialog
  var dialog = app.dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context), false)
  var $dlg = dialog.getElement()
  var $search = $dlg.find('.search')
  var $extensionTab = $("input[name='extension-tab']", $dlg)

  // When dialog closes, dismiss models and commit changes
  dialog.then(function ({buttonId}) {
    models.forEach(function (model) {
      model.dispose()
    })

    _performChanges()
  })

  function updateTab (active) {
    switch (active) {
    case 'registry':
      _activeTabIndex = 0
      $dlg.find('.extension-list#registry').show()
      $dlg.find('.extension-list#installed').hide()
      break
    case 'installed':
      _activeTabIndex = 1
      $dlg.find('.extension-list#registry').hide()
      $dlg.find('.extension-list#installed').show()
      break
    }

    // Clear search
    $search.val('')
    views.forEach(function (view, index) {
      view.filter('')
    })

    models[_activeTabIndex].scrollPos = $('.modal-body', $dlg).scrollTop()
    $('.modal-body', $dlg).scrollTop(models[_activeTabIndex].scrollPos || 0)
  }

  $extensionTab.change(function () {
    updateTab(this.value)
  })

  // Update & hide/show the notification overlay on a tab's icon, based on its model's notifyCount
  function updateNotificationIcon (index) {
    // Only in Installed tab
    if (index === 1) {
      var model = models[index]
      var $notificationIcon = $dlg.find('.update-notifications')
      if (model.notifyCount) {
        $notificationIcon.text(model.notifyCount)
        $notificationIcon.show()
      } else {
        $notificationIcon.hide()
      }
    }
  }

  // Initialize models and create a view for each model
  var modelInitPromise = Async.doInParallel(models, function (model, index) {
    var view = new ExtensionManagerView()
    var promise = view.initialize(model)
    var lastNotifyCount

    promise.always(function () {
      views[index] = view

      lastNotifyCount = model.notifyCount
      updateNotificationIcon(index)
    })

    $(model).on('change', function () {
      if (lastNotifyCount !== model.notifyCount) {
        lastNotifyCount = model.notifyCount
        updateNotificationIcon(index)
      }
    })

    return promise
  }, true)

  modelInitPromise.always(function () {
    $('.spinner', $dlg).remove()

    views.forEach(function (view) {
      view.$el.appendTo($('.dialog-body', $dlg))
    })

    // Filter the views when the user types in the search field.
    $dlg.on('input', '.search', function (e) {
      var query = $(this).val()
      views.forEach(function (view) {
        view.filter(query)
      })
    })

    // Show the first tab
    $extensionTab.val(['registry'])
    updateTab('registry')
  })

  // Handle the close button.
  $('.extension-manager-dialog button[data-button-id=close]')
  .click(function () {
    dialog.close()
  })

  // Handle the install button.
  $('.extension-manager-dialog .install-from-url')
  .click(function () {
    InstallExtensionDialog.showDialog().done(ExtensionManager.updateFromDownload)
  })
}

function htmlReady () {
  $('#toolbar-extension-manager').click(function () {
    showDialog()
  })
}

exports.showDialog = showDialog
exports.htmlReady = htmlReady
