import React, { Component } from 'react';
import {
  RestPagingTable,
  withForm,
  Badge,
  Link,
} from 'components';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { formatUnix } from 'utils/time';
import { getLocation } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { queryPlannedTicketImportLog } from 'src/services/cooperate/plannedTicket';
import FilterForLog from './filter';

type Props = {
  form: {
    validateFields: () => {},
  },
};

class PlannedTicketImportLog extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [{
      title: '导入时间',
      dataIndex: 'createdAt',
      width: 200,
      render: text => formatUnix(text),
    }, {
      title: '导入用户',
      dataIndex: 'userName',
      width: 160,
    }, {
      title: '导入结果',
      width: 160,
      render: (record) => {
        if (record.failureAmount === 0) {
          return <Badge status="success" text="导入成功" />;
        } else if (record.successAmount === 0) {
          return <Badge status="error" text="导入失败" />;
        }
        return <Badge status="warning" text="部分导入成功" />;
      },
    }, {
      title: '导入详情',
      render: (record) => <div>计划工单导入完成！成功数：{record.successAmount}，失败数：{record.failureAmount}。</div>,
    }, {
      title: '操作',
      dataIndex: 'importId',
      width: 120,
      render: (text, record) => (
        <div key={`code-${text}`}>
          <Link
            style={{ marginRight: 20 }}
            onClick={() => {
              this.context.router.history.push(`/cooperate/plannedTicket/logs/import/${text}`);
            }}
          >
            查看
          </Link>
        </div>),
    }];
  }

  fetchData = async params => {
    this.setState({ loading: true });
    const { match: { params: { id } }, match } = this.props;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    const { data: { data, count } } = await queryPlannedTicketImportLog({ code: id, size: 10, ...params });
    this.setState({ dataSource: data, total: count, loading: false });
  }

  render() {
    const { form } = this.props;
    const { dataSource, total } = this.state;
    const columns = this.getColumns();
    return (
      <div>
        <FilterForLog form={form} fetchData={this.fetchData} />
        <RestPagingTable
          bordered
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

PlannedTicketImportLog.contextTypes = {
  router: PropTypes.object,
};

export default withForm({}, withRouter(PlannedTicketImportLog));
