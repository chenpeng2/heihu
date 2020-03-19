import React, { Component, Fragment } from 'react';
import { Icon, Tooltip, Popover } from 'components';
import Progress from 'components/progress';
import moment, { diff, format } from 'utils/time';
import { stringEllipsis2 } from 'utils/string';
import { Interactable, dragMoveListener } from 'components/interact';

const delay = 400;

class DefaultProgressRenderer extends Component {
  props: {
    style: {},
    ref: () => {},
    startTime: Date,
    endTime: Date,
    realStartTime: Date,
    key: string,
    draggable: Boolean,
    resizable: Boolean,
    realEndTime: Date,
    className: String,
    color: String,
    extra: React.element,
    dataPlanId: String,
    dataNodeId: String,
    disabled: Boolean,
    task: {},
    preTitle: String,
    title: String,
    isStartDelay: Boolean,
    containerStyle: {},
    progressStyle: {},
    bordered: Boolean,
    locked: Boolean,
    tooltip: Boolean,
    isEndDelay: Boolean,
    onClick: () => {},
    onMouseDown: () => {},
    onMouseUp: () => {},
    bindEvents: () => {},
    unbindEvents: () => {},
  };
  state = {
    startTimePopover: null,
    endTimePopover: null,
  };

  componentDidMount() {
    const {
      task: { produceStatus, startTimePlanned, endTimePlanned, startTimeReal, endTimeReal },
    } = this.props;
    this.setState({
      startTimePopover: startTimePlanned,
      endTimePopover: endTimePlanned,
      startTimeRealPopover: startTimeReal,
      endTimeRealPopover: produceStatus === 'DONE' ? endTimeReal : endTimePlanned,
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      task: { produceStatus, startTimePlanned, endTimePlanned, startTimeReal, endTimeReal },
    } = nextProps;
    this.setState({
      startTimePopover: startTimePlanned,
      endTimePopover: endTimePlanned,
      startTimeRealPopover: startTimeReal,
      endTimeRealPopover: produceStatus === 'DONE' ? endTimeReal : endTimePlanned,
    });
  }

  getProgressStyle = (startTime, endTime) => {
    const {
      range: { defaultStartTime, interval },
      timeItemWidth,
    } = this.context;
    // const range = diff(defaultEndTime, defaultStartTime);
    const width = (diff(endTime || moment(), startTime) / interval) * timeItemWidth;
    const left = (diff(startTime, defaultStartTime) / interval) * timeItemWidth;
    return { width: width || 10, left };
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
    return moment(oldTime + Math.ceil((newTime.valueOf() - oldTime.valueOf()) / precision) * precision);
  };

  bindEvents = (interactable, task, disabled) => {
    const {
      task: { startTimePlanned, endTimePlanned },
      disabledDragable,
    } = this.props;
    const { draggable, resizable } = this.props;
    const context = this;
    interactable.on('down', event => {
      event.stopPropagation();
    });
    if (disabled || disabledDragable || task.status !== 'SCHEDULED') {
      return;
    }
    if (draggable) {
      const { onmove, onend, onstart, ...rest } = draggable;
      interactable.draggable({
        // enable inertial throwing
        inertia: true,
        // keep the element within the area of it's parent
        enabled: true,
        restrict: {
          restriction: '.chartContainer',
          // elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        },
        // enable autoScroll
        autoScroll: true,
        // call this function on every dragmove event
        ...rest,
        onstart: event => {
          context.setState({ visible: false });
          if (typeof onstart === 'function') {
            onstart(event);
          }
        },
        onmove: event => {
          const { target } = event;
          const { width: _width, left: _left } = target.style;
          const width = Number(_width.substring(0, _width.length - 2));
          const x = parseFloat(target.getAttribute('data-x')) || 0;
          const left = Number(_left.substring(0, _left.length - 2)) + x;
          const { startTime, endTime } = this.calcStartEndTime({ left, width });
          context.setState({
            startTimePopover: this.toFixedTime(startTimePlanned, startTime),
            endTimePopover: this.toFixedTime(endTimePlanned, endTime),
            dragging: true,
          });
          dragMoveListener(event);
          if (onmove) {
            onmove(event);
          }
        },
        // call this function on every dragend event
        onend: event => {
          const target = event.target;
          const x = parseFloat(target.getAttribute('data-x')) || 0;
          target.setAttribute('data-x', x);
          if (onend) {
            onend(event, () => {
              context.setState({ startTimePopover: startTimePlanned, endTimePopover: endTimePlanned, resizing: false });
            });
          }
        },
      });
    }
    if (resizable) {
      interactable
        .resizable({
          // resize from all edges and corners
          edges: { left: true, right: true },
          // minimum size
          restrictSize: {
            min: { width: 100, height: 30 },
          },
          // inertia: true,
        })
        .off('resizemove')
        .off('resizeend')
        .on('resizestart', event => {
          const { onresizestart } = resizable;
          context.setState({ visible: false });
          if (onresizestart) {
            onresizestart(event);
          }
          const target = event.target;
          target.setAttribute('data-lastWidth', target.style.width);
          target.setAttribute('data-lastHeight', target.style.height);
          target.setAttribute('data-lastTansform', target.style.transform);
        })
        .on('down', event => {
          event.stopPropagation();
        })
        .on('resizemove', event => {
          const target = event.target;
          let x = parseFloat(target.getAttribute('data-x')) || 0;
          let y = parseFloat(target.getAttribute('data-y')) || 0;
          // update the element's style
          target.style.width = `${event.rect.width}px`;
          target.style.height = `${event.rect.height}px`;
          // translate when resizing from top or left edges
          x += event.deltaRect.left;
          y += event.deltaRect.top;
          target.style.webkitTransform = `translate(${x}px,${y}px)`;
          target.style.transform = `translate(${x}px,${y}px)`;
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          const { width: _width, left: _left } = target.style;
          const width = Number(_width.substring(0, _width.length - 2));
          const left = Number(_left.substring(0, _left.length - 2)) + x;
          const { startTime, endTime } = this.calcStartEndTime({ left, width });
          context.setState({ endTimePopover: this.toFixedTime(endTimePlanned, endTime), resizing: true });
        })
        .on('resizeend', event => {
          const { onresizeend } = resizable;
          if (onresizeend) {
            onresizeend(event, () => {
              context.setState({ startTimePopover: startTimePlanned, endTimePopover: endTimePlanned, resizing: false });
            });
          }
        });
    }
  };

  unbindEvents = interactable => {
    interactable
      .draggable({ enabled: false })
      .resizable({ enabled: false })
      .off('resizemove')
      .off('resizeend')
      .off('resizestart');
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

  render() {
    const {
      onClick,
      key,
      dataNodeId,
      task,
      className,
      color,
      preTitle,
      title,
      extra,
      isStartDelay,
      isEndDelay,
      containerStyle,
      bordered,
      disabled,
      locked,
      tooltip,
      progressStyle,
      onMouseDown,
      onMouseUp,
      ...rest
    } = this.props;

    const {
      id,
      startTimePlanned,
      mouldUnit,
      endTimePlanned,
      startTimeReal,
      endTimeReal,
      type,
      isMouldConflict,
      isCapacityConstraintConflict,
    } = task;
    const {
      startTimePopover,
      endTimePopover,
      startTimeRealPopover,
      endTimeRealPopover,
      dragging,
      resizing,
    } = this.state;
    const progressContainerStyle = {
      ...containerStyle,
      position: 'absolute',
      top: 0,
      height: 38,
    };
    const { left, width } = this.getProgressStyle(startTimePlanned, endTimePlanned);
    // 如果没有实际时间就用计划时间代替
    const { left: realLeft, width: realWidth } = this.getProgressStyle(
      startTimeReal || startTimePlanned,
      endTimeReal || endTimePlanned,
    );
    const right = left + width;
    const realRight = realLeft + realWidth;
    const delta = Math.max(right, realRight) - Math.min(left, realLeft);
    const renderProgress = style => (
      <Progress
        className={`${color}-alpha`}
        style={{
          visibility: dragging || resizing ? 'visible' : 'hidden',
          border: bordered ? '1px dashed #02B980' : 'none',
          borderRadius: 100,
          ...style,
        }}
        showInfo={false}
        percent={100}
        strokeWidth={18}
        width={width}
        {...rest}
      />
    );

    const renderTooltip = tooltip => {
      if (!tooltip) {
        return <div id="dragContainer">{renderProgress()}</div>;
      }
      const { content, ...rest } = tooltip;
      return (
        <Popover
          {...rest}
          // getPopupContainer={() => this.container}
          overlayStyle={{ width: 400, position: 'absolute', zIndex: 10000 }}
          trigger="hover"
          content={<div style={{ padding: 0 }}>{content}</div>}
          visible={this.state.visible}
          onVisibleChange={visible => {
            if (!this.props.dragging && !this.props.resizing) {
              this.setState({ visible });
            }
          }}
        >
          <div
            id="dragContainer"
            style={{ height: '100%' }}
            ref={e => {
              if (!this.container) {
                this.container = e;
              }
            }}
          >
            {renderProgress()}
          </div>
        </Popover>
      );
    };
    let capacityConstraintIcon = null;
    if (isCapacityConstraintConflict) {
      if (delta > 200) {
        capacityConstraintIcon = (
          <span style={{ color: '#fff', paddingRight: 15 }}>
            <Icon type="exclamation-circle-o" style={{ paddingRight: 4 }} color={'#fff'} />
            任务超量
          </span>
        );
      } else {
        capacityConstraintIcon = <Icon type="exclamation-circle-o" style={{ paddingRight: 10 }} color={'#fff'} />;
      }
    }
    let mouldIcon = null;
    if (mouldUnit) {
      if (delta > 100) {
        mouldIcon = (
          <span
            style={{
              backgroundColor: isMouldConflict ? '#FE6158' : '#AD84FF',
              borderRadius: 2,
              height: '12px',
              fontSize: 12,
              lineHeight: '12px',
              transform: 'scale(0.83)',
              webkitTransform: 'scale(0.83)',
              padding: '0 5px',
              marginTop: -2,
              marginRight: 10,
              color: '#FFF',
            }}
          >
            {isMouldConflict ? (
              <Icon
                style={{
                  paddingRight: 5,
                  fontSize: 12,
                  color: '#FFF',
                }}
                type="exclamation-circle-o"
              />
            ) : null}
            模具
          </span>
        );
      } else {
        mouldIcon = (
          <span
            style={{
              backgroundColor: isMouldConflict ? '#FE6158' : '#02B980',
              height: '10px',
              lintHeight: '10px',
              padding: '0 5px',
              borderRadius: 10,
              marginTop: 3,
              marginRight: 10,
              color: '#FFF',
            }}
          />
        );
      }
    }

    // 顺序不能改 计划需要在实际进度条上面
    return (
      <div style={{ height: '100%' }}>
        <Interactable
          bindEvents={interactable => this.bindEvents(interactable, task, disabled)}
          unbindEvents={interactable => this.unbindEvents(interactable)}
          key={`${key}-planProgress`}
          data-planId={id}
          data-nodeId={dataNodeId}
          data-task={JSON.stringify(task)}
          className={className}
          onClick={onClick}
          style={{ ...progressContainerStyle, zIndex: type === 'downtimePlan' ? 10 : 20, left, width }}
        >
          {renderTooltip(tooltip)}
        </Interactable>
        {!dragging && !resizing ? (
          <div style={{ ...progressContainerStyle, zindex: 10, left, width }}>
            {renderProgress({ visibility: 'visible' })}
          </div>
        ) : null}
        {startTimeReal ? (
          tooltip ? (
            <Popover
              {...rest}
              overlayStyle={{ width: 400, position: 'absolute', zIndex: 10000 }}
              gger="hover"
              visible={this.state.realProgressVisible}
              onVisibleChange={visible => {
                if (!this.props.dragging && !this.props.resizing) {
                  this.setState({ realProgressVisible: visible });
                }
              }}
              content={<div style={{ padding: 0 }}>{tooltip.content}</div>}
            >
              <div
                key={`${key}-planRealProgress`}
                onClick={onClick}
                style={{ ...progressContainerStyle, zIndex: 10, left: realLeft, width: realWidth }}
              >
                <Progress
                  className={color}
                  key="realProgress"
                  showInfo={false}
                  percent={100}
                  strokeWidth={12}
                  width={realWidth}
                  {...rest}
                />
              </div>
            </Popover>
          ) : (
            <div
              key={`${key}-planRealProgress`}
              onClick={onClick}
              style={{ ...progressContainerStyle, zIndex: 10, left: realLeft, width: realWidth }}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
            >
              <Progress
                className={color}
                key="realProgress"
                showInfo={false}
                percent={100}
                strokeWidth={12}
                width={realWidth}
                {...rest}
              />
            </div>
          )
        ) : null}
        <span
          style={{
            position: 'absolute',
            left: left + 0.2 * width,
            top: 19,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {capacityConstraintIcon}
          {mouldIcon}
          {delta > 100 ? (
            <Fragment>
              {delta > 300 && preTitle && <span style={{ paddingRight: 5 }}>({stringEllipsis2(preTitle, 15)})</span>}
              {delta > 200 && title && <span>{title}:</span>}
              {extra}
            </Fragment>
          ) : null}
          {locked ? (
            <Icon
              style={{
                marginTop: 0,
                paddingLeft: 5,
              }}
              iconType="gc"
              color={'rgba(0, 0, 0, 0.6)'}
              type="suoding"
              theme="outlined"
            />
          ) : null}
        </span>
      </div>
    );
  }
}

DefaultProgressRenderer.contextTypes = {
  range: {
    interval: Number,
    defaultStartTime: Date,
    defaultEndTime: Date,
  },
  timeItemWidth: Number,
};

export default DefaultProgressRenderer;
