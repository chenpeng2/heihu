import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, StorageSelect, DatePicker, Input, withForm, FilterSortSearchBar, Select, Button } from 'src/components';
import { middleGrey } from 'src/styles/color';
import SearchSelect from 'src/components/select/searchSelect';
import moment, { formatRangeUnix } from 'src/utils/time';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';
import { arrayIsEmpty } from 'src/utils/array';

import TransactionsSelect from './transactionsSelect';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const getStorageIds = StorageSelect.getStorageIds;

// 格式化filter的数据
export const formatFilerFormValue = value => {
  if (!value) return null;
  const { location, qrcode, operatorIds, recordCode, transactionCodes, date } = value || {};
  const times = formatRangeUnix(date);

  const { secondStorageIds, ...rest } = getStorageIds(location) || {};

  return {
    qrcode: qrcode || null,
    recordCode: recordCode || null,
    transactionCodes: arrayIsEmpty(transactionCodes) ? null : transactionCodes.map(i => i && i.key),
    operatorIds: arrayIsEmpty(operatorIds) ? null : operatorIds.map(i => i && i.key),
    startTime: times[0] || null,
    endTime: times[1] || null,
    secondStorageIds: typeof secondStorageIds === 'string' ? secondStorageIds.split(',') : null,
    ...rest,
  };
};

type Props = {
  style: {},
  fetchData: () => {},
  form: any,
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const { form, fetchData } = this.props;

    this.setDateDefaultValue();
    const value = form.getFieldsValue();
    if (typeof fetchData === 'function') fetchData({ filter: value, page: 1 });
  }

  setDateDefaultValue = () => {
    const { form } = this.props;
    form.setFieldsValue({ date: [moment().subtract(30, 'days'), moment()] });
  };

  render() {
    const { form, fetchData } = this.props;
    const { getFieldDecorator, getFieldsValue, resetFields } = form || {};
    const { changeChineseToLocale } = this.context;

    const useQrCode = isOrganizationUseQrCode();

    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label={'操作人'}>
              {getFieldDecorator('operatorIds')(<SearchSelect type={'account'} mode={'multiple'} />)}
            </Item>
            <Item label="操作时间">{getFieldDecorator('date')(<DatePicker.RangePicker type={'project'} />)}</Item>
            <Item label={'操作位置'}>{getFieldDecorator('location')(<StorageSelect />)}</Item>
            <Item label="事务">
              {getFieldDecorator('transactionCodes')(<TransactionsSelect params={{ enable: true }} />)}
            </Item>
            <Item label="记录编号">{getFieldDecorator('recordCode')(<Input />)}</Item>
            {useQrCode ? (
              <Item label="二维码">
                {getFieldDecorator('qrcode')(<Input placeholder={changeChineseToLocale('请输入二维码')} className="select-input" />)}
              </Item>
            ) : null}
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const value = getFieldsValue();

              if (sensors) {
                sensors.track('web_stock_storageAdjustRecord_search', {
                  FilterCondition: formatFilerFormValue(value),
                });
              }

              fetchData({ filter: value, page: 1 });
            }}
          >
            查询
          </Button>
          <Link
            style={{ color: middleGrey, cursor: 'pointer', margin: '0 5px', lineHeight: '28px' }}
            onClick={() => {
              resetFields();

              // 重置时间为默认值
              this.setDateDefaultValue();
              const value = getFieldsValue();

              fetchData({ filter: value, page: 1 });
            }}
          >
            重置
          </Link>
        </FilterSortSearchBar>
      </div>
    );
  }
}

Filter.contextTypes = {
  changeChineseToLocale: PropTypes,
};

export default withForm({}, Filter);
