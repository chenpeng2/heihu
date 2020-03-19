import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Select, Input, withForm, FilterSortSearchBar, FormattedMessage } from 'src/components';
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
    const { setFieldsValue, getFieldsValue } = form || {};

    const { queryObj } = getParams() || {};
    const { filter } = queryObj || {};

    if (filter) {
      setFieldsValue(filter);
      if (typeof fetchData === 'function') fetchData({ filter });
    } else {
      this.setInitialValue();
      const value = getFieldsValue();
      if (typeof fetchData === 'function') fetchData({ filter: value });
    }
  };

  setInitialValue = () => {
    const { form } = this.props;
    form.resetFields();
    form.setFieldsValue({ status: ALL_STATUS, search: undefined });
  };

  renderStatusSelect = props => {
    const options = Object.values(UNIT_STATUS).map(i => {
      const { value, name } = i || {};
      return (
        <Option value={value}>
          <FormattedMessage defaultMessage={name} />
        </Option>
      );
    });

    return (
      <Select {...props}>
        <Option value={ALL_STATUS}>
          <FormattedMessage defaultMessage={'全部'} />
        </Option>
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
          <Item label={'名称'}>{getFieldDecorator('search')(<Input />)}</Item>
          <Item label={'状态'}>{getFieldDecorator('status')(this.renderStatusSelect())}</Item>
        </ItemList>
        <Button
          icon="search"
          onClick={() => {
            if (typeof fetchData === 'function') fetchData({ filter: getFieldsValue(), page: 1 });
          }}
        >
          查询
        </Button>
        <FormattedMessage
          defaultMessage={'重置'}
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
          onClick={() => {
            this.setInitialValue();
            if (typeof fetchData === 'function') fetchData({ filter: getFieldsValue(), page: 1 });
          }}
        />
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
