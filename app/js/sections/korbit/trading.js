window.$ = window.jQuery = require('../../../../node_modules/jquery/dist/jquery.min.js')

const {ipcRenderer}  = require('electron')
const moment = require('moment')
const Token = require("../../korbit_api/token.js")
const ApiClient = require("../../korbit_api/apiClient.js")
const StateMachine = require('../../trading_bots/stateMachine.js')
const {CurrencyPair, Rounder} = require("../../korbit_api/defines.js")
const notifier = require('../../support/notifier.js')
const res = require('../../../res/strings.json')
const logger = require('simple-node-logger')

const opts = {
		logFilePath:'easycointransfer.log',
		timestampFormat:'YYYY-MM-DD HH:mm:ss'
}
var	log = logger.createSimpleLogger(opts)
log.setLevel("info")

let korbitToken = {}
let tradingBot = {}
let korbitClient = {}
let isInitialized = false

let capital = 0
let algorithm = ""
let margin = 0
let currency = ""

let lastOrderId

let ordersTable

$(document).ready(() => {
    ordersTable = document.getElementById('table-recent-orders')

    // Inform the main process to send token
    ipcRenderer.send('main-page-ready')

    $('#auto-buy-sell-start').click(function(event) {
        getFormValues()
        startTradingBot()
    })

    $('#auto-buy-sell-stop').click(function(event) {
        stopTradingBot()
    })
})


function uiStartState() {
	$('#auto-buy-sell-start').prop("disabled", true)
	$('#auto-buy-sell-stop').prop("disabled", false)
}

function uiStopState() {
	$('#auto-buy-sell-start').prop("disabled", false)
	$('#auto-buy-sell-stop').prop("disabled", true)
}

function getFormValues() {
    capital = $('#auto-buy-sell-start-quantity').val()
    margin = parseFloat($('#auto-buy-sell-start-margin').val())
    algorithm = $('#algorithm').val()
	currency = $('#currency').val()
}

function init(token) {
    initToken(token)

    korbitClient = new ApiClient(korbitToken)

    if (korbitToken !== 'undefined' && korbitToken.isAuthorized()) {
		korbitToken.checkExpiry()
        initTradingBot()
        isInitialized = true
        console.log("Trading has been initialized")
    } else {
        console.log("Token is not valid! Token: " + JSON.stringify(korbitToken))
    }
}

function initToken(token) {
    korbitToken = new Token()
    korbitToken.setToken(token)
}

function initTradingBot() {
	try {
		tradingBot = new StateMachine(korbitClient)
		tradingBot.on('start', () => {
            notifier.showNotification(res.INFO_TRADE_BOT_STARTED)
            log.info(res.INFO_TRADE_BOT_STARTED)
		})
		tradingBot.on('stop', () => {
			uiStopState()
            notifier.showNotification(res.INFO_TRADE_BOT_STOPPED)
            log.info(res.INFO_TRADE_BOT_STOPPED)
		})
        tradingBot.on('next-state', (msg) => {
			log.info(msg)
		})
		tradingBot.on('failure', (err) => {
            let msg = "Tradingbot has been failed. Error: " + err
            notifier.showNotification(msg)
            log.info(msg)
		})
        tradingBot.on('error', (err) => {
            let msg = "Tradingbot has faced an error. " + err
            log.info(msg)
        })
        tradingBot.on('ticker', (ticker) => {
            log.info("Ticker: " + ticker.lastPrice + " at " +
              moment.unix(ticker.timeStamp / 1000).format("YYYY-MM-DD HH:mm:ss"))
        })
        tradingBot.on('buy-success', (orderId) => {
            let msg = "Market buy order with id: " +
                orderId + " has been successfully filled!"
			notifier.showNotification(msg)
            log.info(msg)
		})
        tradingBot.on('sell-success', (orderId) => {
            let msg = "Market sell order with id: " +
                orderId + " has been successfully filled!"
			notifier.showNotification(msg)
            log.info(msg)
		})
        tradingBot.on('put-buy-order', (order) => {
			lastOrderId = order.orderId
		})
        tradingBot.on('put-sell-order', (order) => {
			lastOrderId = order.orderId
		})
		tradingBot.on('order-open', (order) => {
			if (lastOrderId == order.orderId) {
				addOrderToOrdersTable(order)
				log.info(JSON.stringify(order))
				lastOrderId = 0
			}
		})
        tradingBot.on('order-filled', (orderId) => {
			removeOrderFromOrdersTable(orderId)
            log.info(orderId + " order has been filled.")
		})
        tradingBot.on('last-price', (trade) => {
            log.info('You did' + trade.type + " at " + trade.price)
        })

        log.info("Created a new StateMachine")
	} catch(err) {
		log.info("Cannot initiate trading bot! Error: " + err)
	}
}

function startTradingBot() {
    let opts = {
        'symbol': resolveCurrencyPair(currency),
        'profit': margin,
        'amount': capital,
        'fee': 0.0008,
        'interval': 3000,
		'rounder': resolveRounder(currency)
    }

    if (isInitialized) {
        tradingBot.setOpt(opts)
        tradingBot.run()
		uiStartState()
    }
}

function stopTradingBot() {
    tradingBot.stop()
	uiStopState()
}

function addOrderToOrdersTable(order) {
    let row = ordersTable.insertRow(-1)

    let orderIdCell = row.insertCell(0)
    let typeCell = row.insertCell(1)
    let dateCell = row.insertCell(2)
    let quantityCell = row.insertCell(3)
    let priceCell = row.insertCell(4)
    let statusCell = row.insertCell(5)

    orderIdCell.innerHTML = order.orderId
    dateCell.innerHTML = moment().format("YYYY-MM-DD HH:mm")
    priceCell.innerHTML = parseFloat(order.price).toLocaleString("en-US", {minimumFractionDigits: 2}) + " USD"
    quantityCell.innerHTML = parseFloat(order.amount).toFixed(5) + " " + tradingBot.symbol
    statusCell.innerHTML = order.status
	typeCell.innerHTML = order.type

    if (order.type == "buy") {
        typeCell.style.color = "#3F9CD8"
        row.style.backgroundColor = "#F3FBFF"
    } else if (order.type == "sell") {
        typeCell.style.color = "#ED587A"
        row.style.backgroundColor = "#FFF4F1"
    } else {
        // Nothing to do here
    }
}

function removeOrderFromOrdersTable(orderId) {
  let rows = ordersTable.rows
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].cells[0].innerHTML == orderId) {
      ordersTable.deleteRow(i)
      return
    }
  }
}

function resolveCurrencyPair(currency) {
	switch (currency) {
		case 'BTC':
			return CurrencyPair.BTC
		case 'BCH':
			return CurrencyPair.BCH
		case 'ETH':
			return CurrencyPair.ETH
		case 'ETC':
			return CurrencyPair.ETC
		case 'XRP':
			return CurrencyPair.XRP
	}
}

function resolveRounder(currency) {
	switch (currency) {
		case 'BTC':
			return parseInt(Rounder.BTC)
		case 'BCH':
			return parseInt(Rounder.BCH)
		case 'ETH':
			return parseInt(Rounder.ETH)
		case 'ETC':
			return parseInt(Rounder.ETC)
		case 'XRP':
			return parseInt(Rounder.XRP)
	}
}

// Get token from the main process
ipcRenderer.on('send-token', (event, clientToken) => {
    init(clientToken)
})
