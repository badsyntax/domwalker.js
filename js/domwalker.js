/*
 * domwalker.js - find and replace words that span across nodes
 * by Richard Willis 2010
 * Project: http://github.com/badsyntax/domwalker.js
 *
 */

(function(){

	domwalker = function(node, opt){
		this.startnode = node;
		this.options = {
			highlight: true,
			highlightClass: 'highlight',
			wrap: 'span'
		};
	};

	domwalker.prototype = {

		find : function(find, opt){

			if (!find.length) return;

			var self = this, appended = false, newnode = "", badword = "", nodename, replaceword, startnode;

			this.startnode = document.getElementById("text");

			this._walkNode(this.startnode, function(node){
							
				if (badword.length && node.nodeType == 1 && !appended) {
					newnode.appendChild(node.cloneNode(true));
					appended = true;
				}

				if (node.nodeType == 3) {

					var nodevalue = node.nodeValue.replace(/\s+/g, " ");

					if (badword.length) {

						var val = / /.test(nodevalue) ? nodevalue.split(" ")[0].replace(/\W/, "") : nodevalue;

						badword = find.indexOf(badword + val) === 0 ? (badword + val) : "";

						if (badword === find && (/ /.test(nodevalue) || /^\s/.test(self._nextTextNode(startnode).nodeValue))) {
							
							var starttext = document.createTextNode(
								startnode.nodeValue
								.replace(/\s+/g, " ")
								.replace(/\w+$/, "")
							);

							if (/ /.test(nodevalue)) {
								var endtext = document.createTextNode(
									nodevalue
									.replace(/(^\w+).*/, "$1")
								);
								newnode.appendChild(endtext);
							}
								
							startnode.parentNode.insertBefore(starttext, startnode);
							startnode.parentNode.removeChild(startnode.nextSibling);
							startnode.parentNode.insertBefore(newnode, startnode.nextSibling);
							startnode.parentNode.removeChild(startnode);

							if (/ /.test(nodevalue)) {
								node.nodeValue = nodevalue.replace(/^\w+(.*)/, "$1");
							}

							badword = "";
						}
					}

					if (!badword.length && nodevalue !== find && /\w+$/.test(nodevalue)) {
						endword = /\s/.test(nodevalue) ? nodevalue.replace(/.*\s(\w+)$/, "$1") : nodevalue;
						
						if (find.indexOf(endword) === -1) return;
						
						badword = endword;
						newnode = document.createElement(self.options.wrap);
						newnode.className = "dw-replace";
						newnode.innerHTML = 
							nodevalue
							.replace(/\n/g, " ")
							.replace(/.*\s(\w+)$/, "$1");

						if (self.options.highlight)
							newnode.className = newnode.className + " " + self.options.highlightClass;

						startnode = node;
						appended = false;
					}
				}
			});
			
			nodename = self.options.wrap;
			replaceword = "<"+nodename+" class=\"dw-replace"+(self.options.highlight?" "+self.options.highlightClass:"")+"\">$1</"+nodename+">";
			self.startnode.innerHTML = 
				self.startnode.innerHTML
				.replace(new RegExp("\\b("+find+")\\b", "ig"), replaceword);
			
			return this;
		},
		replace : function(replaceword){

			if (!replaceword.length) return;

			var self = this;

			this.startnode = document.getElementById("text");

			var children = this.startnode.getElementsByTagName("*");
			for(var child in children) {
				var n = children[child];
				if (/dw-replace/.test( n && n.className && n.className.replace(/\n/g, "") )) {
					if (n.childNodes.length === 1) {
						n.childNodes[0].nodeValue = replaceword;
					} else {
						var offset = 0, limit = 0, replace = replaceword;
						self._walkNode(n, function(node){
							if (node.nodeType == 3) {
								limit = node.nodeValue.length;
								node.nodeValue = replace.substring(offset, limit);
								replace = replace.substring(limit);
							}
						});
						(n.nodeValue != replaceword) && 
							n.parentNode.appendChild(document.createTextNode(replace));
					}
				}
			}
			// remove dw-replace spans (buggy)
			for(var child in children) {
				var n = children[child];
				if (/dw-replace/.test( n && n.className && n.className.replace(/\n/g, "") )) {
					var pa = n.parentNode;
					while(n.firstChild) {
						pa.insertBefore(n.firstChild, n);
					}
					n.parentNode.removeChild(n);
				}
			}
		},
		_walkNode : function(node, nodeCallback){
			var self = this;
			(nodeCallback) && nodeCallback(node);
			for(var child in node.childNodes)
				if (node.childNodes[child]) 
					self._walkNode(node.childNodes[child], nodeCallback);
		},
		_nextTextNode : function(node) {
			if (!node.nextSibling) {
				var self = this,
				parentNode = "",
				getParent = function(startnode){
					var next = self._nextTextNode(startnode.parentNode);
					if (next) {
						return next;
					} else {
						return getParent(startNode.parentNode);
					}
				};
				return getParent(node);
			} else if (node.nextSibling.nodeType == 3) {
				return node.nextSibling;
			} else {
				return this._nextTextNode(node.nextSibling);
			}
		}
	};
})();
