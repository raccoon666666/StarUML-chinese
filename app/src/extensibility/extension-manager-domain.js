const semver = require('semver')
const path = require('path')
const request = require('request')
const fs = require('fs-extra')
const temp = require('temp')
const validate = require('./package-validator').validate

// Automatically clean up temp files on exit
temp.track()

var Errors = {
  API_NOT_COMPATIBLE: 'API_NOT_COMPATIBLE',
  MISSING_REQUIRED_OPTIONS: 'MISSING_REQUIRED_OPTIONS',
  DOWNLOAD_ID_IN_USE: 'DOWNLOAD_ID_IN_USE',
  BAD_HTTP_STATUS: 'BAD_HTTP_STATUS',             // {0} is the HTTP status code
  NO_SERVER_RESPONSE: 'NO_SERVER_RESPONSE',
  CANNOT_WRITE_TEMP: 'CANNOT_WRITE_TEMP',
  CANCELED: 'CANCELED'
}

var Statuses = {
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
 * Maps unique download ID to info about the pending download. No entry if download no longer pending.
 * outStream is only present if we've started receiving the body.
 * @type {Object.<string, {request:!http.ClientRequest, callback:!function(string, string), localPath:string, outStream:?fs.WriteStream}>}
 */
var pendingDownloads = {}

/**
 * @private
 * Private function to remove the installation directory if the installation fails.
 * This does not call any callbacks. It's assumed that the callback has already been called
 * and this cleanup routine will do its best to complete in the background. If there's
 * a problem here, it is simply logged with console.error.
 *
 * @param {string} installDirectory Directory to remove
 */
function _removeFailedInstallation (installDirectory) {
  fs.remove(installDirectory, function (err) {
    if (err) {
      console.error('Error while removing directory after failed installation', installDirectory, err)
    }
  })
}

/**
 * @private
 * Private function to unzip to the correct directory.
 *
 * @param {string} Absolute path to the package zip file
 * @param {string} Absolute path to the destination directory for unzipping
 * @param {Object} the return value with the useful information for the client
 * @param {Function} callback function that is called at the end of the unzipping
 */
function _performInstall (packagePath, installDirectory, validationResult, callback) {
  validationResult.installedTo = installDirectory
  fs.mkdirs(installDirectory, function (err) {
    if (err) {
      callback(err)
      return
    }
    var sourceDir = path.join(validationResult.extractDir, validationResult.commonPrefix)

    fs.copy(sourceDir, installDirectory, function (err) {
      if (err) {
        _removeFailedInstallation(installDirectory)
        callback(err, null)
      } else {
        // The status may have already been set previously (as in the
        // DISABLED case.
        if (!validationResult.installationStatus) {
          validationResult.installationStatus = Statuses.INSTALLED
        }
        callback(null, validationResult)
      }
    })
  })
}

/**
 * @private
 * Private function to remove the target directory and then install.
 *
 * @param {string} Absolute path to the package zip file
 * @param {string} Absolute path to the destination directory for unzipping
 * @param {Object} the return value with the useful information for the client
 * @param {Function} callback function that is called at the end of the unzipping
 */
function _removeAndInstall (packagePath, installDirectory, validationResult, callback) {
  // If this extension was previously installed but disabled, we will overwrite the
  // previous installation in that directory.
  fs.remove(installDirectory, function (err) {
    if (err) {
      callback(err)
      return
    }
    _performInstall(packagePath, installDirectory, validationResult, callback)
  })
}

function _checkExistingInstallation (validationResult, installDirectory, systemInstallDirectory, callback) {
  // If the extension being installed does not have a package.json, we can't
  // do any kind of version comparison, so we just signal to the UI that
  // it already appears to be installed.
  if (!validationResult.metadata) {
    validationResult.installationStatus = Statuses.ALREADY_INSTALLED
    callback(null, validationResult)
    return
  }

  fs.readJson(path.join(installDirectory, 'package.json'), function (err, packageObj) {
    // if the package.json is unreadable, we assume that the new package is an update
    // that is the first to include a package.json.
    if (err) {
      validationResult.installationStatus = Statuses.NEEDS_UPDATE
    } else {
      // Check to see if the version numbers signal an update.
      if (semver.lt(packageObj.version, validationResult.metadata.version)) {
        validationResult.installationStatus = Statuses.NEEDS_UPDATE
      } else if (semver.gt(packageObj.version, validationResult.metadata.version)) {
        // Pass a message back to the UI that the new package appears to be an older version
        // than what's installed.
        validationResult.installationStatus = Statuses.OLDER_VERSION
        validationResult.installedVersion = packageObj.version
      } else {
        // Signal to the UI that it looks like the user is re-installing the
        // same version.
        validationResult.installationStatus = Statuses.SAME_VERSION
      }
    }
    callback(null, validationResult)
  })
}

/**
 * @private
 * A "legacy package" is an extension that was installed based on the GitHub name without
 * a package.json file. Checking for the presence of these legacy extensions will help
 * users upgrade if the extension developer puts a different name in package.json than
 * the name of the GitHub project.
 *
 * @param {string} legacyDirectory directory to check for old-style extension.
 */
function legacyPackageCheck (legacyDirectory) {
  return fs.existsSync(legacyDirectory) && !fs.existsSync(path.join(legacyDirectory, 'package.json'))
}

/**
 * @private
 * Implements the "install" command in the "extensions" domain.
 *
 * There is no need to call validate independently. Validation is the first
 * thing that is done here.
 *
 * After the extension is validated, it is installed in destinationDirectory
 * unless the extension is already present there. If it is already present,
 * a determination is made about whether the package being installed is
 * an update. If it does appear to be an update, then result.installationStatus
 * is set to NEEDS_UPDATE. If not, then it's set to ALREADY_INSTALLED.
 *
 * If the installation succeeds, then result.installationStatus is set to INSTALLED.
 *
 * The extension is unzipped into a directory in destinationDirectory with
 * the name of the extension (the name is derived either from package.json
 * or the name of the zip file).
 *
 * The destinationDirectory will be created if it does not exist.
 *
 * @param {string} Absolute path to the package zip file
 * @param {string} the destination directory
 * @param {{disabledDirectory: !string, apiVersion: !string, nameHint: ?string,
 *      systemExtensionDirectory: !string}} additional settings to control the installation
 * @param {function} callback (err, result)
 * @param {boolean} _doUpdate  private argument to signal that an update should be performed
 */
function install (packagePath, destinationDirectory, options, callback, _doUpdate) {
  if (!options || !options.disabledDirectory || !options.apiVersion || !options.systemExtensionDirectory) {
    callback(new Error(Errors.MISSING_REQUIRED_OPTIONS), null)
    return
  }

  var validateCallback = function (err, validationResult) {
    validationResult.localPath = packagePath

    // This is a wrapper for the callback that will delete the temporary
    // directory to which the package was unzipped.
    function deleteTempAndCallback (err) {
      if (validationResult.extractDir) {
        fs.remove(validationResult.extractDir)
        delete validationResult.extractDir
      }
      callback(err, validationResult)
    }

    // If there was trouble at the validation stage, we stop right away.
    if (err || validationResult.errors.length > 0) {
      validationResult.installationStatus = Statuses.FAILED
      deleteTempAndCallback(err, validationResult)
      return
    }

    // Prefers the package.json name field, but will take the zip
    // file's name if that's all that's available.
    var extensionName, guessedName
    if (options.nameHint) {
      guessedName = path.basename(options.nameHint, '.zip')
    } else {
      guessedName = path.basename(packagePath, '.zip')
    }
    if (validationResult.metadata) {
      extensionName = validationResult.metadata.name
    } else {
      extensionName = guessedName
    }

    validationResult.name = extensionName
    var installDirectory = path.join(destinationDirectory, extensionName)
    var legacyDirectory = path.join(destinationDirectory, guessedName)
    var systemInstallDirectory = path.join(options.systemExtensionDirectory, extensionName)

    // NOTE: Disabled version compatibility checking (for use V3 extensions in V4)
    /*
    if (validationResult.metadata && validationResult.metadata.engines && validationResult.metadata.engines.staruml) {
      var compatible = semver.satisfies(options.apiVersion, validationResult.metadata.engines.staruml)
      if (!compatible) {
        installDirectory = path.join(options.disabledDirectory, extensionName)
        validationResult.installationStatus = Statuses.DISABLED
        validationResult.disabledReason = Errors.API_NOT_COMPATIBLE
        _removeAndInstall(packagePath, installDirectory, validationResult, deleteTempAndCallback)
        return
      }
    }
    */

    // The "legacy" stuff should go away after all of the commonly used extensions
    // have been upgraded with package.json files.
    var hasLegacyPackage = validationResult.metadata && legacyPackageCheck(legacyDirectory)

    // If the extension is already there, we signal to the front end that it's already installed
    // unless the front end has signaled an intent to update.
    if (hasLegacyPackage || fs.existsSync(installDirectory) || fs.existsSync(systemInstallDirectory)) {
      if (_doUpdate) {
        if (hasLegacyPackage) {
          // When there's a legacy installed extension, remove it first,
          // then also remove any new-style directory the user may have.
          // This helps clean up if the user is in a state where they have
          // both legacy and new extensions installed.
          fs.remove(legacyDirectory, function (err) {
            if (err) {
              deleteTempAndCallback(err, validationResult)
              return
            }
            _removeAndInstall(packagePath, installDirectory, validationResult, deleteTempAndCallback)
          })
        } else {
          _removeAndInstall(packagePath, installDirectory, validationResult, deleteTempAndCallback)
        }
      } else if (hasLegacyPackage) {
        validationResult.installationStatus = Statuses.NEEDS_UPDATE
        validationResult.name = guessedName
        deleteTempAndCallback(null, validationResult)
      } else {
        _checkExistingInstallation(validationResult, installDirectory, systemInstallDirectory, deleteTempAndCallback)
      }
    } else {
      // Regular installation with no conflicts.
      validationResult.disabledReason = null
      _performInstall(packagePath, installDirectory, validationResult, deleteTempAndCallback)
    }
  }

  validate(packagePath, {}, validateCallback)
}

/**
 * @private
 * Implements the "update" command in the "extensions" domain.
 *
 * Currently, this just wraps _cmdInstall, but will remove the existing directory
 * first.
 *
 * There is no need to call validate independently. Validation is the first
 * thing that is done here.
 *
 * After the extension is validated, it is installed in destinationDirectory
 * unless the extension is already present there. If it is already present,
 * a determination is made about whether the package being installed is
 * an update. If it does appear to be an update, then result.installationStatus
 * is set to NEEDS_UPDATE. If not, then it's set to ALREADY_INSTALLED.
 *
 * If the installation succeeds, then result.installationStatus is set to INSTALLED.
 *
 * The extension is unzipped into a directory in destinationDirectory with
 * the name of the extension (the name is derived either from package.json
 * or the name of the zip file).
 *
 * The destinationDirectory will be created if it does not exist.
 *
 * @param {string} Absolute path to the package zip file
 * @param {string} the destination directory
 * @param {{disabledDirectory: !string, apiVersion: !string, nameHint: ?string,
 *      systemExtensionDirectory: !string}} additional settings to control the installation
 * @param {function} callback (err, result)
 */
function update (packagePath, destinationDirectory, options, callback) {
  install(packagePath, destinationDirectory, options, callback, true)
}

/**
 * @private
 * Wrap up after the given download has terminated (successfully or not). Closes connections, calls back the
 * client's callback, and IF there was an error, delete any partially-downloaded file.
 *
 * @param {string} downloadId Unique id originally passed to _cmdDownloadFile()
 * @param {?string} error If null, download was treated as successful
 */
function _endDownload (downloadId, error) {
  var downloadInfo = pendingDownloads[downloadId]
  delete pendingDownloads[downloadId]

  if (error) {
    // Abort the download if still pending
    // Note that this will trigger response's "end" event
    downloadInfo.request.abort()

    // Clean up any partially-downloaded file
    // (if no outStream, then we never got a response back yet and never created any file)
    if (downloadInfo.outStream) {
      downloadInfo.outStream.end(function () {
        fs.unlink(downloadInfo.localPath)
      })
    }

    downloadInfo.callback(error, null)
  } else {
    // Download completed successfully. Flush stream to disk and THEN signal completion
    downloadInfo.outStream.end(function () {
      downloadInfo.callback(null, downloadInfo.localPath)
    })
  }
}

/**
 * @private
 * Implements "downloadFile" command, asynchronously.
 */
function downloadFile (downloadId, url, proxy, callback) {
  // Backwards compatibility check, added in 0.37
  if (typeof proxy === 'function') {
    callback = proxy
    proxy = undefined
  }

  if (pendingDownloads[downloadId]) {
    callback(Errors.DOWNLOAD_ID_IN_USE, null)
    return
  }

  var req = request.get({
    url: url,
    encoding: null,
    proxy: proxy
  },
  // Note: we could use the traditional "response"/"data"/"end" events too if we wanted to stream data
  // incrementally, limit download size, etc. - but the simple callback is good enough for our needs.
  function (error, response, body) {
    if (error) {
      // Usually means we never got a response - server is down, no DNS entry, etc.
      _endDownload(downloadId, Errors.NO_SERVER_RESPONSE)
      return
    }
    if (response.statusCode !== 200) {
      _endDownload(downloadId, [Errors.BAD_HTTP_STATUS, response.statusCode])
      return
    }

    var stream = temp.createWriteStream('brackets')
    if (!stream) {
      _endDownload(downloadId, Errors.CANNOT_WRITE_TEMP)
      return
    }
    pendingDownloads[downloadId].localPath = stream.path
    pendingDownloads[downloadId].outStream = stream

    stream.write(body)
    _endDownload(downloadId)
  })

  pendingDownloads[downloadId] = { request: req, callback: callback }
}

/**
 * @private
 * Implements "abortDownload" command, synchronously.
 */
function abortDownload (downloadId) {
  if (!pendingDownloads[downloadId]) {
    // This may mean the download already completed
    return false
  } else {
    _endDownload(downloadId, Errors.CANCELED)
    return true
  }
}

/**
 * @private
 * Implements the remove extension command.
 */
function remove (extensionDir, callback) {
  fs.remove(extensionDir, function (err) {
    if (err) {
      callback(err)
    } else {
      callback(null)
    }
  })
}

// used in unit tests
exports.validate = validate
exports.install = install
exports.remove = remove
exports.update = update
exports.downloadFile = downloadFile
exports.abortDownload = abortDownload
