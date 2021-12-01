// 搜索历史

import {
SEARCHHISTORY } from '../config.js'

const state = {
	history: uni.getStorageSync(SEARCHHISTORY) || []//搜索历史
}

const getters = {
	getHistory (state) {
		return state.history;
	}
}

const mutations = {
	//设置搜索历史
	setHistory (state, history) {
		state.history = history
		uni.setStorageSync(SEARCHHISTORY, state.history);
	}
	
}

const actions = {
	//添加搜索历史
	addHistory ({state, commit}, history) {
		const histories = [...state.history]
		const index = histories.findIndex(his => his.title == history.title && history.type == his.type)
		index == -1 ? histories.push(history) : histories.splice(index, 1) && histories.push(history)
		commit('setHistory', histories)
	},
	//移除指定搜索历史
	removeHistory ({state, commit}, history) {
		const histories = [...state.history]
		const index = histories.findIndex(his => his.title == history.title && history.type == his.type)
		index > -1 ? histories.splice(index, 1) : null
		commit('setHistory', histories)
	},
	//移除指定类型搜索历史
	clearHistory ({state, commit}, type) {
		const newHistory = state.history.filter(his => his.type != type)
		commit('setHistory', newHistory)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}
