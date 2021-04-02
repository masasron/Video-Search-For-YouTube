async function App() {
    const url = Utilities.getYouTubeURL()

    if (!url) return
    if((await Utilities.getCaptionTracks(url)).length ==  0) return

    var searchInput = SearchInput(url)

    Utilities.postMessage({ action: "SEARCH.READY" })

    return searchInput
}