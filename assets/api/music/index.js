import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config  from '@/assets/js/config.js'
import api from './api.js'

const { getters } = Store;
const { MUSICURL } = Config;

export default {
	//搜索音乐列表
	search (data) {
		let newArr = [];
		Object.keys(api).forEach(key => {
			const sources = getters['source/get'];
			const adult = getters['app/getAdult'];
			let index = sources.findIndex(source => source.id == key)
			if ( index == -1 || (index > -1 && sources[index].key > -1) ) {
				if ( !data.isLastPage[key] && (!MUSICURL[key].isAdult || adult) && MUSICURL[key].search ) {
					newArr.push(api[key].search(data));
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取热门搜索关键词
	getHotKeyword () {
		let newArr = [];
		Object.keys(api).forEach(key => {
			const sources = getters['source/get'];
			const adult = getters['app/getAdult'];
			let index = sources.findIndex(source => source.id == key)
			if ( index == -1 || (index > -1 && sources[index].key > -1) ) {
				if ( (!MUSICURL[key].isAdult || adult) && MUSICURL[key].hotKey ) {
					newArr.push(api[key].getHotKeyword());
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取热门推荐
	getRecom () {
		let newArr = [];
		Object.keys(api).forEach(key => {
			const sources = getters['source/get'];
			const adult = getters['app/getAdult'];
			let index = sources.findIndex(source => source.id == key)
			if ( index == -1 || (index > -1 && sources[index].key > -1) ) {
				if ( (!MUSICURL[key].isAdult || adult) && MUSICURL[key].recome ) {
					newArr.push(api[key].getRecom());
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取轮播图列表
	getBannerList () {
		return api[data.source].getBannerList()
	},
	//获取轮播图详情
	getBannerDetail (data) {
		return api[data.source].getBannerDetail(data)
	},
	
	//获取排行榜列表
	getToplist (data) {
		return api[data.source].getToplist()
	},
	//获取排行榜详情
	getTopDetail (data) {
		return api[data.source].getTopDetail(data)
	},
	
	//获取歌单类型
	getDiscType (data) {
		return api[data.source].getDiscType()
	},
	
	//获取热门歌单
	getHotDiscList (data) {
		return api[data.source].getHotDiscList()
	},
	//获取歌单
	getDiscList (data) {
		return api[data.source].getDiscList(data)
	},
	//获取歌单详情
	getDiscDetail (data) {
		return api[data.source].getDiscDetail(data)
	},
	//获取新发单曲
	getNewSongList (data) {
		return api[data.source].getNewSongList()
	},
	//获取专辑类型
	getNewAlbumType (data) {
		return api[data.source].getNewAlbumType()
	},
	//获取最新上架专辑
	getNewAlbumList (data) {
		return api[data.source].getNewAlbumList(data)
	},
	//获取专辑详情
	getAlbumDetail (data) {
		return api[data.source].getAlbumDetail(data)
	},
	//获取热门歌手
	getHotSinger (data) {
		return api[data.source].getHotSinger()
	},
	
	//获取歌手类型
	getSingerType (data) {
		return api[data.source].getSingerType()
	},
	
	//获取分类歌手
	getSinger (data) {
		return api[data.source].getSinger(data)
	},
	
	//获取歌手详情
	getSingerDetail (data) {
		return api[data.source].getSingerDetail(data)
	},
	
	//获取音乐播放链接列表
	getPlayUrl (data) {
		return api[data.source].getPlayUrl()
	},
	
	//获取音乐歌词
	getLyric (data) {
		return api[data.source].getLyric()
	},
	//获取评论
	getComment (data) {
		return api[data.source].getComment(data)
	}
}