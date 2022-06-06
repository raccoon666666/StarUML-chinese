/* eslint-disable no-useless-escape */

const fs = require('fs-extra')
const filenamify = require('filenamify')
const StringUtils = require('../utils/string-utils')
const Strings = require('../strings')
const UrlParse = require('url-parse')
const ExtensionManagerDomain = require('./extension-manager-domain')
// PreferencesManager   = require("preferences/PreferencesManager");

// PreferencesManager.definePreference("proxy", "string");

var Errors = {
  ERROR_LOADING: 'ERROR_LOADING',
  MALFORMED_URL: 'MALFORMED_URL',
  UNSUPPORTED_PROTOCOL: 'UNSUPPORTED_PROTOCOL'
}

var InstallationStatuses = {
  FAILED: 'FAILED',
  INSTALLED: 'INSTALLED',
  ALREADY_INSTALLED: 'ALREADY_INSTALLED',
  SAME_VERSION: 'SAME_VERSION',
  OLDER_VERSION: 'OLDER_VERSION',
  NEEDS_UPDATE: 'NEEDS_UPDATE',
  DISABLED: 'DISABLED'
}

/**
 * @private
 * @type {number} Used to generate unique download ids
 */
var _uniqueId = 0

function _extensionManagerCall (callback) {
  return callback(ExtensionManagerDomain)
}

/**
 * @private
 * TODO: can this go away now that we never call it directly?
 *
 * Validates the package at the given path. The actual validation is
 * handled by the Node server.
 *
 * The promise is resolved with an object:
 * { errors: `Array.<{string}>`, metadata: { name:string, version:string, ... } }
 * metadata is pulled straight from package.json and will be undefined
 * if there are errors or null if the extension did not include package.json.
 *
 * @param {string} Absolute path to the package zip file
 * @param {{requirePackageJSON: ?boolean}} validation options
 * @return {$.Promise} A promise that is resolved with information about the package
 */
function validate (path, options) {
  return _extensionManagerCall(function (extensionManager) {
    var d = new $.Deferred()

    extensionManager.validate(path, options, function (err, result) {
      if (err) {
        d.reject(err)
      } else {
        d.resolve({
          errors: result.errors,
          metadata: result.metadata
        })
      }
    })

    return d.promise()
  })
}

/**
 * @private
 * Validates and installs the package at the given path. Validation and
 * installation is handled by the Node process.
 *
 * The extension will be installed into the user's extensions directory.
 * If the user already has the extension installed, it will instead go
 * into their disabled extensions directory.
 *
 * The promise is resolved with an object:
 * { errors: `Array.<{string}>`, metadata: { name:string, version:string, ... },
 * disabledReason:string, installedTo:string, commonPrefix:string }
 * metadata is pulled straight from package.json and is likely to be undefined
 * if there are errors. It is null if there was no package.json.
 *
 * disabledReason is either null or the reason the extension was installed disabled.
 *
 * @param {string} path Absolute path to the package zip file
 * @param {?string} nameHint Hint for the extension folder's name (used in favor of
 *          path's filename if present, and if no package metadata present).
 * @param {?boolean} _doUpdate private argument used to signal an update
 * @return {$.Promise} A promise that is resolved with information about the package
 *          (which may include errors, in which case the extension was disabled), or
 *          rejected with an error object.
 */
function install (path, nameHint, _doUpdate) {
  return _extensionManagerCall(function (extensionManager) {
    var d = new $.Deferred()
    var destinationDirectory = app.extensionLoader.getUserExtensionPath()
    var disabledDirectory = destinationDirectory.replace(/\/user$/, '/disabled')
    var systemDirectory = app.getAppPath() + '/src/extensions/default/'

    var operation = _doUpdate ? 'update' : 'install'
    extensionManager[operation](path, destinationDirectory, {
      disabledDirectory: disabledDirectory,
      systemExtensionDirectory: systemDirectory,
      apiVersion: app.metadata.apiVersion,
      nameHint: nameHint
    }, function (err, result) {
      if (err) {
        d.reject(err)
      } else {
        if (result.installationStatus !== InstallationStatuses.INSTALLED || _doUpdate) {
          d.resolve(result)
        } else {
          // This was a new extension and everything looked fine.
          // We load it into StarUML right away.
          try {
            app.extensionLoader.loadExtension(result.name, {
              // On Windows, it looks like Node converts Unix-y paths to backslashy paths.
              // We need to convert them back.
              baseUrl: result.installedTo
            }, 'main')
            d.resolve(result)
          } catch (loadError) {
            d.reject(Errors.ERROR_LOADING)
          }
        }
      }
    })
    return d.promise()
  })
}

