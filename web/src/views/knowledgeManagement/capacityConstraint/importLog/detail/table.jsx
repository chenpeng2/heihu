import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Table as BasicTable } from 'src/components';
import { replaceSign } from 'src/constants';

const getColumns = () => {
  return [
    {
      title: '失败原因',
      dataIndex: 'reason',
      width: 250,
      render: text => text || replaceSign,
    },
    {
      title: '次品项名称',
      dataIndex: 'defectName',
      render: text => text || replaceSign,
      width: 150,
    },
    {
      title: '次品分类名称',
      dataIndex: 'defectGroupName',
      render: text => text || replaceSign,
      width: 150,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      render: text => text || replaceSign,
      width: 150,
    },
  ];
};

const Table = props => {
  const { tableData, style } = props;
  return (
    <div style={style}>
      <BasicTable dataSource={tableData} pagination={false} columns={getColumns()} />
    </div>
  );
};

Table.propTypes = {
  style: PropTypes.any,
  tableData: PropTypes.any,
};

export default Table;
