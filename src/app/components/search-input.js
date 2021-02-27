
function SearchInput(props) {

    let SUGGESTIONS_INDEX = -1;

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
<<<<<<< HEAD
            render: renderAutoComplateItem,
=======
            render: renderAutoCompleteItem,
>>>>>>> 0d76166... Initial commit
            items: Utilities.search(value, props.TIMED_TEXT_LIST).slice(0, 8)
        }));
    }

    function handleCloseButtonClicked() {
        Utilities.postMessage({ action: "SEARCH.CLOSE" });
    }

    return [
        input({ onKeyUp: handleInput, ref: "search_input", spellcheck: "false", placeholder: "Search in video...", autocomplete: "off" }),
        CloseButton({ onClick: handleCloseButtonClicked }),
        div({ className: "autocomplate", ref: "dropdown" })
    ];
}