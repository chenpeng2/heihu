import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { getPurchaseOrders } from 'src/services/cooperate/purchaseOrder';
import { setLocation } from 'utils/url';
import { getLocation } from 'src/routes/getRouteParams';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';

import { TABLE_UNIQUE_KEY } from './constants';
import Filter from './filter';
import Table from './table';

type Props = {
  style: {},
  match: {},
  location: any,
};

class PurchaseOrderList extends Component {
  props: Props;
  state = {
    purchaseOrderListData: null,
    totalAmount: null,
    loading: false,
    pagination: {},
  };

  componentDidMount() {
    const pageSize = getTablePageSizeFromLocalStorage(TABLE_UNIQUE_KEY);
    this.fetchAndSetPurchaseOrderListData({ size: pageSize });
  }

  fetchAndSetPurchaseOrderListData = async params => {
    const { match } = this.props;

    // loading
    this.setState({ loading: true });

    // 获取下个查询的参数，同时将location.query放入其中
    const location = getLocation(match);
    const { query: lastParams } = location || {};
    const nextParams = { ...lastParams, ...params };

    // 将参数放到url中
    location.query = nextParams;
    setLocation(this.props, () => location.query);

    await getPurchaseOrders(nextParams)
      .then(({ data: { data, total } }) => {
        const { page, size } = nextParams || {};

        this.setState({
          pagination: {
            current: page || 1,
            pageSize: size || 10,
            total,
          },
          purchaseOrderListData: data,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    return <Filter location={this.props.location} fetchData={this.fetchAndSetPurchaseOrderListData} />;
  };

  renderTable = () => {
    const { purchaseOrderListData, pagination, loading } = this.state;

    return (
      <Table
        style={{ margin: '0 20px' }}
        data={purchaseOrderListData}
        pagination={pagination}
        fetchData={this.fetchAndSetPurchaseOrderListData}
        loading={loading}
      />
    );
  };

  render() {
    return (
      <div>
        {this.renderFilter()}
        {this.renderTable()}
      </div>
    );
  }
}

export default withRouter(PurchaseOrderList);
