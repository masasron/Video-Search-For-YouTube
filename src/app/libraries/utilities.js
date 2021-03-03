window.Utilities = {
	getYouTubeURL() {
		try {
			var url = decodeURIComponent(window.location.href.split('url=')[1]);
			if (url.indexOf('https://www.youtube.com/watch') !== 0) {
				return null;
			}
			return url;
		} catch (error) {
			return null;
		}
	},
	searchSubtitles(value, timedTextList) {
		var results = [];
		var words = value.toLowerCase().replace(/[^a-z0-9\s]/gim, '').trim().split(' ').filter((word) => word);

		if (words.length === 0) {
			return [];
		}

		for (let firstWordIdx = 0; firstWordIdx < timedTextList.length; firstWordIdx++) {
			if (Utilities._isMatch(timedTextList, firstWordIdx, words)) {
				results.push({
					time: timedTextList[firstWordIdx].time,
					word: timedTextList[firstWordIdx].word,
					right: timedTextList.slice(firstWordIdx + 1, firstWordIdx + 4).map((_) => _.word)
				});
			}
		}

		return results;
	},
	_isMatch(timedTextList, firstWordIdx, words) {
		return Array.from(timedTextList.slice(firstWordIdx, firstWordIdx + words.length).entries())
			.map(([ idx, timedText ]) => timedText.word.indexOf(words[idx]) === 0)
			.every(Boolean);
	},
	fancyTimeFormat(time) {
		let hrs = ~~(time / 3600);
		let mins = ~~((time % 3600) / 60);
		let secs = ~~time % 60;
		let ret = '';
		if (hrs > 0) {
			ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
		}
		ret += '' + mins + ':' + (secs < 10 ? '0' : '');
		ret += '' + secs;
		return ret;
	},
	postMessage(message) {
		window.parent.postMessage(message, 'https://www.youtube.com');
	},
	async getSubtitles(caption_tracks, subtitleIdx = 0) {
		const text = await Utilities._downloadTimedText(caption_tracks, subtitleIdx);
		return Utilities._parseTimedText(text);
	},
	async _downloadTimedText(caption_tracks, subtitleIdx) {
		let timedtextURL = await Utilities._getTimedTextUrl(caption_tracks, subtitleIdx);

		if (!timedtextURL) {
			return '';
		}

		let res = await fetch(timedtextURL);
		let text = await res.text();
		if (text.length === '') {
			throw new Error('No timed text found');
		}
		return text;
	},
	async _getTimedTextUrl(caption_tracks, subitleIdx) {
		// to get one word per line
		return caption_tracks[subitleIdx].baseUrl + '&fmt=srv3&xorb=2&xobt=3&xovt=3';
	},
	async getCaptionTracks(url) {
		let res = await fetch(url);
		let html = await res.text();

		if (html.indexOf('captionTracks') === -1) {
			return [];
		}

		let startIdx = html.indexOf('captionTracks');
		startIdx = html.indexOf('[', startIdx);

		let curIdx = startIdx + 1;
		let depth = 1;
		while (depth != 0) {
			let curChar = html[curIdx];
			if (curChar == '[') depth += 1;
			else if (curChar == ']') depth -= 1;
			curIdx += 1;
		}
		let caption_tracks_json = html.substring(startIdx, curIdx);
		let result = JSON.parse(caption_tracks_json);
		return result;
	},
	_parseTimedText(xml) {
		let xmlDocument = document.implementation.createHTMLDocument('');
		xmlDocument.write(xml);
		let jsonTimedText = [];
		Array.from(xmlDocument.querySelectorAll('p')).forEach((p) => {
			let time = parseInt(p.getAttribute('t'));
			let text = p.innerText
				.toLowerCase()
				.replace(/\n/gi, ' ')
				.replace(/\[.*\]/gim, '')
				.replace(/\(.*\)/gim, '')
				.replace(/[^a-z0-9\s]/gim, '')
				.trim();
			if (!text) {
				return;
			}
			let words = text.split(' ');
			words.forEach((word) => {
				if (!word) {
					return;
				}
				jsonTimedText.push({
					word: word,
					time
				});
			});
		});
		return jsonTimedText;
	}
};
