import React, { Component } from 'react';
import _ from 'lodash';

import { Icon, Radio, Text, Tooltip, withForm, InputNumber, FormItem, DatePicker, Input } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { arrayIsEmpty } from 'utils/array';
import { amountValidator } from 'src/components/form';
import { replaceDot } from 'src/containers/purchase_list/util/repalceDot';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import MaterialListTreeTable from '../base/material_list_tree_table';

type Props = {
  style: {},
  value: any,
  form: any,
  columnsData: any,
};

class Material_Table_For_Edit extends Component {
  props: Props;
  state = {
    __initial__: true,
    row_disable: {},
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

  get_columns = () => {
    const { form } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form || {};
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const base_render = data => <Tooltip text={data || replaceSign} length={30} /> || replaceSign;
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
        key: 'codeAndName',
        width: 200,
        render: data => {
          if (!data) return null;

          const { code, name } = data || {};
          if (code && name) {
            return <Tooltip text={`${code}/${name}`} length={20} />;
          }
          return null;
        },
      },
      {
        title: '数量',
        dataIndex: 'material',
        key: 'amount',
        width: 150,
        render: (data, record, index) => {
          const { amountPlanned, currentUnitName } = record;
          const { unit, code: _code } = data || {};
          const code = replaceDot(_code);
          return (
            <FormItem>
              {getFieldDecorator(`material-${code}-${index}-amount`, {
                rules: [
                  { required: true, message: '数量必填' },
                  { validator: amountValidator(null, { value: 0, equal: false, message: '数字必需大于0' }) },
                ],
                initialValue: amountPlanned ? amountPlanned.toString() : '0',
              })(<InputNumber />)}
              <span style={{ marginLeft: 5 }}>
                <Tooltip text={currentUnitName || unit || replaceSign} length={5} />
              </span>
            </FormItem>
          );
        },
      },
      {
        title: '需求时间',
        width: 200,
        dataIndex: 'demandTime',
        key: 'demandTime',
        render: (data, record, index) => {
          const { material } = record || {};
          const { code: _code } = material || {};
          const code = replaceDot(_code);

          return (
            <FormItem>
              {getFieldDecorator(`material-${code}-${index}-demandTime`, {
                rules: [{ required: true, message: '需求时间必填' }],
                initialValue: data ? moment(data) : null,
              })(<DatePicker />)}
            </FormItem>
          );
        },
      },
      {
        title: 'ETA',
        dataIndex: 'eta',
        key: 'eta',
        width: 150,
        render: data => {
          return data ? moment(data).format('YYYY/MM/DD') : replaceSign;
        },
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 150,
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
        width: 200,
        dataIndex: 'concernedPersonList',
        key: 'focus_man',
        render: (data, record, index) => {
          const { material } = record || {};
          const { code: _code } = material || {};
          const code = replaceDot(_code);
          return (
            <FormItem>
              {getFieldDecorator(`material-${code}-${index}-concernedPersonList`, {
                initialValue: arrayIsEmpty(data) ? [] : data,
              })(<SearchSelect maxTagCount={2} style={{ width: 170 }} labelInValue type={'account'} mode="multiple" />)}
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
        width: 170,
        dataIndex: 'note',
        key: 'note',
        render: (data, record, index) => {
          const { material } = record || {};
          const { code: _code } = material || {};
          const code = replaceDot(_code);
          return (
            <FormItem>
              {getFieldDecorator(`material-${code}-${index}-note`, {
                initialValue: data || '',
                rules: [{ max: 50, message: '备注最多50字符' }],
              })(<Input />)}
            </FormItem>
          );
        },
      },
    ];
  };

  validate_form_value = () => {
    const { form } = this.props;
    let errors = false;

    form.validateFieldsAndScroll((error, values) => {
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

export default withForm({}, Material_Table_For_Edit);
