import { PLAYMODE, LYRICSHOW } from '../config.js'
import Utils from '@/assets/js/util.js'
import NativeUI from '@/js_sdk/yb-native-ui/index.js'

const { randomSoleNumber } = Utils

//音乐播放
const state = {
	playList: [],//播放列表
	currentSong: null,//当前播放歌曲
	currentLyricTitle: '',//当前歌词
	currentLyricIndex: -1,//当前歌词索引
	paused: true,//是否暂停
	currentTime: 0,//播放时间
	duration: 1,//歌曲长度
	playMode: uni.getStorageSync(PLAYMODE) || 'round', //播放模式
	lyricShow: uni.getStorageSync(LYRICSHOW) || false, //是否显示全局歌词
}

const getters = {
	getPlayList (state) {
		return state.playList;
	},
	getCurrentSong (state) {
		return state.currentSong
	},
	getCurrentLyricTitle (state) {
		return state.currentLyricTitle
	},
	getCurrentLyricIndex (state) {
		return state.currentLyricIndex
	},
	getPaused (state) {
		return state.paused
	},
	getPlayMode (state) {
		return state.playMode;
	},
	getLyricShow (state) {
		return state.lyricShow;
	},
	getCurrentTime (state) {
		return state.currentTime
	},
	getDuration (state) {
		return state.duration
	}
}

const mutations = {
	//设置当前播放歌曲
	setCurrentSong (state, song) {
		state.currentSong = song || null
	},
	//设置当前歌词
	setCurrentLyricTitle (state, title) {
		state.currentLyricTitle = title || ''
	},
	//设置当前歌词索引
	setCurrentLyricIndex (state, index) {
		state.currentLyricIndex = index
	},
	//设置当前播放状态
	setPaused (state, bol) {
		state.paused = bol
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
	},
	//移除指定歌曲
	removeSong ({state, commit, dispatch}, id) {
		const list = [...state.playList]
		const songIndex = list.findIndex(item => item.id == id)
		const currentId = state.currentSong ? state.currentSong.id : null
		list.splice(songIndex, 1)
		commit('setPlayList', list)
	},
	//清空播放列表
	clearSong ({commit}) {
		commit('setPlayList', [])
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
	},
	//切换歌词显示
	switchLyricShow ({state, commit}) {
		commit('setLyricShow', !state.lyricShow)
	},
	destroy ({state, commit}) {
		commit('setCurrentSong', null)
		commit('setCurrentLyricTitle', '')
		commit('setCurrentLyricIndex', -1)
		commit('setPaused', true)
		commit('setCurrentTime', 0)
		commit('setDuration', 1)
	}
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
	actions
}
