import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { Spin } from 'src/components';
import Table from 'src/containers/exceptionalEvent/subscribeManageList/table';
import Filter from 'src/containers/exceptionalEvent/subscribeManageList/filter';
import { setLocation } from 'utils/url';
import { getLocation, getQuery } from 'src/routes/getRouteParams';
import { getSetting } from 'src/services/knowledgeBase/exceptionalEvent';

const fetchData = async params => {
  const res = await getSetting(params);
  return _.get(res, 'data');
};

type Props = {
  style: {},
  match: {}
};

class SubscribeManagerList extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    totalAmount: 0,
  };

  componentDidMount() {
    this.fetchAndSetState();
  }

  fetchAndSetState = async params => {
    const { match } = this.props;

    this.setState({ loading: true });

    // 将url中的值获取到, 设置为参数
    const query = getQuery(match);

    // size的默认值为10
    const _params = { ...query, ...params, size: 10 };
    const nextParams = { ..._params, size: 10 };
    // 将参数设置到url中
    const location = getLocation(match);
    location.query = nextParams;
    setLocation(this.props, () => location.query);
    fetchData(nextParams)
      .then(res => {
        const { data, total } = res || {};
        this.setState({
          data,
          totalAmount: total,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    return <Filter fetchData={this.fetchAndSetState} />;
  };

  renderTable = () => {
    const { data, totalAmount } = this.state;

    return <Table data={data} totalAmount={totalAmount} fetchData={this.fetchAndSetState} />;
  };

  render() {
    const { loading } = this.state;

    return (
      <div style={{ padding: '0px 20px' }}>
        {this.renderFilter()}
        <Spin spinning={loading} >
           {this.renderTable()}
        </Spin>
      </div>
    );
  }
}

export default withRouter(SubscribeManagerList);
