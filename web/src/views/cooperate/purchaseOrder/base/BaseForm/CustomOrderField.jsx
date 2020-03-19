import React from 'react';
import { FormItem, Input, Tooltip } from 'components';
import { checkTwoSidesTrim } from 'components/form';
import OrderFieldModel from 'models/cooperate/saleOrder/OrderFieldModel';
import styles from './CustomOrderField.scss';

const Label = ({ title }) => {
  const tooltipTitle = title && title.length > 7 ? title : '';
  return (
    <Tooltip title={tooltipTitle}>
      <p className={styles.label}>{title}</p>
    </Tooltip>
  );
};

type Props = {
  form: any,
  inputWidth: Number,
  fields: OrderFieldModel[],
};

/** 订单自定义字段 */
const CustomOrderField = (props: Props) => {
  const { form, inputWidth, fields } = props;
  if (!Array.isArray(fields) || fields.length < 1) return null;

  return (
    <div>
      {fields.map(field => {
        const rules = [
          { max: field.maxLength, message: field.maxLengthMsg },
          { validator: checkTwoSidesTrim('自定义字段') },
        ];
        const initialValue = field.keyValue ? field.keyValue : '';
        return (
          <FormItem label={<Label title={field.name} />}>
            {form.getFieldDecorator(field.name, { rules, initialValue })(<Input style={{ width: inputWidth }} />)}
          </FormItem>
        );
      })}
    </div>
  );
};

export default CustomOrderField;
