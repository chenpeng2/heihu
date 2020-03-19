import { combineReducers } from 'redux';
import outPartData from './outPart'
import userInfo from './loginReducer'

const rootReducer = combineReducers({
  outPartData,
  userInfo,
})

export default rootReducer