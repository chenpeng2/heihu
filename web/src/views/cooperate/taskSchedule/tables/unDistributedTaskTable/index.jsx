import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import LocalStorage from 'src/utils/localStorage';
import {
  openModal,
  message,
  Table,
  Tooltip,
  Link,
  Button,
  Icon,
  Spin,
  Popover,
  Popconfirm,
  SimpleTable,
  PlainText,
} from 'components';
import moment, { format, formatUnix, formatUnixMoment, formatToUnix } from 'utils/time';
import { getPurchaseOrderDetail } from 'src/services/cooperate/purchaseOrder';
import { getBaitingWorkOrderConfig } from 'utils/organizationConfig';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { replaceSign } from 'constants';
import { round, thousandBitSeparator } from 'utils/number';
import { arrayIsEmpty } from 'utils/array';
import {
  queryTask,
  distributeTasks,
  cancelTasks,
  lockTasks,
  unlockTasks,
  queryInjectTask,
  distributeInjectTasks,
  getInjectTaskSub,
} from 'src/services/schedule';
import SecondStorageSelect from 'src/containers/materialRequest/base/form/secondeStorageSelect';
import { getBulkFeedingStorageByWorkstation } from 'services/workstation';
import auth from 'utils/auth';
import DestinationSelect from './DestinationSelect';
import Filter from './filter';
import TaskModal from '../taskModal';
import editProduceTask from '../../editTask';
import editInjectTask from '../../form/injectTaskForm/edit';
import { getWorkOrderDetailPath, formatTask, formatInjectTask } from '../../utils';
import { UNDISTRIBUTED_TABLE_UNIQUE_KEY } from '../../constants';
import TransferApplyProgress from '../distributedTaskTable/transferApplyProgress';
import checkDistributedTask from './checkDistributedTask';

