import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { RestPagingTable } from 'src/components';
import { replaceSign } from 'src/constants';

class CustomFieldsTable extends Component {
  state = {};

  getColumns = () => {
    return [
      {
        title: '字段名',
        dataIndex: 'keyName',
        render: data => {
          return <div>{data || replaceSign}</div>;
        },
      },
      {
        title: '字段值',
        dataIndex: 'keyValue',
        render: data => {
          return <div>{data || replaceSign}</div>;
        },
      },
    ];
  };

  render() {
    const { data } = this.props;

    return (
      <div>
        <RestPagingTable
          style={{ margin: 0, width: 500 }}
          dataSource={data}
          columns={this.getColumns()}
          pagination={false}
        />
      </div>
    );
  }
}

CustomFieldsTable.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
};

export default CustomFieldsTable;
