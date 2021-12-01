import { PLAYMODE } from '../config.js'
import Utils from '@/assets/js/util.js'
import NativeUI from '@/js_sdk/yb-native-ui/index.js'

const { randomSoleNumber } = Utils

//音乐播放
const state = {
	player: null,//播放实例
	playList: [],//播放列表
	playMode: uni.getStorageSync(PLAYMODE) || 'round', //播放模式
	playOrder: [],//播放订单
}

const getters = {
	getPlayer (state) {
		return state.player
	},
	getPlayList (state) {
		return state.playList;
	},
	getPlayMode (state) {
		return state.playMode;
	},
	getPlayOrder (state) {
		return state.playOrder;
	}
}

const mutations = {
	setPlayer (state, player) {
		state.player = player || null
	},
	//设置播放列表
	setPlayList (state, playList) {
		state.playList = playList || []
	},
	//设置播放模式
	setPlayMode (state, playMode) {
		state.playMode = playMode || 'round'
	},
	//设置播放模式
	setPlayOrder (state, playOrder) {
		state.playOrder = playOrder || []
	}
}

const actions = {
	//增加歌曲
	addSong ({state, commit}, songs) {
		let list = [...state.playList]
		const newSongs = songs.filter(song => {
			return !song.payplay && list.findIndex(item => item.id == song.id) == -1
		})
		list = list.concat(newSongs)
		switch ( state.playOrder ) {
			case 'random':
				const arr = randomSoleNumber(newSongs.length)
				let order = []
				arr.forEach(index => {
					order.push(newSongs[index].id)
				})
				commit('setPlayOrder', order)
				break
			case 'loop':
				commit('setPlayOrder', [list[0].id])
				break
			default:
				commit('setPlayOrder', list.map(item => item.id))
				break
		}
		commit('setPlayList', list)
	},
	//移除指定歌曲
	removeSong ({state, commit, dispatch}, id) {
		const list = [...state.playList]
		const orders = [...state.playOrder]
		const songIndex = list.findIndex(item => item.id == id)
		const orderIndex = orders.findIndex(order => order == id)
		const currentId = state.player ? state.player.song.id : null
		list.splice(songIndex, 1)
		orders.splice(orderIndex, 1)
		commit('setPlayList', list)
		commit('setPlayOrder', orders)
		currentId == id ? list.length > 0 ? dispatch('next') : dispatch('destroy') : null
	},
	//清空播放列表
	clearSong ({commit, dispatch}) {
		commit('setPlayList', [])
		commit('setPlayOrder', [])
		dispatch('destroy')
	},
	//切换播放模式
	switchPlayMode ({state, commit}) {
		switch ( state.playMode ) {
			case 'round':
				commit('setPlayMode', 'loop')
				break
			case 'loop':
				commit('setPlayMode', 'random')
				break
			default:
				commit('setPlayMode', 'round')
				break
		}
	},
	//下一首
	next ({state, dispatch}) {
		const orders = [...state.playOrder]
		const currentIndex = state.player ? orders.findIndex(order => order == state.player.song.id) : 0
		const newCurrent = currentIndex >= orders.length - 1 ? 0 : currentIndex + 1
		dispatch('create', orders[newCurrent])
	},
	//上一首
	prev ({state, dispatch}) {
		const orders = [...state.playOrder]
		const currentIndex = state.player ? orders.findIndex(order => order == state.player.song.id) : 0
		const newCurrent = currentIndex <= 0 ? orders.length - 1 : currentIndex - 1
		dispatch('create', orders[newCurrent])
	},
	create ({state, commit, dispatch}, id) {
		state.player ? dispatch('destroy') : null
		const songs = [...state.playList]
		const currentSong = songs.find(song => song.id == id)
		const Player = require('@/assets/constructor/player.js').default
		commit('setPlayer', new Player(currentSong))
		const player = state.player
		player.init().then(status => {
			if ( status ) {
				player.instance.onEnded(() => {
					dispatch('next')
				})
				player.instance.onCanplay(() => {
					player.instance.play()
				})
				player.instance.onError(() => {
					NativeUI.alert({
						title: '错误提示',
						content: '歌曲播放失败！换首歌曲播放吧',
						dark: this.skinMode == 'night',
						success: (res) => {
							dispatch('removeSong', id)
						}
					})
					dispatch('destroy')
				})
			} else {
				NativeUI.alert({
					title: '错误提示',
					content: '歌曲播放失败！换首歌曲播放吧',
					dark: this.skinMode == 'night',
					success: (res) => {
						dispatch('removeSong', id)
					}
				})
				dispatch('destroy')
			}
		})
	},
	destroy ({state, commit}) {
		state.player.destroy()
		commit('setPlayer', null)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}
