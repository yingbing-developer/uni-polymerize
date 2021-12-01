import Store from "@/store"

const { getters } = Store

export const Single = function (data) {
	this.id = (data.singleId || '') + '_' + data.source
	this.title = data.title//名称
	this.singleId = data.singleId || '',//歌曲ID
	this.lyricId = data.lyricId || '',//歌词ID
	this.src = data.src ? data.src : getCache(this.id)//播放路径
	this.lyric = data.lyric || ''//歌词
	this.cover = data.cover || '/static/music/music-bg.jpg'//封面
	this.singer = data.singer || '未知歌手'//歌手
	this.desc = data.desc || ''//介绍
	this.payplay = data.payplay || false//是否需要支付播放
	this.num = data.num || 0//播放次数
	this.cache = this.src ? true : false//是否缓存
	this.extra = data.extra || {}//附加字段
	this.type = 'single'//单曲类型
	this.source = data.source//来源
	this.isCollection = function () {
		return isCollection(this.id)
	}
}

export const Album = function (data) {
	this.id = data.albumId + '_' + data.source
	this.albumId = data.albumId//专辑ID
	this.title = data.title//名称
	this.cover = data.cover || '/static/music/music-bg.jpg'//封面
	this.desc = data.desc || ''//介绍
	this.song = data.song || []//单曲集合
	this.creator = data.creator || '不详'//创建者
	this.num = data.num || 0//播放次数
	this.extra = data.extra || {}//附加字段
	this.type = data.type //type包含 top:<排行榜> banner:<轮播图> album:<歌单> newAlbum: <新碟>
	this.source = data.source//来源
	this.isCollection = function () {
		return isCollection(this.id)
	}
}

export const Singer = function (data) {
	this.id = data.singerId + '_' + data.source
	this.singerId = data.singerId//歌手ID
	this.title = data.title//歌手名称
	this.cover = data.cover || '/static/music/music-bg.jpg'//歌手封面
	this.desc = data.desc || ''//歌手介绍
	this.song = data.song || []//单曲集合
	this.albumSize = data.albumSize || 0//专辑数量
	this.extra = data.extra || {}//附加字段
	this.type = 'singer' //歌手类型
	this.source = data.source//来源
	this.isCollection = function () {
		return isCollection(this.id)
	}
}


//是否被收藏
function isCollection (id) {
	const collections = getters['collection/getCollection']
	const index = collections.findIndex(collection => collection.id == id)
	return index > -1
}

//获取缓存
function getCache (id) {
	const caches = getters['cache/getCache']
	const index = caches.findIndex(cache => cache.id == id)
	return index > -1 ? caches[index].url : null
}