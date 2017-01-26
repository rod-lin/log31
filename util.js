var fs = require("fs");

// Object.prototype.owns = Object.prototype.hasOwnProperty;

function walk(path, depth, cb) {
	depth++;
	var files = fs.readdirSync(path);

	files.forEach(function(item) {
		var tmp = path + '/' + item;
		stats = fs.statSync(tmp);
		
		if (stats.isDirectory()) {
			walk(tmp, depth, cb);
		} else {
			cb(tmp, depth);
		}
	});
}

exports.walk = function (init, cb) {
	return walk(init, 0, cb);
};

exports.isdir = function (path) {
	return fs.existsSync(path) && fs.statSync(path).isDirectory();
}
