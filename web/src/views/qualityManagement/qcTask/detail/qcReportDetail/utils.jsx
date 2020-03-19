import React from 'react';
import _ from 'lodash';
import { Text } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { replaceSign } from 'src/constants';
import {
  AQL_CHECK,
  CHECKITEM_CHECK,
  USE_QR_CODE,
  LOGIC,
  QCTASK_STATUS_FINISHED,
  QCTASK_STATUS_AUDITING,
} from 'src/views/qualityManagement/constants';
import { getActualSingleInfo } from './index';
import styles from './styles.scss';

export const getSingleRecordData = (data, singleNum = 0) => {
  if (!arrayIsEmpty(data)) {
    const singleRecordReports = [];
    data.forEach(n => {
      const { qcReportValues, qcCheckItemConfig } = n;
      qcReportValues.sort((a, b) => a.seq - b.seq);
      // 填充qcReportValues，此单体没有填写质检项也要显示
      const _qcReportValues = [];
      for (let i = 0; i < singleNum; i += 1) {
        if (qcReportValues[i]) {
          const { seq } = qcReportValues[i];
          if (seq > 1) {
            for (let j = seq; j > 0; j -= 1) {
              if (!_qcReportValues[j - 1]) {
                _qcReportValues[j - 1] = { seq: j, noCheckItem: true, singleNum };
              }
            }
          }
          _qcReportValues[seq - 1] = qcReportValues[i];
        } else if (!qcReportValues[i] && !_qcReportValues[i]) {
          _qcReportValues[i] = { seq: i + 1, noCheckItem: true, singleNum };
        }
      }
      _qcReportValues.forEach(m => {
        qcCheckItemConfig.noCheckItem = m.noCheckItem;
        qcCheckItemConfig.singleNum = m.singleNum;
        if (m.seq <= singleNum) {
          if (!singleRecordReports[qcCheckItemConfig.seq - 1]) {
            singleRecordReports[qcCheckItemConfig.seq - 1] = {
              qcCheckItemConfig,
              [`single${m.seq - 1}`]: m,
            };
          } else {
            singleRecordReports[qcCheckItemConfig.seq - 1][`single${m.seq - 1}`] = m;
          }
        }
      });
    });
    return singleRecordReports;
  }
};

export const renderTableTitle = (data, checkEntityType, singleQrCode) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div>{data.seq}</div>
      {checkEntityType === USE_QR_CODE ? (
        <div>
          <Text>二维码</Text>：{_.get(singleQrCode.filter(n => n.seq === data.seq)[0], 'qrCode') || replaceSign}
        </div>
      ) : null}
    </div>
  );
};

export const getQcResultCustomText = data => {
  const customDefectText = _.get(data, 'customLanguageCollection.qcCheckItemDefect');
  const customNormalText = _.get(data, 'customLanguageCollection.qcCheckItemNormal');
  return {
    customDefectText,
    customNormalText,
  };
};

export const getQcCheckItemData = (data, singleNum = 0) => {
  if (!arrayIsEmpty(data)) {
    const reports = data.map(report => {
      const { qcReportValues, qcCheckItemConfig } = report;
      qcReportValues.sort((a, b) => a.seq - b.seq);
      // 填充qcReportValues，此单体没有填写质检项也要显示
      const _qcReportValues = [];
      for (let i = 0; i < singleNum; i += 1) {
        if (qcReportValues[i]) {
          const { seq } = qcReportValues[i];
          if (seq > 1) {
            for (let j = seq; j > 0; j -= 1) {
              if (!_qcReportValues[j - 1]) {
                _qcReportValues[j - 1] = { seq: j, noCheckItem: true, singleNum };
              }
            }
          }
          _qcReportValues[seq - 1] = qcReportValues[i];
        } else if (!qcReportValues[i] && !_qcReportValues[i]) {
          _qcReportValues[i] = { seq: i + 1, noCheckItem: true, singleNum };
        }
      }
      return _qcReportValues.map(n => {
        const _qcCheckItemConfig = _.cloneDeep(qcCheckItemConfig);
        _qcCheckItemConfig.noCheckItem = n.noCheckItem;
        _qcCheckItemConfig.singleNum = n.singleNum;
        _qcCheckItemConfig.category = n.category;
        _qcCheckItemConfig.value = n.value;
        _qcCheckItemConfig.remark = n.remark;
        _qcCheckItemConfig.desc = n.desc;
        _qcCheckItemConfig.attachmentIds = n.attachmentIds;
        _qcCheckItemConfig.qcReportDefectValues = n.qcReportDefectValues;
        return {
          seq: n.seq,
          qrCode: n.qrCode,
          qcCheckItemConfig: _qcCheckItemConfig,
        };
      });
    });
    const qcItemReports = [];
    reports.forEach((n, i) => {
      n.forEach(m => {
        if (m.seq <= singleNum) {
          if (!qcItemReports[m.seq - 1]) {
            qcItemReports[m.seq - 1] = {
              seq: m.seq,
              qrCode: m.qrCode,
              [`checkItem${i}`]: m.qcCheckItemConfig,
            };
          } else {
            qcItemReports[m.seq - 1][`checkItem${i}`] = m.qcCheckItemConfig;
          }
        }
      });
    });
    return qcItemReports;
  }
};

