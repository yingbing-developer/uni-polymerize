import { CUSTOM } from '../config.js'

const state = {
	custom: uni.getStorageSync(CUSTOM) || [] //自定义分组列表
}

const getters = {
	get (state) {
		return state.custom
	}
}

const mutations = {
	set (state, custom) {
		state.custom = custom
		uni.setStorageSync(CUSTOM, state.custom)
	}
}

const actions = {
	add ({state, commit}, obj) {
		const list = [...state.custom]
		const index = list.findIndex(item => item.id == obj.id)
		index > -1 ? list[index] = obj : list.push(obj)
		commit('set', list)
	},
	remove ({state, commit}, id) {
		const list = [...state.custom]
		const index = list.findIndex(item => item.id == id)
		if ( index > -1 ) list.splice(index, 1);
		commit('set', list)
	},
	clear ({state, commit}, type) {
		let list = state.custom.filter(item => item.type != type)
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