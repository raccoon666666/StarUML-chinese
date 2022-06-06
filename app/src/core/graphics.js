/* eslint-disable no-inner-declarations */
/*
 * Copyright (c) 2014 MKLab. All rights reserved.
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

const _ = require('lodash')

/**
 * @private
 * Color Object
 */
const Color = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  DARK_GRAY: '#404040',
  LIGHT_GRAY: '#C0C0C0',
  RED: '#FF0000',
  GREEN: '#00FF00',
  BLUE: '#0000FF',
  CYAN: '#00FFFF',
  MAGENTA: '#FF00FF',
  ORANGE: '#FFC800',
  PINK: '#FFAFAF',
  YELLOW: '#FFFF00'
}

global.meta.Font = {
  kind: 'datatype'
}

global.meta.Points = {
  kind: 'datatype'
}

/*
 * Default Color Palette
 */
const DEFAULT_COLOR_PALETTE = [
  '#d8f2ff', '#d8e5ff', '#d8d8ff', '#ebd8ff', '#ffd8ff', '#ffd8eb', '#ffd8d8', '#ffe2d8', '#ffebd8', '#fff5d8', '#ffffd8', '#ebffd8', '#d8ffd8', '#d8ffeb', '#d8fff8', '#ffffff',
  '#a3e0ff', '#adc8ff', '#adadff', '#d6adff', '#ffa3ff', '#ffadd6', '#ffadad', '#ffc1ad', '#ffd6ad', '#ffeaad', '#ffff91', '#d1ffa3', '#a3ffa3', '#a3ffd1', '#91ffec', '#e2e2e2',
  '#6dceff', '#82abff', '#8282ff', '#c082ff', '#ff6dff', '#ff82c0', '#ff8282', '#ffa182', '#ffc082', '#ffdf82', '#ffff49', '#b6ff6d', '#6dff6d', '#6dffb6', '#49ffe0', '#c6c6c6',
  '#38bcff', '#568eff', '#5656ff', '#aa56ff', '#ff38ff', '#ff56aa', '#ff5656', '#ff8056', '#ffaa56', '#ffd456', '#ffff00', '#9bff38', '#38ff38', '#38ff9b', '#00ffd4', '#aaaaaa',
  '#00a9ff', '#2b71ff', '#2b2bff', '#952bff', '#ff00ff', '#ff2b95', '#ff2b2b', '#ff602b', '#ff952b', '#ffca2b', '#d8d800', '#7fff00', '#00ff00', '#00ff7f', '#00d8b4', '#8e8e8e',
  '#008ed6', '#0055ff', '#0000ff', '#7f00ff', '#d600d6', '#ff007f', '#ff0000', '#ff3f00', '#ff7f00', '#ffbf00', '#b7b700', '#6cd800', '#00d600', '#00d369', '#00b799', '#707070',
  '#0073ad', '#0044cc', '#0000d1', '#6600cc', '#ad00ad', '#cc0066', '#d10000', '#d63500', '#d16800', '#cc9900', '#969600', '#59b200', '#00ad00', '#00a854', '#00967d', '#545454',
  '#005884', '#003399', '#0000a0', '#4c0099', '#840084', '#99004c', '#a00000', '#a82a00', '#a05000', '#997200', '#757500', '#468c00', '#008400', '#007c3e', '#007561', '#383838',
  '#003d5b', '#002266', '#000070', '#330066', '#5b005b', '#660033', '#700000', '#7a1e00', '#703800', '#664c00', '#545400', '#336600', '#005b00', '#005128', '#005446', '#1c1c1c',
  '#002133', '#001133', '#00003f', '#190033', '#330033', '#330019', '#3f0000', '#4c1300', '#3f1f00', '#332600', '#333300', '#1f3f00', '#003300', '#002613', '#00332a', '#000000'
]

/**
 * Point class
 * @private
 * @param {number} x
 * @param {number} y
 */
class Point {
  constructor (x, y) {
    /**
     * @member {number}
     */
    this.x = x

    /**
     * @member {number}
     */
    this.y = y
  }

  /**
   * Copy Point
   * @return {Point} self-copied object
   */
  copy () {
    return new Point(this.x, this.y)
  }

  /**
   * Add point
   * @param {Point} p - add p.x to x and p.y to y
   */
  add (p) {
    this.x += p.x
    this.y += p.y
  }

  /**
   * Subtract a point
   * @param {Point} p
   */
  subtract (p) {
    this.x -= p.x
    this.y -= p.y
  }

  /**
   * Set point's coordinate x, y
   * @param {number} x
   * @param {number} y
   */
  setPoint (x, y) {
    this.x = x
    this.y = y
  }

  /**
   * Set point's coordinate x, y of p
   * @param {Point} p
   */
  setPoint2 (p) {
    this.x = p.x
    this.y = p.y
  }

  /**
   * Quantize point's coordinate x, y
   * @param {Point} p
   */
  quantize () {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)
  }
}

/**
 * Rect Class
 * @private
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
class Rect {

  constructor (x1, y1, x2, y2) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }

  /**
   * Copy Rect
   * @return {Rect} self-copied rect object
   */
  copy () {
    return new Rect(this.x1, this.y1, this.x2, this.y2)
  }

  /**
   * Add a point to Rect (same as move Rect as p.x and p.y)
   * @param {Point} p
   */
  add (p) {
    this.x1 += p.x
    this.y1 += p.y
    this.x2 += p.x
    this.y2 += p.y
  }

  /**
   * Subtract a point
   * @param {Point} p
   */
  subtract (p) {
    this.x1 -= p.x
    this.y1 -= p.y
    this.x2 -= p.x
    this.y2 -= p.y
  }

  /**
   * Set Rect's coordinates
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  setRect (x1, y1, x2, y2) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }

  /**
   * Set Rect's coordinates from r
   * @param {Rect} r
   */
  setRect2 (r) {
    this.x1 = r.x1
    this.y1 = r.y1
    this.x2 = r.x2
    this.y2 = r.y2
  }

  /**
   * Set Rect's coordinates
   * @param {Point} p1
   * @param {Point} p2
   */
  setRect3 (p1, p2) {
    this.x1 = p1.x
    this.y1 = p1.y
    this.x2 = p2.x
    this.y2 = p2.y
  }

  /**
   * Expand Rect as delta
   * @param {number} delta
   */
  expand (delta) {
    this.x1 = this.x1 - delta
    this.y1 = this.y1 - delta
    this.x2 = this.x2 + delta
    this.y2 = this.y2 + delta
  }

  /**
   * Union r into this rect. (this rect and r should be normalized)
   * @param {Rect} r
   */
  union (r) {
    if (r.x1 < this.x1) { this.x1 = r.x1 }
    if (r.y1 < this.y1) { this.y1 = r.y1 }
    if (r.x2 > this.x2) { this.x2 = r.x2 }
    if (r.y2 > this.y2) { this.y2 = r.y2 }
  }

  /**
   * Get Center point of Rect
   * @return {Point}
   */
  getCenter () {
    return new Point(Math.floor((this.x1 + this.x2) / 2), Math.floor((this.y1 + this.y2) / 2))
  }

  /**
   * Get width of Rect
   * @return {number}
   */
  getWidth () {
    return Math.abs(this.x2 - this.x1)
  }

  /**
   * Get height of Rect
   * @return {number}
   */
  getHeight () {
    return Math.abs(this.y2 - this.y1)
  }

  /**
   * Get ratio percent : (width / height) * 100
   * @return {number}
   */
  getRatioPercent () {
    return (this.getWidth() * 100) / this.getHeight()
  }

  /**
   * Quantize coordinates of rect
   */
  quantize () {
    this.x1 = Math.round(this.x1)
    this.y1 = Math.round(this.y1)
    this.x2 = Math.round(this.x2)
    this.y2 = Math.round(this.y2)
  }
}

/**
 * Font
 */
class Font {

  constructor (face, size, style) {
    /**
     * Font face
     * @member {string}
     */
    this.face = face || 'Arial'

    /**
     * Font size
     * @member {string}
     */
    this.size = size || 12

    /**
     * Font style
     * @member {string}
     */
    this.style = style || Font.FS_NORMAL
  }

  /**
   * Set Font
   * @private
   * @param {string} face
   * @param {number} size
   * @param {number} style
   */
  set (face, size, style) {
    this.face = face
    this.size = size
    this.style = style
  }

  /**
   * Assign Font
   * @private
   * @param {Font} font
   */
  assign (font) {
    this.set(font.face, font.size, font.style)
  }

  /**
   * Copy Font
   * @private
   * @return {font} self-copied Font object
   */
  copy () {
    var font = new Font(this.face, this.size, this.style)
    return font
  }

