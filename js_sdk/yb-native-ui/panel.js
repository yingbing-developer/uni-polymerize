const windowWidth = uni.getSystemInfoSync().screenWidth
const windowHeight = uni.getSystemInfoSync().screenHeight
import createMasks from './mask.js'



export function panel ({menus, cancelText, dark, success, fail}) {
	const height = uni.upx2px(450)
	const footerHeight = uni.upx2px(100)
	const footerTop = height - footerHeight
	
	const textSize = uni.upx2px(26)
	
	const bgColor = dark ? '#3F3F3F' : '#FFFFFF'
	const lineColor = dark ? '#191919' : '#EEEEEE'
	const textColor = dark ? '#f4f7f5' : '#333333'
	
	const mask = createMasks()
	
	const panel = new plus.nativeObj.View('panel', {
		width: '100%',
		height: height + 'px',
		bottom: '0',
		left: '0'
	});
	let draws = [{
		tag:'rect',
		id:'bg',
		rectStyles: {
			color: bgColor
		},
		position: {
			top: 0 + 'px',
			left: 0 + 'px',
			width: '100%',
			height: '100%',
		}
	},{
		tag:'rect',
		id:'h-line',
		rectStyles: {
			color: lineColor
		},
		position: {
			top: footerTop + 'px',
			left: 0,
			width: '100%',
			height: 1 + 'px',
		}
	},{
		tag:'font',
		id: 'cancelText',
		text: cancelText || '关闭面板',
		textStyles: {
			color: textColor,
			size: textSize + 'px',
			align: 'middle',
			verticalAlign: 'middle'
		},
		position: {
			top: footerTop + 'px',
			left: 0,
			width: '100%',
			height: footerHeight + 'px',
		}
	}]
	panel.draw(draws)
	
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
			panel.close()
			success({
				confirm: bol
			})
			page.$vm.$options.onBackPress = backs//还原当前页面的返回事件监听
		} catch(e){
			fail(e)
		}
	}
	// panel.addEventListener("click", (e) => {
	// 	try{
	// 		const confirm = {
	// 			top: footerTop,
	// 			bottom: footerTop + footerHeight,
	// 			left: cancelHide ? ((windowWidth / 2) - (width / 2)) : (windowWidth / 2),
	// 			right: cancelHide ? ((windowWidth / 2) - (width / 2)) + width : (windowWidth / 2) + (width / 2)
	// 		}
	// 		const cancel = cancelHide ? {
	// 			top: -1,
	// 			bottom: -1,
	// 			left: -1,
	// 			right: -1
	// 		} : {
	// 			top: footerTop,
	// 			bottom: footerTop + footerHeight,
	// 			left: (windowWidth / 2) - (width / 2),
	// 			right: (windowWidth / 2)
	// 		}
	// 		const box = {
	// 			top: top,
	// 			bottom: top + height,
	// 			left: left,
	// 			right: left + width
	// 		}
	// 		if ( e.clientX >= confirm.left && e.clientX <= confirm.right && e.clientY >= confirm.top && e.clientY <= confirm.bottom ) {
	// 			complete(true)
	// 		} else if ( e.clientX >= cancel.left && e.clientX <= cancel.right && e.clientY >= cancel.top && e.clientY <= cancel.bottom ) {
	// 			complete(false)
	// 		} else if ( e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom ) {
	// 		} else {
	// 			complete(false)
	// 		}
	// 	} catch(e){
	// 		complete(false)
	// 	}
	// })
	mask.show()
	panel.show()
}

export default panel