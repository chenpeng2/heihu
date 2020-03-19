import React, { Component } from 'react';

import { authorityWrapper, buttonAuthorityWrapper, Badge, Tooltip, Table } from 'src/components';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import LinkToDetail from 'src/containers/processRouting/base/linkToDetail';
import LinkToCopy from 'src/containers/processRouting/base/linkToCopy';
import LinkToEdit from 'src/containers/processRouting/base/linkToEdit';

import UpdateStatus from '../base/updateStatus';
import { STATUS } from '../constant';

type Props = {
  style: {},
  fetchData: () => {},
  dataSource: [],
  total: number,
  pagination: {},
};

class ProcessRoutingTable extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [
      {
        title: '编号',
        dataIndex: 'code',
        width: 200,
        key: 'code',
        render: text => text || replaceSign,
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: text => text || replaceSign,
      },
      {
        title: '有效期',
        key: 'validDate',
        width: 200,
        render: (_, record) => {
          const { validFrom, validTo } = record;

          const getFormatDate = timestamp => {
            if (!timestamp) {
              return null;
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD');
          };

          return validFrom && validTo ? `${getFormatDate(validFrom)}-${getFormatDate(validTo)}` : replaceSign;
        },
      },
      {
        title: '发布状态',
        dataIndex: 'status',
        width: 100,
        key: 'status',
        render: status => {
          return this.renderReleaseState(status);
        },
      },
      {
        title: '工序编号／名称列表',
        dataIndex: 'processList',
        width: 300,
        key: 'processList',
        render: processList => {
          return this.renderProcessList(processList);
        },
      },
      {
        title: '操作',
        width: 220,
        fixed: 'right',
        key: 'action',
        render: (_, record) => {
          return this.renderOperation(record);
        },
      },
    ];
  };

  renderReleaseState = value => {
    if (typeof value !== 'number') {
      return replaceSign;
    }
    const _display = STATUS[value];
    return <Badge status={value === 1 ? 'success' : 'error'} text={_display} />;
  };

  renderProcessList = processList => {
    if (!processList) {
      return replaceSign;
    }
    const text = processList
      .map(processContainer => {
        if (!processContainer) {
          return null;
        }
        const { nodes } = processContainer || {};
        if (nodes) {
          return nodes.map(({ processCode, processName }) => {
            return `${processCode}/${processName}`;
          });
        }
        return null;
      })
      .filter(a => a)
      .join(' ');
    return text || replaceSign;
  };

  renderOperation = processRouteData => {
    const { fetchData, handleLoading } = this.props;
    const { status, code } = processRouteData;

    return (
      <div>
        <LinkToDetail id={code} />
        <LinkToEdit id={code} statusNow={status} />
        <LinkToCopy id={code} />
        <UpdateStatus
          processRouting={processRouteData}
          fetchData={fetchData}
          beforeClick={() => handleLoading(true)}
          finallyCallback={() => handleLoading(false)}
        />
      </div>
    );
  };

  render() {
    const { dataSource, total, fetchData, pagination, loading, tableUniqueKey } = this.props;
    const columns = this.getColumns();

    return (
      <Table
        tableUniqueKey={tableUniqueKey}
        useColumnConfig
        dragable
        columns={columns}
        dataSource={dataSource || []}
        total={total || 0}
        refetch={fetchData}
        pagination={pagination}
        loading={loading}
      />
    );
  }
}

export default ProcessRoutingTable;
