// From Brackets StringUtils
function htmlEscape (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * @private
 * Gets the last version from the given object and returns the short form of its date.
 * Assumes "this" is the current template context.
 * @return {string} The formatted date.
 */
exports.lastVersionDate = function () {
  var result
  if (this.versions && this.versions.length) {
    result = this.versions[this.versions.length - 1].published
    if (result) {
      // Just return the ISO-formatted date, which is the portion up to the "T".
      var dateEnd = result.indexOf('T')
      if (dateEnd !== -1) {
        result = result.substr(0, dateEnd)
      }
    }
  }
  return result || ''
}

/**
 * @private
 * Returns a more friendly display form of the owner's internal user id.
 * Assumes "this" is the current template context.
 * @return {string} A display version in the form "id (service)".
 */
exports.formatUserId = function () {
  var friendlyName
  if (this.owner) {
    var nameComponents = this.owner.split(':')
    friendlyName = nameComponents[1]
  }
  return friendlyName
}

/**
 * @private
 * Given a registry item, returns a URL that represents its owner's page on the auth service.
 * Currently only handles GitHub.
 * Assumes "this" is the current template context.
 * @return {string} A link to that user's page on the service.
 */
exports.ownerLink = function () {
  var url
  if (this.owner) {
    var nameComponents = this.owner.split(':')
    if (nameComponents[0] === 'github') {
      url = 'https://github.com/' + nameComponents[1]
    }
  }
  return url
}

/**
 * @private
 * Given a registry item, formats the author information, including a link to the owner's
 * github page (if available) and the author's name from the metadata.
 */
exports.authorInfo = function () {
  var result = ''
  var ownerLink = exports.ownerLink.call(this)
  var userId = exports.formatUserId.call(this)
  if (this.metadata && this.metadata.author) {
    result = htmlEscape(this.metadata.author.name || this.metadata.author)
  } else if (userId) {
    result = htmlEscape(userId)
  }
  if (ownerLink) {
    result = "<a href='" + htmlEscape(ownerLink) + "' title='" + htmlEscape(ownerLink) + "'>" + result + '</a>'
  }
  return result
}

/**
 * @private
 * Returns an array of current registry entries, sorted by the publish date of the latest version of each entry.
 * @param {object} registry The unsorted registry.
 * @param {string} subkey The subkey to look for the registry metadata in. If unspecified, assumes
 *     we should look at the top level of the object.
 * @return {Array} Sorted array of registry entries.
 */
exports.sortRegistry = function (registry, subkey) {
  function getPublishTime (entry) {
    if (entry.versions) {
      return new Date(entry.versions[entry.versions.length - 1].published).getTime()
    }

    return Number.NEGATIVE_INFINITY
  }

  var sortedEntries = []

  // Sort the registry by last published date (newest first).
  Object.keys(registry).forEach(function (key) {
    sortedEntries.push(registry[key])
  })
  sortedEntries.sort(function (entry1, entry2) {
    return getPublishTime((subkey && entry2[subkey]) || entry2) -
    getPublishTime((subkey && entry1[subkey]) || entry1)
  })

  return sortedEntries
}
