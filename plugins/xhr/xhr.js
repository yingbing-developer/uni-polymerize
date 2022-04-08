import Config from '@/assets/js/config.js'
const { TIMEOUT } = Config
let requestTasks = [];

//xhr封装
function xhrRequest (type = 'GET', url, options) {
	return new Promise((resolve,reject) => {
		let xhrHttp = new plus.net.XMLHttpRequest();
		let d = new Date();
		let taskId = options.taskId || (d.getMinutes().toString() + d.getSeconds() + d.getMilliseconds() + Math.round(Math.random() * 10000))
		requestTasks.push({
			id: taskId,
			request: xhrHttp
		})
		try {
			xhrHttp.onreadystatechange = function () {
				// console.log(xhrHttp.readyState);
				if ( xhrHttp.readyState == 4 ) {
					if ( xhrHttp.status == 200 ) {
						resolve({code: xhrHttp.status, data: xhrHttp.responseText})
					} else {
						// plus.nativeUI.toast("网络错误！", {verticalAlign: 'bottom'});
						reject({code: xhrHttp.status, data: ''});
					}
					xhrHttp.abort()
				}
			}
			xhrHttp.onabort = function () {
				let index = requestTasks.findIndex(task => task.id == taskId)
				index > -1 ? requestTasks.splice(index, 1) : null
				xhrHttp = null
			}
			xhrHttp.open(type, url);
			if ( options.mimeType ) {
				xhrHttp.overrideMimeType(options.mimeType);
			}
			xhrHttp.responseType = options.responseType || 'json';
			for ( let i in options.headers || {} ) {
				xhrHttp.setRequestHeader(i, options.headers[i]);
			}
			xhrHttp.timeout = TIMEOUT;
			xhrHttp.send(options.params || {});
		} catch (e) {
			xhrHttp.abort()
			reject({code: xhrHttp.status, data: ''});
		}
	})
}

export default class Xhr {
	get(url, options = {}) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + param(options.params || {}, options.headers?.Charset || 'utf-8') || ''; // 请求路径
		return xhrRequest('GET', url, options)
	}
	postget(url, options = {}) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + param(options.params || {}, options.headers?.Charset || 'utf-8') || ''; // 请求路径
		return xhrRequest('POST', url, options)
	}
	post(url, options = {}) {
		return xhrRequest('POST', url, options)
	}
	abort(taskId) {
		let index = requestTasks.findIndex(task => task.id == taskId)
		if ( index > -1 ) {
			requestTasks[index].request.abort()
		} else {
			throw new Error('The requested task with taskid ' + taskId + ' is not defined')
		}
	}
}

function param(data, charset) {
    let url = ''
    for (var k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        url += charset == 'utf-8' ? `&${k}=${encodeURIComponent(value)}` : `&${k}=${value}`
    }
    return url ? url.substring(1) : ''
}