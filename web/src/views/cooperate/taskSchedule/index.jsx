import React, { Component, Fragment } from 'react';
import { Spin, withForm, Button, Icon, Tabs } from 'components';
import _ from 'lodash';
import Proptypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { queryWorkstation, queryWorkstationItems } from 'src/services/workstation';
import moment, { formatToUnix, formatUnixMoment, dayStart, diff } from 'utils/time';
import {
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
  getOrganizationConfigFromLocalStorage,
  getTaskDeliverableOrganizationConfig,
} from 'src/utils/organizationConfig';
import { arrayIsEmpty } from 'utils/array';
import { queryTaskListByWorkstations, queryWorkingCalendar, getCapacityCoefficientsList } from 'src/services/schedule';
import { getChartWorkstations, getDowntimePlanByWorkstationIds } from 'services/schedule';
import { ProcessTable, DistributedTaskTable, UnDistributedTaskTable, AuditTaskTable } from './tables';
import { formatQueryParams } from './workstationGantt/util';
import { PRODUCE_STATUS_MAP, INJECT_PRODUCE_STATUS_MAP } from './constants';
import Gantt from './workstationGantt';
import './styles.scss';

const TabPane = Tabs.TabPane;

class TaskSchedule extends Component {
  props: {
    match: {},
    form: {
      getFieldDecorator: () => {},
    },
  };
  state = {
    showPlans: false,
    spinning: false,
    workstationOptions: [],
  };

