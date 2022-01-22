import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config  from '@/assets/js/config.js'
import api from './api.js'

const { getters } = Store;
const { BOOKURL } = Config;

export default {
	//搜索音乐列表
	search (data) {
		let newArr = [];
		Object.keys(api).forEach(key => {
			const sources = getters['source/get'];
			const adult = getters['app/getAdult'];
			let index = sources.findIndex(source => source.id == key)
			if ( index == -1 || (index > -1 && sources[index].key > -1) ) {
				if ( !data.isLastPage[key] && (!BOOKURL[key].isAdult || adult) && BOOKURL[key].search ) {
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
				if ( (!BOOKURL[key].isAdult || adult) && BOOKURL[key].hotKey ) {
					newArr.push(api[key].getHotKeyword());
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	
	//获取热门推荐
	getRecome () {
		let newArr = [];
		Object.keys(api).forEach(key => {
			const sources = getters['source/get'];
			const adult = getters['app/getAdult'];
			let index = sources.findIndex(source => source.id == key)
			if ( index == -1 || (index > -1 && sources[index].key > -1) ) {
				if ( (!BOOKURL[key].isAdult || adult) && BOOKURL[key].recome ) {
					newArr.push(api[key].getRecome());
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	//获取分类列表
	getTypeList () {
		let newArr = [];
		Object.keys(api).forEach(key => {
			const sources = getters['source/get'];
			const adult = getters['app/getAdult'];
			let index = sources.findIndex(source => source.id == key)
			if ( index == -1 || (index > -1 && sources[index].key > -1) ) {
				if ( (!BOOKURL[key].isAdult || adult) && BOOKURL[key].recome ) {
					newArr.push(api[key].getTypeList());
				}
			}
		})
		return Promise.all(newArr.map((promise)=>promise.catch((e)=>{promise.resolve(e)})))
	},
	//获取分类详情
	getTypeDetail (data) {
		return api[data.source].getTypeDetail(data)
	},
	//获取书籍详情
	getDetail (data) {
		return api[data.source].getDetail(data)
	},
	//获取书籍内容
	getContent (data) {
		return api[data[0].source].getContent(data)
	},
	//获取评论
	getComment (data) {
		return api[data.source].getComment(data)
	}
}