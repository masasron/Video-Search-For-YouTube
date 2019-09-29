(function (bind) {
    bind.$refs = {};

    function element(tagName, props, children = null) {
        const el = document.createElement(tagName);
        for (let key in props) {
            if (key.startsWith("on")) {
                el.addEventListener(key.substring(2).toLowerCase(), props[key]);
                continue;
            }
            switch (key) {
                case "ref":
                    $refs[props[key]] = el;
                    break;
                case "children":
                    children = props[key];
                    break;
                case "src":
                case "value":
                case "className":
                case "innerText":
                case "innerHTML":
                    el[key] = props[key];
                    break;
                case "style":
                    for (let styleProp in props[key]) {
                        el[key][styleProp] = props[key][styleProp];
                    }
                    break;
                default:
                    el.setAttribute(key, props[key]);
                    break;
            }
        }

        if (children) {
            if (!Array.isArray(children)) {
                children = [children];
            }
            children.forEach(child => el.appendChild(child));
        }

        return el;
    }

    const tags = ["strong", "ul", "li", "h1", "h2", "h3", "h4", "h5", "h6", "div", "input", "textarea", "span", "label", "small", "button", "img"];

    tags.forEach(tag => {
        bind[tag] = (props, children) => element(tag, props, children);
    });
})(window);