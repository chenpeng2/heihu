import { selectAllExport } from 'src/components';
import _ from 'lodash';
import { getQuery } from 'src/routes/getRouteParams';
import moment, { formatUnix } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { showLoading } from 'src/utils/loading';
import {
  PRODUCE_QC,
  qcTaskStatusMap,
  CHECKCOUNT_TYPE,
  AQL_CHECK,
  qcStatus,
  QC_MATERIAL_CATEGORY,
  USE_QR_CODE,
  ONLY_RESULT_DEFECT,
  BY_CHECK_ITEM,
  BY_ENTITY,
  INPUT_FACTORY_QC,
  OUTPUT_FACTORY_QC,
  CHECKITEM_CHECK,
} from 'src/views/qualityManagement/constants';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';
import { getQcCycle } from 'src/views/qualityManagement/qcTask/detail/qcConfig';
import { getQcMaterialData } from 'src/views/qualityManagement/qcTask/detail/viewQcMaterial';
import { getActualTime } from 'src/views/qualityManagement/qcTask/detail/generalInfo';
import {
  getQcCheckItemData,
  getCheckItems,
  getNormalResult,
  getQcResultCustomText,
  getDefectItems,
  getDefectRanks,
  getSingleRecordData,
  getSampleNum,
  getQcAqlValue,
} from 'src/views/qualityManagement/qcTask/detail/qcReportDetail/utils';
import { getDefectResult } from 'src/views/qualityManagement/qcTask/detail/qcReportDetail/defectDetail';
import { getExportQcTaskDetailList, getBulkExportQcTaskDetailList } from 'src/services/qualityManagement/qcTask';
import { getNormalStandard, getActualSingleInfo } from 'src/views/qualityManagement/qcTask/detail/qcReportDetail';
import { getCheckSingleNum, getCheckTypeDisplay } from 'src/views/qualityManagement/qcTask/utils';
import { qcReportAuditConfigIsTrue } from 'src/views/qualityManagement/utils';
import log from 'src/utils/log';
import { formatData } from '../utils';

type Parmas = {
  match: any,
  total: Number,
  allChecked: Boolean,
  selectedRows: Array,
};

const maxExportAmount = 200;

const getSheetNames = exportData => {
  const reg = /^0+/g;
  return exportData.map(n => {
    const qcConfigName = n[1][1];
    const qcTaskCode = n.filter(n => !arrayIsEmpty(n) && n.includes('任务编号'))[0][1].replace(reg, '');
    // excel文件单个sheetName有31个字符的限制，如超出裁掉质检方案名称
    const sliceLength = 31 - qcTaskCode.length - 1;
    const sheetName = `${qcConfigName.slice(0, sliceLength)}_${qcTaskCode}`;
    return sheetName;
  });
};

const getQcConfigConfig = (data, intl, changeChineseTemplateToLocale) => {
  const { qcConfig, qcTaskClassification } = data || {};
  const { name, checkType, checkCountType, autoCreateQcTask } = qcConfig || {};
  const checkTypeDisplay = getCheckTypeDisplay(qcTaskClassification, checkType);
  const title = ['质检方案'];
  const info = [
    ['方案名称', name || '', '', '质检类型', checkTypeDisplay],
    ['质检方式', typeof checkCountType === 'number' ? CHECKCOUNT_TYPE[checkCountType] : ''],
  ];
  if (checkType === PRODUCE_QC && autoCreateQcTask) {
    info[1] = info[1].concat(['', '质检频次', getQcCycle(data, changeChineseTemplateToLocale, intl)]);
  }
  return [title, ...info];
};

