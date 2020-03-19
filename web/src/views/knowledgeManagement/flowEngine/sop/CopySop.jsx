import React from 'react';
import { FormItem, withForm, Input, message } from 'components';
import { copySop } from 'services/knowledgeBase/sop';
import { SOPCodeRule } from './SOPFormFieldRules';

class CopySop extends React.PureComponent {
  state = {};

  submit = () => {
    const { form: { validateFields }, SOPId } = this.props;
    console.log('this.props', this.props);
    validateFields(async (err, values) => {
      if (!err) {
        const { data: { data } } = await copySop(SOPId, values.code);
        message.success('复制成功!');
      }
    });
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <FormItem label="复制后的编号">{getFieldDecorator('code', {
          rules: SOPCodeRule,
        })(<Input />)}</FormItem>
      </div>
    );
  }
}

export default withForm({}, CopySop);
