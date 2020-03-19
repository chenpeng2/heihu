import React from 'react';
import { DatePicker as AntdDatePicker } from 'antd';
import moment from 'utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import RangePicker from './RangePicker';
import DayRangePicker from './DayRangePicker';
import WeekRangePicker from './WeekRangePicker';
import MonthRangePicker from './MonthRangePicker';
import QuarterRangePicker from './QuarterRangePicker';

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
}

class DatePicker extends React.PureComponent {
  state = {};
  render() {
    const { intl, placeholder, ...rest } = this.props;
    return <AntdDatePicker placeholder={changeChineseToLocale(placeholder || '请选择日期', intl)} {...rest} />;
  }
}

export const disabledTimeBeforeNow = current => {
  if (current && current.isSame(moment(), 'day')) {
    return {
      disabledHours: () => range(0, moment().hour() + (moment().minute() ? 1 : 0)),
    };
  }
  return {};
};

export const disabledDateBeforToday = current => {
  return current && current.valueOf() < moment().startOf('day');
};

DatePicker.MonthPicker = AntdDatePicker.MonthPicker;
DatePicker.RangePicker = RangePicker;
DatePicker.DayRangePicker = DayRangePicker;
DatePicker.WeekRangePicker = WeekRangePicker;
DatePicker.MonthRangePicker = MonthRangePicker;
DatePicker.QuarterRangePicker = QuarterRangePicker;
DatePicker.WeekPicker = AntdDatePicker.WeekPicker;

export default injectIntl(DatePicker);
