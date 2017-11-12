const scheduler = require('node-schedule')
const errors = require('./errorsWarnings.js')

module.exports = Token

function Token() {
  this.token = ""
  this.expiry = 0
  this.refresh_token = ""
}

Token.prototype.init = function(obj, refreshTokenCallback) {
  if (obj == null || typeof obj != "object") {
    throw errors.ERROR_EMPTY_TOKEN
  }

  if (obj.access_token !== 'undefined') {
    this.token = obj.access_token
  } else {
    throw errors.ERROR_EMPTY_TOKEN
  }

  if (obj.expires_in !== 'undefined') {
    this.expiry = obj.expires_in
  } else {
    throw errors.ERROR_EMPTY_TOKEN
  }

  if (obj.refresh_token !== 'undefined') {
    this.refresh_token = obj.refresh_token
  } else {
    throw errors.ERROR_EMPTY_TOKEN
  }

  scheduleTokenRefresh(this.refresh_token, refreshTokenCallback)
}

Token.prototype.getToken = function() {
   return this.token
}

Token.prototype.getExpiry = function() {
   return this.expiry
}

Token.prototype.getRefreshToken = function() {
   return this.refresh_token
}

scheduleTokenRefresh = function(refreshToken, refreshTokenCallback) {
  let currentTime = Date.now()
  let scheduledTime_ = new Date(currentTime + this.expiry - 60000)
  let scheduledTime = new Date(currentTime + 10000)

  var j = scheduler.scheduleJob(scheduledTime, function() {
    console.log('Refreshing token...')
    refreshTokenCallback(refreshToken)
  })
}
