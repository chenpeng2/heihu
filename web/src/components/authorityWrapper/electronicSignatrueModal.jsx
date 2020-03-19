import React, { Component } from 'react';
import { withForm, FormItem, Input } from 'components';
import { hashPassword } from 'utils/string';

type Props = {
  form: {},
  onClick: () => {},
};

class ElectronicSignatrueModal extends Component {
  props: Props;

  submit = async () => {
    const { form, onClick } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((err, values) => {
      if (err) return null;

      const { userName, password } = values;
      const variables = {
        username: userName.replace(/\s/g, ''),
        password: hashPassword(password),
      };
      onClick(variables);
    });
  };

  render = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const style = { display: 'inline-block', margin: '20px 0 0 60px' };
    const nameRules = [{ required: true, message: '账号必填' }];
    const nameOptions = { rules: nameRules };
    const pwdRules = [{ required: true, message: '密码必填' }];
    const pwdOptions = { rules: pwdRules };

    return (
      <div style={style}>
        <FormItem label="账号">
          {getFieldDecorator('userName', nameOptions)(<Input style={{ width: 200 }} placeholder="请输入" />)}
        </FormItem>
        <FormItem label="密码">
          {getFieldDecorator('password', pwdOptions)(
            <Input type="password" style={{ width: 200 }} placeholder="请输入" />,
          )}
        </FormItem>
      </div>
    );
  };
}

const FromWrapper = withForm({ showFooter: true }, ElectronicSignatrueModal);

export default FromWrapper;
