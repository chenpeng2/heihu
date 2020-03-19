import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Table as BasicTable, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';

const getColumns = () => {
  return [
    {
      title: '行序列',
      dataIndex: 'seq',
      width: 60,
      render: data => data || replaceSign,
    },
    {
      title: '物料名称/编号',
      key: 'material',
      width: 260,
      render: (__, record) => {
        const { materialCode, materialName } = record || {};
        return <span>{`${materialName || replaceSign} / ${materialCode || replaceSign}`}</span>;
      },
    },
    {
      title: '规格描述',
      width: 150,
      dataIndex: 'remark',
      render: data => data || replaceSign,
    },
    {
      title: '嵌套数',
      dataIndex: 'amount',
      width: 150,
      render: data => typeof data === 'number' ? data : replaceSign,
    },
    {
      title: '单位',
      dataIndex: 'unitName',
      width: 150,
      render: data => data || replaceSign,
    },
  ];
};

const Table = props => {
  const { tableData, ...rest } = props;
  return <BasicTable dragable {...rest} pagination={false} columns={getColumns()} dataSource={tableData} />;
};

Table.propTypes = {
  style: PropTypes.any,
  tableData: PropTypes.any,
};

export default Table;
