import { PATH } from '../config.js'

const state = {
	path: uni.getStorageSync(PATH) || [] //本地资源路径保存
}

const getters = {
	get (state) {
		return state.path
	}
}

const mutations = {
	set (state, path) {
		state.path = path
		uni.setStorageSync(PATH, state.path)
	}
}

const actions = {
	add ({state, commit}, obj) {
		const list = [...state.path]
		const index = list.findIndex(item => item.type == obj.type)
		index > -1 ? list[index] = obj : list.push(obj)
		commit('set', list)
	},
	remove ({state, commit}, type) {
		const list = [...state.path]
		const index = list.findIndex(item => item.type == type)
		if ( index > -1 ) list.splice(index, 1);
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