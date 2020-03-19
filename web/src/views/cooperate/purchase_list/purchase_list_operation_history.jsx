import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Proptypes from 'prop-types';
import { black, middleGrey } from 'src/styles/color';
import { Spin, withForm, DatePicker, Button } from 'src/components';
import HistoryTable from 'src/containers/purchase_list/purchase_list_operation_history/history_table';
import { get_procure_order_history } from 'src/services/cooperate/purchase_list';
import { setLocation } from 'utils/url';
import { getLocation } from 'src/routes/getRouteParams';
import moment from 'src/utils/time';

const RangePicker = DatePicker.RangePicker;
const InitialTimeValue = [moment().subtract(1, 'months'), moment().add(60, 'minutes')];

type Props = {
  style: {},
  form: {},
  match: {
    params: {},
  },
};

class Purchase_List_Operation_History extends Component {
  props: Props;
  state = {
    history_data: null,
    loading: false,
    total_amount: 0,
  };

  componentWillMount() {
    this.fetch_history_data({
      startTime: Date.parse(InitialTimeValue[0]),
      endTime: Date.parse(InitialTimeValue[1]),
      page: 1,
    });
  }

  fetch_history_data = params => {
    const { match } = this.props;
    const { params: queryParams } = match || {};
    const { code } = queryParams || {};

    this.setState({ loading: true });

    get_procure_order_history({ procureOrderCode: code, ...params })
      .then(res => {
        const { data } = res;
        const { data: realData, total } = data;

        const location = getLocation(match);
        location.query = { ...location.query, procureOrderCode: code, ...params };
        setLocation(this.props, () => location.query);

        this.setState({ history_data: realData, total_amount: total });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render_title = () => {
    const { changeChineseToLocale } = this.context;
    const style = {
      margin: '20px 0 30px 20px',
      color: black,
      fontSize: 16,
      display: 'inline-block',
    };
    return <div style={style}>{changeChineseToLocale('操作记录')}</div>;
  };

  render_filter = () => {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, getFieldsValue } = form;

    const container_style = { margin: '0px 0px 20px 20px' };
    const common_style = { margin: '0px 5px' };
    const label_style = { ...common_style, color: middleGrey };
    const range_picker_style = { ...common_style, display: 'inline-block' };

    return (
      <div style={container_style}>
        <span style={label_style}>{changeChineseToLocale('操作时间')}</span>
        <div style={range_picker_style}>
          {getFieldDecorator('time', {
            initialValue: InitialTimeValue,
          })(<RangePicker />)}
        </div>
        <Button
          style={common_style}
          icon={'search'}
          onClick={() => {
            const res = getFieldsValue();
            const { time } = res || {};

            this.fetch_history_data({
              startTime: Array.isArray(time) && time[0] ? Date.parse(time[0]) : null,
              endTime: Array.isArray(time) && time[1] ? Date.parse(time[1]) : null,
              page: 1,
            });
          }}
        >
          查询
        </Button>
      </div>
    );
  };

  render() {
    const { history_data, loading, total_amount } = this.state;

    return (
      <Spin spinning={loading}>
        {this.render_title()}
        {this.render_filter()}
        <HistoryTable
          fetch_purchase_list_history={p => this.fetch_history_data(p)}
          data={history_data}
          data_total_amount={total_amount}
        />
      </Spin>
    );
  }
}

Purchase_List_Operation_History.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withForm({}, withRouter(Purchase_List_Operation_History));