/**
 * @private
 * Special case handling to make the common case of downloading from GitHub easier; modifies 'urlInfo' as
 * needed. Converts a bare GitHub repo URL to the corresponding master ZIP URL; or if given a direct
 * master ZIP URL already, sets a nicer download filename (both cases use the repo name).
 *
 * @param {{url:string, parsed:Array.<string>, filenameHint:string}} urlInfo
 */
function githubURLFilter (urlInfo) {
  if (urlInfo.parsed.hostname === 'github.com' || urlInfo.parsed.hostname === 'www.github.com') {
    // Is it a URL to the root of a repo? (/user/repo)
    var match = /^\/[^\/?]+\/([^\/?]+)(\/?)$/.exec(urlInfo.parsed.pathname)
    if (match) {
      if (!match[2]) {
        urlInfo.url += '/'
      }
      urlInfo.url += 'archive/master.zip'
      urlInfo.filenameHint = match[1] + '.zip'
    } else {
      // Is it a URL directly to the repo's 'master.zip'? (/user/repo/archive/master.zip)
      match = /^\/[^\/?]+\/([^\/?]+)\/archive\/master.zip$/.exec(urlInfo.parsed.pathname)
      if (match) {
        urlInfo.filenameHint = match[1] + '.zip'
      }
    }
  }
}

/**
 * @private
 * Downloads from the given URL to a temporary location. On success, resolves with the path of the
 * downloaded file (typically in a temp folder) and a hint for the real filename. On failure, rejects
 * with an error object.
 *
 * @param {string} url URL of the file to be downloaded
 * @param {number} downloadId Unique number to identify this request
 * @return {$.Promise}
 */
function download (url, downloadId) {
  return _extensionManagerCall(function (extensionManager) {
    var d = new $.Deferred()

    // Validate URL
    var parsed = UrlParse(url)
    if (!parsed.hostname) {  // means PathUtils failed to parse at all
      d.reject(Errors.MALFORMED_URL)
      return d.promise()
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      d.reject(Errors.UNSUPPORTED_PROTOCOL)
      return d.promise()
    }

    var urlInfo = { url: url, parsed: parsed, filenameHint: parsed.pathname }
    githubURLFilter(urlInfo)

    // Decide download destination
    var filename = urlInfo.filenameHint
    filename = filename.replace(/[^a-zA-Z0-9_\- \(\)\.]/g, '_') // make sure it's a valid filename
    if (!filename) {  // in case of URL ending in '/'
      filename = 'extension.zip'
    }

    // Download the bits (using Node since brackets-shell doesn't support binary file IO)
    // TODO: 윈도우즈에서 localPath: result --> 는 / 가 ₩로 변경되어야 함. 
    extensionManager.downloadFile(downloadId, urlInfo.url, function (err, result) {
      if (err) {
        d.reject(err)
      } else {
        d.resolve({ localPath: result, filenameHint: urlInfo.filenameHint })
      }
    })
    return d.promise()
  })
}

/**
 * @private
 * Attempts to synchronously cancel the given pending download. This may not be possible, e.g.
 * if the download has already finished.
 *
 * @param {number} downloadId Identifier previously passed to download()
 */
function cancelDownload (downloadId) {
  return _extensionManagerCall(function (extensionManager) {
    return extensionManager.abortDownload(downloadId)
  })
}

/**
 * @private
 * On success, resolves with an extension metadata object; at that point, the extension has already
 * started running in Brackets. On failure (including validation errors), rejects with an error object.
 *
 * An error object consists of either a string error code OR an array where the first entry is the error
 * code and the remaining entries are further info. The error code string is one of either
 * ExtensionsDomain.Errors or Package.Errors. Use formatError() to convert an error object to a friendly,
 * localized error message.
 *
 * The returned cancel() function will *attempt* to cancel installation, but it is not guaranteed to
 * succeed. If cancel() succeeds, the Promise is rejected with a CANCELED error code. If we're unable
 * to cancel, the Promise is resolved or rejected normally, as if cancel() had never been called.
 *
 * @return {{promise: $.Promise, cancel: function():boolean}}
 */
