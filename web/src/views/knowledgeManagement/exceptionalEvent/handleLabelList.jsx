import React, { Component } from 'react';
import _ from 'lodash';

import { Spin, Button, openModal } from 'src/components';
import Table from 'src/containers/exceptionalEvent/handleLabel/table';
import { getLabelList } from 'src/services/knowledgeBase/exceptionalEvent';
import Create from 'src/containers/exceptionalEvent/handleLabel/create';

const fetchData = async params => {
  const res = await getLabelList(params);
  return _.get(res, 'data');
};

type Props = {
  style: {},
};

class HandleLabelList extends Component {
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
    this.setState({ loading: true });

    const nextParams = { ...params, size: 10 };

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
            title: '创建处理标签',
            children: <Create fetchData={this.fetchAndSetState} />,
            footer: null,
            width: 680,
          });
        }}
      >
        创建处理标签
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
        <Spin spinning={loading} >
          {this.renderTable()}
        </Spin>
      </div>
    );
  }
}

export default HandleLabelList;
