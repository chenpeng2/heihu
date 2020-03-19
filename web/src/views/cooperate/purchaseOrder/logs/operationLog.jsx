import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RestPagingTable, withForm, Badge, DatePicker, Button, Icon, Tooltip } from 'components';
import { replaceSign } from 'src/constants';
import { middleGrey } from 'src/styles/color';
import { getLocation } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { getPurchaseOrderOperationLog } from 'src/services/cooperate/purchaseOrder';
import moment, { formatToUnix, dayStart, dayEnd, formatUnix } from 'utils/time';

const { RangePicker } = DatePicker;

type Props = {
  form: any,
  location: {},
};

class OperationLog extends Component {
  props: Props;
  state = {
    dataSource: [],
    loading: false,
    total: 0,
  };

  componentDidMount = () => {
    this.onSearch();
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const {
      location: { query },
      match,
    } = this.props;
    const purchaseOrderCode = query.purchaseOrderCode;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    const {
      data: { data, count },
    } = await getPurchaseOrderOperationLog({ code: purchaseOrderCode, size: 10, ...params });
    this.setState({ dataSource: data, total: count, loading: false });
  };

  onSearch = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dates, ...rest } = values;
        const createdAtFromAt = dates[0] && formatToUnix(dayStart(dates[0]));
        const createdAtFromTill = dates[1] && formatToUnix(dayEnd(dates[1]));
        this.fetchData({ createdAtFromAt, createdAtFromTill, page: 1, ...rest });
      }
    });
  };

  getColumns = () => {
    return [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        width: 170,
        render: text => formatUnix(text),
      },
      {
        title: '操作用户',
        dataIndex: 'userName',
        width: 170,
      },
      {
        title: '操作类型',
        dataIndex: 'actionDesc',
        width: 170,
      },
      {
        title: '操作详情',
        dataIndex: 'msg',
        render: (text, record) => {
          return text ? (
            <div>
              <Badge status="success" />
              <Tooltip length={100} text={text || replaceSign} />
            </div>
          ) : (
            replaceSign
          );
        },
      },
    ];
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const { dataSource, total, loading } = this.state;
    const columns = this.getColumns();
    const lastMonth = moment().subtract(1, 'months');
    const today = moment();

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', margin: 20 }}>
          <span style={{ color: middleGrey, fontSize: 14 }}>{changeChineseToLocale('操作时间')}</span>
          <div style={{ marginLeft: 10 }}>
            {getFieldDecorator('dates', {
              initialValue: [lastMonth, today],
            })(<RangePicker />)}
          </div>
          <Button style={{ width: 86, marginLeft: 10 }} onClick={this.onSearch}>
            <Icon type="search" />
            {changeChineseToLocale('查询')}
          </Button>
        </div>
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

OperationLog.contextTypes = {
  changeChineseToLocale: PropTypes.function,
};

export default withForm({}, OperationLog);
