import React, { Component } from 'react';
import { DatePicker } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd, formatDateTime, daysAgo } from 'utils/time';
import { RestPagingTable, Link, Button, Badge } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { deviceImportList } from 'src/services/equipmentMaintenance/device';
import styles from './styles.scss';

const { RangePicker } = DatePicker;

type Props = {
  form: any,
  intl: any,
  match: any,
  history: any,
};

class DeviceImportHistory extends Component {
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
    const { history } = this.props;
    const columns = [
      {
        title: '导入时间',
        dataIndex: 'createdAt',
        render: text => formatUnix(text),
      },
      {
        title: '导入用户',
        dataIndex: 'operatorName',
      },
      {
        title: '导入结果',
        dataIndex: 'status',
        render: status => {
          if (status === 0) {
            return <Badge status="error" text={'导入失败'} />;
          } else if (status === 1) {
            return <Badge status="success" text={'导入成功'} />;
          }
          return <Badge status="warning" text={'部分导入成功'} />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        render: (text, record) => (
          <div>
            设备基础数据导入完成！成功数：{record.successAmount}，失败数：{record.failureAmount}。
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
                history.push(`/equipmentMaintenance/device/importLog/detail/${record.importId}`);
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

  fetchData = async (params, query) => {
    this.setState({ loading: true });
    const { dateRange } = this.state;
    params = { createdAtFrom: dateRange[0], createdAtTill: dateRange[1], ...params };
    const res = await deviceImportList(params);
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
    const { intl } = this.props;
    const { loading, dataSource } = this.state;
    const columns = this.getColumns();

    return (
      <div id="device_importhistory">
        <div className={styles.searchHeader}>
          <span>{changeChineseToLocale('导入时间', intl)}</span>
          <RangePicker
            defaultValue={[moment(formatDateTime(daysAgo(30))), moment(formatDateTime(daysAgo(0)))]}
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
          pagination={this.state.pagination}
          bordered
        />
      </div>
    );
  }
}

export default injectIntl(DeviceImportHistory);
