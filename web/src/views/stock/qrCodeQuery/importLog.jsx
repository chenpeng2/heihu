import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd, formatDateTime, daysAgo } from 'src/utils/time';
import { RestPagingTable, Link, Button, Badge } from 'src/components';
import { getQuery } from 'src/routes/getRouteParams';
import { importLogs } from 'src/services/stock/material';
import { error, primary, warning } from 'src/styles/color';

const { RangePicker } = DatePicker;

type Props = {
  viewer: any,
  relay: any,
  loading: boolean,
  form: any,
  text: String,
  match: any,
};

class qrCodeImportLog extends Component {
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
        title: '导入结果',
        dataIndex: 'status',
        width: 130,
        render: status => {
          if (status === 0) {
            return <Badge.MyBadge color={error} text={'导入失败'} />;
          } else if (status === 1) {
            return <Badge.MyBadge color={primary} text={'导入成功'} />;
          }
          return <Badge.MyBadge color={warning} text={'部分导入成功'} />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        render: (text, record) => (
          <div>
            物料导入完成！成功数：
            {record.successAmount}
            ，失败数：
            {record.failureAmount}。
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
                this.context.router.history.push(`/stock/qrCode/importLog/${record.importId}/detail`);
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
    params = { createdAtFrom: dateRange[0], createdAtTill: dateRange[1], ...params };
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
    const { changeChineseToLocale } = this.context;
    const columns = this.getColumns();

    return (
      <div>
        <div style={{ margin: 20 }}>
          <span>{changeChineseToLocale('导入时间')}</span>
          <RangePicker
            defaultValue={[moment(formatDateTime(daysAgo(30))), moment(formatDateTime(daysAgo(0)))]}
            onChange={date => {
              this.setState({
                dateRange: date.length ? [formatToUnix(dayStart(date[0])), formatToUnix(dayEnd(date[1]))] : [],
              });
            }}
            style={{ margin: '0px 20px' }}
          />
          <Button
            icon="search"
            style={{ width: 86 }}
            onClick={() => {
              const { dateRange } = this.state;
              const params = { page: 1, size: 10, fromAt: dateRange[0], toAt: dateRange[1] };
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
          total={total}
          bordered
        />
      </div>
    );
  }
}

qrCodeImportLog.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default qrCodeImportLog;
