export function getRecome(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			xhr,
			ERR_OK,
			ERR_FALSE,
			Book,
			Bookshelf,
			replaceHTML
		} = context;
		xhr.get(baseUrl, {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then(res => {
			let str = replaceHTML(res.data);
			let inners = str.match(/<div[^>]*class=([""]?)titletop\1[^>]*>*([\s\S]*?)<\/div>/ig);
			let hotBooks = [];
			let hotTops = [];
			inners.forEach((inner, key) => {
				if ( key < 3 ) {
					let lis = inner.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					if (lis) {
						lis.forEach(li => {
							hotBooks.push(
								new Book({
									bookId: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl,''),
									title: li.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
									type: 'story',
									isAdult: true,
									source: source
								})
							);
						})
					}
				}
				if ( key == 5 ){
					let title = inner.match(/<h3[^>]*>*([\s\S]*?)<\/h3>/)[1];
					if ( key == 5 ) {
						title = title.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1];
					} else {
						let span = title.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig)[0];
						title = title.replace(span, '');
					}
					hotTops.push(
						new Bookshelf({
							shelfId: 'rank_' + key + '_' + source,
							title: title,
							style: 'top',
							type: 'story',
							isAdult: true,
							source: source
						})
					);
					let lis = inner.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					if (lis) {
						lis.forEach(li => {
							hotTops[hotTops.length - 1].book.push(
								new Book({
									bookId: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl,''),
									title: li.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
									type: 'story',
									isAdult: true,
									source: source
								})
							);
						})
					}
				}
			});
			let updates = [];
			let lis = str.match(/<ul[^>]*class=([""]?)titlelist\1[^>]*>*([\s\S]*?)<\/ul>/)[0].match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
			if (lis) {
				lis.forEach(li => {
					let name = li.match(/<a[^>]*class=([""]?)name\1[^>]*>*([\s\S]*?)<\/a>/)[0];
					updates.push(
						new Book({
							bookId: name.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, ''),
							title: name.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
							author: li.match(/<div[^>]*class=([""]?)zz\1[^>]*>*([\s\S]*?)<\/div>/)[2],
							style: li.match(/<div[^>]*class=([""]?)lb\1[^>]*>*([\s\S]*?)<\/div>/)[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
							type: 'story',
							isAdult: true,
							source: source
						})
					)
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					banners: [],
					hotBooks: hotBooks,
					populars: [],
					updates: updates,
					hotTops: hotTops,
					source: source
				}
			})
		}).catch(() => {
			resolve({
				code: ERR_FALSE,
				data: {
					banners: [],
					hotBooks: [],
					populars: [],
					updates: [],
					hotTops: [],
					source: source
				}
			})
		})
	})
}

export function getHotKeywordDmzj(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			http,
			ERR_OK,
			ERR_FALSE,
			replaceHTML
		} = context;
		http.get(baseUrl + '/dynamic/o_search/index', {
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then(res => {
			let str = replaceHTML(res.data);
			let list = [];
			let con = str.match(
				/<div[^>]*class=([""]?)search_hot_con autoHeight\1[^>]*>*([\s\S]*?)<\/div>/)[0];
			let words = con.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig);
			words.forEach(word => {
				list.push(
					word.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]
				)
			});
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					source: source
				}
			})
		}).catch(() => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					source: source
				}
			})
		})
	})
}

