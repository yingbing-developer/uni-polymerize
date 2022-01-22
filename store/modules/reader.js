//书籍阅读
import { READFONTSIZE, READPAGETYPE, READLINEHEIGHT, READDIRECTION } from '../config.js'

const state = {
	reader: null,//阅读实例
	fontSize: uni.getStorageSync(READFONTSIZE) || 15, //小说字体大小
	pageType: uni.getStorageSync(READPAGETYPE) || 'real', //小说翻页类型
	lineHeight: uni.getStorageSync(READLINEHEIGHT) || 15, //小说行间距
	direction: uni.getStorageSync(READDIRECTION) || 'vertical' //阅读方向
}

const getters = {
	getReader (state) {
		return state.reader
	},
	getFontSize (state) {
		return state.fontSize
	},
	getPageType (state) {
		return state.pageType
	},
	getLineHeight (state) {
		return state.lineHeight
	},
	getDirection (state) {
		return state.direction
	}
}

const mutations = {
	//设置阅读实例
	setReader (state, reader) {
		state.reader = reader || null
	},
	//设置字体大小
	setFontSize (state, fontSize) {
		state.fontSize = fontSize || 15
		uni.setStorageSync(READFONTSIZE, state.fontSize)
	},
	//设置翻页类型
	setPageType (state, pageType) {
		state.pageType = pageType || 'real'
		uni.setStorageSync(READPAGETYPE, state.pageType)
	},
	//设置行间距
	setLineHeight (state, lineHeight) {
		state.lineHeight = lineHeight || 15
		uni.setStorageSync(READLINEHEIGHT, state.lineHeight)
	},
	//设置阅读方向
	setDirection (state, direction) {
		state.direction = direction || 'vertical'
		uni.setStorageSync(READDIRECTION, state.direction)
	}
}

const actions = {
	//初始化阅读实例
	init ({commit}, reader) {
		commit('setReader', reader)
	},
	//销毁阅读实例
	destroy ({commit}) {
		commit('setReader', null)
	},
	//改变字体大小
	changeFontSize({commit}, fontSize) {
		commit('setFontSize', fontSize)
	},
	//改变翻页类型
	changePageType({commit}, pageType) {
		commit('setPageType', pageType)
	},
	//改变行间距
	changeLineHeight({commit}, lineHeight) {
		commit('setLineHeight', lineHeight)
	},
	//改变阅读方向
	changeDirection({commit}, direction) {
		commit('setDirection', direction)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}
