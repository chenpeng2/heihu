// 任务提醒
export const warnConfig = [
  {
    key: '0',
    label: '不提醒',
  },
  {
    key: '1h',
    label: '提前1小时',
  },
  {
    key: '1d',
    label: '提前1天',
  },
  {
    key: '3d',
    label: '提前3天',
  },
  {
    key: '1w',
    label: '提前1周',
  },
  {
    key: '2w',
    label: '提前3周',
  },
  {
    key: '1m',
    label: '提前1个月',
  },
];
// 点检任务执行计划
export const checkActionPlan = [
  {
    key: 'single',
    label: '单次',
  },
  {
    key: 'cycle',
    label: '固定周期',
  },
];
// 任务执行周期
export const taskInterval = [
  {
    key: '1d',
    label: '每天',
  },
  {
    key: '1w',
    label: '每周',
  },
  {
    key: '2w',
    label: '每两周',
  },
  {
    key: '1m',
    label: '每月',
  },
  {
    key: '2m',
    label: '每两月',
  },
  {
    key: '1q',
    label: '每季度',
  },
  {
    key: '1y',
    label: '每年',
  },
];
// 保养任务执行计划
export const maintenanceActionPlan = [
  {
    key: 'single',
    label: '单次',
  },
  {
    key: 'cycle',
    label: '周期',
  },
  {
    key: 'floatCycle',
    label: '浮动周期',
  },
];
// 日志类型
export const logTypeObj = {
  add: '任务创建',
  edit: '任务编辑',
  audit: '任务审批',
  start: '任务开始',
  pause: '任务暂停',
  resume: '任务继续',
  finish: '任务结束',
  cancel: '任务取消',
  receive: '领取任务',
  delete: '删除任务',
  finishForAcceptanceCheck: '任务结束提交验收',
  acceptanceCheck: '任务验收',
  addCurrentOperator: '执行人添加',
  removeCurrentOperator: '执行人移除',
};

export default 'dummy';
