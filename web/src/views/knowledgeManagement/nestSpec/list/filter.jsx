import React from 'react';
import PropTypes from 'prop-types';

import { Select, Input, FilterSortSearchBar, withForm } from 'src/components';

import { NEST_SPEC_STATUS } from '../utils';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const SearchButtons = FilterSortSearchBar.SearchButtons;
const SelectGroup = Select.SelectGroup;

// 状态的全部数据
const _groupData = Object.values(NEST_SPEC_STATUS).map(i => {
  const { value, name } = i || {};
  return { value, label: name };
});
_groupData.unshift({ value: null, label: '全部' });

const Filter = props => {
  const { form, refetch } = props;
  const { getFieldDecorator } = form || {};

  return (
    <FilterSortSearchBar>
      <ItemList>
        <Item label={'编号'}>{getFieldDecorator('code')(<Input />)}</Item>
        <Item label={'名称'}>{getFieldDecorator('name')(<Input />)}</Item>
        <Item label={'状态'}>
          {getFieldDecorator('status', {
            initialValue: null,
          })(<SelectGroup groupData={_groupData} />)}
        </Item>
      </ItemList>
      <SearchButtons form={form} refetch={refetch} />
    </FilterSortSearchBar>
  );
};

Filter.propTypes = {
  style: PropTypes.any,
  refetch: PropTypes.any,
  form: PropTypes.any,
};

export const formatFilterFormValue = value => {
  const { code, name, status } = value || {};
  return {
    packCode: code,
    packName: name,
    state: status,
  };
};

export default withForm({}, Filter);
