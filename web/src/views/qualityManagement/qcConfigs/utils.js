import _ from 'lodash';
import moment, { formatTodayUnderline } from 'utils/time';
import { LOGIC, CHECKITEM_CHECK, AQL_CHECK } from 'views/qualityManagement/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { isQcItemCodingManually } from 'utils/organizationConfig';
import { getQrCodeOrganizationConfig } from 'src/containers/storageAdjustRecord/list/table';
import { qcReportRecordCountSettable } from './constants';

export const getCreateQcConfigUrl = () => '/knowledgeManagement/qcConfigs/create';

export const getExportFileName = file => `${file}_${moment().format(formatTodayUnderline())}`;

export const getQcConfigImportLogUrl = () => '/knowledgeManagement/qcConfigs/importLog';

export const getQcConfigImportLogDetailUrl = id => `/knowledgeManagement/qcConfigs/importLog/logdetail?id=${id}`;

export const formatBaseInfoExportData = data => {
  const useQrCode = getQrCodeOrganizationConfig();
  const _data = data.map(x => {
    const {
      code,
      name,
      state,
      checkType,
      checkCountType,
      checkCount,
      recordType,
      checkEntityType,
      checkEntityUnitCount,
      checkEntityUnitUnit,
      scrapInspection,
      autoCreateQcTask,
      taskCreateType,
      taskCreateCount,
      taskCreateCountAll,
      taskCreateInterval,
      recordSampleResultType,
      recordCheckItemType,
    } = x || {};
    let _taskCreateCount;
    if (typeof taskCreateType === 'number') {
      switch (taskCreateType) {
        case 0:
          _taskCreateCount = taskCreateInterval / 60000;
          break;
        case 1:
          _taskCreateCount = taskCreateCountAll ? 0 : taskCreateCount;
          break;
        default:
          _taskCreateCount = taskCreateCount;
      }
    }

    // 此处值加一为后端值与导入模板值偏差导致
    const exportData = {
      code,
      name,
      state,
      checkType: typeof checkType === 'number' ? checkType + 1 : '',
      checkCountType: typeof checkCountType === 'number' ? checkCountType + 1 : '',
      checkCount: typeof checkCount === 'number' ? checkCount : '',
      recordType: typeof recordType === 'number' ? recordType + 1 : '',
      checkEntityType: typeof checkEntityType === 'number' ? checkEntityType + 1 : '',
      checkEntityUnitCount: typeof checkEntityType === 'number' ? checkEntityUnitCount : '',
      checkEntityUnitUnit: typeof checkEntityType === 'number' ? checkEntityUnitUnit : '',
      scrapInspection: scrapInspection ? 1 : 0,
      autoCreateQcTask: autoCreateQcTask ? 1 : 0,
      taskCreateType: typeof taskCreateType === 'number' ? taskCreateType + 1 : '',
      taskCreateCount: _taskCreateCount,
      recordSampleResultType: typeof recordSampleResultType === 'number' ? recordSampleResultType + 1 : '',
      recordCheckItemType: typeof recordCheckItemType === 'number' ? recordCheckItemType + 1 : '',
    };
    if (!useQrCode && !qcReportRecordCountSettable) {
      delete exportData.checkEntityType;
      delete exportData.checkEntityUnitCount;
      delete exportData.checkEntityUnitUnit;
      delete exportData.scrapInspection;
      delete exportData.recordSampleResultType;
    } else if (!useQrCode && qcReportRecordCountSettable) {
      delete exportData.scrapInspection;
      delete exportData.recordSampleResultType;
    } else if (useQrCode && !qcReportRecordCountSettable) {
      delete exportData.checkEntityType;
      delete exportData.checkEntityUnitCount;
      delete exportData.checkEntityUnitUnit;
    }
    return exportData;
  });
  return _data.map(x => Object.values(x));
};

export const formatMaterialsExportData = data => {
  const fromatData = data.map(node => {
    const { code, qcConfigMaterials } = node;
    qcConfigMaterials.forEach(m => {
      m.qcConfigCode = code;
    });
    return qcConfigMaterials;
  });
  const _data = _.flatten(fromatData).map(x => {
    const { qcConfigCode, materialCode, qcUnitName } = x || {};

    return {
      qcConfigCode,
      materialCode,
      qcUnitName,
    };
  });
  return _data.map(x => Object.values(x));
};

const getCheckStandard = data => {
  const { logic, base, min, max } = data;
  switch (logic) {
    case LOGIC.BETWEEN: {
      if (min && max) {
        return { display: '区间', value: `${min}|${max}` };
      }
      return '';
    }
    case LOGIC.LT:
      return { display: '<', value: base };
    case LOGIC.GT:
      return { display: '>', value: base };
    case LOGIC.EQ:
      return { display: '=', value: base };
    case LOGIC.LTE:
      return { display: '<=', value: base };
    case LOGIC.GTE:
      return { display: '>=', value: base };
    case LOGIC.YN:
      return { display: '人工判断', value: base };
    case LOGIC.MANUAL:
      return { display: '手工输入', value: base };
    case LOGIC.TOLERANCE: {
      if (!base) {
        return '';
      }
      const lowerNum = parseFloat((min - base).toPrecision(12));
      const upperNum = parseFloat((max - base).toPrecision(12));
      const lowerTolerance = lowerNum > 0 ? `+${lowerNum}` : lowerNum;
      const upperTolerance = upperNum > 0 ? `+${upperNum}` : upperNum;
      return { display: '允差', value: `${base}|${upperTolerance}|${lowerTolerance}` };
    }
    default:
      break;
  }
};

export const formatQcCheckItemsExportData = data => {
  const fromatData = data.map(node => {
    const { code, checkCountType, qcCheckItemConfigs } = node;
    qcCheckItemConfigs.forEach(m => {
      m.qcConfigCode = code;
      m.qcConfigCheckCountType = checkCountType;
    });
    return qcCheckItemConfigs;
  });
  const _data = _.flatten(fromatData).map(x => {
    const {
      qcConfigCode,
      checkCountType,
      qcConfigCheckCountType,
      checkNums,
      checkItem,
      logic,
      base,
      max,
      min,
      unit,
      qcDefectConfigs,
      qcAqlInspectionLevelId,
      qcAqlValue,
    } = x || {};
    const {
      name,
      group: { name: groupName },
    } = checkItem || {};
    const checkStandard = getCheckStandard({ logic, base, max, min });

    return {
      qcConfigCode,
      groupName,
      name,
      checkCountType: qcConfigCheckCountType === CHECKITEM_CHECK ? checkCountType + 1 : '',
      checkNums: qcConfigCheckCountType === CHECKITEM_CHECK && checkCountType !== AQL_CHECK ? checkNums : '',
      qcAqlInspectionLevelId:
        qcConfigCheckCountType === AQL_CHECK ||
        (qcConfigCheckCountType === CHECKITEM_CHECK && checkCountType === AQL_CHECK)
          ? qcAqlInspectionLevelId
          : '',
      qcAqlValue:
        qcConfigCheckCountType === AQL_CHECK ||
        (qcConfigCheckCountType === CHECKITEM_CHECK && checkCountType === AQL_CHECK)
          ? qcAqlValue
          : '',
      standard: (checkStandard && checkStandard.display) || '',
      standardInterval: (checkStandard && checkStandard.value) || '',
      unit: (unit && unit.name) || '',
      qcDefectConfigs: !arrayIsEmpty(qcDefectConfigs) ? qcDefectConfigs.map(n => n.qcDefectReasonName).join('|') : '',
    };
  });
  return _.compact(_data.map(x => Object.values(x)));
};

export default 'dummy';
