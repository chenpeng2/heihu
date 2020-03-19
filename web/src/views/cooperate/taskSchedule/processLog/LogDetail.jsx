import React from 'react';
import { getScheduleLogDetail } from 'services/schedule';
import _ from 'lodash';
import { replaceSign } from 'constants';
import DetailBase from '../logBase/detailBase';

const LogDetail = props => {
  return (
    <DetailBase
      {...props}
      fetchData={getScheduleLogDetail}
      title={'排程日志详情'}
      actionName={'排程'}
      getColumns={columns => {
        const _columns = _.cloneDeep(columns);
        _columns.splice(
          3,
          0,
          {
            title: '工序',
            dataIndex: 'processCode',
            render: (processCode, { processSeq, processName }) =>
              `${processSeq || replaceSign}/${processCode || replaceSign}/${processName || replaceSign}`,
          },
          { title: '排程数量', dataIndex: 'amount' },
        );
        return _columns;
      }}
    />
  );
};

export default LogDetail;
