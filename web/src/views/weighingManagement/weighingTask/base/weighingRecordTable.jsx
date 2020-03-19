import React, { Component } from 'react';
import _ from 'lodash';
import { SimpleTable, Tooltip } from 'components';
import { replaceSign } from 'src/constants';
import { formatUnix } from 'utils/time';
import { thousandBitSeparator } from 'utils/number';

import { queryWeighingRecord } from 'services/weighing/weighingTask';
import { PRECISE_TYPE, WEIGHING_TYPE, PERIOD_UNIT, weighingModeMap } from '../../constants';

type Props = {
  taskId: Number,
  style: {},
};

class WeighingRecordTable extends Component {
  props: Props;
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
      await queryWeighingRecord(taskId)
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
        dataIndex: 'electronicTag',
        width: 120,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={23} /> : replaceSign;
        },
      },
      {
        title: '物料编号 | 物料名称',
        dataIndex: 'materialCode',
        width: 200,
        render: (materialCode, record) => {
          const { materialName } = record;
          return materialCode ? `${materialCode}/${materialName}` : replaceSign;
        },
      },
      {
        title: '流水号',
        dataIndex: 'serialNumber',
        width: 100,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={15} /> : replaceSign;
        },
      },
      {
        title: '项目',
        dataIndex: 'projectCode',
        width: 100,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={15} /> : replaceSign;
        },
      },
      {
        title: '工位',
        dataIndex: 'workstationName',
        width: 100,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={10} /> : replaceSign;
        },
      },
      {
        title: '称量器',
        dataIndex: 'weigher',
        width: 100,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={10} /> : replaceSign;
        },
      },
      {
        title: '来源物料',
        dataIndex: 'fromSource',
        width: 100,
        render: (data, record, index) => {
          const source = _.last(data);
          return Array.isArray(data) ? (
            <Tooltip text={_.get(source, 'electronicTag', replaceSign)} length={10} />
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '实重',
        dataIndex: 'realWeight',
        width: 100,
        render: (data, record) => {
          const { materialUnit } = record;
          return typeof data === 'number'
            ? `${thousandBitSeparator(data)} ${materialUnit || replaceSign}`
            : replaceSign;
        },
      },
      {
        title: '称量方法',
        dataIndex: 'weighingType',
        width: 100,
        render: (data, record) => {
          return typeof data === 'number' ? <Tooltip text={WEIGHING_TYPE[data]} length={10} /> : replaceSign;
        },
      },
      {
        title: '称量规则',
        dataIndex: 'weighingMode',
        width: 100,
        render: (data, record) => {
          const mode = typeof data !== 'number' ? 1 : data;
          return <Tooltip text={weighingModeMap[mode]} length={10} />;
        },
      },
      {
        title: '有效期',
        dataIndex: 'deadline',
        width: 100,
        render: (data, record) => {
          return data ? <Tooltip text={formatUnix(data)} length={20} /> : replaceSign;
        },
      },
      {
        title: '称量时间',
        dataIndex: 'createdAt',
        width: 100,
        render: (data, record) => {
          return data ? <Tooltip text={formatUnix(data)} length={20} /> : replaceSign;
        },
      },
      {
        title: '操作人',
        dataIndex: 'executorName',
        width: 100,
        render: (data, record) => {
          return data ? <Tooltip text={data} length={10} /> : replaceSign;
        },
      },
      {
        title: '核验人',
        dataIndex: 'verifierName',
        width: 100,
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
        pagination={false}
        dataSource={dataSource}
        style={{ width: 920, margin: 0, ...this.props.style }}
        scroll={{ x: 2000 }}
        columns={columns}
      />
    );
  }
}
export default WeighingRecordTable;
