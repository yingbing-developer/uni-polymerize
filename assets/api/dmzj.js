function(context, params) {
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
			htmlDecodeByRegExp,
			getTag,
			Chapter
		} = context;
		http.get(baseUrl + params.id, {
			headers: {
				Referer: baseUrl,
				Host: baseUrl.replace('https://', ''),
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
			}
		}).then(async (res) => {
			let str = replaceHTML(res.data);
			let con = str.match(/<div[^>]*class=([""]?)asTBcell uwthumb\1[^>]*>*([\s\S]*?)<\/a>/)[
				0];
			let title = con.match(/alt=\"*([\s\S]*?)\"/)[1];
			let cover = con.match(/src=\"*([\s\S]*?)\"/)[1].replace(/\/\/\/\/|\/\//, 'https://');
			let desc = str.match(/簡介：*([\s\S]*?)<\/p>/)[1];
			let style = str.match(/分類：*([\s\S]*?)<\/label>/)[1];
			let size = str.match(/頁數：*([\s\S]*?)<\/label>/)[1];
			let tags = str.match(/<a[^>]*class=([""]?)tagshow\1[^>]*>*([\s\S]*?)<\/a>/ig);
			let tag = getTag(source, title + '_' + desc + '_' + style);
			if (tags) {
				tags.forEach(t => {
					tag.push(t.match(/<a[^>]*>*([\s\S]*?)<\/a>/)[1]);
				})
			}
			let author = str.match(
				/<div[^>]*class=([""]?)asTBcell uwuinfo\1[^>]*>*([\s\S]*?)<\/div>/)[0].match(
				/<p[^>]*>*([\s\S]*?)<\/p>/)[1];
			let href = con.match(/href=\"*([\s\S]*?)\"/)[1].replace(/slide|list/, 'webp');
			let chapters = await http.get(baseUrl + href, {
				headers: {
					'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
				}
			}).then((ret) => {
				str = replaceHTML(ret.data);
				let write = str.match(/document.writeln\("*([\s\S]*?)"\);/ig);
				let imgStr = write[10].match(
					/document.writeln\(\"var imglist = \[\{*([\s\S]*?)\}\];\"\);/)[1];
				let arr = imgStr.split('},{');
				let images = [];
				for (let i in arr) {
					let img = arr[i].match(/fast_img_host\+\"*([\s\S]*?)\",/)[1];
					images.push('https://' + img.replace('//', ''))
				}
				let len = Math.ceil(images.length / 100);
				let data = [];
				for (let i = 0; i < len; i++) {
					let content = images.slice(i * 100, (i + 1) * 100);
					data.push(new Chapter({
						id: (i + 1) + '_' + source,
						title: '第' + (i + 1) + '部分' + '（共' + content.length +
							'P）',
						chapter: i + 1,
						isStart: i == 0,
						isEnd: i == len - 1,
						content: content
					}))
				}
				return data;
			});
			resolve({
				code: ERR_OK,
				data: {
					bookInfo: {
						title: htmlDecodeByRegExp(title),
						cover: cover,
						desc: htmlDecodeByRegExp(desc),
						author: author,
						tag: tag,
						style: style,
						isEnd: true
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
