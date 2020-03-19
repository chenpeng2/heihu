import React from 'react';
import { FormItem, InputNumber, Table, Link, Icon } from 'components';
import { arrayIsEmpty } from 'utils/array';
import { amountValidator } from 'components/form';
import { changeChineseToLocaleWithoutIntl, changeChineseTemplateToLocale } from 'utils/locale/utils';
import QrCodeAndAmountModel from '../../../../../../models/cooperate/purchaseOrder/dataModels/QrCodeAndAmountModel';
import styles from '../../styles.scss';
import UnitSelect from './UnitSelect';

const formItemBaseStyle = { height: 60, margin: '8px 8px 0px -8px' };
const removeIconStyle = { cursor: 'pointer', marginBottom: 10, marginRight: '-4px' };

type SingleCodeAmountFormItemProps = {
  disabled: Boolean,
  fieldName: String,
  onChange: () => void,
  form: any,
  data: Number,
  units: Array<String>,
  unitName: String,
  formItemStyle: Object,
  required: Boolean,
  unitField: String,
  handleUnitSelectChange: () => void,
};

export function SingleCodeAmountFormItem(props: SingleCodeAmountFormItemProps): void {
  const {
    form,
    disabled,
    required,
    fieldName,
    unitField,
    data,
    onChange,
    unitName,
    units,
    formItemStyle,
    handleUnitSelectChange,
  } = props || {};
  const { getFieldDecorator } = form || {};

  return (
    <div className={styles['flex-inline-container']}>
      <FormItem style={formItemStyle || formItemBaseStyle}>
        {getFieldDecorator(fieldName, {
          initialValue: data,
          rules: [
            { required, message: changeChineseToLocaleWithoutIntl('请输入单个二维码的物料数量') },
            {
              validator: (rule, value, callback) => {
                if (!value && value !== 0) {
                  callback();
                  return;
                }
                if (isNaN(value)) {
                  callback(changeChineseToLocaleWithoutIntl('必须是数字'));
                  return;
                }
                if (value <= 0) {
                  callback(changeChineseToLocaleWithoutIntl('数字必须大于0'));
                  return;
                }
                callback();
              },
            },
            { validator: amountValidator(10e8, 0, null, 6, '物料数量') },
          ],
          onChange,
        })(<InputNumber className={styles['small-inputNumber']} disabled={disabled} placeholder="请输入数字" />)}
      </FormItem>
      <FormItem style={formItemStyle || formItemBaseStyle}>
        {getFieldDecorator(unitField, {
          initialValue: unitName,
          rules: [{ required: !disabled, message: '请选择单位' }],
          onChange: !disabled ? handleUnitSelectChange : null,
        })(<UnitSelect units={units} className={styles['small-select']} disabled={disabled} />)}
      </FormItem>
    </div>
  );
}

type QrCodeAmountFormItemProps = {
  fieldName: String,
  disabled: Boolean,
  form: any,
  onChange: () => void,
  data: Number,
  formItemStyle: Object,
  required: Boolean,
};

export function QrCodeAmountFormItem(props: QrCodeAmountFormItemProps): void {
  const { form, fieldName, required, disabled, data, onChange, formItemStyle } = props || {};
  const { getFieldDecorator } = form || {};

  return (
    <FormItem style={formItemStyle || formItemBaseStyle}>
      {getFieldDecorator(`${fieldName}`, {
        initialValue: data,
        onChange,
        rules: [
          {
            validator: (rule, value, callback) => {
              if (!value && value !== 0) {
                callback();
                return;
              }
              if (isNaN(value)) {
                callback('必须是数字');
                return;
              }
              if (value <= 0) {
                callback('数字必须大于0');
                return;
              }
              callback();
            },
          },
          { required, message: '请输入单个二维码的物料数量' },
          { validator: amountValidator(1000, 0, 'integer', null, '二维码') },
        ],
      })(<InputNumber className={styles['small-inputNumber']} disabled={disabled} placeholder="请输入数字" />)}
    </FormItem>
  );
}

type AddItemFooterProps = {
  disabled: Boolean,
  onAdd: () => void,
};

export function AddItemFooter(props: AddItemFooterProps): void {
  const { disabled, onAdd } = props || {};
  return (
    <Link
      icon="plus-circle-o"
      onClick={() => {
        if (typeof onAdd === 'function') onAdd();
      }}
      disabled={disabled}
    >
      {' '}
      {changeChineseToLocaleWithoutIntl('添加一行')}
    </Link>
  );
}

type QrCodeAndAmountProps = {
  data: Array<QrCodeAndAmountModel>,
  form: any,
  onAdd: () => void,
  onRemove: () => void,
  onChange: () => void,
  fieldName: String,
  disbaled: Boolean,
  units: Array<String>,
  unitName: String,
  checked: Boolean,
  unitField: String,
};

export default function QrCodeAndAmount(props: QrCodeAndAmountProps) {
  const { checked, data, form, fieldName, onAdd, onRemove, onChange, disabled, units, unitName, unitField } =
    props || {};
  const requiredSymbol = <span className={styles['required-symbol']}>*</span>;
  const singleCodeAmountTitle = (
    <span className={styles['qrCode-and-amount-title']}>
      {requiredSymbol}
      {changeChineseToLocaleWithoutIntl('物料数量')}
    </span>
  );
  const codeAmountTitle = (
    <span className={styles['qrCode-and-amount-title']}>
      {requiredSymbol}
      {changeChineseToLocaleWithoutIntl('二维码数量')}
    </span>
  );
  const singleCodeAmountField = index => `${fieldName}[${index}].singleCodeAmount`;
  const codeAmountField = index => `${fieldName}[${index}].codeAmount`;
  const columns = [
    {
      title: <div style={{ width: 14 }}>{''}</div>,
      key: 'removeIcon',
      dataindex: 'removeIcon',
      width: 30,
      render: (icon, record, i) => {
        if (!arrayIsEmpty(data) && data.length > 1 && !disabled) {
          return <Icon onClick={() => onRemove(i)} style={removeIconStyle} type="minus-circle" />;
        }
      },
    },
    {
      title: singleCodeAmountTitle,
      key: 'singleCodeAmount',
      dataIndex: 'singleCodeAmount',
      width: 200,
      render: (singleCodeAmount, record, i) => (
        <SingleCodeAmountFormItem
          required={checked}
          units={units}
          unitName={unitName}
          onChange={onChange}
          disabled={disabled}
          data={singleCodeAmount}
          form={form}
          fieldName={singleCodeAmountField(i)}
          unitField={unitField}
        />
      ),
    },
    {
      title: codeAmountTitle,
      key: 'codeAmount',
      dataIndex: 'codeAmount',
      width: 110,
      render: (codeAmount, record, i) => (
        <QrCodeAmountFormItem
          required={checked}
          disabled={disabled}
          data={codeAmount}
          form={form}
          onChange={onChange}
          fieldName={codeAmountField(i)}
        />
      ),
    },
  ];
  return (
    <Table
      dataSource={data}
      pagination={false}
      columns={columns}
      rowKey={(record, i) => i}
      style={{ margin: 0, marginBottom: 16, overflowX: 'hidden' }}
      footer={disabled ? null : () => <AddItemFooter onAdd={onAdd} />}
    />
  );
}
