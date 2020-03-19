import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Link, Badge, Table, Spin, FormattedMessage } from 'src/components/index';
import useFetch from 'src/utils/hookUtils/fetchHooks';
import { importDefectsLog } from 'src/services/knowledgeBase/defect';
import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';

import { getImportLogDetailUrl } from '../../constants';

const getColumns = context => {
  return [
    {
      title: '导入时间',
      dataIndex: 'createdAt',
      width: 150,
      render: data => (data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : replaceSign),
    },
    {
      title: '导入用户',
      dataIndex: 'userName',
      width: 150,
      render: data => data || replaceSign,
    },
    {
      title: '导入结果',
      width: 200,
      key: 'result',
      render: (__, record) => {
        const { failureAmount, successAmount } = record || {};
        if (failureAmount === 0) {
          return <Badge status="success" text="导入成功" />;
        } else if (successAmount === 0) {
          return <Badge status="error" text="导入失败" />;
        }
        return <Badge status="warning" text="部分导入成功" />;
      },
    },
    {
      title: '导入详情',
      key: 'resultDetail',
      width: 200,
      render: (__, record) => {
        const { failureAmount, successAmount } = record || {};
        return (
          <div>
            <FormattedMessage
              defaultMessage={'成功数:{amount1},失败数{amount2}'}
              values={{ amount1: successAmount, amount2: failureAmount }}
            />
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'importId',
      width: 120,
      render: text => (
        <div>
          <Link
            onClick={() => {
              if (context) context.router.history.push(getImportLogDetailUrl(text));
            }}
          >
            查看
          </Link>
        </div>
      ),
    },
  ];
};

const LogListTable = (props, context) => {
  const { refetch, tableData, pagination } = props;
  return <Table columns={getColumns(context)} dataSource={tableData} pagination={pagination} refetch={refetch} />;
};

LogListTable.propTypes = {
  style: PropTypes.any,
  refetch: PropTypes.any,
  tableData: PropTypes.any,
  pagination: PropTypes.any,
};

LogListTable.contextTypes = {
  router: PropTypes.any,
};

export default LogListTable;
