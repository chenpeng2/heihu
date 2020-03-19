import React, { Component } from 'react';
import _ from 'lodash';

import { openModal, Spin } from 'src/components';
import Table from 'src/containers/qrCodeAdjustReason/list/table';
import Filter from 'src/containers/qrCodeAdjustReason/list/filter';
import CreateButton from 'src/containers/qrCodeAdjustReason/base/linkToCreate';
import Create from 'src/containers/qrCodeAdjustReason/list/createModal';
import { getReasons } from 'src/services/stock/qrCodeAdjustReason';
import { setLocation } from 'utils/url';
import { getQuery, getLocation } from 'src/routes/getRouteParams';

type Props = {
  style: {},
  match: any,
};

class List extends Component {
  props: Props;
  state = {
    data: [],
    total: 0,
  };

  componentDidMount() {
    this.fetchAndSetData({ enable: true }); // 默认拉取启用中的调整原因
  }

  fetchAndSetData = p => {
    const { match } = this.props;

    const query = getQuery(match);
    const _params = { ...query, ...p, size: 10 };
    this.setState({
      loading: true,
    });

    getReasons(_params)
      .then(res => {
        const response = _.get(res, 'data');
        const { data, total } = response || {};

        this.setState({
          data,
          total,
        });
      })
      .finally(() => {
        const location = getLocation(match);
        location.query = { ...location.query, ..._params };
        setLocation(this.props, () => location.query);

        this.setState({ loading: false });
      });
  };

  renderHeader = () => {
    const openCreateModal = () => {
      openModal({
        title: '创建仓储事务配置',
        children: <Create />,
        onClose: () => {
          this.fetchAndSetData();
        },
        width: 600,
        footer: null,
      });
    };

    return (
      <div>
        <div style={{ display: 'inline-block', justifyContent: 'space-around' }}>
          <CreateButton openCreateModal={openCreateModal} />
        </div>
        <div style={{ display: 'inline-block', float: 'right' }}>
          <Filter fetchData={this.fetchAndSetData} />
        </div>
      </div>
    );
  };

  renderTable = () => {
    const { data, total } = this.state;
    return <Table total={total} data={data} fetchData={this.fetchAndSetData} />;
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div style={{ padding: '0px 20px' }}>
          {this.renderHeader()}
          {this.renderTable()}
        </div>
      </Spin>
    );
  }
}

export default List;
