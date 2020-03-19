import React, { Component } from 'react';
import _ from 'lodash';

import { Button, Spin, openModal } from 'src/components';
import Table from 'src/containers/exceptionalEvent/typeDefinition/table';
import { getTypeList } from 'src/services/knowledgeBase/exceptionalEvent';
import Create from 'src/containers/exceptionalEvent/typeDefinition/create';
import { setLocation } from 'utils/url';
import { getLocation } from 'src/routes/getRouteParams';

const fetchData = async params => {
  const res = await getTypeList(params);
  return _.get(res, 'data');
};

type Props = {
  style: {},
  match: {},
};

class TypeDefinitionList extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    totalAmount: null,
  };

  componentDidMount() {
    this.fetchAndSetState();
  }

  fetchAndSetState = async params => {
    const { match } = this.props;
    this.setState({ loading: true });

    const nextParams = { ...params, size: 10 };
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

  renderCreateButton = () => {
    return (
      <Button
        icon={'plus-circle-o'}
        style={{ margin: '20px 0px' }}
        onClick={() => {
          openModal({
            title: '创建异常类型',
            children: <Create fetchData={this.fetchAndSetState} />,
            footer: null,
            width: 680,
          });
        }}
      >
        创建异常类型
      </Button>
    );
  };

  renderTable = () => {
    const { data, totalAmount } = this.state;

    return <Table data={data} totalAmount={totalAmount} fetchData={this.fetchAndSetState} />;
  };

  render() {
    const { loading } = this.state;

    return (
      <div style={{ padding: '0 20px' }}>
        {this.renderCreateButton()}
        <Spin spinning={loading}>{this.renderTable()}</Spin>
      </div>
    );
  }
}

export default TypeDefinitionList;
