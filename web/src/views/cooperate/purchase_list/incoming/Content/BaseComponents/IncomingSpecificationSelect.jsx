import React from 'react';
import _ from 'lodash';
import { Select } from 'components';
import { arrayIsEmpty } from 'utils/array';
import styles from '../../styles.scss';

const Option = Select.Option;
const SEPARATOR = '|';

type SpecificationSelectProps = {
  specifications: Array,
  onChange: (value: String) => void,
};

export function genSpecificationValue(specification: Object): String {
  if (!_.isEmpty(specification)) {
    const _specification = new Array(5);
    _specification[0] = specification.materialCode;
    _specification[1] = specification.numerator;
    _specification[2] = specification.unitId;
    _specification[3] = specification.unitName;
    _specification[4] = specification.id;
    _specification[5] = specification.denominator;
    return _specification.join(SEPARATOR);
  }
  return undefined;
}

export function getSpecificationParams(specification: String): Object {
  if (typeof specification === 'string') {
    const _specification = specification.split(SEPARATOR);
    return {
      materialCode: _specification[0],
      numerator: _specification[1],
      unitId: _specification[2],
      unitName: _specification[3],
      id: _specification[4],
      denominator: _specification[5],
    };
  }
  return null;
}

export default function SpecificationSelect(props: SpecificationSelectProps) {
  const { specifications, onChange, ...restProps } = props;
  const _specifications = arrayIsEmpty(specifications) ? [] : specifications.filter(n => Number(n.denominator) === 1);

  return (
    <Select className={styles.select} placeholder="请选择入厂规格" onChange={onChange} {...restProps}>
      {!arrayIsEmpty(_specifications)
        ? _specifications.map(n => (
            <Option
              value={`${n.materialCode}|${n.numerator}|${n.unitId}|${n.unitName}|${n.id}|${n.denominator}`}
              key={n.id}
              {...n}
              //   value={`${n.materialCode}|${n.numerator}|${n.unitId}|${n.unitName}|${n.id}|${n.denominator}`}
            >
              {n.denominator === 1 ? `${n.numerator} ${n.unitName}` : `${n.numerator}/${n.denominator} ${n.unitName}`}
            </Option>
          ))
        : null}
    </Select>
  );
}
