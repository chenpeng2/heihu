import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  Input,
  Select,
  Button,
  Table,
  FormItem,
  Tooltip,
  AddressSelect,
  DatePicker,
  Textarea,
  Icon,
  Searchselect,
  Spin,
  StorageSelect,
  InputNumber,
} from 'src/components';
import { amountValidator, orderNumberFormat } from 'src/components/form';
import moment from 'utils/time';
import { error, primary } from 'src/styles/color';
import { getInboundOrderDetail } from 'src/services/stock/inboundOrder';
import log from 'src/utils/log';
import {
  getValidityPeriodPrecision,
  VALIDITY_PERIOD_PRECISION,
  getOrganizationValidityPeriodConfig,
} from 'src/utils/organizationConfig';
import { arrayIsEmpty } from 'src/utils/array';

import { getInboundOrderListUrl } from './actionButton/utils';
import styles from './styles.scss';

const Option = Select.Option;

type Props = {
  form: any,
  history: any,
  type: string,
  inboundOrderCode: string,
  getFormatFormValue: () => {},
  getInitialMaterialList: () => {},
  handleSubmit: () => {},
};

class Base extends Component {
  props: Props;
  state = {
    materialList: [],
    pageLoading: false,
  };

  async componentDidMount() {
    const { type, inboundOrderCode, getInitialMaterialList, getFormatFormValue } = this.props;
    const {
      form: { setFieldsValue },
    } = this.props;
    if (type === 'create') {
      this.setState({ materialList: [{ seq: 0 }] });
    } else {
      this.setState({ pageLoading: true });
      try {
        const res = await getInboundOrderDetail({ inboundOrderCode });
        const data = _.get(res, 'data.data');
        const initialMaterialList = getInitialMaterialList(data);
        const fromValue = getFormatFormValue(data);
        this.setState({ materialList: initialMaterialList, pageLoading: false }, () => {
          setFieldsValue(fromValue);
        });
      } catch (e) {
        log.error(e);
        this.setState({ pageLoading: false });
      }
    }
  }

  handleSelectMaterial = (value, record) => {
    const { seq } = record;
    const { form } = this.props;
    const { materialList } = this.state;
    const { getFieldValue, setFieldsValue } = form;
    const key = _.get(value, 'key', '');
    const productionDate = getFieldValue(`productionDate[${seq}]`);
    const validPeriod = getFieldValue('validPeriod');
    const unit = key.split('|')[2];
    const unitConversions = JSON.parse(key.split('|')[3]);
    const specifications = JSON.parse(key.split('|')[4]);
    const validTime = Number(key.split('|')[5]);
    const inputFactoryUnitName = key.split('|')[6];
    let materialUnit = [unit];
    if (unitConversions && unitConversions.length) {
      materialUnit = materialUnit.concat(unitConversions.map(n => n.slaveUnitName));
    }
    record.materialUnit = materialUnit;
    record.specifications = specifications;
    record.validTime = validTime;

    const validDate = productionDate && validTime ? _.cloneDeep(productionDate).add(validTime, 'd') : null;
    validPeriod[seq] = validDate;
    setFieldsValue({ validPeriod });

    this.setState({ materialList }, () => {
      const unitName = getFieldValue('unitName');
      const specifications = getFieldValue('specifications');
      unitName[seq] = inputFactoryUnitName === 'null' ? unit : inputFactoryUnitName;

      specifications[seq] = undefined;
      setFieldsValue({ unitName, specifications });
    });
  };

