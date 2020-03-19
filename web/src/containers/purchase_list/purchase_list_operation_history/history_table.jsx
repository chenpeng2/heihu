import React, { Component } from 'react';

import { RestPagingTable, Tooltip } from 'src/components';
import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';

type Props = {
  style: {},
  data: [],
  data_total_amount: number,
  fetch_purchase_list_history: [],
};

class History_Table extends Component {
  props: Props;
  state = {};

  get_columns = () => {
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
        key: 'operator',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '操作类型',
        dataIndex: 'procureOrderAction',
        key: 'type',
        render: data => {
          const { actionDisplay } = data || {};
          return actionDisplay || replaceSign;
        },
      },
      {
        title: '操作详情',
        dataIndex: 'msg',
        key: 'detail',
        render: data => {
          return data ? <Tooltip text={data} length={40} /> : replaceSign;
        },
      },
    ];
  };

  render() {
    const { data, style, data_total_amount, fetch_purchase_list_history } = this.props;

    const columns = this.get_columns();

    return (
      <RestPagingTable
        refetch={fetch_purchase_list_history}
        style={style}
        dataSource={data || []}
        columns={columns}
        total={data_total_amount || 0}
      />
    );
  }
}

export default History_Table;
