import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import withForm, { amountValidator, checkPositiveIntegerWithoutZero, checkStringLength } from 'src/components/form';
import {
  FormItem,
  Form,
  Tooltip,
  Input,
  Document,
  message,
  Select,
  InputNumber,
  Radio,
  Checkbox,
  FormattedMessage,
  AntTextarea,
} from 'components';
import Icon from 'components/icon';
import {
  RECORD_TYPE,
  CHECKCOUNT_TYPE,
  CHECK_TYPE,
  QCCONFIG_STATE,
  FULL_CHECK,
  AQL_CHECK,
  CHECKITEM_CHECK,
  QCCONFIG_VALID,
  CHECK_ENTITY_TYPE,
  SAMPLE_RESULT_TYPE,
  TASK_CREATE_TYPE,
  USE_QR_CODE,
  CREATE_TYPE_FIXED_QCCODE_AMOUNT,
  CREATE_TYPE_FIXED_COUNT,
  QUANTITY_CHECK,
  RATIO_CHECK,
} from 'src/views/qualityManagement/constants';
import { blacklakeGreen, error } from 'src/styles/color/index';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { isOrganizationUseQrCode, isQcReportRecordCountSettable } from 'src/utils/organizationConfig';
import QcCheckItemTable from './qcCheckItemTable';
import MaterialSelect from './materialSelect';
import { nameFormatCheck } from './utils';
import styles from './styles.scss';

const RadioGroup = Radio.Group;
const Option = Select.Option;

type Props = {
  form: {
    getFieldDecorator: Function,
    getFieldValue: Function,
    removeField: Function,
    setFieldsValue: Function,
    getFieldError: Function,
    getFieldsValue: Function,
    validateFieldsAndScroll: Function,
  },
  qcCheckCount: Number,
  index: number,
  initialValue: {},
  style: {},
  className: string,
  type: string,
  edit: boolean,
};

export const getCheckNumsValid = (form, checkCountType, isInitial, samplingBulk) => {
  const { getFieldValue } = form;
  return {
    rules: [
      {
        required: typeof samplingBulk === 'boolean' ? samplingBulk : !isInitial,
        message: changeChineseToLocaleWithoutIntl('抽检数值必填'),
      },
      {
        validator:
          getFieldValue('taskCreateType') !== CREATE_TYPE_FIXED_QCCODE_AMOUNT
            ? amountValidator({
                value:
                  checkCountType === RATIO_CHECK
                    ? 100
                    : getFieldValue('taskCreateCountAll') || getFieldValue('taskCreateType') === CREATE_TYPE_FIXED_COUNT
                    ? 1000000
                    : getFieldValue('taskCreateCount'),
                equal: true,
                message: (
                  <FormattedMessage
                    defaultMessage={'数量不超过{number}'}
                    values={{
                      number:
                        checkCountType === RATIO_CHECK
                          ? 100
                          : getFieldValue('taskCreateCountAll') ||
                            getFieldValue('taskCreateType') === CREATE_TYPE_FIXED_COUNT
                          ? 1000000
                          : getFieldValue('taskCreateCount'),
                    }}
                  />
                ),
              })
            : (rule, value, cb) => {
                cb();
              },
      },
      // {
      //   validator:
      //     checkCountType === QUANTITY_CHECK
      //       ? checkPositiveIntegerWithoutZero()
      //       : (rule, value, callback) => {
      //           callback();
      //         },
      // },
    ],
  };
};

class QcConfigBase extends Component {
  props: Props;

  state = {
    qcCheckItemHoverIndex: -1,
    checkItemHoverIndex: -1,
    units: [],
  };

  componentDidMount() {
    const { initialValue, form } = this.props;
    if (initialValue) {
      const { qcCheckItemConfigs: _qcCheckItemConfigs, keys, ...rest } = initialValue;
      const qcCheckItemConfigs = keys ? _qcCheckItemConfigs : _.sortBy(_qcCheckItemConfigs, 'seq');
      this.getField(form);
      if (qcCheckItemConfigs) {
        this.setState({ initialQcCheckItemConfigs: qcCheckItemConfigs, initialKeys: keys });
      }
      form.setFieldsValue(rest);
    }
  }
  componentWillReceiveProps(nextProps) {
    const { form } = nextProps;
    if (!_.isEqual(this.props.initialValue, nextProps.initialValue)) {
      const { qcCheckItemConfigs: _qcCheckItemConfigs, keys, ...rest } = nextProps.initialValue;
      const qcCheckItemConfigs = keys ? _qcCheckItemConfigs : _.sortBy(_qcCheckItemConfigs, 'seq');
      this.getField(form);
      if (qcCheckItemConfigs) {
        this.setState({ initialQcCheckItemConfigs: qcCheckItemConfigs, initialKeys: keys });
      }
      this.setState({ qcType: rest.checkCountType });
      form.setFieldsValue(rest);
    }
  }

