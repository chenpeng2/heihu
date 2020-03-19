module.exports = {
  CATEGORY_PRODTASK: 1, // 普通任务
  CATEGORY_BAITING: 2, // 下料任务
  TABLE_UNIQUE_KEY: 'ProdTaskTableConfig',
  CATEGORY_INJECT_MOLD: 3, // 注塑任务
  taskStatusMap: new Map([[1, '未开始'], [2, '执行中'], [3, '暂停中'], [4, '已结束'], [5, '已取消']]),
  TASK_PRIORITIZED: 1, // 优先任务
  TASK_UNPRIORITIZED: 0, // 非优先任务
  ACTION_TYPE_IN_STORAGE: 1, // 入库
  ACTION_TYPE_MARK: 2, // 标记
};
