import React, { Component } from 'react';
import { FormItem, Input } from 'components';
import { hashPassword } from 'utils/string';
import { Form } from 'antd';
import styles from './index.scss';
import Footer from './footer';

type Props = {
  form: {},
  onConfirm: () => {},
  onCancel: () => {},
  onClose: () => {},
};

class ESignForm extends Component {
  props: Props;

  onCancel = () => {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    }
  };

  onConfirm = () => {
    const { form, onConfirm, onClose } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((error, values) => {
      if (error) return null;

      const { userName, password } = values;
      const result = {
        username: userName.replace(/\s/g, ''),
        password: hashPassword(password),
      };
      onConfirm(result);
      onClose();
    });
  };

  render = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const nameRules = [{ required: true, message: '账号必填' }];
    const nameOptions = { rules: nameRules };
    const pwdRules = [{ required: true, message: '密码必填' }];
    const pwdOptions = { rules: pwdRules };
    const inputStyle = { width: 200 };

    return (
      <div className={styles.form}>
        <div className={styles.content}>
          <FormItem label="账号">
            {getFieldDecorator('userName', nameOptions)(<Input style={inputStyle} placeholder="请输入" />)}
          </FormItem>
          <FormItem label="密码">
            {getFieldDecorator('password', pwdOptions)(
              <Input type="password" style={inputStyle} placeholder="请输入" autocomplete="new-password" />,
            )}
          </FormItem>
        </div>
        <Footer onCancel={this.onCancel} onConfirm={this.onConfirm} />
      </div>
    );
  };
}

const FormWrapper = Form.create({})(ESignForm);

export default FormWrapper;
