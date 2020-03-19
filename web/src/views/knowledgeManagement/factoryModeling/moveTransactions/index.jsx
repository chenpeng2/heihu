import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { Spin, Button } from 'src/components';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { getMoveTransactions } from 'src/services/knowledgeBase/moveTransactions';
import log from 'src/utils/log';
import Filter from './filter';
import List from './list';
import { getCreateMoveTransactionsUrl } from './utils';
import { MOVE_TRANSACTIONS_STATUS } from './constants';

type Props = {
  match: any,
  history: any,
};

const MoveTransactions = (props: Props) => {
  const { match, history } = props;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const filterEl = useRef(null);

  const getFormatParams = value => {
    const { page, size, enable, name } = value;
    const params = {
      enable: enable && enable.key,
      name,
      page: page || 1,
      size: size || 10,
    };
    return params;
  };

  const fetchAndSetData = async value => {
    setLoading(true);
    try {
      setLocation(props, () => value);
      const params = getFormatParams(value);
      const res = await getMoveTransactions(params);
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
    setFieldsValue({ enable: MOVE_TRANSACTIONS_STATUS.all });
    handleSearch();
  };

  useEffect(() => {
    const setFieldsValue = _.get(filterEl, 'current.setFieldsValue');
    const query = getQuery(match);
    fetchAndSetData(query);
    setFieldsValue(query);
  }, []);

  return (
    <div>
      <Filter ref={filterEl} handleSearch={handleSearch} refreshData={fetchAndSetData} handleReset={handleReset} />
      <div style={{ margin: '20px 0 0 20px' }}>
        <Button
          icon="plus-circle-o"
          onClick={() => {
            history.push(getCreateMoveTransactionsUrl());
          }}
        >
          创建移动事务
        </Button>
      </div>
      <Spin spinning={loading}>
        <List data={data} refreshData={fetchAndSetData} />
      </Spin>
    </div>
  );
};

export default MoveTransactions;
