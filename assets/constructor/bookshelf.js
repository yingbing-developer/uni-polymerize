//书单

export default class Bookshelf {
	constructor({shelfId, commentId, title, cover, desc, book, creator, readnum, style, tag, isAdult, extra, type, source}) {
		this.id = shelfId + '_' + source
		this.shelfId = shelfId //书单ID
		this.commentId = commentId || '' //评论ID
		this.title = title //名称
		this.cover = cover || ('/static/book/rank_' + Math.floor(Math.random()*6 + 1) + '.jpg') //封面
		this.desc = desc || '' //介绍
		this.book = book || [] //书籍集合
		this.creator = creator || '不详' //创建者
		this.readnum = readnum || 0 //阅读次数
		this.style = style || ''//风格
		this.tag = tag || []//标签
		this.isAdult = isAdult || false//是否青壮年内容
		this.extra = extra || {} //附加字段
		this.type = type || 'story' //type包含 story:<小说> comic: <漫画> book: <书籍>
		this.source = source //来源
	}
}