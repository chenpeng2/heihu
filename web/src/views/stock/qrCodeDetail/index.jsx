import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Timeline, Spin, Tree, message } from 'antd';
import moment, { formatUnix } from 'utils/time';
import { stringEllipsis } from 'utils/string';
import { injectIntl } from 'react-intl';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { queryQrcodeDetail, queryUseRecord } from 'src/services/cooperate/prodTask';
import { getMaterialQcData } from 'services/cooperate/qcTask';
import {
  DetailPageHeader,
  DetailPageItemContainer,
  Row,
  Col,
  Link,
  Icon,
  SimpleTable,
  Button,
  Tooltip,
} from 'components';
import { exportXlsxFile } from 'src/utils/exportFile';
import { getQcCycle } from 'src/views/qualityManagement/qcTask/detail/qcConfig';
import { thousandBitSeparator, safeSub } from 'utils/number';
import { getPathname } from 'src/routes/getRouteParams';

import { white, border, fontSub } from 'src/styles/color/index';
import { replaceSign, materialLotStatus } from 'src/constants';
import {
  CHECKCOUNT_TYPE,
  CHECK_TYPE,
  RECORD_TYPE,
  qcStatus as qcStatusMap,
  QCTASK_STATUS_FINISHED,
} from 'src/views/qualityManagement/constants';
import { getAllMaterials } from 'src/services/systemConfig/materialTrace';
import { arrayIsEmpty } from 'utils/array';
import QcReport from './qcReport';
import styles from './style.scss';

const TimelineItem = Timeline.Item;
const TreeNode = Tree.TreeNode;
export const itemContainerStyle = {
  padding: '0 20px',
  marginTop: 10,
};

type Props = {
  location: {
    pathname: string,
  },
  intl: any,
  match: {},
  match: {
    params: {
      materialId: string,
    },
  },
};

class QrCodeDetail extends Component {
  props: Props;
  state = {
    loading: false,
    showDrawer: false,
    taskId: '',
    data: null,
    holdMaterial: {},
    reportTypeValue: null,
    materialDataSource: [],
    useRecord: null,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    const reportType = config.config_group_leader_report;
    const reportTypeValue = reportType ? reportType.configValue : false;
    this.setState({ reportTypeValue });
  }

  componentDidMount = async () => {
    const {
      match: {
        params: { materialId },
      },
    } = this.props;
    this.setState({ loading: true });
    const {
      data: {
        data: { hits },
      },
    } = await getAllMaterials(materialId);
    const {
      data: { data },
    } = await queryQrcodeDetail({ id: materialId });
    const {
      data: { data: useRecord },
    } = await queryUseRecord(materialId);
    this.setState({ materialDataSource: hits, data, loading: false, useRecord });
  };

  componentDidUpdate() {
    const timeLineItemTail = document.getElementsByClassName('ant-timeline-item-tail');
    const timeLineItemTailArr = Array.from(timeLineItemTail);
    if (timeLineItemTail.length > 0) {
      timeLineItemTailArr.forEach(item => {
        if (item.parentElement.className === 'ant-timeline-item') {
          item.style.display = 'block';
          item.style.borderLeft = `1px solid ${border}`;
        }
      });
    }
  }

  onExpand = () => {
    this.setState({ loading: false });
  };

  getSubTitle = material => {
    if (!material) {
      return '';
    }
    const { storage } = material;
    return (storage && storage.name) || replaceSign;
  };

  getLink = (info, onClick, style) => (
    <span className={styles.link} style={style} onClick={onClick}>
      {info}
    </span>
  );

