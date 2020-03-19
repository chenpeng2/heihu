import _ from 'lodash';
import { formatRangeUnix } from 'src/utils/time';
import { replaceSign } from 'src/constants';
import {
  CHECK_TYPE,
  QcTask_Classification,
  FULL_CHECK,
  AQL_CHECK,
  CUSTOM_CHECK,
  QUANTITY_CHECK,
  RATIO_CHECK,
  USE_CUSTOM_UNIT,
  USE_QR_CODE,
  CHECKITEM_CHECK,
} from 'src/views/qualityManagement/constants';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';
import { arrayIsEmpty } from 'src/utils/array';
import { RULE } from 'src/views/organizationConfig/customRule/utils';

export const getCreateQcTaskUrl = () => '/qualityManagement/qcTask/create';

export const getDefect = rate => {
  if (rate <= 0) return '0%';
  if (rate === 100) return '100%';
  return rate ? `${rate.toFixed(2)}%` : replaceSign;
};

export const getCheckTypeDisplay = (qcTaskClassification, checkType) => {
  let checkTypeDisplay = null;
  if (typeof checkType === 'number' && (qcTaskClassification || qcTaskClassification === 0)) {
    switch (qcTaskClassification) {
      case QcTask_Classification.ORIGIN_QC:
        checkTypeDisplay = CHECK_TYPE[checkType];
        break;
      case QcTask_Classification.INSPECTION_QC:
        checkTypeDisplay = '巡检';
        break;
      case QcTask_Classification.COMMON_QC:
        checkTypeDisplay = '通用检';
        break;
      default:
        checkTypeDisplay = replaceSign;
    }
  }
  return checkTypeDisplay;
};

export const formatQcTaskListFilterData = payloads => {
  const { checkType, status } = payloads;

  const _taskEndTime = _.get(payloads, 'taskEndTime');
  const taskEndTime = _taskEndTime ? formatRangeUnix(_taskEndTime) : [];
  const _taskStartTime = _.get(payloads, 'taskStartTime');
  const taskStartTime = _taskStartTime ? formatRangeUnix(_taskStartTime) : [];

  payloads.operatorId = _.get(payloads, 'operator.key');
  payloads.materialCode = _.get(payloads, 'material.key');
  payloads.processCode = _.get(payloads, 'process.key');
  payloads.status = status !== 'all' ? status : null;
  payloads.checkType = checkType !== 'all' ? checkType : null;
  payloads.purchaseOrderCode = _.get(payloads, 'purchaseOrderCode.key');
  payloads.projectCode = _.get(payloads, 'projectCode.key');

  // 开始时间
  payloads.startTimeFrom = taskStartTime[0];
  payloads.startTimeTill = taskStartTime[1];
  delete payloads.taskStartTime;

  // 结束时间
  payloads.endTimeFrom = taskEndTime[0];
  payloads.endTimeTill = taskEndTime[1];
  delete payloads.taskEndTime;

  // 工位
  const workStation = _.get(payloads, 'workStation.value');
  payloads.workstationId = workStation ? workStation.split('-')[1] : null;

  return payloads;
};

export default 'dummy';

