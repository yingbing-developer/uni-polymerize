//书籍章节

export default class Chapter {
	constructor({id, commentId, title, chapter, isStart, isEnd, content, payread, extra, source}) {
		this.id = id
		this.commentId = commentId || ''
		this.title = title || ''
		this.chapter = chapter
		this.isStart = isStart || false
		this.isEnd = isEnd || false
		this.content = content || null
		this.payread = payread || false//该章节是否需要支付观看
		this.extra = extra || {}
		this.source = source
	}
}