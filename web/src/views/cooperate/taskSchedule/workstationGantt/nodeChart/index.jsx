import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment, { diff, formatUnixMoment, formatToUnix, minDate, maxDate } from 'utils/time';
import { getConfigCapacityConstraint } from 'utils/organizationConfig';
import PopoverModal from 'components/modal/popoverModal';
import { Interactable } from 'components/interact';
import { Gantt, Icon } from 'components';
import { blacklakeGreen } from 'src/styles/color';
import { thousandBitSeparator } from 'utils/number';
import { closeModal } from 'components/modal';
import { updateTask, queryTimeSlot } from 'src/services/schedule';
import { replaceSign } from 'src/constants';
import { ProducePlanDetail, DowntimePlanDetail } from './planDetail';
import styles from './styles.scss';
import { PRODUCE_STATUS_MAP } from '../../constants';
import editProduceTask from '../../editTask';
import editInjectTask from '../../form/injectTaskForm/edit';

const ProgressRenderer = Gantt.ProgressRenderer;

const delay = 400;

class NodeChart extends Component {
  props: {
    node: {},
    viewer: {},
    match: {
      params: {
        productOrderId: String,
      },
    },
    fetchData: () => {},
    onNodeSelect: () => {},
    range: {
      defaultStartTime: Date,
      defaultEndTime: Date,
      interval: number,
    },
    disabled: boolean,
  };
  state = {
    openPlan: false,
    randomId: Math.random(),
  };
  toFixedTime = (oldTime, newTime) => {
    const {
      range: { interval },
    } = this.context;
    const precisionMap = {
      30: 60 * 1000,
      60: 60 * 1000,
      240: 15 * 60 * 1000,
      720: 60 * 60 * 1000,
      1440: 60 * 60 * 1000,
    };
    const precision = precisionMap[interval];
    return moment(
      moment(oldTime).valueOf() +
        Math.ceil((moment(newTime).valueOf() - moment(oldTime).valueOf()) / precision) * precision,
    );
  };

  unbindDropzoneEvents = interactable => {
    interactable.off('down');
  };

  bindDropzoneEvents = interactable => {
    interactable.dropzone({
      accept: '.prodPlan',
      overlap: 0.5,
      ondropactivate: event => {
        // add active dropzone feedback
        event.target.classList.add(styles.dropActive);
      },
      ondragenter: event => {
        const dragTarget = event.relatedTarget;
        const dropTarget = event.target;
        // feedback the possibility of a drop
        const workstation = JSON.parse(dropTarget.getAttribute('data-workstation'));
        const task = JSON.parse(dragTarget.getAttribute('data-task'));
        if (!task.availableWorkstations.find(id => id === workstation.id)) {
          dropTarget.classList.add(styles.cannotDrop);
        } else {
          dropTarget.classList.add(styles.canDrop);
        }
      },
      ondragleave: event => {
        // remove the drop feedback style
        event.target.classList.remove(styles.cannotDrop);
        event.target.classList.remove(styles.canDrop);
      },
      ondrop: async event => {
        const dropTarget = event.target;
        const dragTarget = event.relatedTarget;
        dropTarget.classList.remove(styles.cannotDrop);
        dropTarget.classList.remove(styles.canDrop);
        const { width: _width, left: _left } = dragTarget.style;
        const width = Number(_width.substring(0, _width.length - 2));
        const x = parseFloat(dragTarget.getAttribute('data-x')) || 0;
        const left = Number(_left.substring(0, _left.length - 2)) + x;
        const { startTime, endTime } = this.calcStartEndTime({ left, width });
        const workstation = JSON.parse(dropTarget.getAttribute('data-workstation'));
        const onCancel = () => {
          dragTarget.style.webkitTransform = 'translate(0, 0)';
          dragTarget.style.transform = 'translate(0, 0)';
          dragTarget.setAttribute('data-x', 0);
          dragTarget.setAttribute('data-y', 0);
          this.setState({ randomId: Math.random() });
          this.props.fetchData();
        };
        const task = JSON.parse(dragTarget.getAttribute('data-task'));
        const { startTimePlanned, endTimePlanned } = task;
        if (!task.availableWorkstations.find(id => id === workstation.id)) {
          onCancel();
          return;
        }
        const _startTime = this.toFixedTime(startTimePlanned, startTime);
        const _endTime = this.toFixedTime(endTimePlanned, endTime);
        if (task.type !== 'injectTask') {
          const bool = await this.checkTask(task, _startTime, _endTime, workstation.id);
          if (bool) {
            await this.editTaskAndFetchData(task, _startTime, _endTime, workstation.id);
            return;
          }
        }
        this.editTask(
          {
            task,
            taskCode: task.taskCode,
            workstation,
            startTime: _startTime,
            endTime: _endTime,
          },
          {
            onCancel,
          },
        );
      },
      ondropdeactivate: event => {
        // remove active dropzone feedback
        event.target.classList.remove(styles.dropActive);
        event.target.classList.remove(styles.dropTarget);
      },
    });
  };

