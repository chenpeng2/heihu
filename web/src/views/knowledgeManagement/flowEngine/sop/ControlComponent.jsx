import React from 'react';
import {
  withForm,
  FormItem,
  Input,
  Select,
  Radio,
  Link,
  Icon,
  Attachment,
  Textarea,
  Button,
  openModal,
  InputNumber,
  SimpleTable,
  Tooltip,
  Checkbox,
} from 'components';
import PropTypes from 'prop-types';
import SearchSelect from 'components/select/searchSelect';
import { QCLOGIC_TYPE } from 'src/views/qualityManagement/constants';
import { defaultGetValueFromEvent, amountValidator } from 'components/form';
import SecondStorageSelect from 'components/select/storageSelect/singleStorageSelect';
import { ORGANIZATION_CONFIG, includeOrganizationConfig } from 'utils/organizationConfig';
import Colors from 'styles/color';
import CONSTANT, {
  SopControlProperty,
  SopControlType,
  SopControlInputTextType,
  SopControlShowLogic,
  TYPE_AUTH,
  TYPE_FILE,
  TYPE_INPUT,
  TYPE_NUMBER,
  TYPE_OUTPUT,
  TYPE_TEXT,
  TYPE_TIME,
  TYPE_USER,
  TYPE_WEIGHING,
  LOGIC_BUSINESS,
  LOGIC_FIXED_FILE,
  LOGIC_FIXED_USER,
  LOGIC_FIXED_VALUE,
  LOGIC_NOW_TIME,
  LOGIC_TRIGGER,
  PROPERTY_INPUT,
  PROPERTY_SHOW,
  INPUT_TEXT_CHECKBOX,
  INPUT_TEXT_MULTIPLE,
  INPUT_TEXT_SINGLE,
  EQ,
  GT,
  BETWEEN,
  GTE,
  LT,
  LTE,
  TOLERANCE,
} from '../common/SOPConstant';
import DefaultValueLogicSelect from './DefaultValueLogicSelect';
import PrivilegeSelect from './PrivilegeSelect';
import PrivilegeTypeSelect from './PrivilegeTypeSelect';
import CreateFieldModal from './CreateFieldModal';
import SOPFieldSelect from './SOPFieldSelect';
import { decodeMaterialCode } from './SOPStep';
import AGVPopover from './component/AGVPopover';
import styles from './index.scss';
import { isBindEBomToProcessRouting } from '../utils';

const Fragment = React.Fragment;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const DisplaySopControlTypeKeys = [
  TYPE_TEXT,
  TYPE_NUMBER,
  TYPE_TIME,
  TYPE_FILE,
  TYPE_USER,
  CONSTANT.TYPE_WORKSTATION,
  CONSTANT.TYPE_DEVICE,
  CONSTANT.TYPE_REPORT,
];
const InputSopControlTypeKeys = [
  TYPE_TEXT,
  TYPE_NUMBER,
  TYPE_TIME,
  TYPE_FILE,
  TYPE_USER,
  TYPE_AUTH,
  TYPE_INPUT,
  TYPE_OUTPUT,
  TYPE_WEIGHING,
  CONSTANT.TYPE_RECEIVE_SCAN,
  CONSTANT.TYPE_MATERIAL_LOT_TRANSFER,
  CONSTANT.TYPE_WORKSTATION,
  CONSTANT.TYPE_DEVICE,
  includeOrganizationConfig(ORGANIZATION_CONFIG.avgControl) && CONSTANT.TYPE_AGV,
  CONSTANT.TYPE_MULTIPLE_USER,
].filter(n => n);
const TemplateInputSopControlTypeKeys = [
  TYPE_TEXT,
  TYPE_NUMBER,
  TYPE_TIME,
  TYPE_FILE,
  TYPE_USER,
  TYPE_AUTH,
  CONSTANT.TYPE_VIRTUAL_INPUT,
  CONSTANT.TYPE_VIRTUAL_OUTPUT,
  TYPE_WEIGHING,
  CONSTANT.TYPE_VIRTUAL_RECEIVE_SCAN,
  CONSTANT.TYPE_VIRTUAL_MATERIAL_LOT_TRANSFER,
  CONSTANT.TYPE_WORKSTATION,
  CONSTANT.TYPE_DEVICE,
  includeOrganizationConfig(ORGANIZATION_CONFIG.avgControl) && CONSTANT.TYPE_AGV,
  CONSTANT.TYPE_MULTIPLE_USER,
];
const width = 200;
const { requiredRule } = withForm.rules;

