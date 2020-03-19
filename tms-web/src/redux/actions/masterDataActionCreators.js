import request from 'utils/urlHelpers'
import {
    FETCH_LIST_REQUEST,
    FETCH_LIST_SUCCESS,
    FETCH_LIST_FAIL,
    CREATE_DATA_REQUEST,
    CREATE_DATA_SUCCESS,
    CREATE_DATA_FAIL,
    UPDATE_DATA_FAIL,
    UPDATE_DATA_REQUEST,
    UPDATE_DATA_SUCCESS,
    DELETE_DATA_REQUEST,
    DELETE_DATA_SUCCESS,
    DELETE_DATA_FAIL,
    CHANGE_SETTINGS_SUCCESS,
    FETCH_LOG_LIST_REQUEST,
    FETCH_LOG_LIST_SUCCESS,
    FETCH_LOG_LIST_FAIL,
} from '../apis/masterDataApis'

export function fetchTableList(str) {
    return function (dispatch) {
        dispatch({
            type: FETCH_LIST_REQUEST
        })
        return request({
            url: `/programmasterdata?${str}`,
            method: 'GET',
            success: res => {
                if (!res) {
                    return
                }
                if (res.code !== 0 || (res.status && res.status !== 200)) {
                    dispatch({
                        type: FETCH_LIST_FAIL,
                    })
                } else {
                    if (res.code !== 0) {
                    } else {
                        dispatch({
                            type: FETCH_LIST_SUCCESS,
                            payload: res,
                        })
                    }
                }
                return res
            },
            error: err => {
                dispatch({
                    type: FETCH_LIST_FAIL,
                    payload: err,
                })
            }
        })
    }
}

export function createData(data) {
    return function (dispatch) {
        dispatch({
            type: CREATE_DATA_REQUEST,
            payload: data,
        })
        return request({
            url: `/programmasterdata`,
            method: 'POST',
            data: {
                ...data,
            },
            success: res => {
                if (res.code !== 0) {
                    alert(res.msg)
                } else {
                    dispatch({
                        type: CREATE_DATA_SUCCESS,
                        payload: res,
                    })
                    return res
                }
            },
            error: err => {
                dispatch({
                    type: CREATE_DATA_FAIL,
                    payload: err,
                })
            }
        })
    }
}

export function updateData(ids, data) {
    return function (dispatch) {
        dispatch({
            type: UPDATE_DATA_REQUEST,
            payload: data,
        })
        return request({
            url: `/programmasterdata/${ids}`,
            method: 'PUT',
            data: {
                ...data,
            },
            success: res => {
                if (res.code !== 0) {
                    alert(res.msg)
                } else {
                    dispatch({
                        type: UPDATE_DATA_SUCCESS,
                        payload: res,
                    })
                    return res
                }
            },
            error: err => {
                dispatch({
                    type: UPDATE_DATA_FAIL,
                    payload: err,
                })
            }
        })
    }
}

export function deleteData(ids) {
    return function (dispatch) {
        dispatch({
            type: DELETE_DATA_REQUEST,
        })
        return request({
            url: `/programmasterdata/${ids}`,
            method: 'DELETE',
            success: res => {
                if (res.code !== 0) {
                    alert(res.msg)
                } else {
                    dispatch({
                        type: DELETE_DATA_SUCCESS,
                        payload: res,
                    })
                }
                return res
            }, 
            error: err => {
                dispatch({
                    type: DELETE_DATA_FAIL,
                    payload: err,
                })
            }
        })
    }
}

export function changeSettings(filterData) {
    return function (dispatch) {
        dispatch({
            type: CHANGE_SETTINGS_SUCCESS,
            payload: filterData,
        })
    }
}

export function getLogList(id) {

    return function (dispatch) {
        dispatch({
            type: FETCH_LOG_LIST_REQUEST
        })
        return request({
            url: `/programmasterdatahistories?oId=${id}`,
            method: 'GET',
            success: res => {
                if (res.code !== 0) {
                    dispatch({
                        type: FETCH_LOG_LIST_FAIL,
                        payload: '网络出错了',
                    })
                } else {
                    dispatch({
                        type: FETCH_LOG_LIST_SUCCESS,
                        payload: res.data,
                    })
                }
                return res
            }, error: err=> {
                dispatch({
                    type: FETCH_LOG_LIST_FAIL,
                    payload: err,
                })
            }
        })
    }
}