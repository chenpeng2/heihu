import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Select } from 'src/components';
import { stockCheckRecordStatus } from '../utils';

const Option = Select.Option;

export const ALL_VALUE = 'all';

class StatusSelect extends Component {
  state = {};

  render() {
    const { changeChineseToLocale } = this.context;
    const options = Object.values(stockCheckRecordStatus).map(i => {
      const { name, value } = i || {};
      return <Option value={value}>{changeChineseToLocale(name)}</Option>;
    });
    options.unshift(<Option value={ALL_VALUE}>{changeChineseToLocale('全部')}</Option>);

    return (
      <Select {...this.props} defaultValue={ALL_VALUE}>
        {options}
      </Select>
    );
  }
}

StatusSelect.propTypes = {
  style: PropTypes.object,
};

StatusSelect.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default StatusSelect;
