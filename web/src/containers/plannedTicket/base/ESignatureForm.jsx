import React, { Component } from 'react';
import _ from 'lodash';

import { withForm, FormItem, Form, Input } from 'components';
import LocalStorage from 'utils/localStorage';
import { replaceSign, FIELDS } from 'src/constants';
import { getUser } from 'src/services/auth/user';

const FORM_ITEM_STYLE = {
  padding: '0 30px',
};

type Props = {
  form: any,
  onRef: () => {},
};

class ESignatureForm extends Component {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      username: null,
      userId: null,
    };
  }

  componentDidMount = () => {
    this.props.onRef(this);
    const userInfo = LocalStorage.get(FIELDS && FIELDS.USER);
    const { username, id } = userInfo || {};
    this.setState({ username, userId: id });
  };

  checkESignature = () => {
    const p = new Promise((resolve, reject) => {
      let payloads = null;
      this.props.form.validateFieldsAndScroll((err, vals) => {
        if (!err) {
          payloads = vals;
        }
      });
      if (payloads) {
        resolve(payloads);
      } else {
        reject();
      }
    });
    return p;
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { username } = this.state;

    return (
      <Form>
        <FormItem label="用户名" required style={FORM_ITEM_STYLE}>
          {getFieldDecorator('username', {
            initialValue: username,
          })(<Input disabled style={{ width: 200 }} />)}
        </FormItem>
        <FormItem label="密码" style={FORM_ITEM_STYLE}>
          {getFieldDecorator('password', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '密码必填',
              },
            ],
          })(<Input placeholder="请输入密码" type="password" autocomplete="new-password" style={{ width: 200 }} />)}
        </FormItem>
      </Form>
    );
  }
}

export default withForm({}, ESignatureForm);