  componentDidMount() {
    this._isMounted = true;
    const config = getOrganizationConfigFromLocalStorage();
    const { match } = this.props;
    const query = getQuery(match);
    const { tabKey, taskCode } = query;
    this.setState(
      {
        config,
        showPlans: !!tabKey,
        taskCode,
        tabKey,
        activeKey: tabKey || 'unscheduled',
        selectAll: true,
        pagination: {
          current: 1,
        },
        params: {
          page: 1,
          size: 5,
        },
      },
      () => {
        if (this._isMounted) {
          const { match } = this.props;
          const query = getQuery(match);
          const pathname = getPathname(match);
          const variables = { ...query };
          setLocation(this.props, () => variables);
          this.fetchData();
        }
      },
    );
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchData = async params => {
    // this.fetchProcesses({ ...params });
    const {
      data: { data },
    } = await getChartWorkstations();
    if (!arrayIsEmpty(data)) {
      this.setWorkstationOptions(data);
    } else {
      this.fetchWorkstations();
    }
  };

  fetchWorkstations = async (params, query) => {
    const { match } = this.props;
    const _query = query || getQuery(match);
    const { data } = await queryWorkstation({ ...params, status: 1 });
    // 处理后端返回的脏数据
    const { startTime, endTime } = getQuery(match);
    const { data: workstations = [] } = data;
    if (Array.isArray(workstations)) {
      workstations.forEach(e => (e.toManyTask = e.toManyTask ? e.toManyTask.num : 1));
    }
    this.setState({ workstationOptions: workstations });
    await this.fetchTasks(
      {
        startTime: startTime || formatToUnix(moment().startOf('week')),
        endTime: endTime || formatToUnix(moment().endOf('week')),
        ...params,
        workstationIds: (workstations && workstations.map(workstation => workstation.id)) || null,
      },
      workstations,
    );
  };

  setWorkstationOptions = async workstationOptions => {
    this.setState({ workstationOptions });
    await this.fetchWorkstationItems({ workstationIds: workstationOptions.map(e => e.id) });
  };

  fetchWorkingCalendar = async (params, query) => {
    const { match } = this.props;
    const _query = query || getQuery(match);
    const { startTime, endTime } = getQuery(match);
    const { workstationIds, ...rest } = params;
    const {
      data: { data },
    } = await queryWorkingCalendar(workstationIds, {
      startTime: startTime || formatToUnix(moment().startOf('week')),
      endTime: endTime || formatToUnix(moment().endOf('week')),
      ...rest,
    });
    // 处理后端返回的脏数据
    this.setState({ workingCalendar: data });
  };

  fetchCapacityCoefficientsList = async params => {
    return await getCapacityCoefficientsList(params);
  };

  fetchCapacityCoefficientsListAndSetState = async params => {
    const _query = getQuery(this.props.match);
    const query = {
      ..._query,
      ...params,
    };
    const { workstationIds, startTime, endTime } = query;
    if (!workstationIds) {
      return;
    }
    const { workstations } = this.state;
    const res = await getCapacityCoefficientsList(workstationIds, {
      startTime: startTime || moment().startOf('week'),
      endTime: endTime || moment().endOf('week'),
    });
    const {
      data: { data: capacityCoefficientsList },
    } = res;
    const capacityCoefficientsMap = _.groupBy(capacityCoefficientsList, e => e.workstationId);
    const _workstations = _.cloneDeep(workstations);
    _workstations.forEach(workstation => {
      if (capacityCoefficientsMap[workstation.id]) {
        workstation.capacityCoefficients = capacityCoefficientsMap[workstation.id];
      } else {
        workstation.capacityCoefficients = [];
      }
    });
    this.setState({ workstations: _workstations });
    return res;
  };

  setLoading = loading => {
    this.setState({ loading });
  };

  fetchWorkstationItems = async params => {
    this.setState({ spinning: true }, async () => {
      const { match } = this.props;
      const { workstations: _workstations } = this.state;
      const { workstationIds } = params || {};
      const { data } = await queryWorkstationItems(workstationIds || _workstations.map(e => e.id), { status: 1 });
      const { startTime, endTime } = getQuery(match);
      const { data: workstations } = data;
      // await this.fetchWorkingCalendar({ ...params, workstationIds: workstations.map(e => e.id) });
      // const { workingCalendar } = this.state;
      // if (workingCalendar) {
      //   workstations.forEach(e => (e.workingCalendar = []));
      //   workingCalendar.forEach(({ workstationId, startTime, endTime }) => {
      //     const workstation = workstations && workstations.find(e => e.id === workstationId);
      //     if (workstation) {
      //       workstation.workingCalendar.push({ startTime, endTime });
      //     }
      //   });
      // }
      // 拉取回来的toManyTask不需要处理
      await this.fetchTasks(
        {
          startTime: startTime || formatToUnix(moment().startOf('week')),
          endTime: endTime || formatToUnix(moment().endOf('week')),
          ...params,
          workstationIds: (workstations && workstations.map(workstation => workstation.id)) || null,
        },
        workstations,
      );
      this.setState({ spinning: false });
    });
  };

  getDate = (workstations, timeFrom = moment().startOf('week'), timeTill = moment().endOf('week')) => {
    let startTime = formatUnixMoment(timeFrom);
    let endTime = formatUnixMoment(timeTill);
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

  fetchTasks = async (params, workstations) => {
    const _query = getQuery(this.props.match);
    const { workstationIds, startTime: _startTime, endTime: _endTime, ...rest } = params;
    if (!workstationIds) {
      return;
    }
    const query = {
      ..._query,
      ...rest,
      startTime: _startTime || moment().startOf('week'),
      endTime: _endTime || moment().endOf('week'),
    };
    if (!workstations.length) {
      this.setState({ workstations });
      setLocation(this.props, p => ({ ...p, ...query }));
      return;
    }
    const { startTime, endTime, finished, purchaseOrderCode, workOrderCode, materialCode } = query;
    const {
      data: { data: tasks },
    } = await queryTaskListByWorkstations(workstationIds, {
      startTime: startTime || moment().startOf('week'),
      endTime: endTime || moment().endOf('week'),
      ...formatQueryParams({
        finished,
        purchaseOrderCode,
        workOrderCode,
        materialCode,
      }),
    });
    const puchaseOrderCodes = _.uniq(tasks.map(e => e.purchaseOrderCode)).filter(e => e);
    const tasksMap = _.groupBy(
      tasks
        .filter(e => e.status !== 'CANCELED')
        .map(
          ({
            purchaseOrderCode,
            beginTime,
            endTime,
            executeStatus,
            planBeginTime,
            planEndTime,
            availableWorkstations,
            status,
            conflicts,
            produceStatus,
            ...rest
          }) => {
            let endTimeReal = endTime;
            if (
              !endTime ||
              (!(produceStatus === 4 || produceStatus === 'DONE') && endTime && planEndTime - endTime > 0)
            ) {
              endTimeReal = planEndTime;
            }
            let _produceStatus = produceStatus;
            if (
              (produceStatus === PRODUCE_STATUS_MAP.DONE.value || produceStatus === 'DONE') &&
              diff(endTime, planEndTime) > 0
            ) {
              _produceStatus = PRODUCE_STATUS_MAP.DONE_DELAY.value;
            }
            return {
              ...rest,
              status,
              conflicts,
              isCapacityConstraintConflict:
                Array.isArray(conflicts) && !!conflicts.find(e => e.conflict === 'CAPACITY_CONSTRAINT_CONFLICTED'),
              mouldConflicts: Array.isArray(conflicts)
                ? conflicts.filter(e => e.conflict === 'MOULD_UNIT_CONFLICTED')
                : [],
              isMouldConflict:
                Array.isArray(conflicts) && !!conflicts.find(e => e.conflict === 'MOULD_UNIT_CONFLICTED'),
              access: arrayIsEmpty(rest.injectProcessNum) ? rest.access : true,
              type: arrayIsEmpty(rest.injectProcessNum) ? 'task' : 'injectTask',
              produceStatus: _produceStatus,
              distributed: status === 'DISTRIBUTED',
              locked: status === 'LOCKED',
              purchaseOrderCode,
              outMaterial: arrayIsEmpty(rest.injectProcessNum)
                ? rest.outMaterial
                : rest.injectSubMaterials.map(e => e.material),
              isPurchaseSelected: purchaseOrderCode && purchaseOrderCode === this.state.purchaseOrderCode,
              availableWorkstations,
              startTimeReal: beginTime && formatUnixMoment(beginTime),
              startTimePlanned: planBeginTime && formatUnixMoment(planBeginTime),
              endTimeReal: beginTime ? (endTimeReal ? formatUnixMoment(endTimeReal) : moment()) : null,
              endTimePlanned: planEndTime && formatUnixMoment(planEndTime),
            };
          },
        ),
      task => task.workstationId,
    );
    const { data } = await getDowntimePlanByWorkstationIds(workstationIds, {
      downtimeFrom: startTime,
      downtimeTill: endTime,
    });
    const { data: plans } = data || {};
    const downTimePlanMap = _.groupBy(
      plans &&
        plans.map(({ startTime, endTime, ...rest }) => ({
          ...rest,
          startTimePlanned: startTime && formatUnixMoment(startTime),
          endTimePlanned: endTime && formatUnixMoment(endTime),
          type: 'downtimePlan',
        })),
      plan => plan.workstationId,
    );
    const {
      data: { data: capacityCoefficientsList },
    } = await this.fetchCapacityCoefficientsList(workstationIds, {
      startTime: startTime || moment().startOf('week'),
      endTime: endTime || moment().endOf('week'),
    });
    const capacityCoefficientsMap = _.groupBy(capacityCoefficientsList, e => e.workstationId);
    const _workstations = _.cloneDeep(workstations);
    _workstations.forEach(workstation => {
      let res = [];
      if (tasksMap[workstation.id]) {
        res = res.concat(tasksMap[workstation.id]);
      }
      if (downTimePlanMap[workstation.id]) {
        res = res.concat(downTimePlanMap[workstation.id]);
      }
      workstation.tasks = res;
      if (capacityCoefficientsMap[workstation.id]) {
        workstation.capacityCoefficients = capacityCoefficientsMap[workstation.id];
      } else {
        workstation.capacityCoefficients = [];
      }
    });
    const { startTime: showStartTime, endTime: showEndTime } = this.getDate(_workstations, startTime, endTime);
    setLocation(this.props, p => ({ ...p, ...query }));
    await this.fetchWorkingCalendar({
      ...params,
      workstationIds: workstations.map(e => e.id),
      startTime: formatToUnix(showStartTime),
      endTime: formatToUnix(showEndTime),
    });
    const { workingCalendar } = this.state;
    if (workingCalendar) {
      _workstations.forEach(e => (e.workingCalendar = []));
      workingCalendar.forEach(({ workstationId, startTime, endTime }) => {
        const workstation = _workstations && _workstations.find(e => e.id === workstationId);
        if (workstation) {
          workstation.workingCalendar.push({ startTime, endTime });
        }
      });
    }
    console.log(_workstations);
    this.setState({ workstations: _workstations, puchaseOrderCodes });
  };

  render() {
    const { match } = this.props;
    const {
      workstations,
      puchaseOrderCodes,
      config,
      tabKey,
      taskCode,
      showPlans,
      activeKey,
      spinning,
      workstationOptions,
    } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const taskDeliverConfig = getTaskDeliverableOrganizationConfig();
    const { startTime, endTime } = getQuery(match);
    const { changeChineseToLocale } = this.context;
    return (
      <Spin size={'large'} style={{ position: 'fixed' }} spinning={spinning}>
        <div style={{ padding: '24px 0 0', display: 'flex' }}>
          <Tabs
            style={{ width: '100%', position: 'relative' }}
            activeKey={showPlans && (activeKey || '1')}
            onChange={activeKey => {
              this.setState({ activeKey });
            }}
          >
            <TabPane disabled={!showPlans} tab={changeChineseToLocale('待排程工序')} key="unscheduled">
              <ProcessTable
                setLoading={this.setLoading}
                ref={e => {
                  if (!this.processTable) {
                    this.processTable = e;
                  }
                }}
                fetchWorkstationItems={params => {
                  this.fetchWorkstationItems(params);
                  if (this.unDistributedTaskTable) {
                    this.unDistributedTaskTable.fetchDataAndSetInitValue();
                  }
                  if (this.auditTaskTable) {
                    this.auditTaskTable.fetchDataAndSetInitValue();
                  }
                  if (this.distributedTaskTable) {
                    this.distributedTaskTable.fetchDataAndSetInitValue();
                  }
                }}
              />
            </TabPane>
            <TabPane disabled={!showPlans} tab={changeChineseToLocale('待下发任务')} key="undistributed">
              <UnDistributedTaskTable
                setLoading={this.setLoading}
                taskCode={tabKey === 'undistributed' ? taskCode : undefined}
                ref={e => {
                  if (!this.unDistributedTaskTable) {
                    this.unDistributedTaskTable = e;
                  }
                }}
                fetchWorkstationItems={params => {
                  this.fetchWorkstationItems(params);
                  if (this.processTable) {
                    this.processTable.fetchDataAndSetInitValue();
                  }
                  if (this.auditTaskTable) {
                    this.auditTaskTable.fetchDataAndSetInitValue();
                  }
                  if (this.distributedTaskTable) {
                    this.distributedTaskTable.fetchDataAndSetInitValue();
                  }
                }}
              />
            </TabPane>
            {taskDeliverConfig ? (
              <TabPane disabled={!showPlans} tab={changeChineseToLocale('审批中列表')} key="audit">
                <AuditTaskTable
                  setLoading={this.setLoading}
                  taskCode={tabKey === 'audit' ? taskCode : undefined}
                  ref={e => {
                    if (!this.auditTaskTable) {
                      this.auditTaskTable = e;
                    }
                  }}
                  fetchWorkstationItems={params => {
                    this.fetchWorkstationItems(params);
                    if (this.processTable) {
                      this.processTable.fetchDataAndSetInitValue();
                    }
                    if (this.unDistributedTaskTable) {
                      this.unDistributedTaskTable.fetchDataAndSetInitValue();
                    }
                    if (this.distributedTaskTable) {
                      this.distributedTaskTable.fetchDataAndSetInitValue();
                    }
                  }}
                />
              </TabPane>
            ) : null}
            <TabPane disabled={!showPlans} tab={changeChineseToLocale('已下发任务')} key="distributed">
              <DistributedTaskTable
                taskCode={tabKey === 'distributed' ? taskCode : undefined}
                setLoading={this.setLoading}
                ref={e => {
                  if (!this.distributedTaskTable) {
                    this.distributedTaskTable = e;
                  }
                }}
                fetchWorkstationItems={params => {
                  this.fetchWorkstationItems(params);
                  if (this.processTable) {
                    this.processTable.fetchDataAndSetInitValue();
                  }
                  if (this.auditTaskTable) {
                    this.auditTaskTable.fetchDataAndSetInitValue();
                  }
                  if (this.unDistributedTaskTable) {
                    this.unDistributedTaskTable.fetchDataAndSetInitValue();
                  }
                }}
              />
            </TabPane>
          </Tabs>
          <Button
            type="ghost"
            style={{ position: 'absolute', top: 24, right: 20 }}
            onClick={() => this.setState({ showPlans: !this.state.showPlans })}
          >
            {showPlans ? (
              <span>
                {changeChineseToLocale('收起')}
                <Icon style={{ paddingRight: 0 }} iconType="gc" type={'shouqi'} />
              </span>
            ) : (
              <span>
                {changeChineseToLocale('展开')}
                <Icon style={{ paddingRight: 0 }} iconType="gc" type={'zhankai'} />
              </span>
            )}
          </Button>
        </div>
        <Gantt
          style={{ margin: '0 20px 20px', border: '1px solid #f3f3f3' }}
          title={changeChineseToLocale('工位看板')}
          fetchCapacityCoefficientsList={async params => {
            await this.fetchCapacityCoefficientsListAndSetState({
              workstationIds: workstations.map(e => e.id),
              ...params,
            });
          }}
          fetchWorkstations={async params => {
            await this.fetchWorkstations({ ...params });
          }}
          disabled={configValue === TASK_DISPATCH_TYPE.worker || configValue === TASK_DISPATCH_TYPE.workerWeak}
          fetchWorkstationItems={async params => {
            await this.fetchWorkstationItems({ workstationIds: workstations.map(e => e.id), ...params });
          }}
          setWorkstationOptions={this.setWorkstationOptions}
          fetchData={params => {
            if (this.processTable) {
              this.processTable.fetchDataAndSetInitValue();
            }
            if (this.unDistributedTaskTable) {
              this.unDistributedTaskTable.fetchDataAndSetInitValue();
            }
            if (this.auditTaskTable) {
              this.auditTaskTable.fetchDataAndSetInitValue();
            }
            if (this.distributedTaskTable) {
              this.distributedTaskTable.fetchDataAndSetInitValue();
            }
            this.fetchWorkstationItems({ workstationIds: workstations.map(e => e.id), ...params });
          }}
          onNodeSelect={_task => {
            const { workstations } = this.state;
            workstations.forEach(workstation => {
              if (workstation.tasks) {
                workstation.tasks.forEach(task => {
                  if (_task && task.workOrderCode === _task.workOrderCode) {
                    task.isNodeSelected = !task.isNodeSelected;
                  } else {
                    task.isNodeSelected = false;
                  }
                });
              }
            });
            this.setState({ workstations });
          }}
          workstationOptions={workstationOptions}
          workstations={workstations || []}
          puchaseOrderCodes={puchaseOrderCodes}
          outerHeight={155}
          hideTimeInterval
          startTime={startTime && formatUnixMoment(startTime)}
          endTime={endTime && formatUnixMoment(endTime)}
        />
      </Spin>
    );
  }
}

TaskSchedule.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

const FormWrapper = withForm({}, TaskSchedule);
const RouterWrapper = withRouter(FormWrapper);
export default RouterWrapper;
