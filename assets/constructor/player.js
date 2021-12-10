import Api from '@/assets/api/music/api.js'
import Config from '@/assets/js/config.js'
import Store from "@/store"

const { getters, dispatch } = Store
const { ERR_OK } = Config

export default class Player {
	constructor(song) {
		this.id = song.id
		this.songId = song.songId || ''
		this.lyricId = song.lyricId || ''
		this.src = song.src || getCache(this.id)
		this.lyric = song.lyric || ''
		this.instance = null
		this.source = song.source
	}
	async init() {
		let arr = []
		this.instance = uni.createInnerAudioContext()
		this.songId && !this.src ? arr.push(Api[this.source].getPlayUrl({
			id: this.songId,
			source: this.source
		})) : this.instance.src = this.src;
		this.lyricId && !this.lyric ? arr.push(Api[this.source].getLyric({
			id: this.lyricId,
			source: this.source
		})) : null
		return arr.length > 0 ? await Promise.all(arr).then((ress) => {
			ress.forEach((res, key) => {
				if ( res.code == ERR_OK ) {
					if ( res.data.src ) {
						this.src = res.data.src
					}
					if ( res.data.lyric ){
						this.lyric = res.data.lyric
					}
				}
			})
			this.src ? this.instance.src = this.src : null
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

//获取缓存
function getCache (id) {
	const caches = getters['cache/getCache']
	const index = caches.findIndex(cache => cache.parentId == id)
	if ( index > -1 ) {
		const src = plus.io.convertLocalFileSystemURL(caches[index].src);
		const file = plus.android.newObject('java.io.File', src);
		if ( plus.android.invoke(file, 'exists') ) {
			return src
		} else {
			dispatch('cache/removeCache', id)
		}
	}
	return null
}
