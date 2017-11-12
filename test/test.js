const {Rounder, CurrencyPair} = require('../app/js/korbit_api/defines.js')

function resolveRounder(currency) {
	switch (currency) {
		case CurrencyPair.BTC:
			return parseInt(Rounder.BTC)
		case CurrencyPair.BCH:
			return parseInt(Rounder.BCH)
		case CurrencyPair.ETH:
			return parseInt(Rounder.ETH)
		case CurrencyPair.ETC:
			return parseInt(Rounder.ETC)
		case CurrencyPair.XRP:
			return Rounder.XRP
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

function test() {
    let x = resolveCurrencyPair('XRP')
    let num = resolveRounder('xrp_krw')
    console.log('Resolved currency: ' + x + ' Rounder: ' + num)
}
