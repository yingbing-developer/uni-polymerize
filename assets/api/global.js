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
	s = s.replace(/&nbsp;/g, " ")
	s = s.replace(/&#8211;/g, "–")
	s = s.replace(/#65279;/g, "")
	s = s.replace(/&hellip;/g, '...')
	s = s.replace(/&mdash;/g, '—')
	s = s.replace(/&ldquo;/g, "“")
	s = s.replace(/&rdquo;/g, "”")
	s = s.replace(/&middot;/g, ".")
	s = s.replace(/&iexcl;/g, "¡")
	s = s.replace(/&cent;/g, "¢")
	s = s.replace(/&pound;/g, "£")
	s = s.replace(/&curren;/g, "¤")
	s = s.replace(/&yen;/g, "¥")
	s = s.replace(/&sect;/g, "§")
	s = s.replace(/&uml;/g, "¨")
	s = s.replace(/&copy;/g, "©")
	s = s.replace(/&ordf;/g, "ª")
	s = s.replace(/&laquo;/g, "«")
	s = s.replace(/&not;/g, "¬")
	s = s.replace(/&reg;/g, "®")
	s = s.replace(/&macr;/g, "¯")
	s = s.replace(/&deg;/g, "°")
	s = s.replace(/&plusmn;/g, "±")
	s = s.replace(/&acute;/g, "´")
	s = s.replace(/&micro;/g, "µ")
	s = s.replace(/&para;/g, "¶")
	s = s.replace(/&middot;/g, "·")
	s = s.replace(/&cedil;/g, "¸")
	s = s.replace(/&ordm;/g, "º")
	s = s.replace(/&raquo;/g, "»")
	s = s.replace(/&iquest;/g, "¿")
	s = s.replace(/&Agrave;/g, "À")
	s = s.replace(/&Aacute;/g, "Á")
	s = s.replace(/&Acirc;/g, "Â")
	s = s.replace(/&Atilde;/g, "Ã")
	s = s.replace(/&Auml;/g, "Ä")
	s = s.replace(/&Aring;/g, "Å")
	s = s.replace(/&AElig;/g, "Æ")
	s = s.replace(/&Ccedil;/g, 'Ç')
	s = s.replace(/&Egrave;/g, "È")
	s = s.replace(/&Eacute;/g, "É")
	s = s.replace(/&Ecirc;/g, "Ê")
	s = s.replace(/&Euml;/g, "Ë")
	s = s.replace(/&Igrave;/g, "Ì")
	s = s.replace(/&Iacute;/g, "Í")
	s = s.replace(/&Icirc;/g, "Î")
	s = s.replace(/&Iuml;/g, "Ï")
	s = s.replace(/&Ntilde;/g, "Ñ")
	s = s.replace(/&Ograve;/g, "Ò")
	s = s.replace(/&Oacute;/g, "Ó")
	s = s.replace(/&Ocirc;/g, "Ô")
	s = s.replace(/&Otilde;/g, "Õ")
	s = s.replace(/&Ouml;/g, "Ö")
	s = s.replace(/&Oslash;/g, "Ø")
	s = s.replace(/&Ugrave;/g, "Ù")
	s = s.replace(/&Uacute;/g, "Ú")
	s = s.replace(/&Ucirc;/g, "Û")
	s = s.replace(/&Uuml;/g, "Ü")
	s = s.replace(/&szlig;/g, "ß")
	s = s.replace(/&agrave;/g, "à")
	s = s.replace(/&aacute;/g, "á")
	s = s.replace(/&acirc;/g, "â")
	s = s.replace(/&atilde;/g, "ã")
	s = s.replace(/&auml;/g, "ä")
	s = s.replace(/&aring;/g, "å")
	s = s.replace(/&aelig;/g, "æ")
	s = s.replace(/&ccedil;/g, "ç")
	s = s.replace(/&egrave;/g, "è")
	s = s.replace(/&eacute;/g, "é")
	s = s.replace(/&ecirc;/g, "ê")
	s = s.replace(/&euml;/g, "ë")
	s = s.replace(/&igrave;/g, "ì")
	s = s.replace(/&iacute;/g, "í")
	s = s.replace(/&icirc;/g, "î")
	s = s.replace(/&iuml;/g, "ï")
	s = s.replace(/&ntilde;/g, "ñ")
	s = s.replace(/&ograve;/g, "ò")
	s = s.replace(/&oacute;/g, "ó")
	s = s.replace(/&ocirc;/g, "ô")
	s = s.replace(/&otilde;/g, "õ")
	s = s.replace(/&ouml;/g, "ö")
	s = s.replace(/&divide;/g, "÷")
	s = s.replace(/&oslash;/g, "ø")
	s = s.replace(/&ugrave;/g, "ù")
	s = s.replace(/&uacute;/g, "ú")
	s = s.replace(/&ucirc;/g, "û")
	s = s.replace(/&uuml;/g, "ü")
	s = s.replace(/&yuml;/g, "ÿ")
	return s;
}