function installFromURL (url) {
  const STATE_DOWNLOADING = 1
  const STATE_INSTALLING = 2
  const STATE_SUCCEEDED = 3
  const STATE_FAILED = 4

  var d = new $.Deferred()
  var state = STATE_DOWNLOADING

  var downloadId = (_uniqueId++)
  download(url, downloadId)
    .done(function (downloadResult) {
      state = STATE_INSTALLING
      install(downloadResult.localPath, downloadResult.filenameHint)
        .done(function (result) {
          var installationStatus = result.installationStatus
          if (installationStatus === InstallationStatuses.ALREADY_INSTALLED ||
            installationStatus === InstallationStatuses.NEEDS_UPDATE ||
            installationStatus === InstallationStatuses.SAME_VERSION ||
            installationStatus === InstallationStatuses.OLDER_VERSION) {
            // We don't delete the file in this case, because it will be needed
            // if the user is going to install the update.
            state = STATE_SUCCEEDED
            result.localPath = downloadResult.localPath
            d.resolve(result)
          } else {
            fs.unlink(downloadResult.localPath)
            if (result.errors && result.errors.length > 0) {
              // Validation errors - for now, only return the first one
              state = STATE_FAILED
              d.reject(result.errors[0])
            } else if (result.disabledReason) {
              // Extension valid but left disabled (wrong API version, extension name collision, etc.)
              state = STATE_FAILED
              d.reject(result.disabledReason)
            } else {
              // Success! Extension is now running in Brackets
              state = STATE_SUCCEEDED
              d.resolve(result)
            }
          }
        })
        .fail(function (err) {
          // File IO errors, internal error in install()/validate(), or extension startup crashed
          state = STATE_FAILED
          fs.unlink(downloadResult.localPath)
          d.reject(err)  // TODO: needs to be err.message ?
        })
    })
    .fail(function (err) {
      // Download error (the Node-side download code cleans up any partial ZIP file)
      state = STATE_FAILED
      d.reject(err)
    })

  return {
    promise: d.promise(),
    cancel: function () {
      if (state === STATE_DOWNLOADING) {
        // This will trigger download()'s fail() handler with CANCELED as the err code
        cancelDownload(downloadId)
      }
      // Else it's too late to cancel; we'll continue on through the done() chain and emit
      // a success result (calling done() handlers) if all else goes well.
    }
  }
}

/**
 * @private
 * Converts an error object as returned by install() or installFromURL() into a flattened, localized string.
 * @param {string|Array.<string>} error
 * @return {string}
 */
function formatError (error) {
  function localize (key) {
    if (Strings[key]) {
      return Strings[key]
    }
    console.log('Unknown installation error', key)
    return Strings.UNKNOWN_ERROR
  }

  if (Array.isArray(error)) {
    error[0] = localize(error[0])
    return StringUtils.format.apply(window, error)
  } else {
    return localize(error)
  }
}

/**
 * @private
 * Removes the extension at the given path.
 *
 * @param {string} path The absolute path to the extension to remove.
 * @return {$.Promise} A promise that's resolved when the extension is removed, or
 *     rejected if there was an error.
 */
function remove (path) {
  return _extensionManagerCall(function (extensionManager) {
    var d = new $.Deferred()
    extensionManager.remove(path, function (err) {
      if (err) {
        d.reject(err)
      } else {
        d.resolve()
      }
    })
    return d.promise()
  })
}

/**
 * @private
 * Install an extension update located at path.
 * This assumes that the installation was previously attempted
 * and an installationStatus of "ALREADY_INSTALLED", "NEEDS_UPDATE", "SAME_VERSION",
 * or "OLDER_VERSION" was the result.
 *
 * This workflow ensures that there should not generally be validation errors
 * because the first pass at installation the extension looked at the metadata
 * and installed packages.
 *
 * @param {string} path to package file
 * @param {?string} nameHint Hint for the extension folder's name (used in favor of
 *          path's filename if present, and if no package metadata present).
 * @return {$.Promise} A promise that is resolved when the extension is successfully
 *      installed or rejected if there is a problem.
 */
function installUpdate (path, nameHint) {
  var d = new $.Deferred()
  install(path, nameHint, true)
    .done(function (result) {
      if (result.installationStatus !== InstallationStatuses.INSTALLED) {
        d.reject(result.errors)
      } else {
        d.resolve(result)
      }
    })
    .fail(function (error) {
      d.reject(error)
    })
    .always(function () {
      fs.unlink(path)
    })
  return d.promise()
}

exports.installFromURL = installFromURL
exports.validate = validate
exports.install = install
exports.remove = remove
exports.installUpdate = installUpdate
exports.formatError = formatError
exports.InstallationStatuses = InstallationStatuses
