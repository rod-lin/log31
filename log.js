var fs = require("fs");
var util = require("./util.js");

var logs = {};
var parsers = {};

function initParser() {
	parsers["html"] = {
		parse: function (meta) {
			return {
				suc: true,
				cont: meta
			};
		}
	};

	if (!util.isdir("parser")) {
		fs.mkdirSync("parser");
		return;
	}

	util.walk("parser", function (file, depth) {
		if (depth != 1) return;

		var match = file.match(/.*[/\\]([^/]*)\.js$/);

		if (match) {
			console.log("log: found parser " + match[1]);
			var load = require("./" + file);

			if (load.parse) {
				parsers[match[1]] = load;
			} else {
				console.log("log: illegal parser " + match[1]);
			}
		} else {
			console.log("log: found junk file \"" + file + "\"");
		}
	});

	return;
}

exports.init = function () {
	if (!util.isdir("log")) {
		fs.mkdirSync("log");
	}

	initParser();

	util.walk("log", function (file, depth) {
		if (depth != 1) return;

		var match = file.match(/.*[/\\]([^/]*)\.([^/]*)$/);
		var logno;

		if (match && !isNaN(logno = parseInt(match[1]))) {
			var parser = match[2];
			console.log("log: found log " + logno + ", use parser \"" + parser + "\"");

			if (!parsers.hasOwnProperty(parser)) {
				console.log("log: warning: cannot find parser \"" + parser + "\", parser may fall back to html");
			}

			logs[logno] = {
				parser: parser,
				cont: fs.readFileSync(file).toString()
			}
		} else {
			console.log("log: found junk file \"" + file + "\"");
		}
	});

	return true;
};

exports.get = function (logno) {
	if (logs[logno]) {
		return logs[logno].cont;
	}

	return undefined;
};

exports.parse = function (logno) {
	if (!logs[logno]) {
		return { suc: false, msg: "Cannot find log " + logno };
	}

	var l = logs[logno];

	if (parsers.hasOwnProperty(l.parser)) {
		return parsers[l.parser].parse(l.cont);
	}

	return parsers.html.parse(l.cont);
};
