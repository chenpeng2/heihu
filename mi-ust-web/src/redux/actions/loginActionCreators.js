// import request from 'util/http'
import {getCookie} from 'util/userApi'
export function getUserInfo() {
    // return function (dispatch) {
    //     return  request({
    //         url: '/tenant',
    //         method: 'GET',
    //         urlHead: 'https://mi-service.blacklake.cn'
    //     }).then(function(res){
    //         if (res && res.code === 0) {
    //             const userInfo = res.data
    //             dispatch({
    //                 type: 'LOGIN/GET_USER_INFO',
    //                 payload: userInfo,
    //             })
    //             return userInfo
    //         } else {
    //             return res
    //         }
    //     })
    // }
    return function (dispatch) {
        const userInfo = localStorage.getItem('login_data');
        dispatch({
            type: 'LOGIN/GET_USER_INFO',
            payload: userInfo && JSON.parse(userInfo),
        })
        return userInfo
    }
}