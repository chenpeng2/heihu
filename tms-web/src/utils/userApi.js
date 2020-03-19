import request from 'utils/urlHelpers'
import { message } from 'antd'

const homepage = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://mi.blacklake.cn/tms'
const loginUrl = 'https://mi-service.blacklake.cn/gateway/user'

function getQueryString(url, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = url.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return ''
}

function getUserInfo() {
    let userInfo = JSON.parse(localStorage.getItem('login-data')) ? JSON.parse(localStorage.getItem('login-data')).user : {}
    return userInfo
}

function isLogin() {
    const token = localStorage.getItem('access_token')
    return Boolean(token)
}

function logOut() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = homepage
}

function login(values) {
    // remember password 
    if (values.remember) {
        setCookie('username', values.username, 0.5)
        setCookie('password', values.password, 0.5)
    } else {
        deleteCookie('username')
        deleteCookie('password')
    }
    values.email = values.username
    delete values.username
    delete values.remember
    let organization = "2"
    return request({
        url: `/login`,
        method: 'POST',
        urlHead: loginUrl,
        data: {
            ...values,
            organization,
        },
        success: res => {
            if (!res || res.code !== 0) {
                return
            }
            const responses = res.data
            localStorage.setItem('login-data', JSON.stringify(responses))
            localStorage.setItem('access_token', responses.jwt.access_token)
            localStorage.setItem('refresh_token', responses.jwt.refresh_token)
            message.success('登录成功！')
            window.location.href = homepage
        },
        error: error => {
            const msg = error.response && error.response.data.msg
            message.error(msg)
        }
    })
}

function resetPassword(values) {
    const emailValues = Object.assign({}, values)
    delete emailValues.username
    emailValues.email = values.username
    let organization = "2"
    const { newPassword } = values
    delete emailValues.newPassword
    delete values.newPassword
    const user = { ...emailValues, organization} 
    return request({
        url: `/updatePassword`,
        method: 'POST',
        urlHead: loginUrl,
        data: {
            user,
            newPassword,
        },
        success: res => {
            deleteCookie('password')
            setCookie('password', newPassword, 0.5)
            message.success('修改成功')
        },
        error: error => {
            const msg = error.response && error.response.data.msg
            message.error(msg)
        }
    })
}

function refresh() {
    let isRefreshing = getCookie('is_refreshing')
    if (!isRefreshing) {
        setCookie('is_refreshing', true, 0.5)
        const refresh_token = localStorage.getItem('refresh_token')
        return request({
            url: `/refresh?grant_type=refresh_token&refresh_token=${refresh_token}`,
            method: 'POST',
            urlHead: loginUrl,
            success: res => {
                if (!res || res.code !== 0) {
                    return
                }
                const responses = res.data
                localStorage.setItem('access_token', responses.access_token)
                localStorage.setItem('refresh_token', responses.refresh_token)
                setCookie('is_refreshing', false, 0.5)
                message.success('refresh_token成功！')
                setTimeout(() => window.location.reload(), 1000)
            },
            error: error => {
                alert('登录过期，请重新登录')
                setCookie('is_refreshing', false, 0.5)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('login-data')
                window.location.href = homepage
            }
        })
    }

}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = `${cname}=${cvalue};${expires};path=/`
}

function getCookie(cname) {
    var name = `${cname}=`;
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}

function deleteCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    var expires = "expires=" + exp.toGMTString();
    if (cval != null) {
        document.cookie = `${name}=${cval};${expires};path=/`
    }
}

export {
    logOut,
    isLogin,
    login,
    getQueryString,
    refresh,
    getUserInfo,
    setCookie,
    getCookie,
    deleteCookie,
    loginUrl,
    homepage,
    resetPassword,
}
