import {
    FETCH_LIST_SUCCESS, 
    FETCH_LIST_REQUEST,
    FETCH_MORE_LIST_SUCCESS,
    CHANGE_SETTINGS_SUCCESS,
    FETCH_LIST_FAIL,
    FETCH_LOG_LIST_REQUEST,
    FETCH_LOG_LIST_SUCCESS,
    FETCH_MORE_LIST_REQUEST,
} from '../apis/QCDataApis'

const initialState = {
    isFetching: false,
    list:[],
    logList: {
        isFetching: false,
        list: []
    }
}
export default function inputData(state = initialState, action) {
    switch (action.type) {
    case FETCH_LIST_REQUEST:
        return {
            ...state,
            isFetching: true,
        }
    case FETCH_LIST_SUCCESS:
      return {
          ...state,
          isFetching: false,
          list: action.payload.data,
          pageInfo: {
            pageCount: action.payload.pageCount,
            page: action.payload.pageNo,
            pageSize: action.payload.pageSize,
            total: action.payload.totalRecord,
         }
      }
    case FETCH_LIST_FAIL:
        return {
            ...state,
            isFetching: false,
        }
    case FETCH_MORE_LIST_REQUEST: 
        return {
            ...state,
            isFetching: true,
        }
    case FETCH_MORE_LIST_SUCCESS:
      const oldList = state.list
      return {
          ...state,
          isFetching: false,
          list: oldList.concat(action.payload.data),
          pageInfo: {
            pageCount: action.payload.pageCount,
            page: action.payload.pageNo,
            pageSize: action.payload.pageSize,
            total: action.payload.totalRecord,
         }
          
      }
    case CHANGE_SETTINGS_SUCCESS:
        return {
            ...state,
            settingData: action.payload
        }
    case FETCH_LOG_LIST_REQUEST:
        return {
            ...state,
            logList: {
                isFetching: true,
            }
       }
    case FETCH_LOG_LIST_SUCCESS:
      return {
          ...state,
          logList: {
            isFetching: false,
            list: action.payload,
        }
    }
    default:
      return state
    }
  }