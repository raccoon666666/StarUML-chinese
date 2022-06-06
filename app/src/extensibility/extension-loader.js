/*
 * ExtensionLoader searches the filesystem for extensions, then creates a new context for each one and loads it.
 * This module dispatches the following events:
 *      "load" - when an extension is successfully loaded. The second argument is the file path to the
 *          extension root.
 *      "loadFailed" - when an extension load is unsuccessful. The second argument is the file path to the
 *          extension root.
 */

const path = require('path')
const fs = require('fs-extra')
const {EventEmitter} = require('events')
const {ipcRenderer} = require('electron')
const UrlParams = require('../utils/url-params').UrlParams

const DEFAULT_FEATURES = [
  'metamodel',
  'elements',
  // 'rules', (this should be loaded in main process)
  'menus',
  'keymaps',
  'preferences',
  'toolbox',
  'quickedits',
  'stylesheets',
  'entryPoint'
]

/**
 * @private
 */
class ExtensionLoader extends EventEmitter {

  constructor () {
    super()

    this._init = false

    this._extensions = {}
  }

  /**
   * @private
   * Returns the full path of the default user extensions directory. This is in the users
   * application support directory, which is typically
   * `/Users/<user>/Application Support/StarUML/extensions/user` on the mac, and
   * `C:\Users\<user>\AppData\Roaming\StarUML\extensions\user` on windows.
   */
  getUserExtensionPath () {
    let userDataPath = null
    if (process.type === 'browser') {
      userDataPath = require('electron').app.getPath('userData')
    } else {
      userDataPath = ipcRenderer.sendSync('get-user-path')
    }
    return path.join(userDataPath, '/extensions/user')
  }

