import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd, formatDateTime, daysAgo } from 'utils/time';
import { RestPagingTable, Link, Button, Badge } from 'components';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import { getImportList } from '../../../services/shipment/sendTask';

const { RangePicker } = DatePicker;

type Props = {
  viewer: any,
  relay: any,
  loading: boolean,
  form: any,
  text: String,
  match: any,
};

class ImportList extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: null,
    dateRange: [],
    pagination: {},
  };

  componentDidMount() {
    this.setState(
      {
        pagination: {
          current: 1,
        },
        dateRange: [formatToUnix(formatDateTime(daysAgo(3))), formatToUnix(formatDateTime(daysAgo(0)))],
      },
      () => {
        const { match } = this.props;
        const query = getQuery(match);
        const variables = { ...query };
        this.fetchData({ ...variables });
      },
    );
  }

  getColumns = () => {
    const columns = [
      {
        title: '导入时间',
        dataIndex: 'createdAt',
        render: text => formatUnix(text),
      },
      {
        title: '导入用户',
        dataIndex: 'operatorName',
        width: 210,
      },
      {
        title: '导入结果',
        dataIndex: 'status',
        width: 130,
        render: (status, record) => {
          if (status === 0) {
            return <Badge status="error" text="导入失败" />;
          } else if (status === 1) {
            return <Badge status="success" text="导入成功" />;
          }
          return <Badge status="warning" text="部分导入成功" />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        render: (text, record) => (
          <div>
            发运任务导入完成！成功数：{record.successAmount}，失败数：{record.failureAmount}。
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => (
          <div key={`code-${record.id}`}>
            <Link
              style={{ marginRight: 20 }}
              onClick={() => {
                this.context.router.history.push(`/logistics/send-task/import-list/detail/${record.importId}`);
              }}
            >
              查看
            </Link>
          </div>
        ),
      },
    ].map(node => ({ ...node, key: node.title }));
    return columns;
  };

  fetchData = async (params, query) => {
    this.setState({ loading: true });
    const { dateRange } = this.state;
    params = { createdAtFrom: dateRange[0], createdAtTill: dateRange[1], ...params };
    const res = await getImportList(params);
    const { data } = res.data;
    this.setState({
      dataSource: data,
      loading: false,
      pagination: {
        total: res.data.count,
        current: res.data.page,
      },
    });
  };

  render() {
    const { dataSource } = this.state;
    const { loading } = this.state;
    const columns = this.getColumns();

    return (
      <div id="material_importhistory">
        <div className="child-gap" style={{ margin: 20 }}>
          <span>导入时间</span>
          <RangePicker
            defaultValue={[moment(formatDateTime(daysAgo(3))), moment(formatDateTime(daysAgo(0)))]}
            onChange={date => {
              this.setState({
                dateRange: date.length ? [formatToUnix(dayStart(date[0])), formatToUnix(dayEnd(date[1]))] : [],
              });
            }}
          />
          <Button
            icon="search"
            style={{ width: 86 }}
            onClick={() => {
              const { dateRange } = this.state;
              const params = { page: 1, size: 10, createdAtFrom: dateRange[0], createdAtTill: dateRange[1] };
              this.fetchData(params);
            }}
          >
            查询
          </Button>
        </div>
        <RestPagingTable
          dataSource={dataSource}
          refetch={this.fetchData}
          rowKey={record => record.id}
          columns={columns}
          loading={loading}
          pagination={this.state.pagination}
          bordered
        />
      </div>
    );
  }
}

ImportList.contextTypes = {
  router: PropTypes.object,
};

export default ImportList;
