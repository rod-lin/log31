var fs			= require("fs");
var url			= require("url");
var http		= require("http");

Object.prototype.own = Object.prototype.hasOwnProperty;

var static_addr = {};

var readStatic = function (path, type) {
	static_addr[path] = {
		dat: fs.readFileSync(path),
		type: type || ""
	};
	
	return;
}

readStatic("static/cmd.html", "text/html");
readStatic("static/err.html", "text/html");
readStatic("static/css/cmd.css", "text/css");

var handler = {
	"": function (req, res, argv) {
		res.qres(static_addr["static/cmd.html"].dat);
		return;
	}
};

// quick response
http.ServerResponse.prototype.qres = function (dat, type) {
	this.writeHead(200, { "Content-Type": type || "text/html" });
	this.write(dat);
	this.end();

	return;
}

// quick error
http.ServerResponse.prototype.qerr = function (code, msg, type) {
	var tmpl = static_addr["static/err.html"].dat.toString();

	this.writeHead(code, { "Content-Type": type || "text/html" });
	this.write(tmpl.replace("<$message>", msg));
	this.end();

	console.log(new Date() + ": error " + code + ": " + msg);

	return;
}

var serv = new http.Server();

serv.on("request", function (req, res) {
	var date = new Date();
	var purl = url.parse(req.url);
	var path = purl.pathname.substring(1);

	console.log(date + ": request \"" + path + "\"");

	if (static_addr.own(path)) {
		res.qres(static_addr[path].dat, static_addr[path].type);
	} else {
		var argv = path.split("/");

		if (handler.own(argv[0])) {
			handler[argv[0]](req, res, argv);
		} else {
			res.qerr(400, "She... she took it away...");
		}
	}

	return;
});

serv.listen(3131);
