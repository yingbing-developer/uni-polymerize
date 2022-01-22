// QQ音乐

import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import Comment from '@/assets/constructor/comment.js'
import Song from '@/assets/constructor/song.js'
import Album from '@/assets/constructor/album.js'
import Singer from '@/assets/constructor/singer.js'
import Sign from '@/assets/other/qqSign.js'
import { getHref, htmlDecodeByRegExp } from '@/assets/api/global.js'

const { MUSICURL, ERR_OK, ERR_FALSE } = Config
const { dateFormat, time2seconds } = Utils;

const source = 'qqmusic';

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

export default {
/**
* @event {Function()} search 
* @author yingbing
* @description 搜索
* @param {String} keyword = [搜索关键词] 
* @param {Number} page = [搜索页数] 
* @return {Object}
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
						const item = new Song({
							songId: song.songmid,
							lyricId: song.songid,
							commentId: song.songid,
							title: song.songname,
							cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.albummid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.pay.payplay == 1,
							extra: {
								bizType: 1
							},
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
							isLastPage: list.length < 20,
							currentPage: data.page[source],
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
						isLastPage: false,
						currentPage: data.page[source] - 1,
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getHotKeyword 
* @author yingbing
* @description 获取热门搜索关键词
* @return {Object}
**/
	getHotKeyword() {
		const href = getHref(source)
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
* @event {Function()} getRecom 
* @author yingbing
* @description 获取热门推荐
* @return {Object}
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
			newArr.push(this.getBannerList());
			newArr.push(this.getHotSinger());
			newArr.push(this.getToplist());
			newArr.push(this.getHotDiscList());
			Promise.all(newArr).then((ress) => {
				ress.forEach(res => {
					if ( res.code == ERR_OK ) {
						switch (res.data.module) {
							case 'BANNER':
								recome.banners = res.data.list
								break;
							case 'HOT_SINGER':
								recome.hotSinger = res.data.list
								break;
							case 'TOP':
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
* @event {Function()} getBannerList 
* @author yingbing
* @description 获取轮播图列表
* @return {Object}
**/
	getBannerList() {
		const href = getHref(source)
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
							commentId: top.id,
							title: top.title,
							cover: top.pic_info.url,
							type: 'banner',
							extra: {
								bizType: 2
							},
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						module: 'BANNER',
						source: source
					}
				})

			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						module: 'BANNER',
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getBannerDetail 
* @author yingbing
* @description 获取轮播详情
* @param {String} id = [轮播id] 
* @return {Object}
**/
	getBannerDetail(data) {
		const href = getHref(source)
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
						const item = new Song({
							songId: song.songInfo.mid,
							lyricId: song.songInfo.id,
							commentId: song.songInfo.id,
							title: song.songInfo.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.songInfo.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.songInfo.pay.pay_play == 1,
							extra: {
								bizType: 1
							},
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
* @event {Function()} getToplist 
* @author yingbing
* @description 获取排行榜
* @return {Object}
**/
	getToplist() {
		const href = getHref(source)
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
								commentId: top.topId,
								title: top.musichallTitle,
								cover: top.frontPicUrl,
								desc: top.intro?.replace(/<br>/g, '\n') || '',
								extra: {
									period: top.period,
									recType: top.recType,
									bizType: 4
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
						module: 'TOP',
						source: source
					}
				})

			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						module: 'TOP',
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getTopDetail 
* @author yingbing
* @description 获取排行榜详情
* @param {String} id = [排行榜id] 
* @param {Object} extra = [period: 时间段] 
* @return {Object}
**/
	getTopDetail(data) {
		const href = getHref(source)
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
						const item = new Song({
							songId: song.mid,
							lyricId: song.id,
							commentId: song.id,
							title: song.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.pay.pay_play == 1,
							extra: {
								bizType: 1
							},
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
* @event {Function()} getNewSongList 
* @author yingbing
* @description 获取最新歌曲
* @return {Object}
**/
	getNewSongList() {
		const href = getHref(source)
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
						const item = new Song({
							songId: song.mid,
							lyricId: song.id,
							commentId: song.id,
							title: song.title,
							cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg?max_age=2592000`,
							desc: song.desc,
							singer: singer,
							payplay: song.pay.pay_play == 1,
							extra: {
								bizType: 1
							},
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
* @event {Function()} getNewAlbumType 
* @author yingbing
* @description 获取新碟类型
* @return {Object}
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
* @event {Function()} getNewAlbumList 
* @author yingbing
* @description 获取上架新碟
* @param {String} typeId = [分类id] 
* @param {Number} page = [请求当前页] 
* @return {Object}
**/
	getNewAlbumList(data) {
		const href = getHref(source)
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
							commentId: album.id,
							title: album.name,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${album.photo.pic_mid}.jpg?max_age=2592000`,
							creator: singer,
							type: 'newAlbum',
							extra: {
								bizType: 2
							},
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: list.length < 40,
						currentPage: data.page,
						source: source
					}
				})
	
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						isLastPage: false,
						currentPage: data.page - 1,
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getAlbumDetail 
* @author yingbing
* @description 获取专辑详情
* @param {String} id = [专辑id] 
* @return {Object}
**/
	getAlbumDetail(data) {
		const href = getHref(source)
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
						const item = new Song({
							songId: song.mid,
							lyricId: song.id,
							commentId: song.id,
							title: song.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.pay.pay_play == 1,
							extra: {
								bizType: 1
							},
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
* @event {Function()} getSingerType 
* @author yingbing
* @description 获取歌手类型
* @return {Object}
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
* @event {Function()} getHotSinger 
* @author yingbing
* @description 获取热门歌手
* @return {Object}
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
						module: 'HOT_SINGER',
						source: source
					}
				})
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						module: 'HOT_SINGER',
						source: source
					}
				})
			})
		})
	},

/**
* @event {Function()} getSinger 
* @author yingbing
* @description 获取歌手
* @param {String} area = [地区] 
* @return {Object}
**/
	getSinger(data) {
		const href = getHref(source)
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
* @event {Function()} getSingerDetail 
* @author yingbing
* @description 获取歌手详情
* @param {String} id = [歌手id] 
* @return {Object}
**/
	getSingerDetail(data) {
		const href = getHref(source)
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
						const item = new Song({
							songId: song.songInfo.mid,
							lyricId: song.songInfo.id,
							commentId: song.songInfo.id,
							title: song.songInfo.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.songInfo.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.songInfo.pay.pay_play == 1,
							extra: {
								bizType: 1
							},
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
* @event {Function()} getDiscType 
* @author yingbing
* @description 获取歌单分类
* @return {Object}
**/
	getDiscType(data) {
		const href = getHref(source)
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
* @event {Function()} getHotDiscList 
* @author yingbing
* @description 获取热门歌单
* @return {Object}
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
							commentId: top.dissid,
							title: top.dissname,
							cover: top.imgurl,
							playnum: top.listennum,
							creator: top.creator.name,
							type: 'album',
							extra: {
								bizType: 3
							},
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						module: 'HOT_DISC',
						source: source
					}
				})
	
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						module: 'HOT_DISC',
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getDiscList 
* @author yingbing
* @description 获取歌单
* @param {String} order = [排序] 
* @param {String} typeId = [分类id] 
* @param {Number} page = [请求当前页] 
* @return {Object}
**/
	getDiscList(data) {
		const href = getHref(source)
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
							commentId: top.basic.tid,
							title: top.basic.title,
							cover: top.basic.cover.small_url,
							desc: top.basic.desc,
							playnum: top.basic.play_cnt,
							creator: top.basic.creator.nick,
							type: 'album',
							extra: {
								bizType: 3
							},
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: true,
						currentPage: data.page,
						source: source
					}
				})
	
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						isLastPage: false,
						currentPage: data.page - 1,
						source: source
					}
				})
			})
		})
	},
	
