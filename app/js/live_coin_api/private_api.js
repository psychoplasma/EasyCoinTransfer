window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')
var apiEndpoints = require('./endpoints.js')
var crypto = require('crypto')
var liveCoinHelper = require('./helper.js')
var preferences = require('../support/preferences.js')

var hasCredentials = false
var credentials

module.exports = {
  getTradeHistory: getTradeHistory,
  getClientOrders: getClientOrders,
  getOrderById: getOrderById,
  getCoinAddress: getCoinAddress,
  getBalances: getBalances,
  getTransactionHistory: getTransactionHistory,
  withdrawCoin: withdrawCoin,
  buyOnMarket: buyOnMarket,
  sellOnMarket: sellOnMarket,
  buyLimit: buyLimit,
  sellLimit: sellLimit,
  cancelLimit: cancelLimit,
  getApiCredentials: getApiCredentials
}

function getTradeHistory(limit, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  checkApiCredentials(function() {
    let payload = "currencyPair=BTC%2FUSD" + "&limit=" + limit
    let signature = createSignutare(payload)

    $.ajax({
      url: apiEndpoints.API_ENDPOINT +
           apiEndpoints.TRADES_ENDPOINT + "?" + payload,
      headers: {
        "Api-key": credentials.apiKey,
        "Sign": signature
      },
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
  })
}

function getClientOrders(currencyPair, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "currencyPair=" + currencyPair
  let signature = createSignutare(payload)

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.CLIENT_ORDERS_ENDPOINT + "?" + payload,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature
    },
    type: 'GET',
    success: function (data, textStatus, jqXHR) {
      if (data.success) {
        succeded(data)
      } else {
        failed(data.exception)
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function getOrderById(orderId, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "orderId=" + orderId
  let signature = createSignutare(payload)

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.ORDER_ENDPOINT + "?" + payload,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature
    },
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

function getCoinAddress(currency, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  checkApiCredentials(function() {
    let payload = "currency=" + currency
    let signature = createSignutare(payload)

    $.ajax({
      url: apiEndpoints.API_ENDPOINT +
           apiEndpoints.GET_ADDRESS_ENDPOINT + "?" + payload,
      headers: {
        "Api-key": credentials.apiKey,
        "Sign": signature
      },
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
  })
}

function getBalances(currency, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "currency=" + currency
  let signature = createSignutare(payload)

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.BALANCES_ENDPOINT + "?" + payload,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature
    },
    type: 'GET',
    success: function (data, textStatus, jqXHR) {
      if (data.success) {
        succeded(data)
      } else {
        failed(data.exception)
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function getTransactionHistory(startTime, endTime, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "end=" + endTime + "&start=" + startTime
  let signature = createSignutare(payload)

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.TRANSACTIONS_ENDPOINT + "?" + payload,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature
    },
    type: 'GET',
    success: function (data, textStatus, jqXHR) {
      if (data.success) {
        succeded(data)
      } else {
        failed(data.exception)
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

// Does not support extra wallet information yet
// Only the wallet address is supported
function withdrawCoin(amount, currency, wallet, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "amount=" + amount +
                "&currency=" + currency +
                "&wallet=" + wallet

  let signature = createSignutare(payload)

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.WITHDRAWAL_ENDPOINT,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature
    },
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

function buyOnMarket(isAsync, quantity, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "currencyPair=BTC%2FUSD" + "&quantity=" + quantity
  let signature = createSignutare(payload)

  $.ajax({
    async: isAsync,
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.BUY_MARKET_ENDPOINT,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature,
    },
    type: 'POST',
    data: payload,
    success: function (data, textStatus, jqXHR) {
      if (data.success) {
        succeded(data)
      } else {
        failed(data.exception)
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      //console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function sellOnMarket(isAsync, quantity, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "currencyPair=BTC%2FUSD" + "&quantity=" + quantity
  let signature = createSignutare(payload)

  $.ajax({
    async: isAsync,
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.SELL_MARKET_ENDPOINT,
    headers: {
      "Api-Key": credentials.apiKey,
      "Sign": signature
    },
    type: 'POST',
    data: payload,
    success: function (data, textStatus, jqXHR) {
      console.log("SellOnMarket Request: " + JSON.stringify(data))
      if (data.success) {
        succeded(data)
      } else {
        failed(data.exception)
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      //console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function buyLimit(price, quantity, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "currencyPair=BTC%2FUSD" +
                "&price=" + price +
                "&quantity=" + quantity
  let signature = createSignutare(payload)

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.BUY_LIMIT_ENDPOINT,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature,
    },
    type: 'POST',
    data: payload,
    success: function (data, textStatus, jqXHR) {
      if (data.success) {
        succeded(data)
      } else {
        failed(data.exception)
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      //console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function sellLimit(price, quantity, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "currencyPair=BTC%2FUSD" +
                "&price=" + price +
                "&quantity=" + quantity
  let signature = createSignutare(payload)

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.SELL_LIMIT_ENDPOINT,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature,
    },
    type: 'POST',
    data: payload,
    success: function (data, textStatus, jqXHR) {
      if (data.success) {
        succeded(data)
      } else {
        failed(data.exception)
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
    //  console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function cancelLimit(orderId, succeded, failed) {
  if (isApiCallLimitExceeded()) return

  let payload = "currencyPair=BTC%2FUSD" +
                "&orderId=" + orderId
  let signature = createSignutare(payload)

  $.ajax({
    url: apiEndpoints.API_ENDPOINT +
         apiEndpoints.CANCEL_LIMIT_ENDPOINT,
    headers: {
      "Api-key": credentials.apiKey,
      "Sign": signature,
    },
    type: 'POST',
    data: payload,
    success: function (data, textStatus, jqXHR) {
      if (data.success) {
        succeded(data)
      } else {
        failed(data.exception)
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      failed(jqXHR.responseText)
    },
    beforeSend: function (jqXHR, settings) {
      console.log("AJAX object: " + JSON.stringify(this))
    }
  })
}

function createSignutare(payload) {
  return crypto.createHmac("sha256", credentials.secretKey)
               .update(payload)
               .digest('hex')
               .toUpperCase()
}

function getApiCredentials() {
  return new Promise(function(resolve, reject) {
    preferences.getApiCredentials(function(data) {
      resolve(data)
    }, function(err) {
      reject(err)
    })
  })
}

function checkApiCredentials(callback) {
  if (!hasCredentials) {
    getApiCredentials().then(function(data) {
      if (data === 'undefined' || data == '') throw 'Null credentials!'
      hasCredentials = true
      credentials = data
      console.log("Credentials: " + JSON.stringify(data))
      callback()
    }).catch(function() {
      console.log("Error: Cannot retrieve credentials!")
    })
  } else {
    callback()
  }
}

function isApiCallLimitExceeded() {
  return !liveCoinHelper.checkNumberOfApiCalls((message) => {
    console.log("Api Limit Check: " + message)
  })
}
