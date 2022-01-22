import { DICT } from '../config.js'

const state = {
	dict: uni.getStorageSync(DICT) || [] //字典列表
}

const getters = {
	get (state) {
		return state.dict
	}
}

const mutations = {
	set (state, dict) {
		state.dict = dict
		uni.setStorageSync(DICT, state.dict)
	}
}

const actions = {
	add ({state, commit}, dict) {
		const list = [...state.dict]
		const index = list.findIndex(item => item.id == dict.id)
		index > -1 ? list[index] = dict : list.push(dict)
		commit('set', list)
	},
	remove ({state, commit}, id) {
		const list = [...state.dict]
		const index = list.findIndex(item => item.id == id)
		if ( index > -1 ) list.splice(index, 1);
		commit('set', list)
	},
	clear ({state, commit}, type) {
		const list = state.dict.filter(item => item.type != type)
		commit('set', list)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}