import http from '@/plugins/request/index.js'
import xhr from '@/plugins/xhr/index.js'
import gb2312 from '@/assets/other/gb2312.js'
import Config from '@/assets/js/config.js'
import Book from '@/assets/constructor/book.js'
import Bookshelf from '@/assets/constructor/bookshelf.js'
import Chapter from '@/assets/constructor/chapter.js'
import { getHref, replaceHTML, htmlDecodeByRegExp, getTag } from '@/assets/api/global.js'

const { BOOKURL, ERR_OK, ERR_FALSE } = Config

const source = 'baoshuu'

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
			http.postget(href + '/search.asp', {
				params: {
					word: gb2312(data.keyword),
					m: 2,
					ChannelID: 0,
					page: data.page[source]
				},
				headers: {
					Referer: href,
					Host: href.replace('http://', ''),
					Charset: 'gb2312',//自定义字符格式
					Cookie: 'READHISTORY=1; Hm_lvt_20e3d43a8af94081812f4fa083d50c1d=1609644004,1609727242; Hm_lvt_6d7fb6e0c01f66b2f24eaed304243e3b=1609644005,1609727242; CNZZDATA1276383317=833027924-1598060513-%7C1629325343; Hm_lvt_b13d8dae46c06e1573b8bc063cf7e6b7=1626869876,1628324474,1629117376,1629326644; Hm_lvt_c8e6032f427529232de7d81625ce9678=1630505789; _m_opt_bg=; Hm_lvt_fed71f7d1edb5bacb3fe60e703a761aa=1630504471,1630586245; UM_distinctid=17c31cb46105f1-021593152e6ee9-376b4502-1fa400-17c31cb4611abc; Hm_lvt_17c5df8652ce998038d4f97193152baa=1641004375,1641112385; CNZZDATA1280277111=1438383810-1632918518-%7C1641142876; ASPSESSIONIDCCDTQCBR=ADNJAADALABAPIILPMJBJOHM',
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let all = str.match(/<div[^>]*class=([""]?)sslist\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配所有小说内容
				let arr = all[0].match(/<li[^>]*>*([\s\S]*?)<\/p>/ig);//正则匹配所有小说内容
				let list = [];
				if ( arr ) {
					arr.forEach(ar => {
						const h1 = ar.match(/<h1[^>]*>*([\s\S]*?)<\/h1>/ig);
						const a = h1[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/ig);
						const path = a[1].match(/href=\"*(\S*)\"/)[1];
						const tag = a[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1];
						let name = a[1].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1];
						const redNameStr = name.match(/<font[^>]*>*([\s\S]*?)<\/font>/);
						if ( redNameStr ) name = name.replace(redNameStr[0], redNameStr[1])
						let desc = ar.match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1];
						const redDescStr = desc.match(/<font[^>]*>*([\s\S]*?)<\/font>/);
						if ( redDescStr ) desc = desc.replace(redDescStr[0], redDescStr[1])
						list.push(new Book({
							bookId: path,
							cover: '/static/cover/cover_default.jpg',
							title: htmlDecodeByRegExp(name),
							style: tag || '其它',
							author: '不详',
							desc: desc ? htmlDecodeByRegExp(desc.replace('简介：', '')) : '',
							isEnd: true,
							source: source
						}))
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: list.length < 20,
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
			xhr.get(href, {
				mimeType: 'text/html;charset=gb2312',
				headers: {
					Referer: href,
					Host: href.replace('http://', '')
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let hotBook = str.match(/<div[^>]*class=([""]?)tp\1[^>]*>*([\s\S]*?)<\/div>/ig);//正则匹配热门书籍
				let hotBooks = []
				hotBook.forEach(book => {
					const lis = book.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					lis.forEach(li => {
						const bookId = li.match(/href=\"*(\S*)\"/)[1]
						const title = li.match(/title=\"*([\s\S]*?)\"/)[1]
						const cover = li.match(/<img[^>]*>/)[0].match(/src=\"*(\S*)\"/)[1]
						hotBooks.push(new Book({
							bookId: bookId,
							title: htmlDecodeByRegExp(title),
							style: '热门',
							cover: href + cover,
							isEnd: true,
							source: source
						}))
					})
				})
				
				let uzs = str.match(/<ul[^>]*class=([""]?)wz\1[^>]*>*([\s\S]*?)<\/ul>/ig);//正则匹配热门书籍
				let updates = []
				let hotTops = []
				uzs.forEach((uz, key) => {
					const lis = uz.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					let top = new Bookshelf({
						title: key == 1 ? '男生频道' : key == 3 ? '女生频道' : '耽美频道',
						shelfId: key == 1 ? '/TXT/list1_1.html' : key == 3 ? '/TXT/list2_1.html' : '/TXT/list26_1.html',
						cover: '/static/book/rank_' + Math.floor(Math.random()*6 + 1) + '.jpg',
						style: 'top',
						type: 'story',
						source: source
					})
					lis.forEach(li => {
						const bookId = li.match(/href=\"*([\s\S]*?)\"/ig)[1].match(/href=\"*([\s\S]*?)\"/)[1]
						const title = li.match(/title=\"*([\s\S]*?)\"/)[1]
						const style = li.match(/<b[^>]*>*([\s\S]*?)<\/b>/)[1]
						const book = new Book({
							bookId: bookId,
							title: htmlDecodeByRegExp(title),
							style: style,
							isEnd: true,
							source: source
						})
						if ( key % 2 == 0 ) {
							updates.push(book)
						} else {
							top.book.push(book)
						}
					})
					if ( key % 2 != 0 ) {
						hotTops.push(top)
					}
				})
				resolve({
					code: ERR_OK,
					data: {
						banners: [],
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
		return new Promise((resolve, reject) => {
			const href = getHref(source)
			xhr.get(href, {
				mimeType: 'text/html;charset=gb2312',
				headers: {
					Referer: href,
					Host: href.replace('http://', '')
				}
			}).then((res) => {
				let str = replaceHTML(res.data);//解析html字符
				let nans = str.match(/<div[^>]*class=([""]?)nan\1[^>]*>*([\s\S]*?)<\/div>/ig);
				let typeList = []
				nans.forEach(nan => {
					const as = nan.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig);
					as.forEach(a => {
						let shelfId = a.match(/href=\"*(\S*)\"/)[1]
						shelfId = shelfId.replace(shelfId.match(/_(\S*)\.html/)[0], '_')
						let title = a.match(/title=\"*([\s\S]*?)\"/)[1]
						typeList.push({
							label: title,
							value: shelfId,
							source: source
						})
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
		xhr.get(href + data.id + data.page + '.html', {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: href,
				Host: href.replace('http://', '')
			}
		}).then((res) => {
			let str = replaceHTML(res.data);//解析html字符
			let man = str.match(/<div[^>]*class=([""]?)man_first\1[^>]*>*([\s\S]*?)<\/div>/)[0];
			let ul = man.match(/<ul[^>]*>*([\s\S]*?)<\/ul>/)[0]
			let lis = ul.match(/<li[^>]*>*([\s\S]*?)<\/p>/ig)
			let list = []
			if ( lis ) {
				lis.forEach(li => {
					const bookId = li.match(/href=\"*([\s\S]*?)\"/)[1]
					const title = li.match(/title=\"*([\s\S]*?)\"/)[1]
					const author = li.match(/<h3[^>]*>*([\s\S]*?)<\/h3>/)[1].split('/')[0]
					const size = li.match(/<h4[^>]*>*([\s\S]*?)<\/h4>/)[1].replace('大小:', '')
					const desc = li.match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1]
					list.push(
						new Book({
							bookId: bookId,
							title: htmlDecodeByRegExp(title),
							author: author,
							style: data.title,
							desc: htmlDecodeByRegExp(desc),
							size: size,
							isEnd: true,
							source: source
						})
					)
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					isLastPage: list.length < 20,
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
		return new Promise(async (resolve) => {
			let infoHttp = await this.getInfo(data)
			let chapterHttp = await this.getChapter({
				id: infoHttp.data.chapterId
			})
			resolve({
				code: ERR_OK,
				data: {
					bookInfo: infoHttp.data.bookInfo,
					guess: infoHttp.data.guess,
					sames: infoHttp.data.sames,
					other: infoHttp.data.other,
					chapters: chapterHttp.data.chapters,
					source: source
				}
			})
		}).catch(() => {
			resolve({
				code: ERR_FALSE,
				data: {
					bookInfo: '',
					guess: [],
					sames:  [],
					other:  [],
					chapters: [],
					source: tag1
				}
			})
		})
	},
/**
* @event {Function()} getInfo 
* @author yingbing
* @description 获取小说信息
* @param {String} id = [书籍ID] 
* @param {String} source = [来源] 
* @return {Object}
**/
	getInfo (data) {
		return new Promise((resolve) => {
			const href = getHref(source)
			xhr.get(href + data.id, {
				mimeType: 'text/html;charset=gb2312',
				headers: {
					Referer: href,
					Host: href.replace('http://', '')
				}
			}).then((res) => {
				if ( res.code == 200 ) {
					let str = replaceHTML(res.data);//解析html字符
					let mlist = str.match(/<div[^>]*class=([""]?)mlist\1[^>]*>*([\s\S]*?)<\/div>/)[0]
					let title = mlist.match(/<h1[^\s]>*([\s\S]*?)<\/h1>/)[1]
					let img = mlist.match(/<img[^>]*border=([""]?)0\1[^>]*>/)
					let cover = ''
					if ( img ) {
						cover = img[0].match(/src=\"*([\s\S]*?)\"/)[1]
					}
					let ul = mlist.match(/<ul[^\s]>*([\s\S]*?)<\/ul>/)[0]
					let author = ul.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
					let style = ul.match(/类型：<\/i[^\s]>*([\s\S]*?)<li>/)[1]
					let size = ul.match(/大小：<\/i[^\s]>*([\s\S]*?)<\/ul>/)[1]
					let createTime = mlist.match(/<h3[^\s]>*简介：（入库时间([\s\S]*?)）<\/h3>/)[1]
					let chapter = str.match(/<a[^>]*class=([""]?)left\1[^>]*>*([\s\S]*?)<\/a>/ig)[1]
					let chapterId = chapter.match(/href=\"*([\s\S]*?)\"/)[1]
					let lastIndex = chapterId.lastIndexOf('/');
					let allLength = chapterId.length;
					let urlTxt = gb2312(chapterId.substring(lastIndex + 1, allLength));
					let content = str.match(/<div[^>]*class=([""]?)conten\1[^>]*>*([\s\S]*?)<\/div>/)[0]
					let desc = content.match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1]
					desc = desc.replace(/<br\/>/ig, '\n');
					desc = htmlDecodeByRegExp(desc);
					let spans = desc.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig);
					if ( spans ) {
						spans.forEach(span => {
							desc = desc.replace(span, span.match(/<span[^>]*>*([\s\S]*?)<\/span>/)[1]);
						})
					}
					let tag = getTag(source, title + '_' + desc + '_' + style);
					let guess = []
					let tjs = str.match(/<div[^>]*class=([""]?)tj\1[^>]*>*([\s\S]*?)<\/div>/)[0].match(/<ul[^>]*>*([\s\S]*?)<\/ul>/)[0].match(/<li[^>]*>*([\s\S]*?)<\/a>/ig)
					tjs.forEach(tj => {
						guess.push(
							new Book({
								bookId: tj.match(/href=\"*([\s\S]*?)\"/)[1],
								title: htmlDecodeByRegExp(tj.match(/title=\"*([\s\S]*?)\"/)[1]),
								cover: href + tj.match(/src=\"*([\s\S]*?)\"/)[1],
								style: style || '',
								isEnd: true,
								source: source
							})
						)
					})
					let sames = []
					let other = []
					let tjlists = str.match(/<div[^>]*class=([""]?)tjlist\1[^>]*>*([\s\S]*?)<\/div>/ig)
					tjlists.forEach((tjlist, key) => {
						let tlis = tjlist.match(/<ul[^>]*>*([\s\S]*?)<\/ul>/)[0].match(/<li[^>]*>*([\s\S]*?)<\/a>/ig)
						tlis.forEach(li => {
							let book = new Book({
								bookId: li.match(/href=\"*([\s\S]*?)\"/)[1],
								title: htmlDecodeByRegExp(li.match(/title=\"*([\s\S]*?)\"/)[1]),
								author: key == 1 ? author : '',
								style: key == 0 ? style : '',
								isEnd: true,
								source: source
							})
							if ( book.bookId != data.id ) {
								if ( key == 0 ) {
									sames.push(book)
								} else {
									other.push(book)
								}
							}
						})
					})
					resolve({
						code: ERR_OK,
						data: {
							bookInfo: {
								title: htmlDecodeByRegExp(title),
								cover: cover ? href + cover : '',
								author: author,
								style: style,
								size: size,
								desc: htmlDecodeByRegExp(desc),
								createTime: createTime,
								tag: tag
							},
							guess: guess,
							sames: sames,
							other: other,
							chapterId: chapterId.substr(0, lastIndex + 1) + urlTxt,
							source: source
						}
					})
				}
			}).catch(() => {
				resolve({
					code: ERR_FALSE,
					data: {
						bookInfo: '',
						source: source
					}
				})
			})
		})
	},
/**
* @event {Function()} getChapter 
* @author yingbing
* @description 获取小说章节
* @param {String} id = [书籍ID] 
* @param {String} source = [来源] 
* @return {Object}
**/
	getChapter (data) {
		return new Promise((resolve) => {
			const href = getHref(source)
			xhr.get(href + data.id, {
				mimeType: 'text/html;charset=gb2312',
				headers: {
					Referer: href,
					Host: href.replace('http://', '')
				}
			}).then((res) => {
				if ( res.code == 200 ) {
					let str = replaceHTML(res.data);//解析html字符
					let bottom = str.match(/<div[^>]*id=([""]?)gobottom\1[^>]*>*([\s\S]*?)<br\/>/)[0]
					let lastChapter = bottom.match(/当前是第:    1    \/*([\s\S]*?)页/)[1]
					let chapters = new Array(lastChapter);
					for ( let i = 0; i <= lastChapter; i++ ) {
						chapters[i] = new Chapter({
							id: data.id + '&yeshu=' + i,
							title: '第' + (i + 1) + '页',
							chapter: i + 1,
							isStart: i == 0,
							isEnd: i == lastChapter,
							source: source
						})
					}
					resolve({
						code: ERR_OK,
						data: {
							chapters: chapters,
							source: source
						}
					})
				}
			}).catch(() => {
				resolve({
					code: ERR_FALSE,
					data: {
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
		return new Promise((resolve, reject) => {
			const href = getHref(source)
			let arr = [];
			for ( let i in data ) {
				arr.push(xhr.get(href + data[i].id, {
					mimeType: 'text/html;charset=gb2312',
					headers: {
						Referer: href,
						Host: href.replace('http://', '')
					}
				}))
			}
			Promise.all(arr).then((ress) => {
				let contents = [];
				ress.forEach((res, key) => {
					if ( res.code == 200 ) {
						let str = replaceHTML(res.data);
						let content = str.match(/<span[^>]*id=([""]?)Content\1[^>]*>*([\s\S]*?)<\/span>/);//正则匹配所有小说内容
						let unstr = content[2].match(/<font[^>]*>*([\s\S]*?)<\/font>/);//正则匹配所有小说内容
						content = content[2].replace(unstr[0], '');
						content = content.replace('</font>', '');
						content = content.replace(/<br \/>/ig, '\n');
						content = content.replace(/<br>/ig, '\n');
						contents.push({
							chapter: data[key].chapter,
							content: content,
							title: data[key].title,
							isStart: data[key].isStart,
							isEnd: data[key].isEnd
						})
					}
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