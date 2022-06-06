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

const Mustache = require('mustache')
const Core = require('../core/core')
const _ = require('lodash')
const {EventEmitter} = require('events')

/**
 * Error Messages
 * @private
 */
const ERR_INVALID_PARENT = '{{.}} cannot be placed here.'

/**
 * Factory creates model, view and diagram elements
 */
class Factory extends EventEmitter {

  constructor () {
    super()

    /**
     * Map for functions to create diagram.
     *
     * @private
     * @type {Object.<string, Function>}
     */
    this.diagramFn = {}

    /**
     * Map for functions to create model element.
     *
     * @private
     * @type {Object.<string, Function>}
     */
    this.modelFn = {}

    /**
     * Map for functions to create both model and view elements.
     *
     * @private
     * @type {Object.<string, Function>}
     */
    this.modelAndViewFn = {}

    /**
     * Map for default options for createModelAndView.
     *
     * @private
     * @type {Object.<string, Object>}
     */
    this.modelAndViewOptions = {}

    /**
     * Map for functions to create a view element of a given model element.
     *
     * @private
     * @type {Object.<string, Function>}
     */
    this.viewOfFn = {}

    /**
     * A reference to metamodels
     * @private
     */
    this.metamodelManager = null

    /**
     * A reference to repository
     * @private
     */
    this.repository = null

    /**
     * A reference to engine
     * @private
     */
    this.engine = null

    /**
     * A reference to diagramManager
     * @private
     */
    this.diagramManager = null
  }

  /**
   * Trigger diagram created event
   *
   * @private
   * @param{Diagram} diagram
   */
  triggerDiagramCreated (diagram) {
    var d = diagram ? this.repository.get(diagram._id) : null
    /**
     * Triggered when a diagram is created
     * @name diagramCreated
     * @kind event
     * @memberof Factory
     * @property {Diagram} diagram The created diagram
     */
    this.emit('diagramCreated', d)
  }

  /**
   * Trigger model and view elements created event
   *
   * @private
   * @param{Model} model
   * @param{View} view
   */
  triggerElementCreated (model, view) {
    var m = model ? this.repository.get(model._id) : null
    var v = view ? this.repository.get(view._id) : null
    if (m || v) {
      /**
       * Triggered when model and/or view elements are created
       * @name elementCreated
       * @kind event
       * @memberof Factory
       * @property {Model} model The created model element
       * @property {View} view The created view element
       */
      this.emit('elementCreated', m, v)
    }
  }

  assignInitObject (elem, initObj) {
    if (elem && initObj) {
      for (let key in initObj) {
        let value = initObj[key]
        if (_.isObject(value) && elem[key]) {
          this.assignInitObject(elem[key], value)
        } else {
          elem[key] = value
        }
      }
    }
  }

  getViewByTypes (diagram, canvas, x, y, viewTypes) {
    var i, len, _type, _view
    for (i = 0, len = viewTypes.length; i < len; i++) {
      _type = viewTypes[i]
      _view = diagram.getViewAt(canvas, x, y, true, _type)
      if (_view) {
        return _view
      }
    }
    return null
  }

  /**
   * Assert a condition. Throw a message if it fails
   * @private
   * @param {boolean} condition
   * @param {string} message
   * @throws exception
   */
  assert (condition, message) {
    if (!condition) {
      throw message || 'Assertion failed'
    }
  }

  /**
   * Create a diagram
   *
   * @param{{id:string, parent:Model, diagramType:string}} options
   * @return {Diagram}
   */
  createDiagram (options) {
    var fn = this.diagramFn[options.id]
    if (!fn) {
      console.error('Factory.createDiagram(): No such function of options.id: ' + options.id)
      return null
    }
    options.factory = this
    options.diagramType = options.diagramType || options.id
    return fn(options.parent, options)
  }

  /**
   * Create a model element
   *
   * @param{Object} options
   * @return {Model}
   */
  createModel (options) {
    var fn = this.modelFn[options.id]
    if (!fn) {
      console.error('Factory.createModel(): No such function of options.id: ' + options.id)
      return null
    }
    options.field = options.field || 'ownedElements'
    options.factory = this
    options.modelType = options.modelType || options.id
    return fn(options.parent, options.field, options)
  }

