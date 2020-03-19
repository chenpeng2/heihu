import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DatePicker, Button, Icon, Input, withForm, FilterSortSearchBar, StorageSelect } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { getStorageIds } from 'src/components/select/storageSelect/storageSelect';
import moment from 'src/utils/time';
import { white, borderGrey, middleGrey } from 'src/styles/color';
import { getParams } from 'src/utils/url';

import { saveSplitRecordFilterValueInLocalStorage, getSplitRecordFilterValueFromLocalStorage } from '../utils';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangePicker = DatePicker.RangePicker;

class Filter extends Component {
  state = {};

  componentDidMount() {
    this.setAndGetInitialData();
  }

  setAndGetInitialData = () => {
    const { form, refetch } = this.props;
    const {
      queryObj: { filter },
    } = getParams() || {};

    let _filter;
    const filterInLocalStorage = getSplitRecordFilterValueFromLocalStorage();
    if (filter) {
      _filter = filter;
    } else if (filterInLocalStorage) {
      _filter = filterInLocalStorage;
    }

    if (_filter) {
      const { time, ...rest } = _filter;
      form.setFieldsValue({
        ...rest,
        time: Array.isArray(time) && time.length === 2 ? [moment(time[0]), moment(time[1])] : undefined,
      });

      form.validateFieldsAndScroll((err, value) => {
        if (!err && typeof refetch === 'function') {
          refetch({ filter: value });
          saveSplitRecordFilterValueInLocalStorage(value);
        }
      });
    }
  };

  renderButtons = () => {
    const { form, refetch } = this.props;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Button
          style={{ width: 86 }}
          onClick={() => {
            form.validateFieldsAndScroll((err, value) => {
              if (!err && typeof refetch === 'function') {
                refetch({ filter: value, size: 10, page: 1 });
                saveSplitRecordFilterValueInLocalStorage(value);
              }
            });
          }}
        >
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <span
          onClick={() => {
            form.resetFields();
            form.validateFieldsAndScroll((err, value) => {
              if (!err && typeof refetch === 'function') {
                refetch({ filter: value, size: 10, page: 1 });
              }
            });
          }}
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
        >
          {changeChineseToLocale('重置')}
        </span>
      </div>
    );
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <FilterSortSearchBar style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}>
        <ItemList>
          <Item label="操作人">
            {getFieldDecorator('operator')(
              <SearchSelect params={{ status: 1 }} style={{ width: '100%' }} type={'user'} />,
            )}
          </Item>
          <Item label="拆分二维码">{getFieldDecorator('qrCode')(<Input />)}</Item>
          <Item label="拆分位置">{getFieldDecorator('location')(<StorageSelect />)}</Item>
          <Item label="操作时间">
            {getFieldDecorator('time', {
              rules: [
                {
                  required: true,
                  message: '操作时间必填',
                },
              ],
              initialValue: [moment().subtract(7, 'days'), moment()],
            })(
              <RangePicker
                format={'YYYY-MM-DD HH:mm'}
                showTime={{
                  format: 'HH:mm',
                }}
                style={{ width: '100%' }}
              />,
            )}
          </Item>
        </ItemList>
        <div>{this.renderButtons()}</div>
      </FilterSortSearchBar>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export const formatFilterValueForSearch = data => {
  if (!data) return;
  const { operator, qrCode, location, time } = data;
  const { houseId, secondStorageIds, firstStorageId } = getStorageIds(location) || {};
  const [timeStart, timeEnd] = time || [];
  return {
    operatorId: operator && operator.key,
    sourceMaterialLotCode: qrCode,
    houseId,
    firstStorageId,
    storageIds: secondStorageIds,
    timeStart: moment(timeStart).format('x'),
    timeEnd: moment(timeEnd).format('x'),
  };
};

export default withForm({}, Filter);
