import React from 'react';
import { Select } from 'components';
import { KeyTypes } from 'models/organizationConfig/SaleOrderCPModel';
import styles from './index.scss';

const Option = Select.Option;

type Props = {
  value: String,
  onChange: (value: String) => void,
  style: any,
  disabled: Boolean,
};

const TypeSelect = (props: Props) => {
  const { onChange, value, style, disabled } = props;
  return (
    <Select
      className={styles.select}
      style={style}
      value={value}
      onChange={onChange}
      showSearch={false}
      disabled={disabled}
    >
      {KeyTypes.map(type => (
        <Option title={type.name} value={type.key} key={type.key}>
          {type.name}
        </Option>
      ))}
    </Select>
  );
};

export default TypeSelect;
