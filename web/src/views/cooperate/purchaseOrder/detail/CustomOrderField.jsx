import React from 'react';
import { replaceSign } from 'constants';
import { middleGrey } from 'styles/color';
import { Tooltip } from 'components';
import OrderFieldModel from 'models/cooperate/saleOrder/OrderFieldModel';
import styles from './CustomOrderField.scss';

const Item = ({ label, component }) => {
  const labelStyle = {
    color: middleGrey,
    width: 100,
    display: 'inline-block',
    textAlign: 'right',
  };
  const componentStyle = {
    display: 'inline-block',
    marginLeft: 10,
    verticalAlign: 'top',
    maxWidth: 1000,
    overflowWrap: 'break-word',
  };
  const containerStyle = {
    margin: '20px 0 20px 20px',
  };
  const tooltipTitle = label && label.length > 7 ? label : '';

  return (
    <div style={containerStyle}>
      <Tooltip title={tooltipTitle}>
        <p className={styles.title} style={labelStyle}>
          {' '}
          {label}{' '}
        </p>
      </Tooltip>{' '}
      <div style={componentStyle}> {component || replaceSign} </div>
    </div>
  );
};

type Props = {
  fields: OrderFieldModel[],
};

/** 订单自定义字段 */
const CustomOrderField = (props: Props) => {
  const { fields } = props;
  if (!Array.isArray(fields) || fields.length < 1) return null;

  return (
    <div>
      {fields.map(field => {
        return <Item label={field.name} component={field.keyValue} />;
      })}
    </div>
  );
};

export default CustomOrderField;
