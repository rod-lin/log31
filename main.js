String.prototype.trim = function () {
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

var cl_keydown = function (e) {
	if (e.ctrlKey && e.keyCode == 83) {
		e.preventDefault();
		e.returnValue = false;
		return false;
	}
};

var cl_solveInstr = function (elem, instr, arg, def) {
	if (def[instr]) {
		elem.style[instr] = arg;
	}

	return;
};

var cl_parseText = function () {
	var e = document.getElementById("log31");
	var cont = e.value;
	var i, j, k, len = cont.length - 1;
	var def = {
		"font-size": "20px",
		"font-family": "Consolas, Ubuntu Mono",
		"color": "#313131",
		"background": "#EFEFEF"
	};

	var re = /#\s*([a-zA-Z0-9_-]+)\s*:([^\r\n]*)([\r\n]|$)/g;
	var match;

	for (key in def) {
		e.style[key] = def[key];
	}

	while ((match = re.exec(cont)) != null) {
		cl_solveInstr(e, match[1], match[2].trim(), def);
	}
};

var cl_code = ""
var comp = function (sth) { cl_code += "\n" + sth; return comp; };

comp
	("<html>")
		("<body style='padding: 0; margin: 0;'>")
			("<script>")
				("var cl_keydown = " + cl_keydown + ";")
				("var cl_parseText = " + cl_parseText + ";")
				("var cl_solveInstr = " + cl_solveInstr + ";")
			("</script>")
			("<textarea")
				("id='log31'")
				("style='")
					("font-size: 20px;")
					("font-family: Consolas, Ubuntu Mono;")
					("color: #313131;")
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

var http = require("http");
var serv = new http.Server();

serv.on("request", function (req, res) {
	res.writeHead(200, { "content-type": "text/html" });

	// var write = function (sth) { res.write(sth); return write; }

	res.write(cl_code);

	res.end();
});

serv.listen(3131);
