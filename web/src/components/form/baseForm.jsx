/**
* @description: 基础form。其他form需要在这个的基础上扩展
*
* @date: 2019/3/21 上午11:18
*/
import React, { Component } from 'react';
import { Form } from 'antd';

import { setFieldsValue } from './utils';

export Item from './item';

type Props = {
  form: any,
  style: any,
};

export const FormItem = props => <Form.Item colon={false} {...props} />;

const withForm = (options, WrappedComponent) => {
  const { style: optionStyle, className, ...otherOptions } = options;

  class WithFormComponent extends Component {
    props: Props;
    state = {};

    render() {
      // maxHeight是通过modal传入的content的最大高度
      const { style, ...rest } = this.props;
      const form = this.props.form;

      const _style = { ...style, ...optionStyle };

      return (
        <div className={className} style={_style}>
          <WrappedComponent
            {...rest}
            form={{
              ...form,
              setFieldsValue: setFieldsValue(form),
            }}
          />
        </div>
      );
    }
  }

  return Form.create({ ...otherOptions })(WithFormComponent);
};

export default withForm;
