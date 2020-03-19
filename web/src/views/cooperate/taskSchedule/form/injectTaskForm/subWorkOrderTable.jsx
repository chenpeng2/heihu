import React, { Component } from 'react';
import _ from 'lodash';
import { SimpleTable, FormItem, InputNumber } from 'components';
import { arrayIsEmpty } from 'utils/array';
import { replaceSign } from 'constants';

class SubWorkOrderTable extends Component {
  state = {};

  getColumns = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: '序号',
        width: 40,
        key: 'seq',
        render: (data, record, index) => index + 1,
      },
      {
        title: '工单编号',
        dataIndex: 'workOrderCode',
        render: (data, record, index) => {
          getFieldDecorator(`amounts[${index}].workOrderCode`, {
            initialValue: data,
          });
          return data;
        },
      },
      {
        title: '产出物料编号／名称',
        dataIndex: 'outputMaterials',
        render: data => `${_.get(data, 'material.code')}/${_.get(data, 'material.name')}`,
      },
      {
        title: '计划产出数量',
        key: 'amount',
        width: 100,
        render: (data, record, index) => (
          <FormItem style={{ width: 100, paddingRight: 0 }}>
            {getFieldDecorator(`amounts[${index}].planAmount`, {
              initialValue: record.amount,
              rules: [{ required: true, message: '计划产出数量必填' }],
              onChange: value => {
                if (!value) {
                  return;
                }
                const amounts = form.getFieldValue('amounts');
                const currentAmount = amounts[index];
                const newAmounts = amounts.map(e => ({
                  ...e,
                  planAmount: (value / currentAmount.perAmount) * e.perAmount,
                }));
                form.setFieldsValue({ amounts: newAmounts });
              },
            })(<InputNumber />)}
          </FormItem>
        ),
      },
      {
        title: '单位',
        dataIndex: 'outputMaterials',
        key: 'unit',
        render: data => _.get(data, 'material.unitName'),
      },
      {
        title: '单模产出数量',
        width: 100,
        dataIndex: 'perAmount',
        render: (data, record, index) => {
          getFieldDecorator(`amounts[${index}].perAmount`, {
            initialValue: data,
          });
          return `${data}${_.get(record, 'outputMaterials.material.unitName')}`;
        },
      },
    ];
    return columns;
  };
  render() {
    const { data } = this.props;
    const columns = this.getColumns();
    return <SimpleTable style={{ margin: 0 }} columns={columns} dataSource={data} pagination={false} />;
  }
}
export default SubWorkOrderTable;