/**
* @event {Function()} getDiscDetail 
* @author yingbing
* @description 获取歌单详情
* @param {String} id = [歌单id] 
* @return {Object}
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
						const item = new Song({
							songId: song.mid,
							lyricId: song.id,
							commentId: song.id,
							title: song.title,
							cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.album.pmid}.jpg?max_age=2592000`,
							singer: singer,
							payplay: song.pay.pay_play == 1,
							extra: {
								bizType: 1
							},
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
* @event {Function()} getPlayUrl 
* @author yingbing
* @description 获取播放链接
* @param {String} id = [音乐id] 
* @return {Object}
**/
	getPlayUrl(data) {
		const href = getHref(source)
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
* @event {Function()} getLyric 
* @author yingbing
* @description 获取歌词
* @param {String} id = [歌词id] 
* @return {Object}
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
	
/**
* @event {Function()} getComment 
* @author yingbing
* @description 获取评论列表
* @param {String} id = [评论id] 
* @param {String} page = [请求当前页] 
* @return {Object}
**/
	getComment(data) {
		const href = getHref(source)
		const dataValue = {
			"comm": {
				"ct": 24
			},
			"comments": {
				"module":"music.globalComment.CommentReadServer",
				"method":"GetNewCommentList",
				"param":{
					"BizType": data.extra.bizType,
					"BizId": data.id.toString(),
					"LastCommentSeqNo": data.extra.seqNo || '',
					"PageSize": 25,
					"PageNum": data.page - 1,
					"FromCommentId":"",
					"WithHot": 0,
				}
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
			http.get(href + '/cgi-bin/musics.fcg', {
				params: dataSync,
				headers: {
					referer: href,
					host: href.replace('https://', ''),
				}
			}).then((res) => {
				let list = []
				if (res.data.code == 0) {
					const group = res.data.comments.data.CommentList.Comments
					group.forEach(comment => {
						const subComments = comment.SubComments || []
						let subComment = []
						subComments.forEach(sub => {
							subComment.push(
								new Comment({
									id: sub.SeqNo,
									avatar: sub.Avatar,
									title: sub.Nick,
									subtitle: dateFormat(sub.PubTime * 1000),
									content: sub.Content
								})
							)
						})
						const item = new Comment({
							id: comment.SeqNo,
							avatar: comment.Avatar,
							title: comment.Nick,
							subtitle: dateFormat(comment.PubTime * 1000),
							subComment: subComment,
							content: comment.Content,
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: list.length < 25,
						currentPage: data.page,
						source: source
					}
				})
	
			}).catch((err) => {
				resolve({
					code: ERR_FALSE,
					data: {
						list: [],
						isLastPage: false,
						currentPage: data.page - 1,
						source: source
					}
				})
			})
		})
	},
	source: source
}
