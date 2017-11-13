const EventEmitter = require('events').EventEmitter
const res = require('../../res/strings.json')
const {OrderType, OrderStatus} = require('../support/defines.js')
const helper = require('../support/helper.js')

// States for the state machine
const State = {
  WAIT: 'WAIT',
  LAST_PRICE: 'GET_LAST_PRICE',
  BUY: 'BUY',
  SELL: 'SELL',
  PUT_SELL_ORDER: 'PUT_SELL_ORDER',
  PUT_BUY_ORDER: 'PUT_BUY_ORDER',
  CHECK_ORDER_STATUS: 'CHECK_ORDER_STATUS',
  GET_TICKER: 'GET_TICKER',
  CANCELED: 'CANCELED'
}

const className = "StateMachine"

// TODO: Algorithm should be given as an interface

/**
 * Signals being emitted, parameter
 * 'start'
 * 'stop'
 * 'failure', reason
 * 'error', error
 * 'next-state', state
 * 'ticker', ticker
 * 'order-filled', {orderId, lastPrice, tradeType}
 * 'buy-success', orderId
 * 'sell-success', orderId
 * 'put-buy-order', order
 * 'put-sell-order', order
 */
class StateMachine extends EventEmitter {
    constructor(apiInterface) {
        super()

        if (apiInterface === 'undefined' || apiInterface == null) {
            throw new Error(className + ": Api interface cannot be empty!")
        }

        // Private variables
        this.symbol = ""
        this.profitMargin = 0
        this.safetyMargin = 0
        this.tradingFee = 0
        this.startPrice = 0
        this.capital = 0
		this.amount = 0
		this.rounder = 0
        this.interval = 3000

        this.state = State.GET_TICKER
        this.intervalId = 0
        this.lastTradePrice = 0
        this.lastTradeType = ""
        this.lastOrderId = 0
        this.error = ""

        // Api interface
    	this.apiInterface = apiInterface
        this.buy = apiInterface.buy
        this.sell = apiInterface.sell
        this.buyLimit = apiInterface.buyLimit
        this.sellLimit = apiInterface.sellLimit
        this.getOrderById = apiInterface.getOrderById
        this.ticker = apiInterface.ticker

		this.__init()
    }

    run() {
        this.__init()
        this.start(State.PUT_BUY_ORDER)
    }

    start(state = State.GET_TICKER) {
		this.state = state
        this.intervalId = setInterval(() => this.__stateExecutor(), this.interval)
        this.emit('start')
    }

    stop() {
        clearInterval(this.intervalId)
    	this.emit('stop')
    }

	setOpt(opt) {
		this.symbol = opt.symbol
        this.profitMargin = opt.profit
        this.safetyMargin = opt.safety
        this.tradingFee = opt.fee
        this.startPrice = opt.startPrice
        this.capital = opt.capital
		this.rounder = opt.rounder
        this.interval = opt.interval
	}

    //-------Private functions-------//
    __init() {
		// Do initializations here
        this.intervalId = 0
        this.lastTradePrice = 0
        this.lastTradeType = ""
        this.lastOrderId = 0
        this.error = ""
    }

    __stateExecutor() {
		this.emit('next-state', this.state)
    	switch(this.state) {
			case State.WAIT:
				break
			case State.BUY:
				this.__stateBuy()
				break
			case State.SELL:
				this.__stateSell()
				break
			case State.PUT_BUY_ORDER:
				this.__stateBuyOrder()
				break
			case State.PUT_SELL_ORDER:
				this.__stateSellOrder()
				break
			case State.CHECK_ORDER_STATUS:
				this.__stateOrderStatus()
				break
			case State.GET_TICKER:
				this.__stateTicker()
				break
			case State.CANCELED:
				this.stop()
				break
        }
    }

    // TODO: Not used, but decide whether it is neccessary or not.
    __setNextState(set) {
        if (typeof set !== 'function') {
            this.state = State.CANCELED
        }
        set()
    }

