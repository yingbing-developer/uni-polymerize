import { FILECACHE } from '../config.js'
import Cache from '@/assets/constructor/cache.js'

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
		const newCache = new Cache(obj)
		const index = caches.findIndex(cache => cache.id == newCache.id)
		index > -1 ? caches[index] = newCache : caches.push(newCache)
		commit('setCache', caches)
	},
	removeCache ({state, commit}, id) {
		const caches = [...state.cache]
		const index = caches.findIndex(cache => cache.parentId == id)
		if ( index > -1 ) {
			const src = plus.io.convertLocalFileSystemURL(caches[index].src);
			const file = plus.android.newObject('java.io.File', src);
			if ( plus.android.invoke(file, 'exists') ) {
				plus.android.invoke(file, 'delete')
			}
			caches.splice(index, 1);
		}
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