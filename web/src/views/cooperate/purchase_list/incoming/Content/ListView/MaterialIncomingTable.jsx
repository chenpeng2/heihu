import React from 'react';
import _ from 'lodash';
import {
  Icon,
  Table,
  Input,
  DatePicker,
  Checkbox,
  FormItem,
  Tooltip,
  Select,
  InputNumber,
  AddressSelect,
  SingleStorageSelect,
  PlainText,
} from 'components';
import { primary } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'utils/array';
import { safeDiv, safeMul, safeSub } from 'utils/number';
import { orderNumberFormat, amountValidator } from 'components/form';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import IncomingSpecificationSelect, { genSpecificationValue } from '../BaseComponents/IncomingSpecificationSelect';
import UnitSelect from '../BaseComponents/UnitSelect';
import CheckBoxWithMaterial from '../BaseComponents/CheckBoxWithMaterial';
import {
  useQrCode,
  FIELDNAME,
  taskDispatchType,
  materialLineIdField,
  amountField,
  qrCodeAndAmountField,
  unitField,
  validDateField,
  productionDateField,
  materialCodeField,
  incomingSpecificationField,
  incomingBatchField,
  productionPlaceField,
  incomingNoteField,
  supplierBatchField,
  codeAmountField,
  singleCodeAmountField,
  checkedField,
  storageField,
  getQcStatus,
} from '../../utils';
import PurchaseMaterialIncomingListModel from '../../../../../../models/cooperate/purchaseOrder/viewModels/PurchaseIncomingListViewModel';
import styles from '../../styles.scss';
import { SingleCodeAmountFormItem, QrCodeAmountFormItem } from '../BaseComponents/QrCodeAndAmount';
import QrCodeAndAmountModel from '../../../../../../models/cooperate/purchaseOrder/dataModels/QrCodeAndAmountModel';

const INVISIBLE_STYLE = { display: 'none' };
const formItemBaseStyle = { margin: 0 };
const hasPrefixTitleStyle = { display: 'flex', alignItems: 'center' };

type PurchaseMaterialIncomingTableProps = {
  form: any,
  hiddenCols: Array<String>,
  data: Array<PurchaseMaterialIncomingListModel>,
};

type PurchaseMaterialIncomingTableStateType = {
  data: Array<PurchaseMaterialIncomingListModel>,
};

class PurchaseMaterialIncomingTable extends React.Component<
  PurchaseMaterialIncomingTableProps,
  PurchaseMaterialIncomingTableStateType,
