import React, { Component } from 'react';
import _ from 'lodash';
import { Table } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ACTION_TYPE_IN_STORAGE } from 'src/views/cooperate/prodTask/constant';
import { formatDateHour } from 'src/utils/time';
import { arrayIsEmpty } from 'src/utils/array';
import { DEFAULT_PAGE_SIZE, replaceSign, TASK_CATEGORY_INJECT_MOLD } from 'src/constants';
import {
  queryProdHoldRecords,
  queryUnqualifiedProdHoldRecords,
  queryProdUseRecords,
  queryUnqualifiedRawMaterialRecords,
  queryManualUnqualifiedRawMaterialRecords,
  queryManualUnqualifiedProdHoldRecords,
  queryRetreatUseRecords,
  queryByProductRecords,
  queryScanUnqualifiedByProductMaterialRecords,
} from 'src/services/cooperate/prodTask';
import { queryInjectMoldTaskHoldRecords, queryInjectMoldTaskUseRecords } from 'services/cooperate/injectMoldTask';
import { blacklakeGreen, middleGrey, primary } from 'src/styles/color/index';
import { Attachment, Link, openModal } from 'components';
import { thousandBitSeparator } from 'utils/number';
import styles from './styles.scss';

type Props = {
  taskId: string,
  useQrCode: string,
  reportType: boolean,
  recordType: string,
  material: {
    materialName: string,
    materialCode: string,
  },
  isClear: boolean,
};

const AttachmentImageView = Attachment.ImageView;

class UseAndHoldRecord extends Component {
  props: Props;

