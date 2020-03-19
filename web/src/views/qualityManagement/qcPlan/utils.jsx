import _ from 'lodash';
import {
  getOrganizationConfigFromLocalStorage,
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
  includeOrganizationConfig,
} from 'src/utils/organizationConfig';
import { arrayIsEmpty } from 'utils/array';
import { WORKSTATION_WORKERS_QC } from 'src/views/knowledgeManagement/factoryModeling/workstation/workstationBaseForm';
import { timeUnit } from './constant';

export const getOrganizationTaskDispatchType = () => {
  const organizationConfig = getOrganizationConfigFromLocalStorage();
  return organizationConfig[ORGANIZATION_CONFIG.taskDispatchType].configValue;
};

export const getEntityNameByTaskDispatchType = () => {
  const taskDispatchType = getOrganizationTaskDispatchType();
  if (_.isEqual(taskDispatchType, TASK_DISPATCH_TYPE.manager)) {
    return 'planWorkOrder';
  }
  return 'project';
};

export const useQrcode = includeOrganizationConfig(ORGANIZATION_CONFIG.useQrcode);

export const qcPlanQcConfigItemList = [
  'qcConfigId',
  'qcConfigName',
  'autoCreateQcTask',
  'qcWorkstation',
  'taskCreateType',
  'taskCreateIntervalValue',
  'taskCreateIntervalUnit',
  'taskCreateCount',
  'taskCreateCountAll',
  'qcTaskOperator',
  'checkCountType',
  'checkCount',
  'recordType',
  useQrcode ? 'scrapInspection' : null,
  'attachments',
  'checkItemsList',
].filter(x => x);

export const qcPlanQcConfigCreateIntervalFields = [
  'autoCreateQcTask',
  'taskCreateType',
  'taskCreateCount',
  'taskCreateIntervalValue',
  'taskCreateIntervalUnit',
  'taskCreateCountAll',
];

//  获取当前被点击的质检方案校验项
export const getValidateFields = (qcConfigItemList, selectedQcConfigKey) =>
  _.map(qcConfigItemList, key => `qcConfigs[${selectedQcConfigKey}].${key}`);

export const timeInterval = (duration, unit) => {
  if (!duration) return null;

  let interval = 0;
  if (unit === timeUnit.hour) {
    interval = duration * 60 * 60 * 1000;
  } else if (unit === timeUnit.minutes) {
    interval = duration * 60 * 1000;
  }
  return interval;
};

export const formatSubmitQcPlanProcessConfigs = submitQcConfigs => {
  if (arrayIsEmpty(submitQcConfigs)) return [];
  return submitQcConfigs.map(qcConfig => {
    const {
      operator,
      workstation,
      id, // 质检方案自身的id
      controlLevel,
      noPassStatuses,
      autoCreateQcTask,
      sampleRecordNeeded,
      taskCreateType,
      taskCreateCount,
      taskCreateIntervalValue,
      taskCreateIntervalUnit,
      taskCreateCountAll,
    } = qcConfig || {};
    const taskCreateInterval = timeInterval(taskCreateIntervalValue, taskCreateIntervalUnit);

    return {
      autoCreateQcTask,
      sampleRecordNeeded,
      taskCreateType,
      taskCreateCount,
      taskCreateIntervalValue,
      taskCreateIntervalUnit,
      taskCreateInterval,
      taskCreateCountAll,
      qcConfigId: id,
      operatorId: _.get(operator, 'key'),
      workstationId: _.get(workstation, 'key'),
    };
  });
};

export const formatEditQcPlanProcessData = ({ initialProcessData, submitQcPlanProcesses }) => {
  if (!arrayIsEmpty(submitQcPlanProcesses)) {
    const _submitQcPlanProcesses = submitQcPlanProcesses.map(process => {
      const { qcPlanProcessConfigs, controlLevel, noPassStatuses, id } = process;
      const initialProcess = _.find(initialProcessData, o => o.id === id);
      if (initialProcess) {
        return {
          id: initialProcess.id,
          controlLevel,
          noPassStatuses,
          qcPlanProcessConfigs: formatSubmitQcPlanProcessConfigs(qcPlanProcessConfigs),
        };
      }
      return process;
    });
    return _submitQcPlanProcesses;
  }
  return null;
};

export const formatCreateQcPlanProcessData = submitQcPlanProcesses => {
  if (!arrayIsEmpty(submitQcPlanProcesses)) {
    const _submitQcPlanProcesses = submitQcPlanProcesses.map(process => {
      const { processSeq, qcPlanProcessConfigs } = process;
      const _qcPlanProcessConfigs = arrayIsEmpty(qcPlanProcessConfigs)
        ? []
        : formatSubmitQcPlanProcessConfigs(qcPlanProcessConfigs);
      return { processSeq, qcPlanProcessConfigs: _qcPlanProcessConfigs };
    });
    return _submitQcPlanProcesses;
  }
  return null;
};

export const formatCreateSubmitData = ({
  qcPlanProcesses: submitQcPlanProcesses,
  qcPlanData,
  planWorkOrderCategory,
}) => {
  const planWorkOrderCode = _.get(qcPlanData, 'planWorkOrderCode.key');
  const qcPlanProcesses = formatCreateQcPlanProcessData(submitQcPlanProcesses);
  // 编辑时需要传质检计划的processId（和工序本身的id无关）,创建时不需要
  // const qcPlanProcesses = arrayIsEmpty(qcPlanProcessData) ? [] : qcPlanProcessData.map(data => _.omit(data, 'id'));
  return { ...qcPlanData, planWorkOrderCode, qcPlanProcesses, planWorkOrderCategory };
};

export const formatEditSubmitData = ({ initialProcessData, qcPlanProcesses: submitQcPlanProcesses, qcPlanCode }) => {
  // 编辑时需要传质检计划的processId（和工序本身的id无关）
  const qcPlanProcesses = formatEditQcPlanProcessData({ initialProcessData, submitQcPlanProcesses });
  return { qcPlanCode, qcPlanProcesses };
};

export const splitSelectQcConfigKey = key => {
  const str = key ? key.split('-') : [];
  return { qcConfigId: Number(str[1]), processId: str[0] };
};

export const getWorkstationFirstQcWorker = workstation => {
  const workers = _.get(workstation, 'workers');
  const operator = _.find(workers, o => o.job === WORKSTATION_WORKERS_QC);
  return operator ? { key: operator.id, label: operator.name } : undefined;
};
export default 'dummy';
