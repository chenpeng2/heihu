import React, { Component } from 'react';

import { Table } from 'src/components';
import { getTotalTime } from 'src/containers/workingTime/utils';
import { replaceSign } from 'src/constants';

type Props = {
  style: {},
  periods: [],
};

class TimeBucketTable extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [
      {
        title: '序号',
        dataIndex: 'seq',
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
      },
      {
        title: '时长',
        key: 'totalTime',
        render: (_, record) => {
          const { startTime, endTime } = record || [];
          return getTotalTime([{ startTime, endTime }]) || replaceSign;
        },
      },
    ];
  };

  render() {
    const { periods } = this.props;
    const columns = this.getColumns();

    return <Table style={{ margin: 0 }} dataSource={periods || []} pagination={false} columns={columns} />;
  }
}

export default TimeBucketTable;
