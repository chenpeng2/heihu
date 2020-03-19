import request from 'util/http'
import {message} from 'antd'
const projectUrl = process.env.NODE_ENV === 'development' ? '/' : '/chinaust'
function getQueryString(url, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = url.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return ''
}

function isLogin() {
    const token = getCookie('access_token')
    return Boolean(token)
}

function logOut() {
    deleteAllCookie()
}
function deleteAllCookie(){
    document.cookie.split(";").forEach(function(c) { 
        //除了自己项目cookie和username
        if(c.indexOf('_chinaust') === -1 || c.indexOf('username_chinaust') > -1){
            return 
        }
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().
        toUTCString() + "; path=/"); 
    });
    setTimeout(()=>window.location.href = projectUrl,500)
}
function login(values) {
    const remember =  values.remember
    delete values.remember
    let organization = "3";
    const data = {...values,...{organization}}
    request({
        url: `/login`,
        method: 'POST',
        data,
        success: res => {
            if(!res || res.code !== 0) {
                return
            }
            const responses = res.data
            localStorage.setItem('login_data',JSON.stringify(responses))
            setCookie('access_token',responses.jwt.access_token,0.5)
            setCookie('refresh_token',responses.jwt.refresh_token,0.5)
            remember && setCookie('username',responses.user.username,0.5)
            !remember && delCookie('username')
            message.success('登录成功！')
            window.location.href = projectUrl
        },
        error: error => {
            // if(error.code === -2){
            //
            // }
            const msg = error.response && error.response.data.msg
            message.error(msg)
        }
    })
}
function resetPassword(values) {
    let organization = "3";
    const data = {...values,...{organization}}
    const newPassword = data.newPassword
    delete data.newPassword
    return request({
        url: `/updatePassword`,
        method: 'POST',
        data: {
            user:data,
            newPassword,
        },
        success: res => {
            // deleteCookie('password')
            // setCookie('password', newPassword, 0.5)
            message.success('修改成功')
            setTimeout(()=>{
                window.history.go(0)
            },500)
        },
        error: error => {
            const msg = error.response && error.response.data.msg
            message.error(msg)
        }
    })
}
function refresh() {
    const  refresh_token=getCookie('refresh_token')
    const is_refreshing = getCookie('is_refreshing')
    if(is_refreshing){
        return
    }
    setCookie('is_refreshing','true',0.5)
    setTimeout(()=>{
        setCookie('is_refreshing','',0.5)
    },4)
    request({
        url: `/refresh?grant_type=refresh_token&refresh_token=${refresh_token}`,
        method: 'POST',
        data:{

        },
        success: res => {
            if(!res || res.code !== 0) {
                return
            }
            const responses = res.data
            setCookie('access_token',JSON.stringify(responses.access_token),0.5)
            setCookie('refresh_token',JSON.stringify(responses.refresh_token),0.5)
            message.success('refresh_token成功！')
            setTimeout(()=>window.location.href = projectUrl,1000)
        },
        error: error => {
            // if(error.code === -2){
            //
            // }
            console.log(error.response)
            const msg = error.response && error.response.data.msg
            const err = error.response && error.response.data.error
            (msg || err) && message.error((msg || err))
        }
    })
}

function setCookie(cname,cvalue,exdays)
{
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + '_chinaust' + "=" + cvalue + "; " + expires + "; path=/";
}

function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null){
        var expires = "expires="+d.toGMTString();
        document.cookie= name + '_chinaust' + "=" + cval + "; " + expires + "; path=/";
    }
}

function getCookie(cname)
{   
    var name = cname + '_chinaust' + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++)
    {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}
function removeChild(id)
{
    var deldom=document.getElementById(id);
    deldom && document.body.removeChild(deldom)
}
export {
    logOut,
    isLogin,
    login,
    getQueryString,
    setCookie,
    getCookie,
    delCookie,
    refresh,
    resetPassword,
    removeChild,
    deleteAllCookie,
    projectUrl
}
