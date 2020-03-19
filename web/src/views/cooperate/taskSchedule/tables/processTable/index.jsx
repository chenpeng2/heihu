import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import Proptypes from 'prop-types';
import {
  Table,
  openModal,
  Icon,
  message,
  Checkbox,
  Tooltip,
  Link,
  Button,
  InputNumber,
  Spin,
  SimpleTable,
  PlainText,
  Popover,
} from 'components';
import { closeModal } from 'components/modal';
import { replaceSign } from 'constants';
import SearchSelect from 'components/select/searchSelect';
import auth from 'utils/auth';
import withForm from 'components/form';
import { error, blacklakeGreen, alertYellow } from 'styles/color';
import { arrayIsEmpty } from 'utils/array';
import LocalStorage, { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import {
  queryWorkOrderProcess,
  queryWorkOrderProcessInject,
  createTasks,
  queryWorkOrderMaterials,
  getLastProcessInject,
} from 'services/schedule';
import { getPurchaseOrderDetail } from 'services/cooperate/purchaseOrder';
import { round, thousandBitSeparator } from 'utils/number';
import { getBaitingWorkOrderConfig } from 'utils/organizationConfig';
import moment, { formatToUnix, formatUnix } from 'utils/time';
import ScheduleLogicModal from './scheduleLogicModal';
import createProdTask from '../../createTask';
import createInjectTask from '../../form/injectTaskForm/create';
import BulkCreateInjectTask from '../../form/injectTaskForm/bulkCreateTask';
import BulkCreateTask from '../../bulkCreateTask';
import { getWorkOrderDetailPath } from '../../utils';
import Filter from './filter';
import { PROCESS_TABLE_UNIQUE_KEY } from '../../constants';

type Props = {
  form: {
    setFieldsValue: () => {},
  },
  fetchWorkstationItems: () => {},
};

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
}

class ProcessTable extends Component {
  props: Props;

  state = {
    multiple: false,
    data: [],
    params: {},
    selectedRows: [],
    selectedRowsKeys: [],
    scheduleLogicValue: {
      baseTime: moment()
        .hour(moment().hour() + 1)
        .minutes(0)
        .second(0),
      processStrategy: 0,
      workstationStrategy: 0,
    },
    sortInfo: {
      order: 'descend',
      sortBy: 'createdAt',
    },
    isOccupyStorage: false,
    occupyStorage: undefined,
  };

  componentDidMount() {
    const filterSchedule = LocalStorage.get('taskScheduleProcessTableFilterSchedule');
    const filterDistribute = LocalStorage.get('taskScheduleProcessTableFilterDistribute');
    const scheduleLogicValue = LocalStorage.get('taskScheduleLogicModalValue');
    const baitingWorkOrderConfig = getBaitingWorkOrderConfig();
    const pageSize = getTablePageSizeFromLocalStorage(PROCESS_TABLE_UNIQUE_KEY);
    this.setState({ baitingWorkOrderConfig });
    if (scheduleLogicValue) {
      const { baseTime, deadline } = scheduleLogicValue;
      scheduleLogicValue.baseTime = baseTime
        ? moment(baseTime)
        : moment()
            .hour(moment().hour() + 1)
            .minutes(0)
            .second(0);
      if (deadline) {
        scheduleLogicValue.deadline = moment(deadline);
      }
      this.setState({ scheduleLogicValue });
    }
    this.fetchData({ filterSchedule, filterDistribute, size: pageSize });
  }

  setInitValue = cb => {
    this.setState(
      {
        allchecked: false,
        multiple: false,
        type: undefined,
        selectedRows: [],
        selectedRowKeys: [],
        isOccupyStorage: false,
        occupyStorage: undefined,
      },
      () => {
        if (typeof cb === 'function') {
          cb();
        }
      },
    );
  };

  fetchDataAndSetInitValue = async params => {
    this.setInitValue(() => {
      this.fetchData(params);
    });
  };

  fetchData = async params => {
    const { type } = this.state;
    this.setState({ loading: true });

    const variables = Object.assign(
      {},
      { page: 1, size: 10, ...this.state.sortInfo, ...this.state.params, ...params, filterBy: type },
    );
    this.setState({ params: variables });
    if (variables.inject) {
      await this.fetchWorkOrderProcessInject(variables);
    } else {
      await this.fetchWorkOrderProcess(variables);
    }
  };

