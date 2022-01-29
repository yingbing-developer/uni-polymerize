<script>
	import {
		Route
	} from '@/plugins/router/router.js';
	import Router from '@/plugins/router';
	import Http from '@/plugins/request'
	import Xhr from '@/plugins/xhr'
	import Modules from '@/plugins/modules'
	import Utils from '@/assets/js/util.js'
	import Config from '@/assets/js/config.js'
	import Business from '@/assets/js/business.js'
	import Api from '@/assets/api/index.js'
	import NativeUI from '@/js_sdk/yb-native-ui/index.js'
	export default {
		globalData: {
			$Router: Router,
			$Route: new Route(),
			$http: Http,
			$xhr: Xhr,
			$modules: Modules,
			$utils: Utils,
			$config: Config,
			$business: Business,
			$api: Api,
			$nativeUI: NativeUI
		},
		onLaunch: function() {
			console.log('App Launch')
			// plus.screen.lockOrientation('portrait-primary');
			//重写toast方法如果内容为 ‘再次返回退出应用’ 就隐藏应用，其他正常toast
			const toast = plus.nativeUI.toast;
			plus.nativeUI.toast = (function(message, styles) {
				if (message == '再按一次退出应用' || message == '再按一次退出應用') {
					NativeUI.confirm({
						content: '真的要退出app吗？',
						confirmText: '隐藏至后台',
						cancelText: '直接退出',
						success: (res) => {
							if ( res.confirm ) {
								plus.android.runtimeMainActivity().moveTaskToBack(false);
							} 
							if ( res.cancel ) {
								plus.runtime.quit()
							}
						}
					})
				} else {
					toast(message, styles)
				}
			});
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
			uni.$emit('app-hide');
		}
	}
</script>

<style>
	@import url("@/assets/skin/index.css");

	/*每个页面公共css */
	/* #ifdef APP-VUE */
	page {
		background: transparent;
	}

	/* #endif */

	.opac-actived:active {
		opacity: 0.5;
	}

	.margin-gap {
		margin-left: 20rpx;
		margin-right: 20rpx;
	}

	.padding-gap {
		padding-left: 20rpx;
		padding-right: 20rpx;
	}
</style>
