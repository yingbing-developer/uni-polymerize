//來源

export default class Source {
	constructor({id, title, href, isAdult, isOpen, request, type}) {
	  this.id = id
	  this.title = title
	  this.href = href
	  this.isAdult = isAdult || false
	  this.isOpen = isOpen || true
	  this.request = request
	  this.type = type
	}
}