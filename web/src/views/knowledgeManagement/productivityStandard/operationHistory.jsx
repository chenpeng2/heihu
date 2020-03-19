import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Tooltip, Button, RestPagingTable, withForm, DatePicker } from 'src/components';
import { black, middleGrey } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { getProductivityStandardOperationHistory } from 'src/services/knowledgeBase/productivityStandard';

const RangePicker = DatePicker.RangePicker;

const fetchHistoryData = async (code, params) => {
  const res = await getProductivityStandardOperationHistory(code, params);
  const { data } = res;

  return data;
};

const InitialValue = {
  from_at: moment().subtract(1, 'month'),
  to_at: moment().add(60, 'minutes'),
};

type Props = {
  style: {},
  form: {},
  match: {},
};

class ProductivityStandardOperationHistory extends Component {
  props: Props;
  state = {
    historyData: null,
    totalAmount: 0,
    loading: false,
  };

  componentDidMount() {
    this.fetchAndSetHistoryData({
      from_at: Date.parse(InitialValue.from_at),
      to_at: Date.parse(InitialValue.to_at),
    });
  }

  fetchAndSetHistoryData = p => {
    this.setState({ loading: true });

    const { match } = this.props;
    const { params } = match || {};
    const { code } = params || {};

    const _p = { ...p, size: 10 };

    fetchHistoryData(code, _p)
      .then(res => {
        const { data, count } = res || {};

        this.setState({
          historyData: data || [],
          totalAmount: count || 0,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderTitle = () => {
    return (
      <div>
        <span style={{ fontSize: 16, color: black }}>操作记录</span>
      </div>
    );
  };

  // 时间filter。需要有默认值
  renderFilter = () => {
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form || {};

    return (
      <div style={{ margin: '10px 0' }}>
        <span style={{ marginRight: 20, color: middleGrey }}>操作时间</span>
        {getFieldDecorator('time', {
          initialValue: [InitialValue.from_at, InitialValue.to_at],
        })(<RangePicker />)}
        <Button
          style={{ marginLeft: 20 }}
          icon={'search'}
          onClick={() => {
            const time = getFieldValue('time');

            this.fetchAndSetHistoryData({
              from_at: time && time[0] ? Date.parse(time[0]) : null,
              to_at: time && time[1] ? Date.parse(time[1]) : null,
            });
          }}
        >
          查询
        </Button>
      </div>
    );
  };

  // 操作历史的table。注意屏幕适配
  renderTable = () => {
    const { historyData, totalAmount, loading } = this.state;

    const columns = [
      {
        title: '操作时间',
        dataIndex: 'createAt',
        key: 'time',
        render: data => {
          if (!data) return replaceSign;

          return moment(data).format('YYYY/MM/DD HH:mm:ss');
        },
      },
      {
        title: '操作用户',
        dataIndex: 'user',
        key: 'user',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '操作类型',
        dataIndex: 'type',
        key: 'type',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '操作详情',
        dataIndex: 'detail',
        key: 'detail',
        render: data => {
          if (!data) return replaceSign;

          return <Tooltip text={data} length={20} />;
        },
      },
    ];

    return (
      <RestPagingTable
        columns={columns}
        dataSource={historyData || []}
        total={totalAmount || 0}
        style={{ margin: 0 }}
        loading={loading}
        refetch={this.fetchAndSetHistoryData}
      />
    );
  };

  render() {
    return (
      <div style={{ padding: 20 }}>
        {this.renderTitle()}
        {this.renderFilter()}
        {this.renderTable()}
      </div>
    );
  }
}

export default withForm({}, withRouter(ProductivityStandardOperationHistory));
