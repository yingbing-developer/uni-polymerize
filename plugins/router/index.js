import Vue from 'vue';
import Router from './router.js';

const guard = new Router();
// const tabbar = ['/pages/book/index', '/pages/comic/index', '/pages/music/index', '/pages/user/index']
/**
 * 路由前置守卫
*/
guard.beforeEach((to, from, next) => {
	// if ( tabbar.indexOf(from.url) > -1 && tabbar.indexOf(to.path) == -1 ) {
	// 	uni.hideTabBar()
	// }
	next();
});


/**
 * 路由后置守卫
*/
guard.afterEach((to, from) => {
});


/**
 * 报错钩子
*/
guard.onError((errMsg) => {
    console.log('my route-guards error: ' + errMsg);
});
export default guard;