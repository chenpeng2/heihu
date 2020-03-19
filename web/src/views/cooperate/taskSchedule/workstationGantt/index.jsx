import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router';
import { Modal } from 'antd';
import { getQuery } from 'src/routes/getRouteParams';
import Proptypes from 'prop-types';
import {
  Link,
  Icon,
  SimpleTable,
  Tooltip,
  Popover,
  message,
  Spin,
  Gantt,
  DatePicker,
  Select,
  DetailPageHeader,
  Button,
  openModal,
} from 'components';
import { closeModal } from 'components/modal';
import { ganttBlacklakeGreen, error, blacklakeGreen } from 'src/styles/color';
import { arrayIsEmpty } from 'utils/array';
import { rescheduleTasks, setChartWorkstations } from 'src/services/schedule';
import { replaceSign } from 'constants';
import { getConfigCapacityConstraint } from 'utils/organizationConfig';
import moment, { formatToUnix, formatUnixMoment, diff, dayStart, minDate, formatUnix } from 'utils/time';
import Node from './node';
import NodeChart from './nodeChart';
import styles from './styles.scss';
import WorkstationSelectModal from './workstationSelectModal';
import { getWorkOrderDetailPath } from '../utils';
import GanttFilter from './filter';
import WorkstationSelect from './workstationSelect';

const headerHeight = 66;
const leftContainerWidth = 225;
const delta = 1;
const Option = Select.Option;

const iconStyle = {
  width: 12,
  height: 8,
  borderRadius: 8,
  marginRight: 8,
};

const filterLabelStyle = {
  color: blacklakeGreen,
  border: `1px solid ${blacklakeGreen}`,
  borderRadius: 20,
  padding: '2px 5px',
  marginLeft: 10,
};

const filterLabelIconStyle = {
  cursor: 'pointer',
};

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
}

class GanttPage extends Component {
  props: {
    relay: {},
    disabled: boolean,
    outerHeight: Number,
    startTime: Date,
    endTime: Date,
    puchaseOrderCodes: [],
    onPurchaseOrderCodeSelect: () => {},
    workOrderCodes: [],
    onWorkOrderCodeSelect: () => {},
    onNodeSelect: () => {},
    relay: {},
    match: {},
    workstations: [],
    workstationOptions: [],
    style: {},
    title: String,
    fetchData: () => {},
    fetchWorkstations: () => {},
    fetchWorkstationItems: () => {},
    fetchCapacityCoefficientsList: () => {},
  };
  state = {
    interval: 720,
    filter: ['ProdAndSemi', 'Raw'],
    planFilter: ['stock', 'produce', 'purchase'],
    taskFilter: ['produce', 'qc', 'purchase'],
    visible: false,
    loading: false,
    baseTime: moment()
      .hour(moment().hour() + 1)
      .minutes(0)
      .second(0),
  };

  componentDidMount() {
    // 根据当前时间计算left
    const interval = localStorage.getItem('timeInterval');
    if (interval) {
      this.setState({ interval: Number(interval) });
    }
    const left = (diff(dayStart(moment()).add(8, 'hours'), this.state.startTime) / this.state.interval) * 60;
    this.rightContainer.scrollLeft = left;
    // document.oncontextmenu = e => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   return false;
    // };
    const { match } = this.props;
    const query = getQuery(match);
    const { finished, purchaseOrderCode, workOrderCode, startTime, endTime, materialCode } = query;
    this.setState({
      finished,
      purchaseOrderCode,
      workOrderCode,
      materialCode,
      startTime: startTime ? formatUnixMoment(startTime) : moment().startOf('week'),
      endTime: endTime ? formatUnixMoment(endTime) : moment().endOf('week'),
    });
  }

  componentWillUnmount() {
    document.oncontextmenu = undefined;
  }

  ignoreScrollEvent = false;

