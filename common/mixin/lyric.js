const lyricMixin = {
	computed: {
		//已播放时长
		player () {
			return this.$store.getters['audio/getPlayer']
		},
		currentSong () {
			return this.$store.getters['audio/getCurrentSong']
		},
		currentTime () {
			return this.$store.getters['audio/getCurrentTime']
		},
		lyric () {
			return this.player ? this.player.lyric : []
		},
		//是否显示歌词
		lyricShow () {
			return this.$store.getters['audio/getLyricShow']
		},
		//当前歌词字符串
		lyricNowTitle () {
			return this.lyric.length > 0 && this.lyricNowIndex > -1 ? this.lyric[this.lyricNowIndex].title.replace('\n', '') : this.currentSong ? this.currentSong.title : '暂无歌曲';
		},
		//当前歌词位置索引
		lyricNowIndex () {
			let len = this.lyric.length;
			let nowLyricTime = 0;
			let prevLyricTime = 0;
			let nextLyricTime = 0;
			for ( let i = 0; i < len; i++ ) {
				nowLyricTime = this.lyric[i].time;
				switch(i) {
				    case 0:
						nextLyricTime = this.lyric[i + 1].time;
				        if ( this.currentTime < nextLyricTime && this.currentTime >= nowLyricTime ) return i;
				        break;
				    case this.lyric.length - 1:
						prevLyricTime = this.lyric[i - 1].time;
				        if ( this.currentTime > prevLyricTime && this.currentTime >= nowLyricTime ) return i;
				        break;
				    default:
						prevLyricTime = this.lyric[i - 1].time;
						nextLyricTime = this.lyric[i + 1].time;
						if ( this.currentTime > prevLyricTime && this.currentTime < nextLyricTime && this.currentTime >= nowLyricTime ) return i;
				}
			}
			return -1;
		}
	}
}
export default lyricMixin;