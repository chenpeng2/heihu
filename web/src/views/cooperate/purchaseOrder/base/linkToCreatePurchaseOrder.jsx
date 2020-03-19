import React, { Component } from 'react';

import { Button, Link, haveAuthority } from 'src/components';
import auth from 'utils/auth';

type Props = {
  style: {},
};

class LinkToCreatePurchaseOrder extends Component {
  props: Props;
  state = {};

  render() {
    const { style, ...restProps } = this.props;

    return (
      <div style={style}>
        <Link
          disabled={!haveAuthority(auth.WEB_CREATE_PURCHASE_ORDER)}
          to={'/cooperate/purchaseOrders/create'}
          {...restProps}
        >
          <Button icon={'plus-circle-o'}>
            创建销售订单
          </Button>
        </Link>
      </div>
    );
  }
}

export default LinkToCreatePurchaseOrder;
