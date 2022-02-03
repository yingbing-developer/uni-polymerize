export function getRecomeDmzj(context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			http,
			ERR_OK,
			ERR_FALSE,
			Book,
			Bookshelf,
			replaceHTML
		} = context;
		http.get(baseUrl, {
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then(res => {
			let str = replaceHTML(res.data);
			let inner = str.match(/<div[^>]*class=([""]?)banner_inner\1[^>]*>*([\s\S]*?)<\/ul>/)[0];
			let astr = inner.match(/<a[^>]*([\s\S]*?)<\/a>/ig);
			let hotBooks = [];
			if (astr) {
				astr.forEach(a => {
					hotBooks.push(
						new Book({
							bookId: a.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl,
								''),
							title: a.match(/title=\"*([\s\S]*?)\"/)[1],
							cover: a.match(/src=\"*([\s\S]*?)\"/)[1],
							type: 'comic',
							source: source
						})
					)
				})
			}
			let updates = [];
			let upcons = str.match(/<ul[^>]*class=([""]?)update_con\1[^>]*>*([\s\S]*?)<\/ul>/ig);
			if (upcons) {
				upcons.forEach(upcon => {
					let lis = upcon.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					if (lis) {
						lis.forEach(li => {
							updates.push(
								new Book({
									bookId: li.match(/href=\"*([\s\S]*?)\"/)[1]
										.replace(baseUrl, ''),
									title: li.match(/title=\"*([\s\S]*?)\"/)[1],
									cover: 'https:' + li.match(
										/src=\"*([\s\S]*?)\"/)[1],
									author: li.match(
										/<p[^>]*class=([""]?)auth\1[^>]*>*([\s\S]*?)<\/p>/
										)[2],
									lastChapter: li.match(
											/<span[^>]*class=([""]?)tip\1[^>]*>*([\s\S]*?)<\/span>/
											)[0].match(
											/<p[^>]*>*([\s\S]*?)<\/p>/)[1]
										.replace('更新至', ''),
									type: 'comic',
									source: source
								})
							)
						})
					}
				})
			}
			let hotTops = [];
			let tabs = str.match(
				/<div[^>]*class=([""]?)(banner_rank widthEigRight con_right|youn_mh_r con_right widthEigRight)\1[^>]*>*([\s\S]*?)<\/div>/ig
				);
			if (tabs) {
				tabs.forEach((tab, key) => {
					hotTops.push(
						new Bookshelf({
							shelfId: 'rank_' + key + '_' + source,
							title: tab.match(/<h2[^>]*>*([\s\S]*?)<\/h2>/)[1],
							style: 'top',
							type: 'comic',
							source: source
						})
					);
					let content = tab.match(
						/<div[^>]*class=([""]?)tab-content tab-content-selected\1[^>]*>*([\s\S]*?)<\/div>/
						)[0];
					let lis = content.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					if (lis) {
						lis.forEach(li => {
							let img = li.match(/<img[^>]*>/);
							let cover = img ? 'https:' + img[0].match(
								/src=\"*([\s\S]*?)\"/)[1] : '';
							let rankCon = li.match(
								/<span[^>]*class=([""]?)rank_first_con\1[^>]*>*([\s\S]*?)<\/span>/
								);
							let author = rankCon ? rankCon[0].match(
									/<p[^>]*>*([\s\S]*?)<\/p>/ig)[0].match(
									/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('作者：', '') :
								'';
							let lastChapter = rankCon ? rankCon[0].match(
									/<p[^>]*>*([\s\S]*?)<\/p>/ig)[1].match(
									/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('更新至', '') :
								li.match(
									/<span[^>]*class=([""]?)rank_tabs_sec\1[^>]*>*([\s\S]*?)<\/span>/
									)[2];
							hotTops[key].book.push(
								new Book({
									bookId: li.match(/href=\"*([\s\S]*?)\"/)[1]
										.replace(baseUrl, ''),
									title: li.match(/title=\"*([\s\S]*?)\"/)[1],
									cover: cover,
									author: author,
									lastChapter: lastChapter,
									type: 'comic',
									source: source
								})
							);
						})
					}
				})
			}
			let populars = [];
			let popcons = str.match(
				/<div[^>]*class=([""]?)youn_cn_b con_left\1[^>]*>*([\s\S]*?)<\/div>/ig);
			if (popcons) {
				popcons.forEach(con => {
					let desc = con.match(
						/<p[^>]*class=([""]?)con_intro\1[^>]*>*([\s\S]*?)<\/p>/)[2];
					let ad = desc.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[0];
					desc = desc.replace(ad, '');
					populars.push(
						new Book({
							bookId: con.match(/href=\"*([\s\S]*?)\"/)[1].replace(
								baseUrl, ''),
							title: con.match(/title=\"*([\s\S]*?)\"/)[1],
							cover: con.match(/src=\"*([\s\S]*?)\"/)[1],
							author: con.match(
								/<span[^>]*class=([""]?)con_author\1[^>]*>*([\s\S]*?)<\/span>/
								)[2].replace('作者：', ''),
							desc: desc,
							lastChapter: con.match(
								/<span[^>]*class=([""]?)tip\1[^>]*>*([\s\S]*?)<\/span>/
								)[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace(
								'更新至', ''),
							type: 'comic',
							source: source
						})
					);
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					banners: [],
					hotBooks: hotBooks,
					populars: populars,
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

export function searchDmzj(context, params) {
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
			Book
		} = context;
		http.get(baseUrl + '/dynamic/o_search/index/' + params.keyword + '/' + params.page[source], {
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let list = [];
			let str = replaceHTML(res.data);
			let con = str.match(/<ul[^>]*class=([""]?)update_con autoHeight\1[^>]*>*([\s\S]*?)<\/ul>/)[
				0];
			let lis = con.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
			if (lis) {
				lis.forEach(li => {
					let href = li.match(/href=\"*([\s\S]*?)\"/)[1];
					let bookId = href.indexOf('manhua.dmzj') > -1 ? '/info/' + href.slice(href
						.lastIndexOf('/') + 1) + '.html' : href.replace(
						'https://www.dmzj.com', '');
					list.push(
						new Book({
							bookId: bookId,
							title: li.match(/title=\"*([\s\S]*?)\"/)[1],
							cover: li.match(/src=\"*([\s\S]*?)\"/)[1],
							author: li.match(
								/<p[^>]*class=([""]?)auth\1[^>]*>*([\s\S]*?)<\/p>/)[
								2],
							lastChapter: li.match(
								/<p[^>]*class=([""]?)newPage\1[^>]*>*([\s\S]*?)<\/p>/
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
					list: list,
					isLastPage: list.length < 20,
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
			http,
			ERR_OK,
			ERR_FALSE,
			replaceHTML
		} = context;
		http.get('https://manhua.dmzj.com/tags/search.shtml', {
			headers: {
				Referer: baseUrl,
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let list = [];
			let str = replaceHTML(res.data);
			let con = str.match(/<div[^>]*class=([""]?)search_list_m\1[^>]*>*([\s\S]*?)<\/div>/ig)[0];
			let li = con.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig)[4];
			if (li) {
				let as = li.match(/<a[^>]*>*([\s\S]*?)<\/a>/ig);
				as.forEach(a => {
					let value = a.match(/onclick=\"*([\s\S]*?)\"/)[1];
					value = value.match(/changeType\(\'type\',*([\s\S]*?)\)/)[1];
					list.push({
						label: a.match(/title=\'*([\s\S]*?)\'/)[1],
						value: value.indexOf('all') > -1 ? '0' : value,
						source: source
					})
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
			source
		} = params;
		const {
			http,
			ERR_OK,
			ERR_FALSE,
			Book
		} = context;
		let renderResult = function(e) {
			return e
		};
		http.get('http://sacg.dmzj.com/mh/index.php', {
			params: {
				c: 'category',
				m: 'doSearch',
				status: 0,
				reader_group: 0,
				zone: 0,
				initial: 'all',
				type: params.id,
				p: params.page,
				callback: 'renderResult'
			},
			headers: {
				Referer: 'http://manhua.dmzj.com',
				'Upgrade-Insecure-Requests': 1,
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then((res) => {
			let list = [];
			let results = eval('(' + res.data.slice(0, res.data.length - 1) + ')');
			results.result.forEach(result => {
				list.push(
					new Book({
						bookId: result.comic_url.indexOf('www.dmzj.com') > -1 ? result
							.comic_url.replace('http://www.dmzj.com', '') : '/info' +
							result.comic_url.slice(0, result.comic_url.lastIndexOf(
							'/')) + '.html',
						title: result.name,
						cover: result.comic_cover.indexOf('http') > -1 ? result
							.comic_cover : 'http:' + result.comic_cover,
						author: result.author,
						lastChapter: result.last_chapter,
						style: result.type,
						isEnd: result.status ? true : false,
						type: 'comic',
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
				ids.reverse();
				ids.forEach((id, i) => {
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