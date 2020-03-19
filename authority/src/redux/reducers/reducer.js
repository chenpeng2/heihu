import { combineReducers } from 'redux';
import userInfo from './loginReducer'
import OtherReducer from './otherReducer'
const rootReducer = combineReducers({
    userInfo,
    OtherReducer
});

export default rootReducer;