import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Spin, withForm, message } from 'src/components';
import { editmoveTransaction, getMoveTransactionDetail } from 'src/services/knowledgeBase/moveTransactions';
import log from 'src/utils/log';
import { getDetailMoveTransactionsUrl } from './utils';
import Base from './base';

type Props = {
  match: any,
  history: any,
  form: any,
};

const Edit = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { form, match, history } = props;
  const { code, transType } = _.get(match, 'location.query', {});
  const { validateFieldsAndScroll, setFieldsValue } = form;

  const handleSubmit = () => {
    validateFieldsAndScroll((err, values) => {
      if (err) return null;
      setLoading(true);
      editmoveTransaction(values)
        .then(() => {
          message.success('编辑移动事务成功');
          history.push(getDetailMoveTransactionsUrl(code));
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMoveTransactionDetail({ code });
      const data = _.get(res, 'data.data');
      if (data) {
        data.transType = `${transType}`;
        setFieldsValue(data);
      }
      setLoading(false);
    } catch (e) {
      log.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Spin spinning={loading}>
      <Base history={history} form={form} handleSubmit={handleSubmit} type={'edit'} />
    </Spin>
  );
};

export default withForm({}, Edit);
