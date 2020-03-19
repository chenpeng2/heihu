import React, { Component } from 'react';
import _ from 'lodash';

import {
  amountValidator,
  checkTwoSidesTrim,
  checkStringLength,
  codeInUrlValidator,
  requiredRule,
} from 'src/components/form';
import {
  DatePicker,
  Checkbox,
  InputNumber,
  FormItem,
  Form,
  Input,
  Radio,
  Document,
  Textarea,
  Popover,
  Icon,
  Tooltip,
  FormattedMessage,
  SearchSelect,
} from 'src/components';
import { replaceSign } from 'constants';
import { isOrganizationUseQrCode } from 'utils/organizationConfig';
import QcConfigList from 'src/containers/qcConfig/qcConfigList';
import MaterialTypeSearchSelect from 'src/containers/materialType/baseComponent/materialTypeSearchSelect';
import MaterialSpecifications from 'src/views/bom/materials/baseComponent/materialSpecifications';
import moment from 'src/utils/time';
import { blacklakeGreen, content, primary } from 'src/styles/color';
import { getMaterialCheckDateConfig, useFrozenTime } from 'src/utils/organizationConfig';
import { qualityOptions } from 'views/bom/materials/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import styles from '../styles.scss';
import ConvertUnit from './convertUnit';
import CustomMaterialFields from './customMaterialFields';
import ReplaceMaterials from './replaceMaterial';

