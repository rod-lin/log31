function Cmd(e, env) {
	// env {
	//     qmsg(string, timeout, callback),
	//     jump(argv),
	//     custom { ... },
	//     (opt)keys { ... }
	// }
	var hist = [];
	var cur_hist = -1;
	var handler = {
		"log": env.jump
	};

	for (key in env.custom) {
		if (env.custom.hasOwnProperty(key)) {
			handler[key] = env.custom[key];
		}
	}

	return {
		solve: function () {
			var orig = e.value;
			var argv = orig.trim().split(/\s+/g);

			cur_hist = -1;
			e.value = "";

			if (argv[0] == "") return;
			hist.push(orig);

			e.placeholder = "";
			e.blur();

			if (handler.hasOwnProperty(argv[0])) {
				handler[argv[0]](argv);
				e.focus();
			} else {
				env.qmsg(":( no such command...", null, function () { e.focus(); });
			}
		},

		back: function () {
			if (cur_hist == -1) {
				if (hist.length) {
					cur_hist = hist.length - 1;
					e.value = hist[cur_hist];
				}
			} else if (cur_hist) {
				cur_hist--;
				e.value = hist[cur_hist];
			}

			return;
		},

		forward: function () {
			if (cur_hist != -1) {
				if (cur_hist + 1 < hist.length) {
					cur_hist++;
					e.value = hist[cur_hist];
				} else {
					cur_hist = -1;
					e.value = "";
				}
			}

			return;
		},

		keydown: function (event, c) {
			if (env.keys && env.keys[c]) {
				env.keys[c](event);
			}

			return;
		}
	};
};
