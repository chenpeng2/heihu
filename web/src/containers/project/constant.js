export const PROJECT_TYPES = {
  storage: { name: '面向库存', value: 1 },
  purchaseOrderType: { name: '面向销售订单', value: 2 },
};

export const BATCH_RECORD_STATUS_UNSTARTED = 1;
export const BATCH_RECORD_STATUS_AUDITING = 2;
export const BATCH_RECORD_STATUS_PASSED = 3;
export const BATCH_RECORD_STATUS_FAILED = 4;
export const BATCH_RECORD_AUDIT_RESULT_CREATED = 1;
export const BATCH_RECORD_AUDIT_RESULT_PASSED = 2;
export const BATCH_RECORD_AUDIT_RESULT_FAILED = 3;
export const projectBatchRecordAuditStatusMap = {
  [BATCH_RECORD_STATUS_UNSTARTED]: '新建',
  [BATCH_RECORD_STATUS_AUDITING]: '审批中',
  [BATCH_RECORD_STATUS_PASSED]: '已通过',
  [BATCH_RECORD_STATUS_FAILED]: '新建', // 未通过展示成新建
};
export const projectBatchRecordAuditResultMap = {
  [BATCH_RECORD_AUDIT_RESULT_CREATED]: '未审批',
  [BATCH_RECORD_AUDIT_RESULT_PASSED]: '已通过',
  [BATCH_RECORD_AUDIT_RESULT_FAILED]: '已拒绝',
};

export default 'dummy';