export const getCheckItems = data => {
  const _columnsData = _.cloneDeep(data);
  if (arrayIsEmpty(_columnsData)) {
    return [];
  }
  delete _columnsData[0].seq;
  delete _columnsData[0].qrCode;
  return _.compact(Object.values(_columnsData[0]));
};

export const getDefectItems = data => {
  const _data = _.cloneDeep(data);
  delete _data.seq;
  delete _data.qrCode;
  return Object.values(_data).filter(n => !n.noCheckItem && n.category === 0);
};

export const getNormalResult = (data, customNormalText) => {
  const { value, desc, logic } = data;
  let defectDisplay = replaceSign;
  switch (logic) {
    case LOGIC.YN:
      defectDisplay = customNormalText;
      break;
    case LOGIC.MANUAL:
      defectDisplay = desc || replaceSign;
      break;
    default:
      if (value || value === 0) {
        defectDisplay = value;
      }
  }
  return defectDisplay;
};

// 统合不同不良等级的不合格项数及不合格单体数
export const getDefectRanks = data => {
  let defectRanks = null;
  const qcReportDefectValues = _.flatten(data.map(n => n.qcReportDefectValues));
  // qcDefectRankId如果不良等级开启是必填的，filter函数为处理中途更换厂级配置的情况
  const haveDefectRankArr = _.compact(qcReportDefectValues.filter(n => n && n.qcDefectRankId));
  defectRanks = !arrayIsEmpty(haveDefectRankArr) ? _.groupBy(haveDefectRankArr, 'qcDefectRankId') : {};
  return defectRanks;
};

export const handleTableSroll = (actionObject, checkItems) => {
  const {
    contentScroll,
    footerScroll,
    setContentScroll,
    setFooterScroll,
    setFooterWidth,
    setColumnWidth,
  } = actionObject;
  const qcCheckItemRecord = document.getElementsByClassName(styles.qcCheckItemRecord)[0];
  const tableBody = qcCheckItemRecord.getElementsByClassName('ant-table-body')[0];
  const tableFooter = qcCheckItemRecord.getElementsByClassName('ant-table-footer')[0];
  const tableFooterContent = tableFooter.getElementsByClassName(styles.tableFooterContent)[0];
  let tableBodyScrollTimer;
  let tableFooterContentScrollTimer;
  // 此处将body与footer的scroll双向绑定，为了防止循环触发scroll事件引起的性能问题，这里用setTimeOut处理
  tableBody.onscroll = () => {
    tableFooterContent.scrollLeft = tableBody.scrollLeft;
    tableFooterContent.onscroll = () => {};
    clearTimeout(tableBodyScrollTimer);
    tableBodyScrollTimer = setTimeout(() => {
      setContentScroll(!contentScroll);
    }, 500);
  };
  tableFooterContent.onscroll = () => {
    tableBody.scrollLeft = tableFooterContent.scrollLeft;
    tableBody.onscroll = () => {};
    clearTimeout(tableFooterContentScrollTimer);
    tableFooterContentScrollTimer = setTimeout(() => {
      setFooterScroll(!footerScroll);
    }, 500);
  };
  const qcCheckItemRecordWidth = qcCheckItemRecord.clientWidth;
  const footerWidth = qcCheckItemRecordWidth - 310;
  const columnWidth = footerWidth - checkItems.length * 160 > 0 ? 0 : 160;
  setFooterWidth(footerWidth);
  setColumnWidth(columnWidth);
};

// 获取样本数量
export const getSampleNum = (data, singleIndex) => {
  const checkCountType = _.get(data, 'qcConfig.checkCountType');
  const { singleNum, itemSingleNums } = getActualSingleInfo(data);
  return checkCountType === AQL_CHECK || checkCountType === CHECKITEM_CHECK ? itemSingleNums[singleIndex] : singleNum;
};

export const getQcAqlValue = (qcCheckItemConfig, taskData) => {
  const { checkItemId, qcAqlValue } = qcCheckItemConfig;
  const { checkItemList, status } = taskData;
  let extraText = '';
  if (!arrayIsEmpty(checkItemList) && (status === QCTASK_STATUS_FINISHED || status === QCTASK_STATUS_AUDITING)) {
    const checkItem = checkItemList.filter(n => n.checkItemId === checkItemId)[0] || {};
    extraText = `(${typeof checkItem.acceptCount === 'number' ? checkItem.acceptCount : replaceSign}收${
      typeof checkItem.rejectCount === 'number' ? checkItem.rejectCount : replaceSign
    }拒)`;
  }
  return `${qcAqlValue} ${extraText}`;
};
