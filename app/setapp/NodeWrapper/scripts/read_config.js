const {lilconfigSync} = require('lilconfig');
const path = require('path');
const checkConfig = require('./check_config');
const SetappError = require('./setapp_error');

const explorer = lilconfigSync('setapp', {
  searchPlaces: [
    'package.json',
    '.setapp.json',
    '.setapp.js'
  ]
});
const result = explorer.search(process.cwd());

if (result === null) throw new SetappError('noConfig');

checkConfig(result.config);

module.exports = {
  cwd: path.dirname(result.filepath),
  modulePath: result.config.modulePath,
};
