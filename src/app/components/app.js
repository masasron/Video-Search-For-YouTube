async function App() {
    const url = Utilities.getYouTubeURL();

    if (!url) {
        return;
    }

    const TIMED_TEXT_LIST = await Utilities.getSubtitles(url);
    if (TIMED_TEXT_LIST.length === 0) {
        return;
    }

    Utilities.postMessage({ action: "SEARCH.READY" });

    return SearchInput({ TIMED_TEXT_LIST });
}