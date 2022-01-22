import { SOURCE } from '../config.js'

const state = {
	source: uni.getStorageSync(SOURCE) || [] //已关闭的网站来源
}

const getters = {
	get (state) {
		return state.source
	}
}

const mutations = {
	set (state, source) {
		state.source = source
		uni.setStorageSync(SOURCE, state.source)
	}
}

const actions = {
	add ({state, commit}, source) {
		const sources = [...state.source]
		const index = sources.findIndex(item => item.id == source.id)
		index > -1 ? sources[index] = source : sources.push(source)
		commit('set', sources)
	},
	remove ({state, commit}, source) {
		const sources = [...state.source]
		const index = sources.findIndex(item => item.id == source.id)
		if ( index > -1 ) sources.splice(index, 1);
		commit('set', sources)
	},
	clear ({commit}) {
		commit('set', [])
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}