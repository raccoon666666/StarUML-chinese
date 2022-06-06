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

const path = require('path')

/**
 * Titlebar
 * @private
 */
class TitlebarView {

  constructor () {
    this.$titlebar = null
    this.$mainView = null
    this.project = null
    this.repository = null
    this.metadata = null
    this.licenseManager = null
  }

  /**
   * Update the titlebar
   */
  update () {
    var filename = this.project.getFilename()
    var title = ''

    if (this.repository.isModified()) {
      title += '• '
    }

    if (filename && filename.length > 0) {
      filename = path.basename(filename)
      title += filename + ' — '
    }

    title += this.metadata.name

    if (this.licenseManager.getStatus() === false) {
      title += ' (UNREGISTERED)'
    }

    $('title').html(title)
    if (process.platform === 'darwin') {
      $('.titlebar > .title').html(title)
    }
  }

  htmlReady () {
    this.$titlebar = $('.titlebar')
    this.$mainView = $('.main-view')
    if (process.platform === 'darwin') {
      this.$titlebar.css('-webkit-user-select', 'none')
      this.$titlebar.css('-webkit-app-region', 'drag')
    } else if (process.platform === 'win32') { /* window */
      $('.titlebar > .title').remove()
      this.$titlebar.css('height', '14px')
      this.$mainView.css('top', '14px')
    } else { /* linux */
      $('.titlebar > .title').remove()
      this.$titlebar.css('height', '14px')
      this.$mainView.css('top', '14px')
    }
  }
}

module.exports = TitlebarView
