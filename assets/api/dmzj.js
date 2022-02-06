export function getRecome(context, params) {
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
							bookId: a.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl,''),
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
				upcons.forEach((upcon, key) => {
					let lis = upcon.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					if (lis) {
						lis.forEach(li => {
							let book = new Book({
								bookId: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, ''),
								title: li.match(/title=\"*([\s\S]*?)\"/)[1],
								cover: 'https:' + li.match(/src=\"*([\s\S]*?)\"/)[1],
								author: li.match(/<p[^>]*class=([""]?)auth\1[^>]*>*([\s\S]*?)<\/p>/)[2],
								lastChapter: li.match(/<span[^>]*class=([""]?)tip\1[^>]*>*([\s\S]*?)<\/span>/)[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('更新至', ''),
								type: 'comic',
								source: source
							});
							if ( key == 0 ) {
								updates.push(book);
							} else {
								hotBooks.push(book);
							}
						})
					}
				})
			}
			let hotTops = [];
			let tabs = str.match(/<div[^>]*class=([""]?)(banner_rank widthEigRight con_right|youn_mh_r con_right widthEigRight)\1[^>]*>*([\s\S]*?)<\/div>/ig);
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
					let content = tab.match(/<div[^>]*class=([""]?)tab-content tab-content-selected\1[^>]*>*([\s\S]*?)<\/div>/)[0];
					let lis = content.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					if (lis) {
						lis.forEach((li, index)=> {
							let img = li.match(/<img[^>]*>/);
							let cover = img ? 'https:' + img[0].match(/src=\"*([\s\S]*?)\"/)[1] : '';
							let rankCon = li.match(/<span[^>]*class=([""]?)rank_first_con\1[^>]*>*([\s\S]*?)<\/span>/);
							let author = rankCon ? rankCon[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/ig)[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('作者：', '') : '';
							let lastChapter = rankCon ? rankCon[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/ig)[1].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('更新至', '') : li.match(/<span[^>]*class=([""]?)rank_tabs_sec\1[^>]*>*([\s\S]*?)<\/span>/)[2];
							if ( index == 0 ) {
								hotTops[key].cover = cover;
							}
							hotTops[key].book.push(
								new Book({
									bookId: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, ''),
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
			let popcons = str.match(/<div[^>]*class=([""]?)youn_cn_b con_left\1[^>]*>*([\s\S]*?)<\/div>/ig);
			if (popcons) {
				popcons.forEach(con => {
					let desc = con.match(/<p[^>]*class=([""]?)con_intro\1[^>]*>*([\s\S]*?)<\/p>/)[2];
					let ad = desc.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[0];
					desc = desc.replace(ad, '');
					populars.push(new Book({
						bookId: con.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, ''),
						title: con.match(/title=\"*([\s\S]*?)\"/)[1],
						cover: con.match(/src=\"*([\s\S]*?)\"/)[1],
						author: con.match(/<span[^>]*class=([""]?)con_author\1[^>]*>*([\s\S]*?)<\/span>/)[2].replace('作者：', ''),
						desc: desc,
						lastChapter: con.match(/<span[^>]*class=([""]?)tip\1[^>]*>*([\s\S]*?)<\/span>/)[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('更新至', ''),
						type: 'comic',
						source: source
					}));
				})
			}
			let hotTypes = [];
			let comics = str.match(/<div[^>]*class=([""]?)youn_mh_l widthEigLeft con_left\1[^>]*>*([\s\S]*?)<!--/ig);
			if ( comics ) {
				comics.forEach(comic => {
					let title = comic.match(/<h2[^>]*>*([\s\S]*?)<\/h2>/)[1];
					let em = title.match(/<em[^>]*>*([\s\S]*?)<\/em>/);
					title = title.replace(em[0], em[1]);
					let shelfId = comic.match(/<a[^>]*class=([""]?)more con_right\1[^>]*>*([\s\S]*?)<\/a>/)[0];
					shelfId = shelfId.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, '');
					hotTypes.push(
						new Bookshelf({
							shelfId: shelfId,
							title: title,
							style: 'type',
							type: 'comic',
							source: source
						})
					);
					let liss = comic.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
					liss.forEach(li => {
						hotTypes[hotTypes.length - 1].book.push(
							new Book({
								bookId: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, ''),
								title: li.match(/title=\"*([\s\S]*?)\"/)[1],
								cover: 'https:' + li.match(/src=\"*([\s\S]*?)\"/)[1],
								author: li.match(/<p[^>]*class=([""]?)auth\1[^>]*>*([\s\S]*?)<\/p>/)[2],
								lastChapter: li.match(/<span[^>]*class=([""]?)tip\1[^>]*>*([\s\S]*?)<\/span>/)[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('更新至', ''),
								type: 'comic',
								source: source
							})
						)
					})
				})
			}
			let comicTabs = str.match(/<ul[^>]*class=([""]?)comic_tabs tabs\1[^>]*>*([\s\S]*?)<\/ul>/)[0].match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
			comics = str.match(/<ul[^>]*class=([""]?)comic_con update_con\1[^>]*>*([\s\S]*?)<\/ul>/ig);
			if ( comicTabs ) {
				comicTabs.forEach((tab, key) => {
					let title = tab.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1];
					let shelfId = tab.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, '');
					hotTypes.push(
						new Bookshelf({
							shelfId: shelfId,
							title: title,
							style: 'type',
							type: 'comic',
							source: source
						})
					);
					if ( comics[key] ) {
						let liss = comics[key].match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
						if ( liss ) {
							liss.forEach(li => {
								hotTypes[hotTypes.length - 1].book.push(
									new Book({
										bookId: li.match(/href=\"*([\s\S]*?)\"/)[1].replace(baseUrl, ''),
										title: li.match(/title=\"*([\s\S]*?)\"/)[1],
										cover: 'https:' + li.match(/src=\"*([\s\S]*?)\"/)[1],
										author: li.match(/<p[^>]*class=([""]?)auth\1[^>]*>*([\s\S]*?)<\/p>/)[2],
										lastChapter: li.match(/<span[^>]*class=([""]?)tip\1[^>]*>*([\s\S]*?)<\/span>/)[0].match(/<p[^>]*>*([\s\S]*?)<\/p>/)[1].replace('更新至', ''),
										type: 'comic',
										source: source
									})
								)
							})
						}
					}
				})
			}
			resolve({
				code: ERR_OK,
				data: {
					hotBooks: hotBooks,
					populars: populars,
					updates: updates,
					hotTops: hotTops,
					hotTypes: hotTypes,
					source: source
				}
			})
		}).catch(() => {
			resolve({
				code: ERR_FALSE,
				data: {
					source: source
				}
			})
		})
	})
}
