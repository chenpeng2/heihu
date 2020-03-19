import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Searchselect, withForm, Form, FormItem, Input } from 'src/components';
import { checkStringLength } from 'src/components/form';
import { arrayIsEmpty } from 'src/utils/array';

import MonitorCondition, { formatConditionToSubmit } from './MonitorConditionSelect';

const ITEM_WIDTH = 200;

export const formatFormValueForSubmit = value => {
  if (!value) return null;
  const { name, wareHouses, ...rest } = value;
  return {
    name,
    warehouseCodes: arrayIsEmpty(wareHouses) ? null : wareHouses.map(i => i.key).filter(i => i),
    ...(formatConditionToSubmit(rest) || {}),
  };
};

// 将初始值格式化为form需要的值
const formatInitialValueToSet = value => {
  if (!value) return null;
  const { name, warehouseInfo, rules } = value;
  const { type, variables } = arrayIsEmpty(rules) ? {} : rules[0];
  const { compare, span, timeScale, status } = variables || {};
  return {
    name,
    wareHouses: arrayIsEmpty(warehouseInfo)
      ? undefined
      : warehouseInfo
          .filter(i => i)
          .map(i => {
            const { name, code } = i || {};
            return { label: name, key: code };
          }),
    monitorCondition: type,
    sign: compare,
    qaStatus: !arrayIsEmpty(status) ? status[0] : undefined,
    businessStatus: typeof status === 'number' ? status : undefined,
    time: span,
    timeUnit: timeScale,
  };
};

const BaseForm = (props, context) => {
  const { form, initialData } = props;
  const { changeChineseToLocale } = context;
  const { getFieldDecorator } = form;

  // 如果有初始值，那么将初始值填入
  useEffect(() => {
    if (initialData) form.setFieldsValue(formatInitialValueToSet(initialData) || {});
  }, [JSON.stringify(initialData)]);

  return (
    <Form>
      <FormItem label={'条件名称'}>
        {getFieldDecorator('name', {
          rules: [
            {
              required: true,
              message: changeChineseToLocale('名称必填'),
            },
            {
              validator: checkStringLength(12),
            },
          ],
        })(<Input style={{ width: ITEM_WIDTH }} />)}
      </FormItem>
      <FormItem required label={'监控对象'}>
        <Input value={'二维码'} disabled style={{ width: ITEM_WIDTH }} />
      </FormItem>
      <FormItem label={'监控位置'}>
        {getFieldDecorator('wareHouses', {
          rules: [
            {
              required: true,
              message: changeChineseToLocale('监控位置必填'),
            },
          ],
        })(<Searchselect style={{ width: ITEM_WIDTH * 2 }} type={'wareHouseWithCode'} mode={'multiple'} />)}
      </FormItem>
      <FormItem required label={'监控条件'}>
        <MonitorCondition initialData={formatInitialValueToSet(initialData) || {}} form={form} />
      </FormItem>
    </Form>
  );
};

BaseForm.propTypes = {
  style: PropTypes.any,
  form: PropTypes.any,
  initialData: PropTypes.any,
};

BaseForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, BaseForm);
