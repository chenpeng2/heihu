import React, { Component } from 'react';
import _ from 'lodash';

import SearchSelect from 'src/components/select/searchSelect';
import { getReasons } from 'src/services/stock/qrCodeAdjustReason';

type Props = {
  style: {},
  params: any
}

class TransactionsSelect extends Component {
  props: Props
  state = {}

  extraSearch = (p) => {
    const { params } = this.props;

    return getReasons({ ...p, ...params }).then(res => {
      const data = _.get(res, 'data.data');

      return Array.isArray(data) && data.length ? data.map(i => {
        const { name, code } = i || {};
        return {
          label: `${code}/${name}`,
          key: code,
        };
      }) : [];
    });
  }

  render() {
    return (
      <SearchSelect mode={'multiple'} {...this.props} extraSearch={this.extraSearch} />
    );
  }
}

export default TransactionsSelect;
