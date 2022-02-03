//阅读书籍

export default class Reader {
	constructor({book, chapters}) {
		this.id = book.id
		this.book = book
		this.chapters = chapters || []
		this.extra = book.extra || {}
		this.source = book.source
	}
}