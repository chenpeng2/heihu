/*
* 次品分类查看组件
* */
import React, { Component } from 'react';
import _ from 'lodash';

import { replaceSign } from 'src/constants';
import { Table } from 'src/components';

type Props = {
  style: {},
  data: [],
  value: any, // 需要被form decorator
};

class DefectView extends Component {
  props: Props;
  state = {
    value: [],
  };

  componentWillMount() {
    this.setInitialValue(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.value, this.props.value)) {
      this.setInitialValue(nextProps.value);
    }
  }

  setInitialValue = value => {
    this.setState({ value });
  };

  getColumns = () => {
    return [
      {
        title: '次品分类',
        dataIndex: 'defectGroupName',
        width: 150,
        render: data => data || replaceSign,
      },
      {
        title: '次品项名称',
        dataIndex: 'name',
        width: 150,
        render: data => data || replaceSign,
      },
    ];
  };

  render() {
    const { value } = this.state;

    return (
      <Table
        scroll={{ y: 250 }}
        columns={this.getColumns()}
        dataSource={value}
        pagination={false}
        style={{ marginLeft: 0 }}
      />
    );
  }
}

export default DefectView;
