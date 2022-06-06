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

global.meta = {}
global.type = {}
global.rules = []

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const AppContext = require('./app-context')

global.app = new AppContext()

require('./engine/default-commands')

global.app.start()