const NewTagLink = Link.NewTagLink;

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
    expandedRowKeys: [],
    params: {},
    data: [],
    isSendMaterialRequest: false,
    sourceStorageId: '',
    transitStorageId: '',
    sortInfo: null,
  };

  targetIds = {};

  componentDidMount() {
    const filterDistribute = LocalStorage.get('taskScheduleProcessTableFilterDistribute');
    const { taskCode } = this.props;
    const baitingWorkOrderConfig = getBaitingWorkOrderConfig();
    const pageSize = getTablePageSizeFromLocalStorage(UNDISTRIBUTED_TABLE_UNIQUE_KEY);
    this.setState({ baitingWorkOrderConfig });
    this.fetchData({ filterDistribute, taskCode, size: pageSize });
  }

  fetchDataAndSetInitValue = async params => {
    this.setInitValue(() => {
      this.fetchData(params);
    });
  };

  setInitValue = cb => {
    this.targetIds = {};
    this.setState(
      {
        multiple: false,
        expandedRowKeys: [],
        selectedRowKeys: [],
        selectedRows: [],
        isSendMaterialRequest: false,
        sourceStorageId: '',
        transitStorageId: '',
        type: undefined,
      },
      () => {
        if (typeof cb === 'function') {
          cb();
        }
      },
    );
  };

  fetchData = async params => {
    const { multiple, type } = this.state;
    const variables = Object.assign(
      {},
      {
        page: 1,
        size: 10,
        ...this.state.sortInfo,
        ...this.state.params,
        ...params,
        distributed: false,
        filterBy: type === 'distribute' ? 'access' : type,
      },
    );
    this.setState({ params: variables });
    const { inject } = variables;
    if (inject === true) {
      await this.fetchInjectTask(variables);
    } else {
      await this.fetchTask(variables);
    }
  };

  fetchTask = async params => {
    this.setState({ loading: true });
    const { data } = await queryTask(params);
    this.setState({
      loading: false,
      data: Array.isArray(data.data) ? data.data.map(e => formatTask(e)) : [],
      pagination: {
        total: data.count,
        pageSize: params && params.size,
        current: (params && params.page) || 1,
      },
    });
  };

  fetchInjectTask = async params => {
    this.setState({ loading: true });
    const { data } = await queryInjectTask(params);
    this.setState({
      loading: false,
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
        pageSize: params && params.size,
        current: (params && params.page) || 1,
      },
    });
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
          const { conflicts, auditInfo } = record;
          let icon;
          let auditIcon;
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
          if (auditInfo) {
            if (!auditInfo.failFlag) {
              auditIcon = <Icon iconType="gc" color={'rgba(151, 151, 151, 0.4)'} type="daishenpi" />;
            } else {
              auditIcon = (
                <Tooltip
                  title={
                    <div style={{ display: 'flex' }}>
                      该生产任务未审批通过{auditInfo.failReason ? `，不通过原因是：${auditInfo.failReason}` : ''}
                      。请及时调整。调整后请重新下发。
                    </div>
                  }
                >
                  <Icon iconType="gc" color={'rgba(1255, 59, 48, 0.6)'} type="daishenpi" />
                </Tooltip>
              );
            }
          }
          return (
            <Fragment>
              <span>{taskCode || replaceSign}</span> {icon} {auditIcon}
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
          workOrderCode ? <NewTagLink href={getWorkOrderDetailPath(record)}>{workOrderCode}</NewTagLink> : replaceSign,
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
          title: (
            <div>
              <PlainText text="下发进度" />
              {baitingWorkOrderConfig ? (
                <Tooltip
                  title={
                    <div style={{ display: 'flex' }}>
                      <div>下料工单显示计划投入物料的下发进度</div>
                    </div>
                  }
                >
                  <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} style={{ paddingLeft: 4 }} />
                </Tooltip>
              ) : null}
            </div>
          ),
          width: 120,
          dataIndex: 'distributeProgress',
          key: 'distributeProgress',
          render: (distributeProgress, record) => {
            const { distributeNum, denominator } = record;
            return `${
              typeof distributeNum === 'number' ? thousandBitSeparator(round(distributeNum, 6)) : replaceSign
            }/${typeof denominator === 'number' ? thousandBitSeparator(round(denominator, 6)) : replaceSign}`;
          },
        },
      ]);
    }
    columns = columns.concat([
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
        title: '执行人',
        width: 120,
        dataIndex: 'executors',
        key: 'executors',
        render: executors =>
          Array.isArray(executors) && executors.length ? executors.map(e => e.name).join(',') : replaceSign,
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
        render: (workstations = [], record) => (
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
        title: '创建时间',
        width: 140,
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        sortOrder: this.state.sortInfo && this.state.sortInfo.order,
        render: createdAt => (createdAt ? formatUnix(createdAt) : replaceSign),
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
      {
        title: '操作',
        width: 60,
        dataIndex: 'taskCode',
        key: 'action',
        render: (taskCode, record) => {
          const { access, isChildren } = record;
          return isChildren ? null : (
            <Link
              disabled={!access}
              onClick={() => {
                if (params.inject === true) {
                  editInjectTask(
                    { taskCode, task: record, isModal: true },
                    {
                      onSuccess: () => {
                        this.fetchDataAndSetInitValue({ page: 1 });
                        this.props.fetchWorkstationItems();
                      },
                    },
                  );
                } else {
                  editProduceTask(
                    { taskCode, isModal: true },
                    {
                      onSuccess: () => {
                        this.fetchDataAndSetInitValue({ page: 1 });
                        this.props.fetchWorkstationItems();
                      },
                    },
                  );
                }
              }}
            >
              编辑
            </Link>
          );
        },
      },
    ]);
    return columns;
  };

  renderSelectStorageModal = async callback => {
    const { selectedRows, sourceStorageId } = this.state;
    if (!sourceStorageId) {
      message.error('请填写仓位!');
      return;
    }
    if (selectedRows.every(({ inputMaterialRequest }) => inputMaterialRequest === false)) {
      const {
        data: { data },
      } = await distributeTasks({
        sourceStorageId,
        tasks: selectedRows.map(({ taskCode }) => ({
          code: taskCode,
        })),
      });
      callback(data, '下发成功，未配置投入物料所以未创建物料请求。');
      return;
    }

    const requestType = LocalStorage.get('CONFIG').config_material_request_type.configValue;
    if (requestType === '1') {
      const workstationIds = selectedRows.map(({ workstationId }) => workstationId);
      const {
        data: { data },
      } = await getBulkFeedingStorageByWorkstation(workstationIds);
      const workstationWithStorages = {};
      data.forEach(({ storage, workstationId }) => {
        let arr = [];
        storage.forEach(({ children }) => {
          children.forEach(({ children }) => {
            arr = [...arr, ...children];
          });
        });
        workstationWithStorages[workstationId] = arr;
      });
      const shouldSend = selectedRows.every(({ workstationId }) => workstationWithStorages[workstationId].length === 1);
      if (shouldSend) {
        const {
          data: { data },
        } = await distributeTasks({
          sourceStorageId,
          tasks: selectedRows.map(({ taskCode, workstationId }, index) => ({
            code: taskCode,
            targetStorageId: workstationWithStorages[workstationId][0].id,
          })),
        });
        callback(data);
        return;
      }
    }
    if (!sourceStorageId) {
      message.error('请选择请求仓位');
      return;
    }
    const columns = [
      {
        title: '任务编号',
        dataIndex: 'taskCode',
        key: 'taskCode',
      },
      {
        title: '计划产出物料',
        dataIndex: 'outMaterialCode',
        key: 'outMaterialCode',
        render: (outMaterialCode, record) =>
          outMaterialCode ? <Tooltip length={13} text={`${outMaterialCode}/${record.outMaterialName}`} /> : replaceSign,
      },
      {
        title: '工序',
        dataIndex: 'processName',
        key: 'processName',
        render: (processName, record) =>
          record.processSeq && processName ? `${record.processSeq}/${processName}` : replaceSign,
      },
      {
        title: '目的地',
        dataIndex: 'workstationId',
        key: 'workstationId',
        render: (id, { taskCode }) => (
          <DestinationSelect
            workstationId={id}
            onChange={value => {
              this.targetIds[taskCode] = value.value.split('-')[1];
            }}
          />
        ),
      },
    ].map(node => ({ ...node, width: 150 }));
    const dataSource = selectedRows.filter(({ inputMaterialRequest }) => inputMaterialRequest === true);
    openModal({
      title: '选择中转仓位',
      onOk: async () => {
        const { transitStorageId, sourceStorageId, selectedRows } = this.state;
        if ((requestType === '2' && !transitStorageId) || Object.keys(this.targetIds).length !== dataSource.length) {
          message.error('请填写所有信息！');
          return;
        }
        const {
          data: { data },
        } = await distributeTasks({
          transitStorageId,
          sourceStorageId,
          tasks: selectedRows.map(({ taskCode }) => ({
            code: taskCode,
            targetStorageId: this.targetIds[taskCode],
          })),
        });
        callback(data);
      },
      onClose: () => {
        this.setState({
          transitStorageId: '',
        });
        this.targetIds = {};
      },
      children: (
        <div style={{ paddingTop: 10 }}>
          {requestType === '2' && (
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 10 }}
              className="child-gap"
            >
              <span>中转仓位</span>
              <SecondStorageSelect
                style={{ width: 150 }}
                onChange={value => {
                  this.setState({ transitStorageId: value.value && value.value.split('-')[1] });
                }}
              />
            </div>
          )}
          <SimpleTable
            pagination={false}
            columns={columns}
            dataSource={dataSource}
            scroll={{ y: 250, x: columns.length * 150 }}
          />
        </div>
      ),
    });
  };

  _distributeTasks = async () => {
    const { selectedRows, isSendMaterialRequest } = this.state;
    const callback = (data, successText) => {
      const { detail } = data;
      if (detail && detail.length) {
        openModal({
          title: '下发失败',
          children: (
            <TaskModal
              data={detail}
              cb={() => {
                this.props.fetchWorkstationItems();
                this.fetchDataAndSetInitValue();
              }}
            />
          ),
          footer: null,
        });
      } else {
        message.success(successText || '批量下发成功!');
        this.setState({
          loading: false,
        });
        this.fetchDataAndSetInitValue();
        this.props.fetchWorkstationItems();
      }
    };
    this.setState({ loading: true });
    if (this.state.params.inject === true) {
      const handleInjectDistributeTasks = async () => {
        const {
          data: { data },
        } = await distributeInjectTasks(selectedRows.map(e => e.taskCode)).finally(() => {
          this.setState({ loading: false });
        });
        callback(data);
      };
      checkDistributedTask({
        codes: selectedRows.map(({ taskCode }) => taskCode),
        callback: handleInjectDistributeTasks,
        isInject: true,
        handleLoading: this.handleLoading,
      });
    } else {
      if (isSendMaterialRequest) {
        this.renderSelectStorageModal(callback);
        return;
      }
      const tasks = selectedRows.map(e => ({ code: e.taskCode }));
      const handleDistributeTasks = async () => {
        const {
          data: { data },
        } = await distributeTasks({
          tasks,
        }).finally(e => {
          this.setState({ loading: false });
        });
        if (sensors) {
          sensors.track('web_cooperate_taskSchedule_create', {
            amount: data && data.successAmount,
            Status: '待下发',
          });
        }
        callback(data);
      };
      await checkDistributedTask({
        codes: tasks.map(({ code }) => code),
        callback: handleDistributeTasks,
        handleLoading: this.handleLoading,
      });
    }
  };

  _lockTasks = async () => {
    const { selectedRows } = this.state;
    this.setState({ loading: true });
    const tasks = selectedRows.map(e => e.taskCode);
    const {
      data: { data },
    } = await lockTasks(tasks).finally(() => {
      this.setState({ loading: false });
    });
    this.fetchDataAndSetInitValue({ page: 1 });
    this.props.fetchWorkstationItems();
    message.success(`${data.successAmount}个任务锁定成功,${data.failureAmount}个任务锁定失败`);
  };

  _unlockTasks = async () => {
    const { selectedRows } = this.state;
    this.setState({ loading: true });
    const tasks = selectedRows.map(e => e.taskCode);
    const {
      data: { data },
    } = await unlockTasks(tasks).finally(() => {
      this.setState({ loading: false });
    });
    this.fetchDataAndSetInitValue({ page: 1 });
    this.props.fetchWorkstationItems();
    message.success(`${data.successAmount}个任务解锁成功,${data.failureAmount}个任务解锁失败`);
  };

  _cancelTasks = async () => {
    const { selectedRows } = this.state;
    this.setState({ loading: true });
    const tasks = selectedRows.map(e => e.taskCode);
    const {
      data: { data },
    } = await cancelTasks(tasks).finally(() => {
      this.setState({ loading: false });
    });
    this.fetchDataAndSetInitValue({ page: 1 });
    this.props.fetchWorkstationItems();
    message.success(`${data.successAmount}个任务取消成功,${data.failureAmount}个任务取消失败`);
  };

  doActions = async () => {
    const { type } = this.state;
    if (type === 'distribute') {
      await this._distributeTasks();
    } else if (type === 'lock') {
      await this._lockTasks();
    } else if (type === 'unlock') {
      await this._unlockTasks();
    } else if (type === 'cancelTasks') {
      await this._cancelTasks();
    } else {
      throw new Error('未知的操作类型');
    }
  };

  renderActionButtons = () => {
    const { multiple, type, selectedRows, params } = this.state;
    const { inject } = params;
    let submitButton = (
      <Button
        style={{ margin: '0 5px 10px' }}
        onClick={async () => {
          if (!selectedRows.length) {
            message.error('请选择任务');
            return;
          }
          this.doActions();
        }}
      >
        确定
      </Button>
    );
    if (type === 'cancel') {
      submitButton = (
        <Popconfirm
          title={'确定要取消任务吗?'}
          okText={'确定取消'}
          okType={'danger'}
          cancelText={'暂不取消'}
          onConfirm={() => {
            if (!selectedRows.length) {
              message.error('请选择任务');
              return;
            }
            this._cancelTasks();
          }}
        >
          <Button style={{ margin: '0 5px 10px' }}>确定</Button>
        </Popconfirm>
      );
    }
    return multiple ? (
      <div>
        {submitButton}
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
        {/* <span className="child-gap">
              <Checkbox
                style={{ display: 'inline' }}
                checked={isSendMaterialRequest}
                onChange={e => {
                  if (!e.target.checked) {
                    this.setState({ sourceStorageId: undefined });
                  }
                  this.setState({ isSendMaterialRequest: e.target.checked });
                }}
              />
              <span>发送物料请求</span>
              <Popover content={<div>勾选发送物料请求后，会自动发送物料请求至指定仓库</div>}>
                <Icon type="exclamation-circle" color={alertYellow} />
              </Popover>
              {isSendMaterialRequest && (
                <StorageSelect placeholder="请选择" level={2} disabledParent onChange={value => this.setState({ sourceStorageId: value })} />
              )}
            </span> */}
      </div>
    ) : (
      <div style={{ marginBottom: 10 }}>
        <Button
          style={{ marginRight: 10 }}
          auth={auth.WEB_DISTRIBUTE_PLAN_TASK}
          onClick={() =>
            this.setState({ multiple: true, type: 'distribute', expandRowKeys: [] }, () => {
              this.fetchData({ page: 1 });
            })
          }
        >
          <Icon iconType={'gc'} type={'piliangcaozuo'} />
          批量下发
        </Button>
        {inject === true ? null : (
          <Fragment>
            <Button
              style={{ marginRight: 10 }}
              auth={auth.WEB_DISTRIBUTE_PLAN_TASK}
              onClick={() =>
                this.setState({ multiple: true, type: 'lock', expandRowKeys: [] }, () => {
                  this.fetchData({ page: 1 });
                })
              }
            >
              <Icon iconType={'gc'} type={'piliangcaozuo'} />
              批量锁定
            </Button>
            <Button
              style={{ marginRight: 10 }}
              auth={auth.WEB_DISTRIBUTE_PLAN_TASK}
              onClick={() =>
                this.setState({ multiple: true, type: 'unlock', expandRowKeys: [] }, () => {
                  this.fetchData({ page: 1 });
                })
              }
            >
              <Icon iconType={'gc'} type={'piliangcaozuo'} />
              批量解锁
            </Button>
            <Button
              auth={auth.WEB_DISTRIBUTE_PLAN_TASK}
              onClick={() =>
                this.setState({ multiple: true, type: 'cancel', expandRowKeys: [] }, () => {
                  this.fetchData({ page: 1 });
                })
              }
            >
              <Icon iconType={'gc'} type={'piliangcaozuo'} />
              批量取消
            </Button>
          </Fragment>
        )}
        <a
          style={{ paddingLeft: 8 }}
          href={`${location.pathname}/distributeTaskLogList`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon iconType={'gc'} style={{ paddingRight: 4 }} type="chakanjilu-hui" />
          查看下发日志
        </a>
      </div>
    );
  };

  handleLoading = loading => this.setState({ loading });

  render() {
    const { taskCode } = this.props;
    const { data, multiple, selectedRows, pagination, isSendMaterialRequest, expandedRowKeys, loading } = this.state;
    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: record.isChildren,
      }),
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
      <Spin spinning={loading}>
        <div style={{ margin: '0 20px' }}>
          <Filter
            initialValue={{ taskCode }}
            onFilter={(params, extra) => {
              this.fetchDataAndSetInitValue({ ...params, page: 1 });
            }}
          />
          {this.renderActionButtons()}
          <Table
            style={{
              flex: 1,
              margin: 0,
              maxHeight: 405,
              paddingBottom: Array.isArray(data) && data.length ? 64 : 0,
            }}
            tableUniqueKey={UNDISTRIBUTED_TABLE_UNIQUE_KEY}
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
                this.fetchData({ page: pagination && pagination.current, size: pagination && pagination.pageSize });
              }
            }}
            expandedRowKeys={expandedRowKeys}
            onExpandedRowsChange={expandedRows => {
              this.setState({ expandedRowKeys: expandedRows });
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
            dragable
            rowSelection={multiple ? rowSelection : null}
            scroll={{ y: 290 }}
          />
        </div>
      </Spin>
    );
  }
}

export default ProcessTable;
