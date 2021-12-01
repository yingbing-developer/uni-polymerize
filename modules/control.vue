<template>
	<view class="control">
		<yb-mask color="rgba(0,0,0,0)" @click="hide"></yb-mask>
		<view class="anima" :style="{transform: transform, transition: transition, opacity: opacity, 'background-color': bgColor}" v-if="!isShow"></view>
		<view class="content">
			<view class="wrapper" :style="{'background-color': bgColor, transform: `scale(${isShow ? 1 : 0})`}">
				<view class="center" :style="{'border-color': borderColor}">
					<image class="cover" src="/static/music/music-bg.jpg" mode="aspectFill"></image>
					<rd-icon class="icon opac-actived" style="position: relative;z-index: 1;" name="play" color="rgba(255,255,255,0.8)" :size="60"></rd-icon>
				</view>
				<view class="menu v">
					<view class="item">
						<view class="stop opac-actived" style="background-color: rgba(255,255,255,0.8)"></view>
					</view>
					<view class="item">
						<rd-icon enableClick @click="app.$Router.push({path: '/pages/music/player'})" class="icon opac-actived" name="album-fill" color="rgba(255,255,255,0.8)" :size="55"></rd-icon>
					</view>
				</view>
				<view class="menu v h">
					<view class="item">
						<rd-icon class="icon vh opac-actived" name="prev-fill" color="rgba(255,255,255,0.8)" :size="50"></rd-icon>
					</view>
					<view class="item">
						<rd-icon class="icon vh opac-actived" name="next-fill" color="rgba(255,255,255,0.8)" :size="50"></rd-icon>
					</view>
				</view>
				<view class="menu v vt-right">
					<view class="item">
						<text class="icon opac-actived" style="color: rgba(255,255,255,0.8)">词</text>
					</view>
					<view class="item">
						<rd-icon class="icon opac-actived" name="random" color="rgba(255,255,255,0.8)" :size="45"></rd-icon>
					</view>
				</view>
				<view class="menu v vt-left">
					<view class="item">
						<rd-icon class="icon opac-actived" name="download" color="rgba(255,255,255,0.8)" :size="45"></rd-icon>
					</view>
					<view class="item">
						<music-icon class="icon opac-actived" name="playlist" color="rgba(255,255,255,0.8)" :size="40"></music-icon>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const windowWidth = uni.getSystemInfoSync().screenWidth
	const windowHeight = uni.getSystemInfoSync().screenHeight
	const duration = 200
	const opacity = 0.4
	import appMixin from '@/common/mixin/app.js'
	export default {
		mixins: [appMixin],
		data () {
			return {
				isShow: false,
				scale: 1,
				opacity: 0,
				translate: 0,
				position: {
					x: 0,
					y: 0
				},
				transition: 'none'
			}
		},
		computed: {
			transform () {
				return `scale(${this.scale}) translate(${this.translate})`
			},
			bgColor () {
				return this.skinMode == 'night' ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`
			},
			borderColor () {
				return this.skinMode == 'night' ? `rgba(50,50,50,${opacity})` : `rgba(255,255,255,${opacity})`
			}
		},
		onLoad (data) {
			this.position = JSON.parse(data.position)
			this.translate = this.computedTrans(this.position.x, windowWidth) + 'px, ' + this.computedTrans(this.position.y, windowHeight) + 'px'
			setTimeout(() => {
				this.transition = `transform ${duration}ms, opacity ${duration}ms`
				this.$nextTick(() => {
					this.translate = 0;
					this.opacity = 1
					setTimeout(() => {
						this.isShow = true
					}, duration)
				})
			}, 120)
		},
		methods: {
			computedTrans (position, screen) {
				if ( position >= screen / 2 ) {
					return (position - (screen / 2)) + (uni.upx2px(60) / 2)
				} else {
					return -((screen / 2) - position) + (uni.upx2px(60) / 2)
				}
			},
			hide () {
				this.isShow = false
				this.translate = this.computedTrans(this.position.x, windowWidth) + 'px, ' + this.computedTrans(this.position.y, windowHeight) + 'px'
				this.scale = 1;
				setTimeout(() => {
					uni.$emit('control-btn')
				}, duration)
			},
			_changeSkin () {
				this.changeSkin(this.skinMode == 'night' ? 'default' : 'night')
			}
		},
		onBackPress(event) {
			if ( event.from == 'backbutton' ) {
				this.hide();
				return true;
			}
			return false
		}
	}
</script>

<style scoped>
	.control {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.control .anima {
		width: 60rpx;
		height: 60rpx;
		border-radius: 60rpx;
	}
	.control .content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	.control .content .wrapper {
		width: 396rpx;
		height: 396rpx;
		border-radius: 396rpx;
		transition: transform .3s;
	}
	.control .content .center {
		position: absolute;
		top: 50%;
		left: 50%;
		border-radius: 100%;
		transform: translate(-50%, -50%);
		width: 50%;
		height: 50%;
		border-width: 1px;
		border-style: solid;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.control .content .cover {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		opacity: 0.6;
	}
	.control .content .icon {
		text-shadow: 0 0 10rpx rgba(0,0,0,0.6);
	}
	.control .content .stop {
		width: 30rpx;
		height: 30rpx;
		box-shadow: 0 0 10rpx rgba(0,0,0,0.6);;
	}
	.control .content .menu {
		position: absolute;
		transform-origin: center center;
	}
	.control .content .menu .item {
		height: 25%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.control .content .vh {
		transform: rotate(90deg);
	}
	.control .content .v {
		left: 50%;
		transform: translateX(-50%);
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-sizing: border-box;
	}
	.control .content .h {
		transform: translateX(-50%) rotateZ(90deg);
	}
	.control .content .vt-right {
		transform: translateX(-50%) rotateZ(45deg);
	}
	.control .content .vt-left {
		transform: translateX(-50%) rotateZ(-45deg);
	}
</style>
