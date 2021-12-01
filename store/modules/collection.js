import { COLLECTION } from '../config.js'

const state = {
	collection: uni.getStorageSync(COLLECTION) || [] //图片临时文件存放
}

const getters = {
	getCollection (state) {
		return state.collection
	}
}

const mutations = {
	setCollection (state, collection) {
		state.collection = collection
		uni.setStorageSync(COLLECTION, state.collection)
	}
}

const actions = {
	addCollection ({state, commit}, obj) {
		const list = [...state.collection]
		const index = list.findIndex(item => item.id == obj.id)
		index > -1 ? list[index] = obj : list.push(obj)
		commit('setCollection', list)
	},
	removeCollection ({state, commit}, id) {
		const list = [...state.collection]
		const index = list.findIndex(item => item.id == id)
		if ( index > -1 ) list.splice(index, 1);
		commit('setCollection', list)
	},
	clearCollection ({state, commit}, type) {
		const list = state.collection.filter(item => item.type != type)
		commit('setCollection', list)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}