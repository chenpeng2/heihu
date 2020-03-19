import React, { Component } from 'react';
import _ from 'lodash';

import { DatePicker } from 'antd';

type Props = {
  style: {},
  onChange: () => {},
  value: any,
};

class SeparateDateRangePicker extends Component {
  props: Props;
  state = {
    value: {
      startTime: null,
      endTime: null,
    },
  };

  componentDidMount() {
    const value = this.props.value;

    if (value) {
      this.setState({ value });
    }
  }

  componentWillReceiveProps(nextProps) {
    const valueNow = _.get(this.props, 'value');
    const valueNext = _.get(nextProps, 'value');

    if (!_.isEqual(valueNow, valueNext)) {
      this.setState({ value: valueNext });
    }
  }

  render() {
    const { value } = this.state;
    const { style, onChange } = this.props;

    const _onChange = (startTime, endTime) => {
      const { startTime: lastStartTime, endTime: lastEndTime } = this.state.value;

      const nextValue = { startTime: startTime || lastStartTime, endTime: endTime || lastEndTime };

      this.setState({ value: nextValue });

      if (onChange && typeof onChange === 'function') onChange(nextValue);
    };

    return (
      <div>
        <DatePicker
          value={value.startTime}
          style={{ width: 195, marginRight: 10, ...style }}
          onChange={value => _onChange(value)}
        />
        <DatePicker value={value.endTime} style={{ width: 195, ...style }} onChange={value => _onChange(null, value)} />
      </div>
    );
  }
}

export default SeparateDateRangePicker;
