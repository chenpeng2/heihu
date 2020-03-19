import { combineReducers } from 'redux';
import qcTask from './qcTask';

/** 质检管理 */
const reducers = combineReducers({
  ...qcTask,
});

export default reducers;
