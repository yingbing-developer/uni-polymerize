<template>
	<yingbing-lyric
	v-if="lyricModel != 'close' && currentSong"
	:isShow="lyricModel == 'overall'"
	:lyric="lyric"
	:fontColor="fontColor"
	:strokeColor="strokeColor"
	:fontSize="fontSize"
	:verticalAlign="verticalAlign"
	:offset="offset"
	:title="lyricDefaultTitle"
	:currentTime="currentTime"
	@lyricChange="lyricChange"></yingbing-lyric>
</template>
<script>
	let instance;
	export default {
		props: {
			//播放列表
			playList: {
				type: Array,
				default () { 
					return new Array
				}
			},
			//是否暂停
			paused: {
				type: Boolean,
				default: true
			},
			//是否后台播放 仅app有效
			playback: {
				type: Boolean,
				default: false
			},
			//播放倍率
			playbackRate: {
				type: Number,
				default: 1.0
			},
			//音量
			volume: {
				type: Number,
				default: 1
			},
			//播放开始位置
			startTime: {
				type: Number,
				default: 0
			},
			//播放模式 round|random|loop 顺序|随机|循环
			playMode: {
				type: String,
				default: 'round'
			},
			//歌词模式 close|hidden|overall 不计算也不显示全局歌词|隐藏全局歌词但计算歌词|计算并显示全局歌词
			lyricModel: {
				type: String,
				default: 'close'
			},
			//没有歌词但要展示全局歌词时的默认文字
			lyricDefaultTitle: {
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
		data () {
			return {
				//随机播放歌曲
				randomList: [],
				//当前播放歌曲信息
				currentSong: null,
				//当前播放位置
				currentTime: 0,
				//当前播放歌曲的歌词
				lyric: []
			}
		},
		computed: {
			playListWatch () {
			    return JSON.parse(JSON.stringify(this.playList));
			}
		},
		created() {
			if ( this.playList ) {
				this.initRandomList()
			}
		},
		beforeDestroy() {
			this.stop()
		},
		methods: {
			//初始化音乐
			init (song) {
				this.stop()
				this.currentSong = song
				instance = uni.createInnerAudioContext()
				instance.playbackRate = this.playbackRate
				instance.volume = this.volume
				instance.sessionCategory = this.playback ? 'playback' : 'ambient'
				instance.startTime = this.startTime
				if ( song.src ) {
					instance.src = song.src
					this.play()
				}
				this.lyric = song.lyric || []
				this.$emit('currentChange', song, ({src, lyric}) => {
					if ( src ) {
						instance.src = src
						this.play()
					}
					if ( lyric && lyric.length > 0 ) {
						this.lyric = lyric
					}
				})
				instance.onCanplay(() => {
					this.$emit('onCanplay', Object.assign({}, song, {
						duration: instance.duration
					}))
				})
				instance.onPlay(() => {
					this.$emit('onPlay')
				})
				instance.onPause(() => {
					this.$emit('onPause')
				})
				instance.onStop(() => {
					this.$emit('onStop')
				})
				instance.onEnded(() => {
					this.$emit('onEnded')
					if ( this.playMode == 'loop' ) {
						this.seek(0)
						this.play()
					} else {
						this.next()
					}
				})
				instance.onError(() => {
					this.$emit('onError')
				})
				instance.onTimeUpdate(() => {
					this.currentTime = instance.currentTime
					this.$emit('onTimeUpdate', instance.currentTime)
				})
				instance.onWaiting(() => {
					this.$emit('onWaiting')
				})
				instance.onSeeking(() => {
					this.$emit('onSeeking', instance.currentTime)
				})
				instance.onSeeked(() => {
					this.$emit('onSeeked', instance.currentTime)
				})
			},
			//播放音乐
			play () {
				if ( instance && instance.src ) {
					instance.paused ? instance.play() : null
				} else {
					if ( this.playList.length > 0 ) {
						this.next()
					}else {
						throw new Error('playList is empty')
					}
				} 
			},
			//暂停音乐
			pause () {
				instance && instance.src && !instance.paused ? instance.pause() : null
			},
			//停止音乐
			stop () {
				if ( instance && instance.src ) {
					this.currentSong = null
					this.lyric = []
					instance.destroy()
					instance = null
					// #ifdef APP-PLUS
					this.$emit('onStop')
					// #endif
				}
			},
			//跳转播放位置
			seek (seconds) {
				instance && instance.src && instance.duration > seconds ? instance.seek(seconds) : null
			},
			//指定id歌曲播放
			change (id) {
				let index = this.playList.findIndex(song => song.id == id);
				index > -1 ? this.init(this.playList[index]) : null
			},
			//播放上一首
			prev () {
				let playOrder = this.playMode == 'random' ? this.randomList : this.playList
				let orderSong = this.currentSong ? this.getOrderSong(playOrder, this.currentSong, 'prev') : null
				if ( orderSong ) {
					this.init(orderSong)
				} else if ( this.playList.length > 0 ) {
					this.init(this.playMode == 'random' ? this.randomList[0] : this.playList[0])
				} else {
					throw new Error('playList is empty')
				}
			},
			//播放下一首
			next () {
				let playOrder = this.playMode == 'random' ? this.randomList : this.playList
				let orderSong = this.currentSong ? this.getOrderSong(playOrder, this.currentSong, 'next') : null
				if ( orderSong ) {
					this.init(orderSong)
				} else if ( this.playList.length > 0 ) {
					this.init(this.playMode == 'random' ? this.randomList[0] : this.playList[0])
				} else {
					throw new Error('playList is empty')
				}
			},
			initRandomList () {
				const arr = this.randomSoleNumber(this.playList.length)
				this.randomList = []
				arr.forEach(index => {
					this.randomList.push(this.playList[index])
				})
			},
			//获取订单歌曲
			getOrderSong (list, song, order) {
				let currentIndex = list.findIndex(order => order.id == song.id)
				let nextIndex = 0
				if ( order == 'prev' ) {
					nextIndex = (currentIndex - 1 >= 0 ) ? currentIndex - 1 : list.length - 1
				} else {
					nextIndex = (currentIndex + 1 > list.length - 1) ? 0 : currentIndex + 1
				}
				return list[nextIndex]
			},
			//随机生成一组指定长度的循环不重复的数组
			randomSoleNumber (len) {
				let min = 0;
				let max = len - 1;
				let arr = [];
				while ( arr.length < len ) {
					let value = Math.floor(Math.random() * (max - min + 1)) + min;
					if ( arr.indexOf(value) == -1 ) {
						arr.push( value )
					}
				}
				return arr;
			},
			lyricChange (e) {
				this.$emit('lyricChange', e)
			}
		},
		watch: {
			playbackRate ( newVal ) {
				instance ? instance.playbackRate = newVal : null
			},
			volume ( newVal ) {
				instance ? instance.volume = newVal : null
			},
			playback ( newVal ) {
				instance ? (instance.sessionCategory = newVal ? 'playback' : 'ambient') : null
			},
			startTime ( newVal ) {
				instance ? instance.startTime = newVal : null
			},
			paused ( newVal ) {
				if ( newVal ) {
					this.pause()
				} else {
					this.play()
				}
			},
			playListWatch (newVal, oldVal) {
				if ( newVal.length > 0 ) {
					let arr1 = newVal.filter(item => oldVal.findIndex(oldItem => oldItem.id == item.id) == -1 )//新增的歌曲
					let arr2 = oldVal.filter(item => newVal.findIndex(oldItem => oldItem.id == item.id) == -1 )//删除的歌曲
					let deleteIndex = arr2.findIndex(re => re.id == this.currentSong?.id)
					//如果删除的歌曲中有正在播放的歌曲则切换到下一首播放
					if ( deleteIndex > -1 ) {
						let unique = oldVal.concat(newVal)
						let obj = {};
						unique = unique.reduce((item, next) => {
						    obj[next.id] ? '' : obj[next.id] = true && item.push(next);
						    return item;
						}, []);
						unique = unique.filter(item => arr2.findIndex(oItem => oItem.id == item.id) == -1 || item.id == this.currentSong?.id)
						this.init(this.getOrderSong(unique, this.currentSong, 'next'))
					}
					let randomList = this.randomList.filter(order => arr2.findIndex(item => item.id == order.id) == -1)
					const rnd = this.randomSoleNumber(arr1.length)
					rnd.forEach(num => {
						let index = Math.floor(Math.random() * randomList.length);
						randomList.splice(index, 0, arr1[num])
					})
					this.randomList = randomList
				} else {
					this.randomList = []
					this.stop()
				}
			}
		}
	}
</script>
<style>
</style>