  /**
   * @private
   * Define custom write method
   * - Refer to Core.Writer.prototype.writeCustom
   */
  __write () {
    return this.face + ';' + this.size + ';' + this.style
  }

  /**
   * @private
   * Define custom read method
   * - Refer to Repository.Reader.prototype.readCustom
   */
  __read (value) {
    var terms
    terms = value.split(';')
    if (terms[0] !== '?') {
      this.face = terms[0]
    }
    if (terms[1] !== '?') {
      this.size = terms[1] * 1
    }
    if (terms[2] !== '?') {
      this.style = terms[2] * 1
    }
  }
}

/**
 * Font Style: Normal (0)
 * @const {number}
 */
Font.FS_NORMAL = 0

/**
 * Font Style: Bold (1)
 * @const {number}
 */
Font.FS_BOLD = 1

/**
 * Font Style: Italic (2)
 * @const {number}
 */
Font.FS_ITALIC = 2

/**
 * Font Style: Bold Italic (3)
 * @const {number}
 */
Font.FS_BOLD_ITALIC = 3

/**
 * ZoomFactor
 * @private
 */
class ZoomFactor {

  constructor (numer, denom) {
    this.numer = numer
    this.denom = denom
  }

  /**
   * Set Scale
   * @param {number} value - scale value between 0..1
   */
  setScale (value) {
    this.numer = value
    this.denom = 1
  }

  /**
   * Get Scale
   * @return {number} scale value between 0..1
   */
  getScale () {
    return this.numer / this.denom
  }

}

/**
 * GridFactor
 * @private
 */
class GridFactor {

  constructor (width, height) {
    this.width = width
    this.height = height
  }

}

GridFactor.NO_GRID = new GridFactor(1, 1)

/**
 * Points
 * @private
 */
class Points {

  constructor () {
    this.points = []
  }

  /**
   * Clear points
   */
  clear () {
    this.points.length = 0
  }

  /**
   * Copy points
   * @return {Points}
   */
  copy () {
    var pts
    pts = new Points()
    pts.assign(this)
    return pts
  }

  /**
   * Assign given Points object to this points
   * @param {Points} pts
   */
  assign (pts) {
    this.points.length = 0
    for (var i = 0, len = pts.points.length; i < len; i++) {
      var p = pts.points[i]
      this.points.push(p.copy())
    }
  }

  /**
   * Add a point
   * @param {Point} p
   */
  add (p) {
    this.points.push(p)
  }

  /**
   * Insert a point at a specific index
   * @param {number} index
   * @param {Point} p
   */
  insert (index, p) {
    this.points.splice(index, 0, p)
  }

  /**
   * Remove a point at index
   * @param {number} index
   */
  remove (index) {
    this.points.splice(index, 1)
  }

  /**
   * Replace a point p at index
   * @param {number} index
   * @param {Point} p
   */
  setPoint (index, p) {
    this.points[index] = p
  }

  /**
   * Replace x, y of the point at index
   * @param {number} index
   * @param {number} x
   * @param {number} y
   */
  setPoint2 (index, x, y) {
    this.points[index].x = x
    this.points[index].y = y
  }

  /**
   * Get Point at index
   * @param {number} index
   * @return {Point}
   */
  getPoint (index) {
    return this.points[index]
  }

  /**
   * Return all x values of all points
   * @return {Array.<number>}
   */
  getXPoints () {
    var p, xs, _i, _len, _ref
    xs = []
    _ref = this.points
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i]
      xs.push(p.x)
    }
    return xs
  }

  /**
   * Return all y values of all points
   * @return {Array.<number>}
   */
  getYPoints () {
    var p, ys, _i, _len, _ref
    ys = []
    _ref = this.points
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i]
      ys.push(p.y)
    }
    return ys
  }

  /**
   * Return number of points
   * @return {number}
   */
  count () {
    return this.points.length
  }

  /**
   * Reduce points for orthogonal line
   */
  reduceOrthoLine () {
    var i = 0
    while (i < this.points.length - 2) {
      var p1 = this.getPoint(i).copy()
      var p2 = this.getPoint(i + 1).copy()
      var p3 = this.getPoint(i + 2).copy()
      if ((p1.x === p2.x) && (p1.y === p2.y)) {
        this.remove(i)
      } else if (((p1.x === p2.x) && (p2.x === p3.x)) || ((p1.y === p2.y) && (p2.y === p3.y))) {
        this.remove(i + 1)
      } else {
        i++
      }
    }
  }

  /**
   * Reduce points for line
   */
  reduceLine () {
    var i = 0
    while (i < this.points.length - 2) {
      var p1 = this.getPoint(i).copy()
      var p2 = this.getPoint(i + 1).copy()
      var p3 = this.getPoint(i + 2).copy()
      if (Coord.equalPt(p1, p2)) {
        this.remove(i)
      } else if (Coord.ptsInLine(p1, p2, p3)) {
        this.remove(i + 1)
      } else {
        i++
      }
    }
  }

  /**
   * Return wether is this rectilinear line or not
   */
  isRectilinear () {
    for (var i = 1, len = this.points.length; i < len; i++) {
      var p0 = this.points[i - 1]
      var p1 = this.points[i]
      if ((p0.x !== p1.x) && (p0.y !== p1.y)) {
        return false
      }
    }
    return true
  }

  /**
   * Convert oblique line to rectilinear line
   */
  convObliqueToRectilinear () {
    var i = 0
    while (i < this.count() - 1) {
      this.insert(i + 1, Coord.makeOrthoPt(this.getPoint(i), this.getPoint(i + 1)))
      i = i + 2
    }
  }

  /**
   * Get bounding box
   * @return {Rect}
   */
  getBoundingRect () {
    var p, r, _i, _len, _ref
    r = new Rect(this.getPoint(0).x, this.getPoint(0).y, this.getPoint(0).x, this.getPoint(0).y)
    _ref = this.points
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i]
      r.setRect2(Coord.unionRect(r, new Rect(p.x, p.y, p.x + 1, p.y + 1)))
    }
    return r
  }

  /**
   * Quantize
   * @return {Rect}
   */
  quantize () {
    for (var i = 0, len = this.points.length; i < len; i++) {
      var p = this.points[i]
      p.x = Math.round(p.x)
      p.y = Math.round(p.y)
    }
  }

  /**
   * @private
   * Define custom write method
   * - Refer to Core.Writer.prototype.writeCustom
   */
  __write () {
    var p, result, _i, _len, _ref
    result = []
    _ref = this.points
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i]
      result.push(p.x + ':' + p.y)
    }
    return result.join(';')
  }

  /**
   * @private
   * Define custom read method
   * - Refer to Repository.Reader.prototype.readCustom
   */
  __read (value) {
    var p, t, terms, x, y, _i, _len
    this.points = []
    terms = value.split(';')
    for (_i = 0, _len = terms.length; _i < _len; _i++) {
      t = terms[_i]
      p = t.split(':')
      x = p[0] * 1
      y = p[1] * 1
      this.points.push(new Point(x, y))
    }
  }

}

/**
 * @private
 * Coordination utility object
 */
var Coord = {}

/**
 * transform value as a given zoonFactor
 * @function
 */
Coord.valueTransform = function (zf, value) {
  var f
  f = zf.numer / zf.denom
  return f * value
}

/**
 * @function
 */
Coord.coordTransform = function (orig, zf, gf, p) {
  var f, x, y
  f = zf.numer / zf.denom
  x = p.x
  y = p.y
  x += orig.x
  y += orig.y
  x = x - (x % gf.width)
  y = y - (y % gf.height)
  x = f * x
  y = f * y
  return p.setPoint(x, y)
}

/**
 * @function
 */
Coord.coordTransform2 = function (orig, zf, gf, r) {
  var p1, p2
  p1 = new Point(r.x1, r.y1)
  p2 = new Point(r.x2, r.y2)
  Coord.coordTransform(orig, zf, gf, p1)
  Coord.coordTransform(orig, zf, gf, p2)
  return r.setRect(p1.x, p1.y, p2.x, p2.y)
}

/**
 * @function
 */
Coord.coordRevTransform = function (orig, zf, gf, p) {
  var f, x, y
  f = zf.numer / zf.denom
  x = p.x
  y = p.y
  x = x / f
  y = y / f
  x -= orig.x
  y -= orig.y
  x = x - (x % gf.width)
  y = y - (y % gf.height)
  return p.setPoint(x, y)
}

/**
 * @function
 */
Coord.ptInRect = function (x, y, rect) {
  Coord.normalizeRect(rect)
  return ((rect.x1 <= x && x <= rect.x2)) && ((rect.y1 <= y && y <= rect.y2))
}

/**
 * @function
 */