class ControlComponent extends React.PureComponent {
  state = {
    useLatestMaterial: false, // 是否使用最新的物料列表, 优先级高于props中
  };

  getFieldDecorator = (name, options = {}) => component => {
    let decoratorComponent = component;
    if (!options.noDefaultDisable) {
      decoratorComponent = React.cloneElement(component, {
        disabled: options.disabled || this.props.isCreatedByTemplate,
      });
    }
    return this.props.form.getFieldDecorator(`${this.props.prefix}${name}`, {
      getValueFromEvent: e => {
        this.props.handleModifyState(true);
        return defaultGetValueFromEvent(e);
      },
      ...options,
    })(decoratorComponent);
  };
  getFieldValue = name => this.props.form.getFieldValue(`${this.props.prefix}${name}`);
  resetFields = names => this.props.form.resetFields(names.map(name => `${this.props.prefix}${name}`));
  setFieldsValue = obj => {
    const values = {};
    Object.keys(obj).forEach(key => {
      values[`${this.props.prefix}${key}`] = { value: obj[key] };
    });
    this.props.form.setFields(values);
  };

  isTemplateMode = () => this.props.mode === 'sopTemplate';

  form = {
    getFieldDecorator: this.getFieldDecorator,
    getFieldValue: this.getFieldValue,
    resetFields: this.resetFields,
    setFieldsValue: this.setFieldsValue,
  };

