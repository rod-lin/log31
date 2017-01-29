var fs = require("fs");
var util = require("../util.js");

var tmplate = fs.readFileSync("static/err.html").toString();

exports.parse = function (meta) {
	return {
		suc: true,
		cont: tmplate.
			replacev("suc", true).
			replacev("msg", meta.toString()).
			replacev("code", 200)
	};
};
