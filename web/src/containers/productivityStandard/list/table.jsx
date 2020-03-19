import React, { Component } from 'react';

import { Tooltip, RestPagingTable, Badge } from 'src/components';
import { replaceSign } from 'src/constants';
import LinkToEditProductivityStandardPage from 'src/containers/productivityStandard/base/linkToEditProductivityStandardPage';
import LinkToProductivityStandardDetailPage from 'src/containers/productivityStandard/base/linkToProductivityStandardDetailPage';
import StopUseOrReUseProductivityStandard from 'src/containers/productivityStandard/base/stopUseOrReUseProductivityStandard';
import { error, primary } from 'src/styles/color';
import { getProcessMessage } from 'src/containers/productivityStandard/base/util';

import { statusDisplay } from '../base/constant';
import { getStandardMessage } from '../base/util';

const MyBadge = Badge.MyBadge;

type Props = {
  style: {},
  tableData: [],
  totalAmount: number,
  fetchData: () => {},
  loading: boolean,
};

class ProductivityStandardTable extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { fetchData } = this.props;

    const renderOperation = data => {
      const { code, status } = data || {};

      return (
        <div>
          <LinkToProductivityStandardDetailPage code={code} />
          <LinkToEditProductivityStandardPage code={code} />
          <StopUseOrReUseProductivityStandard code={code} fetchData={fetchData} statusNow={status} />
        </div>
      );
    };

    return [
      {
        title: '编号',
        dataIndex: 'code',
        key: 'code',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: data => {
          return typeof data === 'number' && data >= 0 ? (
            <MyBadge text={statusDisplay[data]} color={data === 0 ? error : primary} />
          ) : null;
        },
      },
      {
        title: '工序',
        key: 'process',
        render: (_, record) => {
          const text = getProcessMessage(record);

          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '物料',
        key: 'material',
        render: (_, record) => {
          const { materialCode, materialName } = record;

          return materialCode && materialName ? (
            <Tooltip text={`${materialCode}/${materialName}`} length={20} />
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '工位',
        dataIndex: 'workstationName',
        key: 'workstation',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '标准',
        key: 'standard',
        render: (_, record) => {
          const { timeInterval, timeUnit, amount, unit, standardType } = record || {};

          const message = getStandardMessage(timeInterval, timeUnit, amount, unit, standardType);

          return message ? <Tooltip text={message} length={20} /> : replaceSign;
        },
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 200,
        render: (_, record) => {
          return renderOperation(record);
        },
      },
    ];
  };

  render() {
    const { tableData, fetchData, totalAmount, loading } = this.props;

    const columns = this.getColumns();

    return (
      <RestPagingTable
        loading={loading}
        refetch={fetchData}
        dataSource={tableData || []}
        columns={columns}
        total={totalAmount}
      />
    );
  }
}

export default ProductivityStandardTable;
