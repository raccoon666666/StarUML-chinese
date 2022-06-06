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
const {EventEmitter} = require('events')

/**
 * Project Manager
 */
class ProjectManager extends EventEmitter {

  constructor () {
    super()

    /**
     * A root (top-level) project element.
     * @private
     * @type {Project}
     */
    this.project = null

    /**
     * Project filename
     * @private
     * @type {string}
     */
    this.filename = null

    /**
     * A reference to repository
     * @private
     * @type {Repository}
     */
    this.repository = null
  }

  /**
   * Return project
   * @return {Project}
   */
  getProject () {
    return this.project
  }

  /**
   * Return current filename.
   * @return {string}
   */
  getFilename () {
    return this.filename
  }

  /**
   * New project
   * @return {Project}
   */
  newProject () {
    this.project = new type.Project()
    this.filename = null
    this.repository.clear()
    this.repository.getIdMap()[this.project._id] = this.project
    try {
      /**
       * Triggered when a project is created
       * @name projectCreated
       * @kind event
       * @memberof ProjectManager
       * @property {Project} project The created project
       */
      this.emit('projectCreated', this.project)
    } catch (err) {
      console.error(err)
    }
    return this.project
  }

  /**
   * Close project
   */
  closeProject () {
    try {
      /**
       * Triggered before the project is closed
       * @name beforeProjectClose
       * @kind event
       * @memberof ProjectManager
       * @property {string} filename File name of the project
       * @property {Project} project The closing project
       */
      this.emit('beforeProjectClose', this.filename, this.project)
    } catch (err) {
      console.error(err)
    }
    this.project = null
    this.filename = null
    this.repository.clear()
    try {
      /**
       * Triggered after the project is closed
       * @name projectClosed
       * @kind event
       * @memberof ProjectManager
       */
      this.emit('projectClosed')
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Save project to file
   * @param {string} fullPath
   * @return {Project} The saved project
   */
  save (fullPath) {
    var data = this.repository.writeObject(this.project)
    fs.writeFileSync(fullPath, data, 'utf8')
    this.filename = fullPath
    this.repository.setModified(false)
    try {
      /**
       * Triggered after the project is saved
       * @name projectSaved
       * @kind event
       * @memberof ProjectManager
       * @property {string} filename File name of the project
       * @property {Project} project The saved project
       */
      this.emit('projectSaved', this.filename, this.project)
    } catch (ex) {
      console.error(ex)
    }
    return this.project
  }

  /**
   * Load from a file
   * @param {string} fullPath
   * @return {Project} The loaded project. (null if failed to load)
   */
  load (fullPath) {
    const data = fs.readFileSync(fullPath, 'utf8')
    if (data) {
      this.closeProject()
      this.project = this.repository.readObject(data)
      this.filename = fullPath
      this.repository.setModified(false)
      try {
        /**
         * Triggered after a project is loaded
         * @name projectLoaded
         * @kind event
         * @memberof ProjectManager
         * @property {string} filename File name of the project
         * @property {Project} project The loaded project
         */
        this.emit('projectLoaded', this.filename, this.project)
      } catch (ex) {
        console.error(ex)
      }
      return this.project
    }
    return null
  }

  /**
   * Load from a file as template
   * @param {string} fullPath
   * @return {Project} The loaded project. (null if failed to load)
   */
  loadAsTemplate (fullPath) {
    const data = fs.readFileSync(fullPath, 'utf8')
    if (data) {
      this.closeProject()
      this.project = this.repository.readObject(data)
      this.filename = null
      this.repository.setModified(false)
      try {
        this.emit('projectLoaded', this.filename, this.project)
      } catch (ex) {
        console.error(ex)
      }
      return this.project
    }
    return null
  }

  /**
   * Load project from JSON
   * @param {Object} data JSON data.
   * @return {Project} The loaded project. (null if failed to load)
   */
  loadFromJson (data) {
    if (data) {
      this.closeProject()
      this.project = this.repository.readObject(data)
      this.repository.setModified(false)
      try {
        this.emit('projectLoaded', null, this.project)
      } catch (err) {
        console.error(err)
      }
      return this.project
    }
    return null
  }

  /**
   * Import model fragment from a file.
   * @param {Element} parent Element to contain the imported element.
   * @param {string} fullPath
   * @return {Element} The imported element (null if failed to import)
   */
  importFromFile (parent, fullPath) {
    const data = fs.readFileSync(fullPath, 'utf8')
    if (data) {
      var elem = null
      if (data) {
        elem = this.repository.readObject(data, true)
        // Bypass Operation (for insert elem to parent)
        let operationBuilder = this.repository.getOperationBuilder()
        operationBuilder.begin('', true)
        operationBuilder.fieldInsert(parent, 'ownedElements', elem)
        operationBuilder.fieldAssign(elem, '_parent', parent)
        operationBuilder.end()
        this.repository.doOperation(operationBuilder.getOperation())
        this.repository.setModified(true)
        try {
          /**
           * Triggered after a model fragment is imported
           * @name imported
           * @kind event
           * @memberof ProjectManager
           * @property {string} filename File name of the model fragment
           * @property {Element} elem The imported model fragment
           */
          this.emit('imported', fullPath, elem)
        } catch (ex) {
          console.error(ex)
        }
      }
      return elem
    }
    return null
  }

  /**
   * Import from JSON
   * @param {Element} parent Element to contain the imported element.
   * @param {Object} data JSON data
   * @return {Element} The imported element (null if failed to import)
   */
  importFromJson (parent, data) {
    var elem = null
    if (data) {
      elem = this.repository.readObject(data)
      // Bypass Operation (for insert elem to parent)
      let operationBuilder = this.repository.getOperationBuilder()
      operationBuilder.begin('', true)
      operationBuilder.fieldInsert(parent, 'ownedElements', elem)
      operationBuilder.fieldAssign(elem, '_parent', parent)
      operationBuilder.end()
      this.repository.doOperation(operationBuilder.getOperation())
      this.repository.setModified(true)
      try {
        this.emit('imported', null, elem)
      } catch (err) {
        console.error(err)
      }
    }
    return elem
  }

  /**
   * Export model fragment to a file.
   * @param {Element} elem Element to be exported.
   * @param {string} fullPath
   * @return {Element} The exported element
   */
  exportToFile (elem, fullPath) {
    var data = this.repository.writeObject(elem)
    fs.writeFileSync(fullPath, data)
    try {
      /**
       * Triggered after a model fragment is exported
       * @name exported
       * @kind event
       * @memberof ProjectManager
       * @property {string} filename File name of the model fragment
       * @property {Element} elem The exported model fragment
       */
      this.emit('exported', fullPath, elem)
    } catch (err) {
      console.error(err)
    }
    return elem
  }

}

module.exports = ProjectManager