const getQcMaterialConfig = data => {
  const { desc, materialCustomFields } = data.material || {};
  const qcMaterialData = getQcMaterialData(data);
  const useQrCode = isOrganizationUseQrCode();
  const materialName = _.get(data, 'material.name', '');
  const title = ['质检物料'];
  let materialCustomFieldsInfo = [['自定义字段', '']];
  if (!arrayIsEmpty(materialCustomFields)) {
    const materialCustomFieldsTableContent = materialCustomFields.map(n => ['', n.keyName, n.keyValue]);
    materialCustomFieldsInfo = [['自定义字段', '字段名', '字段值'], ...materialCustomFieldsTableContent];
  }
  const info = [['规格描述', desc || ''], ...materialCustomFieldsInfo];
  const tableHeader = ['是否样本', '物料编号|物料名称', '当前数量', '库存位置', useQrCode ? '二维码' : ''];
  const tableContent = qcMaterialData.map(n => {
    const { category, code, count, unit, storage, qrCode } = n;
    return [
      QC_MATERIAL_CATEGORY.QC_SAMPLE.value === category ? '是' : '否',
      `${code || ''} | ${materialName || ''}`,
      typeof count === 'number' ? `${count || ''} ${(unit && unit.name) || ''}` : '',
      (storage && storage.name) || '',
      useQrCode ? qrCode || '' : '',
    ];
  });
  return [title, ...info, tableHeader, ...tableContent];
};

const getQcReportSummaryConfig = data => {
  const { qcTotal, countRecord, material, desc } = data;
  const { unitName } = material || {};
  const { qualifiedConcessionCount, qualifiedCount, checkCount, defectCount, status } = countRecord || {};
  const title = ['质检报告概要'];
  const info = [
    [
      '总体数量',
      typeof qcTotal === 'number' ? `${qcTotal}${unitName || ''}` : '',
      '',
      '质检结果',
      typeof status === 'number' ? qcStatus[status] : '',
    ],
    [
      '样本数量',
      typeof checkCount === 'number' ? `${checkCount}${unitName || ''}` : '',
      '',
      '样本合格数',
      typeof qualifiedCount === 'number'
        ? `${qualifiedCount}${unitName || ''} ${((qualifiedCount / checkCount) * 100).toFixed(1)}%`
        : '',
    ],
    [
      '样本不合格数',
      typeof defectCount === 'number'
        ? `${defectCount}${unitName || ''} ${((defectCount / checkCount) * 100).toFixed(1)}%`
        : '',
      '',
      '样本让步合格率',
      typeof qualifiedConcessionCount === 'number'
        ? `${qualifiedConcessionCount}${unitName || ''} ${((qualifiedConcessionCount / checkCount) * 100).toFixed(1)}%`
        : '',
    ],
    ['备注', desc || ''],
  ];
  return [title, ...info];
};

const getSampleQcResultConfig = data => {
  const { qcMaterialReports } = data;
  const title = ['样本质检结果'];
  if (arrayIsEmpty(qcMaterialReports)) {
    return [title, ['暂无数据']];
  }
  const header = ['编号', '二维码', '当前数量', '合计抽样', '合格 / 率', '让步合格 / 率', '不合格 / 率'];
  const body = qcMaterialReports.map(n => {
    const { seq, qcMaterial, unitName, qualifiedCount, defectCount, qualifiedConcessionCount } = n;
    const { qrCode, count } = qcMaterial || {};
    const _count = typeof count === 'number' ? count : 0;
    const _defectCount = typeof defectCount === 'number' ? defectCount : 0;
    const _qualifiedConcessionCount = typeof qualifiedConcessionCount === 'number' ? qualifiedConcessionCount : 0;
    const _qualifiedCount = typeof qualifiedCount === 'number' ? qualifiedCount : 0;
    const totalCount = _qualifiedCount + _defectCount + _qualifiedConcessionCount;
    return [
      typeof seq === 'number' ? seq : '',
      qrCode || '',
      `${_count} ${unitName || ''}`,
      `${totalCount} ${unitName || ''}`,
      `${_qualifiedCount}/${((_qualifiedCount / totalCount) * 100).toFixed(1)}%`,
      `${_qualifiedConcessionCount}/${((_qualifiedConcessionCount / totalCount) * 100).toFixed(1)}%`,
      `${_defectCount}/${((_defectCount / totalCount) * 100).toFixed(1)}%`,
    ];
  });
  return [title, header, ...body];
};

