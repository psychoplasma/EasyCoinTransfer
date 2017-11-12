window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')

const notifier = require('../support/notifier.js')
const res = require('../../res/strings.json')
const moment = require("moment")
const SimpleNodeLogger = require('simple-node-logger')
const liveCoinPublicApiClient = require("./public_api.js")
const liveCoinPrivateApiClient = require("./private_api.js")

const opts = {
		logFilePath:'stateMachine.log',
		timestampFormat:'YYYY-MM-DD HH:mm:ss'
}
var	log = SimpleNodeLogger.createSimpleLogger(opts)

const STATE_MACHINE_TIMER = 3000
const STATE_MACHINE_MAX_TIMER = 30000
const MIN_AUTO_BUY_SELL_QUANTITY = 0.0001

// States for the state machine
const State = {
  WAIT: 'WAIT',
  LAST_PRICE: 'GET_LAST_PRICE',
  BUY: 'BUY',
  SELL: 'SELL',
  PUT_SELL_ORDER: 'PUT_SELL_ORDER',
  PUT_BUY_ORDER: 'PUT_BUY_ORDER',
  CHECK_ORDER_STATUS: 'CHECK_ORDER_STATUS',
  CANCELED: 'CANCELED'
}

var tradeFeePercentage = 0.0018
var margin = 0.0014
var algorithm = 'Algorithm-1'

var initQuantity = 0
var lastPrice = 0
var lastOrderId = 0
var lastOrderType = ""

var stateMachineIntervalId = 0
var stateMachineCurrState
var stateMachinePrevState
var stateMachineLastError

var ordersTable


$(document).ready(function() {
  log.setLevel("info")

  ordersTable = document.getElementById('table-recent-orders')

  $('#auto-buy-sell-start').click(function(event) {
    initQuantity = $('#auto-buy-sell-start-quantity').val()
	margin = parseFloat($('#auto-buy-sell-start-margin').val())
	algorithm = $('#algorithm').val()

	log.info("Algorithm value has been set to " + algorithm)
	log.info("Margin value has been set to " + margin)

    if (initQuantity < MIN_AUTO_BUY_SELL_QUANTITY) {
      log.info(res.ERROR_TRADE_WRONG_AMOUNT)
	  notifier.showNotification(res.ERROR_TRADE_WRONG_AMOUNT)
      return
    }

    runStateMachine(State.BUY, STATE_MACHINE_TIMER)
  })

  $('#auto-buy-sell-stop').click(function(event) {
    stopStateMachine()
  })
})

function handleUIChanges(isStarted) {
	if (isStarted) {
		$('#auto-buy-sell-start').prop("disabled", true)
		$('#auto-buy-sell-stop').prop("disabled", false)
		$('#auto-buy-sell-start').html(res.BTN_TRADE_BOT_RUNNING)
	} else {
		$('#auto-buy-sell-start').prop("disabled", false)
		$('#auto-buy-sell-stop').prop("disabled", true)
		$('#auto-buy-sell-start').html(res.BTN_TRADE_BOT_START)
	}
}

function runStateMachine(startState, runInterval) {
  stateMachineCurrState = startState

  stateMachineIntervalId = setInterval(function() {
    stateMachine()
  }, runInterval)

	handleUIChanges(true)
	notifier.showNotification(res.INFO_TRADE_BOT_STARTED)
	log.info("State machine has been started.")
}

function updateStateMachine(startState, runInterval) {
  stopStateMachine()
  runStateMachine(startState, runInterval)
}

function stopStateMachine() {
  	clearInterval(stateMachineIntervalId)
	handleUIChanges(false)
	notifier.showNotification(res.INFO_TRADE_BOT_STOPPED)
  	log.info("State machine has been stopped.")
}

function stateMachine() {
  log.info("Current State: " + stateMachineCurrState)

  switch(stateMachineCurrState) {
    case State.WAIT:
      break;
    case State.LAST_PRICE:
      getLastPrice();
      break;
    case State.BUY:
      buyBTC(initQuantity);
      break;
    case State.SELL:
      sellBTC(initQuantity);
      break;
    case State.PUT_BUY_ORDER:
      putBuyOrder(initQuantity);
      break;
    case State.PUT_SELL_ORDER:
      putSellOrder(initQuantity);
      break;
    case State.CHECK_ORDER_STATUS:
      checkOrderStatus();
      break;
    case State.CANCELED:
      stopStateMachine();
      break;
  }
}

//-------State functions START-------//
function buyBTC(quantity) {
  stateMachineCurrState = State.WAIT

  liveCoinPrivateApiClient.buyOnMarket(true, quantity, function(data) {
    log.info("buyOnMarket: ", JSON.stringify(data))
    lastOrderId = data.orderId
    stateMachineCurrState = State.CHECK_ORDER_STATUS
    stateMachinePrevState = State.BUY
  }, stateMachineFailure)
}

function putBuyOrder(quantity) {
  stateMachineCurrState = State.WAIT

  let buyPrice = calculateNextPrice(true).toFixed(5)

  liveCoinPrivateApiClient.buyLimit(buyPrice, quantity, function(data) {
    log.info("buyLimit: ", JSON.stringify(data))
    lastOrderId = data.orderId
    addOrderToOrdersTable("Buy", lastOrderId)
    stateMachineCurrState = State.CHECK_ORDER_STATUS
    stateMachinePrevState = State.PUT_BUY_ORDER
  }, stateMachineFailure)
}

