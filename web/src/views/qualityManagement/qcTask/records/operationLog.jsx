import React, { Component } from 'react';
import {
  RestPagingTable,
  withForm,
  Badge,
} from 'components';
import { formatUnix } from 'utils/time';
import { getLocation } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import { setLocation } from 'utils/url';
import { getQcTaskOperationLog } from 'src/services/qualityManagement/qcTask';
import FilterForLog from './filter';

type Props = {
  form: any,
  match: any,
};
class OperationLog extends Component {
  props: Props;
  state = {
    dataSource: [],
    loading: false,
    total: 0,
  };

  getColumns = () => {
    return [{
      title: '操作时间',
      dataIndex: 'createdAt',
      render: (text) => formatUnix(text),
    }, {
      title: '操作用户',
      dataIndex: 'operatorName',
    }, {
      title: '电子签名用户',
      dataIndex: 'signUserName',
      render: (data) => data || replaceSign,
    }, {
      title: '操作类型',
      dataIndex: 'logTypeDisplay',
    }, {
      title: '备注',
      dataIndex: 'description',
      width: '45%',
      render: (data) => data || replaceSign,
    }];
  }

  fetchData = async params => {
    this.setState({ loading: true });
    const { match: { params: { id } }, match } = this.props;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    const { data: { data, count } } = await getQcTaskOperationLog({ code: id, size: 10, ...params });
    this.setState({ dataSource: data, total: count, loading: false });
  }

  render() {
    const { form } = this.props;
    const { dataSource, total, loading } = this.state;
    const columns = this.getColumns();
    return (
      <div>
        <FilterForLog fetchData={this.fetchData} form={form} />
        <RestPagingTable
          bordered
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey={record => record.id}
          total={total}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

export default withForm({}, OperationLog);
