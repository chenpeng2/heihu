import React from 'react';
import { withForm, Form, Input, message } from 'components';
import { createPurchaseOrderFinishReason, editPurchaseOrderFinishReason } from 'services/cooperate/purchaseOrder';
import { nameValidator } from 'components/form';

const Item = Form.Item;

class FinishReasonForm extends React.PureComponent<any> {
  state = {};

  componentDidMount() {
    const { form: { setFieldsValue }, type, formData } = this.props;
    if (type === 'edit') {
      setFieldsValue(formData);
    }
  }

  submit = async value => {
    const { type, refetch } = this.props;
    if (type === 'create') {
      await createPurchaseOrderFinishReason(value);
    } else {
      await editPurchaseOrderFinishReason({ id: this.props.id, ...value });
    }
    refetch();
    let msg = '操作成功';
    switch (type) {
      case 'edit':
        msg = '编辑成功！';
        break;
      case 'create':
        msg = '创建成功！';
        break;
      default:
        break;
    }
    message.success(msg);
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Item label="名称">
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: '名称不能为空' },
              { max: 50, message: '不超过50字符' },
            ],
          })(<Input style={{ width: 530 }} />)}
        </Item>
      </div>
    );
  }
}

export default withForm({}, FinishReasonForm);
