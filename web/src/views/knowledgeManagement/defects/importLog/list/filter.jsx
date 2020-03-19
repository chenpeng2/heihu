import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { DatePicker, Button, FormattedMessage } from 'src/components';
import moment, { dayEnd, formatDateTime, daysAgo, formatToUnix, dayStart } from 'src/utils/time';

const RangePicker = DatePicker.RangePicker;

const Filter = props => {
  const [dateRange, setDateRange] = useState([]);
  const { refetch, style } = props;

  const defaultDate = [moment(formatDateTime(daysAgo(30))), moment(formatDateTime(daysAgo(0)))];
  const formatDate = date => [formatToUnix(dayStart(date[0])), formatToUnix(dayEnd(date[1]))];

  const params = { page: 1, size: 10, fromAt: dateRange[0], toAt: dateRange[1] };

  useEffect(() => {
    setDateRange(formatDate(defaultDate));

    if (typeof refetch === 'function') {
      refetch(params);
    }
  }, []);

  return (
    <div style={style}>
      <FormattedMessage style={{ marginRight: 10 }} defaultMessage={'导入时间'} />
      <RangePicker
        defaultValue={defaultDate}
        onChange={date => {
          setDateRange(formatDate(date));
        }}
      />
      <Button
        icon="search"
        style={{ width: 86, marginLeft: 10 }}
        onClick={() => {
          if (typeof refetch === 'function') {
            refetch(params);
          }
        }}
      >
        查询
      </Button>
    </div>
  );
};

Filter.propTypes = {
  style: PropTypes.any,
  refetch: PropTypes.any,
};

export default Filter;
