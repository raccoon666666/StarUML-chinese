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

const toastTemplate = fs.readFileSync(path.join(__dirname, '../static/html-contents/toast-template.html'), 'utf8')

/**
 * ToastManager
 */
class ToastManager {

  constructor () {
    this.toast = null
  }

  /**
   * Show information toast.
   *
   * @param {string} message
   */
  info (message) {
    this.toast.show({message: message}, 'info')
  }

  /**
   * Show warning toast.
   *
   * @param {string} message
   */
  warning (message) {
    this.toast.show({message: message}, 'warning')
  }

  /**
   * Show error toast.
   *
   * @param {string} message
   */
  error (message) {
    this.toast.show({message: message}, 'error')
  }

  htmlReady () {
    this.toast = $('#toast').kendoNotification({
      position: { pinned: true },
      appendTo: '#toast-holder',
      autoHideAfter: 5000,
      stacking: 'up',
      templates: [
        { type: 'info', template: toastTemplate },
        { type: 'warning', template: toastTemplate },
        { type: 'error', template: toastTemplate }
      ]
    }).data('kendoNotification')
  }
}

module.exports = ToastManager