  fetchWorkOrderProcess = async params => {
    const { data } = await queryWorkOrderProcess({ ...params }).finally(() => {
      this.setState({ loading: false });
    });
    this.setState({
      data: Array.isArray(data.data)
        ? data.data.map(e => ({ ...this.formatProcessData(e), isInjectPreProcess: e.category === 3 }))
        : [],
      pagination: {
        total: data.count,
        current: (params && params.page) || 1,
        pageSize: (params && params.size) || 10,
      },
    });
  };

  formatProcessData = data => {
    const { workOrderCode, processSeq, amountFaulty, amountQualified, denominator, distributeNum, scheduleNum } = data;
    return {
      ...data,
      key: `${workOrderCode}-${processSeq}`,
      subNum: [
        {
          amountFaulty,
          amountQualified,
          denominator,
          distributeNum,
          scheduleNum,
        },
      ],
    };
  };

  fetchWorkOrderProcessInject = async params => {
    const { data } = await queryWorkOrderProcessInject({ ...params }).finally(() => {
      this.setState({ loading: false });
    });
    this.setState({
      data: Array.isArray(data.data)
        ? data.data.map(e => ({
            ...e,
            purchaseCode: e.purchaseOrderCode,
            workOrderOutMaterial: e.workOutMaterial,
            outMaterial: Array.isArray(e.outMaterial)
              ? e.outMaterial.map(e => ({ ...e, ..._.get(e, 'material') }))
              : { ...e.outMaterial, ..._.get(e, 'outMaterial.material') },
            workOrderInMaterial: Array.isArray(e.inMaterial)
              ? e.inMaterial.map(e => ({ ...e, ..._.get(e, 'material') }))
              : { ...e.inMaterial, ..._.get(e, 'inMaterial.material') },
            key: `${e.workOrderCode}-${e.processSeq}`,
            children: [],
          }))
        : [],
      pagination: {
        total: data.count,
        current: (params && params.page) || 1,
        pageSize: (params && params.size) || 10,
      },
    });
  };
  // disable今天之前的日期
  getDisableDate = current => {
    return (
      current &&
      current <
        moment()
          .subtract('day', 1)
          .endOf('day')
    );
  };

  getDisabledTime = current => {
    if (current && current.isSame(moment(), 'day')) {
      return {
        disabledHours: () => range(0, moment().hour() + (moment().minute() ? 2 : 1)),
      };
    }
    return {};
  };

