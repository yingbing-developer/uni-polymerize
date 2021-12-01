import createMasks from './mask.js'



export function toolbar ({menus, cancelText, dark, success, fail}) {
	const system = uni.getSystemInfoSync();
	const windowWidth = system.windowWidth
	const windowHeight = system.screenHeight
	const height = windowHeight - uni.upx2px(200)
	const itemHeight = uni.upx2px(50)
	const lineItemLength = Math.floor(height / itemHeight) //每一列最多排多少项
	const width = Math.ceil(menus.length / lineItemLength) * uni.upx2px(140)
	
	const textSize = uni.upx2px(26)
	
	const bgColor = dark ? '#3F3F3F' : '#FFFFFF'
	const lineColor = dark ? '#191919' : '#c5c5c5'
	const textColor = dark ? '#f4f7f5' : '#333333'
	
	const mask = createMasks(0)
	
	const popup = new plus.nativeObj.View('toolbar', {
		width: width + 'px',
		height: height + 'px',
		top: ((windowHeight / 2) - (height / 2)) + 'px',
		left: (windowWidth - width - uni.upx2px(20)) + 'px',
	});
	let draws = [{
		tag:'rect',
		id:'bg',
		rectStyles: {
			color: bgColor,
			radius: uni.upx2px(20) + 'px',
			borderWidth: '1px',
			borderColor: lineColor
		},
		position: {
			top: 0 + 'px',
			left: 0 + 'px',
			width: width -  + 'px',
			height: height + 'px',
		}
	}]
	popup.draw(draws)
	
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	const backs = page.$vm.$options.onBackPress//记录下当前页面有可能设置的返回事件监听方法，用于还原
	page.$vm.$options.onBackPress = new Array(0)
	page.$vm.$options.onBackPress.push((e) => {
		complete(false)
		return true
	})
	const complete = function (bol) {
		try{
			mask.close()
			popup.close()
			success({
				confirm: bol
			})
			page.$vm.$options.onBackPress = backs//还原当前页面的返回事件监听
		} catch(e){
			fail(e)
		}
	}
	mask.show()
	popup.show()
}

export default toolbar