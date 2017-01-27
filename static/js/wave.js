var Wave = (function ($) {
	return function (config) {
		var config = $.extend({
			opacity: 1
		}, config);

		/* config {
			container, speed, noise, phase
		} */

		var K = 2;
		var F = 6;
		var speed = config.speed || 0.1;
		var bspeed = speed;
		var noise = config.noise || 0;
		var phase = config.phase || 0;
		var container = $(config.container);

		config.width = container.width();
		config.height = container.height();

		var devicePixelRatio = window.devicePixelRatio || 1;

		var width = devicePixelRatio * (config.width || 320);
		var height = devicePixelRatio * (config.height || 100);

		var MAX = (height / 2) - 4;

		var canvas = document.createElement('canvas');
		
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = (width / devicePixelRatio) + 'px';
		canvas.style.height = (height / devicePixelRatio) + 'px';

		container.append(canvas);

		var ctx = canvas.getContext('2d');

		var run = false;

		function onResize () {
			config.width = container.width();
			config.height = container.height();
			
			width = devicePixelRatio * (config.width || 320);
			height = devicePixelRatio * (config.height || 100);

			var noise = getNoise();
			MAX = (height / 2) - 4;
			setNoise(noise);

			canvas.width = width;
			canvas.height = height;
			canvas.style.width = (width / devicePixelRatio) + 'px';
			canvas.style.height = (height / devicePixelRatio) + 'px';

			return;
		}

		$(window).resize(onResize);

		function globalAttenuationFn(x) {
			return Math.pow(K * 4 / (K * 4 + Math.pow(x, 4)), K * 2);
		}

		function drawLine(attenuation, color, w) {
			ctx.moveTo(0, 0);
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.lineWidth = w || 1;

			var x, y;
			for (var i = -K; i <= K; i += 0.01) {
				x = width * ((i + K) / (K * 2));
				y = height / 2 + noise * globalAttenuationFn(i) * (1 / attenuation) * Math.sin(F * i - phase);

				ctx.lineTo(x, y);
			}
			
			ctx.stroke();
		
			return;
		}

		function clear() {
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillRect(0, 0, width, height);
			ctx.globalCompositeOperation = 'source-over';

			return;
		}

		var alphas = [ 0.1, 0.2, 0.4, 0.6, 0.8 ];

		for (var i = 0; i < alphas.length; i++) {
			alphas[i] *= config.opacity;
		}

		function draw() {
			if (!run) return;

			phase = (phase + speed) % (Math.PI * 64);
			clear();
			drawLine(-2, 'rgba(255, 255, 255, ' + alphas[0] + ')');
			drawLine(-6, 'rgba(255, 255, 255, ' + alphas[1] + ')');
			drawLine(4, 'rgba(255, 255, 255, ' + alphas[2] + ')');
			drawLine(2, 'rgba(255, 255, 255, ' + alphas[3] + ')');
			drawLine(1, 'rgba(255, 255, 255, ' + alphas[4] + ')', 1.5);

			requestAnimationFrame(draw, 1000);

			return;
		}

		function start () {
			if (!run) {
				onResize();
				phase = 0;
				run = true;
				draw();
			}

			return;
		}

		function stop () {
			run = false;
			// clear();
			return;
		}

		function setNoise(v) {
			v = Math.min(v, 1);
			noise = v * MAX;
			// speed = bspeed + v * 0.3;
			return;
		}

		function getNoise() {
			return noise / MAX;
		}

		var am_end = true;
		var am_ampl = 0;
		var am_delay = 16;

		return {
			setSpeed: function (v) {
				speed = v;
				return;
			},

			animateNoise: function (to) {
				if (!am_end) return;
				am_end = false;

				var dest = to;
				var start = getNoise();
				var step = 0.01;
				var sign = dest > start ? 1 : -1;
				var time = 0;
				var i;
				var wave = this;

				for (i = 0;
					 Math.abs(start - dest) > 0.03;
					 start += sign * Math.min(Math.abs(dest - start) / 2, step),
					 i++,
					 time += am_delay) {
					setTimeout((function (n) {
						return function () {
							setNoise(n);
						}
					})(start), time);
				}

				setTimeout(function () {
					setNoise(to);
					am_end = true;
				}, time);
			},

			init: function () {
				var wave = this;

				if (!run) {
					start();

					var handler = setInterval(function () {
						if (!run) {
							clearInterval(handler);
							return;
						}

						setTimeout(function () {
							var n = Math.random();
							if (n > 0.65)
								wave.animateNoise(n * 1.2 * am_ampl);
							if (n < 0.3)
								wave.animateNoise(n * 0.8 * am_ampl);
						}, Math.random() * 2000);
					}, 10);

					return handler;
				}

				return null;
			},

			startr: function () {
				am_ampl = 1;
				am_delay = 16;
				return;
			},

			stopr: function () {
				am_ampl = 0;
				am_delay = 5;
				return;
			}
		}
	}
})(jQuery);
