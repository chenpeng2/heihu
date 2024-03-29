import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Select, Input, withForm, FilterSortSearchBar } from 'src/components';
import { UNIT_STATUS } from 'src/containers/unit/util';
import { middleGrey } from 'src/styles/color';
import { getParams } from 'src/utils/url';

const { ItemList, Item } = FilterSortSearchBar;
const Option = Select.Option;
const ALL_STATUS = 'all_status';

export const formatFilterValue = value => {
  if (!value) return null;

  const { status, ...rest } = value || {};
  return {
    status: status === ALL_STATUS ? null : status,
    ...rest,
  };
};

class Filter extends Component {
  state = {};

  componentDidMount() {
    this.setValue();
  }

  setValue = () => {
    const { form, fetchData } = this.props;
    const { getFieldsValue, setFieldsValue } = form || {};

    const { queryObj } = getParams() || {};
    const { filter } = queryObj || {};

    if (filter) {
      setFieldsValue(filter);
    } else {
      this.setInitialValue();
    }

    if (typeof fetchData === 'function') fetchData({ ...getFieldsValue(), page: 1 });
  };

  setInitialValue = () => {
    const { form } = this.props;
    form.resetFields();
    form.setFieldsValue({ status: ALL_STATUS, search: undefined });
  };

  renderStatusSelect = props => {
    const options = Object.values(UNIT_STATUS).map(i => {
      const { value, name } = i || {};
      return <Option value={value}>{name}</Option>;
    });

    return (
      <Select {...props}>
        <Option value={ALL_STATUS}>全部</Option>
        {options}
      </Select>
    );
  };

  render() {
    const { form, fetchData, style } = this.props;
    const { getFieldDecorator, getFieldsValue } = form || {};

    return (
      <div style={{ display: 'flex', ...style }}>
        <ItemList>
          <Item label={'编码'}>{getFieldDecorator('code')(<Input />)}</Item>
          <Item label={'状态'}>{getFieldDecorator('status')(this.renderStatusSelect())}</Item>
        </ItemList>
        <Button
          icon="search"
          onClick={() => {
            if (typeof fetchData === 'function') fetchData({ ...getFieldsValue(), page: 1 });
          }}
        >
          查询
        </Button>
        <span
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
          onClick={() => {
            this.setInitialValue();
            if (typeof fetchData === 'function') fetchData({ ...getFieldsValue(), page: 1 });
          }}
        >
          重置
        </span>
      </div>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  fetchData: PropTypes.func,
  form: PropTypes.any,
};

export default withForm({}, Filter);
