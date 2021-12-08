// 网易云音乐

import http from '@/plugins/request/index.js'
import Config from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import { Single, Album, Singer } from '@/assets/constructor/music.js'
import Comment from '@/assets/constructor/comment.js'
import Asrsea from '@/assets/other/asrsea.js'

const { MUSICURL, ERR_OK, ERR_FALSE } = Config
const { time2seconds, dateFormat } = Utils;

const source = '163music';
const href = MUSICURL[source].href;

export default {
	/**
	 * 搜索
	 * @param {Object} data = {keyword: '搜索关键词', page: '搜索页数'} 
	 **/
	search (data) {
		let arr = [this.searchSong(data)]
		if ( data.page[source] <= 1 ) {
			arr.push(this.multimatch(data))
		}
		return new Promise((resolve) => {
			Promise.all(arr).then((ress) => {
				let list = []
				ress.forEach((res) => {
					if ( res.code == ERR_OK ) {
						list = res.data.list.concat(list)
					}
				})
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: ress[0].data.list.length < 20,
						currentPage: data.page[source],
						source: source
					}
				})
			})
		})
	},
	
	/**
	 * 搜索音乐列表
	 * @param {Object} data = {keyword: '搜索关键词', page: '搜索页数'} 
	 **/
	searchSong (data) {
		const dataValue = Asrsea({"s":data.keyword,"limit":20,"offset":(data.page[source] - 1) * 20,"type":1,"strategy":5,"queryCorrect":true}, "xNQjoijbLvYRFhCF")
		return new Promise((resolve) => {
			http.post('https://interface.music.163.com/weapi/search/get', {
				params: {
					params: dataValue,
					encSecKey: "b4817de5baa70f1add165575040d354df276f10747ee29231e20eff099db2a5556f15de01fdb7899a12ef1c1cfd27eff07fd12ed2ded945825807488459ad381d80388b566a9c4cf32b0a3d056c82251b3199c2d1d4cf2c3b158fff1af91ffd2350c173286c26d323c7c339ed2610e2772106ae4c0927355e30da796c1240a91"
				},
				headers: {
					referer: 'https://y.music.163.com',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).then((res) => {
				let list = [];
				if ( res.data.code == 200 ) {
					res.data.result.songs.forEach(song => {
						let singer = '';
						song.ar.forEach((sin, k) => {
							singer += sin.name + (k < song.ar.length - 1 ? ' ' : '')
						})
						const item = new Single({
							singleId: song.id,
							commentId: 'R_SO_4_' + song.id,
							lyricId: song.id,
							title: song.name,
							cover: song.al.picUrl,
							singer: singer || '未知歌手',
							payplay: song.fee != 8 && song.fee != 0,
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
	 * 多重匹配
	 * @param {Object} data = {keyword: '搜索关键词'} 
	 **/
	 multimatch (data) {
		 const dataSync = {
		 	keywords: data.keyword
		 }
		 return new Promise((resolve) => {
		 	http.get(href + '/search/multimatch', {
		 		params: dataSync
		 	}).then((res) => {
		 		let artists = res.data.result.artist;
		 		let list = [];
		 		if ( res.data.code == 200 ) {
		 			artists.forEach(artist => {
		 				const item = new Singer({
		 					singerId: artist.id,
		 					title: artist.name,
		 					cover: artist.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
		 					albumSize: artist.albumSize,
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
	 },
	
	/**
	 * 获取热门搜索关键词
	 *
	 **/
	getHotKeyword () {
		return new Promise((resolve) => {
			http.get(href + '/search/hot').then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.result.hots.forEach(hot => {
						list.push(hot.first)
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
	getBannerList () {
		return new Promise((resolve) => {
			http.get(href + '/banner', {
				params: {
					type: 1
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.banners.forEach(top => {
						let item = ''
						if ( top.targetType == 1000 ) {
							item = new Album({
								albumId: top.targetId,
								title: top.typeTitle,
								cover: top.pic,
								type: 'album',
								source: source
							})
						}
						if ( top.targetType == 1 ) {
							const song = top.song
							let singer = '';
							song.ar.forEach((sin, k) => {
								singer += sin.name + (k < song.ar.length ? ' ' : '')
							})
							const single = new Single({
								singleId: song.id,
								commentId: 'R_SO_4_' + song.id,
								lyricId: song.id,
								title: song.name,
								cover: song.al.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
								singer: singer || '未知歌手',
								source: source
							})
							item = new Album({
								albumId: top.targetId,
								title: top.typeTitle,
								cover: top.pic,
								song: [single],
								type: 'newAlbum',
								source: source
							})
						}
						item ? list.push(item) : null
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
	getToplist () {
		return new Promise((resolve) => {
			http.get(href + '/toplist').then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.list.forEach(top => {
						const item = new Album({
							albumId: top.id,
							commentId: 'A_PL_0_' + top.id,
							title: top.name,
							cover: top.coverImgUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							desc: top.description?.replace(/<br>/g, '') || '',
							type: 'top',
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
	 * 获取排行榜详情
	 * @param {Object} data = {id: 排行榜id} 
	 **/
	getTopDetail (data) {
		return new Promise((resolve) => {
			this.getDiscDetail({
				id: data.id
			}).then((res) => {
				resolve({
					code: res.code,
					data: {
						list: res.data.list,
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
	getNewSongList () {
		return new Promise((resolve) => {
			http.get(href + '/top/song', {
				params: {
					type: 0
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.data.forEach(song => {
						let singer = '';
						song.artists.forEach((sin, k) => {
							singer += sin.name + (k < song.artists.length ? ' ' : '')
						})
						const item = new Single({
							singleId: song.id,
							commentId: 'R_SO_4_' + song.id,
							lyricId: song.id,
							title: song.name,
							cover: song.album.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							singer: singer || '未知歌手',
							payplay: song.fee != 8 && song.fee != 0,
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
				title: '全部',
				typeId: 'ALL',
				source: source
			},{
				title: '华语',
				typeId: 'ZH',
				source: source
			},{
				title: '欧美',
				typeId: 'EA',
				source: source
			},{
				title: '韩国',
				typeId: 'KR',
				source: source
			},{
				title: '日本',
				typeId: 'JP',
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
	 * 获取上架新碟
	 * 
	 **/
	getNewAlbumList (data) {
		return new Promise((resolve) => {
			http.get(href + '/album/new', {
				params: {
					limit: 40,
					offset: (data.page - 1) * 40,
					area: data.typeId
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.albums.forEach(album => {
						let singer = '';
						album.artists.forEach((sin, k) => {
							singer += sin.name + (k < album.artists.length - 1 ? ' / ' : '')
						})
						const item = new Album({
							albumId: album.id,
							commentId: 'R_AL_3_' + album.id,
							title: album.name,
							cover: album.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
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
	 * 获取专辑详情
	 * @param {Object} data = {id: 专辑id} 
	 **/
	getAlbumDetail (data) {
		const dataValue = Asrsea({}, "GGUrx9xMnkNBwqd7")
		return new Promise((resolve) => {
			http.post('https://interface.music.163.com/weapi/v1/album/' + data.id, {
				params: {
					params: dataValue,
					encSecKey: "3b7bf6bd5eef5ccd3923e0ac08584032a0293d77c16d67c0c80e1c7b354525a68354e92fa50ec85efb65ac3f4ae1dce383fec67fff1d51be9d5b9b606136b97f563eccbcbb14d20616a68e45edcd75704c1b40f4a13bb985b66fdae8da4c5b0e78e71b535a772a7baaa685e64dc8cce7203762d7b646bbea06fde702f1480939"
				},
				headers: {
					referer: 'https://y.music.163.com',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.songs.forEach(song => {
						let singer = '';
						song.ar.forEach((sin, k) => {
							singer += sin.name + (k < song.ar.length ? ' ' : '')
						})
						const item = new Single({
							singleId: song.id,
							lyricId: song.id,
							commentId: 'R_SO_4_' + song.id,
							title: song.name,
							cover: song.al.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							singer: singer,
							payplay: song.fee != 8 && song.fee != 0,
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
				title: '华语',
				typeId: '7',
				source: source
			},{
				title: '欧美',
				typeId: '96',
				source: source
			},{
				title: '韩国',
				typeId: '16',
				source: source
			},{
				title: '日本',
				typeId: '8',
				source: source
			},{
				title: '其它',
				typeId: '0',
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
	getHotSinger () {
		return new Promise((resolve) => {
			http.get(href + '/top/artists', {
				params: {
					limit: 10
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.artists.forEach(singer => {
						const item = new Singer({
							singerId: singer.id,
							title: singer.name,
							cover: singer.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
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
	 * 获取歌手
	 * @param {Object} data = {area: 地区} 
	 **/
	getSinger (data) {
		return new Promise((resolve) => {
			http.get(href + '/artist/list', {
				params: {
					limit: 80,
					initial: -1,
					type: -1,
					area: data.area
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.artists.forEach(singer => {
						const item = new Singer({
							singerId: singer.id,
							title: singer.name,
							cover: singer.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
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
	 * 获取歌手详情
	 * @param {Object} data = {area: 地区} 
	 **/
	getSingerDetail (data) {
		return new Promise((resolve) => {
			http.get(href + '/artists', {
				params: {
					id: data.id
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.hotSongs.forEach(song => {
						let singer = '';
						song.ar.forEach((sin, k) => {
							singer += sin.name + (k < song.ar.length ? ' ' : '')
						})
						const item = new Single({
							singleId: song.id,
							lyricId: song.id,
							commentId: 'R_SO_4_' + song.id,
							title: song.name,
							cover: song.al.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							singer: singer,
							payplay: song.fee != 8 && song.fee != 0,
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						desc: res.data.artist.briefDesc,
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
	 * 获取歌单分类
	 *
	 **/
	getDiscType (data) {
		return new Promise((resolve) => {
			http.get(href + '/playlist/catlist').then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					const categories = res.data.categories
					const subs = res.data.sub
					Object.keys(categories).forEach(key => {
						const arr = subs.filter(sub => sub.category == key)
						list.push({
							label: categories[key],
							child: arr.map(sub => {
								return {
									label: sub.name,
									value: sub.name
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
	getHotDiscList () {
		return new Promise((resolve) => {
			this.getDiscList({
				order: 'hot',
				cat: '全部',
				page: 1,
				limit: 15
			}).then((res) => {
				resolve({
					code: res.code,
					data: {
						list: res.data.list,
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
	getDiscList (data) {
		const limit = data.limit || 50
		return new Promise((resolve) => {
			http.get(href + '/top/playlist', {
				params: {
					order: data.order || 'hot',
					limit: limit,
					cat: data.typeId,
					offset: ( data.page - 1 ) * limit
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.playlists.forEach(top => {
						const item = new Album({
							albumId: top.id,
							commentId: 'A_PL_0_' + top.id,
							title: top.name,
							cover: top.coverImgUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							desc: top.description,
							num: top.playCount,
							creator: top.creator.nickname,
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
						isLastPage: list.length < data.limit,
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
	 * 获取歌单详情
	 * @param {Object} data = {id: 歌单id} 
	 **/
	getDiscDetail (data) {
		const dataValue = Asrsea({"id": data.id,"n":1000,"shareUserId":0}, "avNrNiiiQqgFTkg3")
		return new Promise((resolve) => {
			http.post('https://interface.music.163.com/weapi/v6/playlist/detail', {
				params: {
					params: dataValue,
					encSecKey: "aca49f84485cfa76dc80e13bc10be021a42559a8fec9839c01d873db7e615bf7fbeebbdd47f9f76dd94fda8afce2d3fa5ff91208a8d75a182229d8f6d8ace52163e1cd095e9db8d04e7804898e0a12a6767916fbc3af2976624af9eb71dd259a4977f471c41468a904b54a7aae75f7ff0090d3a852959e2b9424e6bc70843b36"
				},
				headers: {
					referer: 'https://y.music.163.com',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.playlist.tracks.forEach(song => {
						let singer = '';
						song.ar.forEach((sin, k) => {
							singer += sin.name + (k < song.ar.length ? ' ' : '')
						})
						const item = new Single({
							singleId: song.id,
							lyricId: song.id,
							commentId: 'R_SO_4_' + song.id,
							title: song.al.name,
							cover: song.al.picUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							singer: singer,
							payplay: song.fee != 8 && song.fee != 0,
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
	 * @param {Object} data = {id: '音乐ID'} 
	 **/
	getPlayUrl (data) {
		const dataSync = {
			id: data.id
		}
		return new Promise((resolve, reject) => {
			http.get(href + '/song/url', {
				params: dataSync
			}).then((res) => {
				let playUrl = ''
				if ( res.data.code == 200 ) {
					playUrl = res.data.data[0].url || '';
				} else {
					playUrl = `https://music.163.com/song/media/outer/url?id=${data.id}.mp3`
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
	 * @param {Object} data = {id: '歌词ID'} 
	 **/
	getLyric (data) {
		const dataSync = {
			id: data.id
		}
		return new Promise((resolve, reject) => {
			http.get(href + '/lyric', {
				params: dataSync
			}).then((res) => {
				let lyrics = [];
				if ( res.data.code == 200 ) {
					let arr = res.data.lrc.lyric.split('\n');
					for ( let i in arr ) {
						let time = arr[i].match(/\[(\S*)\]/) ? arr[i].match(/\[(\S*)\]/)[0] : '';
						let title = arr[i].split(']')[1];
						if ( title && time ) {
							lyrics.push({
								time: time2seconds(time.substring(1, time.length-1)),
								title: title
							})
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
	 * 获取评论列表
	 * @param {Object} data = {id: 歌单id} 
	 **/
	getComment (data) {
		const dataValue = Asrsea({"rid":data.id,"threadId":data.id,"pageNo": data.page,"pageSize":"20","cursor":"1638966725671","offset": (data.page - 1 ) * 20,"orderType":"1","csrf_token":""}, "1yhgKF2pMaAlYNcX")
		return new Promise((resolve) => {
			http.post('https://music.163.com/weapi/comment/resource/comments/get?csrf_token=', {
				params: {
					params: dataValue,
					encSecKey: "a27eb3deda2cf5a473ffb868f29cf1b33693e0fa234d739e998d7481537b5482e21e190943cde4ba814253ad3ff0ee3a80842ecf45c1b091b9077908f2a394ef713991f35f2721663c55ee53a6cf0647776bf825823ac116cde4dee9c47f06c935c59b96bfb99041de4e32d109c650fb3dd24c15eab5d3ce194a6f1e47ae10db"
				},
				headers: {
					referer: 'https://y.music.163.com',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).then((res) => {
				let list = []
				if ( res.data.code == 200 ) {
					res.data.data.comments.forEach(comment => {
						const subComments = comment.beReplied || []
						let subComment = []
						subComments.forEach(sub => {
							subComment.push(
								new Comment({
									id: sub.beRepliedCommentId,
									avatar: sub.user.avatarUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
									title: sub.user.nickname,
									subtitle: dateFormat(comment.time),
									content: sub.content
								})
							)
						})
						const item = new Comment({
							id: comment.commentId,
							avatar: comment.user.avatarUrl + '?imageView&thumbnail=360y360&quality=75&tostatic=0',
							title: comment.user.nickname,
							subtitle: dateFormat(comment.time),
							subComment: subComment,
							content: comment.content,
							source: source
						})
						list.push(item)
					})
				}
				resolve({
					code: ERR_OK,
					data: {
						list: list,
						isLastPage: list.length < 20,
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