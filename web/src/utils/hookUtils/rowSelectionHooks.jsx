import React, { useState, useEffect } from 'react';
import _ from 'lodash';

const useRowSelectionHooks = ({ rowSelectionOptions }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState({});

  const { onChange, onSelectAll, ...rest } = rowSelectionOptions || {};

  const rowSelections = {
    ...rest,
    selectedRowKeys,
    onChange: selectedRowKeys => {
      if (typeof onChange === 'function') onChange(selectedRowKeys);
      setSelectedRowKeys(selectedRowKeys);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (typeof onSelectAll === 'function') onSelectAll(selected, selectedRows, changeRows);
      setSelectedRowKeys({ selectedRowKeys: _.pullAllBy(selectedRowKeys, changeRows, 'key') });
    },
  };

  return [{ rowSelections, selectedRowKeys }, setSelectedRowKeys];
};

export default useRowSelectionHooks;
