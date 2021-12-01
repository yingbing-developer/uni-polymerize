import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app.js'
import search from './modules/search.js'
import cache from './modules/cache.js'
import source from './modules/source.js'
import collection from './modules/collection.js'
import player from './modules/player.js'
Vue.use(Vuex)
const store = new Vuex.Store({
	modules: {
		app,
		search,
		cache,
		source,
		collection,
		player
	}
})
export default store