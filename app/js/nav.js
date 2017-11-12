window.$ = window.jQuery = require('./../../node_modules/jquery/dist/jquery.min.js')

$(document).ready(function() {
  showDefaultMainContent()

  jQuery('.nav-item').click(function(event) {
    handleSectionTrigger(event.currentTarget)
  })
})

function handleSectionTrigger(target) {
//    hideAllSectionsAndDeselectButtons()

    // Highlight clicked button and show view
    if (!target.classList.contains('is-selected')) {
        target.classList.add('is-selected')
    }

    // Display the current section
    const sectionId = target.dataset.section + '-section'
    if (!document.getElementById(sectionId).classList.contains('is-shown')) {
        document.getElementById(sectionId).classList.add('is-shown')
    }
}

function showDefaultMainContent () {
    document.querySelector('.content').classList.add('is-shown')

    // Select default left nav item
    let defaultBar = document.querySelector('.u-category-korbit')
    defaultBar.classList.add('is-selected')

    // Display the default section
    let sectionId = 'korbit-wallet-section'
    document.getElementById(sectionId).classList.add('is-shown')
}

function handleModalTrigger (event) {
  hideAllModals()
  const modalId = event.target.dataset.modal + '-modal'
  document.getElementById(modalId).classList.add('is-shown')
}

function hideAllModals () {
  const modals = document.querySelectorAll('.modal.is-shown')
  Array.prototype.forEach.call(modals, function (modal) {
    modal.classList.remove('is-shown')
  })
  showMainContent()
}

function hideAllSectionsAndDeselectButtons () {
  const sections = document.querySelectorAll('.js-section.is-shown')
  Array.prototype.forEach.call(sections, function (section) {
    section.classList.remove('is-shown')
  })

  const buttons = document.querySelectorAll('.nav-item.is-selected')
  Array.prototype.forEach.call(buttons, function (button) {
    button.classList.remove('is-selected')
  })
}
