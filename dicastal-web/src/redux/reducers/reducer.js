import { combineReducers } from 'redux';
import route from './route'
import userInfo from './loginReducer'
const rootReducer = combineReducers({
    route,
    userInfo
});

export default rootReducer;