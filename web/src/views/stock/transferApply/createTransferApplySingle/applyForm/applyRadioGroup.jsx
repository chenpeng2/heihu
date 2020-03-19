import React from 'react';
import { Radio } from 'components';

const ApplyRadioGroup = ({ value, onChange }) => {
  return (
    <Radio.Group value={value} onChange={onChange}>
      <Radio value>是</Radio>
      <Radio value={false}>否</Radio>
    </Radio.Group>
  );
};

export default ApplyRadioGroup;