  /**
   * @private
   * Load JSON files in the path
   * @param {string} dirPath Path where JSON files are
   * @param {function} fun Load function
   */
  _loadJsonFiles (dirPath, fun) {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath, 'utf8')
      if (files) {
        files.sort()
        files.forEach(item => {
          const file = path.join(dirPath, item)
          try {
            const data = fs.readFileSync(file, 'utf8')
            const obj = JSON.parse(data)
            fun(obj)
          } catch (err) {
            console.error('[Extension] failed to load the file: ' + file + ' - ' + err)
          }
        })
      }
    }
  }

  /**
   * Loads the extension that lives at baseUrl
   *
   * @param {!string} name, used to identify the extension
   * @param {!{baseUrl: string}} config object with baseUrl property containing absolute path of extension
   * @param {!string} entryPoint, name of the main js file to load
   * @param {Array<string>} extensionFeatures Extension features to be loaded.
   */
  loadExtension (name, config, entryPoint, extensionFeatures) {
    try {
      // load metamodel - metamodel.json
      if (extensionFeatures && extensionFeatures.includes('metamodel')) {
        const metamodelPath = path.join(config.baseUrl, '/metamodel.json')
        if (fs.existsSync(metamodelPath)) {
          try {
            const data = fs.readFileSync(metamodelPath, 'utf8')
            const obj = JSON.parse(data)
            app.metamodels.register(obj)
          } catch (err) {
            console.error('[Extension] failed to load the file: ' + metamodelPath)
            console.error(err)
          }
        }
      }
      // load element classes - elements.js
      if (extensionFeatures && extensionFeatures.includes('elements')) {
        const elementsPath = path.join(config.baseUrl, '/elements.js')
        if (fs.existsSync(elementsPath)) {
          try {
            require(elementsPath)
          } catch (err) {
            console.error('[Extension] failed to load the file: ' + elementsPath)
            console.error(err)
          }
        }
      }
      // load rules
      if (extensionFeatures && extensionFeatures.includes('rules')) {
        const rulesPath = path.join(config.baseUrl, '/rules.js')
        if (fs.existsSync(rulesPath)) {
          try {
            require(rulesPath)
          } catch (err) {
            console.error('[Extension] failed to load the file: ' + rulesPath)
            console.error(err)
          }
        }
      }
      // load keymaps
      if (extensionFeatures && extensionFeatures.includes('keymaps')) {
        const keymapPath = path.join(config.baseUrl, '/keymaps')
        this._loadJsonFiles(keymapPath, keymaps => {
          app.keymaps.add(keymaps)
        })
      }
      // load menus
      if (extensionFeatures && extensionFeatures.includes('menus')) {
        const menuPath = path.join(config.baseUrl, '/menus')
        this._loadJsonFiles(menuPath, menus => {
          if (menus['menu']) {
            app.menu.add(menus['menu'])
          }
          if (menus['context-menu']) {
            app.contextMenu.add(menus['context-menu'])
          }
        })
      }
      // load preferences
      if (extensionFeatures && extensionFeatures.includes('preferences')) {
        const prefsPath = path.join(config.baseUrl, '/preferences')
        this._loadJsonFiles(prefsPath, prefs => {
          app.preferences.register(prefs)
        })
      }
      // load toolbox
      if (extensionFeatures && extensionFeatures.includes('toolbox')) {
        const toolboxPath = path.join(config.baseUrl, '/toolbox')
        this._loadJsonFiles(toolboxPath, toolbox => {
          app.toolbox.add(toolbox)
        })
      }
      // load quickedits
      if (extensionFeatures && extensionFeatures.includes('quickedits')) {
        const quickeditsPath = path.join(config.baseUrl, '/quickedits')
        this._loadJsonFiles(quickeditsPath, quickedits => {
          app.quickedits.add(quickedits)
        })
      }
      // load stylesheets
      if (extensionFeatures && extensionFeatures.includes('stylesheets')) {
        const stylesheetsPath = path.join(config.baseUrl, '/stylesheets')
        if (fs.existsSync(stylesheetsPath)) {
          const stylesheets = fs.readdirSync(stylesheetsPath, 'utf8')
          if (stylesheets) {
            stylesheets.sort()
            stylesheets.forEach(item => {
              const file = path.join(stylesheetsPath, item)
              const ext = path.extname(file)
              if (ext === '.css') {
                app.stylesheets.loadStyleSheet(file)
                  .catch(() => {
                    console.error('[Extension] failed to load the file: ' + file)
                  })
              }
            })
          }
        }
      }
      // load entryPoint js file (e.g. main.js)
      if (extensionFeatures && extensionFeatures.includes('entryPoint')) {
        const module = require(config.baseUrl + '/' + entryPoint + '.js')
        this._extensions[name] = module
        // call init() function
        if (module && module.init && (typeof module.init === 'function')) {
          try {
            module.init()
          } catch (err) {
            console.error('[Extension] Error -- error thrown during init for ' + name + ': ' + err)
            console.error(err)
          }
        }
      }
      this.emit('load', config.baseUrl, true)
    } catch (err) {
      // Extension failed to load during the initial require() call
      console.error('[Extension] failed to load ' + config.baseUrl + ' ' + err)
      this.emit('loadFailed', config.baseUrl, false)
      console.error(err)
    }
  }

  /**
   * @private
   * Loads a file entryPoint from each extension folder within the baseUrl into its own Require.js context
   *
   * @param {!string} directory, an absolute native path that contains a directory of extensions.
   *                  each subdirectory is interpreted as an independent extension
   * @param {!{baseUrl: string}} config object with baseUrl property containing absolute path of extension folder
   * @param {!string} entryPoint Module name to load (without .js suffix)
   * @param {function} processExtension
   * @param {Array<string>} extensionFeatures Extension features to be loaded.
   */
  _loadAll (directory, config, entryPoint, processExtension, extensionFeatures) {
    const contents = fs.readdirSync(directory)
    try {
      var i
      var extensions = []

      for (i = 0; i < contents.length; i++) {
        var stat = fs.statSync(path.join(directory, contents[i]))
        if (stat.isDirectory()) {
          // FUTURE (JRB): read package.json instead of just using the entrypoint "main".
          // Also, load sub-extensions defined in package.json.
          extensions.push(contents[i])
        }
      }

      if (extensions.length === 0) {
        return
      }

      // Determine loading order based on package.json ("order")
      const orders = {}
      extensions.forEach(item => {
        const packagePath = path.join(config.baseUrl, '/' + item + '/package.json')
        if (fs.existsSync(packagePath)) {
          const data = fs.readFileSync(packagePath, 'utf8')
          const obj = JSON.parse(data)
          if (obj.order) {
            orders[item] = obj.order
          }
        }
      })
      extensions.sort((a, b) => {
        const oa = orders[a] || 0
        const ob = orders[b] || 0
        if (oa < ob) {
          return -1
        } else if (oa > ob) {
          return 1
        } else {
          if (a < b) {
            return -1
          } else if (a > b) {
            return 1
          } else {
            return 0
          }
        }
      })

      // Load extensions in the directory
      extensions.forEach(item => {
        var extConfig = {
          baseUrl: path.join(config.baseUrl, item),
          paths: config.paths
        }
        processExtension(item, extConfig, entryPoint)
      })
    } catch (err) {
      console.error('[Extension] Error -- could not read native directory: ' + directory)
    }
  }

  /**
   * Loads the extension that lives at baseUrl into its own Require.js context
   *
   * @param {!string} directory, an absolute native path that contains a directory of extensions.
   *                  each subdirectory is interpreted as an independent extension
   * @param {Array<string>} extensionFeatures Extension features to be loaded.
   */
  loadAllExtensionsInNativeDirectory (directory, extensionFeatures) {
    if (fs.existsSync(directory)) {
      this._loadAll(directory, {baseUrl: directory}, 'main', (name, config, entryPoint) => {
        this.loadExtension(name, config, entryPoint, extensionFeatures)
      }, extensionFeatures)
    }
  }

  /**
   * Load extensions.
   *
   * @param {?Array.<string>} A list containing references to extension source
   *      location. A source location may be either (a) a folder name inside
   *      src/extensions or (b) an absolute path.
   * @param {?Array<string>} extensionFeatures Extension features to be loaded.
   */
  init (paths, extensionFeatures) {
    var params = new UrlParams()

    if (this._init) {
      // Only init once. Return a resolved promise.
      return
    }

    if (!paths) {
      params.parse()
      if (params.get('reloadWithoutUserExts') === 'true') {
        paths = ['essential', 'default']
      } else {
        paths = ['essential', 'default', 'dev', this.getUserExtensionPath()]
      }
    }

    if (!extensionFeatures) {
      extensionFeatures = DEFAULT_FEATURES
    }

    // Load extensions before restoring the project

    // Get a Directory for the user extension directory and create it if it doesn't exist.
    // Note that this is an async call and there are no success or failure functions passed
    // in. If the directory *doesn't* exist, it will be created. Extension loading may happen
    // before the directory is finished being created, but that is okay, since the extension
    // loading will work correctly without this directory.
    // If the directory *does* exist, nothing else needs to be done. It will be scanned normally
    // during extension loading.
    var extensionPath = this.getUserExtensionPath()
    fs.ensureDirSync(extensionPath)

    // Create the extensions/disabled directory, too.
    var disabledExtensionPath = extensionPath.replace(/\/user$/, '/disabled')
    fs.ensureDirSync(disabledExtensionPath)

    paths.forEach(item => {
      var extensionPath = item
      // If the item has '/' or '\' in it, assume it is a full path. Otherwise, load
      // from our source path + '/extensions/'.
      if (item.indexOf('/') === -1 && item.indexOf('\\') === -1) {
        let appPath = null
        if (process.type === 'browser') {
          appPath = require('electron').app.getAppPath()
        } else {
          appPath = ipcRenderer.sendSync('get-app-path')
        }
        // TODO: Is it correct that using __dirname instead of electronApp.getAppPath()?
        extensionPath = path.join(appPath, '/extensions/', item)
      }

      return this.loadAllExtensionsInNativeDirectory(extensionPath, extensionFeatures)
    })

    this._init = true
  }

}

module.exports = ExtensionLoader
