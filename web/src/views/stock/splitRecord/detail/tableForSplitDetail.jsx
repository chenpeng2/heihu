import React, { Component } from 'react';
import PropTypes from 'prop-types';

import BasicTable from 'src/components/table/basicTable';
import { replaceSign } from 'src/constants';

class TableForSplitRecord extends Component {
  state = {};

  getColumns = () => {
    return [
      {
        title: '序号',
        width: 150,
        key: 'seq',
        render: (__, ___, index) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: '拆分后二维码',
        dataIndex: 'code',
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '数量',
        dataIndex: 'amount',
        width: 150,
        render: (data, record) => {
          const { unitName } = record || {};
          const text = `${typeof data === 'number' && data} ${unitName || replaceSign}`;
          return <span>{text}</span>;
        },
      },
    ];
  };

  render() {
    const { tableData = [] } = this.props;
    return (
      <div>
        <BasicTable
          style={{ margin: 0, minWidth: 800 }}
          dataSource={tableData}
          columns={this.getColumns()}
          pagination={false}
        />
      </div>
    );
  }
}

TableForSplitRecord.propTypes = {
  style: PropTypes.object,
  tableData: PropTypes.any,
};

export default TableForSplitRecord;
