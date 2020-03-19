import { refresh, getUserInfo } from './userApi'
import { Base64 } from 'js-base64';
import axios from 'axios'
//全局路径
const commonUrl = process.env.NODE_ENV === 'development' ? 'https://mi-service.blacklake.cn/gateway/tms' : 'https://mi-service.blacklake.cn/gateway/tms'
const homepage = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://mi.blacklake.cn/tms'
export default function request(options = {}) {
  const { data, url, urlHead, method, optionsHeaders, success, error } = options
  const access_token = localStorage.getItem('access_token')
  const userId = getUserInfo().id
  let client_id = "tms-service";
  options = { ...options }
  options.mode = 'cors'//跨域
  delete options.url
  if (data) {
    delete options.data
    options.body = JSON.stringify({
      ...data
    })
  }
  const basic = {
    client_id: client_id,
    client_sercet: '123456'
  }
  const base64basic = Base64.encode(basic.client_id + ':' + basic.client_sercet)
  const headers = (url.indexOf('login') > -1 || url.indexOf('refresh') > -1 || url.indexOf('updatePassword') > -1) ? {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${base64basic}`
  } : {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
      'uid': userId,
    }
  const requestUrl = urlHead ? urlHead + url : commonUrl + url
  return axios({
    method: method,
    url: requestUrl,
    data,
    headers: optionsHeaders || headers,
    // timeout:10000
    })
    .then((res) => {
      if (res && res.data && res.data.code === -2) {
          alert(res.data.msg)
          return
      }
      if (res && res.data) {
        success && success(res.data)
        return res.data
      }
    })
    .catch(err => {
      const timeout = err.message && err.message.includes('timeout')
      const Network = err.message && err.message.includes('Network Error')
      if (timeout || Network) {
        // alert('网络超时')
      }
      error && error(err)
      if (err.response && err.response.status === 401) {
        if (err.response.data.code === -4) {
          localStorage.removeItem('access_token')
          window.location.href = homepage
        } else {
            refresh()
        }
      } else if (err.response && err.response.status === 500) {
        // alert(err.response.data.msg || '网络连接出错')
      } else if (err.response && err.response.status === 400) {
        // alert(err.response.data.msg || '请求出错了')
      }
    })
}