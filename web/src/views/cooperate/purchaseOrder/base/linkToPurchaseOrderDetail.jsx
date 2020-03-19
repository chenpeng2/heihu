import React, { Component } from 'react';

import { Link } from 'src/components';
import { primary } from 'src/styles/color';

type Props = {
  render: () => {},
  code: string,
  style: {},
};

class LinkToPurchaseOrderDetail extends Component {
  props: Props;
  state = {};

  render() {
    const { render, code, style } = this.props;

    return (
      <Link
        style={{ display: 'inline-block', color: primary, marginRight: 10, ...style }}
        to={`/cooperate/purchaseOrders/${code}/detail`}
      >
        {render ? render() : '查看'}
      </Link>
    );
  }
}

export default LinkToPurchaseOrderDetail;
