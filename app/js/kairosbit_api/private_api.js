window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')
var apiEndpoints = require('./endpoints.js')
var credentials = require('./../../../kairosbitCredentials.json')
var kairosBitHelper = require('./helper.js')

module.exports = {
  getToken: getToken,
  getCoinAddress: getCoinAddress,
  withdrawCoin: withdrawCoin
}

function getToken(succeded, failed) {
  if (!kairosBitHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = "api_id=" + credentials.apiId +
                "api_key=" + credentials.apiKey

  $.ajax({
    url: apiEndpoints.API_ENDPOINT,
    type: 'POST',
    data: payload,
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

function getCoinAddress(token, userId, succeded, failed) {
  if (!kairosBitHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = "token=" + token + "&id=" + userId

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.GET_WALLET_INFO_ENDPOINT,
    type: 'POST',
    data: payload,
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

function withdrawCoin(token, userId, amount, fromWallet,
  toWallet, succeded, failed) {
  if (!kairosBitHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = "token=" + token +
                "&id=" + userId +
                "&amount=" + amount +
                "&from=" + fromWallet +
                "&to=" + toWallet

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.WITHDRAWAL_ENDPOINT,
    type: 'POST',
    data: payload,
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
