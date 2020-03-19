import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Select } from 'src/components';

import { PRODUCT_BATCH_CODE_RULE_TYPE } from '../util';

const Option = Select.Option;

class ProductBatchCodeRuleTypeSelect extends Component {
  state = {};

  getOptions = withAll => {
    const { changeChineseToLocale } = this.context;

    if (withAll) {
      return Object.values(PRODUCT_BATCH_CODE_RULE_TYPE).map(i => {
        const { name, value } = i || {};
        return (
          <Option key={value} value={value}>
            {changeChineseToLocale(name)}
          </Option>
        );
      });
    }

    return Object.values(PRODUCT_BATCH_CODE_RULE_TYPE)
      .filter(i => i.value !== PRODUCT_BATCH_CODE_RULE_TYPE.all.value)
      .map(i => {
        const { name, value } = i || {};
        return (
          <Option key={value} value={value}>
            {changeChineseToLocale(name)}
          </Option>
        );
      });
  };

  render() {
    const { style, withAll, ...rest } = this.props;
    const { changeChineseToLocale } = this.context;
    const options = this.getOptions(withAll);

    return (
      <Select placeholder={changeChineseToLocale('请选择规则类型')} {...rest} style={style}>
        {options}
      </Select>
    );
  }
}

ProductBatchCodeRuleTypeSelect.propTypes = {
  style: PropTypes.object,
  withAll: PropTypes.bool, // 是否带上全部
};

ProductBatchCodeRuleTypeSelect.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default ProductBatchCodeRuleTypeSelect;
