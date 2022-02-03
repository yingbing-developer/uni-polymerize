import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config  from '@/assets/js/config.js'
import Utils from '@/assets/js/util.js'
import http from '@/plugins/request/index.js'
import xhr from '@/plugins/xhr/index.js'
import gb2312 from '@/assets/other/gb2312.js'
import Book from '@/assets/constructor/book.js'
import Bookshelf from '@/assets/constructor/bookshelf.js'
import Chapter from '@/assets/constructor/chapter.js'
import Comment from '@/assets/constructor/comment.js'
import { replaceHTML, htmlDecodeByRegExp, getTag } from '@/assets/api/global.js'

import { getRecome, getTypeList, getTypeDetail, search } from './dmzj.js'

const { getters } = Store;
const { ERR_OK, ERR_FALSE } = Config;
const { dateFormat, time2seconds } = Utils;
const context = {
	xhr: xhr,
	http: http,
	gb2312: gb2312,
	Book: Book,
	Bookshelf: Bookshelf,
	Chapter: Chapter,
	Comment: Comment,
	ERR_OK: ERR_OK,
	ERR_FALSE: ERR_FALSE,
	replaceHTML: replaceHTML,
	htmlDecodeByRegExp: htmlDecodeByRegExp,
	getTag: getTag,
	dateFormat: dateFormat,
	time2seconds: time2seconds
}

export default {
	//搜索列表
	search (data = {}) {
		// data.source = 'xyushu5'
		// data.baseUrl = 'https://www.xyuzhaiwu.xyz'
		// let newArr = [search(context, data)]
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'story');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( !data.isLastPage[source.id] && source.request.search?.value && (!source.isAdult || adult) && source.isOpen ) {
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
		const sources = getters['source/get'].filter(source => source.type == 'story');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getHotKeyword?.value && (!source.isAdult || adult) && source.isOpen ) {
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
	getRecome (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'story');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getRecome?.value && (!source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getRecome.value + ")")
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
	//获取分类列表
	getTypeList (data = {}) {
		let newArr = [];
		const sources = getters['source/get'].filter(source => source.type == 'story');
		const adult = getters['app/getAdult'];
		sources.forEach(source => {
			if ( source.request.getTypeList?.value && (!source.isAdult || adult) && source.isOpen ) {
				data.baseUrl = source.href
				data.source = source.id
				try{
					let handle = eval("(" + source.request.getTypeList.value + ")")
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
	getTypeDetail (data = {}) {
		// data.baseUrl = 'https://www.xyuzhaiwu.xyz'
		// return getTypeDetail(context, data)
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getTypeDetail.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取书籍详情
	getDetail (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getDetail.value + ")")
			return handle(context, data)
		}catch(e) {
			return Promise.resolve({
				code: ERR_FALSE,
				data: null
			})
		}
	},
	//获取书籍内容
	getContent (data = {}) {
		const sources = getters['source/get'];
		let index = sources.findIndex(source => source.id == data.source)
		try{
			data.baseUrl = sources[index].href
			let handle = eval("(" + sources[index].request.getContent.value + ")")
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
	}
}