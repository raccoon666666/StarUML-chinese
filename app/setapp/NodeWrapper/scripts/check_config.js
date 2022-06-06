const SetappError = require('./setapp_error');

module.exports = function checkConfig(config) {
  if (typeof config !== 'object') {
    throw new SetappError('noObjectConfig');
  }
  if (Object.keys(config).length === 0) {
    throw new SetappError('emptyConfig');
  }
  if (typeof config.modulePath !== 'string') {
    throw new SetappError('pathNotString');
  }
}
