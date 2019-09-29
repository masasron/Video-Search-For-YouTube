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
    search(value, timedTextList) {
        var results = [];
        var words = value.toLowerCase().replace(/[^a-z0-9\s]/gim, '').trim().split(' ').filter(word => word);

        if (words.length === 0) {
            return [];
        }

        for (let i = 0; i < timedTextList.length; i++) {
            var matches = [];
            for (let j = 0; j < words.length; j++) {
                if (i + j >= timedTextList.length) {
                    continue;
                }
                let word = words[j];
                if (timedTextList[i + j].word.indexOf(word) === 0) {
                    matches.push({
                        word: timedTextList[i + j].word,
                        time: timedTextList[i + j].time,
                        right: timedTextList.slice(i + j + 1, i + j + 4).map(_ => _.word)
                    });
                }
            }
            if (matches.length === words.length) {
                results.push({
                    time: matches[0].time,
                    word: matches.map(_ => _.word).join(" "),
                    right: matches[matches.length - 1].right
                });
            }
        }

        return results;
    },
    fancyTimeFormat(time) {
        let hrs = ~~(time / 3600);
        let mins = ~~((time % 3600) / 60);
        let secs = ~~time % 60;
        let ret = "";
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    },
    postMessage(message) {
        window.parent.postMessage(message, "https://www.youtube.com");
    },
    async  _getTimedTextUrl(url) {
        let res = await fetch(url);
        let html = await res.text();
        let languages = html.split('https:\/\/www.youtube.com\/api\/timedtext');
        for (let i = 0; i < languages.length; i++) {
            if (languages[i].indexOf('lang=en') !== -1) {
                let url = languages[i].split('","')[0];
                if (url.length < 1000) {
                    let json = '{"url":"https:\/\/www.youtube.com\/api\/timedtext' + url + '"}';
                    return JSON.parse(json).url + '&lang=en&fmt=srv3&xorb=2&xobt=3&xovt=3';
                }
            }
        }
        return null;
    },
    async  _downloadTimedText(url) {
        let timedtextURL = await Utilities._getTimedTextUrl(url);

        if (!timedtextURL) {
            return "";
        }

        let res = await fetch(timedtextURL);
        let text = await res.text();
        if (text.length === "") {
            throw new Error("No timed text found");
        }
        return text;
    },
    async getSubtitles(url) {
        const text = await Utilities._downloadTimedText(url);
        return Utilities._parseTimedText(text);
    },
    _parseTimedText(xml) {
        let xmlDocument = document.implementation.createHTMLDocument("");
        xmlDocument.write(xml);
        let jsonTimedText = [];
        Array.from(xmlDocument.querySelectorAll("p")).forEach(p => {
            let time = parseInt(p.getAttribute("t"));
            let text = p.innerText.toLowerCase().replace(/\n/ig, ' ').replace(/\[.*\]/gim, '').replace(/\(.*\)/gim, '').replace(/[^a-z0-9\s]/gim, '').trim();
            if (!text) {
                return;
            }
            let words = text.split(' ');
            words.forEach(word => {
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
    },
    searchSubtitles(query, subtitles) {
        let results = [];
        for (let i = 0; i < subtitles.length; i++) {
            let subtitle = subtitles[i];
            if (subtitle.text.match(query)) {
                results.push({
                    subtitle,
                    left: subtitles.slice(i - 5, i - 1),
                    right: subtitles.slice(i + 1, i + 5)
                });
            }
        }
        return results;
    }
};