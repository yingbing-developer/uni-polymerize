import Config from '@/assets/js/config.js'
const { TIMEOUT } = Config
let requestTasks = [];


//request封装
function request (type = 'GET', url, options) {
	return new Promise((resolve,reject) => {
		let d = new Date();
		let taskId = options.taskId || (d.getMinutes().toString() + d.getSeconds() + d.getMilliseconds() + Math.round(Math.random() * 10000))
		requestTasks.push({
			id: taskId,
			request: uni.request({
				url: url,
				data: options.params || {},
				method: type || 'GET',
				mimeType: options.mimeType || null,
				dataType: options.dataType || 'json',
				header: options.headers || {},
				responseType: options.responseType || 'text',
				timeout: TIMEOUT,
				sslVerify: false,
				success: ((res) => {
					resolve(res)
				}),
				fail:((err)=>{
					reject(err)
				}),
				complete: (() => {
					let index = requestTasks.findIndex(task => task.id == taskId)
					index > -1 ? requestTasks.splice(index, 1) : null
				})
			})
		})
	})
}

export default class http {
	get(url, options = {}) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + param(options.params || {}, options.headers?.Charset || 'utf-8') || ''; // 请求路径
		return request('GET', url, options)
	}
	postget(url, options = {}) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + param(options.params || {}, options.headers?.Charset || 'utf-8') || ''; // 请求路径
		return request('POST', url, options)
	}
	post(url, options = {}) {
		return request('POST', url, options)
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