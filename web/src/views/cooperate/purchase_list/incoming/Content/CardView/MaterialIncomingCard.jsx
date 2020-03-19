import React, { Component, useMemo } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import {
  Icon,
  Input,
  DatePicker,
  FormItem,
  Tooltip,
  Select,
  InputNumber,
  AddressSelect,
  SingleStorageSelect,
  DetailPageItemContainer,
  PlainText,
} from 'components';
import { safeSub, safeDiv, safeMul } from 'utils/number';
import { primary } from 'src/styles/color';
import { arrayIsEmpty } from 'utils/array';
import { replaceSign } from 'src/constants';
import { orderNumberFormat, amountValidator } from 'components/form';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { QC_STATUS } from '../../../constants';
import PurchaseMaterialIncomingCardModel from '../../../../../../models/cooperate/purchaseOrder/viewModels/PurchaseIncomingCardViewModel';
import UnitSelect from '../BaseComponents/UnitSelect';
import IncomingSpecificationSelect, { genSpecificationValue } from '../BaseComponents/IncomingSpecificationSelect';
import QrCodeAndAmount from '../BaseComponents/QrCodeAndAmount';
import CheckBoxWithMaterial from '../BaseComponents/CheckBoxWithMaterial';
import { useQrCode, taskDispatchType, FIELDNAME } from '../../utils';
import styles from '../../styles.scss';
import QrCodeAndAmountModel from '../../../../../../models/cooperate/purchaseOrder/dataModels/QrCodeAndAmountModel';

const Option = Select.Option;
const INVISIBLE_STYLE = { display: 'none' };
const secondaryTextStyle = { fontSize: 12, color: 'rgb(0, 0, 0, 0.4)', textIndent: 26 };

type PurchaseMaterialIncomingCardPropTypes = {
  form: any,
  data: PurchaseMaterialIncomingCardModel,
  index: Number,
  onQrCodeAndAmountAdd: () => void,
};

type PurchaseMaterialIncomingCardStateType = {
  data: PurchaseMaterialIncomingCardModel,
  selectSpecification: Object,
};

type CardContainerPropTypes = {
  title: any,
};

export function CardContainer(props: CardContainerPropTypes) {
  const { children, title, className, ...restProps } = props || {};
  return (
    <div className={classNames(styles['card-container'], className)} {...restProps}>
      <p>{title}</p>
      <div className={styles['card-container-content']}>{children}</div>
    </div>
  );
}

export default class PurchaseMaterialIncomingCard extends Component<
  PurchaseMaterialIncomingCardPropTypes,
  PurchaseMaterialIncomingCardStateType,
