export default class Album {
	constructor({albumId, commentId, title, cover, desc, song, creator, playnum, extra, type, source}) {
		this.id = albumId + '_' + source
		this.albumId = albumId //专辑ID
		this.commentId = commentId || '', //评论ID
		this.title = title //名称
		this.cover = cover || '/static/music/music-bg.jpg' //封面
		this.desc = desc || '' //介绍
		this.song = song || [] //单曲集合
		this.creator = creator || '不详' //创建者
		this.playnum = playnum || 0 //播放次数
		this.extra = extra || {} //附加字段
		this.type = type //type包含 top:<排行榜> banner:<轮播图> album:<歌单> newAlbum: <新碟>
		this.source = source //来源
	}
}
