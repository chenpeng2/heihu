import moment from 'src/utils/time';

export const strategyProgram = [
  {
    label: '固定周期',
    key: '1',
  },
  {
    label: '浮动周期',
    key: '2',
  },
  {
    label: '累计用度',
    key: '3',
  },
  {
    label: '固定用度',
    key: '4',
  },
  {
    label: '手动创建',
    key: '5',
  },
];

export const getTimeUnitName = timeUnit => {
  let timeUnitName = '';
  switch (`${timeUnit}`) {
    case '0':
      timeUnitName = '小时';
      break;
    case '1':
      timeUnitName = '日';
      break;
    case '2':
      timeUnitName = '周';
      break;
    case '3':
      timeUnitName = '月';
      break;
    default:
      timeUnitName = '小时';
  }
  return timeUnitName;
};

export const planLaborTime = [
  {
    label: '分钟',
    key: '4',
  },
  {
    label: '小时',
    key: '0',
  },
];

export const formatParams = values => {
  const params = {};
  Object.keys(values).forEach(prop => {
    if (values[prop] && values[prop] !== 'undefined') {
      switch (prop) {
        case 'executors':
          params[prop] = values[prop].map(n => ({ executorType: n.key.split(':')[0] === 'user' ? 1 : 2, executorId: n.key.split(':')[1] }));
          break;
        case 'strategyStartTime':
        case 'strategyEndTime':
          params[prop] = Date.parse(values[prop]);
          break;
        case 'period':
          params.strategyTriggerSchema = { period: values[prop].validPeriod, timeUnit: values[prop].validPeriodUnit.key };
          break;
        case 'planLaborTime':
          params.taskPlanLaborTimeAmount = Number(values.planLaborTime.validPeriod);
          params.taskPlanLaborTimeUnit = Number(values.planLaborTime.validPeriodUnit);
          break;
        case 'taskPlanLaborHour':
          params.taskPlanLaborTimeAmount = Number(values[prop].validPeriod);
          params.taskPlanLaborTimeUnit = Number(values[prop].validPeriodUnit.key);
          break;
        case 'taskAttachment':
          params[prop] = values[prop].map(n => n.restId);
          break;
        case 'strategyGroup':
          params.strategyGroupId = values[prop].key;
          break;
        case 'strategyTriggerType':
        case 'taskReportTemplateId':
        case 'timeUnit':
          params[prop] = values[prop].key;
          break;
        case 'metric':
          break;
        case 'metricBaseValue':
          params.strategyTriggerSchema = {
            metricBaseValue: values[prop].metricBaseValue,
            unit: values[prop].unit,
            metricName: values.metric.label,
            metricCompareType: values[prop].metricCompareType.key,
            metricId: values.metric.key.split('/')[0],
          };
          break;
        default:
          params[prop] = values[prop];
      }
    }
  });
  return params;
};

export const formatValue = data => {
  const {
    strategyCode,
    strategyTitle,
    strategyDescription,
    strategyGroup,
    strategyStartTime,
    strategyEndTime,
    strategyCategory,
    strategyTriggerType,
    taskTitle,
    taskPlanLaborHour,
    taskDescription,
    taskReportTemplate,
    taskScan,
    taskAttachmentFiles,
    strategyTriggerSchema,
    taskPlanLaborTimeAmount,
    taskPlanLaborTimeUnit,
    deviceMetric,
    taskAcceptanceCheck,
    executors,
  } = data;
  const { metricBaseValue, metricCompareType, period, timeUnit } = strategyTriggerSchema || {};
  const { metricName, id: metricId, metricUnitName } = deviceMetric || {};
  const value = {
    strategyCode,
    strategyTitle,
    strategyDescription,
    strategyGroup: strategyGroup && { key: strategyGroup.id, label: strategyGroup.title },
    strategyStartTime: strategyStartTime && moment(strategyStartTime),
    strategyEndTime: strategyEndTime && moment(strategyEndTime),
    strategyCategory: `${strategyCategory}`,
    strategyTriggerType: strategyProgram.filter(n => n.key === `${strategyTriggerType}`)[0],
    taskTitle,
    taskAttachment: taskAttachmentFiles && taskAttachmentFiles.length ?
      taskAttachmentFiles.map(n => ({ id: n.id, restId: n.id, originalFileName: n.original_filename })) : [],
    taskDescription,
    taskPlanLaborHour: `${taskPlanLaborHour}`,
    executors: executors.map(({ executorType, executorName, executorId }) => ({ key: `${executorType === 1 ? 'user' : 'workgroup'}:${executorId}`, label: executorName })),
    taskReportTemplateId: taskReportTemplate && {
      key: taskReportTemplate.id,
      label: taskReportTemplate.name,
    },
    taskScan,
    taskAcceptanceCheck,
    period: period ? { validPeriod: period, validPeriodUnit: { key: timeUnit } } : null,
    planLaborTime: { validPeriod: `${taskPlanLaborTimeAmount}`, validPeriodUnit: `${taskPlanLaborTimeUnit}` },
    metric: deviceMetric && { key: `${metricId}/${metricUnitName}`, label: metricName },
    metricBaseValue: metricBaseValue ? {
      metricBaseValue,
      unit: metricUnitName,
      metricCompareType: { key: metricCompareType },
    } : null,
  };
  return value;
};

export default 'dummy';