  // 显示物料信息
  showMaterialInfo = material => {
    if (!material) {
      return null;
    }
    const {
      material: { code, name, unit, desc },
      amount,
    } = material;
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('物料信息');

    return (
      <div style={{ ...itemContainerStyle }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('物料编码')}</Col>
              <Col type={'content'}>{code || replaceSign}</Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('物料名称')}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                {name || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{changeChineseToLocale('规格描述')}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                {desc || replaceSign}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('数量')}</Col>
              <Col type={'content'}>{`${amount} ${unit || ''}`}</Col>
            </Row>
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示二维码信息
  renderQRCodeInfo = material => {
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('二维码信息');
    if (!material) {
      return null;
    }
    const { status, qcStatus, storage, mfgBatches, productBatch, validityPeriod, createdAt, inboundBatch } = material;

    const renderInfos = [
      { title: changeChineseToLocale('当前状态'), value: changeChineseToLocale(materialLotStatus[status]) },
      { title: changeChineseToLocale('质量状态'), value: qcStatusMap[qcStatus] },
      { title: changeChineseToLocale('当前仓位'), value: storage && storage.name },
      {
        title: changeChineseToLocale('供应商批次'),
        value: arrayIsEmpty(mfgBatches) ? replaceSign : mfgBatches.map(n => n.mfgBatchNo).join(','),
      },
      inboundBatch ? { title: changeChineseToLocale('入厂批次'), value: inboundBatch } : undefined,
      productBatch ? { title: changeChineseToLocale('生产批次'), value: productBatch } : undefined,
      {
        title: changeChineseToLocale('有效期'),
        value: validityPeriod ? formatUnix(validityPeriod, 'YYYY/MM/DD') : replaceSign,
      },
      { title: changeChineseToLocale('创建日期'), value: createdAt ? formatUnix(createdAt) : replaceSign },
    ].filter(n => n);
    return (
      <div style={{ ...itemContainerStyle }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div>
            {renderInfos.map(({ title, value }) => (
              <Row style={{ marginRight: 40 }} key={title}>
                <Col type="title">{title}</Col>
                <Col type="content">{value}</Col>
              </Row>
            ))}
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示生产信息
  showProductOrderInfo = project => {
    const { processRouting, mbomVersion, projectCode, product, purchaseOrderCode } = project;
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('生产信息');
    const { match } = this.props;
    const pathname = getPathname(match);
    const page = pathname.split('/')[2];
    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('项目号')}</Col>
              <Col type={'content'}>
                <Link.NewTagLink href={`/cooperate/projects/${projectCode}/detail`} className={styles.content}>
                  {projectCode || replaceSign}
                </Link.NewTagLink>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('项目成品')}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/stock/${page}/${product.code}/detail`);
                  }}
                >
                  {product.code || replaceSign}
                  <br />
                  {product.name || replaceSign}
                </Link>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('工艺路线')}</Col>
              <Col type={'content'}>
                <div>{(processRouting && processRouting.name) || replaceSign}</div>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('mBOM')}</Col>
              <Col type={'content'}>
                <div>{mbomVersion || replaceSign}</div>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('订单号')}</Col>
              <Col type={'content'}>{purchaseOrderCode || replaceSign}</Col>
            </Row>
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示供应商批次号
  showMfgBatchNo = material => {
    const { changeChineseToLocale } = this.context;
    if (material && material.mfgBatches && material.mfgBatches.length) {
      const itemHeaderTitle = changeChineseToLocale('供应商批次');
      const { mfgBatches } = material;
      const formatBatches = [];
      mfgBatches.forEach(({ materialCode, mfgBatchNo }) => {
        const findIndex = formatBatches.findIndex(node => node.materialCode === materialCode);
        if (findIndex === -1) {
          formatBatches.push({ materialCode, mfgBatchNo: [mfgBatchNo] });
        } else {
          formatBatches[findIndex] = { materialCode, mfgBatchNo: [...formatBatches[findIndex].mfgBatchNo, mfgBatchNo] };
        }
      });
      return (
        <div style={{ ...itemContainerStyle, marginTop: 10 }}>
          <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
            <div>
              {formatBatches.map(n => {
                return (
                  <Row key={n.materialCode}>
                    <Col style={{ wordBreak: 'break-word' }} type={'title'}>
                      {n.materialCode || replaceSign}
                    </Col>
                    <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                      {n.mfgBatchNo.join(',') || replaceSign}
                    </Col>
                  </Row>
                );
              })}
            </div>
          </DetailPageItemContainer>
        </div>
      );
    }
    return null;
  };

  // 显示生产履历
  showProducewRecord = histories => {
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('生产履历');
    return (
      <div className={styles.gcTimelineContainer} style={{ ...itemContainerStyle }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle} contentStyle={{ overflowX: 'scroll' }}>
          {this.renderTimeLine(histories, true)}
        </DetailPageItemContainer>
      </div>
    );
  };

  // 根据不同质检类型生产title
  getDiffCheckTypeTitle = (type, suffix) => {
    switch (type) {
      case 0:
        return `入厂${suffix}`;
      case 1:
        return `出厂${suffix}`;
      case 2:
        return `生产${suffix}`;
      case 3:
        return `生产${suffix}`;
      default:
        break;
    }
  };

  getQcTime = (start, end) => {
    if (!start && !end) {
      return replaceSign;
    }
    const startTime = start ? formatUnix(start) : replaceSign;
    const endTime = end ? formatUnix(end) : replaceSign;
    return `${startTime} ~ ${endTime}`;
  };

  getQualified = rate => {
    if (rate <= 0) return '100%';
    if (rate === 100) return '0%';
    return rate ? `${(100 - rate).toFixed(2)}%` : replaceSign;
  };

  getOperators = ({ produceOperators, ioOperators }) => {
    const _produceOperators = produceOperators && produceOperators.map(({ name }) => name);
    const _ioOperators = ioOperators && ioOperators.map(({ name }) => name);

    return `${_.join(_produceOperators, '，') || replaceSign}/${_.join(_ioOperators, '，') || replaceSign}`;
  };

  getLogic = config => {
    const { logic, min, max, base, unitName } = config;
    const name = unitName || replaceSign;

    switch (logic) {
      case 0:
        return `${min} ~ ${max} ${name}`;
      case 1:
        return `< ${base} ${name}`;
      case 2:
        return `> ${base} ${name}`;
      case 3:
        return `= ${base} ${name}`;
      case 4:
        return `≤ ${base} ${name}`;
      case 5:
        return `≥ ${base} ${name}`;
      case 6:
        return '人工判断';
      case 7:
        return '手工输入';
      case 8: {
        const minus = safeSub(min, base);
        const add = safeSub(max, base);
        return `${base} +${add} ${minus} ${name}`;
      }
      default:
        return '人工判断';
    }
  };

  getCheckValue = ({ config, category, desc, value, customLanguageCollection }) => {
    const { logic } = config;
    const { qcCheckItemDefect, qcCheckItemNormal } = customLanguageCollection;

    switch (logic) {
      case 0:
        return typeof value === 'number' ? value : replaceSign;
      case 1:
        return typeof value === 'number' ? value : replaceSign;
      case 2:
        return typeof value === 'number' ? value : replaceSign;
      case 3:
        return typeof value === 'number' ? value : replaceSign;
      case 4:
        return typeof value === 'number' ? value : replaceSign;
      case 5:
        return typeof value === 'number' ? value : replaceSign;
      case 8:
        return typeof value === 'number' ? value : replaceSign;
      case 6:
        if (category === 0) return qcCheckItemDefect;
        if (category === 1) return qcCheckItemNormal;
        return replaceSign;
      case 7:
        return desc || replaceSign;
      default:
        if (category === 0) return qcCheckItemDefect;
        if (category === 1) return qcCheckItemNormal;
        return replaceSign;
    }
  };

  getConfigName = ({ groupName, checkItemName }) => `${groupName || replaceSign}_${checkItemName || replaceSign}`;

  getQcReportRows = ({ recordType, itemConfigs = [], reports = [], checkCount = 0, customLanguageCollection }) => {
    const rows = [];
    const formatValues = [];

    if (recordType === 0) {
      // 单体记录
      reports.forEach(report => {
        const config = _.find(itemConfigs, o => o.id === _.get(report, 'qcCheckItemConfig.id')) || {};

        report.qcReportValues.forEach(({ value, seq, desc, category }) => {
          formatValues.push({
            value: this.getCheckValue({ config, value, seq, desc, category, customLanguageCollection }),
            seq,
            configName: this.getConfigName(config),
            standard: this.getLogic(config),
          });
        });
      });

      const sortedValues = _.sortBy(formatValues, 'seq');
      const groupedValues = _.groupBy(sortedValues, 'seq');
      const filterValues = Object.keys(groupedValues).map(seq => groupedValues[seq].map(each => _.omit(each, 'seq')));

      filterValues.forEach((values, i) => {
        rows.push([i + 1]);
        filterValues[i].forEach(x => rows.push([x.configName, x.standard, x.value]));
      });
    }

    if (recordType === 1) {
      // 质检项记录
      itemConfigs.forEach(config => {
        const report = _.find(reports, o => _.get(o, 'qcCheckItemConfig.id') === _.get(config, 'id')) || {};
        for (let step = 0; step < checkCount; step += 1) {
          const reportValues = _.get(report, `qcReportValues[${step}]`);
          const params = {
            config,
            customLanguageCollection,
            ...reportValues,
          };
          formatValues.push({
            value: this.getCheckValue(params),
            seq: _.get(params, 'seq'),
            configName: this.getConfigName(config),
            standard: this.getLogic(config),
          });
        }
      });
      const sortedValues = _.sortBy(formatValues, 'seq');
      const groupedValues = _.groupBy(sortedValues, 'configName');

      Object.keys(groupedValues).forEach(configName => {
        // 因为同一个质检项的合格标准是相同的，故standards[x]是重复的合格标准的集合
        const standards = groupedValues[configName] && groupedValues[configName].map(({ standard }) => standard);
        rows.push([configName, standards && standards[0]]);
        groupedValues[configName].forEach((x, i) => rows.push([i + 1, x.value]));
      });
    }

    if (recordType === 2) {
      // 仅记录次品
      itemConfigs.forEach(config => {
        const report = _.find(reports, o => _.get(o, 'qcCheckItemConfig.id') === _.get(config, 'id')) || {};

        formatValues.push({
          value: _.get(report, 'defect'),
          configName: this.getConfigName(config),
          logic: this.getLogic(config),
        });
      });
      formatValues.forEach(x => {
        rows.push([x.configName, x.logic, x.value]);
      });
    }

    return rows;
  };

  getCommonRows = data => {
    const { intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    if (data && data.length > 0) {
      const headers = [
        '项目',
        '订单',
        '物料类型',
        '工序/工位',
        '生产批次/入厂批次',
        '生产执行人/入厂执行人',
        '质检任务号',
        '质检类型',
        '质检执行人',
        '质检时间',
        '质检方式',
        '质检周期',
        '记录方式',
        '抽样数量',
        '抽样合格率',
        '总体数量',
        '总体合格率',
      ];
      const format = data.map(
        ({
          projectCode,
          purchaseOrderCode,
          materialCode,
          materialName,
          processCode,
          workstationName,
          ioOperators,
          produceOperators,
          inboundBatch,
          taskCode,
          code,
          checkType,
          operatorName,
          startTime,
          endTime,
          qcConfig,
          materialUnitName,
          recordType,
          checkCount, // 抽检数量
          sampleDefectRate, // 抽样不合格率
          qcTotal, // 总数
          checkDefectRate, // 总体不合格率
        }) => [
          projectCode || replaceSign,
          purchaseOrderCode || replaceSign,
          `${materialCode || replaceSign}/${materialName || replaceSign}`,
          `${processCode || replaceSign}/${workstationName || replaceSign}`,
          `${taskCode || replaceSign}/${inboundBatch || replaceSign}`,
          this.getOperators({ produceOperators, ioOperators }),
          code || replaceSign,
          CHECK_TYPE[checkType] || replaceSign,
          operatorName || replaceSign,
          this.getQcTime(startTime, endTime),
          CHECKCOUNT_TYPE[_.get(qcConfig, 'checkCountType')],
          getQcCycle(
            { qcConfig, material: { unitName: materialUnitName }, checkType },
            changeChineseTemplateToLocale,
            intl,
          ),
          RECORD_TYPE[recordType].display || replaceSign,
          `${thousandBitSeparator(checkCount)}${materialUnitName || ''}`,
          this.getQualified(sampleDefectRate),
          `${thousandBitSeparator(qcTotal)}${materialUnitName || ''}`,
          this.getQualified(checkDefectRate),
        ],
      );

      const commonRows = [];
      data.forEach((x, index) => {
        const rows = [];
        headers.forEach((h, i) => {
          // recordType === 3 时不显示「质检周期」
          if (x && x.checkType !== 3 && i === 11) return;
          rows.push([h, format[index][i]]);
        });
        if (x && x.recordType === 0) {
          rows.push(['质检项', '合格标准', '质检结果']);
        }
        if (x && x.recordType === 1) {
          rows.push(['质检项', '合格标准/质检结果']);
        }
        if (x && x.recordType === 2) {
          rows.push(['质检项', '合格标准', '不合格数量']);
        }
        commonRows.push(rows);
      });

      return commonRows;
    }

    return [];
  };

  exportMaterialQcData = async () => {
    const {
      match: {
        params: { materialId },
      },
    } = this.props;
    const {
      data: { data },
    } = await getMaterialQcData(materialId);
    const filteredData = data && data.filter(({ status }) => status === QCTASK_STATUS_FINISHED);
    if (filteredData && filteredData.length > 0) {
      const exportData = filteredData.map((x, i) =>
        this.getCommonRows(filteredData)[i].concat(this.getQcReportRows(x)),
      );

      const sheetNames = filteredData.map(({ code }) => code);
      exportXlsxFile(exportData, '质检数据', sheetNames);
    } else {
      message.error('没有可导出的质检数据');
    }
  };

  renderMaterialTable = () => {
    const { materialDataSource } = this.state;
    const { changeChineseToLocale } = this.context;
    const columns = [
      {
        title: '二维码',
        dataIndex: 'qrcode_display',
        render: (name, record) => {
          if (record.id !== null || record.id !== undefined) {
            return (
              <Link.NewTagLink href={`/stock/material-trace/${record.id}/qrCodeDetail`}>
                <span className={styles.batchSmallMargin}>{name}</span>
              </Link.NewTagLink>
            );
          }
          return replaceSign;
        },
      },
      {
        title: '物料编码/物料名称',
        dataIndex: 'material_code',
        render: (material_code, { material_name }) => `${material_code}/${material_name}`,
      },
      { title: '规格描述', dataIndex: 'material_desc', render: data => data || replaceSign },
      {
        title: '项目',
        dataIndex: 'project_code',
        render: code => {
          if (code !== null || code !== undefined) {
            return (
              <Link.NewTagLink href={`/cooperate/projects/${code}/detail`}>
                <span className={styles.batchSmallMargin}>{code}</span>
              </Link.NewTagLink>
            );
          }
          return replaceSign;
        },
      },
      {
        title: '工序',
        dataIndex: 'processCode',
        render: (processCode, { processSeq = replaceSign, processName = replaceSign }) =>
          `${processName}/${processCode}/${processSeq}`,
      },
      {
        title: '任务号',
        dataIndex: 'holdTaskCode',
        render: (code, record) => {
          if (
            (code !== null || code !== undefined) &&
            (record.hold_task_id !== null || record.hold_task_id !== undefined)
          ) {
            return (
              <Link.NewTagLink href={`/cooperate/prodTasks/detail/${record.hold_task_id}`}>
                <span className={styles.batchSmallMargin}>{code}</span>
              </Link.NewTagLink>
            );
          }
          return replaceSign;
        },
      },
      {
        title: '生产批次',
        dataIndex: 'mfg_batches',
        render: batches =>
          Array.isArray(batches) && batches.length
            ? batches.map(({ mfgBatchNo }) => mfgBatchNo).join('、')
            : replaceSign,
      },
    ].map(node => ({
      ...node,
      key: node.title,
      width: 150,
      node: node.render ? node.render : text => text || replaceSign,
    }));
    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer
          itemHeaderTitle={changeChineseToLocale('物料投向')}
          contentStyle={{ paddingBottom: 60, width: '100%' }}
        >
          <SimpleTable
            columns={columns}
            style={{ width: '100%' }}
            dataSource={materialDataSource}
            noDefaultPage
            rowKey={record => record.recordId}
          />
        </DetailPageItemContainer>
      </div>
    );
  };

  renderProduceProductRecord() {
    const { useRecord = [] } = this.state;
    const { changeChineseToLocale } = this.context;
    const columns = [
      {
        title: '投产项目',
        key: 'project',
        dataIndex: 'projectCode',
        render: projectCode => {
          if (projectCode !== null || projectCode !== undefined) {
            return <Link.NewTagLink href={`/cooperate/projects/${projectCode}/detail`}>{projectCode}</Link.NewTagLink>;
          }
          return replaceSign;
        },
      },
      {
        title: '投产工序',
        key: 'process',
        dataIndex: 'processName',
        render: (processName, { processCode }) => <Tooltip text={`${processCode}/${processName}`} length={12} />,
      },
      { title: '质量状态', key: 'status', dataIndex: 'qcStatus', render: status => qcStatusMap[status] },
      { title: '投产工位', key: 'workstation', dataIndex: 'workstation.name' },
      {
        title: '投产数量',
        key: 'amount',
        dataIndex: 'amountUsed',
        render: (amount, { unit }) => `${amount} ${unit || ''}`,
      },
      {
        title: '投产余量',
        key: 'restAmount',
        dataIndex: 'amountAfter',
        render: (amount, { unit }) => `${amount} ${unit || ''}`,
      },
      { title: '投产人', key: 'person', dataIndex: 'operatorName' },
      { title: '投产时间', key: 'time', dataIndex: 'createdAt', render: time => formatUnix(time) },
      {
        title: '操作',
        key: 'operation',
        dataIndex: 'recordId',
        render: recordId => (
          <Link to={`${location.pathname}/useRecordDetail/${recordId}?useQrCode=true&reportType=true&recordType=use`}>
            {changeChineseToLocale('查看详情')}
          </Link>
        ),
      },
    ];
    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer
          itemHeaderTitle={changeChineseToLocale('投产记录')}
          contentStyle={{ paddingBottom: 60, width: '100%' }}
        >
          <SimpleTable
            columns={columns}
            dataSource={useRecord}
            pagination={false}
            style={{ width: '100%' }}
            scroll={{ y: 400, x: true }}
          />
        </DetailPageItemContainer>
      </div>
    );
  }

  renderTimeLine = (histories, isParent) => {
    const { router } = this.context;
    const { reportTypeValue } = this.state;
    const { changeChineseToLocale } = this.context;
    const { match } = this.props;
    const pathname = getPathname(match);
    const page = pathname.split('/')[2];
    const _histories = histories && histories.sort((a, b) => b.timestamp - a.timestamp);

    return (
      <Timeline>
        {_histories &&
          _histories.map((item, index) => {
            const {
              unit,
              action,
              amountAfter,
              projectCode,
              timestamp,
              materialName,
              materialCode,
              processSeq,
              processName,
              workStation,
              operatorName,
              taskCode,
              taskId,
              rawMaterialLots,
              machineData,
              recordId,
            } = item;
            let actionDisplay = '';
            let recordType = '';
            switch (action) {
              case 'use':
                actionDisplay = changeChineseToLocale('投产');
                recordType = 'use';
                break;
              case 'hold':
                actionDisplay = changeChineseToLocale('产出');
                recordType = 'hold';
                break;
              case 'reproduceUse':
                actionDisplay = changeChineseToLocale('返工投产');
                break;
              case 'reproduceHold':
                actionDisplay = changeChineseToLocale('返工产出');
                break;
              case 'scanUnqualifiedHoldStockIn':
              case 'scanUnqualifiedHoldMark':
                actionDisplay = changeChineseToLocale('产出不合格');
                recordType = 'unqualifiedHold';
                break;
              case 'scanUnqualifiedRawMaterialStockIn':
              case 'scanUnqualifiedRawMaterialMark':
                actionDisplay = changeChineseToLocale('投产不合格');
                recordType = 'unqualifiedUse';
                break;
              default:
                actionDisplay = changeChineseToLocale('其他');
            }
            const rawMaterialLotsRender = [];
            (rawMaterialLots || []).forEach(node => {
              const {
                material: {
                  material: { name, code },
                },
              } = node;
              const findRawMaterialLotIndex = rawMaterialLotsRender.findIndex(
                ({ materialCode }) => materialCode === code,
              );
              if (findRawMaterialLotIndex !== -1) {
                rawMaterialLotsRender[findRawMaterialLotIndex].rawMaterialLots.push(node);
              } else {
                rawMaterialLotsRender.push({
                  materialCode: code,
                  materialName: name,
                  rawMaterialLots: [node],
                });
              }
            });
            return (
              <TimelineItem
                key={index}
                dot={
                  <div className={index === 0 && isParent ? styles.firstTimelineDot : styles.timelineDot}>
                    {actionDisplay}
                  </div>
                }
              >
                <div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: 60 }}>{moment(Number(timestamp)).format('YYYY/MM/DD HH:mm')}</div>
                    <div style={{ marginRight: 20 }}>{(workStation && workStation.name) || replaceSign}</div>
                    <div style={{ marginRight: 60 }}>{operatorName}</div>
                    <div style={{ marginRight: 50 }}>{`${amountAfter || replaceSign}${unit || ''}`}</div>
                    {action === 'hold' ? (
                      <Link
                        style={{ display: 'flex', alignItems: 'center' }}
                        onClick={() => {
                          router.history.push(`/cooperate/prodTasks/detail/${taskId}/holdRecordDetail/
                            ${recordId}?useQrCode=${true}&reportType=${reportTypeValue}&recordType=${recordType}`);
                        }}
                      >
                        {changeChineseToLocale(' 详情')}
                        <Icon style={{ marginLeft: 5 }} type="right" />
                      </Link>
                    ) : null}
                  </div>
                  <div style={{ marginTop: 15, color: fontSub }}>
                    {`${actionDisplay}${changeChineseToLocale('物料')}: ${materialCode ||
                      replaceSign} - ${materialName || replaceSign}`}
                  </div>
                  <div style={{ marginTop: 5, color: fontSub }}>
                    {projectCode
                      ? this.getLink(projectCode, () => {
                          this.context.router.history.push(`/cooperate/projects/${projectCode}/detail`);
                        })
                      : replaceSign}
                    <span stlye={{ color: fontSub }}>{` | ${processName || replaceSign} | `}</span>
                    <span style={{ color: fontSub }}>{`${processSeq || replaceSign} | `}</span>
                    {taskCode
                      ? this.getLink(taskCode, () => {
                          this.context.router.history.push(`/cooperate/prodTasks/detail/${taskId}`);
                        })
                      : replaceSign}
                  </div>
                  <div style={{ marginTop: 5, color: fontSub }}>
                    {machineData
                      ? machineData.map((item, index) => {
                          const last = ` ${item.k || replaceSign}: ${item.v || replaceSign}${item.u || replaceSign}`;
                          return index !== machineData.length - 1
                            ? ` ${item.k || replaceSign}: ${item.v || replaceSign}${item.u || replaceSign} |`
                            : last;
                        })
                      : null}
                  </div>
                  {rawMaterialLotsRender
                    ? rawMaterialLotsRender.map((node, index) => {
                        const { materialName, materialCode, rawMaterialLots } = node;
                        return (
                          <div key={materialCode}>
                            <p style={{ color: '#000', marginTop: 10 }}>
                              {materialCode}/{materialName}
                            </p>
                            <div>
                              {rawMaterialLots.map((item, index) => {
                                const {
                                  material: { code, id, inboundBatch, productBatch, mfgBatches },
                                } = item;
                                const mfgBatchesStr =
                                  Array.isArray(mfgBatches) && mfgBatches.map(item => item.mfgBatchNo).join('、');
                                const showMfgBatches = mfgBatchesStr && mfgBatchesStr.length > 0;

                                return item.project.history.length ? (
                                  <Tree key={code} onExpand={this.onExpand} selectable={false}>
                                    <TreeNode
                                      title={
                                        <div>
                                          <div style={{ display: 'flex' }}>
                                            <div style={{ marginRight: item.material.material.code ? 5 : 0 }}>
                                              <span style={{ color: fontSub }}>{index + 1})&nbsp;</span>
                                              <Link.NewTagLink href={`/stock/material-trace/${id}/qrCodeDetail`}>
                                                <span className={styles.batchSmallMargin}>{code}</span>
                                              </Link.NewTagLink>
                                              {productBatch && (
                                                <span className={styles.batch}>
                                                  {changeChineseToLocale('生产批次')}：{productBatch}
                                                </span>
                                              )}
                                              {inboundBatch && (
                                                <span className={styles.batch}>
                                                  {changeChineseToLocale('入厂批次')}：{inboundBatch}
                                                </span>
                                              )}
                                              {showMfgBatches && (
                                                <span className={styles.batch}>
                                                  {changeChineseToLocale('供应商批次')}：
                                                  {stringEllipsis(mfgBatchesStr, 33)}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      }
                                      key={item.material.id}
                                      dataRef={item.project}
                                    >
                                      {<TreeNode title={this.renderTimeLine(item.project.history)} />}
                                    </TreeNode>
                                  </Tree>
                                ) : (
                                  <div style={{ display: 'flex', marginTop: 4 }}>
                                    <div style={{ marginRight: 5 }}>
                                      <span style={{ color: fontSub }}>{index + 1})&nbsp;</span>
                                      <Link.NewTagLink href={`/stock/material-trace/${id}/qrCodeDetail`}>
                                        <span className={styles.batchSmallMargin}>{code}</span>
                                      </Link.NewTagLink>
                                      {productBatch && (
                                        <span className={styles.batch}>
                                          {changeChineseToLocale('生产批次')}：{productBatch}
                                        </span>
                                      )}
                                      {inboundBatch && (
                                        <span className={styles.batch}>
                                          {changeChineseToLocale('入厂批次')}：{inboundBatch}
                                        </span>
                                      )}
                                      {showMfgBatches && (
                                        <span className={styles.batch}>
                                          {changeChineseToLocale('供应商批次')}：{stringEllipsis(mfgBatchesStr, 33)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    : null}
                </div>
              </TimelineItem>
            );
          })}
      </Timeline>
    );
  };

  render() {
    const { data, loading } = this.state;
    if (!data) {
      return null;
    }
    const { material, project } = data;
    const { id: materialLotId } = material || {};
    const { history } = project || {};

    return (
      <Spin spinning={loading}>
        <div
          style={{
            backgroundColor: white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginRight: 20,
          }}
        >
          <DetailPageHeader title={material.code} location={this.getSubTitle(material)} />
          <Button icon="upload" onClick={() => this.exportMaterialQcData()}>
            导出质检数据
          </Button>
        </div>
        <div style={{ marginBottom: 30 }}>
          {this.showMaterialInfo(material)}
          {this.renderQRCodeInfo(material)}
          {project && project.product.name && project.product.code ? this.showProductOrderInfo(project) : null}
          {this.showMfgBatchNo(material)}
          <QcReport materialLotId={materialLotId} history={this.context.router.history} />
          {history ? this.showProducewRecord(history) : null}
          {this.renderProduceProductRecord()}
          {this.renderMaterialTable()}
        </div>
      </Spin>
    );
  }
}

QrCodeDetail.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
  changeChineseTemplateToLocale: PropTypes.func,
};

export default withRouter(injectIntl(QrCodeDetail));
