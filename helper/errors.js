var errorFactory = require('error-factory');

module.exports = {
  ValidationError: errorFactory('ValidationError', [ 'message', 'errors' ]),
  DuplicateError: errorFactory('DuplicateError'),
  AccessDeniedError: errorFactory('AccessDeniedError'),
  DeviceError: errorFactory('DeviceIsIncorrect'),
  isLastAdmin: errorFactory('LastAdminError', ['message']),
  noFile: errorFactory('NoFileError', ['message']),
  invalidFile: errorFactory('FileTypeIsIncorrect', ['message']),
  errorExport: errorFactory('ErrorExportFile', ['message'])
};