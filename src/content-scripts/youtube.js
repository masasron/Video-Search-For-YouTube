(function() {
	const state = {
		SEARCH_IFRAME: null,
		YOUTUBE_PLAYER: null,
		MOUSE_OVER_FRAME: null,
		IFRAME_ID: 'YTSEARCH_IFRAME',
		SEARCH_BOX_VISIBILITY: false,
		YOUTUBE_RIGHT_CONTROLS: null,
		YOUTUBE_PLAYER_SEARCH_BUTTON: null,
		SEARCH_SVG_HTML:
			'<svg width="56%" height="100%" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"> <path fill="#ffffff" d="M1216 832q0-185-131.5-316.5t-316.5-131.5-316.5 131.5-131.5 316.5 131.5 316.5 316.5 131.5 316.5-131.5 131.5-316.5zm512 832q0 52-38 90t-90 38q-54 0-90-38l-343-342q-179 124-399 124-143 0-273.5-55.5t-225-150-150-225-55.5-273.5 55.5-273.5 150-225 225-150 273.5-55.5 273.5 55.5 225 150 150 225 55.5 273.5q0 220-124 399l343 343q37 37 37 90z" /> </svg>'
	};

	const helpers = {
		onUrlChange(callback) {
			let href = '';
			return setInterval(function() {
				if (href !== window.location.href) {
					href = window.location.href;
					callback(href);
				}
			}, 1);
		},
		isVideoURL(url) {
			return url.indexOf(`https://${window.location.host}/watch`) === 0;
		}
	};

	const render = {
		iframe() {
			const iframe = document.createElement('iframe');
			iframe.setAttribute('id', state.IFRAME_ID);
			iframe.style =
				'margin-left:-150px;top:10%;left:50%;position:absolute;z-index:99999;overflow:hidden;display:none;';
			iframe.addEventListener('mouseenter', () => (state.MOUSE_OVER_FRAME = true));
			iframe.addEventListener('mouseout', () => (state.MOUSE_OVER_FRAME = false));
			return iframe;
		},
		baseButton() {
			const button = document.createElement('button');
			button.style.display = 'none';
			button.style.textAlign = 'center';
			button.classList.add('ytp-button');
			return button;
		},
		searchButton() {
			const button = render.baseButton();
			button.innerHTML = state.SEARCH_SVG_HTML;
			button.addEventListener('click', () => {
				state.SEARCH_BOX_VISIBILITY = !state.SEARCH_BOX_VISIBILITY;
				render.byState();
				state.SEARCH_IFRAME.focus();
				state.SEARCH_IFRAME.contentWindow.postMessage({}, '*');
			});
			return button;
		},
		byState() {
			if (!state.SEARCH_BOX_VISIBILITY) {
                state.SEARCH_IFRAME.style.display = 'none';
                return;
			}
			if (state.MOUSE_OVER_FRAME || !state.YOUTUBE_PLAYER) {
				return;
			}
			if (state.YOUTUBE_PLAYER.classList.contains('ytp-autohide')) {
                state.SEARCH_IFRAME.style.display = 'none';
			} else {
                state.SEARCH_IFRAME.style.display = 'block';
			}
		}
	};

	const logic = {
		handleMessage(event) {
			let extension_url = browser.runtime.getURL('').slice(0, -1);
			if (event.origin !== extension_url) {
				return;
			}

			const data = event.data;
			switch (data.action) {
				case 'SEARCH.READY':
					state.YOUTUBE_PLAYER_SEARCH_BUTTON.style.display = 'inline';
					break;
				case 'SEARCH.CLOSE':
					state.SEARCH_BOX_VISIBILITY = false;
					render.byState();
					break;
				case 'SKIP':
					document.querySelector('video').currentTime = data.payload;
					break;
                case 'SEARCH.UPDATE_HEIGHT':
                    state.SEARCH_IFRAME.style.height = data.payload;
                    break;
				default:
					console.log('UNSUPPORTED ACTION', data);
					break;
			}
		}
	};

	function setup(url) {
		if (!helpers.isVideoURL(url)) {
			return;
		}

		state.YOUTUBE_PLAYER = document.querySelector('#container .html5-video-player');
		if (state.YOUTUBE_PLAYER) {
			addOrUpdateSearchButton();
			addOrUpdateSearchInput(url);
		} else {
			setTimeout(() => setup(window.location.href), 2000);
		}
	}
	function addOrUpdateSearchInput(url) {
		state.SEARCH_IFRAME = render.iframe();
		state.SEARCH_IFRAME.src = browser.runtime.getURL('src/app/index.html') + '?url=' + encodeURIComponent(url);

		if (!document.getElementById(state.IFRAME_ID)) {
			state.YOUTUBE_PLAYER.appendChild(state.SEARCH_IFRAME);
		} else {
			document.getElementById(state.IFRAME_ID).replaceWith(state.SEARCH_IFRAME);
		}
	}

	function addOrUpdateSearchButton() {
		if (state.YOUTUBE_PLAYER_SEARCH_BUTTON) {
			state.YOUTUBE_PLAYER_SEARCH_BUTTON.remove();
		}
		state.YOUTUBE_PLAYER_SEARCH_BUTTON = render.searchButton();
		state.YOUTUBE_RIGHT_CONTROLS = state.YOUTUBE_PLAYER.querySelector('.ytp-right-controls');
		state.YOUTUBE_RIGHT_CONTROLS.insertBefore(
			state.YOUTUBE_PLAYER_SEARCH_BUTTON,
			state.YOUTUBE_RIGHT_CONTROLS.firstChild
		);
	}

	helpers.onUrlChange(setup);
	setInterval(render.byState, 10);
	window.addEventListener('message', logic.handleMessage);
})();
