import React, { Component } from 'react';

import { Link, haveAuthority } from 'src/components';
import { primary } from 'src/styles/color';
import auth from 'utils/auth';

type Props = {
  render: () => {},
  code: string,
  style: {},
  icon: string,
};

class LinkToEditPurchaseOrder extends Component {
  props: Props;
  state = {};

  render() {
    const { render, code, style, icon } = this.props;

    return (
      <Link
        disabled={!haveAuthority(auth.WEB_UPDATE_PURCHASE_ORDER)}
        style={{ display: 'inline-block', color: primary, marginRight: 10, ...style }}
        to={`/cooperate/purchaseOrders/${code}/edit`}
        icon={icon}
      >
        {render ? render() : '编辑'}
      </Link>
    );
  }
}

export default LinkToEditPurchaseOrder;
