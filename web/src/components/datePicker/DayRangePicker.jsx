import React from 'react';
import moment from 'utils/time';
import Proptypes from 'prop-types';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

type Props = {
  onChange: () => {},
  historic: boolean,
};

export default class DayRangePicker extends React.Component {
  props: Props;
  state = {
    startValue: null,
    endValue: null,
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
    this.props.onChange(field);
  };

  disabledDate = x => {
    return this.props.historic && x >= moment().startOf('day');
  };

  render() {
    const { changeChineseToLocale } = this.context;
    return (
      <RangePicker
        {...this.props}
        placeholder={[changeChineseToLocale('开始日期'), changeChineseToLocale('结束日期')]}
        disabledDate={this.disabledDate}
        onChange={this.onChange}
      />
    );
  }
}

DayRangePicker.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};