const getDefectDetail = (data, customDefectText) => {
  const configs = getOrganizationConfigFromLocalStorage();
  const haveQcDefectRank = _.get(configs, `${ORGANIZATION_CONFIG.qcDefectRanked}.configValue`) === 'true';
  const haveComment = _.get(configs, `${ORGANIZATION_CONFIG.configQcCheckItemComment}.configValue`) === 'true';
  if (data && data.noCheckItem) return '';
  const { qcReportDefectValues, remark } = data || {};
  const defectResult = getDefectResult(data, customDefectText);
  const defectDetail =
    !arrayIsEmpty(qcReportDefectValues) &&
    !qcReportDefectValues.every(n => (!haveQcDefectRank || !n.qcDefectRank) && !n.qcDefectReason)
      ? qcReportDefectValues.map((data, index) => {
          const { qcDefectReason, qcDefectRank } = data || {};
          if (haveQcDefectRank && qcDefectRank && qcDefectReason) {
            return `${index === 0 ? defectResult : ''}\n${qcDefectReason.name} 等级：${qcDefectRank.code}`;
          }
          if (haveQcDefectRank && qcDefectRank && !qcDefectReason) {
            return `${defectResult} 等级：${qcDefectRank.code}`;
          }
          if ((!haveQcDefectRank || !qcDefectRank) && qcDefectReason) {
            return `${index === 0 ? defectResult : ''} ${qcDefectReason.name}`;
          }
          return '';
        })
      : defectResult;
  return `${defectDetail}${haveComment ? `\n${remark || ''}` : ''}`;
};

const getDefectDetailByOnlyRecordDefect = data => {
  const { qcReportDefectValues, defect } = data;
  const configs = getOrganizationConfigFromLocalStorage();
  const haveQcDefectRank = _.get(configs, `${ORGANIZATION_CONFIG.qcDefectRanked}.configValue`) === 'true';
  if (!defect || arrayIsEmpty(qcReportDefectValues) || arrayIsEmpty(qcReportDefectValues)) {
    return '';
  }
  const defectDetails = qcReportDefectValues.map(n => {
    const { defectCount, qcDefectReason, qcDefectRank } = n || {};
    if (haveQcDefectRank && qcDefectRank && qcDefectReason) {
      return `${qcDefectReason.name}：${defectCount} 等级：${qcDefectRank.code}`;
    }
    if (haveQcDefectRank && qcDefectRank && !qcDefectReason) {
      return `${defectCount} 等级：${qcDefectRank.code}`;
    }
    if ((!haveQcDefectRank || !qcDefectRank) && qcDefectReason) {
      return `${qcDefectReason.name}：${defectCount}`;
    }
    if ((!haveQcDefectRank || !qcDefectRank) && !qcDefectReason) {
      return defect || '';
    }
    return '';
  });
  return defectDetails.join('\n');
};

const getSingleDisplay = (data, checkEntityType, singleQrCode) => {
  if (data) {
    const { seq } = data;
    return `${seq}${
      checkEntityType === USE_QR_CODE
        ? `\n二维码：${_.get(singleQrCode.filter(n => n.seq === seq)[0], 'qrCode') || ''}`
        : ''
    }`;
  }
  return '';
};

const getCheckItemDisplay = (qcCheckItem, checkCountType, data, index, changeChineseTemplateToLocale) => {
  const { checkItem, qcAqlInspectionLevelName, checkCountType: checkItemCheckCountType } = qcCheckItem;
  let text = `${checkItem.name}\n样本数量：${getSampleNum(data, index)}\n${getNormalStandard(
    qcCheckItem,
    true,
    true,
    changeChineseTemplateToLocale,
  )}`;
  if (checkCountType === AQL_CHECK || (checkCountType === CHECKITEM_CHECK && checkItemCheckCountType === AQL_CHECK)) {
    text += `\n检验水平：${qcAqlInspectionLevelName}\n接收质量限：${getQcAqlValue(qcCheckItem, data)}`;
  }
  return text;
};

