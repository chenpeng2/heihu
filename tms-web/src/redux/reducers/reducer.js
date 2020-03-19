import { combineReducers } from 'redux';
import inputData from './QCDataReducer'
import route from './route'
import masterData from './masterDataReducer'
import userInfo from './loginReducer'

const rootReducer = combineReducers({
  route,
  inputData,
  masterData,
  userInfo
})

export default rootReducer