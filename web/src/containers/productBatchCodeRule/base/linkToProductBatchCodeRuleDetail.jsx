import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { blacklakeGreen } from 'src/styles/color';
import { Link } from 'src/components';

class LinkToProductBatchCodeRuleDetail extends Component {
  state = {};

  render() {
    const { code } = this.props;
    if (!code) return null;

    const baseStyle = { marginRight: 10, cursor: 'pointer', color: blacklakeGreen };

    return (
      <Link
        style={baseStyle}
        to={`/stock/productBatchCodeRule/${code}/detail`}
      >
        查看
      </Link>
    );
  }
}

LinkToProductBatchCodeRuleDetail.propTypes = {
  style: PropTypes.object,
  code: PropTypes.string,
};

export default LinkToProductBatchCodeRuleDetail;
