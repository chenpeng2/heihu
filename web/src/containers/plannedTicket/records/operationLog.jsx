import React, { Component } from 'react';
import { RestPagingTable, withForm, Badge } from 'components';
import { formatUnix } from 'utils/time';
import { getLocation } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { queryPlannedTicketOperationLog } from 'src/services/cooperate/plannedTicket';
import { PLAN_TICKET_INJECTION_MOULDING } from 'constants';
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
    return [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        render: text => formatUnix(text),
      },
      {
        title: '操作用户',
        dataIndex: 'userName',
      },
      {
        title: '操作类型',
        dataIndex: 'type',
      },
      {
        title: '操作详情',
        dataIndex: 'detail',
        width: '45%',
        render: (text, record) => {
          return record.type ? <Badge status="success" text={text} /> : <Badge status="error" text={text} />;
        },
      },
    ];
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const {
      match: {
        params: { id, plannedTicketCategory },
      },
      match,
    } = this.props;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    const {
      data: { data, count },
    } = await queryPlannedTicketOperationLog({
      code: decodeURIComponent(id),
      size: 10,
      isInject: plannedTicketCategory === PLAN_TICKET_INJECTION_MOULDING.toString(),
      ...params,
    });
    this.setState({ dataSource: data, total: count, loading: false });
  };

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
