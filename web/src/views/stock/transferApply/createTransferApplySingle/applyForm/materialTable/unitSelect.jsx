import React from 'react';
import { Select } from 'components';
import styles from '../styles.scss';

type Props = {
  value: any,
  units: any[],
};

const UnitSelect = (props: Props) => {
  const { units, value: defaultUnit } = props;
  const defaultUnitName = defaultUnit ? `${defaultUnit.name}` : null;

  return (
    <Select defaultValue={defaultUnitName} className={styles.unitSelect} disabled>
      {Array.isArray(units)
        ? units.map(unit => {
            return (
              <Select.Option key={unit.id} title={unit.name}>
                {unit.name}
              </Select.Option>
            );
          })
        : null}
    </Select>
  );
};

export default UnitSelect;
