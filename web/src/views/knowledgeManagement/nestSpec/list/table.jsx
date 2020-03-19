import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Badge, Table as BasicTable, Link } from 'src/components';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';

import { NEST_SPEC_STATUS, findNestSpecStatus, getEditNestSpecPageUrl, getNestSpecDetailPageUrl } from '../utils';
import UpdateStatus from '../baseComponent/updateStatus';
import Tooltip from '../../../../components/tooltip';

const getColumns = props => {
  const { refetch } = props || {};
  return [
    {
      title: '编号',
      dataIndex: 'packCode',
      width: 150,
      render: data => data || replaceSign,
    },
    {
      title: '名称',
      dataIndex: 'packName',
      width: 150,
      render: data => data || replaceSign,
    },
    {
      title: '物料名称/物料编号',
      dataIndex: 'materials',
      width: 200,
      render: data => {
        const texts = arrayIsEmpty(data)
          ? []
          : data.map(i => {
              const { materialCode, materialName } = i || {};

              return `${materialName || replaceSign}/${materialCode || replaceSign}`;
            });

        return arrayIsEmpty(texts) ? replaceSign : texts.join(',');
      },
    },
    {
      title: '备注',
      dataIndex: 'memo',
      width: 200,
      render: data => data || replaceSign,
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 150,
      render: data => {
        const { name, color } = findNestSpecStatus(data) || {};
        if (!name) return replaceSign;
        return <Badge.MyBadge text={name} color={color} />;
      },
    },
    {
      title: '操作',
      key: 'operation',
      width: 150,
      render: (__, record) => {
        const { packCode, state } = record || {};
        return (
          <div>
            <Link to={getNestSpecDetailPageUrl(packCode)}>查看</Link>
            <Link
              disabled={state === NEST_SPEC_STATUS.use.value}
              style={{ marginLeft: 5 }}
              to={getEditNestSpecPageUrl(packCode)}
            >
              编辑
            </Link>
            <UpdateStatus cbForUpdateSuccess={refetch} style={{ marginLeft: 5 }} stateNow={state} id={packCode} />
          </div>
        );
      },
    },
  ];
};

const Table = props => {
  const { tableData, refetch, pagination } = props;
  return (
    <BasicTable dragable pagination={pagination} refetch={refetch} dataSource={tableData} columns={getColumns(props)} />
  );
};

Table.propTypes = {
  style: PropTypes.any,
  tableData: PropTypes.any,
  refetch: PropTypes.any,
  pagination: PropTypes.any,
};

export default Table;
