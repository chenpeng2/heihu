import React, { Component } from 'react';
import _ from 'lodash';

import { SimpleTable, Badge } from 'components';
import { success, error } from 'src/styles/color';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { queryESignatureList } from 'src/services/knowledgeBase/eSignature';

import UpdateESignatureStatusLink from './updateStatusLink';

type Props = {
  match: any,
};

class ESignatureList extends Component {
  props: Props;
  state = {
    dataSource: [],
    pagination: {},
  };

  componentDidMount = () => {
    this.fetchData();
  }

  fetchData = async params => {
    const { match } = this.props;
    const { pagination } = this.state;
    const lastQuery = getQuery(match);
    setLocation(this.props, p => ({ ...p, ...params }));
    const variables = { ...lastQuery, ...params };

    await queryESignatureList(variables)
      .then(res => {
        const data = _.get(res, 'data.data');

        this.setState({
          dataSource: data,
          pagination: {
            ...pagination,
            pageSize: 10,
            total: _.get(data, 'length'),
          },
        });
      })
      .catch(err => console.log(err));
  };

  getColumns = () => {
    return [{
      title: '业务/功能',
      key: 'configValue',
      dataIndex: 'configValue',
    }, {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: data => {
        const display = data === 1 ? '启用中' : '停用中';

        return <Badge.MyBadge color={data === 1 ? success : error} text={display} />;
      },
    }, {
      title: '操作',
      key: 'actions',
      dataIndex: 'actions',
      render: (data, record) => <UpdateESignatureStatusLink refetch={this.fetchData} data={record} />,
    }];
  };

  handleTableChange = (pagination, filters, sorter, extra) => {
    // console.log(pagination);
    this.setState({ pagination });
    // this.fetchData();
  };

  render() {
    const { dataSource, pagination } = this.state;

    return (
      <SimpleTable
        style={{ margin: 20 }}
        dataSource={dataSource}
        pagination={pagination}
        rowKey={record => record.id}
        columns={this.getColumns()}
        onChange={this.handleTableChange}
      />
    );
  }
}

export default ESignatureList;
