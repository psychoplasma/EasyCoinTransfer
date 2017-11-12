window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')
const EventEmitter = require('events').EventEmitter
const apiEndpoints = require('./endpoints.js')
const Token = require('./token.js')
const {OrderType, OrderStatus} = require('../support/defines.js')
const logger = require('simple-node-logger')

const opts = {
		logFilePath:'easycointransfer_apiClient.log',
		timestampFormat:'YYYY-MM-DD HH:mm:ss'
}
var	log = logger.createSimpleLogger(opts)
log.setLevel("info")

const className = "ApiClient"

const ApiRequestStatus = {
    SUCCESS: 'success',
    FAILED: 'failed',
    NOT_FOUND: 'not_found'
}

const ApiOrderType = {
    SELL: 'ask',
    BUY: 'bid'
}

const ApiOrderStatus = {
    FILLED: 'filled',
    UNFILLED: 'unfilled',
    PARTIALLY_FILLED: 'partially_filled'
}

class ApiClient extends EventEmitter {
    constructor(token, opts = {}) {
        super()
        this.apiEndpoint = apiEndpoints.API_ENDPOINT
        this.version = apiEndpoints.API_VERSION
        this.token = token
        this.nonce = Date.now()
        this.apiCallCounter = 0
        this.generateNonce = (typeof opts.nonceGenerator === 'function')
        ? opts.nonceGenerator : function () { return ++this.nonce }
    }

    // Public functions
    ticker(symbol = 'btc_krw') {
        return new Promise((resolve, reject) => {
            this.__makePublicRequest(`${apiEndpoints.TICKER_ENDPOINT}?currency_pair=${symbol}`)
            .then((data) => {
                data = JSON.parse(data)
                if (data.timestamp === 'undefined' || data.last === 'undefined') {
                    reject(new Error(className + '.ticker() -> Corrupted server response!'))
                }
                resolve({'timeStamp': data.timestamp, 'lastPrice': data.last})
            }).catch((err) => {
                reject(className + '.ticker() -> ' + err)
            })
        })
    }

    buy(amount, symbol) {
        return new Promise((resolve, reject) => {
            this.__makeAuthRequest(apiEndpoints.BUY_ORDER_ENDPOINT,
                {'currency_pair': symbol,
                 'type':'market',
                 'fiat_amount': amount})
            .then((data) => {
                data = JSON.parse(data)
                if (data.orderId === 'undefined' || data.status === 'undefined') {
                    reject(new Error(className + '.buy() -> Corrupted server response!'))
                }
                if (data.status != ApiRequestStatus.SUCCESS ) {
                    reject(new Error(className + '.buy() -> ' + JSON.stringify(data)))
                }
                resolve(data.orderId)
            }).catch((err) => {
                reject(className + '.buy() -> ' + err)
            })
        })
    }

    sell(quantity, symbol) {
        return new Promise((resolve, reject) => {
            this.__makeAuthRequest(apiEndpoints.SELL_ORDER_ENDPOINT,
                {'currency_pair': symbol,
                 'type':'market',
                 'coin_amount': quantity})
            .then((data) => {
                data = JSON.parse(data)
                if (data.orderId === 'undefined' || data.status === 'undefined') {
                    reject(new Error(className + '.sell() -> Corrupted server response!'))
                }
                if (data.status != ApiRequestStatus.SUCCESS ) {
                    reject(new Error(className + '.sell() -> ' + JSON.stringify(data)))
                }
                resolve(data.orderId)
            }).catch((err) => {
                reject(className + '.sell() -> ' + err)
            })
        })
    }

    buyLimit(price, quantity, symbol) {
        return new Promise((resolve, reject) => {
            this.__makeAuthRequest(apiEndpoints.BUY_ORDER_ENDPOINT,
                {'currency_pair': symbol,
                 'type':'limit',
                 'price': price,
                 'coin_amount': quantity})
            .then((data) => {
                data = JSON.parse(data)
                if (data.orderId === 'undefined' || data.status === 'undefined') {
                    reject(new Error(className + '.buyLimit() -> Corrupted server response!'))
                }
                if (data.status != ApiRequestStatus.SUCCESS ) {
                    reject(new Error(className + '.buyLimit() -> ' + JSON.stringify(data)))
                }
                resolve(data)
            }).catch((err) => {
                reject(className + '.buyLimit() -> ' + err)
            })
        })
    }

    sellLimit(price, quantity, symbol) {
        return new Promise((resolve, reject) => {
            this.__makeAuthRequest(apiEndpoints.SELL_ORDER_ENDPOINT,
                {'currency_pair': symbol,
                 'type':'limit',
                 'price': price,
                 'coin_amount': quantity})
            .then((data) => {
                data = JSON.parse(data)
                if (data.orderId === 'undefined' || data.status === 'undefined') {
                    reject(new Error(className + '.sellLimit() -> Corrupted server response!'))
                }
                if (data.status != ApiRequestStatus.SUCCESS ) {
                    reject(new Error(className + '.sellLimit() -> ' + JSON.stringify(data)))
                }
                resolve(data)
            }).catch((err) => {
                reject(className + '.sellLimit() -> ' + err)
            })
        })
    }

