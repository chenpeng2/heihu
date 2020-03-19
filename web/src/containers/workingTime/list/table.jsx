import React, { Component } from 'react';

import { RestPagingTable, Tooltip, Badge } from 'src/components';
import { primary, error } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import LinkToWorkingTimeDetail from 'src/containers/workingTime/base/linkToWorkingTimeDetail';
import ChangeUseStatus from 'src/containers/workingTime/base/changeUseStatus';
import { getTotalTime, calcTotalTime } from 'src/containers/workingTime/utils';

type Props = {
  data: [],
  totalAmount: number,
  fetchData: () => {},
  loading: boolean,
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { fetchData } = this.props;

    return [
      {
        title: '名称',
        dataIndex: 'name',
        render: (data) => {
          return <Tooltip text={data || replaceSign} length={10} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (data) => {
          if (!data) return replaceSign;

          const { name, code } = data || {};
          return <Badge.MyBadge text={name || replaceSign} color={code === 1 ? primary : error} />;
        },
      },
      {
        title: '时间段',
        dataIndex: 'periods',
        render: (data) => {
          if (!Array.isArray(data)) return replaceSign;

          const text = data.map(({ startTime, endTime }) => {
            return `${startTime || replaceSign}~${endTime || replaceSign}`;
          }).join(',');

          return <Tooltip text={text || replaceSign} length={40} />;
        },
      },
      {
        title: '总时长',
        key: 'totalTime',
        render: (_, record) => {
          const { periods } = record || {};
          if (!periods) return replaceSign;

          return getTotalTime(periods);
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (_, record) => {
          const { id, status } = record;

          return (
            <div>
              <LinkToWorkingTimeDetail code={id} />
              <ChangeUseStatus code={id} statusNow={status} fetchData={fetchData} />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { fetchData, totalAmount, data, loading } = this.props;

    const columns = this.getColumns();

    return (
      <div>
        <RestPagingTable
          loading={loading}
          columns={columns}
          dataSource={data || []}
          refetch={fetchData}
          total={totalAmount || 0}
        />
      </div>
    );
  }
}

export default Table;
