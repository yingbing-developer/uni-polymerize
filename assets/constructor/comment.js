//评论

export default class Comment {
	constructor({id, avatar, title, subtitle, content, subComment, masterComment, extra}) {
	  this.id = id
	  this.avatar = avatar || ''
	  this.title = title
	  this.subtitle = subtitle || ''
	  this.content = content || ''
	  this.subComment = subComment || []
	  this.masterComment = masterComment || []
	  this.type = 'comment'//类型
	  this.extra = extra || {}//附加字段
	}
}