  // render input logic item
  renderInputForm = () => {
    const form = this.form;
    const { getFieldDecorator } = form;
    const type = this.getFieldValue('type');
    let renderForm = null;
    if (type === TYPE_TEXT) {
      renderForm = this.renderTextForm({ form });
    } else if (type === TYPE_NUMBER) {
      renderForm = this.renderNumberForm({ form });
    } else if (type === TYPE_TIME) {
      renderForm = this.renderTimeForm({ form });
    } else if (type === TYPE_USER) {
      renderForm = this.renderUserForm({ form });
    } else if (type === TYPE_AUTH || type === CONSTANT.TYPE_MULTIPLE_USER) {
      renderForm = this.renderAuthForm({ form });
    } else if (type === TYPE_WEIGHING) {
      renderForm = this.renderWeightForm({ form });
    } else if (type === CONSTANT.TYPE_AGV) {
      renderForm = this.renderAGVForm({ form });
    } else if (
      type === CONSTANT.TYPE_INPUT ||
      type === CONSTANT.TYPE_RECEIVE_SCAN ||
      type === CONSTANT.TYPE_MATERIAL_LOT_TRANSFER
    ) {
      renderForm = this.renderInputMaterialForm({ form, type });
    } else {
      renderForm = <div />;
    }
    const isShowUpdateField = [
      TYPE_TEXT,
      TYPE_NUMBER,
      TYPE_TIME,
      TYPE_USER,
      TYPE_AUTH,
      TYPE_FILE,
      CONSTANT.TYPE_WORKSTATION,
      CONSTANT.TYPE_DEVICE,
      CONSTANT.TYPE_MULTIPLE_USER,
    ].includes(type);
    const updatedFieldIdField = getFieldDecorator('updatedFieldId')(
      <SOPFieldSelect type={type} SOPDetail={this.props.SOPDetail} style={{ width }} filterReadOnly />,
    );
    return (
      <Fragment>
        {renderForm}
        {isShowUpdateField && (
          <FormItem label="更新字段">
            <div>
              {getFieldDecorator('updatedField', {
                initialValue: 'DIY',
              })(
                <Select style={{ width }}>
                  <Option key="DIY">自定义字段</Option>
                </Select>,
              )}
              <Button
                style={{ marginLeft: 10 }}
                onClick={() => {
                  openModal({
                    children: (
                      <CreateFieldModal
                        SOPId={this.props.sopId}
                        mode={this.props.mode}
                        type={type}
                        wrappedComponentRef={inst => (this.updateFieldForm = inst)}
                        setSOPDetail={this.props.setSOPDetail}
                      />
                    ),
                    title: '新建自定义字段',
                    onOk: async value => {
                      await this.updateFieldForm.submit();
                    },
                  });
                }}
              >
                新建
              </Button>
              <div>{updatedFieldIdField}</div>
            </div>
          </FormItem>
        )}
      </Fragment>
    );
  };
  // render text type in input logic
  renderTextForm = ({ form }) => {
    const { getFieldDecorator, getFieldValue, setFieldsValue, resetFields } = form;
    const { isCreatedByTemplate } = this.props;
    const inputTextTypeValue = getFieldValue('inputTextType');
    const inputOptionListKeys = getFieldValue('inputOptionListKeys');
    const inputOptionListKeysLength = inputOptionListKeys ? inputOptionListKeys.length : 0;
    const inputOptionListField = (
      <FormItem label="选项值">
        {inputOptionListKeys &&
          inputOptionListKeys.map(key => (
            <div className="vertical-center child-gap" key={key} style={{ marginBottom: 14 }}>
              {getFieldDecorator(`inputOptionList[${key}]`)(<Input style={{ width }} />)}
              {inputOptionListKeysLength > 1 && !isCreatedByTemplate && (
                <Icon
                  type="minus-circle"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setFieldsValue({ inputOptionListKeys: inputOptionListKeys.filter(value => value !== key) });
                  }}
                />
              )}
            </div>
          ))}
        {!isCreatedByTemplate && inputOptionListKeysLength < 20 && (
          <Link
            icon="plus-circle-o"
            onClick={() => {
              setFieldsValue({
                inputOptionListKeys: [
                  ...inputOptionListKeys,
                  (inputOptionListKeys[inputOptionListKeys.length - 1] || 0) + 1,
                ],
              });
            }}
          >
            添加选项值(最多20个选项值)
          </Link>
        )}
      </FormItem>
    );
    getFieldDecorator('inputDefaultLogic');
    return (
      <Fragment>
        <FormItem label="文本类型">
          {getFieldDecorator('inputTextType', {
            rules: [requiredRule('文本类型')],
            hidden:
              getFieldValue('type') !== CONSTANT.TYPE_TEXT || getFieldValue('property') === CONSTANT.PROPERTY_SHOW,
          })(
            <Select style={{ width: 200 }}>
              {Array.from(SopControlInputTextType, ([key, value]) => (
                <Option value={key}>{value}</Option>
              ))}
            </Select>,
          )}
        </FormItem>
        {[INPUT_TEXT_SINGLE, INPUT_TEXT_MULTIPLE].includes(inputTextTypeValue) && (
          <DefaultValueLogicSelect
            types={[LOGIC_BUSINESS, LOGIC_FIXED_VALUE]}
            style={{ width: 200, marginRight: 10 }}
            form={this.form}
            SOPDetail={this.props.SOPDetail}
          />
        )}
        {[INPUT_TEXT_CHECKBOX, CONSTANT.INPUT_TEXT_CHECKBOX_MULTIPLE].includes(inputTextTypeValue) &&
          inputOptionListField}
      </Fragment>
    );
  };

  renderNumberForm = ({ form }) => {
    const { getFieldDecorator, getFieldValue, resetFields } = form;
    const getStandards = logic => {
      if (logic === BETWEEN) {
        return [{ key: 'min', tip: '最小值' }, { key: 'max', tip: '最大值' }];
      } else if (logic === TOLERANCE) {
        return [{ key: 'base', tip: '标准值' }, { key: 'max', tip: '上偏差' }, { key: 'min', tip: '下偏差' }];
      }
      return [{ key: 'base', tip: '请输入' }];
    };
    const InputComponent =
      getFieldValue('standardLogic') === CONSTANT.INPUT_STANDARD_LOGIC_DIY ? SOPFieldSelect : InputNumber;
    return (
      <Fragment>
        <FormItem label="单位">
          {getFieldDecorator('inputUnit')(<SearchSelect type="unit" style={{ width }} />)}
        </FormItem>
        <DefaultValueLogicSelect
          types={[LOGIC_BUSINESS, LOGIC_FIXED_VALUE, LOGIC_TRIGGER]}
          form={this.form}
          SOPDetail={this.props.SOPDetail}
        />
        <FormItem label="触发异常">
          {getFieldDecorator('triggerException', {
            initialValue: false,
            rules: [requiredRule('触发异常')],
          })(
            <RadioGroup>
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label="标准逻辑">
          {getFieldDecorator('standardLogic')(
            <Select
              style={{ width }}
              onChange={() => {
                resetFields(['inputStandard']);
              }}
            >
              <Option value={CONSTANT.INPUT_STANDARD_LOGIC_FIXED}>固定值</Option>
              <Option value={CONSTANT.INPUT_STANDARD_LOGIC_DIY}>自定义字段</Option>
            </Select>,
          )}
        </FormItem>
        <FormItem label="标准">
          {getFieldDecorator('inputStandard.logic', {
            // rules: [getFieldValue('triggerException') && requiredRule('标准')],
          })(
            <Select style={{ width }} allowClear>
              {[BETWEEN, LT, GT, EQ, LTE, GTE, TOLERANCE].map(value => (
                <Option value={value}>{QCLOGIC_TYPE[value].display}</Option>
              ))}
            </Select>,
          )}
          <div style={{ display: 'flex' }} className="child-gap">
            {getStandards(getFieldValue('inputStandard.logic')).map(({ key, tip }) => {
              return getFieldDecorator(`inputStandard.${key}`)(
                <InputComponent
                  labelInValue={false}
                  placeholder={tip}
                  SOPDetail={this.props.SOPDetail}
                  type={CONSTANT.TYPE_NUMBER}
                  style={{ width: 120 }}
                />,
              );
            })}
          </div>
        </FormItem>
      </Fragment>
    );
  };

  renderTimeForm = ({ form }) => {
    const { getFieldDecorator } = form;
    return (
      <DefaultValueLogicSelect
        types={[LOGIC_BUSINESS, LOGIC_NOW_TIME]}
        form={this.form}
        SOPDetail={this.props.SOPDetail}
      />
    );
  };

  renderAuthForm = ({ form: { getFieldDecorator, getFieldValue, resetFields } }) => {
    return (
      <React.Fragment>
        <FormItem label="验证方式">
          {getFieldDecorator('inputVerifyType', {
            initialValue: 1,
          })(
            <Select style={{ width }}>
              <Option value={1}>用户名+密码</Option>
            </Select>,
          )}
        </FormItem>
        <FormItem label="校验权限">
          {getFieldDecorator('verifyType')(
            <PrivilegeTypeSelect
              types={[
                CONSTANT.SOP_STEP_PRIVILEGE_TYPE_USER,
                CONSTANT.SOP_STEP_PRIVILEGE_TYPE_USERTYPE,
                CONSTANT.SOP_STEP_PRIVILEGE_TYPE_ROLE,
              ]}
              style={{ marginRight: 10, width }}
              onChange={() => {
                resetFields(['verifyValue']);
              }}
            />,
          )}
          {getFieldDecorator('verifyValue')(
            <PrivilegeSelect privilegeType={getFieldValue('verifyType')} SOPDetail={this.props.SOPDetail} />,
          )}
        </FormItem>
      </React.Fragment>
    );
  };

  renderUserForm = ({ form: { getFieldDecorator, getFieldValue } }) => {
    return (
      <DefaultValueLogicSelect
        types={[LOGIC_BUSINESS, LOGIC_FIXED_USER]}
        form={this.form}
        SOPDetail={this.props.SOPDetail}
      />
    );
  };

  renderWeightForm = ({ form: { getFieldDecorator } }) => {
    return (
      <FormItem label="称量工位">
        {getFieldDecorator('inputWeightObject')(
          <SearchSelect style={{ width }} type="workstation" params={{ status: 1 }} />,
        )}
      </FormItem>
    );
  };

  renderAGVForm = ({ form: { getFieldDecorator } }) => {
    return (
      <React.Fragment>
        <FormItem label="添加物料方式">
          {getFieldDecorator('agvCallProperty.addMaterialType', {
            rules: [requiredRule('添加物料方式')],
          })(
            <Select style={{ width }}>
              {[{ key: 1, label: '选择二维码' }, { key: 2, label: '选择物料数量' }].map(({ key, label }) => (
                <Option value={key}>{label}</Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem label="选择产出控件">
          {getFieldDecorator('agvCallProperty.choseHold', {
            rules: [requiredRule('选择产出控件')],
          })(
            <RadioGroup>
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label="选择终点">
          {getFieldDecorator('agvCallProperty.choseDestination', {
            rules: [requiredRule('选择终点')],
          })(
            <RadioGroup>
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>,
          )}
        </FormItem>
      </React.Fragment>
    );
  };

  renderReportTypeForm = ({ form: { getFieldDecorator }, type }) => {
    if (type === CONSTANT.TYPE_REPORT) {
      return (
        <FormItem label="报表">
          {getFieldDecorator('reportId')(<SearchSelect type="batchTemplate" style={{ width }} />)}
        </FormItem>
      );
    }
    return null;
  };

  // render logic option in Select component
  getShowLogicOption = type => {
    const options = {
      [TYPE_TEXT]: [LOGIC_BUSINESS, LOGIC_FIXED_VALUE],
      [TYPE_NUMBER]: [LOGIC_BUSINESS, LOGIC_FIXED_VALUE, LOGIC_TRIGGER],
      [TYPE_TIME]: [LOGIC_BUSINESS, LOGIC_NOW_TIME],
      [TYPE_FILE]: [LOGIC_BUSINESS, LOGIC_FIXED_FILE],
      [TYPE_USER]: [LOGIC_BUSINESS, LOGIC_FIXED_USER],
      [CONSTANT.TYPE_WORKSTATION]: [LOGIC_BUSINESS],
      [CONSTANT.TYPE_DEVICE]: [LOGIC_BUSINESS],
    };
    return (options[type || TYPE_TEXT] || []).map(key => <Option value={key}>{SopControlShowLogic.get(key)}</Option>);
  };
  // render component behind the show logic select
  renderShowValueComponent = ({ showLogic }) => {
    const { SOPDetail } = this.props;
    if (!SOPDetail) {
      return <div />;
    }
    const type = this.getFieldValue('type');
    if ([LOGIC_FIXED_VALUE, LOGIC_TRIGGER].includes(showLogic)) {
      return <Input style={{ width }} />;
    } else if (showLogic === LOGIC_FIXED_FILE) {
      return (
        <Attachment prompt="只支持图片，pdf，视频" max={1} valueIsId limit={false} accept=".pdf,video/*,image/*" />
      );
    } else if (showLogic === LOGIC_FIXED_USER) {
      return <SearchSelect type="user" style={{ width }} />;
    } else if (showLogic === LOGIC_BUSINESS) {
      // 自定义字段 = 预设字段 + 新建字段
      return <SOPFieldSelect SOPDetail={SOPDetail} type={type} />;
    } else if (showLogic === LOGIC_NOW_TIME) {
      return <div />;
    }
    return <SOPFieldSelect SOPDetail={SOPDetail} type={type} />;
  };

  renderInputMaterialForm = ({ form: { getFieldDecorator, getFieldValue }, type }) => {
    const { useLatestMaterial } = this.state;
    const { isSyncInputMaterial, mBomData, inputMaterials, latestInputMaterials } = this.props;
    const bindEBomToProcessRouting = isBindEBomToProcessRouting(mBomData);
    let dataSource = [];
    if (!useLatestMaterial && inputMaterials && !isSyncInputMaterial) {
      dataSource = inputMaterials;
    } else {
      dataSource = latestInputMaterials
        .filter(node => {
          if (type === CONSTANT.TYPE_INPUT && bindEBomToProcessRouting !== false) {
            return [1, 2, 3].includes(node.materialProductionMode);
          } else if (type === CONSTANT.TYPE_RECEIVE_SCAN) {
            // 组件分配为是 或者 没有配置ebomVersion情况下有物料
            return mBomData && bindEBomToProcessRouting !== false && [4].includes(node.materialProductionMode);
          }
          return true;
        })
        .map(node => {
          const findIndex = (inputMaterials || []).findIndex(({ material: { code } }) => code === node.material.code);
          if (findIndex !== -1) {
            return inputMaterials[findIndex];
          }
          return node;
        });
    }
    const prefix = 'inputMaterialLists';
    const columns = [
      {
        title: '物料编号/名称',
        dataIndex: 'material',
        key: 'material',
        render: ({ code, name }, { enable }, index) => {
          return (
            <div style={{ display: 'flex' }} className="child-gap">
              {getFieldDecorator(`inputMaterialLists[${code}].enable`, {
                initialValue: enable,
                valuePropName: 'checked',
                noDefaultDisable: true,
              })(<Checkbox />)}
              <span>{`${decodeMaterialCode(code)}/${name}`}</span>
              {getFieldDecorator(`${prefix}[${code}].materialCode`, {
                initialValue: code,
              })(<span />)}
            </div>
          );
        },
      },
      ...(type === CONSTANT.TYPE_INPUT || type === CONSTANT.TYPE_RECEIVE_SCAN
        ? [
            {
              title: <span className="ant-form-item-required">数量</span>,
              dataIndex: 'amount',
              key: 'amount',
              render: (amount, { material }, index) => {
                const { unitName, code } = material;
                const enable = getFieldValue(`inputMaterialLists[${code}].enable`);
                return (
                  <div style={{ display: 'flex' }} className="child-gap">
                    <FormItem>
                      {getFieldDecorator(`${prefix}[${code}].amount`, {
                        rules: [
                          { required: true, message: '数量不能为空' },
                          { validator: amountValidator(10e8, 0, null, 6) },
                        ],
                        initialValue: amount,
                        hidden: !enable,
                        noDefaultDisable: true,
                      })(<Input disabled={!enable} />)}
                    </FormItem>
                    <span style={{ lineHeight: '40px', wordBreak: 'keep-all' }}>{unitName}</span>
                  </div>
                );
              },
            },
            {
              title: '上限',
              dataIndex: 'upperLimit',
              key: 'upperLimit',
              render: (upperLimit, { material: { code } }, index) => {
                const enable = getFieldValue(`inputMaterialLists[${code}].enable`);
                return (
                  <FormItem>
                    {getFieldDecorator(`${prefix}[${code}].upperLimit`, {
                      initialValue: upperLimit,
                      hidden: !enable,
                      rules: [{ validator: amountValidator(10e8, 0, null, 6) }],
                      noDefaultDisable: true,
                    })(<Input disabled={!enable} />)}
                  </FormItem>
                );
              },
            },
            {
              title: '下限',
              dataIndex: 'lowerLimit',
              key: 'lowerLimit',
              render: (lowerLimit, { material: { code } }, index) => {
                const enable = getFieldValue(`inputMaterialLists[${code}].enable`);
                return (
                  <FormItem>
                    {getFieldDecorator(`${prefix}[${code}].lowerLimit`, {
                      initialValue: lowerLimit,
                      hidden: !enable,
                      rules: [{ validator: amountValidator(10e8, 0, null, 6) }],
                      noDefaultDisable: true,
                    })(<Input disabled={!enable} />)}
                  </FormItem>
                );
              },
            },
          ]
        : []),
      type === CONSTANT.TYPE_RECEIVE_SCAN && {
        title: <span className="ant-form-item-required">仓位</span>,
        dataIndex: 'storageResponse',
        key: 'storage',
        render: (storage, { material: { code: materialCode } }, index) => {
          const { name, level, id, code } = storage || {};
          const enable = getFieldValue(`inputMaterialLists[${materialCode}].enable`);
          return (
            <FormItem>
              {getFieldDecorator(`${prefix}[${materialCode}].storageId`, {
                rules: [{ required: true, message: '仓位不能为空' }],
                initialValue: id ? `${id},${code},${level},${name}` : undefined,
                hidden: !enable,
                noDefaultDisable: true,
              })(<SecondStorageSelect style={{ width: 150 }} disabled={!enable} />)}
            </FormItem>
          );
        },
      },
      type === CONSTANT.TYPE_MATERIAL_LOT_TRANSFER && {
        title: <span className="ant-form-item-required">来源仓位</span>,
        key: 'originStorageId',
        dataIndex: 'originStorageResponse',
        render: (storage, { material: { code: materialCode } }, index) => {
          const { name, level, id, code } = storage || {};
          const enable = getFieldValue(`inputMaterialLists[${materialCode}].enable`);
          return (
            <FormItem>
              {getFieldDecorator(`${prefix}[${materialCode}].originStorageId`, {
                rules: [{ required: true, message: '仓位不能为空' }],
                initialValue: id ? `${id},${code},${level},${name}` : undefined,
                hidden: !enable,
                noDefaultDisable: true,
              })(<SecondStorageSelect style={{ width: 150 }} disabled={!enable} />)}
            </FormItem>
          );
        },
      },
      type === CONSTANT.TYPE_MATERIAL_LOT_TRANSFER && {
        title: <span className="ant-form-item-required">目标仓位</span>,
        key: 'targetStorageId',
        dataIndex: 'targetStorageResponse',
        render: (storage, { material: { code: materialCode } }, index) => {
          const { name, level, id, code } = storage || {};
          const enable = getFieldValue(`inputMaterialLists[${materialCode}].enable`);
          return (
            <FormItem>
              {getFieldDecorator(`${prefix}[${materialCode}].targetStorageId`, {
                rules: [{ required: true, message: '仓位不能为空' }],
                initialValue: id ? `${id},${code},${level},${name}` : undefined,
                hidden: !enable,
                noDefaultDisable: true,
              })(<SecondStorageSelect style={{ width: 150 }} disabled={!enable} />)}
            </FormItem>
          );
        },
      },
      {
        title: <span className="ant-form-item-required">先进先出</span>,
        dataIndex: 'fifo',
        key: 'fifo',
        width: 130,
        render: (fifo, { material: { code: materialCode } }, index) => {
          const enable = getFieldValue(`inputMaterialLists[${materialCode}].enable`);
          return getFieldDecorator(`${prefix}[${materialCode}].fifo`, {
            initialValue: fifo,
            hidden: !enable,
            noDefaultDisable: true,
          })(
            <RadioGroup disabled={!enable}>
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>,
          );
        },
      },
      {
        title: (
          <div>
            <span className="ant-form-item-required">规则</span>
            <Tooltip.AntTooltip
              title={
                <div>
                  <p>有效期: 适用于原料</p>
                  <p>入厂批次: 适用于原料</p>
                  <p>产出时间: 适用于经过收料、称量、产出的物料</p>
                </div>
              }
            >
              <Icon type="info-circle-o" style={{ marginLeft: 5, color: Colors.primary }} />
            </Tooltip.AntTooltip>
          </div>
        ),
        key: 'rule',
        dataIndex: 'fifoRule',
        render: (fifoRule, { material: { code: materialCode } }, index) => {
          if (!getFieldValue(`inputMaterialLists[${materialCode}].fifo`)) {
            return '请先选择先进先出';
          }
          const enable = getFieldValue(`inputMaterialLists[${materialCode}].enable`);
          return (
            <FormItem>
              {getFieldDecorator(`${prefix}[${materialCode}].fifoRule`, {
                initialValue: fifoRule,
                rules: [{ required: true, message: '规则必填' }],
                hidden: !enable,
                noDefaultDisable: true,
              })(
                <Select style={{ width: 100 }} disabled={!enable}>
                  {Array.from(CONSTANT.FIFO_RULES, ([key, value]) => (
                    <Option value={key}>{value}</Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          );
        },
      },
    ].filter(n => n);
    return (
      <FormItem label="可投产物料" className={styles.materialController}>
        <SimpleTable
          scroll={{ x: 1000 }}
          columns={columns}
          style={{ margin: 0, flex: 1 }}
          dataSource={dataSource.map(node => ({ ...node, key: node.material.code }))}
          pagination={false}
        />
      </FormItem>
    );
  };

  render() {
    const { className, style, mode, isCreatedByTemplate } = this.props;
    const form = this.form;
    const { getFieldDecorator, getFieldValue, resetFields } = form;
    const showLogic = this.getFieldValue('showLogic');
    const type = this.getFieldValue('type');
    getFieldDecorator('id')(<div />);
    getFieldDecorator('inputOptionListKeys', { initialValue: [0] })(<div />);
    const showValueField = getFieldDecorator('showValue', {
      rules: [requiredRule('显示逻辑')],
      hidden: !getFieldValue('showLogic') || getFieldValue('showLogic') === CONSTANT.LOGIC_NOW_TIME,
    })(this.renderShowValueComponent({ showLogic }));
    const isShowLogicField =
      (getFieldValue('property') || PROPERTY_SHOW) === PROPERTY_SHOW && ![CONSTANT.TYPE_REPORT].includes(type);
    const showLogicField = isShowLogicField && (
      <FormItem label="显示逻辑">
        <div>
          {getFieldDecorator('showLogic', {
            rules: [requiredRule('显示逻辑')],
            hidden: !isShowLogicField,
          })(
            <Select style={{ width }} onChange={() => resetFields(['showValue'])}>
              {this.getShowLogicOption(this.getFieldValue('type'))}
            </Select>,
          )}
        </div>
        <div>
          <FormItem>{getFieldValue('showLogic') && showValueField}</FormItem>
        </div>
      </FormItem>
    );
    const isRenderInputForm = getFieldValue('property') === PROPERTY_INPUT;
    const isRenderInputRequiredField =
      isRenderInputForm &&
      ![
        CONSTANT.TYPE_INPUT,
        CONSTANT.TYPE_OUTPUT,
        CONSTANT.TYPE_RECEIVE_SCAN,
        CONSTANT.TYPE_MATERIAL_LOT_TRANSFER,
        CONSTANT.TYPE_AGV,
        CONSTANT.TYPE_VIRTUAL_MATERIAL_LOT_TRANSFER,
        CONSTANT.TYPE_VIRTUAL_OUTPUT,
        CONSTANT.TYPE_VIRTUAL_RECEIVE_SCAN,
        CONSTANT.TYPE_VIRTUAL_INPUT,
      ].includes(getFieldValue('type'));
    const inputRequiredField = (
      <Fragment>
        <FormItem label="必填">
          {getFieldDecorator('inputRequired', {
            initialValue: true,
            hidden: !isRenderInputRequiredField,
          })(
            <RadioGroup>
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>,
          )}
        </FormItem>
      </Fragment>
    );
    const InputSopControlType = mode === 'sopTemplate' ? TemplateInputSopControlTypeKeys : InputSopControlTypeKeys;
    const isEditSOPByTemplateCreated = this.isTemplateMode() && !!getFieldValue('id');
    return (
      <div className={className} style={style}>
        <FormItem label="控件名称">
          {getFieldDecorator('name', {
            rules: [{ required: true, message: requiredRule('控件名称') }],
          })(<Input style={{ width }} />)}
        </FormItem>
        <FormItem label="显示名称">
          {getFieldDecorator('showName', {
            rules: [{ required: true, message: requiredRule('显示名称') }],
          })(<Input style={{ width }} />)}
        </FormItem>
        <FormItem label="属性">
          {getFieldDecorator('property', {
            initialValue: PROPERTY_SHOW,
            disabled: isEditSOPByTemplateCreated,
          })(
            <Select
              style={{ width: 200 }}
              onChange={() => {
                resetFields(['type', 'showLogic', 'showValue', 'inputOptionList']);
              }}
            >
              {Array.from(SopControlProperty, ([key, value]) => (
                <Option value={key}>{value}</Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem label="类型">
          {getFieldDecorator('type', {
            initialValue: TYPE_TEXT,
            disabled: isEditSOPByTemplateCreated,
            onChange: () => {
              this.setState({ inputOptionListKeys: [0], useLatestMaterial: true });
              resetFields([
                'showLogic',
                'showValue',
                'inputDefaultLogic',
                'inputDefaultValue',
                'updatedFieldId',
                'inputUnit',
                'inputTextType',
              ]);
            },
          })(
            <Select style={{ width: 200 }}>
              {(this.getFieldValue('property') === PROPERTY_SHOW ? DisplaySopControlTypeKeys : InputSopControlType).map(
                key => (
                  <Option value={key}>{SopControlType.get(key)}</Option>
                ),
              )}
            </Select>,
          )}
          {getFieldValue('type') === CONSTANT.TYPE_AGV && <AGVPopover style={{ marginLeft: 10 }} />}
        </FormItem>
        {showLogicField}
        {this.renderReportTypeForm({ form, type })}
        {isRenderInputRequiredField && inputRequiredField}
        {isRenderInputForm && this.renderInputForm()}
        <FormItem label="备注">
          {getFieldDecorator('inputRemark')(<Textarea style={{ width }} maxLength={1000} />)}
        </FormItem>
      </div>
    );
  }
}

ControlComponent.propTypes = {
  isCreatedByTemplate: PropTypes.bool,
  mode: PropTypes.oneOf(['sop', 'sopTemplate']),
  mBomData: PropTypes.object,
};

export default ControlComponent;
