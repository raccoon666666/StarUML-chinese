const SetappError = require('../scripts/setapp_error');

let binding

try {
  binding = require('./binding/setapp.node');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    throw new SetappError('noBinary');
  }
  throw error;
}

module.exports = exports = binding;