  state = {
    data: null,
    loading: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: DEFAULT_PAGE_SIZE,
    },
  };

  componentWillReceiveProps(nextProps) {
    const { material, taskId, recordType, isClear } = nextProps;
    if (isClear) {
      this.setState({ data: null });
    }
    this.fetchData({ taskId, material, recordType });
  }

  get unit() {
    return _.get(this.props, 'material.unit', '');
  }

  fetchData = async (params, pagination) => {
    const { useQrCode, taskCategory } = this.props;
    const variables = {
      taskId: params.taskId,
      page: (pagination && pagination.current) || 1,
      size: (pagination && pagination.pageSize) || 10,
      materialCode: params.material.materialCode,
    };
    let queryProdRecords = null;
    let path = null;

    switch (params.recordType) {
      case 'use':
        queryProdRecords =
          taskCategory === TASK_CATEGORY_INJECT_MOLD ? queryInjectMoldTaskUseRecords : queryProdUseRecords;
        path = 'data.data';
        break;
      case 'hold':
        queryProdRecords =
          taskCategory === TASK_CATEGORY_INJECT_MOLD ? queryInjectMoldTaskHoldRecords : queryProdHoldRecords;
        path = 'data.data';
        break;
      case 'retreat':
        queryProdRecords = queryRetreatUseRecords;
        path = 'data.data';
        break;
      case 'unqualifiedUse':
        queryProdRecords = useQrCode ? queryUnqualifiedRawMaterialRecords : queryManualUnqualifiedRawMaterialRecords;
        path = 'data';
        break;
      case 'unqualifiedHold':
        queryProdRecords = useQrCode ? queryUnqualifiedProdHoldRecords : queryManualUnqualifiedProdHoldRecords;
        path = 'data';
        break;
      case 'byProductUnqualifiedOutput':
        queryProdRecords = queryScanUnqualifiedByProductMaterialRecords;
        path = 'data';
        break;
      case 'byProductOutput':
        queryProdRecords = queryByProductRecords;
        path = 'data';
        break;
      default:
        queryProdRecords = null;
    }
    if (queryProdRecords) {
      this.setState({ loading: true });
      try {
        const res = await queryProdRecords(params.taskId, variables);
        const data = _.get(res, path, []);

        this.setState({
          data,
          pagination: {
            total: res.data.total,
            current: (pagination && pagination.current) || 1,
            pageSize: (pagination && pagination.pageSize) || 10,
          },
        });
      } catch (err) {
        console.log(err);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  formatConfigs = configs => {
    if (!arrayIsEmpty(configs)) {
      return configs.map(config => ({
        ...config,
        dataIndex: config.key,
      }));
    }
  };

  getTableColumns = () => {
    const { useQrCode, reportType, recordType } = this.props;
    const { router, changeChineseToLocale } = this.context;
    const configs = {
      // 投产不合格记录
      unqualifiedUse: [
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
          key: 'code',
          width: 110,
          render: (code, record) => (
            <div className={styles.titleSmallMargin}>
              {(record.materialLot && record.materialLot.qrcodeDisplay) || replaceSign}
            </div>
          ),
        },
        useQrCode && {
          title: changeChineseToLocale('操作类型'),
          width: 85,
          key: 'type',
          render: type => (
            <div>{type === ACTION_TYPE_IN_STORAGE ? changeChineseToLocale('入库') : changeChineseToLocale('标记')}</div>
          ),
        },
        {
          title: changeChineseToLocale('报工人员'),
          width: 100,
          key: 'operator',
          render: operator => <div>{(operator && operator.name) || replaceSign}</div>,
        },

        {
          title: changeChineseToLocale('报工时间'),
          key: 'createdAt',
          width: 100,
          render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('不合格数量'),
          key: 'amountDiff',
          width: 100,
          render: (_, record) => {
            const amount = useQrCode ? record.amountDiff : record.amount;
            return (
              <div>
                {thousandBitSeparator(amount) || replaceSign}
                {this.unit}
              </div>
            );
          },
        },
        {
          title: changeChineseToLocale('图片'),
          key: 'attachments',
          width: 100,
          render: attachments => {
            if (!arrayIsEmpty(attachments)) {
              return (
                <div
                  onClick={() => {
                    openModal({
                      title: '附件',
                      footer: null,
                      children: (
                        <AttachmentImageView
                          attachment={{
                            files: attachments.map(file => {
                              return {
                                ...file,
                                originalFileName: file.original_filename,
                                originalExtension: file.original_extension,
                              };
                            }),
                          }}
                        />
                      ),
                    });
                  }}
                >
                  <Link icon="paper-clip" />
                  <span style={{ color: primary, cursor: 'pointer' }}>{attachments.length}张</span>
                </div>
              );
            }
            return replaceSign;
          },
        },
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('操作')}</span>,
          key: 'action',
          fixed: 'right',
          render: (_, record) => (
            <div
              className={styles.titleSmallMargin}
              style={{ color: blacklakeGreen, cursor: 'pointer' }}
              onClick={() => {
                router.history.push(
                  `/cooperate/prodTasks/detail/${this.props.taskId}/${recordType}RecordDetail/${
                    record.id
                  }?useQrCode=${useQrCode}&reportType=${reportType}&recordType=${recordType}`,
                );
              }}
            >
              {changeChineseToLocale('查看')}
            </div>
          ),
        },
      ],
      // 投产记录
      use: [
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
          key: 'code',
          width: 110,
          render: (code, record) => <div className={styles.titleSmallMargin}>{code || replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('报工人员'),
          key: 'operator',
          render: operator => <div>{(operator && operator.name) || replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('报工时间'),
          key: 'createdAt',
          render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('投产数量'),
          key: 'amount',
          render: amount => (
            <div>
              {thousandBitSeparator(amount) || replaceSign}
              {this.unit}
            </div>
          ),
        },
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('操作')}</span>,
          key: 'action',
          width: 60,
          fixed: 'right',
          render: (_, record) => (
            <div
              className={styles.titleSmallMargin}
              style={{ color: blacklakeGreen, cursor: 'pointer' }}
              onClick={() => {
                router.history.push(
                  `/cooperate/prodTasks/detail/${this.props.taskId}/${recordType}RecordDetail/${
                    record.id
                  }?useQrCode=${useQrCode}&reportType=${reportType}&recordType=${recordType}`,
                );
              }}
            >
              {changeChineseToLocale('查看')}
            </div>
          ),
        },
      ],
      // 投产回撤记录
      retreat: [
        {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
          key: 'qrcode',
          width: 110,
          render: qrcode => <div className={styles.titleSmallMargin}>{qrcode || replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('报工人员'),
          width: 100,
          key: 'operatorName',
          render: operatorName => <div>{operatorName || replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('报工时间'),
          key: 'createdAt',
          width: 100,
          render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('回撤数量'),
          key: 'amountRetreated',
          width: 100,
          render: amountRetreated => (
            <div>
              {thousandBitSeparator(amountRetreated) || replaceSign}
              {this.unit}
            </div>
          ),
        },
        {
          title: changeChineseToLocale('图片'),
          key: 'attachments',
          width: 100,
          render: attachments => {
            if (!arrayIsEmpty(attachments)) {
              return (
                <div
                  onClick={() => {
                    openModal({
                      title: '附件',
                      footer: null,
                      children: (
                        <AttachmentImageView
                          attachment={{
                            files: attachments.map(file => {
                              return {
                                ...file,
                                originalFileName: file.original_filename,
                                originalExtension: file.original_extension,
                              };
                            }),
                          }}
                        />
                      ),
                    });
                  }}
                >
                  <Link icon="paper-clip" />
                  <span style={{ color: primary, cursor: 'pointer' }}>{attachments.length}张</span>
                </div>
              );
            }
            return replaceSign;
          },
        },
      ],
      // 产出不合格记录
      unqualifiedHold: [
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
          key: 'code',
          width: 110,
          render: (code, record) => (
            <div className={styles.titleSmallMargin}>{record.materialLot && record.materialLot.qrcodeDisplay}</div>
          ),
        },
        useQrCode && {
          title: changeChineseToLocale('操作类型'),
          width: 85,
          key: 'type',
          render: type => (
            <div>{type === ACTION_TYPE_IN_STORAGE ? changeChineseToLocale('入库') : changeChineseToLocale('标记')}</div>
          ),
        },
        {
          title: changeChineseToLocale('生产人员'),
          width: 100,
          key: 'producers',
          render: producers => (
            <div>{(producers && producers.length && producers.map(n => n.name).join(',')) || replaceSign}</div>
          ),
        },
        {
          title: changeChineseToLocale('报工时间'),
          key: 'createdAt',
          width: 100,
          render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('不合格数量'),
          key: 'amountDiff',
          width: 100,
          render: (_, record) => {
            const amount = useQrCode ? record.amountDiff : record.amount;
            return (
              <div>
                {thousandBitSeparator(amount) || replaceSign}
                {this.unit}
              </div>
            );
          },
        },
        {
          title: changeChineseToLocale('图片'),
          key: 'attachments',
          width: 100,
          render: attachments => {
            if (!arrayIsEmpty(attachments)) {
              return (
                <div
                  onClick={() => {
                    openModal({
                      title: '附件',
                      footer: null,
                      children: (
                        <AttachmentImageView
                          attachment={{
                            files: attachments.map(file => {
                              return {
                                ...file,
                                originalFileName: file.original_filename,
                                originalExtension: file.original_extension,
                              };
                            }),
                          }}
                        />
                      ),
                    });
                  }}
                >
                  <Link icon="paper-clip" />
                  <span style={{ color: primary, cursor: 'pointer' }}>{attachments.length}张</span>
                </div>
              );
            }
            return replaceSign;
          },
        },
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('操作')}</span>,
          key: 'action',
          fixed: 'right',
          render: (_, record) => (
            <div
              className={styles.titleSmallMargin}
              style={{ color: blacklakeGreen, cursor: 'pointer' }}
              onClick={() => {
                router.history.push(
                  `/cooperate/prodTasks/detail/${this.props.taskId}/${recordType}RecordDetail/${
                    record.id
                  }?useQrCode=${useQrCode}&reportType=${reportType}&recordType=${recordType}`,
                );
              }}
            >
              {changeChineseToLocale('查看')}
            </div>
          ),
        },
      ],
      // 产出记录
      hold: [
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
          key: 'code',
          width: 110,
          render: code => <div className={styles.titleSmallMargin}>{code || replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('生产人员'),
          width: 100,
          key: 'producers',
          render: producers => (
            <div>{(producers && producers.length && producers.map(n => n.name).join(',')) || replaceSign}</div>
          ),
        },
        {
          title: changeChineseToLocale('报工时间'),
          key: 'createdAt',
          width: 100,
          render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('产出数量'),
          key: 'amount',
          width: 100,
          render: amount => (
            <div>
              {thousandBitSeparator(amount) || replaceSign}
              {this.unit}
            </div>
          ),
        },
        {
          title: changeChineseToLocale('图片'),
          key: 'attachments',
          width: 100,
          render: attachments => {
            if (!arrayIsEmpty(attachments)) {
              return (
                <div
                  onClick={() => {
                    openModal({
                      title: '附件',
                      footer: null,
                      children: (
                        <AttachmentImageView
                          attachment={{
                            files: attachments.map(file => {
                              return {
                                ...file,
                                originalFileName: file.original_filename,
                                originalExtension: file.original_extension,
                              };
                            }),
                          }}
                        />
                      ),
                    });
                  }}
                >
                  <Link icon="paper-clip" />
                  <span style={{ color: primary, cursor: 'pointer' }}>{attachments.length}张</span>
                </div>
              );
            }
            return replaceSign;
          },
        },
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('操作')}</span>,
          key: 'action',
          fixed: 'right',
          render: (_, record) => (
            <div
              className={styles.titleSmallMargin}
              style={{ color: blacklakeGreen, cursor: 'pointer' }}
              onClick={() => {
                router.history.push(
                  `/cooperate/prodTasks/detail/${this.props.taskId}/${recordType}RecordDetail/${
                    record.id
                  }?useQrCode=${useQrCode}&reportType=${reportType}&recordType=${recordType}`,
                );
              }}
            >
              {changeChineseToLocale('查看')}
            </div>
          ),
        },
      ],
      // 副产出不合格记录
      byProductUnqualifiedOutput: [
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
          key: 'code',
          width: 110,
          render: code => <div className={styles.titleSmallMargin}>{code || replaceSign}</div>,
        },
        useQrCode && {
          title: changeChineseToLocale('操作类型'),
          width: 85,
          key: 'type',
          render: type => (
            <div>{type === ACTION_TYPE_IN_STORAGE ? changeChineseToLocale('入库') : changeChineseToLocale('标记')}</div>
          ),
        },
        {
          title: changeChineseToLocale('生产人员'),
          width: 100,
          key: 'producers',
          render: producers => (
            <div>{(producers && producers.length && producers.map(n => n.name).join(',')) || replaceSign}</div>
          ),
        },
        {
          title: changeChineseToLocale('报工时间'),
          key: 'createdAt',
          width: 100,
          render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('不合格数量'),
          key: 'amount',
          width: 100,
          render: amount => (
            <div>
              {thousandBitSeparator(amount) || replaceSign}
              {this.unit}
            </div>
          ),
        },
        {
          title: changeChineseToLocale('图片'),
          key: 'attachments',
          width: 100,
          render: attachments => {
            if (!arrayIsEmpty(attachments)) {
              return (
                <div
                  onClick={() => {
                    openModal({
                      title: '附件',
                      footer: null,
                      children: (
                        <AttachmentImageView
                          attachment={{
                            files: attachments.map(file => {
                              return {
                                ...file,
                                originalFileName: file.original_filename,
                                originalExtension: file.original_extension,
                              };
                            }),
                          }}
                        />
                      ),
                    });
                  }}
                >
                  <Link icon="paper-clip" />
                  <span style={{ color: primary, cursor: 'pointer' }}>{attachments.length}张</span>
                </div>
              );
            }
            return replaceSign;
          },
        },
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('操作')}</span>,
          key: 'action',
          fixed: 'right',
          render: (_, record) => (
            <div
              className={styles.titleSmallMargin}
              style={{ color: blacklakeGreen, cursor: 'pointer' }}
              onClick={() => {
                router.history.push(
                  `/cooperate/prodTasks/detail/${this.props.taskId}/${recordType}RecordDetail/${
                    record.id
                  }?useQrCode=${useQrCode}&reportType=${reportType}&recordType=${recordType}`,
                );
              }}
            >
              {changeChineseToLocale('查看')}
            </div>
          ),
        },
      ],
      // 副产出记录
      byProductOutput: [
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
          key: 'code',
          width: 110,
          render: code => <div className={styles.titleSmallMargin}>{code || replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('生产人员'),
          width: 100,
          key: 'producers',
          render: producers => (
            <div>{(producers && producers.length && producers.map(n => n.name).join(',')) || replaceSign}</div>
          ),
        },
        {
          title: changeChineseToLocale('报工时间'),
          key: 'createdAt',
          width: 100,
          render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
        },
        {
          title: changeChineseToLocale('产出数量'),
          key: 'amount',
          width: 100,
          render: amount => (
            <div>
              {thousandBitSeparator(amount) || replaceSign}
              {this.unit}
            </div>
          ),
        },
        {
          title: changeChineseToLocale('图片'),
          key: 'attachments',
          width: 100,
          render: attachments => {
            if (!arrayIsEmpty(attachments)) {
              return (
                <div
                  onClick={() => {
                    openModal({
                      title: '附件',
                      footer: null,
                      children: (
                        <AttachmentImageView
                          attachment={{
                            files: attachments.map(file => {
                              return {
                                ...file,
                                originalFileName: file.original_filename,
                                originalExtension: file.original_extension,
                              };
                            }),
                          }}
                        />
                      ),
                    });
                  }}
                >
                  <Link icon="paper-clip" />
                  <span style={{ color: primary, cursor: 'pointer' }}>{attachments.length}张</span>
                </div>
              );
            }
            return replaceSign;
          },
        },
        useQrCode && {
          title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('操作')}</span>,
          key: 'action',
          fixed: 'right',
          render: (_, record) => (
            <div
              className={styles.titleSmallMargin}
              style={{ color: blacklakeGreen, cursor: 'pointer' }}
              onClick={() => {
                router.history.push(
                  `/cooperate/prodTasks/detail/${this.props.taskId}/${recordType}RecordDetail/${
                    record.id
                  }?useQrCode=${useQrCode}&reportType=${reportType}&recordType=${recordType}`,
                );
              }}
            >
              {changeChineseToLocale('查看')}
            </div>
          ),
        },
      ],
      injectMoldTask: {
        // 合并任务投产
        use: [
          useQrCode && {
            title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
            key: 'code',
            width: 110,
            render: code => <div className={styles.titleSmallMargin}>{code || replaceSign}</div>,
          },
          {
            title: '操作人',
            width: 100,
            key: 'operator',
            render: operator => <div>{(operator && operator.name) || replaceSign}</div>,
          },
          {
            title: changeChineseToLocale('操作时间'),
            key: 'createdAt',
            render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
          },
          useQrCode && {
            title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('操作')}</span>,
            key: 'action',
            width: 60,
            fixed: 'right',
            render: (_, record) => (
              <div
                className={styles.titleSmallMargin}
                style={{ color: blacklakeGreen, cursor: 'pointer' }}
                onClick={() => {
                  router.history.push(
                    `/cooperate/prodTasks/detail/${this.props.taskId}/${recordType}RecordDetail/${
                      record.id
                    }?useQrCode=${useQrCode}&reportType=${reportType}&recordType=${recordType}`,
                  );
                }}
              >
                {changeChineseToLocale('查看')}
              </div>
            ),
          },
        ],
        // 合并任务产出
        hold: [
          useQrCode && {
            title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('二维码')}</span>,
            key: 'code',
            width: 110,
            render: code => <div className={styles.titleSmallMargin}>{code || replaceSign}</div>,
          },
          {
            title: changeChineseToLocale('记录人员'),
            width: 100,
            key: 'report',
            render: report => <div>{(report && report.name) || replaceSign}</div>,
          },
          {
            title: changeChineseToLocale('操作时间'),
            key: 'createdAt',
            render: createdAt => <div>{createdAt ? formatDateHour(createdAt) : replaceSign}</div>,
          },
          useQrCode && {
            title: <span className={styles.titleSmallMargin}>{changeChineseToLocale('操作')}</span>,
            key: 'action',
            width: 60,
            fixed: 'right',
            render: (_, record) => (
              <div
                className={styles.titleSmallMargin}
                style={{ color: blacklakeGreen, cursor: 'pointer' }}
                onClick={() => {
                  router.history.push(
                    `/cooperate/prodTasks/detail/${this.props.taskId}/${recordType}RecordDetail/${
                      record.id
                    }?useQrCode=${useQrCode}&reportType=${reportType}&recordType=${recordType}`,
                  );
                }}
              >
                {changeChineseToLocale('查看')}
              </div>
            ),
          },
        ],
      },
    };

    // 合并任务的情况
    if (reportType == null) {
      return this.formatConfigs(_.compact(configs.injectMoldTask[recordType]));
    }
    return this.formatConfigs(_.compact(configs[recordType]));
  };

  render() {
    const { material, taskId, reportType, recordType, useQrCode } = this.props;
    if (!this.state.data) {
      return null;
    }
    const { loading, data: _data } = this.state;
    const { changeChineseToLocale } = this.context;
    const data = _data.list || [];
    const total = _data.total;
    const { sumAmount } = _data;
    const columns = _.compact(this.getTableColumns());
    const { materialCode, materialName, unit } = material;
    return (
      <div className={styles.recordContainer}>
        <div
          style={{
            wordWrap: 'normal',
            wordBreak: 'break-all',
            width: 270,
          }}
        >
          {`${materialCode ? `${materialCode}/` : ''}${materialName || replaceSign}`}
        </div>
        <div style={{ color: middleGrey, marginTop: 10 }}>
          {changeChineseToLocale('总计')}：<span>{total}</span>
          {changeChineseToLocale('条记录')}，<span>{sumAmount}</span>
          <span>{unit}</span>
        </div>
        <div style={{ margin: '20px -20px' }}>
          <Table
            bordered
            size="middle"
            loading={loading}
            dataSource={data}
            pagination={this.state.pagination}
            rowKey={record => record.id}
            columns={columns}
            scroll={{
              x: reportType === 'true' || useQrCode ? 550 : false,
            }}
            onChange={pagination => {
              const params = { taskId, material, recordType };
              this.setState({
                pagination: {
                  total,
                  current: pagination.current,
                  pageSize: 10,
                },
              });
              this.fetchData(params, pagination);
            }}
          />
        </div>
      </div>
    );
  }
}

UseAndHoldRecord.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(UseAndHoldRecord);
