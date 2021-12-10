import Store from '@/store'
import Utils from '@/assets/js/util.js'
import NativeUI from '@/js_sdk/yb-native-ui/index.js'

const { getters } = Store
const { suffix } = Utils
export default {
	setSkinColor () {
		const skinColor = getters['app/skinColor']
		const skinMode = getters['app/skinMode']
		const tabbars = ['book', 'comic', 'music', 'user']
		tabbars.forEach((item , key) => {
			uni.setTabBarItem({
				index: key,
				iconPath: 'static/tabbar/' + item + '_' + skinMode + '.png',
				selectedIconPath: 'static/tabbar/' + item + '_' + skinMode + '-actived.png',
				success: () => {},
				fail: (err) => {
					console.log(err);
				}
			})
		})
		uni.setTabBarStyle({
			color: skinColor.color_1,
			selectedColor: skinColor.color_actived_1,
			backgroundColor: skinColor.color_bg_1,
			success: () => {},
			fail: (err) => {
				console.log(err);
			}
		})
	},
	share (src) {
		let filePath = plus.io.convertLocalFileSystemURL(src);
		let file = plus.android.newObject("java.io.File", filePath);
		if ( plus.android.invoke(file, 'exists') ) {
			let main = plus.android.runtimeMainActivity();
			let Intent = plus.android.importClass("android.content.Intent");
			let Uri = plus.android.importClass("android.net.Uri");
			let environment = plus.android.importClass("android.os.Environment");
			let MimeTypeMap = plus.android.importClass("android.webkit.MimeTypeMap");
			let accept = MimeTypeMap.getSingleton().getMimeTypeFromExtension(suffix(plus.android.invoke(file, 'getName')));
			let shareIntent = new Intent(Intent.ACTION_SEND);
			shareIntent.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(file));
			shareIntent.setType(accept);
			main.startActivity(Intent.createChooser(shareIntent,"分享文件"));
		} else {
			const skinMode = getters['app/skinMode']
			NativeUI.alert({
				content: '文件路径无效',
				dark: skinMode == 'night'
			})
		}
	}
}