  getField = form => {
    form.getFieldDecorator('checkCount', getCheckNumsValid(form, undefined, true));
    form.getFieldDecorator('taskCreateType');
    form.getFieldDecorator('taskCreateCount');
    form.getFieldDecorator('taskCreateCountAll');
    form.getFieldDecorator('taskCreateIntervalUnit');
    form.getFieldDecorator('taskCreateIntervalValue');
    form.getFieldDecorator('checkEntityUnitCount');
    form.getFieldDecorator('checkEntityUnitUnit');
  };

  getPayload = () => {
    const { validateFieldsAndScroll } = this.props.form;
    let values;
    let err;
    validateFieldsAndScroll((_err, _values) => {
      err = _err;
      values = _.cloneDeep(_values);
    });
    if (err) {
      return null;
    }
    if (Object.keys(values).findIndex(n => n.indexOf('qcCheckItemConfigs') !== -1) === -1) {
      message.error('必须添加至少一个关注点');
      throw new Error('必须添加至少一个关注点');
    }
    return values;
  };

  addCheckItem = k => {
    const { form } = this.props;
    let keys = form.getFieldValue(`checkItemKeys${k}`);
    keys = keys.concat(keys.length ? keys[keys.length - 1] + 1 : 0);
    form.setFieldsValue({ [`checkItemKeys${k}`]: keys });
  };

  removeCheckItem = (k, kk) => {
    const { form } = this.props;
    let keys = form.getFieldValue(`checkItemKeys${k}`);
    keys = keys.filter(key => {
      return key !== kk;
    });
    form.setFieldsValue({
      [`checkItemKeys${k}`]: keys,
    });
  };

