import React from 'react';
import { injectIntl } from 'react-intl';
import {
  FilterSortSearchBar,
  Select,
  DatePicker,
  withForm,
  Tooltip,
  Button,
  Link,
  ReactEcharts,
  SimpleTable,
  Icon,
  message,
} from 'components';
import SearchSelect from 'components/select/searchSelect';
import { getQcTaskBySearch } from 'services/qcConfig';
import { getIncomingCheckItem, getIncomingGraph, getIncomingMaterial } from 'services/datagram/inputFactoryQcRecord';
import { formatToUnix, formatRangeUnix, formatUnixMoment, formatUnix } from 'utils/time';
import echarts from 'echarts';
import { exportXlsxFile } from 'utils/exportFile';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { arrayIsEmpty } from 'src/utils/array';
import _ from 'lodash';
import Color from 'styles/color';
import moment from 'moment';
import { round } from 'utils/number';
import { replaceSign } from 'constants';

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

const EchartWrapperStyle = {
  height: '100%',
  border: `1px solid ${Color.borderGrey}`,
  background: Color.grey,
  margin: 20,
  padding: 20,
};

const initialState = {
  TrendCharts: null,
  rateDistributeCharts: null,
  dataSource: null,
  searchParams: {},
  page: 1,
};

type Props = {
  form: any,
  intl: any,
};

class FractionChart extends React.PureComponent {
  props: Props;
  state = initialState;

