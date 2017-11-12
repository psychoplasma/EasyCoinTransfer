window.$ = window.jQuery = require('./../../node_modules/jquery/dist/jquery.min.js')


$(document).ready(function() {
  console.log("DOM ready")

})

function failure(err) {
  console.log("Server request has been failed. Error: " + err)
}
