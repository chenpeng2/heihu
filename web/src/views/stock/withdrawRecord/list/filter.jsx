import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  StorageSelectWithWorkDepartments,
  DatePicker,
  FormItem,
  FilterSortSearchBar,
  withForm,
  Input,
  Searchselect,
} from 'src/components';
import { getStorageIds } from 'src/components/select/storageSelect/storageSelect';
import moment, { formatRangeTimeToMoment, formatToUnix } from 'src/utils/time';
import { getParams } from 'src/utils/url';

const Item = FilterSortSearchBar.Item;
const ItemForFormItem = FilterSortSearchBar.ItemForFormItem;
const ItemList = FilterSortSearchBar.ItemList;
const SearchButtons = FilterSortSearchBar.SearchButtons;
const RangePicker = DatePicker.RangePicker;

const formatRangeUnix = value => {
  if (!value || value.length === 0) {
    return [];
  }
  return [formatToUnix(moment(value[0])), formatToUnix(moment(value[1]))];
};

const Filter = (props, context) => {
  const { form, refetch } = props;
  const { getFieldDecorator } = form || {};
  const { changeChineseToLocale } = context || {};

  useEffect(() => {
    const { filter } = _.get(getParams(), 'queryObj');
    // url中有filter
    if (filter) {
      const { time, ...rest } = filter;
      form.setFieldsValue({ time: formatRangeTimeToMoment(time), ...rest });
    } else {
      form.setFieldsValue({ time: [moment().subtract(7, 'days'), moment()] });
    }

    form.validateFieldsAndScroll((err, value) => {
      if (err) return;
      if (typeof refetch === 'function') {
        refetch({ filter: value });
      }
    });
  }, []);

  return (
    <FilterSortSearchBar>
      <ItemList>
        <Item label={'退料仓位'}>{getFieldDecorator('storage')(<StorageSelectWithWorkDepartments />)}</Item>
        <Item label={'二维码'}>{getFieldDecorator('qrCode')(<Input />)}</Item>
        <Item label={'物料'}>{getFieldDecorator('material')(<Searchselect type={'materialBySearch'} />)}</Item>
        <Item label={'操作人'}>{getFieldDecorator('operator')(<Searchselect type={'account'} />)}</Item>
        <ItemForFormItem>
          <FormItem label={'操作时间'}>
            {getFieldDecorator('time', {
              rules: [
                {
                  required: true,
                  message: changeChineseToLocale('操作时间必填'),
                },
              ],
            })(<RangePicker format={'YYYY-MM-DD HH:mm:ss'} showTime style={{ width: '100%' }} />)}
          </FormItem>
        </ItemForFormItem>
        <Item label={'供应商批次'}>{getFieldDecorator('mfgBatch')(<Input />)}</Item>
      </ItemList>
      <div>
        <SearchButtons refetch={refetch} form={form} />
      </div>
    </FilterSortSearchBar>
  );
};

Filter.propTypes = {
  form: PropTypes.any,
  refetch: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, Filter);

export const formatFilterFormValue = filerFormValue => {
  if (!filerFormValue) return null;

  const { storage, operator, time, material, ...rest } = filerFormValue || {};
  const [createdBegin, createdEnd] = formatRangeUnix(time);
  const { houseId, firstStorageId, secondStorageIds } = getStorageIds(storage) || {};
  return {
    operatorId: operator ? operator.key : null,
    createdBegin,
    createdEnd,
    materialCode: material ? material.key : null,
    houseId,
    firstStorageId,
    secondStorageIds: typeof secondStorageIds === 'string' ? secondStorageIds.split(',') : null,
    ...rest,
  };
};