  render() {
    const { form, style, className, edit, initialValue, type } = this.props;
    const { initialQcCheckItemConfigs, initialKeys, maxCheckCount } = this.state;
    const { getFieldDecorator, getFieldValue, getFieldError, setFieldsValue, validateFields } = form;
    const useQrCode = isOrganizationUseQrCode();
    if (!useQrCode) {
      delete CHECK_ENTITY_TYPE[USE_QR_CODE];
      delete TASK_CREATE_TYPE[CREATE_TYPE_FIXED_QCCODE_AMOUNT];
    }
    const qcReportRecordCountSettable = isQcReportRecordCountSettable();
    let checkTypes = {};
    if (type === 'material') {
      checkTypes = {
        0: CHECK_TYPE[0],
        1: CHECK_TYPE[1],
      };
    } else if (type === 'mbom' || type === 'processRouting') {
      checkTypes = {
        2: CHECK_TYPE[2],
        3: CHECK_TYPE[3],
      };
    } else {
      checkTypes = {
        0: CHECK_TYPE[0],
        1: CHECK_TYPE[1],
        2: CHECK_TYPE[2],
        3: CHECK_TYPE[3],
      };
    }

    return (
      <div
        id="edit-qcCheckPoint"
        className={!type ? `${styles.qcCheckPointContainer} ${className}` : styles.qcCheckPointContainerInModal}
        style={style}
      >
        {edit ? (
          <FormItem label="编号">
            <span>{initialValue && initialValue.code}</span>
          </FormItem>
        ) : null}
        <Form>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: changeChineseToLocaleWithoutIntl('质检方案名称必填') },
                { validator: nameFormatCheck },
                { validator: checkStringLength(100) },
              ],
            })(
              <AntTextarea
                autosize={{ maxRows: 3 }}
                style={{ width: 300, height: 28, resize: 'none', marginBottom: 5 }}
                placeholder="请输入质检方案名称"
              />,
            )}
          </FormItem>
          <FormItem label="状态">
            {getFieldDecorator('state', {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择状态') }],
              initialValue: QCCONFIG_VALID,
            })(
              <RadioGroup disabled={edit} style={{ width: 450 }}>
                {_.map(QCCONFIG_STATE, (display, value) => (
                  <Radio key={Number(value)} value={Number(value)}>
                    {changeChineseToLocaleWithoutIntl(display)}
                  </Radio>
                )).reverse()}
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label="自动生成任务">
            {getFieldDecorator('autoCreateQcTask', {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请填写是否自动生成任务!') }],
              onChange: e => {
                const value = _.get(e, 'target.value');
                // 质检频次编辑必填但没值且不能编辑的处理，以后把质检频次挪到质检计划后删除该逻辑
                if (!value && !getFieldValue('taskCreateType') && edit) {
                  form.resetFields('taskCreateType');
                }
              },
            })(
              <RadioGroup style={{ width: 450 }}>
                <Radio value>{changeChineseToLocaleWithoutIntl('是')}</Radio>
                <Radio value={false}>{changeChineseToLocaleWithoutIntl('否')}</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label="质检类型">
            {getFieldDecorator('checkType', {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择质检类型') }],
            })(
              <RadioGroup disabled={edit} style={{ width: 450 }}>
                {_.map(checkTypes, (display, value) => (
                  <Radio key={Number(value)} value={Number(value)}>
                    {changeChineseToLocaleWithoutIntl(display)}
                  </Radio>
                ))}
              </RadioGroup>,
            )}
          </FormItem>
          <div
            style={{
              display: getFieldValue('checkType') === 3 && getFieldValue('autoCreateQcTask') ? 'block' : 'none',
            }}
          >
            <FormItem label="质检频次">
              {getFieldDecorator('taskCreateType', {
                rules: [
                  {
                    required: getFieldValue('checkType') === 3 && getFieldValue('autoCreateQcTask'),
                    message: changeChineseToLocaleWithoutIntl('请选择质检频次'),
                  },
                ],
              })(
                <Select disabled={edit} style={{ width: 100 }}>
                  {_.map(TASK_CREATE_TYPE, (display, value) => {
                    if (!getFieldValue('autoCreateQcTask') && value === '3') {
                      return null;
                    }
                    return (
                      <Option key={value} value={Number(value)}>
                        {changeChineseToLocaleWithoutIntl(display)}
                      </Option>
                    );
                  })}
                </Select>,
              )}
              {getFieldValue('taskCreateType') === 0 ? (
                <span>
                  <span style={{ padding: 10 }}>{changeChineseToLocaleWithoutIntl('每')}</span>
                  {getFieldDecorator('taskCreateIntervalValue', {
                    rules: [
                      { required: true, message: changeChineseToLocaleWithoutIntl('时间必填') },
                      { validator: amountValidator(null, null, 'integer') },
                    ],
                  })(<InputNumber />)}{' '}
                  {getFieldDecorator('taskCreateIntervalUnit', {
                    initialValue: 'm',
                  })(
                    <Select style={{ width: 100 }}>
                      <Option value={'h'}>{changeChineseToLocaleWithoutIntl('小时')}</Option>
                      <Option value={'m'}>{changeChineseToLocaleWithoutIntl('分钟')}</Option>
                    </Select>,
                  )}
                  <span style={{ paddingLeft: 10 }}>{changeChineseToLocaleWithoutIntl('质检一次')}</span>
                </span>
              ) : null}
              {getFieldValue('taskCreateType') === 1 ? (
                <span>
                  <span style={{ padding: 10 }}>{changeChineseToLocaleWithoutIntl('生产')}</span>
                  {getFieldDecorator('taskCreateCount', {
                    rules: [
                      {
                        required: !form.getFieldValue('taskCreateCountAll'),
                        message: changeChineseToLocaleWithoutIntl('必须填写数量'),
                      },
                      {
                        validator: amountValidator(null, null, 'integer'),
                      },
                    ],
                  })(
                    <InputNumber
                      onChange={value => {
                        this.setState({ maxCheckCount: value }, () => {
                          validateFields(['checkCount'], { force: true });
                        });
                      }}
                      disabled={form.getFieldValue('taskCreateCountAll')}
                    />,
                  )}
                  <span style={{ paddingLeft: 10 }}>{changeChineseToLocaleWithoutIntl('质检一次')}</span>
                  <span style={{ paddingLeft: 10 }}>
                    {getFieldDecorator('taskCreateCountAll', {
                      valuePropName: 'checked',
                      onChange: () => {
                        setTimeout(() => form.validateFields(['taskCreateCount'], { force: true }));
                      },
                    })(
                      <Checkbox style={{ display: 'inline' }}>
                        <span>{changeChineseToLocaleWithoutIntl('全部数量')}</span>
                      </Checkbox>,
                    )}
                  </span>
                </span>
              ) : null}
              {getFieldValue('taskCreateType') === 2 ? (
                <span>
                  <span style={{ paddingLeft: 10 }}>
                    {getFieldDecorator('taskCreateCount', {
                      rules: [
                        {
                          required: !form.getFieldValue('taskCreateCountAll'),
                          message: changeChineseToLocaleWithoutIntl('必须填写数量'),
                        },
                        {
                          validator: amountValidator(10000, 1, 'integer'),
                        },
                      ],
                    })(<InputNumber />)}
                  </span>
                  <span style={{ paddingLeft: 10 }}>{changeChineseToLocaleWithoutIntl('次')}</span>
                </span>
              ) : null}
              {getFieldValue('taskCreateType') === 3 ? (
                <span>
                  <span style={{ paddingLeft: 10 }}>
                    {getFieldDecorator('taskCreateCount', {
                      rules: [
                        { required: true, message: changeChineseToLocaleWithoutIntl('请输入二维码个数') },
                        {
                          validator: amountValidator(10000, 1, 'integer'),
                        },
                      ],
                    })(<InputNumber placeholder={changeChineseToLocaleWithoutIntl('请输入')} />)}
                  </span>
                  <span style={{ paddingLeft: 10 }}>{changeChineseToLocaleWithoutIntl('个二维码')}</span>
                </span>
              ) : null}
              {getFieldError('taskCreateIntervalValue') || getFieldError('taskCreateCount') ? (
                <div style={{ color: error }}>
                  {getFieldError('taskCreateIntervalValue') || getFieldError('taskCreateCount')}
                </div>
              ) : null}
            </FormItem>
          </div>
          <FormItem label="质检方式">
            {getFieldDecorator('checkCountType', {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择质检方式') }],
              onChange: e => {
                const value = _.get(e, 'target.value');

                this.setState({ qcType: value }, () => {
                  if (value === FULL_CHECK) {
                    setFieldsValue({ scrapInspection: false });
                    setFieldsValue({ recordSampleResultType: 1 });
                  }
                  setFieldsValue({ checkEntityType: value === CHECKITEM_CHECK ? 1 : undefined });
                  setFieldsValue({ checkEntityType: value === AQL_CHECK ? 1 : undefined });
                  setFieldsValue({ recordCheckItemType: value === AQL_CHECK ? 0 : 1 });
                });
              },
            })(
              <RadioGroup style={{ width: 550 }}>
                {_.map(CHECKCOUNT_TYPE, (display, value) => (
                  <Radio key={value} value={Number(value)}>
                    {changeChineseToLocaleWithoutIntl(display)}
                  </Radio>
                ))}
              </RadioGroup>,
            )}
          </FormItem>
          {getFieldValue('checkCountType') === 1 || getFieldValue('checkCountType') === 2 ? (
            <FormItem label="质检数量">
              <div style={{ display: 'flex', marginTop: 6 }}>
                {getFieldDecorator('checkCount', getCheckNumsValid(form, getFieldValue('checkCountType'), false))(
                  <InputNumber style={{ width: 160 }} placeholder="请输入数量" />,
                )}
                <Input
                  style={{
                    visibility: getFieldValue('checkCountType') === 2 ? 'hidden' : 'visible',
                    width: 140,
                    marginLeft: 10,
                  }}
                  value={getFieldValue('checkCountType') === 1 ? '%' : changeChineseToLocaleWithoutIntl('单位')}
                  disabled
                />
              </div>
            </FormItem>
          ) : null}
          <FormItem label="记录方式" wrapperCol={18}>
            {getFieldDecorator('recordType', {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择记录方式!') }],
            })(
              <RadioGroup style={{ width: 500 }}>
                {_.map(RECORD_TYPE, ({ display, desc }, value) => (
                  <Radio key={value} style={{ marginRight: 40 }} value={Number(value)}>
                    {changeChineseToLocaleWithoutIntl(display)}
                    <Tooltip title={desc}>
                      <Icon style={{ color: blacklakeGreen, marginLeft: 10 }} type="exclamation-circle-o" />
                    </Tooltip>
                  </Radio>
                ))}
              </RadioGroup>,
            )}
          </FormItem>
          {qcReportRecordCountSettable ? (
            <FormItem label={'报告记录数量'} wrapperCol={18}>
              {getFieldDecorator('checkEntityType', {
                rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择报告记录数量!') }],
              })(
                <RadioGroup
                  disabled={
                    getFieldValue('checkCountType') === AQL_CHECK || getFieldValue('checkCountType') === CHECKITEM_CHECK
                  }
                  style={{ width: 500 }}
                >
                  {Object.values(CHECK_ENTITY_TYPE).map(({ label, desc, key }) => (
                    <Radio key={key} style={{ marginRight: 40 }} value={Number(key)}>
                      {changeChineseToLocaleWithoutIntl(label)}
                      <Tooltip title={changeChineseToLocaleWithoutIntl(desc)}>
                        <Icon style={{ color: blacklakeGreen, marginLeft: 10 }} type="exclamation-circle-o" />
                      </Tooltip>
                    </Radio>
                  ))}
                </RadioGroup>,
              )}
            </FormItem>
          ) : null}
          {getFieldValue('checkEntityType') === 2 ? (
            <div className={styles.customMonomer}>
              <FormItem label="">
                {getFieldDecorator('checkEntityUnitCount', {
                  rules: [
                    { required: true, message: changeChineseToLocaleWithoutIntl('请输入自定义单体数量!') },
                    {
                      validator: amountValidator(
                        999999999999,
                        0,
                        'integer',
                        null,
                        changeChineseToLocaleWithoutIntl('单体数量'),
                      ),
                    },
                  ],
                })(<InputNumber style={{ width: 160 }} placeholder={changeChineseToLocaleWithoutIntl('单体数量')} />)}
              </FormItem>
              <FormItem label="">
                {getFieldDecorator('checkEntityUnitUnit', {
                  rules: [
                    { required: true, message: changeChineseToLocaleWithoutIntl('请输入自定义单体单位!') },
                    { validator: checkStringLength(12) },
                  ],
                })(<Input style={{ width: 140, marginLeft: 10 }} placeholder={'单位'} />)}
              </FormItem>
            </div>
          ) : null}
          {useQrCode ? (
            <React.Fragment>
              <FormItem label="报废性检查">
                {getFieldDecorator('scrapInspection', {
                  rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请填写报废性检查!') }],
                  onChange: e => {
                    const value = _.get(e, 'target.value');
                    if (value) form.setFieldsValue({ recordSampleResultType: 0 });
                  },
                })(
                  <RadioGroup disabled={this.state.qcType === 0} style={{ width: 450 }}>
                    <Radio value>{changeChineseToLocaleWithoutIntl('是')}</Radio>
                    <Radio value={false}>{changeChineseToLocaleWithoutIntl('否')}</Radio>
                  </RadioGroup>,
                )}
              </FormItem>
              <FormItem label="样本判定维度">
                {getFieldDecorator('recordSampleResultType', {
                  rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择样本判定维度!') }],
                })(
                  <RadioGroup disabled={getFieldValue('scrapInspection')} style={{ width: 450 }}>
                    {Object.values(SAMPLE_RESULT_TYPE).map(({ label, desc, key }) => (
                      <Radio key={key} style={{ marginRight: 40 }} value={Number(key)}>
                        {changeChineseToLocaleWithoutIntl(label)}
                        <Tooltip title={changeChineseToLocaleWithoutIntl(desc)}>
                          <Icon style={{ color: blacklakeGreen, marginLeft: 10 }} type="exclamation-circle-o" />
                        </Tooltip>
                      </Radio>
                    ))}
                  </RadioGroup>,
                )}
              </FormItem>
            </React.Fragment>
          ) : null}
          <FormItem label="可适用物料" wrapperCol={{ span: 16 }}>
            <MaterialSelect form={form} checkEntityType={getFieldValue('checkEntityType')} value={initialValue} />
          </FormItem>
          <FormItem label="质检项填写规则">
            {getFieldDecorator('recordCheckItemType', {
              initialValue: getFieldValue('checkCountType')
                ? getFieldValue('checkCountType') === 4
                  ? 0
                  : 1
                : undefined,
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请填写质检项填写规则!') }],
            })(
              <RadioGroup style={{ width: 450 }}>
                <Radio value={0}>{changeChineseToLocaleWithoutIntl('全部填写')}</Radio>
                <Radio value={1}>{changeChineseToLocaleWithoutIntl('可以为空')}</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label="附件：">{getFieldDecorator('attachments', {})(<Document />)}</FormItem>
          <div style={{ marginTop: 50 }}>
            <FormItem label="质检项列表" wrapperCol={{ span: 16 }}>
              <QcCheckItemTable
                type={type}
                initialValue={initialQcCheckItemConfigs}
                initialKeys={initialKeys}
                form={form}
              />
            </FormItem>
          </div>
        </Form>
      </div>
    );
  }
}

QcConfigBase.contextTypes = {
  router: {},
  changeChineseTemplateToLocale: PropTypes.any,
};

export { formatInitialValue, formatValues } from './utils';

export default withForm(
  {
    onValuesChange: (props, value, allValues) => {
      if (props.onChange) {
        props.onChange(allValues);
      }
    },
  },
  QcConfigBase,
);
