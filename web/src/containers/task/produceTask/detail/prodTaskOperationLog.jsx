import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import { RestPagingTable, Button } from 'components';
import moment, { formatUnix, formatToUnix, dayStart, dayEnd, formatDateTime, daysAgo } from 'utils/time';
import { queryProdTaskOperationLog } from 'src/services/cooperate/prodTask';
import { setLocation } from 'utils/url';
import { getLocation } from 'src/routes/getRouteParams';
import { TASK_CATEGORY_INJECT_MOLD } from 'constants';
import { queryInjectMoldTaskOperationLog } from 'services/cooperate/injectMoldTask';
import styles from './styles.scss';

const { RangePicker } = DatePicker;

type Props = {
  viewer: any,
  form: any,
  match: any,
};

class ProdTaskOperationLog extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    dateRange: [],
    total: null,
  };

  componentDidMount() {
    this.setState(
      {
        dateRange: [formatToUnix(formatDateTime(daysAgo(30))), formatToUnix(formatDateTime(daysAgo(0)))],
      },
      () => {
        this.fetchData({ page: 1 });
      },
    );
  }

  fetchData = async params => {
    this.setState({ loading: true });
    const {
      match: {
        params: { taskId },
      },
      match,
      category,
    } = this.props;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    const { dateRange } = this.state;
    let fetchApi = queryProdTaskOperationLog;
    if (category === TASK_CATEGORY_INJECT_MOLD) {
      fetchApi = queryInjectMoldTaskOperationLog;
    }
    const {
      data: { data, total },
    } = await fetchApi({ taskId, startTime: dateRange[0], endTime: dateRange[1], size: 10, ...params });
    this.setState({
      dataSource: data,
      loading: false,
      total,
    });
  };

  getColumns = () => {
    const { changeChineseToLocale, changeChineseTemplateToLocale } = this.context;
    const columns = [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        render: (text, record) => <div>{formatUnix(text)}</div>,
      },
      {
        title: '操作用户',
        dataIndex: 'operatorName',
        render: (text, record) => <div>{text}</div>,
      },
      {
        title: '操作类型',
        dataIndex: 'actionDisplay',
        render: (text, record) => <div>{changeChineseToLocale(text)}</div>,
      },
      {
        title: '操作详情',
        dataIndex: 'msg',
        width: '45%',
        // render: (text, record) => <div>{changeChineseTemplateToLocale(text, { taskId: '1805220001' })}</div>,
        render: (text, record) => <div>{changeChineseToLocale(text)}</div>,
      },
    ];
    return columns;
  };

  render() {
    const { loading, total, dataSource } = this.state;
    const columns = this.getColumns();
    const { changeChineseToLocale } = this.context;

    return (
      <div id="prodTask_operationlog" className={styles.operationLogWrapper}>
        <div className={styles.searchHeader}>
          <span>{changeChineseToLocale('操作时间')}</span>
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
          total={total}
          loading={loading}
          bordered
        />
      </div>
    );
  }
}

ProdTaskOperationLog.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.any,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default ProdTaskOperationLog;
