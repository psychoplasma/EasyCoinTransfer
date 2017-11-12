window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')
var apiEndpoints = require('./endpoints.js')
var liveCoinHelper = require('./helper.js')

module.exports = {
  getTicker: getTicker,
  getCoinInfo: getCoinInfo,
  getLastTrades: getLastTrades
}

function getTicker(isAsync, currencyPair, succeded, failed) {
  if (!liveCoinHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  $.ajax({
    async: isAsync,
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.TICKER_ENDPOINT +
         "?currencyPair=" + currencyPair,
    type: 'GET',
    success: function (data, textStatus, jqXHR) {
      succeded(data)
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      //console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function getCoinInfo(succeded, failed) {
  if (!liveCoinHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.COIN_INFO_ENDPOINT,
    type: 'GET',
    success: function (data, textStatus, jqXHR) {
      succeded(data)
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      //console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function getLastTrades(currencyPair, succeded, failed) {
  if (!liveCoinHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let queryString = "?currencyPair=" + currencyPair

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.LAST_TRADES_ENDPOINT +
         queryString,
    type: 'GET',
    success: function (data, textStatus, jqXHR) {
      succeded(data)
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      //console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}