  checkTask = async (task, newStartTime, newEndTime, dropWorkstationId) => {
    const {
      workOrderCode,
      taskCode,
      processSeq,
      workstationId,
      planAmount: amount,
      startTimePlanned,
      endTimePlanned,
    } = task;
    const {
      data: { data },
    } = await queryTimeSlot({
      code: workOrderCode,
      seq: processSeq,
      body: {
        amount,
        startTime: formatToUnix(startTimePlanned),
        endTime: formatToUnix(endTimePlanned),
        taskCode,
        workstationId: dropWorkstationId || workstationId,
      },
    });
    const { workingTime } = data;
    const {
      data: { data: newData },
    } = await queryTimeSlot({
      code: workOrderCode,
      seq: processSeq,
      body: {
        amount,
        startTime: formatToUnix(newStartTime),
        endTime: formatToUnix(newEndTime),
        workstationId: dropWorkstationId || workstationId,
      },
    });
    const { workingTime: newWorkingTime, conflict } = newData;
    return !conflict.length && workingTime === newWorkingTime;
  };

  editTaskAndFetchData = async (task, startTimePlanned, endTimePlanned, dropWorkstationId) => {
    const { taskCode, planAmount, workstationId, executors } = task;
    const wkids = executors && executors.map(node => node.id);
    const submitValue = {
      workstationId: dropWorkstationId || workstationId,
      executorIds: wkids && wkids.length > 0 ? wkids : null,
      // assignedWorkerIds: wkids && wkids.length > 0 ? wkids : null,
      // inputMaterials: null,
      planAmount,
      locked: true,
    };
    submitValue.planBeginTime = formatToUnix(startTimePlanned.set({ second: 0, millisecond: 0 }));
    submitValue.planEndTime = formatToUnix(endTimePlanned.set({ second: 0, millisecond: 0 }));
    this.setState({ submiting: true });
    await updateTask({ taskCode, ...submitValue });
    this.props.fetchData();
  };

  getProgressStyle = (startTime, endTime) => {
    const {
      range: { defaultStartTime, interval },
    } = this.context;
    // const range = diff(defaultEndTime, defaultStartTime);
    const width = (diff(endTime || moment(), startTime) / interval) * 105;
    const left = (diff(startTime, defaultStartTime) / interval) * 105;
    return { width: width || 10, left };
  };

  calcStartEndTime = ({ left, width }) => {
    const { timeItemWidth = 105, range } = this.context;
    const { defaultStartTime, interval } = range;
    const startTime = moment(defaultStartTime).add((left / timeItemWidth) * interval, 'minutes');
    // 每一个时间间隔的宽度为60px
    const endTime = moment(startTime).add((width / timeItemWidth) * interval, 'minutes');
    return {
      startTime,
      endTime,
    };
  };

  getExtra = (v1, v2, v3) => (
    <span style={{ paddingRight: 5 }}>
      {v1}/{v2} {v3}
    </span>
  );

  editTask = (props, option) => {
    const { task } = props;
    if (task.type === 'injectTask') {
      this.editInjectTask({ ...props, taskCode: task.taskCode }, option);
    } else {
      this.editProduceTask({ ...props, taskCode: task.taskCode }, option);
    }
  };

  editInjectTask = (props, option) => {
    editInjectTask({ ...props }, { onSuccess: this.props.fetchData }, option);
  };

  editProduceTask = (props, option) => {
    editProduceTask({ ...props }, { onSuccess: this.props.fetchData }, option);
  };

