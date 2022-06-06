
// const {app} = require('electron')
const fs = require('fs')
// const path = require('path')
const MetamodelManager = require('../core/metamodel-manager')
const PreferenceManager = require('../core/preference-manager')
const {Repository} = require('../core/repository')
const Validator = require('../core/validator')

// NOTE: The blow code is to avoid error from creating Image class in main-process
class Image {}
global.Image = Image

/**
 * @private
 * MetadataManager
 */
class MetadataManager {

  constructor () {
    /**
     * An instance of MetamodelManager
     * @member {MetamodelManager}
     */
    this.metamodels = new MetamodelManager()

    /**
     * An instance of Repository
     * @member {Repository}
     */
    this.repository = new Repository()

    /**
     * An instance of PreferenceManager
     * @member {PreferenceManager}
     */
    this.preferences = new PreferenceManager()

    /**
     * An instance of Validator
     * @member {Validator}
     */
    this.validator = new Validator()
    this.validator.repository = this.repository

    /**
     * Root element (typically an instance of type.Project)
     * @private
     * @type {Element}
     */
    this.root = null

    // Emulate app context of renderer
    this.type = global.type
    this.meta = global.meta
    this.rules = global.rules
  }

  /**
   * Load a model file (.mdj)
   * @param{string} path
   * @return{Element} Root element in .mdj file
   */
  loadFromFile (path) {
    this.repository.clear()
    const data = fs.readFileSync(path, {encoding: 'utf8'})
    this.root = this.repository.readObject(data)
    return this.root
  }

  /**
   * Return a root element (typically an instanceof Project)
   * @return {Element} a root element
   */
  getRoot () {
    return this.root
  }

  /**
   * Validate the current loaded model
   * @return {Array<Object>}
   */
  validate () {
    return this.validator.validate()
  }

}

module.exports = MetadataManager
