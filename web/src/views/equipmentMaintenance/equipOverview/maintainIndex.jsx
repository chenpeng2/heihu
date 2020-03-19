import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'src/utils/time';
import { FilterSortSearchBar, Spin, ReactEcharts, RestPagingTable, Tooltip } from 'src/components';
import { border, white, primary, fontSub } from 'src/styles/color/index';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { getEquipOverviewRepairMetric } from 'services/equipmentMaintenance/base';
import { replaceSign } from 'src/constants';
import { getFormatParams } from './base';
import styles from './styles.scss';

const Item = FilterSortSearchBar.Item;
const chartStyle = {
  border: `1px solid ${border}`,
  backgroundColor: white,
  width: '49.5%',
  height: 300,
};

type Props = {
  match: any,
  intl: any,
  params: {},
  search: any,
  isSearch: boolean,
};

class MaintainIndex extends Component {
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
    this.setState({ loading: true });
    getEquipOverviewRepairMetric(params)
      .then(res => {
        const {
          data: { data },
        } = res;
        if (data.details && data.details.length) {
          data.details.forEach((n, i) => {
            n.index = i + 1;
          });
        }
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getMTTRChartData = () => {
    const { intl } = this.props;
    const { data } = this.state;
    if (data) {
      const { mttr } = data;
      const { metrics, avgMTTR } = mttr;
      const date = metrics.map(n => moment(n.date).format('MM/DD'));
      const avgMTTRs = metrics.map(n => n.avgMTTR);
      return {
        title: [
          {
            text: `{b|MTTR}{c|${avgMTTR}}`,
            right: '9%',
            top: 20,
            textStyle: {
              rich: {
                b: { color: fontSub, padding: [0, 10, 0, 0] },
                c: { color: '#FF3B30' },
              },
            },
          },
        ],
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
        ],
        tooltip: {
          trigger: 'axis',
        },
        series: [
          {
            data: avgMTTRs,
            type: 'line',
            yAxisIndex: 0,
            itemStyle: {
              color: '#FF3B30',
            },
          },
        ],
      };
    }
  };

  getMTBFChartData = () => {
    const { intl } = this.props;
    const { data } = this.state;
    if (data) {
      const { mtbf } = data;
      const { metrics, avgMTBF } = mtbf;
      const date = metrics.map(n => moment(n.date).format('MM/DD'));
      const avgMTBFs = metrics.map(n => n.avgMTBF);
      return {
        title: [
          {
            text: `{b|MTBF}{c|${avgMTBF}}`,
            right: '9%',
            top: 20,
            textStyle: {
              rich: {
                b: { color: fontSub, padding: [0, 10, 0, 0] },
                c: { color: primary },
              },
            },
          },
        ],
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
        ],
        tooltip: {
          trigger: 'axis',
        },
        series: [
          {
            data: avgMTBFs,
            type: 'line',
            yAxisIndex: 0,
            itemStyle: {
              color: '#01B882',
            },
          },
        ],
      };
    }
  };

  getColumns = () => {
    const { intl } = this.props;
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 100,
      },
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
        width: 160,
        render: deviceCode => <Tooltip text={deviceCode || replaceSign} length={16} />,
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
        width: 160,
        render: deviceName => <Tooltip text={deviceName || replaceSign} length={16} />,
      },
      {
        title: '维修工时',
        dataIndex: 'repairTime',
        key: 'repairTime',
        width: 100,
      },
      {
        title: '响应时间',
        dataIndex: 'responseTime',
        key: 'responseTime',
        width: 100,
      },
      {
        title: '维修次数',
        dataIndex: 'repairCount',
        key: 'repairCount',
        width: 100,
      },
      {
        title: (
          <div>
            <div style={{ textAlign: 'center', borderBottom: `1px solid ${border}`, padding: '6px 0' }}>MTTR</div>
            <div style={{ padding: '6px 0' }}>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>
                {changeChineseToLocale('响应', intl)}T1
              </span>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>
                {changeChineseToLocale('维修', intl)}T2
              </span>
            </div>
          </div>
        ),
        dataIndex: 'mttr',
        key: 'mttr',
        width: 160,
        render: (mttr, record) => {
          const { mttrT1, mttrT2 } = record;
          return (
            <div>
              <div style={{ textAlign: 'center', borderBottom: `1px solid ${border}`, padding: '6px 0' }}>{mttr}</div>
              <div style={{ padding: '6px 0' }}>
                <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>{mttrT1}</span>
                <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>{mttrT2}</span>
              </div>
            </div>
          );
        },
      },
      {
        title: 'MTBF',
        dataIndex: 'mtbf',
        key: 'mtbf',
        width: 160,
      },
    ];
    return columns;
  };

  render() {
    const { form } = this.props;
    const { loading, data } = this.state;
    const chartMTTROption = this.getMTTRChartData();
    const chartMTBFOption = this.getMTBFChartData();
    const columns = this.getColumns();
    return (
      <Spin spinning={loading}>
        {data ? (
          <div className={styles.maintainIndex}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ReactEcharts option={chartMTTROption} onEvents={this.onEvents} style={chartStyle} />
              <ReactEcharts option={chartMTBFOption} onEvents={this.onEvents} style={chartStyle} />
            </div>
            <div style={{ margin: '10px -20px 0 -20px' }}>
              <RestPagingTable
                bordered
                dataSource={data.details || []}
                total={data.details && data.details.length}
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

export default injectIntl(MaintainIndex);
