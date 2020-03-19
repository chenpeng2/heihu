export function getUserInfo(callback) {
    return function (dispatch) {
        window.axios({
            url: '/tenant',
            urlHead: 'https://mi-service.blacklake.cn',
            method: 'GET',
            success: (res) => {
                if (res && res.code === 0) {
                    const userInfo = res.data
                    const { orgId, tenantId } = userInfo
                    if (orgId === tenantId * Math.pow(10,4) + 1) {
                        userInfo.userRule = 'Master'
                    } else if (orgId >= tenantId * Math.pow(10,4) + 2 && orgId <= tenantId * Math.pow(10,4) + Math.pow(10,4) - 1){
                        userInfo.userRule = 'QC'
                    }
                    dispatch({
                        type: 'LOGIN/GET_USER_INFO',
                        payload: userInfo,
                    })     
                }
                callback && callback(res) 
            }
        })
    }
}