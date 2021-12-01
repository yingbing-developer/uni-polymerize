export default function mask (opacity) {
	const mask = new plus.nativeObj.View('mask', {
		width: '100%',
		height: '100%',
		top: '0',
		left: '0',
		backgroundColor: `rgba(0,0,0,${typeof opacity == 'number' ? opacity : 0.4})`,
	});
	return mask
}