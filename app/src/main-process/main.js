const {app} = require('electron')
const cli = require('./cli')

// hide nodejs warnings
process.env.NODE_NO_WARNINGS = 1

global.meta = {}
global.type = {}
global.rules = []

var fileToOpen = null

function start () {
  app.on('ready', () => {
    const Application = require('./application')
    global.application = new Application()
    if (!cli.handle()) {
      if (process.platform !== 'darwin' && !process.defaultApp && process.argv.length > 1) {
        fileToOpen = process.argv[1]
      }
      if (fileToOpen) {
        global.application.openWindow({fileToOpen: fileToOpen})
      } else {
        global.application.openWindow({loadWorking: true})
      }
    } else {
      // app.exit(0)
    }
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it's common NOT to close app even if all windows are closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', function (event, hasVisibleWindows) {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!hasVisibleWindows) {
      global.application.openWindow({})
    }
  })

  app.on('open-file', function (event, path) {
    if (!global.application) {
      fileToOpen = path
    } else {
      global.application.openWindow({fileToOpen: path})
    }
  })
}

start()
