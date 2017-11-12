const electron = require('electron')
const {dialog} = electron.remote
const {app} = electron
const res = require('../../res/strings.json')

module.exports = {
    showQuestionDialog: showQuestionDialog,
    showErrorDialog: showErrorDialog
}

function showQuestionDialog(question, confirm, decline) {
    dialog.showMessageBox({
            type: 'question',
            buttons: [res.BTN_NO, res.BTN_YES],
            title: res.APP_NAME,
            message: question
        }, function (buttonId, checkBox) {
            if (buttonId > 0) {
                if (confirm != null)
                    confirm()
            } else {
                if (decline != null)
                    decline()
            }
    })
}

function showErrorDialog(msg, handler) {
    dialog.showMessageBox({
            type: 'error',
            buttons: ['Ok'],
            title: 'EasyCoinTransfer',
            message: 'Error has occurred. The application will be closed. Error: ' + msg
        }, function () {
            handler()
            app.quit()
    })
}
