import React, { Component } from 'react';
import _ from 'lodash';
import { Spin, ReactEcharts, Tooltip, RestPagingTable } from 'src/components';
import { border, white, fontSub, error } from 'src/styles/color/index';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import echarts from 'echarts';
import { getQuery } from 'src/routes/getRouteParams';
import { getEquipOverviewFault } from 'services/equipmentMaintenance/base';
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

class FailureAnalysis extends Component {
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
    getEquipOverviewFault(params)
      .then(res => {
        const {
          data: { data },
        } = res;
        if (data.details && data.details.length) {
          let totalLabelCount = 0;
          data.details.forEach(n => {
            totalLabelCount += n.labelCount;
          });
          const sourceData = [];
          data.details.forEach((n, i) => {
            n.index = i + 1;
            sourceData.push(n);
            if ((i + 2) % 10 === 0 || i === data.details.length - 1) {
              sourceData.push({
                index: changeChineseToLocale('总计', intl),
                labelCode: replaceSign,
                labelName: replaceSign,
                labelCount: totalLabelCount,
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

  getFailureAnalysisChartOption = () => {
    const { intl } = this.props;
    const { data } = this.state;
    if (data) {
      const { metrics } = data;
      const date = metrics.map(n => n.faultName);
      const faultCounts = metrics.map(n => n.faultCount);
      const accPercents = metrics.map(n => n.accPercent);
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
            name: `(${changeChineseToLocale('次', intl)})`,
            nameTextStyle: {
              color: fontSub,
            },
          },
          {
            name: '(%)',
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
            data: faultCounts,
            type: 'bar',
            barMaxWidth: 50,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#FFC900' },
                { offset: 1, color: '#FFB700' },
              ]),
            },
          },
          {
            data: accPercents,
            type: 'line',
            yAxisIndex: 1,
            itemStyle: {
              color: error,
            },
          },
        ],
      };
    }
  };

  getColumns = () => {
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
      },
      {
        title: '故障编号',
        dataIndex: 'labelCode',
        key: 'labelCode',
        render: labelCode => <Tooltip text={labelCode || replaceSign} length={20} />,
      },
      {
        title: '故障名称',
        dataIndex: 'labelName',
        key: 'labelName',
        render: labelName => <Tooltip text={labelName || replaceSign} length={20} />,
      },
      {
        title: '故障次数',
        dataIndex: 'labelCount',
        key: 'labelCount',
      },
    ];
    return columns;
  };

  render() {
    const { intl } = this.props;
    const { loading, data } = this.state;
    const failureAnalysisOption = this.getFailureAnalysisChartOption();
    const columns = this.getColumns();
    return (
      <Spin spinning={loading}>
        {data ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {renderBadgeGroup([{ text: '故障频次', color: '#FFB700' }, { text: '累计百分比', color: error }], intl)}
              <ReactEcharts option={failureAnalysisOption} onEvents={this.onEvents} style={chartStyle} />
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

export default injectIntl(FailureAnalysis);
