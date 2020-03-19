import React from 'react';
import { DatePicker } from 'antd';
import moment from 'utils/time';
import Proptypes from 'prop-types';

const { MonthPicker } = DatePicker;

type Props = {
  onChange: () => {},
  historic: boolean,
  extraDisabledDate: any,
};

class MonthRangePicker extends React.Component {
  props: Props;
  state = {
    startValue: null,
    endValue: null,
    endOpen: false,
  };

  componentWillMount() {
    const { value } = this.props;
    if (value && value.length) {
      this.setState({ startValue: value[0], endValue: value[1] });
    }
  }

  static defaultProps = {
    onChange: () => {},
  };

  disabledDate = x => {
    const { extraDisabledDate } = this.props;
    if (extraDisabledDate && typeof extraDisabledDate === 'function') {
      return extraDisabledDate(x);
    }
    return this.props.historic && x >= moment();
  };

  disabledStartDate = startValue => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return this.disabledDate(startValue);
    }
    return this.disabledDate(startValue) || endValue < startValue;
  };

  disabledEndDate = endValue => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return this.disabledDate(endValue);
    }
    return this.disabledDate(endValue) || endValue.valueOf() < startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: field === 'startValue' ? value && value.startOf('month') : value && value.endOf('month'),
    });
  };

  onStartChange = value => {
    this.onChange('startValue', value);
  };

  onEndChange = value => {
    this.onChange('endValue', value);
    this.props.onChange([this.state.startValue, value]);
  };

  handleStartOpenChange = open => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = open => {
    this.setState({ endOpen: open });
  };

  render() {
    const { startValue, endValue, endOpen } = this.state;
    const { changeChineseToLocale } = this.context;
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: 10 }}>
          <MonthPicker
            disabledDate={this.disabledStartDate}
            placeholder={changeChineseToLocale('开始月份')}
            format="YYYY-MM"
            value={startValue}
            onChange={this.onStartChange}
            onOpenChange={this.handleStartOpenChange}
          />
        </div>
        <MonthPicker
          disabledDate={this.disabledEndDate}
          placeholder={changeChineseToLocale('结束月份')}
          format="YYYY-MM"
          value={endValue}
          open={endOpen}
          onChange={this.onEndChange}
          onOpenChange={this.handleEndOpenChange}
        />
      </div>
    );
  }
}

MonthRangePicker.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default MonthRangePicker;
