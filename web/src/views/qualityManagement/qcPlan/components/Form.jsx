import React from 'react';
import { FormItem, Radio } from 'components';
import styles from './index.scss';

/** 单选项 */
export const RadioItem = props => {
  const { label, fieldId, fieldOptions, radioOptions, form, required } = props;

  return (
    <FormItem label={label} required={required}>
      {form.getFieldDecorator(fieldId, fieldOptions)(
        <Radio.Group className={styles.formItem} options={radioOptions} />,
      )}
    </FormItem>
  );
};
