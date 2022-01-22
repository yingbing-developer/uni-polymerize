export default {
	//小说网站链接
	BOOKURL: {
		'baoshuu': {
			title: '手机宝书',
			href: 'http://m.baoshuu.com',
			search: true,//是否有搜索功能
			hotKey: false,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			isAdult: false//是否属于青壮年内容
		},
		'xquge': {
			title: '笔趣阁',
			href: 'https://www.xquge.com',
			isAdult: false//是否属于青壮年内容
		},
		'linovel': {
			title: '轻之文库',
			href: 'https://www.linovel.net',
			search: true,//是否有搜索功能
			hotKey: false,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			isAdult: false//是否属于青壮年内容
		},
		'xyushu5': {
			title: '新御书屋',
			href: 'https://www.xyushu5.com',
			isAdult: true
		}
	},
	
	//漫画网站链接
	COMICURL: {
		'mangabz': {
			title: 'mangaBz',
			href: 'http://www.mangabz.com',
			search: true,//是否有搜索功能
			hotKey: false,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			isAdult: false//是否属于青壮年内容
		},
		'sixmh': {
			title: '6漫画',
			href: 'http://m.sixmh7.com',
			search: true,//是否有搜索功能
			hotKey: true,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			isAdult: false//是否属于青壮年内容
		},
		'dmzj': {
			title: '动漫之家',
			href: 'https://www.dmzj.com',
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
			href: 'https://nightpics1.xyz',
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
	//音乐网站链接
	MUSICURL: {
		'163music': {
			title: '网易云音乐',
			href: 'https://autumnfish.cn',
			search: true,//是否有搜索功能
			hotKey: true,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			newSong: true//是否有新歌首发功能
		},
		'qqmusic': {
			title: 'QQ音乐',
			href: 'https://u.y.qq.com',
			search: true,//是否有搜索功能
			hotKey: true,//是否有热门搜索关键词功能
			recome: true,//是否有热门推荐功能
			newSong: true//是否有新歌首发功能
		}
	},
	
	//请求成功编码
	ERR_OK: 200,
	//请求失败编码
	ERR_FALSE: 300,
	//请求超时时间
	TIMEOUT: 50000
}
