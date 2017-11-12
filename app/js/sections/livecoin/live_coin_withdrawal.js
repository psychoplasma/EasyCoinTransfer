window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')

const dialog = require('../support/showDialog.js')
const res = require('../../res/strings.json')
const notifier = require('../support/notifier.js')
const liveCoinPublicApiClient = require("./../live_coin_api/public_api.js")
const liveCoinPrivateApiClient = require("./../live_coin_api/private_api.js")

var liveCoinSection

var mAddress
var mQuantity

$(document).ready(function() {
  liveCoinSection = document.getElementById('live-coin-withdrawal')

  refreshRate()
  showWalletAddress()

  $(liveCoinSection).find('#withdrawal-submit').click(function(event) {
    getInputFormValues()
    // Ask for confirmation
    dialog.showQuestionDialog(res.QS_SEND_COIN, () => {
        sendBTC(mQuantity, mAddress)
    })
  })

  $(liveCoinSection).find('#withdrawal-refresh-button').click(function(event) {
    refreshRate()
  })

})

function showWalletAddress() {
  liveCoinPrivateApiClient.getCoinAddress("BTC", function(data) {
    if (data.currency == "BTC") {
      $(liveCoinSection).find('#btc_address').html(data.wallet)
    }
  }, failure)
}

function sendBTC(quantity, address) {
  liveCoinPrivateApiClient.withdrawCoin(quantity, "BTC", address, function(data) {
    console.log("Your transaction result: " + JSON.stringify(data))

    if (data.fault == null) {
        // Clear input fields
        clearInputFormValues()
        // Show notification to inform user
        notifier.showNotification(res.INFO_TRANSACTION_SUCCESSFUL)
        console.log(res.INFO_TRANSACTION_SUCCESSFUL)
    } else {
      failure(JSON.stringify(data))
    }

  }, failure)
}

function refreshRate() {
  liveCoinPublicApiClient.getTicker(true, "BTC/USD", function(data) {
    console.log("Ticker: " + JSON.stringify(data));

    $(liveCoinSection).find('#withdrawal-btc-rate-usd').html(data.last.toFixed(3) + " USD")

  }, failure)
}

function getInputFormValues() {
    mAddress = $(liveCoinSection).find('#withdrawal-address').val()
    mQuantity = $(liveCoinSection).find('#withdrawal-amount').val()
}

function clearInputFormValues() {
    $(liveCoinSection).find('#withdrawal-address').val('')
    $(liveCoinSection).find('#withdrawal-amount').val('')
}

function failure(err) {
  console.log("Server request has been failed. Error: " + err)
  notifier.showNotification(err)
}
