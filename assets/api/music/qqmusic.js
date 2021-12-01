// QQ音乐

import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import {
	Single,
	Album,
	Singer
} from '@/assets/constructor/music.js'

import Sign from '@/assets/other/qqSign.js'

const {
	MUSICURL,
	ERR_OK,
	ERR_FALSE
} = Config
const {
	time2seconds
} = Utils;

const source = 'qqmusic';
const href = MUSICURL[source].href;

//QQ音乐请求常量
const commonParams = {
	g_tk: 5381,
	loginUin: 0,
	hostUin: 0,
	format: 'json',
	inCharset: 'utf8',
	outCharset: 'utf-8',
	notice: 0,
	platform: 'yqq.json',
	needNewCode: 0
}


//转义html特殊字符
const htmlDecodeByRegExp = function(str) {
	let s = "";
	if (str.length == 0) return "";
	s = str.replace(/&#58;/g, ":");
	s = s.replace(/&#32;/g, " ");
	s = s.replace(/&#33;/g, "!");
	s = s.replace(/&#34;/g, '"');
	s = s.replace(/&#35;/g, "#");
	s = s.replace(/&#36;/g, "$");
	s = s.replace(/&#37;/g, "%");
	s = s.replace(/&#38;/g, "&");
	s = s.replace(/&#39;/g, "'");
	s = s.replace(/&#40;/g, "(");
	s = s.replace(/&#41;/g, ")");
	s = s.replace(/&#42;/g, "*");
	s = s.replace(/&#43;/g, "+");
	s = s.replace(/&#44;/g, ",");
	s = s.replace(/&#45;/g, "-");
	s = s.replace(/&#46;/g, ".");
	s = s.replace(/&#47;/g, "/");
	s = s.replace(/&#13;/g, "\n");
	return s;
}

export default {
	/**
	 * 搜索音乐列表
	 * @param {Object} data = {keyword: '搜索关键词', page: '搜索页数'} 
	 **/
	search(data) {
		const dataSync = Object.assign({
			_: '15778592' + Math.floor(Math.random() * Math.pow(10, 5)),
		}, commonParams, {
			w: data.keyword,
			zhidaqu: 1,
			catZhida: 1,
			t: 0,
			flag: 1,
			ie: 'utf-8',
			sem: 1,
			aggr: 0,
			perpage: 20,
			n: 20,
			p: data.page[source],
			remoteplace: 'txt.mqq.all'
		})
		return new Promise((resolve) => {
			http.get('https://c.y.qq.com/soso/fcgi-bin/client_search_cp', {
				params: dataSync,
				headers: {
					referer: 'https://c.y.qq.com',
					host: 'c.y.qq.com',
				}
			}).then((res) => {
				if (res.data.code == 0) {
					let songs = res.data.data.song.list;
					let list = [];
					const zhidaqu = res.data.data.zhida
					const zhida = zhidaqu.zhida_singer ? new Singer({
						singerId: zhidaqu.zhida_singer.singerMID,
						title: zhidaqu.zhida_singer.singerName,
						cover: `https://y.gtimg.cn/music/photo_new/T001R68x68M000${zhidaqu.zhida_singer.singerMID}.jpg?max_age=2592000`,
						albumSize: zhidaqu.zhida_singer.albumNum,
						source: source
					}) : null
					songs.forEach(song => {
						let singer = '';
						song.singer.forEach((sin, k) => {
							singer += sin.name + (k < song.singer.length ? ' ' : '')
						})
						const item = new Single({
							singleId: song.songmid,
							lyricId: song.songid,
							title: song.songname,
							cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.albummid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.pay.payplay == 1,
							source: source
						})
						list.push(item)
					})
					zhida ? list.unshift(zhida) : null
					resolve({
						code: ERR_OK,
						data: {
							list: list,
							zhida: zhida,
							source: source
						}
					})
				}
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						zhida: null,
						source: source
					}
				})
			})
		})
	},
	
	/**
	 * 获取热门搜索关键词
	 *
	 **/
	getHotKeyword() {
		const dataValue = Object.assign({}, {
			"comm": commonParams,
		}, {"hotkey":{"module":"tencent_musicsoso_hotkey.HotkeyService","method":"GetHotkeyForQQMusicMobile","param":{"remoteplace":"txt.miniapp.wxada7aab80ba27074","searchid":"1559616839293"}}})
		const dataSync = {
			cgiKey: 'GetHomePage',
			'_': 1577857656236,
			data: JSON.stringify(dataValue)
		}
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.hotkey.data.vec_hotkey
					group.forEach(top => {
						list.push(top.title)
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
	},
	
	/**
	 * 获取热门推荐
	 *
	 **/
	getRecom () {
		return new Promise((resolve) => {
			let newArr = [];
			let recome = {
				title: MUSICURL[source].title,
				source: source,
				banners: [],
				hotSinger: [],
				topList: [],
				hotDisc: [],
				newSong: []
			}
			if ( MUSICURL[source].banner ) {
				newArr.push(this.getBannerList());
			}
			if ( MUSICURL[source].singer ) {
				newArr.push(this.getHotSinger());
			}
			if ( MUSICURL[source].top ) {
				newArr.push(this.getToplist());
			}
			if ( MUSICURL[source].album ) {
				newArr.push(this.getHotDiscList());
			}
			Promise.all(newArr).then((ress) => {
				ress.forEach((res, key) => {
					if ( res.code == ERR_OK ) {
						switch (key) {
							case 0:
								recome.banners = res.data.list
								break;
							case 1:
								recome.hotSinger = res.data.list
								break;
							case 2:
								recome.topList = res.data.list
								break;
							default:
								recome.hotDisc = res.data.list
						}
					}
				})
				resolve({
					code: ERR_OK,
					data: {
						data: recome,
						source: source
					}
				})
			}).catch(() => {
				resolve({
					code: ERR_FALSE,
					data: {
						data: recome,
						source: source
					}
				})
			})
		})
	},

	/**
	 * 获取轮播图列表
	 *
	 **/
	getBannerList() {
		const dataSync = Object.assign({
			'-': 'recom61961704538089270',
		}, commonParams, {
			data: JSON.stringify({
				"comm": {
					"ct": 24
				},
				"focus": {
					"module": "QQMusic.MusichallServer",
					"method": "GetFocus",
					"param": {}
				}
			})
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.focus.data.content
					group.forEach(top => {
						const item = new Album({
							albumId: top.jump_info.url,
							title: top.title,
							cover: top.pic_info.url,
							type: 'banner',
							source: source
						})
						list.push(item)
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
	},
	
	/**
	 * 获取轮播详情
	 * @param {Object} data = {id: 轮播ID} 
	 **/
	getBannerDetail(data) {
		const dataSync = Object.assign({
			'-': 'albumSonglist' + Math.random() * Math.pow(10, 17)
		}, commonParams, {
			data: JSON.stringify({
				"comm":{
					"ct":24,
					"cv":10000,
				},
				"albumSonglist":{
					"method":"GetAlbumSongList",
					"module":"music.musichallAlbum.AlbumSongList",
					"param":{
						"albumMid": data.id,
						"albumID": 0,
						"begin": 0,
						"num": 100,
						"order": 2,
					}
				}
			})
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.albumSonglist.data.songList
					group.forEach(song => {
						let singer = '';
						song.songInfo.singer.forEach((sin, k) => {
							singer += sin.name + (k < song.songInfo.singer.length ? ' ' : '')
						})
						const item = new Single({
							singleId: song.songInfo.mid,
							lyricId: song.songInfo.id,
							title: song.songInfo.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.songInfo.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.songInfo.pay.pay_play == 1,
							source: source
						})
						list.push(item)
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
	},

	/**
	 * 获取排行榜
	 *
	 **/
	getToplist() {
		const dataSync = {
			'-': '1577850668501',
			data: JSON.stringify({
				"comm": Object.assign({}, commonParams, {
					"ct": 23,
					"cv": 0
				}),
				"topList": {
					"module": "musicToplist.ToplistInfoServer",
					"method": "GetAll",
					"param": {}
				}
			})
		}
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.topList.data.group
					group.forEach(item => {
						item.toplist.forEach(top => {
							const item = new Album({
								albumId: top.topId,
								title: top.musichallTitle,
								cover: top.frontPicUrl,
								desc: top.intro?.replace(/<br>/g, '\n') || '',
								extra: {
									period: top.period,
									recType: top.recType
								},
								type: 'top',
								source: source
							})
							if ( item.extra.recType === 10005 ) {
								list.push(item)
							}
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
	},
	
	/**
	 * 获取排行榜详情
	 * @param {String} id = {id: 排行榜ID} 
	 * @param {String} extra = {period: 时间段} 
	 **/
	getTopDetail(data) {
		const dataValue = {
			"comm":{
				"cv":4747474,
				"ct":24,
			},
			"topListDetail":{
				"module":"musicToplist.ToplistInfoServer",
				"method":"GetDetail",
				"param":{"topid": data.id,"offset":0,"num":1000,"period": data.extra.period},
			}
		}
		const sign = Sign(dataValue)
		const dataSync = Object.assign({
			'_': Math.random() * Math.pow(10, 17),
			sign: sign
		}, commonParams, {
			data: dataValue
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				let desc = ''
				if (res.data.code == 0) {
					const group = res.data.topListDetail.data.songInfoList
					group.forEach(song => {
						let singer = '';
						song.singer.forEach((sin, k) => {
							singer += sin.name + (k < song.singer.length ? ' ' : '')
						})
						const item = new Single({
							singleId: song.mid,
							lyricId: song.id,
							title: song.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.pay.pay_play == 1,
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						desc: desc,
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
	 * 获取最新歌曲
	 *
	 **/
	getNewSongList() {
		const dataValue = {
			'comm': {
				'ct': 24
			},
			'new_song': {
				'module': 'newsong.NewSongServer',
				'method': 'get_new_song_info',
				'param': {
					'type': 5
				}
			},
		}
		const sign = Sign(dataValue)
		const dataSync = Object.assign({
			'-': 'recom' + (Math.random() + '').replace('0.', ''),
			sign: sign
		}, commonParams, {
			data: dataValue
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musics.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.new_song.data.songlist
					group.forEach(song => {
						let singer = '';
						song.singer.forEach((sin, k) => {
							singer += sin.name + (k < song.singer.length - 1 ? ' ' : '')
						})
						const item = new Single({
							singleId: song.mid,
							lyricId: song.id,
							title: song.title,
							cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg?max_age=2592000`,
							desc: song.desc,
							singer: singer,
							source: source
						})
						list.push(item)
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
	},
	
	/**
	 * 获取新碟类型
	 *
	 **/
	getNewAlbumType() {
		return new Promise((resolve) => {
			const list = [{
				title: '内地',
				typeId: 1,
				source: source
			},{
				title: '港台',
				typeId: 2,
				source: source
			},{
				title: '欧美',
				typeId: 3,
				source: source
			},{
				title: '韩国',
				typeId: 4,
				source: source
			},{
				title: '日本',
				typeId: 5,
				source: source
			},{
				title: '其他',
				typeId: 6,
				source: source
			}]
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					source: source
				}
			})
		})
	},
	
	/**
	 * 获取最新上架专辑
	 * @param {String} typeId = 类型 
	 * @param {String} page = 请求页数 
	 **/
	getNewAlbumList(data) {
		const dataValue = {
			'comm': {
				'ct': 24
			},
			'new_album': {
				'module': 'newalbum.NewAlbumServer',
				'method': 'get_new_album_info',
				'param': {
					"area": data.typeId,
					"start": (data.page - 1) * 40,
					"sin":0,
					"num": 40
				}
			},
		}
		const sign = Sign(dataValue)
		const dataSync = Object.assign({
			'_': '1636341064564',
			sign: sign
		}, commonParams, {
			data: dataValue
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.new_album.data.albums
					group.forEach(album => {
						let singer = '';
						album.singers.forEach((sin, k) => {
							singer += sin.name + (k < album.singers.length - 1 ? ' / ' : '')
						})
						const item = new Album({
							albumId: album.mid,
							title: album.name,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${album.photo.pic_mid}.jpg?max_age=2592000`,
							creator: singer,
							type: 'newAlbum',
							source: source
						})
						list.push(item)
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
	},
	
	/**
	 * 获取专辑详情
	 * @param {String} id = 专辑ID 
	 **/
	getAlbumDetail(data) {
		const dataValue = {
			'comm': {
				'ct': 24
			},
			'songList': {
				"module":"music.musichallAlbum.AlbumSongList",
				"method":"GetAlbumSongList",
				"param":{
					"albumMid": data.id,
					"albumID":0,
					"begin":0,
					"num":100,
					"order":2,
				}
			}
		}
		const sign = Sign(dataValue)
		const dataSync = Object.assign({
			'_': '1636341064564',
			sign: sign
		}, commonParams, {
			data: dataValue
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.songList.data.songList
					group.forEach(songInfo => {
						const song = songInfo.songInfo
						let singer = '';
						song.singer.forEach((sin, k) => {
							singer += sin.name + (k < song.singer.length - 1 ? ' / ' : '')
						})
						const item = new Single({
							singleId: song.mid,
							lyricId: song.id,
							title: song.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.pay.pay_play == 1,
							source: source
						})
						list.push(item)
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
	},
	
	/**
	 * 获取歌手类型
	 *
	 **/
	getSingerType() {
		return new Promise((resolve) => {
			const list = [{
				title: '内地',
				typeId: '200',
				source: source
			},{
				title: '港台',
				typeId: '2',
				source: source
			},{
				title: '欧美',
				typeId: '5',
				source: source
			},{
				title: '韩国',
				typeId: '3',
				source: source
			},{
				title: '日本',
				typeId: '4',
				source: source
			}]
			resolve({
				code: ERR_OK,
				data: {
					list: list,
					source: source
				}
			})
		})
	},
	
	/**
	 * 获取热门歌手
	 *
	 **/
	getHotSinger() {
		return new Promise((resolve) => {
			this.getSinger({
				area: -100
			}).then((res) => {
				resolve({
					code: res.code,
					data: {
						list: res.data.list.slice(0, 10),
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
	 * 获取歌手
	 * @param {Object} data = {area: 地区} 
	 **/
	getSinger(data) {
		const dataSync = Object.assign({
			'-': 'getUCGI' + Math.random() * Math.pow(10, 17)
		}, commonParams, {
			data: JSON.stringify({"comm":{"ct":24,"cv":0},"singerList":{"module":"Music.SingerListServer","method":"get_singer_list","param":{"area": parseInt(data.area),"sex":-100,"genre":-100,"index":-100,"sin":0,"cur_page":1}}})
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.singerList.data.singerlist
					group.forEach(singer => {
						const item = new Singer({
							singerId: singer.singer_mid,
							title: singer.singer_name,
							cover: singer.singer_pic,
							source: source
						})
						list.push(item)
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
	},
	
	/**
	 * 获取歌手专辑列表
	 * @param {Object} data = {id: 歌手ID} 
	 **/
	getSingerDetail(data) {
		const dataSync = Object.assign({
			'-': 'getSingerSong' + Math.random() * Math.pow(10, 17)
		}, commonParams, {
			data: JSON.stringify({
				"comm":{
					"ct":24,
					"cv":0,
				},
				"singerInfo": {
					"method":"GetSingerDetail",
					"module":"musichall.singer_info_server",
					"param":{
						"singer_mids": [data.id],
						"ex_singer": 1,
						"wiki_singer": 0,
						"group_singer":0,
						"pic": 0,
						"photos":0,
					},
				},
				"singerSongList":{
					"module":"musichall.song_list_server",
					"method":"GetSingerSongList",
					"param":{
						"order":1,
						"singerMid": data.id,
						"begin":0,
						"num":100,
					}
				},
			})
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				let desc = ''
				if (res.data.code == 0) {
					desc = res.data.singerInfo.data.singer_list[0].ex_info.desc
					const group = res.data.singerSongList.data.songList
					group.forEach(song => {
						let singer = '';
						song.songInfo.singer.forEach((sin, k) => {
							singer += sin.name + (k < song.songInfo.singer.length ? ' ' : '')
						})
						const item = new Single({
							singleId: song.songInfo.mid,
							lyricId: song.songInfo.id,
							title: song.songInfo.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.songInfo.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.songInfo.pay.pay_play == 1,
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						desc: desc,
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
	 * 获取歌单类型
	 *
	 **/
	getDiscType(data) {
		const dataValue = {
			"comm": {
				"ct": 24
			},
			"discType": {
				"method": "GetAllTag",
				"module": "music.playlist.PlaylistSquare",
				"param": {}
			}
		}
		const sign = Sign(dataValue)
		const dataSync = Object.assign({
			_: '1635937136254',
			sign: sign
		}, commonParams, {
			data: dataValue
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musics.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.discType.data.v_group
					group.forEach(cat => {
						list.push({
							label: cat.group_name,
							child: cat.v_item.map(sub => {
								return {
									label: sub.name,
									value: sub.id
								}
							})
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
	},
	
	/**
	 * 获取热门歌单
	 *
	 **/
	getHotDiscList() {
		const dataSync = Object.assign({}, commonParams, {
			picmid: 1,
			rnd: 0.660100644751829,
			categoryId: 10000000,
			sortId: 5,
			sin: 0,
			ein: 19
		})
		return new Promise((resolve) => {
			http.get('https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg', {
				params: dataSync,
				headers: {
					referer: 'https://c.y.qq.com',
					host: 'c.y.qq.com',
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.data.list
					group.forEach(top => {
						const item = new Album({
							albumId: top.dissid,
							title: top.dissname,
							cover: top.imgurl,
							num: top.listennum,
							creator: top.creator.name,
							type: 'album',
							source: source
						})
						list.push(item)
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
	},
	
	/**
	 * 获取歌单
	 * @param {Object} data = {参数} 
	 * @param {String} order = {new or hot} 
	 * @param {Number} limit = {请求数量} 
	 * @param {String} cat = {分类} 
	 **/
	getDiscList(data) {
		const dataValue = {
			"comm": {
				"ct": 24
			},
			"playlist": {
				"param": {
					"caller": "0",
					"category_id": data.typeId,
					"size": 100,
					"page": data.page - 1,
					"use_page": 1
				},
				"method": "get_category_content",
				"module": "music.playlist.PlayListCategory"
			}
		}
		const sign = Sign(dataValue)
		const dataSync = Object.assign({
			'-': 'recom' + (Math.random() + '').replace('0.', ''),
			sign: sign
		}, commonParams, {
			data: dataValue
		})
		return new Promise((resolve) => {
			http.get(href + '/cgi-bin/musics.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.playlist.data.content.v_item
					group.forEach(top => {
						const item = new Album({
							albumId: top.basic.tid,
							title: top.basic.title,
							cover: top.basic.cover.small_url,
							desc: top.basic.desc,
							num: top.basic.play_cnt,
							creator: top.basic.creator.nick,
							type: 'album',
							source: source
						})
						list.push(item)
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
	},
	
	/**
	 * 获取歌单详情
	 * @param {String} id = {id: 排行榜ID} 
	 * @param {String} extra = {period: 时间段} 
	 **/
	getDiscDetail(data) {
		const dataSync = Object.assign({}, commonParams, {
			type: 1,
			json: 1,
			utf8: 1,
			onlysong: 0,
			new_format: 1,
			disstid: data.id
		})
		return new Promise((resolve) => {
			http.get('https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg', {
				params: dataSync,
				headers: {
					referer: 'https://c.y.qq.com/',
					host: 'c.y.qq.com',
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.cdlist[0].songlist
					group.forEach(song => {
						let singer = '';
						song.singer.forEach((sin, k) => {
							singer += sin.name + (k < song.singer.length - 1 ? ' ' : '')
						})
						const item = new Single({
							singleId: song.mid,
							lyricId: song.id,
							title: song.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.pay.pay_play == 1,
							source: source
						})
						list.push(item)
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
	},

	/**
	 * 获取播放链接
	 * @param {Object} data = {id: '歌曲Id'} 
	 **/
	getPlayUrl(data) {
		const dataSync = Object.assign({
			'-': 'getplaysongvkey700897959535075'
		}, commonParams, {
			data: JSON.stringify({
				"req": {
					"module": "CDN.SrfCdnDispatchServer",
					"method": "GetCdnDispatch",
					"param": {
						"guid": "7764863790",
						"calltype": 0,
						"userip": ""
					}
				},
				"req_0": {
					"module": "vkey.GetVkeyServer",
					"method": "CgiGetVkey",
					"param": {
						"guid": "7764863790",
						"songmid": [data.id],
						"songtype": [0],
						"uin": "0",
						"loginflag": 1,
						"platform": "20"
					}
				},
				"comm": {
					"uin": 0,
					"format": "json",
					"ct": 24,
					"cv": 0
				}
			})
		})
		return new Promise((resolve, reject) => {
			http.get(href + '/cgi-bin/musicu.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let playUrl = '';
				if (res.data.code == 0) {
					if (res.data.req_0.data.midurlinfo['0'].purl) {
						playUrl = res.data.req_0.data.midurlinfo['0'].purl ? res.data.req_0.data.sip[
							1] + res.data.req_0.data.midurlinfo['0'].purl : '';
					}
				}
				resolve({
					code: ERR_OK,
					data: {
						src: playUrl,
						source: source
					}
				})

			}).catch((err) => {
				reject({
					code: ERR_FALSE,
					data: {
						src: '',
						source: source
					}
				})
			})
		})
	},

	/**
	 * 获取歌词
	 * @param {Object} data = {id: '歌词id'} 
	 **/
	getLyric(data) {
		const dataSync = Object.assign({}, commonParams, {
			'-': 'jsonp1',
			nobase64: 1,
			musicid: data.id
		})
		return new Promise((resolve, reject) => {
			http.get('https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_yqq.fcg', {
				params: dataSync,
				headers: {
					referer: 'https://c.y.qq.com',
					host: 'c.y.qq.com',
				}
			}).then((res) => {
				let lyrics = [];
				if (res.data.code == 0) {
					let arr = htmlDecodeByRegExp(res.data.lyric).split('&#10;');
					for (let i in arr) {
						if (i >= 5) {
							let time = arr[i].match(/\[(\S*)\]/) ? arr[i].match(/\[(\S*)\]/)[0] : '';
							let title = arr[i].split(']')[1];
							if (title && time) {
								lyrics.push({
									time: time2seconds(time.substring(1, time.length - 1)),
									title: title
								})
							}
						}
					}
				}
				resolve({
					code: ERR_OK,
					data: {
						lyric: lyrics,
						source: source
					}
				})
			}).catch((err) => {
				reject({
					code: ERR_FALSE,
					data: {
						lyric: [],
						source: source
					}
				})
			})
		})
	},
	source: source
}
