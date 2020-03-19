import React, { Component } from 'react';
import { withForm, Form, FormItem, Input, Button, SimpleTable, Tooltip } from 'components';
import { AuditInfo } from 'containers/audit';
import { formatUnix } from 'utils/time';
import { replaceSign } from 'constants';

const TextArea = Input.TextArea;

type Props = {
  form: {
    validateFields: () => {},
  },
  auditInfo: {},
  onSubmit: () => {},
  onCancel: () => {},
};

class AuditNotPassReasonModal extends Component<Props> {
  state = {};

  getColumns = () => {
    const columns = [
      {
        title: '审批时间',
        dataIndex: 'remarkDate',
        render: remarkDate => (remarkDate ? formatUnix(remarkDate) : replaceSign),
      },
      {
        title: '审批人',
        dataIndex: 'name',
        render: name => name || replaceSign,
      },
      {
        title: '审批备注',
        dataIndex: 'remark',
        render: remark => (remark ? <Tooltip text={remark} length={20} /> : replaceSign),
      },
    ];

    return columns;
  };

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { onSubmit } = this.props;
      // onSubmit 将会显式的调用closeModal
      onSubmit(values);
    });
  };

  render() {
    const { form, onCancel, auditInfo } = this.props;
    const { getFieldDecorator } = form;

    return (
      <React.Fragment>
        <Form>
          <FormItem label="不通过原因">
            {getFieldDecorator('failReason', {
              rules: [
                {
                  required: true,
                  message: '不通过原因必填',
                },
              ],
            })(<TextArea autosize={{ minRows: 1, maxRows: 8 }} />)}
          </FormItem>
          <FormItem label="历史审批记录">
            <AuditInfo auditInfo={auditInfo} />
          </FormItem>
        </Form>
        <div style={{ marginLeft: 183, marginTop: 20 }}>
          <Button type="default" style={{ width: 114 }} onClick={onCancel}>
            取消
          </Button>
          <Button disabled={this.state.submiting} style={{ width: 114, marginLeft: 60 }} onClick={this.submit}>
            确定
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

export default withForm({}, AuditNotPassReasonModal);
