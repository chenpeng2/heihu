import React, { Component } from 'react';
import WorkstationAndAreaSelect from 'components/select/workstationAndAreaSelect';
import SearchSelect from 'components/select/searchSelect';
import FilterSortSearchBar from 'components/filterSortSearchBar';
import { white, borderGrey } from 'src/styles/color/index';
import { Select, withForm, Input, Button, Icon, Searchselect, DatePicker } from 'components';
import { formatToUnix, formatRangeUnix, formatRangeTimeToMoment } from 'utils/time';
import PropTypes from 'prop-types';
import CONSTANT from '../constant';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const RangerPicker = DatePicker.RangePicker;
const filterGroup = [
  {
    label: '未开始',
    key: '1',
  },
  {
    label: '执行中',
    key: '2',
  },
  {
    label: '暂停中',
    key: '3',
  },
  {
    label: '已结束',
    key: '4',
  },
  {
    label: '已取消',
    key: '5',
  },
];

export const getFormatParams = value => {
  const params = {};
  const { startTimeReal, endTimeReal } = value;
  Object.keys(value).forEach(prop => {
    if (value[prop] != null) {
      switch (prop) {
        case 'processCode':
          params[prop] = value[prop].key;
          break;
        case 'operatorId':
          params[prop] = value[prop].key;
          break;
        case 'workStationId':
          params[prop] = (value[prop].value || '').split('-')[1];
          break;
        case 'statuses':
          params[prop] = value[prop].map(n => n.key).join(',');
          break;
        case 'inputMaterialCode':
        case 'outputMaterialCode':
          params[prop] = value[prop].key;
          break;
        case 'startTimeReal':
          if (startTimeReal && startTimeReal.length > 0) {
            params.startTimeRealFrom = formatRangeUnix(startTimeReal)[0];
            params.startTimeRealEnd = formatRangeUnix(startTimeReal)[1];
            params.startTimeReal = undefined;
          }
          break;
        case 'endTimeReal':
          if (endTimeReal && endTimeReal.length > 0) {
            params.endTimeRealFrom = formatRangeUnix(endTimeReal)[0];
            params.endTimeRealEnd = formatRangeUnix(endTimeReal)[1];
            params.endTimeReal = undefined;
          }
          break;
        case 'priority':
          params[prop] = value[prop].key;
          break;
        default:
          params[prop] = value[prop];
      }
    }
  });
  return params;
};

type props = {
  form: {
    setFieldsValue: () => {},
  },
  fetchData: () => {},
};

class ProdTaskFilter extends Component<props> {
  setInitialValue = value => {
    this.props.form.setFieldsValue(value);
  };

  onSearch = () => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    this.props.fetchData({ ...value, page: 1 }, {});
  };

  getButton = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <Button style={{ width: 86 }} onClick={this.onSearch}>
        <Icon type={'search'} />
        {changeChineseToLocale('查询')}
      </Button>
    );
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;
    return (
      <FilterSortSearchBar
        searchFn={this.onSearch}
        style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
      >
        <ItemList>
          <Item label="任务编号">{getFieldDecorator('taskCode')(<Input className="select-input" />)}</Item>

          <Item label="产出物料">
            {getFieldDecorator('outputMaterialCode')(<SearchSelect type="materialBySearch" />)}
          </Item>
          <Item label="生产工序">
            {getFieldDecorator('processCode')(
              <Searchselect
                placeholder={''}
                type={'processName'}
                className="select-input"
                handleData={data => data.map(({ key, label }) => ({ key, label: `${key}/${label}` }))}
              />,
            )}
          </Item>
          <Item label="生产工位">
            {getFieldDecorator('workStationId')(
              <WorkstationAndAreaSelect labelInValue onlyWorkstations style={{ width: 250 }} />,
            )}
          </Item>

          <Item label="执行人">
            {getFieldDecorator('operatorId')(
              <Searchselect placeholder={''} type={'account'} className="select-input" />,
            )}
          </Item>
          <Item label="状态">
            {getFieldDecorator('statuses', { initialValue: [{ key: '2', label: '执行中' }] })(
              <Select
                mode="tags"
                size="default"
                labelInValue
                style={{ marginLeft: 13, marginRight: 20, minWidth: 120 }}
              >
                {filterGroup.map(({ label, key }) => (
                  <Option key={key} value={key}>
                    {changeChineseToLocale(label)}
                  </Option>
                ))}
              </Select>,
            )}
          </Item>
          <Item label="项目编号">{getFieldDecorator('projectCode')(<Input className="select-input" />)}</Item>

          <Item label="下料物料">
            {getFieldDecorator('inputMaterialCode')(<SearchSelect type="materialBySearch" params={{ status: 1 }} />)}
          </Item>

          <Item label="实际开始时间">{getFieldDecorator('startTimeReal')(<RangerPicker />)}</Item>
          <Item label="实际结束时间">{getFieldDecorator('endTimeReal')(<RangerPicker />)}</Item>
        </ItemList>
        {this.getButton()}
      </FilterSortSearchBar>
    );
  }
}

ProdTaskFilter.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, ProdTaskFilter);
