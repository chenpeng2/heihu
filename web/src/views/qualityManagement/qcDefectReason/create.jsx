import React from 'react';
import { Spin, withForm } from 'src/components';
import Base from './base';

type Props = {
  form: any,
  updating: Boolean,
  oncancel: () => {},
};

const Create = (props: Props) => {
  const { form, updating } = props;

  return (
    <Spin spinning={updating}>
      <Base form={form} type={'create'} />
    </Spin>
  );
};

export default withForm({}, Create);
