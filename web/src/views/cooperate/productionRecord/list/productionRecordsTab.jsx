import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import withForm, { formItemLayoutForFilter } from 'components/form';
import Link from 'components/link';
import { FilterSortSearchBar, Select, Button, DatePicker, message, SimpleTable, Tooltip } from 'components';
import { queryProduction } from 'services/datagram/productionRecords';
import SearchSelect from 'src/components/select/searchSelect';
import { white, borderGrey } from 'src/styles/color/index';
import { arrayIsEmpty } from 'utils/array';
import { formatToUnix } from 'utils/time';
import { setLocation, getParams } from 'utils/url';
import { exportXlsxFile } from 'utils/exportFile';
import { replaceSign } from 'constants';
import { thousandBitSeparator } from 'src/utils/number';

const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangePicker = DatePicker.RangePicker;
const DayRangePicker = DatePicker.DayRangePicker;
const WeekRangePicker = DatePicker.WeekRangePicker;
const MonthRangePicker = DatePicker.MonthRangePicker;
const QuarterRangePicker = DatePicker.QuarterRangePicker;

type Props = {
  onFilter: () => {},
  onSearch: () => {},
  onReset: () => {},
  onRefetch: () => {},
  onClickExport: () => {},
  filterCategory: string,
  intervals: any,
  disableTimeSelect: boolean,
  fieldValues: any,
  columns: any,
  dataSource: any,
  loading: boolean,
  pagination: any,
  scroll: any,
  form: any,
  match: {},
};

const GROUP_BY_MATERIAL = 2;
const GROUP_BY_WORKSTATION = 3;
const GROUP_BY_OPERATOR = 4;
const GROUP_BY_PROCESS = 5;

const groupByToday = [GROUP_BY_MATERIAL, GROUP_BY_WORKSTATION, GROUP_BY_PROCESS];
const groupByHistory = [GROUP_BY_MATERIAL, GROUP_BY_WORKSTATION, GROUP_BY_OPERATOR, GROUP_BY_PROCESS];
const groupByMap = new Map([
  [GROUP_BY_MATERIAL, '物料'],
  [GROUP_BY_WORKSTATION, '工位'],
  [GROUP_BY_OPERATOR, '生产人员'],
  [GROUP_BY_PROCESS, '工序'],
]);

const TWO_HOURS = 2;

const todayIntervalMap = new Map([[1, '1'], [2, '2'], [3, '4'], [4, '6'], [5, '8']]);

const historyIntervalMap = new Map([[6, '每天'], [7, '每周'], [8, '每月'], [9, '每季']]);

const searchFilter = {
  projectCode: {
    label: '项目号',
    type: 'project',
    decorator: 'projectCodes',
  },
  purchaseOrder: {
    label: '订单号',
    type: 'purchaseOrder',
    decorator: 'purchaseOrderCodes',
  },
  [GROUP_BY_PROCESS]: {
    label: '工序',
    type: 'processName',
    decorator: 'processCodes',
    mode: null,
  },
  [GROUP_BY_WORKSTATION]: {
    label: '工位',
    type: 'workstation',
    decorator: 'workstationIds',
  },
  [GROUP_BY_MATERIAL]: {
    label: '物料编号/名称',
    type: 'materialBySearch',
    decorator: 'outputMaterialCodes',
  },
  [GROUP_BY_OPERATOR]: {
    label: '生产人员',
    type: 'account',
    decorator: 'operatorIds',
    props: {
      params: {
        embed: 'workgroups,roles',
        active: true,
        fake: 'all',
      },
    },
  },
};

class ProductionRecordsTab extends Component {
  props: Props;
  state = {
    columns: [],
    dataSource: [],
    total: 0,
    loading: false,
    searchParams: {},
    pageSize: 10,
  };

  componentDidMount() {
    this.onSearch();
  }

  onReset = () => {
    const { form } = this.props;
    form.resetFields();
  };

