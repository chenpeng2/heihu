import React, { Component, Fragment } from 'react';
import { DetailPageHeader } from 'components';
import Select from 'components/select';
import { blacklakeGreen } from 'src/styles/color/index';
import moment, { diff, formatDate, nextDay, dayStart } from 'utils/time';
import { genArr } from 'utils/array';
import DefaultProgressRenderer from './defaultProgressRenderer';
import ProgressChart from './progressChart';
import styles from './styles.scss';

const headerHeight = 100;
const minTimeItemWidth = 105;
const minutesOneDay = 24 * 60;
const Option = Select.Option;
const defaultWidth = 800;

class Gantt extends Component {
  props: {
    id: string,
    startTime: Date,
    endTime: Date,
    data: [],
    viewer: {},
    onIntervalChange: () => {},
    Renderer: Component,
    width: Number,
    height: Number,
    disabled: boolean,
    className: String,
    style: {},
    title: String,
    children: React.element,
    getRef: () => {},
    onScroll: () => {},
    fetchData: () => {},
    onNodeSelect: () => {},
    hideIntervalSelect: boolean,
    interval: Number,
  };
  state = {
    interval: 240,
    filter: ['ProdAndSemi', 'Raw'],
    planFilter: ['stock', 'produce', 'purchase'],
    taskFilter: ['produce', 'qc', 'purchase'],
    visible: false,
    timeItemWidth: minTimeItemWidth,
  };

  getChildContext() {
    const { startTime, endTime } = this.props;
    const { interval } = this.state;
    const timeItemWidth = this.getTimeItemWidth();

    return {
      range: {
        defaultStartTime: startTime,
        defaultEndTime: endTime,
        interval,
      },
      timeItemWidth,
    };
  }

  componentDidMount() {
    // 根据当前时间计算left
    const { interval } = this.props;
    const _interval = localStorage.getItem('interval');
    if (interval || _interval) {
      this.setState({ interval: Number(interval || _interval) });
    }
    const timeItemWidth = this.getTimeItemWidth();
    const left = (diff(dayStart(moment()).add(8, 'hours'), this.props.startTime) / this.state.interval) * timeItemWidth;
    this.chartContainer.scrollLeft = left;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.interval && nextProps.interval !== this.props.interval) {
      this.setState({ interval: nextProps.interval });
    }
  }

  getTimeItemWidth() {
    const { startTime, endTime } = this.props;
    const { interval } = this.state;
    let timeItemWidth = minTimeItemWidth;
    if (this.chartContainer) {
      const width = this.chartContainer.clientWidth / (diff(endTime, startTime) / interval);
      timeItemWidth = width > minTimeItemWidth ? width : minTimeItemWidth;
    }
    return timeItemWidth;
  }

  genDate = (startTime = new Date(), endTime = new Date()) => {
    const res = [];
    let newStart = dayStart(startTime);
    while (formatDate(newStart) !== formatDate(endTime)) {
      res.push(formatDate(newStart));
      newStart = nextDay(newStart);
    }
    res.push(formatDate(newStart));
    return res;
  };
  render() {
    const {
      id,
      startTime,
      style,
      endTime,
      data,
      viewer,
      Renderer,
      fetchData,
      width,
      disabled,
      children,
      getRef,
      title,
      onScroll,
      onNodeSelect,
      hideIntervalSelect,
    } = this.props;
    const { interval } = this.state;
    const timeItemWidth = this.getTimeItemWidth();
    const dates = this.genDate(startTime, endTime);

    return (
      <Fragment>
        <div
          className={`${styles.ganttComponent}`}
          id={id}
          onScroll={e => {
            if (onScroll) {
              onScroll(e);
            }
          }}
          style={{ ...style, width: width || defaultWidth }}
          ref={e => {
            this.chartContainer = e;
            if (getRef) {
              getRef(e);
            }
          }}
        >
          {children}
          <div
            className={styles.timelineRow}
            style={{
              width: (minutesOneDay / interval) * dates.length * timeItemWidth,
              position: 'sticky',
              top: 0,
              zIndex: 19,
            }}
          >
            {dates.map(date => (
              <div className={styles.timelineItem} key={date}>
                <div
                  ref={e => {
                    if (moment().isSame(date, 'day')) {
                      this.currentTimeDiv = e;
                    }
                  }}
                  className={styles.dateItem}
                  style={{
                    width: '100%',
                    height: headerHeight / 3,
                    ...(moment().isSame(date, 'day') ? { color: blacklakeGreen } : {}),
                  }}
                >
                  <span
                    style={{
                      position: 'sticky',
                      left: 16,
                    }}
                  >
                    {date}
                  </span>
                </div>
                <div className={styles.timeItemContainer} style={{ height: headerHeight / 3 }}>
                  {genArr(minutesOneDay / interval, null, interval).map(delta => {
                    const time = dayStart(date).add(delta, 'minutes');
                    const isCurrentTime = diff(moment(), time) >= 0 && diff(moment(), time) < interval;
                    let colorStyle = {};
                    if (isCurrentTime) {
                      colorStyle = {
                        color: blacklakeGreen,
                      };
                    }
                    return (
                      <div
                        className={styles.timeItem}
                        style={{ width: timeItemWidth, textAlign: 'center', ...colorStyle }}
                        key={delta + 1}
                      >
                        {dayStart(date)
                          .add(delta, 'minutes')
                          .format('HH:mm')}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {!hideIntervalSelect && (
            <Select
              className={styles.intervalSelect}
              style={{ marginTop: -headerHeight / 3 }}
              value={interval}
              onChange={interval => {
                // 需要保持scrollLeft 按比例放大缩小
                const oldInterval = this.state.interval;
                const oldScrollLeft = this.chartContainer.scrollLeft;
                this.setState({ interval }, () => {
                  localStorage.setItem('interval', interval);
                  this.chartContainer.scrollLeft = (oldScrollLeft / interval) * oldInterval;
                });
              }}
            >
              <Option value={30}>30分钟</Option>
              <Option value={60}>1小时</Option>
              <Option value={240}>4小时</Option>
              <Option value={720}>12小时</Option>
              <Option value={1440}>24小时</Option>
            </Select>
          )}
          <div
            className={'chartContainer'}
            style={{
              width: (minutesOneDay / interval) * dates.length * timeItemWidth,
            }}
          >
            <ProgressChart
              data={data}
              viewer={viewer}
              Renderer={Renderer}
              disabled={disabled}
              fetchData={fetchData}
              onNodeSelect={onNodeSelect}
              range={{
                defaultStartTime: startTime,
                defaultEndTime: endTime,
                interval,
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}
Gantt.childContextTypes = {
  range: {
    interval: Number,
    defaultStartTime: Date,
    defaultEndTime: Date,
  },
  timeItemWidth: Number,
};
Gantt.ProgressRenderer = DefaultProgressRenderer;

export default Gantt;
