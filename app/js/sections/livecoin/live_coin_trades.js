window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')

const liveCoinPrivateApiClient = require("./../live_coin_api/private_api.js")
const notifier = require('../support/notifier.js')
const res = require('../../res/strings.json')
const USD_TO_KRW = 1128.31

$(document).ready(function() {
  console.log("DOM ready")

  jQuery('#submit-buy').click(function(event) {
      buyBTC()

      jQuery('#quantity-buy').val('')
  })

  jQuery('#submit-sell').click(function(event) {
      sellBTC()

      jQuery('#quantity-sell').val('')
  })

})

function buyBTC() {
  let quantity = jQuery('#quantity-buy').val()

  liveCoinPrivateApiClient.buyOnMarket(true, quantity, function(data) {
    if (data.success) {
      notifier.showNotification(res.INFO_BUY_SUCCESSFUL + data.orderId)
      console.log(res.INFO_BUY_SUCCESSFUL + data.orderId)
    } else {
      notifier.showNotification(res.ERROR_BUY_MARKET + data.exception)
      console.log(res.ERROR_BUY_MARKET + data.exception)
    }

  }, failure)
}

function sellBTC() {
  let quantity = jQuery('#quantity-sell').val()

  liveCoinPrivateApiClient.sellOnMarket(true, quantity, function(data) {
    if (data.success) {
      notifier.showNotification(res.INFO_SELL_SUCCESSFUL + data.orderId)
      console.log(res.INFO_SELL_SUCCESSFUL + data.orderId)
    } else {
      notifier.showNotification(res.ERROR_SELL_MARKET + data.exception)
      console.log(res.ERROR_SELL_MARKET + data.exception)
    }
  }, failure)
}

function failure(err) {
  notifier.showNotification(res.ERROR_API_REQUEST + err)
}
