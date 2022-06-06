const path = require('path');
const {cwd, modulePath} = require('./read_config');

console.log(path.join(cwd, modulePath));
