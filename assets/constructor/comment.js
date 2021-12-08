export default class Comment {
	constructor({id, avatar, title, subtitle, content, subComment, extra}) {
	  this.id = id
	  this.avatar = avatar
	  this.title = title
	  this.subtitle = subtitle || ''
	  this.content = content || ''
	  this.subComment = subComment || []
	  this.extra = extra || {}//附加字段
	}
}