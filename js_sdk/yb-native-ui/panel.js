//操作面板

const windowWidth = uni.getSystemInfoSync().screenWidth
const windowHeight = uni.getSystemInfoSync().screenHeight
import createMasks from './mask.js'
import color from './color.js'

export function panel ({title, subTitle, menus, cancelText, themeColor, dark, success, fail}) {
	const lines = Math.ceil(menus.length / 4)
	const titleHeight = uni.upx2px(60) + (subTitle ? uni.upx2px(20) : 0)
	const footerHeight = uni.upx2px(100)
	const itemHeight = uni.upx2px(150)
	const height = (lines * itemHeight) + footerHeight + titleHeight + uni.upx2px(20)
	const footerTop = height - footerHeight
	
	const titleSize = uni.upx2px(28)
	const textSize = uni.upx2px(22)
	
	const mode = dark ? 'dark' : 'light'
	const bgColor = color[mode].bg
	const lineColor = color[mode].gap
	const titleColor = themeColor || color[mode].title
	const textColor = color[mode].text_2
	
	let mask = createMasks()
	let popup = new plus.nativeObj.View('popup', {
		width: '100%',
		height: height + 'px',
		bottom: -height + 'px',
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
		tag:'font',
		id:'title',
		text: title || '操作面板',
		textStyles: {
			color: titleColor,
			size: titleSize + 'px',
			overflow: 'ellipsis',
			align: 'middle',
			verticalAlign: 'middle'
		},
		position: {
			top: 0 + 'px',
			left: '5%',
			width: '90%',
			height: titleHeight + 'px',
		}
	},{
		tag:'font',
		id:'subTitle',
		text: subTitle || '',
		textStyles: {
			color: textColor,
			size: textSize + 'px',
			overflow: 'ellipsis',
			align: 'middle',
			verticalAlign: 'middle'
		},
		position: {
			top: (titleSize + 5) + 'px',
			left: '5%',
			width: '90%',
			height: titleHeight + 'px',
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
			color: titleColor,
			size: titleSize + 'px',
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
	const drawMenuIcon = menus.map((menu, key) => {
		return {
			tag:'font',
			id: menu.id,
			text: menu.icon,
			textStyles: {
				family: menu.family,
				fontSrc: menu.fontSrc,
				color: menu.color,
				size: menu.size + 'px',
				align: 'middle',
				verticalAlign: 'middle'
			},
			position: {
				top: (titleHeight + (Math.floor(key / 4) * itemHeight)) + 'px',
				left: ((key % 4) * 25) + '%',
				width: '25%',
				height: itemHeight + 'px',
			}
		}
	})
	const drawMenuTitle = menus.map((menu, key) => {
		return {
			tag:'font',
			id: menu.id + '_title',
			text: menu.title,
			textStyles: {
				color: titleColor,
				size: titleSize + 'px',
				align: 'middle',
				verticalAlign: 'bottom'
			},
			position: {
				top: (titleHeight + (Math.floor(key / 4) * itemHeight)) + 'px',
				left: ((key % 4) * 25) + '%',
				width: '25%',
				height: itemHeight + 'px',
			}
		}
	})
	popup.draw(draws.concat(drawMenuIcon.concat(drawMenuTitle)))
	
	let pages = getCurrentPages()
	let page = pages[pages.length - 1]
	let backs = page.$vm.$options.onBackPress//记录下当前页面有可能设置的返回事件监听方法，用于还原
	page.$vm.$options.onBackPress = new Array(0)
	page.$vm.$options.onBackPress.push((e) => {
		complete(false)
		return true
	})
	const complete = function (bol, data) {
		try{
			mask.close()
			popup.close()
			mask = null
			popup = null
			page.$vm.$options.onBackPress = backs//还原当前页面的返回事件监听
			pages = null
			page = null
			backs = null
			success ? success({
				confirm: bol,
				data: data || null
			}) : null
		} catch(e){
			fail ? fail(e) : null
		}
	}
	popup.addEventListener("click", (e) => {
		try{
			const menuItems = Object.keys(menus).map(key => {
				return {
					top: titleHeight + (Math.floor(key / 4) * itemHeight),
					bottom: titleHeight + (Math.floor(key / 4) * itemHeight) + itemHeight,
					left: (key % 4) * (windowWidth * 0.25),
					right: ((key % 4) * (windowWidth * 0.25)) + (windowWidth * 0.25)
				}
			})
			menuItems.forEach((item, key) => {
				if ( e.clientX >= item.left && e.clientX <= item.right && e.clientY >= item.top && e.clientY <= item.bottom ) {
					complete(true, {
						id: menus[key].id,
						key: key
					})
				}
			})
			const cancel ={
				top: footerTop,
				bottom: footerTop + footerHeight,
				left: 0,
				right: windowWidth
			}
			if ( e.clientX >= cancel.left && e.clientX <= cancel.right && e.clientY >= cancel.top && e.clientY <= cancel.bottom ) {
				complete(false)
			}
		} catch(e){
			complete(false)
		}
	})
	mask.addEventListener("click", (e) => {
		try{
			complete(false)
		} catch(e){
			complete(false)
		}
	})
	mask.show()
	popup.show()
	let bottom = 0
	const show = function () {
		setTimeout(function () {
			bottom += 10
			if ( bottom >= height ) {
				bottom = height
				popup.setStyle({
					bottom: (bottom - height) + 'px'
				})
			} else {
				popup.setStyle({
					bottom: (bottom - height) + 'px'
				})
				show()
			}
		}, 10)
	}
	show()
}

export default panel