    //-------State functions START-------//
    __stateBuy() {
      this.state = State.WAIT

      this.apiInterface.buy(this.amount, this.symbol)
        .then((orderId) => {
            this.lastOrderId = orderId
            this.state = State.CHECK_ORDER_STATUS
			this.emit('buy-success', orderId)
        })
        .catch((err) => this.__stateMachineFailure(err))
    }

    __stateSell() {
        this.state = State.WAIT

        this.apiInterface.sell(this.capital, this.symbol)
          .then((orderId) => {
              this.lastOrderId = orderId
              this.state = State.CHECK_ORDER_STATUS
			  this.emit('sell-success', orderId)
          })
          .catch((err) => this.__stateMachineFailure(err))
    }

    __stateBuyOrder() {
        this.state = State.WAIT

        let price = this.__calculateNextPrice(OrderType.BUY)

        this.apiInterface.buyLimit(price, this.capital, this.symbol)
          .then((order) => {
              this.lastOrderId = order.orderId
              this.state = State.CHECK_ORDER_STATUS
			  this.emit('put-buy-order', order)
          })
          .catch((err) => this.__stateMachineFailure(err))
    }

    __stateSellOrder() {
        this.state = State.WAIT

        let price = this.__calculateNextPrice(OrderType.SELL)

        this.apiInterface.sellLimit(price, this.capital, this.symbol)
          .then((order) => {
              this.lastOrderId = order.orderId
              this.state = State.CHECK_ORDER_STATUS
			  this.emit('put-sell-order', order)
          })
          .catch((err) => this.__stateMachineFailure(err))
    }

    __stateTicker() {
        this.state = State.WAIT

        this.apiInterface.ticker(this.symbol)
          .then((ticker) => {
              this.state = State.GET_TICKER
			  this.emit('ticker', ticker)
          })
          .catch((err) => {
			  this.emit('error', this.state + ' -> Error: ' + err)
			  this.state = State.GET_TICKER
		  })
    }

	// TODO: Refactor this function. There are too many operations
    __stateOrderStatus() {
        this.state = State.WAIT

        this.apiInterface.getOrderById(this.lastOrderId, this.symbol)
            .then((order /*order = {status, price, type, amount}*/) => {
                if (order.status == OrderStatus.FILLED) {
					// TODO: Adjust the amount according to fee deduction
					//this.capital = order.amount
					this.lastTradeType = order.type
					this.lastTradePrice = order.price

					if (order.type == OrderType.SELL) {
						  // Next order is buy
						this.state = State.PUT_BUY_ORDER
					} else {
						  // Next order is sell
						this.state = State.PUT_SELL_ORDER
					}

					this.emit('order-filled',
                        {'orderId': this.lastOrderId, 'price': order.price, 'type': order.type})
                } else if (order.status == OrderStatus.PARTIALLY_FILLED || order.status == OrderStatus.OPEN) {
                    this.state = State.CHECK_ORDER_STATUS
					this.emit('order-open', order)
                } else {
                    // This shouldn't happen
                    this.state = State.CANCELED
                }
            }).catch((err) => {
                this.emit('error', this.state + ' -> Error: ' + err)
                this.state = State.CHECK_ORDER_STATUS
            })
        }
    //-------State functions END-------//

    __stateMachineFailure(err) {
        this.state = State.CANCELED
        this.emit('failure', err)
    }

    __calculateNextPrice(orderType) {
		let nextPrice
		switch(orderType) {
			case OrderType.BUY:
				// Calculate next buy limit
				nextPrice = this.lastTradePrice * (1 - this.profitMargin - this.tradingFee * 2)
				break
			case OrderType.SELL:
				// Calculate next sell limit
		        nextPrice = this.lastTradePrice * (1 + this.profitMargin + this.tradingFee * 2)
				break
		}

        if (nextPrice == 0) nextPrice = this.startPrice

		return helper.rounder(nextPrice, this.rounder).toFixed(0)
    }
}

module.exports = StateMachine
