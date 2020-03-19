import React from 'react';
import { injectIntl } from 'react-intl';
import {
  DatePicker,
  FilterSortSearchBar,
  Select,
  withForm,
  ReactEcharts,
  SimpleTable,
  Button,
  Link,
  Tooltip,
  message,
  Icon,
} from 'components';
import { getInputFactoryQCRecordsList, getInputFactoryQCGraph } from 'services/qualityManagement/inputFactoryQCRecords';
import { formatRangeUnix, formatUnixMoment, formatUnix } from 'utils/time';
import moment from 'moment';
import SearchSelect from 'components/select/searchSelect';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { round } from 'utils/number';
import Color from 'styles/color';
import { replaceSign } from 'constants';
import { exportXlsxFile } from 'utils/exportFile';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const DayRangePicker = DatePicker.DayRangePicker;
const WeekRangePicker = DatePicker.WeekRangePicker;
const MonthRangePicker = DatePicker.MonthRangePicker;

const intervals = [
  {
    key: 'DAY',
    display: '按天',
    value: 6,
    datePickerMode: 'day',
  },
  {
    key: 'WEEK',
    display: '按周',
    value: 7,
    datePickerMode: 'week',
  },
  {
    key: 'MONTH',
    display: '按月',
    value: 8,
    datePickerMode: 'month',
  },
];

const initalState = {
  dataSource: null,
  chartData: {},
  graphData: null,
  searchParams: {},
  total: 0,
};

const headerStyle = {
  marginLeft: 20,
  fontSize: 14,
};

class QcTaskChart extends React.PureComponent {
  state = initalState;

  componentDidMount() {
    this.searchOnForm();
  }

  onEvents = {
    click: ({ name }) => {
      const { graphData, searchParams } = this.state;
      const { timeFrom, timeTill } = graphData[name];
      this.setDataSource({ ...searchParams, timeFrom, timeTill, page: 1 });
    },
  };

  setDataSource = async params => {
    const searchParams = {
      ...this.state.searchParams,
      ...params,
    };
    this.setState({ searchParams });
    const {
      data: { data, total },
    } = await this.fetchData(searchParams);
    this.setState({ dataSource: data, total });
  };

  fetchData = async params => {
    const data = await getInputFactoryQCRecordsList(params);
    return data;
  };

  setOption = async params => {
    const { intl } = this.props;
    const {
      data: { data },
    } = await getInputFactoryQCGraph(params);
    let xAxis = Object.keys(data).filter(key => data[key].qcTaskCount > 0);
    xAxis = xAxis.length > 0 ? xAxis : Object.keys(data);
    const qcTaskCountData = xAxis.map(key => data[key].qcTaskCount);
    const checkFaultyRateData = xAxis.map(key => data[key].checkFaultyRate * 100);
    const dataSet = xAxis.map(key => data[key]);
    const chartData = {
      backgroundColor: Color.grey,
      dataSet,
      grid: {
        left: '0',
        bottom: '0',
        right: 50,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: value => {
          const { axisValue } = value[0];
          const { date, qcTaskCount, checkFaultyRate, supplierCount } = data[axisValue];
          return `${changeChineseToLocale('日期', intl)}：${date} <br/> ${changeChineseToLocale(
            '来料供应商',
            intl,
          )}：${supplierCount}<br/> ${changeChineseToLocale(
            '总计质检任务',
            intl,
          )}：${qcTaskCount} <br/> ${changeChineseToLocale('平均不良率', intl)}：${round(checkFaultyRate * 100, 2)}%`;
        },
      },
      legend: {
        data: [
          changeChineseToLocale('质检任务数量', intl),
          changeChineseToLocale('不良率', intl),
          changeChineseToLocale('线性不良率', intl),
        ],
        left: 0,
      },
      xAxis: {
        type: 'category',
        data: xAxis,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        {
          type: 'value',
          show: false,
        },
      ],
      series: [
        {
          name: changeChineseToLocale('质检任务数量', intl),
          data: qcTaskCountData,
          type: 'bar',
          barMaxWidth: 50,
          itemStyle: {
            color: Color.primary,
          },
          label: {
            normal: {
              show: true,
              position: 'top',
            },
          },
        },
        {
          name: changeChineseToLocale('不良率', intl),
          data: checkFaultyRateData,
          type: 'line',
          yAxisIndex: 1,
          itemStyle: {
            color: Color.alertYellow,
          },
          label: {
            show: true,
            formatter: ({ value }) => (value ? `${round(value, 2)}%` : ''),
          },
          markLine: {
            silent: true,
            data: [{ type: 'average', name: changeChineseToLocale('线性不良率', intl) }],
            lineStyle: {
              color: Color.red,
            },
            label: {
              formatter: changeChineseToLocale('不良率(线性)\n{c}%', intl),
              position: 'end',
            },
          },
        },
      ],
    };
    this.setState({
      chartData,
      graphData: data,
    });
  };

  searchOnForm = () => {
    const { times, supplierCodes, materialCodes, ...value } = this.props.form.getFieldsValue();
    if (!Array.isArray(times) || times.length === 0) {
      message.error('请填写任务结束时间');
      return;
    }
    const params = {
      ...value,
      page: 1,
      timeFrom: formatRangeUnix(times)[0],
      timeTill: formatRangeUnix(times)[1],
      supplierCodes: supplierCodes && supplierCodes.map(({ key }) => key),
      materialCodes: materialCodes && materialCodes.map(({ key }) => key),
    };
    if (sensors) {
      sensors.track('web_quanlity_incomeReportList_search', {
        FilterCondition: params,
      });
    }
    this.setDataSource(params);
    this.setOption(params);
  };

