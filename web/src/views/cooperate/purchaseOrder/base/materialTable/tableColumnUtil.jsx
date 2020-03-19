import React from 'react';
import _ from 'lodash';
import { Input, FormItem, Tooltip } from 'components';
import MaterialFieldModel from 'models/cooperate/saleOrder/MaterialFieldModel';
import { checkTwoSidesTrim } from 'components/form';
import { replaceSign } from 'constants';
import { thousandBitSeparator } from 'utils/number';

const FORM_ITEM_STYLE = {
  display: 'inline-block',
  height: 50,
  margin: '0 10px 0 0',
};
const fieldWidth = 120;

/** 销售订单自定义物料列 */
export const getSOCustomColumns = (fields, form, fieldName) => {
  if (!Array.isArray(fields)) return [];

  const renderInput = (field: MaterialFieldModel, record) => {
    const { key, lineCustomFields } = record;
    const name = `${fieldName}[${key}].${field.name}`;
    const node = _.find(lineCustomFields, o => _.get(o, 'keyName') === field.name);
    const { keyValue = '' } = node || {};
    const rules = [
      { max: field.maxLength, message: field.maxLengthMsg },
      { validator: checkTwoSidesTrim('自定义字段') },
    ];

    return (
      <FormItem style={{ ...FORM_ITEM_STYLE }}>
        {form.getFieldDecorator(name, {
          initialValue: keyValue,
          rules,
        })(<Input style={{ width: 100 }} />)}
      </FormItem>
    );
  };

  const columns = fields.map(field => {
    const column = {
      title: field.name,
      key: field.name,
      dataIndex: field.name,
      width: fieldWidth,
      render: (data, record) => renderInput(field, record),
    };
    return column;
  });
  return columns;
};

export const getEditColumns = (edit, title, key) => {
  if (!edit) return [];

  const renderAmountDone = (amount, record) => {
    if (typeof amount !== 'number') return replaceSign;
    return thousandBitSeparator(amount);
  };

  const renderAmountRetrieve = (amount, record) => {
    if (typeof amount !== 'number') return replaceSign;
    return thousandBitSeparator(amount);
  };

  const renderKeyColumn = (data, record) => {
    const display = _.get(data, 'length') ? _.join(data, ',') : replaceSign;
    return (
      <FormItem style={{ ...FORM_ITEM_STYLE, width: 120 }}>
        <Tooltip text={display} length={15} />
      </FormItem>
    );
  };

  const columns = [
    {
      title: '出厂数',
      dataIndex: 'amountDone',
      width: fieldWidth,
      render: renderAmountDone,
    },
    {
      title: '退货数',
      dataIndex: 'amountRetrieve',
      width: fieldWidth,
      render: renderAmountRetrieve,
    },
    {
      title: `${title}`,
      dataIndex: key,
      key,
      width: fieldWidth,
      render: renderKeyColumn,
    },
  ];
  return columns;
};
