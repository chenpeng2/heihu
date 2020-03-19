import { AVAILABLE_DATE_TYPE } from 'src/containers/workingCalendar/constant';
import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';

export const getAvailableDateValue = (data, dataType) => {
  if (!Array.isArray(data)) return null;

  const { name, type } = AVAILABLE_DATE_TYPE[dataType] || {};
  let _value = null;

  if (type === 'holiday') {
    _value = name;
  }

  if (type === 'specified') {
    _value = data.sort((a, b) => moment(a).isBefore(b)).join(',');
  }

  if (type === 'week') {
    _value = data.map(a => Number(a)).sort().map(value => {
      return moment.weekdays(true)[value - 1];
    }).join(',');
  }

  if (type === 'month') {
    _value = data.map(a => Number(a)).sort().map(value => moment.months(true)[value - 1]).join(',');
  }

  return _value;
};

export const getTimeRange = (startTime, endTime, type) => {
  if (type === 'holiday' || type === 'specified') {
    return replaceSign;
  }

  if (!startTime && !endTime) return '永久';

  const _startTime = startTime ? moment(startTime).format('YYYY/MM/DD') : replaceSign;
  const _endTime = endTime ? moment(endTime).format('YYYY/MM/DD') : replaceSign;

  return `${_startTime}~${_endTime}`;
};

export default 'dummy';
