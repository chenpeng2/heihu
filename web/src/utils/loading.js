import store from 'store';
import { UPDATE_SPINNING_STATUS } from '../store/redux/types/app';

export const showLoading = (visible) => {
  if (!store) return;

  store.dispatch({ type: UPDATE_SPINNING_STATUS, payload: visible });
};