export function search(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			xhr,
			ERR_OK,
			ERR_FALSE,
			replaceHTML,
			gb2312,
			Book
		} = context;
		xhr.postget(baseUrl + '/modules/article/search.php', {
			mimeType: 'text/html;charset=gb2312',
			params: {
				searchtype: 'articlename',
				searchkey: gb2312(params.keyword),
				page: params.page[source]
			},
			headers: {
				Charset: 'gb2312',
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let list = [];
			let str = replaceHTML(res.data);
			let con = str.match(/<table[^>]*class=([""]?)grid\1[^>]*>*([\s\S]*?)<\/table>/)[0];
			let trs = con.match(/<tr[^>]*>*([\s\S]*?)<\/tr>/ig);
			if (trs) {
				trs.forEach((tr, key) => {
					if ( key > 0 ) {
						let tds = tr.match(/<td[^>]*>*([\s\S]*?)<\/td>/ig);
						list.push(
							new Book({
								bookId: tds[0].match(/href=\"*([\s\S]*?)\"/)[1],
								title: tds[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
								author: tds[2].match(/<td[^>]*>*([\s\S]*?)<\/td>/)[1],
								lastChapter: tds[1].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
								size: tds[4].match(/<td[^>]*>*([\s\S]*?)<\/td>/)[1],
								isEnd: tds[5].match(/<td[^>]*>*([\s\S]*?)<\/td>/)[1] != '连载',
								type: 'story',
								isAdult: true,
								source: source
							})
						)
					}
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					isLastPage: list.length < 30,
					currentPage: params.page[source],
					source: source
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					isLastPage: false,
					currentPage: params.page[source] - 1,
					source: source
				}
			})
		})
	})
}

export function getTypeList(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			xhr,
			ERR_OK,
			ERR_FALSE,
			replaceHTML
		} = context;
		xhr.get(baseUrl, {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let list = [];
			let str = replaceHTML(res.data);
			let con = str.match(/<div[^>]*class=([""]?)head_t\1[^>]*>*([\s\S]*?)<\/div>/)[0];
			let lis = con.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
			if (lis) {
				lis.forEach((li, key) => {
					if ( key > 0 ) {
						list.push({
							label: li.match(/title=\"*([\s\S]*?)\"/)[1],
							value: li.match(/href=\"*([\s\S]*?)\"/)[1].replace('1/', ''),
							source: source
						})
					}
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					list: list,
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
}

export function getTypeDetail(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			xhr,
			ERR_OK,
			ERR_FALSE,
			Book,
			replaceHTML,
		} = context;
		xhr.get(baseUrl + params.id + params.page + '/', {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let list = [];
			let str = replaceHTML(res.data);
			let cons = str.match(/<div[^>]*id=([""]?)alistbox\1[^>]*>*([\s\S]*?)<\/li>/ig);
			cons.forEach(con => {
				list.push(
					new Book({
						bookId: con.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, ''),
						title: con.match(/alt=\"*([\s\S]*?)\"/)[1],
						cover: con.match(/src=\"*([\s\S]*?)\"/)[1].indexOf('http') > -1 ? con.match(/src=\"*([\s\S]*?)\"/)[1] : baseUrl + con.match(/src=\"*([\s\S]*?)\"/)[1],
						author: con.match(/作者：*([\s\S]*?)<\/span/)[1],
						desc: con.match(/<div[^>]*class=([""]?)intro\1[^>]*>*([\s\S]*?)<\/div>/)[2],
						style: params.title,
						type: 'story',
						isAdult: true,
						source: source
					})
				)
			});
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					isLastPage: list.length < 30,
					currentPage: params.page,
					source: source
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					isLastPage: false,
					currentPage: params.page - 1,
					source: source
				}
			})
		})
	})
}

export function getDetail(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			xhr,
			ERR_OK,
			ERR_FALSE,
			replaceHTML,
			getTag,
			Chapter
		} = context;
		xhr.get(baseUrl + params.id, {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let str = replaceHTML(res.data);
			let title = str.match(/alt=\"*([\s\S]*?)\"/)[1];
			let author = str.match(/<a[^>]*href=([""]?)#\1[^>]*>*([\s\S]*?)<\/a>/)[2];
			let updateTime = str.match(/<time[^>]*>*([\s\S]*?)<\/time>/)[1];
			let desc = str.match(/<div[^>]*id=([""]?)aboutbook\1[^>]*>*([\s\S]*?)<\/div>/)[2];
			let cover = str.match(/<img[^>]*id=([""]?)novelPic\1[^>]*>/)[0].match(/src=\"*([\s\S]*?)\"/)[1];
			cover = cover.indexOf('http') > -1 ? cover : baseUrl + cover;
			let style = str.match(/<a[^>]*class=([""]?)typename\1[^>]*>*([\s\S]*?)<\/a>/)[2];
			let tag = getTag(source, desc + '_' + style + '_' + title);
			let chapters = [];
			let dds = str.match(/<dt[^>]*id=(['']?)chapter_list\1[^>]*>*([\s\S]*?)<\/dl>/)[2].match(/<dd[^>]*class=(['']?)chapter_list\1[^>]*>*([\s\S]*?)<\/dd>/ig);
			if (dds) {
				let len = Math.ceil(dds.length / 3);
				let k = 0;
				for ( let i = 0; i < len; i++ ) {
					let lis = dds.slice(i * 3, (i + 1) * 3);
					lis.reverse();
					lis.forEach(li => {
						let id = li.match(/href=\'*([\s\S]*?)\'/)[1];
						if ( id.indexOf('javascript:Chapter') > -1 ) {
							let ids = id.match(/javascript:Chapter\(*([\s\S]*?)\);/)[1];
							ids = ids.split(',');
							id = '/read/' + ids[1] + '/' + ids[0] + '/';
						}
						if ( id.indexOf('http') > -1 ) {
							id = id.replace(baseUrl, '');
						}
						chapters.push(
							new Chapter({
								id: id,
								chapter: k + 1,
								title: li.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1],
								isStart: k == 0,
								isEnd: k == dds.length - 1,
								source: source
							})
						);
						k++;
					})
				}
			}
			resolve({
				code: ERR_OK,
				data: {
					bookInfo: {
						title: title,
						cover: cover,
						desc: desc,
						author: author,
						tag: tag,
						style: style,
						updateTime: updateTime
					},
					chapters: chapters,
					source: source
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					bookInfo: {},
					source: source
				}
			})
		})
	})
}

export function getContent(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			xhr,
			ERR_OK,
			ERR_FALSE,
			replaceHTML
		} = context;
		xhr.get(baseUrl + params.id, {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let content = '';
			let main = res.data.match(/<div[^>]*id=([""]?)main\1[^>]*>*([\s\S]*?)<div[^>]*id=([""]?)navup\1[^>]*>/)[0];
			let ps = main.match(/<p[^>]*>*([\s\S]*?)<\/p>/ig);
			if ( ps ) {
				ps.forEach(p => {
					content += p.match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace(/<br>|<br\/>|<br \/>/ig, '').replace(/&nbsp;/ig, ' ');
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					content: {
						title: params.title,
						chapter: params.chapter,
						content: content,
						isStart: params.isStart,
						isEnd: params.isEnd
					},
					source: source
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					content: '',
					source: source
				}
			})
		})
	})
}

