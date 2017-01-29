var fs			= require("fs");
var url			= require("url");
var http		= require("http");
var qs			= require('querystring');

var util		= require("./util.js");
var log			= require("./log.js");
var errmsg		= require("./err.js");

var static_addr = {};

var readStatic = function (path, type) {
	static_addr[path] = {
		dat: fs.readFileSync(path),
		type: type || ""
	};
	
	return;
}

util.walk("static", function (file) {
	var type = "text/plain";
	var match = file.match(/.*\.([^\.\\/]+)$/);

	if (match) switch (match[1]) {
		case "html": type = "text/html"; break;
		case "css": type = "text/css"; break;
		case "js": type = "application/x-javascript"; break;
	}

	readStatic(file, type);
});

var handler = {
	"": function (req, res, argv) {
		res.qres(static_addr["static/cmd.html"].dat);
		return;
	},

	"open": function (req, res, argv) {
		var logno = parseInt(argv[1]);

		if (log.valid(logno)) {
			var ret = log.parse(logno);

			if (ret.suc) {
				res.qres(ret.cont, "text/html");
			} else {
				res.qerr(400, ret.msg);
			}
		} else {
			res.qerr(400, errmsg["NOT_VALID_LOGNO"]);
		}

		return
	},

	/* edit logno */
	"edit": function (req, res, argv) {
		var logno = parseInt(argv[1]);

		if (!log.valid(logno)) {
			res.qerr(400, errmsg["NOT_VALID_LOGNO"]);
			return;
		}

		if (!log.hasLog(logno)) {
			res.qerr(400, errmsg["LOGNO_NOT_EXIST"](logno));
			return;
		}

		var l = log.get(logno);

		res.qres(static_addr["static/editor.html"].dat.toString().
			replacev("logno", logno).
			replacev("parser", l.parser).
			replacev("cont", l.cont)
		);

		return;
	},

	/* new [parser] logno */
	"new": function (req, res, argv) {
		var logno;
		var parser;

		switch (argv.length) {
			case 1:
				res.qerr(400, errmsg["TOO_LESS_ARGS"]);
				return;

			case 2:
				parser = "html";
				logno = parseInt(argv[1]);
				break;

			default:
				parser = argv[1];
				logno = parseInt(argv[2]);
		}

		if (!log.valid(logno)) {
			res.qerr(400, errmsg["NOT_VALID_LOGNO"]);
			return;
		}

		if (log.hasLog(logno)) {
			res.qerr(400, errmsg["LOGNO_EXIST"](logno));
			return;
		}

		res.qres(static_addr["static/editor.html"].dat.toString().
			replacev("logno", logno).
			replacev("parser", parser).
			replacev("cont", "")
		);

		return;
	},

	"status": function (req, res, argv) {
		res.qmsg("I'm pretty fine.");
		return;
	},

	/* save logno [parser] */
	"save": function (req, res, argv, query) {
		if (argv.length < 2) {
			res.qjson({ suc: false, msg: errmsg["TOO_LESS_ARGS"] });
			return;
		}

		var logno = parseInt(argv[1]);
		
		if (!log.valid(logno)) {
			res.qjson({ suc: false, msg: errmsg["NOT_VALID_LOGNO"] });
			return;
		}

		var l = log.get(logno);

		var parser = argv[2] || (l && l.parser) || "html";

		log.saveLog(logno, parser, query["meta"], function (ret) {
			res.qjson(ret.suc ? { suc: true } : { suc: false, msg: ret.msg });
		});

		return;
	}
};

log.init();

// quick response
http.ServerResponse.prototype.qres = function (dat, type) {
	this.writeHead(200, { "Content-Type": type || "text/html" });
	this.write(dat);
	this.end();

	console.log(new Date() + ": response: \"" + dat.toString().substring(0, 10) + "...\"");

	return;
}

// quick error
http.ServerResponse.prototype.qerr = function (code, msg, type) {
	var tmpl = static_addr["static/err.html"].dat.toString();

	this.writeHead(code, { "Content-Type": type || "text/html" });
	this.write(tmpl.
		replacev("suc", false).
		replacev("msg", code + "<br>" + msg.toString()).
		replacev("code", code.toString())
	);
	this.end();

	console.log(new Date() + ": error " + code + ": " + msg);

	return;
}

// quick msg
http.ServerResponse.prototype.qmsg = function (msg, type) {
	var tmpl = static_addr["static/err.html"].dat.toString();

	this.writeHead(200, { "Content-Type": type || "text/html" });
	this.write(tmpl.
		replacev("suc", true).
		replacev("msg", msg.toString()).
		replacev("code", 200)
	);
	this.end();

	console.log(new Date() + ": quick msg: " + msg);

	return;
}

http.ServerResponse.prototype.qjson = function (obj) {
	var dat = JSON.stringify(obj);

	this.writeHead(200, { "Content-Type": "application/json" });
	this.write(dat);
	this.end();

	console.log(new Date() + ": response json: \"" + dat.substring(0, 10) + "...\"");

	return;
}

var serv = new http.Server();

serv.on("request", function (req, res) {
	var date = new Date();
	var purl = url.parse(req.url);
	var path = purl.pathname.substring(1);
	var method = req.method.toUpperCase();
	var attach = {};

	console.log(date + ": " + req.connection.remoteAddress + ": " + method + " \"" + path + "\"");

	var solve = function (query) {
		if (static_addr.hasOwnProperty(path)) {
			res.qres(static_addr[path].dat, static_addr[path].type);
		} else {
			var argv = path.split("/");

			if (handler.hasOwnProperty(argv[0])) {
				handler[argv[0]](req, res, argv, query);
			} else {
				res.qerr(404, errmsg["NOT_FOUND"]);
			}
		}

		return;
	};

	switch (method) {
		case "POST":
			var alldat = "";
			var toobig = false

			req.on("data", function (dat) {
				if (alldat.length < 256 * 1024) {
					alldat += dat;
				} else {
					toobig = true;
				}
			});

			req.on("end", function () {
				if (!toobig) {
					solve(qs.parse(alldat));
				} else {
					res.qjson({ suc: false, msg: errmsg["TOO_HUGE_QUERY"] });
				}
			});

			break;

		case "GET":
			solve(qs.parse(purl.query));
			break;

		default:
			res.qerr(400, errmsg["UNSUPPORT_METHOD"]);
			return;
	}

	return;
});

serv.listen(3131);
