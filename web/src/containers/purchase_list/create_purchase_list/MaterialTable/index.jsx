import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { thousandBitSeparator } from 'utils/number';
import { arrayIsEmpty } from 'utils/array';
import {
  Radio,
  Tooltip,
  withForm,
  Table,
  InputNumber,
  DatePicker,
  FormItem,
  Input,
  Select,
  PlainText,
  Text,
  Icon,
} from 'components';
import { replaceSign } from 'constants';
import { amountValidator } from 'components/form';
import SearchSelect from 'components/select/searchSelect';
import moment from 'utils/time';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import AddMaterialModal from '../add_material_modal/add_material_modal';
import PlainButton from './PlainButton';
import Footer from './Footer';

const MATERIAL_AMOUNT = 'material_list_amount';
const Option = Select.Option;

type Props = {
  style: {},
  value: [],
  form: {},
};

const get_payload = (value, type) => {
  if (!value) return null;

  // 利用 material_amount 可以避免已经删除数据的提交
  const material_list_amount = value[MATERIAL_AMOUNT];

  const res = [];
  for (let i = 0; i < material_list_amount; i += 1) {
    res[i] = {
      material: {
        newMaterial: value[`newMaterial-${i}`],
        materialName: value[`materialName-${i}`],
        materialCode: value[`materialCode-${i}`],
        amount: value[`amount-${i}`],
        amountActual: value[`amountActual-${i}`],
        admintAmount: value[`admintAmount-${i}`],
        amountPlanned: value[`amountPlanned-${i}`],
        unit: value[`unit-${i}`],
        unitName: value[`unitName-${i}`],
        unitConversions: value[`unitConversions-${i}`],
      },
      project: {
        projectCode: value[`projectCode-${i}`],
        purchaseOrderCode: value[`purchaseOrderCode-${i}`],
      },
      workOrder: {
        workOrderCode: value[`workOrderCode-${i}`],
        purchaseOrderCode: value[`purchaseOrderCode-${i}`],
      },
      concernedPersonIds: value[`concernedPersonIds-${i}`],
      note: value[`note-${i}`],
      demandTime: value[`demandTime-${i}`],
      warning: value[`warning-${i}`],
      warningLine: value[`warningLine-${i}`],
    };
    if (type === 'submit') {
      res[i].demandTime = value[`demandTime-${i}`];
    }
    if (type === 'compare') {
      res[i].project.demandTime = Date.parse(value[`demandTime-${i}`]);
    }
  }

  return res;
};

