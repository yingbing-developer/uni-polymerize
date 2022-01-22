//字典

export default class Dict {
	constructor({title, type, isAdult}) {
	  this.id = title + '_' + type
	  this.title = title
	  this.type = type || 'story'
	  this.isAdult = isAdult || false
	}
}