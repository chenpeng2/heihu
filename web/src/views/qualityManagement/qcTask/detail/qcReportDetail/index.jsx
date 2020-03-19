import React from 'react';
import _ from 'lodash';
import { DetailPageItemContainer, Tooltip } from 'components';
import {
  AQL_CHECK,
  CHECKITEM_CHECK,
  LOGIC,
  ONLY_RESULT_DEFECT,
  BY_ENTITY,
  BY_CHECK_ITEM,
} from 'src/views/qualityManagement/constants';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { fontSub } from 'src/styles/color/index';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { getCheckSingleNum, getCheckSingleNumByAql, getSingleQrCode } from '../../utils';
import OnlyRecordDefect from './onlyRecordDefect';
import SingleRecord from './singleRecord';
import QcItemRecord from './qcItemRecord';

type Props = {
  data: {},
};

// 当记录方式为质检项记录或者单体记录时显示与仅记录次品数不同
export const getNormalStandard = (
  qcCheckItemConfig,
  haveExtraDesc = false,
  onlyText = false,
  changeChineseTemplateToLocale,
) => {
  const { base, max, min, logic } = qcCheckItemConfig;
  const unitName = _.get(qcCheckItemConfig, 'unit.name', '');
  let text = replaceSign;
  switch (logic) {
    case LOGIC.BETWEEN: {
      if (typeof min === 'number' && typeof max === 'number') {
        text = haveExtraDesc
          ? changeChineseTemplateToLocale('合格标准：{min}-{max} {unitName}', {
              min,
              max,
              unitName,
            })
          : `${min}-${max} ${unitName}`;
      } else {
        text = replaceSign;
      }
      break;
    }
    case LOGIC.LT:
      text = haveExtraDesc
        ? changeChineseTemplateToLocale('合格标准：<{base} {unitName}', {
            base,
            unitName,
          })
        : changeChineseTemplateToLocale('小于{base} {unitName}', {
            base,
            unitName,
          });
      break;
    case LOGIC.GT:
      text = haveExtraDesc
        ? changeChineseTemplateToLocale('合格标准：>{base} {unitName}', {
            base,
            unitName,
          })
        : changeChineseTemplateToLocale('大于{base} {unitName}', {
            base,
            unitName,
          });
      break;
    case LOGIC.EQ:
      text = haveExtraDesc
        ? changeChineseTemplateToLocale('合格标准：={base} {unitName}', {
            base,
            unitName,
          })
        : changeChineseTemplateToLocale('等于{base} {unitName}', {
            base,
            unitName,
          });
      break;
    case LOGIC.LTE:
      text = haveExtraDesc
        ? changeChineseTemplateToLocale('合格标准：<={base} {unitName}', {
            base,
            unitName,
          })
        : changeChineseTemplateToLocale('小于等于{base} {unitName}', {
            base,
            unitName,
          });
      break;
    case LOGIC.GTE:
      text = haveExtraDesc
        ? changeChineseTemplateToLocale('合格标准：>={base} {unitName}', {
            base,
            unitName,
          })
        : changeChineseTemplateToLocale('大于等于{base} {unitName}', {
            base,
            unitName,
          });
      break;
    case LOGIC.YN:
      text = changeChineseToLocaleWithoutIntl('人工判断');
      break;
    case LOGIC.MANUAL:
      text = changeChineseToLocaleWithoutIntl('手工输入');
      break;
    case LOGIC.TOLERANCE: {
      if (typeof base !== 'number') {
        text = replaceSign;
      } else {
        const lowerNum = parseFloat((min - base).toPrecision(12));
        const upperNum = parseFloat((max - base).toPrecision(12));
        const lowerTolerance = lowerNum > 0 ? `+${lowerNum}` : lowerNum;
        const upperTolerance = upperNum > 0 ? `+${upperNum}` : upperNum;
        text = haveExtraDesc
          ? changeChineseTemplateToLocale('合格标准：{base}（{upperTolerance}，{lowerTolerance}）{unitName}', {
              base,
              upperTolerance,
              lowerTolerance,
              unitName,
            })
          : `${base}（${upperTolerance}，${lowerTolerance}）${unitName}`;
      }
      break;
    }
    default:
      break;
  }
  if (onlyText) {
    return text;
  }
  return <Tooltip text={text} width={120} />;
};

export const NoContentConfirm = text => (
  <div style={{ color: fontSub, margin: '0 auto', padding: '5px 0' }}>{text}</div>
);

export const getActualSingleInfo = data => {
  const { qcConfig, checkItemList } = data || {};

  const { checkCountType } = qcConfig || {};

  let singleNum;
  let itemSingleNums;
  const singleQrCode = getSingleQrCode(data);
  if (checkCountType === AQL_CHECK || checkCountType === CHECKITEM_CHECK) {
    // aql检时各个质检项单体数可能不同，额外添加一数组记录，singleNum记录为最大数量用来显示列表
    const checkInfo = getCheckSingleNumByAql(checkItemList);
    singleNum = checkInfo.singleNum;
    itemSingleNums = checkInfo.itemSingleNums;
  } else {
    singleNum = getCheckSingleNum(data);
  }
  return { singleNum, itemSingleNums, singleQrCode };
};

export const QcReportDetailContent = data => {
  const { reports, recordType, qcConfig } = data || {};

  const { checkCountType, checkEntityType } = qcConfig || {};

  if (recordType === ONLY_RESULT_DEFECT) {
    return <OnlyRecordDefect taskData={data} data={reports} checkCountType={checkCountType} />;
  }

  const { singleNum, singleQrCode } = getActualSingleInfo(data);

  if (recordType === BY_ENTITY) {
    return (
      <SingleRecord
        taskData={data}
        data={reports}
        checkCountType={checkCountType}
        checkEntityType={checkEntityType}
        singleNum={singleNum}
        singleQrCode={singleQrCode}
      />
    );
  } else if (recordType === BY_CHECK_ITEM) {
    return (
      <QcItemRecord
        taskData={data}
        data={reports}
        checkCountType={checkCountType}
        checkEntityType={checkEntityType}
        singleNum={singleNum}
        singleQrCode={singleQrCode}
      />
    );
  }
  return null;
};

const QcReportDetail = (props: Props) => {
  // 分单体记录、质检项记录、仅记录次品数，和AQL方式的以上三种记录
  const { data } = props;
  const { reports, recordType } = data || {};
  const singleNum = getCheckSingleNum(data);
  const haveQcReportValues = !arrayIsEmpty(reports) && reports.some(n => !arrayIsEmpty(n.qcReportValues));
  return (
    <DetailPageItemContainer
      contentStyle={{ width: '100%', padding: `10px 0 ${reports && reports.length > 10 ? '60px' : '10px'} 0` }}
      itemHeaderTitle="质检报告明细"
    >
      {(recordType === ONLY_RESULT_DEFECT && arrayIsEmpty(reports)) ||
      (recordType !== ONLY_RESULT_DEFECT && (!haveQcReportValues || !singleNum))
        ? NoContentConfirm(changeChineseToLocaleWithoutIntl('暂无数据'))
        : QcReportDetailContent(data)}
    </DetailPageItemContainer>
  );
};

export default QcReportDetail;
