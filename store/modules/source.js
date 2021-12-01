import { SOURCECLOSE } from '../config.js'

const state = {
	close: uni.getStorageSync(SOURCECLOSE) || [] //已关闭的网站来源
}

const getters = {
	getClose (state) {
		return state.close
	}
}

const mutations = {
	setClose (state, close) {
		state.close = close
		uni.setStorageSync(SOURCECLOSE, state.close)
	}
}

const actions = {
	addClose ({state, commit}, source) {
		const closes = [...state.close]
		const index = closes.findIndex(close => close == source)
		index > -1 ? closes[index] = source : closes.push(source)
		commit('setClose', closes)
	},
	removeClose ({state, commit}, source) {
		const closes = [...state.close]
		const index = closes.findIndex(close => close == source)
		if ( index > -1 ) closes.splice(index, 1);
		commit('setClose', closes)
	},
	clearClose ({commit}) {
		commit('setClose', [])
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}