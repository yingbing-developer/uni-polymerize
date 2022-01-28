import { mapGetters, mapMutations, mapActions } from 'vuex'
import Reader from '@/assets/constructor/reader.js'
const appMixin = {
	computed: {
		...mapGetters({
			getAdult: 'app/getAdult',
			getAdultPwd: 'app/getAdultPwd',
			skinMode: 'app/skinMode',
			skinColor: 'app/skinColor'
		}),
		app () {
			return getApp().globalData
		}
	},
	methods: {
		...mapMutations({
			setAdult: 'app/setAdult',
			setAdultPwd: 'app/setAdultPwd'
		}),
		...mapActions({
			changeSkin: 'app/changeSkinSync'
		}),
		//播放歌曲
		playSong (song) {
			if ( song.payplay ) {
				this.app.$nativeUI.alert({
					title: '友情提示',
					content: '这首歌曲需要VIP用户或付费才能播放',
					dark: this.skinMode == 'night'
				})
			} else {
				const currentId = this.$store.getters['audio/getCurrentSong'] ? this.$store.getters['audio/getCurrentSong'].id : ''
				if ( currentId != song.id ) {
					this.$store.dispatch('audio/addSong', [song])
					this.$store.dispatch('audio/create', song.id)
				}
				uni.$emit('goPlayer')
			}
		},
		//播放专辑
		playAlbum (album) {
			const songs = album.filter(song => !song.payplay)
			if ( songs.length > 0 ) {
				this.$store.dispatch('audio/clearSong')
				this.$store.dispatch('audio/addSong', songs)
				this.$store.dispatch('audio/create', songs[0].id)
				uni.$emit('goPlayer')
			} else {
				this.app.$nativeUI.alert({
					title: '友情提示',
					content: '这张专辑需要VIP用户或付费才能播放',
					dark: this.skinMode == 'night'
				})
			}
		},
		//稍后播放
		later (song) {
			if ( song.payplay ) {
				this.app.$nativeUI.alert({
					title: '友情提示',
					content: '这首歌曲需要VIP用户或付费才能播放',
					dark: this.skinMode == 'night'
				})
				return false
			} else {
				this.$store.dispatch('audio/addSong', [song])
				return true
			}
		},
		musicPanel (song, search = false) {
			const currentSong = this.$store.getters['audio/getCurrentSong']
			const isCollection = this.isCollection(song.id)
			this.app.$nativeUI.panel({
				title: song.title,
				subTitle: song.singer,
				dark: this.skinMode == 'night',
				menus: [{
					id: 'play',
					title: '播放歌曲',
					icon: '\uea88',
					color: this.skinColor.color_orange,
					size: '30',
					family: 'iconfont',
					fontSrc: '/static/iconfont.ttf'
				},{
					id: 'later',
					title: '稍后播放',
					icon: '\ue6c0',
					color: this.skinColor.color_blue,
					size: '35',
					family: 'iconfont',
					fontSrc: '/static/iconfont.ttf'
				},{
					id: 'collection',
					title: isCollection ? '取消收藏' : '收藏歌曲',
					icon: '\ue61c',
					color: isCollection ? this.skinColor.color_red : this.skinColor.color_2,
					size: '30',
					family: 'iconfont',
					fontSrc: '/static/iconfont.ttf'
				},{
					id: 'album',
					title: '加入歌单',
					icon: '\ue671',
					color: this.skinColor.color_red_2,
					size: '26',
					family: 'iconfont',
					fontSrc: '/static/iconfont.ttf'
				},{
					id: 'copy',
					title: '复制歌名',
					icon: '\ue6cb',
					color: this.skinColor.color_yellow,
					size: '30',
					family: 'iconfont',
					fontSrc: '/static/iconfont.ttf'
				},{
					id: 'search',
					title: '搜索相关',
					icon: '\ue644',
					color: this.skinColor.color_green,
					size: '26',
					family: 'iconfont',
					fontSrc: '/static/iconfont.ttf'
				}],
				success: (res) => {
					if ( res.confirm ) {
						switch (res.data.id) {
							case 'play':
								if ( song.id == currentSong?.id ) {
									uni.$emit('goPlayer')
								} else {
									this.playSong(song)
								}
								break
							case 'later':
								if ( this.later(song) ) {
									uni.showToast({
										title: '已将歌曲加入播放列表',
										icon: 'none'
									})
								}
								break
							case 'collection':
								this.toCollection(song)
								uni.showToast({
									title: isCollection ? '已取消收藏' : '已加入收藏',
									icon: 'none'
								})
								break
							case 'album':
								let list = this.$store.getters['custom/get'].filter(item => item.type == 'album')
								if ( list.length == 0 ) {
									this.app.$nativeUI.alert({
										title: '友情提示',
										content: '未创建自定义歌单',
										dark: this.skinMode == 'night'
									})
								} else {
									this.app.$modules.showActionSheet({
										title: '选择歌单',
										itemList: list.map(item => item.title),
										success: (res) => {
											if ( res.confirm ) {
												let index = list[res.data.index].song.findIndex(item => item.id == song.id)
												if ( index > -1 ) {
													this.app.$nativeUI.alert({
														title: '友情提示',
														content: '这首歌曲已经加入该歌单中',
														dark: this.skinMode == 'night'
													})
												} else {
													list[res.data.index].song.push(song)
													this.$store.dispatch('custom/add', list[res.data.index])
													uni.showToast({
														title: '加入歌单成功',
														icon: 'none'
													})
												}
											}
										}
									})
								}
								break
							case 'copy':
								uni.setClipboardData({
								    data: song.title,
								    success: () => {
								        uni.showToast({
								        	title: '已复制歌曲名称',
											icon: 'none'
								        })
								    },
									fail: () => {
										uni.showToast({
											title: '复制失败',
											icon: 'none'
										})
									}
								});
								break
							case 'search':
								if ( search ) {
									this.keyword = song.title
								} else {
									this.app.$Router.push({
										path: '/pages/music/search',
										query: {
											keyword: song.title
										}
									})
								}
								break
							default:
								break
						}
					}
				}
			})
		},
		readBook (params) {
			if ( params.type == 'story' ) {
				if ( params.source == 'local' ) {
					this.$store.dispatch('reader/init', new Reader({
						book: params
					}))
					this.app.$Router.push({
						path: '/pages/book/reader'
					})
				} else {
					this.app.$Router.push({
						path: '/pages/book/detail',
						query: {
							params: encodeURIComponent(JSON.stringify(params))
						}
					})
				}
			} else {
				if ( params.source == 'local' ) {
					this.$store.dispatch('reader/init', new Reader({
						book: params
					}))
					this.app.$Router.push({
						path: '/pages/comic/reader'
					})
				} else {
					this.app.$Router.push({
						path: '/pages/comic/detail',
						query: {
							params: encodeURIComponent(JSON.stringify(params))
						}
					})
				}
			}
		},
		toCollection (params) {
			if ( !params ) {
				return
			}
			if ( this.isCollection(params.id) )  {
				this.$store.dispatch('collection/removeCollection', params.id)
			} else {
				this.$store.dispatch('collection/addCollection', params)
			}
		},
		removeRecord (params) {
			this.$store.dispatch('record/removeRecord', params.id)
		},
		clearRecord (type) {
			this.app.$nativeUI.confirm({
				title: '操作提示',
				content: '确认要清空所有记录吗？',
				success: (res) => {
					if ( res.confirm ) {
						this.$store.dispatch('record/clearRecord', type)
					}
				}
			})
		},
		isCollection (id) {
			return id ? this.$store.getters['collection/getCollection'].findIndex(collection => collection.id == id) > -1 : false
		},
		isRecord (id) {
			return this.$store.getters['record/getRecord'].findIndex(record => record.id == id) > -1
		},
		isCache (id) {
			return id ? this.$store.getters['cache/getCache'].findIndex(cache => cache.parentId == id) > -1 : false
		},
		filterSource (source) {
			let index = this.$store.getters['source/get'].findIndex(item => item.id == source)
			if ( index == -1 ) {
				return '本地'
			} else {
				return this.$store.getters['source/get'][index].title
			}
		},
		download (params) {
			if ( params && params.src ) {
				const tasks = this.$store.getters['downer/getTask']
				const index = tasks.findIndex(task => task.parentId == params.id)
				if ( index == -1 ) {
					this.$store.dispatch('downer/createTask', params)
				} else {
					this.app.$nativeUI.alert({
						content: '正在下载，请等待下载完成',
						dark: this.skinMode == 'night'
					})
				}
			} else {
				this.app.$nativeUI.alert({
					content: '创建下载任务失败',
					dark: this.skinMode == 'night'
				})
			}
		},
		showComment (params) {
			if ( params ) {
				this.app.$Router.push({
					path: '/modules/comment',
					query: {
						params: encodeURIComponent(JSON.stringify(params))
					}
				})
			} else {
				this.app.$nativeUI.alert({
					content: '查询评论失败',
					dark: this.skinMode == 'night'
				})
			}
		},
		changeSkin () {
			this.$store.dispatch('app/changeSkin', this.skinMode == 'default' ? 'night' : 'default')
		}
	}
}

export default appMixin;