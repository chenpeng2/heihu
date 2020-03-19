import React from 'react';
import { FormItem, Input, Tooltip } from 'components';
import OrderFieldModel from 'models/cooperate/saleOrder/OrderFieldModel';
import styles from './CustomFields.scss';

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
  const { form, inputWidth, fields, prefix } = props;
  if (!Array.isArray(fields) || fields.length < 1) return null;

  return (
    <div>
      {fields.map(field => {
        const rules = [
          { max: field.maxLength, message: field.maxLengthMsg || `${field.name}的长度不能超过${field.maxLength}` },
        ];
        const initialValue = field.keyValue ? field.keyValue : '';
        return (
          <FormItem label={<Label title={field.name} />}>
            {form.getFieldDecorator(prefix ? `${prefix}.${field.name}` : field.name, { rules, initialValue })(
              <Input style={{ width: inputWidth }} />,
            )}
          </FormItem>
        );
      })}
    </div>
  );
};

export default CustomOrderField;
