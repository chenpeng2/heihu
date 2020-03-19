import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { setLocation } from 'utils/url';
import moment from 'src/utils/time';
import MyStore from 'store';
import { getQuery } from 'src/routes/getRouteParams';
import { queryQcTaskList } from 'src/services/qualityManagement/qcTask';
import {
  setBatchOperation,
  setAllChecked,
  setSelectedRows,
  setMutiExportVisible,
} from 'src/store/redux/actions/qualityManagement/qcTask';
import log from 'src/utils/log';
import { QCTASK_STATUS_STARTED } from 'src/views/qualityManagement/constants';
import QcTaskFilter from './page/qcTaskFilter';
import QcTaskList from './page/qcTaskList';
import PageOperation from './page/pageOperation';
import { formatData } from './utils';

type Props = {
  match: {},
};

const QcTask = (props: Props) => {
  const { match } = props;
  const [data, setData] = useState(null);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(null);
  const filterEl = useRef(null);
  const query = getQuery(match);

  const resetExportConfig = status => {
    MyStore.dispatch(setMutiExportVisible(status === '2'));
    MyStore.dispatch(setBatchOperation(false));
    MyStore.dispatch(setAllChecked(false));
    MyStore.dispatch(setSelectedRows([]));
  };

  const setInitialData = () => {
    const setFieldsValue = _.get(filterEl, 'current.setFieldsValue');
    const { taskEndTime, taskStartTime } = query;
    if (taskEndTime && !_.isEmpty(taskEndTime)) {
      taskEndTime[0] = moment(taskEndTime[0]);
      taskEndTime[1] = moment(taskEndTime[1]);
      setFieldsValue({
        taskEndTime,
      });
    }

    if (taskStartTime && !_.isEmpty(taskStartTime)) {
      taskStartTime[0] = moment(taskStartTime[0]);
      taskStartTime[1] = moment(taskStartTime[1]);
      setFieldsValue({
        taskStartTime,
      });
    }
    resetExportConfig(query.status);
    setFieldsValue(query);
  };

  const fetchAndSetData = async params => {
    setLoading(true);
    // 因为需要对data做了format，所以提前setLocation
    setLocation(props, p => ({ ...p, ...params }));

    const query = getQuery(match);
    const _params = formatData({ ...query, ...params });

    await queryQcTaskList(_params)
      .then(({ data: { data, total } }) => {
        setData(data);
        setTotal(total);
      })
      .catch(e => log.error(e))
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    const validateFieldsAndScroll = _.get(filterEl, 'current.validateFieldsAndScroll');
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (sensors) {
          sensors.track('web_quanlity_taskList_search', {
            FilterCondition: values,
          });
        }
        fetchAndSetData({ ...values, page: 1, size: 10 });
        resetExportConfig(values.status);
      }
    });
  };

  useEffect(() => {
    setInitialData();
    if (!(query && query.status)) {
      query.status = `${QCTASK_STATUS_STARTED}`;
    }
    fetchAndSetData({ ...query, size: 10 });
  }, []);

  return (
    <div>
      <QcTaskFilter ref={filterEl} handleSearch={handleSearch} refreshData={fetchAndSetData} />
      <PageOperation total={total} form={_.get(filterEl, 'current')} />
      <QcTaskList data={data} total={total} refreshData={fetchAndSetData} loading={loading} />
    </div>
  );
};

export default QcTask;
