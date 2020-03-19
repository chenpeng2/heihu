// 成品批号规则的选择框
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Select } from 'src/components';
import { getProductBatchCodeRules } from 'src/services/productBatchCodeRule';
import { PRODUCT_BATCH_CODE_RULE_STATUS } from '../util';

const Option = Select.Option;

class ProductBatchCodeRuleSelect extends Component {
  state = {
    data: [],
  };

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = searchValue => {
    getProductBatchCodeRules({
      searchRuleName: searchValue,
      size: 20,
      page: 1,
      searchStatuses: PRODUCT_BATCH_CODE_RULE_STATUS.inUse.value,
    }).then(res => {
      const data = _.get(res, 'data.data');
      this.setState({
        data:
          Array.isArray(data) && data.length
            ? data.map(i => {
                const { ruleId, ruleName } = i || {};
                return { key: ruleId, label: ruleName };
              })
            : [],
      });
    });
  };

  render() {
    const { style, ...rest } = this.props;
    const { data } = this.state;

    return (
      <Select
        allowClear
        labelInValue
        placeholder="请选择"
        onSearch={this.handleSearch}
        style={{ width: 120, ...style }}
        filterOption
        {...rest}
      >
        {data.map(({ key, label, ...rest }) => (
          <Option key={`key-${key}`} value={key} {...rest}>
            {label}
          </Option>
        ))}
      </Select>
    );
  }
}

ProductBatchCodeRuleSelect.propTypes = {
  style: PropTypes.object,
};

export default ProductBatchCodeRuleSelect;
