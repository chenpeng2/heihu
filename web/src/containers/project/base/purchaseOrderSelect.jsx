import React, { Component } from 'react';
import _ from 'lodash';

import SearchSelect from 'src/components/select/searchSelect';
import { getPurchaseOrders } from 'src/services/cooperate/purchaseOrder';

type Props = {
  style: {}
}

class PurchaseOrderSelect extends Component {
  props: Props
  state = {}

  searchPurchaseOrdersData = ({ search, ...rest }) => {
    return getPurchaseOrders({ purchaseOrderCode: search || '', ...rest }).then(res => {
      const data = _.get(res, 'data.data');

      return Array.isArray(data) ? data.map(i => {
        const { id, purchaseOrderCode } = i;
        return {
          key: purchaseOrderCode,
          label: purchaseOrderCode,
        };
      }) : [];
    });
  }

  render() {
    return (
      <SearchSelect {...this.props} extraSearch={this.searchPurchaseOrdersData} />
    );
  }
}

export default PurchaseOrderSelect;