  onSchedule = async () => {
    const { selectedRows, type, scheduleLogicValue, isOccupyStorage, occupyStorage, params } = this.state;
    if (!selectedRows.length) {
      message.error('请选择待排程工序');
      return;
    }
    if (type === 'auto') {
      const { isCheckStorage, baseTime, deadline, sourceWarehouseCode, level, ...rest } = scheduleLogicValue;
      this.setState({ loading: true });
      if (isCheckStorage && !sourceWarehouseCode) {
        message.error('请选择仓位');
        return;
      }
      const values = {
        tasks: selectedRows.map(({ workOrderCode, processSeq, amount, num, denominator, scheduleNum }) => ({
          workOrderCode,
          processSeq,
          amount,
          num,
        })),
        ...rest,
        baseTime: formatToUnix(baseTime),
        deadline: deadline && formatToUnix(deadline),
        sourceWarehouseCode: sourceWarehouseCode && sourceWarehouseCode.key,
      };
      const {
        data: {
          data: { tasks, failed, scheduleLog },
        },
      } = await createTasks(values).finally(e => {
        this.setState({ loading: false });
      });

      const conflictData =
        tasks &&
        tasks.filter(
          e =>
            e.conflicts &&
            e.conflicts.find(e => e.conflict === 'START_TIME_CONFLICTED' || e.conflict === 'END_TIME_CONFLICTED'),
        );

      if (sensors) {
        sensors.track('web_cooperate_taskSchedule_schedule', {
          amount: tasks.length - failed.length,
          Way: '批量自动排程',
        });
      }

      if ((conflictData && conflictData.length) || (failed && failed.length) || scheduleLog.failureAmount > 0) {
        openModal({
          title: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Icon type="check-circle" style={{ color: blacklakeGreen, fontSize: 26, marginRight: 5 }} />
              <div>
                <p>自动排程完成！</p>
                <p style={{ fontSize: 12 }}>
                  成功数：{scheduleLog.successAmount}，失败数：{scheduleLog.failureAmount}
                  <a
                    style={{ marginLeft: 5 }}
                    href={`/cooperate/taskSchedule/process-log-list/detail/${scheduleLog.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    查看详情
                  </a>
                </p>
              </div>
            </div>
          ),
          children: this.renderTaskModal(
            conflictData,
            () => {
              this.props.fetchWorkstationItems();
              this.fetchDataAndSetInitValue();
            },
            failed,
          ),
          footer: null,
        });
      } else {
        this.props.fetchWorkstationItems();
        this.fetchDataAndSetInitValue();
      }
    } else if (params.inject) {
      BulkCreateInjectTask(
        {
          workOrderCodes: selectedRows.map(({ workOrderCode }) => workOrderCode),
        },
        {
          onSuccess: res => {
            this.props.fetchWorkstationItems();
            this.fetchDataAndSetInitValue();
          },
        },
      );
    } else {
      if (isOccupyStorage && !occupyStorage) {
        message.error('请选择占用库存 ');
        return;
      }
      BulkCreateTask(
        {
          processes: selectedRows.map(({ processSeq, workOrderCode }) => ({ processSeq, workOrderCode })),
          sourceWarehouseCode: isOccupyStorage && occupyStorage ? occupyStorage.key : undefined,
        },
        {
          onSuccess: res => {
            if (sensors) {
              sensors.track('web_cooperate_taskSchedule_schedule', {
                amount: selectedRows.length,
                Way: '批量手动排程',
              });
            }
            this.props.fetchWorkstationItems();
            this.fetchDataAndSetInitValue();
          },
        },
      );
    }
  };

  getColumns = () => {
    const { fetchWorkstationItems } = this.props;
    const { multiple, type, baitingWorkOrderConfig, params } = this.state;
    let columns = [
      {
        title: '订单编号',
        width: 140,
        dataIndex: 'purchaseCode',
        key: 'purchaseCode',
        render: purchaseCode =>
          purchaseCode ? (
            <Link
              onClick={async () => {
                const {
                  data: { data: purchaseOrder },
                } = await getPurchaseOrderDetail(purchaseCode);
                window.open(`/cooperate/purchaseOrders/${purchaseOrder.id}/detail`, '_blank');
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
        width: 180,
        dataIndex: 'workOrderCode',
        key: 'workOrderCode',
        render: (workOrderCode, record) => {
          const { notice } = record;
          let icon;
          if (notice === 'processRoute') {
            icon = (
              <Tooltip
                title={
                  <div style={{ display: 'flex' }}>
                    <Icon type="exclamation-circle-o" style={{ paddingRight: 10 }} color={'rgba(0, 0, 0, 0.4)'} />
                    <div>该工单通过工艺路线创建，不支持自动排程。请使用手动排程功能！</div>
                  </div>
                }
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
              </Tooltip>
            );
          } else if (notice === 'mbomEbomNo') {
            icon = (
              <Tooltip
                title={
                  <div style={{ display: 'flex' }}>
                    <Icon type="exclamation-circle-o" style={{ paddingRight: 10 }} color={'rgba(0, 0, 0, 0.4)'} />
                    <div>用于该工单通过通过组件分配为否的生产BOM创建，不支持自动排程，请使用手动排程功能！</div>
                  </div>
                }
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
              </Tooltip>
            );
          }
          return (
            <div>
              <Link onClick={() => window.open(getWorkOrderDetailPath(record), '_blank')}>{workOrderCode}</Link>
              {icon}
            </div>
          );
        },
      },
      {
        title: '工单产出物料',
        width: 180,
        dataIndex: 'workOrderOutMaterial',
        render: workOrderOutMaterial => {
          return Array.isArray(workOrderOutMaterial) && workOrderOutMaterial.length
            ? workOrderOutMaterial.map(e => `${e.code}/${e.name}`).join(',')
            : replaceSign;
        },
      },
    ];
    if (params.inject) {
      columns.push({
        title: '模具定义编号',
        width: 150,
        dataIndex: 'toolCode',
        render: toolCode => toolCode || replaceSign,
      });
    }
    columns = columns.concat([
      {
        title: '成品物料规格',
        width: 180,
        key: 'workOrderOutMaterialDesc',
        dataIndex: 'workOrderOutMaterial',
        render: workOrderOutMaterial => {
          return Array.isArray(workOrderOutMaterial) && workOrderOutMaterial.length
            ? workOrderOutMaterial.map(e => e.desc || replaceSign).join(',')
            : replaceSign;
        },
      },
      {
        title: '工序',
        width: 180,
        dataIndex: 'processName',
        key: 'processName',
        render: (processName, record) => {
          const { notice } = record;
          let icon;
          if (notice === 'hasNotCapacity') {
            icon = (
              <Tooltip
                title={
                  <div style={{ display: 'flex' }}>
                    <div>
                      <Icon type="exclamation-circle-o" style={{ paddingRight: 10 }} color={'rgba(0, 0, 0, 0.4)'} />
                    </div>
                    <div>该工序没有维护标准产能，不支持自动排程。请使用手动排程功能！</div>
                  </div>
                }
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
              </Tooltip>
            );
          }
          return (
            <Fragment>
              {`${record.processSeq}/${processName}`} {icon}
            </Fragment>
          );
        },
      },
      {
        title: '投入物料',
        width: 100,
        dataIndex: 'displayMaterial',
        key: 'displayMaterial',
        render: (displayMaterial, record) => {
          const { category, workOrderInMaterial, inMaterial, isInjectPreProcess } = record;
          if (category === 1) {
            return displayMaterial ? (
              <Link
                onClick={async () => {
                  const {
                    data: {
                      data: { source, list },
                    },
                  } = await queryWorkOrderMaterials(record.workOrderCode, {
                    processCode: record.processCode,
                    processSeq: record.processSeq,
                  });
                  const columns = [
                    {
                      title: '物料编码／物料名称',
                      key: 'purchaseCode',
                      render: (_, record) => `${record.materialCode}/${record.materialName}`,
                    },
                  ];
                  openModal({
                    title: source === 1 ? '物料清单列表' : '当前工序投入物料列表',
                    footer: null,
                    innerContainerStyle: {
                      paddingTop: 30,
                      paddingBottom: 30,
                    },
                    children: (
                      <div>
                        <Table pagination={false} dataSource={list} columns={columns} />
                      </div>
                    ),
                  });
                }}
              >
                查看
              </Link>
            ) : (
              replaceSign
            );
          }
          if (isInjectPreProcess) {
            return Array.isArray(inMaterial) && inMaterial.length
              ? inMaterial.map(e => `${e.code}/${e.name}`).join(',')
              : replaceSign;
          }

          return Array.isArray(workOrderInMaterial) && workOrderInMaterial.length
            ? workOrderInMaterial.map(e => `${e.code}/${e.name}`).join(',')
            : replaceSign;
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
        title: '成品批次',
        width: 150,
        dataIndex: 'productBatchType',
        key: 'productBatchType',
        render: (_, { productBatchType, productBatch }) => {
          if (!productBatch) {
            return replaceSign;
          }
          return <Tooltip text={productBatch} length={10} />;
        },
      },
      {
        title: (
          <span>
            <PlainText text="排程进度" />
            {baitingWorkOrderConfig ? (
              <Tooltip
                title={
                  <div style={{ display: 'flex' }}>
                    <div>下料工单显示投入物料的排程进度</div>
                  </div>
                }
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} style={{ paddingLeft: 4 }} />
              </Tooltip>
            ) : null}
          </span>
        ),
        width: 120,
        dataIndex: 'subNum',
        key: 'scheduleProgress',
        render: (data, record) => {
          let style;
          const { subNum } = record;
          const { denominator, scheduleNum } = (subNum && subNum[0]) || {};
          if (denominator === scheduleNum) {
            style = { color: 'rgba(90, 90, 90, 0.8)' };
          }
          return (
            <span style={style}>
              {arrayIsEmpty(subNum)
                ? replaceSign
                : subNum
                    .map(
                      ({ scheduleNum, denominator }) =>
                        `${thousandBitSeparator(round(scheduleNum, 6))}/${thousandBitSeparator(round(denominator, 6))}`,
                    )
                    .join(',')}
            </span>
          );
        },
      },
      {
        title: (
          <div>
            <PlainText text="下发进度" />
            {baitingWorkOrderConfig ? (
              <Tooltip
                title={
                  <div style={{ display: 'flex' }}>
                    <div>下料工单显示投入物料的下发进度</div>
                  </div>
                }
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} style={{ paddingLeft: 4 }} />
              </Tooltip>
            ) : null}
          </div>
        ),
        width: 120,
        dataIndex: 'subNum',
        key: 'distributeProgress',
        render: (data, record) => {
          const { subNum } = record;
          let style;
          const { denominator, distributeNum } = (subNum && subNum[0]) || {};
          if (denominator === distributeNum) {
            style = { color: 'rgba(90, 90, 90, 0.8)' };
          }
          return (
            <span style={style} length={8}>
              {arrayIsEmpty(subNum)
                ? replaceSign
                : subNum
                    .map(
                      ({ distributeNum }) =>
                        `${thousandBitSeparator(round(distributeNum, 6))}/${thousandBitSeparator(
                          round(denominator, 6),
                        )}`,
                    )
                    .join(',')}
            </span>
          );
        },
      },
      {
        title: (
          <span>
            <PlainText text="已完成进度" />
            <Tooltip
              title={
                <div style={{ display: 'flex' }}>
                  <div>该工序对应的所有已结束的生产任务产出物料数量之和／该工序的计划产出数量</div>
                </div>
              }
            >
              <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} style={{ paddingLeft: 4 }} />
            </Tooltip>
          </span>
        ),
        width: 120,
        dataIndex: 'subNum',
        key: 'completeProgress',
        render: (data, record) => {
          const { subNum } = record;
          if (record.children || arrayIsEmpty(subNum)) {
            return replaceSign;
          }
          return subNum
            .map(
              ({ amountQualified, denominator }) =>
                `${thousandBitSeparator(amountQualified)}/${thousandBitSeparator(denominator)}`,
            )
            .join(',');
        },
      },
      {
        title: '可用工位',
        width: 120,
        dataIndex: 'workstations',
        key: 'workstations',
        render: (workstations, record) => (
          <div>
            <Tooltip text={`${workstations ? workstations.length : replaceSign}个`} length={8} />
            {workstations && workstations.length ? (
              <Link
                onClick={() => {
                  fetchWorkstationItems({ workstationIds: workstations });
                }}
              >
                查看负荷
              </Link>
            ) : null}
          </div>
        ),
      },
      {
        title: '工单创建时间',
        width: 140,
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        sortOrder: this.state.sortInfo.order,
        render: createdAt => (createdAt ? formatUnix(createdAt) : replaceSign),
      },
      {
        title: '工单计划开始时间',
        width: 140,
        dataIndex: 'planBeginTime',
        key: 'planBeginTime',
        render: planBeginTime => (planBeginTime ? formatUnix(planBeginTime, 'YYYY/MM/DD') : replaceSign),
      },
      {
        title: '工单计划结束时间',
        width: 140,
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        render: planEndTime => (planEndTime ? formatUnix(planEndTime, 'YYYY/MM/DD') : replaceSign),
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
        fixed: 'right',
        width: 100,
        key: 'account',
        render: (_, { workOrderCode, processSeq, access, isChildren }) =>
          isChildren ? null : (
            <div>
              <Link
                auth={auth.WEB_CREATE_PLAN_TASK}
                disabled={!access}
                onClick={() => {
                  // fetchWorkstationItems(workstations);
                  if (params.inject) {
                    createInjectTask(
                      { workOrderCode, processSeq },
                      {
                        onSuccess: res => {
                          const { data } = res;
                          if (!data) {
                            this.props.fetchWorkstationItems();
                            this.fetchDataAndSetInitValue();
                          } else {
                            const hasConflict =
                              data.conflicts &&
                              data.conflicts.find(
                                e => e.conflict === 'START_TIME_CONFLICTED' || e.conflict === 'END_TINE_CONFILICTED',
                              );
                            if (hasConflict) {
                              openModal({
                                title: '超出时间任务',
                                children: this.renderTaskModal([data], () => {
                                  this.props.fetchWorkstationItems();
                                  this.fetchDataAndSetInitValue();
                                }),
                                footer: null,
                              });
                            } else {
                              this.props.fetchWorkstationItems();
                              this.fetchDataAndSetInitValue();
                            }
                          }
                        },
                      },
                    );
                  } else {
                    createProdTask(
                      { workOrderCode, processSeq },
                      {
                        onSuccess: res => {
                          const { data } = res;
                          if (sensors) {
                            sensors.track('web_cooperate_taskSchedule_schedule', {
                              amount: 1,
                              Way: '手动排程',
                            });
                          }
                          const hasConflict =
                            data.conflicts &&
                            data.conflicts.find(
                              e => e.conflict === 'START_TIME_CONFLICTED' || e.conflict === 'END_TINE_CONFILICTED',
                            );
                          if (hasConflict) {
                            openModal({
                              title: '超出时间任务',
                              children: this.renderTaskModal([data], () => {
                                this.props.fetchWorkstationItems();
                                this.fetchDataAndSetInitValue();
                              }),
                              footer: null,
                            });
                          } else {
                            this.props.fetchWorkstationItems();
                            this.fetchDataAndSetInitValue();
                          }
                        },
                      },
                    );
                  }
                }}
              >
                手动排程
              </Link>
            </div>
          ),
      },
    ]);
    if (multiple && type === 'manual') {
      columns = _.dropRight(columns);
    }
    if (multiple && type === 'auto') {
      columns = [
        {
          title: '排程数量',
          width: 300,
          dataIndex: 'amount',
          key: 'amount',
          render: (amount, record) => {
            const { selectedRows } = this.state;
            const { denominator, scheduleNum, processSeq, workOrderCode } = record;
            const max = denominator - scheduleNum < 0 ? 0 : denominator - scheduleNum;
            const row = _.find(selectedRows, r => r.processSeq === processSeq && r.workOrderCode === workOrderCode);
            if (row && !row.amount) {
              row.amount = max;
            }
            if (row && !row.num) {
              row.num = 1;
            }
            return (
              <Fragment>
                <InputNumber
                  style={{ width: 80 }}
                  disabled={!row}
                  defaultValue={(row && row.amount) || max}
                  min={1}
                  onChange={value => {
                    row.amount = value;
                  }}
                />{' '}
                *{' '}
                <InputNumber
                  style={{ width: 80 }}
                  disabled={!row}
                  defaultValue={(row && row.num) || 1}
                  min={1}
                  onChange={value => {
                    row.num = value;
                  }}
                />
                个任务
              </Fragment>
            );
          },
        },
      ].concat(_.dropRight(columns));
    }
    return columns;
  };

  renderTaskModal = (conflictData, cb, insufficientData) => {
    return (
      <div>
        <div style={{ margin: 20 }}>
          {conflictData && conflictData.length > 0 && (
            <React.Fragment>
              <div style={{ marginBottom: 10 }}>以下已排程的任务时间超出所在工单计划时间，可以在待下发任务中查看：</div>
              <SimpleTable
                style={{ margin: 0 }}
                pagination={false}
                dataSource={conflictData}
                scroll={{ x: 150 * 8, y: 200 }}
                columns={[
                  {
                    title: '任务编号',
                    maxWidth: { C: 10 },
                    dataIndex: 'taskCode',
                    key: 'taskCode',
                    render: (taskCode, record) => <Tooltip text={taskCode || replaceSign} length={10} />,
                  },
                  {
                    title: '工序',
                    maxWidth: { C: 10 },
                    dataIndex: 'processCode',
                    key: 'processCode',
                    render: (processCode, record) => (
                      <Tooltip
                        text={`${processCode || replaceSign}/${record.processName || replaceSign}`}
                        length={10}
                      />
                    ),
                  },
                  {
                    title: '计划开始时间',
                    maxWidth: { C: 15 },
                    dataIndex: 'planBeginTime',
                    key: 'planBeginTime',
                    render: (planBeginTime, record) => {
                      const isStartTimeConflicted =
                        record.conflicts && record.conflicts.find(e => e.conflict === 'START_TIME_CONFLICTED');
                      return (
                        <Tooltip
                          containerStyle={{ color: isStartTimeConflicted ? '#FF3B30' : 'rgba(0, 0, 0, 0.6)' }}
                          text={(planBeginTime && formatUnix(planBeginTime)) || replaceSign}
                          length={20}
                        />
                      );
                    },
                  },
                  {
                    title: '计划结束时间',
                    maxWidth: { C: 15 },
                    dataIndex: 'planEndTime',
                    key: 'planEndTime',
                    render: (planEndTime, record) => {
                      const isEndTimeConflicted =
                        record.conflicts && record.conflicts.find(e => e.conflict === 'END_TIME_CONFLICTED');
                      return (
                        <Tooltip
                          containerStyle={{ color: isEndTimeConflicted ? '#FF3B30' : 'rgba(0, 0, 0, 0.6)' }}
                          text={(planEndTime && formatUnix(planEndTime)) || replaceSign}
                          length={20}
                        />
                      );
                    },
                  },
                  {
                    title: '订单编号',
                    maxWidth: { C: 10 },
                    dataIndex: 'purchaseOrderCode',
                    key: 'purchaseOrderCode',
                    render: (purchaseOrderCode, record) => (
                      <Link
                        onClick={() =>
                          window.open(
                            `/cooperate/purchaseOrders/${purchaseOrderCode}/detail?code=${encodeURIComponent(
                              purchaseOrderCode,
                            )}`,
                          )
                        }
                      >
                        <Tooltip text={purchaseOrderCode || replaceSign} length={10} />
                      </Link>
                    ),
                  },
                  {
                    title: '工单编号',
                    maxWidth: { C: 10 },
                    dataIndex: 'workOrderCode',
                    key: 'workOrderCode',
                    render: (workOrderCode, record) => (
                      <Link onClick={() => window.open(getWorkOrderDetailPath(record))}>
                        <Tooltip text={`${workOrderCode || replaceSign}`} length={10} />
                      </Link>
                    ),
                  },
                  {
                    title: '工单计划开始时间',
                    maxWidth: { C: 15 },
                    dataIndex: 'workOrderPlanBeginTime',
                    key: 'workOrderPlanBeginTime',
                    render: (workOrderPlanBeginTime, record) => {
                      const isStartTimeConflicted =
                        record.conflicts && record.conflicts.find(e => e.conflict === 'START_TIME_CONFLICTED');
                      return (
                        <Tooltip
                          containerStyle={{ color: isStartTimeConflicted ? '#FF3B30' : 'rgba(0, 0, 0, 0.6)' }}
                          text={(workOrderPlanBeginTime && formatUnix(workOrderPlanBeginTime)) || replaceSign}
                          length={20}
                        />
                      );
                    },
                  },
                  {
                    title: '工单计划结束时间',
                    maxWidth: { C: 15 },
                    dataIndex: 'workOrderPlanEndTime',
                    key: 'workOrderPlanEndTime',
                    render: (workOrderPlanEndTime, record) => {
                      const isEndTimeConflicted =
                        record.conflicts && record.conflicts.find(e => e.conflict === 'END_TIME_CONFLICTED');
                      return (
                        <Tooltip
                          containerStyle={{ color: isEndTimeConflicted ? '#FF3B30' : 'rgba(0, 0, 0, 0.6)' }}
                          text={(workOrderPlanEndTime && formatUnix(workOrderPlanEndTime)) || replaceSign}
                          length={20}
                        />
                      );
                    },
                  },
                ].map(node => ({ ...node, width: 150 }))}
              />
            </React.Fragment>
          )}
          {insufficientData && insufficientData.length > 0 && (
            <React.Fragment>
              <div style={{ margin: '10px 0' }}>以下工序因库存不足而排程失败：</div>
              <SimpleTable
                style={{ margin: 0 }}
                pagination={false}
                scroll={{ y: 200, x: 150 * 5 }}
                dataSource={insufficientData}
                columns={[
                  { title: '排程数量', dataIndex: 'amount' },
                  { title: '订单编号', dataIndex: 'purchaseCode' },
                  {
                    title: '工单编号',
                    dataIndex: 'workOrderCode',
                  },
                  {
                    title: '工序',
                    dataIndex: 'processName',
                    render: (processName, { processSeq }) => `${processSeq || replaceSign}/${processName}`,
                  },
                  {
                    title: '产出物料',
                    dataIndex: 'outMaterialCode',
                    render: (outMaterialCode, { outMaterialName }) => `${outMaterialCode}/${outMaterialName}`,
                  },
                ].map(node => ({ render: text => text || replaceSign, ...node, key: node.title, width: 150 }))}
              />
            </React.Fragment>
          )}
          <Button
            style={{ margin: '30px 0 0 350px', width: 114 }}
            type="default"
            onClick={() => {
              cb();
              closeModal();
            }}
          >
            关闭
          </Button>
        </div>
      </div>
    );
  };

  renderMultipleItems = data => {
    const {
      type,
      selectedRows,
      baseTime,
      allchecked,
      isCheckStorage,
      isOccupyStorage,
      occupyStorage,
      pagination,
    } = this.state;
    const context = this;
    let actions;
    if (type === 'auto') {
      actions = (
        <Fragment>
          <Button
            type={'ghost'}
            style={{ margin: '0 5px', color: blacklakeGreen, border: `1px solid ${blacklakeGreen}` }}
            onClick={() => {
              openModal({
                footer: null,
                title: '设置排程逻辑',
                width: '60%',
                innerContainerStyle: { marginBottom: 80, paddingBottom: 0 },
                children: <ScheduleLogicModal initialValue={this.state.scheduleLogicValue} />,
                onOk: scheduleLogicValue => {
                  LocalStorage.set('taskScheduleLogicModalValue', scheduleLogicValue);
                  this.setState({ scheduleLogicValue });
                },
              });
            }}
          >
            设置排程逻辑
          </Button>
          <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
            当前工位排序方案：{this.state.scheduleLogicValue.processStrategy === 0 ? 'N型排产' : 'Z型排产'}
          </span>
        </Fragment>
      );
    } else if (!this.state.params.inject) {
      actions = (
        <div style={{ display: 'inline-block' }} className="child-gap">
          <Checkbox
            style={{ display: 'inline-block' }}
            onChange={e => {
              this.setState({ isOccupyStorage: e.target.checked });
            }}
          />
          <span>占用库存</span>
          {isOccupyStorage && (
            <SearchSelect
              value={occupyStorage}
              type="wareHouseWithCode"
              onChange={value => this.setState({ occupyStorage: value })}
            />
          )}
          {isOccupyStorage && (
            <Popover
              content={
                <div>
                  <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} style={{ margin: '0 5px' }} />
                  优先占用物料上配置的默认存储仓库，如果没有配置则占用此次选择的仓库
                </div>
              }
            >
              <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4'} style={{ margin: '0 5px' }} />
            </Popover>
          )}
        </div>
      );
    }

    return (
      <div>
        {/* <Checkbox
          checked={allchecked}
          style={{ display: 'inline-block' }}
          onClick={e => {
            if (e.target.checked) {
              this.setState({
                allchecked: true,
                selectedRows: data,
                selectedRowKeys: data.map(e => e.key),
              });
            } else {
              this.setState({
                allchecked: false,
                selectedRows: [],
                selectedRowKeys: [],
              });
            }
          }}
        >
          全选
        </Checkbox> */}
        <Button style={{ margin: '0 5px 10px' }} onClick={this.onSchedule}>
          确定
        </Button>
        <Button
          type="ghost"
          style={{ margin: '0 5px 10px' }}
          onClick={() => {
            this.fetchDataAndSetInitValue({ size: pagination && pagination.pageSize, page: 1 });
          }}
        >
          取消
        </Button>
        <span style={{ margin: '0 5px' }}>已选{selectedRows.length}个结果</span>
        {actions}
      </div>
    );
  };

  render() {
    const { data, multiple, type, pagination, loading, selectedRows, params } = this.state;
    const { changeChineseToLocale } = this.context;
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      getCheckboxProps: record => ({
        disabled: record.isChildren,
      }),
      onChange: (selectedRowKeys, _selectedRows) => {
        const newSelectedRows = _.pullAllBy(selectedRows, data, 'key').concat(_selectedRows);
        this.setState({
          selectedRowKeys,
          selectedRows: newSelectedRows,
        });
      },
    };

    return (
      <Spin spinning={loading}>
        <div style={{ margin: '0 20px' }}>
          <Filter
            onFilter={params => {
              this.fetchDataAndSetInitValue({ ...params, page: 1 });
            }}
          />
          {multiple ? (
            this.renderMultipleItems(data)
          ) : (
            <div style={{ marginBottom: 10 }} className="child-gap">
              {params.inject ? null : (
                <Button
                  auth={auth.WEB_CREATE_PLAN_TASK}
                  onClick={() => {
                    this.setState({ multiple: true, type: 'auto' }, () => {
                      this.fetchData({ size: pagination.pageSize, page: 1 });
                    });
                  }}
                >
                  <Icon iconType={'gc'} type={'piliangcaozuo'} />
                  {changeChineseToLocale('批量自动排程')}
                </Button>
              )}
              <Button
                auth={auth.WEB_CREATE_PLAN_TASK}
                onClick={() =>
                  this.setState({ multiple: true, type: 'manual' }, () => {
                    this.fetchData({ size: pagination.pageSize, page: 1 });
                  })
                }
              >
                <Icon iconType={'gc'} type={'piliangcaozuo'} />
                {changeChineseToLocale('批量手动排程')}
              </Button>
              <a href={`${location.pathname}/process-log-list`} target="_blank" rel="noopener noreferrer">
                <Icon iconType={'gc'} style={{ paddingRight: 4 }} type="chakanjilu-hui" />
                {changeChineseToLocale('查看排程日志')}
              </a>
            </div>
          )}
          <Table
            tableUniqueKey={PROCESS_TABLE_UNIQUE_KEY}
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
            dragable
            style={{
              flex: 1,
              margin: 0,
              maxHeight: 400,
              paddingBottom: Array.isArray(data) && data.length ? 64 : 0,
            }}
            rowKey={record => `${record.workOrderCode}-${record.processSeq}`}
            onExpand={async (expanded, record) => {
              if (expanded && arrayIsEmpty(record.children)) {
                const {
                  data: { data: childrenProcess },
                } = await getLastProcessInject(record.workOrderCode);
                record.children = Array.isArray(childrenProcess)
                  ? childrenProcess.map(e => ({
                      workOrderDirect: 1,
                      ...this.formatProcessData(e),
                      workOrderInMaterial: e.inMaterial,
                      isChildren: true,
                    }))
                  : [];
                const { data } = this.state;
                this.setState({ data });
              }
            }}
            rowSelection={multiple ? rowSelection : null}
            bordered
            columns={columns}
            dataSource={data}
            scroll={{ y: 290 }}
          />
        </div>
      </Spin>
    );
  }
}

ProcessTable.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default ProcessTable;
