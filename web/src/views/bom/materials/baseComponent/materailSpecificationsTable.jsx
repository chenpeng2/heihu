import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { RestPagingTable } from 'src/components';
import { replaceSign } from 'src/constants';
import { getFractionString } from 'src/utils/number';

class MaterailSpecificationsTable extends Component {
  state = {};

  getColumns = () => {
    return [
      {
        title: '数量',
        key: 'amount',
        render: (__, record) => {
          return <div>{getFractionString(record) || replaceSign}</div>;
        },
      },
      {
        title: '单位',
        dataIndex: 'unitName',
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

MaterailSpecificationsTable.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
};

export default MaterailSpecificationsTable;
