import { mapGetters, mapMutations, mapActions } from 'vuex'
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
		isCollection (id) {
			return id ? this.$store.getters['collection/getCollection'].findIndex(collection => collection.id == id) > -1 : false
		},
		showComment (data) {
			getApp().globalData.$Router.push({
				path: '/modules/comment',
				query: {
					data: encodeURIComponent(JSON.stringify(data))
				}
			})
		},
		changeSkin () {
			this.$store.dispatch('app/changeSkin', this.skinMode == 'default' ? 'night' : 'default')
		}
	}
}

export default appMixin;