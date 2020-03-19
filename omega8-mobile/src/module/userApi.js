import { WebAuth } from 'auth0-js'
// const homepage = 'http://localhost:3001'
const homepage = 'https://mi.blacklake.cn/omega8-mobile'
const responseType = "code"

const webAuth = new WebAuth({
    domain:       'mi-blacklake.auth0.com',
    clientID:     '2N0NX5k9eomXYFDcnEXnb2X7qluo2vP1',
    audience: 'https://mi.blacklake.cn/omega8', 
    scope: 'offline_access dc:query',
    responseType
})

function getQueryString(url, name) { 
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = url.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); 
    return ''
}

function authLogin() {
    // webAuth.authorize({
    //     audience: 'https://mi.blacklake.cn/omega8', 
    //     scope: 'offline_access dc:query',
    //     responseType: 'code', 
    //     redirectUri: homepage, //'https://mi.blacklake.cn/omega8/',
    //     nonce: 'wHXGv8iwmPVp8ajlamGf6bHLLij9p5BGwtsxbF1ukSc'
    // })
    const url = webAuth.client.buildAuthorizeUrl({
        responseType,
        redirectUri: homepage,
        nonce: 'wHXGv8iwmPVp8ajlamGf6bHLLij9p5BGwtsxbF1ukSc'
    })
    window.location = url
}

function getToken (tokenBefore, tokenAfter, callback) {

    const code = getQueryString(window.location.search, 'code') || localStorage.getItem('code')
    const token = localStorage.getItem('access_token')
    console.log(code)
    if (code) {
        const data = {
            code,
            redirectUri: homepage,
            grantType: 'authorization_code',
        }
        localStorage.setItem('code', code)
        if (!token) {
            tokenBefore && tokenBefore()
            window.axios({
                url: '/token',
                method: 'GET',
                urlHead: 'https://mi-service.blacklake.cn/auth',
                optionsHeaders: data,
                success: (res => {
                    if (res && res.code === 0) {
                        localStorage.setItem('access_token', res.data.access_token)
                        localStorage.setItem('token_type', res.data.token_type)
                        // window.location = homepage
                    } else {
                        localStorage.removeItem('access_token')
                        localStorage.removeItem('code')
                    }
                    tokenAfter && tokenAfter()
                    callback && callback()
                }),
                error: (res => {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('code')
                    window.location = homepage
                })
            })
        }else {
            console.log('error')
            callback && callback()
        }
    } 


    // webAuth.parseHash({ hash: window.location.hash }, (err, authResult) => {
    //     const token = (authResult && authResult.accessToken) || localStorage.getItem('access_token')
    //     const tokenType = (authResult && authResult.tokenType)

    //     console.log(authResult, token)
    //     if (token) {
    //         if (!localStorage.getItem('access_token')) {
    //             localStorage.setItem('access_token', token)
    //             localStorage.setItem('token_type', tokenType)
    //         }
    //     }
    //     callback && callback()
    // })
    // const token = getQueryString(window.location.hash, 'access_token') || localStorage.getItem('access_token')
    // if (token) {
    //     if (localStorage.getItem('access_token')) {
    //         return token
    //     } else {
    //         localStorage.setItem('access_token', getQueryString(window.location.hash, 'access_token'))
    //         localStorage.setItem('token_type', getQueryString(window.location.hash, 'token_type'))
    //         return token
    //     } 
    // }
}

function isLogin () {
    const token = localStorage.getItem('access_token')
    return Boolean(token)
}

function logOut () {
    localStorage.removeItem('access_token')
    localStorage.removeItem('code')
    webAuth.logout({
        returnTo: homepage, //'https://mi.blacklake.cn/omega8/',
        clientID: '2N0NX5k9eomXYFDcnEXnb2X7qluo2vP1'
    })
}

export {
    webAuth,
    getToken,
    logOut,
    isLogin,
    authLogin
}
  
