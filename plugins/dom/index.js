export default {
	catalog (type) {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/catalog?type=${type}`,
				complete: (res) => {
					uni.$on('catalog-btn', (data) => {
						resolve(data)
						uni.navigateBack({delta: 1});
						uni.$off('catalog-btn');
					})
				}
			});
		})
	},
	security (data = {}) {
		const type = data.type || 'input'
		const title = data.title || '请输入安全密码'
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/security?type=${type}&title=${title}`,
				complete: (res) => {
					uni.$on('security-btn', (data) => {
						resolve(data)
						uni.navigateBack({delta: 1});
						uni.$off('security-btn');
					})
				}
			});
		})
	},
	control (position) {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/control?position=${JSON.stringify(position)}`,
				complete: (res) => {
					uni.$once('control-btn', (data) => {
						resolve(data)
						uni.navigateBack({delta: 1});
					})
				}
			});
		})
	}
}