Coord.ptInRect2 = function (p, rect) {
  return Coord.ptInRect(p.x, p.y, rect)
}

/**
 * @function
 */
Coord.ptInLine = function (line, p) {
  var a, b, bottom, c, left, ox, oy, r, result, right, s, top, tx, ty, x1, x2, y1, y2
  result = false
  left = Math.min(line.x1, line.x2) - 5
  right = Math.max(line.x1, line.x2) + 5
  top = Math.min(line.y1, line.y2) - 5
  bottom = Math.max(line.y1, line.y2) + 5
  if ((left <= p.x) && (right >= p.x) && (top <= p.y) && (bottom >= p.y)) {
    a = line.x2 - line.x1
    b = line.y2 - line.y1
    r = Math.sqrt(a * a + b * b + 0.000001)
    c = b / r
    s = a / r
    ox = p.x - line.x1
    oy = p.y - line.y1
    tx = c * ox - s * oy
    ty = s * ox + c * oy
    x1 = -5.0
    x2 = 5.0
    y1 = -5.0
    y2 = r + 5
    if ((x1 <= tx) && (x2 >= tx) && (y1 <= ty) && (y2 >= ty)) {
      result = true
    } else {
      result = false
    }
  }
  return result
}

/**
 * @function
 */
Coord.ptsInLine = function (p1, p2, p3) {
  return Coord.ptInLine(new Rect(p1.x, p1.y, p3.x, p3.y), p2) || Coord.ptInLine(new Rect(p1.x, p1.y, p2.x, p2.y), p3) || Coord.ptInLine(new Rect(p2.x, p2.y, p3.x, p3.y), p1)
}

/**
 * @function
 */
Coord.rectInRect = function (rect1, rect2) {
  return !((rect1.x1 > rect2.x2) || (rect2.x1 > rect1.x2) || (rect1.y1 > rect2.y2) || (rect2.y1 > rect1.y2))
}

/**
 * @function
 */
Coord.getCenter = function (rect) {
  return new Point(Math.floor((rect.x1 + rect.x2) / 2), Math.floor((rect.y1 + rect.y2) / 2))
}

/**
 * @function
 */
Coord.equalRect = function (r1, r2) {
  return (r1.x1 === r2.x1) && (r1.y1 === r2.y1) && (r1.x2 === r2.x2) && (r1.y2 === r2.y2)
}

/**
 * @function
 */
Coord.equalPt = function (p1, p2) {
  return Coord.equalPt2(p1, p2, 5.0)
}

/**
 * @function
 */
Coord.equalPt2 = function (p1, p2, d) {
  return Coord.ptInRect(p2.x, p2.y, new Rect(p1.x - d, p1.y - d, p1.x + d, p1.y + d))
}

/**
 * @function
 */
Coord.normalizeRect = function (rect) {
  var x1, x2, y1, y2
  if (rect.x1 < rect.x2) {
    x1 = rect.x1
    x2 = rect.x2
  } else {
    x1 = rect.x2
    x2 = rect.x1
  }
  if (rect.y1 < rect.y2) {
    y1 = rect.y1
    y2 = rect.y2
  } else {
    y1 = rect.y2
    y2 = rect.y1
  }
  return rect.setRect(x1, y1, x2, y2)
}

/**
 * @function
 */
Coord.normalizeRect2 = function (p1, p2) {
  var r
  r = new Rect(p1.x, p1.y, p2.x, p2.y)
  Coord.normalizeRect(r)
  p1.setPoint(r.x1, r.y1)
  return p2.setPoint(r.x2, r.y2)
}

/**
 * @function
 */
Coord.unionRect = function (r1, r2) {
  var r
  r = new Rect(r1.x1, r1.y1, r1.x2, r1.y2)
  if (r2.x1 < r.x1) {
    r.x1 = r2.x1
  }
  if (r2.y1 < r.y1) {
    r.y1 = r2.y1
  }
  if (r2.x2 > r.x2) {
    r.x2 = r2.x2
  }
  if (r2.y2 > r.y2) {
    r.y2 = r2.y2
  }
  return r
}

/**
 * @function
 */
Coord.junction = function (r, pt) {
  var c, i, lean, p, ps, _ref, _ref1, _ref2, _ref3
  p = new Point(pt.x, pt.y)
  c = new Point(Math.floor((r.x1 + r.x2) / 2), Math.floor((r.y1 + r.y2) / 2))
  if (c.x === p.x || c.y === p.y) {
    return Coord.orthoJunction(r, p)
  }
  lean = (p.y - c.y) / (p.x - c.x)
  ps = [0, 1, 2, 3, 4]
  ps[0] = null
  ps[1] = new Point(r.x1, lean * (r.x1 - c.x) + c.y)
  ps[2] = new Point(r.x2, lean * (r.x2 - c.x) + c.y)
  ps[3] = new Point((r.y1 - c.y) / lean + c.x, r.y1)
  ps[4] = new Point((r.y2 - c.y) / lean + c.x, r.y2)
  Coord.normalizeRect2(c, p)
  i = 0
  while (true) {
    i++
    if (i > 4) {
      break
    }
    if ((((r.x1 <= (_ref = ps[i].x) && _ref <= r.x2)) && ((r.y1 <= (_ref1 = ps[i].y) && _ref1 <= r.y2)) && ((c.x <= (_ref2 = ps[i].x) && _ref2 <= p.x)) && ((c.y <= (_ref3 = ps[i].y) && _ref3 <= p.y))) || (i > 4)) {
      break
    }
  }
  if (i > 4) {
    return new Point(Math.floor((r.x1 + r.x2) / 2), Math.floor((r.y1 + r.y2) / 2))
  } else {
    return ps[i]
  }
}

/**
 * @function
 */
Coord.orthoJunction = function (r, p) {
  if ((r.x1 < p.x) && (p.x < r.x2)) {
    if (r.y1 >= p.y) {
      return new Point(p.x, r.y1)
    } else {
      return new Point(p.x, r.y2)
    }
  } else if ((r.y1 < p.y) && (p.y < r.y2)) {
    if (r.x1 >= p.x) {
      return new Point(r.x1, p.y)
    } else {
      return new Point(r.x2, p.y)
    }
  } else if ((r.x1 === p.x) || (r.x2 === p.x)) {
    if (r.y1 >= p.y) {
      return new Point(p.x, r.y1)
    } else {
      return new Point(p.x, r.y2)
    }
  } else if ((r.y1 === p.y) || (r.y2 === p.y)) {
    if (r.x1 >= p.x) {
      return new Point(r.x1, p.y)
    } else {
      return new Point(r.x2, p.y)
    }
  } else {
    return new Point(-100, -100)
  }
}

/**
 * @function
 */
Coord.makeOrthoPt = function (p1, p2) {
  var result
  result = new Point(p1.x, Math.max(p1.y, p2.y))
  if (result.y === p1.y) {
    result.x = p2.x
  }
  return result
}

/**
 * @function
 */
Coord.getPointAwayLine = function (tailPoint, headPoint, alpha, distance) {
  var a, b, th, x, y
  a = tailPoint.x - headPoint.x
  b = tailPoint.y - headPoint.y
  th = Math.atan(Math.abs(b) / (Math.abs(a) + 0.000001))
  if (a > 0) {
    if (b > 0) {
      th = Math.PI - th
    } else {
      th = th + Math.PI
    }
  } else {
    if (b < 0) {
      th = 2 * Math.PI - th
    }
  }
  x = distance * Math.cos(th + alpha)
  y = distance * Math.sin(th + alpha)
  return new Point(Math.floor(x), Math.floor(-y))
}

/**
 * @function
 */
Coord.getPolar = function (line, p) {
  var a, b, p1, p2, th1, th2
  p1 = new Point(line.x1, line.y1)
  p2 = new Point(line.x2, line.y2)
  a = p2.y - p1.y
  b = p2.x - p1.x + 0.00001
  th1 = Math.atan(a / b)
  if (((a < 0) && (b < 0)) || ((a > 0) && (b < 0)) || ((a === 0) && (b < 0))) {
    th1 = th1 + Math.PI
  }
  a = p.y - p1.y
  b = p.x - p1.x + 0.00001
  th2 = Math.atan(a / b)
  if (((a < 0) && (b < 0)) || ((a > 0) && (b < 0)) || ((a === 0) && (b < 0))) {
    th2 = th2 + Math.PI
  }
  return {
    alpha: th1 - th2,
    distance: Math.sqrt(((p1.x - p.x) * (p1.x - p.x)) + ((p1.y - p.y) * (p1.y - p.y)))
  }
}

/**
 * Get a closest projection point on the line (a-b) from a point (p)
 * @param {Point} p
 * @param {Point} a
 * @param {Point} b
 */
