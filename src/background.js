
browser.commands.onCommand.addListener((command) => {
    if (command === "toggle-search-input") {
        browser.tabs.query({currentWindow: true, active: true}).then(tabs => {
            for(const tab of tabs){
                browser.tabs.sendMessage(tab.id, 'toggle-search-input')
            }
        })        
    }
});