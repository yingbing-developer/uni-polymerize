import Api from '@/assets/api/music/api.js'
import Config from '@/assets/js/config.js'
const { ERR_OK } = Config

export default class Player {
	constructor(song) {
		this.singleId = song.singleId || ''
		this.lyricId = song.lyricId || ''
		this.src = song.src || ''
		this.lyric = song.lyric || ''
		this.song = song
		this.instance = null
	}
	async init() {
		let arr = []
		this.instance = uni.createInnerAudioContext()
		// this.instance.title = this.song.title;
		// this.instance.singer = this.song.singer;
		// this.instance.coverImgUrl = this.song.cover;
		this.singleId && !this.src ? arr.push(Api[this.song.source].getPlayUrl({
			id: this.singleId,
			source: this.song.source
		})) : this.instance.src = this.src;
		this.lyricId && !this.lyric ? arr.push(Api[this.song.source].getLyric({
			id: this.lyricId,
			source: this.song.source
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
		// this.instance.title = null
		// this.instance.singer = null
		// this.instance.coverImgUrl = null
		// this.instance.src = null
	}
}
