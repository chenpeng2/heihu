//全局路径
import axios from 'axios'
import { Base64 } from 'js-base64';
import {getCookie,deleteAllCookie,refresh} from './userApi'
import { message } from 'antd';
const commonUrl = process.env.NODE_ENV === 'development' ? 'https://mi-service.blacklake.cn/gateway/user' : 'https://mi-service.blacklake.cn/gateway/user'
// process.env.NODE_ENV === 'development' ? 'http://localhost:9090': 'http://172.168.1.237:9090'
//解析json
function parseJSON(response){
    return response.json()
}
//检查请求状态
// function checkStatus(response){
//     if(response.status >= 200 && response.status < 500){
//         if (response.status === 403) {
//             localStorage.setItem('error_page', 403)
//             window.location.href = '/403'
//         } else {
//             return response
//         }
//     }
//     const error = new Error(response.statusText)
//     error.response = response
//     throw error
// }

function modalToken(zIndex,mess,mess2,callback){
    var  isHav = document.getElementsByClassName('token-modal')
    // if(isHav.length>0)return
    var button=document.createElement("button");
    var p=document.createElement("p");
    var div=document.createElement("div");
    button.innerHTML=mess;
    button.onclick=function () {
        callback()
    }
    p.innerHTML=mess2;
    p.appendChild(button)
    div.className='token-modal token-modal'+ zIndex;
    div.appendChild(p)
    document.body.appendChild(div);
}
export default function request(options = {}){
    const {data, url, urlHead, errFunc, method, optionsHeaders, success, error } = options
    const access_token=getCookie('access_token')
    let client_id = "user-service";
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
    const headers=(url.indexOf('login') >-1 || url.indexOf('refresh')>-1)?{
        'Content-Type':'application/json',
        'Authorization': `Basic ${base64basic}`
    }:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${access_token}`
    }
    const requestUrl = urlHead ? urlHead + url : commonUrl + url
    return  axios({
        method: method,
        url: requestUrl,
        data,
        headers: optionsHeaders || headers,
        // timeout:10000
    })
        .then((res)=>{
            if (res && res.data && res.data.code && res.data.code !== 0) {
                if(res.data.msg.indexOf('机构') > -1 || res.data.msg.indexOf('密码') > -1 || res.data.msg.indexOf('用户') > -1){
                    message.error(res.data.msg)
                }else{
                    modalToken(999,"去登录","您的账户信息已失效，请重新登录！",()=>{
                        deleteAllCookie()
                    })
                }
                return
            }
            success && success(res.data)
            return res.data
        },function (err) {
            console.log('接口报错');
            const timeout = err.message && err.message.includes('timeout')
            const Network = err.message && err.message.includes('Network Error')
            if(timeout || Network){
                console.log(err.message)
                // alert('网络超时')
                return
            }
            if(err.response && err.response.status==401){
                if(err.response.data.code == -4){
                    if(err.response.data.msg){
                        modalToken(999,"去登录","您的账户信息已失效，请重新登录！",()=>{
                            deleteAllCookie()
                        })
                        return
                    }
                    modalToken(998,"去刷新","您的账户信息已失效，请刷新一下！",()=>refresh())
                    return
                }else if(err.response.data.code == -6){
                    modalToken(999,"去登录","您的账户信息已失效，请重新登录！",()=>{
                        deleteAllCookie()
                    })
                    return
                }
            }else if(err.response && err.response.status==403){
                if(err.response.data.error === 'access_denied'){
                    modalToken(999,"退出登录","您的账户无权限，不允许访问！",()=>{
                        deleteAllCookie()
                    })
                }
                return
            }else if(err.response && err.response.status==500){
                console.log(err.response.data.error || err.response.data.msg)
                if(window.location.hash){
                    window.location.hash='500'
                }
                return
                // alert(err.response.data.error || '服务器异常')
            }
            error && error(err)
        })
        .catch(err=> {
            console.log('处理逻辑出错');
            error && error(err)
        })
}