import React from 'react';
import PropTypes from 'prop-types';

import { Attachment, Badge, Table as BasicTable } from 'src/components';
import { replaceSign } from 'src/constants';
import { findQualityStatus } from 'src/views/qualityManagement/constants';
import { arrayIsEmpty } from 'src/utils/array';
import moment from 'src/utils/time';

import { getWithdrawOriginal, getCreateTime } from '../utils';

const getColumns = () => {
  return [
    {
      title: '二维码',
      width: 100,
      dataIndex: 'qrCode',
      showAlways: 'true',
      render: data => data || replaceSign,
    },
    {
      title: '物料',
      width: 160,
      key: 'material',
      showAlways: 'true',
      render: (__, record) => {
        const { materialCode, materialName } = record || {};
        return `${materialCode || replaceSign} / ${materialName || replaceSign}`;
      },
    },
    {
      title: '数量',
      width: 100,
      showAlways: 'true',
      dataIndex: 'amount',
      render: (data, record) => {
        const { unit } = record;
        return `${typeof data === 'number' ? data : replaceSign} ${unit || replaceSign}`;
      },
    },
    {
      title: '退料仓位',
      width: 150,
      key: 'storage',
      showAlways: 'true',
      render: (__, record) => {
        const { storageCode, storageName } = record || {};
        return `${storageCode || replaceSign} / ${storageName || replaceSign}`;
      },
    },
    {
      title: '供应商',
      width: 100,
      key: 'supply',
      render: (__, record) => {
        const { supplierCode, supplierName } = record || {};
        return `${supplierCode || replaceSign} / ${supplierName || replaceSign}`;
      },
    },
    {
      title: '供应商批次',
      width: 150,
      dataIndex: 'mfgBatches',
      render: data => {
        return arrayIsEmpty(data)
          ? replaceSign
          : data
              .map(i => {
                const { mfgBatchNo } = i || {};
                return mfgBatchNo;
              })
              .filter(i => i)
              .join(',');
      },
    },
    {
      title: '入厂批次',
      width: 100,
      dataIndex: 'inboundBatch',
      render: data => data || replaceSign,
    },
    {
      title: '质量状态',
      width: 100,
      dataIndex: 'qcStatus',
      render: data => {
        const { name, color } = findQualityStatus(data) || {};
        return name ? <Badge.MyBadge text={name} color={color} /> : replaceSign;
      },
    },
    {
      title: '退料对象',
      width: 100,
      key: 'withdrawOriginal',
      render: (__, record) => {
        return getWithdrawOriginal(record) || replaceSign;
      },
    },
    {
      title: '操作人',
      width: 100,
      dataIndex: 'operatorName',
      showAlways: 'true',
      render: data => data || replaceSign,
    },
    {
      title: '操作时间',
      width: 150,
      dataIndex: 'createdAt',
      showAlways: 'true',
      render: data => (data ? getCreateTime(data) : replaceSign),
    },
    {
      title: '备注',
      width: 100,
      dataIndex: 'remark',
      render: data => data || replaceSign,
    },
    {
      title: '附件',
      showAlways: 'true',
      width: 100,
      dataIndex: 'attachments',
      render: data => {
        return <Attachment.IconViews fileIds={data} />;
      },
    },
  ];
};

const Table = props => {
  const { tableData, pagination, refetch, ...rest } = props;

  return (
    <div>
      <BasicTable
        useColumnConfig
        tableUniqueKey={'withdrawRecordColumnConfig'}
        pagination={pagination}
        refetch={refetch}
        dragable
        dataSource={tableData || []}
        columns={getColumns()}
        {...rest}
      />
    </div>
  );
};

Table.propTypes = {
  tableData: PropTypes.any,
  refetch: PropTypes.any,
  pagination: PropTypes.any,
  rowSelection: PropTypes.any,
};

export default Table;
