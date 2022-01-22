import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Book from '@/assets/constructor/book.js'
import Bookshelf from '@/assets/constructor/bookshelf.js'
import Chapter from '@/assets/constructor/chapter.js'
import { getHref, replaceHTML, htmlDecodeByRegExp, getTag } from '@/assets/api/global.js'

const { COMICURL, ERR_OK, ERR_FALSE } = Config

const source = 'mangabz'

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
			http.get(href + '/pager.ashx', {
				params: {
					t: 3,
					f: 0,
					d: 'Sat%20Aug%2021%202021%2009:31:43%20GMT+0800%20(中国标准时间)',
					title: data.keyword,
					pageSize: 12,
					pageindex: data.page[source]
				},
				headers: {
					Referer: href,
					Host: href.replace('http://', ''),
				}
			}).then((res) => {
				let list = []
				if ( res.data?.length > 0 ) {
					res.data.forEach(item => {
						list.push(
							new Book({
								bookId: item.Url,
								cover: item.Pic,
								title: item.Title,
								style: item.TagList ? item.TagList.toString().replace(/,/g, ' ') : '',
								author: item.Author.toString().replace(/,/g, ' '),
								desc: item.Content,
								lastChapter: item.LastUpdateInfo,
								createTime: item.AddTime,
								updateTime: item.LastPartTime,
								isEnd: item.Status == '连载中' ? false : true,
								type: 'comic',
								source: source
							})
						)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: list.length < 12,
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
		return new Promise(resolve => {
			const href = getHref(source)
			http.get(href, {
				headers: {
					Referer: href,
					Host: href.replace('http://', ''),
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let container = str.match(/<div[^>]*class=([""]?)banner-con\1[^>]*>*([\s\S]*?)<\/div>/)[0]
				let imgs = container.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig)
				let banners = []
				imgs.forEach(img => {
					banners.push(
						new Book({
							bookId: img.match(/href=\"*(\S*)\"/)[1],
							title: img.match(/title=\"*(\S*)\"/)[1],
							cover: img.match(/src=\"*(\S*)\"/)[1],
							type: 'comic',
							source: source
						})
					)
				})
				let hotBooks = []
				let hotBook = str.match(/<div[^>]*class=([""]?)index-manga-item\1[^>]*>*([\s\S]*?)<\/div>/ig)
				hotBook.slice(0, 10).forEach(book => {
					let subtitle = book.match(/<p[^>]*class=([""]?)index-manga-item-subtitle\1[^>]*>*([\s\S]*?)<\/p>/)[0]
					let style = subtitle.match(/<span[^>]*>*([\s\S]*?)<\/span>/) ? subtitle.match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1] : ''
					hotBooks.push(
						new Book({
							bookId: book.match(/href=\"*(\S*)\"/)[1],
							title: book.match(/<p[^>]*class=([""]?)index-manga-item-title\1[^>]*>*([\s\S]*?)<\/p>/)[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
							cover: book.match(/src=\"*(\S*)\"/)[1],
							style: style,
							type: 'comic',
							source: source
						})
					)
				})
				let populars = []
				let pops = str.match(/<div[^>]*class=([""]?)carousel-right-item\1[^>]*>*([\s\S]*?)<\/div>/ig)
				pops.forEach(pop => {
					let subtitle = pop.match(/<p[^>]*class=([""]?)carousel-right-item-tag\1[^>]*>*([\s\S]*?)<\/p>/)[0]
					let spans = subtitle.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig)
					let style = ''
					if ( spans ) {
						spans.forEach((span, key) => {
							style += span.match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1] + (key < spans.length - 1 ? ' ' : '')
						})
					}
					populars.push(
						new Book({
							bookId: pop.match(/href=\"*(\S*)\"/)[1],
							title: pop.match(/title=\"*(\S*)\"/)[1],
							cover: pop.match(/src=\"*(\S*)\"/)[1],
							author: pop.match(/<p[^>]*class=([""]?)carousel-right-item-subtitle\1[^>]*>*([\s\S]*?)<\/p>/)[2].replace('  ', ' '),
							desc: pop.match(/<p[^>]*class=([""]?)carousel-right-item-content\1[^>]*>*([\s\S]*?)<\/p>/)[2],
							style: style,
							type: 'comic',
							source: source
						})
					)
				})
				let tops = str.match(/<div[^>]*class=([""]?)(rank-item-1|rank-item-2) list\1[^>]*>*([\s\S]*?)<\/div>/ig)
				let hotTops = []
				hotTops.push(
					new Bookshelf({
						title: '热度排行',
						shelfId: 'rank_1',
						cover: '/static/book/rank_' + Math.floor(Math.random()*6 + 1) + '.jpg',
						style: 'top',
						type: 'comic',
						source: source
					})
				)
				tops.forEach(top => {
					let subtitle = top.match(/<p[^>]*class=([""]?)rank-item-right\1[^>]*>*([\s\S]*?)<\/p>/)[0]
					let spans = subtitle.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig)
					let style = ''
					if ( spans ) {
						spans.forEach((span, key) => {
							style += span.match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1] + (key < spans.length - 1 ? ' ' : '')
						})
					}
					hotTops[0].book.push(
						new Book({
							bookId: top.match(/href=\"*([\s\S]*?)\"/)[1],
							cover: top.match(/src=\"*([\s\S]*?)\"/)[1],
							title: top.match(/<p[^>]*class=([""]?)rank-item-title\1[^>]*>*([\s\S]*?)<\/p>/)[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
							style: style,
							type: 'comic',
							source: source
						})
					) 
				})
				resolve({
					code: ERR_OK,
					data: {
						banners: banners,
						hotBooks: hotBooks,
						populars: populars,
						hotTops: hotTops,
						updates: [],
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
		return new Promise((resolve, reject) => {
			const href = getHref(source)
			http.get(href + '/manga-list', {
				headers: {
					Referer: href,
					Host: href.replace('http://', '')
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let classList = str.match(/<div[^>]*class=([""]?)class-line\1[^>]*>*([\s\S]*?)<\/div>/)[0]
				let as = classList.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig)
				let typeList = []
				as.forEach(a => {
					let ids = a.match(/href=\"*(\S*)\"/)[1].match(/\/manga-list-\"*(\S*)-0-10\//)
					let id = ids ? ids[1] : 0
					let title = a.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
					typeList.push({
						label: title,
						value: id,
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
		http.get(href + '/manga-list/mangabz.ashx', {
			params: {
				action: 'getclasscomics',
				pageindex: data.page,
				pagesize: 21,
				tagid: data.id,
				status: 0,
				sort: 10
			},
			headers: {
				Referer: href,
				Host: href.replace('http://', '')
			}
		}).then((res) => {
			let list = []
			if ( res.data.UpdateComicItems?.length > 0 ) {
				res.data.UpdateComicItems.forEach(item => {
					list.push(
						new Book({
							bookId: '/' + item.UrlKey + '/',
							cover: item.ShowPicUrlB,
							title: item.Title,
							style: data.title,
							author: item.Author.toString().replace(/,/g, ' '),
							desc: item.Content,
							lastChapter: item.ComicPart,
							createTime: item.ShelvesTime.replace(' 更新', ''),
							updateTime: item.LastUpdateTime.replace(' 发布', ''),
							isEnd: item.Status == 1 ? false : true,
							type: 'comic',
							source: source
						})
					)
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					isLastPage: list.length < 21,
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
					Host: href.replace('http://', ''),
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let cover = str.match(/<img[^>]*class=([""]?)detail-info-cover\1[^>]*>/)[0].match(/src=\"*([\s\S]*?)\"/)[1]
				let title = str.match(/<p[^>]*class=([""]?)detail-info-title\1[^>]*>*([\s\S]*?)<\/p>/)[2].replace(/\s/ig, '')
				let tip = str.match(/<p[^>]*class=([""]?)detail-info-tip\1[^>]*>*([\s\S]*?)<\/p>/)[0]
				let spans = tip.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig)
				let author = ''
				let style = ''
				let isEnd = false
				spans.forEach((span, key) => {
					switch (key) {
						case 0:
							author = span.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
							break
						case 1:
							isEnd = span.match(/狀態：<span[^>]*>*([\s\S]*?)<\/span>/)[1] == '連載中' ? false : true
							break
						default:
							let items = span.match(/<span[^>]*class=([""]?)item\1[^>]*>*([\s\S]*?)<\/span>/ig)
							if ( items ) {
								items.forEach((item, key) => {
									style += item.match(/<span[^>]*class=([""]?)item\1[^>]*>*([\s\S]*?)<\/span>/)[2] + (key < items.length - 1 ? ' ' : '')
								})
							}
					}
				})
				let desc = str.match(/<p[^>]*class=([""]?)detail-info-content\1[^>]*>*([\s\S]*?)<\/p>/)[2]
				let conas = desc.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig)
				if ( conas ) {
					conas.forEach(con => {
						desc = desc.replace(con, '')
					})
				}
				let hideCon = desc.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig)
				if ( hideCon ) {
					hideCon.forEach(con => {
						desc = desc.replace(con.match(/<span[^>]*>*([\s\S]*?)<\/span>/)[0], con.match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1])
					})
				}
				let tag = getTag(source, title + '_' + desc + '_' + style)
				let chapters = []
				let chapterStr = str.match(/<a[^>]*class=([""]?)detail-list-form-item  (hide)?\1[^>]*>*([\s\S]*?)<\/a>/ig)
				if ( chapterStr ) {
					chapterStr.reverse()
					chapterStr.forEach((chapter, key) => {
						let chapterTitle = chapter.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
						let span = chapter.match(/<span[^>]*>*([\s\S]*?)<\/span>/)
						chapterTitle = chapterTitle.replace(span[0], span[1])
						chapters.push(
							new Chapter({
								id: chapter.match(/href=\"*([\s\S]*?)\"/)[1],
								title: chapterTitle.replace(/\s/g, ''),
								chapter: key + 1,
								isStart: key== 0,
								isEnd: key == chapterStr.length - 1,
								source: source
							})
						)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						bookInfo: {
							title: htmlDecodeByRegExp(title),
							cover: cover,
							author: author,
							style: style,
							size: chapters.length + '章节',
							desc: htmlDecodeByRegExp(desc),
							isEnd: isEnd,
							tag: tag
						},
						guess: [],
						sames: [],
						other: [],
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
* @param {String} source = [来源] 
* @return {Object}
**/
	getContent (data) {
		return new Promise(resolve => {
			const href = getHref(source)
			http.get(href + data.id, {
				headers: {
					Referer: href,
					Host: href.replace('http://', ''),
					'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
				}
			}).then((res) => {
				let contents = []
				let body = res.data.match(/<body[^>]*([\s\S]*?)<\/body>/)[0];
				let scripts = body.match(/<script[^>]*([\s\S]*?)<\/script>/ig);
				let jsStr = JSON.stringify(scripts[11].match(/<script[^>]*([\s\S]*?)<\/script>/)[1]);
				let func = jsStr.substring(jsStr.indexOf('(') + 1, jsStr.lastIndexOf(')'));
				func = func.replace(/\\\\/g, '\\');
				func = func.replace(/\\n/g, '');
				func = func.replace(/\\"/g, '"');
				let imageStr = eval("(" + func + ")");
				imageStr = imageStr.substring(imageStr.indexOf("'") + 1, imageStr.lastIndexOf("'"));
				let arr = imageStr.split("','");
				arr.forEach(img => {
					contents.push(img)
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
	source: source
}