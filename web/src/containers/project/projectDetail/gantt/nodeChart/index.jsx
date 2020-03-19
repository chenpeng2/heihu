import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router-dom';
import moment, { diff, formatUnixMoment } from 'utils/time';
import PropTypes from 'prop-types';
import _ from 'lodash';
import interact, { Interactable, dragMoveListener } from 'components/interact';
import { closeModal } from 'components/modal';
import PopoverModal from 'components/modal/popoverModal';
import { Gantt } from 'components';
import { blacklakeGreen } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';
import DowntimePlanDetail from './planDetail/downtimePlan';
import createProduceTask from '../../createTask';
import editProduceTask from '../../editTask';
import { ProducePlanDetail } from './planDetail';
import styles from './styles.scss';

const ProgressRenderer = Gantt.ProgressRenderer;

const delay = 200;
const progressContainerStyle = {
  height: 40,
  paddingTop: 5,
  width: '100%',
  position: 'relative',
};

class NodeChart extends Component {
  props: {
    node: {},
    viewer: {},
    match: {
      params: {
        productOrderId: String,
      },
    },
    range: {
      defaultStartTime: Date,
      defaultEndTime: Date,
      interval: number,
    },
    disabled: boolean,
    fetchData: () => {},
  };
  state = {
    openPlan: false,
  };

  unbindDropzoneEvents = interactable => {
    interactable.off('down');
  };