// 获取质检总单体数量(除aql情况)
export const getCheckSingleNum = data => {
  const useQrCode = isOrganizationUseQrCode();
  data.sampleMaterialsCount = data.sampleRecordNeeded
    ? !arrayIsEmpty(data.sampleMaterials)
      ? data.sampleMaterials.reduce((total, node) => total + node.count, 0)
      : 0
    : data.checkCount || 0;
  data.checkMaterialsCount = !arrayIsEmpty(data.checkMaterials)
    ? data.checkMaterials.reduce((total, node) => total + node.count, 0)
    : 0;
  if (
    data.qcConfig &&
    (data.qcConfig.checkCountType === AQL_CHECK || data.qcConfig.checkCountType === CHECKITEM_CHECK)
  ) {
    return Math.ceil(
      !arrayIsEmpty(data.checkItemList) ? Math.max(...data.checkItemList.map(item => item.checkCount)) : 0,
    );
  }
  if (useQrCode) {
    if (data.qcConfig && data.qcConfig.checkEntityType === USE_QR_CODE) {
      return data.sampleMaterials ? data.sampleMaterials.length : 0;
    }
    if (data.qcConfig && data.qcConfig.checkEntityType === USE_CUSTOM_UNIT) {
      return Math.ceil(data.qcConfig.checkEntityUnitCount);
    }
    if (data.sampleMaterialsCount === 0 && data.qcConfig) {
      if (data.qcConfig.checkCountType === FULL_CHECK) {
        return Math.ceil((data.sampleMaterialsCount + data.checkMaterialsCount) * (data.unitRate || 1));
      }
      if (data.qcConfig.checkCountType === QUANTITY_CHECK) {
        return data.qcConfig.checkCount || 0;
      }
      if (data.qcConfig.checkCountType === RATIO_CHECK) {
        return Math.ceil(
          (((data.qcConfig.checkCount || 0) * (data.sampleMaterialsCount + data.checkMaterialsCount)) / 100) *
            (data.unitRate || 1),
        );
      }
      if (data.qcConfig.checkCountType === CUSTOM_CHECK) {
        return Math.ceil((data.checkCount || 0) / (data.unitRate || 1));
      }
    }
    return Math.ceil(data.sampleMaterialsCount * (data.unitRate || 1));
  }
  return Math.ceil((data.checkCount || 0) * (data.unitRate || 1));
};

// 获取质检单体二维码
export const getSingleQrCode = data => {
  if (data.qcConfig && data.qcConfig.checkEntityType === USE_QR_CODE) {
    return !arrayIsEmpty(data.sampleMaterials) ? data.sampleMaterials.map(n => ({ seq: n.seq, qrCode: n.qrCode })) : [];
  }
  return replaceSign;
};

// 获取质检总单体数量(aql)
export const getCheckSingleNumByAql = data => {
  if (!arrayIsEmpty(data)) {
    const itemSingleNums = data.map(n => n.checkCount);
    return {
      singleNum: _.max(itemSingleNums),
      itemSingleNums,
    };
  }
};

export const formatData = payloads => {
  const { checkType, status, qcStatus } = payloads;
  const params = {};
  const processCode = _.get(payloads, 'process.key');
  const taskEndTime = _.get(payloads, 'taskEndTime') ? formatRangeUnix(_.get(payloads, 'taskEndTime')) : [];
  const taskStartTime = _.get(payloads, 'taskStartTime') ? formatRangeUnix(_.get(payloads, 'taskStartTime')) : [];

  params.operatorId = _.get(payloads, 'operator.key', undefined);
  params.materialCode = _.get(payloads, 'material.key', undefined);
  params.processCode = processCode;
  params.status = status !== 'all' ? status : null;
  params.checkType = checkType !== 'all' ? checkType : null;
  params.qcStatus = Number(qcStatus) !== 0 ? qcStatus : null;

  // 开始时间
  params.startTimeFrom = taskStartTime[0];
  params.startTimeTill = taskStartTime[1];

  // 结束时间
  params.endTimeFrom = taskEndTime[0];
  params.endTimeTill = taskEndTime[1];

  params.purchaseOrderCode = _.get(payloads, 'purchaseOrderCode.key');
  params.projectCode = _.get(payloads, 'projectCode.key');

  // 工位
  params.workstationId = _.get(payloads, 'workstation.value')
    ? _.get(payloads, 'workstation.value').split('-')[1]
    : null;

  const searchParams = { ...payloads, ...params };
  delete searchParams.taskStartTime;
  delete searchParams.taskEndTime;

  return searchParams;
};

export const getNeedRemark = customRule => {
  if (!arrayIsEmpty(customRule)) {
    return customRule.filter(n => n.ruleType === RULE.qcReportRemark.haveRemark.value).length !== 0;
  }
  return false;
};

export const getNeedTransferNotice = customRule => {
  if (!arrayIsEmpty(customRule)) {
    return customRule.filter(n => n.ruleType === RULE.qcReportTransferNotice.transferNotice.value).length !== 0;
  }
  return false;
};

export const getQcTaskDetailUrl = code => `/qualityManagement/qcTask/detail/${code}`;
