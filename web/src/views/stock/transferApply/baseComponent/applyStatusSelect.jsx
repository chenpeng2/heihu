/**
 * @description: 转移申请状态选择框
 *
 * @date: 2019/3/22 上午11:04
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Select } from 'src/components/index';
import { APPLY_STATUS } from '../util';

const Option = Select.Option;

class ApplyStatusSelect extends Component {
  state = {};

  render() {
    const { changeChineseToLocale } = this.context;
    return (
      <Select mode={'multiple'} {...this.props}>
        {Object.values(APPLY_STATUS)
          .filter(i => !(i && i.hasOwnProperty('isStatus')))
          .map(i => {
            const { value, name } = i;
            return <Option value={value}>{changeChineseToLocale(name)}</Option>;
          })}
      </Select>
    );
  }
}

ApplyStatusSelect.propTypes = {
  style: PropTypes.object,
};
ApplyStatusSelect.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default ApplyStatusSelect;
