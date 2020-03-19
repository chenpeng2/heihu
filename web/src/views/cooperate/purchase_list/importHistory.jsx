import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd, formatDateTime, daysAgo } from 'utils/time';
import { RestPagingTable, Link, Button, Badge } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { purchaseListImportHistory } from 'src/services/cooperate/purchase_list';
import styles from './styles.scss';

const { RangePicker } = DatePicker;
const customLanguage = getCustomLanguage();

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
    total: 0,
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
        dataIndex: 'importAt',
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
          if (status === 3) {
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
            {customLanguage.procure_order}导入完成！成功数：{record.successAmount}，失败数：{record.failureAmount}。
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
                this.context.router.history.push(`/cooperate/purchaseLists/import/${record.id}`);
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
    params = { startTime: dateRange[0], endTime: dateRange[1], ...params };
    const res = await purchaseListImportHistory(params);
    const { data } = res.data;
    this.setState({
      dataSource: data,
      loading: false,
      total: res.data.total,
    });
  };

  render() {
    const { dataSource, total, loading } = this.state;
    const { changeChineseToLocale } = this.context;
    const columns = this.getColumns();

    return (
      <div id="material_importhistory">
        <div className={styles.searchHeader}>
          <span>{changeChineseToLocale('导入时间')}</span>
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
              this.fetchData();
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

MaterialImportHistory.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default MaterialImportHistory;
