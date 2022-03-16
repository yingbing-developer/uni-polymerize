import http from '@/plugins/request/index.js'
function test () {
	http.get('http://www.jsons.cn/eascii/', {
		headers: {
			Referer: 'http://www.jsons.cn',
			Host: 'www.jsons.cn'
		}
	}).then((res) => {
		let ta = res.data.match(/<table[^>]*class=([""]?)table table-bordered table-striped\1[^>]*>*([\s\S]*?)<\/tbody>/)[0];
		let trs = ta.match(/<tr[^>]*>*([\s\S]*?)<\/tr>/ig);
		let str = ''
		trs.forEach((tr, key) => {
			if ( key > 0 ) {
				let tds = tr.match(/<td[^>]*>*([\s\S]*?)<\/td>/ig);
				let sq = tds[3].match(/<td[^>]*>*([\s\S]*?)<\/td>/)[1];
				let sr = tds[0].match(/<td[^>]*>*([\s\S]*?)<\/td>/)[1];
				str += 's = s.replace(/' + sq.replace(/\s/g, '').replace('&amp;', '&') + '/g, "' + sr.replace(/\s/g, '') + '")' + ',' + '\n'
			}
		})
		console.log(str);
	}).catch((err) => {
		console.log(err)
	})
}
test();