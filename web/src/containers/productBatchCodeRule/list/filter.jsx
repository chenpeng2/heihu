import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withForm, Select, FilterSortSearchBar, Button, Input } from 'src/components';
import { middleGrey } from 'src/styles/color';

import { PRODUCT_BATCH_CODE_RULE_STATUS } from '../util';
import RuleTypeSelect from '../base/ruleTypeSelect';

const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

class Filter extends Component {
  state = {};

  renderStatusSelect = () => {
    const { changeChineseToLocale } = this.context;
    const options = Object.values(PRODUCT_BATCH_CODE_RULE_STATUS).map(i => {
      const { name, value } = i || {};
      return (
        <Option key={value} value={value}>
          {changeChineseToLocale(name)}
        </Option>
      );
    });

    return <Select>{options}</Select>;
  };

  searchFunc = values => {
    const { fetchData } = this.props;
    if (!values) return;

    if (typeof fetchData === 'function') {
      fetchData({ ...values, page: 1 });
    }
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, resetFields, getFieldsValue } = form || {};

    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label={'成品批号规则'}>{getFieldDecorator('searchRuleName')(<Input />)}</Item>
            <Item label={'规则类型'}>
              {getFieldDecorator('searchRuleTypes', {
                initialValue: null,
              })(<RuleTypeSelect withAll />)}
            </Item>
            <Item label={'状态'}>
              {getFieldDecorator('searchStatuses', {
                initialValue: null,
              })(this.renderStatusSelect())}
            </Item>
          </ItemList>
          <div>
            <Button
              icon="search"
              onClick={() => {
                const values = getFieldsValue();
                this.searchFunc({ ...values });
              }}
            >
              查询
            </Button>
            <span
              style={{ color: middleGrey, margin: '0 10px', cursor: 'pointer', verticalAlign: 'middle' }}
              onClick={() => {
                resetFields();
                const values = getFieldsValue();
                this.searchFunc({ ...values });
              }}
            >
              {changeChineseToLocale('重置')}
            </span>
          </div>
        </FilterSortSearchBar>
      </div>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  form: PropTypes.object,
  fetchData: PropTypes.func,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, Filter);