const getReportDisplay = (reportData, data) => {
  const configs = getOrganizationConfigFromLocalStorage();
  const haveComment = _.get(configs, `${ORGANIZATION_CONFIG.configQcCheckItemComment}.configValue`) === 'true';
  const { customDefectText, customNormalText } = getQcResultCustomText(data);
  if (!reportData || typeof reportData.category !== 'number' || reportData.noCheckItem) {
    return '';
  }
  const { category, remark } = reportData;
  if (category === 0) {
    return getDefectDetail(reportData, customDefectText);
  }
  const normalResult = getNormalResult(reportData, customNormalText);
  return `${normalResult}${haveComment ? `\n${remark || ''}` : ''}`;
};

const getAllUnQualifiedSingle = data => {
  if (!data) {
    return '';
  }
  const configs = getOrganizationConfigFromLocalStorage();
  const haveQcDefectRank = _.get(configs, `${ORGANIZATION_CONFIG.qcDefectRanked}.configValue`) === 'true';
  const defectSingles = data.qcReportValues.filter(n => n.category === 0);
  const defectRanks = Object.values(getDefectRanks(defectSingles)).map(n => `${n[0].qcDefectRank.code}：${n.length} `);
  return `${defectSingles.length}${
    haveQcDefectRank && !arrayIsEmpty(defectSingles) ? `\n${!arrayIsEmpty(defectRanks) && defectRanks.join(' ')}` : ''
  }`;
};

const getAllUnQualifiedCheckItem = data => {
  const configs = getOrganizationConfigFromLocalStorage();
  const haveQcDefectRank = _.get(configs, `${ORGANIZATION_CONFIG.qcDefectRanked}.configValue`) === 'true';
  return `${data.length}${
    haveQcDefectRank && !arrayIsEmpty(data)
      ? `\n${Object.values(getDefectRanks(data))
          .map(n => `${n[0].qcDefectRank.code}：${n.length} `)
          .join(' ')}`
      : ''
  }`;
};

const getCheckItemReportDetailConfig = (data, changeChineseTemplateToLocale) => {
  const { qcConfig, reports } = data;
  const { checkCountType, checkEntityType } = qcConfig || {};

  const { singleNum, singleQrCode } = getActualSingleInfo(data);
  const columnsData = getQcCheckItemData(reports, singleNum);
  const checkItems = getCheckItems(columnsData);
  const title = ['质检报告明细'];
  const tableTitle = checkItems.map((qcCheckItem, index) => {
    return getCheckItemDisplay(qcCheckItem, checkCountType, data, index, changeChineseTemplateToLocale);
  });
  const header = ['单体编号\\质检项', ...tableTitle, '总不合格项数'];

  const body = columnsData.map(columnData => {
    if (columnData) {
      const firstColumn = getSingleDisplay(columnData, checkEntityType, singleQrCode);
      const bodyColumns = checkItems.map((n, index) => {
        const checkItem = _.get(columnData, `checkItem${index}`);
        return getReportDisplay(checkItem, data);
      });
      const defectItems = getDefectItems(columnData);
      const lastColumn = getAllUnQualifiedCheckItem(defectItems);
      return [firstColumn, ...bodyColumns, lastColumn];
    }
    return '';
  });

  const footerColumns = checkItems.map(checkItem => {
    return getAllUnQualifiedSingle(reports.filter(n => n.qcCheckItemConfig.id === checkItem.id)[0]);
  });

  const footer = ['总不合格单体数', ...footerColumns, '\\'];

  return [title, header, ..._.compact(body), footer];
};

