import React from 'react';
import { Select } from 'src/components';
import styles from '../../styles.scss';

const Option = Select.Option;

type Props = {
  units: String[],
  disabled: Boolean,
};

export default function UnitSelect(props: Props) {
  const { units, ...restProps } = props;

  return (
    <Select className={styles.select} {...restProps}>
      {Array.isArray(units)
        ? units.map(unitName => (
            <Option title={unitName} value={unitName} key={unitName}>
              {unitName}
            </Option>
          ))
        : null}
    </Select>
  );
}
