import React from 'react';
import { DatePicker } from 'antd';
import moment from 'utils/time';
import Proptypes from 'prop-types';

const { WeekPicker } = DatePicker;

type Props = {
  onChange: () => {},
  historic: boolean,
};

class WeekRangePicker extends React.Component {
  props: Props;
  state = {
    startValue: null,
    endValue: null,
    endOpen: false,
  };

  static defaultProps = {
    onChange: () => {},
  };

  disabledDate = x => {
    return this.props.historic && x >= moment();
  };

  disabledStartDate = startValue => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return this.disabledDate(startValue) || endValue < startValue;
  };

  disabledEndDate = endValue => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return this.disabledDate(endValue) || endValue.valueOf() < startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = value => {
    this.onChange('startValue', value.startOf('week'));
  };

  onEndChange = value => {
    this.onChange('endValue', value);
    this.props.onChange([this.state.startValue, value.endOf('week')]);
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
          <WeekPicker
            disabledDate={this.disabledStartDate}
            placeholder={changeChineseToLocale('开始一周')}
            value={startValue}
            onChange={this.onStartChange}
            onOpenChange={this.handleStartOpenChange}
          />
        </div>
        <WeekPicker
          disabledDate={this.disabledEndDate}
          placeholder={changeChineseToLocale('结束一周')}
          value={endValue}
          open={endOpen}
          onChange={this.onEndChange}
          onOpenChange={this.handleEndOpenChange}
        />
      </div>
    );
  }
}

WeekRangePicker.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default WeekRangePicker;
