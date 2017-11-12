const notifier = require('node-notifier')
const res = require('../../res/strings.json')

module.exports = {
    showNotification: showNotification
}

function showNotification(msg) {
  notifier.notify({
     title: res.APP_NAME,
     message: msg,
     wait: false
  }, function (err, response) {})
}
