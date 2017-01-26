var fs			= require("fs");
var url			= require("url");
var http		= require("http");
var util		= require("./util.js");
var log			= require("./log.js");

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

	"log": function (req, res, argv) {
		if (argv.length < 2) {
			res.qerr(400, "too less arguments");
		} else {
			switch (argv[1]) {
				case "open":
					var logno = parseInt(argv[2]);
					if (!isNaN(logno)) {
						var ret = log.parse(logno);

						if (ret.suc) {
							res.qres(ret.cont, "text/html");
						} else {
							res.qerr(400, ret.msg);
						}
					} else {
						res.qerr(400, "it's not a log number...");
					}

					break;

				case "edit":
					var logno = parseInt(argv[2]);
					if (!isNaN(logno)) {
						res.qerr(400, "log " + logno + " is locked");
					} else {
						res.qerr(400, "it's not a log number...");
					}

					break;

				case "status":
					res.qerr(400, "I'm pretty fine");
					break;

				default:
					res.qerr(400, "I don't know this option...");
					break;
			}
		}
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
		replace(/<\$suc>/g, "false").
		replace(/<\$msg>/g, code + "<br>" + msg).
		replace(/<\$code>/g, code.toString())
	);
	this.end();

	console.log(new Date() + ": error " + code + ": " + msg);

	return;
}

var serv = new http.Server();

serv.on("request", function (req, res) {
	var date = new Date();
	var purl = url.parse(req.url);
	var path = purl.pathname.substring(1);

	console.log(date + ": " + req.connection.remoteAddress + ": " + req.method + " \"" + path + "\"");

	if (static_addr.hasOwnProperty(path)) {
		res.qres(static_addr[path].dat, static_addr[path].type);
	} else {
		var argv = path.split("/");

		if (handler.hasOwnProperty(argv[0])) {
			handler[argv[0]](req, res, argv);
		} else {
			res.qerr(400, "she... she took it away...");
		}
	}

	return;
});

serv.listen(3131);
