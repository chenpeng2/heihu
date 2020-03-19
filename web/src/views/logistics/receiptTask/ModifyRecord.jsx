import React from 'react';
import { withForm, FormItem, Input } from 'components';
import {
  modifyReceiveTaskMaterial,
  modifyReceiveTaskPackageMaterial,
} from 'services/shipment/receiptTask';
import { modifySendTaskMaterial, modifySendTaskPackageMaterial } from 'services/shipment/sendTask';
import { amountValidator } from 'components/form';

class ModifyRecord extends React.PureComponent<any> {
  state = {};

  componentDidMount() {
    const amount = this.props.record.amount;
    this.props.form.setFieldsValue({
      amount,
    });
  }

  submit = async value => {
    const {
      id,
      record: { materialCode, id: storageId },
      callback,
      type,
      materialType,
    } = this.props;
    let fetch;
    if (type === 'send') {
      fetch =
        materialType === 'packageMaterial'
          ? modifySendTaskPackageMaterial
          : modifySendTaskMaterial;
    } else {
      fetch =
        materialType === 'packageMaterial'
          ? modifyReceiveTaskPackageMaterial
          : modifyReceiveTaskMaterial;
    }
    await fetch(id, {
      materialCode,
      storageId,
      amount: value.amount,
    });
    if (typeof callback === 'function') {
      callback();
    }
  };

  render() {
    const { form: { getFieldDecorator }, record, defaultUnit } = this.props;
    const { materialName, name } = record;
    return (
      <div>
        <FormItem label="物料">
          <span>{materialName}</span>
        </FormItem>
        <FormItem label="货位">
          <span>{name}</span>
        </FormItem>
        <FormItem label="数量" action={defaultUnit}>
          {getFieldDecorator('amount', {
            rules: [
              { required: true, message: '数量不能为空' },
              { validator: amountValidator(1000000000, 0, 'integer') },
            ],
          })(<Input />)}
        </FormItem>
      </div>
    );
  }
}

export default withForm({}, ModifyRecord);
