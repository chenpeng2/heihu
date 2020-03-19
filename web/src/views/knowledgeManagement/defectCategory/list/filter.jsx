import React from 'react';
import PropTypes from 'prop-types';

import { Select, Button, Icon, Input, FilterSortSearchBar, withForm, FormattedMessage } from 'src/components';
import moment from 'src/utils/time';
import { middleGrey } from 'src/styles/color';

import { DEFECT_CATEGORY_STATUS } from '../util';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

const ALL_STATUS = 'allStatus';

// 搜索buttons
const SearchButtons = props => {
  const { form, refetch } = props;

  return (
    <div>
      <Button
        style={{ width: 86 }}
        onClick={() => {
          form.validateFieldsAndScroll((err, value) => {
            if (!err && typeof refetch === 'function') {
              refetch({ filter: value, size: 10, page: 1 });
            }
          });
        }}
        icon={'search'}
      >
        查询
      </Button>
      <FormattedMessage
        defaultMessage={'重置'}
        onClick={() => {
          form.resetFields();

          // 重置的时候需要将时间设置为默认值
          form.setFieldsValue({ time: [moment().subtract(7, 'days'), moment()] });

          form.validateFieldsAndScroll((err, value) => {
            if (!err && typeof refetch === 'function') {
              refetch({ filter: value, size: 10, page: 1 });
            }
          });
        }}
        style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
      />
    </div>
  );
};

// 状态选择
const StatusSelect = props => {
  return (
    <Select {...props}>
      <Option value={ALL_STATUS} key={ALL_STATUS}>
        <FormattedMessage defaultMessage={'全部'} />
      </Option>
      {Object.values(DEFECT_CATEGORY_STATUS).map(i => {
        const { value, name } = i || {};
        return (
          <Option value={value} key={value}>
            <FormattedMessage defaultMessage={name} />
          </Option>
        );
      })}
    </Select>
  );
};

const Filter = props => {
  const { form, refetch } = props || {};
  const { getFieldDecorator } = form;

  return (
    <FilterSortSearchBar searchFn={refetch}>
      <ItemList>
        <Item label={'名称'}>{getFieldDecorator('name')(<Input />)}</Item>
        <Item label={'状态'}>
          {getFieldDecorator('status', {
            initialValue: ALL_STATUS,
          })(<StatusSelect />)}
        </Item>
      </ItemList>
      <SearchButtons form={form} refetch={refetch} />
    </FilterSortSearchBar>
  );
};

Filter.propTypes = {
  form: PropTypes.any,
  refetch: PropTypes.any,
};

// 格式化filterForm的值
export const formatFilterFormValue = value => {
  if (!value) return null;
  const { name, status } = value || {};
  return {
    search: name || null,
    status: status === ALL_STATUS ? null : status,
  };
};

export default withForm({}, Filter);