  getColumns = () => {
    const { form, type } = this.props;
    const { materialList } = this.state;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { changeChineseToLocale } = this.context;

    return [
      {
        title: '',
        key: 'delete',
        width: 25,
        render: (action, record) => {
          const { isCreated } = record;
          const disabled = materialList.filter(n => !n.deleted).length === 1;
          return (
            !isCreated &&
            !disabled && (
              <div>
                <Icon
                  type="minus-circle"
                  style={{ color: error, cursor: 'pointer', marginBottom: 14 }}
                  onClick={() => {
                    if (!disabled) {
                      record.deleted = true;
                      this.setState({ materialList });
                    }
                  }}
                />
              </div>
            )
          );
        },
      },
      {
        title: '行序列',
        key: 'action',
        width: 80,
        render: (data, record, index) => (
          <FormItem>{getFieldDecorator(`id[${record.seq}]`)(<div>{index + 1}</div>)}</FormItem>
        ),
      },
      {
        title: <div className={styles.required}>{changeChineseToLocale('物料')}</div>,
        dataIndex: 'material',
        key: 'material',
        width: 200,
        render: (material, record) => {
          const { seq } = record;
          const { code, name } = material || {};
          if (code && name) {
            return (
              <Tooltip
                containerStyle={{ marginBottom: 14, display: 'inline-block' }}
                text={`${code} / ${name}`}
                length={20}
              />
            );
          }
          return (
            <FormItem>
              {getFieldDecorator(`material[${seq}]`, {
                rules: [{ required: true, message: '请选择物料' }],
              })(
                <Searchselect
                  style={{ width: 180 }}
                  type={'materialBySearch'}
                  onSelect={value => {
                    this.handleSelectMaterial(value, record);
                  }}
                  getKey={value => {
                    const { inputFactoryUnitName, unitName, code, name, unitConversions, specifications, validTime } =
                      value || {};
                    return `${code}|${name}|${unitName}|${JSON.stringify(unitConversions || [])}|${JSON.stringify(
                      specifications || [],
                    )}|${validTime || 0}|${inputFactoryUnitName}`;
                  }}
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: <div className={styles.required}>{changeChineseToLocale('数量与单位')}</div>,
        key: 'materialAmount',
        width: 220,
        render: (data, record) => {
          const { seq, materialUnit = [] } = record;
          return (
            <FormItem>
              <div style={{ display: 'flex', width: 180 }}>
                {getFieldDecorator(`amountPlanned[${seq}]`, {
                  rules: [
                    { required: true, message: '请输入物料的数量' },
                    { validator: amountValidator(null, type === 'create' ? null : 0, null, 6) },
                  ],
                })(<InputNumber style={{ width: 100 }} placeholder={'请输入数字'} />)}
                {getFieldDecorator(`unitName[${seq}]`)(
                  <Select style={{ width: 80, marginLeft: 10 }} disabled={!materialUnit.length} placeholder={'请选择'}>
                    {materialUnit.map(n => (
                      <Option title={n} value={n}>
                        {n}
                      </Option>
                    ))}
                  </Select>,
                )}
              </div>
            </FormItem>
          );
        },
      },
      {
        title: <div className={styles.required}>{changeChineseToLocale('入库位置')}</div>,
        width: 220,
        key: 'admitStorage',
        render: (data, record) => {
          const { seq } = record;
          return (
            <FormItem>
              {getFieldDecorator(`storage[${seq}]`, {
                rules: [{ required: true, message: '请选择入库位置' }],
              })(<StorageSelect getDisabledItemsValue={this.getDisabledItemsValue} cascaderStyle={{ width: 200 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '供应商',
        key: 'supplier',
        width: 140,
        render: (data, record) => {
          const { seq } = record;
          return (
            <FormItem>
              {getFieldDecorator(`supplier[${seq}]`)(
                <Searchselect type="supplier" params={{ enabled: true }} placeholder={'请选择'} />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '供应商批次',
        width: 220,
        key: 'supplierBatch',
        render: (data, record) => {
          const { seq } = record;
          return (
            <FormItem>
              {getFieldDecorator(`supplierBatch[${seq}]`, {
                rules: [{ validator: orderNumberFormat('供应商批次') }],
              })(<Input style={{ width: 200 }} placeholder={'请输入'} />)}
            </FormItem>
          );
        },
      },
      {
        title: '入厂规格',
        dataIndex: 'specifications',
        key: 'specifications',
        width: 180,
        render: (data, record) => {
          const { seq, material } = record;
          const specifications = data || (material && material.specifications) || [];
          return (
            <FormItem>
              {getFieldDecorator(`specifications[${seq}]`)(
                <Select
                  style={{ width: 160 }}
                  disabled={!specifications || specifications.length === 0}
                  placeholder={'请选择'}
                  allowClear
                  labelInValue
                >
                  {specifications.map(n => (
                    <Option value={`${n.denominator}|${n.numerator}|${n.unitName}`}>
                      {`${n.numerator}${n.unitName}`}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '产地',
        key: 'producePlace',
        width: 240,
        render: (data, record) => {
          const { seq } = record;
          return (
            <FormItem>
              {getFieldDecorator(`originPlaceTxt[${seq}]`, {
                rules: [{ max: 50, message: '长度不能超过50个字符' }],
              })(<Input style={{ width: 200 }} placeholder={'请选择'} />)}
            </FormItem>
          );
        },
      },
      {
        title: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {changeChineseToLocale('入厂批次')}
            <Tooltip placement="top" title={changeChineseToLocale('不填时按照系统默认逻辑生成入厂批次')}>
              <Icon style={{ marginLeft: 5, color: primary }} type={'question-circle-o'} />
            </Tooltip>
          </div>
        ),
        key: 'inBoundBatch',
        width: 200,
        render: (data, record) => {
          const { seq } = record;
          return (
            <FormItem>
              {getFieldDecorator(`inboundBatch[${seq}]`, {
                rules: [
                  {
                    pattern: /^[a-zA-Z0-9\-\.\/]+$/,
                    message: '入厂批次常量只支持字母，数字，-，.，/',
                  },
                ],
              })(<Input style={{ width: 180 }} placeholder={'请输入'} />)}
            </FormItem>
          );
        },
      },
      {
        title: '生产日期',
        key: 'productionDate',
        width: 200,
        render: (data, record) => {
          const { seq, validTime } = record;
          const { showFormat } = getValidityPeriodPrecision();
          return (
            <FormItem>
              {getFieldDecorator(`productionDate[${seq}]`, {
                onChange: value => {
                  const validPeriod = getFieldValue('validPeriod');
                  if (value && validTime) {
                    validPeriod[seq] = _.cloneDeep(value).add(validTime, 'd');
                  } else {
                    validPeriod[seq] = null;
                  }
                  setFieldsValue({ validPeriod });
                },
              })(
                <DatePicker
                  format={showFormat}
                  showTime={getOrganizationValidityPeriodConfig() === VALIDITY_PERIOD_PRECISION.hour.value}
                  allowClear
                  style={{ width: 180 }}
                  placeholder={'请选择'}
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '有效期',
        key: 'validPeriod',
        width: 200,
        render: (data, record) => {
          const { seq } = record;
          const productionDate = getFieldValue(`productionDate[${seq}]`);
          const { showFormat } = getValidityPeriodPrecision();
          return (
            <FormItem>
              {getFieldDecorator(`validPeriod[${seq}]`, {})(
                <DatePicker
                  format={showFormat}
                  showTime={getOrganizationValidityPeriodConfig() === VALIDITY_PERIOD_PRECISION.hour.value}
                  disabledDate={current => this.getDisabledValidPeriod(current, productionDate)}
                  allowClear
                  style={{ width: 180 }}
                  placeholder={'请选择'}
                />,
              )}
            </FormItem>
          );
        },
      },
    ];
  };

  getDisabledValidPeriod = (current, date) => {
    if (date && current) {
      return current < date.startOf('day');
    }
    return false;
  };

  getDisabledItemsValue = (treeData, triggerValue, disabledItemValues) => {
    treeData.forEach(n => {
      if (n.value !== triggerValue) {
        disabledItemValues.push(n.value);
      }
      if (n.children && n.children.length) {
        this.getDisabledItemsValue(n.children, triggerValue, disabledItemValues);
      }
    });
  };

  renderAddMaterial = materialList => {
    return (
      <Button
        icon={'plus-circle-o'}
        onClick={async () => {
          materialList.push({ seq: materialList.length });
          this.setState({ materialList });
        }}
        type={'default'}
        style={{ border: 'none', color: primary, padding: 0, marginLeft: 20 }}
      >
        添加物料
      </Button>
    );
  };

  renderMaterialTable = () => {
    const { materialList } = this.state;
    const columns = this.getColumns();
    return (
      <Table
        dataSource={materialList.filter(n => !n.deleted)}
        pagination={false}
        scroll={{ y: 260, x: true }}
        columns={columns}
        footer={() => this.renderAddMaterial(materialList)}
      />
    );
  };

  renderButton = () => {
    const { history, handleSubmit } = this.props;
    const { materialList } = this.state;
    const buttonStyle = { width: 114, height: 32 };
    return (
      <div style={{ marginLeft: 120 }}>
        <Button
          type="ghost"
          style={buttonStyle}
          onClick={() => {
            history.push(getInboundOrderListUrl());
          }}
        >
          取消
        </Button>
        <Button
          style={{ ...buttonStyle, marginLeft: 72 }}
          onClick={() => {
            handleSubmit(materialList);
          }}
        >
          保存
        </Button>
      </div>
    );
  };

  render() {
    const { form, type } = this.props;
    const { pageLoading } = this.state;
    const { changeChineseToLocale } = this.context;

    const { getFieldDecorator } = form;
    return (
      <div className={styles.createInboundOrder}>
        <Spin spinning={pageLoading}>
          <div
            style={{
              margin: '20px 0 30px 20px',
              fontSize: 16,
            }}
          >
            {changeChineseToLocale(type === 'create' ? '创建' : '编辑')}
            {changeChineseToLocale('入库单')}
          </div>
          <FormItem label="编号">
            {getFieldDecorator('inboundOrderCode', {
              rules: [
                { max: 20, message: '最多输入20个字符' },
                { validator: orderNumberFormat('入库单编号') },
                { required: true, message: '入库单编号必填' },
              ],
            })(<Input disabled={type === 'edit'} style={{ width: 300, height: 32 }} placeholder={'请输入'} />)}
          </FormItem>
          <div className={styles.materialList}>
            <FormItem label="物料列表">
              {getFieldDecorator('materialList')(<React.Fragment>{this.renderMaterialTable()}</React.Fragment>)}
            </FormItem>
          </div>
          <FormItem label="备注">
            {getFieldDecorator('remark')(
              <Textarea
                maxLength={100}
                placeholder={changeChineseToLocale('请输入备注')}
                style={{ width: 300, height: 100 }}
              />,
            )}
          </FormItem>
          {this.renderButton()}
        </Spin>
      </div>
    );
  }
}

Base.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(Base);
