export default {
	catalog (type) {
		return new Promise((resolve, reject) => {
			uni.navigateTo({
				url: `/modules/catalog?type=${type}`,
				complete: (res) => {
					uni.$once('catalog-btn', (data) => {
						resolve(data)
						uni.navigateBack({delta: 1});
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
					uni.$once('security-btn', (data) => {
						resolve(data)
						uni.navigateBack({delta: 1});
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