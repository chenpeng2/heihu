import React from 'react';
import { exportWorkstationLog } from 'services/knowledgeBase/workstation';
import { format } from 'utils/time';
import SearchTableLayout from 'layouts/SearchTableLayout';

class ExportLog extends React.PureComponent {
  state = {};

  getColumns = () => {
    return [
      { title: '导出时间', dataIndex: 'createdAt', key: 'createdAt', render: time => format(time) },
      { title: '导出用户', dataIndex: 'userName', key: 'userName' },
    ];
  };
  render() {
    return (
      <SearchTableLayout
        fetchData={exportWorkstationLog}
        tableProps={{ columns: this.getColumns() }}
        rowKey="id"
        {...this.props}
      />
    );
  }
}

export default ExportLog;
