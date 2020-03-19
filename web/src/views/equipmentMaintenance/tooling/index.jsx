import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Spin } from 'src/components';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { getToolingList } from 'src/services/equipmentMaintenance/base';
import log from 'src/utils/log';
import Filter from './filter';
import List from './list';
import ToolingOperation from './toolingOperation';
import { getFormatSearchParams } from './utils';
import { TOOLING_STATUS } from './constants';

type Props = {
  match: any,
  history: any,
};

const MoveTransactions = (props: Props) => {
  const { match, history } = props;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const filterEl = useRef(null);
  const fetchAndSetData = async (values = {}) => {
    const query = getQuery(match);
    setLocation(props, () => values);
    setLoading(true);
    try {
      const params = getFormatSearchParams({ ...query, ...values });
      const res = await getToolingList(params);
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
      fetchAndSetData(values);
    });
  };

  const handleReset = () => {
    const resetFields = _.get(filterEl, 'current.resetFields');
    const setFieldsValue = _.get(filterEl, 'current.setFieldsValue');
    resetFields();
    setFieldsValue({ enable: TOOLING_STATUS.all });
    handleSearch();
  };

  useEffect(() => {
    const query = getQuery(match);
    const setFieldsValue = _.get(filterEl, 'current.setFieldsValue');
    fetchAndSetData();
    setFieldsValue(query);
  }, []);

  return (
    <div>
      <Filter ref={filterEl} handleSearch={handleSearch} refreshData={fetchAndSetData} handleReset={handleReset} />
      <ToolingOperation history={history} />
      <Spin spinning={loading}>
        <List data={data} refreshData={fetchAndSetData} />
      </Spin>
    </div>
  );
};

export default MoveTransactions;
