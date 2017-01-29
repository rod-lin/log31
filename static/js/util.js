String.prototype.trim = function () {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};

Array.prototype.choose = function () {
	return this[Math.floor(Math.random() * this.length + 0)];
};

Array.prototype.without = function (elem) {
	var i = this.indexOf(elem);
	var ret = this;

	if (i != -1) {
		ret = ret.splice(0);
		ret.splice(i, 1);
	}

	return ret;
};

Object.prototype.addClass = function (cls) {
	var allc = this.className.split(/\s+/g);

	if (allc.indexOf(cls) == -1) {
		allc.push(cls);
		this.className = allc.join(" ");

		return true;
	}

	return false;
};

Object.prototype.removeClass = function (cls) {
	var allc = this.className.split(/\s+/g);
	var i = allc.indexOf(cls);

	if (i == -1) return false;

	allc.splice(i, 1);

	this.className = allc.join(" ");

	return true;
};

Object.prototype.own = Object.prototype.hasOwnProperty;

function hasCookie(name)
{
	return document.cookie.indexOf(escape(name) + "=") != -1;
}

function setCookie(name, value)
{
	if (hasCookie(name)) {
		var cookies = document.cookie.split(/\s*;\s*/g);
		var i, reg = new RegExp(escape(name) + "=.*", "g");

		for (i = 0; i < cookies.length; i++) {
			if (cookies[i].match(reg)) {
				cookies[i] = escape(name) + "=" + escape(value);
				break;
			}
		}

		document.cookie = cookies.join(";");
	} else {
		if (document.cookie != "")
			document.cookie += ";"

		document.cookie += escape(name) + "=" + escape(value);
	}

	return;
}

function getCookie(name)
{
	var res = (new RegExp(escape(name) + "=(.*)", "g")).exec(document.cookie);
	return res ? res[1] : undefined;
}

function goto(url) {
	window.location.href = url;
	return;
}

function formatFormParam(obj) {
	var arr = [];
	
	for (var k in obj) {
		arr.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
	}

	return arr.join("&");
}

var Ajax = function () {
	var req = null;
	
	try {
		req = new XMLHttpRequest();
	} catch (e) { IE
		try {
			req = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				req = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				return null;
			}
		}
	}

	return {
		post: function (url, obj, cb) {
			req.open("POST", url);
			req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			req.send(formatFormParam(obj));
			req.onreadystatechange = function () {
				if (req.readyState == 4) {
					cb(req.status == 200, req.responseText);
				}
			};
		},

		get: function (url, obj, cb) {
			req.open("GET", url + "?" + formatFormParam(obj));
			req.send();
			req.onreadystatechange = function () {
				if (req.readyState == 4) {
					cb(req.status == 200, req.responseText);
				}
			};
		}
	};
}
