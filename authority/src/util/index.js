// 时间处理 YYYY/MM/DD
function formatterYMD(time) {
  if(typeof time !== 'number' && typeof time !== 'string' ) {
    return null
  }
  const date = new Date(time);
  const yy = date.getFullYear(), mm = date.getMonth()+1, dd = date.getDate();
  return yy + '/' + mm + '/' + dd
}
//过滤前面有没有&
function filterUrl(url){
    let Urls = url.trim()
    if(Urls.substr(0,1)=='&'){
        Urls =  Urls.substr(1)
    }
    return Urls
}
export {
    formatterYMD,
    filterUrl
}