  resolveOverlap = plans => {
    const result = [];
    plans
      .sort((a, b) => diff(a.endTimePlanned, b.startTimePlanned))
      .forEach(plan => {
        for (let i = 0; i < result.length; i += 1) {
          const currentPlans = result[i];
          const lastCurrentPlan = currentPlans[currentPlans.length - 1];
          if (!lastCurrentPlan || diff(plan.startTimePlanned, lastCurrentPlan.endTimePlanned) >= 0) {
            currentPlans.push(plan);
            return;
          }
        }
        result.push([plan]);
      });
    return result;
  };
  // 冲突不考虑已结束的任务
  resolveConflict = tasks => {
    const conflicts = [];
    let lastEndTimePlanned = moment('1970-01-01', 'YYYY-MM-DD');
    const sortedTasks = _.sortBy(tasks, 'startTimePlanned').filter(e => e.produceStatus !== 'DONE');
    for (let i = 0; i < sortedTasks.length; i += 1) {
      const task = sortedTasks[i];
      if (task.type === 'downtimePlan') {
        break;
      }
      const { startTimePlanned, endTimePlanned } = task;
      if (diff(startTimePlanned, lastEndTimePlanned) < 0) {
        conflicts.push({ startTimePlanned, endTimePlanned: minDate(endTimePlanned, lastEndTimePlanned) });
      }
      if (endTimePlanned > lastEndTimePlanned) {
        lastEndTimePlanned = endTimePlanned;
      }
    }
    return conflicts;
  };

  getDate = (workstations, timeFrom = moment().startOf('week'), timeTill = moment().endOf('week')) => {
    let startTime = timeFrom;
    let endTime = timeTill;
    if (workstations) {
      workstations.forEach(workstation => {
        if (!workstation.tasks) {
          return;
        }
        workstation.tasks.forEach(task => {
          if (task.startTimeReal && diff(task.startTimeReal, startTime) < 0) {
            startTime = dayStart(task.startTimeReal);
          }
          if (task && diff(task.startTimePlanned, startTime) < 0) {
            startTime = dayStart(task.startTimePlanned);
          }
          if (task.endTimeReal && diff(task.endTimeReal, endTime) > 0) {
            endTime = dayStart(task.endTimeReal)
              .add(24, 'h')
              .subtract(1, 's');
          }
          if (task && diff(task.endTimePlanned, endTime) > 0) {
            endTime = dayStart(task.endTimePlanned)
              .add(24, 'h')
              .subtract(1, 's');
          }
        });
      });
    }
    return {
      startTime,
      endTime,
    };
  };

