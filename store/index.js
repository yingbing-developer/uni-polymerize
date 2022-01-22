import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app.js'
import user from './modules/user.js'
import dict from './modules/dict.js'
import search from './modules/search.js'
import cache from './modules/cache.js'
import record from './modules/record.js'
import source from './modules/source.js'
import collection from './modules/collection.js'
import custom from './modules/custom.js'
import path from './modules/path.js'
import downer from './modules/downer.js'
import audio from './modules/audio.js'
import reader from './modules/reader.js'
Vue.use(Vuex)
const store = new Vuex.Store({
	modules: {
		app,
		user,
		dict,
		search,
		cache,
		record,
		source,
		collection,
		custom,
		path,
		downer,
		audio,
		reader
	}
})
export default store