import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config  from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import http from '@/plugins/request/index.js'
import xhr from '@/plugins/xhr/index.js'
import Song from '@/assets/constructor/song.js'
import Album from '@/assets/constructor/album.js'
import Singer from '@/assets/constructor/singer.js'
import Comment from '@/assets/constructor/comment.js'
import qqSign from '@/assets/other/qqSign.js'
import Asrsea from '@/assets/other/asrsea.js'
import { replaceHTML, htmlDecodeByRegExp, getTag } from '@/assets/api/global.js'

const { getters } = Store;
const { ERR_OK, ERR_FALSE } = Config;
const { dateFormat, time2seconds } = Utils;
const qqmusicCommonParams = {
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
const context = {
	xhr: xhr,
	http: http,
	Song: Song,
	Album: Album,
	Singer: Singer,
	Comment: Comment,
	ERR_OK: ERR_OK,
	ERR_FALSE: ERR_FALSE,
	replaceHTML: replaceHTML,
	htmlDecodeByRegExp: htmlDecodeByRegExp,
	getTag: getTag,
	dateFormat: dateFormat,
	time2seconds: time2seconds,
	qqmusicCommonParams,
	qqSign,
	Asrsea
}

export default {
	//搜索音乐列表
	search (data) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.search?.value && (source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.search.value + ")")
					newArr.push(handle(context, data))
				}catch(e){
					newArr.push(
						Promise.resolve({
							code: ERR_FALSE,
							data: null
						})
					)
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取热门搜索关键词
	getHotKeyword (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getHotKeyword?.value && (source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getHotKeyword.value + ")")
					newArr.push(handle(context, data))
				}catch(e){
					newArr.push(
						Promise.resolve({
							code: ERR_FALSE,
							data: null
						})
					)
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取热门推荐
	getRecom (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( (source.isAdult || adult) && source.isOpen ) {
				let https = []
				data.baseUrl = source.href
				data.source = source.id
				if ( source.request.getBannerList?.value ) {
					try{
						let handle = eval("(" + source.request.getBannerList.value + ")")
						https.push(handle(context, data))
					}catch(e){
						https.push(
							Promise.resolve({
								code: ERR_FALSE,
								data: null
							})
						)
					}
				}
				if ( source.request.getTopList?.value ) {
					try{
						let handle = eval("(" + source.request.getTopList.value + ")")
						https.push(handle(context, data))
					}catch(e){
						https.push(
							Promise.resolve({
								code: ERR_FALSE,
								data: null
							})
						)
					}
				}
				if ( source.request.getHotAlbumList?.value ) {
					try{
						let handle = eval("(" + source.request.getHotAlbumList.value + ")")
						https.push(handle(context, data))
					}catch(e){
						https.push(
							Promise.resolve({
								code: ERR_FALSE,
								data: null
							})
						)
					}
				}
				if ( source.request.getHotSingerList?.value ) {
					try{
						let handle = eval("(" + source.request.getHotSingerList.value + ")")
						https.push(handle(context, data))
					}catch(e){
						https.push(
							Promise.resolve({
								code: ERR_FALSE,
								data: null
							})
						)
					}
				}
				newArr.push(
					new Promise(resolve => {
						let hotSingers = []
						let hotAlbums = []
						let hotTops = []
						let banners = []
						Promise.all(https).then((ress) => {
							ress.forEach(res => {
								if ( res.code == ERR_OK ) {
									switch (res.data.module) {
										case 'BANNER':
											banners = res.data.list
											break;
										case 'HOT_SINGER':
											hotSingers = res.data.list
											break;
										case 'TOP':
											hotTops = res.data.list
											break;
										default:
											hotAlbums = res.data.list
									}
								}
							})
							resolve({
								code: ERR_OK,
								data: {
									banners: banners,
									hotSingers: hotSingers,
									hotTops: hotTops,
									hotAlbums: hotAlbums,
									source: ress[0].data.source
								}
							})
						}).catch(() => {
							resolve({
								code: ERR_FALSE,
								data: {
									banners: [],
									hotSinger: [],
									hotTops: [],
									hotAlbums: [],
									source: ress[0].data.source
								}
							})
						})
					})
				)
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	//获取轮播图详情
	getBannerDetail (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getBannerDetail.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取排行榜详情
	getTopDetail (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getTopDetail.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取新发单曲
	getNewSongList (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getNewSongList?.value && (source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getNewSongList.value + ")")
					newArr.push(handle(context, data))
				}catch(e){
					newArr.push(
						Promise.resolve({
							code: ERR_FALSE,
							data: null
						})
					)
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	//获取新碟分类
	getNewAlbumType (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getNewAlbumType?.value && (source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getNewAlbumType.value + ")")
					newArr.push(handle(context, data))
				}catch(e){
					newArr.push(
						Promise.resolve({
							code: ERR_FALSE,
							data: null
						})
					)
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	//获取分类详情
	getNewAlbumList (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getNewAlbumList.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取新碟详情
	getNewAlbumDetail (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getNewAlbumDetail.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取热门歌手
	getHotSingerList (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getHotSingerList?.value && (source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getHotSingerList.value + ")")
					newArr.push(handle(context, data))
				}catch(e){
					newArr.push(
						Promise.resolve({
							code: ERR_FALSE,
							data: null
						})
					)
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	//获取歌手分类
	getSingerType (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getSingerType?.value && (source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getSingerType.value + ")")
					newArr.push(handle(context, data))
				}catch(e){
					newArr.push(
						Promise.resolve({
							code: ERR_FALSE,
							data: null
						})
					)
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	//获取歌手列表
	getSingerList (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getSingerList.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取歌手详情
	getSingerDetail (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getSingerDetail.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取热门歌单列表
	getHotAlbumList (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getHotAlbumList?.value && (source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getHotAlbumList.value + ")")
					newArr.push(handle(context, data))
				}catch(e){
					newArr.push(
						Promise.resolve({
							code: ERR_FALSE,
							data: null
						})
					)
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	//获取歌单分类
	getAlbumType (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'music');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getAlbumType?.value && (source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getAlbumType.value + ")")
					newArr.push(handle(context, data))
				}catch(e){
					newArr.push(
						Promise.resolve({
							code: ERR_FALSE,
							data: null
						})
					)
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	getAlbumList (data ={}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getAlbumList.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	getAlbumDetail (data ={}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getAlbumDetail.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取播放链接
	getPlayUrl (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getPlayUrl.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取歌词
	getLyric (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getLyric.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取评论
	getComment (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getComment.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
}