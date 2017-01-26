var fs = require("fs");
var tmplate = fs.readFileSync("static/err.html").toString();

exports.parse = function (meta) {
	return {
		suc: true,
		cont: tmplate.
			replace(/<\$suc>/g, "true").
			replace(/<\$msg>/g, meta).
			replace(/<\$code>/g, 200)
	};
};
