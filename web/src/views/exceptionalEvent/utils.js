import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { findRelatedTask, PRIORITY, EVENT_STATUS, RELATED_TASK } from 'src/containers/exceptionalEvent/constant';
import moment from 'src/utils/time';

export const formatExportData = value => {
  const headers = [
    '编号',
    '事件类型',
    '重要性',
    '事件主题',
    '设施位置',
    '事件等级',
    '处理状态',
    '处理标签',
    '处理人',
    '报告人',
    '处理时长',
    '报告时间',
    '最近响应时间',
    '相关任务',
  ];

  const _values = [];
  if (!arrayIsEmpty(value)) {
    value.filter(i => i).forEach(i => {
      const {
        code,
        eventCategoryName,
        priority,
        eventTopic,
        sourceName,
        currentLevel,
        status,
        labelName,
        handlerName,
        reporterName,
        processDuration,
        createdAt,
        lastRespondedAt,
        sourceTaskCode,
        sourceTaskType,
      } = i || {};

      const { display: priorityName } = PRIORITY[priority] || {};
      const statusName = EVENT_STATUS[status];
      const { name: sourceTaskName } = findRelatedTask(sourceTaskType) || {};
      const taskName = sourceTaskName && sourceTaskCode ? `${sourceTaskName} (${sourceTaskCode})` : replaceSign;

      _values.push([
        code || replaceSign,
        eventCategoryName || replaceSign,
        priorityName || replaceSign,
        eventTopic || replaceSign,
        sourceName || replaceSign,
        currentLevel || replaceSign,
        statusName || replaceSign,
        labelName || replaceSign,
        handlerName || replaceSign,
        reporterName || replaceSign,
        processDuration ? `${processDuration || replaceSign} 分钟` : replaceSign,
        createdAt ? moment(createdAt).format('YYYY/MM/DD HH:mm') : replaceSign,
        lastRespondedAt ? moment(lastRespondedAt).format('YYYY/MM/DD HH:mm') : replaceSign,
        taskName || replaceSign,
      ]);
    });
  }

  return [headers, ..._values];
};

export default 'dummy';
