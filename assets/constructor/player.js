import Api from '@/assets/api/music/api.js'
import Config from '@/assets/js/config.js'
const { ERR_OK } = Config

export default class Player {
	constructor(song) {
		this.singleId = song.singleId || ''
		this.lyricId = song.lyricId || ''
		this.src = song.src || ''
		this.lyric = song.lyric || ''
		this.instance = null
		this.source = song.source
	}
	async init() {
		let arr = []
		this.instance = uni.createInnerAudioContext()
		this.singleId && !this.src ? arr.push(Api[this.source].getPlayUrl({
			id: this.singleId,
			source: this.source
		})) : this.instance.src = this.src;
		this.lyricId && !this.lyric ? arr.push(Api[this.source].getLyric({
			id: this.lyricId,
			source: this.source
		})) : null
		return arr.length > 0 ? await Promise.all(arr).then((ress) => {
			ress.forEach((res, key) => {
				if ( res.code == ERR_OK ) {
					if ( key == 0 ) {
						this.instance.src = res.data.src;
						this.src = res.data.src
					} else {
						this.lyric = res.data.lyric
					}
				}
			})
			return this.src ? true : false
		}).catch(() => {
			return false
		}) : true
	}
	destroy() {
		this.instance.stop()
		this.instance.destroy()
		this.instance = null
	}
}
