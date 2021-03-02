async function App() {
    const url = Utilities.getYouTubeURL();

    if (!url) {
        return;
    }

    const CAPTION_TRACKS = await Utilities.getCaptionTracks(url)
    if (CAPTION_TRACKS.length === 0) {
        return;
    }

    const SUBTITLES = await Utilities.getSubtitles(CAPTION_TRACKS);
    if (SUBTITLES.length === 0) {
        return;
    }

    Utilities.postMessage({ action: "SEARCH.READY" });

    return SearchInput({ SUBTITLES, CAPTION_TRACKS });
}