import Config from '@/assets/js/config.js'

const { TIMEOUT } = Config

const state = {
	task: [] //下载任务列表
}

const getters = {
	getTask (state) {
		return state.task
	}
}

const actions = {
	createTask ({state, dispatch}, params) {
		const Downer = require('@/assets/constructor/downer.js').default
		state.task.push(new Downer(params))
		const index = state.task.findIndex(task => task.parentId == params.id)
		state.task[index].init()
	},
	removeTask ({state}, id) {
		const index = state.task.findIndex(task => task.id == id)
		if ( index > -1 ) {
			state.task[index].destroy()
			state.task.splice(index, 1)
		}
	},
	clearTask () {
		Object.keys(state.task).forEach(key => {
			state.task[key].destroy()
		})
		state.task = []
	}
}

export default {
    namespaced: true,
    state,
    getters,
	actions
}