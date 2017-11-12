const errorsWarnings = require('./errorsWarnings.js')

module.exports = {
  checkNumberOfApiCalls: checkNumberOfApiCalls
}

const API_CALL_LIMIT_INTERVAL = 60000
const API_CALL_LIMIT = 60
var numberOfCalls = 0
var lastCallTime = 0

function checkNumberOfApiCalls(warning) {
  currentTime = Date.now()

  if (currentTime - lastCallTime > API_CALL_LIMIT_INTERVAL) {
    numberOfCalls = 0
    lastCallTime = currentTime
  }

  if (numberOfCalls >= API_CALL_LIMIT) {
    if (warning != "undefined" || warning != null) {
      warning(errorsWarnings.API_CALL_LIMIT_EXCEEDED)
    }
    return false
  }

  numberOfCalls++

  return true
}