  /**
   * Create model and view elements
   *
   * @param{Object} options
   * @return {View}
   */
  createModelAndView (options) {
    var fn = this.modelAndViewFn[options.id]
    if (!fn) {
      console.error('Factory.createModelAndView(): No such function of id: ' + options.id)
      return null
    }
    options = options || {}
    options.factory = this
    options.modelType = options.modelType || options.id
    options.viewType = options.viewType || this.metamodelManager.getViewTypeOf(options.modelType)
    // parasitic option
    if (options.parasitic) {
      options.containerView = options.headView
      options.parent = options.headModel
    }
    // connectable-views option
    if (Array.isArray(options['connectable-views']) && options['connectable-views'].length > 0) {
      let viewTypes = options['connectable-views'].map(dt => { return type[dt] })
      options.tailView = this.getViewByTypes(options.diagram, options.editor.canvas, options.x1, options.y1, viewTypes)
      options.headView = this.getViewByTypes(options.diagram, options.editor.canvas, options.x2, options.y2, viewTypes)
      options.tailModel = options.tailView ? options.tailView.model : null
      options.headModel = options.headView ? options.headView.model : null
    }
    // self-connection option
    if (options['self-connection']) {
      options.tailModel = options.headModel
      options.tailView = options.headView
    }
    // min-width option
    if (options['min-width']) {
      let minWidth = options['min-width']
      if ((options.x2 - options.x1) < minWidth) {
        options.x2 = options.x1 + minWidth
      }
    }
    // min-height options
    if (options['min-height']) {
      let minHeight = options['min-height']
      if ((options.y2 - options.y1) < minHeight) {
        options.y2 = options.y1 + minHeight
      }
    }
    return fn(options.parent, options.diagram, options)
  }

  /**
   * Create a view element of a given model based on diagram type
   *
   * @param{Object} options
   */
  createViewOf (options) {
    var fn = this.viewOfFn[options.diagram.getClassName()]
    if (!fn) {
      console.error('Factory.createViewOf(): No function is registered for diagram type: ' + options.diagram.getClassName())
      return null
    }
    options = options || {}
    options.factory = this
    return fn(options.model, options.diagram, options)
  }

  /**
   * Return all available Ids for 'createDiagram' function
   * @private
   *
   * @return {Array.<string>}
   */
  getDiagramIds () {
    return _.keys(this.diagramFn)
  }

  /**
   * Return all available Ids for 'createModel' function
   * @private
   *
   * @return {Array.<string>}
   */
  getModelIds () {
    return _.keys(this.modelFn)
  }

  /**
   * Return all available Ids for 'createModelAndView' function
   * @private
   *
   * @return {Array.<string>}
   */
  getModelAndViewIds () {
    return _.keys(this.modelAndViewFn)
  }

  /**
   * Register a function to create diagram.
   * @private
   *
   * @param{string} id
   * @param{Function} fn
   */
  registerDiagramFn (id, fn) {
    if (this.diagramFn[id]) {
      console.error('Factory.registerDiagramFn(): Already registered id: ' + id)
      return
    }
    this.diagramFn[id] = fn
  }

  /**
   * Register a function to create a model element.
   * @private
   *
   * @param{string} id
   * @param{Function} fn
   */
  registerModelFn (id, fn) {
    if (this.modelFn[id]) {
      console.error('Factory.registerModelFn(): Already registered id: ' + id)
      return
    }
    this.modelFn[id] = fn
  }

  /**
   * Register a function to create both model and view elements.
   * @private
   *
   * @param{string} id
   * @param{Function} fn
   * @param{Object} defaultOptions
   */
  registerModelAndViewFn (id, fn, defaultOptions) {
    if (this.modelAndViewFn[id]) {
      console.error('Factory.registerModelAndViewFn(): Already registered id: ' + id)
      return
    }
    if (defaultOptions) {
      this.modelAndViewOptions[id] = defaultOptions
    }
    this.modelAndViewFn[id] = fn
  }

  /**
   * Register a function to create a view element based on diagram type.
   * @private
   *
   * @param{string} diagramType
   * @param{Function} fn
   */
  registerViewOfFn (diagramType, fn) {
    if (this.viewOfFn[diagramType]) {
      console.error('Factory.registerViewOfFn(): Already registered diagram type: ' + diagramType)
      return
    }
    this.viewOfFn[diagramType] = fn
  }

