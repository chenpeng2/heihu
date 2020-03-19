import React, { Component, Fragment } from 'react';
import { FormItem, InputNumber, SearchSelect } from 'src/components';
import { amountValidator } from 'components/form';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import styles from '../styles.scss';

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
  standardBulk: Boolean,
};

class checkItemStandardFormItem extends Component {
  props: Props;

  render() {
    const { logic, form, field, standardBulk } = this.props;
    const { getFieldDecorator, validateFields } = form;

    return (
      <Fragment>
        {logic === 8 ? (
          <div style={{ display: 'flex' }}>
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.base`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('标准值必填'),
                  },
                  toleranceNumValid,
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.base`], { force: true });
                  });
                },
              })(<InputNumber placeholder="标准值" />)}
            </FormItem>{' '}
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.deltaPlus`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('上偏差必填'),
                  },
                  toleranceNumValid,
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.deltaPlus`], { force: true });
                  });
                },
              })(<InputNumber placeholder="上偏差" />)}
            </FormItem>{' '}
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.deltaMinus`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('下偏差必填'),
                  },
                  toleranceNumValid,
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.deltaMinus`], { force: true });
                  });
                },
              })(<InputNumber placeholder="下偏差" />)}
            </FormItem>
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.unitId`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('单位必填'),
                  },
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.unitId`], { force: true });
                  });
                },
              })(<SearchSelect type="unit" labelInValue placeholder="单位" />)}
            </FormItem>
          </div>
        ) : null}
        {/* 区间 */}
        {logic === 0 ? (
          <div style={{ display: 'flex' }}>
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.min`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('最小值必填'),
                  },
                  toleranceNumValid,
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.min`], { force: true });
                  });
                },
              })(<InputNumber placeholder="最小值" />)}
            </FormItem>
            <span className={styles.text}>~</span>
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.max`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('最大值必填'),
                  },
                  toleranceNumValid,
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.max`], { force: true });
                  });
                },
              })(<InputNumber placeholder="最大值" />)}
            </FormItem>
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.unitId`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('单位必填'),
                  },
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.unitId`], { force: true });
                  });
                },
              })(<SearchSelect type="unit" labelInValue placeholder="单位" />)}
            </FormItem>
          </div>
        ) : null}
        {logic === 1 || logic === 2 || logic === 3 || logic === 4 || logic === 5 ? (
          <div style={{ display: 'flex' }}>
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.base`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('数值必填'),
                  },
                  toleranceNumValid,
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.base`], { force: true });
                  });
                },
              })(<InputNumber placeholder="数值" />)}
            </FormItem>
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`qcCheckItemConfigs${field}.unitId`, {
                rules: [
                  {
                    required: typeof standardBulk === 'boolean' ? standardBulk : true,
                    message: changeChineseToLocaleWithoutIntl('单位必填'),
                  },
                ],
                onChange: () => {
                  this.setState({ updated: true }, () => {
                    validateFields([`qcCheckItemConfigs${field}.unitId`], { force: true });
                  });
                },
              })(<SearchSelect type="unit" labelInValue placeholder="单位" />)}
            </FormItem>
          </div>
        ) : null}
      </Fragment>
    );
  }
}

export default checkItemStandardFormItem;
