<template>
</template>

<script>
	let musicLyric
	export default {
		props: {
			//歌词列表
			lyric: {
				type: Array,
				default () {
					return new Array
				}
			},
			//是否展示全局歌词 仅支持app端和h5端
			isShow: {
				type: Boolean,
				default: false
			},
			//当前播放位置
			currentTime: {
				type: Number,
				default: 0
			},
			//没有歌词但要展示全局歌词时的默认文字
			title: {
				type: String,
				default: '暂无歌词'
			},
			//歌词颜色
			fontColor: {
				type: String,
				default: '#2ca2f9'
			},
			//歌词描边颜色
			strokeColor: {
				type: String,
				default: '#333333'
			},
			//歌词大小
			fontSize: {
				type: Number|String,
				default () {
					return uni.upx2px(35)
				}
			},
			//歌词字体
			fontFamily: {
				type: String,
				default: 'Times New Roman'
			},
			//歌词字体文件路径 仅支持app端
			fontSrc: {
				type: String,
				default: ''
			},
			//上下定位 top|bottom 上|下
			verticalAlign: {
				type: String,
				default: 'bottom'
			},
			//定位的偏移量
			offset: {
				type: Number|String,
				default () {
					return uni.upx2px(15)
				}
			}
		},
		computed: {
			//当前歌词字符串
			lyricNowTitle () {
				return this.lyric.length > 0 && this.lyricNowIndex > -1 ? this.lyric[this.lyricNowIndex].title.replace('\n', '') : this.title;
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
			},
			lyricLine () {
				// #ifdef APP-PLUS
				return [{
					tag:'font', id:'lyricBorder', text: this.lyricNowTitle, textStyles: {family: this.fontFamily, fontSrc: this.fontSrc, whiteSpace: 'normal', size: this.fontSize + 'px', color: this.strokeColor, verticalAlign: this.verticalAlign, weight: 'bold'}
				},{
					tag:'font', id:'lyric', text: this.lyricNowTitle, textStyles: {family: this.fontFamily, fontSrc: this.fontSrc, whiteSpace: 'normal', size: this.fontSize + 'px', color: this.fontColor, verticalAlign: this.verticalAlign}
				}]
				// #endif
				// #ifdef H5
				return `<div
				style="
				font-size: ${this.fontSize}px;
				color: ${this.fontColor};
				font-family: ${this.fontFamily};
				font-weight: bold;
				white-space: normal;
				${this.verticalAlign}: ${this.offset}px;
				left: 5%;
				right: 5%;
				text-align: center;
				position: absolute;
				z-index: 99999999999;
				word-break: break-all;
				text-shadow: ${this.strokeColor} .5px 0 0,${this.strokeColor} 0 .5px 0,${this.strokeColor} -0.5px 0 0,${this.strokeColor} 0 -0.5px 0;"
				>${this.lyricNowTitle}</div>`
				// #endif
			}
		},
		created () {
			// #ifdef APP-PLUS || H5
			this.initLyric()
			// #endif
		},
		methods: {
			initLyric () {
				if ( this.isShow && this.lyric ) {
					// #ifdef APP-PLUS
					musicLyric = this.verticalAlign == 'bottom' ? new plus.nativeObj.View('line',{
						bottom: this.offset + 'px',left:'5%', width: '90%'
					}, this.lyricLine) : new plus.nativeObj.View('line',{
						top: this.offset + 'px',left:'5%', width: '90%'
					}, this.lyricLine);
					musicLyric.interceptTouchEvent(false);
					musicLyric.show()
					// #endif
					// #ifdef H5
					let dom = document.createElement('div')
					dom.id = 'yingbing-lyric'
					dom.style = `pointer-events: none;`
					document.body.appendChild(dom)
					musicLyric = document.getElementById('yingbing-lyric')
					musicLyric.innerHTML = this.lyricLine
					// #endif
				}
			},
			drawLyric () {
				if ( musicLyric ) {
					// #ifdef APP-PLUS
					musicLyric.draw(this.lyricLine)
					// #endif
					// #ifdef H5
					musicLyric.innerHTML = this.lyricLine
					// #endif
				}
			},
			destroyLyric () {
				if ( musicLyric ) {
					// #ifdef APP-PLUS
					musicLyric.close();
					// #endif
					// #ifdef H5
					document.body.removeChild(musicLyric)
					// #endif
					musicLyric = null;
				}
				
			}
		},
		watch: {
			isShow (newVal) {
				if ( newVal ) {
					this.destroyLyric()
					this.initLyric();
				} else {
					this.destroyLyric()
				}
			},
			lyricNowIndex: {
				handler (newVal) {
					this.$emit('lyricChange', {
						index: newVal,
						title: this.lyricNowTitle
					})
				}
			},
			lyricNowTitle () {
				this.drawLyric()
			},
			lyric (newVal) {
				if ( newVal ) {
					this.destroyLyric()
					this.initLyric();
				} else {
					this.destroyLyric()
				}
			},
			fontSize () {
				this.drawLyric()
			},
			fontColor () {
				this.drawLyric()
			},
			strokeColor () {
				this.drawLyric()
			},
			offset () {
				this.drawLyric()
			},
			verticalAlign () {
				this.drawLyric()
			}
		},
		beforeDestroy() {
			this.destroyLyric()
		}
	}
</script>

<style>
</style>
