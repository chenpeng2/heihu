import {
  SET_BATCH_OPERATION,
  SET_ALL_CHECKED,
  SET_SELECTED_ROWS,
  SET_MUTIEXPORT_VISIBLE,
} from '../../types/qualityManagement/qcTask';

/** 批量导出质检任务详情 */
const reducers = {
  batchOperation: (state = false, { type, payload }) => {
    if (type === SET_BATCH_OPERATION) return payload;
    return state;
  },
  allChecked: (state = false, { type, payload }) => {
    if (type === SET_ALL_CHECKED) return payload;
    return state;
  },
  selectedRows: (state = [], { type, payload }) => {
    if (type === SET_SELECTED_ROWS) return payload;
    return state;
  },
  mutiExportVisible: (state = false, { type, payload }) => {
    if (type === SET_MUTIEXPORT_VISIBLE) return payload;
    return state;
  },
};

export default reducers;
