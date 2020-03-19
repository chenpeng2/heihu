import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { blacklakeGreen } from 'src/styles/color';
import { Icon, FormattedMessage } from 'src/components';

const baseStyle = { margin: '0px 10px', cursor: 'pointer', color: blacklakeGreen };
const iconStyle = { paddingRight: 10 };

class LinkToProductBatchCodeRuleOperationHistory extends Component {
  state = {};

  render() {
    const { router } = this.context;
    const { code, iconType, style } = this.props;
    if (!code) return null;

    return (
      <span
        style={{ ...baseStyle, ...style }}
        onClick={() => {
          router.history.push(`/stock/productBatchCodeRule/${code}/detail/operationHistory`);
        }}
      >
        {iconType ? <Icon type={iconType} style={iconStyle} /> : null}
        <FormattedMessage defaultMessage={'查看操作记录'} />
      </span>
    );
  }
}

LinkToProductBatchCodeRuleOperationHistory.propTypes = {
  style: PropTypes.object,
  code: PropTypes.string,
  iconType: PropTypes.string,
};

LinkToProductBatchCodeRuleOperationHistory.contextTypes = {
  router: PropTypes.object,
};

export default LinkToProductBatchCodeRuleOperationHistory;
