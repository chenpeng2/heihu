import React, { Component } from 'react';
import _ from 'lodash';

import { withForm, Form, FormItem, Input, Radio, Attachment, Textarea, FormattedMessage } from 'src/components';
import { STATUS } from 'src/containers/provider/constant';
import {
  specialCharacterValidator,
  checkStringLength,
  nullCharacterVerification,
  chineseValidator,
  checkTwoSidesTrim,
  requiredRule,
} from 'src/components/form';

const RadioGroup = Radio.Group;
const INPUT_WIDTH = 300;

type Props = {
  style: {},
  form: any,
  initialValue: {},
  isEdit: boolean,
};

class BasicForm extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.setInitialValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { initialValue, form } = props || {};
    const { setFieldsValue } = form || {};

    if (initialValue) {
      initialValue.attachments = Array.isArray(initialValue.attachmentsFile)
        ? initialValue.attachmentsFile.map(item => {
            item.restId = item.id;
            return item;
          })
        : [];

      setFieldsValue(initialValue);
    }
  };

  getFormValue = () => {
    const { validateFieldsAndScroll } = this.props.form;

    let res = null;
    validateFieldsAndScroll((error, value) => {
      if (!error) res = value;
    });

    const formatValue = value => {
      const { attachments } = value;
      value.attachments = Array.isArray(attachments) ? attachments.map(({ restId }) => restId).filter(a => a) : [];
      return value;
    };

    return formatValue(res);
  };

  clearFormValue = () => {
    const { resetFields } = this.props.form;

    resetFields();
  };

  render() {
    const { form, isEdit } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <Form>
        <FormItem label={'供应商名称'}>
          {getFieldDecorator('name', {
            rules: [
              requiredRule('供应商名称'),
              {
                validator: checkStringLength(100),
              },
              {
                validator: checkTwoSidesTrim('供应商名称'),
              },
            ],
          })(<Input style={{ width: INPUT_WIDTH }} placeholder={'请输入供应商名称'} />)}
        </FormItem>
        <FormItem label={'供应商编号'}>
          {getFieldDecorator('code', {
            rules: [
              requiredRule('供应商编号'),
              {
                validator: specialCharacterValidator('供应商编号'),
              },
              {
                validator: checkStringLength(30),
              },
              {
                validator: nullCharacterVerification('供应商编号'),
              },
              {
                validator: chineseValidator('供应商编号'),
              },
            ],
          })(<Input style={{ width: INPUT_WIDTH }} disabled={isEdit} placeholder={'请输入供应商编号'} />)}
        </FormItem>
        <FormItem label={'状态'}>
          {getFieldDecorator('status', { initialValue: 1 })(
            <RadioGroup>
              {Object.entries(STATUS).map(([value, label]) => {
                return (
                  <Radio value={Number(value)} key={value} style={{ marginRight: 100 }}>
                    <FormattedMessage defaultMessage={label} />
                  </Radio>
                );
              })}
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label={'备注'}>
          {getFieldDecorator('remark')(
            <Textarea maxLength={50} style={{ width: INPUT_WIDTH, height: 100 }} placeholder={'请输入备注'} />,
          )}
        </FormItem>
        <FormItem label={'附件'}>{getFieldDecorator('attachments', {})(<Attachment />)}</FormItem>
      </Form>
    );
  }
}

export default withForm({}, BasicForm);
