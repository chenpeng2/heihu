import React, { Component } from 'react';
import { FormItem, Form, message, Input, SearchSelect, FormattedMessage } from 'components';
import withForm, { orderNumberFormat, checkTwoSidesTrim, requiredRule } from 'components/form';
import { getQuery } from 'src/routes/getRouteParams';

type Props = {
  form: any,
  actionFunc: () => {},
  type: string,
  initialValue: {},
  refetch: () => {},
  match: any,
};

class Base extends Component {
  props: Props;

  componentDidMount() {
    const { initialValue, form } = this.props;
    const { setFieldsValue } = form;
    if (initialValue) {
      const { code, name, typeId } = initialValue;
      setFieldsValue({
        name,
        code,
        typeId,
      });
    }
  }

  submit = async value => {
    const { code, name, typeId } = value;
    const { actionFunc, type, initialValue, refetch, match, onClose } = this.props;
    const queryMatch = getQuery(match);
    const { id, status } = initialValue || {};
    const variables = {
      id,
      code,
      name,
      status: status || 1,
      typeId: typeId && typeId.key,
    };
    await actionFunc(variables);
    if (typeof onClose === 'function') {
      onClose();
    }
    message.success(`${type}原因成功`);
    refetch(queryMatch);
  };

  render() {
    const { form, type } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form layout="vertical">
        <FormItem label={'原因名称'}>
          {getFieldDecorator('name', {
            rules: [
              requiredRule('原因名称'),
              { max: 24, message: <FormattedMessage defaultMessage={'原因名称长度不能超过24个字'} /> },
              { validator: checkTwoSidesTrim('原因名称') },
            ],
          })(<Input placeholder={'请输入原因名称'} />)}
        </FormItem>
        <FormItem label={'原因代码'}>
          {getFieldDecorator('code', {
            rules: [
              requiredRule('原因代码'),
              { validator: orderNumberFormat('原因代码') },
              { max: 10, message: <FormattedMessage defaultMessage={'原因代码长度不能超过10个字'} /> },
              { min: 4, message: <FormattedMessage defaultMessage={'原因代码长度不能少于4个字'} /> },
            ],
          })(<Input disabled={type === '编辑'} placeholder={'请输入原因代码'} />)}
        </FormItem>
        <FormItem label={'停机类型'}>
          {getFieldDecorator('typeId', {
            rules: [{ required: true, message: <FormattedMessage defaultMessage={'请选择适用类型'} /> }],
          })(
            <SearchSelect type="downtimeCauses" placeholder={'请选择适用类型'} allowClear style={{ width: '100%' }} />,
          )}
        </FormItem>
      </Form>
    );
  }
}

export default withForm({ showFooter: true }, Base);
