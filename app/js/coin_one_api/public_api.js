window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')
var apiEndpoints = require('./endpoints.js')
var credentials = require('./../../../coinOneCredentials.json')
var coinOneHelper = require('./helper.js')

module.exports = {
  getTicker: getTicker
}

function getTicker(currency, succeded, failed) {
  if (!coinOneHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.TICKER_ENDPOINT +
         "?currency=" + currency,
    type: 'GET',
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
