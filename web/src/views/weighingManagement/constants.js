import { processing } from 'styles/color';

export const WEIGHING_TASK_STATUS_UNREADY = 1; // 未就绪
export const WEIGHING_TASK_STATUS_UNSTARTED = 2; // 未开始
export const WEIGHING_TASK_STATUS_INEXECUTION = 3; // 执行中
export const WEIGHING_TASK_STATUS_FINISHED = 5; //  已结束
export const WEIGHING_TASK_STATUS_CANCELED = 6; //  已取消

export const WEIGHING_TASK_STATUS = {
  [WEIGHING_TASK_STATUS_UNREADY]: '未就绪',
  [WEIGHING_TASK_STATUS_UNSTARTED]: '未开始',
  [WEIGHING_TASK_STATUS_INEXECUTION]: '执行中',
  [WEIGHING_TASK_STATUS_FINISHED]: '已结束',
  [WEIGHING_TASK_STATUS_CANCELED]: '已取消',
};

export const TASK_STATUS_COLOR = {
  1: 'rgba(0, 0, 0, 0.3)',
  2: 'rgba(0, 0, 0, 0.1)',
  3: processing,
  5: '#02B980',
  6: 'rgba(0, 0, 0, 0.4)',
};

export const PRECISE_TYPE = {
  1: '四舍五入',
  2: '奇进偶舍',
};

export const WEIGHING_TYPE = {
  1: '增重称量',
  2: '减重称量',
};

export const PERIOD_UNIT = {
  1: '小时',
  2: '天',
};

export const WEIGHING_MODE_TOTAL = 1;
export const WEIGHING_MODE_SEGMENT = 2;
export const WEIGHING_MODE_CUSTOM = 3;

/** 称量规则 */
export const weighingModeMap = {
  [WEIGHING_MODE_TOTAL]: '按总量',
  [WEIGHING_MODE_SEGMENT]: '按细分',
  [WEIGHING_MODE_CUSTOM]: '任意细分',
};

export const REAL_NUM = 1; // 实际数
export const PERCENTAGE = 2; // 百分比

export const instructionLimitTypeMap = {
  [REAL_NUM]: '-',
  [PERCENTAGE]: '%',
};

export const EXECUTOR_TYPE_USER = 1; // 用户
export const EXECUTOR_TYPE_USERGROUP = 2; // 用户组

export const weighingTaskExecutorTypeMap = {
  [EXECUTOR_TYPE_USER]: '用户',
  [EXECUTOR_TYPE_USERGROUP]: '用户组',
};

/** 称量任务执行人用户/用户组选项对应 searchSelect type */
export const weighingTaskExecutorSelectTypeMap = {
  [EXECUTOR_TYPE_USER]: 'user',
  [EXECUTOR_TYPE_USERGROUP]: 'workgroup',
};

export default 'dummy';
