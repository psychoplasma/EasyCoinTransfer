window.$ = window.jQuery = require('./../../node_modules/jquery/dist/jquery.min.js')
const {ipcRenderer}  = require('electron')
const Token = require('../js/korbit_api/token.js')
const preferences = require('../js/support/preferences.js')

var korbitToken
var korbitCredentials
var korbitAutoLogin

$(document).ready(function() {
    checkAutoLogin()

    $('#login').click(() => {
        korbitCredentials = getFormData()

        initToken(korbitCredentials)
        login()
    })
})

function initToken(credentials) {
    korbitToken = new Token(credentials)

    korbitToken.on('token-set', () => {
        console.log("Token has been set!" +
                    " Token type: " + korbitToken.tokenType +
                    " Token: " +  korbitToken.accessToken +
                    " Token expires in: " + korbitToken.expiry +
                    " Referesh Token: " + korbitToken.refreshToken)

        savePreferences(korbitAutoLogin, korbitCredentials)

        // Send token to main process
        ipcRenderer.send('logged-in', korbitToken)
    })

    korbitToken.on('auth-fail', (err) => {
        console.log(err)
        // TODO: show a dialog or a message box
    })
}

function login() {
    if (!korbitToken.isAuthorized()) {
        korbitToken.requestToken()
    }
}

function checkAutoLogin() {
    preferences.retrieveAutoLogin().then((data) => {
        getCredentails()
    }).catch((err) => {
        console.log('retrieveAutoLogin() -> ' + err)
        return false
    })
}

function getCredentails() {
    preferences.retrieveKorbitCredentials().then((credentials) => {
        korbitCredentials = credentials
        setFormData(korbitCredentials)
    }).catch((err) => {
        console.log('getCredentails() -> Error: ' + err)
        korbitCredentials = null
    })
}

function savePreferences(autoLogin, credentials) {
    if (!autoLogin) return
    preferences.saveAutoLogin(autoLogin).then(()=>{}).catch((err) => {
        console.log('saveAutoLogin() -> ' + err)
    })
    preferences.saveKorbitCredentials(credentials).then(()=>{}).catch((err) => {
        console.log('saveKorbitCredentials() -> ' + err)
    })
}

function setFormData(data) {
    $('#username').val(data.username)
    $('#password').val(data.password)
    $('#key').val(data.key)
    $('#secret').val(data.secret)
    $('#auto-login').prop("checked", true)
}

function getFormData() {
    let data = {}
    data.username = $('#username').val()
    data.password = $('#password').val()
    data.key = $('#key').val()
    data.secret = $('#secret').val()

    korbitAutoLogin = $('#auto-login').is(':checked')

    return data
}
