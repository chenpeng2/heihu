import { combineReducers } from 'redux';
import { UPDATE_SPINNING_STATUS } from '../types/app';

const reducers = {
  spinning: (state = false, { type, payload }) => {
    if (type === UPDATE_SPINNING_STATUS) return payload;
    return state;
  },
};

export default combineReducers(reducers);
