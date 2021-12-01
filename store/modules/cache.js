import { FILECACHE } from '../config.js'

const state = {
	cache: uni.getStorageSync(FILECACHE) || [] //图片临时文件存放
}

const getters = {
	getCache (state) {
		return state.cache
	}
}

const mutations = {
	setCache (state, cache) {
		state.cache = cache
		uni.setStorageSync(FILECACHE, state.cache)
	}
}

const actions = {
	addCache ({state, commit}, obj) {
		const caches = [...state.cache]
		const index = caches.findIndex(cache => cache.id == obj.id)
		index > -1 ? caches[index] = obj : caches.push(obj)
		commit('setCache', caches)
	},
	removeCache ({state, commit}, id) {
		const caches = [...state.cache]
		const index = caches.findIndex(cache => cache.id == id)
		if ( index > -1 ) caches.splice(index, 1);
		commit('setCache', caches)
	},
	clearCache ({commit}) {
		commit('setCache', [])
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}