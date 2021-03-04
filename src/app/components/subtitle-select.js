function SubtitleSelect(props){
    let result = select({...props})
    for(const option of props.items){
        let curOption = document.createElement('option')
        curOption.innerHTML = option
        result.appendChild(curOption)
    }
    if(props.items.length == 1) result.disabled = true
    
    return result
}