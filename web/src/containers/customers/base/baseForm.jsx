import React, { Component } from 'react';
import { withForm, Form, FormItem, Input, Attachment, Textarea, FormattedMessage } from 'components';
import { telValidator, emailValidator, checkStringLength, checkTwoSidesTrim, requiredRule } from 'components/form';
import { getCustomers, createCustomer, editCustomer } from 'src/services/knowledgeBase/customer';
import { middleGrey } from 'src/styles/color';

type Props = {
  form: {
    getFieldDecorator: () => {},
    validateFieldsAndScroll: () => {},
  },
  initialData: {},
  editing: boolean,
  onCompeleted: () => {},
};

const InputStyle = { height: 32, lineHeight: '32px', width: 300 };
const FormItemStyle = { padding: '0px 0px 0px 40px', display: 'flex' };
const alignCenter = { alignItems: 'center' };

class CustomerBaseForm extends Component {
  props: Props;
  state = {};

  editCustomer = async values => {
    const {
      initialData: { id },
      form,
    } = this.props;
    const { attachments, ...rest } = values;
    const ids = attachments && attachments.map(({ restId }) => restId);
    return await editCustomer(id, { attachments: ids, ...rest }).then(({ data: { statusCode } }) => {
      if (statusCode === 200) {
        this.props.onCompeleted();
      }
    });
  };

  addCustomer = values => {
    try {
      const { attachments, ...rest } = values;
      const ids = attachments && attachments.map(({ restId }) => restId);
      return createCustomer({ attachments: ids, ...rest }).then(({ data: { statusCode } }) => {
        if (statusCode === 200) {
          this.props.onCompeleted();
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  submit = async values => {
    const { onCompeleted } = this.props;
    const { attachments, ...rest } = values;
    const ids = attachments && attachments.map(({ restId, id }) => restId || id);
    if (this.props.editing) {
      const {
        initialData: { id },
      } = this.props;
      await editCustomer(id, { attachments: ids, ...rest });
      return onCompeleted ? onCompeleted() : null;
    }
    const {
      data: { data },
    } = await createCustomer({ attachments: ids, ...rest });
    return onCompeleted ? onCompeleted() : null;
  };

  render() {
    const {
      form: { getFieldDecorator },
      initialData,
    } = this.props;
    const { code, name, email, contactAddress, contactName, contactPhone, remark, attachments } = initialData || {};
    return (
      <Form>
        <FormItem label="客户编号" style={FormItemStyle}>
          {getFieldDecorator('code', {
            initialValue: code,
            rules: [{ validator: checkStringLength(30) }, { validator: checkTwoSidesTrim('客户编号') }],
          })(<Input style={InputStyle} />)}
        </FormItem>
        <FormItem label="客户名称" style={FormItemStyle}>
          {getFieldDecorator('name', {
            initialValue: name,
            rules: [
              requiredRule('客户名称'),
              { validator: checkStringLength(30) },
              { validator: checkTwoSidesTrim('客户名称') },
            ],
          })(<Input style={InputStyle} />)}
        </FormItem>
        <FormItem label="邮箱" style={FormItemStyle}>
          {getFieldDecorator('email', {
            initialValue: email,
            rules: [{ validator: checkStringLength(50) }, { validator: emailValidator('邮箱') }],
          })(<Input style={InputStyle} />)}
        </FormItem>
        <FormItem label="联系地址" style={FormItemStyle}>
          {getFieldDecorator('contactAddress', {
            initialValue: contactAddress,
            rules: [{ validator: checkStringLength(50) }],
          })(<Input style={InputStyle} />)}
        </FormItem>
        <FormItem label="联系人" style={FormItemStyle}>
          {getFieldDecorator('contactName', {
            initialValue: contactName,
            rules: [{ validator: checkStringLength(30) }],
          })(<Input style={InputStyle} />)}
        </FormItem>
        <FormItem label="联系电话" style={FormItemStyle}>
          {getFieldDecorator('contactPhone', {
            initialValue: contactPhone,
            rules: [{ validator: checkStringLength(30) }, { validator: telValidator('联系人电话') }],
          })(<Input style={InputStyle} />)}
        </FormItem>
        <FormItem label="备注" style={FormItemStyle}>
          {getFieldDecorator('remark', {
            initialValue: remark,
          })(<Textarea maxLength={50} style={{ width: 300, height: 100 }} placeholder="最多输入50字" />)}
        </FormItem>
        <FormItem label="附件" style={FormItemStyle}>
          {getFieldDecorator('attachments', {
            initialValue: attachments,
          })(
            <Attachment
              prompt={
                <div
                  style={{
                    color: middleGrey,
                    position: 'absolute',
                    width: 200,
                    marginTop: '8px',
                    lineHeight: '20px',
                    marginLeft: '120px',
                    top: '-8px',
                  }}
                >
                  <FormattedMessage defaultMessage={'支持扩展名：JPG/PNG/JPEG/PDF，最大不能超过10M'} />
                </div>
              }
            />,
          )}
        </FormItem>
      </Form>
    );
  }
}

export default withForm({ showFooter: true }, CustomerBaseForm);
