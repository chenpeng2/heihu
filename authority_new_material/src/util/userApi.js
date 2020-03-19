import { WebAuth } from 'auth0-js'
import request from './http'

const homepage = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://mi.blacklake.cn/chinaust'
const responseType = "code"

const webAuth = new WebAuth({
    domain: 'mi-blacklake.auth0.com',
    clientID: '2N0NX5k9eomXYFDcnEXnb2X7qluo2vP1',
    audience: 'https://mi.blacklake.cn/chinaust',
    scope: 'chinaust.qc.query',
    responseType,
})

function getQueryString(url, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = url.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return ''
}

function getToken() {
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
    // const token = localStorage.getItem('access_token')
    const token = getCookie('access_token')
    return Boolean(token)
}

function logOut() {
    // localStorage.removeItem('access_token')
    // localStorage.removeItem('code')
    delCookie('access_token')
    window.location.reload()
}

function login() {
    const url = webAuth.client.buildAuthorizeUrl({
        responseType,
        redirectUri: homepage,
        nonce: 'wHXGv8iwmPVp8ajlamGf6bHLLij9p5BGwtsxbF1ukSc'
    })
    window.location = url
}
function setCookie(cname,cvalue,exdays)
{
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++)
    {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}
function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
export {
    webAuth,
    getToken,
    logOut,
    isLogin,
    login,
    getQueryString,
    setCookie,
    getCookie,
    delCookie
}
