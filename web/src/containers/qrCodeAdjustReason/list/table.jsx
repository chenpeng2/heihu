import React, { Component } from 'react';

import { openModal, Badge, RestPagingTable, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import { error, primary } from 'src/styles/color';
import ChangeStatus from 'src/containers/qrCodeAdjustReason/base/changeUseStatus';
import Edit from 'src/containers/qrCodeAdjustReason/list/editModal';

type Props = {
  style: {},
  data: [],
  total: number,
  fetchData: () => {},
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [
      {
        title: '模块功能',
        dataIndex: 'module',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '事务名称',
        dataIndex: 'name',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '事务编码',
        dataIndex: 'code',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '启用状态',
        dataIndex: 'enable',
        render: data => {
          if (typeof data !== 'boolean') return replaceSign;

          if (data) {
            return <Badge.MyBadge color={primary} text={'启用中'} />;
          }
          return <Badge.MyBadge color={error} text={'停用中'} />;
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (__, record) => {
          const { enable, code } = record || {};
          return (
            <div>
              <ChangeStatus
                style={{ marginRight: 10 }}
                code={code}
                statusNow={enable}
                cbForChangeStatus={this.props.fetchData}
              />
              {this.renderEditButton(record)}
            </div>
          );
        },
      },
    ];
  };

  renderEditButton = (data) => {
    return (
      <span
        onClick={() => {
          openModal({
            title: '编辑仓储事务配置',
            children: <Edit initialData={data} cbForEdit={this.props.fetchData} />,
            width: 600,
            footer: null,
          });
        }}
        style={{ color: primary, cursor: 'pointer' }}
      >
        编辑
      </span>
    );
  };

  render() {
    const { data, total, fetchData } = this.props;
    const columns = this.getColumns();

    return (
      <RestPagingTable
        refetch={fetchData}
        style={{ margin: 0 }}
        dataSource={data || []}
        columns={columns}
        total={total || 0}
      />
    );
  }
}

export default Table;
