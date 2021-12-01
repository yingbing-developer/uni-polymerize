let touchtime = 0
let touchtimer = null

const windowWidth = uni.getSystemInfoSync().screenWidth
const windowHeight = uni.getSystemInfoSync().screenHeight

function create ({ size, left, top, text, border, touch, func, dark }) {
	const btn = new plus.nativeObj.View('overall-btn', {
		width: size + 'px',
		height: size + 'px',
		top: top + 'px',
		left: left + 'px'
	});
	drawRect(btn, size, border || 5, dark || false)
	if ( text ) {
		drawText(btn, text, dark || false)
	}
	if ( touch ) {
		btn.addEventListener("touchstart", (e) => {
			touchtimer = setInterval(() => {
				touchtime += 50
			}, 50)
		});
		btn.addEventListener("touchmove", (e) => {
			top = e.pageY - (size / 2)
			left = e.pageX - (size / 2)
			if ( top < 0 ) top = 0
			if ( top > windowHeight - size ) top = windowHeight - size
			if ( left < 0 ) left = 0
			if ( left > windowWidth - size ) left = windowWidth - size
			btn.setStyle({top: top + 'px', left: left + 'px'})
		});
		btn.addEventListener("touchend", (e) => {
			clearInterval(touchtimer)
			if ( touchtime < 200 && func ) {
				e.top = top
				e.left = left
				func(e)
			}
			touchtime = 0
			touchtimer = null
		});
	} else {
		if ( func ) {
			btn.addEventListener("click", (e) => {
				func(e)
			});
		}
	}
	return {
		show: () => {
			return btn.show()
		},
		hide: () => {
			return btn.hide()
		},
		close: () => {
			return btn.close()
		},
		draw: (text) => {
			drawText(btn, text, dark || false)
		},
		reset: ({dark}) => {
			drawRect(btn, size, border, dark || false)
		}
	}
}

function drawRect ( btn, size, border, dark ) {
	const opacity = 0.3
	const bgColor = dark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`
	const borderColor = dark ? `rgba(50,50,50,${opacity})` : `rgba(225,225,225,${opacity})`
	btn.draw([{
		tag:'rect',
		id:'bg',
		rectStyles: {
			color: bgColor,
			radius: size + 'px',
			borderColor: borderColor,
			borderWidth: border + 'px',
		},
		position: {
			top: (border / 2) + 'px',
			left: (border / 2) + 'px',
			width: (size - border) + 'px',
			height: (size - border) + 'px',
		}
	}])
}

function drawText ( btn, text, dark ) {
	const color = dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'
	btn.draw([{
		tag:'font', id:'text', text: text,
		textStyles: {
			size: (size / 2) + 'px',
			color: color,
			verticalAlign: 'middle',
			weight: 'bold',
			align: 'center'
		}
	}])
}

export default create