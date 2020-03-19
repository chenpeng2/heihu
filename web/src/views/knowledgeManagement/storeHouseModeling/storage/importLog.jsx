import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd, formatDateTime, daysAgo } from 'utils/time';
import { FormattedMessage, RestPagingTable, Link, Button, Badge } from 'src/components';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import { arrayIsEmpty } from 'src/utils/array';
import { importLogs } from 'src/services/knowledgeBase/storage';

const { RangePicker } = DatePicker;

type Props = {
  viewer: any,
  relay: any,
  loading: boolean,
  form: any,
  text: String,
  match: any,
};

class MaterialImportHistory extends Component {
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
        dateRange: [formatToUnix(formatDateTime(daysAgo(30))), formatToUnix(formatDateTime(daysAgo(0)))],
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
        title: '导入文件',
        dataIndex: 'fileName',
        width: 210,
      },
      {
        title: '导入结果',
        key: 'result',
        width: 130,
        render: (text, record) => {
          const { succeedCount, totalCount } = record || {};
          if (succeedCount === 0) {
            return <Badge status="error" text={'导入失败'} />;
          } else if (succeedCount === totalCount) {
            return <Badge status="success" text={'导入成功'} />;
          }
          return <Badge status="warning" text={'部分成功'} />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        render: (text, record) => (
          <div>
            物料导入完成！成功数：
            {record.succeedCount}
            ，失败数：
            {record.failedCount}。
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
                this.context.router.history.push(`/knowledgeManagement/storage/importLogs/${record.fileId}`);
              }}
            >
              查看
            </Link>
          </div>
        ),
      },
    ];
    return columns;
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { dateRange } = this.state;
    params = { start: dateRange[0], end: dateRange[1], size: 10, ...params };
    const res = await importLogs(params);
    const { data, total } = res.data;
    this.setState({
      dataSource: data,
      loading: false,
      total,
    });
  };

  render() {
    const { dataSource, loading, total } = this.state;
    const columns = this.getColumns();

    return (
      <div>
        <div style={{ margin: '20px' }}>
          <FormattedMessage defaultMessage={'导入时间'} />
          <RangePicker
            style={{ margin: '0px 20px' }}
            defaultValue={[moment(formatDateTime(daysAgo(30))), moment(formatDateTime(daysAgo(0)))]}
            onChange={date => {
              if (!arrayIsEmpty(date)) {
                this.setState({
                  dateRange: [formatToUnix(dayStart(date[0])), formatToUnix(dayEnd(date[1]))],
                });
              }
            }}
          />
          <Button
            icon="search"
            style={{ width: 86 }}
            onClick={() => {
              const { dateRange } = this.state;
              const params = { page: 1, size: 10, start: dateRange[0], end: dateRange[1] };
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
          bordered
          total={total}
        />
      </div>
    );
  }
}

MaterialImportHistory.contextTypes = {
  router: PropTypes.object,
};

export default MaterialImportHistory;
