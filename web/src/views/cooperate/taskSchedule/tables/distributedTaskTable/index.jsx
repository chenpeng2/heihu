import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Modal, Spin } from 'antd';
import { openModal, Table, Tooltip, Link, Button, message, Icon, Badge, Popover, PlainText } from 'components';
import { replaceSign, MoveTransaction } from 'constants';
import { arrayIsEmpty, arrayRemoveDuplicates } from 'utils/array';
import { formatUnix, formatToUnix, formatUnixMoment } from 'utils/time';
import { getBaitingWorkOrderConfig } from 'utils/organizationConfig';
import { getPurchaseOrderDetail } from 'services/cooperate/purchaseOrder';
import { getTransferApplyFromTask } from 'services/cooperate/materialRequest';
import { blacklakeGreen } from 'styles/color';
import {
  queryTask,
  queryInjectTask,
  revokeTasks,
  distributeTasks,
  distributeInjectTasks,
  revokeInjectTasks,
  getInjectTaskSub,
  getTransactionInfo,
} from 'services/schedule';
import { thousandBitSeparator } from 'utils/number';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import auth from 'utils/auth';
import TransferApplyProgress from './transferApplyProgress';
import TaskModal from '../taskModal';
import styles from './styles.scss';
import Filter from './filter';
import { PRODUCE_STATUS_MAP, DISTRIBUTED_TABLE_UNIQU_KEY } from '../../constants';
import { getWorkOrderDetailPath, formatTask, formatInjectTask } from '../../utils';
import MaterialRequestProgress from './materialRequestProgress';

const transactionEnabled = async params => {
  try {
    const response = await getTransactionInfo(params);
    const data = _.get(response, 'data.data', null);
    const enable = _.get(data, 'enable', 0);
    return enable === 1;
  } catch (error) {
    console.log(error);
    return false;
  }
};

type Props = {
  form: {},
  taskCode: String,
  fetchWorkstationItems: () => {},
};

type State = {
  loading: Boolean,
};

