import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Select, Tooltip, Table, message, Link, Icon, FormItem, InputNumber } from 'src/components/index';
import SearchSelect from 'src/components/select/searchSelect';
import { replaceSign } from 'src/constants';
import MaterialUnitSelect from 'src/containers/unit/materialUnitSelect';
import { amountValidator } from 'src/components/form/index';
import { arrayIsEmpty } from 'src/utils/array';

let KEY = 0;
const Option = Select.Option;

class MaterialListForm extends Component {
  state = {
    data: [],
  };

  // 将表格重置为原始状态
  backToInitialState = () => {
    KEY = 0;
    const { form } = this.props;
    form.resetFields(['materialList']);
    this.setState({ data: [] });
  };

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialData, this.props.initialData)) {
      this.setInitialData(nextProps);
    }
    if (!_.isEqual(nextProps.planAmount, this.props.planAmount)) {
      this.setInitialData(nextProps);
    }
  }

  setInitialData = props => {
    const { form, initialData, planAmount, isInnerPlanAmount } = props || this.props;
    if (isInnerPlanAmount) return;
    if (initialData) {
      this.setState(
        {
          data: Array.isArray(initialData)
            ? initialData.map((i, index) => {
                const { remark, unitId, unitName, materialCode, amount, allAmount } = i || {};
                KEY = index;
                return {
                  key: KEY,
                  unit: { id: unitId, name: unitName },
                  material: {
                    code: materialCode,
                  },
                  desc: remark,
                  nestAmount: amount,
                  allAmount,
                };
              })
            : [{ key: KEY }],
        },
        () => {
          const valueAfterFormat = !arrayIsEmpty(initialData)
            ? initialData.map(i => {
                const { seq, unitId, unitName, materialCode, materialName, remark, amount, allAmount } = i || {};
                return {
                  nestAmount: amount,
                  lineId: seq,
                  unit: { key: unitId, label: unitName },
                  material: { key: materialCode, label: `${materialCode}/${materialName}` },
                  desc: remark,
                  allAmount: typeof planAmount === 'number' ? planAmount * amount : allAmount,
                };
              })
            : [];
          form.setFieldsValue({
            materialList: valueAfterFormat,
          });
        },
      );
    }
  };

  tableInst = React.createRef();

  getColumns = () => {
    const { form, setPlanAmount } = this.props;
    const { getFieldDecorator } = form || {};

    return [
      {
        title: '行号',
        width: 60,
        key: 'seq',
        render: (__, record, index) => {
          const { key } = record || {};

          return (
            <div style={{ paddingBottom: 10 }}>
              {getFieldDecorator(`materialList[${key}].lineId`, { initialValue: index + 1 })(<span>{index + 1}</span>)}
            </div>
          );
        },
      },
      {
        title: '物料编号/名称',
        width: 250,
        key: 'material',
        render: (__, record) => {
          const { key, disabled } = record;
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].material`, {
                rules: [
                  {
                    required: true,
                    message: '物料必填',
                  },
                ],
              })(
                <SearchSelect
                  disabled
                  params={{ status: 1 }}
                  style={{ width: 200 }}
                  type={'materialBySearch'}
                  renderOption={optionData => {
                    const { key, label, ...rest } = optionData || {};
                    return (
                      <Option key={`key-${key}`} value={key} title={label} {...rest}>
                        {label}
                      </Option>
                    );
                  }}
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '规格描述',
        width: 230,
        key: 'desc',
        render: (__, record) => {
          const { desc, key } = record || {};
          const text = desc || replaceSign;
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].remark`, {
                initialValue: desc,
              })(<Tooltip text={text} length={16} />)}
            </FormItem>
          );
        },
      },
      {
        title: '需求数',
        width: 230,
        key: 'lineAttachment',
        render: (__, record) => {
          const { key } = record || {};
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].nestAmount`, {
                rules: [
                  {
                    required: true,
                    message: '需求数必填',
                  },
                  {
                    validator: amountValidator(),
                  },
                ],
              })(<InputNumber disabled style={{ width: 200 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '共计',
        width: 230,
        key: 'lineAttachment',
        render: (__, record) => {
          const { key } = record || {};
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].allAmount`, {
                rules: [
                  {
                    required: true,
                    message: '共计数必填',
                  },
                  {
                    validator: amountValidator(),
                  },
                ],
                onChange: v => {
                  const { data } = this.state;

                  const activeLine = data.find(i => i && i.key === key);
                  activeLine.allAmount = v;

                  this.setState({ data }, () => {
                    const nextPlanAmount = Math.max(
                      ...this.state.data.map(i => {
                        const { allAmount, nestAmount } = i || {};
                        return Math.ceil(allAmount / nestAmount);
                      }),
                    );
                    setPlanAmount(nextPlanAmount);
                  });
                },
              })(<InputNumber style={{ width: 200 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '单位',
        width: 330,
        key: 'unit',
        render: (__, record) => {
          const { key, unit, material } = record;
          const { code } = material || {};
          const { id: unitId, name: unitName } = unit || {};

          return (
            <div style={{ whiteSpace: 'nowrap', width: 300 }}>
              <FormItem style={{ display: 'inline-block' }}>
                {getFieldDecorator(`materialList[${key}].unit`, {
                  rules: [
                    {
                      required: true,
                      message: '单位必填',
                    },
                  ],
                  initialValue: unitId && unitName ? { key: unitId, label: unitName } : undefined,
                  onChange: value => {
                    const { key: unitKey, label } = value || {};
                    this.setState(({ data }) => {
                      const nextData = data.map(i => {
                        if (i && i.key === key) {
                          i.unit = { id: unitKey, name: label };
                        }
                        return i;
                      });
                      return {
                        data: nextData,
                      };
                    });
                  },
                })(<MaterialUnitSelect disabled style={{ width: 100 }} materialCode={code} />)}
              </FormItem>
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { data } = this.state;
    const columns = this.getColumns();

    return (
      <div ref={this.tableInst}>
        <Table
          style={{ margin: 0, width: 800 }}
          scroll={{ x: true, y: 280 }}
          dataSource={data}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}

MaterialListForm.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  sourceWarehouse: PropTypes.any,
  type: PropTypes.string,
  initialData: PropTypes.any,
  setPlanAmount: PropTypes.any,
  isInnerPlanAmount: PropTypes.any, // 如果是从MaterialListForm改变了planAmount不需要重新刷新
};

export default MaterialListForm;
