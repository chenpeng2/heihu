import React, { Component } from 'react';
import { lengthValidate, passwordValidate } from 'src/components/form';
import { hashPassword } from 'src/utils/string';
import { withForm, Form, FormItem, Input } from 'components';
import { changeUserPassword } from 'src/services/auth/user';
import styles from './index.scss';

type Props = {
  form: {
    getFieldDecorator: () => {},
    setFieldsValue: () => {},
    getFieldValue: () => {},
  },
  data: {},
  onOk: () => {},
  onSuccess: () => {},
  data: {},
};

class ResetPasswordForm extends Component {
  props: Props;

  state = {
    workstationId: null,
    operators: [],
  };

  submit = () => {
    const {
      onSuccess,
      form,
      data: { userId, oldPassword },
      onOk,
    } = this.props;
    if (userId) {
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const { newPassword } = values;
          return changeUserPassword({ userId, oldPassword, newPassword: hashPassword(newPassword) }).then(res => {
            onOk();
            if (onSuccess) {
              onSuccess();
            }
          });
        }
        return null;
      });
    }
  };

  render() {
    const {
      data: { name, username },
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className={styles.resetPasswordForm}>
        <FormItem label="姓名">
          {getFieldDecorator('name', {
            initialValue: name,
          })(<Input disabled={'true'} />)}
        </FormItem>
        <FormItem label="账号">
          {getFieldDecorator('username', {
            initialValue: username,
          })(<Input disabled={'true'} />)}
        </FormItem>
        <FormItem label="新密码">
          {getFieldDecorator('newPassword', {
            rules: [{ validator: passwordValidate('密码') }, { validator: lengthValidate(6) }],
          })(<Input type="password" placeholder="请输入新密码" autocomplete="new-password" />)}
        </FormItem>
        <FormItem label="确认新密码">
          {getFieldDecorator('newPasswordConfirm', {
            rules: [
              {
                validator: (rule, value, cb) => {
                  const newPassword = this.props.form.getFieldValue('newPassword');
                  if (newPassword !== value) {
                    cb('请确认两次密码输入相等');
                  }
                  cb();
                },
              },
            ],
          })(<Input type="password" placeholder="请输入新密码" />)}
        </FormItem>
      </div>
    );
  }
}

export default withForm({ showFooter: true }, ResetPasswordForm);
