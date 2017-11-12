// Handle setup events as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
	 // Squirrel event handled and app will exit in 1000ms, so don't do anything else
	 return;
}

const electron = require('electron')
const path = require('path')
const {dialog} = electron
const res = require('./app/res/strings.json')
const {app, BrowserWindow} = electron
const {Menu} = electron
const ipcMain = electron.ipcMain

var mainWindow = null
var quitApp = false
var apiCredentials
var clientToken

const menuTemplate = [
	{
		label: 'File',
		submenu: [
			{role: 'quit'}
		]
	},
  {
    label: 'View',
    submenu: [
      {
				label: 'Toggle Developer Tools',
				role: 'toggledevtools',
				accelerator: 'Ctrl+Shift+I',
				click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.toggleDevTools()
				}
			}
    ]
  },
  {
		label: 'Help',
    submenu: [
      {
				role: 'about',
        label: 'About',
        click () { require('electron').shell.openExternal('http://kairosbit.co.kr/') }
      }
    ]
  }
]

app.on('ready', () => {

	// Create a main window
	mainWindow = new BrowserWindow({
			width:1100,
			height:800,
			icon: path.join(__dirname, 'assets/icons/icon.png')
	})

	// Create custom menu
	const menu = Menu.buildFromTemplate(menuTemplate)
	Menu.setApplicationMenu(menu)

	mainWindow.on('close', (e) => {
		if (!quitApp) {
			e.preventDefault()
			dialog.showMessageBox({
					type: 'question',
					buttons: [res.BTN_NO, res.BTN_YES],
					title: res.APP_NAME,
					message: res.QS_QUIT_APP
				}, function (buttonId, checkBox) {
					// If yes, quit the app
					if (buttonId > 0) {
						quitApp = true
						app.quit()
					}
			})
		}
  	})

	mainWindow.loadURL('file://' + __dirname + '/app/html/login.html')
	//mainWindow.loadURL('file://' + __dirname + '/app/html/mainPage.html')
})

ipcMain.on('credentials-done', (event, arg) => {
	apiCredentials = arg
	mainWindow.loadURL('file://' + __dirname + '/app/html/mainPage.html')
})

ipcMain.on('get-credentials', (event, arg) => {
  event.sender.send('send-credentials', apiCredentials)
})

ipcMain.on('logged-in', (event, token) => {
	clientToken = token
	mainWindow.loadURL('file://' + __dirname + '/app/html/mainPage.html')
})

ipcMain.on('main-page-ready', (event, arg) => {
	event.sender.send('send-token', clientToken)
})
