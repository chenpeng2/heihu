import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'src/components';

const Option = Select.Option;
const WIDTH = 70;

const commonStyle = { width: WIDTH, display: 'inline-block' };

type Props = {
  style: {},
  value: { hour: string, minute: string },
  onChange: () => {},
};

const getMinutes = () => {
  const a = ['0', '1', '2', '3', '4', '5'];
  const b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const minutes = [];
  a.forEach(_a => {
    b.forEach(_b => {
      minutes.push(`${_a}${_b}`);
    });
  });
  return minutes;
};

class TimePicker extends Component {
  props: Props;
  state = {
    value: {
      hour: undefined,
      minute: undefined,
    },
    minutes: getMinutes(),
  };

  componentDidMount() {
    const { value } = this.props;
    this.setState({ value });
  }

  componentWillReceiveProps(nextProps) {
    const { value: valueNow } = this.props;
    const { value: valueNext } = nextProps;

    if (!_.isEqual(valueNext, valueNow)) {
      this.setState({ value: valueNext });
    }
  }

  renderHourSelect = () => {
    const { onChange: propOnChange } = this.props;

    const hours = [];
    for (let i = 0; i < 24; i += 1) {
      hours.push(i.toString());
    }

    const hour = _.get(this.state, 'value.hour');
    const onChange = value => {
      const minute = _.get(this.state, 'value.minute');
      const nextValue = { hour: value, minute };

      this.setState({ minutes: getMinutes() });

      this.setState({ value: nextValue });
      if (propOnChange && typeof propOnChange === 'function') propOnChange(nextValue);
    };

    return (
      <Select style={commonStyle} placeholder={'小时'} value={hour} onChange={onChange}>
        {hours.map(value => {
          return (
            <Option key={value} value={value}>
              {value}
            </Option>
          );
        })}
      </Select>
    );
  };

  renderMinuteSelect = () => {
    const { onChange: propOnChange } = this.props;

    const { minutes } = this.state;

    const minute = _.get(this.state, 'value.minute');
    const onChange = value => {
      const hour = _.get(this.state, 'value.hour');
      const nextValue = { hour, minute: value };

      this.setState({ value: nextValue });
      if (propOnChange && typeof propOnChange === 'function') propOnChange(nextValue);
    };

    return (
      <Select style={commonStyle} placeholder={'分钟'} value={minute} onChange={onChange}>
        {minutes.map(value => {
          return (
            <Option key={value} value={value}>
              {value}
            </Option>
          );
        })}
      </Select>
    );
  };

  render() {
    return (
      <div>
        {this.renderHourSelect()}
        <span>:</span>
        {this.renderMinuteSelect()}
      </div>
    );
  }
}

export default TimePicker;
