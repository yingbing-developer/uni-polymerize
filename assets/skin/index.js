import SkinDefault from "./default/skin.js"
import SkinNight from "./night/skin.js"

//常用颜色
const colors = {
	color_green: '#21C088',
	color_red: '#FF3B30',
	color_red_2: '#d43c33',
	color_blue: '#2ca2f9',
	color_white: '#FAFAFA',
	color_black: '#191919',
	color_orange: '#ff962f',
	color_yellow: '#FFCA28',
	color_cyan: '#16c2c2'
}

Object.keys(colors).forEach(key => {
	SkinDefault[key] = colors[key],
	SkinNight[key] = colors[key]
})

export default {
	'default': SkinDefault,
	'night': SkinNight
}