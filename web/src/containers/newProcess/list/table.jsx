import React, { Component } from 'react';

import { Table, Badge, Tooltip, message as AntMessage } from 'src/components';
import { error, primary } from 'styles/color';
import { replaceSign } from 'src/constants';
import LinkToProcessDetail from 'src/containers/newProcess/base/linkToProcessDetail';
import LinkToEditProcess from 'src/containers/newProcess/base/linkToEditProcess';
import UpdateStatus from 'src/containers/newProcess/base/updateStatus';

import { PROCESS_STATUS } from '../constant';

type Props = {
  children: Element,
  data: [],
  match: {},
  pagination: {},
  total: number,
  fetchData: () => {},
};

class ProcessTable extends Component {
  props: Props;
  state = {
    visible: false,
    failedPromptVisible: false,
    processId: '',
  };

  openNotification = status => {
    AntMessage.success(`${status}工序成功`);
  };

  getTableColumns = () => {
    const { handleLoading } = this.props;
    return [
      {
        title: '编号',
        dataIndex: 'code',
        key: 'code',
        width: 200,
        render: code => {
          return code || replaceSign;
        },
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: name => {
          return <Tooltip text={name} length={20} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: data => {
          return <Badge.MyBadge text={PROCESS_STATUS[data] || replaceSign} color={data === 1 ? primary : error} />;
        },
      },
      {
        title: '工位',
        key: 'workstations',
        width: 250,
        render: (_, record) => {
          const { workstationDetails, workstationGroupDetails } = record;
          const workstationNames = [];

          if (Array.isArray(workstationDetails) && workstationDetails.length) {
            workstationDetails.forEach(({ name }) => {
              workstationNames.push(name);
            });
          }

          if (Array.isArray(workstationGroupDetails) && workstationGroupDetails.length) {
            workstationGroupDetails.forEach(({ name }) => {
              workstationNames.push(name);
            });
          }

          return workstationNames.length ? workstationNames.join(',') : replaceSign;
        },
      },
      {
        title: '生产描述',
        width: 250,
        dataIndex: 'productDesc',
        key: 'productDesc',
        render: productDesc => productDesc || replaceSign,
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 200,
        render: record => {
          const { code, status } = record;

          return (
            <div>
              <LinkToProcessDetail code={code} />
              <LinkToEditProcess code={code} />
              <UpdateStatus
                code={code}
                statusNow={status}
                fetchData={this.props.fetchData}
                beforeClick={() => handleLoading(true)}
                finallyCallback={() => handleLoading(false)}
              />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { data, total, pagination, fetchData, loading, tableUniqueKey } = this.props;
    const columns = this.getTableColumns();

    return (
      <Table
        tableUniqueKey={tableUniqueKey}
        useColumnConfig
        dragable
        refetch={fetchData}
        bordered
        dataSource={data}
        total={total}
        pagination={pagination}
        columns={columns}
        rowKey={record => record.id}
        loading={loading}
      />
    );
  }
}

export default ProcessTable;
