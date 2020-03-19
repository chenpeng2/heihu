export const TABLE_UNIQUE_KEY = 'ProjectListTableColumnConfig';

// 项目状态
export const PROJECT_STATUS_UNSTARTED = 1;
export const PROJECT_STATUS_EXECUTING = 2;
export const PROJECT_STATUS_SUSPENDING = 3;
export const PROJECT_STATUS_FINISHED = 4;
export const PROJECT_STATUS_CANCELED = 5;

export const projectStatusMap = {
  [PROJECT_STATUS_UNSTARTED]: '未开始',
  [PROJECT_STATUS_EXECUTING]: '执行中',
  [PROJECT_STATUS_SUSPENDING]: '暂停中',
  [PROJECT_STATUS_FINISHED]: '已结束',
  [PROJECT_STATUS_CANCELED]: '已取消',
};

export default TABLE_UNIQUE_KEY;
