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
			return getApp()
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
		//直接播放
		play (song) {
			if ( song.payplay ) {
				getApp().globalData.$nativeUI.alert({
					title: '友情提示',
					content: '这首歌曲需要VIP用户或付费才能播放',
					dark: this.skinMode == 'night'
				})
			} else {
				uni.$emit('initPlayer', {song: song})
			}
		},
		//稍后播放
		later (song) {
			if ( song.payplay ) {
				getApp().globalData.$nativeUI.alert({
					title: '友情提示',
					content: '这首歌曲需要VIP用户或付费才能播放',
					dark: this.skinMode == 'night'
				})
			} else {
				this.$store.dispatch('player/addSong', song)
			}
		}
	}
}

export default appMixin;