  /**
   * @private
   * Default precondition for model creation
   * @param{Object} options
   */
  _defaultModelPrecondition (options) {
    app.factory.assert(
      options.parent instanceof type.Model,
      Mustache.render(ERR_INVALID_PARENT, options.modelType)
    )
  }

  /**
   * Default function to create diagram.
   * @private
   *
   * @param {Model} parent
   * @param {Object} options Options = { precondition, diagramType, diagramInitializer }
   */
  defaultDiagramFn (parent, options) {
    var DiagramType = type[options.diagramType]
    var field = options.field || 'ownedElements'
    var precondition = options.precondition || this._defaultModelPrecondition
    var diagramInitializer = options.diagramInitializer || null
    var diagram

    // Check precondition
    if (precondition) {
      options.parent = parent
      precondition(options)
    }

    // Create model element;
    diagram = new DiagramType()
    diagram.name = Core.Element.getNewName(parent[field], diagram.getDisplayClassName())
    if (diagramInitializer) {
      diagramInitializer(diagram)
    }
    this.engine.addModel(parent, field, diagram)

    if (diagram) {
      diagram = this.repository.get(diagram._id)
    }
    // Trigger event
    this.triggerDiagramCreated(diagram)
    return diagram
  }

  /**
   * Default function to create model element.
   * @private
   *
   * @param {Model} parent
   * @param {string} field
   * @param {Object} options Options = { precondition, modelType, field, modelInitializer }
   */
  defaultModelFn (parent, field, options) {
    var ModelType = type[options.modelType]
    var precondition = options.precondition || this._defaultModelPrecondition
    var modelInitializer = options.modelInitializer || null
    var model

    // Check precondition
    if (precondition) {
      options.parent = parent
      precondition(options)
    }

    // Create model element;
    model = new ModelType()
    model.name = Core.Element.getNewName(parent[field], options['generate-name'] || model.getDisplayClassName())
    this.assignInitObject(model, options['model-init'])
    if (modelInitializer) {
      modelInitializer(model)
    }
    this.engine.addModel(parent, field, model)

    if (model) {
      model = this.repository.get(model._id)
    }
    // Trigger event
    this.triggerElementCreated(model, null)

    return model
  }

  /**
   * Default function to create model and view elements.
   * @private
   *
   * @param {Model} parent
   * @param {Diagram} diagram
   * @param {Object} options Options = { precondition, modelType, viewType,
   *      field, model-init, view-init, modelInitializer, viewInitializer, x1, y1, x2, y2, containerView }
   */
  defaultModelAndViewFn (parent, diagram, options) {
    // Set default options
    if (this.modelAndViewOptions[options.id]) {
      _.extend(options, this.modelAndViewOptions[options.id])
    }

    var ModelType = type[options.modelType]
    var ViewType = type[options.viewType]
    var precondition = options.precondition || this._defaultModelPrecondition
    var field = options.field || 'ownedElements'
    var modelInitializer = options.modelInitializer || null
    var viewInitializer = options.viewInitializer || null
    var x1 = options.x1 || 0
    var y1 = options.y1 || 0
    var x2 = options.x2 || 0
    var y2 = options.y2 || 0
    var containerView = options.containerView || null
    var model, view

    // Check precondition
    if (precondition) {
      options.parent = parent
      options.diagram = diagram
      precondition(options)
    }

    // Create model element
    model = new ModelType()
    model.name = Core.Element.getNewName(parent[field], options['generate-name'] || model.getDisplayClassName())
    model._parent = parent
    this.assignInitObject(model, options['model-init'])
    if (modelInitializer) {
      modelInitializer(model)
    }
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('Create ' + model.getDisplayClassName())
    operationBuilder.insert(model)
    operationBuilder.fieldInsert(parent, field, model)

    // Create view element
    view = new ViewType()
    view.initialize(null, x1, y1, x2, y2)
    view.model = model
    view._parent = diagram
    this.assignInitObject(view, options['view-init'])
    if (viewInitializer) {
      viewInitializer(view)
    }
    if (containerView) {
      view.containerView = containerView
    }

    operationBuilder.insert(view)
    operationBuilder.fieldInsert(diagram, 'ownedViews', view)
    if (containerView) {
      operationBuilder.fieldInsert(containerView, 'containedViews', view)
    }

    // Apply operation
    operationBuilder.end()
    var op = operationBuilder.getOperation()
    this.repository.doOperation(op)

    // Trigger event
    if (view) {
      view = this.repository.get(view._id)
    }
    if (model) {
      model = this.repository.get(model._id)
    }
    this.triggerElementCreated(model, view)
    return view || model
  }

