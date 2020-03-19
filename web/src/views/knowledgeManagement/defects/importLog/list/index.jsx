import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin } from 'src/components';
import useFetch from 'src/utils/hookUtils/fetchHooks';
import { importDefectsLog } from 'src/services/knowledgeBase/defect';

import Table from './logListTable';
import Filter from './filter';

const ImportLogList = props => {
  const [{ data, isLoading }, setParams] = useFetch(params => importDefectsLog({ size: 10, page: 1, ...params })) || {};
  const { data: tableData, page, size, count: total } = _.get(data, 'data') || {};

  return (
    <Spin spinning={isLoading}>
      <div>
        <Filter style={{ margin: 20 }} refetch={setParams} />
        <Table tableData={tableData} pagination={{ current: page, total, pageSize: size }} refetch={setParams} />
      </div>
    </Spin>
  );
};

ImportLogList.propTypes = {
  style: PropTypes.any,
};

export default ImportLogList;
