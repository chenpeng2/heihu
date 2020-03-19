//全局路径
import axios from 'axios'

// const commonUrl = 'http://10.100.201.220:8080'
// const commonUrl = 'http://172.168.1.216:8080'
// const commonUrl = 'https://mi-service.blacklake.cn/omega8'
const commonUrl = 'https://mi-service.blacklake.cn/dicastal'
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
    const {data, url, urlHead, errFunc, method, optionsHeaders } = options
    const access_token = localStorage.getItem('access_token')
    const token_type = localStorage.getItem('token_type')
    options = {...options}
    options.mode = 'cors'//跨域
    delete options.url
    if(data){
        delete options.data
        options.body = JSON.stringify({
            ...data
        })
    }
    const headers={
        'Content-Type':'application/json',
        'Authorization': `${token_type} ${access_token}`,
    }
    const requestUrl = urlHead ? urlHead + url : commonUrl + url
    return axios({
        method: method,
        url: requestUrl,
        data,
        headers: optionsHeaders || headers,
    })
        .then(function (response) {
            return response.data
        })
        .catch(function (error) {
        })
}