  /**
   * Default function to create model and view elements of UndirectedRelationship.
   * @private
   *
   * @param {Model} parent
   * @param {Diagram} diagram
   * @param {Object} options Options = { precondition, modelType, viewType,
   *      field, modelInitializer, viewInitializer, x1, y1, x2, y2, containerView }
   */
  defaultUndirectedRelationshipFn (parent, diagram, options) {
    // Set default options
    if (this.modelAndViewOptions[options.id]) {
      _.extend(options, this.modelAndViewOptions[options.id])
    }

    var ModelType = type[options.modelType]
    var ViewType = type[options.viewType]
    var precondition = options.precondition || this._defaultModelPrecondition
    var field = options.field || 'ownedElements'
    var modelInitializer = options.modelInitializer || null
    var viewInitializer = options.viewInitializer || null
    var x1 = options.x1 || 0
    var y1 = options.y1 || 0
    var x2 = options.x2 || 0
    var y2 = options.y2 || 0
    var tailView = options.tailView || null
    var headView = options.headView || null
    var tailModel = options.tailModel || null
    var headModel = options.headModel || null
    var model, view

    // Check precondition
    if (precondition) {
      options.parent = parent
      options.diagram = diagram
      precondition(options)
    }

    // Create model element
    model = new ModelType()
    model._parent = parent
    model.end1.reference = tailModel
    model.end2.reference = headModel
    this.assignInitObject(model, options['model-init'])
    if (modelInitializer) {
      modelInitializer(model)
    }
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('Create ' + model.getDisplayClassName())
    operationBuilder.insert(model)
    operationBuilder.fieldInsert(parent, field, model)

    // Create view element
    view = new ViewType()
    view.model = model
    view._parent = diagram
    view.tail = tailView
    view.head = headView
    view.initialize(null, x1, y1, x2, y2)
    this.assignInitObject(view, options['view-init'])
    if (viewInitializer) {
      viewInitializer(view)
    }
    operationBuilder.insert(view)
    operationBuilder.fieldInsert(diagram, 'ownedViews', view)

    // Apply operation
    operationBuilder.end()
    var op = operationBuilder.getOperation()
    this.repository.doOperation(op)

    // Trigger event
    if (view) {
      view = this.repository.get(view._id)
    }
    if (model) {
      model = this.repository.get(model._id)
    }
    this.triggerElementCreated(model, view)
    return view || model
  }

  /**
   * Default function to create model and view elements of DirectedRelationship.
   * @private
   * @param {Model} parent
   * @param {Diagram} diagram
   * @param {Object} options Options = { precondition, modelType, viewType,
   *      field, modelInitializer, viewInitializer, x1, y1, x2, y2, containerView }
   */
  defaultDirectedRelationshipFn (parent, diagram, options) {
    // Set default options
    if (this.modelAndViewOptions[options.id]) {
      _.extend(options, this.modelAndViewOptions[options.id])
    }

    console.log(options)

    var ModelType = type[options.modelType]
    var ViewType = type[options.viewType]
    var precondition = options.precondition || this._defaultModelPrecondition
    var field = options.field || 'ownedElements'
    var modelInitializer = options.modelInitializer || null
    var viewInitializer = options.viewInitializer || null
    var x1 = options.x1 || 0
    var y1 = options.y1 || 0
    var x2 = options.x2 || 0
    var y2 = options.y2 || 0
    var tailView = options.tailView || null
    var headView = options.headView || null
    var tailModel = options.tailModel || null
    var headModel = options.headModel || null
    var model, view

    // Check precondition
    if (precondition) {
      options.parent = parent
      options.diagram = diagram
      precondition(options)
    }

    console.log(tailModel)
    console.log(headModel)

    // Create model element
    model = new ModelType()
    model._parent = parent
    model.source = tailModel
    model.target = headModel
    this.assignInitObject(model, options['model-init'])
    if (modelInitializer) {
      modelInitializer(model)
    }
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('Create ' + model.getDisplayClassName())
    operationBuilder.insert(model)
    operationBuilder.fieldInsert(parent, field, model)

    // Create view element
    view = new ViewType()
    view.model = model
    view._parent = diagram
    view.tail = tailView
    view.head = headView
    view.initialize(null, x1, y1, x2, y2)
    this.assignInitObject(view, options['view-init'])
    if (viewInitializer) {
      viewInitializer(view)
    }
    operationBuilder.insert(view)
    operationBuilder.fieldInsert(diagram, 'ownedViews', view)

    // Apply operation
    operationBuilder.end()
    var op = operationBuilder.getOperation()
    this.repository.doOperation(op)

    // Trigger event
    if (view) {
      view = this.repository.get(view._id)
    }
    if (model) {
      model = this.repository.get(model._id)
    }
    this.triggerElementCreated(model, view)
    return view || model
  }

