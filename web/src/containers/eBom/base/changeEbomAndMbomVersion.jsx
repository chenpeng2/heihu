import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withForm, FormItem, RestPagingTable, Button } from 'src/components';
import { replaceSign } from 'src/constants';

class ChangeEbomAndMbomVersion extends Component {
  state = {};

  getColumns = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return [
      {
        title: '类型',
        key: 'type',
        render: (__, index) => {
          // TODO: 还需要将id写入form

          return <div>{getFieldDecorator(`data[${index}].type`)(<span>{replaceSign}</span>)}</div>;
        },
      },
      {
        title: '成品物料编号/名称',
        key: 'product',
        render: (__, index) => {
          return <div>{getFieldDecorator(`data[${index}].material`)(<span>{replaceSign}</span>)}</div>;
        },
      },
      {
        title: '原版本号',
        key: 'originalVersion',
        render: () => replaceSign,
      },
      {
        title: '新版本号',
        key: 'newVersion',
        render: (__, index) => {
          return <div>{getFieldDecorator(`data[${index}].material`)(<span>{replaceSign}</span>)}</div>;
        },
      },
    ];
  };

  render() {
    const mockData = [1];

    return (
      <div>
        <RestPagingTable dataSource={mockData} total={mockData.length} columns={this.getColumns()} />
        <div style={{ display: 'flex', justifyContent: 'space-around' }} >
          <Button>取消</Button>
          <Button>确认</Button>
        </div>
      </div>
    );
  }
}

ChangeEbomAndMbomVersion.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
};

export default withForm({ showFooter: null }, ChangeEbomAndMbomVersion);
