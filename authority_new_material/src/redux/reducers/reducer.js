import { combineReducers } from 'redux';
import userInfo from './loginReducer'
const rootReducer = combineReducers({
    userInfo
});

export default rootReducer;