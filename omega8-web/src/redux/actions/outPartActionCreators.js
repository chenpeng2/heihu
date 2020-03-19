import request from 'utils/urlHelpers'
import {
    FETCH_WILL_COME_LIST_REQUEST,
    FETCH_WILL_COME_LIST_SUCCESS,
    FETCH_WILL_COME_LIST_FAIL,
    CHANGE_SETTINGS_SUCCESS,
    FETCH_WAREHOUSE_LIST_SUCCESS,
} from '../apis/outPartApis'

export function getWillComeData(str) {
    return function (dispatch) {
    dispatch({
        type: FETCH_WILL_COME_LIST_REQUEST
    })
    return request({
        url: str ? `/dailyqcs?${str}` :  `/dailyqcs`,
        method: 'GET',
    }).then(function(res){
        dispatch({
            type: FETCH_WILL_COME_LIST_SUCCESS,
            payload: res,
        })
        return res
    }).catch(err=>{
        dispatch({
            type: FETCH_WILL_COME_LIST_FAIL,
            payload: err,
        })
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

export function getWareHouseList() {
    return function (dispatch) {
    return request({
        url: `/statistic/warehouse/all`,
        method: 'GET',
    }).then(function(res){
        dispatch({
            type: FETCH_WAREHOUSE_LIST_SUCCESS,
            payload: res.data,
        })
        return res
    }).catch(err=>{
        dispatch({
            type: FETCH_WILL_COME_LIST_FAIL,
            payload: err,
        })
    }) 
    }
}
