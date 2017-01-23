String.prototype.trim = function () {
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

var cl_keydown = function (e) {
	var c = e.keyCode;
	var prevdef = function () {
		e.preventDefault();
		e.returnValue = false;
	};

	if (e.ctrlKey) {
		if (c == 83) {
			prevdef();
		} else if (c == 69) {
			prevdef();
		}
	} else if (c == 27) {
		prevdef();
	}

	return;
};

var cl_defStyle = {
	"font-size": "20px",
	"font-family": "Consolas, Ubuntu Mono",
	"color": "#313131",
	"background": "#EFEFEF"
};

var cl_solveStyle = function (e, instr, arg) {
	if (cl_defStyle[instr]) {
		e.style[instr] = arg;
	}

	return;
};

var cl_solveInstr = function (e, args) {
	return;

	var handler = {
		"save": function () {
			alert("saving!!");
		}
	};

	if (!args.length) return;

	var h = handler[args[0]];

	if (!h) return;

	h();

	return;
};

var cl_initStyle = function (e) {
	for (key in cl_defStyle) {
		e.style[key] = cl_defStyle[key];
	}

	return;
}

var cl_parseText = function () {
	var e = document.getElementById("log31");
	var cont = e.value;
	var i, j, k, len = cont.length - 1;

	var style = /#\s*([a-zA-Z0-9_-]+)\s*:([^\r\n]*)([\r\n]|$)/g;
	var instr = />([^\r\n]*)([\r\n])/g;
	var match;

	cl_initStyle(e);

	while ((match = style.exec(cont)) != null) {
		cl_solveStyle(e, match[1], match[2].trim());
	}

	while ((match = instr.exec(cont)) != null) {
		cl_solveInstr(e, match[1].trim().split(/\s+/g));
	}

	return;
};

var cl_init = function () {
	var e = document.getElementById("log31");

	cl_initStyle(e);

	e.focus();

	return;
};

window.onload = cl_init;
