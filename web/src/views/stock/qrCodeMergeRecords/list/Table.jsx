import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { replaceSign } from 'src/constants';
import { Table as BasicTable, Link } from 'src/components';
import moment from 'src/utils/time';
import { Big, isNumber } from 'src/utils/number';

import { getQrCodeDetailPageUrl, getQrCodeMergeRecordDetailPageUrl, isQrCodeMergeUseESign } from '../utils';

const getColumns = options => {
  const { useESign } = options || {};
  return [
    {
      title: '合并位置',
      key: 'location',
      width: 200,
      render: (__, record) => {
        const { storageName, storageCode } = record || {};
        if (storageCode && storageName) {
          return `${storageName} / ${storageCode}`;
        }
        return replaceSign;
      },
    },
    {
      title: '物料',
      key: 'material',
      width: 200,
      render: (__, record) => {
        const { materialCode, materialName } = record || {};
        return materialCode && materialName ? `${materialName} / ${materialCode}` : replaceSign;
      },
    },
    {
      title: '规格描述',
      width: 200,
      dataIndex: 'materialDesc',
      render: data => {
        return data || replaceSign;
      },
    },
    {
      title: '合并二维码',
      width: 100,
      dataIndex: 'targetMaterialLotCode',
      render: (data, record) => {
        if (!data) return replaceSign;

        const { targetMaterialLotId } = record || {};
        return <Link to={getQrCodeDetailPageUrl(targetMaterialLotId)}>{data}</Link>;
      },
    },
    {
      title: '原数量',
      key: 'oldAmount',
      width: 100,
      render: (__, record) => {
        const { amountChanged, amountRemain, opeUnitName } = record || {};
        const oldAmount =
          isNumber(amountRemain) && isNumber(amountChanged)
            ? Big(amountRemain)
                .minus(amountChanged)
                .valueOf()
            : null;
        if (isNumber(oldAmount) && opeUnitName) {
          return `${oldAmount} ${opeUnitName}`;
        }
        return replaceSign;
      },
    },
    {
      title: '合并后数量',
      dataIndex: 'amountRemain',
      width: 100,
      render: (data, record) => {
        const { opeUnitName } = record || {};
        if (typeof data === 'number' && opeUnitName) {
          return `${data} ${opeUnitName}`;
        }
        return replaceSign;
      },
    },
    {
      title: '操作人',
      width: 100,
      dataIndex: 'operatorName',
      render: data => data || replaceSign,
    },
    useESign && {
      title: '电子签名人',
      width: 100,
      dataIndex: 'signatureUserName',
      render: data => data || replaceSign,
    },
    {
      title: '操作时间',
      width: 200,
      dataIndex: 'createAt',
      render: data => (data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : replaceSign),
    },
    {
      title: '操作',
      key: 'operation',
      width: 150,
      render: (__, record) => {
        const { id } = record || {};

        return <Link to={getQrCodeMergeRecordDetailPageUrl(id)}>查看</Link>;
      },
    },
  ].filter(i => i);
};

const Table = props => {
  const [useESign, setUseESign] = useState(false);
  const { tableData, pagination, refetch, style } = props || {};
  const columns = getColumns({ useESign });

  useEffect(() => {
    isQrCodeMergeUseESign().then(res => setUseESign(res));
  }, []);

  return (
    <BasicTable
      dragable
      style={style}
      refetch={refetch}
      columns={columns}
      dataSource={tableData || []}
      pagination={pagination || { currentPage: 1, pageSize: 10, total: 0 }}
    />
  );
};

Table.propTypes = {
  style: PropTypes.any,
  tableData: PropTypes.any,
  pagination: PropTypes.any,
  refetch: PropTypes.any,
};

export default Table;
