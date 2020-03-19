import React from 'react';
import { withForm, Form, Input, message } from 'components';
import { createProjectFinishReason, editProjectFinishReason } from 'services/knowledgeBase/projectFinishReason';
import { nameValidator } from 'components/form';

const Item = Form.Item;

class FinishCauseForm extends React.PureComponent<any> {
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
      await createProjectFinishReason(value);
    } else {
      await editProjectFinishReason({ id: this.props.id, ...value });
    }
    refetch();
    message.success('操作成功');
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
          })(<Input style={{ width: 500 }} />)}
        </Item>
      </div>
    );
  }
}

export default withForm({}, FinishCauseForm);
