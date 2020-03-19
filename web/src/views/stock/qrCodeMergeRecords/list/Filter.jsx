import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Input, StorageSelect, Searchselect, FilterSortSearchBar, withForm, DatePicker } from 'src/components';
import { border } from 'src/styles/color';
import moment, { formatRangeUnix, formatRangeTimeToMoment } from 'src/utils/time';
import { getParams } from 'src/utils/url';

const { Item, ItemList, SearchButtons } = FilterSortSearchBar;
const { RangePicker } = DatePicker;
const getStorageIds = StorageSelect.getStorageIds;

export const formatFilterFormValue = values => {
  const { time, operator, location, qrCodeAfterMerge } = values || {};
  const storageIds = location ? getStorageIds(location) : {};

  const [createFrom, createTo] = time ? formatRangeUnix(time) : [];

  return {
    operatorId: operator ? operator.key : null,
    targetMaterialLotCode: qrCodeAfterMerge,
    createFrom,
    createTo,
    ...storageIds,
  };
};

const Filter = props => {
  const { form, refetch, style } = props;
  const { getFieldDecorator, setFieldsValue } = form || {};

  useEffect(() => {
    const filter = _.get(getParams(), 'queryObj.filter');
    if (filter) {
      const { time, ...rest } = filter;

      setFieldsValue({ ...rest, time: formatRangeTimeToMoment(time) });
    } else {
      setFieldsValue({ time: [moment().subtract(30, 'days'), moment()] });
    }

    form.validateFieldsAndScroll((err, value) => {
      if (err) return;
      if (typeof refetch === 'function') {
        refetch({ filter: value });
      }
    });
  }, []);

  return (
    <FilterSortSearchBar style={{ borderBottom: `1px solid ${border}`, ...style }}>
      <ItemList>
        <Item label={'操作时间'}>{getFieldDecorator('time')(<RangePicker />)}</Item>
        <Item label={'操作人'}>{getFieldDecorator('operator')(<Searchselect type={'account'} />)}</Item>
        <Item label={'操作位置'}>{getFieldDecorator('location')(<StorageSelect />)}</Item>
        <Item label={'合并二维码'}>{getFieldDecorator('qrCodeAfterMerge')(<Input />)}</Item>
      </ItemList>
      <SearchButtons
        resetFn={() => {
          form.setFieldsValue({ time: [moment().subtract(30, 'days'), moment()] });
        }}
        refetch={refetch}
        form={form}
      />
    </FilterSortSearchBar>
  );
};

Filter.propTypes = {
  style: PropTypes.any,
  refetch: PropTypes.func,
  form: PropTypes.any,
};

export default withForm({}, Filter);
