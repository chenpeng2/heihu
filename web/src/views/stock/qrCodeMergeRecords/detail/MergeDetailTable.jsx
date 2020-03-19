import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { replaceSign } from 'src/constants';
import { isNumber } from 'src/utils/number';

import { Table, Link } from 'src/components';

import { getQrCodeDetailPageUrl } from '../utils';

const getColumns = params => {
  const { unitName } = params || {};
  return [
    {
      title: '序列',
      key: 'seq',
      render: (__, ___, index) => index + 1,
    },
    {
      title: '合并来源',
      dataIndex: 'code',
      render: (data, record) => {
        const { materialLotId } = record || {};
        if (!data) return replaceSign;

        return <Link to={getQrCodeDetailPageUrl(materialLotId)}>{data}</Link>;
      },
    },
    {
      title: '合并数量',
      dataIndex: 'amountChanged',
      render: data => {
        return isNumber(data) ? `${data} ${unitName || replaceSign}` : replaceSign;
      },
    },
  ];
};

const MergeDetailTable = props => {
  const { detailData } = props;
  const { sourceMaterialLots, opeUnitName } = detailData || {};
  const columns = getColumns({ unitName: opeUnitName });

  return (
    <Table
      dataSource={sourceMaterialLots || []}
      pagination={false}
      columns={columns}
      style={{ width: 500, margin: 0 }}
    />
  );
};

MergeDetailTable.propTypes = {
  detailData: PropTypes.any,
};

export default MergeDetailTable;
