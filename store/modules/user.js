import { USER } from '../config.js'

const state = {
	name: uni.getStorageSync(USER)?.name || '史蒂芬·李',//用户姓名
	avatar: uni.getStorageSync(USER)?.avatar || ''//用户头像
}

const getters = {
	getName (state) {
		return state.name
	},
	getAvatar (state) {
		return state.avatar
	}
}

const mutations = {
	setName (state, name) {
		state.name = name
		let user = uni.getStorageSync(USER) || {
			name: '',
			avatar: ''
		}
		user.name = name
		uni.setStorageSync(USER, user)
	},
	setAvatar (state, avatar) {
		state.avatar = avatar
		let user = uni.getStorageSync(USER) || {
			name: '',
			avatar: ''
		}
		user.avatar = avatar
		uni.setStorageSync(USER, user)
	}
}


const actions = {
	updateName ({commit}, name) {
		commit('setName', name)
	},
	updateAvatar ({commit}, avatar) {
		commit('setAvatar', avatar)
	}
}

export default {
    namespaced: true,
    state,
    getters,
	mutations,
	actions
}