  renderPlans = (tasks, node, disabled) => {
    const { onNodeSelect } = this.props;
    return tasks.map(task => {
      console.log(task);
      const { startTimePlanned, endTimePlanned, workOrderCode } = task;
      const title = _.get(task, 'outputMaterial.name') || task.processName;
      const unitName = _.get(task, 'outputMaterial.unit');
      const context = this;
      let colorIndex = 0;
      let children;
      let extra = '';
      if (task.type === 'downtimePlan') {
        colorIndex = 2;
        children = <DowntimePlanDetail task={task} />;
      } else {
        if (task.type === 'injectTask') {
          extra = task.injectSubTasks.map(({ realAmount, amount }, index) => {
            const { material } = task.injectSubMaterials[index];
            return this.getExtra(
              typeof realAmount === 'number' ? thousandBitSeparator(realAmount) : replaceSign,
              typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign,
              _.get(material, 'unitName'),
            );
          });
        } else {
          extra = this.getExtra((task && task.amount) || 0, task.planAmount || replaceSign, unitName);
        }
        if (!task.distributed) {
          if (task.locked) {
            colorIndex = 6;
          } else if (task.isCapacityConstraintConflict) {
            colorIndex = 7;
          } else {
            colorIndex = 1;
          }
        } else if (task.produceStatus === PRODUCE_STATUS_MAP.PAUSED.value) {
          colorIndex = 3;
        } else if (task.produceStatus === PRODUCE_STATUS_MAP.DONE.value) {
          colorIndex = 4;
        } else if (task.produceStatus === PRODUCE_STATUS_MAP.DONE_DELAY.value) {
          // 延期结束是前端判断的状态 逻辑是实际结束时间 > 计划结束时间
          colorIndex = 5;
        }
        children = (
          <ProducePlanDetail
            task={task}
            fetchData={this.props.fetchData}
            disabled={disabled || !task.access || node.finished}
            onEditClick={() => {
              closeModal();
              this.editTask(
                { task },
                {
                  onSuccess: () => {
                    this.props.fetchData();
                  },
                },
              );
            }}
          />
        );
      }

      return (
        <ProgressRenderer
          className={'prodPlan'}
          disabled={disabled || !task.access || node.finished}
          id={`prodPlan-${task.taskCode}`}
          color={`defaultColor-${colorIndex}`}
          bordered={task.distributed}
          containerStyle={
            task.isPurchaseSelected || task.isNodeSelected ? { backgroundColor: 'rgba(250,173,20,0.2)' } : {}
          }
          key={`${task.taskCode}-${task.startTimePlanned}-${task.status}-${task.updatedAt}-${this.state.randomId}`}
          task={task}
          locked={task.locked}
          tooltip={
            task.type !== 'downtimePlan'
              ? {
                  onMouseEnter: () => {
                    onNodeSelect(task);
                  },
                  onMouseLeave: () => {
                    onNodeSelect();
                  },
                  content: children,
                }
              : null
          }
          progressStyle={task.type === 'downtimePlan' ? { zIndex: 5 } : {}}
          draggable={{
            onstart: event => {
              context.setState({ dragging: true });
            },
            onmove: event => {
              const target = event.target;
              target.style['z-index'] = 100;
            },
            onend: event => {
              const target = event.target;
              target.style['z-index'] = 10;
              context.setState({ dragging: false });
            },
          }}
          resizable={
            getConfigCapacityConstraint()
              ? false
              : {
                  onresizestart: () => {
                    context.setState({ resizing: true });
                  },
                  onresizeend: async (event, onCancel) => {
                    const target = event.target;
                    const x = parseFloat(target.getAttribute('data-x')) || 0;
                    const { width: _width, left: _left } = target.style;
                    const width = Number(_width.substring(0, _width.length - 2));
                    const left = Number(_left.substring(0, _left.length - 2)) + x;
                    const { startTime, endTime } = this.calcStartEndTime({ left, width });
                    const task = JSON.parse(target.getAttribute('data-task'));
                    const _startTime = this.toFixedTime(startTimePlanned, startTime);
                    const _endTime = this.toFixedTime(endTimePlanned, endTime);
                    if (task.type !== 'injectTask') {
                      const bool = await this.checkTask(task, _startTime, _endTime);
                      if (bool) {
                        await this.editTaskAndFetchData(task, _startTime, _endTime);
                        return;
                      }
                    }
                    context.editTask(
                      {
                        task,
                        taskCode: task.taskCode,
                        startTime: _startTime,
                        endTime: _endTime,
                      },
                      {
                        onCancel: () => {
                          target.style.width = target.getAttribute('data-lastWidth');
                          target.style.height = target.getAttribute('data-lastHeight');
                          target.style.webkitTransform = target.getAttribute('data-lastTransform');
                          target.style.transform = target.getAttribute('data-lastTransform');
                          target.setAttribute('data-x', 0);
                          target.setAttribute('data-y', 0);
                          this.setState({ randomId: Math.random() });
                          this.props.fetchData();
                          if (typeof onCancel === 'function') {
                            onCancel();
                          }
                        },
                      },
                    );
                    context.setState({ resizing: false });
                  },
                }
          }
          dataNodeId={node.id}
          preTitle={getConfigCapacityConstraint() ? workOrderCode : undefined}
          title={title}
          extra={extra}
          resizing={this.state.resizing}
          dragging={this.state.dragging}
        />
      );
    });
  };

