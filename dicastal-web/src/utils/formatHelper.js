const getQueryString = (url, name) => { 
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = url.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); 
    return ''
}

export {
    getQueryString,
}