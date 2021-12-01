import CryptoJS from "@/assets/crypto-js/crypto-js.js"

function aes(params, key) {
	const c = CryptoJS.enc.Utf8.parse(key)
	const d = CryptoJS.enc.Utf8.parse("0102030405060708")
	const e = CryptoJS.enc.Utf8.parse(params)
	const f = CryptoJS.AES.encrypt(e, c, {
		iv: d,
		mode: CryptoJS.mode.CBC
	});
	return f.toString()
}

function params(data, key) {
	const param = aes(JSON.stringify(data), '0CoJUm6Qyw8W8jud')
	return aes(param, key)
}

export default params
