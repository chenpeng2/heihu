import React, { Component } from 'react';
import _ from 'lodash';
import { AlterableTable, Link, Input, FormItem, InputNumber, Tooltip, DatePicker, Popconfirm } from 'components';
import { replaceSign } from 'constants';
import { amountValidator } from 'components/form';
import moment from 'utils/time';
import MaterialFieldModel from 'models/cooperate/saleOrder/MaterialFieldModel';
import { fontSub } from 'styles/color';
import MaterialSelect from '../materialSelect';
import { getOrgTaskDispatchConfig, fetchCustomFields } from '../utils';
import UnitSelect from '../unitSelect';
import styles from '../styles.scss';
import { getSOCustomColumns, getEditColumns } from './tableColumnUtil';

const FORM_ITEM_STYLE = {
  display: 'inline-block',
  height: 50,
  margin: '0 10px 0 0',
};
const tableMaxWidth = 1000;

type Props = {
  form: any,
  edit: boolean,
  fieldName: string,
  initialValue: [],
  soCustomFields: MaterialFieldModel[],
};

type State = {};

/** 物料表格 */
class MaterialTable extends Component {
  props: Props;
  state: State = {
    dataSource: [],
    selected: [],
    customFields: [],
    baseWidth: 400,
    bulkTargetDate: null,
  };

