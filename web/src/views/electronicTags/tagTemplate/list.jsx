import React, { Component } from 'react';
import _ from 'lodash';

import { Link, Table } from 'src/components';
import { replaceSign } from 'src/constants';
import { getBusinessList } from 'src/services/electronicTag/template';

import { getDetailPageUrl, getEditPageUrl } from './utils';

export default class TemplateList extends Component {
  state = {
    visible: false,
    type: null,
    currentData: {},
  };

  componentDidMount = () => {
    this.fetchData();
  };

  fetchData = async params => {
    await getBusinessList(params)
      .then(res => {
        const data = _.get(res, 'data.data', []);
        this.setState({ dataSource: data });
      })
      .catch(err => console.log(err));
  };

  getColumns = () => {
    return [
      {
        title: '业务类型',
        dataIndex: 'typeName',
        render: type => type || replaceSign,
      },
      {
        title: '文件数',
        dataIndex: 'count',
        render: data => data || replaceSign,
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (_, record) => {
          const { type } = record || {};
          return (
            <div>
              <Link to={getDetailPageUrl(type)}>查看</Link>
              <Link to={getEditPageUrl(type)} style={{ marginLeft: 10 }}>
                编辑
              </Link>
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { dataSource } = this.state;

    return (
      <div style={{ padding: '20px 0' }}>
        <Table pagination={false} dataSource={dataSource} columns={this.getColumns()} />
      </div>
    );
  }
}
