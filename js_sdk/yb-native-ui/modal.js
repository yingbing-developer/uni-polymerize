const windowWidth = uni.getSystemInfoSync().screenWidth
const windowHeight = uni.getSystemInfoSync().screenHeight
import createMasks from './mask.js'



export function modal ({title, content, cancelHide, confirmText, cancelText, dark, themeColor, success, fail}) {
	const padding = uni.upx2px(20)//内间隔
	const titleSize = uni.upx2px(30)//标题大小
	const titleHeight = title ? (titleSize + padding + padding) : 0//字体所占高度
	
	const width = uni.upx2px(520)//弹框宽度
	const height = uni.upx2px(220) + titleHeight//弹框高度
	const radius = uni.upx2px(10)//弹框圆角大小
	const top = (windowHeight / 2) - (height / 2)//弹框top定位
	const left = (windowWidth / 2) - (width / 2)//弹框left定位
	const footerHeight = uni.upx2px(90)//弹框按钮栏所占高度
	const footerTop = (windowHeight / 2) + ((height / 2) - footerHeight)//弹框安钮栏top定位
	
	const contentSize = uni.upx2px(24)//内容文字大小
	const contentHeight = height - titleHeight - footerHeight - (title ? padding : (2 * padding))//内容文字高度
	
	const btnSize = uni.upx2px(26)
	
	const bgColor = dark ? '#3C3C3C' : '#FFFFFF'
	const lineColor = dark ? '#191919' : '#EEEEEE'
	const titleColor = themeColor ? '#2ca2f9' : dark ? '#f4f7f5' : '#333333'
	const textColor = dark ? '#888888' : '#999999'
	
	const mask = createMasks()
	const popup = new plus.nativeObj.View('popup', {
		width: '100%',
		height: '100%',
		top: '0',
		left: '0'
	});
	let draws = [{
		tag:'rect',
		id:'bg',
		rectStyles: {
			color: bgColor,
			radius: radius + 'px'
		},
		position: {
			top: top + 'px',
			left: left + 'px',
			width: width + 'px',
			height: height + 'px',
		}
	},{
		tag:'rect',
		id:'h-line',
		rectStyles: {
			color: lineColor
		},
		position: {
			top: footerTop + 'px',
			left: left + 'px',
			width: width + 'px',
			height: 1 + 'px',
		}
	},{
		tag:'font',
		id: 'title',
		text: title,
		textStyles: {
			color: titleColor,
			size: titleSize + 'px'
		},
		position: {
			top: top + 'px',
			left: ((windowWidth / 2) - ((width - padding) / 2)) + 'px',
			width: (width - padding) + 'px',
			height: titleHeight + 'px',
		}
	},{
		tag:'font',
		id: 'content',
		text: content,
		textStyles: {
			color: textColor,
			size: contentSize + 'px',
			whiteSpace: 'normal'
		},
		position: {
			top: (top + (title ? titleHeight : padding)) + 'px',
			left: ((windowWidth / 2) - ((width - padding) / 2)) + 'px',
			width: (width - padding) + 'px',
			height: contentHeight + 'px',
		}
	}]
	let arr = []
	if ( !cancelHide ) {
		arr = [
			{
				tag:'rect',
				id:'v-line',
				rectStyles: {
					color: lineColor
				},
				position: {
					top: footerTop + 'px',
					left: ((windowWidth / 2) - 0.5) + 'px',
					width: 1 + 'px',
					height: footerHeight + 'px',
				}
			},{
				tag:'font',
				id: 'confirm',
				text: confirmText || '确认',
				textStyles: {
					color: titleColor,
					size: btnSize + 'px',
					weight: 'bold'
				},
				position: {
					top: footerTop + 'px',
					left: (windowWidth / 2) + 'px',
					width: (width / 2) + 'px',
					height: footerHeight + 'px',
				}
			},{
				tag:'font',
				id: 'cancel',
				text: cancelText || '取消',
				textStyles: {
					color: textColor,
					size: btnSize + 'px',
				},
				position: {
					top: footerTop + 'px',
					left: (windowWidth / 2) - (width / 2) + 'px',
					width: (width / 2) + 'px',
					height: footerHeight + 'px',
				}
			}
		]
	} else {
		arr = [
			{
				tag:'font',
				id: 'confirm',
				text: confirmText || '确认',
				textStyles: {
					color: titleColor,
					size: btnSize + 'px',
					weight: 'bold'
				},
				position: {
					top: footerTop + 'px',
					left: ((windowWidth / 2) - (width / 2)) + 'px',
					width: width + 'px',
					height: footerHeight + 'px',
				}
			}
		]
	}
	draws = draws.concat(arr)
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
	popup.addEventListener("click", (e) => {
		try{
			const confirm = {
				top: footerTop,
				bottom: footerTop + footerHeight,
				left: cancelHide ? ((windowWidth / 2) - (width / 2)) : (windowWidth / 2),
				right: cancelHide ? ((windowWidth / 2) - (width / 2)) + width : (windowWidth / 2) + (width / 2)
			}
			const cancel = cancelHide ? {
				top: -1,
				bottom: -1,
				left: -1,
				right: -1
			} : {
				top: footerTop,
				bottom: footerTop + footerHeight,
				left: (windowWidth / 2) - (width / 2),
				right: (windowWidth / 2)
			}
			const box = {
				top: top,
				bottom: top + height,
				left: left,
				right: left + width
			}
			if ( e.clientX >= confirm.left && e.clientX <= confirm.right && e.clientY >= confirm.top && e.clientY <= confirm.bottom ) {
				complete(true)
			} else if ( e.clientX >= cancel.left && e.clientX <= cancel.right && e.clientY >= cancel.top && e.clientY <= cancel.bottom ) {
				complete(false)
			} else if ( e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom ) {
			} else {
				complete(false)
			}
		} catch(e){
			complete(false)
		}
	})
	mask.show()
	popup.show()
}

export function alert ({title, content, confirmText, dark, themeColor, success, fail}) {
	modal({
		title: title,
		content: content,
		cancelHide: true,
		confirmText: confirmText || '确认',
		dark: dark || false,
		themeColor: themeColor || '',
		success: success || function () {},
		fail: success || function () {}
	})
}

export function confirm ({title, content, confirmText, cancelText, dark, themeColor, success, fail}) {
	modal({
		title: title,
		content: content,
		cancelHide: false,
		confirmText: confirmText || '确认',
		cancelText: cancelText || '取消',
		dark: dark || false,
		themeColor: themeColor || '',
		success: success || function () {},
		fail: success || function () {}
	})
}