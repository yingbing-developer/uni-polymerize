import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app.js'
import search from './modules/search.js'
import cache from './modules/cache.js'
import source from './modules/source.js'
import collection from './modules/collection.js'
import downer from './modules/downer.js'
import audio from './modules/audio.js'
Vue.use(Vuex)
const store = new Vuex.Store({
	modules: {
		app,
		search,
		cache,
		source,
		collection,
		downer,
		audio
	}
})
export default store