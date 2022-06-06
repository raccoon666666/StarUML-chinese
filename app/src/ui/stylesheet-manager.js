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
const path = require('path')

/**
 * Stylesheet Manager
 * @private
 */
class StylesheetManager {

  /**
   * Appends a `<style>` tag to the document's head.
   *
   * @param {string} css CSS code to use as the tag's content
   * @return {HTMLStyleElement} The generated HTML node
   */
  addEmbeddedStyleSheet (css) {
    return $('<style>').text(css).appendTo('head')[0]
  }

  /**
   * Appends a `<link>` tag to the document's head.
   *
   * @param {string} url URL to a style sheet
   * @return {Promise} A promise object that is resolved with an HTMLLinkElement node if the file can be loaded.
   */
  addLinkedStyleSheet (url) {
    return new Promise((resolve, reject) => {
      var attributes = {
        type: 'text/css',
        rel: 'stylesheet',
        href: url
      }
      var $link = $('<link/>').attr(attributes)
      $link.appendTo('head')
      $link.on('load', function () {
        resolve($link[0])
      })
      $link.on('error', function () {
        reject()
      })
    })
  }

  /**
   * Loads a style sheet (CSS) relative to the extension module.
   *
   * @param {string} path Relative path from the extension folder to a CSS file
   * @return {Promise} A promise object that is resolved with an HTML node if the file can be loaded.
   */
  loadStyleSheet (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
          reject(err)
        } else {
          if (path.extname(filePath) === '.css') {
            this.addLinkedStyleSheet(filePath).then(
              (link) => { resolve(link) },
              () => { reject() }
            )
          } else {
            reject(filePath)
          }
        }
      })
    })
  }

  /**
   * Set theme CSS
   * @private
   */
  setThemeCSS (theme) {
    $('#theme-css').remove()
    var attributes = {
      id: 'theme-css',
      type: 'text/css',
      rel: 'stylesheet',
      href: './styles/staruml-' + theme + '.css'
    }
    var $link = $('<link/>').attr(attributes)
    $link.appendTo('head')
  }
}

module.exports = StylesheetManager
