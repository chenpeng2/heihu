import { primary, error } from 'src/styles/color';
import { baseFind } from 'src/utils/object';
import moment from 'utils/time';

// 功能名称
export const ACTIONS = {
  out: { name: '出库', value: 1 },
  transfer: { name: '转移', value: 2 },
  normalDeliver: { name: '普通发货', value: 3 },
  logisticsDeliver: { name: '物流发货', value: 4 },
  applyDeliver: { name: '按发运申请发货', value: 5 },
};

// 规则类型
export const RULE = {
  storeManage: {
    validityPeriod: { name: '近效期先出', value: 1 },
    inboundBatch: { name: '批次先进先出', value: 2 },
  },
  qcReportRemark: {
    haveRemark: { name: '填写备注', value: 3 },
    noRemark: { name: '不填写备注', value: 4 },
  },
  qcReportTransferNotice: {
    transferNotice: { name: '通知转移', value: 5 },
    noTransferNotice: { name: '不通知转移', value: 6 },
  },
  prodCheckLocation: {
    sameAsProdWorkstation: { name: '和生产任务执行工位相同', value: 7 },
    processFirstWorkstation: { name: '工序上第一个工位', value: 8 },
    qcPlanAssignWorkstation: { name: '在质检计划中指定工位', value: 9 },
    noWorkstation: { name: '不指定工位', value: 10 },
  },
  prodCheckOperator: {
    prodOperator: { name: '生产任务工位上的质检员', value: 11 },
    sameAsProdOperator: { name: '和生产任务执行人相同', value: 12 },
    processFirstOperator: { name: '工序上第一个工位的质检员', value: 13 },
    qcPlanAssignOperator: { name: '在质检计划中指定执行人', value: 14 },
    noOperator: { name: '不指定执行人', value: 15 },
  },
  firstCheckLocation: {
    sameAsProdWorkstation: { name: '和生产任务执行工位相同', value: 7 },
    processFirstWorkstation: { name: '工序上第一个工位', value: 8 },
    qcPlanAssignWorkstation: { name: '在质检计划中指定工位', value: 9 },
    noWorkstation: { name: '不指定工位', value: 10 },
  },
  firstCheckOperator: {
    prodOperator: { name: '生产任务工位上的质检员', value: 11 },
    sameAsProdOperator: { name: '和生产任务执行人相同', value: 12 },
    processFirstOperator: { name: '工序上第一个工位的质检员', value: 13 },
    qcPlanAssignOperator: { name: '在质检计划中指定执行人', value: 14 },
    noOperator: { name: '不指定执行人', value: 15 },
  },
  planStartTime: {
    minutesAfterCreate: { name: '创建任务的当前时间+N', value: 16 },
    fixedTimeAfterCreate: { name: '创建任务后的某个固定时间', value: 17 },
  },
};

export const MODULES = {
  qcManage: { name: '质量管理', value: 1 },
  storeManage: { name: '仓储管理', value: 2 },
};

export const BUSINESS_TYPE = {
  fifoRule: { name: '先进先出规则', value: 1 },
  reportReview: { name: '报告审核', value: 2 },
};

// 管控层级
export const MANAGE = {
  force: { name: '强管控限制', value: 1 },
  tips: { name: '弱管控限制', value: 2 },
};

// 状态
export const STATUS = {
  disabled: { name: '停用', value: 0, color: error },
  enabled: { name: '启用', value: 1, color: primary },
};

export const findAction = baseFind(ACTIONS);
export const findRule = baseFind(RULE);
export const findManage = baseFind(MANAGE);
export const findStatus = baseFind(STATUS);

// 将数据格式化为baseForm需要的初始值
// 虽然它需要知道baseForm的组件需要的数据格式,但这个函数和详情的接口绑定的更深，无法给其他的数据使用。所以放在这个地方
export const formatDataToInitialData = data => {
  if (!data) return null;
  const { actionName, ruleType, ctlLevel, businessType, module, customField } = data || {};
  if (customField && customField.time) {
    const hour = customField.time.split(':')[0];
    const minute = customField.time.split(':')[1];
    customField.time = moment()
      .hour(hour)
      .minute(minute);
  }
  return {
    module,
    businessType,
    actionName,
    ruleType: ruleType ? ruleType.toString() : null,
    ctlLevel,
    ...customField,
  };
};

// 功能名称
export const QC_PLAN_START_TIME = {
  name: '计划开始时间',
  value: 'plan_start_time',
};

// 将form的数据格式化为后端接口需要的格式
export const formatFormDataToSubmit = data => {
  if (!data) return null;
  const { actionName, ruleType, ctlLevel, minutes, days, time } = data || {};
  // 规则类型为质检创建任务传的自定义字段
  let customField;
  if (actionName === QC_PLAN_START_TIME.name) {
    customField = { minutes, days, time: time && time.format('HH:mm') };
  }

  return {
    action: actionName,
    ruleType,
    ctlLevel,
    customField,
  };
};

export default 'dummy';
