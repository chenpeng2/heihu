import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { message } from 'src/components';
import { blacklakeGreen } from 'src/styles/color';
import { disableProductBatchCodeRule, enableProductBatchCodeRule } from 'src/services/productBatchCodeRule';

import { PRODUCT_BATCH_CODE_RULE_STATUS } from '../util';

const baseStyle = { margin: '0px 10px', cursor: 'pointer', color: blacklakeGreen };

class ChangeProductBatchCodeRuleStatus extends Component {
  state = {};

  getInUse = () => {
    const { statusNow } = this.props;

    if (statusNow === PRODUCT_BATCH_CODE_RULE_STATUS.inUse.value) return true;
    return false;
  };

  changeStatus = async (inUse, code, cbForChangeStatus) => {
    const { changeChineseToLocale } = this.context;
    if (!code) return;

    if (inUse) {
      await disableProductBatchCodeRule(code);
      message.success(changeChineseToLocale('停用用批号规则成功'));
    } else {
      await enableProductBatchCodeRule(code);
      message.success(changeChineseToLocale('启用用批号规则成功'));
    }

    if (typeof cbForChangeStatus === 'function') cbForChangeStatus();
  };

  render() {
    const { style, code, cbForChangeStatus } = this.props;
    const { changeChineseToLocale } = this.context;
    const inUse = this.getInUse();

    if (!code) return null;

    return (
      <span
        onClick={() => {
          this.changeStatus(inUse, code, cbForChangeStatus);
        }}
        style={{ ...baseStyle, ...style }}
      >
        {inUse ? changeChineseToLocale('停用') : changeChineseToLocale('启用')}
      </span>
    );
  }
}

ChangeProductBatchCodeRuleStatus.propTypes = {
  style: PropTypes.object,
  statusNow: PropTypes.number,
  code: PropTypes.string,
  cbForChangeStatus: PropTypes.func,
};

ChangeProductBatchCodeRuleStatus.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default ChangeProductBatchCodeRuleStatus;
