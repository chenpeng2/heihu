import React, { Fragment } from 'react';
import { FormItem, InputNumber, SearchSelect } from 'src/components';
import { amountValidator } from 'components/form';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import styles from './styles.scss';

const toleranceNumValid = {
  validator: amountValidator(
    {
      value: 100000000,
      equal: true,
      message: changeChineseToLocaleWithoutIntl('数量不超过100000000'),
    },
    -100000000,
  ),
};

type Props = {
  field: String,
  logic: Number,
  form: any,
};

const checkItemStandardFormItem = (props: Props) => {
  const { logic, form, field } = props;
  const { getFieldDecorator } = form;

  return (
    <Fragment>
      {logic === 8 ? (
        <Fragment>
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.base`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('标准值必填') }, toleranceNumValid],
            })(<InputNumber placeholder="标准值" />)}
          </FormItem>{' '}
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.deltaPlus`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('上偏差必填') }, toleranceNumValid],
            })(<InputNumber placeholder="上偏差" />)}
          </FormItem>{' '}
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.deltaMinus`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('下偏差必填') }, toleranceNumValid],
            })(<InputNumber placeholder="下偏差" />)}
          </FormItem>
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.unitId`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('单位必填') }],
            })(<SearchSelect type="unit" labelInValue placeholder="单位" />)}
          </FormItem>
        </Fragment>
      ) : null}
      {/* 区间 */}
      {logic === 0 ? (
        <Fragment>
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.min`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('最小值必填') }, toleranceNumValid],
            })(<InputNumber placeholder="最小值" />)}
          </FormItem>
          <span className={styles.text}>~</span>
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.max`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('最大值必填') }, toleranceNumValid],
            })(<InputNumber placeholder="最大值" />)}
          </FormItem>
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.unitId`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('单位必填') }],
            })(<SearchSelect type="unit" labelInValue placeholder="单位" />)}
          </FormItem>
        </Fragment>
      ) : null}
      {logic === 1 || logic === 2 || logic === 3 || logic === 4 || logic === 5 ? (
        <Fragment>
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.base`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('数值必填') }, toleranceNumValid],
            })(<InputNumber placeholder="数值" />)}
          </FormItem>
          <FormItem className={styles.formItem}>
            {getFieldDecorator(`qcCheckItemConfigs${field}.unitId`, {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('单位必填') }],
            })(<SearchSelect type="unit" labelInValue placeholder="单位" />)}
          </FormItem>
        </Fragment>
      ) : null}
    </Fragment>
  );
};

export default checkItemStandardFormItem;
