export default function mask (opacity) {
	const bgColor = `rgba(0,0,0,${typeof opacity == 'number' ? opacity : 0.4})`
	const mask = new plus.nativeObj.View('mask', {
		width: '100%',
		height: '100%',
		top: '0',
		left: '0',
		backgroundColor: bgColor,
	});
	return mask
}