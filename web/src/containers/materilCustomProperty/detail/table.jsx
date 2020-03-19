import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RestPagingTable } from 'components';
import { replaceSign } from 'constants';

type Props = {
  columns: any,
};

class Table extends Component {
  state = {};
  props: Props;

  getColumns = () => {
    return [
      {
        title: '字段名称',
        dataIndex: 'keyName',
        width: 250,
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
      {
        title: '最大字符数',
        dataIndex: 'length',
        width: 150,
        render: data => {
          return <span>{data || replaceSign}</span>;
        },
      },
    ];
  };

  render() {
    const { data, columns } = this.props;
    const tableColumns = Array.isArray(columns) ? columns : this.getColumns();
    return (
      <RestPagingTable columns={tableColumns} dataSource={data || []} pagination={false} style={{ width: 500 }} />
    );
  }
}

Table.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
};

export default Table;
