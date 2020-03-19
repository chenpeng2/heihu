import React from 'react';
import { DatePicker } from 'antd';
import moment, { now } from 'utils/time';
import Proptypes from 'prop-types';

const { MonthPicker } = DatePicker;

type Props = {
  onChange: () => {},
  historic: boolean,
};

class QuarterRangePicker extends React.Component {
  props: Props;
  state = {
    startValue: null,
    endValue: null,
    endOpen: false,
  };

  static defaultProps = {
    onChange: () => {},
  };

  disabledStartDate = startValue => {
    const endValue = this.state.endValue;
    const startMonth = startValue.month();
    if (startMonth === 0 || startMonth === 3 || startMonth === 6 || startMonth === 9) {
      if (!endValue) {
        return false;
      }
      return endValue < startValue;
    }
    return true;
  };

  disabledEndDate = endValue => {
    const startValue = this.state.startValue;
    const endMonth = endValue.month();
    if (endMonth === 2 || endMonth === 5 || endMonth === 8 || endMonth === 11) {
      if (!startValue) {
        return false;
      }
      return endValue < startValue;
    }
    return true;
  };

  onChange = (field, value) => {
    this.setState({
      [field]: field === 'startValue' ? value && value.startOf('quarter') : value && value.startOf('quarter'),
    });
  };

  onStartChange = value => {
    this.onChange('startValue', value && value.startOf('quarter'));
  };

  onEndChange = value => {
    this.onChange('endValue', value && value.endOf('quarter'));
    this.props.onChange([this.state.startValue, value && value.endOf('quarter')]);
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
            placeholder={changeChineseToLocale('开始季度')}
            format="Q"
            value={startValue}
            onChange={this.onStartChange}
            onOpenChange={this.handleStartOpenChange}
          />
        </div>
        <MonthPicker
          disabledDate={this.disabledEndDate}
          placeholder={changeChineseToLocale('结束季度')}
          format="Q"
          value={endValue}
          open={endOpen}
          onChange={this.onEndChange}
          onOpenChange={this.handleEndOpenChange}
        />
      </div>
    );
  }
}

QuarterRangePicker.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default QuarterRangePicker;