  setTrendCharts = async params => {
    const { intl } = this.props;

    const {
      data: { data },
    } = await getIncomingGraph(params);
    let xAxis = Object.keys(data).filter(key => data[key].qcTotal > 0);
    xAxis = xAxis.length === 0 ? Object.keys(data) : xAxis;
    const checkCount = xAxis.map(key => data[key].qcTotal);
    const checkFaultyCount = xAxis.map(key => data[key].faultyAmount);
    const checkRate = xAxis.map(key => (data[key].qcTotal === 0 ? 0 : round(100 - data[key].faultyRate * 100, 2)));
    const TrendCharts = {
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: params => {
            const { date, qcTotal, qcTaskCount, faultyAmount, faultyRate } = data[params[0].name];
            return `<span>${changeChineseToLocaleWithoutIntl(
              '日期',
            )}：${date}</span><br/> <span>${changeChineseToLocaleWithoutIntl(
              '总计质检任务',
            )}：${qcTaskCount}</span><br/>
              <span>${changeChineseToLocaleWithoutIntl(
                '总计物料数量',
              )}： ${qcTotal}</span> <br/> <span>${changeChineseToLocaleWithoutIntl(
              '不良数',
            )}：${faultyAmount}</span><br/>
              <span>${changeChineseToLocaleWithoutIntl('不良率')}： ${round(faultyRate * 100, 2)}%</span>
`;
          },
        },
        grid: {
          top: 50,
          bottom: 0,
          right: 20,
          left: 0,
          containLabel: true,
        },
        legend: {
          data: [
            changeChineseToLocaleWithoutIntl('质检总量'),
            changeChineseToLocaleWithoutIntl('不良数'),
            changeChineseToLocaleWithoutIntl('合格率'),
          ],
          left: 20,
        },
        xAxis: {
          type: 'category',
          data: xAxis,
          axisTick: {
            show: false,
          },
        },
        yAxis: [
          {
            type: 'value',
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
            name: changeChineseToLocaleWithoutIntl('质检总量'),
            data: checkCount,
            type: 'bar',
            barMaxWidth: 50,
            label: {
              show: true,
              position: 'top',
              color: '#07C26B',
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#07C26B' },
                { offset: 1, color: '#01B882' },
              ]),
            },
            barGap: 0,
          },
          {
            name: changeChineseToLocaleWithoutIntl('不良数'),
            data: checkFaultyCount,
            type: 'bar',
            barMaxWidth: 50,
            label: {
              show: true,
              position: 'top',
              color: '#FAD961',
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#FAD961' },
                { offset: 1, color: '#FFAE68' },
              ]),
            },
          },
          {
            name: changeChineseToLocaleWithoutIntl('合格率'),
            type: 'line',
            data: checkRate,
            yAxisIndex: 1,
            itemStyle: {
              color: '#1890FF',
            },
            label: {
              show: true,
              formatter: '{c}%',
            },
            markLine: {
              silent: true,
              label: {
                formatter: '{c}',
              },
              data: [{ name: changeChineseToLocale('线性（合格率）', intl), type: 'average' }],
            },
          },
        ],
      },
      onEvents: {
        click: params => {
          const { timeFrom, timeTill } = data[params.name];
          const _params = { ...this.state.searchParams, timeFrom, timeTill };
          this.setState({ searchParams: _params });
          this.setRateDistributeCharts(_params);
          this.setDataSource(_params);
        },
      },
    };
    this.setState({ TrendCharts });
  };

  setRateDistributeCharts = async params => {
    const { intl } = this.props;

    const {
      data: { data },
    } = await getIncomingCheckItem(params);
    const xAxis = Object.keys(data);
    const defectCount = xAxis.map(key => _.get(data[key] || {}, 'defectCount', 0));
    const defectCountTotal = defectCount.reduce((a, b) => a + b);
    const defectCountRate = defectCount.map(value => round((value * 100) / defectCountTotal, 2));
    const rateDistributeCharts = {
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: params => {
            const name = params[0].name;
            const { minDateText, maxDateText, defectCount, qcTaskCount } = data[name] || {};
            return `<span>${changeChineseToLocale('质检项', intl)}: ${name}</span><br/><span>${changeChineseToLocale(
              '时间',
              intl,
            )}: ${minDateText || replaceSign}-${maxDateText || replaceSign}</span><br/>
              <span>${changeChineseToLocale('相关质检任务', intl)}: ${qcTaskCount ||
              replaceSign}</span><br/><span>${changeChineseToLocale('总计不良', intl)}: ${defectCount ||
              replaceSign}</span>`;
          },
        },
        grid: {
          top: 50,
          bottom: 0,
          right: 20,
          left: 0,
          containLabel: true,
        },
        legend: {
          data: [changeChineseToLocale('不良数', intl), changeChineseToLocale('不良占比', intl)],
          left: 20,
        },
        xAxis: {
          type: 'category',
          data: xAxis,
          axisTick: {
            show: false,
          },
        },
        yAxis: [
          {
            type: 'value',
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
            name: changeChineseToLocale('不良数', intl),
            data: defectCount,
            type: 'bar',
            barMaxWidth: 50,
            label: {
              show: true,
              position: 'top',
              color: '#FAD961',
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#FAD961' },
                { offset: 1, color: '#FFAE68' },
              ]),
            },
          },
          {
            name: changeChineseToLocale('不良占比', intl),
            type: 'line',
            data: defectCountRate,
            yAxisIndex: 1,
            itemStyle: {
              color: '#FF3B30',
            },
            label: {
              show: true,
              formatter: '{c}%',
              position: 'bottom',
            },
          },
        ],
      },
    };
    this.setState({ rateDistributeCharts });
  };

  setDataSource = async params => {
    const {
      data: { data },
    } = await getIncomingMaterial(params);
    this.setState({ dataSource: data });
  };

  exportDataSource = async params => {
    const { intl } = this.props;
    const { timeFrom, timeTill } = params;
    const {
      data: { data },
    } = await getIncomingMaterial(params);
    const frontHeader = [
      changeChineseToLocale('物料类型', intl),
      changeChineseToLocale('供应商编号/名称', intl),
      changeChineseToLocale('质检任务数量', intl),
      changeChineseToLocale('单位', intl),
      changeChineseToLocale('样本：样本数/次品/不合格率', intl),
      changeChineseToLocale('总体：总数/次品/不合格率', intl),
    ];
    const backHeader = Object.keys(data[0].items);
    const body = data.map(
      ({
        materialCode,
        materialName,
        supplierName,
        supplierCode,
        qcTaskCount,
        unit = replaceSign,
        checkCount,
        checkFaultyCount,
        qcTotal,
        faultyAmount,
        items,
      }) => {
        const frontBody = [
          `${materialCode}/${materialName}`,
          `${supplierCode || replaceSign}/${supplierName || replaceSign}`,
          qcTaskCount,
          unit,
          `${checkCount}/${checkFaultyCount}/${round((checkFaultyCount * 100) / checkCount, 2)}%`,
          `${qcTotal}/${faultyAmount}/${round((faultyAmount * 100) / qcTotal, 2)}%`,
        ];
        const backBody = backHeader.map(key => items[key]);
        return [...frontBody, ...backBody];
      },
    );
    exportXlsxFile(
      [[...frontHeader, ...backHeader], ...body],
      `来料不良分布统计${formatUnix(timeFrom, 'YYYY/MM/DD')}~${formatUnix(timeTill, 'YYYY/MM/DD')}`,
    );
  };

  render() {
    const { form, intl } = this.props;
    const { TrendCharts, dataSource, rateDistributeCharts, page, searchParams } = this.state;
    const { getFieldDecorator, setFieldsValue, getFieldValue, resetFields, getFieldsValue, validateFields } = form;
    const materialCode = _.get(getFieldValue('materialCode'), 'key');
    const columns = [
      {
        title: '物料类型',
        dataIndex: 'materialCode',
        width: 180,
        render: (materialCode, { materialName }) => (
          <a href={`/bom/materials/${materialCode}/detail`} target="_blank" rel="noopener noreferrer">
            {materialCode}/{materialName}
          </a>
        ),
      },
      {
        title: '供应商编号/名称',
        width: 180,
        dataIndex: 'supplierName',
        render: (supplierName, { supplierCode }) => (
          <Tooltip text={`${supplierCode || replaceSign}/${supplierName || replaceSign}`} width={160} />
        ),
      },
      {
        title: '质检任务数量',
        width: 180,
        dataIndex: 'qcTaskCount',
        render: (count, { materialCode, materialName }) => {
          const { timeFrom, timeTill } = this.state.searchParams;
          const query = decodeURIComponent(
            JSON.stringify({
              taskEndTime: [formatUnixMoment(timeFrom), formatUnixMoment(timeTill)],
              checkType: '0',
              status: '2',
              material: {
                key: materialCode,
                label: `${materialCode}/${materialName}`,
              },
            }),
          );
          return (
            <a href={`/qualityManagement/qcTask/list?query=${query}`} target="_blank" rel="noopener noreferrer">
              {count}
            </a>
          );
        },
      },
      {
        title: '单位',
        width: 110,
        dataIndex: 'unit',
        render: unit => <Tooltip text={unit || replaceSign} width={90} />,
      },
      {
        title: '样本：样本数/次品/不合格率',
        width: 200,
        dataIndex: 'checkCount',
        render: (checkCount, { checkFaultyCount }) => (
          <Tooltip
            text={
              `${checkCount}/${checkFaultyCount}/${round((checkFaultyCount * 100) / checkCount, 2)}%` || replaceSign
            }
            width={180}
          />
        ),
      },
      {
        title: '总体：总数/次品/不合格率',
        width: 200,
        dataIndex: 'qcTotal',
        render: (qcTotal, { faultyAmount }) => (
          <Tooltip
            text={`${qcTotal}/${faultyAmount}/${round((faultyAmount * 100) / qcTotal, 2)}%` || replaceSign}
            width={180}
          />
        ),
      },
      {
        title: '各质检项不良数量',
        children:
          !arrayIsEmpty(dataSource) && dataSource[0].items
            ? Object.keys(dataSource[0].items).map(key => {
                return {
                  title: <Tooltip text={key || replaceSign} width={80} />,
                  dataIndex: 'items',
                  width: 90,
                  key,
                  render: items => (
                    <Tooltip text={typeof items[key] === 'number' ? items[key] : replaceSign} width={80} />
                  ),
                };
              })
            : [],
      },
    ].map(node => ({ key: node.title, ...node }));
    return (
      <div>
        <FilterSortSearchBar>
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
            <Item label="物料" required>
              {getFieldDecorator('materialCode')(
                <SearchSelect
                  onChange={() => {
                    resetFields(['qcConfigId']);
                  }}
                  type="materialBySearch"
                />,
              )}
            </Item>
            <Item label="质检方案" required>
              {getFieldDecorator('qcConfigId')(
                <SearchSelect
                  disabled={!materialCode}
                  loadOnFocus
                  extraSearch={async params => {
                    if (!materialCode) {
                      return [];
                    }
                    const {
                      data: { data },
                    } = await getQcTaskBySearch({
                      materialCode,
                      page: 1,
                      size: 1000,
                      checkTypes: 0,
                      nameSearch: params.search,
                    });
                    return data.map(({ name, ids }) => ({ key: JSON.stringify(ids), label: name }));
                  }}
                />,
              )}
            </Item>
          </ItemList>
          <div className="child-gap">
            <Button
              onClick={() => {
                const { times, interval, qcConfigId, supplierCodes, materialCode } = getFieldsValue();
                if (!times[0] || !materialCode || !qcConfigId) {
                  message.error('请填写必填信息');
                  return;
                }
                const timeFrom = times[0] && formatRangeUnix(times)[0];
                const timeTill = times[1] && formatRangeUnix(times)[1];
                const params = {
                  timeFrom,
                  timeTill,
                  interval,
                  qcConfigIds: JSON.parse(_.get(qcConfigId, 'key')),
                  supplierCodes: supplierCodes && supplierCodes.map(({ key }) => key),
                  materialCode: _.get(materialCode, 'key'),
                };
                this.setState({ searchParams: params });
                this.setTrendCharts(params);
                this.setRateDistributeCharts(params);
                this.setDataSource(params);
              }}
            >
              查询
            </Button>
            <Link
              type="grey"
              onClick={() => {
                resetFields();
                this.setState(initialState);
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
        {TrendCharts && (
          <React.Fragment>
            <div style={{ marginLeft: 20, fontSize: 14 }}>
              <Icon type="bars" style={{ marginRight: 5 }} />
              {changeChineseToLocale('合格率趋势图', intl)}
            </div>
            <div style={{ height: 440 }}>
              <ReactEcharts {...TrendCharts} style={EchartWrapperStyle} />
            </div>
          </React.Fragment>
        )}
        {rateDistributeCharts && (
          <React.Fragment>
            <div style={{ marginLeft: 20, fontSize: 14, marginTop: 20 }}>
              <Icon type="bars" style={{ marginRight: 5 }} />
              {changeChineseToLocale('来料不良率分布统计', intl)}
            </div>
            <div style={{ height: 440 }}>
              <ReactEcharts style={EchartWrapperStyle} {...rateDistributeCharts} />
            </div>
          </React.Fragment>
        )}
        {dataSource && (
          <React.Fragment>
            <div style={{ margin: 20, fontSize: 14 }}>
              <span>
                <Icon type="bars" style={{ marginRight: 5 }} />
                {changeChineseToLocale('来料不良分布统计信息列表', intl)}
              </span>
              <Button
                disabled={!dataSource.length}
                icon="upload"
                style={{ float: 'right' }}
                onClick={() => {
                  this.exportDataSource({ ...searchParams, page: 1, size: 1000 });
                }}
              >
                数据导出
              </Button>
            </div>
            <SimpleTable
              style={{ marginBottom: 20 }}
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: true }}
              onChange={{
                current: page,
                onChange: page => {
                  this.setState({ page });
                  this.setDataSource({ ...searchParams, page });
                },
              }}
            />
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default withForm({}, injectIntl(FractionChart));
