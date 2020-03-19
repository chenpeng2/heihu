import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Spin, withForm } from 'src/components';
import { getQcDefectReasonDetail } from 'src/services/knowledgeBase/qcModeling/qcDefectReason';
import log from 'src/utils/log';
import Base from './base';

type Props = {
  match: any,
  form: any,
  id: any,
  onCancel: () => {},
  updating: Boolean,
};

const Edit = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { id, form, onCancel, updating } = props;
  const { setFieldsValue } = form;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getQcDefectReasonDetail(id);
      const data = _.get(res, 'data.data');
      if (data) {
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
    <Spin spinning={updating || loading}>
      <Base onCancel={onCancel} form={form} type={'edit'} />
    </Spin>
  );
};

export default withForm({}, Edit);
