import {getCookie} from 'util/userApi'
import * as types from '../constans/index'
export function getUserInfo() {
    return function (dispatch) {
        const userInfo = localStorage.getItem('login_data');
        dispatch({
            type: types.GET_USER_INFO,
            payload: userInfo && JSON.parse(userInfo),
        })
        return userInfo
    }
}
//弹窗
export  function setOpenState(data,value) {
    //此处阻止页面滑动
    document.body.style.height = '100vh'
    document.body.style['overflow-y'] = 'hidden'
    return function (dispatch) {
        dispatch({
            type: types.SET_OPEN_STATE,
            payload: {
                OpenState:true,
                OpenStateData:data,
                OpenStateValue:value
            },
        })
    }
}
//设置取消弹窗
export  function cancelOpenState(data,value) {
    document.body.style['overflow-y'] = 'auto'
    return function (dispatch) {
        dispatch({
            type: types.CANCEL_OPEN_STATE,
            payload: {
                OpenState:false,
                OpenStateData:data,
                OpenStateValue:value
            },
        })
    }
}
//获取cookie 判断token是否失效
export  function justToken(value) {
    return function (dispatch) {
        const tokenType = getCookie('token-type');
        return tokenType
    }
}