> {
  state = {
    data: [new PurchaseMaterialIncomingListModel()],
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

  setInitialData = (data: Array<PurchaseMaterialIncomingListModel>) => {
    this.setState({ data }, () => {
      this.props.form.resetFields([`${FIELDNAME}`]);
    });
  };

  updateData = (newData: PurchaseMaterialIncomingListModel, index: Number) => {
    const { data } = this.state;
    _.set(data, `[${index}]`, newData);
    this.setState({ data });
  };

  getCurData = (index: Number): PurchaseMaterialIncomingListModel => {
    const { data } = this.state;
    return !arrayIsEmpty(data) ? data[index] : new PurchaseMaterialIncomingListModel();
  };

  /** 本次入厂数变化 */
  handleAmountChange = (amountValue: Number, index: Number, qrCodeAndAmountField: String): void => {
    /** todo: 方法写到model里 */
    const curData = this.getCurData(index);
    curData.updateItem('amount', amountValue);
    curData.updateQrCodeAndAmountByVariables();
    this.props.form.resetFields([qrCodeAndAmountField]);
    this.updateData(curData, index);
  };

  /** 入厂规格变化 */
  handleIncomingSpecificationChange = (
    v: String,
    option: Object,
    amountField: String,
    qrCodeAndAmountField: String,
    index: Number,
  ): void => {
    const { numerator, unitName, denominator } = _.get(option, 'props', {});
    const curData = this.getCurData(index);
    curData.updateItem('useUnit', unitName);
    curData.updateItem('incomingSpecification', _.get(option, 'props', {}));
    const amount = this.props.form.getFieldValue(`${amountField}`);
    setTimeout(() => {
      this.handleAmountChange(amount, index, qrCodeAndAmountField);
    });
  };

  /** 二维码数量变化 */
  handleQrCodeAndAmountChange = (qrCodeAndAmountField: String, index: Number): void => {
    setTimeout(() => {
      const { form } = this.props;
      const curData = this.getCurData(index);
      const qrCodeAndAmount = form.getFieldValue(qrCodeAndAmountField);
      curData.updateItem('qrCodeAndAmount', qrCodeAndAmount);
      curData.updateAmountByQrCodeAmount();
      this.updateData(curData);
      form.resetFields([amountField(index)]);
    });
  };

  /** 生产日期变化：有效期至 = 生产日期 + 物料存储有效期 */
  handleProductionDateChange = (v: Object, index: Number, validDateField: String) => {
    const { form } = this.props;
    const curData = this.getCurData(index);
    if (curData.materialValidTime) {
      curData.updateProductionDate(v);
      form.resetFields([validDateField]);
      curData.updateValidDateByProductionDate();
      this.updateData(curData, index);
    }
    setTimeout(() => {
      this.props.form.validateFields([validDateField], { force: true });
    });
  };

  /** 有效期至变化：有效期不能小于生产日期 */
  handleValidDateChange = (v: Object, productionDateField: String) => {
    setTimeout(() => {
      this.props.form.validateFields([productionDateField], { force: true });
    });
  };

  /** checkbox变化 */
  handleMaterialCheckBoxChange = (e: any, index: Number) => {
    const checked = _.get(e.target, 'checked');
    const { form } = this.props;
    const curData = this.getCurData(index);
    curData.updateItem('checked', checked);
    this.updateData(curData, index);
    form.resetFields([`${FIELDNAME}[${index}]`]);
  };

  /** 单位选择变化：物料没有入厂规格时，是可以选择入厂单位的 */
  handleUnitSelectChange = (v: String, index: Number) => {
    const curData = this.getCurData(index);
    curData.updateItem('useUnit', v);
    this.updateData(curData, index);
  };

  getColumns = (hiddenCols: Array<String>) => {
    const { form } = this.props;
    const { getFieldDecorator, validateFields } = form || {};
    const requiredSymbol = <span className={styles['required-symbol']}>*</span>;
    const materialTitle = <PlainText text="物料编号/名称" style={{ textIndent: 20 }} />;
    const incomingBatchTip = (
      <Tooltip placement="top" title={changeChineseToLocaleWithoutIntl('不填时按照系统默认逻辑生成入厂批次')}>
        <Icon style={{ marginLeft: 5, color: primary }} type="question-circle-o" />
      </Tooltip>
    );

    return [
      {
        title: materialTitle,
        dataIndex: 'materialCode',
        key: 'materialCode',
        width: 250,
        render: (data, { materialCode, checked, materialLineId, materialName }, index) => {
          return (
            <React.Fragment>
              <FormItem style={INVISIBLE_STYLE}>
                {getFieldDecorator(checkedField(index), {
                  initialValue: checked,
                })(<Input />)}
              </FormItem>
              <FormItem style={INVISIBLE_STYLE}>
                {getFieldDecorator(materialCodeField(index), {
                  initialValue: materialCode,
                  hidden: !checked,
                })(<Input />)}
              </FormItem>
              <FormItem style={INVISIBLE_STYLE}>
                {getFieldDecorator(materialLineIdField(index), {
                  initialValue: materialLineId,
                  hidden: !checked,
                })(<Input />)}
              </FormItem>
              <CheckBoxWithMaterial
                maxLength={40}
                onChange={e => this.handleMaterialCheckBoxChange(e, index)}
                checked={checked}
                materialCode={data}
                materialName={materialName}
              />
            </React.Fragment>
          );
        },
      },
      {
        title: '需求时间',
        dataIndex: 'demandDateMoment',
        key: 'demandDateMoment',
        width: 120,
        render: (date, record, index) => date || replaceSign,
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        key: 'purchaseOrderCode',
        width: 150,
        render: data => (data ? <Tooltip text={data} length={12} /> : replaceSign),
      },
      {
        title: taskDispatchType === 'manager' ? '计划工单编号' : '项目编号',
        dataIndex: 'planWorkOrderCode',
        key: 'planWorkOrderCode',
        width: 150,
        render: data => (data ? <Tooltip text={data} length={12} /> : replaceSign),
      },
      {
        title: '入厂规格',
        dataIndex: 'incomingSpecification',
        key: 'incomingSpecification',
        hidden: !useQrCode,
        prefix: requiredSymbol,
        width: 170,
        render: (incomingSpecification, { incomingSpecifications, checked }, index) => {
          return (
            <FormItem style={formItemBaseStyle}>
              {getFieldDecorator(incomingSpecificationField(index), {
                initialValue: genSpecificationValue(incomingSpecification),
                hidden: !checked || arrayIsEmpty(incomingSpecifications),
                onChange: (v, opt) =>
                  this.handleIncomingSpecificationChange(
                    v,
                    opt,
                    amountField(index),
                    qrCodeAndAmountField(index),
                    index,
                  ),
                rules: [
                  {
                    required: checked,
                    message: '请选择入厂规格',
                  },
                ],
              })(
                <IncomingSpecificationSelect
                  disabled={!checked || arrayIsEmpty(incomingSpecifications)}
                  className={styles['middle-select']}
                  specifications={incomingSpecifications}
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '本次入厂数',
        dataIndex: 'amount',
        key: 'amount',
        hidden: !useQrCode,
        width: 220,
        prefix: requiredSymbol,
        render: (amount, { incomingSpecifications, recentUnitName, useUnit, materialUnitNames, checked }, index) => {
          return (
            <div className={styles['flex-inline-container']}>
              <FormItem style={formItemBaseStyle}>
                {getFieldDecorator(amountField(index), {
                  initialValue: amount,
                  rules: [
                    { required: checked, message: '请填写本次入厂数' },
                    { validator: amountValidator(10e5, 0, null, 6) },
                  ],
                  onChange: v => this.handleAmountChange(v, index, qrCodeAndAmountField(index)),
                })(
                  <InputNumber
                    disabled={arrayIsEmpty(incomingSpecifications) || !checked}
                    className={styles['middle-inputNumber']}
                  />,
                )}
              </FormItem>
              <FormItem style={formItemBaseStyle}>
                {getFieldDecorator(unitField(index), {
                  initialValue: useUnit,
                  // onChange: arrayIsEmpty(incomingSpecifications) ? v => this.handleUnitSelectChange(v, index) : null,
                })(<UnitSelect units={materialUnitNames} disabled className={styles['small-select']} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '单个二维码的物料数量',
        dataIndex: 'singleCodeAmount',
        key: 'singleCodeAmount',
        width: 220,
        prefix: requiredSymbol,
        render: (data, { qrCodeAndAmount, checked, useUnit, materialUnitNames, incomingSpecifications }, index) => {
          return qrCodeAndAmount.map(({ singleCodeAmount }, i) => (
            <SingleCodeAmountFormItem
              required={checked}
              data={singleCodeAmount}
              units={materialUnitNames}
              unitName={useUnit}
              unitField={unitField(index)}
              onChange={() => this.handleQrCodeAndAmountChange(qrCodeAndAmountField(index), index)}
              formItemStyle={formItemBaseStyle}
              disabled={!arrayIsEmpty(incomingSpecifications) || !checked}
              form={form}
              fieldName={singleCodeAmountField(index, i)}
            />
          ));
        },
      },
      {
        title: '二维码个数',
        dataIndex: 'codeAmount',
        key: 'codeAmount',
        width: 150,
        prefix: requiredSymbol,
        render: (data, { qrCodeAndAmount, checked, incomingSpecifications }, index) => {
          return qrCodeAndAmount.map(({ codeAmount }, i) => (
            <QrCodeAmountFormItem
              required={checked}
              data={codeAmount}
              onChange={() => this.handleQrCodeAndAmountChange(qrCodeAndAmountField(index), index)}
              formItemStyle={formItemBaseStyle}
              disabled={!arrayIsEmpty(incomingSpecifications) || !checked}
              form={form}
              fieldName={codeAmountField(index, i)}
            />
          ));
        },
      },
      {
        title: '入厂位置',
        dataIndex: 'storage',
        key: 'storage',
        prefix: requiredSymbol,
        width: 170,
        render: (data, { inputFactoryQcConfigs, checked, recentStorage }, index) => {
          const qualityStatus = getQcStatus(inputFactoryQcConfigs);
          return (
            <FormItem style={formItemBaseStyle}>
              {form.getFieldDecorator(storageField(index), {
                rules: [{ required: checked, message: '请选择入厂位置' }],
                initialValue: recentStorage,
              })(<SingleStorageSelect params={{ qualityStatus }} disabled={!checked} style={{ width: 150 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '供应商',
        dataIndex: 'supplierName',
        key: 'supplierName',
        hidden: !useQrCode,
        width: 120,
        render: data => (data ? <Tooltip text={data} length={10} /> : replaceSign),
      },
      {
        title: '供应商批次',
        dataIndex: 'supplierBatch',
        key: 'supplierBatch',
        width: 140,
        render: (supplierBatch, { checked }, index) => {
          return (
            <FormItem style={formItemBaseStyle}>
              {getFieldDecorator(supplierBatchField(index), {
                initialValue: supplierBatch,
                rules: [{ max: 20, message: '最多输入20个字符' }, { validator: orderNumberFormat('供应商批次') }],
              })(<Input disabled={!checked} className={styles['middle-input']} placeholder="请输入供应商批次" />)}
            </FormItem>
          );
        },
      },
      {
        title: '入厂规格',
        dataIndex: 'incomingSpecification',
        key: 'incomingSpecification',
        hidden: useQrCode,
        width: 170,
        render: (incomingSpecification, { incomingSpecifications, checked }, index) => {
          return (
            <div>
              {getFieldDecorator(incomingSpecificationField(index), {
                initialValue: genSpecificationValue(incomingSpecification),
                hidden: !checked || arrayIsEmpty(incomingSpecifications),
                onChange: (v, opt) =>
                  this.handleIncomingSpecificationChange(v, opt, amountField, qrCodeAndAmountField(index), index),
                rules: [
                  {
                    required: checked,
                    message: '请选择入厂规格',
                  },
                ],
              })(
                <IncomingSpecificationSelect
                  disabled={!checked || arrayIsEmpty(incomingSpecifications)}
                  className={styles['middle-select']}
                  specifications={incomingSpecifications}
                />,
              )}
            </div>
          );
        },
      },
      {
        title: '产地',
        dataIndex: 'productionPlace',
        key: 'productionPlace',
        width: 170,
        render: (data, { checked }, index) => {
          return (
            <FormItem style={formItemBaseStyle}>
              {getFieldDecorator(productionPlaceField(index))(
                <AddressSelect
                  showSearch
                  disabled={!checked}
                  className={styles['middle-select']}
                  placeholder="请选择产地"
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '入厂批次',
        dataIndex: 'incomingBatch',
        key: 'incomingBatch',
        width: 140,
        prefix: incomingBatchTip,
        render: (incomingBatch, { checked }, index) => {
          return (
            <FormItem style={formItemBaseStyle}>
              {getFieldDecorator(incomingBatchField(index), {
                initialValue: incomingBatch,
                rules: [{ max: 20, message: '最多输入20个字符' }, { validator: orderNumberFormat('入厂批次') }],
              })(<Input disabled={!checked} className={styles['middle-input']} placeholder="请输入入厂批次" />)}
            </FormItem>
          );
        },
      },
      {
        title: '生产日期',
        dataIndex: 'productionDateMoment',
        key: 'productionDateMoment',
        width: 160,
        render: (productionDateMoment, { checked, materialValidTime }, index) => {
          return (
            <FormItem style={formItemBaseStyle}>
              {getFieldDecorator(productionDateField(index), {
                initialValue: productionDateMoment,
                onChange: v => this.handleProductionDateChange(v, index, validDateField(index)),
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      const validDate = form.getFieldValue(validDateField(index));
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
              })(
                <DatePicker disabled={!checked} className={styles['small-datePicker']} placeholder="请选择生产日期" />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '有效期至',
        dataIndex: 'validDateMoment',
        key: 'validDateMoment',
        width: 160,
        render: (validDateMoment, { checked, materialValidTime }, index) => {
          return (
            <FormItem style={formItemBaseStyle}>
              {getFieldDecorator(validDateField(index), {
                initialValue: validDateMoment,
                onChange: v => this.handleValidDateChange(v, productionDateField(index)),
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      const productionDate = form.getFieldValue(productionDateField(index));
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
              })(
                <DatePicker disabled={!checked} className={styles['small-datePicker']} placeholder="请选择有效期至" />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '入厂记录',
        dataIndex: 'incomingNote',
        key: 'incomingNote',
        width: 140,
        render: (incomingNote, { checked }, index) => {
          return (
            <FormItem style={formItemBaseStyle}>
              {getFieldDecorator(incomingNoteField(index), {
                initialValue: incomingNote,
                rules: [{ max: 50, message: '最多输入50个字符' }],
              })(<Input disabled={!checked} className={styles['middle-input']} placeholder="请输入入厂记录" />)}
            </FormItem>
          );
        },
      },
    ]
      .filter(x => !x.hidden)
      .filter(x => (arrayIsEmpty(hiddenCols) ? x : hiddenCols.includes(x.key)))
      .map(x => {
        if (x && x.prefix) {
          const newTitle = (
            <div style={hasPrefixTitleStyle}>
              {x.prefix}
              {x.title}
            </div>
          );
          return { ...x, title: newTitle };
        }
        return x;
      });
  };

  render() {
    const { hiddenCols } = this.props;
    const { data } = this.state;

    return (
      <Table
        pagination={false}
        scroll={{ x: true }}
        style={{ margin: 0 }}
        columns={this.getColumns(hiddenCols)}
        dataSource={data}
      />
    );
  }
}

export default PurchaseMaterialIncomingTable;
