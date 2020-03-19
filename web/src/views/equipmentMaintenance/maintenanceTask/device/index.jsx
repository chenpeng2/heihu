import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import moment, { dayStart, dayEnd } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { Spin } from 'src/components';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { getMaintenanceTaskList } from 'src/services/equipmentMaintenance/maintenanceTask';
import log from 'src/utils/log';
import Filter from './filter';
import List from './list';

type Props = {
  match: any,
};

const DeviceMaintenanceTask = (props: Props) => {
  const { match } = props;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const filterEl = useRef(null);

  const getFormatParams = value => {
    const formatParams = {
      searchTargetType: 'equipmentProd',
    };
    Object.keys(value).forEach(n => {
      if (value[n]) {
        switch (n) {
          case 'deadline':
            if (!arrayIsEmpty(value.deadline)) {
              const searchDeadline = value.deadline.map(n => moment(n));
              formatParams.searchDeadlineFrom = Date.parse(dayStart(searchDeadline[0]));
              formatParams.searchDeadlineTill = Date.parse(dayEnd(searchDeadline[1]));
            }
            break;
          case 'searchTargetId':
            formatParams[n] = parseInt(value[n].key.split(';')[0], 10);
            break;
          default: {
            if (value[n].key) {
              formatParams[n] = value[n].key;
            } else {
              formatParams[n] = value[n];
            }
          }
        }
      }
    });
    return formatParams;
  };

  const fetchAndSetData = async value => {
    setLoading(true);
    if (value && value.deviceSearch) {
      delete value.deviceSearch;
    }
    try {
      setLocation(props, p => ({ ...p, deviceSearch: value }));
      const params = getFormatParams(value);
      const res = await getMaintenanceTaskList({ ...params, searchTaskCategory: 'maintain' });
      const data = _.get(res, 'data');
      setData(data);
      setLoading(false);
    } catch (e) {
      log.error(e);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const validateFieldsAndScroll = _.get(filterEl, 'current.validateFieldsAndScroll');
    validateFieldsAndScroll((err, values) => {
      if (err) return null;
      fetchAndSetData({ ...values, size: 10, page: 1 });
    });
  };

  useEffect(() => {
    const setFieldsValue = _.get(filterEl, 'current.setFieldsValue');
    const deviceSearch = _.get(getQuery(match), 'deviceSearch', {});
    fetchAndSetData(deviceSearch);
    if (deviceSearch.deadline) {
      deviceSearch.deadline = deviceSearch.deadline.map(n => moment(n));
    }
    setFieldsValue(deviceSearch);
  }, []);

  return (
    <div>
      <Filter ref={filterEl} handleSearch={handleSearch} />
      <div style={{ marginBottom: 150 }}>
        <Spin spinning={loading}>
          <List data={data} refetch={fetchAndSetData} />
        </Spin>
      </div>
    </div>
  );
};

export default withRouter(DeviceMaintenanceTask);
