import {
  UPDATE_ADMIT_MODEL,
  FETCH_ADMIT_DATA,
  FILTER_PURCHASE_LIST,
  UPDATE_ADMIT_REQUEST_STATUS,
  UPDATE_ADMIT_PRESENTATION_TYPE,
} from '../types/cooperate/purchase';

/** 采购清单 */

export const updateAdmitModelAction = payload => {
  return {
    type: UPDATE_ADMIT_MODEL,
    payload,
  };
};

export const updateAdmitRequestStatusAction = payload => {
  return {
    type: UPDATE_ADMIT_REQUEST_STATUS,
    payload,
  };
};

export const fetchAdmitDataAction = payload => {
  return {
    type: FETCH_ADMIT_DATA,
    payload,
  };
};

export const filterPurchaseListAction = payload => {
  return {
    type: FILTER_PURCHASE_LIST,
    payload,
  };
};

export const updatePresentationTypeAction = payload => {
  return {
    type: UPDATE_ADMIT_PRESENTATION_TYPE,
    payload,
  };
};