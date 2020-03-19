import React, { Component } from 'react';
import _ from 'lodash';
import { replaceSign } from 'constants';
import { thousandBitSeparator } from 'utils/number';
import { SimpleTable, Tooltip } from 'components';
import { getMaterialRequest } from 'src/services/schedule';

type props = {
  taskCode: String,
};

/** 转移申请进度 */
class TransferApplyProgress extends Component<props> {
  state = {
    data: [],
  };
  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { taskCode } = this.props;
    const {
      data: { data },
    } = await getMaterialRequest({ taskCode });
    this.setState({ data });
  };

  getColumns = () => {
    const { data } = this.state;
    const merged = _.reduce(data.map(e => e.merged), (a, b) => a || b, false);
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
        dataIndex: 'amount',
        render: data => (typeof data === 'number' ? thousandBitSeparator(data) : replaceSign),
      },
      {
        title: merged ? '所在转移申请数' : '已申请数',
        dataIndex: 'planingAmount',
        render: data => (typeof data === 'number' ? thousandBitSeparator(data) : replaceSign),
      },
      {
        title: merged ? '所在转移申请发出数' : '已发出数',
        dataIndex: 'sendingAmount',
        render: data => (typeof data === 'number' ? thousandBitSeparator(data) : replaceSign),
      },
      {
        title: merged ? '所在转移申请接收数' : '已接收数',
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
    const { data } = this.state;
    const columns = this.getColumns();

    return <SimpleTable pagination={false} columns={columns} dataSource={data} />;
  }
}

export default TransferApplyProgress;