> {
  state = {
    data: new PurchaseMaterialIncomingCardModel(),
  };

  componentDidMount() {
    this.setInitialData(this.props.data);
  }

  shouldComponentUpdate(nextProps, nextstate) {
    if (this.props.data !== nextProps.data) {
      this.setInitialData(nextProps.data);
    }
    return true;
  }

  setInitialData = (data: PurchaseMaterialIncomingCardModel) => {
    this.setState({ data });
    this.props.form.resetFields([`${FIELDNAME}`]);
  };

  updateData = (data: PurchaseMaterialIncomingCardModel) => {
    this.setState({ data });
  };

  onQrCodeAndAmountAdd = (): void => {
    const { data } = this.state;
    data.addQrCodeAndAmount();
    this.updateData(data);
  };

  onQrCodeAndAmountRemove = (rowIndex: Number, qrCodeAndAmountField: String): void => {
    const { data } = this.state;
    data.removeQrCodeAndAmount(rowIndex);
    data.updateAmountByQrCodeAmount();
    this.updateData(data);
    this.props.form.resetFields([qrCodeAndAmountField]);
  };

  /** 本次入厂数变化 */
  handleAmountChange = (amountValue: Number, amountField: String): void => {
    const { data } = this.state;
    data.updateItem('amount', amountValue);
    data.updateQrCodeAndAmountByVariables();
    this.updateData(data);
  };

  /** 入厂规格变化 */
  handleIncomingSpecificationChange = (v: String, option: Object, unitFieldName: String, amountField: String): void => {
    const { numerator, unitName, denominator } = _.get(option, 'props', {});
    const { data } = this.state;
    data.updateItem('incomingSpecification', _.get(option, 'props', {}));
    data.updateItem('useUnit', unitName);
    const amount = this.props.form.getFieldValue(`${amountField}`);
    setTimeout(() => {
      this.handleAmountChange(amount, amountField);
    });
  };

  /** 二维码数量变化 */
  handleQrCodeAndAmountChange = (qrCodeAndAmountField: String, amountField: String): void => {
    setTimeout(() => {
      const { data } = this.state;
      const qrCodeAndAmount = this.props.form.getFieldValue(qrCodeAndAmountField);
      data.updateItem('qrCodeAndAmount', qrCodeAndAmount);
      data.updateAmountByQrCodeAmount();
      this.updateData(data);
      this.props.form.resetFields([amountField]);
    });
  };

  /** 生产日期变化：有效期至 = 生产日期 + 物料存储有效期 */
  handleProductionDateChange = (v: Object, validDateField: String) => {
    const { data } = this.state;
    if (data.materialValidTime) {
      data.updateProductionDate(v);
      data.updateValidDateByProductionDate();
      this.updateData(data);
      this.props.form.resetFields([validDateField]);
    }
    setTimeout(() => {
      this.props.form.validateFields([validDateField], { force: true });
    });
  };

  /** checkbox变化 */
  handleMaterialCheckBoxChange = (e: any) => {
    const checked = _.get(e.target, 'checked');
    const { data } = this.state;
    const { form, index } = this.props;
    data.updateItem('checked', checked);
    this.updateData(data);
    form.resetFields([`${FIELDNAME}[${index}]`]);
  };

  /** 单位选择变化：物料没有入厂规格时，是可以选择入厂单位的 */
  handleUnitSelectChange = (v: String) => {
    const { data } = this.state;
    data.updateItem('useUnit', v);
    this.updateData(data);
  };

  /** 有效期至变化：有效期不能小于生产日期 */
  handleValidDateChange = (v: Object, productionDateField: String) => {
    setTimeout(() => {
      this.props.form.validateFields([productionDateField], { force: true });
    });
  };

  render() {
    const { form, index } = this.props;
    const { getFieldDecorator, validateFields, getFieldsValue } = form || {};
    const { data } = this.state;
    const {
      materialName,
      materialCode,
      masterUnit,
      materialValidTime,
      purchaseOrderCode,
      projectCode,
      planWorkOrderCode,
      recentUnitName,
      useUnit,
      materialUnitNames,
      incomingSpecification, // 采购清单物料入厂时选的 入厂规格
      incomingSpecifications, // 物料定义中配置的所有 入厂规格
      supplierBatch,
      incomingBatch,
      supplierName,
      checked,
      amount,
      validDateMoment,
      productionDateMoment,
      incomingNote,
      recentStorage,
      inputFactoryQcConfigs,
      qrCodeAndAmount,
      materialLineId,
      demandDateMoment,
    } = data || {};
    const unitField = `${FIELDNAME}[${index}].useUnit`;
    const checkedField = `${FIELDNAME}[${index}].checked`;
    const materialLineIdField = `${FIELDNAME}[${index}].materialLineId`;
    const materialCodeField = `${FIELDNAME}[${index}].materialCode`;
    const amountField = `${FIELDNAME}[${index}].amount`;
    const qrCodeAndAmountField = `${FIELDNAME}[${index}].qrCodeAndAmount`;
    const validDateField = `${FIELDNAME}[${index}].validDateMoment`;
    const productionDateField = `${FIELDNAME}[${index}].productionDateMoment`;
    const incomingSpecificationField = `${FIELDNAME}[${index}].incomingSpecification`;
    const qualityStatus = !arrayIsEmpty(inputFactoryQcConfigs) ? QC_STATUS.WAIT : QC_STATUS.STANDARD;
    const cardTitle = (
      <div>
        <CheckBoxWithMaterial
          onChange={this.handleMaterialCheckBoxChange}
          materialName={materialName}
          materialCode={materialCode}
          checked={checked}
        />
        <PlainText
          style={secondaryTextStyle}
          text="需求时间 {demandDateMoment}"
          intlParams={{ demandDateMoment: demandDateMoment || replaceSign }}
        />
      </div>
    );
    return (
      <CardContainer className={styles['purchase-material-incoming-card']} title={cardTitle}>
        <FormItem style={INVISIBLE_STYLE}>
          {getFieldDecorator(checkedField, {
            initialValue: checked,
          })(<Input />)}
        </FormItem>
        <FormItem style={INVISIBLE_STYLE}>
          {getFieldDecorator(materialCodeField, {
            initialValue: materialCode,
          })(<Input />)}
        </FormItem>
        <FormItem style={INVISIBLE_STYLE}>
          {getFieldDecorator(materialLineIdField, {
            initialValue: materialLineId,
          })(<Input />)}
        </FormItem>
        <FormItem label="订单编号">
          <Tooltip text={purchaseOrderCode || replaceSign} length={25} />
        </FormItem>
        <FormItem label={taskDispatchType === 'manager' ? '计划工单编号' : '项目编号'}>
          <Tooltip
            text={taskDispatchType === 'manager' ? planWorkOrderCode || replaceSign : projectCode || replaceSign}
            length={25}
          />
        </FormItem>
        {useQrCode ? (
          <FormItem label="入厂规格">
            {getFieldDecorator(incomingSpecificationField, {
              initialValue: genSpecificationValue(incomingSpecification),
              onChange: (v, opt) => this.handleIncomingSpecificationChange(v, opt, unitField, amountField),
              rules: [
                {
                  required: checked && !arrayIsEmpty(incomingSpecifications),
                  message: '请选择入厂规格',
                },
              ],
            })(
              <IncomingSpecificationSelect
                disabled={!checked || arrayIsEmpty(incomingSpecifications)}
                className={styles.input}
                specifications={incomingSpecifications}
              />,
            )}
          </FormItem>
        ) : null}
        {useQrCode ? (
          <div className={styles['flex-inline-container']}>
            <FormItem label="本次入厂数">
              {getFieldDecorator(`${amountField}`, {
                initialValue: amount,
                rules: [
                  { required: checked, message: '请填写本次入厂数' },
                  { validator: amountValidator(10e5, 0, null, 6) },
                ],
                onChange: v => this.handleAmountChange(v, amountField, qrCodeAndAmountField),
              })(
                <InputNumber
                  disabled={arrayIsEmpty(incomingSpecifications) || !checked}
                  className={styles['middle-inputNumber']}
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator(unitField, {
                initialValue: useUnit,
                rules: [{ required: checked, message: '请选择单位' }],
                // onChange: arrayIsEmpty(incomingSpecifications) ? this.handleUnitSelectChange : null,
              })(<UnitSelect units={materialUnitNames} disabled className={styles['small-select']} />)}
            </FormItem>
          </div>
        ) : null}
        <QrCodeAndAmount
          checked={checked}
          units={materialUnitNames}
          unitField={unitField}
          unitName={useUnit}
          onAdd={this.onQrCodeAndAmountAdd}
          onRemove={rowIndex => this.onQrCodeAndAmountRemove(rowIndex, qrCodeAndAmountField)}
          fieldName={qrCodeAndAmountField}
          index={index}
          form={form}
          disabled={!checked || !arrayIsEmpty(incomingSpecifications)}
          onChange={() => this.handleQrCodeAndAmountChange(qrCodeAndAmountField, amountField)}
          data={qrCodeAndAmount}
        />
        <FormItem label="入厂位置">
          {getFieldDecorator(`${FIELDNAME}[${index}].storage`, {
            rules: [{ required: checked, message: '请选择入厂位置' }],
            initialValue: recentStorage,
          })(<SingleStorageSelect style={{ width: 200 }} params={{ qualityStatus }} disabled={!checked} />)}
        </FormItem>
        {useQrCode ? <FormItem label="供应商">{supplierName || replaceSign}</FormItem> : null}
        <FormItem label="供应商批次">
          {getFieldDecorator(`${FIELDNAME}[${index}].supplierBatch`, {
            initialValue: supplierBatch,
            rules: [{ max: 20, message: '最多输入20个字符' }, { validator: orderNumberFormat('供应商批次') }],
          })(<Input disabled={!checked} className={styles.input} placeholder="请输入供应商批次" />)}
        </FormItem>
        {useQrCode ? null : (
          <FormItem label="入厂规格">
            {getFieldDecorator(`${FIELDNAME}[${index}].incomingSpecification`, {
              initialValue: incomingSpecification,
            })(
              <Select
                className={styles.input}
                disabled={!checked || arrayIsEmpty(incomingSpecifications)}
                placeholder="请选择入厂规格"
                labelInValue
              >
                {arrayIsEmpty(incomingSpecifications)
                  ? []
                  : incomingSpecifications.map(n => (
                      <Option
                        value={`${n.materialCode}|${n.numerator}|${n.unitId}|${n.unitName}|${n.id}|${n.denominator}`}
                      >
                        {`${n.numerator}${n.unitName}`}
                      </Option>
                    ))}
              </Select>,
            )}
          </FormItem>
        )}
        <FormItem label="产地">
          {getFieldDecorator(`${FIELDNAME}[${index}].productionPlace`)(
            <AddressSelect showSearch disabled={!checked} style={{ width: 200 }} placeholder="请选择产地" />,
          )}
        </FormItem>
        <FormItem
          label={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip placement="top" title={changeChineseToLocaleWithoutIntl('不填时按照系统默认逻辑生成入厂批次')}>
                <Icon style={{ marginLeft: 5, color: primary }} type="question-circle-o" />
              </Tooltip>
              {changeChineseToLocaleWithoutIntl('入厂批次')}
            </div>
          }
        >
          {getFieldDecorator(`${FIELDNAME}[${index}].incomingBatch`, {
            initialValue: incomingBatch,
            rules: [{ max: 20, message: '最多输入20个字符' }, { validator: orderNumberFormat('入厂批次') }],
          })(<Input disabled={!checked} className={styles.input} placeholder="请输入入厂批次" />)}
        </FormItem>
        <FormItem label="生产日期">
          {getFieldDecorator(productionDateField, {
            initialValue: productionDateMoment,
            onChange: v => this.handleProductionDateChange(v, validDateField),
            rules: [
              {
                validator: (rule, value, callback) => {
                  const validDate = form.getFieldValue(validDateField);
                  if (validDate && !materialValidTime) {
                    if (!value) {
                      callback('请填写生产日期');
                    }
                    if (validDate.isBefore(value, 'day')) {
                      callback('生产日期不能大于有效期至');
                    }
                  }
                  callback();
                },
              },
            ],
          })(<DatePicker disabled={!checked} className={styles.input} placeholder="请选择生产日期" />)}
        </FormItem>
        <FormItem label="有效期至">
          {getFieldDecorator(validDateField, {
            initialValue: validDateMoment,
            onChange: v => this.handleValidDateChange(v, productionDateField),
            rules: [
              {
                validator: (rule, value, callback) => {
                  const productionDate = form.getFieldValue(productionDateField);
                  if (productionDate) {
                    if (!value) {
                      callback('请填写有效期');
                    }
                    if (value.isBefore(productionDate, 'day')) {
                      callback('有效期至不能小于生产日期');
                    }
                  }
                  callback();
                },
              },
            ],
          })(<DatePicker disabled={!checked} className={styles.input} placeholder="请选择有效期至" />)}
        </FormItem>
        <FormItem label="入厂记录">
          {getFieldDecorator(`${FIELDNAME}[${index}].incomingNote`, {
            initialValue: incomingNote,
            rules: [{ max: 50, message: '最多输入50个字符' }],
          })(<Input disabled={!checked} className={styles.input} placeholder="请输入" />)}
        </FormItem>
      </CardContainer>
    );
  }
}
