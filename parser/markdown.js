var md = require("markdown");

exports.parse = function (meta) {
	return {
		suc: true,
		cont:
			"<!DOCTYPE html>" +
			"<html>" +
				"<head>" +
					"<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>" +
					"<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
					"<link rel='stylesheet' href='/static/css/common.css' />" +
					"<link rel='stylesheet' href='/static/css/markdown.css' />" +
				"</head>" +
				"<body class='markdown-body'>" +
					md.markdown.toHTML(meta) +
				"</body>" +
			"</html>"
	};
};
