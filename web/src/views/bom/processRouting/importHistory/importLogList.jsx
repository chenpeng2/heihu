import React from 'react';
import { Link, Badge, FormattedMessage } from 'components';
import { importProcessRoutingLog } from 'src/services/bom/processRouting';
import SearchTableLayout from 'layouts/SearchTableLayout';
import { format } from 'utils/time';

import { getImportDetailPageUrl } from '../utils';

class ImportLog extends React.PureComponent<any> {
  state = {
    dataSource: [],
  };

  getColumns = () => {
    return [
      { title: '导入时间', dataIndex: 'createdAt', key: 'createdAt', render: time => format(time) },
      { title: '导入用户', dataIndex: 'userName', key: 'userName' },
      {
        title: '导入结果',
        dataIndex: 'successAmount',
        key: 'result',
        render: (successAmount, { failureAmount }) => {
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
        dataIndex: 'successAmount',
        key: 'detail',
        render: (successAmount, { failureAmount }) => (
          <FormattedMessage
            values={{ successAmount, failureAmount }}
            defaultMessage={'工艺路线导入完成！成功数：{successAmount}，失败数：{failureAmount}'}
          />
        ),
      },
      {
        title: '操作',
        key: 'operation',
        dataIndex: 'importId',
        render: importId => <Link to={getImportDetailPageUrl(importId)}>查看</Link>,
      },
    ];
  };

  render() {
    return (
      <SearchTableLayout
        formatParams={params => {
          const { createdAtFromTill, createdAtFromAt, ...rest } = params || {};
          return { ...rest, fromAt: createdAtFromAt, toAt: createdAtFromTill };
        }}
        tableProps={{ columns: this.getColumns() }}
        fetchData={importProcessRoutingLog}
        {...this.props}
      />
    );
  }
}

export default ImportLog;
