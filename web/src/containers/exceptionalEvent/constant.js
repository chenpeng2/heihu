import { error, alertYellow, deepGrey } from 'src/styles/color';
import { baseFind } from 'src/utils/object';
import { toProdTaskDetail } from 'src/views/cooperate/prodTask/navigation';
import { toQcTaskDetail } from 'src/views/qualityManagement/navigation';
import { toSOPTaskDetail } from 'src/views/knowledgeManagement/flowEngine/utils/navigation';

export const PRIORITY = {
  0: { display: '一般', iconType: 'shijiandengji_yiban', iconColor: deepGrey },
  1: { display: '中等', iconType: 'shijiandengji_zhongdeng', iconColor: alertYellow },
  2: { display: '重要', iconType: 'shijiandengji_zhongyao', iconColor: error },
};

export const EVENT_STATUS = {
  0: '已报告',
  1: '已响应',
  2: '已关闭',
};

// 异常事件来源任务
export const RELATED_TASK = {
  productTask: { name: '生产任务', value: 1 },
  qcTask: { name: '质检任务', value: 2 },
  sopTask: { name: 'sop任务', value: 4 },
  // logisticsTask: { name: '物流任务', value: 3 }, // 物流任务不存在
};

// 根据value来查找相关的任务
export const findRelatedTask = baseFind(RELATED_TASK);

// 根据来源任务来获取跳转页面的路径
export const getDetailUrl = (type, id) => {
  // 生产任务去生产任务详情
  if (type === RELATED_TASK.productTask.value) {
    return toProdTaskDetail({ id });
  }
  // 质检任务
  if (type === RELATED_TASK.qcTask.value) {
    return toQcTaskDetail({ code: id });
  }
  // sop任务
  if (type === RELATED_TASK.sopTask.value) {
    return toSOPTaskDetail(id);
  }
};

// 异常事件等级
export const EXCEPTIONAL_EVENT_LEVEL = {
  level1: { name: 1, value: 1 },
  level2: { name: 2, value: 2 },
  level3: { name: 3, value: 3 },
};

// 查找异常事件等级
export const findExceptionalEventLevel = baseFind(EXCEPTIONAL_EVENT_LEVEL);

// 异常事件处理时长
export const EXCEPTIONAL_EVENT_DURATION = {
  thirty: { name: '0~30分钟', value: 1 },
  thirtyToOneHundredAndTwenty: { name: '30~120分钟', value: 2 },
  overOneHundredAndTwenty: { name: '超过120分钟', value: 3 },
};

// 报告时间维度
export const REPORT_TIME_LEVEL = {
  day: { name: '按天', value: 6, momentStr: 'd' },
  week: { name: '按周', value: 7, momentStr: 'w' },
  month: { name: '按月', value: 8, momentStr: 'M' },
  season: { name: '按季度', value: 9, momentStr: 'Q' },
};

export const findReportTimeLevel = baseFind(REPORT_TIME_LEVEL);

export default 'dummy';
