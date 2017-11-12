window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')
var apiEndpoints = require('./endpoints.js')
var credentials = require('./../../../coinOneCredentials.json')
var crypto = require('crypto')
var coinOneHelper = require('./helper.js')

module.exports = {
  getBTCAddress: getBTCAddress,
  getBalances: getBalances,
  getUserInfo: getUserInfo,
  authenticateOTP: authenticateOTP,
  getTransactionHistory: getTransactionHistory,
  withdrawBTC: withdrawBTC,
  getBalancesV1: getBalancesV1
}

function getBalancesV1(succeded, failed) {
  if (!coinOneHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  $.ajax({
    url: apiEndpoints.API_V1_ENDPOINT +
         apiEndpoints.BALANCES_ENDPOINT +
         "?access_token=" + credentials.accessTokenV1,
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

function getBTCAddress(succeded, failed) {
  if (!coinOneHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = {
    "access_token": credentials.accessToken,
    "nonce": Date.now()
  }
  let encodedPayload = coinOneHelper.createEncodedPayload(payload)
  let signature = coinOneHelper.createSignature(encodedPayload, credentials.secretKey)

  $.ajax({
    url: apiEndpoints.API_V2_ENDPOINT +
         apiEndpoints.GET_ADDRESS_ENDPOINT,
    headers: {
      'content-type':'application/json',
      'X-COINONE-PAYLOAD': encodedPayload,
      'X-COINONE-SIGNATURE': signature
    },
    type: 'POST',
    data: encodedPayload,
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

function getBalances(succeded, failed) {
  if (!coinOneHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = {
    "access_token": credentials.accessToken,
    "nonce": Date.now()
  }
  let encodedPayload = coinOneHelper.createEncodedPayload(payload)
  let signature = coinOneHelper.createSignature(encodedPayload, credentials.secretKey)

  $.ajax({
    url: apiEndpoints.API_V2_ENDPOINT +
         apiEndpoints.BALANCES_ENDPOINT,
    headers: {
      'content-type':'application/json',
      'X-COINONE-PAYLOAD': encodedPayload,
      'X-COINONE-SIGNATURE': signature
    },
    type: 'POST',
    data: encodedPayload,
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

function getUserInfo(succeded, failed) {
  if (!coinOneHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = {
    "access_token": credentials.accessToken,
    "nonce": Date.now()
  }
  let encodedPayload = coinOneHelper.createEncodedPayload(payload)
  let signature = coinOneHelper.createSignature(encodedPayload, credentials.secretKey)

  $.ajax({
    url: apiEndpoints.API_V2_ENDPOINT +
         apiEndpoints.USER_INFO_ENDPOINT,
    headers: {
      'content-type':'application/json',
      'X-COINONE-PAYLOAD': encodedPayload,
      'X-COINONE-SIGNATURE': signature
    },
    type: 'POST',
    data: encodedPayload,
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

function authenticateOTP(succeded, failed) {
  if (!coinOneHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = {
    "access_token": credentials.accessToken,
    "type": "btc",
    "nonce": Date.now()
  }
  let encodedPayload = coinOneHelper.createEncodedPayload(payload)
  let signature = coinOneHelper.createSignature(encodedPayload, credentials.secretKey)

  $.ajax({
    url: apiEndpoints.API_V2_ENDPOINT +
         apiEndpoints.OTP_AUTH_ENDPOINT,
    headers: {
      'content-type':'application/json',
      'X-COINONE-PAYLOAD': encodedPayload,
      'X-COINONE-SIGNATURE': signature
    },
    type: 'POST',
    data: encodedPayload,
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

function getTransactionHistory(succeded, failed) {
  if (!coinOneHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = {
    "access_token": credentials.accessToken,
    "currency": "btc",
    "nonce": Date.now()
  }
  let encodedPayload = coinOneHelper.createEncodedPayload(payload)
  let signature = coinOneHelper.createSignature(encodedPayload, credentials.secretKey)

  $.ajax({
    url: apiEndpoints.API_V2_ENDPOINT +
         apiEndpoints.TRANSACTIONS_ENDPOINT,
    headers: {
      'content-type':'application/json',
      'X-COINONE-PAYLOAD': encodedPayload,
      'X-COINONE-SIGNATURE': signature
    },
    type: 'POST',
    data: encodedPayload,
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

function withdrawBTC(amount, receiverWallet, senderWallet, authOTP, succeded, failed) {
  if (!coinOneHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })) {
    return
  }

  let payload = {
    "access_token": credentials.accessToken,
    "address": receiverWallet,
    "auth_number": authOTP,
    "qty": amount,
    "type": "trade",
    "from_address": senderWallet,
    "nonce": Date.now()
  }
  let encodedPayload = coinOneHelper.createEncodedPayload(payload)
  let signature = coinOneHelper.createSignature(encodedPayload, credentials.secretKey)

  $.ajax({
    url: apiEndpoints.API_V2_ENDPOINT +
         apiEndpoints.WITHDRAWAL_ENDPOINT,
    headers: {
      'content-type':'application/json',
      'X-COINONE-PAYLOAD': encodedPayload,
      'X-COINONE-SIGNATURE': signature
    },
    type: 'POST',
    data: encodedPayload,
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
