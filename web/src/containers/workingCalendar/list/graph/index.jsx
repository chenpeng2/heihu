import React, { Component } from 'react';
import { extendMoment } from 'moment-range';
import _ from 'lodash';

import { Spin, Tooltip } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { queryWorkstation } from 'src/services/workstation';
import { getWorkingCalendarByWorkstationIds } from 'src/services/knowledgeBase/workingCalendar';
import Moment from 'src/utils/time';
import { greyWhite, white, border, black } from 'src/styles/color';
import { calcTotalTime } from 'src/containers/workingTime/utils';

import Table from './table';
import AvailableTimeItem from './availableTimeItem';
import { AVAILABLE_DATE_TYPE, WORKINGDAY, STATUS_DISPLAY } from '../../constant';
import Title from './title';

const moment = extendMoment(Moment);

const TABLE_CONTAINER_WIDTH = 780;
const TITLE_HEIGHT = 30;
const WORKSTATION_CELL_WIDTH = 200;
const WORKSTATION_TITLE_HEIGHT = 60;
const TABLE_CELL_HEIGHT = 40;
const TABLE_CELL_WIDTH = 120;

type Props = {
  style: {},
};

class Graph extends Component {
  props: Props;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: [],
      columns: [],
      activeYear: moment().year(),
      workstationIds: [],
      initialScrollLeft: 0,
    };
  }

  componentWillMount() {
    const { activeYear } = this.state;

    const columns = this.generateColumns(activeYear);
    this.setState({ columns });
  }

  componentDidMount() {
    const { activeYear } = this.state;

    queryWorkstation({ status: 1 }).then(res => {
      const workstationIds = _.get(res, 'data.data').map(({ id }) => id);
      this.getData(workstationIds, activeYear).then(data => {
        this.setState({ workstationIds, data, initialScrollLeft: this.calcTodayScrollLeft(activeYear) });
      });
    });
  }

  renderCell = data => {
    const getBodyComponent = dayData => {
      const { operatingHour, workingDay, status } = dayData || {};
      const { periods } = operatingHour || {};

      // 不是工作日为白色
      if (WORKINGDAY[workingDay] === '否') {
        return <div style={{ background: white, height: TABLE_CELL_HEIGHT, width: TABLE_CELL_WIDTH }} />;
      }

      // 停用的显示默认24小时都是工作时间
      if (status && STATUS_DISPLAY[status.code] === '停用') {
        return <AvailableTimeItem />;
      }

      if (operatingHour && periods) {
        // 计算出有效时间的item组件的left和width
        const getLeftAndWidth = period => {
          const { startTime, endTime } = period || {};

          const startOfDay = { hour: 0, minute: 0 };
          const _startTime = { hour: Number(startTime.split(':')[0]), minute: Number(startTime.split(':')[1]) };
          const _endTime = { hour: Number(endTime.split(':')[0]), minute: Number(endTime.split(':')[1]) };

          const calcPercentage = timeBucket => {
            const { hour, minute } = timeBucket;

            const minutes = hour * 60 + minute;

            return minutes / (24 * 60) * TABLE_CELL_WIDTH;
          };

          const left = calcPercentage(calcTotalTime([{ startTime: startOfDay, endTime: _startTime }]));
          const width = calcPercentage(calcTotalTime([{ startTime: _startTime, endTime: _endTime }]));

          return { left, width };
        };

        return (
          <div style={{ background: white, height: TABLE_CELL_HEIGHT, width: TABLE_CELL_WIDTH, position: 'relative' }}>
            {periods.map(item => {
              const { left, width } = getLeftAndWidth(item);
              return <AvailableTimeItem data={item} style={{ position: 'absolute', left, width }} />;
            })}
          </div>
        );
      }

      // 默认7*24都是工作时间
      return <AvailableTimeItem />;
    };

    // 从天的角度上来看，只显示当前天那个优先级最高的，启用的生产日历
    const _data = Array.isArray(data)
      ? [
          data.filter(item => item && item.status && item.status.code === 1).reduce((prev, next) => {
            const { priority: prevP } = prev || {};
            const { priority: nextP } = next || {};

            if (prevP > nextP) return prev;
            return next;
          }, {}),
        ]
      : [];

    return (
      <div
        style={{
          background: white,
          height: TABLE_CELL_HEIGHT,
          lineHeight: '40px',
        }}
      >
        {Array.isArray(_data) && _data.length ? _data.map(item => getBodyComponent(item)) : getBodyComponent()}
      </div>
    );
  };

  renderWorkStationCell = data => {
    const { name } = data;
    return (
      <div
        style={{
          background: white,
          padding: '0px 10px',
          height: TABLE_CELL_HEIGHT,
          lineHeight: `${TABLE_CELL_HEIGHT}px`,
          color: black,
        }}
      >
        <Tooltip text={name} length={15} />
      </div>
    );
  };

  renderTitle = title => {
    return (
      <div
        style={{ background: greyWhite, padding: `${TITLE_HEIGHT}px 10px 10px 10px`, height: WORKSTATION_TITLE_HEIGHT }}
      >
        {title}
      </div>
    );
  };

  renderWorkStationTitle = () => {
    const { activeYear } = this.state;

    return (
      <div style={{ background: white, padding: '0px 10px 10px 10px', height: WORKSTATION_TITLE_HEIGHT }}>
        <div style={{ margin: '5px 0px', color: black }}>工位列表</div>
        <SearchSelect
          style={{ width: WORKSTATION_CELL_WIDTH - 20 }}
          type={'workstation'}
          placeholder={'全部工位'}
          params={{ status: 1 }}
          onChange={value => {
            if (value) {
              const { key } = value || {};
              this.getData([key], activeYear).then(data => {
                this.setState({ workstationIds: [key], data });
              });
            } else {
              queryWorkstation({ status: 1 }).then(res => {
                const workstationIds = _.get(res, 'data.data').map(({ id }) => id);
                this.getData(workstationIds, activeYear).then(data => {
                  this.setState({ workstationIds, data });
                });
              });
            }
          }}
        />
      </div>
    );
  };

  generateColumns = activeYear => {
    if (!activeYear) return;
    const res = [];

    res.push({
      title: '全部工位',
      fixed: 'left',
      width: WORKSTATION_CELL_WIDTH,
      key: 'workstation',
      render: this.renderWorkStationCell,
      renderTitle: this.renderWorkStationTitle,
    });

    const startDayOfYear = moment()
      .year(activeYear)
      .startOf('year');
    const endDayOfYear = moment()
      .year(activeYear)
      .endOf('year');

    const range = moment.range(startDayOfYear, endDayOfYear);
    const weeks = moment.weekdays(true);

    const days = Array.from(range.by('days')).map(value => {
      return {
        title: `${moment(value).format('MM/DD')}(${weeks[moment(value).isoWeekday() - 1]})`,
        key: moment(value).format('YYYY/MM/DD'),
        width: TABLE_CELL_WIDTH,
        render: this.renderCell,
        renderTitle: this.renderTitle,
      };
    });

    return res.concat(days);
  };

  // 将拉取回来的数据转换为以天为key的数据
  formatWorkingCalendarData = (data, activeYear) => {
    if (!Array.isArray(data) || !data.length || !activeYear) return {};

    // 将日期转换为具体的天
    const formatAvailableDateToDateFormat = (type, value, range) => {
      const { startTime, endTime } = range || {};

      let res = [];

      if (AVAILABLE_DATE_TYPE[type].type === 'specified') {
        res = res.concat(value.map(item => moment(item).format('YYYY/MM/DD')));
      }

      if (AVAILABLE_DATE_TYPE[type].type === 'holiday') {
        res = res.concat(value.map(item => moment(item).format('YYYY/MM/DD')));
      }

      if (AVAILABLE_DATE_TYPE[type].type === 'week') {
        // 将适用日期范围内的每一个对应的周写到res中
        for (let i = startTime; moment(i).isBefore(endTime); i = moment(i).add(1, 'd')) {
          if (
            value.indexOf(
              moment(i)
                .isoWeekday()
                .toString(),
            ) !== -1
          ) {
            res.push(moment(i).format('YYYY/MM/DD'));
          }
        }
      }

      if (AVAILABLE_DATE_TYPE[type].type === 'month') {
        // 来找到activeYear的第几月的开始日期
        const getStartDateOfOneMonth = m => {
          return moment()
            .year(activeYear)
            .startOf('year')
            .add(m - 1, 'M')
            .format('YYYY/MM/DD');
        };

        value.forEach(item => {
          const _res = [];

          const startDayOfOneMonth = getStartDateOfOneMonth(item);
          const nextMonthStartDay = moment(startDayOfOneMonth).add(1, 'M');

          for (let i = startDayOfOneMonth; moment(i).isBefore(nextMonthStartDay); i = moment(i).add(1, 'd')) {
            _res.push(moment(i).format('YYYY/MM/DD'));
          }

          res = res.concat(_res);
        });
      }

      // 根据适用时间范围来实现对时间的过滤
      res = res.filter(date => {
        if (moment(date).isBefore(startTime) || moment(date).isAfter(endTime)) {
          return false;
        }
        return true;
      });

      return res;
    };

    const dataAfterFormat = {};
    data.forEach(item => {
      const { startTime, endTime } = item || {};
      const startDayOfYear = moment()
        .year(activeYear)
        .startOf('year');
      const endDayOfYear = moment()
        .year(activeYear)
        .endOf('year');

      formatAvailableDateToDateFormat(item.availableDateType, item.availableDateValue, {
        startTime: startTime ? moment(startTime) : startDayOfYear,
        endTime: endTime ? moment(endTime) : endDayOfYear,
      }).forEach(date => {
        if (!dataAfterFormat[date]) {
          dataAfterFormat[date] = [item];
        } else {
          dataAfterFormat[date].push(item);
        }
      });
    });

    return dataAfterFormat;
  };

  getData = async (ids, year) => {
    if (!Array.isArray(ids) || !ids.length || !year) return;

    const workstationIds = ids;

    this.setState({ loading: true });

    const data = await getWorkingCalendarByWorkstationIds({ workstationIds, year: year || moment().year() });
    const calendarsByWorkstation = _.get(data, 'data.data');

    this.setState({ loading: false });

    const res = Array.isArray(calendarsByWorkstation)
      ? calendarsByWorkstation.filter(({ workstation }) => workstation && workstation.id)
      : [];

    return res.map(({ workstation, produceCalendars }) => {
      const allData = this.formatWorkingCalendarData(produceCalendars, year);
      return { workstation, ...allData };
    });
  };

  // 计算今天需要scroll到哪里
  calcTodayScrollLeft = activeYear => {
    if (moment().year() !== activeYear) {
      return 0;
    }

    const startDayOfYear = moment()
      .year(activeYear)
      .startOf('year');

    return moment().diff(startDayOfYear, 'days') * TABLE_CELL_WIDTH;
  };

  render() {
    const { style } = this.props;
    const { data, loading, columns, activeYear, workstationIds, initialScrollLeft } = this.state || {};

    return (
      <Spin spinning={loading}>
        <div
          style={{
            margin: 20,
            marginBottom: 40,
            position: 'relative',
            border: `1px solid ${border}`,
            minWidth: TABLE_CONTAINER_WIDTH,
            ...style,
          }}
        >
          <Table
            initialLeftScroll={initialScrollLeft}
            columns={columns || []}
            dataSource={data || []}
          />
          <Title
            style={{
              position: 'absolute',
              left: WORKSTATION_CELL_WIDTH,
              top: 1,
              width: TABLE_CONTAINER_WIDTH - WORKSTATION_CELL_WIDTH - 2,
              height: TITLE_HEIGHT,
            }}
            cbForSelect={value => {
              const columns = this.generateColumns(value);
              this.getData(workstationIds, value).then(data => {
                this.setState({ activeYear: value, data, columns, initialScrollLeft: this.calcTodayScrollLeft(value) });
              });
            }}
            activeYear={activeYear}
          />
        </div>
      </Spin>
    );
  }
}

export default Graph;
