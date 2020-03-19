import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, Spin, OpenImportModal } from 'src/components';
import { border } from 'src/styles/color';
import { getNestSpecs, importNestSpec } from 'src/services/nestSpec';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';
import { getParams, setLocation } from 'src/utils/url';

import Filter, { formatFilterFormValue } from './filter';
import Table from './table';
import { getCreateNestSpecPageUrl } from '../utils';

const List = (props, context) => {
  const [{ data, isLoading }, setParams] =
    useFetch(getNestSpecs, {
      initialParams: { size: 10, page: 1 },
    }) || {};

  const { data: tableData, page, count, size } = _.get(data, 'data') || {};
  const pagination = { current: page, total: count, pageSize: size };

  const fetchData = value => {
    const { filter, ...rest } = value || {};
    const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj');

    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = { size: 10, page: 1, ...lastRest, ...formatFilterFormValue(nextFilter), ...rest };

    setLocation(props, { size: 10, page: 1, ...lastRest, filter: nextFilter, ...rest });

    setParams(nextQuery);
  };

  return (
    <Spin spinning={isLoading}>
      <div>
        <Filter refetch={fetchData} />
        <div style={{ padding: '20px 20px 20px', borderTop: `1px solid ${border}` }}>
          <Button
            onClick={() => {
              if (context) context.router.history.push(getCreateNestSpecPageUrl());
            }}
            icon={'plus-circle-o'}
          >
            创建嵌套规格
          </Button>
          <Button
            icon="download"
            ghost
            style={{ marginLeft: 10 }}
            onClick={() => {
              OpenImportModal({
                item: '嵌套规格',
                fileTypes: '.xlsx',
                titles: ['packCode', 'packName', 'seq', 'materialCode', 'amount', 'unitName', 'remark'],
                listName: 'items',
                templateUrl:
                  'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190903/%E5%B5%8C%E5%A5%97%E8%A7%84%E6%A0%BC%E5%AF%BC%E5%85%A5.xlsx',
                method: importNestSpec,
                splitKey: ['packName'],
                context,
                onSuccess: () => {
                  if (typeof fetchData === 'function') fetchData();
                },
              });
            }}
          >
            导入
          </Button>
        </div>
        <Table pagination={pagination} refetch={fetchData} tableData={tableData} />
      </div>
    </Spin>
  );
};

List.propTypes = {
  style: PropTypes.any,
};

List.contextTypes = {
  router: PropTypes.any,
};

export default List;