  renderLeft = workstations => {
    const { fetchWorkstationItems, fetchCapacityCoefficientsList, fetchData, workstationOptions } = this.props;
    return (
      <div
        className={styles.leftContainer}
        id={'leftContainer'}
        style={{ width: leftContainerWidth, overflowY: 'auto' }}
        onScroll={e => {
          if (this.ignoreScrollEvent) {
            this.ignoreScrollEvent = false;
            return;
          }
          const diff = this.rightContainer.scrollTop - this.leftContainer.scrollTop;
          if (Math.abs(diff) < delta) {
            return;
          }

          this.ignoreScrollEvent = true;
          this.rightContainer.scrollTop = this.leftContainer.scrollTop;
        }}
        ref={e => (this.leftContainer = e)}
      >
        <div
          className={styles.filterContainer}
          style={{
            height: headerHeight,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: '#FFF',
          }}
        >
          <div style={{ width: '100%', margin: '0 auto' }}>
            <WorkstationSelect
              ref={e => (this.workstationSelectRef = e)}
              fetchWorkstationItems={fetchWorkstationItems}
              workstationOptions={workstationOptions}
            />
          </div>
        </div>
        <div className={styles.tree} style={{ flexGrow: 1 }}>
          {workstations.map(node => (
            <Node node={node} fetchCapacityCoefficientsList={fetchCapacityCoefficientsList} fetchTasks={fetchData} />
          ))}
        </div>
      </div>
    );
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

  renderTaskModal = (conflictData, cb) => {
    return (
      <div>
        <div style={{ margin: 20 }}>
          <div style={{ marginBottom: 10 }}>以下已排程的任务时间超出所在工单计划时间，可以在待下发任务中查看：</div>
          <SimpleTable
            style={{ margin: 0 }}
            pagination={false}
            dataSource={conflictData}
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
                  <Tooltip text={`${processCode || replaceSign}/${record.processName || replaceSign}`} length={10} />
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
            ]}
          />
          <Button
            style={{ margin: '30px 0 30px 350px', width: 114 }}
            onClick={() => {
              cb();
              closeModal();
            }}
          >
            完成
          </Button>
        </div>
      </div>
    );
  };

  renderRight = (workstations, startTime, endTime) => {
    const width = window.innerWidth - leftContainerWidth - 180 - 40;
    const { fetchData, onNodeSelect } = this.props;
    const { interval } = this.state;

    return (
      <div className={styles.rightContainer} style={{ width, position: 'relative' }}>
        <Gantt
          getRef={e => {
            this.rightContainer = e;
          }}
          id="rightContainer"
          onScroll={e => {
            if (this.ignoreScrollEvent) {
              this.ignoreScrollEvent = false;
              return;
            }
            const diff = this.rightContainer.scrollTop - this.leftContainer.scrollTop;
            if (Math.abs(diff) < delta) {
              return;
            }
            this.ignoreScrollEvent = true;
            this.leftContainer.scrollTop = this.rightContainer.scrollTop;
          }}
          style={{
            backgroundColor: '#FFF',
          }}
          fetchData={fetchData}
          onNodeSelect={onNodeSelect}
          disabled={this.props.disabled}
          width={width}
          startTime={startTime}
          endTime={endTime}
          Renderer={NodeChart}
          data={workstations}
          interval={interval}
          hideIntervalSelect
        />
      </div>
    );
  };
  // TODO: 加上menu关闭时的宽度判断
  render() {
    const {
      workstations,
      startTime: _startTime,
      endTime: _endTime,
      style,
      title,
      fetchWorkstationItems,
      setWorkstationOptions,
      workstationOptions,
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const { startTime, endTime } = this.getDate(workstations, _startTime, _endTime);
    const { interval, workOrderCode, purchaseOrderCode, loading, visible, finished, materialCode } = this.state;
    const _workstations = workstations.map(workstation => {
      const _node = _.cloneDeep(workstation);
      if (_node.tasks) {
        if (_node.toManyTask) {
          _node.tasks = this.resolveOverlap(_node.tasks);
        } else {
          _node.conflicts = this.resolveConflict(_node.tasks);
          _node.tasks = [_node.tasks.sort((a, b) => diff(a.endTime, b.startTime))];
        }
      }
      return _node;
    });
    const context = this;
    return (
      <Fragment>
        {title ? (
          <DetailPageHeader
            style={{ marginTop: 0 }}
            title={
              <div style={{ display: 'flex' }}>
                {title}
                <div
                  style={{
                    paddingLeft: 20,
                    color: '#8C8C8C',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 100,
                  }}
                  className={styles.legendContainer}
                >
                  <Popover
                    trigger={'click'}
                    placement={'bottomLeft'}
                    arrowPointAtCenter
                    content={
                      <GanttFilter
                        initialValue={this.state}
                        onFilter={params => {
                          const {
                            finished,
                            startTime,
                            endTime,
                            purchaseOrderCode,
                            workOrderCode,
                            materialCode,
                          } = params;
                          this.setState({ ...params });
                          fetchWorkstationItems({
                            finished,
                            startTime: formatToUnix(startTime || moment().startOf('week')),
                            endTime: formatToUnix(endTime || moment().endOf('week')),
                            purchaseOrderCode,
                            workOrderCode,
                            materialCode,
                          });
                        }}
                      />
                    }
                  >
                    <div
                      style={{
                        backgroundColor: blacklakeGreen,
                        color: '#fff',
                        borderRadius: 20,
                        height: 24,
                        lineHeight: '24px',
                        textAlign: 'center',
                        width: 66,
                        cursor: 'pointer',
                      }}
                    >
                      <Icon color={'#fff'} type={'filter'} />
                      {changeChineseToLocale('查找')}
                    </div>
                  </Popover>
                  <Link
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      openModal({
                        title: changeChineseToLocale('工位设置'),
                        width: 1000,
                        children: <WorkstationSelectModal workstations={workstationOptions} />,
                        disabledRelayModalClassname: true,
                        footer: null,
                        onOk: async data => {
                          this.workstationSelectRef.clearFilterWorkstationId();
                          if (!arrayIsEmpty(data)) {
                            await setChartWorkstations(data.map(e => e.id));
                            await setWorkstationOptions(data);
                          }
                        },
                      });
                    }}
                  >
                    工位设置
                  </Link>
                  {workOrderCode ? (
                    <div style={filterLabelStyle}>
                      {workOrderCode && workOrderCode.key}
                      <Icon
                        type="close"
                        style={filterLabelIconStyle}
                        onClick={() => {
                          this.setState({ workOrderCode: undefined }, () => {
                            const { startTime, endTime, ...rest } = this.state;
                            fetchWorkstationItems({
                              ...rest,
                              startTime: formatToUnix(startTime || moment().startOf('week')),
                              endTime: formatToUnix(endTime || moment().endOf('week')),
                            });
                          });
                        }}
                      />
                    </div>
                  ) : null}
                  {purchaseOrderCode ? (
                    <div style={filterLabelStyle}>
                      {purchaseOrderCode && purchaseOrderCode.key}
                      <Icon
                        type="close"
                        style={filterLabelIconStyle}
                        onClick={() => {
                          this.setState({ purchaseOrderCode: undefined }, () => {
                            const { startTime, endTime, ...rest } = this.state;
                            fetchWorkstationItems({
                              ...rest,
                              startTime: formatToUnix(startTime || moment().startOf('week')),
                              endTime: formatToUnix(endTime || moment().endOf('week')),
                            });
                          });
                        }}
                      />
                    </div>
                  ) : null}
                  {finished ? (
                    <div style={filterLabelStyle}>
                      显示已结束任务
                      <Icon
                        type="close"
                        style={filterLabelIconStyle}
                        onClick={() => {
                          this.setState({ finished: undefined }, () => {
                            const { startTime, endTime, ...rest } = this.state;
                            fetchWorkstationItems({
                              ...rest,
                              startTime: formatToUnix(startTime || moment().startOf('week')),
                              endTime: formatToUnix(endTime || moment().endOf('week')),
                            });
                          });
                        }}
                      />
                    </div>
                  ) : null}
                  {materialCode ? (
                    <div style={filterLabelStyle}>
                      {materialCode && materialCode.label}
                      <Icon
                        type="close"
                        style={filterLabelIconStyle}
                        onClick={() => {
                          this.setState({ materialCode: undefined }, () => {
                            const { startTime, endTime, ...rest } = this.state;
                            fetchWorkstationItems({
                              ...rest,
                              startTime: formatToUnix(startTime || moment().startOf('week')),
                              endTime: formatToUnix(endTime || moment().endOf('week')),
                            });
                          });
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            }
          />
        ) : null}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: headerHeight / 2,
            lineHeight: `${headerHeight / 2}px`,
            position: 'sticky',
            zIndex: 101,
            top: 0,
            left: 0,
            minWidth: 1020,
            overflow: 'auto',
            margin: '0 20px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            backgroundColor: '#FAFAFA',
          }}
        >
          <div style={{ display: 'flex', flex: 1, margin: '0 18px' }}>
            <div className={styles.legendContainer}>
              <div className={styles.title}>{changeChineseToLocale('生产任务')}：</div>
              {changeChineseToLocale('未下发')}{' '}
              <div style={{ marginLeft: 5, ...iconStyle, backgroundColor: 'rgba(24, 144, 255, 0.3)' }} />
              {changeChineseToLocale('已下发')}{' '}
              <div style={{ marginLeft: 5, ...iconStyle, backgroundColor: '#C8EDE2', border: '1px dashed #02B980' }} />
              {changeChineseToLocale('实际')}{' '}
              <div style={{ marginLeft: 5, ...iconStyle, backgroundColor: ganttBlacklakeGreen }} />
              {changeChineseToLocale('停机')}{' '}
              <div style={{ marginLeft: 5, ...iconStyle, backgroundColor: 'rgba(255, 59, 48, 0.3)' }} />
              {changeChineseToLocale('暂停中')}{' '}
              <div style={{ marginLeft: 5, ...iconStyle, backgroundColor: 'rgba(250, 173, 20, 0.6)' }} />
              {changeChineseToLocale('已结束')}{' '}
              <div style={{ marginLeft: 5, ...iconStyle, backgroundColor: 'rgba(126, 211, 33, 0.6)' }} />
              {changeChineseToLocale('延期结束')}{' '}
              <div style={{ marginLeft: 5, ...iconStyle, backgroundColor: 'rgba(255, 59, 48, 0.6)' }} />
            </div>
          </div>
          <div style={{ paddingRight: 40 }}>
            {changeChineseToLocale('时间单位')}
            <Select
              style={{ paddingLeft: 5, width: 120 }}
              value={interval}
              onChange={interval => {
                this.setState({ interval });
                localStorage.setItem('timeInterval', interval);
              }}
            >
              <Option value={30}>{changeChineseToLocale('30分钟')}</Option>
              <Option value={60}>{changeChineseToLocale('1小时')}</Option>
              <Option value={240}>{changeChineseToLocale('4小时')}</Option>
              <Option value={720}>{changeChineseToLocale('12小时')}</Option>
              <Option value={1440}>{changeChineseToLocale('24小时')}</Option>
            </Select>
          </div>
          <div
            className={styles.legendContainer}
            style={{
              color: '#8C8C8C',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              zIndex: 100,
            }}
          >
            <div style={{ marginRight: 18 }}>
              <Button
                onClick={() => {
                  this.setState({ visible: true });
                }}
              >
                一键优化排程
              </Button>
            </div>
          </div>
        </div>
        <Modal
          visible={visible}
          width={'40%'}
          onCancel={() => {
            this.setState({ visible: false });
          }}
          onOk={async () => {
            context.setState({ loading: true });
            const {
              data: { data },
            } = await rescheduleTasks({ baseTime: formatToUnix(this.state.baseTime) }).finally(e => {
              this.setState({ loading: false });
            });
            closeModal();
            message.success('排程成功');
            const conflictData = data.filter(
              e =>
                e.conflicts &&
                e.conflicts.find(e => e.conflict === 'START_TIME_CONFLICTED' || e.conflict === 'END_TIME_CONFLICTED'),
            );
            if (conflictData && conflictData.length) {
              openModal({
                title: '任务超出工单时间',
                children: this.renderTaskModal(conflictData, () => {
                  context.setState({ loading: false, visible: false });
                  this.props.fetchData();
                }),
                onCancel: () => {
                  context.setState({ loading: false, visible: false });
                },
                footer: null,
              });
            } else {
              context.setState({ loading: false, visible: false });
              this.props.fetchData();
            }
          }}
          title="一键优化排程"
        >
          <Spin spinning={loading}>
            <div
              style={{
                margin: '5px 20px',
                border: '1px solid #E8E8E8',
                backgroundColor: 'rgba(232, 232, 232, 0.2)',
                padding: 30,
              }}
            >
              <span style={{ margin: '0 20px' }}>
                <span style={{ color: error }}>*</span>基准时间
              </span>
              <DatePicker
                defaultValue={moment()
                  .hour(moment().hour() + 1)
                  .minutes(0)
                  .second(0)}
                disabledDate={this.getDisableDate}
                disabledTime={this.getDisabledTime}
                showTime={getConfigCapacityConstraint() ? undefined : { format: 'HH:mm' }}
                showToday={false}
                format={getConfigCapacityConstraint() ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
                onChange={value => {
                  context.setState({ baseTime: value });
                }}
              />
            </div>
          </Spin>
        </Modal>
        <div
          id="productOrder_createPlan_gantt"
          className={styles.ganttContainer}
          style={{ height: window.innerHeight - 50 - (this.props.outerHeight || 0), overflowY: 'auto', ...style }}
        >
          {this.renderLeft(_workstations)}
          {this.renderRight(_workstations, startTime, endTime)}
        </div>
      </Fragment>
    );
  }
}

GanttPage.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withRouter(GanttPage);
