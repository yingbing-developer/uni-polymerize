import { PLAYMODE, LYRICSHOW } from '../config.js'
import Utils from '@/assets/js/util.js'
import NativeUI from '@/js_sdk/yb-native-ui/index.js'

const { randomSoleNumber } = Utils

//音乐播放
const state = {
	player: null,//播放实例
	currentSong: null,//当前播放歌曲
	playStatus: false,//播放状态
	currentTime: 0,//播放时间
	duration: 1,//歌曲长度
	playList: [],//播放列表
	playMode: uni.getStorageSync(PLAYMODE) || 'round', //播放模式
	playOrder: [],//播放订单
	lyricShow: uni.getStorageSync(LYRICSHOW) || false, //是否显示全局歌词
}

const getters = {
	getPlayer (state) {
		return state.player
	},
	getCurrentSong (state) {
		return state.currentSong
	},
	getPlayStatus (state) {
		return state.playStatus
	},
	getCurrentTime (state) {
		return state.currentTime
	},
	getDuration (state) {
		return state.duration
	},
	getPlayList (state) {
		return state.playList;
	},
	getPlayMode (state) {
		return state.playMode;
	},
	getPlayOrder (state) {
		return state.playOrder;
	},
	getLyricShow (state) {
		return state.lyricShow;
	}
}

const mutations = {
	//设置播放实例
	setPlayer (state, player) {
		state.player = player || null
	},
	//设置当前播放歌曲
	setCurrentSong (state, song) {
		state.currentSong = song || null
	},
	//设置当前播放状态
	setPlayStatus (state, status) {
		state.playStatus = status
	},
	//设置当前播放时间
	setCurrentTime (state, time) {
		state.currentTime = time || 0
	},
	//设置当前歌曲长度
	setDuration (state, time) {
		state.duration = time
	},
	//设置播放列表
	setPlayList (state, playList) {
		state.playList = playList || []
	},
	//设置播放模式
	setPlayMode (state, playMode) {
		state.playMode = playMode || 'round'
		uni.setStorageSync(PLAYMODE, state.playMode)
	},
	//设置播放模式
	setPlayOrder (state, playOrder) {
		state.playOrder = playOrder || []
	},
	//设置是否显示全局歌词
	setLyricShow (state, bol) {
		state.lyricShow = bol
		uni.setStorageSync(LYRICSHOW, state.lyricShow)
	},
}

const actions = {
	//增加歌曲
	addSong ({state, commit, dispatch}, songs) {
		let list = [...state.playList]
		const newSongs = songs.filter(song => {
			return !song.payplay && list.findIndex(item => item.id == song.id) == -1
		})
		list = list.concat(newSongs)
		commit('setPlayList', list)
		dispatch('changePlayOrder')
	},
	//移除指定歌曲
	removeSong ({state, commit, dispatch}, id) {
		const list = [...state.playList]
		const orders = [...state.playOrder]
		const songIndex = list.findIndex(item => item.id == id)
		const orderIndex = orders.findIndex(order => order == id)
		const currentId = state.currentSong ? state.currentSong.id : null
		list.splice(songIndex, 1)
		orders.splice(orderIndex, 1)
		commit('setPlayList', list)
		commit('setPlayOrder', orders)
		currentId == id ? list.length > 0 ? dispatch('next') : dispatch('destroy') : null
	},
	//清空播放列表
	clearSong ({commit, dispatch}) {
		dispatch('destroy')
		commit('setPlayList', [])
		commit('setPlayOrder', [])
	},
	//切换播放模式
	switchPlayMode ({state, commit, dispatch}) {
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
		dispatch('changePlayOrder')
	},
	//切换歌词显示
	switchLyricShow ({state, commit}) {
		commit('setLyricShow', !state.lyricShow)
	},
	changePlayOrder ({state, commit}) {
		const list = [...state.playList]
		switch ( state.playMode ) {
			case 'random':
				const arr = randomSoleNumber(list.length)
				let order = []
				arr.forEach(index => {
					order.push(list[index].id)
				})
				commit('setPlayOrder', order)
				break
			case 'loop':
				const orders = state.currentSong ? [state.currentSong.id] : [list[0].id]
				commit('setPlayOrder', orders)
				break
			default:
				commit('setPlayOrder', list.map(item => item.id))
				break
		}
	},
	//下一首
	next ({state, dispatch}) {
		const orders = [...state.playOrder]
		const currentIndex = state.currentSong ? orders.findIndex(order => order == state.currentSong.id) : 0
		const newCurrent = currentIndex >= orders.length - 1 ? 0 : currentIndex + 1
		dispatch('create', orders[newCurrent])
	},
	//上一首
	prev ({state, dispatch}) {
		const orders = [...state.playOrder]
		const currentIndex = state.currentSong ? orders.findIndex(order => order == state.currentSong.id) : 0
		const newCurrent = currentIndex <= 0 ? orders.length - 1 : currentIndex - 1
		dispatch('create', orders[newCurrent])
	},
	create ({state, commit, dispatch}, id) {
		state.player ? dispatch('destroy') : null
		const songs = [...state.playList]
		const currentSong = songs.find(song => song.id == id)
		const Player = require('@/assets/constructor/player.js').default
		commit('setPlayer', new Player(currentSong))
		commit('setCurrentSong', currentSong)
		state.player.init().then(status => {
			if ( status ) {
				state.player.instance.play()
				state.player.instance.onEnded(() => {
					dispatch('next')
				})
				state.player.instance.onError(() => {
					NativeUI.alert({
						title: '错误提示',
						content: '歌曲播放失败！换首歌曲播放吧',
						dark: this.skinMode == 'night',
						success: (res) => {
							dispatch('removeSong', id)
						}
					})
				})
				state.player.instance.onTimeUpdate(() => {
					commit('setCurrentTime', state.player.instance.currentTime)
				})
				state.player.instance.onPlay(() => {
					commit('setPlayStatus', true)
					commit('setDuration', state.player.instance.duration)
				})
				state.player.instance.onPause(() => {
					commit('setPlayStatus', false)
				})
				state.player.instance.onStop(() => {
					commit('setPlayStatus', false)
				})
				state.player.instance.onEnded(() => {
					commit('setPlayStatus', false)
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
			}
		})
	},
	destroy ({state, commit}) {
		state.player ? state.player.destroy() : null
		commit('setPlayStatus', false)
		commit('setCurrentTime', 0)
		commit('setDuration', 1)
		commit('setPlayer', null)
		commit('setCurrentSong', null)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}