class ProcessTable extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      params: {},
      data: [],
      sortInfo: null,
      loading: false,
    };
  }

  componentDidMount() {
    const { taskCode } = this.props;
    const pageSize = getTablePageSizeFromLocalStorage(DISTRIBUTED_TABLE_UNIQU_KEY);
    this.fetchData({ taskCode, size: pageSize });
    const baitingWorkOrderConfig = getBaitingWorkOrderConfig();
    this.setState({ baitingWorkOrderConfig });
  }

  fetchDataAndSetInitValue = async params => {
    this.setInitValue(() => {
      this.fetchData(params);
    });
  };

  fetchData = async params => {
    const { projectProcessCode, projectCode, purchaseOrderCode, multiple } = this.state;
    const variables = Object.assign(
      {},
      {
        page: 1,
        size: 10,
        projectProcessCode,
        projectCode,
        purchaseOrderCode,
        ...this.state.sortInfo,
        ...this.state.params,
        ...params,
        filterBy: multiple ? 'access' : undefined,
        distributed: true,
      },
    );
    this.setState({ params: variables });
    const { inject } = variables;
    if (inject === true) {
      this.fetchInjectTask(variables);
    } else {
      this.fetchTask(variables);
    }
  };

  fetchTask = async params => {
    const { data } = await queryTask({ ...params });
    this.setState({
      data: Array.isArray(data.data)
        ? data.data.map(e => ({
            ...formatTask(e),
          }))
        : [],
      pagination: {
        total: data.count,
        pageSize: (params && params.size) || 10,
        current: (params && params.page) || 1,
      },
    });
  };

  fetchInjectTask = async params => {
    const { data } = await queryInjectTask({ ...params });
    this.setState({
      data: Array.isArray(data.data)
        ? data.data.map(e => {
            const { processNum, subTasks, workstations } = e;
            return {
              ...formatInjectTask(e),
              availableWorkstations: workstations,
              planAmount: subTasks.map(e => e.amount).join(','),
              outMaterial: subTasks.map(e => ({
                code: e.materialCode,
                name: e.materialName,
              })),
              children: [],
            };
          })
        : [],
      pagination: {
        total: data.count,
        pageSize: (params && params.size) || 10,
        current: (params && params.page) || 1,
      },
    });
  };

  setInitValue = cb => {
    this.setState(
      {
        multiple: false,
        selectedRows: [],
        selectedRowKeys: [],
      },
      () => {
        if (typeof cb === 'function') {
          cb();
        }
      },
    );
  };

  /** 超量领料 */
  onGetMaterialOverbalance = taskCode => {
    const fetchData = async () => {
      try {
        const params = { code: MoveTransaction.overBalance.code };
        this.setState({ loading: true });
        const enabled = await transactionEnabled(params);
        this.setState({ loading: false });
        if (!enabled) {
          this.showInfoModal('请先维护超量领料的移动事务');
          return;
        }
        const { router } = this.context;
        const location = {
          pathname: '/cooperate/taskSchedule/createTransferApplySingle',
          state: { taskCode, transactionCode: MoveTransaction.overBalance.code },
        };
        router.history.push(location);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  };

  /** 退料 */
  onSendBackMaterial = taskCode => {
    const fetchData = async () => {
      try {
        const params = { code: MoveTransaction.sendBack.code };
        this.setState({ loading: true });
        const enabled = await transactionEnabled(params);
        this.setState({ loading: false });
        if (!enabled) {
          this.showInfoModal('请先维护退料的移动事务');
          return;
        }
        const { router } = this.context;
        const location = {
          pathname: '/cooperate/taskSchedule/createTransferApplySingle',
          state: { taskCode, transactionCode: MoveTransaction.sendBack.code },
        };
        router.history.push(location);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  };

  getColumns = () => {
    const { fetchWorkstationItems } = this.props;
    const { baitingWorkOrderConfig, params } = this.state;
    let columns = [
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
                    <div>{key.desc}</div>
                  </div>
                ))}
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
              </Tooltip>
            );
          }
          return (
            <Fragment>
              <span>{taskCode || replaceSign}</span>
              {icon}
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
    ];
    if (params.inject) {
      columns.push({
        title: '模具编号',
        width: 150,
        dataIndex: 'mouldUnit',
        render: mouldUnit => (mouldUnit ? mouldUnit.code : replaceSign),
      });
    }
    columns = columns.concat([
      {
        title: (
          <div>
            <PlainText text="计划产出数量" />
            {baitingWorkOrderConfig ? (
              <Tooltip
                title={
                  <div style={{ display: 'flex' }}>
                    <div>下料工单显示计划投入物料的投入数量</div>
                  </div>
                }
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} style={{ paddingLeft: 4 }} />
              </Tooltip>
            ) : null}
          </div>
        ),
        width: 140,
        dataIndex: 'planAmount',
        key: 'planAmount',
        render: (planAmount, record) =>
          typeof planAmount === 'number' ? thousandBitSeparator(planAmount) : replaceSign,
      },
    ]);
    if (!params.inject) {
      columns = columns.concat([
        {
          title: '工序投入物料',
          width: 180,
          dataIndex: 'inMaterial',
          key: 'inMaterial',
          render: inMaterial =>
            Array.isArray(inMaterial) && inMaterial.length
              ? inMaterial.map(e => `${e.code}/${e.name}`).join(',')
              : replaceSign,
        },
      ]);
    }
    columns = columns.concat([
      {
        title: '转移申请进度',
        width: 120,
        key: 'transferProgress',
        dataIndex: 'taskCode',
        render: (taskCode, record) => {
          const { params } = this.state;
          return !params.inject || record.children ? (
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
        render: purchaseCode =>
          purchaseCode ? (
            <Link
              onClick={async () => {
                const {
                  data: { data: purchaseOrder },
                } = await getPurchaseOrderDetail(purchaseCode);
                window.open(`/cooperate/purchaseOrders/${purchaseOrder.id}/detail`);
              }}
            >
              {purchaseCode}
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
            <Link onClick={() => window.open(getWorkOrderDetailPath(record))}>{workOrderCode}</Link>
          ) : (
            replaceSign
          ),
      },
    ]);
    if (!params.inject) {
      columns = columns.concat([
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
      ]);
    }
    const materialProgressColumns = [
      {
        title: '退料进度',
        width: 120,
        key: 'backProgress',
        dataIndex: 'taskCode',
        render: (taskCode, record) => {
          const { inMaterial } = record;
          return Array.isArray(inMaterial) && inMaterial.length ? (
            <Popover
              content={<MaterialRequestProgress taskCode={taskCode} transactionCode={MoveTransaction.sendBack.code} />}
              placement={'leftBottom'}
            >
              <Link>查看</Link>
            </Popover>
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '超量领料进度',
        width: 120,
        key: 'overProgress',
        dataIndex: 'taskCode',
        render: (taskCode, record) => {
          const { inMaterial } = record;
          return Array.isArray(inMaterial) && inMaterial.length ? (
            <Popover
              content={
                <MaterialRequestProgress taskCode={taskCode} transactionCode={MoveTransaction.overBalance.code} />
              }
              placement={'leftBottom'}
            >
              <Link>查看</Link>
            </Popover>
          ) : (
            replaceSign
          );
        },
      },
    ];
    columns = columns.concat([
      {
        title: '执行状态',
        width: 100,
        dataIndex: 'produceStatus',
        key: 'produceStatus',
        render: status => {
          const { display, color } = PRODUCE_STATUS_MAP[status] || {};
          return display ? <Badge.MyBadge text={display} color={color} /> : replaceSign;
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
          <div>
            {workstationName || replaceSign}
            <Link
              style={{ marginLeft: 6, width: 30 }}
              onClick={() => {
                const planedStartTime = formatUnixMoment(record.planBeginTime);
                const planedEndTime = formatUnixMoment(record.planEndTime);
                fetchWorkstationItems({
                  workstationIds: [record.workstationId],
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
              查看
            </Link>
          </div>
        ),
      },
      {
        title: '执行人',
        width: 120,
        dataIndex: 'executors',
        key: 'executors',
        render: executors =>
          Array.isArray(executors) && executors.length ? executors.map(e => e.name).join(',') : replaceSign,
      },
      {
        title: '计划开始时间',
        dataIndex: 'planBeginTime',
        width: 180,
        key: 'planBeginTime',
        render: (planBeginTime, record) => {
          return <Fragment>{planBeginTime ? formatUnix(planBeginTime) : replaceSign}</Fragment>;
        },
      },
      {
        title: '计划结束时间',
        width: 180,
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        render: (planEndTime, record) => {
          return <Fragment>{planEndTime ? formatUnix(planEndTime) : replaceSign}</Fragment>;
        },
      },
    ]);
    columns = columns.concat(materialProgressColumns);
    if (!params.inject) {
      columns = columns.concat([
        {
          title: '审批备注',
          width: 180,
          dataIndex: 'auditInfo.auditors',
          render: auditors => {
            const notNullRemarks = Array.isArray(auditors) && auditors.filter(e => e.remark);
            return notNullRemarks.length ? notNullRemarks.map(e => `${e.remark}(${e.name})`).join(';') : replaceSign;
          },
        },
        {
          title: '下发时间',
          width: 140,
          dataIndex: 'updatedAt',
          key: 'updatedAt',
          sorter: true,
          sortOrder: this.state.sortInfo && this.state.sortInfo.order,
          render: updatedAt => (updatedAt ? formatUnix(updatedAt) : replaceSign),
        },
      ]);
    }
    columns.push({
      title: '计划员',
      width: 150,
      dataIndex: 'planners',
      key: 'planners',
      render: planners => {
        return !arrayIsEmpty(planners) ? planners.map(e => e.name).join(',') : replaceSign;
      },
    });
    const renderAction = (_, record) => {
      const { taskCode } = record;
      return (
        <div>
          <Link className={styles.columnAction} onClick={() => this.onGetMaterialOverbalance(taskCode)}>
            超量领料
          </Link>
          <Link onClick={() => this.onSendBackMaterial(taskCode)}>退料</Link>
        </div>
      );
    };
    const actionColumn = {
      title: '操作',
      width: 120,
      key: 'action',
      render: renderAction,
      fixed: 'right',
    };
    columns.push(actionColumn);
    return columns;
  };

  revokeInjectTasks = async task => {
    this.setState({ loading: true });
    const {
      data: {
        data: { successAmount, detail },
      },
    } = await revokeInjectTasks(task.map(e => e.taskCode)).finally(e => {
      this.setState({ loading: false });
    });
    if (detail && detail.length) {
      message.error(`任务号${detail.join(',')}撤回失败`);
    } else {
      message.success(`成功撤回${successAmount}个任务!`);
    }
    this.setState({
      loading: false,
    });
    this.fetchDataAndSetInitValue();
    this.props.fetchWorkstationItems();
  };

  revokeTasks = async task => {
    this.setState({ loading: true });
    const {
      data: {
        data: { successAmount, detail },
      },
    } = await revokeTasks(task.map(e => e.taskCode)).finally(e => {
      this.setState({ loading: false });
    });
    if (detail && detail.length) {
      message.error(`任务号${detail.join(',')}撤回失败`);
    } else {
      message.success(`成功撤回${successAmount}个任务!`);
    }
    this.setState({
      loading: false,
      multiple: false,
      selectedRows: [],
      selectedRowKeys: [],
    });
    this.fetchData(this.state.params);
    this.props.fetchWorkstationItems();
  };

  distributeTasks = async tasks => {
    const { params } = this.state;
    const callback = data => {
      const { detail, successAmount } = data;
      if (detail && detail.length) {
        openModal({
          title: '下发失败',
          children: (
            <TaskModal
              data={detail}
              cb={() => {
                this.props.fetchWorkstationItems();
                this.setState({
                  multiple: false,
                  selectedRows: [],
                  selectedRowKeys: [],
                });
                this.fetchData(this.state.params);
              }}
            />
          ),
          footer: null,
        });
      } else {
        message.success(`成功下发${successAmount}个任务!`);
        this.setState({
          loading: false,
          multiple: false,
          selectedRows: [],
          selectedRowKeys: [],
        });
        this.fetchDataAndSetInitValue();
        this.props.fetchWorkstationItems();
      }
    };
    this.setState({ loading: true });
    if (params.inject === true) {
      const {
        data: { data },
      } = await distributeInjectTasks(tasks.map(e => e.taskCode)).finally(e => {
        this.setState({ loading: false });
        callback(data);
      });
    } else {
      const {
        data: { data },
      } = await distributeTasks({ tasks: tasks.map(e => ({ code: e.taskCode })) }).finally(e => {
        this.setState({ loading: false });
      });
      if (sensors) {
        sensors.track('web_cooperate_taskSchedule_create', {
          amount: data && data.successAmount,
          Status: '已取消',
        });
      }
      callback(data);
    }
  };

  showInfoModal(title) {
    Modal.warning({ title });
  }

  renderMultipleAction = () => {
    const { pagination, selectedRows } = this.state;
    return (
      <div>
        <Button
          type="ghost"
          auth={auth.WEB_DISTRIBUTE_PLAN_TASK}
          style={{ marginRight: 10 }}
          onClick={async () => {
            if (!selectedRows.length) {
              message.error('请选择任务');
              return;
            }
            this.distributeTasks(selectedRows);
          }}
        >
          <Icon iconType={'gc'} type={'piliangcaozuo'} />
          批量下发
        </Button>
        <Button
          type="ghost"
          onClick={async () => {
            if (!selectedRows.length) {
              message.error('请选择任务');
              return;
            }
            const { params } = this.state;
            if (params.inject === true) {
              await this.revokeInjectTasks(selectedRows);
            } else {
              const res = await getTransferApplyFromTask(selectedRows.map(e => e.taskCode), { status: 1 });
              const transferApply = _.get(res, 'data.data');
              if (Array.isArray(transferApply) && transferApply.length) {
                Modal.confirm({
                  iconType: 'exclamation-circle',
                  className: `${styles.enableModal}`,
                  title: '',
                  content: `撤回的生产任务关联以下转移申请${arrayRemoveDuplicates(transferApply.map(e => e.code)).join(
                    ',',
                  )}。撤回这些任务吗？`,
                  okText: '确认',
                  cancelText: '取消',
                  onOk: async () => {
                    await this.revokeTasks(selectedRows);
                  },
                });
              } else {
                await this.revokeTasks(selectedRows);
              }
            }
          }}
        >
          <Icon iconType={'gc'} type={'piliangchehui'} />
          批量撤回
        </Button>
        <Tooltip title={'可以批量下发执行状态为已取消的计划生产任务，可以批量撤回任务状态为未开始或已取消的生产任务。'}>
          <Icon style={{ marginLeft: 10 }} color={blacklakeGreen} type="exclamation-circle-o" theme="outlined" />
        </Tooltip>
        <Button
          type="ghost"
          style={{ marginLeft: 10 }}
          onClick={async () => {
            if (!selectedRows.length) {
              message.error('请选择任务');
              return;
            }
            const selectedWithInMaterial = selectedRows.filter(e => Array.isArray(e.inMaterial) && e.inMaterial.length);
            if (!selectedWithInMaterial.length) {
              message.error('所有任务都无计划投入物料，无法创建转移申请');
            } else {
              this.context.router.history.push({
                pathname: '/cooperate/taskSchedule/createTransferApply',
                search: `?taskCodes=${selectedRows.map(e => e.taskCode).join(',')}`,
                state: {
                  test: 1,
                },
              });
            }
          }}
        >
          <Icon iconType={'gc'} type={'piliangcaozuo'} />
          批量创建转移申请
        </Button>
        <Button
          type="ghost"
          style={{ margin: '0 5px 10px' }}
          onClick={() => {
            this.fetchDataAndSetInitValue({ page: 1 });
          }}
        >
          取消
        </Button>
        <span style={{ margin: '0 5px' }}>已选{selectedRows.length}个结果</span>
      </div>
    );
  };

  render() {
    const { taskCode } = this.props;
    const { data, multiple, pagination, selectedRows, params, loading } = this.state;
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
    let actions;
    if (params.inject === true) {
      actions = null;
    } else if (multiple) {
      actions = this.renderMultipleAction(data);
    } else {
      actions = (
        <div style={{ marginBottom: 10 }}>
          <Button
            style={{ marginRight: 10 }}
            onClick={() =>
              this.setState({ multiple: true }, () => {
                this.fetchData({ page: 1 });
              })
            }
          >
            <Icon iconType={'gc'} type={'piliangcaozuo'} />
            <PlainText text="批量操作" />
          </Button>
          <a href={`${location.pathname}/revokeTaskLogList`} target="_blank" rel="noopener noreferrer">
            <Icon iconType={'gc'} style={{ paddingRight: 4 }} type="chakanjilu-hui" />
            <PlainText text="查看撤回日志" />
          </a>
        </div>
      );
    }
    const columns = this.getColumns();
    return (
      <Spin spinning={loading}>
        <div style={{ margin: '0 20px' }}>
          <Filter
            initialValue={{ taskCode }}
            onFilter={(params, extra) => {
              this.fetchDataAndSetInitValue({ ...params, page: 1 });
            }}
          />
          {actions}
          <Table
            dragable
            style={{
              flex: 1,
              margin: 0,
              maxHeight: 400,
              overflowY: 'auto',
              paddingBottom: Array.isArray(data) && data.length ? 64 : 0,
            }}
            tableUniqueKey={DISTRIBUTED_TABLE_UNIQU_KEY}
            useColumnConfig
            pagination={{ ...pagination, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
            onChange={(pagination, filter, sorter) => {
              const { pagination: _pagination } = this.state;
              if (pagination.pageSize === _pagination.pageSize && pagination.current === _pagination.current) {
                this.setState({ sortInfo: { order: sorter.order, sortBy: sorter.field } });
                this.fetchData({
                  sortBy: sorter.field,
                  order: sorter.order,
                });
              } else {
                this.fetchData({ size: pagination && pagination.pageSize, page: pagination && pagination.current });
              }
            }}
            onExpand={async (expanded, record) => {
              if (expanded && arrayIsEmpty(record.children)) {
                const {
                  data: { data: childrenProcess },
                } = await getInjectTaskSub(record.taskCode);
                record.children = Array.isArray(childrenProcess)
                  ? childrenProcess.map(e => {
                      const { materialCode, materialName, amount, workstations } = e;
                      return {
                        workOrderDirect: 1,
                        category: 3,
                        ...formatInjectTask(e),
                        availableWorkstations: workstations,
                        outMaterial: [{ code: materialCode, name: materialName }],
                        planAmount: amount,
                        isChildren: true,
                      };
                    })
                  : [];
                const { data } = this.state;
                this.setState({ data });
              }
            }}
            rowKey={record => `${record.taskCode}`}
            bordered
            columns={columns}
            dataSource={data}
            rowSelection={multiple ? rowSelection : null}
            scroll={{ y: 290 }}
          />
        </div>
      </Spin>
    );
  }
}

ProcessTable.contextTypes = {
  router: {},
};

export default ProcessTable;
