//全局路径
import axios from 'axios'
import { Base64 } from 'js-base64';
// const commonUrl = process.env.NODE_ENV === 'development' ? 'https://mi-service.blacklake.cn/chinaust-maindata' : 'https://mi-service.blacklake.cn/chinaust-maindata'
const commonUrl = process.env.NODE_ENV === 'development' ? 'http://172.168.1.82:9090' : 'https://mi-service.blacklake.cn/chinaust-maindata'
// process.env.NODE_ENV === 'development' ? 'http://localhost:9090': 'http://172.168.1.237:9090'
//解析json
function parseJSON(response){
    return response.json()
}
//检查请求状态
function checkStatus(response){

    if(response.status >= 200 && response.status < 500){
        return response
    }
    const error = new Error(response.statusText)
    error.response = response
    throw error
}
export default function request(options = {}){
    const {data, url, urlHead, errFunc, method, optionsHeaders, success, error } = options
    // const access_token = localStorage.getItem('access_token')
    // const token_type = localStorage.getItem('token_type')
    // const access_token = localStorage.getItem('access_token')
    // const token_type = localStorage.getItem('token_type')
    const origin = window.location.href
    let client_id = "user-service";
    if(origin.indexOf('tms') > -1){
        client_id = "tms-service"
    }else if(origin.indexOf('dicastal') > -1){
        client_id = "dicastal-service"
    }else if(origin.indexOf('omega8') > -1){
        client_id = "omega8-service"
    }
    options = {...options}
    options.mode = 'cors'//跨域
    delete options.url
    if(data){
        delete options.data
        options.body = JSON.stringify({
            ...data
        })
    }
    const basic={
        client_id:client_id,
        client_sercet:'123456'
    }
    const base64basic = Base64.encode(basic.client_id+':'+basic.client_sercet)
    const headers={
        'Content-Type':'application/json',
        // 'Authorization': `${token_type} ${access_token}`
        'Authorization': `Basic ${base64basic}`
    }
    const requestUrl = urlHead ? urlHead + url : commonUrl + url
    return  axios({
        method: method,
        url: requestUrl,
        data,
        headers: optionsHeaders || headers
    })
        .then(function (res) {
            success && success(res.data)
            return res.data
        },function (err) {
            error && error(err)
        })
        .catch(function (err) {
            error && error(err)
    })

}