  onSearch(params = {}) {
    const { validateFields } = this.props.form || {};
    const { changeChineseToLocale, changeChineseTemplateToLocale } = this.context;
    validateFields(async (err, values) => {
      if (err) {
        message.error(
          changeChineseTemplateToLocale('{msg}不能为空', {
            msg: Object.keys(err)
              .map(key => {
                return changeChineseToLocale(err[key].errors[0].message);
              })
              .join(','),
          }),
        );
        return;
      }
      this.setState({ loading: true });
      const {
        outputMaterialCodes,
        duration,
        groupBy,
        projectCodes,
        purchaseOrderCodes,
        processCodes,
        workstationIds,
        operatorIds,
      } = values;
      let timeFrom = null;
      let timeTill = null;
      if (!arrayIsEmpty(duration)) {
        timeFrom = formatToUnix(
          duration[0].set({
            hour: 0,
            minute: 0,
            second: 0,
          }),
        );
        timeTill = formatToUnix(
          duration[1].set({
            hour: 23,
            minute: 59,
            second: 59,
          }),
        );
      }
      setLocation(this.props, p => ({ ...p, ...values, ...params }));
      const submitValue = {
        page: 1,
        size: 10,
        ...values,
        outputMaterialCodes: outputMaterialCodes && outputMaterialCodes.map(({ key }) => key),
        projectCodes: projectCodes && projectCodes.map(({ key }) => key),
        purchaseOrderCodes: purchaseOrderCodes && purchaseOrderCodes.map(({ key }) => key),
        processCodes: processCodes && [processCodes.key],
        workstationIds: workstationIds && workstationIds.map(({ key }) => key),
        operatorIds: operatorIds && operatorIds.map(({ key }) => key),
        timeFrom,
        timeTill,
        ...params,
      };
      const {
        data: {
          data: { header, list },
          total,
        },
      } = await queryProduction(submitValue);
      const renderText = text => {
        if (typeof text === 'number') {
          return thousandBitSeparator(text);
        }
        return text || replaceSign;
      };
      let columns = [];
      Object.keys(header).forEach(key => {
        columns.push({
          key,
          dataIndex: key,
          title: header[key],
          width: 120,
          render: text => <Tooltip text={renderText(text)} length={10} />,
        });
      });
      if (groupBy === GROUP_BY_MATERIAL) {
        columns = columns.map(node => {
          if (node.key === 'businessDimension') {
            return {
              ...node,
              render: (text, { outputMaterialCode }) => (
                <a
                  href={`/bom/materials/${outputMaterialCode}/detail`}
                  target="_blank"
                  without
                  rel="noopener noreferrer"
                >
                  {text}
                </a>
              ),
              width: 120,
            };
          }
          return node;
        });
      } else {
        columns = columns.map(node => {
          if (node.key === 'outputMaterial') {
            return {
              ...node,
              render: (text, { outputMaterialCode }) => (
                <a
                  href={`/bom/materials/${outputMaterialCode}/detail`}
                  target="_blank"
                  without
                  rel="noopener noreferrer"
                >
                  <Tooltip text={text} length={10} />
                </a>
              ),
              width: 120,
            };
          }
          return node;
        });
      }
      this.setState({
        dataSource: list,
        columns,
        loading: false,
        total: groupBy === GROUP_BY_OPERATOR ? Math.ceil(total / 10) * list.length : total,
        searchParams: submitValue,
        pageSize: groupBy === GROUP_BY_OPERATOR ? list.length : 10,
      });
    });
  }

  handleExport = async () => {
    const { searchParams } = this.state;
    const {
      data: {
        data: { header, list },
      },
    } = await queryProduction({ ...searchParams, size: 10000000, page: 1 });
    const headerKeys = Object.keys(header);
    const exportHeader = headerKeys.map(key => header[key]);
    const exportBody = list.map(node => {
      return headerKeys.map(key => node[key]);
    });
    exportXlsxFile([exportHeader, ...exportBody], '历史产量统计报表');
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale, changeChineseTemplateToLocale } = this.context;
    const { getFieldDecorator, resetFields, getFieldValue, setFieldsValue, setFields } = form || {};
    const intervalRangeMap = getFieldValue('history') === 1 ? historyIntervalMap : todayIntervalMap;
    const { columns, dataSource, total, loading, pageSize } = this.state;

