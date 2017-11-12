const preferences = require("electron-json-storage")

module.exports = {
  setApiCredentials: setApiCredentials,
  getApiCredentials: getApiCredentials,
  setAutoApiCredentials: setAutoApiCredentials,
  getAutoApiCredentials: getAutoApiCredentials,
  saveKorbitCredentials: saveKorbitCredentials,
  retrieveKorbitCredentials: retrieveKorbitCredentials,
  saveAutoLogin: saveAutoLogin,
  retrieveAutoLogin: retrieveAutoLogin,
}

function setApiCredentials(key, secret, failure) {
  preferences.has('ApiCredentials', function(error, hasKey) {
    if (error) {
      failure("Error has occurred while saving ApiCredentials!")
      return
    }

    if (hasKey) {
      preferences.remove('ApiCredentials', function(error) {
        if (error) {
          failure("Error has occurred while saving ApiCredentials!")
          return
        }
        console.log("ApiCredentials has been removed successfully.")
      })
    }

    preferences.set('ApiCredentials', {apiKey: key, secretKey: secret},
      function(error) {
        if (error) {
          failure("Error has occurred while saving ApiCredentials!")
          return
        }
        console.log("ApiCredentials has been saved successfully.")
    })
  })
}

function getApiCredentials(success, failure) {
  preferences.get('ApiCredentials', function(error, data) {
    if (error) {
      failure("Error has occurred while getting ApiCredentials")
    } else {
      success(data)
    }
  })
}

function setAutoApiCredentials(auto, failure) {
  preferences.has('AutoApiCredentials', function(error, hasKey) {
    if (error) {
      failure("Error has occurred while saving AutoApiCredentials!")
      return
    }

    if (hasKey) {
      preferences.remove('AutoApiCredentials', function(error) {
        if (error) {
          failure("Error has occurred while saving AutoApiCredentials!")
          return
        }
        console.log("AutoApiCredentials has been removed successfully.")
      })
    }

    preferences.set('AutoApiCredentials', {autoVal: auto},
      function(error) {
        if (error) {
          failure("Error has occurred while saving AutoApiCredentials!")
          return
        }
        console.log("AutoApiCredentials has been saved successfully.")
    })
  })
}

function getAutoApiCredentials(success, failure) {
  preferences.get('AutoApiCredentials', function(error, data) {
    if (error) {
      failure("Error has occurred while getting AutoApiCredentials")
    } else {
      success(data)
    }
  })
}

// TODO: Create only one set of save, remove and retrieve functions
// provide input as a key-value pair
function saveKorbitCredentials(credentials) {
    return new Promise((resolve, reject) => {
        removeKorbitCredentials().then(() => {
            preferences.set('korbit_credentials',
                {
                    'key': credentials.key,
                    'secret': credentials.secret,
                    'username': credentials.username,
                    'password': credentials.password
                },
                (err) => {
                    if (err) reject(err)
                    console.log("ApiCredentials has been saved successfully.")
                    resolve()
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

function retrieveKorbitCredentials() {
    return new Promise((resolve, reject) => {
        preferences.get('korbit_credentials', (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
}

function removeKorbitCredentials() {
    return new Promise((resolve, reject) => {
        preferences.has('korbit_credentials', (err, hasKey) => {
            if (err) reject(err)

            if (hasKey) {
                preferences.remove('korbit_credentials', (error) => {
                    if (error) reject(error)

                    console.log("Credentials has been removed successfully.")
                    resolve()
                })
            } else  {
                resolve()
            }
        })
    })
}

function saveAutoLogin(autoLogin) {
    return new Promise((resolve, reject) => {
        removeAutoLogin().then(() => {
            preferences.set('auto_login', {'autoLogin': autoLogin},
                (err) => {
                    if (err) reject(err)
                    console.log("ApiCredentials has been saved successfully.")
                    resolve()
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

function retrieveAutoLogin() {
    return new Promise((resolve, reject) => {
        preferences.get('auto_login', (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
}

function removeAutoLogin() {
    return new Promise((resolve, reject) => {
        preferences.has('auto_login', (err, hasKey) => {
            if (err) reject(err)

            if (hasKey) {
                preferences.remove('auto_login', (error) => {
                    if (error) reject(error)

                    console.log("Auto login has been removed successfully.")
                    resolve()
                })
            } else  {
                resolve()
            }
        })
    })
}
