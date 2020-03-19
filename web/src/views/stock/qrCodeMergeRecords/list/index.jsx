import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin } from 'src/components';
import { getQrCodeMergeRecords } from 'src/services/stock/qrCodeMerge';
import useFetch from 'src/utils/hookUtils/fetchHooks';
import { getParams, setLocation } from 'src/utils/url';

import Filter, { formatFilterFormValue } from './Filter';
import Table from './Table';

const List = props => {
  const [pagination, setPagination] = useState({ total: 0, pageSize: 10, current: 1 });
  const [{ data, isLoading }, setParams] = useFetch(getQrCodeMergeRecords);
  const { data: tableData, total } = _.get(data, 'data') || {};

  useEffect(() => {
    setPagination({ total: total || 0, pageSize: 10, current: 1 });
  }, [total]);

  const fetchData = value => {
    const { filter, ...rest } = value || {};
    const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj') || {};

    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = { size: 10, page: 1, ...lastRest, ...formatFilterFormValue(nextFilter), ...rest };

    setLocation(props, { size: 10, page: 1, ...lastRest, filter: nextFilter, ...rest });

    setPagination({ total, pageSize: nextQuery.size, current: nextQuery.page });
    setParams(nextQuery);
  };

  return (
    <Spin spinning={isLoading}>
      <div>
        <Filter refetch={fetchData} />
        <Table pagination={pagination} refetch={fetchData} tableData={tableData} style={{ marginTop: 20 }} />
      </div>
    </Spin>
  );
};

List.propTypes = {
  style: PropTypes.any,
};

export default List;
