import React, { Component } from 'react';
import { replaceSign } from 'constants';
import _ from 'lodash';
import { thousandBitSeparator } from 'utils/number';
import { SimpleTable, Tooltip } from 'components';
import { Spin } from 'antd';
import { materialRequestProgress } from 'services/schedule';

type props = {
  taskCode: String,
  transactionCode: String,
};

type State = {
  data: any[],
  spinning: Boolean,
};

/** 超量领料/退料 进度 */
class MaterialRequestProgress extends Component<props> {
  state: State = {
    data: [],
    spinning: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { taskCode, transactionCode } = this.props;
    this.setState({ spinning: true });
    try {
      const params = { taskCode, transactionCode };
      const response = await materialRequestProgress(params);
      const data = _.get(response, 'data.data', []);
      this.setState({ data, spinning: false });
    } catch (error) {
      this.setState({ spinning: false });
    }
  };

  getColumns = () => {
    const columns = [
      {
        title: '物料编号／名称',
        key: 'material',
        render: (_, record) => {
          const { materialCode, materialName } = record;
          return <Tooltip text={`${materialCode}／${materialName}`} length={15} />;
        },
      },
      {
        title: '总需求数',
        dataIndex: 'applyingAmount',
        render: data => (typeof data === 'number' ? thousandBitSeparator(data) : replaceSign),
      },
      {
        title: '已申请数',
        dataIndex: 'planingAmount',
        render: data => (typeof data === 'number' ? thousandBitSeparator(data) : replaceSign),
      },
      {
        title: '已发出数',
        dataIndex: 'sendingAmount',
        render: data => (typeof data === 'number' ? thousandBitSeparator(data) : replaceSign),
      },
      {
        title: '已接收数',
        dataIndex: 'receiveAmount',
        render: data => (typeof data === 'number' ? thousandBitSeparator(data) : replaceSign),
      },
    ];

    return columns.map(e => ({
      ...e,
      render: e.render || (data => data || replaceSign),
    }));
  };
  render() {
    const { data, spinning } = this.state;
    const columns = this.getColumns();

    return (
      <Spin spinning={spinning}>
        <SimpleTable pagination={false} columns={columns} dataSource={data} />
      </Spin>
    );
  }
}

export default MaterialRequestProgress;
