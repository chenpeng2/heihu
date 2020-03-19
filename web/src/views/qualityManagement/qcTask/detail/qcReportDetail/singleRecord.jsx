import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Table, Tooltip, Text } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { primary, white } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { AQL_CHECK, CHECKITEM_CHECK } from 'src/views/qualityManagement/constants';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { DefectDetail, renderRemark, renderAttachment } from './defectDetail';
import { getNormalStandard } from './index';
import {
  getSingleRecordData,
  renderTableTitle,
  getQcCheckItemData,
  getQcResultCustomText,
  getNormalResult,
  getDefectItems,
  getDefectRanks,
  handleTableSroll,
  getSampleNum,
  getQcAqlValue,
} from './utils';
import styles from './styles.scss';

type Props = {
  data: any,
  taskData: any,
  singleNum: Number,
  itemSingleNums: Array,
  singleQrCode: Array,
  checkCountType: Number,
  checkEntityType: Number,
};

const SingleRecord = (props: Props, context) => {
  const [footerWidth, setFooterWidth] = useState(0);
  // width为0表示不设置中间内容column的宽度
  const [columnWidth, setColumnWidth] = useState(0);
  const [footerScroll, setFooterScroll] = useState(false);
  const [contentScroll, setContentScroll] = useState(false);
  const { data, taskData, checkCountType, checkEntityType, singleNum, singleQrCode } = props;
  const { changeChineseTemplateToLocale } = context;
  const { customDefectText, customNormalText } = getQcResultCustomText(taskData);
  const columnsData = getSingleRecordData(_.cloneDeep(data), singleNum);
  const checkItemRecordData = getQcCheckItemData(_.cloneDeep(data), singleNum);
  const configs = getOrganizationConfigFromLocalStorage();
  const haveQcDefectRank = _.get(configs, `${ORGANIZATION_CONFIG.qcDefectRanked}.configValue`) === 'true';

  const renderFirstColumnItem = (qcCheckItem = {}, index) => {
    const { checkItem, qcAqlInspectionLevelName, checkCountType: checkItemCheckCountType } = qcCheckItem;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tooltip text={checkItem.name} width={120} />
        {/* 第二个参数为是否需要展示额外的”合格标准“字样 */}
        <div>
          {changeChineseToLocaleWithoutIntl('样本数量')}：{getSampleNum(taskData, index)}
        </div>
        <Tooltip text={getNormalStandard(qcCheckItem, true, false, changeChineseTemplateToLocale)} width={120} />
        {checkCountType === AQL_CHECK ||
        (checkCountType === CHECKITEM_CHECK && checkItemCheckCountType === AQL_CHECK) ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Tooltip
              text={`${changeChineseToLocaleWithoutIntl('检验水平')}：${qcAqlInspectionLevelName}`}
              width={120}
            />
            <Tooltip
              text={`${changeChineseToLocaleWithoutIntl('接收质量限')}：${getQcAqlValue(qcCheckItem, taskData)}`}
              width={110}
            />
          </div>
        ) : null}
      </div>
    );
  };

  const getSingleRecordColumns = (isFooter = false) => {
    const configs = getOrganizationConfigFromLocalStorage();
    const haveComment = _.get(configs, `${ORGANIZATION_CONFIG.configQcCheckItemComment}.configValue`) === 'true';
    if (!arrayIsEmpty(columnsData)) {
      return checkItemRecordData.map((n, index) => {
        const defectItems = getDefectItems(n);
        if (isFooter) {
          const width = columnWidth || `calc(100% / ${checkItemRecordData.length})`;
          const defectRanks = Object.values(getDefectRanks(defectItems)).map(
            n => `${n[0].qcDefectRank.code}：${n.length} `,
          );
          return (
            <div className={styles.footerItem} style={{ width }}>
              <div>{defectItems.length}</div>
              {haveQcDefectRank && !arrayIsEmpty(defectItems) ? (
                <div>
                  <Tooltip text={!arrayIsEmpty(defectRanks) && defectRanks.join(' ')} width={'75%'} />
                </div>
              ) : null}
            </div>
          );
        }
        const column = {
          title: renderTableTitle(n, checkEntityType, singleQrCode),
          dataIndex: `single${index}`,
          className: styles.columns,
          key: `single${index}`,
          render: (data, record) => {
            if (!(data && typeof data.category === 'number') && arrayIsEmpty(data.attachmentIds)) return replaceSign;
            const { qcCheckItemConfig } = record;
            const { logic } = qcCheckItemConfig || {};
            data.logic = logic;
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
    return [];
  };

  const getFirstColumn = () => {
    return [
      {
        title: (
          <div style={{ height: 55 }}>
            <div className={styles.tableSlash_first_singleRecord} />
            <span className={styles.firstColumnText_bottom_singleRecord}>
              <Text>质检项</Text>
            </span>
            <span className={styles.firstColumnText_top_singleRecord}>
              <Text>单体编号</Text>
            </span>
          </div>
        ),
        dataIndex: 'qcCheckItemConfig',
        fixed: 'left',
        className: styles.firstColumn,
        key: 'qcCheckItemConfig',
        width: 150,
        render: (qcCheckItemConfig, record, index) => {
          return renderFirstColumnItem(qcCheckItemConfig, index);
        },
      },
    ];
  };

  const getLastColumn = () => ({
    title: (
      <Tooltip
        text={changeChineseToLocaleWithoutIntl('总不合格单体数')}
        width={100}
        containerStyle={{ marginTop: 6 }}
      />
    ),
    fixed: 'right',
    className: styles.lastColumn,
    key: 'total',
    width: 120,
    render: data => {
      const defectSingles = Object.values(data).filter(n => n.category === 0);
      return (
        <div>
          <div>{defectSingles.length}</div>
          {haveQcDefectRank && !arrayIsEmpty(defectSingles) ? (
            <div>
              {Object.values(getDefectRanks(defectSingles)).map(n => {
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
    const singleRecordColumns = getSingleRecordColumns();
    columns.splice(1, 0, ...singleRecordColumns);
    columns.push(lastColumn);
    return columns;
  };

  const renderFooter = () => (
    <div className={haveQcDefectRank ? styles.tableFooter_qcDefectRank : styles.tableFooter}>
      <div className={styles.footerItem} style={{ width: 151 }}>
        {changeChineseToLocaleWithoutIntl('总不合格项数')}
      </div>
      <div className={styles.tableFooterContent} style={{ maxWidth: footerWidth }}>
        {getSingleRecordColumns(true)}
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
    handleTableSroll(actionObject, checkItemRecordData);
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

SingleRecord.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default SingleRecord;
