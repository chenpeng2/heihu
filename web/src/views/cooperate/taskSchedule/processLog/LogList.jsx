import React from 'react';
import _ from 'lodash';
import { getScheduleLogs } from 'services/schedule';
import ListBase from '../logBase/listBase';

const LogList = props => {
  return (
    <ListBase
      actionName="排程"
      {...props}
      getColumns={columns => {
        const _columns = _.cloneDeep(columns);
        _columns.splice(2, 0, {
          title: '排程类型',
          dataIndex: 'type',
        });
        return _columns;
      }}
      fetchData={params => getScheduleLogs({ ...params, type: 0 })}
    />
  );
};

export default LogList;
