import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { middleGrey } from 'src/styles/color';
import { Spin, withForm, DatePicker, Button } from 'src/components';
import HistoryTable from 'src/containers/workingTime/operationHistory/historyTable';
import { getWorkingCalendarOperationHistory } from 'src/services/knowledgeBase/workingCalendar';
import { setLocation } from 'utils/url';
import { getLocation } from 'src/routes/getRouteParams';
import moment, { formatRangeUnix } from 'src/utils/time';

const RangePicker = DatePicker.RangePicker;
const InitialTimeValue = [moment().subtract(1, 'months'), moment().add(60, 'minutes')];

type Props = {
  style: {},
  form: {},
  match: {
    params: {},
  },
};

class OperationHistory extends Component {
  props: Props;
  state = {
    historyData: null,
    loading: false,
    totalAmount: 0,
  };

  componentWillMount() {
    const _time = formatRangeUnix(InitialTimeValue);

    this.fetchHistoryData({
      startTime: Array.isArray(_time) && _time[0] ? _time[0] : null,
      endTime: Array.isArray(_time) && _time[1] ? _time[1] : null,
      page: 1,
    });
  }

  fetchHistoryData = params => {
    const { match } = this.props;
    const id = _.get(this.props, 'match.params.id');

    this.setState({ loading: true });

    getWorkingCalendarOperationHistory({ produceCalendarId: id, ...params, size: 10 })
      .then(res => {
        const { data } = res;
        const { data: realData, total } = data;

        const location = getLocation(match);
        location.query = { ...location.query, operatingHourId: id, ...params };
        setLocation(this.props, () => location.query);

        this.setState({ historyData: realData, totalAmount: total });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderFilter = () => {
    const { form } = this.props;
    const { getFieldDecorator, getFieldsValue } = form;

    const containerStyle = { margin: '0px 0px 20px 20px' };
    const commonStyle = { margin: '0px 5px' };
    const labelStyle = { ...commonStyle, color: middleGrey };
    const rangePickerStyle = { ...commonStyle, display: 'inline-block' };

    return (
      <div style={containerStyle}>
        <span style={labelStyle}>操作时间</span>
        <div style={rangePickerStyle}>
          {getFieldDecorator('time', {
            initialValue: InitialTimeValue,
          })(<RangePicker />)}
        </div>
        <Button
          style={commonStyle}
          icon={'search'}
          onClick={() => {
            const res = getFieldsValue();
            const { time } = res || {};

            const _time = formatRangeUnix(time);

            this.fetchHistoryData({
              startTime: Array.isArray(_time) && _time[0] ? _time[0] : null,
              endTime: Array.isArray(_time) && _time[1] ? _time[1] : null,
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
    const { historyData, loading, totalAmount } = this.state;

    return (
      <Spin spinning={loading}>
        <div style={{ marginTop: 20 }}>{this.renderFilter()}</div>
        <HistoryTable fetchHistory={p => this.fetchHistoryData(p)} data={historyData} dataTotalAmount={totalAmount} />
      </Spin>
    );
  }
}

export default withForm({}, withRouter(OperationHistory));