  exportXLSX = async columns => {
    const { timeFrom, timeTill } = this.state.searchParams;
    const header = columns.map(({ title }) => title);
    const {
      data: { data },
    } = await this.fetchData({ ...this.state.searchParams, page: 1, size: 100000 });
    const body = data.map(row => {
      return columns.map(({ dataIndex, text, render }) => {
        return text === 'renderFunction' ? render(row[dataIndex], row) : text(row[dataIndex], row);
      });
    });
    exportXlsxFile(
      [header, ...body],
      `供应商入厂检报表${formatUnix(timeFrom, 'YYYY_MM_DD')}-${formatUnix(timeTill, 'YYYY_MM_DD')}`,
    );
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, resetFields, getFieldsValue, setFieldsValue },
      intl,
    } = this.props;
    const { dataSource, chartData, total, searchParams, graphData } = this.state;
    const columns = [
      {
        title: '供应商编码/供应商名称',
        dataIndex: 'supplierCode',
        render: (supplierCode, { supplierName }) => `${supplierCode || replaceSign}/${supplierName || replaceSign}`,
        text: 'renderFunction',
      },
      {
        title: '物料类型',
        dataIndex: 'materialCode',
        render: (materialCode, { materialName }) => <Tooltip text={`${materialCode}/${materialName}`} length={15} />,
        text: (materialCode, { materialName }) => `${materialCode}/${materialName}`,
      },
      {
        title: '质检任务数量',
        dataIndex: 'qcTaskCount',
        text: text => text,
        render: (text, { materialCode, materialName }) => {
          const { timeFrom, timeTill } = this.state.searchParams;
          const query = encodeURIComponent(
            JSON.stringify({
              taskEndTime: [formatUnixMoment(timeFrom), formatUnixMoment(timeTill)],
              checkType: '0',
              status: '2',
              material: {
                key: materialCode,
                label: materialName,
              },
            }),
          );
          return (
            <a target="_blank" rel="noopener noreferrer" href={`/qualityManagement/qcTask/list?query=${query}`}>
              {text}
            </a>
          );
        },
      },
      { title: '单位', dataIndex: 'unit', text: text => text },
      {
        title: '样本： 抽样数/次品/不合格率',
        dataIndex: 'checkCount',
        text: 'renderFunction',
        render: (checkCount, { checkFaultyCount }) =>
          `${checkCount}/${checkFaultyCount}/${checkCount ? round((checkFaultyCount * 100) / checkCount, 2) : 0}%`,
      },
      {
        title: '总体：总数/次品/不合格率',
        dataIndex: 'qcTotal',
        text: 'renderFunction',
        render: (qcTotal, { faultyAmount }) =>
          `${qcTotal}/${faultyAmount}/${qcTotal ? round((faultyAmount * 100) / qcTotal, 1) : 0}%`,
      },
    ].map(node => ({
      ...node,
      key: node.title,
    }));
    return (
      <div>
        <FilterSortSearchBar searchDisabled style={{ borderBottom: `1px solid ${Color.border}`, marginBottom: 20 }}>
          <ItemList>
            <Item label="统计时间维度" required>
              {getFieldDecorator('interval', {
                initialValue: 6,
                rules: [{ required: true }],
              })(
                <Select
                  onChange={() => {
                    setFieldsValue({
                      times: [],
                    });
                  }}
                >
                  {intervals.map(({ key, display, value }) => (
                    <Option key={key} value={value}>
                      {changeChineseToLocale(display, intl)}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="任务结束时间" required>
              {getFieldDecorator('times', {
                rules: [{ required: true }],
                initialValue: [moment().subtract(8, 'days'), moment().subtract(1, 'days')],
              })(
                {
                  6: <DayRangePicker historic />,
                  7: <WeekRangePicker />,
                  8: <MonthRangePicker />,
                }[getFieldValue('interval') || 6],
              )}
            </Item>
            <Item label="供应商">
              {getFieldDecorator('supplierCodes')(<SearchSelect type="supplier" mode="multiple" />)}
            </Item>
            <Item label="物料">
              {getFieldDecorator('materialCodes')(<SearchSelect type="materialBySearch" mode="multiple" />)}
            </Item>
          </ItemList>
          <div className="child-gap">
            <Button onClick={this.searchOnForm}>查询</Button>
            <Link
              type="grey"
              onClick={() => {
                resetFields();
                this.searchOnForm();
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
        {graphData && (
          <div>
            <span style={headerStyle}>
              <Icon type="bars" style={{ marginRight: 10 }} />
              {changeChineseToLocale('入厂质检任务数量分布及不良趋势图', intl)}
            </span>
            <ReactEcharts
              option={chartData}
              onEvents={this.onEvents}
              style={{
                margin: 20,
                border: `1px solid ${Color.borderGrey}`,
                padding: 20,
                backgroundColor: Color.grey,
                height: 340,
              }}
            />
          </div>
        )}
        {dataSource && (
          <div>
            <div>
              <span style={headerStyle}>
                <Icon type="bars" style={{ marginRight: 10 }} />
                {changeChineseToLocale('供应商入厂检任务统计信息列表', intl)}
              </span>
              <Button
                style={{ float: 'right', marginRight: 20 }}
                icon="upload"
                onClick={() => {
                  this.exportXLSX(columns);
                }}
              >
                数据导出
              </Button>
            </div>
            <SimpleTable
              style={{ marginTop: 20 }}
              columns={columns}
              dataSource={dataSource}
              pagination={{
                onChange: current => this.setDataSource({ page: current }),
                current: searchParams.page,
                total,
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

export default withForm({}, injectIntl(QcTaskChart));
