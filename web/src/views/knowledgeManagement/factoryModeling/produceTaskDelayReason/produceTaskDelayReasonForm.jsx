import React from 'react';
import { withForm, Form, Input, message } from 'components';
import { createProduceTaskDelayReason, editProduceTaskDelayReason } from 'services/knowledgeBase/produceTaskDelayReason';
import { nameValidator } from 'components/form';

const Item = Form.Item;

class ProduceTaskDelayReasonForm extends React.PureComponent<any> {
  state = {};

  componentDidMount() {
    const {
      form: { setFieldsValue },
      type,
      formData,
    } = this.props;
    if (type === 'edit') {
      setFieldsValue(formData);
    }
  }

  submit = async value => {
    const { type, refetch } = this.props;
    if (type === 'create') {
      await createProduceTaskDelayReason(value);
    } else {
      await editProduceTaskDelayReason({ id: this.props.id, ...value });
    }
    refetch();
    message.success('操作成功');
  };
  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div>
        <Item label="名称">
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: '名称不能为空' },
              { max: 20, message: '不超过20字符' },
              {
                validator: nameValidator('名称'),
              },
            ],
          })(<Input />)}
        </Item>
      </div>
    );
  }
}

export default withForm({}, ProduceTaskDelayReasonForm);
