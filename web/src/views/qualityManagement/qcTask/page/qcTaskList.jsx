import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import auth from 'src/utils/auth';
import MyStore from 'store';
import { Popconfirm, Link, Table, Badge, OpenModal, message, Icon, Spin, Text } from 'src/components';
import { setSelectedRows } from 'src/store/redux/actions/qualityManagement/qcTask';
import { updateQcTaskStatus } from 'src/services/qualityManagement/qcTask';
import authorityWrapper from 'src/components/authorityWrapper';
import { getQuery } from 'src/routes/getRouteParams';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import moment, { formatDateTime } from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { thousandBitSeparator } from 'src/utils/number';

import QcTaskEditForm from './qcTaskEditForm';
import { getDefect, getCheckTypeDisplay, getQcTaskDetailUrl } from '../utils';
import { qcTaskStatusMap, qcTaskStatusColorMap, REVIEW_CHECK } from '../../constants';
import { toQcConfigDetail } from '../../navigation';

const MyBadge = Badge.MyBadge;

const LinkWithAuth = authorityWrapper(Link);

type Props = {
  match: any,
  intl: any,
  total: Number,
  loading: Boolean,
  data: {},
  qcTaskState: {
    batchOperation: Boolean,
    allChecked: Boolean,
    selectedRows: Array,
  },
  refreshData: () => {},
};

