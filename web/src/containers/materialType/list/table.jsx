import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Table, Badge } from 'src/components';
import { replaceSign } from 'src/constants';

import LinkToMaterialTypeDetail from '../baseComponent/linkToMaterialTypeDetail';
import LinkToMaterialTypeEdit from '../baseComponent/linkToMaterialTypeEdit';
import UpdateMaterialTypeStatus from '../baseComponent/updateMaterialTypeStatus';

import { findMaterialType } from '../utils';

const MyBadge = Badge.MyBadge;

class MaterialTypeTable extends Component {
  state = {};

  getColumns = () => {
    return [
      {
        title: '编号',
        width: 250,
        dataIndex: 'code',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '名称',
        width: 250,
        dataIndex: 'name',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '状态',
        width: 150,
        dataIndex: 'status',
        render: data => {
          const { name, color } = findMaterialType(data) || {};
          return <MyBadge text={name} color={color} />;
        },
      },
      {
        title: '默认工艺路线',
        dataIndex: 'processRoutingCode',
        width: 350,
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '操作',
        width: 150,
        key: 'operation',
        render: (__, record) => {
          const { id, status } = record;
          const { fetchData } = this.props;
          return (
            <div>
              <LinkToMaterialTypeDetail id={id} />
              <LinkToMaterialTypeEdit id={id} style={{ marginLeft: 10 }} />
              <UpdateMaterialTypeStatus cbForUpdate={fetchData} statusNow={status} id={id} style={{ marginLeft: 10 }} />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { data, fetchData, total, pagination, tableUniqueKey } = this.props;
    const columns = this.getColumns();

    return (
      <div>
        <Table
          tableUniqueKey={tableUniqueKey}
          useColumnConfig
          dragable
          style={{ margin: 0 }}
          total={total || 0}
          columns={columns}
          dataSource={data || []}
          pagination={pagination}
          refetch={fetchData}
        />
      </div>
    );
  }
}

MaterialTypeTable.propTypes = {
  style: PropTypes.object,
  fetchData: PropTypes.func,
  data: PropTypes.any,
  total: PropTypes.number,
};

export default MaterialTypeTable;