  bindDropzoneEvents = interactable => {
    interactable
      .dropzone({
        accept: '.prodPlan',
        overlap: 0.5,
        ondropactivate: event => {
          // add active dropzone feedback
          event.target.classList.add(styles.dropActive);
          this.setState({ dragging: true });
        },
        ondragenter: event => {
          const draggableElement = event.relatedTarget;
          const dropzoneElement = event.target;
          // feedback the possibility of a drop
          dropzoneElement.classList.add(styles.dropTarget);
          draggableElement.classList.add('can-drop');
        },
        ondragleave: event => {
          // remove the drop feedback style
          event.target.classList.remove(styles.dropTarget);
          event.relatedTarget.classList.remove('can-drop');
        },
        ondrop: event => {
          const dropTarget = event.target;
          const dragTarget = event.relatedTarget;
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
          };
          const task = JSON.parse(dragTarget.getAttribute('data-task'));
          if (!task.availableWorkstations.find(e => e.id === workstation.id)) {
            onCancel();
            return;
          }
          this.editProduceTask(task, {
            workstation,
            startTime,
            endTime,
            onCancel: () => {
              onCancel();
            },
          });
        },
        ondropdeactivate: event => {
          // remove active dropzone feedback
          event.target.classList.remove(styles.dropActive);
          event.target.classList.remove(styles.dropTarget);
        },
      })
      .off('down')
      .on('down', e => {
        const dropTarget = e.currentTarget;
        const left = e.offsetX;
        const pageX = e.pageX;
        const div = document.createElement('div');
        dropTarget.appendChild(div);
        const newChild = (
          <div
            id="newAddPlan"
            style={{
              position: 'absolute',
              left,
              backgroundColor: blacklakeGreen,
              width: 0,
              height: 12,
              borderRadius: 10,
              zIndex: 100,
              top: 12,
            }}
          />
        );
        ReactDOM.render(newChild, div);
        interact(document.body).on('move', e => {
          const deltaX = e.pageX - pageX;
          const newAddPlan = document.getElementById('newAddPlan');
          newAddPlan.style.width = `${deltaX}px`;
        });
        interact(document.body).on('up', e => {
          const deltaX = e.pageX - pageX;
          const newAddPlan = document.getElementById('newAddPlan');
          if (!(this.state.dragging || this.state.resizing) && deltaX) {
            const projectCode = dropTarget.getAttribute('data-projectCode');
            const processSeq = dropTarget.getAttribute('data-processSeq');
            const workstation = JSON.parse(dropTarget.getAttribute('data-workstation'));
            const { width: _width, left: _left } = newAddPlan.style;
            const width = Number(_width.substring(0, _width.length - 2));
            const left = Number(_left.substring(0, _left.length - 2));
            const { startTime, endTime } = this.calcStartEndTime({ left, width });
            createProduceTask(
              { projectCode, processSeq, startTime, endTime, workstation },
              { onSuccess: this.props.fetchData },
            );
          }
          if (newAddPlan) {
            interact(document.body).off('move');
            newAddPlan.parentNode.removeChild(newAddPlan);
          }
          interact(document.body).off('up');
        });
      });
  };

  calcStartEndTime = ({ left, width }) => {
    const { defaultStartTime, interval } = this.context.range;
    const startTime = moment(defaultStartTime).add((left / 105) * interval, 'minutes');
    // 每一个时间间隔的宽度为60px
    const endTime = moment(startTime).add((width / 105) * interval, 'minutes');
    return {
      startTime,
      endTime,
    };
  };

  getExtra = (v1, v2) => (
    <span>
      <span>{v1}</span>/{v2}
    </span>
  );

  editProduceTask = (task, option) => {
    editProduceTask({ id: task.id, isModal: true }, { onSuccess: this.props.fetchData }, option);
  };

  renderPlans = (tasks, node, disabled) => {
    return tasks.map(task => {
      let timer = 0;
      let prevent = false;
      const context = this;
      const unitName = _.get(task, 'outputMaterial.unit');
      let colorIndex = 0;
      const title = _.get(task, 'outputMaterial.name') || task.processName;
      let children;
      let extra = '';
      if (task.type === 'downtimePlan') {
        colorIndex = 2;
        children = <DowntimePlanDetail task={task} />;
      } else {
        extra = this.getExtra(
          (task && task.amountProductQualified) || 0,
          (task && task.amountProductPlanned) || replaceSign,
          unitName,
        );
        children = (
          <ProducePlanDetail
            task={task}
            fetchData={this.props.fetchData}
            disabled={disabled || task.statusDisplay !== '未开始'}
            onEditClick={() => {
              closeModal();
              editProduceTask({ id: task.id, isModal: true }, { onSuccess: this.props.fetchData });
            }}
            onDetailClick={() => {
              this.context.router.history.push(`/cooperate/prodTasks/detail/${task.id}`);
            }}
          />
        );
      }

      return (
        <ProgressRenderer
          id={`prodPlan-${task.id}`}
          className={'prodPlan'}
          color={`defaultColor-${colorIndex}`}
          key={`${task.id}-${task.startTimePlanned}`}
          task={task}
          bordered={task.type !== 'downtimePlan'}
          draggable={{
            restrict: {
              restriction: '.prodPlanContainer',
            },
            // call this function on every dragend event
            onend: () => {
              setTimeout(() => context.setState({ dragging: false }), 200);
            },
          }}
          resizable={{
            onresizestart: () => {
              context.setState({ resizing: true });
            },
            onresizeend: event => {
              const target = event.target;
              const { width: _width, left: _left } = target.style;
              const width = Number(_width.substring(0, _width.length - 2));
              const x = parseFloat(target.getAttribute('data-x')) || 0;
              const left = Number(_left.substring(0, _left.length - 2)) + x;
              const { startTime, endTime } = this.calcStartEndTime({ left, width });
              const task = JSON.parse(target.getAttribute('data-task'));
              this.editProduceTask(task, {
                startTime,
                endTime,
                onCancel: () => {
                  target.style.width = target.getAttribute('data-lastWidth');
                  target.style.height = target.getAttribute('data-lastHeight');
                  target.style.webkitTransform = target.getAttribute('data-lastTransform');
                  target.style.transform = target.getAttribute('data-lastTransform');
                  target.setAttribute('data-x', 0);
                  target.setAttribute('data-y', 0);
                },
              });
              setTimeout(() => context.setState({ resizing: false }), 200);
            },
          }}
          dataNodeId={node.id}
          title={title}
          extra={extra}
          onMouseDown={() => {
            timer = setTimeout(() => {
              prevent = true;
            }, delay);
          }}
          onMouseUp={event => {
            if (timer && !prevent) {
              PopoverModal(
                {
                  event,
                  width: 420,
                  children,
                },
                this.context,
              );
              clearTimeout(timer);
            }
            prevent = false;
          }}
        />
      );
    });
  };

  render() {
    const { node, disabled } = this.props;
    const { interval, defaultStartTime, defaultEndTime } = this.context.range;
    const toPercent = (deltaTime, deltaPercent) => {
      return `${Number((deltaTime / diff(defaultEndTime, defaultStartTime)) * 100 + Number(deltaPercent)).toFixed(3)}`;
    };
    const calcSize = (size, position) => {
      return (100 / (100 - position)) * size;
    };

    const finished = node.finished || disabled;

    return (
      <div className={styles.chartContainer}>
        <div className={styles.titleContainer} style={{ height: 38, lineHeight: '38px', paddingLeft: 15 }} />
        <div className={styles.contentContainer} style={{ height: node.children ? 0 : 'auto' }}>
          <div>
            {!disabled ? <div style={progressContainerStyle} /> : null}
            <div className={'prodPlanContainer'}>
              {node.workstations &&
                node.workstations.map(({ tasks: tasksGroup, id, name, workingCalendar }, i) => {
                  let style;
                  if (workingCalendar) {
                    const backgroundStyle = [];
                    const ratio = diff(defaultEndTime, defaultStartTime) / (7 * 24 * 60);
                    const deltaMap = {
                      30: 0.00625,
                      60: 0.0125,
                      240: 0.05,
                      720: 0.15,
                      1440: 0.25,
                    };
                    console.log(workingCalendar);
                    const workingStartColor = ' linear-gradient(to right, #C0EADE, #C0EADE)';
                    const workingColor = 'linear-gradient(to right, #F0F7F5, #F0F7F5)';
                    const restColor = 'linear-gradient(to right, #FAFAFA, #FAFAFA)';
                    const delta = Number(Number(deltaMap[interval] / ratio).toFixed(3));
                    let start = defaultStartTime;
                    let lastPercent = 0;
                    _.sortBy(workingCalendar, 'startTime').forEach(({ startTime: _startTime, endTime: _endTime }) => {
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
                        size: `${calcSize(
                          toPercent(diff(endTime, startTime), lastPercent) - lastPercent,
                          lastPercent,
                        )}%`,
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
                  return tasksGroup.map((tasks, index) => {
                    return (
                      <Interactable
                        className={'dropzone'}
                        bindEvents={this.bindDropzoneEvents}
                        unbindEvents={this.unbindDropzoneEvents}
                        data-workstation={JSON.stringify({ id, name })}
                        data-projectCode={node.projectCode}
                        data-processSeq={node.processSeq}
                        key={`workstation-${i}-${index}`}
                        style={{
                          height: 40,
                          width: '100%',
                          position: 'relative',
                          ...style,
                        }}
                      >
                        {this.renderPlans(tasks, node, finished)}
                      </Interactable>
                    );
                  });
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

NodeChart.contextTypes = {
  router: PropTypes.object,
  range: PropTypes.object,
  relayVariables: PropTypes.object,
};

export default withRouter(NodeChart);
