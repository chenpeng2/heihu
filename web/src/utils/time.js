import moment from 'moment';
import 'moment/locale/zh-cn';

// TODO:bai moment 国际化。暂时不做，现在的国际化没有改变时区的处理，只有改变语言。不可根据语言改变时区，这样会造成错误数据
moment.locale('zh-cn');

export const now = () => moment().utcOffset(8);

export const nowWholeHour = () =>
  moment()
    .minutes(0)
    .seconds(0)
    .utcOffset(8);

export const formatUnix = (value, format) => moment.unix(value / 1000).format(format || 'YYYY/MM/DD HH:mm:ss');
export const formatUnixMoment = value => moment.unix(value / 1000);
export const formatToUnix = value =>
  moment(value)
    .set({ millisecond: 0 })
    .format('x');
export const formatRangeUnix = value => {
  if (!value || value.length === 0) {
    return [];
  }
  return [
    formatToUnix(
      moment(value[0]).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      }),
    ),
    formatToUnix(
      moment(value[1]).set({
        hour: 23,
        minute: 59,
        second: 59,
      }),
    ),
  ];
};

// 将不是moment的time range转换为moment time组成的time range
export const formatRangeTimeToMoment = value => {
  if (!Array.isArray(value) || value.length !== 2) return;
  return [value[0] ? moment(value[0]) : undefined, value[1] ? moment(value[1]) : undefined];
};

export const setDayStart = value =>
  moment(value).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
export const setDayEnd = value =>
  moment(value).set({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 0,
  });
export const formatDate = day => moment(new Date(day)).format('YYYY/MM/DD');
export const formatDateNoYear = day => moment(new Date(day)).format('MM/DD');
export const formatTodayUnderline = () => moment(new Date()).format('YYYY_MM_DD');

export const formatTime = time => moment(time).format('HH:mm:ss');

export const readableDate = day => moment(day).format('L');

export const format = (date, format = 'YYYY/MM/DD HH:mm:ss') => {
  let day = date;
  if (typeof date === 'string') {
    day = new Date(date);
  }
  return moment(day).format(format);
};

export const formatDateTime = (dateTime, format = 'YYYY/MM/DD HH:mm:ss') => moment(new Date(dateTime)).format(format);

export const formatDateHour = (dataTime, format = 'YYYY/MM/DD HH:mm') => moment(new Date(dataTime)).format(format);

export const formatDateHourNoYear = (dataTime, format = 'MM/DD HH:mm') => moment(new Date(dataTime)).format(format);

export const parseDate = time => moment(new Date(time));

export const nextDay = day => {
  const newDate = new Date(day);
  newDate.setDate(newDate.getDate() + 1);
  return moment(newDate);
};

export const nextHour = (day = new Date()) => {
  const newDate = new Date(day);
  newDate.setHours(newDate.getHours() + 1);
  newDate.setMinutes(0);
  return moment(newDate);
};

export const daysAgo = (days, date) => {
  const theDay = date || new Date();
  return moment(new Date(theDay.getTime() - days * 24 * 60 * 60 * 1000));
};

export const hoursAgo = hours => {
  return moment(new Date(new Date().getTime() - hours * 60 * 60 * 1000));
};

export const addHours = (day = new Date(), hours) => {
  return moment(new Date(day).getTime() + hours * 60 * 60 * 1000);
};

export const dayStart = day => {
  return moment(day).startOf('day');
};

export const dayEnd = day => {
  return moment(day).endOf('day');
};

export const lastWeek = (day = new Date()) => {
  return {
    from: daysAgo(7, day).startOf('week'),
    till: daysAgo(7, day).endOf('week'),
  };
};

export const nextWeek = (day = new Date()) => {
  return {
    from: daysAgo(-7, day).startOf('week'),
    till: daysAgo(-7, day).endOf('week'),
  };
};
export const diffInHours = (time1, time2) => {
  return moment(time1).diff(moment(time2), 'hours');
};

export const diff = (time1, time2, format = 'minutes') => moment(time1).diff(moment(time2), format);

export const beforeNow = time => moment(time).isBefore(now());

export const fromNow = time => moment(time).fromNow();

export const minDate = (time1, time2) => (moment(time1).diff(moment(time2)) < 0 ? time1 : time2);

export const maxDate = (time1, time2) => (moment(time1).diff(moment(time2)) > 0 ? time1 : time2);

export const isToday = time => moment(time).isSame(moment(), 'day');

export const isYesterday = time => moment(time).isSame(moment().subtract(1, 'days'), 'day');

export const showTodayTime = time =>
  moment(time)
    .calendar(null, { sameDay: `${['今天']} HH:mm:ss` });

export const showYesterdayTime = time =>
  moment(time)
    .calendar(null, { lastDay: `${['昨天']} HH:mm:ss` });

const genIntervals = () => [
  {
    name: 'today',
    display: '今天',
    from: formatDateTime(moment().startOf('day')),
    till: formatDateTime(moment().endOf('day')),
  },
  {
    name: 'yesterday',
    display: '昨天',
    from: formatDateTime(daysAgo(1).startOf('day')),
    till: formatDateTime(daysAgo(1).endOf('day')),
  },
  {
    name: 'thisWeek',
    display: '本周',
    from: formatDateTime(moment().startOf('week')),
    till: formatDateTime(moment().endOf('week')),
  },
  {
    name: 'lastWeek',
    display: '上周',
    from: formatDateTime(daysAgo(7).startOf('week')),
    till: formatDateTime(daysAgo(7).endOf('week')),
  },
  {
    name: 'tomorrow',
    display: '明天',
    from: formatDateTime(daysAgo(-1).startOf('day')),
    till: formatDateTime(daysAgo(-1).endOf('day')),
  },
  {
    name: 'nextWeek',
    display: '下周',
    from: formatDateTime(daysAgo(-7).startOf('week')),
    till: formatDateTime(daysAgo(-7).endOf('week')),
  },
  {
    name: 'nextMonth',
    display: '下月',
    from: formatDateTime(daysAgo(-30).startOf('month')),
    till: formatDateTime(daysAgo(-30).endOf('month')),
  },
];

export const genInterval = timeTag => {
  const interval = genIntervals().find(item => item.name === timeTag || item.display === timeTag);
  return interval;
};

export const BASE_SECOND_MILLISECONDS = 1000; // 1s = 1000ms
export const BASE_MINUTE_MILLISECONDS = 60 * BASE_SECOND_MILLISECONDS; // 1min = 60 * 1000ms
export const BASE_HOUR_MILLISECONDS = 60 * BASE_MINUTE_MILLISECONDS; // 1h = 3600 * 1000ms
export const BASE_DAY_MILLISECONDS = 24 * BASE_HOUR_MILLISECONDS; // 1day = 86400 * 1000ms

export const genMilliseconds = (length, format) => {
  switch (format) {
    case 'day':
      return length * BASE_DAY_MILLISECONDS;
    case 'minute':
      return length * BASE_MINUTE_MILLISECONDS;
    case 'hour':
      return length * BASE_HOUR_MILLISECONDS;
    case 'second':
      return length * BASE_MINUTE_MILLISECONDS;
    default:
      return length * BASE_DAY_MILLISECONDS;
  }
};

export default moment;
