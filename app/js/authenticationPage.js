window.$ = window.jQuery = require('./../../node_modules/jquery/dist/jquery.min.js')
const {ipcRenderer} = require('electron')
const preferences = require('../js/support/preferences.js')

var apiKey, apiSecret

$(document).ready(function() {
  preferences.getAutoApiCredentials(function(data) {
      console.log("Auto value: " + JSON.stringify(data))
      $("#save-credentails").prop("checked", data.autoVal)

      if (data.autoVal) {
        preferences.getApiCredentials(function(data) {
          console.log("Credentials: " + JSON.stringify(data))
          $('#api-key').val(data.apiKey)
          $('#api-secret').val(data.secretKey)
        }, function(err) { console.log(err) })
      }
    }, function(err) {
      console.log(err)
  })

  $('#submit').click(function() {
    apiKey = $('#api-key').val()
    apiSecret = $('#api-secret').val()

    console.log("Api Key: " + apiKey + "\n\rApi Secret: " + apiSecret)

    let auto = $("#save-credentails").is(':checked')

    // Set auto property
    preferences.setAutoApiCredentials(auto, function(err) {
      console.log(err)
    })

    if (auto) {
        // Set api credentials
        preferences.setApiCredentials(apiKey, apiSecret, function(err) {
          console.log(err)
        })
    }

    // Go to main page and send the credentails
    ipcRenderer.send('credentials-done', {"apiKey": apiKey, "apiSecret": apiSecret})
  })
})
