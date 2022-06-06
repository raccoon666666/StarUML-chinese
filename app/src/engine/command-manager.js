/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const {EventEmitter} = require('events')

/**
 * Manages global application commands that can be called from menu items, key bindings, or subparts
 * of the application.
 */
class CommandManager extends EventEmitter {

  constructor () {
    super()
    /**
     * Map of all registered global commands
     * @member Map<string, Command>
     */
    this.commands = {}

    /**
     * Command names
     * @member Map<string, string>
     */
    this.commandNames = {}
  }

  /**
   * Registers a global command.
   * @param {string} id - unique identifier for command.
   *      Core commands in app use a simple command title as an id, for example "open.file".
   *      Extensions should use the following format: "author.myextension.mycommandname".
   *      For example, "lschmitt.csswizard.format.css".
   * @param {function} commandFn - the function to call when the command is executed. Any arguments passed to
   *     execute() (after the id) are passed as arguments to the function. If the function is asynchronous,
   *     it must return a jQuery promise that is resolved when the command completes. Otherwise, the
   *     CommandManager will assume it is synchronous, and return a promise that is already resolved.
   * @param {string} name - The name of command.
   */
  register (id, commandFn, name) {
    if (this.commands[id]) {
      console.log('Attempting to register an already-registered command: ' + id)
      return null
    }
    if (!id || !commandFn) {
      console.error('Attempting to register a command with a missing id, or command function.')
      return null
    }
    this.commands[id] = commandFn
    if (name) {
      this.commandNames[id] = name
    }

    /**
     * Triggered when a command is registered
     * @name commandRegistered
     * @kind event
     * @memberof CommandManager
     * @property {string} id The ID of the command
     */
    this.emit('commandRegistered', id)
  }

  /**
   * Looks up and runs a global command. Additional arguments are passed to the command.
   *
   * @param {string} id The ID of the command to run.
   * @return {object} Result of the registered command function
   */
  execute (id, ...args) {
    var commandFn = this.commands[id]
    if (commandFn) {
      try {
        /**
         * Triggered before a command is executed
         * @name beforeExecuteCommand
         * @kind event
         * @memberof CommandManager
         * @property {string} id The ID of the command
         */
        this.emit('beforeExecuteCommand', id)
      } catch (err) {
        console.error(err)
      }
      const result = commandFn(...args)
      return result
    } else {
      return false
    }
  }
}

module.exports = CommandManager
