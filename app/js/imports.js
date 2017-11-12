const links = document.querySelectorAll('link[rel="import"]')

// Import wallet pages and add each page to the main content
Array.prototype.forEach.call(links, function (link) {
  	let template = link.import.querySelector('.task-template')

	 if (template != null && template != 'undefined') {
	  	let clone = document.importNode(template.content, true)
	  	document.querySelector('.content').appendChild(clone)
	 }
})

// Import tab contents and add them to the tab content containers
Array.prototype.forEach.call(links, function (link) {
	// get the templates with corresponding class
  	let template = link.import.querySelector('.sub-task-template')

	if (template != null && template != 'undefined') {
	  	// find all the parent elements to append section elements
	    let parents = document.querySelectorAll('.nav-content-container')

	    Array.prototype.forEach.call(parents, function (parent) {
	    	let clone = document.importNode(template.content, true)

	    	// find section element in clone element
	    	let section = clone.querySelector(".nav-tab-content")

  			// set the id of section element
		  	section.id = parent.id + "-" + section.id

		  	// append section element to the corresponding parent element
		  	parent.appendChild(clone)
		})
	}
})