function sellBTC(quantity) {
  stateMachineCurrState = State.WAIT

  liveCoinPrivateApiClient.sellOnMarket(true, quantity, function(data) {
      log.info("sellOnMarket: ", JSON.stringify(data))
      lastOrderId = data.orderId
      stateMachineCurrState =  State.LAST_PRICE
      stateMachinePrevState = State.SELL
  }, stateMachineFailure)
}

function putSellOrder(quantity) {
  stateMachineCurrState = State.WAIT

  let sellPrice = calculateNextPrice(false).toFixed(5)

  liveCoinPrivateApiClient.sellLimit(sellPrice, quantity, function(data) {
      log.info("sellLimit: ", JSON.stringify(data))
      lastOrderId = data.orderId
      addOrderToOrdersTable("Sell", lastOrderId)
      stateMachineCurrState =  State.CHECK_ORDER_STATUS
      stateMachinePrevState = State.PUT_SELL_ORDER
  }, stateMachineFailure)
}

function getLastPrice() {
  stateMachineCurrState = State.WAIT

  liveCoinPrivateApiClient.getTradeHistory(1, function(data) {
    log.info("getTradeHistory: " + JSON.stringify(data))
    let tradeType

    if (data[0].clientorderid == lastOrderId) {
      tradeType = data[0].type
    } else {
      // TODO: come up with a better way to handle this case
      stateMachineCurrState = State.CANCELED
      return
    }

    if (tradeType == "sell") {
      log.info("The last price (sold): " + data[0].price)

	  if (algorithm == 'Algorithm-1') {
		  stateMachineCurrState = State.PUT_BUY_ORDER
	  } else {
		  stateMachineCurrState = State.BUY
	  }

    } else if(tradeType == "buy") {
      log.info("The last price (bought): " + data[0].price)
      stateMachineCurrState = State.PUT_SELL_ORDER
    } else {
      // TODO: come up with a better way to handle this case
      stateMachineCurrState = State.CANCELED
      return
    }

    lastPrice = data[0].price
    stateMachinePrevState = State.LAST_PRICE
  }, function(err) {
    log.info("getTradeHistory -> Error: " + err)
    stateMachineCurrState = State.LAST_PRICE
  })
}

function checkOrderStatus() {
  stateMachineCurrState = State.WAIT

  liveCoinPrivateApiClient.getOrderById(lastOrderId, function(data) {
    log.info("getOrderById: " + JSON.stringify(data))
    if (data.status == "EXECUTED") {
      stateMachineCurrState = State.LAST_PRICE
      stateMachinePrevState = State.CHECK_ORDER_STATUS
      notifier.showNotification(lastOrderId + " " + res.INFO_ORDER_EXECUTED)
      removeOrderFromOrdersTable(lastOrderId)
    } else if (data.status == "PARTIALLY_FILLED" || data.status == "OPEN") {
      stateMachineCurrState = State.CHECK_ORDER_STATUS
    } else {
      stateMachineCurrState = State.CANCELED
	  // TODO: The order stats doesn't neccessarily have to be "CANCELED"
      //notifier.showNotification('Your order ' + lastOrderId + ' has been ' + data.status)
	  notifier.showNotification(lastOrderId + " " + res.INFO_ORDER_CANCELED)
      removeOrderFromOrdersTable(lastOrderId, data.status)
    }
  }, function(err) {
    log.info("getOrderById -> Error: " + err)
    stateMachineCurrState = State.CHECK_ORDER_STATUS
  })
}
//-------State functions END-------//

function stateMachineFailure(err) {
	log.info(stateMachineCurrState + " -> Error: ", JSON.stringify(err))
	notifier.showNotification(res.ERROR_STATE_MACHINE_FAILURE + JSON.stringify(err))
    stateMachineCurrState = State.CANCELED
}

function calculateNextPrice(orderType) {
  if (orderType) {
    // Calculate next buy limit
    return lastPrice * (1 - margin - tradeFeePercentage * 2)
  } else {
    // Calculate next sell limit
    return lastPrice * (1 + margin + tradeFeePercentage * 2)
  }
}

function addOrderToOrdersTable(orederType, orderId) {
  liveCoinPrivateApiClient.getOrderById(orderId, function(data) {
    let row = ordersTable.insertRow(-1)

    let orderIdCell = row.insertCell(0)
    let typeCell = row.insertCell(1)
    let dateCell = row.insertCell(2)
    let quantityCell = row.insertCell(3)
    let priceCell = row.insertCell(4)
    let statusCell = row.insertCell(5)

    orderIdCell.innerHTML = orderId
    dateCell.innerHTML = moment().format("YYYY-MM-DD HH:mm")
    priceCell.innerHTML = data.price.toLocaleString("en-US", {minimumFractionDigits: 2}) + " USD"
    quantityCell.innerHTML = data.quantity + " BTC"
    statusCell.innerHTML = data.status
	typeCell.innerHTML = orederType

    if (orederType == "Buy") {
      typeCell.style.color = "#3F9CD8"
      row.style.backgroundColor = "#F3FBFF"
    } else if (orederType == "Sell") {
      typeCell.style.color = "#ED587A"
      row.style.backgroundColor = "#FFF4F1"
    } else {
      // Nothing to do here
    }
  }, function(err) {
    // Notingh to do here
  })
}

function removeOrderFromOrdersTable(orderId) {
  let rows = ordersTable.rows
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].cells[0].innerHTML == orderId) {
      ordersTable.deleteRow(i)
      log.info('Order ', orderId, ' has been removed from the table.')
      return
    }
  }
}
