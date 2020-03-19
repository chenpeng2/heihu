import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Spin, withForm, message } from 'src/components';
import { updateTooling, getToolingListDetail } from 'src/services/equipmentMaintenance/base';
import log from 'src/utils/log';
import { getFormatParams, getFormatFormValue, getToolingDetailUrl } from './utils';
import Base from './base';

type Props = {
  match: any,
  history: any,
  form: any,
};

const Edit = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { form, match, history } = props;
  const id = _.get(match, 'location.query.id', '');
  const { validateFieldsAndScroll, setFieldsValue } = form;

  const handleSubmit = () => {
    validateFieldsAndScroll((err, values) => {
      if (err) return null;
      const params = getFormatParams(values);
      setLoading(true);
      updateTooling(id, params)
        .then(() => {
          message.success('编辑工装成功');
          history.push(getToolingDetailUrl(id));
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getToolingListDetail({ id });
      const data = _.get(res, 'data.data');
      if (data) {
        const formValue = getFormatFormValue(data);
        setFieldsValue(formValue);
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
