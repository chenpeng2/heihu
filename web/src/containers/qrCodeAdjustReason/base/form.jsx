import React, { Component } from 'react';

import { Input, Select, Form, FormItem } from 'src/components';
import { getOrganizationConfigFromLocalStorage, ORGANIZATION_CONFIG } from 'src/utils/organizationConfig';
import ModuleSelect from './ModuleSelect';

import { adjustTypes } from '../constants';

const Option = Select.Option;
const INPUT_WIDTH = 300;

type Props = {
  style: {},
  form: any,
  type: string,
  initialData: any,
};

class BaseForm extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.setInitialValue();
  }

  setInitialValue = props => {
    const { initialData, form } = props || this.props;
    if (initialData) {
      const { code, name, module } = initialData;

      form.setFieldsValue({
        code,
        name,
        module,
      });
    }
  };

  render() {
    const { form, type } = this.props;
    const { getFieldDecorator } = form || {};

    const formItem_style = { padding: '0px 0px 0px 25px' };

    return (
      <div>
        <Form>
          <FormItem label={'模块功能'} style={formItem_style}>
            {getFieldDecorator('module', {
              rules: [
                {
                  required: true,
                  message: '模块功能必填',
                },
              ],
            })(<ModuleSelect disabled={type === 'edit'} style={{ width: INPUT_WIDTH }} />)}
          </FormItem>
          <FormItem label={'事务名称'} style={formItem_style}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: '事务名称必填',
                },
              ],
            })(<Input style={{ width: INPUT_WIDTH }} />)}
          </FormItem>
          <FormItem label={'事务编码'} style={formItem_style}>
            {getFieldDecorator('code', {
              rules: [
                {
                  required: true,
                  message: '事务编码必填',
                },
              ],
            })(<Input style={{ width: INPUT_WIDTH }} disabled={type === 'edit'} />)}
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default BaseForm;