  componentDidMount() {
    this.fetchCustomFields();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.setInitialValue(nextProps.initialValue);
    }
  }

  get scroll() {
    const { soCustomFields } = this.props;
    const { customFields, baseWidth } = this.state;
    const customFieldsNum = _.get(customFields, 'length', 0);
    const soFieldLength = Array.isArray(soCustomFields) ? soCustomFields.length : 0;
    const scrollX = baseWidth + 110 * customFieldsNum + 10 + soFieldLength * 120;
    const value = scrollX >= tableMaxWidth;
    return value;
  }

  fetchCustomFields = async () => {
    const { edit } = this.props;
    const customFields = await fetchCustomFields();
    const baseWidth = edit ? 930 : 690;
    this.setState({ customFields, baseWidth });
  };

  setInitialValue = initialValue => {
    if (initialValue && initialValue.length > 0) {
      const format = initialValue.map(({ planWorkOrder, projects, ...rest }) => {
        return {
          planWorkOrder,
          projects,
          ...rest,
        };
      });
      const selected = format.map(({ unitName, materialCustomFields }) => ({ unitName, materialCustomFields }));
      this.setState({ selected });
      this.setDataSource(format);
    }
  };

  setDataSource = data => {
    this.setState({ dataSource: data || [] });
  };

  handleMaterialSelect = (select, option, key) => {
    const { selected } = this.state;
    const { unitName } = _.get(option, 'props.masterUnit', {});
    const materialCustomFields = _.get(option, 'props.materialCustomFields', {});
    _.set(selected, `[${key}].unitName`, unitName);
    _.set(selected, `[${key}].materialCustomFields`, materialCustomFields);
    this.setState({ selected });
  };

  bulkSelectTargetDate = () => {
    const { bulkTargetDate } = this.state;
    const formData = this.props.form.getFieldsValue();
    const { materialList } = formData;
    if (materialList && materialList.length > 0) {
      const _materialList = materialList.map(data => ({ ...data, targetDate: bulkTargetDate }));
      this.props.form.setFieldsValue({
        ...formData,
        materialList: _materialList,
      });
    }
  };

  getColumns(scroll) {
    const {
      form: { getFieldDecorator },
      form,
      fieldName,
      edit,
      soCustomFields,
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const { customFields } = this.state;
    const taskDispatchConfig = getOrgTaskDispatchConfig();
    const title = taskDispatchConfig === 'manager' ? '计划工单' : '项目';
    const key = taskDispatchConfig === 'manager' ? 'planWorkOrder' : 'projects';
    const customFieldsColumns =
      customFields &&
      customFields.map(keyName => {
        return {
          title: keyName,
          key: keyName,
          dataIndex: keyName,
          width: 110,
          render: (data, record) => {
            const { key } = record;
            const { selected } = this.state;
            const materialCustomFields = _.get(selected, `[${key}].materialCustomFields`);
            const node = _.find(materialCustomFields, o => _.get(o, 'keyName') === keyName);
            const { keyValue } = node || {};
            return (
              <div style={{ ...FORM_ITEM_STYLE, marginTop: 10 }}>
                <Tooltip text={keyValue || replaceSign} length={7} />
              </div>
            );
          },
        };
      });
    const editColumns = getEditColumns(edit, title, key);
    let columns = [
      {
        title: '',
        key: 'id',
        dataIndex: 'id',
        colspan: 0,
        width: 0,
        render: (data, record, i) => {
          const { key } = record;
          return (
            <React.Fragment>
              <FormItem style={{ display: 'none' }}>
                {getFieldDecorator(`${fieldName}[${key}].id`, {
                  initialValue: data,
                })(<Input />)}
              </FormItem>
            </React.Fragment>
          );
        },
      },
      {
        title: '物料编号／名称',
        key: 'materialCode',
        dataIndex: 'materialCode',
        fixed: scroll ? 'left' : null,
        width: 230,
        render: (data, record) => {
          const { key, disabled } = record;
          return (
            <FormItem style={{ ...FORM_ITEM_STYLE }}>
              {getFieldDecorator(`${fieldName}[${key}].materialCode`, {
                initialValue: data,
                rules: [
                  {
                    required: true,
                    message: '物料必填',
                  },
                ],
                onChange: value => {
                  this.props.form.setFieldsValue({ [`${fieldName}[${key}].amount`]: null });
                },
              })(
                <MaterialSelect
                  placeholder="请选择物料"
                  style={{ width: 200 }}
                  disabled={disabled}
                  onSelect={(select, option) => this.handleMaterialSelect(select, option, key)}
                />,
              )}
            </FormItem>
          );
        },
      },
      ...customFieldsColumns,
      {
        title: '数量与单位',
        key: 'amount',
        dataIndex: 'amount',
        width: 230,
        render: (data, record) => {
          const { key, disabled, amountDisabled } = record;
          const { selected } = this.state;
          const masterUnitName = _.get(selected, `[${key}].unitName`);
          return (
            <div style={{ display: 'flex' }}>
              <FormItem style={{ ...FORM_ITEM_STYLE }}>
                {getFieldDecorator(`${fieldName}[${key}].amount`, {
                  initialValue: data,
                  rules: [
                    {
                      required: true,
                      message: '数量必填',
                    },
                    {
                      validator: amountValidator(100000000),
                    },
                  ],
                })(<InputNumber min={0} style={{ width: 100 }} disabled={amountDisabled} />)}
              </FormItem>
              <FormItem style={{ ...FORM_ITEM_STYLE }}>
                {getFieldDecorator(`${fieldName}[${key}].unitName`, {
                  initialValue: masterUnitName,
                })(
                  <UnitSelect
                    style={{ width: 100 }}
                    disabled={!this.props.form.getFieldValue(`${fieldName}[${key}].materialCode`) || disabled}
                    params={{ materialCode: this.props.form.getFieldValue(`${fieldName}[${key}].materialCode`) }}
                  />,
                )}
              </FormItem>
            </div>
          );
        },
      },
      ...editColumns,
      {
        title: (
          <div>
            {changeChineseToLocale('交货日期')}
            {edit ? null : (
              <Popconfirm
                placement="bottom"
                overlayClassName={styles.bulkSelectTargetDate}
                title={
                  <div>
                    <span style={{ marginRight: 10, color: fontSub }}>交货日期</span>
                    <DatePicker
                      format="YYYY-MM-DD"
                      placeholder="请选择"
                      style={{ width: 200 }}
                      allowClear
                      onChange={date => this.setState({ bulkTargetDate: date })}
                    />
                  </div>
                }
                onConfirm={this.bulkSelectTargetDate}
                okText="确定"
                cancelText="取消"
              >
                <Link disabled={_.get(this.state.dataSource, 'length') === 0} style={{ marginLeft: 10 }}>
                  选择全部
                </Link>
              </Popconfirm>
            )}
          </div>
        ),
        dataIndex: 'targetDate',
        key: 'targetDate',
        width: 230,
        render: (data, record) => {
          const { key, targetDateDisabled } = record;
          return (
            <FormItem style={{ ...FORM_ITEM_STYLE }}>
              {getFieldDecorator(`${fieldName}[${key}].targetDate`, {
                initialValue: data ? moment(data) : null,
                rules: [
                  {
                    required: true,
                    message: '交货日期必填',
                  },
                ],
              })(
                <DatePicker
                  disabled={targetDateDisabled}
                  format="YYYY-MM-DD"
                  placeholder="请选择"
                  style={{ width: 200 }}
                />,
              )}
            </FormItem>
          );
        },
      },
    ];
    const soCustomColumns = getSOCustomColumns(soCustomFields, form, fieldName);
    if (Array.isArray(soCustomColumns)) {
      columns = columns.concat(soCustomColumns);
    }
    return columns;
  }

  render() {
    const { dataSource, baseWidth } = this.state;
    const { scroll } = this;
    const columns = this.getColumns(scroll);
    const style = { margin: '0 20px', minWidth: baseWidth, maxWidth: tableMaxWidth };
    return (
      <AlterableTable
        style={style}
        scroll={{ x: scroll }}
        dataSource={dataSource}
        setDataSource={this.setDataSource}
        columns={columns}
      />
    );
  }
}

MaterialTable.contextTypes = {
  changeChineseToLocale: () => {},
};

export default MaterialTable;