const QcTaskList = (props: Props, context) => {
  const { match, total, data, refreshData, qcTaskState, loading, intl } = props;
  const { batchOperation, allChecked, selectedRows } = qcTaskState;
  const query = getQuery(match);

  const cancelQcTask = async code => {
    await updateQcTaskStatus(code, 3)
      .then(({ data }) => {
        if (data.message === '成功') {
          message.success('取消成功');
          const queryMatch = getQuery(match);
          refreshData(queryMatch);
        }
      })
      .catch(e => console.log(e));
  };

  const getColumns = () => {
    return [
      {
        title: '质检计划编号',
        dataIndex: 'qcPlanCode',
        key: 'qcPlanCode',
        width: 100,
        render: qcPlanCode => qcPlanCode || replaceSign,
      },
      {
        title: '',
        width: 40,
        dataIndex: 'qcTaskType',
        render: qcTaskType => (
          <div style={{ textAlign: 'right' }}>
            {REVIEW_CHECK === qcTaskType ? <Icon style={{ paddingRight: 0 }} iconType="gc" type="icon_fu" /> : null}
          </div>
        ),
      },
      {
        title: '任务编号',
        dataIndex: 'code',
        key: 'code',
        width: 100,
        render: code => code || replaceSign,
      },
      {
        title: '质检物料',
        dataIndex: 'material',
        key: 'material',
        width: 185,
        render: material => {
          if (!material) return replaceSign;
          const display = `${material.code}/${material.name}`;
          if (material && material.type) return display;
          return (
            <Link onClick={() => window.open(`/bom/materials/${encodeURIComponent(material.code)}/detail`, '_blank')}>
              {display}
            </Link>
          );
        },
      },
      {
        title: '质检方案',
        dataIndex: 'qcConfig',
        key: 'qcConfig',
        width: 100,
        render: qcConfig => {
          if (!qcConfig) return replaceSign;
          const { name, id } = qcConfig;
          return id ? (
            <Link.NewTagLink href={toQcConfigDetail(id)}>{name || replaceSign}</Link.NewTagLink>
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: status =>
          typeof status === 'number' ? (
            <MyBadge text={qcTaskStatusMap[status]} color={qcTaskStatusColorMap[status]} />
          ) : (
            replaceSign
          ),
      },
      {
        title: '质检结果',
        dataIndex: 'countRecord',
        width: 90,
        render: (countRecord, record) => {
          const { status } = record;
          if (status !== 2 || !countRecord) {
            return replaceSign;
          }
          const { status: qcStatus } = countRecord;

          const { name, color } = QUALITY_STATUS[qcStatus] || {};
          // 当质量状态为已结束时展示质检结果
          return status === 2 ? <Badge.MyBadge text={name || replaceSign} color={color} /> : replaceSign;
        },
      },
      {
        title: '类型',
        dataIndex: 'checkType',
        key: 'checkType',
        width: 70,
        render: (checkType, record) => {
          const { qcTaskClassification } = record;
          return <Text>{getCheckTypeDisplay(qcTaskClassification, checkType)}</Text>;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 140,
        render: createdAt => (createdAt ? <span>{formatDateTime(createdAt)}</span> : replaceSign),
      },
      {
        title: '工位',
        dataIndex: 'workstation',
        width: 100,
        render: data => {
          const { name } = data || {};

          return <span> {name || replaceSign} </span>;
        },
      },
      {
        title: '执行人',
        dataIndex: 'operatorName',
        key: 'operatorName',
        width: 100,
        render: operatorName => (operatorName ? <span>{operatorName || replaceSign}</span> : replaceSign),
      },
      {
        title: '工序编号/工序名称',
        dataIndex: 'task',
        key: 'task',
        width: 140,
        render: (task, record) => {
          if (!task) return replaceSign;
          const {
            task: { processCode, processName },
          } = record;
          return (
            <Link
              onClick={() => window.open(`/bom/newProcess/${encodeURIComponent(processCode)}/detail`, '_blank')}
            >{`${processCode || replaceSign}/${processName || replaceSign}`}</Link>
          );
        },
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        key: 'startTime',
        width: 140,
        render: startTime => {
          if (!startTime) return replaceSign;

          const _time = moment(startTime).format('YYYY/MM/DD HH:mm');
          return <span>{_time}</span>;
        },
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
        key: 'endTime',
        width: 140,
        render: endTime => {
          if (!endTime) return replaceSign;

          const _time = moment(endTime).format('YYYY/MM/DD HH:mm');
          return <span>{_time}</span>;
        },
      },
      {
        title: '样本：抽样数/次品/不合格率',
        dataIndex: 'checkCount',
        width: 170,
        render: (count, record) => {
          const { sampleDefectRate, sampleDefectCount, status } = record;
          if (status === 0) return replaceSign;
          const checkCount = typeof count === 'number' ? thousandBitSeparator(count) : replaceSign;
          const defectCount =
            typeof sampleDefectCount === 'number' ? thousandBitSeparator(sampleDefectCount) : replaceSign;
          const display = `${checkCount}/${defectCount}/${getDefect(sampleDefectRate)}`;
          return <span>{display}</span>;
        },
      },
      {
        title: '总体：总数/次品/不合格率',
        dataIndex: 'qcTotal',
        width: 170,
        render: (count, record) => {
          const { checkDefectRate, checkDefectCount, status } = record;
          if (status !== 2) return replaceSign;
          const qcTotal = typeof count === 'number' ? thousandBitSeparator(count) : replaceSign;
          const defectCount =
            typeof checkDefectCount === 'number' ? thousandBitSeparator(checkDefectCount) : replaceSign;
          const display = `${qcTotal}/${defectCount}/${getDefect(checkDefectRate)}`;
          return <span>{display}</span>;
        },
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 100,
        render: purchaseOrderCode => {
          if (!purchaseOrderCode) return replaceSign;
          return (
            <Link
              onClick={() =>
                window.open(
                  `/cooperate/purchaseOrders/${encodeURIComponent(purchaseOrderCode)}/detail?code=${purchaseOrderCode}`,
                  '_blank',
                )
              }
            >
              {purchaseOrderCode}
            </Link>
          );
        },
      },
      {
        title: '项目编号',
        dataIndex: 'task.projectCode',
        key: 'task.projectCode',
        width: 130,
        render: (projectCode, record) => {
          if (!projectCode) return replaceSign;
          return (
            <Link
              onClick={() => window.open(`/cooperate/projects/${encodeURIComponent(projectCode)}/detail`, '_blank')}
            >
              {projectCode}
            </Link>
          );
        },
      },
      {
        title: '操作',
        width: 170,
        dataIndex: 'actions',
        fixed: 'right',
        render: (data, record) => {
          const { status, code } = record || {};
          return (
            <div>
              <LinkWithAuth
                auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
                style={{ marginRight: 10 }}
                onClick={() => {
                  context.router.history.push(getQcTaskDetailUrl(code));
                }}
              >
                查看
              </LinkWithAuth>
              {status === 0 ? (
                <LinkWithAuth
                  auth={auth.WEB_EDIT_QUALITY_TESTING_TASK}
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    OpenModal(
                      {
                        title: '编辑质检任务',
                        footer: null,
                        width: 660,
                        height: 416,
                        children: (
                          <QcTaskEditForm
                            data={record}
                            onSuccess={() => {
                              const queryMatch = getQuery(match);
                              refreshData(queryMatch);
                            }}
                          />
                        ),
                      },
                      context,
                    );
                  }}
                >
                  编辑
                </LinkWithAuth>
              ) : (
                <Link style={{ marginRight: 10 }} disabled>
                  编辑
                </Link>
              )}
              {status === 0 ? (
                <Popconfirm
                  arrowPointAtCenter
                  autoAdjustOverflow
                  placement="topRight"
                  overlayStyle={{ width: 230, fontSize: 14 }}
                  title={changeChineseToLocale('该质检任务取消后便无法再重启，确认要取消任务吗？', intl)}
                  onConfirm={() => {
                    cancelQcTask(code);
                  }}
                  okText={changeChineseToLocale('该质检任务取消后便无法再重启，确认要取消任务吗？', intl)}
                  cancelText={changeChineseToLocale('该质检任务取消后便无法再重启，确认要取消任务吗？', intl)}
                >
                  <LinkWithAuth
                    auth={auth.WEB_CANCEL_QUALITY_TESTING_TASK}
                    style={{ marginRight: 10 }}
                    onClick={() => {}}
                  >
                    取消
                  </LinkWithAuth>
                </Popconfirm>
              ) : (
                <Link style={{ marginRight: 10 }} disabled>
                  取消
                </Link>
              )}
              <LinkWithAuth
                auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
                style={{ marginRight: 10 }}
                onClick={() => {
                  context.router.history.push(`/qualityManagement/qcTask/detail/${code}/operationLog`);
                }}
              >
                日志
              </LinkWithAuth>
            </div>
          );
        },
      },
    ];
  };

  const columns = getColumns();
  const _selectedRows = selectedRows || [];
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedRows = _.pullAllBy(_selectedRows, data, 'code').concat(selectedRows);
      MyStore.dispatch(setSelectedRows(newSelectedRows));
    },
    getCheckboxProps: () => ({
      disabled: allChecked,
    }),
    selectedRowKeys: selectedRows.map(n => n.code),
  };

  const handleTableChange = pagination => {
    refreshData({
      ...query,
      page: pagination && pagination.current,
      size: (pagination && pagination.pageSize) || 10,
    });
  };

  return (
    <Spin spinning={loading}>
      <Table
        dragable
        dataSource={data}
        rowKey={record => record.code}
        columns={columns}
        total={total}
        refetch={refreshData}
        scroll={{ x: 2300 }}
        onChange={handleTableChange}
        showPageSizeChanger
        showTotalAmount
        rowSelection={batchOperation ? rowSelection : null}
      />
    </Spin>
  );
};

QcTaskList.contextTypes = {
  router: PropTypes.object.isRequired,
};

const mapStateToProps = ({ qualityManagement }) => ({ qcTaskState: qualityManagement });

export default connect(mapStateToProps)(withRouter(injectIntl(QcTaskList)));
