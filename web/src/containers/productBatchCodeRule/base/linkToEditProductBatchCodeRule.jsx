import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Icon, Popconfirm } from 'src/components';
import { error, blacklakeGreen } from 'src/styles/color';
import { PRODUCT_BATCH_CODE_RULE_STATUS } from '../util';

const Popiknow = Popconfirm.Popiknow;

class LinkToEditProductBatchCodeRule extends Component {
  state = {};

  render() {
    const { router, changeChineseToLocale } = this.context;
    const { code, statusNow, iconType, style } = this.props;
    if (!code) return null;

    const baseStyle = { margin: '0px 10px', cursor: 'pointer', color: blacklakeGreen };
    const iconStyle = { paddingRight: 10 };

    // 启用中的批号规则不可以编辑
    if (statusNow === PRODUCT_BATCH_CODE_RULE_STATUS.inUse.value) {
      return (
        <Popiknow title={'该批号规则已启用，不可编辑！如欲编辑请先停用'}>
          <span style={baseStyle}>
            {iconType ? <Icon type={iconType} style={{ color: error, ...iconStyle }} /> : null}
            <span style={{ color: error }}>{changeChineseToLocale('编辑')}</span>
          </span>
        </Popiknow>
      );
    }

    return (
      <span
        style={{ ...baseStyle, ...style }}
        onClick={() => {
          router.history.push(`/stock/productBatchCodeRule/${code}/edit`);
        }}
      >
        {iconType ? <Icon type={iconType} style={iconStyle} /> : null}
        {changeChineseToLocale('编辑')}
      </span>
    );
  }
}

LinkToEditProductBatchCodeRule.propTypes = {
  style: PropTypes.object,
  code: PropTypes.string,
  iconType: PropTypes.string,
  statusNow: PropTypes.number,
};

LinkToEditProductBatchCodeRule.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.any,
};

export default LinkToEditProductBatchCodeRule;
