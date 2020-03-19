import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Table } from 'src/components';
import { replaceSign } from 'src/constants';
import { formatUnix } from 'src/utils/time';

const getColumns = () => {
  return [
    {
      title: '行序列',
      key: 'seq',
      width: 60,
      render: (__, ___, index) => index + 1,
    },
    {
      title: '文件名称',
      dataIndex: 'fileName',
      width: 160,
      render: data => data || replaceSign,
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      width: 160,
      render: (__, record) => {
        const { createdAt, updatedAt } = record || {};
        // 第一次上传的时候更新时间是创建时间
        if (updatedAt) return formatUnix(updatedAt);
        if (createdAt) return formatUnix(createdAt);
        return replaceSign;
      },
    },
    {
      title: '更新人',
      width: 160,
      dataIndex: 'operatorName',
      render: data => data || replaceSign,
    },
    {
      width: 100,
      title: '默认模板',
      dataIndex: 'defaulted',
      render: data => (data ? '是' : '否'),
    },
  ];
};

const FileTable = props => {
  const { tableData, style, ...rest } = props;
  return (
    <Table
      scroll={{ y: 210, x: true }}
      style={{ margin: 0, maxWidth: 800, ...style }}
      pagination={false}
      columns={getColumns()}
      dataSource={tableData}
      {...rest}
    />
  );
};

FileTable.propTypes = {
  style: PropTypes.any,
  tableData: PropTypes.any,
};

export default FileTable;
