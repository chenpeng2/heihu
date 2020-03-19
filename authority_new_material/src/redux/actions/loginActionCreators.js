import {getCookie} from '../../util/userApi'
export function getUserInfo() {
    return function (dispatch) {
        const userInfo = getCookie('login-data');
        dispatch({
            type: 'LOGIN/GET_USER_INFO',
            payload: JSON.parse(userInfo),
        })
        return userInfo
    }
}