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
						cover: con.match(/src=\"*([\s\S]*?)\"/)[1],
						author: con.match(/作者：*([\s\S]*?)<\/span/)[1],
						desc: con.match(/<div[^>]*class=([""]?)intro\1[^>]*>*([\s\S]*?)<\/div>/)[2],
						style: params.title,
						type: 'story',
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
			http,
			ERR_OK,
			ERR_FALSE,
			replaceHTML,
			getTag,
			Book,
			Chapter
		} = context;
		http.get(baseUrl + params.id, {
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let str = replaceHTML(res.data);
			let title = str.match(/<h1[^>]*>*([\s\S]*?)<\/h1>/)[0].match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1];
			let commentId = str.match(/obj_id = \"*([\s\S]*?)\";/)[1];
			let cover = str.match(/<div[^>]*class=([""]?)comic_i_img\1[^>]*>*([\s\S]*?)<\/div>/)[0]
				.match(/src=\"*([\s\S]*?)\"/)[1];
			let info = str.match(/<ul[^>]*class=([""]?)comic_deCon_liO\1[^>]*>*([\s\S]*?)<\/ul>/)[0]
				.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
			let author = info[0].match(/<li[^>]*>*([\s\S]*?)<\/li>/)[1].replace('作者：', '');
			let isEnd = info[1].match(/<li[^>]*>*([\s\S]*?)<\/li>/)[1].indexOf('连载中') == -1;
			let style = info[3].match(/<li[^>]*>*([\s\S]*?)<\/li>/)[1].replace('类型：', '');
			let desc = str.match(/<p[^>]*class=([""]?)comic_deCon_d\1[^>]*>*([\s\S]*?)<\/p>/)[2];
			let spans = desc.match(/<span[^>]*>*([\s\S]*?)<\/span>/ig);
			if (spans) {
				spans.forEach(span => {
					desc = desc.replace(span, '');
				})
			}
			let updateTime = str.match(
				/<span[^>]*class=([""]?)zj_list_head_dat\1[^>]*>*([\s\S]*?)<\/span>/)[2];
			updateTime = updateTime.match(/更新时间：*([\s\S]*?)\]/)[1];
			let tag = getTag(source, desc + '_' + style + '_' + title);
			let chapters = [];
			let lis = str.match(
				/<ul[^>]*class=([""]?)list_con_li autoHeight\1[^>]*>*([\s\S]*?)<\/ul>/ig)[1].match(
				/<li[^>]*>*([\s\S]*?)<\/li>/ig);
			if (lis) {
				lis.forEach((li, key) => {
					chapters.push(
						new Chapter({
							id: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl,
								''),
							chapter: key + 1,
							title: li.match(/title=\"*([\s\S]*?)\"/)[1].slice(0, li
								.match(/title=\"*([\s\S]*?)\"/)[1].length - 11),
							isStart: key == 0,
							isEnd: key == lis.length - 1,
							source: source
						})
					)
				})
			}
			let guess = [];
			lis = str.match(/<ul[^>]*class=([""]?)update_con\1[^>]*>*([\s\S]*?)<\/ul>/)[0].match(
				/<li[^>]*>*([\s\S]*?)<\/li>/ig);
			if (lis) {
				lis.forEach(li => {
					guess.push(
						new Book({
							bookId: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl,
								''),
							cover: li.match(/src=\"*([\s\S]*?)\"/)[1],
							title: li.match(/title=\"*([\s\S]*?) href/)[1],
							author: li.match(
								/<p[^>]*class=([""]?)auth\1[^>]*>*([\s\S]*?)<\/p>/)[
								2],
							lastChapter: li.match(
								/<span[^>]*class=([""]?)tip\1[^>]*>*([\s\S]*?)<\/span>/
								)[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace(
								'更新至', ''),
							type: 'comic',
							source: source
						})
					)
				})
			}
			let sames = [];
			let views = str.match(/<div[^>]*class=([""]?)viewpoint_con\1[^>]*>*([\s\S]*?)<\/div>/ig);
			lis = views[views.length - 1].match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
			if (lis) {
				lis.forEach(li => {
					sames.push(
						new Book({
							bookId: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl,
								''),
							cover: li.match(/src=\"*([\s\S]*?)\"/)[1],
							title: li.match(/title=\"*([\s\S]*?) href/)[1],
							author: li.match(
								/<p[^>]*class=([""]?)v_de_author\1[^>]*>*([\s\S]*?)<\/p>/
								)[2].replace('作者：', ''),
							lastChapter: li.match(
								/<p[^>]*class=([""]?)v_de_new\1[^>]*>*([\s\S]*?)<\/p>/
								)[2].replace('最新：', ''),
							type: 'comic',
							source: source
						})
					)
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					bookInfo: {
						title: title,
						commentId: commentId,
						cover: cover,
						desc: desc,
						author: author,
						tag: tag,
						style: style,
						updateTime: updateTime,
						isEnd: isEnd
					},
					guess: guess,
					sames: sames,
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
			http,
			ERR_OK,
			ERR_FALSE,
			replaceHTML
		} = context;
		http.get(baseUrl + params.id, {
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let contents = [];
			let head = res.data.match(/<head[^>]*>*([\s\S]*?)<\/head>/)[0];
			let script = head.match(/<script[^>]*>*([\s\S]*?)<\/script>/ig)[0];
			script = script.match(/eval\(*([\s\S]*?)<\/script>/)[1];
			script = script.slice(0, script.lastIndexOf(')'));
			let pages = eval('(' + script + ')');
			pages = pages.match(/var pages=\'*([\s\S]*?)\';/)[1];
			let func = eval('(' + 'function () {return ' + pages + '}' + ')');
			let urls = func().page_url.split('\r\n');
			urls.forEach(url => {
				contents.push('https://images.dmzj.com/' + url)
			});
			resolve({
				code: ERR_OK,
				data: {
					contents: contents,
					source: source
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					contents: [],
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