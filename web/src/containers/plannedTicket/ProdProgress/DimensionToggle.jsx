import React, { useState, useEffect } from 'react';

import { Radio } from 'components';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

import { DimensionDisplay, Dimension } from './constants';
import styles from './styles.scss';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

type PropsType = {
  onToggleChange: () => {},
};

export default function DimensionToggle(props: PropsType) {
  const { onToggleChange, value, ...restProps } = props || {};
  const [dimension, setDimension] = useState(value);

  useEffect(() => {
    if (typeof onToggleChange === 'function') onToggleChange(dimension);
  }, [dimension]);

  return (
    <RadioGroup
      className={styles['dimension-toggle']}
      value={dimension}
      onChange={e => setDimension(e.target.value)}
      {...restProps}
    >
      {Object.keys(DimensionDisplay).map(key => (
        <RadioButton value={key}>{changeChineseToLocaleWithoutIntl(DimensionDisplay[key])}</RadioButton>
      ))}
    </RadioGroup>
  );
}
