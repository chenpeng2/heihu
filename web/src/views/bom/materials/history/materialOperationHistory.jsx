import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import { RestPagingTable, Button, Badge, Tooltip, FormattedMessage } from 'components';
import moment, {
  formatUnix,
  formatToUnix,
  dayStart,
  dayEnd,
  daysAgo,
  formatDateTime,
  formatRangeUnix,
} from 'utils/time';
import { queryMaterialOperationLogs } from 'src/services/bom/material';
import styles from './styles.scss';

const { RangePicker } = DatePicker;

type Props = {
  viewer: any,
  relay: any,
  form: any,
  match: any,
};

class MaterialOperationHistory extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    dateRange: [],
    code: '',
    pagination: {},
  };

  componentDidMount() {
    const {
      match: {
        params: { materialCode },
      },
    } = this.props;
    this.setState(
      {
        pagination: {
          current: 1,
        },
        dateRange: formatRangeUnix([daysAgo(30), daysAgo(0)]),
        code: decodeURIComponent(materialCode),
      },
      () => {
        const { dateRange, code } = this.state;
        this.fetchData({ code, page: 1, size: 10, fromAt: dateRange[0], toAt: dateRange[1] });
      },
    );
  }

  fetchData = async params => {
    const { dateRange, code } = this.state;
    const {
      data: { data, count, page },
    } = await queryMaterialOperationLogs(code, { fromAt: dateRange[0], toAt: dateRange[1], ...params });
    this.setState({
      dataSource: data,
      loading: false,
      pagination: {
        total: count,
        current: page,
      },
    });
  };

  getColumns = () => {
    const columns = [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        render: (text, record) => <div>{formatUnix(text)}</div>,
      },
      {
        title: '操作用户',
        dataIndex: 'userName',
        render: (text, record) => <div>{text}</div>,
      },
      {
        title: '操作类型',
        dataIndex: 'type.display',
        render: (text, record) => <div>{text}</div>,
      },
      {
        title: '操作详情',
        dataIndex: 'content',
        width: '45%',
        render: (text, record) => {
          return record.flag ? <Badge status="success" text={text} /> : <Badge status="error" text={text} />;
        },
      },
    ];
    return columns;
  };

  render() {
    const { loading, dataSource, pagination } = this.state;
    const columns = this.getColumns();

    return (
      <div id="material_operationhistory" className={styles.operationLogWrapper}>
        <div className={styles.searchHeader}>
          <FormattedMessage defaultMessage={'操作时间'} />
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
              this.fetchData({
                page: 1,
                size: 10,
              });
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
          pagination={pagination}
          bordered
        />
      </div>
    );
  }
}

MaterialOperationHistory.contextTypes = {
  router: PropTypes.object,
};

export default MaterialOperationHistory;
