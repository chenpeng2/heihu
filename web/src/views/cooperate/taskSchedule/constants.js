import { blacklakeGreen, error } from 'styles/color';

export const PRE_PROCESS_CONFLICTED = 'PRE_PROCESS_CONFLICTED';
export const POST_PROCESS_CONFLICTED = 'POST_PROCESS_CONFLICTED';
export const SCHEDULE_CONFLICTED = 'SCHEDULE_CONFLICTED';
export const START_TIME_CONFLICTED = 'START_TIME_CONFLICTED';
export const END_TIME_CONFLICTED = 'END_TIME_CONFLICTED';
export const PLAN_TIME_CONFLICTED = 'PLAN_TIME_CONFLICTED';
export const PROCESS_TABLE_UNIQUE_KEY = 'TaskScheduleProcessTableConfig';
export const UNDISTRIBUTED_TABLE_UNIQUE_KEY = 'TaskScheduleUnDistributedTableConfig';
export const DISTRIBUTED_TABLE_UNIQU_KEY = 'TaskScheduleDistributedTableConfig';
export const AUDIT_TABLE_UNIQUE_KEY = 'TaskScheduleAuditTaskTableConfig';

export const conflictsMap = {
  [PRE_PROCESS_CONFLICTED]: '该任务与前序任务有冲突，无法下发！',
  [POST_PROCESS_CONFLICTED]: '该任务与后序任务有冲突，无法下发！',
  [SCHEDULE_CONFLICTED]: '该任务与工位上的其他任务有冲突，无法下发！',
  [START_TIME_CONFLICTED]: '该任务的计划开始时间超出所在即工单的计划开始时间',
  [END_TIME_CONFLICTED]: '该任务的计划结束时间超出工单的计划结束时间',
};

export const STATUS_MAP = {
  SCHEDULED: {
    display: '已排程',
  },
  LOCKED: {
    display: '已排程',
  },
  CANCELED: {
    display: '已取消',
  },
  DISTRIBUTED: {
    display: '已下发',
  },
  AUDITING: {
    display: '审批中',
  },
};

export const INJECT_PRODUCE_STATUS_MAP = {
  1: 'CREATED',
  2: 'RUNNING',
  3: 'PAUSED',
  4: 'DONE',
  5: 'ABORTED',
};

export const PRODUCE_STATUS_MAP = {
  ABORTED: {
    value: 'ABORTED',
    display: '已取消',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  CREATED: {
    value: 'CREATED',
    display: '未开始',
    color: '#E5E5E5',
  },
  RUNNING: {
    value: 'RUNNING',
    display: '进行中',
    color: blacklakeGreen,
  },
  PAUSED: {
    value: 'PAUSED',
    display: '暂停中',
    color: '#FAAD14',
  },
  DONE: {
    value: 'DONE',
    display: '已结束',
    color: error,
  },
  1: {
    value: 'CREATED',
    display: '未开始',
    color: '#E5E5E5',
  },
  2: {
    value: 'RUNNING',
    display: '进行中',
    color: blacklakeGreen,
  },
  3: {
    value: 'PAUSED',
    display: '暂停中',
    color: '#FAAD14',
  },
  4: {
    value: 'DONE',
    display: '已结束',
    color: error,
  },
  5: {
    value: 'ABORTED',
    display: '已取消',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  // 这个状态是甘特图前端判断的状态 逻辑是生产任务状态已结束 且实际结束时间大于计划结束时间
  // 后端的任务状态仍然是已结束
  DONE_DELAY: {
    value: 'DONE_DELAY',
    display: '延期结束',
    color: error,
  },
};

export default 'dummy';
