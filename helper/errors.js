var errorFactory = require('error-factory');

module.exports = {
  ValidationError: errorFactory('ValidationError', [ 'message', 'errors' ]),
  DuplicateError: errorFactory('DuplicateError'),
  AccessDeniedError: errorFactory('AccessDeniedError')
};