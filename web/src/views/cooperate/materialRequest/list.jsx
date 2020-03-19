import React, { Component } from 'react';
import _ from 'lodash';

import { border } from 'src/styles/color';
import Table from 'src/containers/materialRequest/list/table';
import Filter from 'src/containers/materialRequest/list/filter';
import { setLocation } from 'utils/url';
import { getLocation, getQuery } from 'src/routes/getRouteParams';
import { getMaterialRequestList } from 'src/services/cooperate/materialRequest';

type Props = {
  style: {},
  match: {}
}

class List extends Component {
  props: Props;
  state = {
    listData: null,
    loading: false,
    totalAmount: 0,
  };

  componentDidMount() {
    this.fetchDataAndSetState();
  }

  fetchDataAndSetState = params => {
    this.setState({ loading: true });

    const { match } = this.props;
    const id = _.get(this.props, 'match.params.id');
    const lastParams = getQuery(match);
    const location = getLocation(match);
    location.query = { ...location.query, operatingHourId: id, ...params };
    setLocation(this.props, () => location.query);
    getMaterialRequestList({ ...lastParams, ...params, size: 10 })
      .then(res => {
        const { data, total } = _.get(res, 'data') || {};
        this.setState({
          listData: data,
          totalAmount: total,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    return <Filter style={{ borderBottom: `1px solid ${border}`, marginBottom: '20px' }} fetchData={this.fetchDataAndSetState} />;
  };

  renderTable = () => {
    const { loading, listData, totalAmount } = this.state;

    return <Table fetchData={this.fetchDataAndSetState} loading={loading} data={listData} totalAmount={totalAmount} />;
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

export default List;
