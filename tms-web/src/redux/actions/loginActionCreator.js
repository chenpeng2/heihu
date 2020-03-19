import request from 'utils/urlHelpers'
import { getUserInfo as _getUserInfo, loginUrl } from 'utils/userApi'

export function getUserInfo() {
    const userInfo = _getUserInfo()
    return function (dispatch) {
        return request({
            url: `/user/getRoleAndAuthById?id=${userInfo.id}&pageNum=1&pageSize=10`,
            method: 'GET',
            urlHead: loginUrl,
            success: res => {
                if (res && res.code === 0) {
                    const roleList = res.data.roleDto
                    userInfo.userRole = []
                    roleList.forEach(item => {
                        userInfo.userRole.push(item.role.name)
                    })
                    dispatch({
                        type: 'LOGIN/GET_USER_ROLE',
                        payload: userInfo,
                    })
                    return userInfo
                }
            }
        })
    }
}

export function logOut() {
    return function (dispatch) {
        return request({
            url: '/logout',
            method: 'GET',
            success: res => {
                localStorage.removeItem('expireTime')
                dispatch({
                    type: 'LOGIN/LOGOUT_SUCCESS',
                })
            },
            error: err => {
                dispatch({
                    type: 'LOGIN/LOGOUT_FAIL',
                })
            }
        })
    }
}