  /**
   * Default function to create view element only.
   * @private
   *
   * @param {Model} parent
   * @param {Diagram} diagram
   * @param {Object} options Options = { precondition, viewType,
   *      viewInitializer, x1, y1, x2, y2, containerView }
   */
  defaultViewOnlyFn (parent, diagram, options) {
    // Set default options
    if (this.modelAndViewOptions[options.id]) {
      _.extend(options, this.modelAndViewOptions[options.id])
    }

    var ViewType = type[options.viewType]
    var precondition = options.precondition || null
    var viewInitializer = options.viewInitializer || null
    var x1 = options.x1 || 0
    var y1 = options.y1 || 0
    var x2 = options.x2 || 0
    var y2 = options.y2 || 0
    var view

    // Check precondition
    if (precondition) {
      options.parent = parent
      options.diagram = diagram
      precondition(options)
    }

    view = new ViewType()
    view.initialize(null, x1, y1, x2, y2)
    this.assignInitObject(view, options['view-init'])
    if (viewInitializer) {
      viewInitializer(view)
    }
    this.engine.addViews(diagram, [view])

    // Trigger event
    if (view) {
      view = this.repository.get(view._id)
    }
    this.triggerElementCreated(null, view)
    return view
  }

  /**
   * Default function to create edge view element only.
   * @private
   *
   * @param {Model} parent
   * @param {Diagram} diagram
   * @param {Object} options Options = { precondition, viewType,
   *      viewInitializer, x1, y1, x2, y2, containerView }
   */
  defaultEdgeViewOnlyFn (parent, diagram, options) {
    // Set default options
    if (this.modelAndViewOptions[options.id]) {
      _.extend(options, this.modelAndViewOptions[options.id])
    }

    var ViewType = type[options.viewType]
    var precondition = options.precondition || null
    var viewInitializer = options.viewInitializer || null
    var x1 = options.x1 || 0
    var y1 = options.y1 || 0
    var x2 = options.x2 || 0
    var y2 = options.y2 || 0
    var tailView = options.tailView || null
    var headView = options.headView || null
    var view

    // Check precondition
    if (precondition) {
      options.parent = parent
      options.diagram = diagram
      precondition(options)
    }

    // Create view element
    view = new ViewType()
    view.tail = tailView
    view.head = headView
    view.initialize(null, x1, y1, x2, y2)
    this.assignInitObject(view, options['view-init'])
    if (viewInitializer) {
      viewInitializer(view)
    }
    this.engine.addViews(diagram, [view])

    // Trigger event
    if (view) {
      view = this.repository.get(view._id)
    }
    this.triggerElementCreated(null, view)
    return view
  }

