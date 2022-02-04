export default {
	//小说网站链接
	BOOKURL: {
		'xquge': {
			title: '笔趣阁',
			href: 'https://www.xquge.com',
			isAdult: false//是否属于青壮年内容
		}
	},
	
	//漫画网站链接
	COMICURL: {
		'sixmh': {
			title: '6漫画',
			href: 'http://m.sixmh7.com',
			search: true,//是否有搜索功能
			hotKey: true,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			isAdult: false//是否属于青壮年内容
		},
		'cosplayporn': {
			title: '写真网',
			href: 'https://cosplayporn.cc',
			search: true,//是否有搜索功能
			hotKey: false,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			isAdult: true//是否属于青壮年内容
		},
		'wnacg': {
			title: '绅士漫画',
			href: 'https://hentaicomic.org',
			search: true,//是否有搜索功能
			hotKey: false,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			isAdult: true//是否属于青壮年内容
		},
		'nightpic': {
			title: '深夜图鉴',
			href: 'https://nightpics2.xyz',
			search: false,//是否有搜索功能
			recome: true,//是否有热门推荐功能
			isAdult: true//是否属于青壮年内容
		},
		'rosi': {
			title: 'ROSI写真网',
			href: ['http://www.xnnxz.com', 'http://www.ggudd.com', 'http://www.910ys.com'],
			search: true,//是否有搜索功能
			hotKey: false,//是否有热门搜索关键词功能
			recome: false,//是否有热门推荐功能
			isAdult: true//是否属于青壮年内容
		}
	},
	
	//请求成功编码
	ERR_OK: 200,
	//请求失败编码
	ERR_FALSE: 300,
	//请求超时时间
	TIMEOUT: 50000
}
