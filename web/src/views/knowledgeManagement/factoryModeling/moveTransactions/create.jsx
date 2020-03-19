import React, { useState } from 'react';
import { Spin, withForm, message } from 'src/components';
import { createmoveTransaction } from 'src/services/knowledgeBase/moveTransactions';
import { getDetailMoveTransactionsUrl } from './utils';
import Base from './base';

type Props = {
  history: any,
  form: any,
};

const Create = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { form, history } = props;
  const { validateFieldsAndScroll, resetFields } = form;

  const handleSubmit = keepCreate => {
    validateFieldsAndScroll((err, values) => {
      if (err) return null;
      setLoading(true);
      createmoveTransaction(values)
        .then(() => {
          message.success('创建移动事务成功');
          if (keepCreate) {
            resetFields();
          } else {
            history.push(getDetailMoveTransactionsUrl(values.code, values.transType));
          }
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  return (
    <Spin spinning={loading}>
      <Base history={history} form={form} handleSubmit={handleSubmit} type={'create'} />
    </Spin>
  );
};

export default withForm({}, Create);
