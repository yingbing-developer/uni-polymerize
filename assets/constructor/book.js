//书籍
import Utils from '@/assets/js/util.js'

const { dateFormat } = Utils;

export default class Book {
	constructor({title, bookId, commentId, src, cover, author, desc, payread, readnum, isEnd, lastChapter, size, style, tag, isAdult, record, mark, extra, type, createTime, updateTime, source }) {
		this.id = (bookId || '') + '_' + source
	  	this.title = title || ''//名称
	  	this.bookId = bookId || ''//书籍ID
	  	this.commentId = commentId || ''//评论ID
	  	this.src = src || ''//本地路径
	  	this.cover = cover || '/static/cover/cover_default.jpg'//封面
	  	this.author = author || '不详'//作者
	  	this.desc = desc || ''//介绍
	  	this.payread = payread || false//是否需要支付观看
	  	this.readnum = readnum || 0//阅读次数
		this.isEnd = isEnd || false//是否完结
		this.lastChapter = lastChapter || ''//最新章节
		this.size = size || ''//小说大小
		this.style = style || ''//风格
		this.tag = tag || []//标签
		this.isAdult = isAdult || false//是否青壮年内容
		this.record = record || {}//阅读记录
		this.mark = mark || []//书签
	  	this.extra = extra || {}//附加字段
	  	this.type = type || 'story'//书籍类型 <story | 小说> <comic | 漫画>
		this.createTime = createTime || dateFormat(new Date().getTime())
		this.updateTime = updateTime || ''
	  	this.source = source//来源
	}
}