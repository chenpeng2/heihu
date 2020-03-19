import React, { Component } from 'react';
import _ from 'lodash';
import { SimpleTable, Tooltip } from 'components';
import { thousandBitSeparator } from 'utils/number';
import { replaceSign } from 'src/constants';
import { formatUnix } from 'utils/time';
import { queryWeighingLeftRecord } from 'services/weighing/weighingTask';

type Props = {
  taskId: Number,
  style: {},
};

class WeighingRecordTable extends Component {
  state = {
    dataSource: [],
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.taskId !== this.props.taskId) {
      this.fetchData(nextProps.taskId);
    }
    return true;
  }

  fetchData = async taskId => {
    if (taskId) {
      await queryWeighingLeftRecord(taskId)
        .then(res => {
          const data = _.get(res, 'data.data');
          this.setState({ dataSource: data });
        })
        .catch(err => console.log(err));
    }
  };

  getColumns = () => {
    return [
      {
        title: '电子标签',
        dataIndex: 'materialLot.code',
        width: 120,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={23} /> : replaceSign;
        },
      },
      {
        title: '物料编号 | 物料名称',
        dataIndex: 'materialLot',
        width: 200,
        render: (data, record) => {
          const { materialCode } = data;
          const { materialName } = record;
          return materialCode ? `${materialCode}/${materialName}` : replaceSign;
        },
      },
      {
        title: '入厂批次',
        dataIndex: 'materialLot.inboundBatch',
        width: 120,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={22} /> : replaceSign;
        },
      },
      {
        title: '供应商批次',
        dataIndex: 'materialLot.mfgBatches',
        width: 120,
        render: (data, record) => {
          if (Array.isArray(data) && data.length > 0) {
            const mfgBatchNo = data.map(({ mfgBatchNo }) => mfgBatchNo);
            return <Tooltip text={_.join(mfgBatchNo, '，')} length={22} />;
          }
          return replaceSign;
        },
      },
      {
        title: '实重',
        dataIndex: 'amount',
        width: 100,
        render: (data, record) => {
          const { unitName } = record;
          return typeof data === 'number' ? `${thousandBitSeparator(data)} ${unitName || replaceSign}` : replaceSign;
        },
      },
      {
        title: '称量时间',
        dataIndex: 'createdAt',
        width: 120,
        render: (data, record) => {
          return data ? <Tooltip text={formatUnix(data)} length={23} /> : replaceSign;
        },
      },
      {
        title: '操作人',
        dataIndex: 'operatorName',
        width: 120,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={10} /> : replaceSign;
        },
      },
    ];
  };

  render() {
    const { dataSource } = this.state;
    const columns = this.getColumns();

    return (
      <SimpleTable
        rowKey={record => record.id}
        pagination={false}
        dataSource={dataSource}
        style={{ width: 920, margin: 0, ...this.props.style }}
        columns={columns}
      />
    );
  }
}
export default WeighingRecordTable;
