import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { FormItem, Input, InputNumber, SimpleTable } from 'src/components/index';
import SearchSelect from 'src/components/select/searchSelect';
import { replaceSign } from 'src/constants';
import MaterialUnitSelect from 'src/containers/unit/materialUnitSelect';
import { lengthValidate, amountValidator } from 'src/components/form/index';
import { getAvailableAmount } from 'src/services/cooperate/materialRequest';
import { arrayIsEmpty } from 'src/utils/array';

class MaterialListForm extends Component {
  state = {
    data: [],
  };

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialData, this.props.initialData)) {
      console.log(nextProps);
      this.setInitialData(nextProps);
    }
  }

  // 将表格重置为原始状态
  resetForm = () => {
    this.setState(
      {
        data: [],
      },
      () => {
        this.props.form.resetFields(['materialList']);
      },
    );
  };

  // 编辑的时候需要将state中的data改为合适的数据。然后重新设置默认值
  setInitialData = props => {
    const { initialData, sourceWarehouse } = props || this.props;
    this.setState(
      {
        data: arrayIsEmpty(initialData)
          ? []
          : initialData.map((i, index) => {
              i.key = index;
              return i;
            }),
      },
      () => {
        this.state.data.forEach(i => {
          this.setAvailableAmount(i, sourceWarehouse);
        });
      },
    );
  };

  tableInst = React.createRef();

  getColumns = () => {
    const { form } = this.props;
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
          const { key, material } = record;

          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].material`, {
                rules: [
                  {
                    required: true,
                    message: '物料必填',
                  },
                ],
                initialValue: material,
              })(<SearchSelect disabled params={{ status: 1 }} style={{ width: 200 }} type={'materialBySearch'} />)}
            </FormItem>
          );
        },
      },
      {
        title: '计划数与单位',
        width: 330,
        key: 'planAmount',
        render: (__, record) => {
          const { key, unit, material, amount } = record;
          const { key: code } = material || {};

          return (
            <div style={{ whiteSpace: 'nowrap', width: 300 }}>
              <FormItem style={{ display: 'inline-block', marginRight: 10 }}>
                {getFieldDecorator(`materialList[${key}].amount`, {
                  rules: [
                    {
                      required: true,
                      message: '计划数必填',
                    },
                    {
                      validator: amountValidator(null, 0),
                    },
                  ],
                  initialValue: amount,
                })(<InputNumber disabled />)}
              </FormItem>
              <FormItem style={{ display: 'inline-block' }}>
                {getFieldDecorator(`materialList[${key}].unit`, {
                  rules: [
                    {
                      required: true,
                      message: '计划数单位必填',
                    },
                  ],
                  initialValue: unit || undefined,
                })(<MaterialUnitSelect disabled style={{ width: 100 }} materialCode={code} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '可用库存',
        width: 100,
        key: 'storageAmount',
        render: (__, record) => {
          const { availableAmount } = record || {};
          return <span>{typeof availableAmount === 'number' ? availableAmount : replaceSign}</span>;
        },
      },
      {
        title: '行备注',
        width: 230,
        key: 'lineAttachment',
        render: (__, record) => {
          const { key } = record || {};
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].remark`, {
                rules: [
                  {
                    validator: lengthValidate(null, 20),
                  },
                ],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '合并明细',
        width: 230,
        key: 'mergeDetail',
        render: (__, record) => {
          const { mergeDetail, key } = record || {};
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].mergeDetail`, {
                initialValue: mergeDetail,
                rules: [
                  {
                    required: true,
                    message: '合并明细必填',
                  },
                ],
              })(<span>{mergeDetail}</span>)}
            </FormItem>
          );
        },
      },
    ];
  };

  setAvailableAmount = (record, sourceWarehouse) => {
    const { material, unit, key } = record || {};
    if (!material || !unit || !sourceWarehouse) return;

    getAvailableAmount({
      unitId: unit && unit.id,
      materialCode: material && material.key,
      warehouseCode: sourceWarehouse && sourceWarehouse.key,
    }).then(res => {
      const nextAvailableAmount = _.get(res, 'data.data');

      // 如果下一个值和这一个值不同那么就重新设置。相同就不需要重新设置
      let needChange = false;
      const { data } = this.state;
      data.forEach(i => {
        if (i && i.key === key && i.availableAmount !== nextAvailableAmount) {
          needChange = true;
        }
      });

      if (!needChange) return;

      this.setState(({ data }) => {
        const nextData = data.map(i => {
          if (i && i.key === key) {
            i.availableAmount = _.get(res, 'data.data');
          }
          return i;
        });
        return {
          data: nextData,
        };
      });
    });
  };

  render() {
    const { data } = this.state;
    const columns = this.getColumns();

    if (arrayIsEmpty(data)) return null;

    return (
      <div ref={this.tableInst}>
        <SimpleTable
          scroll={{ x: 1500 }}
          style={{ width: 900, margin: 0 }}
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
  initialData: PropTypes.any,
};

MaterialListForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default MaterialListForm;