  renderCapacityCoefficients = capacityCoefficients => {
    if (!(Array.isArray(capacityCoefficients) && capacityCoefficients.length)) {
      return null;
    }
    return capacityCoefficients.map(capacityCoefficient => {
      const { startTime, endTime, percentage } = capacityCoefficient;
      const { left, width } = this.getProgressStyle(startTime, endTime);
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            height: '100%',
            position: 'absolute',
            fontSize: '12px',
            zIndex: 2,
            color: 'rgba(0, 0, 0, 0.6)',
            left,
            width,
            backgroundColor: 'rgba(184, 233, 134, 0.4)',
          }}
        >
          <Icon
            size={12}
            style={{ padding: 0, lineHeight: 'inherit' }}
            color={'#7ED321'}
            iconType="gc"
            type="channenglvye"
          />
          {percentage}%
        </div>
      );
    });
  };

  getCapacityCoefficientsInWorkingCalender = node => {
    const { capacityCoefficients, workingCalendar } = node;
    if (!(Array.isArray(capacityCoefficients) && capacityCoefficients.length)) {
      return [];
    }
    if (!(Array.isArray(workingCalendar) && workingCalendar.length)) {
      return capacityCoefficients;
    }
    const capacityCoefficientsInWorkingCalender = [];
    const workingTime = [];
    workingTime.push({
      startTime: 0,
      endTime: workingCalendar[0].startTime,
    });
    for (let i = 1; i < workingCalendar.length; i += 1) {
      workingTime.push({
        startTime: workingCalendar[i - 1].endTime,
        endTime: workingCalendar[i].startTime,
      });
    }
    workingTime.push({
      startTime: workingCalendar[workingCalendar.length - 1].endTime,
      endTime: formatToUnix(moment('9999-01-01', 'YYYY-MM-DD')),
    });
    let j = 0;
    for (let i = 0; i < capacityCoefficients.length; i += 1) {
      const { startTime, endTime } = capacityCoefficients[i];
      for (; j < workingTime.length; j += 1) {
        const { startTime: _startTime, endTime: _endTime } = workingTime[j];
        if (_startTime >= endTime) {
          break;
        } else if (startTime < _endTime) {
          capacityCoefficientsInWorkingCalender.push({
            ...capacityCoefficients[i],
            startTime: maxDate(startTime, _startTime),
            endTime: minDate(endTime, _endTime),
          });
        }
      }
    }
    return capacityCoefficientsInWorkingCalender;
  };
  render() {
    const { node, disabled: _disabled } = this.props;
    const { id, name } = node;
    const { interval, defaultStartTime, defaultEndTime } = this.context.range;
    let style;
    const toPercent = (deltaTime, deltaPercent) => {
      return `${Number((deltaTime / diff(defaultEndTime, defaultStartTime)) * 100 + Number(deltaPercent)).toFixed(3)}`;
    };
    const calcSize = (size, position) => {
      return (100 / (100 - position)) * size;
    };
    const capacityCoefficients = this.getCapacityCoefficientsInWorkingCalender(node);
    if (node.workingCalendar) {
      const backgroundStyle = [];
      const ratio = diff(defaultEndTime, defaultStartTime) / (7 * 24 * 60);
      const deltaMap = {
        30: 0.00625,
        60: 0.0125,
        240: 0.05,
        720: 0.15,
        1440: 0.25,
      };
      const workingStartColor = ' linear-gradient(to right, #C0EADE, #C0EADE)';
      const workingColor = 'linear-gradient(to right, #F0F7F5, #F0F7F5)';
      const restColor = 'linear-gradient(to right, #FAFAFA, #FAFAFA)';
      const delta = Number(Number(deltaMap[interval] / ratio).toFixed(3));
      let start = defaultStartTime;
      let lastPercent = 0;
      _.sortBy(node.workingCalendar, 'startTime').forEach(({ startTime: _startTime, endTime: _endTime }) => {
        const startTime = formatUnixMoment(_startTime);
        const endTime = formatUnixMoment(_endTime);
        if (diff(startTime, start) > 0) {
          backgroundStyle.push({
            color: workingStartColor,
            size: `${calcSize(delta, lastPercent)}%`,
            position: `${lastPercent}%`,
          });
          backgroundStyle.push({
            color: workingColor,
            size: `${calcSize(
              toPercent(diff(startTime, start), lastPercent) - lastPercent - delta,
              lastPercent + delta,
            )}%`,
            position: `${lastPercent + delta}%`,
          });
          lastPercent = Number(toPercent(diff(startTime, start), lastPercent));
        }
        backgroundStyle.push({
          color: restColor,
          size: `${calcSize(toPercent(diff(endTime, startTime), lastPercent) - lastPercent, lastPercent)}%`,
          position: `${lastPercent}%`,
        });
        lastPercent = Number(toPercent(diff(endTime, startTime), lastPercent));
        start = endTime;
        // linear-gradient(to right, rgba(2,185, 128, 0.04) 50% , yellow 50%)
      });
      if (diff(defaultEndTime, start) > 0) {
        backgroundStyle.push({
          color: workingStartColor,
          size: `${calcSize(delta, lastPercent)}%`,
          position: `${lastPercent}%`,
        });
        backgroundStyle.push({
          color: workingColor,
          size: `${calcSize(
            toPercent(diff(defaultEndTime, start), lastPercent) - lastPercent - delta,
            lastPercent + delta,
          )}%`,
          position: `${lastPercent + delta}%`,
        });
      }
      style = {
        backgroundImage: backgroundStyle.map(e => e.color).join(','),
        backgroundSize: backgroundStyle.map(e => e.size).join(','),
        backgroundPosition: backgroundStyle.map(e => e.position).join(','),
        backgroundRepeat: 'no-repeat',
      };
    }

    const disabled = _disabled;

    return (
      <div className={styles.chartContainer}>
        <div className={styles.contentContainer} style={{ ...style }}>
          <div>
            <Interactable
              className={'dropzone'}
              bindEvents={this.bindDropzoneEvents}
              unbindEvents={this.unbindDropzoneEvents}
              data-workstation={JSON.stringify({ id, name })}
              data-projectCode={node.projectCode}
              data-processSeq={node.processSeq}
              // key={`workstation-${i}-${index}`}
            >
              {this.renderCapacityCoefficients(capacityCoefficients)}
              {node.tasks && node.tasks.length ? (
                node.tasks.map((plans, index) => {
                  return (
                    <div
                      key={`tasks-${index}`}
                      style={{
                        height: 38,
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {/* {this.renderWorkingCalendar(node.workingCalendar)} */}
                      {this.renderPlans(plans, node, disabled)}
                      {node.conflicts && node.conflicts.length
                        ? node.conflicts.map((conflict, index) => {
                            const { startTimePlanned, endTimePlanned } = conflict;
                            const { left, width } = this.getProgressStyle(startTimePlanned, endTimePlanned);
                            return (
                              <div
                                key={index}
                                style={{
                                  left,
                                  width,
                                  top: 20,
                                  height: 12,
                                  lineHeight: '12px',
                                  borderRadius: 5,
                                  position: 'absolute',
                                  backgroundColor: '#FE6158',
                                  color: '#FFF',
                                  zIndex: 15,
                                }}
                              >
                                <div
                                  style={{
                                    transform: 'scale(0.8, 0.8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {width > 20 ? (
                                    <div>
                                      <Icon
                                        type="exclamation-circle-o"
                                        color="#FFF"
                                        style={{ paddingLeft: 5, paddingRight: 5 }}
                                      />
                                    </div>
                                  ) : null}
                                  {width > 65 ? <div>任务冲突</div> : null}
                                </div>
                              </div>
                            );
                          })
                        : null}
                    </div>
                  );
                })
              ) : (
                <div style={{ height: 38, width: '100%' }} />
              )}
            </Interactable>
          </div>
        </div>
      </div>
    );
  }
}

NodeChart.contextTypes = {
  router: PropTypes.object,
  range: PropTypes.object,
  timeItemWidth: PropTypes.object,
};

export default withRouter(NodeChart);
