import React, { Component } from 'react';
import { InputNumber, withForm, Button } from 'components';
import { amountValidator } from 'components/form';

class AmountModal extends Component {
  props: {
    form: {},
    onOk: () => {},
    onCancel: () => {},
  };
  state = {};

  render() {
    const { onOk, form, onCancel } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <div style={{ margin: '5px 70px', padding: 30 }}>
          {getFieldDecorator('amount', {
            rules: [
              { required: true, message: '产出物料数量不能为空' },
              { validator: amountValidator(10e6, { value: 0, equal: false, message: '数量必须大于0' }) },
            ],
          })(<InputNumber />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <Button style={{ width: 100 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button style={{ width: 100, marginLeft: 40 }} onClick={() => onOk(form.getFieldsValue())}>
            确定
          </Button>
        </div>
      </div>
    );
  }
}

export default withForm({}, AmountModal);
