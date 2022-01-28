export default {
	showActionSheet ({title = '', itemList = [], success, fail}) {
		uni.navigateTo({
			url: `/modules/action-sheet?title=${encodeURIComponent(title)}&itemList=${encodeURIComponent(JSON.stringify(itemList))}`,
			complete: (res) => {
				uni.$once('action-sheet', (data) => {
					try{
						uni.navigateBack({delta: 1});
						success ? success(data) : null
					}catch(e){
						uni.navigateBack({delta: 1});
						fail ? fail(e) : null
					}
				})
			}
		});
	},
	chooseFile ({title, suffix, multiple, success, fail}) {
		uni.navigateTo({
			url: `/modules/chooseFile?title=${title || ''}&suffix=${suffix || ''}&multiple=${multiple || ''}`,
			complete: (res) => {
				uni.$once('choose-file', (data) => {
					try{
						uni.navigateBack({delta: 1});
						success ? success(data) : null
					}catch(e){
						uni.navigateBack({delta: 1});
						fail ? fail(e) : null
					}
				})
			}
		});
	}
}