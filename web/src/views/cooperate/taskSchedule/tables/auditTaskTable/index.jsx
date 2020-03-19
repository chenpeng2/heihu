import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { getQuery } from 'src/routes/getRouteParams';
import { arrayIsEmpty } from 'utils/array';
import { openModal, message, Table, Tooltip, Link, Button, Icon, Checkbox, SimpleTable, Popover } from 'components';
import { closeModal } from 'components/modal';
import ESignatureForm from 'containers/plannedTicket/base/ESignatureForm';
import { formatUnix, formatUnixMoment, formatToUnix } from 'utils/time';
import { getPurchaseOrderDetail } from 'src/services/cooperate/purchaseOrder';
import { replaceSign } from 'constants';
import { round, thousandBitSeparator } from 'utils/number';
import { queryAuditTask, auditTasks } from 'src/services/schedule';
import { queryESignatureStatus } from 'src/services/knowledgeBase/eSignature';
import { hashPassword } from 'src/utils/string';
import { getBatchTemplateDetail } from 'src/services/process';
import log from 'src/utils/log';
import LocalStorage, { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { includeOrganizationConfig, ORGANIZATION_CONFIG } from 'utils/organizationConfig';
import Filter from './filter';
import { checkUserAuditAuthority } from './utils';
import AuditNotPassReasonModal from './auditNotPassReasonModal';
import AuditRemarkModal from './auditRemarkModal';
import TaskModal from '../taskModal';
import { getWorkOrderDetailPath } from '../../utils';
import { AUDIT_TABLE_UNIQUE_KEY } from '../../constants';
import TransferApplyProgress from '../distributedTaskTable/transferApplyProgress';

const formatTask = tasks => {
  return tasks.map(({ code, amount, failReason, ...rest }) => ({
    ...rest,
    taskCode: code,
    planAmount: amount,
    errorMessage: failReason,
  }));
};

type Props = {
  form: {},
  taskCode: String,
  fetchWorkstationItems: () => {},
};

class ProcessTable extends Component {
  props: Props;

  state = {
    selectedRows: [],
    selectedRowKeys: [],
    data: [],
  };

  componentDidMount() {
    const filterAudit = LocalStorage.get('taskScheduleProcessTableFilterAudit');
    const user = LocalStorage.get('USER');
    const { taskCode } = this.props;
    const pageSize = getTablePageSizeFromLocalStorage(AUDIT_TABLE_UNIQUE_KEY);
    if (user) {
      this.setState({ user, hasAuditAuthority: checkUserAuditAuthority(user), size: pageSize });
    }
    this.fetchData({ filterAudit, taskCode, size: pageSize });
  }

  fetchDataAndSetInitValue = async params => {
    this.setInitValue(() => {
      this.fetchData(params);
    });
  };

  setInitValue = cb => {
    this.setState(
      {
        multiple: false,
        selectedRows: [],
        selectedRowKeys: [],
        allchecked: false,
      },
      () => {
        if (typeof cb === 'function') {
          cb();
        }
      },
    );
  };

  fetchData = async (params, query) => {
    const { multiple } = this.state;
    this.setState({ loading: true });
    const variables = Object.assign(
      {},
      { page: 1, size: 10, ...this.state.params, ...params, type: multiple ? 'audit' : undefined },
    );
    const { data } = await queryAuditTask({ ...variables });
    this.setState({
      loading: false,
      data: Array.isArray(data.data)
        ? data.data.map(e => ({
            ...e,
            key: e.taskCode,
            currentAuditor: e.auditInfo && e.auditInfo.auditors[e.auditInfo.currPos],
            // 如果是下料工单 工序投入物料展示工单计划投入物料
            inMaterial: e.category === 2 ? e.workOrderInMaterial : e.inMaterial,
          }))
        : [],
      pagination: {
        total: data.count,
        pageSize: (variables && variables.size) || 10,
        current: (variables && variables.page) || 1,
      },
    });
  };

  wrapESignature = cb => {
    const auditConfigKey = 'scheduling_task_approval';

    return queryESignatureStatus(auditConfigKey)
      .then(async res => {
        const hasConfig = _.get(res, 'data.data');
        if (hasConfig) {
          openModal(
            {
              title: '电子签名',
              children: <ESignatureForm onRef={inst => (this.eSignatureForm = inst)} />,
              onOk: async () => {
                const res = await this.eSignatureForm.checkESignature();
                if (res) {
                  const { username, password } = res;
                  const pw = hashPassword(password);
                  await cb({ username, password: pw });
                }
              },
              width: 500,
              style: { top: '25%' },
            },
            this.context,
          );
        } else {
          message.error('「审批生产任务」电子签名配置尚未开启');
        }
      })
      .catch(err => console.log(err));
  };

  openBatchRecordPage = ({ batchRecordId, workOrderCode }) => {
    getBatchTemplateDetail(batchRecordId)
      .then(res => {
        const url = _.get(res, 'data.data.templateUrl', '');
        const arr = url && url.split('[');
        const href = arrayIsEmpty(arr) ? null : `${arr[0]}${encodeURIComponent(workOrderCode)}`;
        if (href) {
          window.open(href, '_blank');
        }
      })
      .catch(err => log.error(err));
    return '';
  };

  getColumns = () => {
    const { fetchWorkstationItems } = this.props;
    const { hasAuditAuthority } = this.state;
    const columns = [
      {
        title: '任务编号',
        width: 100,
        dataIndex: 'taskCode',
        key: 'taskCode',
        render: (taskCode, record) => {
          const { conflicts } = record;
          let icon;
          if (conflicts && conflicts.length) {
            icon = (
              <Tooltip
                title={conflicts.map(key => (
                  <div style={{ display: 'flex' }}>
                    <Icon
                      type="exclamation-circle-o"
                      color={'rgba(0, 0, 0, 0.4)'}
                      style={{ paddingRight: 10 }}
                      theme="outlined"
                    />
                    {key.desc}
                  </div>
                ))}
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
              </Tooltip>
            );
          }
          return (
            <Fragment>
              {taskCode || replaceSign} {icon}
            </Fragment>
          );
        },
      },
      {
        title: '工序产出物料',
        width: 180,
        dataIndex: 'outMaterial',
        key: 'outMaterial',
        render: outMaterial =>
          Array.isArray(outMaterial) && outMaterial.length
            ? outMaterial.map(e => `${e.code}/${e.name}`).join(',')
            : replaceSign,
      },
      {
        title: '计划产出数量',
        width: 140,
        dataIndex: 'planAmount',
        key: 'planAmount',
        render: (planAmount, record) =>
          typeof planAmount === 'number' ? thousandBitSeparator(planAmount) : replaceSign,
      },
      {
        title: '工序投入物料',
        width: 120,
        dataIndex: 'inMaterial',
        key: 'inMaterial',
        render: inMaterial =>
          Array.isArray(inMaterial) && inMaterial.length ? (
            <Link
              onClick={() => {
                openModal({
                  children: this.renderInMaterials(inMaterial),
                  footer: null,
                });
              }}
            >
              查看
            </Link>
          ) : (
            replaceSign
          ),
      },
      {
        title: '转移申请进度',
        width: 120,
        key: 'transferProgress',
        dataIndex: 'taskCode',
        render: (taskCode, record) => {
          const { inMaterial } = record;
          return Array.isArray(inMaterial) && inMaterial.length ? (
            <Popover
              content={<TransferApplyProgress taskCode={taskCode} />}
              placement={'leftBottom'}
              destroyTooltipOnHide
            >
              <Link>查看</Link>
            </Popover>
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '订单编号',
        width: 140,
        dataIndex: 'purchaseOrderCode',
        key: 'purchaseOrderCode',
        render: purchaseOrderCode =>
          purchaseOrderCode ? (
            <Link
              onClick={async () => {
                const {
                  data: { data: purchaseOrder },
                } = await getPurchaseOrderDetail(purchaseOrderCode);
                window.open(`/cooperate/purchaseOrders/${purchaseOrder.id}/detail`);
              }}
            >
              {purchaseOrderCode}
            </Link>
          ) : (
            replaceSign
          ),
      },
      {
        title: '工单编号',
        width: 140,
        dataIndex: 'workOrderCode',
        key: 'workOrderCode',
        render: (workOrderCode, record) =>
          workOrderCode ? (
            <Link onClick={() => window.open(getWorkOrderDetailPath(record))}>{workOrderCode} </Link>
          ) : (
            replaceSign
          ),
      },
      {
        title: '工单产出物料',
        width: 180,
        dataIndex: 'workOrderOutMaterial',
        key: 'workOrderOutMaterial',
        render: workOrderOutMaterial =>
          Array.isArray(workOrderOutMaterial) && workOrderOutMaterial.length
            ? workOrderOutMaterial.map(e => `${e.code}/${e.name}`).join(',')
            : replaceSign,
      },
      {
        title: '成品批次',
        width: 150,
        key: 'productBatch',
        render: (_, { productBatchType, productBatch }) => {
          if (productBatchType !== 1) {
            return replaceSign;
          }
          return <Tooltip text={productBatch} length={10} />;
        },
      },
      {
        title: '下发进度',
        width: 120,
        dataIndex: 'distributeProgress',
        key: 'distributeProgress',
        render: (distributeProgress, record) => {
          const { distributeNum, denominator } = record;
          return `${typeof distributeNum === 'number' ? thousandBitSeparator(round(distributeNum, 6)) : replaceSign}/${
            typeof denominator === 'number' ? thousandBitSeparator(round(denominator, 6)) : replaceSign
          }`;
        },
      },
      {
        title: '工序',
        width: 140,
        dataIndex: 'processName',
        key: 'processName',
        render: (processName, record) =>
          record.processSeq && processName ? `${record.processSeq}/${processName}` : replaceSign,
      },
      {
        title: '工位',
        width: 180,
        dataIndex: 'workstationName',
        key: 'workstationName',
        render: (workstationName, record) => (
          <Fragment>
            {workstationName || replaceSign}
            <Link
              style={{ marginLeft: 6, width: 30 }}
              onClick={() => {
                const planedStartTime = formatUnixMoment(record.planBeginTime);
                const planedEndTime = formatUnixMoment(record.planEndTime);
                fetchWorkstationItems({
                  purchaseOrderCode: undefined,
                  workOrderCode: undefined,
                  workstationIds: [record.workstationId],
                  startTime: formatToUnix(
                    planedStartTime
                      .hour(0)
                      .minute(0)
                      .second(0),
                  ),
                  endTime: formatToUnix(
                    planedEndTime
                      .hour(23)
                      .minute(59)
                      .second(59),
                  ),
                });
              }}
            >
              查看
            </Link>
          </Fragment>
        ),
      },
      {
        title: '计划开始时间',
        width: 160,
        dataIndex: 'planBeginTime',
        key: 'planBeginTime',
        render: planBeginTime => {
          return <span>{planBeginTime ? formatUnix(planBeginTime) : replaceSign}</span>;
        },
      },
      {
        title: '计划结束时间',
        width: 160,
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        render: planEndTime => {
          return <span>{planEndTime ? formatUnix(planEndTime) : replaceSign}</span>;
        },
      },
      {
        title: '可用工位',
        width: 140,
        dataIndex: 'availableWorkstations',
        key: 'availableWorkstations',
        render: (workstations, record) => (
          <div>
            <Tooltip text={`${workstations.length}个`} length={8} />
            {workstations.length ? (
              <Link
                onClick={() => {
                  const planedStartTime = formatUnixMoment(record.planBeginTime);
                  const planedEndTime = formatUnixMoment(record.planEndTime);
                  fetchWorkstationItems({
                    workstationIds: workstations,
                    startTime: formatToUnix(
                      planedStartTime
                        .subtract(1, 'days')
                        .hour(0)
                        .minute(0)
                        .second(0),
                    ),
                    endTime: formatToUnix(
                      planedEndTime
                        .hour(23)
                        .minute(59)
                        .second(59),
                    ),
                  });
                }}
              >
                查看负荷
              </Link>
            ) : null}
          </div>
        ),
      },
      {
        title: '当前可审批人',
        width: 160,
        dataIndex: 'auditInfo',
        key: 'currentAudit',
        render: auditInfo => {
          const { auditors, currPos } = auditInfo;
          const auditor = auditors[currPos];
          const text = (Array.isArray(auditor.ids) && auditor.ids.map(({ name }) => name).join(',')) || replaceSign;
          return <Tooltip text={text} length={14} />;
        },
      },
      {
        title: '审批流',
        width: 200,
        dataIndex: 'auditInfo',
        key: 'auditors',
        render: auditInfo => {
          return (
            Array.isArray(auditInfo.auditors) &&
            auditInfo.auditors
              .map(({ ids }) => {
                return ids.map(({ name }) => name).join(',');
              })
              .join('；')
          );
        },
      },
      {
        title: '电子批记录',
        width: 100,
        dataIndex: 'batchTemplateId',
        hidden:
          !includeOrganizationConfig(ORGANIZATION_CONFIG.ProduceTaskDeliverable) ||
          !includeOrganizationConfig(ORGANIZATION_CONFIG.BatchRecord),
        key: 'batchTemplateId',
        render: (batchTemplateId, { workOrderCode }) => {
          return batchTemplateId ? (
            <Link onClick={() => this.openBatchRecordPage({ batchRecordId: batchTemplateId, workOrderCode })}>
              查看
            </Link>
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '计划员',
        width: 150,
        dataIndex: 'planners',
        key: 'planners',
        render: planners => {
          return !arrayIsEmpty(planners) ? planners.map(e => e.name).join(',') : replaceSign;
        },
      },
    ].filter(n => n && !n.hidden);
    if (hasAuditAuthority) {
      columns.push({
        title: '操作',
        width: 200,
        key: 'action',
        render: (data, { taskCode, auditInfo }) => {
          const { auditors, currPos } = auditInfo;
          const auditor = auditors[currPos];
          const auditorIds = Array.isArray(auditor.ids) ? auditor.ids.map(({ id }) => id) : [];
          const access = this.state.user && auditor && auditorIds.includes(this.state.user.id);
          return (
            <Fragment>
              <Link
                style={{ paddingRight: 10 }}
                disabled={!access}
                onClick={() => {
                  openModal({
                    title: '审批通过',
                    footer: null,
                    children: (
                      <AuditRemarkModal
                        auditInfo={auditInfo}
                        onSubmit={value => {
                          this.wrapESignature(async ({ username, password }) => {
                            const {
                              data: {
                                data: { detail, successAmount },
                              },
                            } = await auditTasks({
                              username,
                              password,
                              task: [{ code: taskCode, isPass: true, ...value }],
                            });
                            if (detail && detail.length) {
                              openModal({
                                title: '下发失败',
                                children: (
                                  <TaskModal
                                    data={formatTask(detail)}
                                    cb={() => {
                                      this.props.fetchWorkstationItems();
                                      this.setState({
                                        multiple: false,
                                        selectedRows: [],
                                        selectedRowKeys: [],
                                        allchecked: false,
                                      });
                                      this.fetchData(this.state.params);
                                    }}
                                  />
                                ),
                                footer: null,
                              });
                            } else {
                              message.success('审批完成！');
                              closeModal();
                              this.fetchData(this.state.params);
                            }
                          });
                        }}
                      />
                    ),
                  });
                }}
              >
                审批通过
              </Link>
              <Link
                disabled={!access}
                onClick={() => {
                  openModal({
                    title: '审批不通过',
                    footer: null,
                    children: (
                      <AuditNotPassReasonModal
                        auditInfo={auditInfo}
                        onSubmit={value => {
                          this.wrapESignature(async ({ username, password }) => {
                            await auditTasks({
                              username,
                              password,
                              task: [{ code: taskCode, isPass: false, ...value }],
                            });
                            message.success('审批完成！');
                            closeModal();
                            this.fetchData(this.state.params);
                          });
                        }}
                      />
                    ),
                  });
                }}
              >
                审批不通过
              </Link>
            </Fragment>
          );
        },
      });
    }
    return columns;
  };

  renderInMaterials = data => {
    return (
      <div>
        <div style={{ margin: 20, paddingTop: 20 }}>
          <SimpleTable
            style={{ margin: 0 }}
            pagination={false}
            dataSource={data}
            columns={[
              {
                title: '工序投入物料编号／名称',
                width: 400,
                key: 'inMaterial',
                render: (data, record) => `${record.code}/${record.name}`,
              },
              {
                title: '投入数量／单位',
                key: 'amount',
                render: (data, record) => `${record.amount} ${record.unitName || replaceSign}`,
              },
            ]}
          />
          <div />
          <Button
            style={{ margin: '30px 0 30px 270px', width: 114 }}
            onClick={() => {
              closeModal();
            }}
          >
            确定
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { taskCode } = this.props;
    const { data, multiple, selectedRows, pagination, user, hasAuditAuthority } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, _selectedRows) => {
        const newSelectedRows = _.pullAllBy(selectedRows, data, 'key').concat(_selectedRows);
        this.setState({
          selectedRowKeys,
          selectedRows: newSelectedRows,
        });
      },
    };
    const columns = this.getColumns();
    return (
      <div style={{ margin: '0 20px' }}>
        <Filter
          initialValue={{ taskCode }}
          hasAuditAuthority={hasAuditAuthority}
          onFilter={(params, extra) => {
            this.setState({ params });
            this.fetchData({ ...params, page: 1 }, extra);
          }}
        />
        {multiple ? (
          <div>
            <Button
              type="ghost"
              style={{ margin: '0 5px 10px' }}
              onClick={async () => {
                if (!selectedRows.length) {
                  message.error('请选择待审批任务');
                  return;
                }
                this.setState({ loading: true });
                this.wrapESignature(async ({ username, password }) => {
                  const {
                    data: {
                      data: { detail, successAmount },
                    },
                  } = await auditTasks({
                    username,
                    password,
                    task: selectedRows.map(e => ({ code: e.taskCode, isPass: true })),
                  });
                  if (detail && detail.length) {
                    openModal({
                      title: '下发失败',
                      children: (
                        <TaskModal
                          data={formatTask(detail)}
                          cb={() => {
                            this.props.fetchWorkstationItems();
                            this.setState({
                              multiple: false,
                              selectedRows: [],
                              selectedRowKeys: [],
                              loading: false,
                            });
                            this.fetchData();
                          }}
                        />
                      ),
                      footer: null,
                    });
                  } else {
                    message.success(`${successAmount}个任务审批完成！`);
                    this.setState({
                      multiple: false,
                      selectedRows: [],
                      selectedRowKeys: [],
                      loading: false,
                    });
                    this.fetchData();
                  }
                }).finally(() => {
                  this.setState({ loading: false });
                });
              }}
            >
              审批通过
            </Button>
            <Button
              type="ghost"
              style={{ margin: '0 5px 10px' }}
              onClick={async () => {
                if (!selectedRows.length) {
                  message.error('请选择待审批任务');
                  return;
                }
                openModal({
                  title: '不通过原因',
                  footer: null,
                  children: (
                    <AuditNotPassReasonModal
                      onSubmit={value => {
                        this.setState({ loading: true });
                        this.wrapESignature(async ({ username, password }) => {
                          await auditTasks({
                            username,
                            password,
                            task: selectedRows.map(e => ({ code: e.taskCode, isPass: false, ...value })),
                          });
                          message.success('审批完成！');
                          this.setState({
                            loading: false,
                          });
                          closeModal();
                          this.fetchDataAndSetInitValue();
                        }).finally(() => {
                          this.setState({ loading: false });
                        });
                      }}
                    />
                  ),
                });
              }}
            >
              审批不通过
            </Button>
            <span style={{ margin: '0 5px' }}>已选{selectedRows.length}个结果</span>
            <Button
              type="ghost"
              style={{ margin: '0 5px 10px' }}
              onClick={() => {
                this.fetchDataAndSetInitValue({ size: pagination && pagination.pageSize, page: 1 });
              }}
            >
              取消
            </Button>
          </div>
        ) : (
          <div style={{ marginBottom: 10 }}>
            {hasAuditAuthority ? (
              <Button
                style={{ marginRight: 10 }}
                onClick={() =>
                  this.setState({ multiple: true }, () => {
                    this.fetchData({ size: pagination && pagination.pageSize, page: 1 });
                  })
                }
              >
                <Icon iconType={'gc'} type={'piliangcaozuo'} />
                批量审批
              </Button>
            ) : null}
            <a href={`${location.pathname}/audit-list`} target="_blank" rel="noopener noreferrer">
              <Icon style={{ paddingRight: 5 }} iconType="gc" type="chakanjilu-hui" />
              查看操作记录
            </a>
          </div>
        )}
        <Table
          style={{
            flex: 1,
            margin: 0,
            maxHeight: 400,
            overflowY: 'auto',
            paddingBottom: Array.isArray(data) && data.length ? 64 : 0,
          }}
          tableUniqueKey={AUDIT_TABLE_UNIQUE_KEY}
          useColumnConfig
          pagination={{ ...pagination, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          rowKey={record => `${record.taskCode}`}
          refetch={this.fetchData}
          bordered
          columns={columns}
          dataSource={data}
          dragable
          rowSelection={multiple ? rowSelection : null}
          scroll={{ y: 290 }}
        />
      </div>
    );
  }
}

export default ProcessTable;
