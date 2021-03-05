
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-search-input") {
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            for(const tab of tabs){
                chrome.tabs.sendMessage(tab.id, 'toggle-search-input')
            }
        })        
    }
});