    return (
      <div>
        <FilterSortSearchBar
          style={{
            backgroundColor: white,
            width: '100%',
            borderBottom: `1px solid ${borderGrey}`,
          }}
          searchDisabled
        >
          <ItemList>
            <Item label="统计范围" required>
              {getFieldDecorator('history', {
                rules: [{ required: true, message: '统计范围' }],
                initialValue: 0,
              })(
                <Select
                  onChange={value => {
                    const groupByValue = getFieldValue('groupBy');

                    // 切换到当日 如果业务维度是生产人员则置为默认的工序
                    if (value === 0 && groupByValue === GROUP_BY_OPERATOR) {
                      setFields({ groupBy: { value: GROUP_BY_PROCESS } });
                    }
                    // resetFields(['interval']);
                    setFields({
                      interval: { value: undefined },
                    });
                  }}
                >
                  <Option value={0}>{changeChineseToLocale('当日')}</Option>
                  <Option value={1}>{changeChineseToLocale('历史')}</Option>
                </Select>,
              )}
            </Item>
            <Item label="业务维度" required>
              {getFieldDecorator('groupBy', {
                rules: [{ required: true, message: '业务维度' }],
                initialValue: GROUP_BY_PROCESS,
              })(
                <Select>
                  {(getFieldValue('history') === 0 ? groupByToday : groupByHistory).map(key => (
                    <Option value={key}>{changeChineseToLocale(groupByMap.get(key))}</Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="时间粒度" required>
              {getFieldDecorator('interval', {
                rules: [{ required: true, message: '时间粒度' }],
                initialValue: TWO_HOURS,
              })(
                <Select>
                  {Array.from(intervalRangeMap).map(([key, value]) => (
                    <Option value={key}>
                      {isNaN(+value)
                        ? changeChineseToLocale(value)
                        : changeChineseTemplateToLocale('{amount}小时', { amount: value })}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="生产时间" required>
              {getFieldDecorator('duration', {
                rules: [{ required: true, message: '生产时间' }],
                hidden: getFieldValue('history') === 0,
              })(
                {
                  6: <DayRangePicker historic />,
                  7: <WeekRangePicker historic />,
                  8: <MonthRangePicker historic />,
                  9: <QuarterRangePicker historic />,
                }[getFieldValue('interval')] || <DayRangePicker historic disabled />,
              )}
            </Item>
            {Object.keys(searchFilter).map(key => {
              const { label, type, decorator, mode = 'multiple', props = {} } = searchFilter[key];
              return (
                <Item label={label} key={label}>
                  {getFieldDecorator(decorator)(<SearchSelect type={type} mode={mode} {...props} />)}
                </Item>
              );
            })}
          </ItemList>
          <Button icon="search" style={{ width: 86 }} onClick={() => this.onSearch({ page: 1 })}>
            查询
          </Button>
          <Link
            style={{
              lineHeight: '30px',
              height: '28px',
              color: '#8C8C8C',
              paddingLeft: 16,
            }}
            onClick={this.onReset}
          >
            重置
          </Link>
        </FilterSortSearchBar>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '19px 20px 0 20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
              paddingBottom: 10,
            }}
          >
            <Button icon="upload" disabled={columns.length === 0} onClick={this.handleExport}>
              数据导出
            </Button>
          </div>
          {!!columns.length && (
            <div style={{ flex: '1 1 auto' }}>
              <SimpleTable
                dataSource={dataSource}
                style={{ margin: 0 }}
                loading={loading}
                pagination={{ total, onChange: page => this.onSearch({ page }), pageSize }}
                scroll={{ x: columns.length * 120, y: 500 }}
                columns={columns}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

ProductionRecordsTab.contextTypes = {
  changeChineseToLocale: PropTypes.func,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withForm({}, withRouter(ProductionRecordsTab));
