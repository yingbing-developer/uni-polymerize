import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import Book from '@/assets/constructor/book.js'
import Bookshelf from '@/assets/constructor/bookshelf.js'
import Chapter from '@/assets/constructor/chapter.js'
import Comment from '@/assets/constructor/comment.js'
import { getHref, replaceHTML, htmlDecodeByRegExp, getTag } from '@/assets/api/global.js'

const { BOOKURL, ERR_OK, ERR_FALSE } = Config
const { dateFormat } = Utils;

const source = 'linovel'

export default {
/**
* @event {Function()} search 
* @author yingbing
* @description 搜索
* @param {String} keyword = [搜索关键词] 
* @param {Number} page = [搜索页数] 
* @return {Object}
**/
	search (data) {
		return new Promise((resolve, reject) => {
			const href = getHref(source)
			http.get(href + '/search/', {
				params: {
					kw: data.keyword,
					page: data.page[source],
					sort: 'hot',
					target: 'complex'
				},
				headers: {
					Referer: href,
					Host: href.replace('https://', ''),
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let as = str.match(/<a[^>]*class=([""]?)search-book\1[^>]*>*([\s\S]*?)<\/a>/ig)
				let list = [];
				if ( as ) {
					as.forEach(a => {
						const bookId = a.match(/href=\"*(\S*)\"/)[1]
						const cover = a.match(/src=\"*(\S*)\"/)[1]
						const title = a.match(/<div[^>]*class=([""]?)book-name\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '')
						const author = a.match(/<div[^>]*class=([""]?)book-extra\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '').split('丨')[0]
						const updateTime = a.match(/<div[^>]*class=([""]?)book-extra\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '').split('丨')[1]
						const desc = a.match(/<div[^>]*class=([""]?)book-intro\1[^>]*>*([\s\S]*?)<\/div>/)[2]
						const tags = a.match(/<div[^>]*class=([""]?)book-tag\1[^>]*>*([\s\S]*?)<\/div>/ig)
						let style = ''
						let tag = []
						if ( tags ) {
							tags.forEach((t, key) => {
								let tagStr = t.match(/<div[^>]*class=([""]?)book-tag\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '')
								if ( tagStr.indexOf('#') > -1 ) {
									tag.push(tagStr.replace('#', ''))
								} else {
									style += tagStr + (key < tags.length - 1 ? ' ' : '')
								}
							})
						}
						list.push(new Book({
							bookId: bookId,
							commentId: bookId.match(/book\/*(\S*).html/)[1],
							cover: cover,
							title: htmlDecodeByRegExp(title),
							style: style,
							tag: tag,
							author: author,
							desc: desc ? htmlDecodeByRegExp(desc) : '',
							updateTime: updateTime,
							isEnd: true,
							source: source
						}))
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: list.length < 15,
						currentPage: data.page[source],
						source: source
					}
				})
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						isLastPage: false,
						currentPage: data.page[source] - 1,
						source: source
					}
				})
			})
		})
	},
/**
* @event {Function()} getRecome 
* @author yingbing
* @description 获取热门推荐
* @return {Object}
**/
	getRecome () {
		return new Promise((resolve, reject) => {
			const href = getHref(source)
			http.get(href, {
				headers: {
					Referer: href,
					Host: href.replace('https://', ''),
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let swiper = str.match(/<a[^>]*class=([""]?)item \1[^>]*>*([\s\S]*?)<\/a>/ig)
				let banners = []
				swiper.forEach(book => {
					let bookId = book.match(/href=\"*([\s\S]*?)\"/)[1].replace(href, '')
					const cover = book.match(/data-original=\"*([\s\S]*?)\"/)[1]
					if ( bookId.indexOf('book') > -1 ) {
						if ( bookId.indexOf('#') > -1 ) {
							bookId = bookId.split('#')[0]
						}
						banners.push(new Book({
							bookId: bookId,
							commentId: bookId.match(/book\/*(\S*).html/)[1],
							title: '',
							cover: cover,
							style: '轻小说',
							source: source
						}))
					}
				})
				let hot = str.match(/<div[^>]*class=([""]?)work-list clearfix\1[^>]*>*([\s\S]*?)<\/ul>/ig)[0]
				let hots = hot.match(/<a[^>]*class=([""]?)book-item-inner\1[^>]*>*([\s\S]*?)<\/a>/ig)
				let hotBooks = []
				hots.forEach(book => {
					const bookId = book.match(/href=\"*([\s\S]*?)\"/)[1]
					const cover = book.match(/data-original=\"*([\s\S]*?)\"/)[1]
					const title = book.match(/<div[^>]*class=([""]?)book-item-name\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '')
					const author = book.match(/<div[^>]*class=([""]?)mask-author\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '').replace('/著', '')
					const size = book.match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('字数 : ', '')
					hotBooks.push(new Book({
						bookId: bookId,
						commentId: bookId.match(/book\/*(\S*).html/)[1],
						title: htmlDecodeByRegExp(title),
						author: author,
						cover: cover,
						style: '轻小说',
						size: size,
						source: source
					}))
				})
				
				let ups = str.match(/<a[^>]*class=([""]?)book-card\1[^>]*>*([\s\S]*?)<\/a>/ig)
				let updates = []
				ups.forEach(book => {
					const bookId = book.match(/href=\"*([\s\S]*?)\"/)[1]
					const title = book.match(/<div[^>]*class=([""]?)book-name\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '')
					const author = book.match(/<span[^>]*class=([""]?)book-author\1[^>]*>*([\s\S]*?)<\/span>/)[2].replace(/\s/g, '')
					const types = book.match(/<div[^>]*class=([""]?)type\1[^>]*>*([\s\S]*?)<\/div>/ig)
					let style = ''
					types.forEach((type, key) => {
						style += type.match(/<div[^>]*class=([""]?)type\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '') + (key < 2 ? ' ' : '')
					})
					updates.push(new Book({
						bookId: bookId,
						commentId: bookId.match(/book\/*(\S*).html/)[1],
						title: htmlDecodeByRegExp(title),
						author: htmlDecodeByRegExp(author),
						style: style,
						source: source
					}))
				})
				
				let tops = str.match(/<div[^>]*class=([""]?)ranking-list\1[^>]*>*([\s\S]*?)<\/ul>/ig)
				let hotTops = []
				tops.forEach((top, key) => {
					hotTops.push(new Bookshelf({
						title: key == 0 ? '重推榜' : key == 1 ? '佳作榜' : key == 2 ? '轻币榜' : '墨水榜',
						shelfId: 'rank_' +( key + 1),
						cover: '/static/book/rank_' + Math.floor(Math.random()*6 + 1) + '.jpg',
						style: 'top',
						type: 'story',
						source: source
					}))
					const books = top.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig)
					books.forEach(book => {
						const bookId = book.match(/href=\"*([\s\S]*?)\"/)[1]
						const cover = book.match(/data-original=\"*([\s\S]*?)\"/)
						const title = book.match(/<div[^>]*class=([""]?)rank-book\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\s/g, '')
						hotTops[key].book.push(new Book({
							bookId: bookId,
							commentId: bookId.match(/book\/*(\S*).html/)[1],
							cover: cover ? cover[1] : '',
							title: htmlDecodeByRegExp(title),
							style: '轻小说',
							source: source
						}))
					})
				})
				resolve({
					code: ERR_OK,
					data: {
						banners: banners,
						hotBooks: hotBooks,
						populars: [],
						hotTops: hotTops,
						updates: updates,
						source: source
					}
				})
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						banners: [],
						hotBooks: [],
						populars: [],
						hotTops: [],
						updates: [],
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getTypeList 
* @author yingbing
* @description 获取分类列表
* @return {Object}
**/
	getTypeList () {
		return new Promise(resolve => {
			const href = getHref(source)
			http.get(href + '/cat/-1.html', {
				headers: {
					Referer: href,
					Host: href.replace('https://', '')
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let lis = str.match(/<li[^>]*class=([""]?)special\1[^>]*>*([\s\S]*?)<\/li>/ig);
				let typeList = []
				lis.forEach(li => {
					typeList.push({
						label: li.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
						value: li.match(/href=\"*([\s\S]*?)\"/)[1],
						source: source
					})
				})
				resolve({
					code: ERR_OK,
					data: {
						list: typeList,
						source: source
					}
				})
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getTypeDetail 
* @author yingbing
* @description 获取分类详情
* @param {String} id = [分类ID] 
* @param {String} title = [分类标题] 
* @param {String} page = [请求当前页] 
* @param {String} source = [来源] 
* @return {Object}
**/
getTypeDetail (data) {
	return new Promise((resolve, reject) => {
		const href = getHref(source)
		http.get(href + data.id, {
			params: {
				page: data.page
			},
			headers: {
				Referer: href,
				Host: href.replace('https://', '')
			}
		}).then((res) => {
			let str = replaceHTML(res.data);//解析html字符
			let divs = str.match(/<div[^>]*class=([""]?)book-draw\1[^>]*>*([\s\S]*?)<div[^>]*class=([""]?)rank-book-mask\1[^>]*>/ig);
			let list = []
			if ( divs ) {
				divs.forEach(div => {
					const bookId = div.match(/href=\"*([\s\S]*?)\"/)[1]
					const cover = div.match(/src=\"*([\s\S]*?)\"/)[1]
					const title = div.match(/<a[^>]*class=([""]?)book-name\1[^>]*>*([\s\S]*?)<\/a>/)[2].replace(/\/s/g, '')
					const extra = div.match(/<div[^>]*class=([""]?)book-extra\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\/s/g, '')
					const author = extra.split(' 丨 ')[0]
					const updateTime = extra.split(' 丨 ')[1]
					const desc = div.match(/<div[^>]*class=([""]?)book-intro\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace(/\/s/g, '')
					const as = div.match(/<a[^>]*class=([""]?)book-tag\1[^>]*>*([\s\S]*?)<\/a>/ig)
					let style = ''
					if ( as ) {
						as.forEach((a, key) => {
							style += a.match(/<a[^>]*class=([""]?)book-tag\1[^>]*>*([\s\S]*?)<\/a>/)[2].replace(/\/s/g, '') + (key < as.length - 1 ? ' ' : '')
						})
					}
					list.push(
						new Book({
							bookId: bookId,
							cover: cover,
							title: htmlDecodeByRegExp(title),
							author: author,
							style: style,
							desc: htmlDecodeByRegExp(desc),
							updateTime: updateTime,
							source: source
						})
					)
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					isLastPage: list.length < 18,
					currentPage: data.page,
					source: source
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					isLastPage: false,
					currentPage: data.page - 1,
					source: source
				}
			})
		})
	})
},
/**
* @event {Function()} getDetail 
* @author yingbing
* @description 获取小说详情
* @param {String} id = [书籍ID] 
* @param {String} source = [来源] 
* @return {Object}
**/
	getDetail (data) {
		return new Promise(resolve => {
			const href = getHref(source)
			http.get(href + data.id, {
				headers: {
					Referer: href,
					Host: href.replace('https://', ''),
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let aTitle = str.match(/<a[^>]*data-lightbox=([""]?)cover\1[^>]*>*([\s\S]*?)<\/a>/)[0]
				let cover = aTitle.match(/href=\"*([\s\S]*?)\"/)[1].replace('min1200', 'min300')
				let title = aTitle.match(/data-title=\"*([\s\S]*?)\"/)[1]
				let authorStr = str.match(/<div[^>]*class=([""]?)name\1[^>]*>*([\s\S]*?)<\/div>/)[0]
				let author = authorStr.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
				let desc = str.match(/<div[^>]*class=([""]?)about-text text-content-actual\1[^>]*>*([\s\S]*?)<\/div>/)[2]
				let updateTime = str.match(/<div[^>]*class=([""]?)book-last-update\1[^>]*>*([\s\S]*?)<\/div>/)[2].replace('更新于', '')
				let bookData = str.match(/<div[^>]*class=([""]?)book-data\1[^>]*>*([\s\S]*?)<\/div>/)[0]
				let size = bookData.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig)[0].match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1]
				let isEnd = bookData.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig)[6].match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1]
				isEnd = isEnd.replace(isEnd.match(/<i[^>]*>*([\s\S]*?)<\/i>/)[0], '').replace(/\s/g, '')
				let catsc = str.match(/<div[^>]*class=([""]?)book-cats clearfix\1[^>]*>*([\s\S]*?)<\/div>/)[0]
				let cats = catsc.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig)
				let style = ''
				let tag = []
				if ( cats ) {
					cats.forEach((cat, key) => {
						let tagStr = cat.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
						if ( tagStr.indexOf('#') > -1 ) {
							tag.push(tagStr.replace('#', ''))
						} else {
							style += tagStr + (key < cats.length - 1 ? ' ' : '')
						}
					})
				}
				tag = tag.concat(getTag(source, title + '_' + desc + '_' + style))
				let chapters = []
				let chapterStr = str.match(/<div[^>]*class=([""]?)chapter( unlock| lock)?\1[^>]*>*([\s\S]*?)<\/div>|<div[^>]*class=([""]?)volume-info\1[^>]*>*([\s\S]*?)<div[^>]*class=([""]?)chapter-list text-content-wrapper\1[^>]*>/ig)
				let k = 0
				if ( chapterStr ) {
					chapterStr.forEach(chapter => {
						if ( chapter.match(/<div[^>]*class=([""]?)volume-info\1[^>]*>*([\s\S]*?)<\/div>/) ) {
							chapters.push({
								title: chapter.match(/data-title=\"*([\s\S]*?)\"/)[1],
								cover: chapter.match(/src=\"*([\s\S]*?)\"/)[1],
								hint: chapter.match(/<div[^>]*class=([""]?)volume-hint\1[^>]*>*([\s\S]*?)<\/div>/)[2],
								desc: htmlDecodeByRegExp(chapter.match(/<div[^>]*class=([""]?)text-content-actual\1[^>]*>*([\s\S]*?)<\/div>/)[2]),
								source: source
							})
						} else {
							chapters.push(
								new Chapter({
									id: chapter.match(/href=\"*([\s\S]*?)\"/)[1],
									title: chapter.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
									chapter: k + 1,
									isStart: k == 0,
									isEnd: k == chapterStr.filter(cha => cha.match(/<div[^>]*class=([""]?)chapter( unlock| lock)?\1[^>]*>*([\s\S]*?)<\/div>/)).length - 1,
									payread: chapter.match(/class=\"*([\s\S]*?)\"/)[1].indexOf('lock') > -1 && chapter.match(/class=\"*([\s\S]*?)\"/)[1].indexOf('unlock') == -1 ? true : false,
									source: source
								})
							)
							k++
						}
					})
				}
				let guess = []
				let tjs = str.match(/<a[^>]*class=([""]?)side-show-image-item pos-0 suggest-cover\1[^>]*>*([\s\S]*?)<\/a>/ig)
				tjs = tjs.concat(str.match(/<a[^>]*class=([""]?)side-show-image-item pos-1 suggest-cover\1[^>]*>*([\s\S]*?)<\/a>/ig))
				tjs = tjs.concat(str.match(/<a[^>]*class=([""]?)side-show-image-item pos-2 suggest-cover\1[^>]*>*([\s\S]*?)<\/a>/ig))
				tjs.forEach(tj => {
					guess.push(
						new Book({
							bookId: tj.match(/href=\"*([\s\S]*?)\"/)[1],
							commentId: tj.match(/href=\"*([\s\S]*?)\"/)[1].match(/book\/*(\S*).html/)[1],
							title: htmlDecodeByRegExp(tj.match(/alt=\"*([\s\S]*?)\"/)[1]),
							cover: tj.match(/src=\"*([\s\S]*?)\"/)[1],
							source: source
						})
					)
				})
				let sames = []
				let suggess = str.match(/<a[^>]*class=([""]?)covered-works\1[^>]*>*([\s\S]*?)<\/a>/ig)
				suggess.forEach(su => {
					sames.push(
						new Book({
							bookId: su.match(/href=\"*([\s\S]*?)\"/)[1],
							commentId: su.match(/href=\"*([\s\S]*?)\"/)[1].match(/book\/*(\S*).html/)[1],
							title: htmlDecodeByRegExp(su.match(/<a[^>]*class=([""]?)covered-works\1[^>]*>*([\s\S]*?)<\/a>/)[2]),
							source: source
						})
					)
				})
				let other = []
				let otherSuggest = str.match(/<div[^>]*class=([""]?)suggest-cover\1[^>]*>*([\s\S]*?)<\/div>/)
				if ( otherSuggest ) {
					other.push(
						new Book({
							bookId: otherSuggest[0].match(/href=\"*([\s\S]*?)\"/)[1],
							commentId: otherSuggest[0].match(/href=\"*([\s\S]*?)\"/)[1].match(/book\/*(\S*).html/)[1],
							title: htmlDecodeByRegExp(otherSuggest[0].match(/alt=\"*([\s\S]*?)\"/)[1]),
							cover: otherSuggest[0].match(/src=\"*([\s\S]*?)\"/)[1],
							author: author,
							source: source
						})
					)
				}
				resolve({
					code: ERR_OK,
					data: {
						bookInfo: {
							title: htmlDecodeByRegExp(title),
							cover: cover,
							author: author,
							style: style,
							size: size,
							desc: htmlDecodeByRegExp(desc),
							isEnd: isEnd == '连载中' ? false : true,
							updateTime: updateTime,
							tag: tag
						},
						guess: guess,
						sames: sames,
						other: other,
						chapters: chapters,
						source: source
					}
				})
			}).catch(() => {
				resolve({
					code: ERR_FALSE,
					data: {
						bookInfo: '',
						guess: [],
						sames: [],
						other: [],
						chapters: [],
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getContent 
* @author yingbing
* @description 获取小说内容
* @param {String} id = [书籍ID] 
* @param {String} title = [章节标题] 
* @param {Number} chapter = [章节序号] 
* @param {Boolean} isStart = [是否第一章节] 
* @param {Boolean} isEnd = [是否最后章节] 
* @param {String} source = [来源] 
* @return {Object}
**/
	getContent (data) {
		return new Promise(resolve => {
			const href = getHref(source)
			let arr = [];
			for ( let i in data ) {
				if ( !data[i].payread ) {
					arr.push(http.get(href + data[i].id, {
						headers: {
							Referer: href,
							Host: href.replace('https://', '')
						}
					}))
				} else {
					arr.push(Promise.resolve({
						content: '该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n该章节已锁，如果想看请支持正版\n'
					}))
				}
			}
			Promise.all(arr).then((ress) => {
				let contents = [];
				ress.forEach((res, key) => {
					let content = ''
					if ( !data[key].payread ) {
						let str = replaceHTML(res.data);
						let ps = str.match(/<p[^>]*class=([""]?)l\1[^>]*>*([\s\S]*?)<\/p>/ig)
						content = data[key].title + '\n\n'
						ps.forEach(p => {
							content += '        ' + p.match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1] + '\n\n'
						})
					} else {
						content = res.content
					}
					contents.push({
						chapter: data[key].chapter,
						content: content,
						title: data[key].title,
						isStart: data[key].isStart,
						isEnd: data[key].isEnd
					})
				})
				resolve({
					code: ERR_OK,
					data: {
						contents: contents,
						source: source
					}
				})
			}).catch(() => {
				resolve({
					code: ERR_FALSE,
					data: {
						contents: [],
						source: source
					}
				})
			})
		})
	},
/**
* @event {Function()} getComment 
* @author yingbing
* @description 获取评论列表
* @param {String} id = [评论id] 
* @param {Number} page = [请求当前页] 
* @return {Object}
**/
	getComment (data) {
		return new Promise((resolve) => {
			const href = getHref(source)
			http.get(href + '/comment/items', {
				params: {
					type: 'book',
					tid: data.id,
					pageSize: 15,
					page: data.page,
					_: 1642339788818
				},
				headers: {
					Referer: href,
					Host: href.replace('https://', '')
				}
			}).then((res) => {
				let list = []
				res.data.items.forEach(comment => {
					let subComment = []
					comment.replies.items.forEach(sub => {
						subComment.push(
							new Comment({
								id: sub.id,
								avatar: sub.author.avatar,
								title: sub.author.nick,
								subtitle: dateFormat(sub.date * 1000),
								content: sub.content
							})
						)
					})
					const item = new Comment({
						id: comment.id,
						avatar: comment.author.avatar,
						title: comment.author.nick,
						subtitle: dateFormat(comment.date * 1000),
						content: comment.content,
						subComment: subComment,
						source: source
					})
					list.push(item)
				})
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: list.length < 15,
						currentPage: data.page,
						source: source
					}
				})
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						isLastPage: false,
						currentPage: data.page - 1,
						source: source
					}
				})
			})
		})
	},
	source: source
}