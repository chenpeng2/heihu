import {
    FETCH_WILL_COME_LIST_FAIL,
    FETCH_WILL_COME_LIST_REQUEST,
    CHANGE_SETTINGS_SUCCESS,
    FETCH_WAREHOUSE_LIST_SUCCESS
} from '../apis/outPartApis'

const initialState = {
    isFetching: false,
    list:[],
    logList: {
        isFetching: false,
        list: []
    }
}
export default function outPartData(state = initialState, action) {
    switch (action.type) {
    case FETCH_WAREHOUSE_LIST_SUCCESS: 
      return {
        ...state,
        wareHouseList: action.payload
      }
    case FETCH_WILL_COME_LIST_FAIL:
        return {
            ...state,
            isFetching: false,
        }
    case FETCH_WILL_COME_LIST_REQUEST: 
        return {
            ...state,
            isFetching: true,
        }
    case CHANGE_SETTINGS_SUCCESS:
        return {
            ...state,
            tablesettingData: action.payload
        }
    default:
      return state
    }
  }