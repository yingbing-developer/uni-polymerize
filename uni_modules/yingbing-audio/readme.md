#使用须知

* 1、这是一个音乐播放器，支持歌曲切换，随机播放，单曲循环，全局歌词显示等功能，但没有UI样式
* 2、这个插件理论上支持所有端，但全局歌词显示只支持app端和h5端
* 3、请注意下面一些事件中的下横杠实际是没有的，比如on_Play, 不知道为什么直接写出来会给我吃掉,所以只能加上下横杠
* 4、这个插件是利用[uni.createInnerAudioContext()](https://uniapp.dcloud.io/api/media/audio-context.html)来实现播放歌曲的，所以后台播放仅支持app，且要App 3.3.7+以上的版本才支持

#props属性
| 属性名 | 类型 | 默认值 | 可选值 | 说明 |
| :----- | :----: | :----: | :----: | :---- |
| playList | Array | [] | 自定义 | 播放列表 |
| autoplay | Boolean | false | true/false | 添加歌曲并且当前没有播放歌曲时是否自动播放 |
| paused | Boolean | true | true/false | 是否暂停 |
| playback | Boolean | false | true/false | 是否开启后台播放（仅app端支持） |
| playbackRate | Number | 1.0 | 0.5/0.8/1.0/1.25/1.5/2.0 | 音频播放倍率（H5不支持，其它端需要版本支持具体看官方api文档[uni.createInnerAudioContext()](https://uniapp.dcloud.io/api/media/audio-context.html)） |
| volume | Number | 1 | 0-1 | 音量 |
| startTime | Number | 0 | 自定义 | 音频播放的开始位置 |
| playMode | String | round | round/loop/random | 播放模式（round：顺序播放；loop：单曲循环；random：随机播放） |
| lyricModel | String | close | close/hidden/overall | 歌词模式（close：不计算也不显示歌词；hidden：隐藏全局歌词但计算歌词；overall：计算并显示全局歌词） |
| lyricDefaultTitle | String | 暂无歌词 | 自定义 | 开启全局歌词显示，但没有歌词时显示的默认文字 |
| fontColor | String | #2ca2f9 | 自定义 | 歌词颜色 |
| strokeColor | String | #333333 | 自定义 | 歌词描边颜色 |
| fontSize | Number | uni.upx2px(35) | 自定义 | 歌词大小 |
| fontFamily | String | Times New Roman | 自定义 | 歌词字体 |
| fontSrc | String | 无 | 自定义 | 歌词字体文件路径（仅支持app端） |
| verticalAlign | String | bottom | top/bottom | 歌词上下停靠位置 |
| offset | Number | uni.upx2px(15) | 自定义 | 歌词定位的偏移量 |

#event事件
| 事件名 | 参数 | 说明 |
| :----- | :----: | :---- |
| currentChange | 歌曲信息,callback({src: 播放链接, lyric: 歌词列表}) | 音频切换事件 |
| lyricChange | {index: 当前歌词的索引, title: 当前歌词} | 歌词变化事件 |
| on_Canplay | 歌曲信息 | 音频进入可以播放状态，但不保证后面可以流畅播放，音频总长度可以从这里取到 |
| on_Play | 无 | 音频播放事件 |
| on_Pause | 无 | 音频暂停事件 |
| on_Stop | 无 | 音频停止事件 |
| on_Ended | 无 | 音频自然播放结束事件 |
| on_Error | 无 | 音频播放错误事件 |
| on_TimeUpdate | 无 | 音频播放进度更新事件 |
| on_Waiting | 无 | 音频加载中事件，当音频因为数据不足，需要停下来加载时会触发 |
| on_Seeking | 无 | 音频进行 seek 操作事件 |
| on_Seeked | 无 | 音频完成 seek 操作事件 |

#章节模式 内置方法
| 方法名 | 参数 | 说明 |
| :----- | :---- | :---- |
| play | 无 | 播放音频 |
| pause | 无 | 暂停音频 |
| stop | 无 | 停止音频 |
| seek | 秒数 | 跳转音频位置（单位是s） |
| change | id | 切换指定id的音频 |
| prev | 无 | 切换上一首音频 |
| next | 无 | 切换下一首音频 |

#播放列表
```javascript
let playList = [{
	id: '10000',//歌曲的唯一id，必须添加
	name: '一梦千朝',//非必传参数
	singer: '洛天依',//非必传参数
	src: '/static/001.m4a', //播放路径 非必传参数，不传的话，可以通过currentChange中的回调事件传入播放链接
	lyric: [{ //歌词列表 非必传参数，不传的话，可以通过currentChange中的回调事件传入歌词列表
		time: '0',//歌词显示的时间（单位是s）
		title: '这是第一句歌词'//歌词文本
	},{
		time: '5',
		title: '这是第二句歌词'
	},{
		time: '8',
		title: '这是第三句歌词'
	}]
},{
	id: '10001',
	name: '世末歌者',
	singer: '洛天依',
},{
	id: '10002',
	name: '大氿歌',
	singer: '洛天依',
}]
```

#使用方法
```html
	<yingbing-audio
	:playList="playList"
	:paused="paused"
	:playMode="playMode"
	:lyricModel="lyricModel"
	@currentChange="currentChange"
	@lyricChange="lyricChange"
	@on_Canplay="onCanplay"
	@on_Play="onPlay"
	></yingbing-audio>
```
```javascript
export default {
	data() {
		return {
			playList: [{
				id: '10000',
				name: '一梦千朝',
				singer: '洛天依',
				src: '/static/001.m4a'
			},{
				id: '10001',
				name: '世末歌者',
				singer: '洛天依',
				src: '/static/001.m4a'
			},{
				id: '10002',
				name: '大氿歌',
				singer: '洛天依',
				src: '/static/001.m4a'
			}],
			paused: true,
			playMode: 'round',
			lyricModel: 'overall'
		}
	},
	methods: {
		currentChange (e, callback) {
			console.log(e)
			setTimeout(() => {
				callback({
					src: '/static/001.m4a',
					lyric: [{
						time: '0',//歌词显示的时间（单位是s）
						title: '这是第一句歌词'//歌词文本
					},{
						time: '5',
						title: '这是第二句歌词'
					},{
						time: '8',
						title: '这是第三句歌词'
					}]
				})
			}, 500)
		},
		lyricChange (e) {
			console.log(e);
		},
		on_Canplay () {
			console.log('准备播放');
		},
		on_Play () {
			console.log('播放');
		}
	}
}
```