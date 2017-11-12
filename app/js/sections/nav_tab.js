window.$ = window.jQuery = require('./../../../node_modules/jquery/dist/jquery.min.js')

$(document).ready(function() {
  console.log("DOM ready")

  jQuery('.nav-tab').click(function(event) {
    handleTabTrigger(event.currentTarget)
  })

})

function handleTabTrigger(target) {
  hideAllTabContentsAndDeselectTabs()

  // Highlight clicked tab
  target.classList.add('is-selected')

  // Change tab icon
  let icon = target.querySelector('.tab-icon')
  icon.src = icon.src.replace(".png", "_active.png")

  // Display the current tab's content
  const tabContentId = target.dataset.content
  document.getElementById(tabContentId).classList.add('is-shown')
}

function hideAllTabContentsAndDeselectTabs () {
  const tabs = document.querySelectorAll(".nav-tab.is-selected")
  Array.prototype.forEach.call(tabs, function (tab) {
    tab.classList.remove('is-selected')

    let icon = tab.querySelector('.tab-icon')
    icon.src = icon.src.replace("_active", "")
  })

  const tabContents = document.querySelectorAll(".nav-tab-content.is-shown")
  Array.prototype.forEach.call(tabContents, function (content) {
    content.classList.remove('is-shown')
  })
}
