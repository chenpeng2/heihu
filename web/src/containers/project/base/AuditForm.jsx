import React from 'react';
import { Link, FormItem, withForm, openModal, Radio, Textarea } from 'components';

const RadioGroup = Radio.Group;

type Props = {
  form: any,
};

class AuditForm extends React.Component {
  props: Props;
  state = {
    textArea: null,
  };

  onAuditResultChange = e => {
    const res = e.target.value;
    this.setState({ textArea: Number(res) === 1 ? 'auditRemark' : 'failReason' });
    this.props.form.resetFields();
  };

  render() {
    const { form, ...rest } = this.props;
    const { getFieldDecorator } = form || {};
    const { textArea } = this.state;
    return (
      <div {...rest}>
        <FormItem label="审批结果">
          {getFieldDecorator('status', {
            rules: [
              {
                required: true,
                message: '审批结果必填',
              },
            ],
          })(
            <RadioGroup onChange={this.onAuditResultChange}>
              <Radio value={1}>通过</Radio>
              <Radio value={0}>驳回</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        {textArea === 'failReason' ? (
          <FormItem label="不通过原因">
            {getFieldDecorator('remark', {
              rules: [
                {
                  required: true,
                  message: '不通过原因不能为空',
                },
              ],
            })(<Textarea maxLength={250} style={{ width: 300, height: 100 }} placeholder="请输入审批备注" />)}
          </FormItem>
        ) : (
          <FormItem label="审批备注">
            {getFieldDecorator('remark')(
              <Textarea maxLength={250} style={{ width: 300, height: 100 }} placeholder="请输入审批备注" />,
            )}
          </FormItem>
        )}
      </div>
    );
  }
}

export default withForm({}, AuditForm);
