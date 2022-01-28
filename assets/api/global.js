import Store from '@/store' // 获取 Vuex Store 实例，注意是**实例**，而不是 vuex 这个库
import Config from '@/assets/js/config.js'
import Trie from '@/assets/other/trie.js';
import { simpleToTraditional, traditionalToSimple } from '@/assets/other/s2t.js';
import { bookDict, comicDict } from '@/assets/other/dict.js';

const { getters } = Store;

//获取关键词
export function getTag (source, cc) {
	const sources = getters['source/get'];
	let storyStoreDict = getters['dict/get'].filter(item => item.type == 'story').map(item => {
		return item.title
	})
	let comicStoreDict = getters['dict/get'].filter(item => item.type == 'comic').map(item => {
		return item.title
	})
	let bookIndex = sources.filter(item => item.type == 'story').findIndex(item => item.id == source)
	let comicIndex = sources.filter(item => item.type == 'comic').findIndex(item => item.id == source)
	let dict = comicIndex > -1 ? comicDict.concat(comicStoreDict) : bookDict.concat(storyStoreDict)
	let str = simpleToTraditional(dict.toString())
	str = str + ',' + traditionalToSimple(str)
	str = str + ',' + str.toUpperCase()
	str = str + ',' + str.toLowerCase()
	dict = dict.concat(str.split(','))
	const trie = new Trie()
	trie.init([...new Set(dict)])
	return trie.splitWords(cc)
}

/**
 * 去除html字符串的无关内容
 * @param {Number} html html字符串
*/
export function replaceHTML (html) {
	let str = JSON.stringify(html);//将html转化为字符
	str = str.replace(/\\n/g,'');//去除\n
	str = str.replace(/\\r/g,'');//去除\r
	str = str.replace(/\\t/g,'');//去除\t
	str = str.replace(/&nbsp;/g,'');//去除&nbsp;
	str = str.replace(/\\/g,'');//去除掉无关的斜杠
	return str;
}

//转义html特殊字符
export function htmlDecodeByRegExp (str) {
	let s = ""
	if (str.length == 0) return ""
	s = str.replace(/&#58;/g, ":")
	s = s.replace(/&#32;/g, " ")
	s = s.replace(/&#33;/g, "!")
	s = s.replace(/&#34;/g, '"')
	s = s.replace(/&#35;/g, "#")
	s = s.replace(/&#36;/g, "$")
	s = s.replace(/&#37;/g, "%")
	s = s.replace(/&#38;/g, "&")
	s = s.replace(/&#39;/g, "'")
	s = s.replace(/&#40;/g, "(")
	s = s.replace(/&#41;/g, ")")
	s = s.replace(/&#42;/g, "*")
	s = s.replace(/&#43;/g, "+")
	s = s.replace(/&#44;/g, ",")
	s = s.replace(/&#45;/g, "-")
	s = s.replace(/&#46;/g, ".")
	s = s.replace(/&#47;/g, "/")
	s = s.replace(/&#13;/g, "\n")
	s = s.replace(/<br\/>/g, "\n")
	s = s.replace(/<br \/>/g, "\n")
	s = s.replace(/&amp;/g, "")
	s = s.replace(/#65279;/g, "")
	s = s.replace(/&hellip;/g, '...')
	s = s.replace(/&mdash;/g, '—')
	s = s.replace(/&ldquo;/g, "“")
	s = s.replace(/&rdquo;/g, "”")
	s = s.replace(/&middot;/g, ".")
	return s;
}