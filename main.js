var http = require("http");
var fs = require("fs");

var cl_script = fs.readFileSync("cl.js");

var cl_code = ""
var comp = function (sth) { cl_code += " " + sth; return comp; };

comp
	("<html>")
		("<body style='padding: 0; margin: 0;'>")
			("<script>")
				(cl_script)
			("</script>")
			("<textarea")
				("id='log31'")
				("style='")
					("width: 100%;")
					("height: 100%;")
					("border: 0;")
					("padding: 31px;")
					("margin: 0;")
					("resize: none;'")
				("spellcheck=false")
				("onkeydown='cl_keydown(event)'")
				("onkeyup='cl_parseText()'")
			(">")
			("</textarea>")
		("</body>")
	("</html>")
;

var serv = new http.Server();

serv.on("request", function (req, res) {
	res.writeHead(200, { "content-type": "text/html" });

	// var write = function (sth) { res.write(sth); return write; }

	res.write(cl_code);

	res.end();
});

serv.listen(3131);
