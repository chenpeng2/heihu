import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DatePicker, FilterSortSearchBar, Input, Button, Select, withForm, FormattedMessage } from 'src/components';
import { EBOM_STATUS } from 'src/constants';
import { middleGrey } from 'src/styles/color';
import { getParams } from 'src/utils/url';
import { formatRangeTimeToMoment, formatRangeUnix } from 'src/utils/time';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

class EbomListFiler extends Component {
  state = {};

  componentDidMount() {
    this.setInitialValue();
  }

  setInitialValue = () => {
    const { form } = this.props;
    const { queryObj } = getParams() || {};
    const { filter } = queryObj || {};

    const { createdTime, ...rest } = filter || {};
    if (filter) {
      form.setFieldsValue({
        createdTime: formatRangeTimeToMoment(createdTime),
        ...rest,
      });
    }
  };

  reFetchData = p => {
    const { form, fetchData } = this.props;
    const { getFieldsValue } = form || {};
    if (typeof fetchData === 'function') fetchData({ filter: getFieldsValue(), ...p, page: 1 });
  };

  render() {
    const { form, fetchData } = this.props;
    const { getFieldDecorator, getFieldsValue, resetFields } = form || {};
    const { changeChineseToLocale } = this.context;
    return (
      <FilterSortSearchBar
        searchDisabled
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.reFetchData();
          }
        }}
      >
        <ItemList>
          <Item label="成品物料编号">{getFieldDecorator('productMaterialCode')(<Input trim />)}</Item>
          <Item label="成品物料名称">{getFieldDecorator('productMaterialName')(<Input trim />)}</Item>
          <Item label="版本号">{getFieldDecorator('version')(<Input placeholder="请填写完整版本号" trim />)}</Item>
          <Item label="状态">
            {getFieldDecorator('status', {
              initialValue: null,
            })(
              <Select>
                {[
                  { value: null, label: '全部' },
                  { value: 1, label: EBOM_STATUS[1] },
                  { value: 0, label: EBOM_STATUS[0] },
                ].map(({ value, label }) => (
                  <Option key={value} value={value}>
                    {changeChineseToLocale(label)}
                  </Option>
                ))}
              </Select>,
            )}
          </Item>
          <Item label="物料编号">{getFieldDecorator('rawMaterialCode')(<Input trim />)}</Item>
          <Item label="物料名称">{getFieldDecorator('rawMaterialName')(<Input trim />)}</Item>
          <Item label="创建时间">{getFieldDecorator('createdTime')(<DatePicker.RangePicker />)}</Item>
        </ItemList>
        <Button
          icon="search"
          onClick={() => {
            this.reFetchData();
          }}
        >
          查询
        </Button>
        <FormattedMessage
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
          onClick={() => {
            resetFields();
            if (typeof fetchData === 'function') fetchData({ filter: getFieldsValue(), page: 1 });
          }}
          defaultMessage={'重置'}
        />
      </FilterSortSearchBar>
    );
  }
}

EbomListFiler.propTypes = {
  style: PropTypes.object,
  fetchData: PropTypes.any,
};

EbomListFiler.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export const formatFilterValue = data => {
  if (!data) return {};
  const { createdTime, ...rest } = data;
  const [startDate, endDate] = formatRangeUnix(createdTime) || [];
  return {
    startDate,
    endDate,
    ...rest,
  };
};

export default withForm({}, EbomListFiler);
