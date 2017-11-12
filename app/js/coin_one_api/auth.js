window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')
const Token = require('./token.js')
const credentials = require("./../../../coinOneCredentials.json")
const apiEndpoints = require('./endpoints.js')

/* API Endpoints */
const RESOURCE_USER_AUTH = apiEndpoints.API_V2_ENDPOINT

/* Credentials */
const CLIENT_ID = credentials.accessToken
const CLIENT_SECRET = credentials.secretKey

module.exports = {
  requestAuthToken: requestAuthToken,
  refreshAuthToken: refreshAuthToken,
  createAuthToken: createAuthToken,
  getUserToken: getUserToken
}

function requestAuthToken(username, pword, succeded, failed) {
  $.ajax({
    url: RESOURCE_USER_AUTH,
    type: 'POST',
    data: "client_id=" + CLIENT_ID +
          "&client_secret=" + CLIENT_SECRET +
          "&username=" + username +
          "&password=" + pword +
          "&grant_type=password",
    success: function (data, textStatus, jqXHR) {
      succeded(getUserToken(data))
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function refreshAuthToken(refreshToken, succeded, failed) {
  $.ajax({
    url: RESOURCE_USER_AUTH,
    type: 'POST',
    data: "client_id=" + CLIENT_ID +
          "&client_secret=" + CLIENT_SECRET +
          "&refresh_token=" + refreshToken +
          "&grant_type=refresh_token",
    success: function (data, textStatus, jqXHR) {
      succeded(data)
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function createAuthToken(token) {
  return 'Bearer ' + token
}

function getUserToken(jsonObj) {
  let token = new Token()
  token.init(jsonObj, (refreshToken) => {
    refreshAuthToken(refreshToken, (data) => {
      console.log("Token has been refreshed successfully.")
    }), (err) => {
      console.log("While refreshing token, an error has occured. Error: " + err)
      console.log("Please try to login again.")
    }
  })

  return token
}
