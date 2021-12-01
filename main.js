import Vue from 'vue'
import App from './App'
import store from './store'//引入vuex
import '@/plugins'
import '@/assets/js'
import api from '@/assets/api'
import NativeUI from '@/js_sdk/yb-native-ui/index.js'

Vue.config.productionTip = false

Vue.prototype.$api = api
Vue.prototype.$nativeUI = NativeUI

App.mpType = 'app'

const app = new Vue({
    ...App,
	store
})
app.$mount()
