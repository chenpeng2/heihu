import React, { useState } from 'react';
import _ from 'lodash';
import { Spin, withForm, message } from 'src/components';
import { addTooling } from 'src/services/equipmentMaintenance/base';
import { getFormatParams, getToolingDetailUrl } from './utils';
import Base from './base';

type Props = {
  history: any,
  form: any,
};

const Create = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { form, history } = props;
  const { validateFieldsAndScroll } = form;

  const handleSubmit = () => {
    validateFieldsAndScroll((err, values) => {
      if (err) return null;
      const params = getFormatParams(values);
      setLoading(true);
      addTooling(params)
        .then(res => {
          message.success('创建模具成功');
          history.push(getToolingDetailUrl(_.get(res, 'data.data')));
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
