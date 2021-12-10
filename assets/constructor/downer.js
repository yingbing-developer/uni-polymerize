import Config from '@/assets/js/config.js'
import Store from '@/store'

const { dispatch } = Store
const { TIMEOUT } = Config

export default class Downer {
	constructor({id, title, src, instance, type, extra, source}) {
	  this.id = id + '_downer'
	  this.parentId = id
	  this.title = title || ''//文件名称
	  this.src = src//下载路径
	  this.savePath = ''//文件下载成功后的保存路径
	  this.progress = ''//下载进度
	  this.instance = null//下载实例
	  this.status = 0//下载状态 <0 未开始> <1 正在下载> <2 下载成功> <3 下载失败>
	  this.type = type || ''
	  this.extra = extra || {}//附加字段
	  this.source = source || ''//下载来源
	}
	init () {
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
								src: this.savePath,
								type: this.type,
								source: this.source
							})
							dispatch('downer/removeTask', this.parentId)
						}
					 });
				} else {
					this.status = 3
					dispatch('downer/removeTask', this.parentId)
				}
			},
			fail: (err) => {
				this.status = 3
				dispatch('downer/removeTask', this.parentId)
			}
		})
		this.status = 1
		this.instance.onProgressUpdate((res) => {
			this.progress = res.progress
		})
	}
	destroy () {
		this.instance ? this.instance.abort() : null
		this.instance = null
	}
}