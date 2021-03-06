<template>
	<yb-page-anime touch>
		<yingbing-ReadPage
		ref="page"
		:page-type="pageType"
		:font-size="fontSize"
		:line-height="lineHeight"
		:color="skinColor.color_read_text"
		:bg-color="skinColor.color_read_bg"
		:slide="40"
		:top-gap="barHeight"
		:bottom-gap="barHeight"
		:no-chapter="reader.source == 'local'"
		enablePreload
		enableClick
		@clickTo="openSettingNvue"
		@currentChange="savePageRecord"
		@setCatalog="setCatalog"
		@preload="preloadContent"
		@loadmore="loadmoreContent">
		</yingbing-ReadPage>
		<view class="progress" :style="{color: skinColor.color_white, 'background-color': progressBg}">
			{{tipText}}
		</view>
	</yb-page-anime>
</template>

<script>
	import appMixin from '@/common/mixin/app.js'
	export default {
		mixins: [appMixin],
		data () {
			return {
				//文本内容
				bookContent: '',
				barHeight: 0,
				chapters: [],
				currentChapter: 0,
				currentPage: 1,
				currentContent: [],
				totalPage: 1,
				pageStart: 0,
				pageEnd: 0
			}
		},
		computed: {
			reader () {
				return this.$store.getters['reader/getReader']
			},
			fontSize () {
				return this.$store.getters['reader/getFontSize']
			},
			pageType () {
				return this.$store.getters['reader/getPageType']
			},
			lineHeight () {
				return this.$store.getters['reader/getLineHeight']
			},
			recorder () {
				let index = this.$store.getters['record/getRecord'].findIndex(record => record.id == this.reader.id)
				return index > -1 ? this.$store.getters['record/getRecord'][index] : null
			},
			record () {
				return this.recorder?.record || {}
			},
			mark () {
				return this.recorder?.mark || []
			},
			mark () {
				let index = this.$store.getters['record/getRecord'].findIndex(record => record.id == this.reader.id)
				return index > -1 ? this.$store.getters['record/getRecord'][index].mark : []
			},
			progressBg () {
				let bg = this.$utils.hex2rgb(this.skinColor.color_black);
				bg = bg.match(/rgb\((\S*)\)/)[1]
				bg = `rgba(${bg},0.5)`
				return bg
			},
			tipText () {
				if ( this.reader.source == 'local' ) {
					return this.reader.book.title.slice(0, 40) + (this.reader.book.title.length > 40 ? '......' : '') + ' ' + (this.record.progress || 0) + '%'
				} else {
					return this.record.title ? (this.record.title?.slice(0, 40) + (this.record.title?.length > 40 ? '......' : '') + ' ' + this.currentPage + '/' + this.totalPage) : '加载中...'
				}
			}
		},
		beforeCreate () {
			//监听页面跳转
			uni.$on('change-page', (data) => {
				if ( this.reader.source == 'local' ) {
					this.$refs.page.change({
						start: data.percent >= 0 ? (data.percent / 100) * this.bookContent.length : data.start
					})
				} else {
					uni.showLoading({
						title: '加载中',
						mask: true
					})
					let chapters = this.reader.chapters.filter(item => data.chapter == item.chapter || data.chapter + 1 == item.chapter  || data.chapter - 1 == item.chapter)
					this.getOnlineContent(chapters).then((res) => {
						uni.hideLoading()
						if ( res.code == this.$config.ERR_OK ) {
							this.$refs.page.change({
								contents: res.data.contents,
								currentChapter: data.chapter,
								start: data.start ? data.start : 0
							})
						} else {
							uni.showToast({
								title: '加载失败',
								icon: 'none'
							})
						}
					})
				}
			})
			//监听页面编辑
			uni.$on('edit-page', (data) => {
				if ( this.reader.source == 'local' ) {
					this.openEditNvue()
				}
			})
			//监听页面添加书签
			uni.$on('inc-mark', (data) => {
				this.addBookmark()
			})
		},
		beforeDestroy () {
			uni.$off('change-page')
			uni.$off('edit-page')
			uni.$off('inc-mark')
		},
		onUnload() {
		   uni.$off('change-page')
		   uni.$off('edit-page')
		   uni.$off('inc-mark')
		},
		onLoad() {
			if ( !this.reader ) {
				this.app.$Router.back()
				return
			}
			this.barHeight = uni.getSystemInfoSync().statusBarHeight + 4
			this.currentChapter = this.$Route.query.currentChapter
		},
		onReady() {
			setTimeout(() => {
				if ( this.reader.source == 'local' ) {
					this.getLocalContent();
				} else {
					let chapters = this.reader.chapters.filter(item => this.currentChapter == item.chapter || this.currentChapter + 1 == item.chapter  || this.currentChapter - 1 == item.chapter)
					this.getOnlineContent(chapters).then((res) => {
						if ( res.code == this.$config.ERR_OK ) {
							this.$refs.page.init({
								contents: res.data.contents,
								currentChapter: this.currentChapter,
								start: this.record ? (this.currentChapter == this.record.chapter ? parseInt(this.record.start) : 0) : 0
							})
						} else {
							uni.showToast({
								title: '加载失败',
								icon: 'none'
							})
						}
					})
				}
			}, 100)
		},
		methods: {
			//获取本地小说内容
			getLocalContent () {
				let Reader = uni.requireNativePlugin('YingBingNativePlugin-Reader');
				this.bookContent = Reader.readAllLines(this.reader.book.src);
				//初始化页面
				this.$refs.page.init({
					content: this.bookContent,
					start: this.record.start || 0,
					title: this.reader.book.title
				})
				Reader = null;
			},
			//获取在线小说内容
			async getOnlineContent (chapters) {
				let https = []
				chapters.forEach(item => {
					if ( item.payread ) {
						https.push(
							Promise.resolve({
								code: this.app.$config.ERR_OK,
								data: {
									content: {
										chapter: item.chapter,
										content: item.title + '\r\n该章节已锁，如果想看请支持正版\r\n\r\n\r\n该章节已锁，如果想看请支持正版\r\n\r\n\r\n该章节已锁，如果想看请支持正版',
										title: item.title,
										isStart: item.isStart,
										isEnd: item.isEnd
									},
									source: item.source
								}
							})
						)
					} else {
						https.push(this.$api.book.getContent(item))
					}
				})
				return await Promise.all(https).then((ress) => {
					let contents = []
					ress.forEach(res => {
						if ( res.code == this.app.$config.ERR_OK ) {
							contents.push(res.data.content)
						}
					})
					return {
						code: contents.length > 0 ? this.app.$config.ERR_OK : this.app.$config.ERR_FALSE,
						data: {
							contents: contents
						}
					}
				})
			},
			openSettingNvue () {
				this.app.$Router.push({
					path: '/pages/book/setting'
				})
			},
			openEditNvue () {
				uni.navigateTo({
					url: `/modules/edit?content=${encodeURIComponent(this.bookContent.substring(this.pageStart, this.pageEnd))}&start=${this.pageStart}&end=${this.pageEnd}`,
					complete: (res) => {
						setTimeout(() => {
							uni.$once('edit', (data) => {
								if ( data.confirm ) {
									let content = this.bookContent.substr(0, data.start) + data.content + this.bookContent.substr(parseInt(data.end));
									this.bookContent = content;
									this.$refs.page.init({
										content: this.bookContent,
										start: this.record.start || 0,
										title: this.reader.book.title
									})
									this.saveTxt();
								}
								getApp().globalData.$Router.back();
								uni.$off('edit');
							})
						}, 60)
					}
				});
			},
			//保存文件
			saveTxt () {
				uni.showLoading({
					title: '保存内容中',
					mask: true
				})
				let file = plus.android.newObject("java.io.File", this.reader.book.src);
				if ( file != null && plus.android.invoke(file, 'exists') ) {
					plus.android.invoke(file, 'createNewFile');
					let fileOutputStream = plus.android.newObject("java.io.FileOutputStream", file);
					let outputStreamWriter = plus.android.newObject("java.io.OutputStreamWriter", fileOutputStream, "gb2312");
					let bufferedWriter = plus.android.newObject("java.io.BufferedWriter", outputStreamWriter);
					plus.android.invoke(bufferedWriter, 'write', this.bookContent);
					plus.android.invoke(bufferedWriter, 'close');
				} else {
					uni.showToast({
						title: '文件不存在或者不能被操作',
						icon: 'none'
					})
				}
				uni.hideLoading();
			},
			//添加书签
			addBookmark () {
				let book = {...this.recorder}
				let mark = [...this.mark]
				if ( this.reader.source == 'local' ) {
					if ( mark.findIndex(item => item.start == this.pageStart) > -1 ) {
						uni.showToast({
							title: '该书签已成功添加',
							icon: 'none'
						})
					} else {
						mark.push({
							title: this.currentContent.slice(0, 30),
							start: this.pageStart,
							chapter: this.record.chapter
						})
						book.mark = mark
						this.$store.dispatch('record/addRecord', book)
						uni.showToast({
							title: '添加书签成功',
							icon: 'none'
						})
					}
				} else {
					if ( mark.findIndex(item => item.start == this.pageStart && item.chapter == this.record.chapter) > -1 ) {
						uni.showToast({
							title: '该书签已成功添加',
							icon: 'none'
						})
					} else {
						mark.push({
							title: this.currentContent.toString().replace(/,/g, ''),
							start: this.pageStart,
							chapter: this.record.chapter
						})
						book.mark = mark
						this.$store.dispatch('record/addRecord', book)
						uni.showToast({
							title: '添加书签成功',
							icon: 'none'
						})
					}
				}
				book = null
				mark = null
			},
			savePageRecord (e) {
				if ( this.reader.source != 'local' ) {
					this.currentPage = e.currentPage
					this.totalPage = e.totalPage
				}
				this.pageStart = e.start
				this.pageEnd = e.end
				this.currentContent = e.text
				let book = this.recorder ? {...this.recorder} : {...this.reader.book}
				let chapterIndex = this.reader.chapters.findIndex(item => item.chapter == e.chapter)
				book.record = {
					chapter: e.chapter,
					start: e.start,
					title: e.title,
					progress: this.reader.source == 'local' ? parseFloat(((e.start / this.bookContent.length) * 100).toFixed(2)) : parseFloat((((chapterIndex + 1) / this.reader.chapters.length) * 100).toFixed(2)),
				}
				this.$store.dispatch('record/addRecord', book)
				book = null
			},
			setCatalog (e) {
				let reader = {...this.reader}
				reader.chapters = e
				this.$store.dispatch('reader/init', reader)
				reader = null
			},
			preloadContent (chapters, callback) {
				const data = this.reader.chapters.filter(item => chapters.indexOf(item.chapter) > -1)
				this.getOnlineContent(data).then((res) => {
					if ( res.code == this.$config.ERR_OK ) {
						callback('success', res.data.contents)
					} else {
						callback('fail');
					}
				}).catch(() => {
					callback('fail');
				})
			},
			loadmoreContent (chapter, callback) {
				const data = this.reader.chapters.filter(item => item.chapter == chapter)
				this.getOnlineContent(data).then((res) => {
					if ( res.code == this.$config.ERR_OK ) {
						callback('success', res.data.contents[0])
					} else {
						callback('fail');
					}
				}).catch(() => {
					callback('fail');
				})
			}
		}
	}
</script>

<style scoped>
	.progress {
		position: absolute;
		left: 15rpx;
		bottom: 20rpx;
		padding: 0 20rpx;
		box-sizing: border-box;
		max-width: calc(100% - 30rpx);
		height: 30rpx;
		display: flex;
		align-items: center;
		border-radius: 40rpx;
		z-index: 50;
		font-size: 18rpx;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
