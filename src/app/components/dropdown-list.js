
function DropDownList(props) {
    const children = props.items ? props.items.map(props.render) : [];
    return ul({ ref: "dropdown_ul", children });
}