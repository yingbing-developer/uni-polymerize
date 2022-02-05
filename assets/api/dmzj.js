export function getRecome (context, params) {
	return new Promise(resolve => {
		const {
			baseUrl,
			source
		} = params;
		const {
			ERR_OK,
			ERR_FALSE,
			xhr,
			http,
			gb2312,
			Book,
			Bookshelf,
			replaceHTML,
			htmlDecodeByRegExp
		} = context;
		xhr.get(baseUrl, {
			mimeType: 'text/html;charset=gb2312',
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('http://', '')
			}
		}).then((res) => {
			let str = replaceHTML(res.data);
			let hotBook = str.match(/<div[^>]*class=([""]?)tp\1[^>]*>*([\s\S]*?)<\/div>/ig);
			let hotBooks = [];
			hotBook.forEach(book => {
				const lis = book.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
				lis.forEach(li => {
					const bookId = li.match(/href=\"*(\S*)\"/)[1];
					const title = li.match(/title=\"*([\s\S]*?)\"/)[1];
					const cover = li.match(/<img[^>]*>/)[0].match(/src=\"*(\S*)\"/)[1];
					hotBooks.push(new Book({
						bookId: bookId,
						title: htmlDecodeByRegExp(title),
						style: '热门',
						cover: baseUrl + cover,
						isEnd: true,
						source: source
					}))
				})
			});
			let uzs = str.match(/<ul[^>]*class=([""]?)wz\1[^>]*>*([\s\S]*?)<\/ul>/ig);
			let updates = [];
			let hotTops = [];
			uzs.forEach((uz, key) => {
				const lis = uz.match(/<li[^>]*>*([\s\S]*?)<\/li>/ig);
				let top = new Bookshelf({
					title: key == 1 ? '男生频道' : key == 3 ? '女生频道' : '耽美频道',
					shelfId: key == 1 ? '/TXT/list1_1.html' : key == 3 ?
						'/TXT/list2_1.html' : '/TXT/list26_1.html',
					cover: '/static/book/rank_' + Math.floor(Math.random() * 6 + 1) +
						'.jpg',
					style: 'top',
					type: 'story',
					source: source
				});
				lis.forEach(li => {
					const bookId = li.match(/href=\"*([\s\S]*?)\"/ig)[1].match(
						/href=\"*([\s\S]*?)\"/)[1];
					const title = li.match(/title=\"*([\s\S]*?)\"/)[1];
					const style = li.match(/<b[^>]*>*([\s\S]*?)<\/b>/)[1];
					const book = new Book({
						bookId: bookId,
						title: htmlDecodeByRegExp(title),
						style: style,
						isEnd: true,
						source: source
					});
					if (key % 2 == 0) {
						updates.push(book);
					} else {
						top.book.push(book);
					}
				});
				if (key % 2 != 0) {
					hotTops.push(top);
				}
			});
			resolve({
				code: ERR_OK,
				data: {
					hotBooks: hotBooks,
					hotTops: hotTops,
					source: source
				}
			})
		}).catch((err) => {
			resolve({
				code: ERR_FALSE,
				data: {
					source: source
				}
			})
		})
	})
}
