// 成品批号规则的状态badge
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Badge } from 'src/components';

import { findProductBatchCodeRuleStatus } from '../util';

const MyBadge = Badge.MyBadge;

class StatusBadge extends Component {
  state = {};

  render() {
    const { statusValue } = this.props;
    const { name, color } = findProductBatchCodeRuleStatus(statusValue);

    return (<MyBadge text={name} color={color} />);
  }
}

StatusBadge.propTypes = {
  style: PropTypes.object,
  statusValue: PropTypes.number,
};

export default StatusBadge;
