import React, { Component } from 'react';
import _ from 'lodash';

import { border } from 'src/styles/color';
import { getWorkingTimesList } from 'src/services/knowledgeBase/workingTime';
import Filter from 'src/containers/workingTime/list/filter';
import Table from 'src/containers/workingTime/list/table';
import LinkToCreateWorkingTimePage from 'src/containers/workingTime/base/linkToCreateWorkingTimePage';
import { setLocation } from 'utils/url';
import { getLocation, getQuery } from 'src/routes/getRouteParams';

const getData = async params => {
  const res = await getWorkingTimesList(params);

  return _.get(res, 'data');
};

type Props = {
  match: { params: { id: string } },
};

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
    getData({ ...lastParams, ...params, size: 10 })
      .then(res => {
        const { data, total } = res || {};
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
    return <Filter style={{ borderBottom: `1px solid ${border}` }} fetchData={this.fetchDataAndSetState} />;
  };

  renderCreateButton = () => {
    return <LinkToCreateWorkingTimePage />;
  };

  renderTable = () => {
    const { loading, listData, totalAmount } = this.state;

    return <Table fetchData={this.fetchDataAndSetState} loading={loading} data={listData} totalAmount={totalAmount} />;
  };

  render() {
    return (
      <div>
        {this.renderFilter()}
        {this.renderCreateButton()}
        {this.renderTable()}
      </div>
    );
  }
}

export default List;
