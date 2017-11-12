window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')
const apiEndpoints = require('./endpoints.js')
const EventEmitter = require('events').EventEmitter

const SAFETY_TIME_MARGIN = 15000

class Token extends EventEmitter {
    constructor(apiCredentials = {}, token = {}) {
        super()
        this.username = apiCredentials.username
        this.password = apiCredentials.password
        this.apiKey = apiCredentials.key
        this.apiSecret = apiCredentials.secret
        this.tokenType = token.token_type
        this.accessToken = token.access_token
        this.expiry = token.expires_in
        this.refreshToken = token.refresh_token
        this.productionDate = Date.now()
        this.authorized = false
    }

    checkExpiry() {
        if (this.productionDate + this.expiry * 1000 - SAFETY_TIME_MARGIN < Date.now()) {
            this.renewToken()
        }
    }

    isAuthorized() {
        return this.authorized
    }

    setToken(token) {
        this.username = token.username
        this.password = token.password
        this.apiKey = token.apiKey
        this.apiSecret = token.apiSecret
        this.tokenType = token.tokenType
        this.accessToken = token.accessToken
        this.expiry = token.expiry
        this.refreshToken = token.refreshToken
        this.productionDate = token.productionDate
        this.authorized = token.authorized
    }

    requestToken() {
        this.__auth({
            'client_id': this.apiKey,
            'client_secret': this.apiSecret,
            'username': this.username,
            'password': this.password,
            'grant_type': 'password'
        }, (response) => {
            this.__resolveToken(response)
            this.authorized = true
            this.emit('token-set')
        }, (err) => {
            this.emit('auth-fail', 'Cannot authorize to your account. ' + err)
        })
    }

    renewToken() {
        this.__auth({
            'client_id': this.apiKey,
            'client_secret': this.apiSecret,
            'refresh_token': this.refreshToken,
            'grant_type': 'refresh_token'
        }, (response) => {
            this.__resolveToken(response)
            this.emit('token-set')
            console.log("Token has been refreshed. Token: " + JSON.stringify(response))
        }, (err) => {
            this.emit('auth-fail', 'Cannot refresh your token. ' + err)
        })
    }

    __auth(queryParam, succeded, failed) {
        if (!this.apiKey || !this.apiSecret ||
            !this.username || !this.password) {
            failed(new Error('Missing credentials!'))
            return
        }

        let payload = $.param(queryParam)

        $.ajax({
            url: `${apiEndpoints.API_ENDPOINT}/${apiEndpoints.API_VERSION}/${apiEndpoints.AUTH_ENDPOINT}`,
            type: 'POST',
            data: payload,
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

    __resolveToken(token) {
        this.tokenType = token.token_type,
        this.accessToken = token.access_token,
        this.expiry = token.expires_in,
        this.refreshToken = token.refresh_token
        this.productionDate = Date.now()
    }
}

module.exports = Token
