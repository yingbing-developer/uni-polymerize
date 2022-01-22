//下载任务

import Config from '@/assets/js/config.js'
import Store from '@/store'
import NativeUI from '@/js_sdk/yb-native-ui/index.js'

const { getters, dispatch } = Store
const { TIMEOUT } = Config
const { notification } = NativeUI

export default class Downer {
	constructor({id, title, cover, src, instance, type, extra, source}) {
	  this.id = id + '_downer'
	  this.parentId = id
	  this.title = title || ''//文件名称
	  this.cover = cover || ''//封面
	  this.src = src//下载路径
	  this.savePath = ''//文件下载成功后的保存路径
	  this.progress = ''//下载进度
	  this.totalBytes = 0//当前下载量
	  this.allBytes = 0//下载总量
	  this.instance = null//下载实例
	  this.status = 0//下载状态 <0 未开始> <1 正在下载> <2 下载成功> <3 下载失败>
	  this.type = type || ''
	  this.extra = extra || {}//附加字段
	  this.source = source || ''//下载来源
	}
	init () {
		const skinMode = getters['app/skinMode']
		notification({
			icon: '/static/logo.png',
			name: '好用聚合',
			title: '歌曲下载',
			content: '成功创建下载任务',
			duration: 3000,
			dark: skinMode == 'night',
			success: (res) => {
				if ( res.confirm ) {
					uni.navigateTo({
						url: '/pages/user/download'
					})
				}
			}
		})
		this.instance = uni.downloadFile({
			url: this.src,
			timeout: TIMEOUT,
			success: (res) => {
				if ( res.statusCode == 200 ) {
					uni.saveFile({
						tempFilePath: res.tempFilePath,
						success: (ret) => {
							this.status = 2
							this.savePath = ret.savedFilePath;
							dispatch('cache/addCache', {
								id: this.parentId,
								title: this.title,
								cover: this.cover,
								src: this.savePath,
								bytes: this.allBytes,
								type: this.type,
								source: this.source
							})
							notification({
								icon: '/static/logo.png',
								name: '好用聚合',
								title: '任务成功',
								type: 'success',
								content: '歌曲下载成功',
								duration: 3000,
								dark: skinMode == 'night'
							})
							dispatch('downer/removeTask', this.id)
						}
					 });
				} else {
					this.status = 3
					notification({
						icon: '/static/logo.png',
						name: '好用聚合',
						title: '任务失败',
						type: 'error',
						content: '歌曲下载失败',
						duration: 3000,
						dark: skinMode == 'night'
					})
					dispatch('downer/removeTask', this.id)
				}
			},
			fail: (err) => {
				this.status = 3
				notification({
					icon: '/static/logo.png',
					name: '好用聚合',
					title: '任务失败',
					type: 'error',
					content: '歌曲下载失败',
					duration: 3000,
					dark: skinMode == 'night'
				})
				dispatch('downer/removeTask', this.id)
			}
		})
		this.status = 1
		this.instance.onProgressUpdate((res) => {
			this.progress = res.progress
			this.totalBytes = res.totalBytesWritten
			this.allBytes = res.totalBytesExpectedToWrite
		})
	}
	destroy () {
		this.instance && this.status == 1 ? this.instance.abort() : null
		this.instance = null
	}
}