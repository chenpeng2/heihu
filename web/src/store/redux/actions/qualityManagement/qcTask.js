import {
  SET_BATCH_OPERATION,
  SET_ALL_CHECKED,
  SET_SELECTED_ROWS,
  SET_MUTIEXPORT_VISIBLE,
} from '../../types/qualityManagement/qcTask';

/** 质检任务 */

export const setBatchOperation = payload => {
  return {
    type: SET_BATCH_OPERATION,
    payload,
  };
};

export const setAllChecked = payload => {
  return {
    type: SET_ALL_CHECKED,
    payload,
  };
};

export const setSelectedRows = payload => {
  return {
    type: SET_SELECTED_ROWS,
    payload,
  };
};

export const setMutiExportVisible = payload => {
  return {
    type: SET_MUTIEXPORT_VISIBLE,
    payload,
  };
};
