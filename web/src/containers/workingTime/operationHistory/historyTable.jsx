import React, { Component } from 'react';

import { RestPagingTable, Tooltip, Badge } from 'src/components';
import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';
import { primary } from 'src/styles/color';

type Props = {
  style: {},
  data: [],
  dataTotalAmount: number,
  fetchHistory: [],
};

class HistoryTable extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        key: 'time',
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : replaceSign;
        },
      },
      {
        title: '操作用户',
        dataIndex: 'operatorName',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '操作类型',
        dataIndex: 'action',
        render: data => {
          const { name } = data || {};
          return name || replaceSign;
        },
      },
      {
        title: '操作详情',
        dataIndex: 'desc',
        render: data => {
          return (
            <div>
              {data ? (
                <div>
                  <Badge.MyBadge style={{ color: primary, display: 'inline-block', marginRight: 5 }} />
                  <Tooltip text={data} length={40} />
                </div>
              ) : (
                replaceSign
              )}
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { data, style, dataTotalAmount, fetchHistory } = this.props;

    const columns = this.getColumns();

    return (
      <RestPagingTable
        refetch={fetchHistory}
        style={style}
        dataSource={data || []}
        columns={columns}
        total={dataTotalAmount || 0}
      />
    );
  }
}

export default HistoryTable;
