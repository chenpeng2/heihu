import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Badge, Tooltip, RestPagingTable } from 'src/components';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';

import { findDeliveryRequestType } from '../util';
import MaterialPopover from './materialsPopover';
import UpdateStatus from '../baseComponent/updateStatus';

class Table extends Component {
  state = {};

  getColumns = () => {
    const { refetch } = this.props;
    const { changeChineseToLocale } = this.context;

    return [
      {
        title: '发运申请编号',
        dataIndex: 'code',
        render: (data, record) => {
          if (!data) return <span>{replaceSign}</span>;
          return <MaterialPopover data={record} code={data} />;
        },
      },
      {
        title: '发出仓库',
        key: 'storage',
        render: (__, record) => {
          const { storageName } = record || {};
          if (!storageName) return <span>{replaceSign}</span>;
          return <Tooltip text={storageName} length={15} />;
        },
      },
      {
        title: '创建人',
        dataIndex: 'operatorName',
        render: data => {
          return <Tooltip text={data} length={15} />;
        },
      },
      {
        title: '需求时间',
        dataIndex: 'requireTime',
        render: data => {
          if (!data) return <span>{replaceSign}</span>;
          const _data = moment(data).format('YYYY/MM/DD HH:mm');
          return <Tooltip text={_data} length={15} />;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: data => {
          if (!data) return <span>{replaceSign}</span>;
          const _data = moment(data).format('YYYY/MM/DD HH:mm');
          return <Tooltip text={_data} length={15} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: data => {
          const { name, color } = findDeliveryRequestType(data) || {};
          if (!name) return <span>{replaceSign}</span>;
          return <Badge.MyBadge color={color} text={changeChineseToLocale(name)} />;
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (__, record) => {
          return (
            <div>
              <UpdateStatus data={record} cbForUpdate={refetch} />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { style, data, total, refetch } = this.props;

    const columns = this.getColumns();

    return (
      <div style={style}>
        <RestPagingTable
          scroll={{ x: 1200 }}
          style={{ margin: 0 }}
          columns={columns}
          dataSource={data}
          total={total}
          refetch={refetch}
        />
      </div>
    );
  }
}

Table.propTypes = {
  style: PropTypes.object,
  data: PropTypes.array,
  total: PropTypes.number,
  refetch: PropTypes.func,
};

Table.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default Table;