class MaterialTable extends Component {
  props: Props;
  state = {
    show_add_material_modal: false,
    material_data: null,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  componentWillReceiveProps(nextProps) {
    const { value: next_value, form } = nextProps || {};
    const { value: now_value } = this.props || {};

    if (!_.isEqual(next_value, now_value)) {
      this.set_form_value(form, next_value);
    }
  }

  /** 移除物料 */
  onRemoveMaterial(index) {
    const { form } = this.props;
    const fieldsValue = form.getFieldsValue();
    const old_value = get_payload(fieldsValue, 'compare');
    if (!Array.isArray(old_value)) return;

    const last_length = old_value.length;
    old_value.splice(index, 1);
    this.delete_form_value(old_value, last_length);
  }

  get_columns = configValue => {
    const { form } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;

    const tooltipContent = changeChineseToLocaleWithoutIntl(
      '启用预警后会在到达预警提前期时发送通知给采购清单创建人、处理人和物料行关注人',
    );
    const render_operation = (_, __, index) => {
      return <PlainButton onPress={() => this.onRemoveMaterial(index)} />;
    };
    const warningTitle = (
      <div>
        <Text>启用预警</Text>
        <Tooltip placement="top" title={tooltipContent}>
          <Icon style={{ marginLeft: 4, color: 'rgba(0,0,0,0.4)' }} type="exclamation-circle-o" />
        </Tooltip>
      </div>
    );

    return [
      {
        title: '编号/名称',
        dataIndex: 'material',
        key: 'material',
        width: 200,
        render: (data, record, index) => {
          const { materialCode, materialName } = data || {};
          const rules = [{ required: true, message: changeChineseToLocaleWithoutIntl('物料必填') }];

          const onSelect = value => {
            const unit = value.key.split('≈')[1];
            const unitConversions = JSON.parse(value.key.split('≈')[2]);
            setFieldsValue({ [`unit-${index}`]: { label: unit, key: `${unit}-1` } });
            setFieldsValue({ [`unitName-${index}`]: { label: unit, key: `${unit}-1` } });
            setFieldsValue({ [`unitConversions-${index}`]: unitConversions });
          };

          return materialName || materialCode ? (
            <Tooltip text={`${materialCode}/${materialName}`} length={20} />
          ) : (
            <FormItem>
              {getFieldDecorator(`newMaterial-${index}`, { rules })(
                <SearchSelect
                  params={{ status: 1 }}
                  type="materialBySearch"
                  allowClear={false}
                  onSelect={onSelect}
                  labelInValue
                  getKey={value => `${value.code}≈${value.unitName}≈${JSON.stringify(value.unitConversions)}`}
                  style={{ width: 180 }}
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '数量',
        dataIndex: 'material',
        key: 'amount',
        width: 200,
        render: (data, record, index) => {
          const { admintAmount, unitName, unitConversions } = data || {};
          const units = [unitName];
          if (unitConversions && unitConversions.length) {
            unitConversions.forEach(n => {
              units.push({ label: n.slaveUnitName, key: `${n.slaveUnitId}-${n.slaveUnitCount}-${n.masterUnitCount}` });
            });
          }
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`amount-${index}`, {
                  rules: [
                    { required: true, message: '数量必填' },
                    { validator: amountValidator(null, { value: 0, equal: false, message: '数字必需大于0' }) },
                  ],
                })(<InputNumber placeholder={'请输入'} />)}
                {getFieldDecorator(`unit-${index}`)(
                  <Select
                    onChange={value => {
                      const { key } = value;
                      setFieldsValue({
                        [`amountActual-${index}`]: !key.split('-')[2]
                          ? admintAmount
                          : parseFloat(((admintAmount * key.split('-')[1]) / key.split('-')[2]).toFixed(6)),
                      });
                    }}
                    style={{ width: 80, marginLeft: 10 }}
                    disabled={!units[0]}
                    labelInValue
                  >
                    {_.compact(units).map(({ key, label }) => (
                      <Option value={key}>{label}</Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '已采购数量',
        dataIndex: 'material',
        key: 'purchase_amount',
        width: 120,
        render: data => {
          const { amountActual, unit } = data || {};
          const text = `${thousandBitSeparator(amountActual)} ${(unit && unit.label) || replaceSign}`;
          return amountActual >= 0 ? <Tooltip text={text} length={10} /> : replaceSign;
        },
      },
      {
        title: '需求时间',
        key: 'time',
        width: 200,
        render: (_, record, index) => {
          return (
            <FormItem>
              {getFieldDecorator(`demandTime-${index}`, {
                rules: [
                  {
                    required: true,
                    message: '需求时间必填',
                  },
                ],
              })(<DatePicker />)}
            </FormItem>
          );
        },
      },
      {
        title: '订单编号',
        dataIndex: configValue === 'manager' ? 'workOrder' : 'project',
        key: 'purchaseOrder_no',
        width: 100,
        render: data => {
          const { purchaseOrderCode } = data || {};

          return purchaseOrderCode || replaceSign;
        },
      },
      {
        title: configValue === 'manager' ? '计划工单编号' : '项目编号',
        dataIndex: configValue === 'manager' ? 'workOrder' : 'project',
        key: 'product_no',
        width: 150,
        render: data => {
          let code = '';
          if (configValue === 'manager') {
            code = data.workOrderCode;
          } else {
            code = data.projectCode;
          }
          return code || replaceSign;
        },
      },
      {
        title: '关注人',
        dataIndex: 'concernedPersonIds',
        key: 'focus_man',
        width: 200,
        render: (data, __, index) => {
          return (
            <FormItem>
              {getFieldDecorator(`concernedPersonIds-${index}`, {
                initialValue: data,
              })(<SearchSelect maxTagCount={2} style={{ width: 170 }} type={'account'} mode="multiple" />)}
            </FormItem>
          );
        },
      },
      {
        title: warningTitle,
        dataIndex: 'warning',
        key: 'warning',
        width: 120,
        render: (data, record, index) => {
          return (
            <FormItem>
              {getFieldDecorator(`warning-${index}`, {
                initialValue: data || 0,
                onChange: v => {
                  form.resetFields([`warningLine-${index}`]);
                },
              })(
                <Radio.Group>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </Radio.Group>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '预警提前期',
        dataIndex: 'warningLine',
        key: 'warningLine',
        width: 130,
        render: (data, record, index) => {
          return (
            <FormItem>
              {getFieldDecorator(`warningLine-${index}`, {
                rules: [{ required: getFieldValue(`warning-${index}`), message: '预警提前期必填' }],
              })(
                <InputNumber
                  disabled={!getFieldValue(`warning-${index}`)}
                  style={{ width: 90, marginRight: 8 }}
                  min={0}
                  step={1}
                />,
              )}
              <Text>天</Text>
            </FormItem>
          );
        },
      },
      {
        title: '备注',
        dataIndex: 'note',
        key: 'note',
        width: 200,
        render: (data, __, index) => {
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`note-${index}`, {
                  initialValue: data || '',
                  rules: [{ max: 50, message: '备注最多50字符' }],
                })(<Input />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '操作',
        key: 'operation',
        width: 100,
        fixed: 'right',
        render: render_operation,
      },
    ];
  };

  validate_form_value = () => {
    const { form } = this.props;
    let errors = false;

    form.validateFieldsAndScroll(error => {
      if (error) errors = error;
    });
    return errors;
  };

  delete_form_value = (new_value, old_value_length) => {
    const { form } = this.props;
    if (!Array.isArray(new_value)) return;

    form.resetFields();

    const new_value_length = new_value.length;
    for (let i = new_value_length; i < old_value_length; i += 1) {
      // 根据last_length来完成删除的时候对数据的rules的取消。取消的部分是被删除而多出来的fields。依旧存在的fields会被复写
      // 这是一种糟糕的hack写法
      form.getFieldDecorator(`amount-${i}`);
      form.getFieldDecorator(`amountPlanned-${i}`);
      form.getFieldDecorator(`newMaterial-${i}`);
      form.getFieldDecorator(`materialName-${i}`);
      form.getFieldDecorator(`materialCode-${i}`);
      form.getFieldDecorator(`amountActual-${i}`);
      form.getFieldDecorator(`unit-${i}`);
      form.getFieldDecorator(`projectCode-${i}`);
      form.getFieldDecorator(`purchaseOrderCode-${i}`);
      form.getFieldDecorator(`demandTime-${i}`);
      form.getFieldDecorator(`concernedPersonIds-${i}`);
      form.getFieldDecorator(`warning-${i}`);
      form.getFieldDecorator(`warningLine-${i}`);
      form.getFieldDecorator(`note-${i}`);
    }

    this.set_form_value(form, new_value);
  };

  set_form_value = (form, value) => {
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    if (!arrayIsEmpty(value)) {
      form.getFieldDecorator(MATERIAL_AMOUNT);
      form.setFieldsValue({ [MATERIAL_AMOUNT]: value.length || 0 });
      const _values = {};
      value.forEach((item, index) => {
        const { material, project, workOrder, demandTime } = item || {};
        const {
          materialCode,
          materialName,
          amount,
          amountActual,
          admintAmount,
          unit,
          unitName,
          unitConversions,
          amountPlanned,
          note,
          newMaterial = null,
          warning,
          warningLine,
        } = material || {};
        const {
          projectCode,
          purchaseOrderCode,
          demandTime: projectDemandTime,
          concernedPersonIds: projectConcernedPersonIds,
        } = project || {};
        const {
          workOrderCode,
          purchaseOrderCode: _purchaseOrderCode,
          demandTime: workOrderDemandTime,
          concernedPersonIds: _workOrderConcernedPersonIds,
        } = workOrder || {};
        const initialDemandTime = configValue === 'manager' ? workOrderDemandTime : projectDemandTime;
        const demandTimeFormValue = demandTime || initialDemandTime;
        const max_amount = amountPlanned - amountActual;
        const initialConcernedPersonIds =
          configValue === 'manager' ? _workOrderConcernedPersonIds : projectConcernedPersonIds;

        form.getFieldDecorator(`amount-${index}`, {
          rules: [
            {
              required: true,
              message: '数量必填',
            },
            {
              validator: amountValidator(typeof max_amount === 'number' ? max_amount : null, 0),
            },
          ],
        });
        _values[`amount-${index}`] = amount;

        form.getFieldDecorator(`amountPlanned-${index}`);
        _values[`amountPlanned-${index}`] = amountPlanned;

        form.getFieldDecorator(`material-${index}`);
        _values[`newMaterial-${index}`] = newMaterial;

        form.getFieldDecorator(`materialName-${index}`);
        _values[`materialName-${index}`] = materialName;

        form.getFieldDecorator(`materialCode-${index}`);
        _values[`materialCode-${index}`] = materialCode;

        form.getFieldDecorator(`amountActual-${index}`);
        _values[`amountActual-${index}`] = amountActual;

        form.getFieldDecorator(`admintAmount-${index}`);
        _values[`admintAmount-${index}`] = admintAmount;

        form.getFieldDecorator(`unit-${index}`);
        _values[`unit-${index}`] = unit;

        form.getFieldDecorator(`unitName-${index}`);
        _values[`unitName-${index}`] = unitName;

        form.getFieldDecorator(`unitConversions-${index}`);
        _values[`unitConversions-${index}`] = unitConversions;

        form.getFieldDecorator(`projectCode-${index}`);
        _values[`projectCode-${index}`] = projectCode;

        form.getFieldDecorator(`workOrderCode-${index}`);
        _values[`workOrderCode-${index}`] = workOrderCode;

        form.getFieldDecorator(`purchaseOrderCode-${index}`);
        _values[`purchaseOrderCode-${index}`] = configValue === 'manager' ? _purchaseOrderCode : purchaseOrderCode;

        form.getFieldDecorator(`demandTime-${index}`, {
          rules: [
            {
              required: true,
              message: '需求时间必填',
            },
          ],
        });
        _values[`demandTime-${index}`] = demandTimeFormValue ? moment(demandTimeFormValue) : null;

        form.getFieldDecorator(`concernedPersonIds-${index}`);
        _values[`concernedPersonIds-${index}`] = initialConcernedPersonIds;
        form.getFieldDecorator(`warning-${index}`);
        _values[`warning-${index}`] = warning;
        form.getFieldDecorator(`warningLine-${index}`);
        _values[`warningLine-${index}`] = warningLine;
        form.getFieldDecorator(`note-${index}`);
        _values[`note-${index}`] = note;
      });

      form.setFieldsValue(_values);
    }
  };

  add_form_value = new_value => {
    if (!Array.isArray(new_value)) return;

    const { form } = this.props;
    const { getFieldsValue } = form;
    const old_value = get_payload(getFieldsValue());
    if (!Array.isArray(old_value)) return;
    // 需要判断是否重复
    this.set_form_value(form, _.uniq(old_value.concat(new_value)));
  };

  /** 从工单或项目添加物料 */
  onAddMaterial = () => {
    this.setState({ show_add_material_modal: true });
  };

  /** 手动添加物料 */
  onManualAddMaterial = () => {
    const new_value = [{ material: {}, project: {}, workOrder: {} }];
    this.add_form_value(new_value);
  };

  renderFooter = configValue => {
    const title = configValue === 'manager' ? '从工单中添加物料' : '从项目中添加物料';
    return (
      <Footer leftBtnTitle={title} onPressLeftBtn={this.onAddMaterial} onPressRightBtn={this.onManualAddMaterial} />
    );
  };

  render() {
    const { form, style } = this.props;
    const { config, show_add_material_modal } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const material_data = get_payload(form.getFieldsValue());
    const columns = this.get_columns(configValue);

    return (
      <React.Fragment>
        <Table
          style={{ ...style, margin: 0 }}
          tableStyle={{ width: 1000 }}
          scroll={{ y: 260, x: 1800 }}
          locale={{ emptyText: <PlainText text="请添加物料" /> }}
          columns={columns}
          dataSource={material_data || []}
          pagination={false}
          footer={() => this.renderFooter(configValue)}
        />
        <AddMaterialModal
          visible={show_add_material_modal}
          last_selected_material_data={material_data || []}
          add_value={this.add_form_value}
          change_visible={value => {
            this.setState({ show_add_material_modal: value });
          }}
        />
      </React.Fragment>
    );
  }
}

export default withForm(
  {
    onValuesChange: (props, value, allValues) => {
      props.onChange(get_payload(_.cloneDeep({ ...allValues, ...value }), 'submit'));
    },
  },
  MaterialTable,
);
