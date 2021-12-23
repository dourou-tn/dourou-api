/**
 * Log and Format Errors sent by the API
 * All errors have the same structure: success, message, code, data
 *
 * @param {Number} code status code
 * @param {String} message A message to be sent to the client
 * @param {Array} data data to be sent to the client
 * @returns {Object} error object
 */
const Error = (code, message, data = []) => {
  console.error(`❗ Error: ${code} - ${message}`);
  if (data.length) {
    console.error('Error data:');
    console.table(data)
  }
  return { success: false, code, message, data };
}

module.exports = Error