Coord.projectPointOnLine = function (p, a, b) {
  var atob = { x: b.x - a.x, y: b.y - a.y }
  var atop = { x: p.x - a.x, y: p.y - a.y }
  var len = atob.x * atob.x + atob.y * atob.y
  var dot = atop.x * atob.x + atop.y * atob.y
  var t = Math.min(1, Math.max(0, dot / len))
  dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
  return new Point(a.x + atob.x * t, a.y + atob.y * t)
}

/**
 * @function
 */
Coord.distance = function (p1, p2) {
  return Math.sqrt(((p1.x - p2.x) * (p1.x - p2.x)) + ((p1.y - p2.y) * (p1.y - p2.y)))
}

/**
 * @function
 */
Coord.getAngle = function (x1, y1, x2, y2) {
  var dx = x2 - x1
  var dy = y2 - y1
  return Math.atan2(dy, dx)
}

/**
 * Convert degree to radian
 * @param {number} degree
 * @return {number} - radian
 */
Coord.toRadian = function (degree) {
  return degree * Math.PI / 180
}

/**
 * Convert radian to degree
 * @param {number} radin
 * @return {number} - degree
 */
Coord.toDegree = function (radian) {
  return radian * (180 / Math.PI)
}

/**
 * Canvas
 * @private
 */
class Canvas {

  constructor (context) {
    this.context = context
    this.stateStack = []
    this.color = Color.BLACK
    this.fillColor = Color.WHITE
    this.fontColor = Color.BLACK
    this.font = new Font('Arial', 12, Font.FS_NORMAL)
    this.lineWidth = 1
    this.alpha = 1.0
    this.origin = new Point(0.0, 0.0)
    this.zoomFactor = new ZoomFactor(1, 1)
    this.gridFactor = new GridFactor(1, 1)
    this.coordTransformApplied = true
    this.ratio = 1
  }

  static toHTML5Font (f) {
    var style = ''
    var size = f.size
    switch (f.style) {
    case Font.FS_ITALIC:
      style = 'italic'
      break
    case Font.FS_BOLD:
      style = 'bold'
      break
    case Font.FS_BOLD_ITALIC:
      style = 'bold italic'
    }
    return '' + style + ' ' + size + 'px ' + f.face
  }

  /**
   * Store current canvas state into a stack
   */
  storeState () {
    var state = {
      color: this.color,
      fillColor: this.fillColor,
      fontColor: this.fontColor,
      font: this.font.copy(),
      lineWidth: this.lineWidth,
      alpha: this.alpha
    }
    this.stateStack.push(state)
  }

  /**
   * Restore the canvas states from a stack
   */
  restoreState () {
    var state = this.stateStack.pop()
    if (state !== null) {
      this.color = state.color
      this.fillColor = state.fillColor
      this.fontColor = state.fontColor
      this.font = state.font
      this.lineWidth = state.lineWidth
      this.alpha = state.alpha
    }
  }

  /**
   * Transform (Scale)
   */
  transform () {
    this.context.save()
    if (this.coordTransformApplied === true) {
      var scale = this.zoomFactor.getScale()
      this.context.translate(this.origin.x * scale * this.ratio, this.origin.y * scale * this.ratio)
      this.context.scale(scale * this.ratio, scale * this.ratio)
    }
  }

  /**
   * Restore Transform
   */
  restoreTransform () {
    this.context.restore()
  }

  /**
   * Put a pixel
   *
   * @param {number} x
   * @param {number} y
   * @param {number} c - Color
   */
  putPixel (x, y, c) {
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = c
    this.context.globalAlpha = this.alpha
    this.context.moveTo(x, y)
    this.context.lineTo(x + 1, y + 1)
    this.context.stroke()
    this.restoreTransform()
  };

