/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the 'Software'),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const _ = require('lodash')

rules.push(
  {
    id: 'ERD001',
    message: 'Primary key cannot be nullable.',
    appliesTo: [ 'ERDColumn' ],
    exceptions: [],
    constraint: function (elem) {
      if (elem.primaryKey === true && elem.nullable === true) {
        return false
      }
      return true
    }
  }
)

rules.push(
  {
    id: 'ERD002',
    message: 'No relationship with the foreign key reference.',
    appliesTo: [ 'ERDColumn' ],
    exceptions: [],
    constraint: function (elem) {
      if (elem.foreignKey && elem.referenceTo) {
        var ends = elem._parent.getRelationshipEnds(true)
        return _.some(ends, function (e) {
          return e.reference === elem.referenceTo._parent
        })
      }
      return true
    }
  }
)
