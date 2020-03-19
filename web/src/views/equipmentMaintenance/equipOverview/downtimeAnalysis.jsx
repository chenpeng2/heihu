import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'src/utils/time';
import { Spin, ReactEcharts, Tooltip, RestPagingTable } from 'src/components';
import { border, white, fontSub, error } from 'src/styles/color/index';
import echarts from 'echarts';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { getEquipOverviewDowntime } from 'services/equipmentMaintenance/base';
import { replaceSign } from 'src/constants';
import { getFormatParams, renderBadgeGroup } from './base';

const chartStyle = {
  border: `1px solid ${border}`,
  backgroundColor: white,
  width: '100%',
  height: 300,
};

type Props = {
  match: any,
  intl: any,
  params: {},
  search: any,
  isSearch: boolean,
};

class DowntimeAnalysis extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
  };

  componentWillMount() {
    const { match } = this.props;
    const query = getQuery(match);
    if (query.time) {
      const params = getFormatParams(query);
      this.getData(params);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { search } = nextProps;
    if (search.time && search.isSearch) {
      const params = getFormatParams(search);
      this.getData(params);
    }
  }

  getData = async params => {
    const { intl } = this.props;
    this.setState({ loading: true });
    getEquipOverviewDowntime(params)
      .then(res => {
        const {
          data: { data },
        } = res;
        if (data.details && data.details.length) {
          let totalDownTime = 0;
          let totalDownCount = 0;
          data.details.forEach(n => {
            totalDownTime += n.downTime;
            totalDownCount += n.downCount;
          });
          const sourceData = [];
          data.details.forEach((n, i) => {
            n.index = i + 1;
            sourceData.push(n);
            if ((i + 1) % 10 === 0 || i === data.details.length - 1) {
              sourceData.push({
                index: changeChineseToLocale('总计', intl),
                deviceCode: replaceSign,
                deviceName: replaceSign,
                downTime: totalDownTime,
                downCount: totalDownCount,
              });
            }
          });
          data.details = sourceData;
        }
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getColumns = () => {
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
      },
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
        render: deviceCode => <Tooltip text={deviceCode || replaceSign} length={20} />,
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
        render: deviceName => <Tooltip text={deviceName || replaceSign} length={20} />,
      },
      {
        title: '停机时长',
        dataIndex: 'downTime',
        key: 'downTime',
      },
      {
        title: '停机次数',
        dataIndex: 'downCount',
        key: 'downCount',
      },
    ];
    return columns;
  };

  getDowntimeChartData = () => {
    const { intl } = this.props;
    const { data } = this.state;
    if (data) {
      const { metrics } = data;
      const date = metrics.map(n => moment(n.date).format('MM/DD'));
      const downTimes = metrics.map(n => n.downTime);
      const downCounts = metrics.map(n => n.downCount);
      return {
        legend: {
          type: 'scroll',
        },
        xAxis: {
          type: 'category',
          data: date,
        },
        yAxis: [
          {
            name: `(${changeChineseToLocale('小时', intl)})`,
            nameTextStyle: {
              color: fontSub,
            },
          },
          {
            name: `(${changeChineseToLocale('次', intl)})`,
            nameTextStyle: {
              color: fontSub,
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
        },
        series: [
          {
            data: downTimes,
            type: 'line',
            itemStyle: {
              color: error,
            },
          },
          {
            data: downCounts,
            type: 'bar',
            yAxisIndex: 1,
            barMaxWidth: 50,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#FFC900' },
                { offset: 1, color: '#FFB700' },
              ]),
            },
          },
        ],
      };
    }
  };

  render() {
    const { intl } = this.props;
    const { loading, data } = this.state;
    const chartDowntimeOption = this.getDowntimeChartData();
    const columns = this.getColumns();
    return (
      <Spin spinning={loading}>
        {data ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {renderBadgeGroup([{ text: '停机次数', color: '#FFB700' }, { text: '停机时长', color: error }], intl)}
              <ReactEcharts option={chartDowntimeOption} onEvents={this.onEvents} style={chartStyle} />
            </div>
            <div style={{ margin: '10px -20px 0 -20px' }}>
              <RestPagingTable
                bordered
                dataSource={data.details || []}
                total={data.details && data.details.length}
                pagination={{ pageSize: 11 }}
                columns={columns}
                scroll={{ x: true }}
                refetch={() => {}}
              />
            </div>
          </div>
        ) : null}
      </Spin>
    );
  }
}

export default injectIntl(DowntimeAnalysis);
