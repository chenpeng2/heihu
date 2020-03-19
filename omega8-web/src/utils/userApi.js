import { WebAuth } from 'auth0-js'
import request from 'utils/urlHelpers'

// const homepage = 'https://mi.blacklake.cn/omega8'
const homepage = 'http://localhost:3000'
const responseType = "code"

const webAuth = new WebAuth({
    domain: 'mi-blacklake.auth0.com',
    clientID: '2N0NX5k9eomXYFDcnEXnb2X7qluo2vP1',
    audience: 'https://mi.blacklake.cn/omega8',
    scope: 'offline_access dc:query',
    responseType,
})

function getQueryString(url, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = url.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return ''
}

function getToken() {
    // 'https://mi.blacklake.cn/tms/',
    // 'http://172.168.1.244:3000/'
    const url = webAuth.client.buildAuthorizeUrl({
        responseType,
        redirectUri: homepage,
        nonce: 'wHXGv8iwmPVp8ajlamGf6bHLLij9p5BGwtsxbF1ukSc'
    })
    const code = getQueryString(window.location.search, 'code') || localStorage.getItem('code')
    const token = localStorage.getItem('access_token')
    if (code) {
        const data = {
            code,
            redirectUri: homepage,
            grantType: 'authorization_code',
        }
        localStorage.setItem('code', getQueryString(window.location.search, 'code'))
        if (!token) {
            return request({
                url: '/token',
                method: 'GET',
                urlHead: 'https://mi-service.blacklake.cn/auth',
                optionsHeaders: data,
            }).then(function (res) {
                if (res && res.code === 0) {
                    localStorage.setItem('access_token', res.data.access_token)
                    localStorage.setItem('token_type', res.data.token_type)
                    window.location = homepage
                } else {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('code')
                    // window.location = url 
                }
            })
        }
    } else {
        // window.location = url
    }
}

function isLogin() {
    const token = localStorage.getItem('access_token')
    return Boolean(token)
}

function logOut() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('code')
    webAuth.logout({
        returnTo: homepage,
        clientID: '2N0NX5k9eomXYFDcnEXnb2X7qluo2vP1'
    })
}

function login() {
    const url = webAuth.client.buildAuthorizeUrl({
        responseType,
        redirectUri: homepage,
        nonce: 'wHXGv8iwmPVp8ajlamGf6bHLLij9p5BGwtsxbF1ukSc'
    })
    window.location = url
}

export {
    webAuth,
    getToken,
    logOut,
    isLogin,
    login,
    getQueryString
}
