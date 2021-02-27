async function App() {
    const url = Utilities.getYouTubeURL();

    if (!url) {
        return;
    }

    const SUBTITLES = await Utilities.getSubtitles(url);
    if (SUBTITLES.length === 0) {
        return;
    }

    Utilities.postMessage({ action: "SEARCH.READY" });

    return SearchInput({ SUBTITLES });
}