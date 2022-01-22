const stop = {
	"的": 1
};


// Trie树
export default function Trie() {
	this.root = new Node(null);
}

Trie.prototype = {
	/**
	 * 将Unicode转成UTF8的三字节
	 */
	toBytes: function(word) {
		var result = [];
		for (var i = 0; i < word.length; i++) {
			var code = word.charCodeAt(i);
			// 单字节
			if (code < 0x80) {
				result.push(code);
			} else {
				// 三字节
				result = result.concat(this.toUTF8(code));
			}
		}
		return result;
	},

	toUTF8: function(c) {
		// 1110xxxx 10xxxxxx 10xxxxxx
		// 1110xxxx
		var byte1 = 0xE0 | ((c >> 12) & 0x0F);
		// 10xxxxxx
		var byte2 = 0x80 | ((c >> 6) & 0x3F);
		// 10xxxxxx
		var byte3 = 0x80 | (c & 0x3F);
		return [byte1, byte2, byte3];
	},

	toUTF16: function(b1, b2, b3) {
		// 1110xxxx 10xxxxxx 10xxxxxx
		var byte1 = (b1 << 4) | ((b2 >> 2) & 0x0F);
		var byte2 = ((b2 & 0x03) << 6) | (b3 & 0x3F);
		var utf16 = ((byte1 & 0x00FF) << 8) | byte2
		return utf16;
	},

	/**
	* 添加每个词到Trie树
	*/
	add: function(word) {
		var node = this.root,
			bytes = this.toBytes(word),
			len = bytes.length;
		for (var i = 0; i < len; i++) {
			var c = bytes[i];
			// 如果不存在则添加，否则不需要再保存了，因为共用前缀
			if (!(c in node.childs)) {
				node.childs[c] = new Node(c);
			}
			node = node.childs[c];
		}
		node.asWord(); // 成词边界
	},

	/**
	* 按字节在Trie树中搜索
	*/
	search: function(bytes) {
		var node = this.root,
			len = bytes.length,
			result = [];
		var word = [],
			j = 0;
		for (var i = 0; i < len; i++) {
			var c = bytes[i],
				childs = node.childs;
			if (!(c in childs)) {
				return result;
			}
			if (c < 0x80) {
				word.push(String.fromCharCode(c));
			} else {
				j++;
				if (j % 3 == 0) {
					var b1 = bytes[i - 2];
					var b2 = bytes[i - 1];
					var b3 = c;
					word.push(String.fromCharCode(this.toUTF16(b1, b2, b3)));
				}
			}
			// 如果是停止词，则退出
			if (word.join('') in stop) {
				return result;
			}
			// 成词
			var cnode = childs[c];
			if (cnode.isWord()) {
				cnode.addCount(); // 用于计数判断
				result.push(word.join(''));
			}
			node = cnode;
		}
		return result;
	},

	/**
	* 分词
	*/
	splitWords: function(words) {
		// 转换成单字节进行搜索
		var bytes = this.toBytes(words);
		var start = 0,
			end = bytes.length - 1,
			result = [];
		while (start != end) {
			var word = [];
			for (var i = start; i <= end; i++) {
				var b = bytes[i]; // 逐个取出字节
				word.push(b);
				var finds = this.search(word);
				if (finds !== false && finds.length > 0) {
					// 如果在字典中，则添加到分词结果集
					result = result.concat(finds);
				}
			}
			start++;
		}
		return result;
	},

	/**
	* 词始化整棵Trie树
	*/
	init: function(dict) {
		for (var i = 0; i < dict.length; i++) {
			this.add(dict[i]);
		}
	}
};



// 节点
function Node(_byte) {
	this.childs = {}; // 子节点集合
	this._byte = _byte || null; // 此节点上存储的字节
	this._isWord = false; // 边界保存，表示是否可以组成一个词
	this._count = 0;
}

Node.prototype = {
	isWord: function() {
		return (this._isWord && (this._count == 0));
	},
	asWord: function() {
		this._isWord = true;
	},
	addCount: function() {
		this._count++;
	},
	getCount: function() {
		return this._count;
	}
};
