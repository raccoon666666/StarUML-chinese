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
const { app, TouchBar } = require('electron')
const { EventEmitter } = require('events')

const { TouchBarLabel, TouchBarSpacer, TouchBarColorPicker, TouchBarSegmentedControl, TouchBarPopover } = TouchBar

/**
 * Touchbar (only support for MacbookPro)
 */
class Touchbar extends EventEmitter {

  constructor (window) {
    super()
    this.window = window
    this.fillColorItem = null
    this.lineStyleItem = null
    this.touchbar = null
    this.setup()
  }

  setup () {
    const iconPath = path.join(app.getAppPath(), '/resources/icons')

    this.fillColorItem = new TouchBarColorPicker({
      change: (color) => {
        this.window.sendCommand('format:fill-color', color)
      }
    })

    this.lineStyleItem = new TouchBarSegmentedControl({
      mode: 'single',
      segments: [
        { icon: path.join(iconPath, 'tool-rectilinear.png') },
        { icon: path.join(iconPath, 'tool-oblique.png') },
        { icon: path.join(iconPath, 'tool-rounded-rectilinear.png') },
        { icon: path.join(iconPath, 'tool-curve.png') }
      ],
      change: (index) => {
        switch (index) {
        case 0:
          this.window.sendCommand('format:linestyle-rectilinear')
          break
        case 1:
          this.window.sendCommand('format:linestyle-oblique')
          break
        case 2:
          this.window.sendCommand('format:linestyle-roundrect')
          break
        case 3:
          this.window.sendCommand('format:linestyle-curve')
          break
        }
        this.updateStates({lineStyle: index})
      }
    })

    this.formatItem = new TouchBarSegmentedControl({
      mode: 'buttons',
      segments: [
        { icon: path.join(iconPath, 'tool-wordwrap.png') },
        { icon: path.join(iconPath, 'tool-show-visibility.png') },
        { icon: path.join(iconPath, 'tool-show-namespace.png') },
        { icon: path.join(iconPath, 'tool-show-type.png') }
      ],
      change: (index) => {
        switch (index) {
        case 0:
          this.window.sendCommand('format:word-wrap')
          break
        case 1:
          this.window.sendCommand('format:show-visibility')
          break
        case 2:
          this.window.sendCommand('format:show-namespace')
          break
        case 3:
          this.window.sendCommand('format:show-type')
          break
        }
      }
    })

    this.compartmentItem = new TouchBarSegmentedControl({
      mode: 'buttons',
      segments: [
        { icon: path.join(iconPath, 'tool-suppress-attributes.png') },
        { icon: path.join(iconPath, 'tool-suppress-operations.png') },
        { icon: path.join(iconPath, 'tool-suppress-columns.png') }
      ],
      change: (index) => {
        switch (index) {
        case 0:
          this.window.sendCommand('format:suppress-attributes')
          break
        case 1:
          this.window.sendCommand('format:suppress-operations')
          break
        case 2:
          this.window.sendCommand('erd:suppress-columns')
          break
        }
      }
    })

    this.touchbar = new TouchBar({
      items: [
        new TouchBarSegmentedControl({
          mode: 'buttons',
          segments: [
            { icon: path.join(iconPath, 'chevron-left.png') },
            { icon: path.join(iconPath, 'chevron-right.png') }
          ],
          change: (index) => {
            switch (index) {
            case 0:
              this.window.sendCommand('view:previous-diagram')
              break
            case 1:
              this.window.sendCommand('view:next-diagram')
              break
            }
          }
        }),
        new TouchBarSpacer(),
        this.fillColorItem,
        new TouchBarPopover({
          icon: path.join(iconPath, 'tool-linestyle.png'),
          items: new TouchBar({
            items: [
              new TouchBarLabel({ label: 'Line Style' }),
              this.lineStyleItem
            ]
          }),
          showCloseButton: true
        }),
        new TouchBarPopover({
          icon: path.join(iconPath, 'tool-eye.png'),
          items: new TouchBar({
            items: [
              new TouchBarLabel({ label: 'Format' }),
              this.formatItem,
              this.compartmentItem
            ]
          }),
          showCloseButton: true
        }),
        new TouchBarSpacer(),
        new TouchBarSegmentedControl({
          mode: 'buttons',
          segments: [
            { icon: path.join(iconPath, 'zoom-in.png') },
            { icon: path.join(iconPath, 'zoom-out.png') }
          ],
          change: (index) => {
            switch (index) {
            case 0:
              this.window.sendCommand('view:zoom-in')
              break
            case 1:
              this.window.sendCommand('view:zoom-out')
              break
            }
          }
        })
      ]
    })
    this.window.browserWindow.setTouchBar(this.touchbar)
    this.updateStates({
      lineStyle: null
    })
  }

  /**
   * Update touchbar states
   * @param {object} states
   */
  updateStates (states) {
    if (states.lineStyle === null) {
      this.lineStyleItem.mode = 'buttons'
    } else {
      this.lineStyleItem.mode = 'single'
      this.lineStyleItem.selectedIndex = states.lineStyle
    }
  }
}

module.exports = Touchbar