const getSingleRecordReportDetailConfig = (data, changeChineseTemplateToLocale) => {
  const { qcConfig, reports } = data;
  const { checkCountType, checkEntityType } = qcConfig || {};

  const { singleNum, singleQrCode } = getActualSingleInfo(data);
  const columnsData = getSingleRecordData(_.cloneDeep(reports), singleNum);
  const checkItemRecordData = getQcCheckItemData(_.cloneDeep(reports), singleNum);

  const title = ['质检报告明细'];
  const tableTitle = checkItemRecordData.map(single => {
    return getSingleDisplay(single, checkEntityType, singleQrCode);
  });
  const header = ['质检项\\单体编号', ...tableTitle, '总不合格单体数'];
  const body = columnsData.map((columnData, index) => {
    const { qcCheckItemConfig } = columnData;
    const firstColumn = getCheckItemDisplay(
      qcCheckItemConfig,
      checkCountType,
      data,
      index,
      changeChineseTemplateToLocale,
    );
    const bodyColumns = checkItemRecordData.map((n, index) => {
      const single = _.get(columnData, `single${index}`);
      const { logic } = qcCheckItemConfig || {};
      single.logic = logic;
      return getReportDisplay(single, data);
    });
    const lastColumn = getAllUnQualifiedSingle(reports.filter(n => n.qcCheckItemConfig.id === qcCheckItemConfig.id)[0]);

    return [firstColumn, ...bodyColumns, lastColumn];
  });
  const footerColumns = checkItemRecordData.map(n => {
    const defectItems = getDefectItems(n);
    return getAllUnQualifiedCheckItem(defectItems);
  });
  const footer = ['总不合格项数', ...footerColumns, '\\'];
  return _.compact([title, header, ..._.compact(body), footer]);
};

const getOnlyRecordDefectConfig = (data, changeChineseTemplateToLocale) => {
  const { reports, qcConfig } = data;
  const { checkCountType } = qcConfig || {};
  const title = ['质检报告明细'];
  const header = ['编号', '质检项', '次品数', '次品明细'];
  const configs = getOrganizationConfigFromLocalStorage();
  const haveComment = _.get(configs, `${ORGANIZATION_CONFIG.configQcCheckItemComment}.configValue`) === 'true';
  if (haveComment) {
    header.push('备注');
  }
  const aqlHeader = ['检验水平', '样本数量', '接收质量限'];
  const normalStandardHeader = ['合格标准'];
  const checkItemCheckHaveAql = reports.filter(n => n.qcCheckItemConfig.checkCountType === AQL_CHECK).length > 0;
  const standardHeader =
    checkCountType === AQL_CHECK || checkItemCheckHaveAql
      ? aqlHeader.concat(normalStandardHeader)
      : normalStandardHeader;
  header.splice(2, 0, ...standardHeader);
  const body = reports.map(n => {
    const { qcCheckItemConfig, defect, checkCount, remark } = n;
    const { seq, checkItem, qcAqlInspectionLevelName, checkCountType: checkItemCheckCountType } = qcCheckItemConfig;
    const defectDetail = getDefectDetailByOnlyRecordDefect(n);
    const body = [
      typeof seq === 'number' ? seq : '',
      (checkItem && checkItem.name) || '',
      ...(checkItemCheckHaveAql && checkItemCheckCountType !== AQL_CHECK ? ['', '', ''] : []),
      typeof defect === 'number' ? `${defect}` : '',
      defectDetail,
    ];
    if (haveComment) {
      body.push(remark || '');
    }
    const aqlBody = [
      qcAqlInspectionLevelName || '',
      typeof checkCount === 'number' ? checkCount : '',
      getQcAqlValue(qcCheckItemConfig, data),
    ];
    const normalStandardBody = [getNormalStandard(qcCheckItemConfig, true, true, changeChineseTemplateToLocale)];
    const standardBody =
      checkCountType === AQL_CHECK || (checkCountType === CHECKITEM_CHECK && checkItemCheckCountType === AQL_CHECK)
        ? aqlBody.concat(normalStandardBody)
        : normalStandardBody;
    body.splice(2, 0, ...standardBody);
    return body;
  });
  return [title, header, ...body];
};

