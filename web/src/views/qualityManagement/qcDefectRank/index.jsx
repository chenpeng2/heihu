import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Spin } from 'src/components';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { getQcDefectRankList } from 'src/services/knowledgeBase/qcModeling/qcDefectRank';
import log from 'src/utils/log';
import Filter from './filter';
import List from './list';
import { getFormatSearchParams } from './utils';

type Props = {
  match: any,
};

const QcDefectRank = (props: Props) => {
  const { match } = props;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const filterEl = useRef(null);
  const query = getQuery(match);

  const fetchAndSetData = async value => {
    setLoading(true);
    try {
      setLocation(props, () => value);
      const params = getFormatSearchParams(value);
      const res = await getQcDefectRankList(params);
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

  useEffect(() => {
    const setFieldsValue = _.get(filterEl, 'current.setFieldsValue');
    fetchAndSetData(query);
    setFieldsValue(query);
  }, []);

  return (
    <div>
      <Filter ref={filterEl} handleSearch={handleSearch} refreshData={fetchAndSetData} />
      <Spin spinning={loading}>
        <List data={data} refreshData={fetchAndSetData} />
      </Spin>
    </div>
  );
};

export default QcDefectRank;
