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
        return Array.from(timedTextList
            .slice(firstWordIdx, firstWordIdx + words.length)
            .entries())
            .map(([ idx, timedText ]) => timedText.word.indexOf(words[idx]) === 0)
            .every(Boolean);
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

        // console.log('timedtextUrl')
        // console.log(timedtextURL)

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
};