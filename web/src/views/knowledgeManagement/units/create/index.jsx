import React, { Component } from 'react';
import { Form } from 'antd';
import { addUnit } from 'src/services/knowledgeBase/unit';
import { checkStringLength, checkTwoSidesTrim, requiredRule } from 'components/form';
import { Input, FormItem, withForm, message, FormattedMessage } from 'components';

type Props = {
  viewer: {
    organization: {},
  },
  onClose: any,
  onCompeleted: any,
  relay: {},
  match: {},
  form: {
    getFieldDecorator: () => {},
  },
};

class CreateUnit extends Component {
  props: Props;
  state = {};

  submit = async value => {
    await addUnit(value);
    message.success('创建单位成功');
    this.props.onClose();
    this.props.onCompeleted();
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="vertical">
        <FormItem label="名称">
          {getFieldDecorator('name', {
            rules: [
              requiredRule('单位名称'),
              { min: 0, max: 12, message: <FormattedMessage defaultMessage={'单位长度不能超过12个字'} /> },
              { validator: checkTwoSidesTrim('单位') },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="备注">
          {getFieldDecorator('desc', {
            rules: [{ validator: checkStringLength() }],
          })(<Input.TextArea />)}
        </FormItem>
      </Form>
    );
  }
}

const CreateUnitForm = withForm({ showFooter: true }, CreateUnit);

export default CreateUnitForm;