  /**
   * Create a view of a given model with relationship views
   *
   * @param {Editor} editor
   * @param {number} x
   * @param {number} y
   * @param {Model} model
   * @param {View} containerView
   * @param {constructor} viewType
   */
  createViewAndRelationships (editor, x, y, model, containerView, viewType) {
    var ViewType = viewType || model.getViewType()
    var diagram = editor.diagram
    var view
    let operationBuilder = this.repository.getOperationBuilder()
    operationBuilder.begin('add view with relations')
    if (ViewType) {
      view = new ViewType()
      view.model = model
      view.initialize(null, x, y, x, y)
      view._parent = diagram

      // TODO: UML Specific Parts (need to be refactored)
      if (view instanceof type.UMLGeneralNodeView && diagram._parent !== model._parent) {
        view.showNamespace = true
      }

      // add the view
      operationBuilder.insert(view)
      operationBuilder.fieldInsert(diagram, 'ownedViews', view)
      if (containerView) {
        operationBuilder.fieldAssign(view, 'containerView', containerView)
        operationBuilder.fieldInsert(containerView, 'containedViews', view)
      }

      // TODO: UML Specific Parts (need to be refactored)
      // add ConstraintLinkViews (when creating ConstraintView)
      if (view instanceof type.UMLConstraintView) {
        _.each(diagram.ownedViews, v => {
          if (v.model === view.model._parent) {
            var linkView = new type.UMLConstraintLinkView()
            linkView._parent = diagram
            linkView.tail = view
            linkView.head = v
            linkView.initialize(null, linkView.tail.left, linkView.tail.top, linkView.head.left, linkView.head.top)
            operationBuilder.insert(linkView)
            operationBuilder.fieldInsert(diagram, 'ownedViews', linkView)
          }
        })
      }

      // add relation views
      _.each(this.repository.getRelationshipsOf(model), rel => {
        var RelViewType = rel.getViewType()
        var relView

        if (RelViewType) {
          // for Directed Relationships
          if (rel instanceof type.DirectedRelationship) {
            _.each(diagram.ownedViews, v => {
              if ((v.model === rel.target) && (model === rel.source)) {
                relView = new RelViewType()
                relView._parent = diagram
                relView.model = rel
                relView.tail = view
                relView.head = v
                relView.initialize(null, relView.tail.left, relView.tail.top, relView.head.left, relView.head.top)
                operationBuilder.insert(relView)
                operationBuilder.fieldInsert(diagram, 'ownedViews', relView)
              } else if ((v.model === rel.source) && (model === rel.target)) {
                relView = new RelViewType()
                relView._parent = diagram
                relView.model = rel
                relView.tail = v
                relView.head = view
                relView.initialize(null, relView.tail.left, relView.tail.top, relView.head.left, relView.head.top)
                operationBuilder.insert(relView)
                operationBuilder.fieldInsert(diagram, 'ownedViews', relView)
              }
            })

            // create self-links.
            if ((rel.source === rel.target) && (rel.source === model)) {
              relView = new RelViewType()
              relView._parent = diagram
              relView.model = rel
              relView.tail = view
              relView.head = view
              relView.initialize(null, relView.tail.left, relView.tail.top, relView.head.left, relView.head.top)
              operationBuilder.insert(relView)
              operationBuilder.fieldInsert(diagram, 'ownedViews', relView)
            }

            // for Undirected Relationships
          } else if (rel instanceof type.UndirectedRelationship) {
            _.each(diagram.ownedViews, v => {
              if ((v.model === rel.end2.reference) && (model === rel.end1.reference)) {
                relView = new RelViewType()
                relView._parent = diagram
                relView.model = rel
                relView.tail = view
                relView.head = v
                relView.initialize(null, relView.tail.left, relView.tail.top, relView.head.left, relView.head.top)
                operationBuilder.insert(relView)
                operationBuilder.fieldInsert(diagram, 'ownedViews', relView)
              } else if ((v.model === rel.end1.reference) && (model === rel.end2.reference)) {
                relView = new RelViewType()
                relView._parent = diagram
                relView.model = rel
                relView.tail = v
                relView.head = view
                relView.initialize(null, relView.tail.left, relView.tail.top, relView.head.left, relView.head.top)
                operationBuilder.insert(relView)
                operationBuilder.fieldInsert(diagram, 'ownedViews', relView)
              }
            })

            // create self-links.
            if ((rel.end1.reference === rel.end2.reference) && (rel.end1.reference === model)) {
              relView = new RelViewType()
              relView._parent = diagram
              relView.model = rel
              relView.tail = view
              relView.head = view
              relView.initialize(null, relView.tail.left, relView.tail.top, relView.head.left, relView.head.top)
              operationBuilder.insert(relView)
              operationBuilder.fieldInsert(diagram, 'ownedViews', relView)
            }
          }
        }
      })
      operationBuilder.end()
      var cmd = operationBuilder.getOperation()
      this.repository.doOperation(cmd)
    }

    // Trigger event
    if (view) {
      view = this.repository.get(view._id)
    }
    this.triggerElementCreated(null, view)
    return view
  }

