import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Table, FormattedMessage } from 'src/components';
import { replaceSign } from 'src/constants';
import { Big } from 'src/utils/number';
import { arrayIsEmpty } from 'src/utils/array';
import moment from 'src/utils/time';

import { findAdjustName, ADJUST_ITEM_NAME } from '../utils';

const getColumns = data => {
  const { unitName } = data || {};
  return [
    {
      title: '字段值',
      dataIndex: 'name',
      render: data => {
        const { name } = findAdjustName(data) || {};
        if (!name) return replaceSign;
        return <FormattedMessage defaultMessage={name} />;
      },
    },
    {
      title: '调整前',
      dataIndex: 'old_value',
      render: (data, record) => {
        const { name } = record || {};
        if (name === ADJUST_ITEM_NAME.amount.value) {
          return data ? `${parseFloat(data)} ${unitName || replaceSign}` : replaceSign;
        }
        if (name === ADJUST_ITEM_NAME.mfgBatches.value) {
          return arrayIsEmpty(data) ? replaceSign : data.map(i => i && i.mfgBatchNo).join(',');
        }
        if (name === ADJUST_ITEM_NAME.validityPeriod.value || name === ADJUST_ITEM_NAME.productionDate.value) {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        }

        return data || replaceSign;
      },
    },
    {
      title: '调整后',
      dataIndex: 'new_value',
      render: (data, record) => {
        const { name, new_value, old_value } = record || {};
        if (name === ADJUST_ITEM_NAME.amount.value) {
          return data
            ? `${parseFloat(data)} ${unitName || replaceSign} (${Big(new_value).minus(old_value)} ${unitName ||
                replaceSign})`
            : replaceSign;
        }
        if (name === ADJUST_ITEM_NAME.mfgBatches.value) {
          return arrayIsEmpty(data) ? replaceSign : data.map(i => i && i.mfgBatchNo).join(',');
        }
        if (name === ADJUST_ITEM_NAME.validityPeriod.value || name === ADJUST_ITEM_NAME.productionDate.value) {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        }

        return data || replaceSign;
      },
    },
  ];
};

const AdjustDetailTable = props => {
  const { detailData, unitName, style } = props;

  return (
    <Table
      dataSource={detailData}
      style={{ margin: 0, minWidth: 500, ...style }}
      pagination={false}
      columns={getColumns({ unitName })}
    />
  );
};

AdjustDetailTable.propTypes = {
  style: PropTypes.any,
  unitName: PropTypes.any,
};

export default AdjustDetailTable;
