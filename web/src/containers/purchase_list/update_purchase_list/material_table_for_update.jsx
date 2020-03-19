import React, { Component } from 'react';
import _ from 'lodash';

import { Tooltip, withForm, FormItem, DatePicker, InputNumber, Icon, Text, Radio } from 'src/components';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'utils/array';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import moment from 'src/utils/time';
import { amountValidator } from 'src/components/form';
import { replaceDot } from 'src/containers/purchase_list/util/repalceDot';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import MaterialListTreeTable from '../base/material_list_tree_table';

type Props = {
  style: {},
  value: any,
  form: any,
  columnsData: any,
};

class Material_Table_For_Update extends Component {
  props: Props;
  state = {
    tableData: [],
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(nextProps.columnsData, this.props.columnsData)) {
      this.setInitialData(nextProps.columnsData);
    }
    return true;
  }

  setInitialData = initialData => {
    this.setState({ tableData: arrayIsEmpty(initialData) ? [] : initialData });
  };

  set_form_value = (form, value) => {
    const { getFieldDecorator, setFieldsValue } = form;
    const _value = {};
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const { code: material_code_beforeReplace, eta, amountInFactory } = item || {};
        const material_code = replaceDot(material_code_beforeReplace);
        if (material_code) {
          getFieldDecorator(`material-${material_code}-${index}-eta`);
          _value[`material-${material_code}-${index}-eta`] = eta ? moment(eta) : null;
          getFieldDecorator(`material-${material_code}-${index}-amountInFactory`);
          _value[`material-${material_code}-${index}-amountInFactory`] = amountInFactory;
        }
      });
    }
    setFieldsValue(_value);
  };

  get_columns = () => {
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form || {};
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const base_render = data => <FormItem>{data ? <Tooltip text={data} length={15} /> : replaceSign}</FormItem>;
    const tooltipContent = changeChineseToLocaleWithoutIntl(
      '启用预警后会在到达预警提前期时发送通知给采购清单创建人、处理人和物料行关注人',
    );
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
        width: 200,
        key: 'codeAndName',
        render: data => {
          if (!data) return <FormItem>{replaceSign}</FormItem>;

          const { code, name } = data || {};
          if (code || name) {
            return (
              <FormItem>
                <Tooltip text={`${code || replaceSign}/${name || replaceSign}`} length={20} />
              </FormItem>
            );
          }
        },
      },
      {
        title: '数量',
        width: 150,
        dataIndex: 'material',
        key: 'amount',
        render: (data, record) => {
          const { currentUnitName } = record;
          const { unit } = data || {};
          return (
            <FormItem>
              {record.amountPlanned >= 0 ? (
                <Tooltip text={`${record.amountPlanned} ${currentUnitName || unit || replaceSign}`} length={10} />
              ) : (
                replaceSign
              )}
            </FormItem>
          );
        },
      },
      {
        title: '需求时间',
        width: 150,
        dataIndex: 'demandTime',
        key: 'demandTime',
        render: (data, record) => {
          return <FormItem>{data ? moment(data).format('YYYY/MM/DD') : replaceSign}</FormItem>;
        },
      },
      {
        title: 'ETA',
        width: 150,
        dataIndex: 'eta',
        key: 'eta',
        render: (data, record, index) => {
          const { material } = record || {};
          const { code: _code } = material || {};
          const code = replaceDot(_code);
          return (
            <FormItem>
              {getFieldDecorator(`material-${code}-${index}-eta`, {
                initialValue: data ? moment(data) : null,
              })(<DatePicker />)}
            </FormItem>
          );
        },
      },
      {
        title: '入厂数',
        width: 150,
        dataIndex: 'amountInFactory',
        key: 'amountInFactory',
        render: (data, record, index) => {
          const { material } = record || {};
          const { code: _code } = material || {};
          const code = replaceDot(_code);
          return (
            <FormItem>
              {getFieldDecorator(`material-${code}-${index}-amountInFactory`, {
                rules: [{ validator: amountValidator(null, 0) }],
                initialValue: data,
              })(<InputNumber disabled />)}
            </FormItem>
          );
        },
      },
      {
        title: '订单编号',
        width: 150,
        dataIndex: 'purchaseOrderCode',
        key: 'purchaseOrderCode',
        render: base_render,
      },
      {
        title: configValue === 'manager' ? '计划工单编号' : '项目编号',
        width: 150,
        dataIndex: configValue === 'manager' ? 'planWorkOrderCode' : 'projectCode',
        key: 'projectCode',
        render: base_render,
      },
      {
        title: '关注人',
        dataIndex: 'concernedPersonList',
        key: 'focus_man',
        width: 150,
        render: data => {
          if (arrayIsEmpty(data)) return replaceSign;
          return (
            <FormItem>
              <Tooltip text={data.map(x => x.name).join(',')} length={12} />
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
          const code = _.get(record, 'material.code');
          return (
            <FormItem>
              {getFieldDecorator(`material-${code}-${index}-warning`, {
                initialValue: data ? 1 : 0,
                onChange: v => {
                  _.set(this.state, `tableData[${index}].warningLine`, null);
                  form.resetFields([`material-${code}-${index}-warningLine`]);
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
          const code = _.get(record, 'material.code');
          return (
            <FormItem>
              {getFieldDecorator(`material-${code}-${index}-warningLine`, {
                initialValue: data,
                rules: [{ required: getFieldValue(`material-${code}-${index}-warning`), message: '预警提前期必填' }],
              })(
                <InputNumber
                  disabled={!getFieldValue(`material-${code}-${index}-warning`)}
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
        width: 150,
        dataIndex: 'note',
        key: 'note',
        render: data => {
          return <FormItem>{data || replaceSign}</FormItem>;
        },
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

  render() {
    const { tableData } = this.state;
    const columns = this.get_columns();

    return <MaterialListTreeTable material_data={tableData} columns={columns} />;
  }
}

export default withForm(
  {
    onValuesChange: (props, value, allValues) => {
      props.onChange(_.cloneDeep(allValues));
    },
  },
  Material_Table_For_Update,
);
