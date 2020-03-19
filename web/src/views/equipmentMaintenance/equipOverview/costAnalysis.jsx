import React, { Component } from 'react';
import _ from 'lodash';
import { Spin, ReactEcharts, RestPagingTable, Tooltip } from 'src/components';
import { border, white, black, fontSub, error } from 'src/styles/color/index';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { getEquipOverviewOperationCost } from 'services/equipmentMaintenance/base';
import { replaceSign } from 'src/constants';
import { getFormatParams } from './base';
import styles from './styles.scss';

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

class CostAnalysis extends Component {
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
    getEquipOverviewOperationCost(params)
      .then(res => {
        const {
          data: { data },
        } = res;
        if (data.details && data.details.length) {
          let totalRepairTime = 0;
          let totalRepairCount = 0;
          let totalMaintainTime = 0;
          let totalMaintainCount = 0;
          let totalCheckTime = 0;
          let totalCheckCount = 0;
          data.details.forEach(n => {
            totalRepairTime += n.repairTime;
            totalRepairCount += n.repairCount;
            totalMaintainTime += n.maintainTime;
            totalMaintainCount += n.maintainCount;
            totalCheckTime += n.checkTime;
            totalCheckCount += n.checkCount;
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
                repairTime: totalRepairTime,
                repairCount: totalRepairCount,
                maintainTime: totalMaintainTime,
                maintainCount: totalMaintainCount,
                checkTime: totalCheckTime,
                checkCount: totalCheckCount,
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

  getDowntimeChartData = () => {
    const { intl } = this.props;
    const { data } = this.state;
    if (data) {
      const { checkPercent, checkTime, maintainPercent, maintainTime, repairPercent, repairTime } = data;
      const pieData = [
        {
          label: {
            formatter: [
              `{a|${changeChineseToLocale('点检工时', intl)}}`,
              `{b|${(checkPercent * 100).toFixed(1)}%}`,
            ].join('\n'),
            rich: {
              a: { color: fontSub },
              b: { color: black },
            },
          },
          value: checkTime,
          itemStyle: {
            color: '#AD84FF',
          },
        },
        {
          label: {
            formatter: [
              `{a|${changeChineseToLocale('维修工时', intl)}}`,
              `{b|${(maintainPercent * 100).toFixed(1)}%}`,
            ].join('\n'),
            rich: {
              a: { color: fontSub },
              b: { color: black },
            },
          },
          value: maintainTime,
          itemStyle: {
            color: error,
          },
        },
        {
          label: {
            formatter: [
              `{a|${changeChineseToLocale('保养工时', intl)}}`,
              `{b|${(repairPercent * 100).toFixed(1)}%}`,
            ].join('\n'),
            rich: {
              a: { color: fontSub },
              b: { color: black },
            },
          },
          value: repairTime,
          itemStyle: {
            color: '#FFB700',
          },
        },
      ];
      return {
        tooltip: {
          trigger: 'axis',
        },
        series: [
          {
            data: pieData,
            type: 'pie',
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
        title: (
          <div>
            <div style={{ textAlign: 'center', borderBottom: `1px solid ${border}`, padding: '6px 0' }}>
              {changeChineseToLocale('维修', intl)}
            </div>
            <div style={{ padding: '6px 0' }}>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>
                {changeChineseToLocale('维修工时', intl)}
              </span>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>
                {changeChineseToLocale('维修次数', intl)}
              </span>
            </div>
          </div>
        ),
        dataIndex: 'repairTime',
        key: 'repairTime',
        render: (repairTime, record) => {
          return (
            <div style={{ padding: '6px 0' }}>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>{repairTime}</span>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>{record.repairCount}</span>
            </div>
          );
        },
      },
      {
        title: (
          <div>
            <div style={{ textAlign: 'center', borderBottom: `1px solid ${border}`, padding: '6px 0' }}>
              {changeChineseToLocale('保养', intl)}
            </div>
            <div style={{ padding: '6px 0' }}>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>
                {changeChineseToLocale('保养工时', intl)}
              </span>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>
                {changeChineseToLocale('保养次数', intl)}
              </span>
            </div>
          </div>
        ),
        dataIndex: 'maintainTime',
        key: 'maintainTime',
        render: (maintainTime, record) => {
          return (
            <div style={{ padding: '6px 0' }}>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>{maintainTime}</span>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>{record.maintainCount}</span>
            </div>
          );
        },
      },
      {
        title: (
          <div>
            <div style={{ textAlign: 'center', borderBottom: `1px solid ${border}`, padding: '6px 0' }}>
              {changeChineseToLocale('点检', intl)}
            </div>
            <div style={{ padding: '6px 0' }}>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>
                {changeChineseToLocale('点检工时', intl)}
              </span>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>
                {changeChineseToLocale('点检次数', intl)}
              </span>
            </div>
          </div>
        ),
        dataIndex: 'checkTime',
        key: 'checkTime',
        render: (checkTime, record) => {
          return (
            <div style={{ padding: '6px 0' }}>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>{checkTime}</span>
              <span style={{ textAlign: 'center', width: '50%', display: 'inline-block' }}>{record.checkCount}</span>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  renderBadge = (text, color) => {
    const { intl } = this.props;
    return (
      <div>
        <span style={{ width: 9, height: 9, display: 'inline-block', backgroundColor: color }} />
        <span style={{ color: fontSub, marginLeft: 5 }}>{changeChineseToLocale(text, intl)}</span>
      </div>
    );
  };

  render() {
    const { loading, data } = this.state;
    const chartDowntimeOption = this.getDowntimeChartData();
    const columns = this.getColumns();
    return (
      <Spin spinning={loading}>
        {data ? (
          <div className={styles.costAnalysis}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', zIndex: 10, top: 45, left: '90%' }}>
                {this.renderBadge('维修工时', error)}
                {this.renderBadge('保养工时', '#FFB700')}
                {this.renderBadge('点检工时', '#AD84FF')}
              </div>
              <div className={styles.circle} />
              <ReactEcharts option={chartDowntimeOption} onEvents={this.onEvents} style={chartStyle} />
            </div>
            <div style={{ margin: '10px -20px 0 -20px' }}>
              <RestPagingTable
                bordered
                dataSource={data.details || []}
                total={data.details && data.details.length}
                columns={columns}
                pagination={{ pageSize: 11 }}
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

export default injectIntl(CostAnalysis);