    cancelLimit(orderId, symbol) {
        return new Promise((resolve, reject) => {
            this.__makeAuthRequest(apiEndpoints.CANCEL_LIMIT_ENDPOINT,
                {'currency_pair': symbol, 'id': orderId})
            .then((data) => {
                data = JSON.parse(data)
                if (data.orderId === 'undefined' || data.status === 'undefined') {
                    reject(new Error(className + '.cancelLimit() -> Corrupted server response!'))
                }
                if (data.status != ApiRequestStatus.SUCCESS ) {
                    reject(new Error(className + '.cancelLimit() -> ' + JSON.stringify(data)))
                }
                resolve(true)
            }).catch((err) => {
                reject(className + '.cancelLimit() -> ' + err)
            })
        })
    }

    getOrderById(orderId, symbol) {
        return new Promise((resolve, reject) => {
            this.__makeGetAuthRequest(apiEndpoints.ORDERS_ENDPOINT,
                {'currency_pair': symbol, 'id': orderId})
            .then((data) => {
                // Api returns an arraw of requests by default even if there is only one item
                data = data[0]
                if (data.status === 'undefined' ||
                    data.avg_price === 'undefined' ||
                    data.side === 'undefined') {
                    reject(new Error(className + '.getOrderById() -> Corrupted server response!'))
                }

                let status_ = this.__resolveOrderStatus(data.status)
                let price_ = data.price ? data.price : data.avg_price
                let type_ = this.__resolveOrderType(data.side)
                let amount_ = data.order_amount ? data.order_amount : data.filled_amount
                let ret = {
					'orderId': orderId,
                    'status': status_,
                    'price': price_,
                    'type': type_,
                    'amount': amount_}

                resolve(ret)
            }).catch((err) => {
                reject(className + '.getOrderById() -> ' + err)
            })
        })
    }

    // Private functions
    __createPayload(queryParams) {
        return $.param(queryParams) + "&nonce=" + this.generateNonce()
    }

    __resolveOrderType(orderType) {
        switch(orderType) {
            case ApiOrderType.BUY:
                return OrderType.BUY
            case ApiOrderType.SELL:
                return OrderType.SELL
        }
    }

    __resolveOrderStatus(orderStatus) {
        switch(orderStatus) {
            case ApiOrderStatus.FILLED:
                return OrderStatus.FILLED
            case ApiOrderStatus.UNFILLED:
                return OrderStatus.OPEN
            case ApiOrderStatus.PARTIALLY_FILLED:
                return OrderStatus.PARTIALLY_FILLED
        }
    }

    __makeAuthRequest(endpoint, params) {
        if (!this.token) {
            throw new Error('Token is missing!')
        }

        this.token.checkExpiry()

        if (arguments.length !== 2) {
            throw new Error(
                'Argument length invalid: Request must have an endpoint and parameters!')
        }

        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.apiEndpoint}/${this.version}/${endpoint}`,
                type: 'POST',
                headers: {
                    "Authorization": `${this.token.tokenType} ${this.token.accessToken}`
                },
                data: this.__createPayload(params),
                success: function (data, textStatus, jqXHR) {
                    log.info(JSON.stringify(data))
                    resolve(data)
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    reject(jqXHR.responseText)
                },
                beforeSend: function (jqXHR, settings) {
                    log.info("AJAX object: " + JSON.stringify(this))
                }
            })
        })
    }

    __makeGetAuthRequest(endpoint, params) {
        if (!this.token) {
            throw new Error('Token is missing!')
        }

        this.token.checkExpiry()

        if (arguments.length !== 2) {
            throw new Error(
                'Argument length invalid: Request must have an endpoint and parameters!')
        }

        let queryParams = $.param(params)

        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.apiEndpoint}/${this.version}/${endpoint}?${queryParams}`,
                type: 'GET',
                headers: {
                    "Authorization": `${this.token.tokenType} ${this.token.accessToken}`
                },
                success: function (data, textStatus, jqXHR) {
                    log.info(JSON.stringify(data))
                    resolve(data)
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    reject(jqXHR.responseText)
                },
                beforeSend: function (jqXHR, settings) {
                    //console.log("AJAX object: " + JSON.stringify(this))
                }
            })
        })
    }

    __makePublicRequest(endpoint) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.apiEndpoint}/${this.version}/${endpoint}`,
                type: 'GET',
                success: function (data, textStatus, jqXHR) {
                    resolve(data)
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    reject(jqXHR.responseText)
                },
                beforeSend: function (jqXHR, settings) {
                    //console.log("AJAX object: " + JSON.stringify(this))
                }
            })
        })
    }
}

module.exports = ApiClient
