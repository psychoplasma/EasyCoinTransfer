window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')

const liveCoinPublicApiClient = require("./../live_coin_api/public_api.js")
const moment = require("moment")
const USD_TO_KRW = 1128.31
const MAX_TRADE_NUMBER = 20

$(document).ready(function() {
  console.log("DOM ready")

  let ordersTable = document.getElementById("table-recent-trades")
  showRecentTrades(ordersTable)

  jQuery("#recent-orders-refresh").click(function(event) {
    clearRecentTrades(ordersTable)
    showRecentTrades(ordersTable)
  });
})

function showRecentTrades(ordersTable) {
  liveCoinPublicApiClient.getLastTrades("BTC/USD", function(data) {

    console.log("Recent trades: " + JSON.stringify(data))

    for (let i = 0; i < MAX_TRADE_NUMBER; i++) {
      let elem = data[i]
      let row = ordersTable.insertRow(-1)
      let typeCell = row.insertCell(0)
      let dateCell = row.insertCell(1)
      let quantityCell = row.insertCell(2)
      let priceCell = row.insertCell(3)

      dateCell.innerHTML = moment.unix(elem.time).format("YYYY-MM-DD HH:mm:ss")
      priceCell.innerHTML = elem.price.toLocaleString("en-US", {minimumFractionDigits: 2}) + " USD"
      quantityCell.innerHTML = elem.quantity + " BTC"

      if (elem.type == "BUY") {
        typeCell.innerHTML = "Buy"
        typeCell.style.color = "#3F9CD8"
        row.style.backgroundColor = "#F3FBFF"
      } else if (elem.type == "SELL") {
        typeCell.innerHTML = "Sell"
        typeCell.style.color = "#ED587A"
        row.style.backgroundColor = "#FFF4F1"
      } else {}
    }

  }, failure)
}

function clearRecentTrades(ordersTable) {
  console.log("Table row: " + ordersTable.rows.length);
  let tableLength = ordersTable.rows.length
  for (let i = 1; i < tableLength; i++) {
    ordersTable.deleteRow(1)
  }
}

function refreshRate() {
  liveCoinPublicApiClient.getTicker(true, "BTC/USD", function(data) {
    console.log("Ticker: " + JSON.stringify(data));
  }, failure)
}

function failure(err) {
  console.log("Server request has been failed. Error: " + err)
}
