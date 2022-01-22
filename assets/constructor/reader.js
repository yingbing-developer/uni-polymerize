//阅读书籍

export default class Reader {
	constructor({book, chapters, extra}) {
		this.id = book.id
		this.book = book
		this.chapters = chapters || []
		this.extra = extra || {}
		this.source = book.source
	}
}