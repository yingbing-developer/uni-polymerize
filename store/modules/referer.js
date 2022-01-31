import { REFERER } from '../config.js'

const state = {
	referer: uni.getStorageSync(REFERER) || [] //图片防盗链域名
}

const getters = {
	get (state) {
		return state.referer
	}
}

const mutations = {
	set (state, referer) {
		state.referer = referer
		uni.setStorageSync(REFERER, state.referer)
	}
}

const actions = {
	add ({state, commit}, referer) {
		let referers = [...state.referer]
		const index = referers.indexOf(referer)
		index > -1 ? referers[index] = referer : referers.push(referer)
		commit('set', referers)
	},
	remove ({state, commit}, referer) {
		let referers = [...state.referer]
		const index = referers.indexOf(referer)
		referers.splice(index, 1);
		commit('set', referers)
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