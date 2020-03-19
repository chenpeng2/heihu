import React from 'react';
import { FormItem } from 'src/components';
import QcDefectReasonSelect from '../qcDefectReasonSelect';

type Props = {
  field: String,
  logic: Number,
  showLabel: Boolean,
  form: any,
};

const DefectReasonFormItem = (props: Props) => {
  const { logic, form, field, showLabel = false } = props;
  const { getFieldDecorator } = form;
  return (
    <FormItem style={{ width: showLabel ? 'auto' : 280 }} label={showLabel ? '不良原因细分' : ''}>
      {getFieldDecorator(`qcCheckItemConfigs${field}.qcDefectConfigs`)(
        <QcDefectReasonSelect
          disabled={logic === 7}
          params={{ searchStatus: 1, size: 999 }}
          mode="multiple"
          labelInValue
          style={{ width: 280 }}
        />,
      )}
    </FormItem>
  );
};

export default DefectReasonFormItem;
