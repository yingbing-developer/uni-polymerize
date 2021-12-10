export default class Cache {
	constructor({id, title, src, type, source}) {
	  this.id = id + '_cache'
	  this.parentId = id//父id
	  this.title = title || ''//文件名称
	  this.src = src//文件路径
	  this.type = type || ''//文件类型
	  this.source = source || ''//来源
	}
}