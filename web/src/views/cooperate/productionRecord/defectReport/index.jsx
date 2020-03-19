import React from 'react';
import {
  FilterSortSearchBar,
  Select,
  Button,
  Icon,
  Searchselect,
  message,
  withForm,
  DatePicker,
  SimpleTable,
  ReactEcharts,
  Link,
} from 'components';
import Proptypes from 'prop-types';
import { getProductionDefectReportGram, getProductionDefectReportList } from 'services/datagram/productionRecords';
import { formatRangeUnix } from 'utils/time';
import moment from 'moment';
import styles from './index.scss';
import { intervals } from '../list/productionCapacityRecords/config';

const RangePicker = DatePicker.RangePicker;
const DayRangePicker = DatePicker.DayRangePicker;
const WeekRangePicker = DatePicker.WeekRangePicker;
const MonthRangePicker = DatePicker.MonthRangePicker;
const QuarterRangePicker = DatePicker.QuarterRangePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

class DefectReport extends React.PureComponent {
  state = {
    columns: null,
    dataSource: null,
    option: null,
    total: 0,
    searchParams: {},
  };

  setList = async params => {
    const { changeChineseToLocale } = this.context;
    const searchParams = {
      page: 1,
      size: 10,
      ...this.state.searchParams,
      ...params,
    };
    const {
      data: {
        data: { header, list },
        total,
      },
    } = await getProductionDefectReportList({ page: searchParams.page, size: searchParams.size }, searchParams);
    const columns = Object.keys(header).map(key => ({
      key,
      dataIndex: key,
      title: header[key],
    }));
    this.setState({
      total,
      columns: [
        ...columns,
        {
          title: '生产任务',
          key: 'operation',
          render: (text, record) => {
            const { materialCode, materialName } = record;
            const url = `/cooperate/prodTasks?query=${encodeURIComponent(
              JSON.stringify({
                outputMaterialCode: { label: `${materialCode}/${materialName}`, key: materialCode },
                processCode: this.props.form.getFieldValue('processCode'),
                statuses: [],
              }),
            )}`;
            return <Link.NewTagLink href={url}>{changeChineseToLocale('查看')}</Link.NewTagLink>;
          },
        },
      ],
      dataSource: list,
      searchParams,
    });
  };

  setChart = async params => {
    const {
      data: { data },
    } = await getProductionDefectReportGram(params);
    this.setOption(data);
  };

  handleSearch = () => {
    const {
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      const { duration, materialCodes, processCode, projectCodes } = values;
      const params = {
        ...values,
        timeFrom: formatRangeUnix(duration)[0],
        timeTill: formatRangeUnix(duration)[1],
        materialCodes: materialCodes && materialCodes.map(({ key }) => key),
        processCode: processCode && processCode.key,
        projectCodes: projectCodes && projectCodes.map(({ key }) => key),
      };
      this.setList(params);
      this.setChart(params);
    });
  };

  setOption = data => {
    const { defectName, gramData } = data;
    const { changeChineseToLocale } = this.context;
    const legend = defectName;
    const xAxisData = Object.keys(gramData);
    const series = legend.map(key => {
      return {
        name: key,
        type: 'line',
        data: xAxisData.map(x => gramData[x].defectNameAmount[key]),
      };
    });
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: params => {
          const { axisValue, name } = params[0];
          const summaryAmount = gramData[axisValue].summaryAmount;
          const series = params
            .map(({ seriesName, value, marker }) => `${marker}${seriesName}: ${value}<br/>`)
            .join('');
          return `${changeChineseToLocale('时间')}: ${name}<br/>${changeChineseToLocale(
            '求和总计',
          )}: ${summaryAmount}<br/> ${series}`;
        },
      },
      legend: {
        data: legend,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '6%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
      },
      series,
    };
    this.setState({ option });
  };

  render() {
    const { columns, dataSource, option, total, searchParams } = this.state;
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, validateFields, setFieldsValue } = form;
    return (
      <div className={styles.productionDefectReport}>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item required label="统计时间维度">
              {getFieldDecorator('interval', {
                rules: [{ required: true, message: '统计时间维度' }],
                initialValue: '6',
              })(
                <Select
                  onChange={value => {
                    this.setState({ interval: value });
                    setFieldsValue({
                      duration: [],
                    });
                  }}
                >
                  {intervals.map(n => (
                    <Option value={n.value}>{changeChineseToLocale(n.label)}</Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="开始结束时间" key="开始结束时间" required>
              {getFieldDecorator('duration', {
                rules: [
                  {
                    required: true,
                    message: '开始结束时间',
                  },
                ],
                initialValue: [moment().subtract(8, 'days'), moment().subtract(1, 'days')],
              })(
                {
                  6: <DayRangePicker historic />,
                  7: <WeekRangePicker historic />,
                  8: <MonthRangePicker historic />,
                  9: <QuarterRangePicker historic />,
                }[form.getFieldValue('interval') || 6],
              )}
            </Item>
            <Item label="工序" required>
              {getFieldDecorator('processCode', {
                rules: [{ required: true, message: '工序' }],
              })(<Searchselect type="processName" />)}
            </Item>
            <Item label="物料种类">
              {getFieldDecorator('materialCodes')(<Searchselect type="materialBySearch" mode="multiple" />)}
            </Item>
            <Item label="项目号">
              {getFieldDecorator('projectCodes')(<Searchselect type="project" mode="multiple" />)}
            </Item>
          </ItemList>
          <Button
            onClick={() => {
              validateFields((err, values) => {
                if (err) {
                  message.error(`${changeChineseToLocale('请填写必填信息')}!`);
                  return;
                }
                this.handleSearch();
              });
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        {option && (
          <div style={{ margin: 20 }}>
            <p style={{ fontSize: 16 }}>{changeChineseToLocale('不良趋势图')}</p>

            <div className={styles.gramWrapper}>
              <ReactEcharts option={option} notMerge />
            </div>
          </div>
        )}
        {columns && (
          <div>
            <p style={{ fontSize: 16, margin: 20 }}>{changeChineseToLocale('来料不良分布统计信息列表')}</p>
            <SimpleTable
              columns={columns}
              dataSource={dataSource}
              pagination={{ total, onChange: page => this.setList({ page }), current: searchParams.page }}
            />
          </div>
        )}
      </div>
    );
  }
}

DefectReport.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withForm({}, DefectReport);
