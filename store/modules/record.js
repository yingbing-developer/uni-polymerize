import { RECORD } from '../config.js'

const state = {
	record: uni.getStorageSync(RECORD) || [] //记录列表
}

const getters = {
	getRecord (state) {
		return state.record
	}
}

const mutations = {
	setRecord (state, record) {
		state.record = record
		uni.setStorageSync(RECORD, state.record)
	}
}

const actions = {
	addRecord ({state, commit}, obj) {
		const list = [...state.record]
		const index = list.findIndex(item => item.id == obj.id)
		index == -1 ? list.push(obj) : list.splice(index, 1) && list.push(obj)
		commit('setRecord', list)
	},
	removeRecord ({state, commit}, id) {
		const list = [...state.record]
		const index = list.findIndex(item => item.id == id)
		if ( index > -1 ) list.splice(index, 1);
		commit('setRecord', list)
	},
	clearRecord ({state, commit}, type) {
		const list = state.record.filter(item => item.type != type)
		commit('setRecord', list)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}