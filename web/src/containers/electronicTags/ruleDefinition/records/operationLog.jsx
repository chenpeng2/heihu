import React, { Component } from 'react';
import {
  RestPagingTable,
  withForm,
  Badge,
} from 'components';
import { formatUnix } from 'utils/time';
import { getLocation } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { getBarcodeLabelRuleOperationLogs } from 'src/services/barCodeLabel';
import FilterForLog from './filter';

type Props = {
  form: any,
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
      dataIndex: 'createAt',
      render: time => formatUnix(time),
    }, {
      title: '操作用户',
      dataIndex: 'userName',
    }, {
      title: '操作类型',
      dataIndex: 'operationType',
      render: type => this.renderOperationDetail(type),
    }, {
      title: '操作详情',
      width: '45%',
      render: (record) => {
        const { operationType } = record;
        return <Badge status="success" text={`${this.renderOperationDetail(operationType)}成功`} />;
      },
    }];
  }

  fetchData = async params => {
    this.setState({ loading: true });
    const { match: { params: { id } }, match } = this.props;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    const { data: { data, total } } = await getBarcodeLabelRuleOperationLogs({ ruleId: id, size: 10, ...params });
    this.setState({ dataSource: data, total, loading: false });
  }

  renderOperationDetail = type => {
    switch (type) {
      case 0:
        return '创建规则';
      case 1:
        return '编辑规则';
      case 2:
        return '启用规则';
      case 3:
        return '停用规则';
      default:
    }
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
