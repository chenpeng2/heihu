import React, { Component } from 'react';
import _ from 'lodash';

import { RestPagingTable, Tooltip, Badge } from 'src/components';
import { primary, error } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import LinkToEditPage from 'src/containers/materialRequest/base/linkToEditPage';
import LinkToDetailPage from 'src/containers/materialRequest/base/linkToDetailPage';
import ChangeStatus from 'src/containers/materialRequest/base/changeStatus';

import { findStatus } from '../utils';

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
        title: '编号',
        dataIndex: 'requestCode',
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'requestStatus',
        render: data => {
          if (typeof data !== 'number') return replaceSign;
          const status = findStatus(data);
          const { name, color } = status;

          return <Badge.MyBadge color={color} text={name || replaceSign} />;
        },
      },
      {
        title: '需求时间',
        dataIndex: 'requireTime',
        render: data => {
          const time = data ? moment(data).format('YYYY/MM/DD') : replaceSign;

          return <Tooltip text={time} length={20} />;
        },
      },
      {
        title: '请求仓位',
        dataIndex: 'sourceStorage',
        render: data => {
          if (!data) return replaceSign;
          const { name } = data || {};

          return <Tooltip text={name} length={20} />;
        },
      },
      {
        title: '项目号',
        dataIndex: 'projectInfos',
        key: 'projectCode',
        render: data => {
          if (!data) return replaceSign;
          const _data = _.uniq(data.map(a => a.projectCode)).join(',');

          return <Tooltip text={_data} length={20} />;
        },
      },
      {
        title: '订单编号',
        dataIndex: 'projectInfos',
        key: 'projectInfos',
        render: data => {
          if (!Array.isArray(data)) return replaceSign;

          const _text = _.uniqBy(data, 'projectCode')
            .map(a => {
              return a.purchaseOrder ? a.purchaseOrder.purchaseOrderNumber : replaceSign;
            })
            .join(',');

          return <Tooltip text={_text} length={20} />;
        },
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 200,
        render: (_, record) => {
          const { requestCode, requestStatus } = record;

          // 未下发的可以下发，编辑, 取消。
          return (
            <div>
              {requestStatus === 0 ? <ChangeStatus code={requestCode} type={'dispatch'} fetchData={fetchData} /> : null}
              {requestStatus === 0 ? <LinkToEditPage code={requestCode} /> : null}
              <LinkToDetailPage code={requestCode} />
              {requestStatus === 0 ? <ChangeStatus code={requestCode} type={'cancel'} fetchData={fetchData} /> : null}
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
