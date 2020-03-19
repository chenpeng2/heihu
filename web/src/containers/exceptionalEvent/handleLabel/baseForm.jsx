import React, { Component } from 'react';
import _ from 'lodash';

import { Input, withForm, Form, FormItem } from 'src/components';
import { checkStringLength, orderNumberFormat } from 'src/components/form';

type Props = {
  style: {},
  form: {},
  initialValue: {},
};

class BaseForm extends Component {
  props: Props;
  state = {};

  componentWillReceiveProps(nextProps) {
    const { initialValue: nowInitialValue, form } = this.props;
    const { initialValue: nextInitialValue } = nextProps;

    if (!_.isEqual(nowInitialValue, nextInitialValue)) {
      form.setFieldsValue(nextInitialValue);
    }
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form>
        <FormItem label={'标签名称'}>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: '名称必填',
              },
              {
                validator: checkStringLength(30, 4),
              },
              {
                validator: (rule, value, callback) => {
                  const re = /^[\u4e00-\u9fa5a-zA-Z_]+$/;
                  if (!re.test(value)) {
                    callback('标签名称只能由英文、汉字、下划线组成');
                  }
                  callback();
                },
              },
            ],
          })(<Input />)}
        </FormItem>
      </Form>
    );
  }
}

export default withForm({}, BaseForm);
