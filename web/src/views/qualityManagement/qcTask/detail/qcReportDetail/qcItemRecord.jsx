import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Table, Tooltip, Text } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { primary, white } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { AQL_CHECK, CHECKITEM_CHECK } from 'src/views/qualityManagement/constants';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { DefectDetail, renderRemark, renderAttachment } from './defectDetail';
import { getNormalStandard } from './index';
import {
  getQcResultCustomText,
  getQcCheckItemData,
  getCheckItems,
  getNormalResult,
  getDefectItems,
  getDefectRanks,
  handleTableSroll,
  renderTableTitle as renderFirstColumnTitle,
  getSampleNum,
  getQcAqlValue,
} from './utils';
import styles from './styles.scss';

type Props = {
  data: any,
  taskData: any,
  singleNum: Number,
  singleQrCode: Array,
  itemSingleNums: Array,
  checkCountType: Number,
  checkEntityType: Number,
};

const QcItemRecord = (props: Props, context) => {
  const [footerWidth, setFooterWidth] = useState(0);
  // width为0表示不设置中间内容column的宽度
  const [columnWidth, setColumnWidth] = useState(0);
  const [footerScroll, setFooterScroll] = useState(false);
  const [contentScroll, setContentScroll] = useState(false);
  const { data, taskData, singleNum, checkCountType, checkEntityType, singleQrCode } = props;
  const { changeChineseTemplateToLocale } = context;
  const { customDefectText, customNormalText } = getQcResultCustomText(taskData);
  const columnsData = getQcCheckItemData(data, singleNum);
  const checkItems = getCheckItems(columnsData);
  const configs = getOrganizationConfigFromLocalStorage();
  const haveQcDefectRank = _.get(configs, `${ORGANIZATION_CONFIG.qcDefectRanked}.configValue`) === 'true';

  const renderTableTitle = (qcCheckItem = {}, index) => {
    const { checkItem, qcAqlInspectionLevelName, checkCountType: checkItemCheckCountType } = qcCheckItem;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tooltip text={checkItem.name} width={120} />
        <div>
          <Text>样本数量</Text>：{getSampleNum(taskData, index)}
        </div>
        {/* 第二个参数为是否需要展示额外的”合格标准“字样 */}
        <Tooltip text={getNormalStandard(qcCheckItem, true, false, changeChineseTemplateToLocale)} width={150} />
        {checkCountType === AQL_CHECK ||
        (checkCountType === CHECKITEM_CHECK && checkItemCheckCountType === AQL_CHECK) ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Tooltip
              text={`${changeChineseToLocaleWithoutIntl('检验水平')}：${qcAqlInspectionLevelName}`}
              width={'100%'}
            />
            <Tooltip
              text={`${changeChineseToLocaleWithoutIntl('接收质量限')}：${getQcAqlValue(qcCheckItem, taskData)}`}
              width={'100%'}
            />
          </div>
        ) : null}
      </div>
    );
  };

  const getQcCheckItemColumns = (isFooter = false) => {
    const configs = getOrganizationConfigFromLocalStorage();
    const haveComment = _.get(configs, `${ORGANIZATION_CONFIG.configQcCheckItemComment}.configValue`) === 'true';
    if (!arrayIsEmpty(columnsData)) {
      return checkItems.map((n, index) => {
        const defectSingles = data[index].qcReportValues.filter(n => n.category === 0);
        if (isFooter) {
          const width = columnWidth || `calc(100% / ${checkItems.length})`;
          const defectRanks = Object.values(getDefectRanks(defectSingles)).map(
            n => `${n[0].qcDefectRank.code}：${n.length} `,
          );
          return (
            <div className={styles.footerItem} style={{ width }}>
              <div>{defectSingles.length}</div>
              {haveQcDefectRank && !arrayIsEmpty(defectSingles) ? (
                <div>
                  <Tooltip text={!arrayIsEmpty(defectRanks) && defectRanks.join(' ')} width={'75%'} />
                </div>
              ) : null}
            </div>
          );
        }
        const column = {
          title: renderTableTitle(n, index),
          dataIndex: `checkItem${index}`,
          className: styles.columns,
          key: `checkItem${index}`,
          render: data => {
            if (!(data && typeof data.category === 'number') && arrayIsEmpty(data.attachmentIds)) return replaceSign;
            const { category, remark, noCheckItem, attachmentIds } = data;
            if (noCheckItem) return replaceSign;
            // category代表为良品还是次品，只有次品才需要显示不良明细
            if (category === 0) {
              return <DefectDetail data={data} customDefectText={customDefectText} />;
            }
            const defectDisplay = getNormalResult(data, customNormalText);
            return (
              <div className={styles.normalDisplay}>
                <Tooltip width={110} containerStyle={{ color: primary }} text={defectDisplay} />
                {haveComment ? renderRemark(remark) : null}
                {renderAttachment(attachmentIds)}
              </div>
            );
          },
        };
        if (columnWidth) {
          column.width = columnWidth;
        }
        return column;
      });
    }
    return null;
  };

  const getFirstColumn = () => {
    return [
      {
        title: (
          <div>
            <div className={checkCountType === AQL_CHECK ? styles.tableSlash_first_aql : styles.tableSlash_first} />
            <span
              className={
                checkCountType === AQL_CHECK ? styles.firstColumnText_bottom_aql : styles.firstColumnText_bottom
              }
            >
              <Text>单体编号</Text>
            </span>
            <span
              className={checkCountType === AQL_CHECK ? styles.firstColumnText_top_aql : styles.firstColumnText_top}
            >
              <Text>质检项</Text>
            </span>
          </div>
        ),
        dataIndex: 'seq',
        fixed: 'left',
        className: styles.firstColumn,
        key: 'seq',
        width: 150,
        render: (data, record) => renderFirstColumnTitle(record, checkEntityType, singleQrCode),
      },
    ];
  };

  const getLastColumn = () => ({
    title: (
      <Tooltip text={changeChineseToLocaleWithoutIntl('总不合格项数')} width={100} containerStyle={{ marginTop: 6 }} />
    ),
    fixed: 'right',
    className: styles.lastColumn,
    key: 'total',
    width: 120,
    render: data => {
      const defectItems = getDefectItems(data);
      return (
        <div>
          <div>{defectItems.length}</div>
          {haveQcDefectRank && !arrayIsEmpty(defectItems) ? (
            <div>
              {Object.values(getDefectRanks(defectItems)).map(n => {
                return <Tooltip text={`${n[0].qcDefectRank.code}：${n.length} `} width={100} />;
              })}
            </div>
          ) : null}
        </div>
      );
    },
  });

  const getColumns = () => {
    const columns = getFirstColumn();
    const lastColumn = getLastColumn();
    const qcCheckItemColumns = getQcCheckItemColumns();
    columns.splice(1, 0, ...qcCheckItemColumns);
    columns.push(lastColumn);
    return columns;
  };

  const renderFooter = () => (
    <div className={haveQcDefectRank ? styles.tableFooter_qcDefectRank : styles.tableFooter}>
      <div className={styles.footerItem} style={{ width: 151 }}>
        <Text>总不合格单体数</Text>
      </div>
      <div className={styles.tableFooterContent} style={{ maxWidth: footerWidth }}>
        {getQcCheckItemColumns(true)}
      </div>
      <div className={styles.footerItem} style={{ width: 119, borderRight: 'unset' }}>
        <div className={haveQcDefectRank ? styles.tableSlash_last_qcDefectRank : styles.tableSlash_last} />
      </div>
    </div>
  );

  useEffect(() => {
    const actionObject = {
      contentScroll,
      footerScroll,
      setContentScroll,
      setFooterScroll,
      setFooterWidth,
      setColumnWidth,
    };
    handleTableSroll(actionObject, checkItems);
  }, [contentScroll, footerScroll]);

  const columns = getColumns();
  const havePagination = columnsData && columnsData.length > 10;

  return (
    <div className={styles.qcCheckItemRecord} style={{ marginBottom: columnsData && columnsData.length > 10 ? 40 : 0 }}>
      <Table
        bordered
        dataSource={columnsData || []}
        total={columnsData && columnsData.length}
        columns={columns}
        footer={() => renderFooter()}
        refetch={() => {}}
        pagination={havePagination}
        scroll={{ x: true, y: 340 }}
      />
      {/* 为了遮盖footer的滚动条 */}
      <div style={{ height: 20, width: '100%', backgroundColor: white }} />
    </div>
  );
};

QcItemRecord.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default QcItemRecord;
