export default class Singer {
	constructor({singerId, title, cover, desc, song, albumSize, extra, source}) {
		this.id = singerId + '_' + source
	  	this.singerId = singerId//歌手ID
	  	this.title = title//歌手名称
	  	this.cover = cover || '/static/music/music-bg.jpg'//歌手封面
	  	this.desc = desc || ''//歌手介绍
	  	this.song = song || []//单曲集合
	  	this.albumSize = albumSize || 0//专辑数量
	  	this.extra = extra || {}//附加字段
	  	this.type = 'singer' //歌手类型
	  	this.source = source//来源
	}
}