export default class Song {
	constructor({title, songId, lyricId, commentId, src, lyric, cover, singer, desc, payplay, playnum, extra, source }) {
		this.id = (songId || '') + '_' + source
	  	this.title = title//名称
	  	this.songId = songId || '',//歌曲ID
	  	this.lyricId = lyricId || '',//歌词ID
	  	this.commentId = commentId || '',//评论ID
	  	this.src = src || ''//播放路径
	  	this.lyric = lyric || ''//歌词
	  	this.cover = cover || '/static/music/music-bg.jpg'//封面
	  	this.singer = singer || '未知歌手'//歌手
	  	this.desc = desc || ''//介绍
	  	this.payplay = payplay || false//是否需要支付播放
	  	this.playnum = playnum || 0//播放次数
	  	this.extra = extra || {}//附加字段
	  	this.type = 'song'//单曲类型
	  	this.source = source//来源
	}
}