
async function SearchInput(url) {

    let SUGGESTIONS_INDEX = -1

    CAPTION_TRACKS = await Utilities.getCaptionTracks(url)
    CUR_CAPTION_TRACK = null
    SUBTITLES = []

    r = await setTrackByName("English")
    if(!r) r = await setTrackByName("English (United Kingdom)")
    if(!r) r = await setTrackByName("English (United States)")
    if(!r) r = await setTrackByName("English (auto-generated)")
    if(!r) await setTrackByIdx(0)
    

    function renderAutoCompleteItem(item) {
        return li({ onClick: () => handleAutoCompleteItemClick(item) }, [
            strong({ innerText: item.word + " " }),
            span({ innerText: item.right.join(" ") }),
            small({ innerText: Utilities.fancyTimeFormat(item.time / 1000) })
        ])
    }

    function handleAutoCompleteItemClick(item) {
        Utilities.postMessage({
            action: "SKIP",
            payload: item.time / 1000
        });

        $refs.search_input.value = "";
        $refs.dropdown.innerHTML = "";
        handleCloseButtonClicked()
    }

    function keyboardShortcuts(event) {
        let result = false;
        switch (event.keyCode) {
            // Enter
            case 13:
                if (SUGGESTIONS_INDEX > -1) {
                    $refs.dropdown_ul.children[SUGGESTIONS_INDEX].click();
                }
                result = true;
                break;
            case 38:
                // ArrowUp
                result = true;
                if (SUGGESTIONS_INDEX - 1 >= 0) {
                    if (SUGGESTIONS_INDEX !== null) {
                        $refs.dropdown_ul.children[SUGGESTIONS_INDEX].classList.remove("active");
                    }
                    SUGGESTIONS_INDEX--;
                    $refs.dropdown_ul.children[SUGGESTIONS_INDEX].classList.add("active");
                }
                break;
            case 40:
                // ArrowDown
                result = true;
                if (SUGGESTIONS_INDEX + 1 < $refs.dropdown_ul.children.length) {
                    if (SUGGESTIONS_INDEX >= 0) {
                        $refs.dropdown_ul.children[SUGGESTIONS_INDEX].classList.remove("active");
                    }
                    SUGGESTIONS_INDEX++;
                    $refs.dropdown_ul.children[SUGGESTIONS_INDEX].classList.add("active");
                }
                break;

        }
        return result;
    }

    function handleInput(event) {
        if (keyboardShortcuts(event)) {
            return;
        }

        SUGGESTIONS_INDEX = -1;
        $refs.dropdown.innerHTML = "";

        const value = event.target.value.toLowerCase();

        if (value.length === 0) {
            return;
        }
        
        $refs.dropdown.appendChild(DropDownList({
            render: renderAutoCompleteItem,
            items: Utilities.searchSubtitles(value, SUBTITLES).slice(0, 8)
        }));
    }

    function handleTrackOptionChanged(event) {     
        setTrackByName(event.target.value)
    }

    async function setTrackByName(name) {
        for(let i=0; i<CAPTION_TRACKS.length; i++){
            if(CAPTION_TRACKS[i].name.simpleText == name){
                setTrackByIdx(i)
                return true
            }
        }
        return false
    }

    async function setTrackByIdx(subtitleIdx) {
        CUR_CAPTION_TRACK = CAPTION_TRACKS[subtitleIdx]
        SUBTITLES = await Utilities.getSubtitles(CUR_CAPTION_TRACK)
    }

    function handleCloseButtonClicked() {
        Utilities.postMessage({ action: "SEARCH.CLOSE" });
    }

    return [
        SubtitleSelect({
            items: CAPTION_TRACKS.map(x => x.name.simpleText),
            onChange: handleTrackOptionChanged,
            className: "subitle-select",
            ref: "subtitleSelect",
            value: CUR_CAPTION_TRACK.name.simpleText
        }),
        div({class: "relative", children : [
            input({ onKeyUp: handleInput, ref: "search_input", spellcheck: "false", placeholder: "Search in video...", autocomplete: "off" }),
            CloseButton({ onClick: handleCloseButtonClicked }),
        ]}),
        div({ className: "autocomplate", ref: "dropdown" }),
    ];
}