const errorsWarnings = require('./errorsWarnings.js')
var crypto = require('crypto')

module.exports = {
  checkNumberOfApiCalls: checkNumberOfApiCalls,
  createSignature: createSignature,
  createEncodedPayload: createEncodedPayload
}

const API_CALL_LIMIT_INTERVAL = 60000
const API_CALL_LIMIT = 90
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

function createSignature(encodedPayload, secretKey) {
  return crypto.createHmac("sha512", secretKey.toUpperCase())
               .update(encodedPayload)
               .digest('hex')
}

function createEncodedPayload(jsonPayload) {
  return new Buffer(JSON.stringify(jsonPayload)).toString('base64')
}