const getProdTaskConfig = (data, intl) => {
  const {
    status,
    task,
    auditedTime,
    auditorName,
    code,
    plannedStartTime,
    startTime,
    operatorName,
    plannedEndTime,
    checkType,
    endTime,
  } = data || {};
  const { processCode, processName, projectCode, purchaseOrderCode, operators, taskCode } = task || {};
  const qcReportAuditConfig = qcReportAuditConfigIsTrue();
  const title = ['任务信息'];
  let info = [
    ['任务编号', code || '', '', '任务状态', typeof status === 'number' ? qcTaskStatusMap[status] : ''],
    [
      '质检位置',
      _.get(data, 'storage.name') || _.get(data, 'workstation.name'),
      '',
      '开始时间',
      getActualTime(plannedStartTime, startTime, intl),
    ],
    ['质检人员', operatorName || '', '', '结束时间', getActualTime(plannedEndTime, endTime)],
  ];
  if (!(checkType === INPUT_FACTORY_QC || checkType === OUTPUT_FACTORY_QC)) {
    info = info.concat([
      [
        '生产工序',
        processCode && processName ? `${processCode}/${processName}` : '',
        '',
        '生产工位',
        _.get(task, 'workstation.name', ''),
      ],
      ['生产任务号', taskCode || '', '', '项目号', projectCode || ''],
      [
        '生产人员',
        !arrayIsEmpty(operators) ? operators.map(n => n.name).join('，') : '',
        '',
        '订单号',
        purchaseOrderCode || '',
      ],
    ]);
  }
  if (qcReportAuditConfig) {
    info.push(['审核人', auditorName || '', '', '审核时间', auditedTime ? formatUnix(auditedTime) : '']);
  }
  return [title, ...info];
};

export const getQcTaskDetailExportData = (exportData, intl, changeChineseTemplateToLocale) => {
  // 补空格是用来作为导出的excel文件中各表格间的分隔
  return exportData.map(data => {
    const { recordType, reports } = data;
    const useQrCode = isOrganizationUseQrCode();
    const singleNum = getCheckSingleNum(data);
    const haveQcReportValues = !arrayIsEmpty(reports) && reports.some(n => !arrayIsEmpty(n.qcReportValues));
    let reportDetailConfig;
    if (
      (recordType === ONLY_RESULT_DEFECT && arrayIsEmpty(reports)) ||
      (recordType !== ONLY_RESULT_DEFECT && (!haveQcReportValues || !singleNum))
    ) {
      reportDetailConfig = [['质检报告明细'], ['暂无数据']];
    } else if (recordType === ONLY_RESULT_DEFECT) {
      reportDetailConfig = getOnlyRecordDefectConfig(data, changeChineseTemplateToLocale);
    } else if (recordType === BY_CHECK_ITEM) {
      reportDetailConfig = getCheckItemReportDetailConfig(data, changeChineseTemplateToLocale);
    } else if (recordType === BY_ENTITY) {
      reportDetailConfig = getSingleRecordReportDetailConfig(data, changeChineseTemplateToLocale);
    }
    return [
      ...getQcConfigConfig(data, intl, changeChineseTemplateToLocale),
      [],
      ...getQcMaterialConfig(data),
      [],
      ...getQcReportSummaryConfig(data),
      [],
      ...reportDetailConfig,
      [],
      ...(useQrCode ? getSampleQcResultConfig(data) : []),
      [],
      ...getProdTaskConfig(data, intl),
    ];
  });
};

export const exportQcTaskDetail = async (parmas: Parmas) => {
  const { match, total, selectedRows, allChecked, intl, changeChineseTemplateToLocale } = parmas;
  const queryMatch = getQuery(match);
  let exportData;
  showLoading(false);

  selectAllExport(
    {
      width: '30%',
    },
    {
      selectedAmount: allChecked ? total : selectedRows.length,
      maxExportAmount,
      getExportData: async params => {
        showLoading(true);
        if (allChecked) {
          const res = await getExportQcTaskDetailList({ ...formatData(queryMatch), ...params });
          exportData = _.get(res, 'data.data');
        } else {
          const { page, size } = params;
          const qcTaskCodes = selectedRows.map(n => n.code).slice((page - 1) * size, page * size);
          try {
            const res = await getBulkExportQcTaskDetailList(qcTaskCodes);
            exportData = _.get(res, 'data.data');
          } catch (e) {
            log.error(e);
          }
        }
        return getQcTaskDetailExportData(exportData, intl, changeChineseTemplateToLocale);
      },
      fileName: `质检报告详情_${moment().format('YYYY_MM_DD HH_mm_ss')}`,
      getSheetNames: exportData => getSheetNames(exportData),
      isExportStyleFile: true,
      exportFileStyle: { colsWidth: 150 },
    },
  );
};
