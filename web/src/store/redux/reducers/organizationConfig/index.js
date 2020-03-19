import { combineReducers } from 'redux';
import customRule from './customRule';

/** 系统配置 */
const reducers = combineReducers({
  ...customRule,
});

export default reducers;
