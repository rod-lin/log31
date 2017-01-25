function hasCookie(name)
{
	return document.cookie.indexOf(escape(name) + "=") != -1;
}

function setCookie(name, value)
{
	if (hasCookie(name)) {
		var cookies = document.cookie.split(/\s*;\s*/g);
		var i, reg = new RegExp(escape(name) + "=.*", "g");

		for (i = 0; i < cookies.length; i++) {
			if (cookies[i].match(reg)) {
				cookies[i] = escape(name) + "=" + escape(value);
				break;
			}
		}

		document.cookie = cookies.join(";");
	} else {
		if (document.cookie != "")
			document.cookie += ";"

		document.cookie += escape(name) + "=" + escape(value);
	}

	return;
}

function getCookie(name)
{
	return (new RegExp(escape(name) + "=(.*)", "g")).exec(document.cookie)[1];
}
