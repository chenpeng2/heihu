import React, { Component } from 'react';
import { DatePicker, FormattedMessage } from 'components';
import PropTypes from 'prop-types';

import moment, {
  formatUnix,
  formatToUnix,
  dayStart,
  dayEnd,
  formatDateTime,
  daysAgo,
  formatRangeUnix,
} from 'utils/time';
import { RestPagingTable, Link, Button, Badge, Tooltip } from 'src/components';
import { getQuery } from 'src/routes/getRouteParams';
import { queryProcessImportLogs } from 'src/services/process';
import { replaceSign } from 'src/constants';

import styles from './styles.scss';

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
        dateRange: formatRangeUnix([daysAgo(30), daysAgo(0)]),
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
        width: 150,
        render: text => (text ? formatUnix(text) : replaceSign),
      },
      {
        title: '导入用户',
        dataIndex: 'userName',
        width: 100,
        render: text => <Tooltip text={text || replaceSign} length={20} />,
      },
      {
        title: '导入结果',
        dataIndex: 'status',
        width: 130,
        render: text => {
          if (text === '导入失败') {
            return <Badge status="error" text={text} />;
          } else if (text === '导入成功') {
            return <Badge status="success" text={text} />;
          }
          return <Badge status="warning" text={text} />;
        },
      },
      {
        title: '导入详情',
        dataIndex: 'detail',
        render: (text, record) => {
          const {
            createSuccess: successAmount,
            createFailure: failureAmount,
            updateSuccess: updateAmount,
            updateFailure: updateFailedAmount,
          } = record || {};
          return (
            <div>
              <FormattedMessage
                defaultMessage={
                  '工序导入完成！创建成功数：{successAmount}，创建失败数：{failureAmount}；更新成功数：{updateAmount}，更新失败数：{updateFailedAmount}'
                }
                values={{ successAmount, failureAmount, updateAmount, updateFailedAmount }}
              />
            </div>
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: 100,
        render: (text, record) => (
          <div key={`code-${record.id}`}>
            <Link style={{ marginRight: 20 }} to={`/bom/newProcess/logs/import/${record.importId}`}>
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
    params = { size: 10, fromAt: dateRange[0], toAt: dateRange[1], ...params };
    const res = await queryProcessImportLogs(params);
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
        <div className={styles.searchHeader}>
          <FormattedMessage defaultMessage={'导入时间'} />
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

MaterialImportHistory.contextTypes = {
  router: PropTypes.object,
};

export default MaterialImportHistory;
