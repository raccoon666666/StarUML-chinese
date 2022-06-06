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
const {EventEmitter} = require('events')
const fs = require('fs')
const path = require('path')
const slash = require('slash')
const Unicode = require('./unicode')

/**
 * FontManager
 * @private
 */
class FontManager extends EventEmitter {

  constructor () {
    super()

    /**
     * Available fonts
     * @member {Map<string,Object>}
     */
    this.fonts = {}

    this.defaultFonts = []

    this.defaultFont = null

    /**
     * All font files
     * @member {Map<string,string>}
     */
    this.files = {}

    /**
     * Unicode map for determining one of default fonts
     */
    this.unicodeMap = {}
  }

  /**
   * Register a font
   *
   * ex)
   * font = {
   *      name          : "Arial", // Use "default" for default font
   *      path          : "/styles/fonts/Arial",
   *      regular       : "LiberationSans-Regular.ttf",
   *      italic        : "LiberationSans-Italic.ttf",
   *      bold          : "LiberationSans-Bold.ttf",
   *      boldItalic    : "LiberationSans-BoldItalic.ttf",
   *      unicodeRanges : [24, 25, 26] // (optional. unicode range number)
   * }
   *
   * @param {object} font
   */
  registerFont (font) {
    if (font.name === 'default') {
      this.registerDefaultFont(font)
    } else {
      this.registerUserFont(font)
    }
  }

  registerUserFont (font) {
    if (!font.predefined) {
      this.registerFontFiles(font)
    }
    this.fonts[font.name] = font
  }

  registerDefaultFont (font) {
    this.registerFontFiles(font)
    this.defaultFonts.push(font)
    if (font.unicodeRanges) {
      for (var i = 0, len = font.unicodeRanges.length; i < len; i++) {
        var range = Unicode.UNICODE_RANGES[font.unicodeRanges[i]]
        for (var j = range[0]; j <= range[1]; j++) {
          this.unicodeMap[j] = font
        }
      }
    } else {
      this.defaultFont = font
    }
  }

  registerFontFiles (font) {
    this.files[font.regular] = path.join(font.path, font.regular)
    this.files[font.italic] = path.join(font.path, font.italic)
    this.files[font.bold] = path.join(font.path, font.bold)
    this.files[font.boldItalic] = path.join(font.path, font.boldItalic)
  }

  getDefaultFontInfo (char) {
    if (!char) {
      return this.defaultFont
    } else {
      var code = char.charCodeAt(0)
      return this.unicodeMap[code] || this.defaultFont
    }
  }

  getFontInfo (name, char) {
    var f = this.fonts[name] || this.getDefaultFontInfo(char)
    if (f.unicodeRanges) {
      if (Unicode.inUnicodeRanges(f.unicodeRanges, char)) {
        return f
      } else {
        return this.getDefaultFontInfo(char)
      }
    } else {
      return f
    }
  }

  /**
   * Add font as embedded stylesheet (`<style>` tag)
   * @private
   */
  addFontToStyle (font) {
    var template =
    "@font-face { font-family: '{{name}}'; src: url('{{{path}}}/{{regular}}'); font-weight: normal; font-style: normal;}\n" +
    "@font-face { font-family: '{{name}}'; src: url('{{{path}}}/{{italic}}'); font-weight: normal; font-style: italic;}\n" +
    "@font-face { font-family: '{{name}}'; src: url('{{{path}}}/{{bold}}'); font-weight: bold; font-style: normal;}\n" +
    "@font-face { font-family: '{{name}}'; src: url('{{{path}}}/{{boldItalic}}'); font-weight: bold; font-style: italic;}\n"
    var css = Mustache.render(template, font)
    $('<style>').text(css).appendTo('head')[0]
  }

  /**
   * Load a font at a specified directory
   * @param {path} A path containing font.json and font files
   */
  loadFont (path) {
    try {
      const data = fs.readFileSync(path + '/font.json', 'utf8')
      var fontArray = JSON.parse(data)
      fontArray.forEach(font => {
        font.path = slash(path)
        this.registerFont(font)
        if (font.name !== 'default' && !font.predefined) {
          this.addFontToStyle(font)
        }
        this.emit('load', font)
      })
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Load all fonts in the specified directory
   * @param {string} dir
   */
  loadFontDir (dirPath) {
    try {
      const files = fs.readdirSync(dirPath, 'utf8')
      if (files && files.length > 0) {
        files.forEach(dir => {
          const fullPath = path.join(dirPath, dir)
          const stat = fs.statSync(fullPath)
          if (stat.isDirectory()) {
            this.loadFont(fullPath)
          }
        })
      }
    } catch (err) {
      console.error('Error during font loading: ' + err)
    }
  }

  /**
   * Load default fonts
   * @private
   */
  loadDefaultFonts () {
    const fontPath = path.join(app.getAppPath(), '/resources/fonts')
    this.loadFontDir(fontPath)
  }

  /**
   * Load custom fonts
   * @private
   */
  loadCustomFonts () {
    const fontPath = path.join(app.getUserPath(), '/fonts')
    if (fs.existsSync(fontPath)) {
      this.loadFontDir(fontPath)
    }
  }
}

module.exports = FontManager
