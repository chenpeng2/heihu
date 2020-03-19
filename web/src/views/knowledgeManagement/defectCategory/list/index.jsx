import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { buttonAuthorityWrapper, Spin, Button, openModal } from 'src/components';
import { border } from 'src/styles/color';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';
import { getDefectCategoryList } from 'src/services/knowledgeBase/defect';
import { getParams, setLocation } from 'src/utils/url';
import auth from 'src/utils/auth';

import Filter, { formatFilterFormValue } from './filter';
import Table from './table';
import Create from '../create';

const ButtonWithAuth = buttonAuthorityWrapper(Button);
const tableUniqueKey = 'defectCategory-list-table';

const DefectCategoryList = props => {
  let filterRef;

  const { filter } = _.get(getParams(), 'queryObj') || {};
  const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
  // 页面第一次渲染的时候需要将url中的filter值设置进Filter中
  useEffect(() => {
    if (filterRef) {
      const setFieldsValue = _.get(filterRef, 'props.form.setFieldsValue');
      if (typeof setFieldsValue === 'function') setFieldsValue(filter);
    }
  }, []);

  const [{ data, isLoading }, setParams] = useFetch(getDefectCategoryList, {
    initialParams: { ...(formatFilterFormValue(filter) || {}), size: pageSize, page: 1 },
  });
  const { data: tableData, count: total, page, size } = _.get(data, 'data') || {};

  // 数据拉取
  const fetchData = params => {
    const { filter, ...rest } = params || {};
    const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj');

    const nextFilter = { ...lastFilter, ...filter };
    const nextParams = { size: pageSize, page: 1, ...lastRest, ...formatFilterFormValue(nextFilter), ...rest };

    setLocation(props, { size: pageSize, page: 1, ...lastRest, filter: nextFilter, ...rest });
    setParams(nextParams);
  };

  return (
    <Spin spinning={isLoading}>
      <Filter wrappedComponentRef={inst => (filterRef = inst)} refetch={fetchData} />
      <div style={{ borderTop: `1px solid ${border}`, padding: '10px 20px' }}>
        <ButtonWithAuth
          auth={auth.WEB_DEFECT_GROUP_CREATE}
          onClick={() => {
            openModal({
              title: '创建次品分类',
              children: (
                <Create
                  cbForSuccess={() => {
                    fetchData();
                  }}
                />
              ),
              footer: null,
            });
          }}
          icon={'plus-circle-o'}
        >
          创建次品分类
        </ButtonWithAuth>
      </div>
      <Table
        tableUniqueKey={tableUniqueKey}
        refetch={fetchData}
        tableData={tableData}
        pagination={{ current: page, total, pageSize: size }}
      />
    </Spin>
  );
};

export default DefectCategoryList;
