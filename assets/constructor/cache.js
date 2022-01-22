//文件缓存

export default class Cache {
	constructor({id, title, cover, src, bytes, type, extra, source}) {
	  this.id = id + '_cache'
	  this.parentId = id//父id
	  this.title = title || ''//文件名称
	  this.cover = cover || ''//封面
	  this.src = src//文件路径
	  this.bytes = bytes//文件总量
	  this.type = type || ''//文件类型
	  this.extra = extra || {}//附加字段
	  this.source = source || ''//来源
	}
}