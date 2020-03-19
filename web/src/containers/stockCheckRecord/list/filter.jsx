import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  FormItem,
  Input,
  DatePicker,
  Button,
  withForm,
  FilterSortSearchBar,
  StorageSelectWithWorkDepartments,
} from 'src/components';
import { middleGrey } from 'src/styles/color';
import SearchSelect from 'src/components/select/searchSelect';
import StatusSelect, { ALL_VALUE } from 'src/containers/stockCheckRecord/commonComponent/statusSelect';
import { formatRangeUnix } from 'src/utils/time';
import { getParams } from 'src/utils/url';
import { arrayIsEmpty } from 'src/utils/array';

const RangePicker = DatePicker.RangePicker;
const ItemList = FilterSortSearchBar.ItemList;
const ItemForFormItem = FilterSortSearchBar.ItemForFormItem;
const Item = FilterSortSearchBar.Item;

// 格式化form中的数据
export const formatFormValue = (
  values,
  options = {
    secondStorageIdsType: 'array',
  },
) => {
  const { area, time, user, qrCode, status, material, ...rest } = values || {};

  const _time = time ? formatRangeUnix(time) : null;
  const _status = status === ALL_VALUE ? null : status;

  const params = {
    beginTrallyingTime: Array.isArray(_time) ? _time[0] : null,
    endTrallyingTime: Array.isArray(_time) ? _time[1] : null,
    trallyorId: user ? user.key : null,
    materialCode: material ? material.key : null,
    qrcode: qrCode || null,
    status: _status,
    page: 1,
    ...rest,
  };

  if (!arrayIsEmpty(area)) {
    const level = area[0].split(',')[2];

    let id = '';
    if (level === '3') {
      id = area.map(n => n.split(',')[0]);
      if (options && options.secondStorageIdsType === 'string') id = id.join(',');
    } else {
      id = area[0].split(',')[0];
    }

    params.houseId = level === '1' ? id : null;
    params.firstStorageId = level === '2' ? id : null;
    params.secondStorageIds = level === '3' ? id : null;
  }

  return params;
};

class Filter extends Component {
  state = {};

  componentDidMount() {
    this.setFormValue();
  }

  setFormValue = () => {
    const { form } = this.props;
    const { queryObj } = getParams();
    const { filter } = queryObj || {};
    if (filter && filter.time) {
      delete filter.time;
    }
    this.searchData({ filter });
    if (filter) {
      form.setFieldsValue(filter);
    }
  };

  searchData = formValue => {
    const { fetchAndSetData } = this.props;
    if (typeof fetchAndSetData === 'function') {
      fetchAndSetData(formValue);
    }
  };

  render() {
    const { form, match } = this.props;
    const { isReset } = this.state;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, getFieldsValue, resetFields } = form;

    return (
      <FilterSortSearchBar searchDisabled>
        <ItemList>
          <ItemForFormItem>
            <FormItem label={'盘点区域'}>
              {getFieldDecorator('area', {
                rules: [{ required: true, message: changeChineseToLocale('盘点区域必填') }],
              })(<StorageSelectWithWorkDepartments isReset={isReset} match={match} />)}
            </FormItem>
          </ItemForFormItem>
          <Item label={'盘点时间'}>{getFieldDecorator('time')(<RangePicker />)}</Item>
          <Item label={'盘点人'}>{getFieldDecorator('user')(<SearchSelect type={'account'} />)}</Item>
          <Item label={'物料'}>{getFieldDecorator('material')(<SearchSelect type={'materialBySearch'} />)}</Item>
          <Item label={'二维码'}>{getFieldDecorator('qrCode')(<Input />)}</Item>
          <Item label={'盘点状态'}>{getFieldDecorator('status', { initialValue: ALL_VALUE })(<StatusSelect />)}</Item>
        </ItemList>
        <Button
          icon={'search'}
          style={{ margin: '0 10px' }}
          onClick={() => {
            const values = getFieldsValue();
            if (sensors) {
              sensors.track('web_stock_stockCheckRecord_search', {
                FilterCondition: values,
              });
            }
            this.searchData({ filter: values, page: 1 });
          }}
        >
          查询
        </Button>
        <span
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
          onClick={() => {
            resetFields();
            this.setState({ isReset: true }, () => {
              this.setState({ isReset: false });
            });
            const values = getFieldsValue();
            this.searchData({ filter: values, page: 1 });
          }}
        >
          {changeChineseToLocale('重置')}
        </span>
      </FilterSortSearchBar>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  fetchAndSetData: PropTypes.any,
  match: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, Filter);