  /**
   * Draw a line
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {?Array.<number>} dashPattern
   */
  line (x1, y1, x2, y2, dashPattern) {
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    this.context.moveTo(x1, y1)
    this.context.lineTo(x2, y2)
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * rect
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {Array.<number>} dashPattern - e.g.) [3]
   */
  rect (x1, y1, x2, y2, dashPattern) {
    this.transform()
    var x = (x1 < x2 ? x1 : x2)
    var y = (y1 < y2 ? y1 : y2)
    var w = Math.abs(x2 - x1)
    var h = Math.abs(y2 - y1)
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    this.context.rect(x, y, w, h)
    this.context.closePath()
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * fillRect
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  fillRect (x1, y1, x2, y2) {
    this.transform()
    var x = (x1 < x2 ? x1 : x2)
    var y = (y1 < y2 ? y1 : y2)
    var w = Math.abs(x2 - x1)
    var h = Math.abs(y2 - y1)
    this.context.fillStyle = this.fillColor
    this.context.globalAlpha = this.alpha
    this.context.fillRect(x, y, w, h)
    this.restoreTransform()
  }

  /**
   * roundRect
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} radius
   */
  roundRect (x1, y1, x2, y2, radius, dashPattern) {
    this.transform()
    var x = (x1 < x2 ? x1 : x2)
    var y = (y1 < y2 ? y1 : y2)
    var w = Math.abs(x2 - x1)
    var h = Math.abs(y2 - y1)
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    this.context.moveTo(x + radius, y)
    this.context.lineTo(x + w - radius, y)
    this.context.quadraticCurveTo(x + w, y, x + w, y + radius)
    this.context.lineTo(x + w, y + h - radius)
    this.context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    this.context.lineTo(x + radius, y + h)
    this.context.quadraticCurveTo(x, y + h, x, y + h - radius)
    this.context.lineTo(x, y + radius)
    this.context.quadraticCurveTo(x, y, x + radius, y)
    this.context.closePath()
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * fillRoundRect
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} radius
   */
  fillRoundRect (x1, y1, x2, y2, radius) {
    this.transform()
    var x = (x1 < x2 ? x1 : x2)
    var y = (y1 < y2 ? y1 : y2)
    var w = Math.abs(x2 - x1)
    var h = Math.abs(y2 - y1)
    this.context.beginPath()
    this.context.fillStyle = this.fillColor
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    this.context.moveTo(x + radius, y)
    this.context.lineTo(x + w - radius, y)
    this.context.quadraticCurveTo(x + w, y, x + w, y + radius)
    this.context.lineTo(x + w, y + h - radius)
    this.context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    this.context.lineTo(x + radius, y + h)
    this.context.quadraticCurveTo(x, y + h, x, y + h - radius)
    this.context.lineTo(x, y + radius)
    this.context.quadraticCurveTo(x, y, x + radius, y)
    this.context.closePath()
    this.context.fill()
    this.restoreTransform()
  }

  /**
   * ellipse
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {Array.<number>} dashPattern
   */
  ellipse (x1, y1, x2, y2, dashPattern) {
    this.transform()
    var x = (x1 < x2 ? x1 : x2)
    var y = (y1 < y2 ? y1 : y2)
    var w = Math.abs(x2 - x1)
    var h = Math.abs(y2 - y1)
    var kappa = 0.5522848
    var ox = (w / 2.0) * kappa
    var oy = (h / 2.0) * kappa
    var xe = x + w
    var ye = y + h
    var xm = x + w / 2.0
    var ym = y + h / 2.0
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    this.context.moveTo(x, ym)
    this.context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y)
    this.context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym)
    this.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye)
    this.context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym)
    this.context.closePath()
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * fillEllipse
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  fillEllipse (x1, y1, x2, y2) {
    this.transform()
    var x = (x1 < x2 ? x1 : x2)
    var y = (y1 < y2 ? y1 : y2)
    var w = Math.abs(x2 - x1)
    var h = Math.abs(y2 - y1)
    var kappa = 0.5522848
    var ox = (w / 2.0) * kappa
    var oy = (h / 2.0) * kappa
    var xe = x + w
    var ye = y + h
    var xm = x + w / 2.0
    var ym = y + h / 2.0
    this.context.beginPath()
    this.context.fillStyle = this.fillColor
    this.context.globalAlpha = this.alpha
    this.context.moveTo(x, ym)
    this.context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y)
    this.context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym)
    this.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye)
    this.context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym)
    this.context.closePath()
    this.context.fill()
    this.restoreTransform()
  }

  /**
   * Draw polyline
   * @param {Array.<Point>} points
   * @param {Array.<number>} dashPattern
   */
  polyline (points, dashPattern) {
    var i, len, p
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    for (i = 0, len = points.length; i < len; i++) {
      p = points[i]
      if (i === 0) {
        this.context.moveTo(p.x, p.y)
      } else {
        this.context.lineTo(p.x, p.y)
      }
    }
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * Draw roundRectLine
   * @param {Array.<Point>} points
   * @param {Array.<number>} dashPattern
   */
  roundRectLine (points, dashPattern) {
    var ROUND_RADIUS = 8
    var i, len
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    if (points.length > 0) {
      var p, prev, next, pdir, ndir
      this.context.moveTo(points[0].x, points[0].y)
      for (i = 1, len = points.length - 1; i < len; i++) {
        p = points[i]
        prev = points[i - 1]
        next = points[i + 1]
        // direction of previous line
        if (prev.x === p.x) { // vertical
          pdir = (prev.y < p.y) ? 'VD' : 'VU' // down or up
        } else { // horizontal
          pdir = (prev.x < p.x) ? 'HR' : 'HL' // right or left
        }
        // direction of next line
        if (next.x === p.x) {
          ndir = (next.y < p.y) ? 'VU' : 'VD' // vertical down or up
        } else {
          ndir = (next.x < p.x) ? 'HL' : 'HR' // horizontal right or left
        }
        // draw line
        switch (pdir) {
        case 'VD':
          // this.context.moveTo(prev.x, prev.y + ROUND_RADIUS)
          this.context.lineTo(p.x, p.y - ROUND_RADIUS)
          break
        case 'VU':
          // this.context.moveTo(prev.x, prev.y - ROUND_RADIUS)
          this.context.lineTo(p.x, p.y + ROUND_RADIUS)
          break
        case 'HR':
          // this.context.moveTo(prev.x + ROUND_RADIUS, prev.y)
          this.context.lineTo(p.x - ROUND_RADIUS, p.y)
          break
        case 'HL':
          // this.context.moveTo(prev.x - ROUND_RADIUS, prev.y)
          this.context.lineTo(p.x + ROUND_RADIUS, p.y)
          break
        }
        // draw corner
        switch (pdir) {
        case 'VD':
          if (ndir === 'HL') {
            this.context.arc(p.x - ROUND_RADIUS, p.y - ROUND_RADIUS, ROUND_RADIUS, 0, 0.5 * Math.PI, false)
          } else { // HR
            this.context.arc(p.x + ROUND_RADIUS, p.y - ROUND_RADIUS, ROUND_RADIUS, Math.PI, 0.5 * Math.PI, true)
          }
          break
        case 'VU':
          if (ndir === 'HL') {
            this.context.arc(p.x - ROUND_RADIUS, p.y + ROUND_RADIUS, ROUND_RADIUS, 0, 1.5 * Math.PI, true)
          } else { // HR
            this.context.arc(p.x + ROUND_RADIUS, p.y + ROUND_RADIUS, ROUND_RADIUS, Math.PI, 1.5 * Math.PI, false)
          }
          break
        case 'HR':
          if (ndir === 'VD') {
            this.context.arc(p.x - ROUND_RADIUS, p.y + ROUND_RADIUS, ROUND_RADIUS, 1.5 * Math.PI, 0, false)
          } else { // VU
            this.context.arc(p.x - ROUND_RADIUS, p.y - ROUND_RADIUS, ROUND_RADIUS, 0.5 * Math.PI, 0, true)
          }
          break
        case 'HL':
          if (ndir === 'VD') {
            this.context.arc(p.x + ROUND_RADIUS, p.y + ROUND_RADIUS, ROUND_RADIUS, 1.5 * Math.PI, Math.PI, true)
          } else { // VU
            this.context.arc(p.x + ROUND_RADIUS, p.y - ROUND_RADIUS, ROUND_RADIUS, 0.5 * Math.PI, Math.PI, false)
          }
          break
        }
      }
      this.context.lineTo(points[points.length - 1].x, points[points.length - 1].y)
    }
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * Draw curveLine
   * @param {Array.<Point>} points
   * @param {Array.<number>} dashPattern
   */
  curveLine (points, dashPattern) {
    var i, len
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    this.context.moveTo(points[0].x, points[0].y)
    if (points.length > 2) {
      for (i = 1, len = points.length - 2; i < len; i++) {
        var xc = (points[i].x + points[i + 1].x) / 2
        var yc = (points[i].y + points[i + 1].y) / 2
        this.context.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
      }
      this.context.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
    } else {
      this.context.lineTo(points[points.length - 1].x, points[points.length - 1].y)
    }
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * Draw polygon
   * @param {Array.<Point>} points
   * @param {Array.<number>} dashPattern
   */
  polygon (points, dashPattern) {
    var i, len, p, start
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    start = null
    for (i = 0, len = points.length; i < len; i++) {
      p = points[i]
      if (i === 0) {
        start = p
        this.context.moveTo(p.x, p.y)
      } else {
        this.context.lineTo(p.x, p.y)
      }
    }
    this.context.lineTo(start.x, start.y)
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * Draw filled polygon
   * @param {Points} points
   */
  fillPolygon (points) {
    var i, len, p
    this.transform()
    this.context.beginPath()
    this.context.fillStyle = this.fillColor
    this.context.globalAlpha = this.alpha
    for (i = 0, len = points.length; i < len; i++) {
      p = points[i]
      if (i === 0) {
        this.context.moveTo(p.x, p.y)
      } else {
        this.context.lineTo(p.x, p.y)
      }
    }
    this.context.fill()
    this.restoreTransform()
  }

  /**
   * Draw arc
   *
   * @param {number} x
   * @param {number} y
   * @param {number} r
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {boolean} counterClockwise
   * @param {Array.<number>} dashPattern
   */
  arc (x, y, r, startAngle, endAngle, counterClockwise, dashPattern) {
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    if (dashPattern) {
      this.context.setLineDash(dashPattern)
    }
    this.context.arc(x, y, r, startAngle, endAngle, counterClockwise)
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * Draw filled arc
   *
   * @param {number} x
   * @param {number} y
   * @param {number} r
   * @param {number} startAngle
   * @param {number} endAngle
   * @param {boolean} counterClockwise
   */
  fillArc (x, y, r, startAngle, endAngle, counterClockwise) {
    this.transform()
    this.context.beginPath()
    this.context.fillStyle = this.fillColor
    this.context.globalAlpha = this.alpha
    this.context.arc(x, y, r, startAngle, endAngle, counterClockwise)
    this.context.fill()
    this.restoreTransform()
  }

  /**
   * Draw a path.
   * A path command is one of the followings:
   * ```
   *   ['M', x, y] - moveTo
   *   ['L', x, y] - lineTo
   *   ['C', x1, y1, x2, y2, x, y] - bezierCurveTo
   *   ['Q', x1, y1, x, 2] - quadraticCurveTo
   *   ['Z'] - closePath
   * ```
   *
   * @param {Array<Array>}
   */
  path (commands) {
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    for (var i = 0, len = commands.length; i < len; i++) {
      var comm = commands[i]
      switch (comm[0]) {
      case 'M':
        this.context.moveTo(comm[1], comm[2])
        break
      case 'L':
        this.context.lineTo(comm[1], comm[2])
        break
      case 'C':
        this.context.bezierCurveTo(comm[1], comm[2], comm[3], comm[4], comm[5], comm[6])
        break
      case 'Q':
        this.context.quadraticCurveTo(comm[1], comm[2], comm[3], comm[4])
        break
      case 'Z':
        this.context.closePath()
        break
      }
    }
    this.context.stroke()
    this.restoreTransform()
  }

  /**
   * Draw a filled path
   * A path command is one of the followings:
   *   ['M', x, y] - moveTo
   *   ['L', x, y] - lineTo
   *   ['C', x1, y1, x2, y2, x, y] - bezierCurveTo
   *   ['Q', x1, y1, x, 2] - quadraticCurveTo
   *   ['Z'] - closePath
   *
   * @param {Array<Array>}
   * @param {boolean} doStroke
   */
  fillPath (commands, doStroke) {
    this.transform()
    this.context.beginPath()
    this.context.strokeStyle = this.color
    this.context.fillStyle = this.fillColor
    this.context.lineWidth = this.lineWidth
    this.context.globalAlpha = this.alpha
    for (var i = 0, len = commands.length; i < len; i++) {
      var comm = commands[i]
      switch (comm[0]) {
      case 'M':
        this.context.moveTo(comm[1], comm[2])
        break
      case 'L':
        this.context.lineTo(comm[1], comm[2])
        break
      case 'C':
        this.context.bezierCurveTo(comm[1], comm[2], comm[3], comm[4], comm[5], comm[6])
        break
      case 'Q':
        this.context.quadraticCurveTo(comm[1], comm[2], comm[3], comm[4])
        break
      case 'Z':
        this.context.closePath()
        break
      }
    }
    this.context.fill()
    if (doStroke) {
      this.context.stroke()
    }
    this.restoreTransform()
  }

  /**
   * Word Wrap
   * @param {string} text
   * @param {number} width
   * @return {Array.<string>}
   */
  wordWrap (text, width) {
    var lines = text.split(' ')
    if (lines.length > 0) {
      var result = []
      var term = lines[0]
      for (var i = 1, len = lines.length; i < len; i++) {
        var t = term + ' ' + lines[i]
        if (this.context.measureText(t).width <= width) {
          term = t
        } else {
          result.push(term)
          term = lines[i]
        }
      }
      if (term.length > 0) {
        result.push(term)
      }
      return result
    }
    return []
  }

  /**
   * Draw text
   *
   * @param {number} x
   * @param {number} y
   * @param {text} text
   * @param {boolean} rotate
   * @param {boolean} wordWrap
   * @param {boolean} underline
   */
  textOut (x, y, text, rotation, wordWrap, underline) {
    var r = new Rect(x, y, x, y)
    rotation = rotation || 0
    wordWrap = wordWrap || false
    underline = underline || false
    this.textOut2(r, text, Canvas.AL_LEFT, Canvas.AL_TOP, rotation, wordWrap, underline)
  }

  /**
   * Draw text underline
   * @private
   */
  _textUnderline (baseX, baseY, text, horizontalAlignment, verticalAlignment) {
    var x1, x2, y
    var extent = this.textExtent(text)
    switch (verticalAlignment) {
    case Canvas.AL_TOP:
      y = baseY + extent.y
      break
    case Canvas.AL_BOTTOM:
      y = baseY
      break
    case Canvas.AL_MIDDLE:
      y = baseY + (extent.y / 2.0)
      break
    }
    switch (horizontalAlignment) {
    case Canvas.AL_LEFT:
      x1 = baseX
      x2 = x1 + extent.x
      break
    case Canvas.AL_RIGHT:
      x2 = baseX
      x1 = x2 - extent.x
      break
    case Canvas.AL_CENTER:
      x1 = baseX + (extent.x / 2.0)
      x2 = baseX - (extent.x / 2.0)
      break
    }
    this.context.beginPath()
    this.context.strokeStyle = this.fontColor
    this.context.moveTo(x1, y)
    this.context.lineTo(x2, y)
    this.context.stroke()
  }

  /**
   * Draw text
   *
   * @param {Rect} rect
   * @param {string} text
   * @param {number} horizontalAlignment
   * @param {number} verticalAlignment
   * @param {boolean} rotate
   * @param {boolean} wordWrap
   * @param {boolean} underline
   */
  textOut2 (rect, text, horizontalAlignment, verticalAlignment, rotate, wordWrap, underline) {
    this.transform()
    this.context.save()
    this.context.beginPath()
    this.context.fillStyle = this.fontColor
    this.context.globalAlpha = this.alpha
    this.context.font = Canvas.toHTML5Font(this.font)
    var baseX = rect.x1
    var baseY = rect.y1
    if (rotate === true) {
      switch (verticalAlignment) {
      case Canvas.AL_TOP:
        baseX = rect.x1
        this.context.textBaseline = 'top'
        break
      case Canvas.AL_BOTTOM:
        baseX = rect.x2
        this.context.textBaseline = 'bottom'
        break
      case Canvas.AL_MIDDLE:
        baseX = (rect.x1 + rect.x2) / 2.0
        this.context.textBaseline = 'middle'
      }
      switch (horizontalAlignment) {
      case Canvas.AL_LEFT:
        baseY = rect.y2
        this.context.textAlign = 'left'
        break
      case Canvas.AL_RIGHT:
        baseY = rect.y1
        this.context.textAlign = 'right'
        break
      case Canvas.AL_CENTER:
        baseY = (rect.y1 + rect.y2) / 2.0
        this.context.textAlign = 'center'
      }
      this.context.translate(baseX, baseY)
      this.context.rotate(Coord.toRadian(-90))
      this.context.fillText(text, 0, 0)
    } else {
      switch (verticalAlignment) {
      case Canvas.AL_TOP:
        baseY = rect.y1
        this.context.textBaseline = 'top'
        break
      case Canvas.AL_BOTTOM:
        baseY = rect.y2
        this.context.textBaseline = 'bottom'
        break
      case Canvas.AL_MIDDLE:
        baseY = (rect.y1 + rect.y2) / 2.0
        this.context.textBaseline = 'middle'
      }
      switch (horizontalAlignment) {
      case Canvas.AL_LEFT:
        baseX = rect.x1
        this.context.textAlign = 'left'
        break
      case Canvas.AL_RIGHT:
        baseX = rect.x2
        this.context.textAlign = 'right'
        break
      case Canvas.AL_CENTER:
        baseX = (rect.x1 + rect.x2) / 2.0
        this.context.textAlign = 'center'
      }

      if (wordWrap) {
        var lines = this.wordWrap(text, rect.getWidth())
        var _height = (lines.length * this.font.size)
        switch (verticalAlignment) {
        case Canvas.AL_BOTTOM:
          baseY = rect.y2 - ((lines.length - 1) * this.font.size)
          break
        case Canvas.AL_MIDDLE:
          baseY = rect.y1 + ((rect.getHeight() - _height) / 2) + (this.font.size / 2)
          break
        }
        for (var i = 0, len = lines.length; i < len; i++) {
          this.context.fillText(lines[i], baseX, baseY)
          if (underline) {
            this._textUnderline(baseX, baseY, lines[i], horizontalAlignment, verticalAlignment)
          }
          baseY = baseY + this.font.size
        }
      } else {
        this.context.fillText(text, baseX, baseY)
        if (underline) {
          this._textUnderline(baseX, baseY, text, horizontalAlignment, verticalAlignment)
        }
      }
    }
    this.context.restore()
    this.restoreTransform()
  }

  /**
   * Get Text Extent
   * @param {string} text
   * @param {number} wordWrapWidth
   * @return {Point}
   */
  textExtent (text, wordWrapWidth) {
    this.context.font = Canvas.toHTML5Font(this.font)
    let sz = new Point(0, 0)
    if (wordWrapWidth) {
      let lines = this.wordWrap(text, wordWrapWidth)
      let widths = lines.map(line => { return this.context.measureText(line).width })
      sz.x = _.max(widths)
      sz.y = this.font.size * lines.length
    } else {
      sz.x = this.context.measureText(text).width
      sz.y = this.font.size
    }
    return sz
  }

  /**
   * Draw Image
   *
   * @param {Image} image
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  drawImage (image, x, y, width, height) {
    this.transform()
    this.context.drawImage(image, x, y, width, height)
    this.restoreTransform()
  }

  /**
   * Draw an icon script
   * @param {Rect} rect
   * @param {string} script
   * @param {{lineColor: string, fillColor: string}} defaultValues
   */
  drawIconScript (rect, script, defaultValues) {
    if (script) {
      const alpha = this.alpha
      const lineWidth = this.lineWidth
      let width = 100
      let height = 100
      let linePattern = null
      let cmds = []
      // parse script
      function parsePt2 (terms, includeRadius = false) {
        return {
          op: terms[0],
          x1: parseFloat(terms[1]),
          y1: parseFloat(terms[2]),
          x2: parseFloat(terms[3]),
          y2: parseFloat(terms[4]),
          r: includeRadius ? parseFloat(terms[5]) : undefined
        }
      }
      function parsePts (terms) {
        let cmd = { op: terms[0], pts: [] }
        let l = Math.floor((terms.length - 1) / 2)
        for (let i = 0; i < l; i++) {
          cmd.pts.push({x: parseFloat(terms[i * 2 + 1]), y: parseFloat(terms[i * 2 + 2])})
        }
        return cmd
      }
      function parseArc (terms) {
        return {
          op: terms[0],
          x: parseFloat(terms[1]),
          y: parseFloat(terms[2]),
          r: parseFloat(terms[3]),
          a1: parseFloat(terms[4]),
          a2: parseFloat(terms[5])
        }
      }
      function parseNums (terms) {
        let cmd = { op: terms[0], n: [] }
        for (let i = 1; i < terms.length; i++) {
          cmd.n.push(parseFloat(terms[i]))
        }
        return cmd
      }
      try {
        const lines = script.trim().split('\n')
        lines.forEach(ln => {
          let terms = ln.trim().split(' ').filter(i => i.length > 0)
          if (terms.length > 0) {
            switch (terms[0]) {
            case '!icon':
              width = parseFloat(terms[1])
              height = parseFloat(terms[2])
              break
            case 'l':
              cmds.push(parsePt2(terms))
              break
            case 'r':
              cmds.push(parsePt2(terms))
              break
            case 'rr':
              cmds.push(parsePt2(terms, true))
              break
            case 'e':
              cmds.push(parsePt2(terms))
              break
            case 'pl':
              cmds.push(parsePts(terms))
              break
            case 'pg':
              cmds.push(parsePts(terms))
              break
            case 'a':
              cmds.push(parseArc(terms))
              break
            case 'fr':
              cmds.push(parsePt2(terms))
              break
            case 'frr':
              cmds.push(parsePt2(terms, true))
              break
            case 'fe':
              cmds.push(parsePt2(terms))
              break
            case 'fp':
              cmds.push(parsePts(terms))
              break
            case 'fa':
              cmds.push(parseArc(terms))
              break
            case '%l':
              cmds.push({op: terms[0], c: terms.length > 1 ? terms[1] : null})
              break
            case '%f':
              cmds.push({op: terms[0], c: terms.length > 1 ? terms[1] : null})
              break
            case '%a':
              cmds.push({op: terms[0], a: terms.length > 1 ? terms[1] : null})
              break
            case '%w':
              cmds.push({op: terms[0], w: terms.length > 1 ? terms[1] : null})
              break
            case '%p':
              cmds.push(parseNums(terms))
            }
          }
        })
      } catch (err) {
        console.log('[IconScript]', err)
      }

      // draw script
      const r0 = rect.getHeight() / rect.getWidth()
      const r = height / width
      let w = rect.getWidth()
      let h = rect.getHeight()
      if (r0 < r) { // fit to height
        w = h / r
      } else { // fit to width
        h = w * r
      }
      const ox = rect.x1 + Math.round((rect.getWidth() - w) / 2)
      const oy = rect.y1 + Math.round((rect.getHeight() - h) / 2)
      const s = w / width
      cmds.forEach(cmd => {
        switch (cmd.op) {
        case 'l':
          this.line(ox + cmd.x1 * s, oy + cmd.y1 * s, ox + cmd.x2 * s, oy + cmd.y2 * s, linePattern)
          break
        case 'r':
          this.rect(ox + cmd.x1 * s, oy + cmd.y1 * s, ox + cmd.x2 * s, oy + cmd.y2 * s, linePattern)
          break
        case 'rr':
          this.roundRect(ox + cmd.x1 * s, oy + cmd.y1 * s, ox + cmd.x2 * s, oy + cmd.y2 * s, cmd.r * s, linePattern)
          break
        case 'e':
          this.ellipse(ox + cmd.x1 * s, oy + cmd.y1 * s, ox + cmd.x2 * s, oy + cmd.y2 * s, linePattern)
          break
        case 'pl':
          this.polyline(cmd.pts.map(p => (new Point(ox + p.x * s, oy + p.y * s))), linePattern)
          break
        case 'pg':
          this.polygon(cmd.pts.map(p => (new Point(ox + p.x * s, oy + p.y * s))), linePattern)
          break
        case 'a':
          this.arc(ox + cmd.x * s, oy + cmd.y * s, cmd.r * s, Coord.toRadian(cmd.a1), Coord.toRadian(cmd.a2), false, linePattern)
          break
        case 'fr':
          this.fillRect(ox + cmd.x1 * s, oy + cmd.y1 * s, ox + cmd.x2 * s, oy + cmd.y2 * s)
          break
        case 'frr':
          this.fillRoundRect(ox + cmd.x1 * s, oy + cmd.y1 * s, ox + cmd.x2 * s, oy + cmd.y2 * s, cmd.r * s)
          break
        case 'fe':
          this.fillEllipse(ox + cmd.x1 * s, oy + cmd.y1 * s, ox + cmd.x2 * s, oy + cmd.y2 * s)
          break
        case 'fp':
          this.fillPolygon(cmd.pts.map(p => (new Point(ox + p.x * s, oy + p.y * s))))
          break
        case 'fa':
          this.fillArc(ox + cmd.x * s, oy + cmd.y * s, cmd.r * s, Coord.toRadian(cmd.a1), Coord.toRadian(cmd.a2), false)
          break
        case '%l':
          this.color = cmd.c || defaultValues.lineColor || '#000000'
          break
        case '%f':
          this.fillColor = cmd.c || defaultValues.fillColor || '#000000'
          break
        case '%a':
          this.alpha = cmd.a || 1.0
          break
        case '%w':
          this.lineWidth = cmd.w || 1.0
          break
        case '%p':
          linePattern = cmd.n.length > 0 ? cmd.n : null
          break
        }
      })
      this.alpha = alpha
      this.lineWidth = lineWidth
    }
  }
}

/**
 * Alignment Kind: Left (0)
 * @const {number}
 */
Canvas.AL_LEFT = 0

/**
 * Alignment Kind: Right (1)
 * @const {number}
 */
Canvas.AL_RIGHT = 1

/**
 * Alignment Kind: Center (2)
 * @const {number}
 */
Canvas.AL_CENTER = 2

/**
 * Alignment Kind: Top (3)
 * @const {number}
 */
Canvas.AL_TOP = 3

/**
 * Alignment Kind: Bottom (4)
 * @const {number}
 */
Canvas.AL_BOTTOM = 4

/**
 * Alignment Kind: Middle (5)
 * @const {number}
 */
Canvas.AL_MIDDLE = 5

/**
 * @private
 * Graphic Utilities
 */
class GraphicUtils {}

// Default Color Palette
GraphicUtils.DEFAULT_COLOR_PALETTE = DEFAULT_COLOR_PALETTE

/*
 * Selection Orientation (North/West/South/East)
 * @const {number}
 */
GraphicUtils.NWSE_N = 0
GraphicUtils.NWSE_S = 1
GraphicUtils.NWSE_W = 2
GraphicUtils.NWSE_E = 3

/*
 * Highlighter Position
 * @const {number}
 */
GraphicUtils.CT_LT = 0
GraphicUtils.CT_LM = 1
GraphicUtils.CT_LB = 2
GraphicUtils.CT_MT = 3
GraphicUtils.CT_MB = 4
GraphicUtils.CT_RT = 5
GraphicUtils.CT_RM = 6
GraphicUtils.CT_RB = 7
GraphicUtils.CT_AREA = 8
GraphicUtils.CT_ELSE = 9

// Extra constants
GraphicUtils.HIGHLIGHTER_COLOR = Color.BLACK
GraphicUtils.SELECTION_COLOR = '#4f99ff' // Color.GREEN,
GraphicUtils.SELECTION_BORDER_COLOR = '#4f99ff' // Color.GREEN,
GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE = 8.0
GraphicUtils.DEFAULT_HALF_HIGHLIGHTER_SIZE = 4.0
GraphicUtils.DEFAULT_SELECTIONLINE_WIDTH = GraphicUtils.DEFAULT_HIGHLIGHTER_SIZE - 1.0

GraphicUtils.drawEndPoint = function (canvas, x, y) {
  var r = 5
  canvas.ellipse(x - r, y - r, x + r, y + r)
}

GraphicUtils.drawRange = function (canvas, x1, y1, x2, y2, kind, showEnds) {
  if (!kind) {
    kind = 'rect'
  }
  if (!showEnds) {
    showEnds = false
  }

  x1 = Math.round(x1)
  y1 = Math.round(y1)
  x2 = Math.round(x2)
  y2 = Math.round(y2)

  canvas.storeState()
  if (canvas.ratio === 1) { // Non-retina
    canvas.context.translate(0.5, 0.5)
  }
  canvas.color = GraphicUtils.SELECTION_COLOR
  switch (kind) {
  case 'rect':
    canvas.rect(x1, y1, x2, y2)
    if (showEnds) {
      GraphicUtils.drawEndPoint(canvas, x1, y1)
      GraphicUtils.drawEndPoint(canvas, x2, y2)
    }
    break
  case 'line':
    canvas.line(x1, y1, x2, y2)
    if (showEnds) {
      GraphicUtils.drawEndPoint(canvas, x1, y1)
      GraphicUtils.drawEndPoint(canvas, x2, y2)
    }
    break
  case 'point':
    GraphicUtils.drawEndPoint(canvas, x2, y2)
    break
  }
  if (canvas.ratio === 1) { // Non-retina
    canvas.context.translate(-0.5, -0.5)
  }
  canvas.restoreState()
}

GraphicUtils.drawRangeBox = function (canvas, x1, y1, x2, y2) {
  canvas.storeState()
  canvas.color = GraphicUtils.SELECTION_COLOR
  canvas.rect(x1 - 2, y1 - 2, x2 + 3, y2 + 3)
  canvas.restoreState()
}

GraphicUtils.drawDottedLine = function (canvas, points) {
  canvas.storeState()
  if (canvas.ratio === 1) { // Non-retina
    canvas.context.translate(0.5, 0.5)
  }
  canvas.color = GraphicUtils.SELECTION_COLOR
  canvas.polyline(points.points, [3])
  if (canvas.ratio === 1) { // Non-retina
    canvas.context.translate(-0.5, -0.5)
  }
  canvas.restoreState()
}

GraphicUtils.drawSelection = function (canvas, x1, y1, x2, y2) {
  canvas.storeState()
  if (canvas.ratio === 1) {
    canvas.context.translate(0.5, 0.5)
  }
  canvas.fillColor = GraphicUtils.SELECTION_COLOR
  // canvas.lineWidth = 1.0 * canvas.ratio
  canvas.alpha = 0.1
  canvas.fillRoundRect(x1, y1, x2, y2, 2)
  canvas.color = GraphicUtils.SELECTION_BORDER_COLOR
  canvas.alpha = 1
  canvas.roundRect(x1, y1, x2, y2, 2)
  if (canvas.ratio === 1) {
    canvas.context.translate(-0.5, -0.5)
  }
  canvas.restoreState()
}

GraphicUtils.drawSelectionBox = function (canvas, x1, y1, x2, y2) {
  canvas.storeState()
  if (canvas.ratio === 1) {
    canvas.context.translate(0.5, 0.5)
  }
  canvas.color = GraphicUtils.SELECTION_BORDER_COLOR
  canvas.alpha = 1
  // canvas.lineWidth = 1.0 * canvas.ratio
  canvas.rect(x1, y1, x2, y2)
  if (canvas.ratio === 1) {
    canvas.context.translate(-0.5, -0.5)
  }
  canvas.restoreState()
}

GraphicUtils.drawSelectionLine = function (canvas, x1, y1, x2, y2, width, nwse, retouch) {
  var r, r1, r2, rx1, rx2, ry1, ry2
  canvas.storeState()
  r1 = new Point(x1, y1)
  r2 = new Point(x2, y2)
  rx1 = (r1.x + canvas.origin.x) * canvas.zoomFactor.getScale() * canvas.ratio
  ry1 = (r1.y + canvas.origin.y) * canvas.zoomFactor.getScale() * canvas.ratio
  rx2 = (r2.x + canvas.origin.x) * canvas.zoomFactor.getScale() * canvas.ratio
  ry2 = (r2.y + canvas.origin.y) * canvas.zoomFactor.getScale() * canvas.ratio
  canvas.lineWidth = 1.0 * canvas.ratio
  width = width * canvas.ratio

  if (retouch && (((rx1 - width) % 2) === 1)) {
    rx1 = rx1 + 1
  }
  if (retouch && ((rx2 % 2) === 1)) {
    rx2 = rx2 - 1
  }

  r = new Rect(0, 0, 0, 0)
  switch (nwse) {
  case GraphicUtils.NWSE_N:
    r.setRect(rx1, ry1 - width, rx2, ry1)
    break
  case GraphicUtils.NWSE_W:
    r.setRect(rx1 - width, ry1 - width, rx1, ry2 + width)
    break
  case GraphicUtils.NWSE_S:
    r.setRect(rx1, ry2, rx2, ry2 + width)
    break
  case GraphicUtils.NWSE_E:
    r.setRect(rx2, ry1 - width, rx2 + width, ry2 + width)
  }
  r.quantize()

  canvas.fillColor = GraphicUtils.SELECTION_COLOR
  canvas.alpha = 0.1
  canvas.coordTransformApplied = false

  if (canvas.ratio === 1) {
    canvas.context.translate(0.5, 0.5)
  }

  canvas.fillRect(r.x1, r.y1, r.x2, r.y2)

  if (canvas.ratio === 1) {
    canvas.context.translate(-0.5, -0.5)
  }

  canvas.coordTransformApplied = true
  canvas.restoreState()
}

GraphicUtils.drawHighlighter = function (canvas, x, y, size, enabled, color) {
  var p
  canvas.storeState()
  canvas.color = GraphicUtils.SELECTION_BORDER_COLOR
  canvas.fillColor = Color.WHITE
  canvas.lineWidth = 1.0 * canvas.ratio
  p = new Point(x, y)
  size = size * canvas.ratio
  p.x = (p.x + canvas.origin.x) * canvas.zoomFactor.getScale() * canvas.ratio
  p.y = (p.y + canvas.origin.y) * canvas.zoomFactor.getScale() * canvas.ratio
  p.quantize()

  canvas.coordTransformApplied = false

  if (canvas.ratio === 1) {
    canvas.context.translate(0.5, 0.5)
  }
  canvas.fillRect(p.x - size, p.y - size, p.x + size, p.y + size)
  canvas.rect(p.x - size, p.y - size, p.x + size, p.y + size)

  if (canvas.ratio === 1) {
    canvas.context.translate(-0.5, -0.5)
  }
  canvas.coordTransformApplied = true
  canvas.restoreState()
}

GraphicUtils.drawHighlighter2 = function (canvas, x1, y1, x2, y2, width, cornerType, enabled, color) {
  var cx, cy, halfW, p, p1, p2
  canvas.storeState()
  canvas.color = color
  p1 = new Point(x1, y1)
  p2 = new Point(x2, y2)
  x1 = (p1.x + canvas.origin.x) * canvas.zoomFactor.getScale() * canvas.ratio
  y1 = (p1.y + canvas.origin.y) * canvas.zoomFactor.getScale() * canvas.ratio
  x2 = (p2.x + canvas.origin.x) * canvas.zoomFactor.getScale() * canvas.ratio
  y2 = (p2.y + canvas.origin.y) * canvas.zoomFactor.getScale() * canvas.ratio
  width = width * canvas.ratio

  p = new Point(-100, -100)
  cx = (x1 + x2) / 2
  cy = (y1 + y2) / 2
  halfW = width / 2
  switch (cornerType) {
  case GraphicUtils.CT_LT:
    p.setPoint(x1 - width, y1 - width)
    break
  case GraphicUtils.CT_LM:
    p.setPoint(x1 - width, cy - halfW)
    break
  case GraphicUtils.CT_LB:
    p.setPoint(x1 - width, y2)
    break
  case GraphicUtils.CT_MT:
    p.setPoint(cx - halfW, y1 - width)
    break
  case GraphicUtils.CT_MB:
    p.setPoint(cx - halfW, y2)
    break
  case GraphicUtils.CT_RT:
    p.setPoint(x2, y1 - width)
    break
  case GraphicUtils.CT_RM:
    p.setPoint(x2, cy - halfW)
    break
  case GraphicUtils.CT_RB:
    p.setPoint(x2, y2)
  }
  if (enabled) {
    canvas.fillColor = Color.WHITE
  } else {
    canvas.fillColor = '#D0D0D0'
  }
  canvas.lineWidth = 1.0 * canvas.ratio

  p.quantize()

  canvas.color = '#4f99ff' // Color.BLACK
  canvas.coordTransformApplied = false

  if (canvas.ratio === 1) {
    canvas.context.translate(0.5, 0.5)
  }

  canvas.fillRect(p.x, p.y, p.x + width, p.y + width)
  canvas.rect(p.x, p.y, p.x + width, p.y + width)

  if (canvas.ratio === 1) {
    canvas.context.translate(-0.5, -0.5)
  }

  canvas.coordTransformApplied = true
  canvas.restoreState()
}

GraphicUtils.drawLineGuide = function (canvas, points) {
  var p
  canvas.storeState()
  canvas.color = GraphicUtils.SELECTION_BORDER_COLOR
  canvas.fillColor = Color.WHITE
  canvas.lineWidth = 1.0

  // var o = canvas.origin.copy()
  canvas.coordTransformApplied = false
  canvas.context.translate(0.5, 0.5)
  for (var i = 0, len = points.length; i < len; i++) {
    p = new Point(points[i].x, points[i].y)
    Coord.coordTransform(canvas.origin, canvas.zoomFactor, GridFactor.NO_GRID, p)
    if (i === 0) {
    } else {
    }
  }
  canvas.context.translate(-0.5, -0.5)
  canvas.coordTransformApplied = true
  canvas.restoreState()
}

// Type Definitions
global.type.Point = Point
global.type.Rect = Rect
global.type.Color = Color
global.type.Font = Font
global.type.ZoomFactor = ZoomFactor
global.type.GridFactor = GridFactor
global.type.Points = Points
global.type.Coord = Coord
global.type.Canvas = Canvas
global.type.GraphicUtils = GraphicUtils

exports.Point = Point
exports.Rect = Rect
exports.Color = Color
exports.Font = Font
exports.ZoomFactor = ZoomFactor
exports.GridFactor = GridFactor
exports.Points = Points
exports.Coord = Coord
exports.Canvas = Canvas
exports.GraphicUtils = GraphicUtils