export function getComment(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			http,
			ERR_OK,
			ERR_FALSE,
			Comment,
			dateFormat
		} = context;
		let comment_list_s = function(e) {
			return e
		};
		http.get('https://comment.dmzj.com/v1/4/latest/' + params.id, {
			params: {
				callback: 'comment_list_s',
				page_index: params.page
			},
			headers: {
				Referer: baseUrl,
				Host: 'comment.dmzj.com',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let list = [];
			let results = eval('(' + res.data.slice(0, res.data.length - 1) + ')');
			let comments = results.comments;
			results.commentIds.forEach((item, key) => {
				let ids = item.split(',');
				ids.forEach((id, i) => {
					if ( comments[id] ) {
						if ( i == 0 ) {
							list.push(
								new Comment({
									id: id,
									avatar: comments[id].avatar_url,
									title: comments[id].nickname,
									subtitle: dateFormat(parseInt(comments[id].create_time) * 1000),
									content: comments[id].content,
									source: source
								})
							)
						} else {
							list[key].subComment.push(
								new Comment({
									id: id,
									avatar: comments[id].avatar_url,
									title: comments[id].nickname,
									subtitle: dateFormat(parseInt(comments[id].create_time) * 1000),
									content: comments[id].content,
									source: source
								})
							)
						}
					}
				})
			});
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					isLastPage: list.length < 30,
					currentPage: params.page,
					source: source
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					list: [],
					isLastPage: false,
					currentPage: params.page - 1,
					source: source
				}
			})
		})
	})
}