const codeFormatCheck = name => {
  return (rule, value, callback) => {
    const re = /^[\w\*\u00b7\_\/\.\-\uff08\uff09()\&\s\#\+]+$/;
    if (!re.test(value)) {
      callback(
        changeChineseToLocaleWithoutIntl('{name}只能由英文字母、数字、*·_ /-+.#,中文括号,英文括号,&,空格组成', {
          name,
        }),
      );
    }
    callback();
  };
};

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const formItemWidth = 200;

type Props = {
  form: any,
  viewer: any,
  relay: any,
  material: any,
  status: String,
  inModal: boolean,
  unitConversions: [],
  replaceMaterialList: [],
  materialCustomFields: [],
  edit: boolean,
  mainMaterial: {},
  warningTime: number,
  specifications: [],
  unitsForSelect: [],
  qcConfigDetails: [],
  submit: () => {},
  create: boolean,
  copy: boolean,
  materialCheckDate: any,
};

class BasicInfoForm extends Component {
  props: Props;

  state = {
    editing: false,
    unitsForSelect: [],
    _isInitial: true,
  };

  static getDerivedStateFromProps(props, prevState) {
    const { edit, validTime, unitsForSelect, qcConfigDetails, materialCheckDate } = props;
    const _state = {};
    if (edit) {
      _state.editing = edit;
    }
    if (prevState._isInitial) {
      _state.unitsForSelect = unitsForSelect;
      _state.validTime = validTime;
      _state.materialCheckDate = materialCheckDate;
      _state._isInitial = false;
    }
    if (!prevState.qcConfigDetails && qcConfigDetails && qcConfigDetails.length) {
      _state.qcConfigDetails = qcConfigDetails;
    }

    return _state;
  }

  setProHoldAndUseUnitId(nextUnitsForSelect) {
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    const mainUnitId = getFieldValue('unitId');
    let proHoldUnitId = getFieldValue('proHoldUnitId');
    let proUseUnitId = getFieldValue('proUseUnitId');
    let inputFactoryUnitId = getFieldValue('inputFactoryUnitId');
    if (!nextUnitsForSelect.find(e => _.get(e, 'unit.id') === proHoldUnitId)) {
      proHoldUnitId = mainUnitId && mainUnitId.key;
    }
    if (!nextUnitsForSelect.find(e => _.get(e, 'unit.id') === proUseUnitId)) {
      proUseUnitId = mainUnitId && mainUnitId.key;
    }
    if (!nextUnitsForSelect.find(e => _.get(e, 'unit.id') === inputFactoryUnitId)) {
      inputFactoryUnitId = mainUnitId && mainUnitId.key;
    }
    setFieldsValue({ proHoldUnitId, proUseUnitId, inputFactoryUnitId });
  }

  getPayload() {
    const { inModal } = this.props;
    const value = this.props.form.getFieldsValue();
    const {
      replaceMaterialList,
      name,
      code,
      unitId,
      status,
      desc,
      unitConversions,
      attachments,
      materialCustomFields,
      materialTypes,
      proUseUnitId,
      proHoldUnitId,
      inputFactoryUnitId,
      specifications,
      preCheckDays,
      materialCheckDate,
      qcConfigDetails,
      qcOperatorId,
      issueWarehouseId,
      ...rest
    } = value || {};

    const _unitConversions = Array.isArray(unitConversions)
      ? unitConversions
          .filter(x => x)
          .map(i => {
            const { slaveUnitId, ...rest } = i || {};
            return { slaveUnitId: slaveUnitId ? slaveUnitId.key : null, ...rest };
          })
      : [];
    const _replaceMaterialList = Array.isArray(replaceMaterialList)
      ? replaceMaterialList.map(i => i && i.material).filter(i => !!i)
      : [];
    const _specifications = Array.isArray(specifications) ? specifications.filter(i => i) : null;

    return Object.assign(
      {},
      {
        qcConfigDetails: !inModal ? qcConfigDetails : null,
        unitConversions: _unitConversions,
        name,
        code,
        unitId: unitId ? unitId.key : null,
        status,
        desc,
        attachments,
        materialCustomFields,
        proUseUnitId: proUseUnitId || (unitId && unitId.key),
        proHoldUnitId: proHoldUnitId || (unitId && unitId.key),
        inputFactoryUnitId: inputFactoryUnitId || (unitId && unitId.key),
        replaceMaterialList: _replaceMaterialList,
        materialTypeIds: Array.isArray(materialTypes) ? materialTypes.map(i => i && i.key).filter(i => i) : [],
        specifications: _specifications,
        preCheckDays,
        checkDate: materialCheckDate ? moment(materialCheckDate).format('YYYY/MM/DD') : null,
        qcOperatorId: qcOperatorId && qcOperatorId.key,
        issueWarehouseId: issueWarehouseId && issueWarehouseId.key,
        ...rest,
      },
    );
  }

  renderNeedRequestMaterial = () => {
    return (
      <span>
        <Popover
          placement="right"
          title={<FormattedMessage style={{ fontSize: 18 }} defaultMessage={'请料方式'} />}
          content={
            <div>
              {changeChineseToLocaleWithoutIntl(
                '若选“自行管控”，则创建计划工单 / 排程时，自动创建转移申请单(请料单)时不会出现此物料。场景多用于工厂对辅料/紧固件等粗放的发料管理方式，可根据生产实际情况选择',
              )}
            </div>
          }
        >
          <Icon color={blacklakeGreen} type="exclamation-circle-o" style={{ paddingRight: 10 }} />
        </Popover>
        <FormattedMessage defaultMessage={'请料方式'} />
      </span>
    );
  };

  renderMaterialTypeTips = (title, info) => {
    return (
      <span style={{ whiteSpace: 'nowrap' }}>
        <Tooltip
          title={<div style={{ color: content }}>{changeChineseToLocaleWithoutIntl(info)}</div>}
          overlayStyle={{ width: 406 }}
        >
          <Icon type="exclamation-circle-o" color={primary} style={{ marginRight: 5 }} />
        </Tooltip>
        <span>{changeChineseToLocaleWithoutIntl(title)}</span>
      </span>
    );
  };

  render() {
    const {
      specifications,
      copy,
      form,
      inModal,
      unitConversions,
      replaceMaterialList,
      materialCustomFields,
      mainMaterial,
      create,
    } = this.props;
    let { status } = this.props;
    const { getFieldDecorator, getFieldsValue } = form || {};
    const { unitConversions: unitConversionValues, unitId } = getFieldsValue();
    const materialUnitIds = Array.isArray(unitConversionValues)
      ? unitConversionValues.filter(x => x && x.slaveUnitId).map(e => e.slaveUnitId)
      : [];
    if (unitId) {
      materialUnitIds.push(unitId);
    }
    const { editing, unitsForSelect } = this.state;
    if (inModal) {
      status = 1;
    }

    return (
      <div>
        <Form className={styles.materialBaseForm}>
          <FormItem label="编号">
            {getFieldDecorator('code', {
              rules: [
                requiredRule('编号'),
                { max: 50, message: <FormattedMessage defaultMessage={'长度不能超过50个字符'} /> },
                { validator: checkTwoSidesTrim('物料编号') },
                { validator: codeFormatCheck('物料编号') },
                { validator: checkStringLength(50) },
                { validator: codeInUrlValidator('物料编号') },
              ],
            })(<Input placeholder={'最多输入50个字符'} disabled={editing} style={{ width: 300, height: 32 }} />)}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [
                requiredRule('名称'),
                { max: 150, message: <FormattedMessage defaultMessage={'长度不能超过150个字符'} /> },
                { validator: checkTwoSidesTrim('物料名称') },
                { validator: checkStringLength(150) },
              ],
            })(<Input placeholder={'最多输入150个字符'} style={{ width: 300, height: 32 }} />)}
          </FormItem>
          <FormItem label="状态">
            {getFieldDecorator('status', {
              initialValue: create && !inModal ? 1 : status || null,
              rules: [requiredRule('状态'), { validator: checkStringLength(100) }],
            })(
              <RadioGroup disabled={create && !inModal ? false : editing || status === 1 || status === 0 || inModal}>
                <Radio value={1}>{changeChineseToLocaleWithoutIntl('启用中')}</Radio>
                <Radio value={0}>{changeChineseToLocaleWithoutIntl('停用中')}</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label={this.renderMaterialTypeTips('物料类型', '物料的标签分类，一种物料可选择多个物料类型')}>
            {getFieldDecorator('materialTypes')(
              <MaterialTypeSearchSelect style={{ width: 200 }} mode={'multiple'} params={{ status: 1 }} />,
            )}
          </FormItem>
          <ConvertUnit
            cbForUnitsChange={value => {
              this.setState(({ unitsForSelect }) => {
                const nextUnitsForSelect = [];

                const getDataInStateNow = key => {
                  let res = null;
                  if (Array.isArray(unitsForSelect)) {
                    unitsForSelect.forEach(i => {
                      if (i && i.key === key) {
                        res = i;
                      }
                    });
                  }
                  return res;
                };

                if (Array.isArray(value)) {
                  // 如果现在的state中有这个key。那么用现在有的
                  // 如果现在state中没有这个key。那么加上
                  // 如果现在state中有多余的key。那么去除
                  value.forEach(i => {
                    if (i) {
                      const res = getDataInStateNow(i.key);
                      if (res) {
                        nextUnitsForSelect.push(res);
                      } else {
                        nextUnitsForSelect.push(i);
                      }
                    }
                  });
                }

                // 需要将主单位的单独加上
                const res = getDataInStateNow('mainUnit');
                if (res) nextUnitsForSelect.push(res);

                this.setProHoldAndUseUnitId(nextUnitsForSelect);

                return {
                  unitsForSelect: nextUnitsForSelect,
                };
              });
            }}
            cbForUnitChange={(key, value) => {
              this.setState(({ unitsForSelect }) => {
                const nextUnitsForSelect = Array.isArray(unitsForSelect)
                  ? unitsForSelect.map(i => {
                      const { key: _key } = i || {};
                      if (_key === key) return { ...i, unit: value };
                      return i;
                    })
                  : [];
                this.setProHoldAndUseUnitId(nextUnitsForSelect);
                return {
                  unitsForSelect: nextUnitsForSelect,
                };
              });
            }}
            cbForMainUnitChange={(key, value) => {
              this.setState(({ unitsForSelect }) => {
                let hasMainUnit = false;
                if (Array.isArray(unitsForSelect)) {
                  unitsForSelect.forEach(i => {
                    if (i && i.key === key) hasMainUnit = true;
                  });
                }

                let nextUnits = [];
                if (hasMainUnit) {
                  nextUnits = Array.isArray(unitsForSelect)
                    ? unitsForSelect.map(i => {
                        const { key: _key } = i || {};
                        if (_key === key) return { ...i, unit: value };
                        return i;
                      })
                    : [];
                } else {
                  nextUnits = Array.isArray(unitsForSelect)
                    ? unitsForSelect.concat([{ unit: value, key }])
                    : [{ unit: value, key }];
                }

                return { unitsForSelect: nextUnits };
              });
            }}
            form={form}
            unitsForSelect={unitsForSelect}
            unitConversions={unitConversions}
            edit={editing}
          />
          <FormItem label={'先进先出'}>
            {getFieldDecorator('fifo', {
              rules: [requiredRule('先进先出')],
              initialValue: false,
            })(
              <RadioGroup
                options={[
                  { label: changeChineseToLocaleWithoutIntl('是'), value: true },
                  { label: changeChineseToLocaleWithoutIntl('否'), value: false },
                ]}
              />,
            )}
          </FormItem>
          <FormItem label={'存储有效期'}>
            {getFieldDecorator('validTime', {
              rules: [
                {
                  validator: amountValidator(100000, 1, 'integer', '存储有效期'),
                },
              ],
              onChange: value => {
                this.setState({ validTime: value }, () => {
                  form.validateFields(['warningTime'], { force: true });
                });
              },
            })(<Input style={{ width: 200 }} />)}
            <Input
              value={changeChineseToLocaleWithoutIntl('天')}
              disabled
              style={{ display: 'inline-block', width: 40, marginLeft: 10 }}
            />
          </FormItem>
          <FormItem label={'预警提前期'}>
            {getFieldDecorator('warningTime', {
              rules: [
                {
                  validator: amountValidator(100000, 0, 'integer', '预警提前期'),
                },
                {
                  validator: (rule, value, callback) => {
                    const { validTime } = this.state;
                    if (value && !validTime) {
                      callback(changeChineseToLocaleWithoutIntl('请先填写存储有效期'));
                    }
                    if (Number(value) > Number(validTime)) {
                      callback(changeChineseToLocaleWithoutIntl('预警提前期不可大于存储有效期'));
                    }
                    callback();
                  },
                },
              ],
            })(<Input style={{ width: 200 }} />)}
            <Input
              value={changeChineseToLocaleWithoutIntl('天')}
              disabled
              style={{ display: 'inline-block', width: 40, marginLeft: 10 }}
            />
          </FormItem>
          {isOrganizationUseQrCode() ? (
            <FormItem label={'安全库存'} style={{ display: 'flex' }}>
              {getFieldDecorator('safeStorageAmount', {
                rules: [
                  {
                    validator: amountValidator(10000000, 0, undefined, 6, '安全库存'),
                  },
                ],
              })(<InputNumber />)}
              <Input
                style={{ width: 80, margin: '0 10px' }}
                value={_.get(form.getFieldValue('unitId'), 'label') || replaceSign}
                disabled
              />
              {getFieldDecorator('qualityStatus', {
                initialValue: [1],
              })(<CheckboxGroup options={qualityOptions} />)}
            </FormItem>
          ) : null}
          <FormItem label="发料仓库">
            {getFieldDecorator('issueWarehouseId')(
              <SearchSelect type="wareHouse" style={{ width: formItemWidth }} params={{ status: 1 }} />,
            )}
          </FormItem>
          <FormItem label={'入厂规格'}>
            <MaterialSpecifications
              specifications={specifications}
              edit={editing || copy}
              unitsForSelect={unitsForSelect}
              form={form}
            />
          </FormItem>
          <FormItem label="规格描述">
            {getFieldDecorator('desc', {
              rules: [{ validator: checkStringLength(1000) }],
            })(<Textarea maxLength={1000} style={{ width: 300, height: 100 }} placeholder="请输入规格描述" />)}
          </FormItem>
          <FormItem label="替代物料">
            {editing || copy ? (
              replaceMaterialList && mainMaterial ? (
                <ReplaceMaterials
                  mainMaterial={mainMaterial}
                  key={'edit'}
                  replaceMaterialList={replaceMaterialList}
                  edit={editing || copy}
                  form={form}
                />
              ) : null
            ) : (
              <ReplaceMaterials key={'create'} form={form} />
            )}
          </FormItem>
          <FormItem label="附件：">{getFieldDecorator('attachments', {})(<Document />)}</FormItem>
          {getMaterialCheckDateConfig() ? (
            <React.Fragment>
              <FormItem label={'物料审核日期'}>
                {getFieldDecorator('materialCheckDate', {
                  onChange: value => {
                    this.setState({ materialCheckDate: value }, () => {
                      form.validateFields(['preCheckDays'], { force: true });
                    });
                  },
                })(
                  <DatePicker
                    disabledDate={current => current && current < moment().startOf('day')}
                    style={{ width: 200 }}
                  />,
                )}
              </FormItem>
              <FormItem label={'审核预警提前期'}>
                {getFieldDecorator('preCheckDays', {
                  rules: [
                    {
                      validator: amountValidator(100000, 0, 'integer', '审核预警提前期'),
                    },
                    {
                      validator: (rule, value, callback) => {
                        const { materialCheckDate } = this.state;
                        if (value && !materialCheckDate) callback('请先填写物料审核日期');
                        if (!editing && value && materialCheckDate) {
                          const preDate = _.cloneDeep(materialCheckDate).subtract(value, 'days');
                          if (preDate.isBefore(moment().startOf('day'))) {
                            callback(
                              changeChineseToLocaleWithoutIntl('物料审核日期减去审核预警提前期不可以在今天之前'),
                            );
                          }
                        }
                        callback();
                      },
                    },
                  ],
                })(<InputNumber style={{ width: 200 }} />)}
                <Input
                  value={changeChineseToLocaleWithoutIntl('天')}
                  disabled
                  style={{ display: 'inline-block', width: 40, marginLeft: 10 }}
                />
              </FormItem>
            </React.Fragment>
          ) : null}
          {useFrozenTime() ? (
            <FormItem label={'冻结时间'}>
              {getFieldDecorator('frozenTime', {
                rules: [
                  {
                    validator: amountValidator(100000),
                  },
                ],
              })(<InputNumber style={{ width: 200 }} />)}
              <Input
                value={changeChineseToLocaleWithoutIntl('小时')}
                disabled
                style={{ display: 'inline-block', width: 70, marginLeft: 10 }}
              />
            </FormItem>
          ) : null}
          <FormItem label={this.renderNeedRequestMaterial()}>
            {getFieldDecorator('needRequestMaterial', {
              initialValue: 1,
              rules: [
                {
                  required: true,
                  message: '请料方式',
                },
              ],
            })(<RadioGroup options={[{ value: 1, label: '按计划排程请料' }, { value: 0, label: '自行管控' }]} />)}
          </FormItem>
          <FormItem label={'自定义物料字段'}>
            {editing || copy ? (
              materialCustomFields ? (
                <CustomMaterialFields initialData={materialCustomFields} form={form} edit={editing || copy} />
              ) : null
            ) : (
              <CustomMaterialFields form={form} />
            )}
          </FormItem>
          <FormItem label="出入厂检质检员">
            {getFieldDecorator('qcOperatorId')(<SearchSelect type="qcMembers" style={{ width: formItemWidth }} />)}
          </FormItem>
          {inModal ? null : (
            <FormItem label="质检方案" wrapperCol={{ span: 20 }}>
              {getFieldDecorator('qcConfigDetails')(<QcConfigList unitsForSelect={unitsForSelect} type="material" />)}
            </FormItem>
          )}
        </Form>
      </div>
    );
  }
}

export default BasicInfoForm;
