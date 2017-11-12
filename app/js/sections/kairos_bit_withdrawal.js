window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')

const kairosBitPrivateApiClient = require("./../kairosbit_api/private_api.js")
const USD_TO_KRW = 1128.31

$(document).ready(function() {
  console.log("DOM ready")

  let kairosBitSection = document.getElementById('kairos-bit-withdrawal')

  console.log("KairosBit Section: " + JSON.stringify(kairosBitSection));

  showWalletAddress(kairosBitSection)

  $(kairosBitSection).find('#withdrawal-submit').click(function(event) {
    // TODO: before, show a pop up for confirmation
    sendBTC(kairosBitSection)
  })
})

function showWalletAddress(kairosBitSection) {
  kairosBitPrivateApiClient.getCoinAddress("token", "userId", function(data) {
    console.log("Address: " + JSON.stringify(data))

    if (data.result == "success") {
      $(kairosBitSection).find('#btc_address').html(data.addresses[0])
    } else {
      failure(data.error)
    }
  }, function(err) {
    console.log("Server request has been failed. Error: " + err)
  })
}

function sendBTC(kairosBitSection) {
  let address = $(kairosBitSection).find('#withdrawal-address').val()
  let quantity = $(kairosBitSection).find('#withdrawal-amount').val()

  kairosBitPrivateApiClient.withdrawCoin("token", "userId", quantity, "from", address, function(data) {
    console.log("Your transaction result: " + JSON.stringify(data))

    if (data.result == "success") {
      console.log("Your transaction has been completed successfully.")
    } else {
      failure(data.error)
    }

  }, function(err) {
    console.log("Server request has been failed. Error: " + err)
  })
}

function failure(err) {
  console.log("Server request has been failed. Error: " + err)
}
