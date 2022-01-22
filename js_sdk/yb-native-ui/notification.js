//顶部通知栏

const windowWidth = uni.getSystemInfoSync().screenWidth
const windowBarHeight = uni.getSystemInfoSync().statusBarHeight
import color from './color.js'

export function notification ({title, content, icon, name, duration, type, dark, success, fail}) {
	let timer = null
	const iconSize = uni.upx2px(60)
	const titleSize = uni.upx2px(24)
	const textSize = uni.upx2px(22)
	const radius = uni.upx2px(20)
	const padding = uni.upx2px(15)
	const topHeight = (icon || name) ? (2 * padding) + ( icon ? iconSize : textSize) : 0
	const titleHeight = title ? titleSize : 0
	const contentHeight = content ? textSize + (2 * padding) : 0
	const height = topHeight + titleHeight + contentHeight
	
	const mode = dark ? 'dark' : 'light'
	const bgColor = color[mode].bg
	const lineColor = color[mode].gap
	const titleColor = color[mode].title
	const textColor = color[mode].text_2
	const tipColor = (!type || type == 'default') ? '' : color[type].text
	let popup = new plus.nativeObj.View('popup', {
		width: (windowWidth - (2 * padding)) + 'px',
		height: height + 'px',
		top: -(height + padding) + 'px',
		left: padding + 'px'
	});
	let draws = [{
		tag:'rect',
		id:'bg',
		rectStyles: {
			color: bgColor,
			radius: radius + 'px',
			borderWidth: '2px',
			borderColor: lineColor
		},
		position: {
			top: 0 + 'px',
			left: 0 + 'px',
			width: '100%',
			height: '100%',
		}
	}]
	if ( icon ) {
		draws.push({
			tag:'img',
			id:'icon',
			src: icon,
			position: {
				top: padding + 'px',
				left: padding + 'px',
				width: iconSize + 'px',
				height: iconSize + 'px',
			}
		})
	}
	if ( name ) {
		draws.push({
			tag:'font',
			id:'name',
			text: name || '',
			textStyles: {
				color: titleColor,
				size: textSize + 'px',
				overflow: 'ellipsis',
				align: 'left',
				verticalAlign: 'middle'
			},
			position: {
				top: 0,
				left: (icon ? (2 * padding) + iconSize : padding) + 'px',
				width: ((windowWidth - iconSize) - (2 * padding)) + 'px',
				height: topHeight + 'px',
			}
		})
	}
	if ( title ) {
		draws.push({
			tag:'font',
			id:'title',
			text: title || '',
			textStyles: {
				color: tipColor ? tipColor : titleColor,
				size: titleSize + 'px',
				overflow: 'ellipsis',
				align: 'left',
				verticalAlign: 'middle'
			},
			position: {
				top: topHeight + 'px',
				left: padding + 'px',
				width: (windowWidth - (2 * padding)) + 'px',
				height: titleHeight + 'px',
			}
		})
	}
	if ( content ) {
		draws.push({
			tag:'font',
			id:'content',
			text: content || '',
			textStyles: {
				color: textColor,
				size: textSize + 'px',
				overflow: 'ellipsis',
				align: 'left',
				verticalAlign: 'middle'
			},
			position: {
				top: (topHeight + titleHeight) + 'px',
				left: padding + 'px',
				width: (windowWidth - (2 * padding)) + 'px',
				height: contentHeight + 'px',
			}
		})
	}
	popup.draw(draws)
	
	const complete = function (bol) {
		try{
			timer ? clearTimeout(timer) : null
			timer = null
			popup.close()
			popup = null
			success ? success({
				confirm: bol
			}) : null
		} catch(e){
			fail ? fail(e) : null
		}
	}
	popup.addEventListener("click", (e) => {
		try{
			complete(true)
		} catch(e){
			complete(false)
		}
	})
	popup.show()
	let top = 0
	let max = height + windowBarHeight
	const show = function () {
		setTimeout(function () {
			top += 10
			if ( top >= max ) {
				top = max
				popup.setStyle({
					top: (top - height) + 'px'
				})
				if ( duration > 0 ) {
					timer = setTimeout(() => {
						complete(false)
					}, duration ? duration : 2000)
				}
			} else {
				popup.setStyle({
					top: (top - height) + 'px'
				})
				show()
			}
		}, 10)
	}
	show()
}

export default notification