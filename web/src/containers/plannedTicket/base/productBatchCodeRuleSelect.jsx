// 成品批号规则的选择框
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Select } from 'src/components';
import { primary, error } from 'src/styles/color';
import { getProductBatchCodeRules } from 'src/services/productBatchCodeRule';

const Option = Select.Option;

// 成品批次号状态
const PRODUCT_BATCH_CODE_RULE_STATUS = {
  all: { name: '全部', value: null },
  inUse: { name: '启用中', value: 1, color: primary },
  inStop: { name: '停用中', value: 0, color: error },
};

type Props = {
  params: {},
  style: {},
};

class ProductBatchCodeRuleSelect extends Component {
  props: Props;
  state = {
    data: [],
  };

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = async searchValue => {
    await getProductBatchCodeRules({
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
        placeholder="请选择"
        onSearch={this.handleSearch}
        style={{ width: 120, ...style }}
        {...rest}
      >
        {data.map(({ key, label, ...rest }) => (
          <Option key={key} value={key}>
            {label}
          </Option>
        ))}
      </Select>
    );
  }
}

export default ProductBatchCodeRuleSelect;