  /**
   * Default function to create view of a particular model on a diagram.
   * @private
   *
   * @param {Model} model
   * @param {Diagram} diagram
   * @param {Object} options
   */
  defaultViewOnDiagramFn (model, diagram, options) {
    var x = options.x || 0
    var y = options.y || 0
    var editor = options.editor || this.diagramManager.getEditor()

    // Directed Relationships
    if (model instanceof type.DirectedRelationship) {
      var directedView = diagram.getViewOf(model)
      var sourceView = diagram.getViewOf(model.source)
      var targetView = diagram.getViewOf(model.target)
      if (directedView) {
        editor.selectView(directedView)
        editor.selectAdditionalView(sourceView)
        editor.selectAdditionalView(targetView)
        app.dialogs.showAlertDialog('Relationship View is already existed in this Diagram.')
      } else {
        if (!targetView) {
          return this.createViewAndRelationships(editor, x, y, model.target)
        }
        if (!sourceView) {
          return this.createViewAndRelationships(editor, x, y + 100, model.source)
        }
        if (targetView && sourceView) {
          var DirectedViewType = model.getViewType()
          if (DirectedViewType) {
            directedView = new DirectedViewType()
            directedView._parent = diagram
            directedView.model = model
            directedView.tail = sourceView
            directedView.head = targetView
            directedView.initialize(null, directedView.tail.left, directedView.tail.top, directedView.head.left, directedView.head.top)
            this.engine.addViews(diagram, [directedView])
            if (directedView) {
              directedView = this.repository.get(directedView._id)
            }
            editor.selectView(directedView)
            return directedView
          }
        }
      }

    // Undirected Relationships
    } else if (model instanceof type.UndirectedRelationship) {
      var undirectedView = diagram.getViewOf(model)
      var end1View = diagram.getViewOf(model.end1.reference)
      var end2View = diagram.getViewOf(model.end2.reference)
      if (undirectedView) {
        editor.selectView(undirectedView)
        editor.selectAdditionalView(end1View)
        editor.selectAdditionalView(end2View)
        app.dialogs.showAlertDialog('Relationship View is already existed in this Diagram.')
      } else {
        if (!end2View) {
          return this.createViewAndRelationships(editor, x, y, model.end2.reference)
        }
        if (!end1View) {
          return this.createViewAndRelationships(editor, x, y + 100, model.end1.reference)
        }
        if (end1View && end2View) {
          var UndirectedViewType = model.getViewType()
          if (UndirectedViewType) {
            undirectedView = new UndirectedViewType()
            undirectedView._parent = diagram
            undirectedView.model = model
            undirectedView.tail = end1View
            undirectedView.head = end2View
            undirectedView.initialize(null, undirectedView.tail.left, undirectedView.tail.top, undirectedView.head.left, undirectedView.head.top)
            this.engine.addViews(diagram, [undirectedView])
            if (undirectedView) {
              undirectedView = this.repository.get(undirectedView._id)
            }
            editor.selectView(undirectedView)
            return undirectedView
          }
        }
      }
    } else if (model instanceof type.Diagram) {
      if (model === diagram) {
        options.viewType = 'UMLFrameView'
        options.x1 = x
        options.y1 = y
        options.x2 = x + 700
        options.y2 = y + 600
        options.diagram = diagram
        options.viewInitializer = (elem) => {
          elem.model = model
        }
        return this.defaultViewOnlyFn(diagram._parent, diagram, options)
      } else {
        options.id = 'Hyperlink'
        options.x1 = x
        options.y1 = y
        options.x2 = x
        options.y2 = y
        options.parent = diagram._parent
        options.diagram = diagram
        options.modelInitializer = (elem) => {
          elem.reference = model
        }
        return this.createModelAndView(options)
      }
    } else {
      return this.createViewAndRelationships(editor, x, y, model)
    }
  }

}

module.exports = Factory
